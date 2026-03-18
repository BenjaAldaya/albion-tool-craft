/**
 * Agrega displayName en español a cada receta en config.js.
 * Uso: node scripts/add_display_names.js
 */

const fs = require('fs');
const path = require('path');

// ─── Sufijos de variante y su etiqueta en español ────────────────────────────
const VARIANT_SUFFIXES = ['KEEPER','MORGANA','UNDEAD','CRYSTAL','HELL','AVALON','FEY','SET1','SET2','SET3'];

const SUFFIX_ES = {
    KEEPER:  'del Guardián',
    MORGANA: 'de Morgana',
    UNDEAD:  'Antimuerto',
    CRYSTAL: 'de Cristal',
    HELL:    'del Infierno',
    AVALON:  'de Avalon',
    FEY:     'Feérico',
    SET1:    '',
    SET2:    'II',
    SET3:    'III',
};

// ─── Cuerpo del arma → nombre español ────────────────────────────────────────
const BODY_ES = {
    // Arco
    BOW:                  'Arco',
    LONGBOW:              'Arco Largo',
    WARBOW:               'Arco de Guerra',
    // Ballesta
    '1HCROSSBOW':         'Ballesta (1M)',
    CROSSBOW:             'Ballesta',
    CROSSBOW_CANNON:      'Cañón Ballesta',
    CROSSBOWLARGE:        'Ballesta Grande',
    DUALCROSSBOW:         'Doble Ballesta',
    REPEATINGCROSSBOW:    'Ballesta Repetidora',
    // Bastón Arcano
    ARCANE_RINGPAIR:      'Par de Anillos Arcanos',
    ARCANESTAFF:          'Bastón Arcano',
    ENIGMATICORB:         'Orbe Enigmático',
    ENIGMATICSTAFF:       'Bastón Enigmático',
    // Bastón Maldito
    CURSEDSTAFF:          'Bastón Maldito',
    DEMONICSTAFF:         'Bastón Demoníaco',
    SKULLORB:             'Orbe Calavera',
    // Bastón Natural
    NATURESTAFF:          'Bastón Natural',
    WILDSTAFF:            'Bastón Salvaje',
    // Bastón Sagrado
    DIVINESTAFF:          'Bastón Divino',
    HOLYSTAFF:            'Bastón Sagrado',
    // Bastón de Combate
    COMBATSTAFF:          'Bastón de Combate',
    DOUBLEBLADEDSTAFF:    'Bastón de Doble Filo',
    IRONCLADEDSTAFF:      'Bastón Acorazado',
    QUARTERSTAFF:         'Bastón de Cuarto',
    ROCKSTAFF:            'Bastón de Roca',
    TWINSCYTHE:           'Doble Guadaña',
    // Bastón de Fuego
    FIRE_RINGPAIR:        'Par de Anillos de Fuego',
    FIRESTAFF:            'Bastón de Fuego',
    INFERNOSTAFF:         'Bastón Infernal',
    // Bastón de Hielo
    FROSTSTAFF:           'Bastón de Escarcha',
    GLACIALSTAFF:         'Bastón Glacial',
    ICECRYSTAL:           'Cristal de Hielo',
    ICEGAUNTLETS:         'Guanteletes de Hielo',
    // Daga
    CLAWPAIR:             'Garras',
    DAGGER:               'Daga',
    DAGGER_KATAR:         'Katar',
    DAGGERPAIR:           'Par de Dagas',
    DUALSICKLE:           'Doble Hoz',
    RAPIER:               'Estoque',
    // Espada
    CLAYMORE:             'Claymore',
    CLEAVER:              'Cuchilla',
    DUALSCIMITAR:         'Doble Cimitarra',
    DUALSWORD:            'Doble Espada',
    SCIMITAR:             'Cimitarra',
    SWORD:                'Espada',
    // Hacha
    AXE:                  'Hacha',
    DUALAXE:              'Doble Hacha',
    HALBERD:              'Alabarda',
    SCYTHE:               'Guadaña',
    // Lanza
    GLAIVE:               'Voulge',
    HARPOON:              'Arpón',
    SPEAR:                'Lanza',
    SPEAR_LANCE:          'Lanza de Caballería',
    TRIDENT:              'Tridente',
    // Manopla
    IRONGAUNTLETS:        'Guanteletes de Hierro',
    KNUCKLES:             'Nudillos',
    // Martillo
    DUALHAMMER:           'Doble Martillo',
    HAMMER:               'Martillo',
    POLEHAMMER:           'Mazo de Asta',
    RAM:                  'Ariete',
    // Maza
    DUALMACE:             'Doble Maza',
    FLAIL:                'Flagelo',
    MACE:                 'Maza',
    ROCKMACE:             'Maza de Roca',
    // Herramientas
    TOOL_AXE:             'Hacha de Tala',
    TOOL_FISHING:         'Caña de Pesca',
    TOOL_FISHINGROD:      'Caña de Pesca',
    TOOL_HAMMER:          'Pico de Minería',
    TOOL_KNIFE:           'Cuchillo de Desuello',
    TOOL_PICK:            'Pico',
    TOOL_SIEGEHAMMER:     'Martillo de Asedio',
    TOOL_SICKLE:          'Hoz',
    TOOL_SKINNING:        'Cuchillo de Desuello',
};

