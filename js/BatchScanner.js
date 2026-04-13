/**
 * BatchScanner — Escanea todas las combinaciones de categoría/tier/enchant
 * comparando precios en todas las ciudades para encontrar crafteos rentables.
 */
class BatchScanner {
    constructor(api) {
        this.api = api;
        this.allCities = Object.values(AlbionConfig.CITIES).join(',');
    }

    // ─── Helpers de naming ────────────────────────────────────────────────────

    static getWeaponCategories() {
        const cats = new Set();
        Object.values(AlbionConfig.WEAPON_RECIPES).forEach(r => cats.add(r.category));
        return [...cats].sort();
    }

    _itemApiName(key, tier, enchant) {
        const t = AlbionConfig.ITEM_API_NAMES?.[key];
        if (!t?.[tier]) return null;
        return enchant > 0 ? `${t[tier]}@${enchant}` : t[tier];
    }

    _matApiName(matType, tier, enchant) {
        const ids = AlbionConfig.ITEM_API_NAMES?.[matType];
        if (!ids?.[tier]) return null;
        const base = ids[tier];
        return enchant > 0 ? `${base}_LEVEL${enchant}@${enchant}` : base;
    }

    _artifactApiName(artifactKey, tier) {
        return AlbionConfig.ITEM_API_NAMES?.[artifactKey]?.[tier] || null;
    }

    // ─── Build scan list ──────────────────────────────────────────────────────

    _buildScanList(categories) {
        const items = [];
        for (const [key, recipe] of Object.entries(AlbionConfig.WEAPON_RECIPES)) {
            if (!categories.includes(recipe.category)) continue;
            for (let tier = 4; tier <= 8; tier++) {
                if (!AlbionConfig.ITEM_API_NAMES?.[key]?.[tier]) continue;
                for (let enchant = 0; enchant <= 4; enchant++) {
                    items.push({ key, recipe, tier, enchant });
                }
            }
        }
        return items;
    }

    // ─── API fetch ────────────────────────────────────────────────────────────

