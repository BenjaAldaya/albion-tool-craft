/**
 * Panel "Crafteo del Día"
 * Lista de crafteos de la sesión con acordeón, totales y lista de compra consolidada.
 * Depende de: UIManager (uiManager global), ImageHelper (getItemImageUrl)
 */

const DAY_SESSION_KEY = 'albionDaySession';
let dayCrafts = [];

// ── Helpers de formato ────────────────────────────────────────────────────────

function _fmtSilver(v) {
    const abs = Math.abs(v);
    const neg = v < 0;
    let s;
    if (abs >= 1_000_000) s = (abs / 1_000_000).toFixed(2) + 'M';
    else if (abs >= 1_000) s = (abs / 1_000).toFixed(1) + 'K';
    else s = Math.round(abs).toLocaleString();
    return (neg ? '-' : '') + s;
}

// ── Persistencia ──────────────────────────────────────────────────────────────

function _saveDayCrafts() {
    localStorage.setItem(DAY_SESSION_KEY, JSON.stringify(dayCrafts));
}

// ── Acciones ──────────────────────────────────────────────────────────────────

function addToDaySession() {
    if (!uiManager.currentCalculator) return;

    const analysis = uiManager.currentCalculator.generateFullAnalysis();
    const config   = uiManager.getFormValues();

    const MAT_LABEL = {
        LEATHER: 'Cuero', METALBAR: 'Barras', PLANKS: 'Tablas',
        CLOTH: 'Tela', AVALONIANENERGY: 'Energía', artifact: 'Artefacto'
    };

    const craft = {
        id:           Date.now(),
        itemType:     config.itemType,
        itemName:     analysis.item.displayName,
        tier:         config.tier,
        enchant:      config.enchantment,
        quality:      config.quality,
        quantity:     config.quantity,
        city:         config.city,
        returnRate:   config.returnRate,
        usageFeePct:  analysis.configuration?.usageFeePct  || 0,
        taxPerItem:   analysis.configuration?.taxPerItem   || 0,
        artifactType: analysis.configuration?.artifactType || 'none',
        itemPrice:    parseFloat(document.getElementById('itemPrice')?.value) || 0,
        journalBuyPrice:  config.journalBuyPrice,
        journalSellPrice: config.journalSellPrice,
        totalCost:     analysis.costs.totalCost,
        totalRevenue:  analysis.revenue.totalRevenue,
        finalProfit:   analysis.profit.finalProfit,
        profitPct:     analysis.profit.profitPercentage,
        journalsProfit: analysis.journals?.profit || 0,
        journalsFilled: analysis.journals?.journalsComplete || 0,
        savedAt:       new Date().toLocaleTimeString(),
        materials:     {},
    };

    Object.entries(analysis.materials.toBuy).forEach(([type, mat]) => {
        if ((mat.quantity || 0) <= 0) return;
        craft.materials[type] = {
            label:       MAT_LABEL[type] || type,
            quantity:    mat.quantity,
            neededQty:   analysis.materials.needed[type]?.quantity || 0,
            price:       mat.price || 0,
            apiName:     mat.apiName || '',
        };
    });

    dayCrafts.unshift(craft);
    _saveDayCrafts();
    renderDayPanel();

    // Feedback visual en el botón
    const btn = document.getElementById('addToDayBtn');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Agregado';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-warning');
        setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-warning');
        }, 1500);
    }
}

function removeDayCraft(id) {
    dayCrafts = dayCrafts.filter(c => c.id !== id);
    _saveDayCrafts();
    renderDayPanel();
}

