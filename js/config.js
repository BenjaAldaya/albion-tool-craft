/**
 * Configuraciones y constantes de Albion Online
 *
 * Las keys de WEAPON_RECIPES y TOOL_RECIPES coinciden 1:1 con las keys de
 * ITEM_API_NAMES (item_api_names_completo.js), por lo que no se necesita
 * ningún mapeo adicional.
 *
 * Materiales usan las mismas keys del archivo externo: LEATHER, METALBAR, PLANKS, CLOTH
 * Artefactos usan `artifactKey` apuntando directamente a ITEM_API_NAMES.
 */

const AlbionConfig = {

    TIER_NAMES: {
        4: "Adept's",
        5: "Expert's",
        6: "Master's",
        7: "Grandmaster's",
        8: "Elder's"
    },

    ENCHANTMENT_FAME_MULTIPLIER: {
        0: 1,
        1: 2,
        2: 4,
        3: 8,
        4: 16
    },

    QUALITY_NAMES: {
        1: "Normal",
        2: "Good",
        3: "Outstanding",
        4: "Excellent",
        5: "Masterpiece"
    },

    // Fama que otorga CADA UNIDAD de recurso según tier
    // Fuente: mecánica oficial del juego
    FAME_PER_RESOURCE: {
        4: 15,
        5: 45,
        6: 135,
        7: 405,
        8: 1215
    },

    JOURNAL_FAME_REQUIRED: {
        2: 400,
        3: 2400,
        4: 3600,
        5: 7200,
        6: 14400,
        7: 20250,
        8: 58600
    },

    // ─── HERRAMIENTAS ────────────────────────────────────────────────────────────
    TOOL_RECIPES: {
        "2H_TOOL_PICK":   { name: "Pickaxe",        materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_AXE":    { name: "Lumberjack Axe", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_SICKLE": { name: "Sickle",         materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_KNIFE":  { name: "Skinning Knife", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_HAMMER": { name: "Stonecutter",    materials: { PLANKS: 6, METALBAR: 2 } }
    },

    // ─── ARMAS ───────────────────────────────────────────────────────────────────
    WEAPON_RECIPES: {

        // === DAGAS ===
        "MAIN_DAGGER":          { name: "Dagger",             category: "Daga",    type: "1H", materials: { LEATHER: 12, METALBAR: 12 } },
        "2H_DAGGERPAIR":        { name: "Dagger Pair",        category: "Daga",    type: "2H", materials: { LEATHER: 20, METALBAR: 12 } },
        "2H_CLAWPAIR":          { name: "Claws",              category: "Daga",    type: "2H", materials: { LEATHER: 20, METALBAR: 12 } },
        "MAIN_DAGGER_HELL":     { name: "Colmillo Demoníaco", category: "Daga",    type: "2H", artifactKey: "ARTEFACT_MAIN_DAGGER_HELL",      materials: { METALBAR: 20, LEATHER: 12, artifact: 1 } },
        "2H_DUALSICKLE_UNDEAD": { name: "Concede Muertes",   category: "Daga",    type: "2H", artifactKey: "ARTEFACT_2H_DUALSICKLE_UNDEAD",  materials: { LEATHER: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_RAPIER_MORGANA":  { name: "Daga Sangradora",   category: "Daga",    type: "1H", artifactKey: "ARTEFACT_MAIN_RAPIER_MORGANA",   materials: { METALBAR: 16, LEATHER: 8, artifact: 1 } },

        // === ESPADAS ===
        "MAIN_SWORD":              { name: "Sword",        category: "Espada",  type: "1H", materials: { LEATHER: 8, METALBAR: 16 } },
        "2H_CLAYMORE":             { name: "Claymore",     category: "Espada",  type: "2H", materials: { LEATHER: 16, METALBAR: 20 } },
        "2H_DUALSWORD":            { name: "Dual Swords",  category: "Espada",  type: "2H", materials: { LEATHER: 20, METALBAR: 16 } },
        "MAIN_SCIMITAR_MORGANA":   { name: "Carving Sword",    category: "Espada",  type: "1H", artifactKey: "ARTEFACT_MAIN_SCIMITAR_MORGANA",  materials: { METALBAR: 16, LEATHER: 8, artifact: 1 } },
        "2H_DUALSCIMITAR_UNDEAD":  { name: "Dual Scimitar",    category: "Espada",  type: "2H", artifactKey: "ARTEFACT_2H_DUALSCIMITAR_UNDEAD", materials: { LEATHER: 20, METALBAR: 16, artifact: 1 } },

        // === HACHAS ===
        "MAIN_AXE":         { name: "Battleaxe",  category: "Hacha",   type: "1H", materials: { PLANKS: 8, METALBAR: 16 } },
        "2H_AXE":           { name: "Greataxe",   category: "Hacha",   type: "2H", materials: { PLANKS: 12, METALBAR: 20 } },
        "2H_DUALAXE_KEEPER":{ name: "Bear Paws",  category: "Hacha",   type: "2H", artifactKey: "ARTEFACT_2H_DUALAXE_KEEPER", materials: { PLANKS: 16, METALBAR: 16, artifact: 1 } },
        "2H_HALBERD_MORGANA":{ name: "Carrioncaller", category: "Hacha", type: "2H", artifactKey: "ARTEFACT_2H_HALBERD_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },

        // === MARTILLOS ===
        "MAIN_HAMMER":       { name: "War Hammer",    category: "Martillo", type: "1H", materials: { CLOTH: 8, METALBAR: 16 } },
        "2H_HAMMER":         { name: "Great Hammer",  category: "Martillo", type: "2H", materials: { CLOTH: 12, METALBAR: 20 } },
        "2H_DUALHAMMER_HELL":{ name: "Forge Hammers", category: "Martillo", type: "2H", artifactKey: "ARTEFACT_2H_DUALHAMMER_HELL", materials: { CLOTH: 20, METALBAR: 12, artifact: 1 } },

        // === MAZAS ===
        "MAIN_MACE":       { name: "Mace",        category: "Maza",    type: "1H", materials: { CLOTH: 8, METALBAR: 16 } },
        "2H_MACE":         { name: "Great Mace",  category: "Maza",    type: "2H", materials: { CLOTH: 12, METALBAR: 20 } },
        "MAIN_MACE_HELL":  { name: "Incubus Mace",category: "Maza",    type: "1H", artifactKey: "ARTEFACT_MAIN_MACE_HELL",  materials: { CLOTH: 8, METALBAR: 16, artifact: 1 } },
        "2H_MACE_MORGANA": { name: "Camlann Mace",category: "Maza",    type: "2H", artifactKey: "ARTEFACT_2H_MACE_MORGANA", materials: { CLOTH: 20, METALBAR: 12, artifact: 1 } },

        // === LANZAS ===
        "MAIN_SPEAR":        { name: "Spear",       category: "Lanza",   type: "1H", materials: { PLANKS: 8, METALBAR: 16 } },
        "2H_SPEAR":          { name: "Pike",         category: "Lanza",   type: "2H", materials: { PLANKS: 12, METALBAR: 20 } },
        "2H_HALBERD":        { name: "Halberd",      category: "Lanza",   type: "2H", materials: { PLANKS: 16, METALBAR: 16 } },
        "MAIN_SPEAR_KEEPER": { name: "Heron Spear",  category: "Lanza",   type: "1H", artifactKey: "ARTEFACT_MAIN_SPEAR_KEEPER", materials: { PLANKS: 8, METALBAR: 16, artifact: 1 } },

        // === ARCOS ===
        "2H_BOW":        { name: "Bow",             category: "Arco",    type: "2H", materials: { PLANKS: 16, LEATHER: 8 } },
        "2H_WARBOW":     { name: "Warbow",          category: "Arco",    type: "2H", materials: { PLANKS: 20, LEATHER: 12 } },
        "2H_BOW_KEEPER": { name: "Whispering Bow",  category: "Arco",    type: "2H", artifactKey: "ARTEFACT_2H_BOW_KEEPER", materials: { PLANKS: 20, LEATHER: 12, artifact: 1 } },

        // === BALLESTAS ===
        "2H_CROSSBOW":            { name: "Crossbow",      category: "Ballesta", type: "2H", materials: { PLANKS: 16, METALBAR: 8 } },
        "2H_CROSSBOWLARGE":       { name: "Heavy Crossbow",category: "Ballesta", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_CROSSBOWLARGE_MORGANA":{ name: "Energy Shaper",category: "Ballesta", type: "2H", artifactKey: "ARTEFACT_2H_CROSSBOWLARGE_MORGANA", materials: { PLANKS: 20, METALBAR: 8, artifact: 1 } },

        // === BASTONES DE FUEGO ===
        "MAIN_FIRESTAFF":       { name: "Fire Staff",       category: "Bastón de Fuego",   type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "2H_FIRESTAFF":         { name: "Great Fire Staff", category: "Bastón de Fuego",   type: "2H", materials: { CLOTH: 16, PLANKS: 16 } },
        "2H_FIRESTAFF_HELL":    { name: "Infernal Staff",   category: "Bastón de Fuego",   type: "2H", artifactKey: "ARTEFACT_2H_FIRESTAFF_HELL",    materials: { CLOTH: 12, PLANKS: 20, artifact: 1 } },
        "MAIN_FIRESTAFF_KEEPER":{ name: "Blazing Staff",    category: "Bastón de Fuego",   type: "1H", artifactKey: "ARTEFACT_MAIN_FIRESTAFF_KEEPER", materials: { CLOTH: 20, PLANKS: 12, artifact: 1 } },

        // === BASTONES DE HIELO ===
        "MAIN_FROSTSTAFF":        { name: "Frost Staff",       category: "Bastón de Hielo",  type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "2H_FROSTSTAFF":          { name: "Great Frost Staff", category: "Bastón de Hielo",  type: "2H", materials: { CLOTH: 16, PLANKS: 16 } },
        "MAIN_FROSTSTAFF_KEEPER": { name: "Glacial Staff",     category: "Bastón de Hielo",  type: "1H", artifactKey: "ARTEFACT_MAIN_FROSTSTAFF_KEEPER", materials: { CLOTH: 20, PLANKS: 12, artifact: 1 } },

        // === BASTONES ARCANOS ===
        "MAIN_ARCANESTAFF":        { name: "Arcane Staff",       category: "Bastón Arcano",    type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "2H_ARCANESTAFF":          { name: "Great Arcane Staff", category: "Bastón Arcano",    type: "2H", materials: { CLOTH: 16, PLANKS: 16 } },
        "MAIN_ARCANESTAFF_UNDEAD": { name: "Enigmatic Staff",    category: "Bastón Arcano",    type: "1H", artifactKey: "ARTEFACT_MAIN_ARCANESTAFF_UNDEAD", materials: { CLOTH: 12, PLANKS: 20, artifact: 1 } },

        // === BASTONES MALDITOS ===
        "MAIN_CURSEDSTAFF":        { name: "Cursed Staff",       category: "Bastón Maldito",   type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "2H_CURSEDSTAFF":          { name: "Great Cursed Staff", category: "Bastón Maldito",   type: "2H", materials: { CLOTH: 16, PLANKS: 16 } },
        "2H_CURSEDSTAFF_MORGANA":  { name: "Demonic Staff",      category: "Bastón Maldito",   type: "2H", artifactKey: "ARTEFACT_2H_CURSEDSTAFF_MORGANA", materials: { CLOTH: 20, PLANKS: 12, artifact: 1 } },

        // === BASTONES SAGRADOS ===
        "MAIN_HOLYSTAFF":       { name: "Holy Staff",       category: "Bastón Sagrado",   type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "2H_HOLYSTAFF":         { name: "Great Holy Staff", category: "Bastón Sagrado",   type: "2H", materials: { CLOTH: 16, PLANKS: 16 } },
        "2H_HOLYSTAFF_UNDEAD":  { name: "Divine Staff",     category: "Bastón Sagrado",   type: "2H", artifactKey: "ARTEFACT_2H_HOLYSTAFF_UNDEAD", materials: { CLOTH: 20, PLANKS: 12, artifact: 1 } },

        // === BASTONES NATURALES ===
        "MAIN_NATURESTAFF":        { name: "Nature Staff",       category: "Bastón Natural",   type: "1H", materials: { CLOTH: 12, PLANKS: 12 } },
        "MAIN_NATURESTAFF_KEEPER": { name: "Druidic Staff",      category: "Bastón Natural",   type: "1H", artifactKey: "ARTEFACT_MAIN_NATURESTAFF_KEEPER", materials: { CLOTH: 20, PLANKS: 12, artifact: 1 } },

        // === BASTONES DE COMBATE ===
        "2H_QUARTERSTAFF":    { name: "Quarterstaff",      category: "Bastón de Combate", type: "2H", materials: { PLANKS: 20, LEATHER: 12 } },
        "2H_IRONCLADEDSTAFF": { name: "Iron-clad Staff",   category: "Bastón de Combate", type: "2H", materials: { PLANKS: 16, METALBAR: 16 } }
    },

    // ─── IDs de la API ───────────────────────────────────────────────────────────
    // Viene directamente del archivo item_api_names_completo.js
    ITEM_API_NAMES: typeof ITEM_API_NAMES !== 'undefined' ? ITEM_API_NAMES : {},

    API_URL: "https://www.albion-online-data.com/api/v2/stats/prices",

    CITIES: {
        CAERLEON: "Caerleon",
        BRIDGEWATCH: "Bridgewatch",
        FORT_STERLING: "Fort Sterling",
        LYMHURST: "Lymhurst",
        MARTLOCK: "Martlock",
        THETFORD: "Thetford"
    }
};
