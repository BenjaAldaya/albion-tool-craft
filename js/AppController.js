/**
 * Controlador principal de la aplicación
 * Depende de: ImageHelper.js, PriceCache.js, SnapshotManager.js, UIManager.js
 */

// ── Construcción del listado de items ────────────────────────────────────────

function buildItemList() {
    const items = [];

    Object.entries(AlbionConfig.TOOL_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: 'Herramienta',
            handType: '1H',
            isTool: true,
            materials: Object.keys(recipe.materials)
        });
    });

    Object.entries(AlbionConfig.WEAPON_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: recipe.category || 'Arma',
            handType: recipe.type || '1H',
            isTool: false,
            materials: Object.keys(recipe.materials)
        });
    });

    Object.entries(AlbionConfig.ARMOR_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: recipe.category || 'Armadura',
            handType: recipe.type || 'armor',
            isTool: false,
            isArmor: true,
            materials: Object.keys(recipe.materials)
        });
    });

    return items;
}

const ALL_ITEMS = buildItemList();

// ── Visibilidad de materiales ─────────────────────────────────────────────────

function updateMaterialVisibility(itemType) {
    document.querySelectorAll('.mat-cell').forEach(el => el.classList.add('d-none'));
    const recipe = AlbionConfig.TOOL_RECIPES[itemType]
        || AlbionConfig.WEAPON_RECIPES[itemType]
        || AlbionConfig.ARMOR_RECIPES[itemType];
    if (!recipe) return;
    Object.keys(recipe.materials).forEach(mat => {
        const el = document.querySelector(`.mat-cell[data-material="${mat}"]`);
        if (el) el.classList.remove('d-none');
    });
}

// ── Buscador ──────────────────────────────────────────────────────────────────

function selectItem(itemData) {
    uiManager.clearPricesAndResults();
    document.getElementById('enchantment').value = '0';
    document.getElementById('quality').value = '1';
    document.getElementById('itemType').value = itemData.type;
    document.getElementById('selectedWeaponName').textContent = itemData.name;
    document.getElementById('selectedWeaponMeta').textContent =
        `${itemData.category} \u2022 ${itemData.handType}`;
    updateSelectedWeaponImage();
    updateMaterialVisibility(itemData.type);
    updateMaterialImages();
    loadPriceCache();
    closeResults();
    uiManager.calculate();
}

function renderResults(filtered) {
    const panel = document.getElementById('weaponResults');

    if (filtered.length === 0) {
        panel.innerHTML = '<div class="no-results-msg">No se encontraron items</div>';
        panel.classList.add('open');
        return;
    }

    const byCategory = {};
    filtered.forEach(item => {
        if (!byCategory[item.category]) byCategory[item.category] = [];
        byCategory[item.category].push(item);
    });

    const tier = getCurrentTier();
    let html = '';

    Object.entries(byCategory).forEach(([cat, items]) => {
        html += `<div class="weapon-category-header">${cat}</div>`;
        items.forEach(item => {
            const imgUrl = getItemImageUrl(item.type, tier);
            const SLOT_LABEL = { armor: 'PECHO', head: 'CASCO', shoes: 'BOTAS', offhand: 'OFF', tool: 'TOOL' };
            const badgeLabel = SLOT_LABEL[item.handType] || item.handType;
            const badgeClass = item.handType === '2H' ? 'badge-2h'
                : item.isArmor ? 'badge-armor'
                : 'badge-1h';
            html += `
                <div class="weapon-option" data-type="${item.type}">
                    <img src="${imgUrl}" alt="${item.name}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2242%22 height=%2242%22><rect width=%2242%22 height=%2242%22 rx=%226%22 fill=%22rgba(212,175,55,0.1)%22/><text x=%2221%22 y=%2228%22 text-anchor=%22middle%22 font-size=%2220%22>⚔️</text></svg>';">
                    <div class="weapon-option-info">
                        <div class="weapon-option-name">${item.name}</div>
                        <div class="weapon-option-meta">${item.category}</div>
                    </div>
                    <span class="weapon-option-badge ${badgeClass}">${badgeLabel}</span>
                </div>`;
        });
    });

    panel.innerHTML = html;
    panel.classList.add('open');

    panel.querySelectorAll('.weapon-option').forEach(el => {
        el.addEventListener('click', () => {
            const type = el.dataset.type;
            const itemData = ALL_ITEMS.find(i => i.type === type);
            if (itemData) selectItem(itemData);
        });
    });
}

function closeResults() {
    document.getElementById('weaponResults').classList.remove('open');
    document.getElementById('weaponSearch').value = '';
}

// ── Snapshots: carga (usa ALL_ITEMS y funciones de imágenes) ──────────────────

