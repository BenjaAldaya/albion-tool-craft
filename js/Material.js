/**
 * Clase que representa un material en Albion Online
 */
class Material {
    /**
     * @param {string} type - Tipo de material (planks, bars, leather, cloth, artifact)
     * @param {number} tier - Tier del material (4-8)
     * @param {number} quality - Calidad del material (1-5)
     * @param {number} enchantment - Nivel de encantamiento (0-4)
     * @param {number} price - Precio del material
     * @param {string} artifactName - Nombre del artefacto (opcional, solo para type='artifact')
     */
    constructor(type, tier, quality = 1, enchantment = 0, price = 0, artifactName = null) {
        this.type = type;
        this.tier = tier;
        this.quality = quality;
        this.enchantment = enchantment;
        this.price = price;
        this.quantity = 0;
        this.artifactName = artifactName; // Para artefactos
    }

    /**
     * Obtiene el nombre del material en la API
     * @returns {string}
     */
    getAPIName() {
        let ids;

        if (this.type === 'artifact' && this.artifactName) {
            ids = AlbionConfig.ITEM_API_NAMES[this.artifactName];
            if (!ids) throw new Error(`Artefacto inválido: ${this.artifactName}`);
        } else {
            ids = AlbionConfig.ITEM_API_NAMES[this.type];
            if (!ids) throw new Error(`Tipo de material inválido: ${this.type}`);
        }

        const baseName = ids[this.tier];
        if (!baseName) throw new Error(`Tier inválido para material ${this.type}: ${this.tier}`);

        // Recursos refinados encantados usan _LEVEL{N}@{N} (ej: T5_METALBAR_LEVEL4@4)
        // Equipamiento/armas usan solo @N — eso se maneja en Weapon.getAPIName()
        return this.enchantment > 0 ? `${baseName}_LEVEL${this.enchantment}@${this.enchantment}` : baseName;
    }

    /**
     * Obtiene el nombre completo del material para mostrar
     * @returns {string}
     */
    getDisplayName() {
        const tierName = AlbionConfig.TIER_NAMES[this.tier];
        const qualityName = AlbionConfig.QUALITY_NAMES[this.quality];
        const enchantmentSuffix = this.enchantment > 0 ? `.${this.enchantment}` : '';

        let materialTypeName = this.type.charAt(0).toUpperCase() + this.type.slice(1);

        return `${tierName} ${qualityName} ${materialTypeName}${enchantmentSuffix}`;
    }

    /**
     * Calcula el costo total basado en la cantidad
     * @param {number} quantity - Cantidad de materiales
     * @returns {number}
     */
    calculateCost(quantity) {
        return this.price * quantity;
    }

    /**
     * Establece el precio del material
     * @param {number} price
     */
    setPrice(price) {
        this.price = price;
    }

    /**
     * Establece la cantidad del material
     * @param {number} quantity
     */
    setQuantity(quantity) {
        this.quantity = quantity;
    }

    /**
     * Obtiene el costo total del material
     * @returns {number}
     */
    getTotalCost() {
        return this.price * this.quantity;
    }

    /**
     * Clona el material
     * @returns {Material}
     */
    clone() {
        const cloned = new Material(
            this.type,
            this.tier,
            this.quality,
            this.enchantment,
            this.price,
            this.artifactName
        );
        cloned.quantity = this.quantity;
        return cloned;
    }

    /**
     * Convierte el material a objeto JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            type: this.type,
            tier: this.tier,
            quality: this.quality,
            enchantment: this.enchantment,
            price: this.price,
            quantity: this.quantity,
            artifactName: this.artifactName,
            apiName: this.getAPIName(),
            displayName: this.getDisplayName(),
            totalCost: this.getTotalCost()
        };
    }

    /**
     * Crea un material desde un objeto JSON
     * @param {Object} json
     * @returns {Material}
     */
    static fromJSON(json) {
        const material = new Material(
            json.type,
            json.tier,
            json.quality,
            json.enchantment,
            json.price,
            json.artifactName
        );
        material.quantity = json.quantity || 0;
        return material;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Material;
}
