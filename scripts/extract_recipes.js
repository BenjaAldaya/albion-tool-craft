/**
 * extract_recipes.js
 *
 * Descarga items.xml de ao-data/ao-bin-dumps y extrae todas las recetas
 * de crafteo para weapons, armors, helmets, boots, offhands y tools.
 *
 * Uso:
 *   node scripts/extract_recipes.js               -> resumen por categoría
 *   node scripts/extract_recipes.js --verify      -> compara config.js con el XML
 *   node scripts/extract_recipes.js --missing     -> faltantes en formato config.js
 *   node scripts/extract_recipes.js --fix         -> reescribe config.js completo
 *   node scripts/extract_recipes.js --plan        -> genera CRAFTING_PLAN.md
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ITEMS_XML_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/items.xml';
const CONFIG_PATH   = path.join(__dirname, '..', 'js', 'config.js');

// ─── Categorías ──────────────────────────────────────────────────────────────

const WEAPON_SUBS = new Set([
    'sword', 'axe', 'bow', 'crossbow', 'dagger', 'firestaff', 'froststaff',
    'arcanestaff', 'cursestaff', 'holystaff', 'naturestaff', 'hammer',
    'mace', 'spear', 'quarterstaff', 'knuckles', 'shapeshifterstaff',
    'shieldtype', 'booktype', 'torchtype'  // offhands
]);

const ARMOR_SUBS = new Set([
    'cloth_armor', 'leather_armor', 'plate_armor',
    'cloth_helmet', 'leather_helmet', 'plate_helmet',
    'cloth_shoes', 'leather_shoes', 'plate_shoes'
]);

const TOOL_SUBS = new Set(['pick', 'axe_tool', 'sickle', 'knife', 'hammer_tool', 'tracking']);

const CATEGORY_NAMES = {
    sword: 'Espada', axe: 'Hacha', bow: 'Arco', crossbow: 'Ballesta',
    dagger: 'Daga', firestaff: 'Bastón de Fuego', froststaff: 'Bastón de Hielo',
    arcanestaff: 'Bastón Arcano', cursestaff: 'Bastón Maldito',
    holystaff: 'Bastón Sagrado', naturestaff: 'Bastón Natural',
    hammer: 'Martillo', mace: 'Maza', spear: 'Lanza',
    quarterstaff: 'Bastón de Combate', knuckles: 'Manopla',
    shapeshifterstaff: 'Bastón Transformador',
    shieldtype: 'Escudo', booktype: 'Libro', torchtype: 'Antorcha',
    cloth_armor: 'Armadura de Tela', leather_armor: 'Armadura de Cuero', plate_armor: 'Armadura de Placa',
    cloth_helmet: 'Casco de Tela', leather_helmet: 'Casco de Cuero', plate_helmet: 'Casco de Placa',
    cloth_shoes: 'Botas de Tela', leather_shoes: 'Botas de Cuero', plate_shoes: 'Botas de Placa',
    tool: 'Herramienta'
};

const RESOURCE_KEYS = ['METALBAR', 'LEATHER', 'PLANKS', 'CLOTH', 'FIBER', 'ROCK', 'ORE', 'HIDE', 'WOOD'];

// ─── Fetch ────────────────────────────────────────────────────────────────────

function fetchXML(url) {
    return new Promise((resolve, reject) => {
        process.stdout.write('Descargando items.xml... ');
        https.get(url, (res) => {
            if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => { console.log('OK'); resolve(chunks.join('')); });
        }).on('error', reject);
    });
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function stripTier(name) { return name.replace(/^T\d+_/, ''); }

function normalizeResource(uniquename) {
    const s = uniquename.replace(/^T\d+_/, '').replace(/_LEVEL\d+$/, '');
    return RESOURCE_KEYS.find(k => s === k) || null;
}

function parseCraftBlock(craftBlock) {
    const resources  = {};
    let artifactKey  = null;
    const resRe = /<craftresource uniquename="([^"]+)" count="(\d+)"/g;
    let m;
    while ((m = resRe.exec(craftBlock)) !== null) {
        const resName = m[1];
        const count   = parseInt(m[2]);
        const baseKey = normalizeResource(resName);
        if (baseKey) {
            resources[baseKey] = count;
        } else if (resName.includes('ARTEFACT_')) {
            artifactKey = stripTier(resName);
        }
    }
    return { resources, artifactKey };
}

function parseItems(xml) {
    const weapons = new Map();   // key -> item
    const armors  = new Map();
    const tools   = new Map();

    const tagRe = /<(weapon|equipmentitem)\s([^>]+)>([\s\S]*?)<\/\1>/g;
    let match;

    while ((match = tagRe.exec(xml)) !== null) {
        const [, tagType, attrs, inner] = match;

        const uniquename    = (attrs.match(/uniquename="([^"]+)"/) || [])[1];
        if (!uniquename || !/^T4_/.test(uniquename)) continue;

        const shopcategory  = (attrs.match(/shopcategory="([^"]+)"/)  || [])[1];
        const subcat1       = (attrs.match(/shopsubcategory1="([^"]+)"/) || [])[1];
        const craftcat      = (attrs.match(/craftingcategory="([^"]+)"/) || [])[1];
        const twohanded     = attrs.includes('twohanded="true"');
        const slottype      = (attrs.match(/slottype="([^"]+)"/) || [])[1];

        const isTool    = craftcat === 'tools';
        const isWeapon  = shopcategory === 'weapons'  && WEAPON_SUBS.has(subcat1);
        const isArmor   = (shopcategory === 'armors' || shopcategory === 'head' || shopcategory === 'shoes' || shopcategory === 'offhands') && ARMOR_SUBS.has(subcat1);

        if (!isTool && !isWeapon && !isArmor) continue;

        // Solo el primer bloque de craftingrequirements (base sin enchantment)
        const craftMatch = inner.match(/<craftingrequirements[^>]*>([\s\S]*?)<\/craftingrequirements>/);
        if (!craftMatch) continue;

        const { resources, artifactKey } = parseCraftBlock(craftMatch[1]);
        if (Object.keys(resources).length === 0) continue;

        const baseKey = stripTier(uniquename);

        const item = {
            baseKey,
            subcat1,
            artifactKey,
            resources,
            categoryName: isTool ? 'Herramienta' : (CATEGORY_NAMES[subcat1] || subcat1),
            itemType: isTool ? 'tool' : isWeapon ? (twohanded ? '2H' : '1H') : (slottype || subcat1)
        };

        if (isTool)       tools.set(baseKey, item);
        else if (isWeapon) weapons.set(baseKey, item);
        else               armors.set(baseKey, item);
    }

    return { weapons, armors, tools };
}

// ─── Config loader ────────────────────────────────────────────────────────────

function loadConfig() {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');

    function parseBlock(blockContent) {
        const result = {};
        if (!blockContent) return result;
        // Match each recipe entry — the outer object may contain nested {} (materials)
        // Pattern: "KEY": { ...everything up to the final }, on this logical entry
        const entryRe = /"([\w_]+)"\s*:\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g;
        let m;
        while ((m = entryRe.exec(blockContent)) !== null) {
            const key  = m[1];
            const body = m[2];
            const matMatch = body.match(/materials\s*:\s*\{([^}]+)\}/);
            const materials = {};
            if (matMatch) {
                const matRe = /(\w+)\s*:\s*(\d+)/g;
                let mm;
                while ((mm = matRe.exec(matMatch[1])) !== null) {
                    materials[mm[1]] = parseInt(mm[2]);
                }
            }
            const artMatch = body.match(/artifactKey\s*:\s*"([^"]+)"/);
            result[key] = { artifactKey: artMatch ? artMatch[1] : null, materials };
        }
        return result;
    }

    const weaponMatch = content.match(/WEAPON_RECIPES\s*:\s*\{([\s\S]*?)\n\s{4}\}/);
    const toolMatch   = content.match(/TOOL_RECIPES\s*:\s*\{([\s\S]*?)\n\s{4}\}/);
    const armorMatch  = content.match(/ARMOR_RECIPES\s*:\s*\{([\s\S]*?)\n\s{4}\}/);

    return {
        content,
        weaponEntries: parseBlock(weaponMatch?.[1]),
        toolEntries:   parseBlock(toolMatch?.[1]),
        armorEntries:  parseBlock(armorMatch?.[1])
    };
}

// ─── Entry generator ─────────────────────────────────────────────────────────

function generateEntry(item) {
    const matStr = Object.entries(item.resources).map(([k, v]) => `${k}: ${v}`).join(', ');
    const artifactLine = item.artifactKey ? `\n        artifactKey: "${item.artifactKey}",` : '';
    const mats = item.artifactKey ? `{ ${matStr}, artifact: 1 }` : `{ ${matStr} }`;
    return `        "${item.baseKey}": { name: "${item.baseKey}", category: "${item.categoryName}", type: "${item.itemType}",${artifactLine} materials: ${mats} },`;
}

// ─── Block generator ─────────────────────────────────────────────────────────

function generateBlock(label, itemsMap, groupOrder) {
    // Group by category
    const byCategory = new Map();
    for (const [, item] of itemsMap) {
        if (!byCategory.has(item.categoryName)) byCategory.set(item.categoryName, []);
        byCategory.get(item.categoryName).push(item);
    }

    let block = `    ${label}: {\n\n`;
    const cats = [...byCategory.keys()].sort();
    for (const cat of cats) {
        block += `        // === ${cat.toUpperCase()} ===\n`;
        for (const item of byCategory.get(cat).sort((a, b) => a.baseKey.localeCompare(b.baseKey))) {
            block += generateEntry(item) + '\n';
        }
        block += '\n';
    }
    block += `    }`;
    return block;
}

// ─── Verify ───────────────────────────────────────────────────────────────────

function verify(xmlMap, configEntries, label) {
    const issues = [];
    for (const [key, cfg] of Object.entries(configEntries)) {
        const xml = xmlMap.get(key);
        if (!xml) {
            issues.push({ key, type: 'NOT_IN_XML' });
            continue;
        }
        const diffs = [];
        for (const [res, qty] of Object.entries(xml.resources)) {
            if (cfg.materials[res] === undefined) diffs.push(`falta ${res}:${qty}`);
            else if (cfg.materials[res] !== qty)  diffs.push(`${res}: config=${cfg.materials[res]} xml=${qty}`);
        }
        for (const [res] of Object.entries(cfg.materials)) {
            if (res === 'artifact') continue;
            if (xml.resources[res] === undefined) diffs.push(`recurso extra: ${res}`);
        }
        const cfgArt = cfg.artifactKey, xmlArt = xml.artifactKey;
        if (xmlArt && !cfgArt)           diffs.push(`falta artifactKey: "${xmlArt}"`);
        else if (!xmlArt && cfgArt)      diffs.push(`artifactKey sobrante: "${cfgArt}"`);
        else if (xmlArt && cfgArt && xmlArt !== cfgArt) diffs.push(`artifactKey: config="${cfgArt}" xml="${xmlArt}"`);

        if (diffs.length > 0) issues.push({ key, type: 'MISMATCH', diffs, xml });
    }
    return issues;
}

// ─── Fix ─────────────────────────────────────────────────────────────────────

function fixConfig(parsed, xmlWeapons, xmlArmors, xmlTools) {
    let { content } = parsed;

    // Reemplazar o insertar TOOL_RECIPES
    const toolBlock = generateBlock('TOOL_RECIPES', xmlTools, []);
    if (/TOOL_RECIPES\s*:/.test(content)) {
        content = content.replace(/TOOL_RECIPES\s*:\s*\{[\s\S]*?\n\s{4}\}/, toolBlock);
    } else {
        // Insertar antes de WEAPON_RECIPES
        content = content.replace(/(\s*\/\/ ─── ARMAS)/, `\n    ${toolBlock},\n$1`);
    }

    // Reemplazar WEAPON_RECIPES
    const weaponBlock = generateBlock('WEAPON_RECIPES', xmlWeapons, []);
    content = content.replace(/WEAPON_RECIPES\s*:\s*\{[\s\S]*?\n\s{4}\}/, weaponBlock);

    // Reemplazar o agregar ARMOR_RECIPES
    const armorBlock = generateBlock('ARMOR_RECIPES', xmlArmors, []);
    if (/ARMOR_RECIPES\s*:/.test(content)) {
        content = content.replace(/ARMOR_RECIPES\s*:\s*\{[\s\S]*?\n\s{4}\}/, armorBlock);
    } else {
        // Insertar después de WEAPON_RECIPES
        content = content.replace(/(WEAPON_RECIPES\s*:\s*\{[\s\S]*?\n\s{4}\})/, `$1,\n\n    ${armorBlock}`);
    }

    return content;
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

function generatePlan(xmlWeapons, xmlArmors, xmlTools, configWeapons, configArmors, configTools) {
    const allExisting = new Set([
        ...Object.keys(configWeapons),
        ...Object.keys(configArmors),
        ...Object.keys(configTools)
    ]);

    let md = `# Crafting Plan — Albion Online Tool\n\n`;
    md += `> Generado automáticamente desde items.xml.\n`;
    md += `> Fuente: https://github.com/ao-data/ao-bin-dumps\n\n---\n\n`;

    let done = 0, pending = 0;

    const renderSection = (title, map) => {
        const byCategory = new Map();
        for (const [, item] of map) {
            if (!byCategory.has(item.categoryName)) byCategory.set(item.categoryName, []);
            byCategory.get(item.categoryName).push(item);
        }
        md += `## ${title}\n\n`;
        for (const [cat, items] of [...byCategory].sort((a, b) => a[0].localeCompare(b[0]))) {
            md += `### ${cat}\n`;
            for (const item of items.sort((a, b) => a.baseKey.localeCompare(b.baseKey))) {
                const checked = allExisting.has(item.baseKey);
                const art = item.artifactKey ? ` *(${item.artifactKey})*` : '';
                const mats = Object.entries(item.resources).map(([k, v]) => `${k}:${v}`).join(', ');
                md += `- [${checked ? 'x' : ' '}] \`${item.baseKey}\` — ${mats}${art}\n`;
                checked ? done++ : pending++;
            }
            md += '\n';
        }
    };

    renderSection('Herramientas', xmlTools);
    renderSection('Armas', xmlWeapons);
    renderSection('Equipamiento (Armadura / Casco / Botas / Offhands)', xmlArmors);

    md += `---\n\n**Progreso: ${done} ✓ / ${pending} pendientes / ${done + pending} total**\n`;
    return md;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const args        = process.argv.slice(2);
    const doVerify    = args.includes('--verify');
    const doFix       = args.includes('--fix');
    const showMissing = args.includes('--missing');
    const genPlan     = args.includes('--plan');

    const xml = await fetchXML(ITEMS_XML_URL);
    const { weapons: xmlWeapons, armors: xmlArmors, tools: xmlTools } = parseItems(xml);

    console.log(`\nXML — Weapons: ${xmlWeapons.size}  Armors: ${xmlArmors.size}  Tools: ${xmlTools.size}`);

    const parsed = loadConfig();
    const { weaponEntries, toolEntries, armorEntries } = parsed;

    const allXmlKeys = new Set([...xmlWeapons.keys(), ...xmlArmors.keys(), ...xmlTools.keys()]);
    const allCfgKeys = new Set([...Object.keys(weaponEntries), ...Object.keys(toolEntries), ...Object.keys(armorEntries)]);
    const missing    = [...allXmlKeys].filter(k => !allCfgKeys.has(k));

    console.log(`Config — Weapons: ${Object.keys(weaponEntries).length}  Armors: ${Object.keys(armorEntries).length}  Tools: ${Object.keys(toolEntries).length}`);
    console.log(`Faltantes: ${missing.length}\n`);

    // ── VERIFY ──
    if (doVerify) {
        const wIssues = verify(xmlWeapons, weaponEntries, 'WEAPON');
        const aIssues = verify(xmlArmors,  armorEntries,  'ARMOR');
        const tIssues = verify(xmlTools,   toolEntries,   'TOOL');
        const all     = [...wIssues, ...aIssues, ...tIssues];

        if (all.length === 0) {
            console.log('✓ Todas las entradas coinciden con el XML.\n');
            return;
        }
        console.log(`⚠ ${all.length} entradas con problemas:\n`);
        for (const issue of all) {
            if (issue.type === 'NOT_IN_XML') {
                console.log(`  ✗ ${issue.key} → ID no existe en el XML (revisar manualmente)`);
            } else {
                console.log(`  ✗ ${issue.key}`);
                for (const d of issue.diffs) console.log(`      → ${d}`);
                console.log(`      CORRECTO: ${generateEntry(issue.xml)}`);
            }
        }
        return;
    }

    // ── FIX ──
    if (doFix) {
        console.log('Reescribiendo config.js con datos del XML...');
        const newContent = fixConfig(parsed, xmlWeapons, xmlArmors, xmlTools);
        fs.writeFileSync(CONFIG_PATH, newContent, 'utf8');
        console.log('✓ config.js actualizado.');
        console.log(`  WEAPON_RECIPES: ${xmlWeapons.size} entradas`);
        console.log(`  ARMOR_RECIPES:  ${xmlArmors.size} entradas`);
        console.log(`  TOOL_RECIPES:   ${xmlTools.size} entradas`);
        return;
    }

    // ── MISSING ──
    if (showMissing) {
        const missingWeapons = [...xmlWeapons.entries()].filter(([k]) => !allCfgKeys.has(k));
        const missingArmors  = [...xmlArmors.entries()].filter(([k]) => !allCfgKeys.has(k));
        const missingTools   = [...xmlTools.entries()].filter(([k]) => !allCfgKeys.has(k));

        const printGroup = (label, entries) => {
            if (entries.length === 0) return;
            console.log(`\n        // === ${label} ===`);
            for (const [, item] of entries) console.log(generateEntry(item));
        };

        printGroup('TOOLS FALTANTES',   missingTools);
        printGroup('WEAPONS FALTANTES', missingWeapons);
        printGroup('ARMOR FALTANTES',   missingArmors);
        return;
    }

    // ── PLAN ──
    if (genPlan) {
        const md = generatePlan(xmlWeapons, xmlArmors, xmlTools, weaponEntries, armorEntries, toolEntries);
        const planPath = path.join(__dirname, '..', 'CRAFTING_PLAN.md');
        fs.writeFileSync(planPath, md, 'utf8');
        console.log(`✓ CRAFTING_PLAN.md generado (${[...allXmlKeys].length} items total).`);
        return;
    }

    // ── DEFAULT: resumen ──
    const byCategory = new Map();
    for (const [key, item] of [...xmlWeapons, ...xmlArmors, ...xmlTools]) {
        const cat = item.categoryName;
        if (!byCategory.has(cat)) byCategory.set(cat, { total: 0, done: 0 });
        byCategory.get(cat).total++;
        if (allCfgKeys.has(key)) byCategory.get(cat).done++;
    }
    for (const [cat, { total, done }] of [...byCategory].sort((a, b) => a[0].localeCompare(b[0]))) {
        const pct = Math.round(done / total * 100);
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        console.log(`  ${cat.padEnd(28)} [${bar}] ${done}/${total}`);
    }
    console.log('\n  --verify   comparar config.js con XML');
    console.log('  --fix      reescribir config.js completo desde XML');
    console.log('  --missing  ver entradas faltantes en formato config.js');
    console.log('  --plan     generar CRAFTING_PLAN.md');
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