function editDayCraft(id) {
    const craft = dayCrafts.find(c => c.id === id);
    if (!craft) return;

    // Quitar de la sesión (se re-agrega después de editar)
    removeDayCraft(id);

    // Construir objeto compatible con loadSnapshot() de AppController.js
    const snap = {
        itemType:   craft.itemType,
        tier:       craft.tier,
        enchant:    craft.enchant,
        qty:        craft.quantity,
        returnRate: craft.returnRate,
        taxRate:    craft.taxRate,
        city:       craft.city,
        prices: {
            leather:     craft.materials.LEATHER?.price          || 0,
            bars:        craft.materials.METALBAR?.price         || 0,
            planks:      craft.materials.PLANKS?.price           || 0,
            cloth:       craft.materials.CLOTH?.price            || 0,
            artifact:    craft.materials.artifact?.price         || 0,
            energy:      craft.materials.AVALONIANENERGY?.price  || 0,
            item:        craft.itemPrice,
            journalBuy:  craft.journalBuyPrice,
            journalSell: craft.journalSellPrice,
        }
    };

    // Ir al tab de crafteo
    document.querySelector('.tab-btn[data-tab="craftingTab"]')?.click();

    // Cargar valores en el formulario (función global de AppController.js)
    loadSnapshot(snap);
}

function clearDaySession() {
    if (!dayCrafts.length) return;
    dayCrafts = [];
    _saveDayCrafts();
    renderDayPanel();
}

// ── Render principal ──────────────────────────────────────────────────────────

function renderDayPanel() {
    const list     = document.getElementById('dayCraftList');
    const totals   = document.getElementById('dayCraftTotals');
    const empty    = document.getElementById('dayCraftEmpty');
    const badge    = document.getElementById('dayCraftBadge');
    const clearBtn = document.getElementById('dayClearBtn');

    if (badge)    badge.textContent = dayCrafts.length > 0 ? dayCrafts.length : '';
    if (clearBtn) clearBtn.style.display = dayCrafts.length > 0 ? '' : 'none';

    if (!list) return;

    if (dayCrafts.length === 0) {
        if (empty) empty.style.display = '';
        list.innerHTML = '';
        if (totals) totals.style.display = 'none';
        return;
    }

    if (empty) empty.style.display = 'none';

    list.innerHTML = dayCrafts.map(c => {
        try { return _buildCraftCard(c); }
        catch (err) { console.warn('[DayPanel] Error renderizando crafteo', c.id, err); return ''; }
    }).join('');

    list.querySelectorAll('.dc-del-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            removeDayCraft(parseInt(btn.dataset.id));
        });
    });

    list.querySelectorAll('.dc-edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            editDayCraft(parseInt(btn.dataset.id));
        });
    });

    list.querySelectorAll('.dc-header').forEach(header => {
        header.addEventListener('click', () => {
            header.closest('.dc-card').classList.toggle('dc-open');
        });
    });

    _renderTotals();
}

// ── Construcción de tarjeta ───────────────────────────────────────────────────

