/**
 * Clase para calcular profit y análisis de crafteo en Albion Online
 */
class CraftingCalculator {
    /**
     * @param {Item} item - Item a craftear
     * @param {number} quantity - Cantidad a craftear
     * @param {number} returnRate - Tasa de retorno de recursos (0-1)
     * @param {number} taxRate - Impuesto por item crafteado
     */
    constructor(item, quantity = 1, returnRate = 0.48, taxRate = 350) {
        this.item = item;
        this.quantity = quantity;
        this.returnRate = returnRate;
        this.taxRate = taxRate;
        this.journalManager = null;
    }

    /**
     * Establece el journal manager
     * @param {JournalManager} journalManager
     */
    setJournalManager(journalManager) {
        this.journalManager = journalManager;
    }

    /**
     * Establece la cantidad a craftear
     * @param {number} quantity
     */
    setQuantity(quantity) {
        this.quantity = quantity;
    }

    /**
     * Establece la tasa de retorno
     * @param {number} returnRate - Valor entre 0 y 1
     */
    setReturnRate(returnRate) {
        if (returnRate < 0 || returnRate > 1) {
            throw new Error('La tasa de retorno debe estar entre 0 y 1');
        }
        this.returnRate = returnRate;
    }

    /**
     * Establece el impuesto
     * @param {number} taxRate
     */
    setTaxRate(taxRate) {
        this.taxRate = taxRate;
    }

    /**
     * Calcula los materiales necesarios
     * @returns {Object}
     */
    calculateMaterials() {
        return this.item.calculateMaterialsNeeded(this.quantity, this.returnRate);
    }

    /**
     * Calcula el costo total de materiales
     * @returns {number}
     */
    calculateMaterialsCost() {
        const materials = this.calculateMaterials();
        let totalCost = 0;

        materials.toBuy.forEach(material => {
            totalCost += material.getTotalCost();
        });

        return totalCost;
    }

    /**
     * Calcula el valor de los materiales sobrantes
     * @returns {number}
     */
    calculateExcessValue() {
        const materials = this.calculateMaterials();
        let excessValue = 0;

        materials.excess.forEach(material => {
            excessValue += material.getTotalCost();
        });

        return excessValue;
    }

    /**
     * Calcula el costo total de impuestos
     * @returns {number}
     */
    calculateTotalTax() {
        return this.taxRate * this.quantity;
    }

    /**
     * Calcula el costo total de inversión
     * @returns {number}
     */
    calculateTotalCost() {
        const materialsCost = this.calculateMaterialsCost();
        const totalTax = this.calculateTotalTax();
        return materialsCost + totalTax;
    }

    /**
     * Calcula los ingresos por venta de items
     * @returns {number}
     */
    calculateSaleRevenue() {
        return this.item.getPrice() * this.quantity;
    }

    /**
     * Calcula el análisis de journals
     * @returns {Object|null}
     */
    calculateJournalAnalysis() {
        if (!this.journalManager) {
            return null;
        }

        const totalFame = JournalManager.calculateTotalFame(this.item, this.quantity);
        return this.journalManager.calculateJournalAnalysis(totalFame);
    }

    /**
     * Calcula los ingresos totales
     * @returns {number}
     */
    calculateTotalRevenue() {
        const saleRevenue = this.calculateSaleRevenue();
        const excessValue = this.calculateExcessValue();
        const journalAnalysis = this.calculateJournalAnalysis();
        const journalProfit = journalAnalysis ? journalAnalysis.profit : 0;

        return saleRevenue + excessValue + journalProfit;
    }

    /**
     * Calcula el profit final
     * @returns {number}
     */
    calculateFinalProfit() {
        const totalRevenue = this.calculateTotalRevenue();
        const totalCost = this.calculateTotalCost();
        return totalRevenue - totalCost;
    }

    /**
     * Calcula el porcentaje de ganancia
     * @returns {number}
     */
    calculateProfitPercentage() {
        const totalCost = this.calculateTotalCost();
        const finalProfit = this.calculateFinalProfit();

        if (totalCost === 0) {
            return 0;
        }

        return (finalProfit / totalCost) * 100;
    }

