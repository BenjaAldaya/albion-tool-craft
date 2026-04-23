/**
 * CraftPanel — Panel de crafteo auto-contenido y arrastrable.
 * Cada instancia maneja su propio item, precios y calculador.
 */
class CraftPanel {
    static _counter = 0;
    static _zTop    = 100;

    constructor(canvas, opts = {}) {
        this.panelId    = ++CraftPanel._counter;
        this.canvas     = canvas;
        this.api        = new AlbionAPI();
        this._itemData  = null;
        this._itemType  = opts.itemType || null;
        this._tier      = opts.tier     || 4;
        this._enchant   = opts.enchant  || 0;
        this._matInputs = {};
        this._dragging  = false;
        this._dragOff   = { x: 0, y: 0 };

        // Cascade position para que no se apilen en el mismo punto
        const offset = ((this.panelId - 1) % 8) * 30;
        this._x = 24 + offset;
        this._y = 24 + offset;

        this._mount();
    }

    _q(sel)  { return this.el.querySelector(sel); }
    _qa(sel) { return this.el.querySelectorAll(sel); }

    // ── Mount ────────────────────────────────────────────────────────────────────
    _mount() {
        this.el = document.createElement('div');
        this.el.className = 'craft-panel';
        this.el.style.cssText = `left:${this._x}px;top:${this._y}px;z-index:${CraftPanel._zTop};`;
        this.el.innerHTML = this._buildHTML();
        this.canvas.appendChild(this.el);

        this._bindDrag();
        this._bindSearch();
        this._bindTiers();
        this._bindActions();
        this._bindFocus();

        // Seleccionar item por defecto si se pasó uno
        if (this._itemType) {
            const item = ALL_ITEMS.find(i => i.type === this._itemType);
            if (item) this._selectItem(item);
        }
    }

    _buildHTML() {
        const tiers = [4, 5, 6, 7, 8].map(t =>
            `<button class="cp-tier-btn${t === this._tier ? ' active' : ''}" data-tier="${t}">T${t}</button>`
        ).join('');

        return `
        <div class="cp-header">
            <i class="bi bi-grip-vertical cp-grip"></i>
            <span class="cp-title">Crafteo #${this.panelId}</span>
            <div class="cp-header-btns">
                <button class="cp-icon-btn cp-minimize" title="Minimizar"><i class="bi bi-dash-lg"></i></button>
                <button class="cp-icon-btn cp-close"    title="Cerrar"><i class="bi bi-x-lg"></i></button>
            </div>
        </div>

        <div class="cp-body">

            <!-- Búsqueda + Tiers -->
            <div class="cp-search-row">
                <div class="cp-search-wrap">
                    <input class="cp-search-input" type="text" placeholder="🔍 Buscar arma o herramienta...">
                    <div class="cp-search-results"></div>
                </div>
                <div class="cp-tier-row">
                    ${tiers}
                    <div class="cp-enc-wrap">
                        <span>ENC</span>
                        <input type="number" class="cp-enchant" value="${this._enchant}" min="0" max="4">
                    </div>
                </div>
            </div>

            <!-- Item seleccionado + parámetros -->
            <div class="cp-item-row" style="display:none;">
                <img class="cp-item-img" src="" alt="" onerror="this.style.opacity='.15'">
                <div class="cp-item-info">
                    <div class="cp-item-name">—</div>
                    <div class="cp-item-meta"></div>
                </div>
                <div class="cp-params">
                    <div class="cp-field"><label>Cant.</label><input type="number" class="cp-quantity" value="10" min="1"></div>
                    <div class="cp-field"><label>Ret.%</label><input type="number" class="cp-return"   value="45" min="0" max="100"></div>
                    <div class="cp-field"><label>Imp.</label> <input type="number" class="cp-tax"      value="450" min="0"></div>
                </div>
            </div>

            <!-- Materiales + Precio de venta -->
            <div class="cp-prices-area" style="display:none;">

                <!-- Materiales -->
                <div class="cp-mats-col">
                    <div class="cp-section-label">Materiales</div>
                    <div class="cp-mat-grid"></div>
                </div>

                <!-- Separador -->
                <div class="cp-col-sep"></div>

                <!-- Precio de venta + Journals -->
                <div class="cp-sell-col">
                    <div class="cp-section-label">Precio venta</div>
                    <div class="cp-sell-row">
                        <i class="bi bi-currency-exchange" style="color:#FFD700;font-size:.95rem;"></i>
                        <input type="number" class="cp-sell-price" value="0" min="0" placeholder="0">
                        <span class="cp-q-badge" style="display:none;"></span>
                    </div>
                    <div class="cp-city-chips"></div>

                    <div class="cp-section-label" style="margin-top:10px;"><i class="bi bi-journal-text"></i> Journals</div>
                    <div class="cp-journals">
                        <div class="cp-field"><label>Vacío</label> <input type="number" class="cp-journal-buy"  value="0" min="0"></div>
                        <div class="cp-field"><label>Lleno</label> <input type="number" class="cp-journal-sell" value="0" min="0"></div>
                    </div>
                </div>

            </div>

            <!-- Botones de acción -->
            <div class="cp-actions" style="display:none;">
                <button class="cp-load-btn"><i class="bi bi-cloud-download-fill"></i> Cargar Precios</button>
                <button class="cp-calc-btn"><i class="bi bi-graph-up-arrow"></i> Calcular</button>
            </div>

            <!-- Resultado -->
            <div class="cp-result" style="display:none;"></div>

        </div>`;
    }

