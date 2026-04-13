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

    // Para materiales: solo necesitamos sell_price_min (lo que pagamos al comprar)
    async _fetchBatch(ids, quality, maxAgeDays = 7) {
        if (!ids.length) return {};
        const q = quality !== null ? `&qualities=${quality}` : '';
        const url = `${this.api.baseURL}/${ids.join(',')}?locations=${this.allCities}${q}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const now = Date.now();
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

        const result = {};
        for (const entry of data) {
            if (quality !== null && entry.quality !== quality) continue;
            const isBM  = entry.city === 'Black Market';
            const price = isBM ? entry.buy_price_max : entry.sell_price_min;
            if (!price) continue;

            const dateStr = isBM ? entry.buy_price_max_date : entry.sell_price_min_date;
            if (dateStr) {
                const age = now - new Date(dateStr).getTime();
                if (age > maxAgeMs) continue;
            }

            if (!result[entry.item_id]) result[entry.item_id] = {};
            result[entry.item_id][entry.city] = price;
        }
        return result;
    }

    // Para items (armas): pide calidades 1,2,3 en un solo request
    // Estructura: { apiName: { 1: { city: {sellMin,buyMax} }, 2: {...}, 3: {...} } }
    async _fetchItemBatch(ids, _quality, maxAgeDays = 3) {
        if (!ids.length) return {};
        const url = `${this.api.baseURL}/${ids.join(',')}?locations=${this.allCities}&qualities=1,2,3`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const now      = Date.now();
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

        const result = {};
        for (const entry of data) {
            const isBM    = entry.city === 'Black Market';
            const dateStr = isBM ? entry.buy_price_max_date : entry.sell_price_min_date;
            if (dateStr) {
                const age = now - new Date(dateStr).getTime();
                if (age > maxAgeMs) continue;
            }

            const sellMin = isBM ? 0 : (entry.sell_price_min || 0);
            const buyMax  = entry.buy_price_max || 0;
            if (!sellMin && !buyMax) continue;

            const q = entry.quality; // 1, 2 o 3
            if (!result[entry.item_id])    result[entry.item_id]    = {};
            if (!result[entry.item_id][q]) result[entry.item_id][q] = {};
            result[entry.item_id][q][entry.city] = { sellMin, buyMax };
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

    // Para armas: encuentra el mejor precio de venta con sanity check
    // - Black Market: usa buy_price_max (único precio disponible)
    // - Ciudad normal: si sell_price_min > buy_price_max * 2 → es un outlier, usa buy_price_max
    // - Si buy_price_max = 0 en una ciudad normal → nadie comprando, se descarta
    _bestSellItem(cityMap) {
        let best = { city: null, price: 0 };
        for (const [city, data] of Object.entries(cityMap || {})) {
            const { sellMin = 0, buyMax = 0 } = data;
            let effective;

            if (city === 'Black Market') {
                effective = buyMax;
            } else {
                if (!buyMax) continue; // sin compradores activos → mercado muerto
                effective = (sellMin && sellMin <= buyMax * 2) ? sellMin : buyMax;
            }

            if (effective > best.price) best = { city, price: effective };
        }
        return best;
    }

    // Itera sobre las calidades disponibles (3→2→1) y devuelve la de mayor precio
    // qualityMap: { 1: cityMap, 2: cityMap, 3: cityMap }
    _bestSellItemMultiQuality(qualityMap) {
        let best = { city: null, price: 0, quality: null };
        for (const q of [3, 2, 1]) {
            const cityMap = qualityMap?.[q];
            if (!cityMap) continue;
            const { city, price } = this._bestSellItem(cityMap);
            if (price > best.price) best = { city, price, quality: q };
        }
        return best;
    }

    // ─── Profit calc ──────────────────────────────────────────────────────────

    _calcProfit(item, itemPricesMap, matPricesMap, returnRate, taxRate, sellTaxRate) {
        const { key, recipe, tier, enchant } = item;
        const apiName = this._itemApiName(key, tier, enchant);
        if (!apiName) return null;

        // Elige el mejor precio disponible entre calidades 1, 2 y 3
        const { city: sellCity, price: sellPrice, quality: foundQuality } =
            this._bestSellItemMultiQuality(itemPricesMap[apiName]);
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

        // Black Market = venta instantánea a NPC, sin impuesto de venta
        const effectiveSellTax = sellCity === 'Black Market' ? 0 : sellTaxRate;

        const totalCost  = matCost + taxRate;
        const revenue    = sellPrice * (1 - effectiveSellTax);
        const profit     = revenue - totalCost;
        const profitPct  = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return {
            key, recipe, tier, enchant, apiName,
            displayName: recipe.displayName,
            quality: foundQuality,   // calidad real del precio encontrado (1, 2 o 3)
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

        const fetchAll = async (chunks, target, quality, maxAgeDays, fetchFn) => {
            for (let i = 0; i < chunks.length; i += 3) {
                await Promise.all(
                    chunks.slice(i, i + 3).map(async c => {
                        try {
                            Object.assign(target, await fetchFn(c, quality, maxAgeDays));
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

        // Armas: _fetchItemBatch fetches calidades 1,2,3 en un solo request
        await fetchAll(itemChunks, itemPrices, null, 3, this._fetchItemBatch.bind(this));
        // Materiales: _fetchBatch normal (solo sell_price_min), máx 7 días
        await fetchAll(matChunks,  matPrices,  null, 7, this._fetchBatch.bind(this));

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
    const returnRate   = parseFloat(document.getElementById('scanReturnRate')?.value ?? 24.8) / 100;
    const taxRate      = parseFloat(document.getElementById('scanTaxRate')?.value ?? 300);
    const minProfit    = parseFloat(document.getElementById('scanMinProfit')?.value ?? 0);
    const sellTaxEl    = document.querySelector('input[name="scanSellTax"]:checked');
    const sellTaxRate  = parseFloat(sellTaxEl?.value ?? 0.065);
    const minQuality   = parseInt(document.getElementById('scanItemQuality')?.value ?? 1);
    const categories   = [...document.querySelectorAll('.scan-cat-cb:checked')].map(el => el.value);
    return { returnRate, taxRate, minProfitPct: minProfit, sellTaxRate, minQuality, categories };
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
        renderScanResults(cfg.minProfitPct, cfg.minQuality);
        results.style.display = '';
    } catch (e) {
        txt.textContent = 'Error: ' + e.message;
        console.error(e);
    } finally {
        btn.disabled = false;
    }
}

const Q_LABELS = { 1: 'Normal', 2: 'Good', 3: 'Outstanding', 4: 'Excellent', 5: 'Masterpiece' };
const Q_COLORS = { 1: '#aaa', 2: '#7ec85c', 3: '#f0c040', 4: '#4fc3f7', 5: '#ce93d8' };

function renderScanResults(minProfitPct = 0, minQuality = 1) {
    const onlyProfit = document.getElementById('scanOnlyProfitable')?.checked;
    const filtered   = _scanResults.filter(r =>
        (!onlyProfit || r.profitPct >= minProfitPct) &&
        (r.quality == null || r.quality >= minQuality)
    );

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

    // Agrupar por displayName y ordenar grupos por mejor profit
    const groups = new Map();
    filtered.forEach(r => {
        if (!groups.has(r.displayName)) groups.set(r.displayName, []);
        groups.get(r.displayName).push(r);
    });
    groups.forEach(items => items.sort((a, b) => b.profit - a.profit));
    const sortedGroups = [...groups.entries()].sort((a, b) => b[1][0].profit - a[1][0].profit);

    let html = '';
    sortedGroups.forEach(([groupName, items], groupIdx) => {
        const best     = items[0];
        const imgUrl   = getItemImageUrl(best.key, best.tier, best.enchant, 1);
        const sign     = best.profit >= 0 ? '+' : '';
        const color    = best.profit >= 0 ? '#7ec85c' : '#e87676';
        const pctColor = best.profitPct >= 15 ? '#7ec85c' : best.profitPct >= 5 ? '#f0c040' : '#e87676';
        const groupId  = `scan-group-${groupIdx}`;

        html += `<tr class="scan-group-header" onclick="toggleScanGroup('${groupId}')">
            <td colspan="8">
                <div class="scan-group-header-inner">
                    <div class="scan-group-left">
                        <i class="bi bi-chevron-down scan-group-chevron" id="${groupId}-chevron"></i>
                        <img src="${imgUrl}" class="scan-group-img" alt="" onerror="this.style.opacity='.2'">
                        <span class="scan-group-name">${groupName}</span>
                        <span class="scan-group-badge">${items.length} variante${items.length > 1 ? 's' : ''}</span>
                    </div>
                    <div class="scan-group-right">
                        <span style="color:${color};font-weight:700;font-size:.82rem;">${sign}${_fmtSilver(best.profit)}</span>
                        <span style="color:${pctColor};font-size:.75rem;margin-left:6px;">${best.profitPct.toFixed(1)}%</span>
                    </div>
                </div>
            </td>
        </tr>`;

        items.forEach(r => {
            const idx      = _scanResults.indexOf(r);
            const rsign    = r.profit >= 0 ? '+' : '';
            const rcolor   = r.profit >= 0 ? '#7ec85c' : '#e87676';
            const rpctCol  = r.profitPct >= 15 ? '#7ec85c' : r.profitPct >= 5 ? '#f0c040' : '#e87676';
            const enchTxt  = r.enchant > 0 ? `.${r.enchant}` : '';
            const rImgUrl  = getItemImageUrl(r.key, r.tier, r.enchant, 1);
            const matCols  = Object.values(r.materials).map(m =>
                `<span class="scan-mat-chip">${m.label} <strong>${_fmtSilver(m.price)}</strong> <span style="opacity:.5;font-size:.7em;">${m.buyCity?.slice(0,3) ?? '?'}</span></span>`
            ).join('');

            const qLabel = Q_LABELS[r.quality] ?? '';
            const qColor = Q_COLORS[r.quality] ?? '#aaa';
            const qBadge = r.quality
                ? `<span style="font-size:.65rem;color:${qColor};border:1px solid ${qColor};border-radius:3px;padding:0 4px;margin-left:4px;white-space:nowrap;">${qLabel}</span>`
                : '';

            html += `<tr class="scan-row scan-subrow${r.profit > 0 ? ' scan-row-profit' : ''}" data-group="${groupId}">
                <td class="scan-item-cell scan-subrow-indent">
                    <img src="${rImgUrl}" class="scan-item-img" alt="" onerror="this.style.opacity='.2'">
                    <span class="scan-item-name">${r.displayName}</span>
                </td>
                <td class="scan-tier-cell">T${r.tier}${enchTxt}</td>
                <td class="scan-city-cell">${r.sellCity ?? '—'}</td>
                <td class="text-end scan-price-cell">${_fmtSilver(r.sellPrice)}${qBadge}</td>
                <td class="scan-mat-cell">${matCols}</td>
                <td class="text-end" style="color:${rcolor};font-weight:700;">${rsign}${_fmtSilver(r.profit)}</td>
                <td class="text-end" style="color:${rpctCol};font-weight:700;">${r.profitPct.toFixed(1)}%</td>
                <td>
                    <button class="scan-add-btn" title="Agregar al día" onclick="addScannerResultToDay(${idx})">
                        <i class="bi bi-plus-circle-fill"></i>
                    </button>
                </td>
            </tr>`;
        });
    });

    tbody.innerHTML = html;
}

function filterScanResults() {
    const cfg = _getScanConfig();
    renderScanResults(cfg.minProfitPct, cfg.minQuality);
}

function toggleScanGroup(groupId) {
    const rows    = document.querySelectorAll(`[data-group="${groupId}"]`);
    const chevron = document.getElementById(`${groupId}-chevron`);
    const hiding  = !rows[0]?.classList.contains('scan-subrow-hidden');
    rows.forEach(r => r.classList.toggle('scan-subrow-hidden', hiding));
    chevron?.classList.toggle('scan-group-chevron-collapsed', hiding);
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
        quality:         r.quality ?? 2,
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