// ─── Bases de armadura y su nombre base ──────────────────────────────────────
const ARMOR_BASES = [
    'ARMOR_CLOTH', 'ARMOR_LEATHER', 'ARMOR_PLATE',
    'HEAD_CLOTH',  'HEAD_LEATHER',  'HEAD_PLATE',
    'SHOES_CLOTH', 'SHOES_LEATHER', 'SHOES_PLATE',
];
const ARMOR_BASE_ES = {
    ARMOR_CLOTH:   'Túnica',
    ARMOR_LEATHER: 'Chaqueta',
    ARMOR_PLATE:   'Armadura',
    HEAD_CLOTH:    'Gorro',
    HEAD_LEATHER:  'Capucha',
    HEAD_PLATE:    'Casco',
    SHOES_CLOTH:   'Sandalias',
    SHOES_LEATHER: 'Botas',
    SHOES_PLATE:   'Botas de Placa',
};

// Nombres específicos de los sets numerados (corresponden a nombres del juego)
const SPECIFIC_NAMES = {
    ARMOR_CLOTH_SET1:   'Túnica del Erudito',
    ARMOR_CLOTH_SET2:   'Túnica del Clérigo',
    ARMOR_CLOTH_SET3:   'Túnica del Mago',
    ARMOR_LEATHER_SET1: 'Chaqueta del Cazador',
    ARMOR_LEATHER_SET2: 'Chaqueta Mercenaria',
    ARMOR_LEATHER_SET3: 'Chaqueta del Asesino',
    ARMOR_PLATE_SET1:   'Armadura del Soldado',
    ARMOR_PLATE_SET2:   'Armadura del Caballero',
    ARMOR_PLATE_SET3:   'Armadura del Guardián',
    HEAD_CLOTH_SET1:    'Gorro del Erudito',
    HEAD_CLOTH_SET2:    'Gorro del Clérigo',
    HEAD_CLOTH_SET3:    'Gorro del Mago',
    HEAD_LEATHER_SET1:  'Capucha del Cazador',
    HEAD_LEATHER_SET2:  'Capucha Mercenaria',
    HEAD_LEATHER_SET3:  'Capucha del Asesino',
    HEAD_PLATE_SET1:    'Casco del Soldado',
    HEAD_PLATE_SET2:    'Casco del Caballero',
    HEAD_PLATE_SET3:    'Casco del Guardián',
    SHOES_CLOTH_SET1:   'Sandalias del Erudito',
    SHOES_CLOTH_SET2:   'Sandalias del Clérigo',
    SHOES_CLOTH_SET3:   'Sandalias del Mago',
    SHOES_LEATHER_SET1: 'Botas del Cazador',
    SHOES_LEATHER_SET2: 'Botas Mercenarias',
    SHOES_LEATHER_SET3: 'Botas del Asesino',
    SHOES_PLATE_SET1:   'Botas del Soldado',
    SHOES_PLATE_SET2:   'Botas del Caballero',
    SHOES_PLATE_SET3:   'Botas del Guardián',
    '2H_KNUCKLES_SET1': 'Nudillos',
    '2H_KNUCKLES_SET2': 'Nudillos II',
    '2H_KNUCKLES_SET3': 'Nudillos III',
};