    async _fetchBatch(ids, quality) {
        if (!ids.length) return {};
        const q = quality !== null ? `&qualities=${quality}` : '';
        const url = `${this.api.baseURL}/${ids.join(',')}?locations=${this.allCities}${q}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const result = {};
        for (const entry of data) {
            if (quality !== null && entry.quality !== quality) continue;
            const isBM = entry.city === 'Black Market';
            const price = isBM ? entry.buy_price_max : entry.sell_price_min;
            if (!price) continue;
            if (!result[entry.item_id]) result[entry.item_id] = {};
            result[entry.item_id][entry.city] = price;
        }
        return result;
    }

    // ─── Price helpers ────────────────────────────────────────────────────────

    _bestSell(cityMap) {
        let best = { city: null, price: 0 };
        for (const [city, price] of Object.entries(cityMap || {})) {
            if (price > best.price) { best = { city, price }; }
        }
        return best;
    }

    _bestBuy(cityMap) {
        let best = { city: null, price: 0 };
        let min = Infinity;
        for (const [city, price] of Object.entries(cityMap || {})) {
            if (price > 0 && price < min) { min = price; best = { city, price }; }
        }
        return best;
    }

    // ─── Profit calc ──────────────────────────────────────────────────────────

    _calcProfit(item, itemPricesMap, matPricesMap, returnRate, taxRate, sellTaxRate) {
        const { key, recipe, tier, enchant } = item;
        const apiName = this._itemApiName(key, tier, enchant);
        if (!apiName) return null;

        const { city: sellCity, price: sellPrice } = this._bestSell(itemPricesMap[apiName]);
        if (!sellPrice) return null;

        const MAT_LABELS = { LEATHER: 'Cuero', METALBAR: 'Barras', PLANKS: 'Tablas', CLOTH: 'Tela', artifact: 'Artefacto' };
        let matCost = 0;
        const materials = {};

        for (const [matKey, qty] of Object.entries(recipe.materials)) {
            const isArtifact = matKey === 'artifact';
            const matApiName = isArtifact
                ? this._artifactApiName(recipe.artifactKey, tier)
                : this._matApiName(matKey, tier, enchant);

            if (!matApiName) return null;

            const { city: buyCity, price: matPrice } = this._bestBuy(matPricesMap[matApiName]);
            if (!matPrice) return null;

            const returned = isArtifact ? 0 : Math.round(qty * returnRate);
            const netQty   = qty - returned;  // effective consumption (for cost calc)
            const toBuyQty = qty;              // physical units to purchase

            matCost += netQty * matPrice;

            materials[matKey] = {
                label:    MAT_LABELS[matKey] || matKey,
                quantity: toBuyQty,
                price:    matPrice,
                buyCity,
                apiName:  matApiName,
            };
        }

        const totalCost  = matCost + taxRate;
        const revenue    = sellPrice * (1 - sellTaxRate);
        const profit     = revenue - totalCost;
        const profitPct  = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return {
            key, recipe, tier, enchant, apiName,
            displayName: recipe.displayName,
            sellCity, sellPrice,
            matCost, totalCost, revenue, profit, profitPct,
            returnRate, taxRate,
            materials,
        };
    }

    // ─── Main scan ────────────────────────────────────────────────────────────

    async scan(categories, opts = {}, onProgress = null) {
        const {
            returnRate   = 0.248,
            taxRate      = 300,
            sellTaxRate  = 0.065,
            minProfitPct = -Infinity,
        } = opts;

        const scanList = this._buildScanList(categories);
        if (!scanList.length) return [];

        onProgress?.(3, `${scanList.length} combinaciones a analizar...`);

        // Collect unique IDs
        const itemIds = [];
        const matIdSet = new Set();

        for (const item of scanList) {
            const id = this._itemApiName(item.key, item.tier, item.enchant);
            if (id) itemIds.push(id);

            for (const [matKey] of Object.entries(item.recipe.materials)) {
                const isArtifact = matKey === 'artifact';
                const mid = isArtifact
                    ? this._artifactApiName(item.recipe.artifactKey, item.tier)
                    : this._matApiName(matKey, item.tier, item.enchant);
                if (mid) matIdSet.add(mid);
            }
        }

        // Chunk arrays
        const CHUNK = 50;
        const chunk = arr => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += CHUNK) chunks.push(arr.slice(i, i + CHUNK));
            return chunks;
        };
        const itemChunks = chunk(itemIds);
        const matChunks  = chunk([...matIdSet]);
        const totalChunks = itemChunks.length + matChunks.length;
        let doneChunks = 0;

        const itemPrices = {};
        const matPrices  = {};

        const fetchAll = async (chunks, target, quality) => {
            // 3 concurrent batches at a time
            for (let i = 0; i < chunks.length; i += 3) {
                await Promise.all(
                    chunks.slice(i, i + 3).map(async c => {
                        try {
                            Object.assign(target, await this._fetchBatch(c, quality));
                        } catch (e) { console.warn('Batch fetch failed:', e); }
                        doneChunks++;
                        onProgress?.(
                            5 + Math.round((doneChunks / totalChunks) * 85),
                            `Batch ${doneChunks}/${totalChunks}...`
                        );
                    })
                );
            }
        };

        await fetchAll(itemChunks, itemPrices, 1);   // weapons: quality=1
        await fetchAll(matChunks,  matPrices,  null); // materials: any quality

        onProgress?.(92, 'Calculando profits...');

        const results = [];
        for (const item of scanList) {
            const r = this._calcProfit(item, itemPrices, matPrices, returnRate, taxRate, sellTaxRate);
            if (r && r.profitPct >= minProfitPct) results.push(r);
        }
        results.sort((a, b) => b.profit - a.profit);

        onProgress?.(100, `${results.length} resultados`);
        return results;
    }
}

// ─── UI globals ───────────────────────────────────────────────────────────────

let _scanResults  = [];
let _scannerInst  = null;

function initScannerTab() {
    _scannerInst = new BatchScanner(uiManager.api);

    const categories = BatchScanner.getWeaponCategories();
    const grid = document.getElementById('scannerCatGrid');
    if (!grid) return;

    grid.innerHTML = categories.map(cat => `
        <label class="scan-cat-chip">
            <input type="checkbox" value="${cat}" class="scan-cat-cb">
            <span>${cat}</span>
        </label>
    `).join('');
}

function _getScanConfig() {
    const returnRate  = parseFloat(document.getElementById('scanReturnRate')?.value ?? 24.8) / 100;
    const taxRate     = parseFloat(document.getElementById('scanTaxRate')?.value ?? 300);
    const minProfit   = parseFloat(document.getElementById('scanMinProfit')?.value ?? 0);
    const sellTaxEl   = document.querySelector('input[name="scanSellTax"]:checked');
    const sellTaxRate = parseFloat(sellTaxEl?.value ?? 0.065);
    const categories  = [...document.querySelectorAll('.scan-cat-cb:checked')].map(el => el.value);
    return { returnRate, taxRate, minProfitPct: minProfit, sellTaxRate, categories };
}

async function startScan() {
    const cfg = _getScanConfig();
    if (!cfg.categories.length) {
        alert('Selecciona al menos una categoría.');
        return;
    }

    const btn      = document.getElementById('scanBtn');
    const progress = document.getElementById('scanProgress');
    const fill     = document.getElementById('scanProgressFill');
    const txt      = document.getElementById('scanProgressText');
    const results  = document.getElementById('scanResults');

    btn.disabled     = true;
    progress.style.display = '';
    results.style.display  = 'none';

    try {
        _scanResults = await _scannerInst.scan(
            cfg.categories,
            { returnRate: cfg.returnRate, taxRate: cfg.taxRate, sellTaxRate: cfg.sellTaxRate, minProfitPct: -Infinity },
            (pct, msg) => {
                fill.style.width = pct + '%';
                txt.textContent  = msg;
            }
        );
        renderScanResults(cfg.minProfitPct);
        results.style.display = '';
    } catch (e) {
        txt.textContent = 'Error: ' + e.message;
        console.error(e);
    } finally {
        btn.disabled = false;
    }
}

function renderScanResults(minProfitPct = 0) {
    const onlyProfit = document.getElementById('scanOnlyProfitable')?.checked;
    const filtered   = _scanResults.filter(r => !onlyProfit || r.profitPct >= minProfitPct);

    const total      = _scanResults.length;
    const shown      = filtered.length;
    const profitable = _scanResults.filter(r => r.profit > 0).length;

    const countEl = document.getElementById('scanResultsCount');
    if (countEl) countEl.textContent = `${total} combinaciones · ${profitable} rentables · mostrando ${shown}`;

    const tbody = document.getElementById('scanTableBody');
    if (!tbody) return;

    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;opacity:.5;">No hay resultados con estos filtros.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map((r, idx) => {
        const sign      = r.profit >= 0 ? '+' : '';
        const color     = r.profit >= 0 ? '#7ec85c' : '#e87676';
        const pctColor  = r.profitPct >= 15 ? '#7ec85c' : r.profitPct >= 5 ? '#f0c040' : '#e87676';
        const enchTxt   = r.enchant > 0 ? `.${r.enchant}` : '';
        const imgUrl    = getItemImageUrl(r.key, r.tier, r.enchant, 1);
        const matCols   = Object.values(r.materials).map(m =>
            `<span class="scan-mat-chip">${m.label} <strong>${_fmtSilver(m.price)}</strong> <span style="opacity:.5;font-size:.7em;">${m.buyCity?.slice(0,3) ?? '?'}</span></span>`
        ).join('');

        return `
        <tr class="scan-row${r.profit > 0 ? ' scan-row-profit' : ''}">
            <td class="scan-item-cell">
                <img src="${imgUrl}" class="scan-item-img" alt="" onerror="this.style.opacity='.2'">
                <span class="scan-item-name">${r.displayName}</span>
            </td>
            <td class="scan-tier-cell">T${r.tier}${enchTxt}</td>
            <td class="scan-city-cell">${r.sellCity ?? '—'}</td>
            <td class="text-end scan-price-cell">${_fmtSilver(r.sellPrice)}</td>
            <td class="scan-mat-cell">${matCols}</td>
            <td class="text-end" style="color:${color};font-weight:700;">${sign}${_fmtSilver(r.profit)}</td>
            <td class="text-end" style="color:${pctColor};font-weight:700;">${r.profitPct.toFixed(1)}%</td>
            <td>
                <button class="scan-add-btn" title="Agregar al día" onclick="addScannerResultToDay(${idx})">
                    <i class="bi bi-plus-circle-fill"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
}

function filterScanResults() {
    const cfg = _getScanConfig();
    renderScanResults(cfg.minProfitPct);
}

function selectAllCategories()  { document.querySelectorAll('.scan-cat-cb').forEach(cb => cb.checked = true);  }
function clearAllCategories()   { document.querySelectorAll('.scan-cat-cb').forEach(cb => cb.checked = false); }

function addScannerResultToDay(resultIdx) {
    const r = _scanResults[resultIdx];
    if (!r || typeof dayCrafts === 'undefined') return;

    const enchTxt = r.enchant > 0 ? `.${r.enchant}` : '';
    const craft = {
        id:              Date.now(),
        itemType:        r.key,
        itemName:        `T${r.tier}${enchTxt} ${r.displayName}`,
        tier:            r.tier,
        enchant:         r.enchant,
        quality:         1,
        quantity:        1,
        city:            r.sellCity || 'Caerleon',
        returnRate:      r.returnRate,
        taxRate:         r.taxRate,
        itemPrice:       r.sellPrice,
        journalBuyPrice:  0,
        journalSellPrice: 0,
        totalCost:        r.totalCost,
        totalRevenue:     r.revenue,
        finalProfit:      r.profit,
        profitPct:        r.profitPct,
        journalsProfit:   0,
        journalsFilled:   0,
        savedAt:          new Date().toLocaleTimeString(),
        materials:        r.materials,
    };

    dayCrafts.unshift(craft);
    _saveDayCrafts();
    renderDayPanel();

    // Feedback visual
    const btn = document.querySelectorAll('.scan-add-btn')[resultIdx];
    if (btn) {
        btn.innerHTML = '<i class="bi bi-check-circle-fill" style="color:#7ec85c"></i>';
        setTimeout(() => { btn.innerHTML = '<i class="bi bi-plus-circle-fill"></i>'; }, 1500);
    }
}
