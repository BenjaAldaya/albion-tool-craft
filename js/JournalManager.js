/**
 * Clase para gestionar journals y cálculos de fama en Albion Online
 */
class JournalManager {
    /**
     * @param {number} tier - Tier del journal (2-8)
     */
    constructor(tier) {
        this.tier = tier;
        this.buyPrice = 0;
        this.sellPrice = 0;
    }

    /**
     * Establece el precio de compra del journal vacío
     * @param {number} price
     */
    setBuyPrice(price) {
        this.buyPrice = price;
    }

    /**
     * Establece el precio de venta del journal lleno
     * @param {number} price
     */
    setSellPrice(price) {
        this.sellPrice = price;
    }

    /**
     * Obtiene la fama requerida para llenar un journal de este tier
     * @returns {number}
     */
    getFameRequired() {
        return AlbionConfig.JOURNAL_FAME_REQUIRED[this.tier] || 0;
    }

    /**
     * Calcula cuántos journals se pueden llenar con la fama dada
     * @param {number} totalFame - Fama total generada
     * @returns {Object} - {complete: número de journals completos, partial: porcentaje del siguiente journal}
     */
    calculateJournalsFilled(totalFame) {
        const fameRequired = this.getFameRequired();

        if (fameRequired === 0) {
            return { complete: 0, partial: 0, leftoverFame: 0 };
        }

        const complete = Math.floor(totalFame / fameRequired);
        const leftoverFame = totalFame % fameRequired;
        const partial = (leftoverFame / fameRequired) * 100;

        return {
            complete,
            partial,
            leftoverFame
        };
    }

    /**
     * Calcula el profit de vender journals
     * @param {number} journalsFilled - Número de journals completos
     * @returns {number}
     */
    calculateProfit(journalsFilled) {
        if (journalsFilled === 0 || this.buyPrice === 0 || this.sellPrice === 0) {
            return 0;
        }

        const profit = journalsFilled * (this.sellPrice - this.buyPrice);
        return profit;
    }

    /**
     * Calcula el análisis completo de journals
     * @param {number} totalFame - Fama total generada
     * @returns {Object}
     */
    calculateJournalAnalysis(totalFame) {
        const journalsData = this.calculateJournalsFilled(totalFame);
        const profit = this.calculateProfit(journalsData.complete);
        const costOfJournals = journalsData.complete * this.buyPrice;
        const revenueFromJournals = journalsData.complete * this.sellPrice;

        return {
            tier: this.tier,
            fameRequired: this.getFameRequired(),
            totalFame,
            journalsComplete: journalsData.complete,
            journalsPartial: journalsData.partial.toFixed(1),
            leftoverFame: journalsData.leftoverFame,
            buyPrice: this.buyPrice,
            sellPrice: this.sellPrice,
            costOfJournals,
            revenueFromJournals,
            profit,
            profitPerJournal: journalsData.complete > 0 ? profit / journalsData.complete : 0
        };
    }

    /**
     * Calcula la fama total que se generará al craftear items
     * @param {Item} item - Item a craftear
     * @param {number} quantity - Cantidad a craftear
     * @returns {number}
     */
    static calculateTotalFame(item, quantity) {
        const baseFame = item.getBaseFame();
        return baseFame * quantity;
    }

    /**
     * Obtiene el nombre del journal
     * @returns {string}
     */
    getJournalName() {
        const tierName = AlbionConfig.TIER_NAMES[this.tier];
        return `T${this.tier} ${tierName} Journal`;
    }

    /**
     * Convierte el journal manager a objeto JSON
     * @returns {Object}
     */
    toJSON() {
        return {
            tier: this.tier,
            buyPrice: this.buyPrice,
            sellPrice: this.sellPrice,
            fameRequired: this.getFameRequired(),
            journalName: this.getJournalName()
        };
    }

    /**
     * Crea un journal manager desde un objeto JSON
     * @param {Object} json
     * @returns {JournalManager}
     */
    static fromJSON(json) {
        const manager = new JournalManager(json.tier);
        manager.setBuyPrice(json.buyPrice);
        manager.setSellPrice(json.sellPrice);
        return manager;
    }

    /**
     * Calcula el tier óptimo de journal para un item
     * @param {Item} item
     * @returns {number}
     */
    static getOptimalJournalTier(item) {
        // El tier del journal generalmente coincide con el tier del item
        // Pero puede variar según la estrategia del jugador
        return item.tier;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JournalManager;
}