function _buildCraftCard(c) {
    const isPos       = c.finalProfit >= 0;
    const profitColor = isPos ? '#7ec85c' : '#e87676';
    const sign        = isPos ? '+' : '';
    const enchTxt     = c.enchant > 0 ? `.${c.enchant}` : '';
    const imgUrl      = getItemImageUrl(c.itemType, c.tier, c.enchant);
    const Q_NAMES     = ['', 'Normal', 'Good', 'Outstanding', 'Excellent', 'Masterpiece'];
    const RENDER      = 'https://render.albiononline.com/v1/item/';

    const matRows = Object.entries(c.materials || {}).map(([type, mat]) => {
        if (!mat || typeof mat !== 'object') return '';
        const renderName = (mat.apiName || '').replace(/@(\d)$/, '_LEVEL$1');
        const subtotal   = (mat.quantity || 0) * (mat.price || 0);
        return `
        <tr>
            <td><img src="${RENDER}${renderName}.png?size=40" width="20" height="20"
                     style="border-radius:3px;object-fit:contain;" onerror="this.style.display='none'"></td>
            <td class="dc-mat-name">${mat.label || type}</td>
            <td class="dc-mat-qty">${(mat.quantity || 0).toLocaleString()}</td>
            <td class="dc-mat-price">${(mat.price || 0) > 0 ? _fmtSilver(mat.price) : '—'}</td>
            <td class="dc-mat-total">${subtotal > 0 ? _fmtSilver(subtotal) : '—'}</td>
        </tr>`;
    }).join('') || `<tr><td colspan="5" style="opacity:.35;font-size:.72rem;padding:6px 4px;">Sin materiales</td></tr>`;

    const rrPct       = Math.round(c.returnRate * 100);
    const qualityName = Q_NAMES[c.quality] || 'Normal';

    // Costo materiales = suma de subtotales de cada material
    const matCost = Object.values(c.materials || {}).reduce((s, m) => s + (m.quantity||0)*(m.price||0), 0);
    const taxTotal   = c.totalCost - matCost;
    const taxPerItem = c.taxPerItem || (c.quantity > 0 ? taxTotal / c.quantity : 0);
    const usageFee   = c.usageFeePct || 0;

    const ART_LABEL = { rune: 'Rune', soul: 'Soul', relic: 'Relic', avalonian: 'Avalonian' };
    const ART_COLOR = { rune: '#a0d080', soul: '#4fc3f7', relic: '#ce93d8', avalonian: '#f0c040' };
    const artType   = c.artifactType || 'none';
    const artBadge  = ART_LABEL[artType]
        ? `<span style="font-size:.6rem;font-weight:700;color:${ART_COLOR[artType]};border:1px solid ${ART_COLOR[artType]};border-radius:3px;padding:0 4px;margin-left:4px;">${ART_LABEL[artType]}</span>`
        : '';

    const journalBlock = (c.journalBuyPrice > 0 || c.journalSellPrice > 0 || c.journalsFilled > 0) ? `
        <div class="dc-divider"></div>
        <div class="dc-section-label"><i class="bi bi-journal-text" style="color:#4fc3f7;"></i> Journals</div>
        <div class="dc-info-row">
            <span>Vacío <strong>${c.journalBuyPrice > 0 ? _fmtSilver(c.journalBuyPrice) : '—'}</strong></span>
            <span>Lleno <strong style="color:#4fc3f7;">${c.journalSellPrice > 0 ? _fmtSilver(c.journalSellPrice) : '—'}</strong></span>
        </div>
        <div class="dc-info-row">
            <span><i class="bi bi-check-circle" style="color:#4fc3f7;"></i> ${c.journalsFilled} completados</span>
            <span style="color:#4fc3f7;font-weight:700;">+${_fmtSilver(c.journalsProfit || 0)}</span>
        </div>` : '';

    return `
    <div class="dc-card" data-id="${c.id}">
        <div class="dc-header">
            <img src="${imgUrl}" class="dc-item-img" alt="" onerror="this.style.opacity='.2'">
            <div class="dc-title-block">
                <div class="dc-item-name">${c.itemName}</div>
                <div class="dc-item-meta">T${c.tier}${enchTxt} · ×${c.quantity} · ${qualityName} · ${c.city.slice(0,3)}</div>
            </div>
            <div class="dc-profit-badge" style="color:${profitColor}">
                ${sign}${_fmtSilver(c.finalProfit)}<i class="bi bi-coin" style="font-size:.7em;margin-left:2px;"></i>
            </div>
            <button class="dc-edit-btn" data-id="${c.id}" title="Editar crafteo"><i class="bi bi-pencil-fill"></i></button>
            <button class="dc-del-btn" data-id="${c.id}" title="Eliminar">✕</button>
            <i class="bi bi-chevron-down dc-chevron"></i>
        </div>
        <div class="dc-body">

            <div class="dc-section-label">Materiales a comprar</div>
            <table class="dc-mat-table">
                <thead><tr>
                    <th></th><th>Material</th>
                    <th class="text-end">Cant.</th>
                    <th class="text-end">c/u</th>
                    <th class="text-end" style="color:#f0c040;">Total</th>
                </tr></thead>
                <tbody>${matRows}</tbody>
            </table>

            <div class="dc-divider"></div>

            <div class="dc-section-label">Costos${artBadge}</div>
            <div class="dc-info-row">
                <span><i class="bi bi-bag-fill" style="color:#e87676;"></i> Materiales</span>
                <span style="color:#e87676;font-weight:700;">${_fmtSilver(matCost)}</span>
            </div>
            <div class="dc-info-row">
                <span><i class="bi bi-building"></i> Puesto${usageFee > 0 ? ' '+usageFee+'%' : ''} · ${_fmtSilver(taxPerItem)}/ítem × ${c.quantity}</span>
                <span style="color:#e87676;">${_fmtSilver(taxTotal)}</span>
            </div>
            <div class="dc-info-row" style="border-top:1px solid rgba(255,255,255,.06);padding-top:4px;margin-top:2px;">
                <span style="font-weight:600;">Inversión total</span>
                <span style="color:#e87676;font-weight:700;">${_fmtSilver(c.totalCost)}</span>
            </div>

            <div class="dc-divider"></div>

            <div class="dc-section-label">Ingresos</div>
            <div class="dc-info-row">
                <span><i class="bi bi-currency-exchange" style="color:#a0d080;"></i> Venta ítem <strong>${_fmtSilver(c.itemPrice)}</strong> c/u</span>
                <span style="color:#a0d080;font-weight:700;">${_fmtSilver(c.totalRevenue - (c.journalsProfit||0))}</span>
            </div>
            <div class="dc-info-row">
                <span><i class="bi bi-arrow-repeat"></i> Retorno <strong>${rrPct}%</strong></span>
                <span style="opacity:.55;font-size:.72rem;">materiales recuperados</span>
            </div>

            ${journalBlock}

            <div class="dc-divider"></div>

            <div class="dc-profit-final" style="color:${profitColor}">
                <span>Profit total</span>
                <span>${sign}${Math.round(c.finalProfit).toLocaleString()} <i class="bi bi-coin" style="font-size:.85em;"></i></span>
            </div>
            <div class="dc-profit-pct" style="color:${profitColor}">${(c.profitPct ?? 0).toFixed(1)}% margen</div>
        </div>
    </div>`;
}

