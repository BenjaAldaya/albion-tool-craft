/**
 * Gestión de snapshots de comparación
 * Depende de: ImageHelper.js (getItemImageUrl)
 * Depende de: AppController.js (loadSnapshot) — referencia diferida via evento
 */

const SNAPSHOTS_KEY = 'albionSnapshots';

function getSnapshots() {
    return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
}

function saveSnapshot() {
    if (!uiManager.currentCalculator) return;
    const analysis = uiManager.currentCalculator.generateFullAnalysis();
    const itemType = document.getElementById('itemType').value;
    const tier     = parseInt(document.getElementById('tier').value);
    const enchant  = parseInt(document.getElementById('enchantment').value);
    const qty      = parseInt(document.getElementById('quantity').value) || 1;
    const rr       = parseFloat(document.getElementById('returnRate').value) / 100 || 0;
    const tax      = parseFloat(document.getElementById('taxRate').value) || 0;
    const city     = document.getElementById('citySelector').value;

    const prices = {
        leather:     parseFloat(document.getElementById('leatherPrice')?.value)    || 0,
        bars:        parseFloat(document.getElementById('barsPrice')?.value)        || 0,
        planks:      parseFloat(document.getElementById('planksPrice')?.value)      || 0,
        cloth:       parseFloat(document.getElementById('clothPrice')?.value)       || 0,
        artifact:    parseFloat(document.getElementById('artifactPrice')?.value)    || 0,
        energy:      parseFloat(document.getElementById('energyPrice')?.value)      || 0,
        item:        parseFloat(document.getElementById('itemPrice')?.value)        || 0,
        journalBuy:  parseFloat(document.getElementById('journalBuyPrice')?.value)  || 0,
        journalSell: parseFloat(document.getElementById('journalSellPrice')?.value) || 0
    };

    const snap = {
        id: Date.now(),
        itemType,
        itemName:    analysis.item.name,
        tier, enchant, qty, returnRate: rr, taxRate: tax, city, prices,
        finalProfit: analysis.profit.finalProfit,
        profitPct:   analysis.profit.profitPercentage,
        savedAt:     new Date().toLocaleTimeString()
    };

    const snaps = getSnapshots();
    snaps.unshift(snap);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps.slice(0, 20)));
    renderSnapshots();
}

function deleteSnapshot(id) {
    const snaps = getSnapshots().filter(s => s.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps));
    renderSnapshots();
}

function renderSnapshots() {
    const snaps   = getSnapshots();
    const sidebar = document.getElementById('snapshotSidebar');
    const list    = document.getElementById('snapshotList');
    const count   = document.getElementById('snapshotCount');

    sidebar.style.display = snaps.length === 0 ? 'none' : '';
    if (snaps.length === 0) return;
    if (count) count.textContent = `(${snaps.length})`;

    list.innerHTML = snaps.map(s => {
        const profitColor = s.finalProfit >= 0 ? '#a0d080' : '#f08080';
        const sign        = s.finalProfit >= 0 ? '+' : '';
        const profitK     = Math.abs(s.finalProfit) >= 1000
            ? sign + (s.finalProfit / 1000).toFixed(1) + 'K'
            : sign + Math.round(s.finalProfit).toLocaleString();
        const enchTxt = s.enchant > 0 ? `.${s.enchant}` : '';
        const imgUrl  = getItemImageUrl(s.itemType, s.tier, s.enchant);
        return `
        <div class="snap-card" data-id="${s.id}">
            <button class="snap-card-del" data-id="${s.id}" title="Eliminar">✕</button>
            <img src="${imgUrl}" alt="${s.itemName}"
                 onerror="this.onerror=null;this.style.opacity='0.2'">
            <div class="snap-card-name">${s.itemName}</div>
            <div class="snap-card-tier">T${s.tier}${enchTxt} · ${s.city.substring(0, 3)}</div>
            <div class="snap-card-profit" style="color:${profitColor}">${profitK} <i class="bi bi-coin" style="font-size:0.85em;"></i></div>
        </div>`;
    }).join('');

    list.querySelectorAll('.snap-card').forEach(el => {
        el.addEventListener('click', function (e) {
            if (e.target.classList.contains('snap-card-del')) return;
            const id   = parseInt(this.dataset.id);
            const snap = getSnapshots().find(s => s.id === id);
            if (snap) loadSnapshot(snap); // loadSnapshot definido en AppController.js
        });
    });
    list.querySelectorAll('.snap-card-del').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            deleteSnapshot(parseInt(this.dataset.id));
        });
    });
}
