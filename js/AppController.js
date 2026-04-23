/**
 * Controlador principal de la aplicación
 * Depende de: ImageHelper.js, PriceCache.js, SnapshotManager.js, UIManager.js, CraftPanel.js
 */

// ── Construcción del listado de items ────────────────────────────────────────

function buildItemList() {
    const items = [];

    Object.entries(AlbionConfig.TOOL_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: 'Herramienta',
            handType: '1H',
            isTool: true,
            materials: Object.keys(recipe.materials)
        });
    });

    Object.entries(AlbionConfig.WEAPON_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: recipe.category || 'Arma',
            handType: recipe.type || '1H',
            isTool: false,
            materials: Object.keys(recipe.materials)
        });
    });

    Object.entries(AlbionConfig.ARMOR_RECIPES).forEach(([key, recipe]) => {
        items.push({
            type: key,
            name: recipe.displayName || recipe.name,
            category: recipe.category || 'Armadura',
            handType: recipe.type || 'armor',
            isTool: false,
            isArmor: true,
            materials: Object.keys(recipe.materials)
        });
    });

    return items;
}

const ALL_ITEMS = buildItemList();

// ── UIManager (API compartida con refinado y snapshots) ───────────────────────

const uiManager = new UIManager();
try {
    uiManager.initialize();
} catch (e) {
    // El tab de crafteo clásico fue reemplazado por el canvas — los elementos
    // del formulario antiguo ya no existen; UIManager.api sigue operativo.
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

/**
 * Carga un snapshot en un nuevo panel del canvas.
 * @param {Object} snap
 */
function loadSnapshot(snap) {
    if (!craftCanvas) {
        console.warn('[Snapshot] Canvas no disponible');
        return;
    }
    // Abrir un nuevo panel; los datos del snap se podrían pre-rellenar aquí
    const panel = addCraftPanel({ itemType: snap.itemType });
    console.info('[Snapshot] Abierto en panel #' + panel.panelId, snap);
}

renderSnapshots();

// ── Canvas de Crafteo ─────────────────────────────────────────────────────────

const craftCanvas  = document.getElementById('craftCanvas');
const craftPanels  = [];

/**
 * Crea y registra un nuevo CraftPanel en el canvas.
 * @param {Object} [opts] - Opciones pasadas al constructor de CraftPanel
 * @returns {CraftPanel|null}
 */
function addCraftPanel(opts = {}) {
    if (!craftCanvas) return null;
    const panel = new CraftPanel(craftCanvas, opts);
    craftPanels.push(panel);
    // Quitar el panel del array cuando se destruya
    const origDestroy = panel.destroy.bind(panel);
    panel.destroy = function () {
        const idx = craftPanels.indexOf(panel);
        if (idx !== -1) craftPanels.splice(idx, 1);
        origDestroy();
    };
    return panel;
}

// Botón flotante "Nuevo panel"
document.getElementById('addPanelFab')?.addEventListener('click', () => addCraftPanel());

// Panel inicial al cargar la página
addCraftPanel();