    // ── Drag ─────────────────────────────────────────────────────────────────────
    _bindDrag() {
        const header = this._q('.cp-header');

        const onMove = (e) => {
            if (!this._dragging) return;
            const cr = this.canvas.getBoundingClientRect();
            this._x = Math.max(0, e.clientX - cr.left + this.canvas.scrollLeft - this._dragOff.x);
            this._y = Math.max(0, e.clientY - cr.top  + this.canvas.scrollTop  - this._dragOff.y);
            this.el.style.left = this._x + 'px';
            this.el.style.top  = this._y + 'px';
        };

        const onUp = () => {
            if (!this._dragging) return;
            this._dragging = false;
            this.el.classList.remove('cp-dragging');
        };

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.cp-icon-btn')) return;
            this._dragging = true;
            const r = this.el.getBoundingClientRect();
            this._dragOff.x = e.clientX - r.left;
            this._dragOff.y = e.clientY - r.top;
            this.el.style.zIndex = ++CraftPanel._zTop;
            this.el.classList.add('cp-dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
        this._cleanupDrag = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup',   onUp);
        };
    }

    // ── Search ───────────────────────────────────────────────────────────────────
    _bindSearch() {
        const input   = this._q('.cp-search-input');
        const results = this._q('.cp-search-results');

        input.addEventListener('input', () => {
            const q = input.value.trim().toLowerCase();
            this._renderSearch(
                q ? ALL_ITEMS.filter(i =>
                    i.name.toLowerCase().includes(q) ||
                    i.category.toLowerCase().includes(q)
                ) : ALL_ITEMS,
                results
            );
        });

        input.addEventListener('focus', () => this._renderSearch(ALL_ITEMS, results));

        document.addEventListener('click', (e) => {
            if (!this.el.contains(e.target)) results.classList.remove('open');
        });
    }

    _renderSearch(items, results) {
        if (!items.length) {
            results.innerHTML = '<div style="padding:8px;opacity:.5;font-size:.8rem;">Sin resultados</div>';
            results.classList.add('open');
            return;
        }

        const byCategory = {};
        items.forEach(i => { (byCategory[i.category] ??= []).push(i); });

        let html = '';
        for (const [cat, list] of Object.entries(byCategory)) {
            html += `<div class="cp-res-cat">${cat}</div>`;
            for (const item of list) {
                const img = getItemImageUrl(item.type, this._tier);
                html += `<div class="cp-res-item" data-type="${item.type}">
                    <img src="${img}" alt="" onerror="this.style.opacity='.15'">
                    <div>
                        <div class="cp-res-name">${item.name}</div>
                        <div class="cp-res-meta">${item.category} · ${item.handType}</div>
                    </div>
                </div>`;
            }
        }

        results.innerHTML = html;
        results.classList.add('open');

        results.querySelectorAll('.cp-res-item').forEach(el => {
            el.addEventListener('click', () => {
                const item = ALL_ITEMS.find(i => i.type === el.dataset.type);
                if (item) this._selectItem(item);
                results.classList.remove('open');
                this._q('.cp-search-input').value = '';
            });
        });
    }

