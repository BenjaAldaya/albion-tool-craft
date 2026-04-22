/**
 * Caché de precios de materiales por tier/encantamiento/ciudad
 */

const PRICE_CACHE_KEY   = 'albionPriceCache';
const PRICE_CACHE_TTL_H = 6; // horas antes de considerar el cache viejo

function getPriceCacheKey() {
    const tier    = document.getElementById('tier').value;
    const enchant = document.getElementById('enchantment').value;
    const city    = document.getElementById('citySelector').value;
    return `T${tier}_${enchant}_${city}`;
}

function _cacheAgeLabel(savedAt) {
    const diff = Date.now() - savedAt;
    const mins = Math.floor(diff / 60000);
    if (mins < 60)   return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)    return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
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
    cache[getPriceCacheKey()] = { ...inputs, savedAt: Date.now() };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
}

function loadPriceCache() {
    const cache  = JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || '{}');
    const cached = cache[getPriceCacheKey()];
    const badge  = document.getElementById('priceCacheBadge');
    if (!cached) { if (badge) badge.style.display = 'none'; return; }

    // Migración: entradas viejas tienen updatedAt (string) en vez de savedAt (timestamp)
    const savedAt = typeof cached.savedAt === 'number' ? cached.savedAt : null;
    const ageMs   = savedAt ? Date.now() - savedAt : Infinity;
    const stale   = ageMs > PRICE_CACHE_TTL_H * 60 * 60 * 1000;
    const label   = savedAt ? _cacheAgeLabel(savedAt) : 'viejo';

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

    if (badge && loaded) {
        const icon    = stale ? 'bi-exclamation-triangle-fill' : 'bi-lightning-fill';
        const color   = stale ? 'color:#f0a040;' : '';
        const tooltip = stale ? ` title="Cache desactualizado (>${PRICE_CACHE_TTL_H}h). Recargá los precios."` : '';
        badge.innerHTML = `<i class="bi ${icon}" style="${color}"></i> Cache (${label})`;
        badge.style.display = '';
        badge.setAttribute('style', color ? `cursor:help;${color}` : '');
        if (tooltip) badge.setAttribute('title', `Cache desactualizado (>${PRICE_CACHE_TTL_H}h). Recargá los precios.`);
        else badge.removeAttribute('title');
    } else if (badge) {
        badge.style.display = 'none';
    }
}
