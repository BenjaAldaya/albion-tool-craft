/**
 * Clase para interactuar con la API de Albion Online Data Project
 */
class AlbionAPI {
    constructor() {
        const savedServer = localStorage.getItem('albionServer') || 'AMERICAS';
        this.baseURL = AlbionConfig.API_URLS[savedServer] || AlbionConfig.API_URLS.AMERICAS;
        this.defaultCity = AlbionConfig.CITIES.CAERLEON;
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

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
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
            const existing = prices[itemId];
            // El API devuelve una entry por cada calidad (1-5).
            // Solo sobreescribir si: no hay entry existente, o la existente
            // tiene precio 0 y esta tiene precio real.
            if (!existing || (existing.sellPriceMin === 0 && item.sell_price_min > 0)) {
                prices[itemId] = {
                    sellPriceMin: item.sell_price_min || 0,
                    sellPriceMax: item.sell_price_max || 0,
                    buyPriceMin: item.buy_price_min || 0,
                    buyPriceMax: item.buy_price_max || 0,
                    city: item.city,
                    quality: item.quality,
                    lastUpdate: item.sell_price_min_date
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
     * Obtiene el precio de venta del ítem en todas las ciudades
     * @param {string} itemApiName - Nombre del ítem en la API
     * @param {number} quality - Calidad (1-5)
     * @returns {Promise<Array>} [{city, price}] ordenado desc por precio
     */
    async fetchAllCityPrices(itemApiName, quality = 1) {
        const cities = Object.values(AlbionConfig.CITIES).join(',');
        const url = `${this.baseURL}/${itemApiName}?locations=${cities}&qualities=${quality}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data
            .filter(d => d.quality === quality && d.sell_price_min > 0)
            .map(d => ({ city: d.city, price: d.sell_price_min }))
            .sort((a, b) => b.price - a.price);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlbionAPI;
}