    // ── Tiers & Enchant ──────────────────────────────────────────────────────────
    _bindTiers() {
        this._qa('.cp-tier-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._qa('.cp-tier-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._tier = parseInt(btn.dataset.tier);
                this._refreshImages();
                this._debouncedCalc();
            });
        });

        this._q('.cp-enchant').addEventListener('change', (e) => {
            this._enchant = parseInt(e.target.value) || 0;
            this._refreshImages();
            this._debouncedCalc();
        });
    }

    // ── Actions ──────────────────────────────────────────────────────────────────
    _bindActions() {
        this._q('.cp-close').addEventListener('click', () => this.destroy());

        this._q('.cp-minimize').addEventListener('click', () => {
            const body  = this._q('.cp-body');
            const isMin = body.style.display === 'none';
            body.style.display = isMin ? '' : 'none';
            this._q('.cp-minimize i').className = `bi bi-${isMin ? 'dash' : 'plus'}-lg`;
        });

        this._q('.cp-load-btn').addEventListener('click', () => this._loadPrices());
        this._q('.cp-calc-btn').addEventListener('click', () => this._calculate());
    }

    _bindFocus() {
        this.el.addEventListener('mousedown', () => {
            this.el.style.zIndex = ++CraftPanel._zTop;
        });

        // Auto-recalc al cambiar inputs manualmente
        this.el.addEventListener('input', (e) => {
            if (e.target.matches('.cp-sell-price,.cp-quantity,.cp-return,.cp-tax,.cp-journal-buy,.cp-journal-sell,.cp-mat-price')) {
                this._debouncedCalc();
            }
        });
    }

    // ── Select Item ──────────────────────────────────────────────────────────────
    _selectItem(itemData) {
        this._itemData = itemData;
        this._itemType = itemData.type;

        this._q('.cp-title').textContent     = itemData.name;
        this._q('.cp-item-img').src          = getItemImageUrl(itemData.type, this._tier, this._enchant, 1);
        this._q('.cp-item-name').textContent = itemData.name;
        this._q('.cp-item-meta').textContent = `${itemData.category} · ${itemData.handType}`;

        this._q('.cp-item-row').style.display    = '';
        this._q('.cp-prices-area').style.display = '';
        this._q('.cp-actions').style.display     = '';
        this._q('.cp-result').style.display      = 'none';
        this._q('.cp-city-chips').innerHTML      = '';
        this._q('.cp-q-badge').style.display     = 'none';

        this._buildMaterials();
    }

    // ── Materials ────────────────────────────────────────────────────────────────
    _buildMaterials() {
        const recipe = AlbionConfig.TOOL_RECIPES[this._itemType]
            || AlbionConfig.WEAPON_RECIPES[this._itemType]
            || AlbionConfig.ARMOR_RECIPES[this._itemType];
        if (!recipe) return;

        const MAT_LABELS = {
            LEATHER: 'Cuero', METALBAR: 'Lingotes', PLANKS: 'Tablas',
            CLOTH: 'Tela', artifact: 'Artefacto', AVALONIANENERGY: 'Energía'
        };

        const grid = this._q('.cp-mat-grid');
        grid.innerHTML = '';
        this._matInputs = {};
        this._recipe    = recipe;

        for (const matKey of Object.keys(recipe.materials)) {
            const label  = MAT_LABELS[matKey] || matKey;
            const imgSrc = this._matImg(matKey, recipe);

            const cell = document.createElement('div');
            cell.className   = 'cp-mat-cell';
            cell.dataset.mat = matKey;
            cell.innerHTML = `
                <img src="${imgSrc}" alt="" onerror="this.style.opacity='.15'">
                <span class="cp-mat-label">${label}</span>
                <input type="number" class="cp-mat-price" value="0" min="0" placeholder="0">
                <div class="cp-mat-cities"></div>`;
            grid.appendChild(cell);
            this._matInputs[matKey] = cell.querySelector('.cp-mat-price');
        }
    }

    _matImg(matKey, recipe) {
        if (matKey === 'artifact') {
            const n = AlbionConfig.ITEM_API_NAMES?.[recipe?.artifactKey]?.[this._tier];
            return n ? `https://render.albiononline.com/v1/item/${n}.png?quality=1&size=80` : '';
        }
        const base = AlbionConfig.ITEM_API_NAMES?.[matKey]?.[this._tier];
        if (!base) return '';
        const name = this._enchant > 0 ? `${base}_LEVEL${this._enchant}` : base;
        return `https://render.albiononline.com/v1/item/${name}.png?quality=1&size=80`;
    }

    _refreshImages() {
        if (!this._itemData) return;
        this._q('.cp-item-img').src = getItemImageUrl(this._itemData.type, this._tier, this._enchant, 1);
        this._buildMaterials();
    }

    // ── Load Prices ──────────────────────────────────────────────────────────────
    async _loadPrices() {
        const btn = this._q('.cp-load-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Cargando...';

        try {
            const config = this._getConfig();
            const item   = this._createItem(config);

            // Item: todas las ciudades × calidades 1-2-3 en un request
            const itemResult = await this.api.fetchBestItemPrice(item.getAPIName()).catch(() => null);
            if (itemResult?.best) {
                this._q('.cp-sell-price').value = itemResult.best.price;
                this._showCityChips(itemResult.all);
                this._showQBadge(itemResult.best.quality, itemResult.best.qualityName);
            }

            // Materiales: mejor ciudad (más barato primero)
            await Promise.allSettled(
                Object.keys(this._matInputs).map(async matKey => {
                    const input      = this._matInputs[matKey];
                    const isArtifact = matKey === 'artifact';
                    let apiName;

                    if (isArtifact) {
                        apiName = AlbionConfig.ITEM_API_NAMES?.[this._recipe?.artifactKey]?.[this._tier];
                    } else {
                        const base = AlbionConfig.ITEM_API_NAMES?.[matKey]?.[this._tier];
                        apiName = this._enchant > 0 ? `${base}_LEVEL${this._enchant}@${this._enchant}` : base;
                    }
                    if (!apiName) return;

                    const cities = await this.api.fetchAllCityPrices(apiName, 1).catch(() => []);
                    if (!cities.length) return;

                    input.value = cities[0].price;

                    const citiesEl = input.closest('.cp-mat-cell')?.querySelector('.cp-mat-cities');
                    if (!citiesEl) return;

                    citiesEl.innerHTML = cities.slice(0, 5).map(c => `
                        <div class="cp-mat-city" data-price="${c.price}">
                            <span>${c.city.slice(0, 3)}</span>
                            <span>${(c.price / 1000).toFixed(1)}K</span>
                        </div>`).join('');

                    citiesEl.querySelectorAll('.cp-mat-city').forEach(row => {
                        row.addEventListener('click', () => {
                            input.value = row.dataset.price;
                            citiesEl.querySelectorAll('.cp-mat-city').forEach(r => r.classList.remove('selected'));
                            row.classList.add('selected');
                            this._calculate();
                        });
                    });
                })
            );

            this._calculate();
        } catch (e) {
            console.error('[CraftPanel] loadPrices:', e);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-cloud-download-fill"></i> Cargar Precios';
        }
    }

    _showCityChips(all) {
        const container = this._q('.cp-city-chips');
        const Q_COLORS  = { 1: '#aaa', 2: '#7ec85c', 3: '#f0c040', 4: '#4fc3f7', 5: '#ce93d8' };
        const Q_NAMES   = { 1: 'Normal', 2: 'Good', 3: 'Outstanding', 4: 'Excellent', 5: 'Masterpiece' };

        const bestPerCity = new Map();
        for (const c of all) if (!bestPerCity.has(c.city)) bestPerCity.set(c.city, c);
        const deduped = [...bestPerCity.values()];

        container.innerHTML = deduped.map((c, i) => {
            const qColor = Q_COLORS[c.quality] || '#aaa';
            const qName  = c.qualityName || Q_NAMES[c.quality] || '';
            return `<button class="cp-city-chip${i === 0 ? ' best' : ''}"
                            data-price="${c.price}" data-quality="${c.quality}">
                ${i === 0 ? '★ ' : ''}<span>${c.city}</span>
                <span style="font-weight:700;">${(c.price / 1000).toFixed(1)}K</span>
                <span style="font-size:.55rem;color:${qColor};border:1px solid ${qColor};border-radius:3px;padding:0 2px;">${qName}</span>
            </button>`;
        }).join('');

        container.querySelectorAll('.cp-city-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                this._q('.cp-sell-price').value = btn.dataset.price;
                if (btn.dataset.quality) {
                    const q = parseInt(btn.dataset.quality);
                    this._showQBadge(q, Q_NAMES[q]);
                }
                container.querySelectorAll('.cp-city-chip').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this._calculate();
            });
        });
    }

    _showQBadge(quality, qualityName) {
        const badge   = this._q('.cp-q-badge');
        const Q_COLORS = { 1: '#aaa', 2: '#7ec85c', 3: '#f0c040', 4: '#4fc3f7', 5: '#ce93d8' };
        const color   = Q_COLORS[quality] || '#aaa';
        badge.textContent       = qualityName || `Q${quality}`;
        badge.style.color       = color;
        badge.style.borderColor = color;
        badge.style.display     = '';
    }

    // ── Calculate ────────────────────────────────────────────────────────────────
    _getConfig() {
        return {
            itemType:    this._itemType,
            tier:        this._tier,
            enchantment: this._enchant,
            quality:     2,
            quantity:    parseInt(this._q('.cp-quantity')?.value)            || 10,
            returnRate:  (parseFloat(this._q('.cp-return')?.value) || 45)   / 100,
            taxRate:     parseFloat(this._q('.cp-tax')?.value)               || 450,
        };
    }

    _createItem({ itemType, tier, quality, enchantment }) {
        if (AlbionConfig.TOOL_RECIPES[itemType])   return new Tool(itemType, tier, quality, enchantment);
        if (AlbionConfig.WEAPON_RECIPES[itemType]) return new Weapon(itemType, tier, quality, enchantment);
        if (AlbionConfig.ARMOR_RECIPES[itemType])  return new Armor(itemType, tier, quality, enchantment);
        throw new Error(`Tipo de item desconocido: ${itemType}`);
    }

    _calculate() {
        if (!this._itemType) return;
        try {
            const config = this._getConfig();
            const item   = this._createItem(config);

            const keyMap = {
                LEATHER: 'leather', METALBAR: 'bars', PLANKS: 'planks',
                CLOTH: 'cloth', AVALONIANENERGY: 'energy', artifact: 'artifact'
            };
            const matPrices = {};
            for (const [k, input] of Object.entries(this._matInputs)) {
                matPrices[keyMap[k] || k.toLowerCase()] = parseFloat(input.value) || 0;
            }
            item.updateMaterialPrices(matPrices);
            item.setPrice(parseFloat(this._q('.cp-sell-price')?.value) || 0);

            if (!item.getPrice()) { this._q('.cp-result').style.display = 'none'; return; }

            const calc = new CraftingCalculator(item, config.quantity, config.returnRate, config.taxRate,
                { sellTaxRate: 0.065, buyOrderFee: 0, premiumFame: true });

            const jBuy  = parseFloat(this._q('.cp-journal-buy')?.value)  || 0;
            const jSell = parseFloat(this._q('.cp-journal-sell')?.value) || 0;
            if (jBuy > 0 && jSell > 0) {
                const jm = new JournalManager(config.tier);
                jm.setBuyPrice(jBuy);
                jm.setSellPrice(jSell);
                calc.setJournalManager(jm);
            }

            this._currentCalc   = calc;
            this._currentItem   = item;
            this._currentConfig = config;
            this._renderResult(calc.generateFullAnalysis());
        } catch (e) {
            console.error('[CraftPanel] calc:', e);
        }
    }

    _renderResult(analysis) {
        const profit  = analysis.profit.finalProfit;
        const pct     = analysis.profit.profitPercentage;
        const isPos   = profit >= 0;
        const color   = isPos ? '#7ec85c' : '#e87676';
        const bg      = isPos ? 'rgba(126,200,92,.07)'   : 'rgba(232,118,118,.07)';
        const border  = isPos ? 'rgba(126,200,92,.2)'    : 'rgba(232,118,118,.2)';
        const sign    = isPos ? '+' : '';
        const fmt = v => {
            const a = Math.abs(v);
            if (a >= 1e6) return (v/1e6).toFixed(2)+'M';
            if (a >= 1e3) return (v/1e3).toFixed(1)+'K';
            return Math.round(v).toLocaleString();
        };

        const result = this._q('.cp-result');
        result.style.display = '';
        result.innerHTML = `
        <div class="cp-result-card" style="background:${bg};border:1px solid ${border};">
            <div class="cp-result-stats">
                <div class="cp-stat">
                    <span>Profit</span>
                    <strong style="color:${color};font-size:1rem;">${sign}${fmt(profit)}</strong>
                </div>
                <div class="cp-stat">
                    <span>Margen</span>
                    <strong style="color:${color};">${sign}${pct.toFixed(1)}%</strong>
                </div>
                <div class="cp-stat">
                    <span>Costo unit.</span>
                    <strong>${fmt(analysis.costs.costPerItem)}</strong>
                </div>
                <div class="cp-stat">
                    <span>Costo total</span>
                    <strong>${fmt(analysis.costs.totalCost)}</strong>
                </div>
            </div>
            <button class="cp-add-day">
                <i class="bi bi-plus-circle-fill"></i> Agregar al día
            </button>
        </div>`;

        result.querySelector('.cp-add-day').addEventListener('click', () => this._addToDay(analysis));
    }

    _addToDay(analysis) {
        if (typeof dayCrafts === 'undefined') return;
        const config   = this._currentConfig;
        const enchTxt  = this._enchant > 0 ? `.${this._enchant}` : '';
        const keyMap   = { LEATHER: 'leather', METALBAR: 'bars', PLANKS: 'planks', CLOTH: 'cloth', AVALONIANENERGY: 'energy', artifact: 'artifact' };

        const matMap = {};
        for (const [k, input] of Object.entries(this._matInputs)) {
            matMap[k] = { label: k, price: parseFloat(input.value) || 0, neededQty: config.quantity, apiName: '' };
        }

        dayCrafts.unshift({
            id:               Date.now(),
            itemType:         this._itemType,
            itemName:         `T${this._tier}${enchTxt} ${this._itemData?.name || ''}`,
            tier:             this._tier,
            enchant:          this._enchant,
            quality:          config.quality,
            quantity:         config.quantity,
            city:             'Caerleon',
            returnRate:       config.returnRate,
            taxRate:          config.taxRate,
            itemPrice:        parseFloat(this._q('.cp-sell-price')?.value) || 0,
            journalBuyPrice:  parseFloat(this._q('.cp-journal-buy')?.value)  || 0,
            journalSellPrice: parseFloat(this._q('.cp-journal-sell')?.value) || 0,
            totalCost:        analysis.costs.totalCost,
            totalRevenue:     analysis.revenue.totalRevenue,
            finalProfit:      analysis.profit.finalProfit,
            profitPct:        analysis.profit.profitPercentage,
            journalsProfit:   analysis.journals?.profit || 0,
            journalsFilled:   analysis.journals?.journalsComplete || 0,
            savedAt:          new Date().toLocaleTimeString(),
            materials:        matMap,
        });

        if (typeof _saveDayCrafts  === 'function') _saveDayCrafts();
        if (typeof renderDayPanel  === 'function') renderDayPanel();

        const btn = this._q('.cp-add-day');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-check-circle-fill" style="color:#7ec85c"></i> ¡Agregado!';
            setTimeout(() => {
                if (btn.isConnected) btn.innerHTML = '<i class="bi bi-plus-circle-fill"></i> Agregar al día';
            }, 2000);
        }
    }

    _debouncedCalc() {
        clearTimeout(this._calcTimer);
        this._calcTimer = setTimeout(() => this._calculate(), 280);
    }

    // ── Destroy ──────────────────────────────────────────────────────────────────
    destroy() {
        this._cleanupDrag?.();
        this.el.style.transition = 'opacity .15s, transform .15s';
        this.el.style.opacity    = '0';
        this.el.style.transform  = 'scale(0.95)';
        setTimeout(() => this.el.remove(), 160);
    }
}
