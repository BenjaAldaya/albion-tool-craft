/**
 * Clase base abstracta para todos los items craftables en Albion Online
 */
class Item {
    /**
     * @param {string} name - Nombre del item
     * @param {number} tier - Tier del item (4-8)
     * @param {number} quality - Calidad del item (1-5)
     * @param {number} enchantment - Nivel de encantamiento (0-4)
     */
    constructor(name, tier, quality = 1, enchantment = 0) {
        if (this.constructor === Item) {
            throw new Error("Item es una clase abstracta y no puede ser instanciada directamente");
        }

        this.name = name;
        this.tier = tier;
        this.quality = quality;
        this.enchantment = enchantment;
        this.price = 0;
        this.materials = new Map(); // Map<string, Material>
    }

    /**
     * Método abstracto que debe ser implementado por las clases hijas
     * @returns {string}
     */
    getAPIName() {
        throw new Error("El método getAPIName() debe ser implementado por la clase hija");
    }

    /**
     * Método abstracto para obtener la receta de crafteo
     * @returns {Object}
     */
    getRecipe() {
        throw new Error("El método getRecipe() debe ser implementado por la clase hija");
    }

    /**
     * Método abstracto para obtener la fama base
     * @returns {number}
     */
    getBaseFame() {
        throw new Error("El método getBaseFame() debe ser implementado por la clase hija");
    }

    /**
     * Obtiene el nombre completo del item para mostrar
     * @returns {string}
     */
    getDisplayName() {
        const tierName = AlbionConfig.TIER_NAMES[this.tier];
        const qualityName = AlbionConfig.QUALITY_NAMES[this.quality];
        const enchantmentSuffix = this.enchantment > 0 ? `.${this.enchantment}` : '';

        const label = this.displayName || this.name;
        return `T${this.tier}${enchantmentSuffix} ${tierName} ${qualityName} ${label}`;
    }

    /**
     * Obtiene el nombre corto del item (Tier + Enchantment + Nombre)
     * @returns {string}
     */
    getShortName() {
        const enchantmentSuffix = this.enchantment > 0 ? `.${this.enchantment}` : '';
        return `T${this.tier}${enchantmentSuffix} ${this.name}`;
    }

    /**
     * Establece el precio de venta del item
     * @param {number} price
     */
    setPrice(price) {
        this.price = price;
    }

    /**
     * Obtiene el precio de venta del item
     * @returns {number}
     */
    getPrice() {
        return this.price;
    }

    /**
     * Agrega un material necesario para craftear
     * @param {Material} material
     * @param {number} quantity
     */
    addMaterial(material, quantity) {
        material.setQuantity(quantity);
        this.materials.set(material.type, material);
    }

    /**
     * Obtiene un material específico
     * @param {string} type
     * @returns {Material|undefined}
     */
    getMaterial(type) {
        return this.materials.get(type);
    }

    /**
     * Obtiene todos los materiales
     * @returns {Map<string, Material>}
     */
    getAllMaterials() {
        return this.materials;
    }

    /**
     * Calcula el costo total de materiales
     * @returns {number}
     */
    calculateMaterialsCost() {
        let totalCost = 0;
        this.materials.forEach(material => {
            totalCost += material.getTotalCost();
        });
        return totalCost;
    }

    /**
     * Simula el retorno de recursos de forma iterativa, igual a como funciona el juego.
     * El juego devuelve Math.floor(basePerItem * returnRate) materiales por CADA crafteo individual.
     * Los materiales retornados se reutilizan para seguir crafteando.
     * @param {number} basePerItem - Materiales base requeridos por item
     * @param {number} quantity - Cantidad de items a craftear
     * @param {number} returnRate - Tasa de retorno (0-1)
     * @returns {{ toBuy: number, totalReturned: number, leftover: number }}
     */
    static _simulateIterativeReturn(basePerItem, quantity, returnRate) {
        const returnedPerCraft = Math.round(basePerItem * returnRate);
        const netCostPerCraft = basePerItem - returnedPerCraft;

        let stock = 0;
        let totalBought = 0;
        let totalReturned = 0;

        for (let i = 0; i < quantity; i++) {
            // Si no tenemos suficiente stock para craftear, compramos exactamente lo que falta
            if (stock < basePerItem) {
                const needed = basePerItem - stock;
                totalBought += needed;
                stock += needed;
            }
            // Consumimos materiales para craftear
            stock -= basePerItem;
            // El juego devuelve los materiales
            stock += returnedPerCraft;
            totalReturned += returnedPerCraft;
        }

        return {
            toBuy: totalBought,
            totalReturned,
            leftover: stock  // Sobrante en mano tras completar todos los crafteos
        };
    }

    /**
     * Calcula cuántos materiales se necesitan para una cantidad específica.
     * Usa simulación iterativa para reflejar exactamente el comportamiento del juego:
     * el retorno se aplica por cada crafteo individual, y los retornados se reutilizan.
     * @param {number} quantity - Cantidad de items a craftear
     * @param {number} returnRate - Tasa de retorno de recursos (0-1)
     * @returns {Object} - Objeto con materiales necesarios y retornados
     */
    calculateMaterialsNeeded(quantity, returnRate = 0) {
        const result = {
            toBuy: new Map(),
            needed: new Map(),
            returned: new Map(),
            excess: new Map()
        };

        this.materials.forEach((material, type) => {
            const baseQuantity = material.quantity;
            const totalNeeded = baseQuantity * quantity;

            let toBuy, returned, leftover;

            // Los artefactos y la Energía Avaloniana NO tienen retorno de recursos
            if (type === 'artifact' || type === 'AVALONIANENERGY') {
                toBuy = totalNeeded;
                returned = 0;
                leftover = 0;
            } else {
                // Simulación iterativa: reproduce exactamente el ciclo del juego
                const sim = Item._simulateIterativeReturn(baseQuantity, quantity, returnRate);
                toBuy = sim.toBuy;
                returned = sim.totalReturned;
                leftover = sim.leftover;
            }

            // Crear copias de los materiales con las cantidades correctas
            const materialToBuy = material.clone();
            materialToBuy.setQuantity(toBuy);
            result.toBuy.set(type, materialToBuy);

            const materialNeeded = material.clone();
            materialNeeded.setQuantity(totalNeeded);
            result.needed.set(type, materialNeeded);

            const materialReturned = material.clone();
            materialReturned.setQuantity(returned);
            result.returned.set(type, materialReturned);

            // El sobrante al final es el exceso real (materiales no consumidos)
            const materialExcess = material.clone();
            materialExcess.setQuantity(leftover);
            result.excess.set(type, materialExcess);
        });

        return result;
    }

    /**
     * Convierte el item a objeto JSON
     * @returns {Object}
     */
    toJSON() {
        const materialsArray = [];
        this.materials.forEach(material => {
            materialsArray.push(material.toJSON());
        });

        return {
            name: this.name,
            tier: this.tier,
            quality: this.quality,
            enchantment: this.enchantment,
            price: this.price,
            displayName: this.getDisplayName(),
            shortName: this.getShortName(),
            apiName: this.getAPIName(),
            baseFame: this.getBaseFame(),
            materials: materialsArray
        };
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Item;
}
