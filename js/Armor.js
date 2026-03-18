/**
 * Clase que representa una pieza de armadura en Albion Online.
 * Cubre: armaduras de pecho, cascos, botas y offhands (escudos, libros, antorchas).
 */
class Armor extends Item {
    /**
     * @param {string} armorType - ID de la pieza (ej: "ARMOR_PLATE_SET1", "HEAD_CLOTH_SET2")
     * @param {number} tier       - Tier (4-8)
     * @param {number} quality    - Calidad (1-5)
     * @param {number} enchantment - Nivel de encantamiento (0-4)
     */
    constructor(armorType, tier, quality = 1, enchantment = 0) {
        const recipe = AlbionConfig.ARMOR_RECIPES[armorType];

        if (!recipe) {
            throw new Error(`Tipo de armadura inválido: ${armorType}`);
        }

        super(recipe.name, tier, quality, enchantment);
        this.armorType  = armorType;
        this.recipe     = recipe;
        this.slotType   = recipe.type; // 'armor' | 'head' | 'shoes' | 'offhand'

        this._initializeMaterials();
    }

    _initializeMaterials() {
        const mats = this.recipe.materials;
        Object.entries(mats).forEach(([matKey, qty]) => {
            if (matKey === 'artifact') {
                if (this.recipe.artifactKey) {
                    const artifact = new Material('artifact', this.tier, this.quality, 0, 0, this.recipe.artifactKey);
                    this.addMaterial(artifact, qty);
                }
            } else {
                const mat = new Material(matKey, this.tier, 1, this.enchantment);
                this.addMaterial(mat, qty);
            }
        });
    }

    getAPIName() {
        const apiNames = AlbionConfig.ITEM_API_NAMES[this.armorType];

        if (!apiNames) {
            throw new Error(`No se encontró nombre de API para armadura: ${this.armorType}`);
        }

        let baseName = apiNames[this.tier];

        if (!baseName) {
            throw new Error(`Tier inválido para armadura ${this.armorType}: ${this.tier}`);
        }

        if (this.enchantment > 0) {
            baseName += `@${this.enchantment}`;
        }

        return baseName;
    }

    getRecipe() {
        return this.recipe;
    }

    getBaseFame() {
        const famePerResource = AlbionConfig.FAME_PER_RESOURCE[this.tier] || 0;
        const enchantMult     = AlbionConfig.ENCHANTMENT_FAME_MULTIPLIER[this.enchantment] || 1;
        let totalResources = 0;
        Object.entries(this.recipe.materials).forEach(([key, qty]) => {
            if (key !== 'artifact') totalResources += qty;
        });
        const resourceFame = famePerResource * totalResources * enchantMult;
        const artifactFame = this.recipe.artifactKey ? famePerResource * enchantMult : 0;
        return resourceFame + artifactFame;
    }

    updateMaterialPrices(prices) {
        // prices: { leather, bars, planks, cloth, artifact }
        const keyMap = { leather: 'LEATHER', bars: 'METALBAR', planks: 'PLANKS', cloth: 'CLOTH', artifact: 'artifact' };
        Object.entries(keyMap).forEach(([priceKey, matKey]) => {
            if (prices[priceKey] !== undefined) {
                const mat = this.getMaterial(matKey);
                if (mat) mat.setPrice(prices[priceKey]);
            }
        });
    }

    toJSON() {
        return {
            ...super.toJSON(),
            armorType: this.armorType,
            slotType:  this.slotType,
            category:  'armor'
        };
    }

    static fromJSON(json) {
        const armor = new Armor(json.armorType, json.tier, json.quality, json.enchantment);
        armor.setPrice(json.price);
        json.materials.forEach(matData => {
            const material = armor.getMaterial(matData.type);
            if (material) material.setPrice(matData.price);
        });
        return armor;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Armor;
}
