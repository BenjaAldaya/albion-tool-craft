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
    const panel = addCraftPanel({ itemType: snap.itemType, tier: snap.tier, enchant: snap.enchant });
    if (panel) panel.applySnap(snap);
    console.info('[Snapshot] Abierto en panel #' + panel?.panelId, snap);
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

// ── Panel "Crafteo del Día" — arrastrable sobre el canvas ─────────────────────

let _dayPos        = null;   // posición persistente mientras está en canvas
let _dayDragCleanup = null;  // cleanup del listener mousedown del header

/**
 * Configura drag para el panel día flotante.
 * @param {HTMLElement} el     - .day-layout-side (se mueve)
 * @param {HTMLElement} handle - .day-panel-header (zona de agarre)
 * @returns {Function} cleanup — remueve el listener cuando se sale de canvas mode
 */
function _setupDayPanelDrag(el, handle) {
    let startX, startY, origLeft, origTop;

    function onDown(e) {
        if (e.button !== 0) return;
        e.preventDefault();
        startX   = e.clientX;
        startY   = e.clientY;
        origLeft = parseInt(el.style.left) || 0;
        origTop  = parseInt(el.style.top)  || 0;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
        el.classList.add('cp-dragging');
    }

    function onMove(e) {
        el.style.left = (origLeft + (e.clientX - startX)) + 'px';
        el.style.top  = (origTop  + (e.clientY - startY)) + 'px';
    }

    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        el.classList.remove('cp-dragging');
        // Persistir posición para próximos toggles de canvas mode
        _dayPos = {
            x: parseInt(el.style.left) || 0,
            y: parseInt(el.style.top)  || 0,
        };
    }

    handle.addEventListener('mousedown', onDown);
    return () => handle.removeEventListener('mousedown', onDown);
}

/**
 * Mueve .day-layout-side al #craftCanvas como elemento arrastrable.
 * Llamado al entrar en canvas mode.
 */
function enterDayPanelCanvas() {
    const el = document.querySelector('.day-layout-side');
    if (!el || !craftCanvas) return;

    // Posición inicial: esquina superior derecha del viewport del canvas
    if (!_dayPos) {
        const wrap = document.getElementById('craftCanvasWrap');
        const wW   = wrap ? Math.max(wrap.clientWidth, 600) : 900;
        _dayPos = { x: Math.max(0, wW - 360), y: 20 };
    }

    el.style.left = _dayPos.x + 'px';
    el.style.top  = _dayPos.y + 'px';
    el.classList.add('day-floating');
    craftCanvas.appendChild(el);

    const header = el.querySelector('.day-panel-header');
    if (header) {
        _dayDragCleanup = _setupDayPanelDrag(el, header);
    }
}

/**
 * Devuelve .day-layout-side al .day-layout original.
 * Llamado al salir de canvas mode.
 */
function exitDayPanelCanvas() {
    const el     = document.querySelector('.day-layout-side');
    const layout = document.querySelector('.day-layout');
    if (!el || !layout) return;

    el.classList.remove('day-floating');
    el.style.left = '';
    el.style.top  = '';
    layout.appendChild(el);

    if (_dayDragCleanup) {
        _dayDragCleanup();
        _dayDragCleanup = null;
    }
}

// ── Modo full-screen cuando el tab Crafteo está activo ───────────────────────

function setCanvasMode(isCanvas) {
    document.body.classList.toggle('canvas-mode', isCanvas);
    if (isCanvas) {
        enterDayPanelCanvas();
    } else {
        exitDayPanelCanvas();
    }
}

// Engancharse a los clics de tabs (initTabs() ya corre antes de este script)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        setCanvasMode(btn.dataset.tab === 'craftingTab');
    });
});

// El tab Crafteo está activo por defecto al cargar
setCanvasMode(true);