// ─── Función principal de traducción ────────────────────────────────────────
function getDisplayName(key, category) {
    // 1. Override específico
    if (SPECIFIC_NAMES[key]) return SPECIFIC_NAMES[key];

    // 2. Patrón armadura: SLOT_MATERIAL_SUFFIX
    for (const base of ARMOR_BASES) {
        if (key.startsWith(base + '_')) {
            const suffix = key.slice(base.length + 1);
            const baseName = ARMOR_BASE_ES[base];
            const suffixLabel = SUFFIX_ES[suffix];
            if (suffixLabel !== undefined) {
                return suffixLabel ? `${baseName} ${suffixLabel}` : baseName;
            }
            // Sufijo desconocido — usar categoría
            return category;
        }
    }

    // 3. Herramienta: 2H_TOOL_*
    if (key.startsWith('2H_TOOL_')) {
        const rest = key.slice('2H_'.length); // e.g. TOOL_PICK_AVALON
        const parts = rest.split('_');
        const last = parts[parts.length - 1];
        if (VARIANT_SUFFIXES.includes(last)) {
            const body = parts.slice(0, -1).join('_');
            const baseName = BODY_ES[body] || body;
            const suffixLabel = SUFFIX_ES[last] || '';
            return suffixLabel ? `${baseName} ${suffixLabel}` : baseName;
        }
        return BODY_ES[rest] || rest;
    }

    // 4. Arma: 2H_BODY o MAIN_BODY con sufijo opcional
    let workKey = key;
    if (key.startsWith('2H_'))   workKey = key.slice('2H_'.length);
    else if (key.startsWith('MAIN_')) workKey = key.slice('MAIN_'.length);

    const parts = workKey.split('_');
    const last = parts[parts.length - 1];
    let body = workKey, suffix = null;

    if (VARIANT_SUFFIXES.includes(last)) {
        suffix = last;
        body = parts.slice(0, -1).join('_');
    }

    const baseName = BODY_ES[body] || category;
    const suffixLabel = suffix ? (SUFFIX_ES[suffix] || '') : '';
    return suffixLabel ? `${baseName} ${suffixLabel}` : baseName;
}

// ─── Leer y parchear config.js ───────────────────────────────────────────────
const configPath = path.join(__dirname, '..', 'js', 'config.js');
let content = fs.readFileSync(configPath, 'utf8');

// Evitar duplicar si ya existe displayName
if (content.includes('displayName:')) {
    console.log('displayName ya presente — eliminando entradas previas para re-generar...');
    content = content.replace(/displayName: "[^"]*", /g, '');
}

let changed = 0;
// Regex: captura indent, key, name, category (category siempre en la misma línea)
const RE = /^( {4,8})"([^"]+)": \{ name: "([^"]+)", category: "([^"]+)"/gm;

content = content.replace(RE, (match, indent, key, nameVal, cat) => {
    const displayName = getDisplayName(key, cat);
    changed++;
    return `${indent}"${key}": { displayName: "${displayName}", name: "${nameVal}", category: "${cat}"`;
});

fs.writeFileSync(configPath, content, 'utf8');
console.log(`✓ ${changed} recetas actualizadas con displayName en js/config.js`);

// ─── Verificación: mostrar las que quedaron sin traducir ─────────────────────
const leftover = [...content.matchAll(/displayName: "([^"]+)"/g)]
    .map(m => m[1])
    .filter(n => /^[A-Z0-9_]+$/.test(n)); // si es todo mayúsculas = sin traducir

if (leftover.length > 0) {
    console.warn(`⚠  ${leftover.length} entradas sin traducir (mostrando primeras 10):`);
    console.warn(leftover.slice(0, 10).join('\n'));
} else {
    console.log('✓ Todos los nombres traducidos correctamente.');
}
