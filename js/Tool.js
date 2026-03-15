/**
 * Clase que representa una herramienta (Tool) en Albion Online
 * Herramientas incluyen: Picos, Hachas, Hoces, Cuchillos de desollar, Martillos
 */
class Tool extends Item {
    /**
     * @param {string} toolType - Tipo de herramienta (PICKAXE, AXE, SICKLE, etc.)
     * @param {number} tier - Tier de la herramienta (4-8)
     * @param {number} quality - Calidad (1-5)
     * @param {number} enchantment - Nivel de encantamiento (0-4)
     */
    constructor(toolType, tier, quality = 1, enchantment = 0) {
        const recipe = AlbionConfig.TOOL_RECIPES[toolType];

        if (!recipe) {
            throw new Error(`Tipo de herramienta inválido: ${toolType}`);
        }

        super(recipe.name, tier, quality, enchantment);
        this.toolType = toolType;
        this.recipe = recipe;

        // Inicializar materiales según la receta
        this._initializeMaterials();
    }

    /**
     * Inicializa los materiales necesarios para craftear la herramienta
     * @private
     */
    _initializeMaterials() {
        const mats = this.recipe.materials;
        Object.entries(mats).forEach(([matKey, qty]) => {
            const mat = new Material(matKey, this.tier, 1, 0);
            this.addMaterial(mat, qty);
        });
    }

    /**
     * Obtiene el nombre del item en la API de Albion
     * @returns {string}
     */
    getAPIName() {
        const apiNames = AlbionConfig.ITEM_API_NAMES[this.toolType];

        if (!apiNames) {
            throw new Error(`No se encontró nombre de API para herramienta: ${this.toolType}`);
        }

        let baseName = apiNames[this.tier];

        if (!baseName) {
            throw new Error(`Tier inválido para herramienta ${this.toolType}: ${this.tier}`);
        }

        // Agregar encantamiento si existe
        if (this.enchantment > 0) {
            baseName += `@${this.enchantment}`;
        }

        return baseName;
    }

    /**
     * Obtiene la receta de crafteo
     * @returns {Object}
     */
    getRecipe() {
        return this.recipe;
    }

    /**
     * Obtiene la fama base que se gana al craftear esta herramienta.
     * El encantamiento multiplica la fama: .0=x1, .1=x2, .2=x4, .3=x8, .4=x16
     * @returns {number}
     */
    getBaseFame() {
        const famePerResource = AlbionConfig.FAME_PER_RESOURCE[this.tier] || 0;
        const enchantMult = AlbionConfig.ENCHANTMENT_FAME_MULTIPLIER[this.enchantment] || 1;
        let totalResources = 0;
        Object.entries(this.recipe.materials).forEach(([key, qty]) => {
            if (key !== 'artifact') totalResources += qty;
        });
        return famePerResource * totalResources * enchantMult;
    }

    /**
     * Actualiza los precios de los materiales
     * @param {number} planksPrice - Precio de la madera
     * @param {number} barsPrice - Precio de los lingotes
     */
    updateMaterialPrices(planksPrice, barsPrice) {
        const planks = this.getMaterial('PLANKS');
        if (planks) planks.setPrice(planksPrice);

        const bars = this.getMaterial('METALBAR');
        if (bars) bars.setPrice(barsPrice);
    }

    /**
     * Convierte la herramienta a objeto JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            ...super.toJSON(),
            toolType: this.toolType,
            category: 'tool'
        };
    }

    /**
     * Crea una herramienta desde un objeto JSON
     * @param {Object} json
     * @returns {Tool}
     */
    static fromJSON(json) {
        const tool = new Tool(
            json.toolType,
            json.tier,
            json.quality,
            json.enchantment
        );
        tool.setPrice(json.price);

        // Restaurar precios de materiales
        json.materials.forEach(matData => {
            const material = tool.getMaterial(matData.type);
            if (material) {
                material.setPrice(matData.price);
            }
        });

        return tool;
    }

    /**
     * Crea un pico
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Tool}
     */
    static createPickaxe(tier, quality = 1, enchantment = 0) {
        return new Tool('PICKAXE', tier, quality, enchantment);
    }

    /**
     * Crea un hacha
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Tool}
     */
    static createAxe(tier, quality = 1, enchantment = 0) {
        return new Tool('AXE', tier, quality, enchantment);
    }

    /**
     * Crea una hoz
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Tool}
     */
    static createSickle(tier, quality = 1, enchantment = 0) {
        return new Tool('SICKLE', tier, quality, enchantment);
    }

    /**
     * Crea un cuchillo de desollar
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Tool}
     */
    static createSkinningKnife(tier, quality = 1, enchantment = 0) {
        return new Tool('SKINNING_KNIFE', tier, quality, enchantment);
    }

    /**
     * Crea un martillo
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Tool}
     */
    static createHammer(tier, quality = 1, enchantment = 0) {
        return new Tool('HAMMER', tier, quality, enchantment);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tool;
}
