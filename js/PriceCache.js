/**
 * Caché de precios de materiales por tier/encantamiento/ciudad
 */

const PRICE_CACHE_KEY = 'albionPriceCache';

function getPriceCacheKey() {
    const tier    = document.getElementById('tier').value;
    const enchant = document.getElementById('enchantment').value;
    const city    = document.getElementById('citySelector').value;
    return `T${tier}_${enchant}_${city}`;
}

function savePriceCache() {
    const inputs = {
        leather:  parseFloat(document.getElementById('leatherPrice')?.value)  || 0,
        bars:     parseFloat(document.getElementById('barsPrice')?.value)      || 0,
        planks:   parseFloat(document.getElementById('planksPrice')?.value)    || 0,
        cloth:    parseFloat(document.getElementById('clothPrice')?.value)     || 0,
        artifact: parseFloat(document.getElementById('artifactPrice')?.value)  || 0,
        energy:   parseFloat(document.getElementById('energyPrice')?.value)    || 0
    };
    const hasAny = Object.values(inputs).some(v => v > 0);
    if (!hasAny) return;

    const cache = JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || '{}');
    cache[getPriceCacheKey()] = { ...inputs, updatedAt: new Date().toLocaleTimeString() };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
}

function loadPriceCache() {
    const cache  = JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || '{}');
    const cached = cache[getPriceCacheKey()];
    const badge  = document.getElementById('priceCacheBadge');
    if (!cached) { if (badge) badge.style.display = 'none'; return; }

    const map = {
        leather: 'leatherPrice', bars: 'barsPrice',
        planks: 'planksPrice', cloth: 'clothPrice',
        artifact: 'artifactPrice', energy: 'energyPrice'
    };
    let loaded = false;
    Object.entries(map).forEach(([field, id]) => {
        const el = document.getElementById(id);
        if (el && cached[field] > 0) { el.value = cached[field]; loaded = true; }
    });
    if (badge) {
        badge.innerHTML = loaded ? `<i class="bi bi-lightning-fill"></i> Cache (${cached.updatedAt})` : '';
        badge.style.display = loaded ? '' : 'none';
    }
}
