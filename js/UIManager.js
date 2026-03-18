/**
 * Clase para gestionar la interfaz de usuario
 */
class UIManager {
    constructor() {
        this.currentCalculator = null;
        this.currentItem = null;
        this.api = new AlbionAPI();
        this.sessionManager = new SessionManager();
    }

    /**
     * Inicializa la interfaz de usuario
     */
    initialize() {
        this._setupEventListeners();
        this._loadSavedConfiguration();
    }

    /**
     * Configura los event listeners
     * @private
     */
    _setupEventListeners() {
        // Evento de cálculo
        const calculateBtn = document.getElementById('calculate');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculate());
        }

        // Evento de carga de precios desde API
        const loadPricesBtn = document.getElementById('loadPricesBtn');
        if (loadPricesBtn) {
            loadPricesBtn.addEventListener('click', () => this.loadPricesFromAPI());
        }

        // Evento de guardar sesión
        const saveSessionBtn = document.getElementById('saveSessionFromResult');
        if (saveSessionBtn) {
            saveSessionBtn.addEventListener('click', () => this.saveCurrentSession());
        }

        // Auto-calcular cuando cambien valores
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.currentCalculator) {
                    this.calculate();
                }
            });
        });
    }

    /**
     * Carga la configuración guardada
     * @private
     */
    _loadSavedConfiguration() {
        // Implementar si se desea cargar última configuración
    }

    /**
     * Obtiene los valores del formulario
     * @returns {Object}
     */
    getFormValues() {
        const premium = document.getElementById('premiumToggle')?.checked ?? true;
        const sellOrderTax = document.getElementById('sellOrderTaxToggle')?.checked ?? true;
        const buyOrderTax = document.getElementById('buyOrderTaxToggle')?.checked ?? false;
        // Premium: 4% + 2.5% setup = 6.5% | No-premium: 8% + 2.5% = 10.5%
        const sellTaxRate = sellOrderTax ? (premium ? 0.065 : 0.105) : 0;
        const buyOrderFee = buyOrderTax ? 0.025 : 0;

        return {
            itemType: document.getElementById('itemType')?.value || 'PICKAXE',
            tier: parseInt(document.getElementById('tier')?.value) || 4,
            quality: parseInt(document.getElementById('quality')?.value) || 1,
            enchantment: parseInt(document.getElementById('enchantment')?.value) || 0,
            quantity: parseInt(document.getElementById('quantity')?.value) || 1,
            returnRate: parseFloat(document.getElementById('returnRate')?.value) / 100 || 0.48,
            taxRate: parseFloat(document.getElementById('taxRate')?.value) || 350,
            journalBuyPrice: parseFloat(document.getElementById('journalBuyPrice')?.value) || 0,
            journalSellPrice: parseFloat(document.getElementById('journalSellPrice')?.value) || 0,
            city: document.getElementById('citySelector')?.value || 'Caerleon',
            premium,
            sellTaxRate,
            buyOrderFee
        };
    }

    /**
     * Obtiene los precios de materiales del formulario
     * @returns {Object}
     */
    getMaterialPrices() {
        return {
            planks: parseFloat(document.getElementById('planksPrice')?.value) || 0,
            bars: parseFloat(document.getElementById('barsPrice')?.value) || 0,
            leather: parseFloat(document.getElementById('leatherPrice')?.value) || 0,
            cloth: parseFloat(document.getElementById('clothPrice')?.value) || 0,
            artifact: parseFloat(document.getElementById('artifactPrice')?.value) || 0,
            energy: parseFloat(document.getElementById('energyPrice')?.value) || 0,
            itemPrice: parseFloat(document.getElementById('itemPrice')?.value) || 0
        };
    }

    /**
     * Crea el item según la configuración
     * @param {Object} config
     * @returns {Item}
     */
    createItem(config) {
        const { itemType, tier, quality, enchantment } = config;

        if (AlbionConfig.TOOL_RECIPES[itemType]) {
            return new Tool(itemType, tier, quality, enchantment);
        } else if (AlbionConfig.WEAPON_RECIPES[itemType]) {
            return new Weapon(itemType, tier, quality, enchantment);
        } else if (AlbionConfig.ARMOR_RECIPES[itemType]) {
            return new Armor(itemType, tier, quality, enchantment);
        } else {
            throw new Error(`Tipo de item desconocido: ${itemType}`);
        }
    }

    /**
     * Actualiza los precios del item
     * @param {Item} item
     * @param {Object} prices
     */
    updateItemPrices(item, prices) {
        item.setPrice(prices.itemPrice);

        item.updateMaterialPrices(prices);
    }

    /**
     * Realiza el cálculo de profit
     */
    calculate() {
        try {
            const config = this.getFormValues();
            const prices = this.getMaterialPrices();

            // Validar que se hayan ingresado precios
            if (prices.itemPrice === 0) {
                this.hideResults();
                return;
            }

            // Crear item
            this.currentItem = this.createItem(config);
            this.updateItemPrices(this.currentItem, prices);

            // Crear calculador
            this.currentCalculator = new CraftingCalculator(
                this.currentItem,
                config.quantity,
                config.returnRate,
                config.taxRate,
                {
                    sellTaxRate: config.sellTaxRate,
                    buyOrderFee: config.buyOrderFee,
                    premiumFame: config.premium
                }
            );

            // Configurar journal manager si hay precios
            if (config.journalBuyPrice > 0 && config.journalSellPrice > 0) {
                const journalManager = new JournalManager(config.tier);
                journalManager.setBuyPrice(config.journalBuyPrice);
                journalManager.setSellPrice(config.journalSellPrice);
                this.currentCalculator.setJournalManager(journalManager);
            }

            // Generar análisis
            const analysis = this.currentCalculator.generateFullAnalysis();

            // Mostrar resultados
            this.displayResults(analysis);

            // Guardar precios en cache para reutilizar en otros items del mismo tier/enchant/ciudad
            if (typeof savePriceCache === 'function') savePriceCache();

        } catch (error) {
            console.error('Error al calcular:', error);
            this.showToast('❌ Error', error.message);
        }
    }

    /**
     * Muestra los resultados en la interfaz
     * @param {Object} analysis
     */
    displayResults(analysis) {
        // Mostrar sección de resultados
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }

        // Actualizar información del item
        this._updateItemInfo(analysis.item);

        // Actualizar materiales
        this._updateMaterialsInfo(analysis.materials, analysis.configuration);

        // Actualizar costos
        this._updateCostsInfo(analysis.costs);

        // Actualizar ingresos
        this._updateRevenueInfo(analysis.revenue);

        // Actualizar journals
        if (analysis.journals) {
            this._updateJournalsInfo(analysis.journals);
        }

        // Actualizar profit final
        this._updateProfitInfo(analysis.profit);

        // Mostrar recomendaciones
        const recommendations = this.currentCalculator.getRecommendations();
        this._displayRecommendations(recommendations);
    }

    /**
     * Actualiza la información del item
     * @param {Object} itemData
     * @private
     */
    _updateItemInfo(itemData) {
        const itemNameEl = document.getElementById('itemName');
        if (itemNameEl) {
            itemNameEl.textContent = itemData.displayName;
        }
    }

    /**
     * Actualiza la información de materiales
     * @param {Object} materials
     * @param {Object} config
     * @private
     */
    _updateMaterialsInfo(materials, config) {
        const RENDER_URL = 'https://render.albiononline.com/v1/item';
        const MAT_META = {
            LEATHER:          { name: 'Cuero',     icon: 'bi-egg' },
            METALBAR:         { name: 'Lingotes',  icon: 'bi-tools' },
            PLANKS:           { name: 'Madera',    icon: 'bi-tree-fill' },
            CLOTH:            { name: 'Tela',      icon: 'bi-layers-fill' },
            AVALONIANENERGY:  { name: 'Energía',   icon: 'bi-lightning-fill' },
            artifact:         { name: 'Artefacto', icon: 'bi-gem' }
        };

        const container = document.getElementById('shoppingList');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(materials.toBuy).forEach(([type, material]) => {
            if (material.quantity <= 0) return;

            const meta = MAT_META[type] || { name: type, icon: 'bi-box-fill' };
            const enchSuffix = material.enchantment > 0 ? `.${material.enchantment}` : '';
            const label = `T${material.tier}${enchSuffix} ${meta.name}`;
            // El render usa _LEVEL{N}, el API de precios usa @{N} — convertir
            const renderName = material.apiName.replace(/@(\d)$/, '_LEVEL$1');
            const imgSrc = `${RENDER_URL}/${renderName}.png?quality=1&size=80`;
            const unitPrice = material.price > 0 ? material.price.toLocaleString() : '—';
            const totalCost = material.price > 0
                ? (material.price * material.quantity).toLocaleString() + ' <i class="bi bi-coin" style="font-size:0.8em;"></i>'
                : 'Sin precio';

            const row = document.createElement('tr');
            row.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.06);';
            row.innerHTML = `
                <td style="padding:7px 8px;width:32px;">
                    <img src="${imgSrc}" width="28" height="28"
                         style="image-rendering:pixelated;border-radius:4px;display:block;"
                         onerror="this.style.display='none'">
                </td>
                <td style="padding:7px 8px;">
                    <span style="color:#f0c040;font-size:0.88rem;font-weight:600;">${meta.name}</span>
                    <span style="color:rgba(255,255,255,0.45);font-size:0.75rem;margin-left:5px;">${label}</span>
                </td>
                <td style="padding:7px 8px;text-align:right;font-weight:700;color:#f0c040;font-size:0.95rem;">${material.quantity.toLocaleString()}</td>
                <td style="padding:7px 8px;text-align:right;color:rgba(255,255,255,0.7);font-size:0.82rem;">${unitPrice}</td>
                <td style="padding:7px 8px;text-align:right;font-weight:600;color:#a0d080;font-size:0.85rem;">${totalCost}</td>`;
            container.appendChild(row);
        });

        if (container.children.length === 0) {
            container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:12px;color:rgba(255,255,255,0.4);font-size:0.85rem;">Sin materiales</td></tr>';
        }

        // Mostrar sobrante estimado tras completar todos los crafteos
        const excessContainer = document.getElementById('excessInfo');
        if (!excessContainer || !materials.excess || !materials.needed) return;

        const excessParts = [];
        let canCraftOneMore = true;

        Object.entries(materials.excess).forEach(([type, mat]) => {
            if (mat.quantity <= 0) return;
            const meta = MAT_META[type] || { name: type, icon: 'bi-box-fill' };
            const neededMat = materials.needed[type];
            const basePerItem = neededMat ? neededMat.quantity / config.quantity : Infinity;
            const enough = mat.quantity >= basePerItem;
            if (!enough) canCraftOneMore = false;
            excessParts.push(`${mat.quantity.toLocaleString()} ${meta.name}`);
        });

        if (excessParts.length > 0) {
            const icon = canCraftOneMore
                ? '<i class="bi bi-check-circle-fill text-success"></i>'
                : '<i class="bi bi-info-circle-fill text-info"></i>';
            const msg = canCraftOneMore
                ? 'El sobrante alcanza para <strong>1 crafteo más</strong>'
                : 'El sobrante <strong>no alcanza</strong> para otro crafteo';
            excessContainer.innerHTML = `
                <span class="text-muted small">${icon} Sobrante estimado: ${excessParts.join(', ')} — ${msg}</span>`;
            excessContainer.style.display = '';
        } else {
            excessContainer.style.display = 'none';
        }
    }

    /**
     * Actualiza la información de costos
     * @param {Object} costs
     * @private
     */
    _updateCostsInfo(costs) {
        const coin = ' <i class="bi bi-coin" style="font-size:0.85em;"></i>';
        this._updateElementHTML('totalCost', costs.totalCost.toLocaleString() + coin);
        this._updateElementHTML('totalTax', costs.totalTax.toLocaleString() + coin);
        this._updateElementHTML('costPerItem', costs.costPerItem.toFixed(0) + coin);
    }

    /**
     * Actualiza la información de ingresos
     * @param {Object} revenue
     * @private
     */
    _updateRevenueInfo(revenue) {
        const coin = ' <i class="bi bi-coin" style="font-size:0.85em;"></i>';
        this._updateElementHTML('saleRevenue', revenue.saleRevenue.toLocaleString() + coin);
        this._updateElementHTML('excessValue', revenue.excessValue.toLocaleString() + coin);
        this._updateElementHTML('totalRevenue', revenue.totalRevenue.toLocaleString() + coin);
    }

    /**
     * Actualiza la información de journals
     * @param {Object} journals
     * @private
     */
    _updateJournalsInfo(journals) {
        this._updateElement('baseFame', journals.totalFame.toLocaleString());
        this._updateElement('journalsFilled',
            `${journals.journalsComplete.toLocaleString()} (+${journals.journalsPartial}%)`);
        this._updateElementHTML('journalsProfit', journals.profit.toLocaleString() + ' <i class="bi bi-coin" style="font-size:0.85em;"></i>');
    }

    /**
     * Actualiza la información de profit
     * @param {Object} profit
     * @private
     */
    _updateProfitInfo(profit) {
        const finalProfitEl = document.getElementById('finalProfit');
        const profitPercentageEl = document.getElementById('profitPercentage');
        const profitAlertEl = document.getElementById('profitAlert');

        if (finalProfitEl) {
            finalProfitEl.innerHTML = profit.finalProfit.toLocaleString() + ' <i class="bi bi-coin" style="font-size:0.75em;"></i>';
        }

        if (profitPercentageEl) {
            profitPercentageEl.textContent = `Margen de ganancia: ${profit.profitPercentage.toFixed(2)}%`;
        }

        // Cambiar color según profit
        if (profitAlertEl) {
            if (profit.finalProfit > 0) {
                profitAlertEl.className = 'profit-alert profit-positive';
            } else if (profit.finalProfit < 0) {
                profitAlertEl.className = 'profit-alert profit-negative';
            } else {
                profitAlertEl.className = 'profit-alert profit-neutral';
            }
        }
    }

    /**
     * Muestra recomendaciones
     * @param {Array<string>} recommendations
     * @private
     */
    _displayRecommendations(recommendations) {
        const container = document.getElementById('recommendations');
        if (!container) return;

        container.innerHTML = '';
        recommendations.forEach(rec => {
            const div = document.createElement('div');
            div.className = 'alert alert-info mb-2';
            div.textContent = rec;
            container.appendChild(div);
        });
    }

    /**
     * Actualiza un elemento del DOM (texto plano)
     * @param {string} id
     * @param {string} value
     * @private
     */
    _updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    }

    /**
     * Actualiza un elemento del DOM (HTML)
     * @param {string} id
     * @param {string} html
     * @private
     */
    _updateElementHTML(id, html) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = html;
        }
    }

    /**
     * Oculta los resultados
     */
    hideResults() {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }
    }

    /**
     * Carga precios desde la API
     */
    async loadPricesFromAPI() {
        const loadBtn = document.getElementById('loadPricesBtn');
        if (!loadBtn) return;

        try {
            // Deshabilitar botón
            loadBtn.disabled = true;
            loadBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Cargando...';

            const config = this.getFormValues();
            const item = this.createItem(config);

            // Cargar precios de materiales + ítem en la ciudad seleccionada
            await this.api.updateItemPrices(item, config.city);

            // Actualizar formulario con precios de materiales
            this._updateFormPrices(item);

            // Cargar precios de materiales en todas las ciudades
            try {
                await this._loadMaterialCityPrices(item);
            } catch (e) {
                console.warn('No se pudo obtener precios de materiales multi-ciudad:', e);
            }

            // Obtener precios del ítem en todas las ciudades y mostrar chips
            try {
                const cityPrices = await this.api.fetchAllCityPrices(item.getAPIName(), item.quality);
                this._showCityPrices(cityPrices);
                if (cityPrices.length > 0) {
                    document.getElementById('itemPrice').value = cityPrices[0].price;
                    const citySelector = document.getElementById('citySelector');
                    if (citySelector) citySelector.value = cityPrices[0].city;
                    // Marcar el chip de la ciudad con mejor precio como seleccionado
                    const chips = document.querySelectorAll('.city-chip');
                    if (chips.length > 0) chips[0].classList.add('selected');
                }
            } catch (e) {
                console.warn('No se pudo obtener precios multi-ciudad:', e);
            }

            this.showToast('✅ Precios Cargados',
                `Precios actualizados desde todas las ciudades`);

            // Auto-calcular
            this.calculate();

        } catch (error) {
            console.error('Error al cargar precios:', error);
            this.showToast('❌ Error al cargar precios', error.message || 'No se pudo contactar la API');
        } finally {
            loadBtn.disabled = false;
            loadBtn.innerHTML = '<i class="bi bi-cloud-download-fill"></i> Cargar Precios';
        }
    }

    /**
     * Actualiza los precios en el formulario
     * @param {Item} item
     * @private
     */
    _updateFormPrices(item) {
        // Precio del item
        const itemPriceEl = document.getElementById('itemPrice');
        if (itemPriceEl) {
            itemPriceEl.value = item.getPrice();
        }

        // Precios de materiales
        // Map recipe keys (LEATHER, METALBAR, PLANKS, CLOTH, artifact) → input element IDs
        const matToInputId = { LEATHER: 'leatherPrice', METALBAR: 'barsPrice', PLANKS: 'planksPrice', CLOTH: 'clothPrice', AVALONIANENERGY: 'energyPrice', artifact: 'artifactPrice' };
        item.getAllMaterials().forEach((material, type) => {
            const elementId = matToInputId[type];
            const el = elementId && document.getElementById(elementId);
            if (el) el.value = material.price;
        });
    }

    /**
     * Guarda la sesión actual
     */
    saveCurrentSession() {
        if (!this.currentCalculator) {
            this.showToast('❌ Error', 'No hay datos para guardar');
            return;
        }

        try {
            const analysis = this.currentCalculator.toJSON();
            const session = this.sessionManager.saveSession(analysis);

            this.showToast('💾 Guardado',
                `Sesión guardada exitosamente. Total: ${this.sessionManager.getAllSessions().length}`);

            // Descargar JSON
            this.sessionManager.exportToJSON();

        } catch (error) {
            console.error('Error al guardar sesión:', error);
            this.showToast('❌ Error', error.message);
        }
    }

    /**
     * Muestra los precios del ítem por ciudad como chips clickeables
     * @param {Array} cityPrices - [{city, price}] ordenado desc
     */
    _showCityPrices(cityPrices) {
        const container = document.getElementById('cityPriceChips');
        if (!container) return;
        if (!cityPrices.length) {
            container.innerHTML = '<span class="text-muted small">Sin datos de ciudades</span>';
            return;
        }
        container.innerHTML = cityPrices.map((c, i) => `
            <button class="city-chip ${i === 0 ? 'best' : ''}" data-city="${c.city}" data-price="${c.price}">
                ${i === 0 ? '★ ' : ''}<span class="city-name">${c.city}</span>
                <span class="city-price">${(c.price / 1000).toFixed(1)}K</span>
            </button>`).join('');
        container.querySelectorAll('.city-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('itemPrice').value = btn.dataset.price;
                const citySelector = document.getElementById('citySelector');
                if (citySelector) citySelector.value = btn.dataset.city;
                container.querySelectorAll('.city-chip').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.calculate();
            });
        });
    }

    /**
     * Carga y muestra precios por ciudad para cada material activo
     * @param {Item} item
     * @private
     */
    async _loadMaterialCityPrices(item) {
        const matToInputId = {
            LEATHER: 'leatherPrice', METALBAR: 'barsPrice',
            PLANKS: 'planksPrice', CLOTH: 'clothPrice', AVALONIANENERGY: 'energyPrice', artifact: 'artifactPrice'
        };
        const fetches = [];
        item.getAllMaterials().forEach((material, type) => {
            const inputId = matToInputId[type];
            if (!inputId) return;
            fetches.push(
                this.api.fetchAllCityPrices(material.getAPIName(), 1)
                    .then(cityPrices => this._showMaterialCityPrices(type, inputId, cityPrices))
                    .catch(() => {})
            );
        });
        await Promise.allSettled(fetches);
    }

    /**
     * Muestra una tabla minimalista de precios por ciudad debajo de un input de material
     * @param {string} materialType - Tipo de material (METALBAR, LEATHER, etc.)
     * @param {string} inputId - ID del input de precio
     * @param {Array} cityPrices - [{city, price}] ordenado desc
     * @private
     */
    _showMaterialCityPrices(materialType, inputId, cityPrices) {
        const cell = document.querySelector(`#matGrid [data-material="${materialType}"]`);
        if (!cell) return;

        const existing = cell.querySelector('.mat-city-table');
        if (existing) existing.remove();
        if (!cityPrices.length) return;

        const input = document.getElementById(inputId);
        const abbr = {
            'Caerleon': 'Cae', 'Bridgewatch': 'Bri', 'Fort Sterling': 'Ste',
            'Lymhurst': 'Lym', 'Martlock': 'Mar', 'Thetford': 'The',
            'Brecilien': 'Bre', 'Black Market': 'BM'
        };

        const table = document.createElement('table');
        table.className = 'mat-city-table';

        cityPrices.forEach(({ city, price }) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${abbr[city] || city.slice(0, 3)}</td><td>${(price / 1000).toFixed(1)}K</td>`;
            tr.addEventListener('click', () => {
                if (input) input.value = price;
                table.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
                this.calculate();
            });
            table.appendChild(tr);
        });

        cell.appendChild(table);
    }

    /**
     * Limpia precios, sugerencias de ciudad y resultados al cambiar de arma
     */
    clearPricesAndResults() {
        ['leatherPrice', 'barsPrice', 'planksPrice', 'clothPrice', 'artifactPrice', 'energyPrice', 'itemPrice'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const chips = document.getElementById('cityPriceChips');
        if (chips) chips.innerHTML = '';
        document.querySelectorAll('.mat-city-table').forEach(t => t.remove());
        this.hideResults();
    }

    /**
     * Muestra un toast/notificación
     * @param {string} title
     * @param {string} message
     */
    showToast(title, message) {
        const toastEl = document.getElementById('saveToast');
        if (!toastEl) return;

        const titleEl = toastEl.querySelector('.toast-header strong');
        const bodyEl = toastEl.querySelector('.toast-body');

        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.textContent = message;

        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
