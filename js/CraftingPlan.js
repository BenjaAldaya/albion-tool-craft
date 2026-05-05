// CraftingPlan.js — Plan de crafteo con flujo real de materiales

(function () {

    // ─── Lookup de receta ─────────────────────────────────────────────────────

    function _getRecipeInfo(itemType, materialType, tier) {
        if (materialType === 'artifact')        return { qty: 1,  noReturn: true };
        if (materialType === 'AVALONIANENERGY') return { qty: 0,  noReturn: true };

        const recipe = AlbionConfig.WEAPON_RECIPES?.[itemType]
                    || AlbionConfig.TOOL_RECIPES?.[itemType]
                    || AlbionConfig.ARMOR_RECIPES?.[itemType]
                    || null;
        if (!recipe) return null;

        const rawQty = recipe.materials?.[materialType];
        if (rawQty == null) return null;

        const qty = typeof rawQty === 'object' ? (rawQty[tier] ?? 0) : rawQty;
        return { qty, noReturn: false };
    }

    // ─── Simulación iterativa (igual que Item._simulateIterativeReturn) ────────
    //
    // Replica el ciclo real del juego, craft por craft:
    //   returnedPerCraft = Math.round(base × rate)
    //   Por cada craft: si no hay stock suficiente, comprá lo que falta; usá base; recibí retorno.
    //
    // stockIn = materiales ya en el banco de un paso anterior (reducen compras directamente).
    // leftover = lo que queda en banco al terminar todos los crafts → pasa al siguiente item.

    function _simulateCraft(basePerItem, quantity, returnRate, stockIn, noReturn) {
        const gross = basePerItem * quantity;

        if (noReturn) {
            const fromStock = Math.min(stockIn, gross);
            return { gross, toBuyFresh: gross - fromStock, fromStock, leftover: stockIn - fromStock };
        }

        const returnedPerCraft = Math.floor(basePerItem * returnRate);
        let stock        = stockIn;
        let totalBought  = 0;

        for (let i = 0; i < quantity; i++) {
            if (stock < basePerItem) {
                const needed = basePerItem - stock;
                totalBought += needed;
                stock       += needed;
            }
            stock -= basePerItem;
            stock += returnedPerCraft;
        }

        return {
            gross,
            toBuyFresh: totalBought,
            fromStock:  stockIn,   // banco disponible al inicio de este item
            leftover:   stock,     // queda en banco al terminar → pasa al siguiente item
        };
    }

    // ─── Generación del plan ──────────────────────────────────────────────────

    function generateCraftingPlan(crafts) {
        const ordered = [...crafts].reverse(); // cronológico: más antiguo primero
        const stock   = {};
        const steps   = [];

        for (const craft of ordered) {
            const stepMaterials = [];
            const returnRate    = craft.returnRate;

            for (const [type, mat] of Object.entries(craft.materials || {})) {
                if (!mat || typeof mat !== 'object') continue;
                const apiName    = mat.apiName || type;
                const available  = stock[apiName] || 0;
                const recipeInfo = _getRecipeInfo(craft.itemType, type, craft.tier);

                // Prioridad: config receta → neededQty/cantidad → quantity/cantidad (fallback)
                const basePerItem = recipeInfo?.qty
                    ?? (mat.neededQty   ? mat.neededQty   / craft.quantity : null)
                    ?? (mat.quantity    ? mat.quantity     / craft.quantity : 0);

                if (!basePerItem) continue;

                const sim = _simulateCraft(
                    basePerItem, craft.quantity, returnRate,
                    available, recipeInfo?.noReturn ?? false
                );

                stepMaterials.push({
                    label:      mat.label,
                    type,
                    apiName,
                    gross:      sim.gross,
                    toBuyFresh: sim.toBuyFresh,
                    fromStock:  sim.fromStock,
                    leftover:   sim.leftover,
                    price:      mat.price,
                });

                stock[apiName] = sim.leftover;
            }

            steps.push({ craft, materials: stepMaterials });
        }

        return { steps, finalStock: stock };
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    function _fmt(n) {
        const abs = Math.abs(n);
        let s;
        if (abs >= 1e6)      s = (abs / 1e6).toFixed(2) + 'M';
        else if (abs >= 1e3) s = (Math.round(abs / 100) / 10) + 'K';
        else                 s = Math.round(abs).toLocaleString();
        return (n < 0 ? '-' : '') + s;
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    function renderCraftingPlan() {
        const container = document.getElementById('craftingPlanContent');
        if (!container) return;

        if (!dayCrafts || !dayCrafts.length) {
            container.innerHTML = `<div class="plan-empty">Agregá crafteos a la sesión para ver el plan.</div>`;
            return;
        }

        const { steps, finalStock: stock } = generateCraftingPlan(dayCrafts);

        // ── Costo "naïve": cada item por separado con simulación iterativa (sin banco cruzado) ──
        let consolidatedCost = 0;
        for (const craft of dayCrafts) {
            const returnRate = craft.returnRate;
            for (const [type, mat] of Object.entries(craft.materials || {})) {
                if (!mat || typeof mat !== 'object') continue;
                const recipeInfo  = _getRecipeInfo(craft.itemType, type, craft.tier);
                const basePerItem = recipeInfo?.qty
                    ?? (mat.neededQty ? mat.neededQty / craft.quantity : null)
                    ?? (mat.quantity  ? mat.quantity  / craft.quantity : 0);
                if (!basePerItem) continue;
                const sim = _simulateCraft(basePerItem, craft.quantity, returnRate, 0, recipeInfo?.noReturn ?? false);
                consolidatedCost += sim.toBuyFresh * (mat.price || 0);
            }
        }

        // ── Costo real del plan (aprovecha banco cruzado) ─────────────────────
        const planCost = steps.reduce((s, { materials }) =>
            s + materials.reduce((ms, m) => ms + m.toBuyFresh * (m.price || 0), 0), 0);

        const saving    = consolidatedCost - planCost;
        const savingPct = consolidatedCost > 0 ? (saving / consolidatedCost * 100) : 0;

        let html = '';

        // ── Resumen de ahorro ─────────────────────────────────────────────────
        if (saving > 0) {
            html += `
            <div class="plan-savings">
                <div class="plan-savings-title">
                    <i class="bi bi-lightning-charge-fill"></i> Ahorro vs comprar todo de una
                </div>
                <div class="plan-savings-row">
                    <span class="plan-savings-label">Comprando por separado</span>
                    <span class="plan-savings-val plan-buy">${_fmt(consolidatedCost)}</span>
                </div>
                <div class="plan-savings-row">
                    <span class="plan-savings-label">Con este plan</span>
                    <span class="plan-savings-val plan-return">${_fmt(planCost)}</span>
                </div>
                <div class="plan-savings-divider"></div>
                <div class="plan-savings-row">
                    <span class="plan-savings-label" style="font-weight:700;">Ahorro potencial</span>
                    <span class="plan-savings-highlight">~${_fmt(saving)}
                        <span class="plan-savings-pct">${savingPct.toFixed(1)}% menos</span>
                    </span>
                </div>
            </div>`;
        }

        // ── Pasos ─────────────────────────────────────────────────────────────
        steps.forEach((step, idx) => {
            const { craft, materials } = step;
            const enchTxt = craft.enchant > 0 ? `.${craft.enchant}` : '.0';
            const imgUrl  = typeof getItemImageUrl === 'function'
                ? getItemImageUrl(craft.itemType, craft.tier, craft.enchant, craft.quality)
                : '';

            const matRows = materials.map(m => `
                <tr>
                    <td class="plan-mat-label">${m.label}</td>
                    <td class="text-end plan-gross">${_fmt(m.gross)}</td>
                    <td class="text-end">${m.toBuyFresh > 0
                        ? `<span class="plan-buy">${_fmt(m.toBuyFresh)}</span>`
                        : '<span class="plan-zero">—</span>'}</td>
                    <td class="text-end">${m.fromStock > 0
                        ? `<span class="plan-stock">~${_fmt(m.fromStock)}</span>`
                        : '<span class="plan-zero">—</span>'}</td>
                    <td class="text-end">${m.leftover > 0
                        ? `<span class="plan-return">~${_fmt(m.leftover)}</span>`
                        : '<span class="plan-zero">—</span>'}</td>
                </tr>`).join('');

            const stepCost = materials.reduce((s, m) => s + m.toBuyFresh * (m.price || 0), 0);

            html += `
            <div class="plan-step">
                <div class="plan-step-header">
                    <span class="plan-step-num">${idx + 1}</span>
                    <img src="${imgUrl}" class="plan-step-img" alt="" onerror="this.style.opacity='.15'">
                    <div class="plan-step-info">
                        <div class="plan-step-name">${craft.itemName}</div>
                        <div class="plan-step-meta">T${craft.tier}${enchTxt} &bull; ×${craft.quantity}</div>
                    </div>
                    ${stepCost > 0 ? `<span class="plan-step-cost">${_fmt(stepCost)}</span>` : ''}
                </div>
                <table class="plan-mat-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th class="text-end">Bruto</th>
                            <th class="text-end">Comprar</th>
                            <th class="text-end">Del banco</th>
                            <th class="text-end">Queda al banco</th>
                        </tr>
                    </thead>
                    <tbody>${matRows}</tbody>
                </table>
            </div>`;
        });

        // ── Resumen final de flujo ────────────────────────────────────────────
        const flowSummary = {};
        steps.forEach(step => {
            step.materials.forEach(m => {
                if (!flowSummary[m.apiName]) {
                    flowSummary[m.apiName] = { label: m.label, price: m.price, comprado: 0 };
                }
                flowSummary[m.apiName].comprado += m.toBuyFresh;
            });
        });

        const summaryRows = Object.values(flowSummary)
            .filter(m => m.comprado > 0)
            .sort((a, b) => b.comprado * b.price - a.comprado * a.price)
            .map(m => `
                <tr>
                    <td class="plan-mat-label">${m.label}</td>
                    <td class="text-end"><span class="plan-buy">${_fmt(m.comprado)}</span></td>
                    <td class="text-end plan-gross">${_fmt(m.comprado * (m.price || 0))}</td>
                </tr>`).join('');

        const totalInversion = Object.values(flowSummary).reduce((s, m) => s + m.comprado * (m.price || 0), 0);

        html += `
        <div class="plan-flow-summary">
            <div class="plan-savings-title" style="margin-bottom:8px;">
                <i class="bi bi-cart-fill"></i> Lo que tenés que comprar en total
            </div>
            <table class="plan-mat-table">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th class="text-end">Cantidad exacta</th>
                        <th class="text-end">Plata</th>
                    </tr>
                </thead>
                <tbody>${summaryRows}</tbody>
            </table>
            <div class="plan-total-inv">
                Inversión total en materiales: <strong>${_fmt(totalInversion)}</strong>
            </div>
        </div>`;

        container.innerHTML = html;
    }

    // ─── Tab switching ────────────────────────────────────────────────────────

    window.switchDayTab = function (tab) {
        document.getElementById('daySessionContent').style.display  = tab === 'session' ? '' : 'none';
        document.getElementById('craftingPlanContent').style.display = tab === 'plan'    ? '' : 'none';
        document.querySelectorAll('.day-tab-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.tab === tab));
        if (tab === 'plan') renderCraftingPlan();
    };

    window.renderCraftingPlan   = renderCraftingPlan;
    window.generateCraftingPlan = generateCraftingPlan;

})();