    /**
     * Calcula el costo por item
     * @returns {number}
     */
    calculateCostPerItem() {
        const totalCost = this.calculateTotalCost();
        const journalAnalysis = this.calculateJournalAnalysis();
        const journalProfit = journalAnalysis ? journalAnalysis.profit : 0;

        // El profit de journals reduce el costo efectivo
        const effectiveCost = totalCost - journalProfit;

        return effectiveCost / this.quantity;
    }

    /**
     * Calcula el margen por item
     * @returns {number}
     */
    calculateMarginPerItem() {
        const costPerItem = this.calculateCostPerItem();
        const sellPrice = this.item.getPrice();
        return sellPrice - costPerItem;
    }

    /**
     * Genera un análisis completo de rentabilidad
     * @returns {Object}
     */
    generateFullAnalysis() {
        const materials = this.calculateMaterials();
        const materialsCost = this.calculateMaterialsCost();
        const totalTax = this.calculateTotalTax();
        const totalCost = this.calculateTotalCost();
        const saleRevenue = this.calculateSaleRevenue();
        const excessValue = this.calculateExcessValue();
        const journalAnalysis = this.calculateJournalAnalysis();
        const totalRevenue = this.calculateTotalRevenue();
        const finalProfit = this.calculateFinalProfit();
        const profitPercentage = this.calculateProfitPercentage();
        const costPerItem = this.calculateCostPerItem();
        const marginPerItem = this.calculateMarginPerItem();

        // Convertir materiales a formato serializable
        const materialsData = {
            toBuy: {},
            needed: {},
            returned: {},
            excess: {}
        };

        ['toBuy', 'needed', 'returned', 'excess'].forEach(key => {
            materials[key].forEach((material, type) => {
                materialsData[key][type] = material.toJSON();
            });
        });

        return {
            item: this.item.toJSON(),
            configuration: {
                quantity: this.quantity,
                returnRate: this.returnRate,
                returnRatePercentage: (this.returnRate * 100).toFixed(0),
                taxRate: this.taxRate
            },
            materials: materialsData,
            costs: {
                materialsCost,
                totalTax,
                totalCost,
                costPerItem
            },
            revenue: {
                saleRevenue,
                excessValue,
                journalProfit: journalAnalysis ? journalAnalysis.profit : 0,
                totalRevenue
            },
            journals: journalAnalysis,
            profit: {
                finalProfit,
                profitPercentage,
                marginPerItem,
                isProfitable: finalProfit > 0
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Verifica si el crafteo es rentable
     * @returns {boolean}
     */
    isProfitable() {
        return this.calculateFinalProfit() > 0;
    }

    /**
     * Obtiene recomendaciones basadas en el análisis
     * @returns {Array<string>}
     */
    getRecommendations() {
        const recommendations = [];
        const profitPercentage = this.calculateProfitPercentage();
        const marginPerItem = this.calculateMarginPerItem();

        if (profitPercentage < 0) {
            recommendations.push("⚠️ Este crafteo no es rentable. Considera aumentar el precio de venta o buscar materiales más baratos.");
        } else if (profitPercentage < 10) {
            recommendations.push("⚠️ El margen de ganancia es muy bajo (< 10%). El riesgo puede no valer la pena.");
        } else if (profitPercentage > 50) {
            recommendations.push("✅ ¡Excelente margen de ganancia! Este es un crafteo muy rentable.");
        }

        if (marginPerItem < 1000) {
            recommendations.push("💡 El margen por item es bajo. Considera craftear en mayor cantidad para mejor profit total.");
        }

        const journalAnalysis = this.calculateJournalAnalysis();
        if (journalAnalysis && journalAnalysis.profit > 0) {
            const journalContribution = (journalAnalysis.profit / this.calculateTotalRevenue()) * 100;
            if (journalContribution > 30) {
                recommendations.push(`📚 Los journals aportan ${journalContribution.toFixed(0)}% del profit total. ¡No olvides usarlos!`);
            }
        }

        return recommendations;
    }

    /**
     * Convierte el calculador a JSON
     * @returns {Object}
     */
    toJSON() {
        return this.generateFullAnalysis();
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CraftingCalculator;
}
