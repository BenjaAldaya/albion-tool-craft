/**
 * Calculadora de Refinado
 * Calcula el costo por unidad de un recurso refinado.
 */

const REFINERY_RESOURCES = [
    { id: 'HIDE',  refinedId: 'LEATHER',    name: 'Cuero',   craftingField: 'leatherPrice' },
    { id: 'ORE',   refinedId: 'METALBAR',   name: 'Barras',  craftingField: 'barsPrice'    },
    { id: 'WOOD',  refinedId: 'PLANKS',     name: 'Tablas',  craftingField: 'planksPrice'  },
    { id: 'FIBER', refinedId: 'CLOTH',      name: 'Tela',    craftingField: 'clothPrice'   },
    { id: 'ROCK',  refinedId: 'STONEBLOCK', name: 'Bloques', craftingField: null           },
];

const RAW_PER_TIER = { 4: 2, 5: 3, 6: 4, 7: 5, 8: 6 };

const REF_RENDER = 'https://render.albiononline.com/v1/item/';

const CITY_ABBR = {
    'Caerleon': 'Cae', 'Bridgewatch': 'Bri', 'Fort Sterling': 'Ste',
    'Lymhurst': 'Lym', 'Martlock': 'Mar', 'Thetford': 'The',
    'Brecilien': 'Bre', 'Black Market': 'BM'
};

const refineryState = {
    resourceIdx: 0,
    tier: 7,
    lastCostPerUnit: 0,
    lastCraftingField: null,
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const target = this.dataset.tab;
            document.querySelectorAll('.tab-pane').forEach(p => {
                p.style.display = p.id === target ? '' : 'none';
            });
        });
    });
}

// ── Imágenes ──────────────────────────────────────────────────────────────────

function updateRefineryImages() {
    const res  = REFINERY_RESOURCES[refineryState.resourceIdx];
    const tier = refineryState.tier;

    const rawImg    = document.getElementById('refRawImg');
    const lowerImg  = document.getElementById('refLowerImg');
    const resultImg = document.getElementById('refResultImg');

    if (rawImg)    rawImg.src    = `${REF_RENDER}T${tier}_${res.id}.png`;
    if (lowerImg)  lowerImg.src  = `${REF_RENDER}T${tier - 1}_${res.refinedId}.png`;
    if (resultImg) resultImg.src = `${REF_RENDER}T${tier}_${res.refinedId}.png`;

    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setTxt('refRawTierLabel',    tier);
    setTxt('refLowerTierLabel',  tier - 1);
    setTxt('refResultTierLabel', tier);
}

// ── Cálculo ───────────────────────────────────────────────────────────────────

function calculateRefinery() {
    const res        = REFINERY_RESOURCES[refineryState.resourceIdx];
    const tier       = refineryState.tier;
    const qty        = Math.max(1, parseInt(document.getElementById('refQty').value)        || 1);
    const returnRate = parseFloat(document.getElementById('refReturnRate').value) / 100      || 0;
    const tax        = parseFloat(document.getElementById('refTax').value)                   || 0;
    const rawPrice   = parseFloat(document.getElementById('refRawPrice').value)              || 0;
    const lowerPrice = parseFloat(document.getElementById('refLowerPrice').value)            || 0;

    const rawPerUnit    = RAW_PER_TIER[tier] || 2;
    const effectiveRaw  = rawPerUnit * (1 - returnRate);

    const rawCostTotal   = effectiveRaw * qty * rawPrice;
    const lowerCostTotal = qty * lowerPrice;
    const taxTotal       = tax * qty;
    const totalCost      = rawCostTotal + lowerCostTotal + taxTotal;
    const costPerUnit    = totalCost / qty;

    refineryState.lastCostPerUnit   = costPerUnit;
    refineryState.lastCraftingField = res.craftingField;

    const fmt    = v => Math.round(v).toLocaleString('es-AR');
    const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

    setTxt('refCostPerUnit',  fmt(costPerUnit));
    setTxt('refTotalCost',    fmt(totalCost));
    setTxt('refRawUsed',      (effectiveRaw * qty).toFixed(2));
    setTxt('refRawCost',      fmt(rawCostTotal));
    setTxt('refLowerCost',    fmt(lowerCostTotal));
    setTxt('refTaxCost',      fmt(taxTotal));
    setTxt('refQtyLabel',     qty);
    setTxt('refQtyLabel2',    qty);

    const copyBtn = document.getElementById('refCopyBtn');
    if (copyBtn) {
        if (res.craftingField) {
            copyBtn.innerHTML = `<i class="bi bi-arrow-left-right"></i> Usar como precio de ${res.name} en Crafteo`;
            copyBtn.disabled = false;
        } else {
            copyBtn.innerHTML = `${res.name} no es material de crafteo directo`;
            copyBtn.disabled = true;
        }
    }
}

// ── Cargar precios de la API ──────────────────────────────────────────────────