function loadSnapshot(snap) {
    const cityChips = document.getElementById('cityPriceChips');
    if (cityChips) cityChips.innerHTML = '';

    const itemData = ALL_ITEMS.find(i => i.type === snap.itemType);
    if (!itemData) return;
    document.getElementById('itemType').value = snap.itemType;
    document.getElementById('selectedWeaponName').textContent = itemData.name;
    document.getElementById('selectedWeaponMeta').textContent =
        `${itemData.category} \u2022 ${itemData.handType}`;

    document.querySelectorAll('.tier-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tier == snap.tier);
    });
    document.getElementById('tier').value       = snap.tier;
    document.getElementById('enchantment').value = snap.enchant;
    document.getElementById('quantity').value    = snap.qty;
    document.getElementById('returnRate').value  = Math.round(snap.returnRate * 100);
    document.getElementById('taxRate').value     = snap.taxRate;
    document.getElementById('citySelector').value = snap.city;

    const map = {
        leather: 'leatherPrice', bars: 'barsPrice', planks: 'planksPrice',
        cloth: 'clothPrice', artifact: 'artifactPrice', energy: 'energyPrice',
        item: 'itemPrice', journalBuy: 'journalBuyPrice', journalSell: 'journalSellPrice'
    };
    Object.entries(map).forEach(([field, id]) => {
        const el = document.getElementById(id);
        if (el && snap.prices[field] != null) el.value = snap.prices[field];
    });

    updateSelectedWeaponImage();
    updateMaterialVisibility(snap.itemType);
    updateMaterialImages();
    uiManager.calculate();
}

// ── Inicialización ────────────────────────────────────────────────────────────

const uiManager = new UIManager();
uiManager.initialize();

// C1: Inicializar selector de servidor
(function initServerSelector() {
    const selector = document.getElementById('serverSelector');
    if (!selector) return;
    const saved = localStorage.getItem('albionServer') || 'AMERICAS';
    selector.value = saved;
    selector.addEventListener('change', function () {
        uiManager.api.setServer(this.value);
        // Limpiar caché de precios (son específicos por servidor)
        localStorage.removeItem(PRICE_CACHE_KEY);
        uiManager.clearPricesAndResults();
        const badge = document.getElementById('priceCacheBadge');
        if (badge) badge.style.display = 'none';
    });
})();

// Tier buttons
document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tier').value = this.dataset.tier;
        updateSelectedWeaponImage();
        updateMaterialImages();
        loadPriceCache();
        uiManager.calculate();
    });
});

// Quality / Enchantment
document.getElementById('quality').addEventListener('change', function () {
    updateSelectedWeaponImage();
    updateMaterialImages();
});

document.getElementById('enchantment').addEventListener('change', function () {
    updateSelectedWeaponImage();
    updateMaterialImages();
    loadPriceCache();
    uiManager.calculate();
});

// City selector
document.getElementById('citySelector').addEventListener('change', function () {
    loadPriceCache();
    uiManager.calculate();
});

// Premium / Tax toggles
document.getElementById('premiumToggle').addEventListener('change', function () {
    document.getElementById('sellTaxPct').textContent = this.checked ? '6.5' : '10.5';
    uiManager.calculate();
});
document.getElementById('sellOrderTaxToggle').addEventListener('change', () => uiManager.calculate());
document.getElementById('buyOrderTaxToggle').addEventListener('change', () => uiManager.calculate());

// Snapshot button
document.getElementById('saveSnapshotBtn').addEventListener('click', saveSnapshot);
renderSnapshots();

// Buscador
document.getElementById('weaponSearch').addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    renderResults(query.length === 0
        ? ALL_ITEMS
        : ALL_ITEMS.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        )
    );
});

document.getElementById('weaponSearch').addEventListener('focus', function () {
    renderResults(ALL_ITEMS);
});

document.addEventListener('click', function (e) {
    const wrapper = document.querySelector('.weapon-search-wrapper');
    if (!wrapper.contains(e.target) && e.target.id !== 'selectedWeaponDisplay') {
        document.getElementById('weaponResults').classList.remove('open');
    }
});

// Inicializar con Dagger seleccionado
(function init() {
    const defaultItem = ALL_ITEMS.find(i => i.type === 'MAIN_DAGGER');
    if (defaultItem) {
        document.getElementById('selectedWeaponName').textContent = defaultItem.name;
        document.getElementById('selectedWeaponMeta').textContent =
            `${defaultItem.category} \u2022 ${defaultItem.handType}`;
    }
    updateSelectedWeaponImage();
    updateMaterialVisibility('MAIN_DAGGER');
    updateMaterialImages();
    loadPriceCache();
})();
