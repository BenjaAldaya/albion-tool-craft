/**
 * Clase que representa un arma (Weapon) en Albion Online
 * Armas incluyen: Dagas, Espadas, Arcos, Lanzas, etc.
 */
class Weapon extends Item {
    /**
     * @param {string} weaponType - Tipo de arma (DAGGER, DAGGER_PAIR, SWORD, etc.)
     * @param {number} tier - Tier del arma (4-8)
     * @param {number} quality - Calidad (1-5)
     * @param {number} enchantment - Nivel de encantamiento (0-4)
     */
    constructor(weaponType, tier, quality = 1, enchantment = 0) {
        const recipe = AlbionConfig.WEAPON_RECIPES[weaponType];

        if (!recipe) {
            throw new Error(`Tipo de arma inválido: ${weaponType}`);
        }

        super(recipe.name, tier, quality, enchantment);
        this.displayName = recipe.displayName;
        this.weaponType = weaponType;
        this.recipe = recipe;
        this.handType = recipe.type; // 1H o 2H

        // Inicializar materiales según la receta
        this._initializeMaterials();
    }

    /**
     * Inicializa los materiales necesarios para craftear el arma
     * @private
     */
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

    /**
     * Obtiene el nombre del item en la API de Albion
     * @returns {string}
     */
    getAPIName() {
        const apiNames = AlbionConfig.ITEM_API_NAMES[this.weaponType];

        if (!apiNames) {
            throw new Error(`No se encontró nombre de API para arma: ${this.weaponType}`);
        }

        let baseName = apiNames[this.tier];

        if (!baseName) {
            throw new Error(`Tier inválido para arma ${this.weaponType}: ${this.tier}`);
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
     * Obtiene la fama base que se gana al craftear esta arma.
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
        // Fama base de recursos × encantamiento
        const resourceFame = famePerResource * totalResources * enchantMult;
        // Fama del artefacto (también se multiplica por encantamiento)
        const artifactFame = this.recipe.artifactKey ? famePerResource * enchantMult : 0;
        return resourceFame + artifactFame;
    }

    /**
     * Verifica si el arma es de una mano
     * @returns {boolean}
     */
    isOneHanded() {
        return this.handType === '1H';
    }

    /**
     * Verifica si el arma es de dos manos
     * @returns {boolean}
     */
    isTwoHanded() {
        return this.handType === '2H';
    }

    /**
     * Actualiza los precios de los materiales
     * @param {Object} prices - Objeto con los precios {leather, bars, planks, cloth}
     */
    updateMaterialPrices(prices) {
        // prices keys are lowercase (from UI inputs): leather, bars, planks, cloth, artifact
        // material Map keys are recipe keys: LEATHER, METALBAR, PLANKS, CLOTH, artifact
        const keyMap = { leather: 'LEATHER', bars: 'METALBAR', planks: 'PLANKS', cloth: 'CLOTH', artifact: 'artifact' };
        Object.entries(keyMap).forEach(([priceKey, matKey]) => {
            if (prices[priceKey] !== undefined) {
                const mat = this.getMaterial(matKey);
                if (mat) mat.setPrice(prices[priceKey]);
            }
        });
    }

    /**
     * Convierte el arma a objeto JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            ...super.toJSON(),
            weaponType: this.weaponType,
            handType: this.handType,
            category: 'weapon'
        };
    }

    /**
     * Crea un arma desde un objeto JSON
     * @param {Object} json
     * @returns {Weapon}
     */
    static fromJSON(json) {
        const weapon = new Weapon(
            json.weaponType,
            json.tier,
            json.quality,
            json.enchantment
        );
        weapon.setPrice(json.price);

        // Restaurar precios de materiales
        json.materials.forEach(matData => {
            const material = weapon.getMaterial(matData.type);
            if (material) {
                material.setPrice(matData.price);
            }
        });

        return weapon;
    }

    /**
     * Crea una daga
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createDagger(tier, quality = 1, enchantment = 0) {
        return new Weapon('DAGGER', tier, quality, enchantment);
    }

    /**
     * Crea un par de dagas
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createDaggerPair(tier, quality = 1, enchantment = 0) {
        return new Weapon('DAGGER_PAIR', tier, quality, enchantment);
    }

    /**
     * Crea una espada
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createSword(tier, quality = 1, enchantment = 0) {
        return new Weapon('SWORD', tier, quality, enchantment);
    }

    /**
     * Crea una espada ancha
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createBroadsword(tier, quality = 1, enchantment = 0) {
        return new Weapon('BROADSWORD', tier, quality, enchantment);
    }

    /**
     * Crea un arco
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createBow(tier, quality = 1, enchantment = 0) {
        return new Weapon('BOW', tier, quality, enchantment);
    }

    /**
     * Crea una lanza
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createSpear(tier, quality = 1, enchantment = 0) {
        return new Weapon('SPEAR', tier, quality, enchantment);
    }

    /**
     * Crea una Sangradora (Bloodletter)
     * @param {number} tier
     * @param {number} quality
     * @param {number} enchantment
     * @returns {Weapon}
     */
    static createBloodletter(tier, quality = 1, enchantment = 0) {
        return new Weapon('BLOODLETTER', tier, quality, enchantment);
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Weapon;
}