async function loadRefineryPrices() {
    const btn    = document.getElementById('refLoadPricesBtn');
    const status = document.getElementById('refPriceStatus');
    if (!btn) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Cargando...';
        if (status) { status.textContent = ''; status.style.display = 'none'; }

        const res  = REFINERY_RESOURCES[refineryState.resourceIdx];
        const tier = refineryState.tier;

        // Construir IDs de la API
        const names = AlbionConfig.ITEM_API_NAMES;
        const rawApiName   = (names[res.id]   && names[res.id][tier])     || `T${tier}_${res.id}`;
        const lowerApiName = (names[res.refinedId] && names[res.refinedId][tier - 1]) || `T${tier - 1}_${res.refinedId}`;

        // Fetch en paralelo para ambos materiales
        const [rawAll, lowerAll] = await Promise.all([
            uiManager.api.fetchAllCityPrices(rawApiName, 1),
            uiManager.api.fetchAllCityPrices(lowerApiName, 1),
        ]);

        // Ordenar ascendente (más barato primero → conviene para comprar)
        rawAll.sort((a, b) => a.price - b.price);
        lowerAll.sort((a, b) => a.price - b.price);

        // Mostrar chips
        _showRefCityChips('refRawCityChips',   'refRawPrice',   rawAll);
        _showRefCityChips('refLowerCityChips', 'refLowerPrice', lowerAll);

        // Auto-llenar con el más barato
        if (rawAll.length   > 0) document.getElementById('refRawPrice').value   = rawAll[0].price;
        if (lowerAll.length > 0) document.getElementById('refLowerPrice').value = lowerAll[0].price;

        calculateRefinery();

        if (status) {
            status.innerHTML = `<i class="bi bi-lightning-fill"></i> Actualizado ${new Date().toLocaleTimeString()}`;
            status.style.display = '';
        }

    } catch (err) {
        console.error('Error cargando precios de refinado:', err);
        if (status) {
            status.textContent = 'Error al cargar precios';
            status.style.display = '';
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-cloud-download-fill"></i> Cargar Precios';
    }
}

function _showRefCityChips(containerId, inputId, cityPrices) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!cityPrices.length) {
        container.innerHTML = '<span style="font-size:0.68rem;color:rgba(255,255,255,0.35);">Sin datos</span>';
        return;
    }

    container.innerHTML = cityPrices.map((c, i) => `
        <button class="city-chip ${i === 0 ? 'best' : ''}" data-price="${c.price}" title="${c.city}: ${c.price.toLocaleString()}">
            ${i === 0 ? '★ ' : ''}<span class="city-name">${CITY_ABBR[c.city] || c.city.slice(0, 3)}</span>
            <span class="city-price">${(c.price / 1000).toFixed(1)}K</span>
        </button>`).join('');

    const input = document.getElementById(inputId);
    container.querySelectorAll('.city-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (input) input.value = btn.dataset.price;
            container.querySelectorAll('.city-chip').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            calculateRefinery();
        });
    });

    // Marcar el primero (más barato) como seleccionado por defecto
    const first = container.querySelector('.city-chip');
    if (first) first.classList.add('selected');
}

function _clearRefChips() {
    ['refRawCityChips', 'refLowerCityChips'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    const status = document.getElementById('refPriceStatus');
    if (status) { status.textContent = ''; status.style.display = 'none'; }
}

// ── Copiar a calculadora de crafteo ──────────────────────────────────────────

function copyRefineryToCrafting() {
    const field = refineryState.lastCraftingField;
    if (!field) return;

    const input = document.getElementById(field);
    if (input) {
        input.value = Math.round(refineryState.lastCostPerUnit);
        input.classList.add('field-highlight');
        setTimeout(() => input.classList.remove('field-highlight'), 1500);
    }

    const craftTab = document.querySelector('.tab-btn[data-tab="craftingTab"]');
    if (craftTab) craftTab.click();
}

// ── Inicialización ────────────────────────────────────────────────────────────

function initRefineryTab() {
    // Botones de recurso
    document.querySelectorAll('.res-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.res-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            refineryState.resourceIdx = i;
            _clearRefChips();
            updateRefineryImages();
            calculateRefinery();
        });
    });

    // Botones de tier
    document.querySelectorAll('.ref-tier-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.ref-tier-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            refineryState.tier = parseInt(this.dataset.tier);
            _clearRefChips();
            updateRefineryImages();
            calculateRefinery();
        });
    });

    // Inputs numéricos
    ['refQty', 'refReturnRate', 'refTax', 'refRawPrice', 'refLowerPrice'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateRefinery);
    });

    // Botones de acción
    document.getElementById('refLoadPricesBtn').addEventListener('click', loadRefineryPrices);
    document.getElementById('refCopyBtn').addEventListener('click', copyRefineryToCrafting);

    updateRefineryImages();
    calculateRefinery();
}
