/**
 * Clase para interactuar con la API de Albion Online Data Project
 */
class AlbionAPI {
    constructor() {
        const savedServer = localStorage.getItem('albionServer') || 'AMERICAS';
        this.baseURL = AlbionConfig.API_URLS[savedServer] || AlbionConfig.API_URLS.AMERICAS;
        this.defaultCity = AlbionConfig.CITIES.CAERLEON;
        // Requests en vuelo: evita llamadas duplicadas simultáneas
        this._inFlight = new Map();
        // Caché de sesión para fetchAllCityPrices (TTL: 5 minutos)
        this._cityPriceCache = new Map();
        this._CITY_CACHE_TTL = 5 * 60 * 1000;
    }

    /**
     * Hace un fetch con 1 retry automático ante error de red o HTTP
     * @param {string} url
     * @returns {Promise<any>} - datos JSON
     * @private
     */
    async _fetchWithRetry(url) {
        const attempt = async () => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        };
        try {
            return await attempt();
        } catch (err) {
            await new Promise(r => setTimeout(r, 1000));
            return attempt();
        }
    }

    /**
     * Ejecuta un fetch deduplicado: si ya hay un request en vuelo con la misma clave,
     * devuelve esa misma promesa en lugar de lanzar una nueva.
     * @param {string} key - clave única del request
     * @param {Function} fetcher - función que retorna la promesa del fetch
     * @returns {Promise<any>}
     * @private
     */
    _deduped(key, fetcher) {
        if (this._inFlight.has(key)) return this._inFlight.get(key);
        const promise = fetcher().finally(() => this._inFlight.delete(key));
        this._inFlight.set(key, promise);
        return promise;
    }

    /**
     * Cambia el servidor de la API (Americas / Europe / Asia)
     * @param {string} serverKey - 'AMERICAS' | 'EUROPE' | 'ASIA'
     */
    setServer(serverKey) {
        const url = AlbionConfig.API_URLS[serverKey];
        if (!url) throw new Error(`Servidor inválido: ${serverKey}`);
        this.baseURL = url;
        localStorage.setItem('albionServer', serverKey);
    }

    /**
     * Construye la URL de la API para obtener precios
     * @param {Array<string>} itemNames - Nombres de items en formato API
     * @param {string} city - Ciudad (opcional)
     * @param {number} quality - Calidad (opcional, 1-5)
     * @returns {string}
     */
    _buildPriceURL(itemNames, city = null, quality = null) {
        const location = city || this.defaultCity;
        const items = itemNames.join(',');
        let url = `${this.baseURL}/${items}?locations=${location}`;
        if (quality) url += `&qualities=${quality}`;
        return url;
    }

    /**
     * Obtiene precios de items desde la API
     * @param {Array<string>} itemNames - Nombres de items en formato API
     * @param {string} city - Ciudad
     * @param {number} quality - Calidad
     * @returns {Promise<Object>}
     */
    async fetchPrices(itemNames, city = null, quality = 1) {
        const url = this._buildPriceURL(itemNames, city, quality);
        const key = url;

        try {
            const data = await this._deduped(key, () => this._fetchWithRetry(url));
            return this._processPriceData(data);
        } catch (error) {
            console.error('Error al obtener precios de la API:', error);
            throw error;
        }
    }

    /**
     * Procesa los datos de precios de la API
     * @param {Array} data - Datos de la API
     * @returns {Object}
     * @private
     */
    _processPriceData(data) {
        const prices = {};

        data.forEach(item => {
            const itemId = item.item_id;

            // Black Market: los NPCs COMPRAN items → precio efectivo es buy_price_max
            // Ciudades normales: los jugadores VENDEN items → precio efectivo es sell_price_min
            const isBM           = item.city === 'Black Market';
            const effectivePrice = isBM ? (item.buy_price_max || 0) : (item.sell_price_min || 0);

            const existing = prices[itemId];
            if (!existing || (existing.sellPriceMin === 0 && effectivePrice > 0)) {
                prices[itemId] = {
                    sellPriceMin: effectivePrice,          // para BM = buy_price_max del NPC
                    sellPriceMax: isBM ? (item.buy_price_max || 0) : (item.sell_price_max || 0),
                    buyPriceMin:  item.buy_price_min || 0,
                    buyPriceMax:  item.buy_price_max || 0,
                    isBlackMarket: isBM,
                    city:         item.city,
                    quality:      item.quality,
                    lastUpdate:   isBM ? item.buy_price_max_date : item.sell_price_min_date
                };
            }
        });

        return prices;
    }

    /**
     * Obtiene precios para un item específico (herramienta o arma)
     * @param {Item} item - Item del cual obtener precios
     * @param {string} city - Ciudad
     * @returns {Promise<Object>}
     */
    async fetchItemPrices(item, city = null) {
        // Item (arma/herramienta): filtrar por calidad
        // Materiales: NO filtrar por calidad (los materiales encantados no tienen calidad de mercado)
        const materialNames = [];
        item.getAllMaterials().forEach(material => {
            materialNames.push(material.getAPIName());
        });

        const [itemPrices, materialPrices] = await Promise.all([
            this.fetchPrices([item.getAPIName()], city, item.quality),
            materialNames.length > 0 ? this.fetchPrices(materialNames, city, null) : Promise.resolve({})
        ]);

        return { ...itemPrices, ...materialPrices };
    }

    /**
     * Obtiene precios para crafteo de herramientas
     * @param {Tool} tool - Herramienta
     * @param {string} city - Ciudad
     * @returns {Promise<Object>}
     */
    async fetchToolCraftingPrices(tool, city = null) {
        const prices = await this.fetchItemPrices(tool, city);

        const result = {
            tool: { name: tool.getDisplayName(), apiName: tool.getAPIName(), price: 0 },
            materials: {}
        };

        const toolPrice = prices[tool.getAPIName()];
        if (toolPrice) result.tool.price = toolPrice.sellPriceMin;

        const keyMap = { LEATHER: 'leather', METALBAR: 'bars', PLANKS: 'planks', CLOTH: 'cloth', AVALONIANENERGY: 'energy', artifact: 'artifact' };
        tool.getAllMaterials().forEach((material, matKey) => {
            const priceKey = keyMap[matKey] || matKey.toLowerCase();
            const p = prices[material.getAPIName()];
            result.materials[priceKey] = p ? p.sellPriceMin : 0;
        });

        return result;
    }

    /**
     * Obtiene precios para crafteo de armas
     * @param {Weapon} weapon - Arma
     * @param {string} city - Ciudad
     * @returns {Promise<Object>}
     */
    async fetchWeaponCraftingPrices(weapon, city = null) {
        const prices = await this.fetchItemPrices(weapon, city);

        const result = {
            weapon: { name: weapon.getDisplayName(), apiName: weapon.getAPIName(), price: 0 },
            materials: {}
        };

        const weaponPrice = prices[weapon.getAPIName()];
        if (weaponPrice) result.weapon.price = weaponPrice.sellPriceMin;

        // Map recipe keys → UI price keys expected by updateMaterialPrices
        const keyMap = { LEATHER: 'leather', METALBAR: 'bars', PLANKS: 'planks', CLOTH: 'cloth', artifact: 'artifact' };
        weapon.getAllMaterials().forEach((material, matKey) => {
            const priceKey = keyMap[matKey] || matKey.toLowerCase();
            const p = prices[material.getAPIName()];
            result.materials[priceKey] = p ? p.sellPriceMin : 0;
        });

        return result;
    }

    /**
     * Actualiza los precios de un item desde la API
     * @param {Item} item - Item a actualizar
     * @param {string} city - Ciudad
     * @returns {Promise<void>}
     */
    async updateItemPrices(item, city = null) {
        let priceData;

        if (item instanceof Tool) {
            priceData = await this.fetchToolCraftingPrices(item, city);
            item.setPrice(priceData.tool.price);
            item.updateMaterialPrices(priceData.materials);
        } else if (item instanceof Weapon || item instanceof Armor) {
            priceData = await this.fetchWeaponCraftingPrices(item, city);
            item.setPrice(priceData.weapon.price);
            item.updateMaterialPrices(priceData.materials);
        }
    }

    /**
     * Cambia la ciudad por defecto
     * @param {string} city - Nueva ciudad
     */
    setDefaultCity(city) {
        if (Object.values(AlbionConfig.CITIES).includes(city)) {
            this.defaultCity = city;
        } else {
            throw new Error(`Ciudad inválida: ${city}`);
        }
    }

    /**
     * Obtiene la ciudad por defecto
     * @returns {string}
     */
    getDefaultCity() {
        return this.defaultCity;
    }

    /**
     * Obtiene el mejor precio de venta del ítem en todas las ciudades y calidades (1-3)
     * en un solo request. Aplica sanity check igual que el scanner:
     *   - Black Market: usa buy_price_max
     *   - Ciudad normal: si no hay buyers activos se descarta; si sell > buyMax*2 usa buyMax
     * @param {string} itemApiName
     * @returns {Promise<{ best: {city,price,quality,qualityName}, all: Array }>}
     */
    async fetchBestItemPrice(itemApiName) {
        const cacheKey = `best|${itemApiName}`;
        const cached = this._cityPriceCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < this._CITY_CACHE_TTL) {
            return cached.data;
        }

        const cities = Object.values(AlbionConfig.CITIES).join(',');
        const url = `${this.baseURL}/${itemApiName}?locations=${cities}&qualities=1,2,3`;

        const data = await this._deduped(url, () => this._fetchWithRetry(url));

        const Q_NAMES = { 1: 'Normal', 2: 'Good', 3: 'Outstanding', 4: 'Excellent', 5: 'Masterpiece' };
        const results = [];

        for (const d of data) {
            const isBM = d.city === 'Black Market';
            let price;

            if (isBM) {
                price = d.buy_price_max || 0;
            } else {
                if (!d.buy_price_max) continue; // sin compradores activos → mercado muerto
                const sellMin = d.sell_price_min || 0;
                // sanity check: sell outlier si es más del doble del buy order
                price = (sellMin && sellMin <= d.buy_price_max * 2) ? sellMin : d.buy_price_max;
            }

            if (price <= 0) continue;

            results.push({
                city:         d.city,
                price,
                quality:      d.quality,
                qualityName:  Q_NAMES[d.quality] || `Q${d.quality}`,
                isBlackMarket: isBM,
            });
        }

        results.sort((a, b) => b.price - a.price);

        const result = { best: results[0] || null, all: results };
        this._cityPriceCache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
    }

    /**
     * Obtiene el sell_price_min del ítem en todas las ciudades para una calidad fija.
     * Usado para materiales (que siempre son calidad 1).
     * @param {string} itemApiName
     * @param {number} quality
     * @returns {Promise<Array>} [{city, price}] ordenado desc por precio
     */
    async fetchAllCityPrices(itemApiName, quality = 1) {
        const cacheKey = `${itemApiName}|${quality}`;
        const cached = this._cityPriceCache.get(cacheKey);
        if (cached && (Date.now() - cached.ts) < this._CITY_CACHE_TTL) {
            return cached.data;
        }

        const cities = Object.values(AlbionConfig.CITIES).join(',');
        const url = `${this.baseURL}/${itemApiName}?locations=${cities}&qualities=${quality}`;

        const data = await this._deduped(url, () => this._fetchWithRetry(url));
        const result = data
            .filter(d => {
                if (d.quality !== quality) return false;
                const isBM = d.city === 'Black Market';
                return isBM ? d.buy_price_max > 0 : d.sell_price_min > 0;
            })
            .map(d => {
                const isBM = d.city === 'Black Market';
                return { city: d.city, price: isBM ? d.buy_price_max : d.sell_price_min };
            })
            .sort((a, b) => a.price - b.price); // materiales: más barato primero

        this._cityPriceCache.set(cacheKey, { data: result, ts: Date.now() });
        return result;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlbionAPI;
}