// ── Totales y lista de compra consolidada ─────────────────────────────────────

function _renderTotals() {
    const totals = document.getElementById('dayCraftTotals');
    if (!totals || dayCrafts.length === 0) { if (totals) totals.style.display = 'none'; return; }

    const totalInvest   = dayCrafts.reduce((s, c) => s + c.totalCost,   0);
    const totalRevenue  = dayCrafts.reduce((s, c) => s + c.totalRevenue, 0);
    const totalProfit   = dayCrafts.reduce((s, c) => s + c.finalProfit,  0);
    const totalJournals = dayCrafts.reduce((s, c) => s + (c.journalsProfit || 0), 0);
    const totalItems    = dayCrafts.reduce((s, c) => s + c.quantity, 0);
    const avgMargin     = totalInvest > 0 ? ((totalProfit / totalInvest) * 100).toFixed(1) : '0.0';

    const profitColor = totalProfit >= 0 ? '#7ec85c' : '#e87676';
    const sign        = totalProfit >= 0 ? '+' : '';

    // Agregar materiales de todos los crafteos — key = apiName para separar por tier/enchant
    const RENDER = 'https://render.albiononline.com/v1/item/';

    // Extrae "T5.1" desde "T5_LEATHER@1" o "T6" desde "T6_METALBAR"
    const _tierLabel = apiName => {
        const m = apiName?.match(/^T(\d)_.*?(?:@(\d))?$/);
        return m ? `T${m[1]}${m[2] ? '.' + m[2] : ''}` : '';
    };

    const aggMats = {};
    dayCrafts.forEach(c => {
        Object.entries(c.materials || {}).forEach(([type, mat]) => {
            if (!mat || typeof mat !== 'object') return;
            const key = mat.apiName || mat.label || type;
            if (!aggMats[key]) aggMats[key] = {
                label:     mat.label || type,
                apiName:   mat.apiName || '',
                tierLabel: _tierLabel(mat.apiName),
                totalQty:  0,
                totalCost: 0,
            };
            aggMats[key].totalQty  += (mat.quantity || 0);
            aggMats[key].totalCost += (mat.quantity || 0) * (mat.price || 0);
        });
    });

    const matAggRows = Object.entries(aggMats)
        .sort((a, b) => b[1].totalCost - a[1].totalCost)   // más caro primero
        .map(([, mat]) => {
            const renderName = mat.apiName?.replace(/@(\d)$/, '_LEVEL$1') ?? '';
            const avgPrice   = mat.totalQty > 0 ? mat.totalCost / mat.totalQty : 0;
            const tierBadge  = mat.tierLabel
                ? `<span style="font-size:.6rem;color:#f0c040;margin-right:3px;">${mat.tierLabel}</span>`
                : '';
            return `
            <tr>
                <td><img src="${RENDER}${renderName}.png?size=40" width="18" height="18"
                         style="border-radius:3px;object-fit:contain;" onerror="this.style.display='none'"></td>
                <td style="font-size:.74rem;">${tierBadge}${mat.label}</td>
                <td style="text-align:right;font-size:.74rem;font-weight:700;color:#f0c040;">${mat.totalQty.toLocaleString()}</td>
                <td style="text-align:right;font-size:.7rem;color:rgba(255,255,255,.55);">${avgPrice > 0 ? _fmtSilver(avgPrice) : '—'}</td>
                <td style="text-align:right;font-size:.74rem;color:#e87676;">${_fmtSilver(mat.totalCost)}</td>
            </tr>`;
        }).join('');

    const journalChip = totalJournals > 0 ? `
        <div class="dc-total-chip">
            <span class="dc-total-chip-label">Journals</span>
            <span class="dc-total-chip-val" style="color:#4fc3f7;">+${_fmtSilver(totalJournals)}</span>
        </div>` : '';

    const shoppingSection = matAggRows ? `
        <div class="dc-section-label" style="margin-top:14px;margin-bottom:6px;">
            <i class="bi bi-cart4"></i> Lista de Compra Consolidada
        </div>
        <table class="dc-mat-table">
            <thead><tr>
                <th></th><th>Material</th>
                <th class="text-end">Total</th>
                <th class="text-end">Prom.</th>
                <th class="text-end" style="color:#e87676;">Costo</th>
            </tr></thead>
            <tbody>${matAggRows}</tbody>
        </table>` : '';

    totals.style.display = '';
    totals.innerHTML = `
        <div class="dc-totals-header"><i class="bi bi-calculator-fill"></i> Resumen del Día</div>
        <div class="dc-totals-grid">
            <div class="dc-total-chip">
                <span class="dc-total-chip-label">Crafteos</span>
                <span class="dc-total-chip-val">${dayCrafts.length}</span>
            </div>
            <div class="dc-total-chip">
                <span class="dc-total-chip-label">Ítems totales</span>
                <span class="dc-total-chip-val">${totalItems.toLocaleString()}</span>
            </div>
            <div class="dc-total-chip">
                <span class="dc-total-chip-label">Inversión</span>
                <span class="dc-total-chip-val" style="color:#e87676;">${_fmtSilver(totalInvest)}</span>
            </div>
            <div class="dc-total-chip">
                <span class="dc-total-chip-label">Ingresos</span>
                <span class="dc-total-chip-val" style="color:#a0d080;">${_fmtSilver(totalRevenue)}</span>
            </div>
            ${journalChip}
        </div>
        <div class="dc-total-profit-big" style="color:${profitColor}">
            ${sign}${_fmtSilver(totalProfit)} <i class="bi bi-coin"></i>
        </div>
        <div class="dc-total-margin">Margen promedio: ${avgMargin}%</div>
        ${shoppingSection}
    `;
}

// ── Inicialización ────────────────────────────────────────────────────────────

function initDaySession() {
    try { dayCrafts = JSON.parse(localStorage.getItem(DAY_SESSION_KEY) || '[]'); }
    catch(e) { dayCrafts = []; }

    renderDayPanel();

    document.getElementById('dayClearBtn')
        ?.addEventListener('click', clearDaySession);
    document.getElementById('addToDayBtn')
        ?.addEventListener('click', addToDaySession);
}
