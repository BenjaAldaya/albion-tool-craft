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

        // === HERRAMIENTA ===
        "2H_TOOL_AXE": { displayName: "Hacha de Tala", name: "2H_TOOL_AXE", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_AXE_AVALON": { displayName: "Hacha de Tala de Avalon", name: "2H_TOOL_AXE_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_FISHINGROD": { displayName: "Caña de Pesca", name: "2H_TOOL_FISHINGROD", category: "Herramienta", type: "tool", materials: { PLANKS: 6, CLOTH: 2 } },
        "2H_TOOL_FISHINGROD_AVALON": { displayName: "Caña de Pesca de Avalon", name: "2H_TOOL_FISHINGROD_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, CLOTH: 2 } },
        "2H_TOOL_HAMMER": { displayName: "Pico de Minería", name: "2H_TOOL_HAMMER", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_HAMMER_AVALON": { displayName: "Pico de Minería de Avalon", name: "2H_TOOL_HAMMER_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_KNIFE": { displayName: "Cuchillo de Desuello", name: "2H_TOOL_KNIFE", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_KNIFE_AVALON": { displayName: "Cuchillo de Desuello de Avalon", name: "2H_TOOL_KNIFE_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_PICK": { displayName: "Pico", name: "2H_TOOL_PICK", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_PICK_AVALON": { displayName: "Pico de Avalon", name: "2H_TOOL_PICK_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_SICKLE": { displayName: "Hoz", name: "2H_TOOL_SICKLE", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_SICKLE_AVALON": { displayName: "Hoz de Avalon", name: "2H_TOOL_SICKLE_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 6, METALBAR: 2 } },
        "2H_TOOL_SIEGEHAMMER": { displayName: "Martillo de Asedio", name: "2H_TOOL_SIEGEHAMMER", category: "Herramienta", type: "tool", materials: { PLANKS: 8 } },
        "2H_TOOL_SIEGEHAMMER_AVALON": { displayName: "Martillo de Asedio de Avalon", name: "2H_TOOL_SIEGEHAMMER_AVALON", category: "Herramienta", type: "tool", materials: { PLANKS: 8 } },

    },

    // ─── ARMAS ───────────────────────────────────────────────────────────────────
        WEAPON_RECIPES: {

        // === ARCO ===
        "2H_BOW": { displayName: "Arco", name: "2H_BOW", category: "Arco", type: "2H", materials: { PLANKS: 32 } },
        "2H_BOW_AVALON": { displayName: "Arco de Avalon", name: "2H_BOW_AVALON", category: "Arco", type: "2H",
        artifactKey: "ARTEFACT_2H_BOW_AVALON", materials: { PLANKS: 32, artifact: 1 } },
        "2H_BOW_CRYSTAL": { displayName: "Arco de Cristal", name: "2H_BOW_CRYSTAL", category: "Arco", type: "2H",
        artifactKey: "ARTEFACT_2H_BOW_CRYSTAL", materials: { PLANKS: 32, artifact: 1 } },
        "2H_BOW_HELL": { displayName: "Arco del Infierno", name: "2H_BOW_HELL", category: "Arco", type: "2H",
        artifactKey: "ARTEFACT_2H_BOW_HELL", materials: { PLANKS: 32, artifact: 1 } },
        "2H_BOW_KEEPER": { displayName: "Arco del Guardián", name: "2H_BOW_KEEPER", category: "Arco", type: "2H",
        artifactKey: "ARTEFACT_2H_BOW_KEEPER", materials: { PLANKS: 32, artifact: 1 } },
        "2H_LONGBOW": { displayName: "Arco Largo", name: "2H_LONGBOW", category: "Arco", type: "2H", materials: { PLANKS: 32 } },
        "2H_LONGBOW_UNDEAD": { displayName: "Arco Largo Antimuerto", name: "2H_LONGBOW_UNDEAD", category: "Arco", type: "2H",
        artifactKey: "ARTEFACT_2H_LONGBOW_UNDEAD", materials: { PLANKS: 32, artifact: 1 } },
        "2H_WARBOW": { displayName: "Arco de Guerra", name: "2H_WARBOW", category: "Arco", type: "2H", materials: { PLANKS: 32 } },

        // === BALLESTA ===
        "2H_CROSSBOW": { displayName: "Ballesta", name: "2H_CROSSBOW", category: "Ballesta", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_CROSSBOW_CANNON_AVALON": { displayName: "Cañón Ballesta de Avalon", name: "2H_CROSSBOW_CANNON_AVALON", category: "Ballesta", type: "2H",
        artifactKey: "ARTEFACT_2H_CROSSBOW_CANNON_AVALON", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_CROSSBOWLARGE": { displayName: "Ballesta Grande", name: "2H_CROSSBOWLARGE", category: "Ballesta", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_CROSSBOWLARGE_MORGANA": { displayName: "Ballesta Grande de Morgana", name: "2H_CROSSBOWLARGE_MORGANA", category: "Ballesta", type: "2H",
        artifactKey: "ARTEFACT_2H_CROSSBOWLARGE_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_DUALCROSSBOW_CRYSTAL": { displayName: "Doble Ballesta de Cristal", name: "2H_DUALCROSSBOW_CRYSTAL", category: "Ballesta", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALCROSSBOW_CRYSTAL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_DUALCROSSBOW_HELL": { displayName: "Doble Ballesta del Infierno", name: "2H_DUALCROSSBOW_HELL", category: "Ballesta", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALCROSSBOW_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_REPEATINGCROSSBOW_UNDEAD": { displayName: "Ballesta Repetidora Antimuerto", name: "2H_REPEATINGCROSSBOW_UNDEAD", category: "Ballesta", type: "2H",
        artifactKey: "ARTEFACT_2H_REPEATINGCROSSBOW_UNDEAD", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_1HCROSSBOW": { displayName: "Ballesta (1M)", name: "MAIN_1HCROSSBOW", category: "Ballesta", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },

        // === BASTÓN ARCANO ===
        "2H_ARCANE_RINGPAIR_AVALON": { displayName: "Par de Anillos Arcanos de Avalon", name: "2H_ARCANE_RINGPAIR_AVALON", category: "Bastón Arcano", type: "2H",
        artifactKey: "ARTEFACT_2H_ARCANE_RINGPAIR_AVALON", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_ARCANESTAFF": { displayName: "Bastón Arcano", name: "2H_ARCANESTAFF", category: "Bastón Arcano", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_ARCANESTAFF_CRYSTAL": { displayName: "Bastón Arcano de Cristal", name: "2H_ARCANESTAFF_CRYSTAL", category: "Bastón Arcano", type: "2H",
        artifactKey: "ARTEFACT_2H_ARCANESTAFF_CRYSTAL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_ARCANESTAFF_HELL": { displayName: "Bastón Arcano del Infierno", name: "2H_ARCANESTAFF_HELL", category: "Bastón Arcano", type: "2H",
        artifactKey: "ARTEFACT_2H_ARCANESTAFF_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_ENIGMATICORB_MORGANA": { displayName: "Orbe Enigmático de Morgana", name: "2H_ENIGMATICORB_MORGANA", category: "Bastón Arcano", type: "2H",
        artifactKey: "ARTEFACT_2H_ENIGMATICORB_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_ENIGMATICSTAFF": { displayName: "Bastón Enigmático", name: "2H_ENIGMATICSTAFF", category: "Bastón Arcano", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "MAIN_ARCANESTAFF": { displayName: "Bastón Arcano", name: "MAIN_ARCANESTAFF", category: "Bastón Arcano", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },
        "MAIN_ARCANESTAFF_UNDEAD": { displayName: "Bastón Arcano Antimuerto", name: "MAIN_ARCANESTAFF_UNDEAD", category: "Bastón Arcano", type: "1H",
        artifactKey: "ARTEFACT_MAIN_ARCANESTAFF_UNDEAD", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },

        // === BASTÓN MALDITO ===
        "2H_CURSEDSTAFF": { displayName: "Bastón Maldito", name: "2H_CURSEDSTAFF", category: "Bastón Maldito", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_CURSEDSTAFF_MORGANA": { displayName: "Bastón Maldito de Morgana", name: "2H_CURSEDSTAFF_MORGANA", category: "Bastón Maldito", type: "2H",
        artifactKey: "ARTEFACT_2H_CURSEDSTAFF_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_DEMONICSTAFF": { displayName: "Bastón Demoníaco", name: "2H_DEMONICSTAFF", category: "Bastón Maldito", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_SKULLORB_HELL": { displayName: "Orbe Calavera del Infierno", name: "2H_SKULLORB_HELL", category: "Bastón Maldito", type: "2H",
        artifactKey: "ARTEFACT_2H_SKULLORB_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_CURSEDSTAFF": { displayName: "Bastón Maldito", name: "MAIN_CURSEDSTAFF", category: "Bastón Maldito", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },
        "MAIN_CURSEDSTAFF_AVALON": { displayName: "Bastón Maldito de Avalon", name: "MAIN_CURSEDSTAFF_AVALON", category: "Bastón Maldito", type: "1H",
        artifactKey: "ARTEFACT_MAIN_CURSEDSTAFF_AVALON", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },
        "MAIN_CURSEDSTAFF_CRYSTAL": { displayName: "Bastón Maldito de Cristal", name: "MAIN_CURSEDSTAFF_CRYSTAL", category: "Bastón Maldito", type: "1H",
        artifactKey: "ARTEFACT_MAIN_CURSEDSTAFF_CRYSTAL", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },
        "MAIN_CURSEDSTAFF_UNDEAD": { displayName: "Bastón Maldito Antimuerto", name: "MAIN_CURSEDSTAFF_UNDEAD", category: "Bastón Maldito", type: "1H",
        artifactKey: "ARTEFACT_MAIN_CURSEDSTAFF_UNDEAD", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },

        // === BASTÓN NATURAL ===
        "2H_NATURESTAFF": { displayName: "Bastón Natural", name: "2H_NATURESTAFF", category: "Bastón Natural", type: "2H", materials: { PLANKS: 20, CLOTH: 12 } },
        "2H_NATURESTAFF_HELL": { displayName: "Bastón Natural del Infierno", name: "2H_NATURESTAFF_HELL", category: "Bastón Natural", type: "2H",
        artifactKey: "ARTEFACT_2H_NATURESTAFF_HELL", materials: { PLANKS: 20, CLOTH: 12, artifact: 1 } },
        "2H_NATURESTAFF_KEEPER": { displayName: "Bastón Natural del Guardián", name: "2H_NATURESTAFF_KEEPER", category: "Bastón Natural", type: "2H",
        artifactKey: "ARTEFACT_2H_NATURESTAFF_KEEPER", materials: { PLANKS: 20, CLOTH: 12, artifact: 1 } },
        "2H_WILDSTAFF": { displayName: "Bastón Salvaje", name: "2H_WILDSTAFF", category: "Bastón Natural", type: "2H", materials: { PLANKS: 20, CLOTH: 12 } },
        "MAIN_NATURESTAFF": { displayName: "Bastón Natural", name: "MAIN_NATURESTAFF", category: "Bastón Natural", type: "1H", materials: { PLANKS: 16, CLOTH: 8 } },
        "MAIN_NATURESTAFF_AVALON": { displayName: "Bastón Natural de Avalon", name: "MAIN_NATURESTAFF_AVALON", category: "Bastón Natural", type: "1H",
        artifactKey: "ARTEFACT_MAIN_NATURESTAFF_AVALON", materials: { PLANKS: 16, CLOTH: 8, artifact: 1 } },
        "MAIN_NATURESTAFF_CRYSTAL": { displayName: "Bastón Natural de Cristal", name: "MAIN_NATURESTAFF_CRYSTAL", category: "Bastón Natural", type: "1H",
        artifactKey: "ARTEFACT_MAIN_NATURESTAFF_CRYSTAL", materials: { PLANKS: 16, CLOTH: 8, artifact: 1 } },
        "MAIN_NATURESTAFF_KEEPER": { displayName: "Bastón Natural del Guardián", name: "MAIN_NATURESTAFF_KEEPER", category: "Bastón Natural", type: "1H",
        artifactKey: "ARTEFACT_MAIN_NATURESTAFF_KEEPER", materials: { PLANKS: 16, CLOTH: 8, artifact: 1 } },

        // === BASTÓN SAGRADO ===
        "2H_DIVINESTAFF": { displayName: "Bastón Divino", name: "2H_DIVINESTAFF", category: "Bastón Sagrado", type: "2H", materials: { PLANKS: 20, CLOTH: 12 } },
        "2H_HOLYSTAFF": { displayName: "Bastón Sagrado", name: "2H_HOLYSTAFF", category: "Bastón Sagrado", type: "2H", materials: { PLANKS: 20, CLOTH: 12 } },
        "2H_HOLYSTAFF_CRYSTAL": { displayName: "Bastón Sagrado de Cristal", name: "2H_HOLYSTAFF_CRYSTAL", category: "Bastón Sagrado", type: "2H",
        artifactKey: "ARTEFACT_2H_HOLYSTAFF_CRYSTAL", materials: { PLANKS: 20, CLOTH: 12, artifact: 1 } },
        "2H_HOLYSTAFF_HELL": { displayName: "Bastón Sagrado del Infierno", name: "2H_HOLYSTAFF_HELL", category: "Bastón Sagrado", type: "2H",
        artifactKey: "ARTEFACT_2H_HOLYSTAFF_HELL", materials: { PLANKS: 20, CLOTH: 12, artifact: 1 } },
        "2H_HOLYSTAFF_UNDEAD": { displayName: "Bastón Sagrado Antimuerto", name: "2H_HOLYSTAFF_UNDEAD", category: "Bastón Sagrado", type: "2H",
        artifactKey: "ARTEFACT_2H_HOLYSTAFF_UNDEAD", materials: { PLANKS: 20, CLOTH: 12, artifact: 1 } },
        "MAIN_HOLYSTAFF": { displayName: "Bastón Sagrado", name: "MAIN_HOLYSTAFF", category: "Bastón Sagrado", type: "1H", materials: { PLANKS: 16, CLOTH: 8 } },
        "MAIN_HOLYSTAFF_AVALON": { displayName: "Bastón Sagrado de Avalon", name: "MAIN_HOLYSTAFF_AVALON", category: "Bastón Sagrado", type: "1H",
        artifactKey: "ARTEFACT_MAIN_HOLYSTAFF_AVALON", materials: { PLANKS: 16, CLOTH: 8, artifact: 1 } },
        "MAIN_HOLYSTAFF_MORGANA": { displayName: "Bastón Sagrado de Morgana", name: "MAIN_HOLYSTAFF_MORGANA", category: "Bastón Sagrado", type: "1H",
        artifactKey: "ARTEFACT_MAIN_HOLYSTAFF_MORGANA", materials: { PLANKS: 16, CLOTH: 8, artifact: 1 } },

        // === BASTÓN DE COMBATE ===
        "2H_COMBATSTAFF_MORGANA": { displayName: "Bastón de Combate de Morgana", name: "2H_COMBATSTAFF_MORGANA", category: "Bastón de Combate", type: "2H",
        artifactKey: "ARTEFACT_2H_COMBATSTAFF_MORGANA", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_DOUBLEBLADEDSTAFF": { displayName: "Bastón de Doble Filo", name: "2H_DOUBLEBLADEDSTAFF", category: "Bastón de Combate", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_DOUBLEBLADEDSTAFF_CRYSTAL": { displayName: "Bastón de Doble Filo de Cristal", name: "2H_DOUBLEBLADEDSTAFF_CRYSTAL", category: "Bastón de Combate", type: "2H",
        artifactKey: "ARTEFACT_2H_DOUBLEBLADEDSTAFF_CRYSTAL", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_IRONCLADEDSTAFF": { displayName: "Bastón Acorazado", name: "2H_IRONCLADEDSTAFF", category: "Bastón de Combate", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_QUARTERSTAFF": { displayName: "Bastón de Cuarto", name: "2H_QUARTERSTAFF", category: "Bastón de Combate", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_QUARTERSTAFF_AVALON": { displayName: "Bastón de Cuarto de Avalon", name: "2H_QUARTERSTAFF_AVALON", category: "Bastón de Combate", type: "2H",
        artifactKey: "ARTEFACT_2H_QUARTERSTAFF_AVALON", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_ROCKSTAFF_KEEPER": { displayName: "Bastón de Roca del Guardián", name: "2H_ROCKSTAFF_KEEPER", category: "Bastón de Combate", type: "2H",
        artifactKey: "ARTEFACT_2H_ROCKSTAFF_KEEPER", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_TWINSCYTHE_HELL": { displayName: "Doble Guadaña del Infierno", name: "2H_TWINSCYTHE_HELL", category: "Bastón de Combate", type: "2H",
        artifactKey: "ARTEFACT_2H_TWINSCYTHE_HELL", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },

        // === BASTÓN DE FUEGO ===
        "2H_FIRE_RINGPAIR_AVALON": { displayName: "Par de Anillos de Fuego de Avalon", name: "2H_FIRE_RINGPAIR_AVALON", category: "Bastón de Fuego", type: "2H",
        artifactKey: "ARTEFACT_2H_FIRE_RINGPAIR_AVALON", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_FIRESTAFF": { displayName: "Bastón de Fuego", name: "2H_FIRESTAFF", category: "Bastón de Fuego", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_FIRESTAFF_HELL": { displayName: "Bastón de Fuego del Infierno", name: "2H_FIRESTAFF_HELL", category: "Bastón de Fuego", type: "2H",
        artifactKey: "ARTEFACT_2H_FIRESTAFF_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_INFERNOSTAFF": { displayName: "Bastón Infernal", name: "2H_INFERNOSTAFF", category: "Bastón de Fuego", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_INFERNOSTAFF_MORGANA": { displayName: "Bastón Infernal de Morgana", name: "2H_INFERNOSTAFF_MORGANA", category: "Bastón de Fuego", type: "2H",
        artifactKey: "ARTEFACT_2H_INFERNOSTAFF_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_FIRESTAFF": { displayName: "Bastón de Fuego", name: "MAIN_FIRESTAFF", category: "Bastón de Fuego", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },
        "MAIN_FIRESTAFF_CRYSTAL": { displayName: "Bastón de Fuego de Cristal", name: "MAIN_FIRESTAFF_CRYSTAL", category: "Bastón de Fuego", type: "1H",
        artifactKey: "ARTEFACT_MAIN_FIRESTAFF_CRYSTAL", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },
        "MAIN_FIRESTAFF_KEEPER": { displayName: "Bastón de Fuego del Guardián", name: "MAIN_FIRESTAFF_KEEPER", category: "Bastón de Fuego", type: "1H",
        artifactKey: "ARTEFACT_MAIN_FIRESTAFF_KEEPER", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },

        // === BASTÓN DE HIELO ===
        "2H_FROSTSTAFF": { displayName: "Bastón de Escarcha", name: "2H_FROSTSTAFF", category: "Bastón de Hielo", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_FROSTSTAFF_CRYSTAL": { displayName: "Bastón de Escarcha de Cristal", name: "2H_FROSTSTAFF_CRYSTAL", category: "Bastón de Hielo", type: "2H",
        artifactKey: "ARTEFACT_2H_FROSTSTAFF_CRYSTAL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_GLACIALSTAFF": { displayName: "Bastón Glacial", name: "2H_GLACIALSTAFF", category: "Bastón de Hielo", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_ICECRYSTAL_UNDEAD": { displayName: "Cristal de Hielo Antimuerto", name: "2H_ICECRYSTAL_UNDEAD", category: "Bastón de Hielo", type: "2H",
        artifactKey: "ARTEFACT_2H_ICECRYSTAL_UNDEAD", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_ICEGAUNTLETS_HELL": { displayName: "Guanteletes de Hielo del Infierno", name: "2H_ICEGAUNTLETS_HELL", category: "Bastón de Hielo", type: "2H",
        artifactKey: "ARTEFACT_2H_ICEGAUNTLETS_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_FROSTSTAFF": { displayName: "Bastón de Escarcha", name: "MAIN_FROSTSTAFF", category: "Bastón de Hielo", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },
        "MAIN_FROSTSTAFF_AVALON": { displayName: "Bastón de Escarcha de Avalon", name: "MAIN_FROSTSTAFF_AVALON", category: "Bastón de Hielo", type: "1H",
        artifactKey: "ARTEFACT_MAIN_FROSTSTAFF_AVALON", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },
        "MAIN_FROSTSTAFF_KEEPER": { displayName: "Bastón de Escarcha del Guardián", name: "MAIN_FROSTSTAFF_KEEPER", category: "Bastón de Hielo", type: "1H",
        artifactKey: "ARTEFACT_MAIN_FROSTSTAFF_KEEPER", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },

        // === DAGA ===
        "2H_CLAWPAIR": { displayName: "Garras", name: "2H_CLAWPAIR", category: "Daga", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_DAGGER_KATAR_AVALON": { displayName: "Katar de Avalon", name: "2H_DAGGER_KATAR_AVALON", category: "Daga", type: "2H",
        artifactKey: "ARTEFACT_2H_DAGGER_KATAR_AVALON", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_DAGGERPAIR": { displayName: "Par de Dagas", name: "2H_DAGGERPAIR", category: "Daga", type: "2H", materials: { METALBAR: 16, LEATHER: 16 } },
        "2H_DAGGERPAIR_CRYSTAL": { displayName: "Par de Dagas de Cristal", name: "2H_DAGGERPAIR_CRYSTAL", category: "Daga", type: "2H",
        artifactKey: "ARTEFACT_2H_DAGGERPAIR_CRYSTAL", materials: { METALBAR: 16, LEATHER: 16, artifact: 1 } },
        "2H_DUALSICKLE_UNDEAD": { displayName: "Doble Hoz Antimuerto", name: "2H_DUALSICKLE_UNDEAD", category: "Daga", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALSICKLE_UNDEAD", materials: { METALBAR: 16, LEATHER: 16, artifact: 1 } },
        "MAIN_DAGGER": { displayName: "Daga", name: "MAIN_DAGGER", category: "Daga", type: "1H", materials: { METALBAR: 12, LEATHER: 12 } },
        "MAIN_DAGGER_HELL": { displayName: "Daga del Infierno", name: "MAIN_DAGGER_HELL", category: "Daga", type: "1H",
        artifactKey: "ARTEFACT_MAIN_DAGGER_HELL", materials: { METALBAR: 12, LEATHER: 12, artifact: 1 } },
        "MAIN_RAPIER_MORGANA": { displayName: "Estoque de Morgana", name: "MAIN_RAPIER_MORGANA", category: "Daga", type: "1H",
        artifactKey: "ARTEFACT_MAIN_RAPIER_MORGANA", materials: { METALBAR: 16, LEATHER: 8, artifact: 1 } },

        // === ESPADA ===
        "2H_CLAYMORE": { displayName: "Claymore", name: "2H_CLAYMORE", category: "Espada", type: "2H", materials: { METALBAR: 20, LEATHER: 12 } },
        "2H_CLAYMORE_AVALON": { displayName: "Claymore de Avalon", name: "2H_CLAYMORE_AVALON", category: "Espada", type: "2H",
        artifactKey: "ARTEFACT_2H_CLAYMORE_AVALON", materials: { METALBAR: 20, LEATHER: 12, artifact: 1 } },
        "2H_CLEAVER_HELL": { displayName: "Cuchilla del Infierno", name: "2H_CLEAVER_HELL", category: "Espada", type: "2H",
        artifactKey: "ARTEFACT_2H_CLEAVER_HELL", materials: { METALBAR: 20, LEATHER: 12, artifact: 1 } },
        "2H_DUALSCIMITAR_UNDEAD": { displayName: "Doble Cimitarra Antimuerto", name: "2H_DUALSCIMITAR_UNDEAD", category: "Espada", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALSCIMITAR_UNDEAD", materials: { METALBAR: 20, LEATHER: 12, artifact: 1 } },
        "2H_DUALSWORD": { displayName: "Doble Espada", name: "2H_DUALSWORD", category: "Espada", type: "2H", materials: { METALBAR: 20, LEATHER: 12 } },
        "MAIN_SCIMITAR_MORGANA": { displayName: "Cimitarra de Morgana", name: "MAIN_SCIMITAR_MORGANA", category: "Espada", type: "1H",
        artifactKey: "ARTEFACT_MAIN_SCIMITAR_MORGANA", materials: { METALBAR: 16, LEATHER: 8, artifact: 1 } },
        "MAIN_SWORD": { displayName: "Espada", name: "MAIN_SWORD", category: "Espada", type: "1H", materials: { METALBAR: 16, LEATHER: 8 } },
        "MAIN_SWORD_CRYSTAL": { displayName: "Espada de Cristal", name: "MAIN_SWORD_CRYSTAL", category: "Espada", type: "1H",
        artifactKey: "ARTEFACT_MAIN_SWORD_CRYSTAL", materials: { METALBAR: 16, LEATHER: 8, artifact: 1 } },

        // === HACHA ===
        "2H_AXE": { displayName: "Hacha", name: "2H_AXE", category: "Hacha", type: "2H", materials: { PLANKS: 12, METALBAR: 20 } },
        "2H_AXE_AVALON": { displayName: "Hacha de Avalon", name: "2H_AXE_AVALON", category: "Hacha", type: "2H",
        artifactKey: "ARTEFACT_2H_AXE_AVALON", materials: { PLANKS: 12, METALBAR: 20, artifact: 1 } },
        "2H_DUALAXE_KEEPER": { displayName: "Doble Hacha del Guardián", name: "2H_DUALAXE_KEEPER", category: "Hacha", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALAXE_KEEPER", materials: { PLANKS: 12, METALBAR: 20, artifact: 1 } },
        "2H_HALBERD": { displayName: "Alabarda", name: "2H_HALBERD", category: "Hacha", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_HALBERD_MORGANA": { displayName: "Alabarda de Morgana", name: "2H_HALBERD_MORGANA", category: "Hacha", type: "2H",
        artifactKey: "ARTEFACT_2H_HALBERD_MORGANA", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_SCYTHE_CRYSTAL": { displayName: "Guadaña de Cristal", name: "2H_SCYTHE_CRYSTAL", category: "Hacha", type: "2H",
        artifactKey: "ARTEFACT_2H_SCYTHE_CRYSTAL", materials: { PLANKS: 12, METALBAR: 20, artifact: 1 } },
        "2H_SCYTHE_HELL": { displayName: "Guadaña del Infierno", name: "2H_SCYTHE_HELL", category: "Hacha", type: "2H",
        artifactKey: "ARTEFACT_2H_SCYTHE_HELL", materials: { PLANKS: 12, METALBAR: 20, artifact: 1 } },
        "MAIN_AXE": { displayName: "Hacha", name: "MAIN_AXE", category: "Hacha", type: "1H", materials: { PLANKS: 8, METALBAR: 16 } },

        // === LANZA ===
        "2H_GLAIVE": { displayName: "Voulge", name: "2H_GLAIVE", category: "Lanza", type: "2H", materials: { PLANKS: 12, METALBAR: 20 } },
        "2H_GLAIVE_CRYSTAL": { displayName: "Voulge de Cristal", name: "2H_GLAIVE_CRYSTAL", category: "Lanza", type: "2H",
        artifactKey: "ARTEFACT_2H_GLAIVE_CRYSTAL", materials: { PLANKS: 12, METALBAR: 20, artifact: 1 } },
        "2H_HARPOON_HELL": { displayName: "Arpón del Infierno", name: "2H_HARPOON_HELL", category: "Lanza", type: "2H",
        artifactKey: "ARTEFACT_2H_HARPOON_HELL", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "2H_SPEAR": { displayName: "Lanza", name: "2H_SPEAR", category: "Lanza", type: "2H", materials: { PLANKS: 20, METALBAR: 12 } },
        "2H_TRIDENT_UNDEAD": { displayName: "Tridente Antimuerto", name: "2H_TRIDENT_UNDEAD", category: "Lanza", type: "2H",
        artifactKey: "ARTEFACT_2H_TRIDENT_UNDEAD", materials: { PLANKS: 20, METALBAR: 12, artifact: 1 } },
        "MAIN_SPEAR": { displayName: "Lanza", name: "MAIN_SPEAR", category: "Lanza", type: "1H", materials: { PLANKS: 16, METALBAR: 8 } },
        "MAIN_SPEAR_KEEPER": { displayName: "Lanza del Guardián", name: "MAIN_SPEAR_KEEPER", category: "Lanza", type: "1H",
        artifactKey: "ARTEFACT_MAIN_SPEAR_KEEPER", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },
        "MAIN_SPEAR_LANCE_AVALON": { displayName: "Lanza de Caballería de Avalon", name: "MAIN_SPEAR_LANCE_AVALON", category: "Lanza", type: "1H",
        artifactKey: "ARTEFACT_MAIN_SPEAR_LANCE_AVALON", materials: { PLANKS: 16, METALBAR: 8, artifact: 1 } },

        // === MANOPLA ===
        "2H_IRONGAUNTLETS_HELL": { displayName: "Guanteletes de Hierro del Infierno", name: "2H_IRONGAUNTLETS_HELL", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_IRONGAUNTLETS_HELL", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_AVALON": { displayName: "Nudillos de Avalon", name: "2H_KNUCKLES_AVALON", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_KNUCKLES_AVALON", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_CRYSTAL": { displayName: "Nudillos de Cristal", name: "2H_KNUCKLES_CRYSTAL", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_KNUCKLES_CRYSTAL", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_HELL": { displayName: "Nudillos del Infierno", name: "2H_KNUCKLES_HELL", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_KNUCKLES_HELL", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_KEEPER": { displayName: "Nudillos del Guardián", name: "2H_KNUCKLES_KEEPER", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_KNUCKLES_KEEPER", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_MORGANA": { displayName: "Nudillos de Morgana", name: "2H_KNUCKLES_MORGANA", category: "Manopla", type: "2H",
        artifactKey: "ARTEFACT_2H_KNUCKLES_MORGANA", materials: { METALBAR: 12, LEATHER: 20, artifact: 1 } },
        "2H_KNUCKLES_SET1": { displayName: "Nudillos", name: "2H_KNUCKLES_SET1", category: "Manopla", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_KNUCKLES_SET2": { displayName: "Nudillos II", name: "2H_KNUCKLES_SET2", category: "Manopla", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },
        "2H_KNUCKLES_SET3": { displayName: "Nudillos III", name: "2H_KNUCKLES_SET3", category: "Manopla", type: "2H", materials: { METALBAR: 12, LEATHER: 20 } },

        // === MARTILLO ===
        "2H_DUALHAMMER_HELL": { displayName: "Doble Martillo del Infierno", name: "2H_DUALHAMMER_HELL", category: "Martillo", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALHAMMER_HELL", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "2H_HAMMER": { displayName: "Martillo", name: "2H_HAMMER", category: "Martillo", type: "2H", materials: { METALBAR: 20, CLOTH: 12 } },
        "2H_HAMMER_AVALON": { displayName: "Martillo de Avalon", name: "2H_HAMMER_AVALON", category: "Martillo", type: "2H",
        artifactKey: "ARTEFACT_2H_HAMMER_AVALON", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "2H_HAMMER_CRYSTAL": { displayName: "Martillo de Cristal", name: "2H_HAMMER_CRYSTAL", category: "Martillo", type: "2H",
        artifactKey: "ARTEFACT_2H_HAMMER_CRYSTAL", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "2H_HAMMER_UNDEAD": { displayName: "Martillo Antimuerto", name: "2H_HAMMER_UNDEAD", category: "Martillo", type: "2H",
        artifactKey: "ARTEFACT_2H_HAMMER_UNDEAD", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "2H_POLEHAMMER": { displayName: "Mazo de Asta", name: "2H_POLEHAMMER", category: "Martillo", type: "2H", materials: { METALBAR: 20, CLOTH: 12 } },
        "2H_RAM_KEEPER": { displayName: "Ariete del Guardián", name: "2H_RAM_KEEPER", category: "Martillo", type: "2H",
        artifactKey: "ARTEFACT_2H_RAM_KEEPER", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "MAIN_HAMMER": { displayName: "Martillo", name: "MAIN_HAMMER", category: "Martillo", type: "1H", materials: { METALBAR: 24 } },

        // === MAZA ===
        "2H_DUALMACE_AVALON": { displayName: "Doble Maza de Avalon", name: "2H_DUALMACE_AVALON", category: "Maza", type: "2H",
        artifactKey: "ARTEFACT_2H_DUALMACE_AVALON", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "2H_FLAIL": { displayName: "Flagelo", name: "2H_FLAIL", category: "Maza", type: "2H", materials: { METALBAR: 20, CLOTH: 12 } },
        "2H_MACE": { displayName: "Maza", name: "2H_MACE", category: "Maza", type: "2H", materials: { METALBAR: 20, CLOTH: 12 } },
        "2H_MACE_MORGANA": { displayName: "Maza de Morgana", name: "2H_MACE_MORGANA", category: "Maza", type: "2H",
        artifactKey: "ARTEFACT_2H_MACE_MORGANA", materials: { METALBAR: 20, CLOTH: 12, artifact: 1 } },
        "MAIN_MACE": { displayName: "Maza", name: "MAIN_MACE", category: "Maza", type: "1H", materials: { METALBAR: 16, CLOTH: 8 } },
        "MAIN_MACE_CRYSTAL": { displayName: "Maza de Cristal", name: "MAIN_MACE_CRYSTAL", category: "Maza", type: "1H",
        artifactKey: "ARTEFACT_MAIN_MACE_CRYSTAL", materials: { METALBAR: 16, CLOTH: 8, artifact: 1 } },
        "MAIN_MACE_HELL": { displayName: "Maza del Infierno", name: "MAIN_MACE_HELL", category: "Maza", type: "1H",
        artifactKey: "ARTEFACT_MAIN_MACE_HELL", materials: { METALBAR: 16, CLOTH: 8, artifact: 1 } },
        "MAIN_ROCKMACE_KEEPER": { displayName: "Maza de Roca del Guardián", name: "MAIN_ROCKMACE_KEEPER", category: "Maza", type: "1H",
        artifactKey: "ARTEFACT_MAIN_ROCKMACE_KEEPER", materials: { METALBAR: 16, CLOTH: 8, artifact: 1 } },

    },

        ARMOR_RECIPES: {

        // === ARMADURA DE CUERO ===
        "ARMOR_LEATHER_AVALON": { displayName: "Chaqueta de Avalon", name: "ARMOR_LEATHER_AVALON", category: "Armadura de Cuero", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_LEATHER_AVALON", materials: { LEATHER: 16, artifact: 1 } },
        "ARMOR_LEATHER_FEY": { displayName: "Chaqueta Feérico", name: "ARMOR_LEATHER_FEY", category: "Armadura de Cuero", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_LEATHER_FEY", materials: { LEATHER: 16, artifact: 1 } },
        "ARMOR_LEATHER_HELL": { displayName: "Chaqueta del Infierno", name: "ARMOR_LEATHER_HELL", category: "Armadura de Cuero", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_LEATHER_HELL", materials: { LEATHER: 16, artifact: 1 } },
        "ARMOR_LEATHER_MORGANA": { displayName: "Chaqueta de Morgana", name: "ARMOR_LEATHER_MORGANA", category: "Armadura de Cuero", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_LEATHER_MORGANA", materials: { LEATHER: 16, artifact: 1 } },
        "ARMOR_LEATHER_SET1": { displayName: "Chaqueta del Cazador", name: "ARMOR_LEATHER_SET1", category: "Armadura de Cuero", type: "armor", materials: { LEATHER: 16 } },
        "ARMOR_LEATHER_SET2": { displayName: "Chaqueta Mercenaria", name: "ARMOR_LEATHER_SET2", category: "Armadura de Cuero", type: "armor", materials: { LEATHER: 16 } },
        "ARMOR_LEATHER_SET3": { displayName: "Chaqueta del Asesino", name: "ARMOR_LEATHER_SET3", category: "Armadura de Cuero", type: "armor", materials: { LEATHER: 16 } },
        "ARMOR_LEATHER_UNDEAD": { displayName: "Chaqueta Antimuerto", name: "ARMOR_LEATHER_UNDEAD", category: "Armadura de Cuero", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_LEATHER_UNDEAD", materials: { LEATHER: 16, artifact: 1 } },

        // === ARMADURA DE PLACA ===
        "ARMOR_PLATE_AVALON": { displayName: "Armadura de Avalon", name: "ARMOR_PLATE_AVALON", category: "Armadura de Placa", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_PLATE_AVALON", materials: { METALBAR: 16, artifact: 1 } },
        "ARMOR_PLATE_FEY": { displayName: "Armadura Feérico", name: "ARMOR_PLATE_FEY", category: "Armadura de Placa", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_PLATE_FEY", materials: { METALBAR: 16, artifact: 1 } },
        "ARMOR_PLATE_HELL": { displayName: "Armadura del Infierno", name: "ARMOR_PLATE_HELL", category: "Armadura de Placa", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_PLATE_HELL", materials: { METALBAR: 16, artifact: 1 } },
        "ARMOR_PLATE_KEEPER": { displayName: "Armadura del Guardián", name: "ARMOR_PLATE_KEEPER", category: "Armadura de Placa", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_PLATE_KEEPER", materials: { METALBAR: 16, artifact: 1 } },
        "ARMOR_PLATE_SET1": { displayName: "Armadura del Soldado", name: "ARMOR_PLATE_SET1", category: "Armadura de Placa", type: "armor", materials: { METALBAR: 16 } },
        "ARMOR_PLATE_SET2": { displayName: "Armadura del Caballero", name: "ARMOR_PLATE_SET2", category: "Armadura de Placa", type: "armor", materials: { METALBAR: 16 } },
        "ARMOR_PLATE_SET3": { displayName: "Armadura del Guardián", name: "ARMOR_PLATE_SET3", category: "Armadura de Placa", type: "armor", materials: { METALBAR: 16 } },
        "ARMOR_PLATE_UNDEAD": { displayName: "Armadura Antimuerto", name: "ARMOR_PLATE_UNDEAD", category: "Armadura de Placa", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_PLATE_UNDEAD", materials: { METALBAR: 16, artifact: 1 } },

        // === ARMADURA DE TELA ===
        "ARMOR_CLOTH_AVALON": { displayName: "Túnica de Avalon", name: "ARMOR_CLOTH_AVALON", category: "Armadura de Tela", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_CLOTH_AVALON", materials: { CLOTH: 16, artifact: 1 } },
        "ARMOR_CLOTH_FEY": { displayName: "Túnica Feérico", name: "ARMOR_CLOTH_FEY", category: "Armadura de Tela", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_CLOTH_FEY", materials: { CLOTH: 16, artifact: 1 } },
        "ARMOR_CLOTH_HELL": { displayName: "Túnica del Infierno", name: "ARMOR_CLOTH_HELL", category: "Armadura de Tela", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_CLOTH_HELL", materials: { CLOTH: 16, artifact: 1 } },
        "ARMOR_CLOTH_KEEPER": { displayName: "Túnica del Guardián", name: "ARMOR_CLOTH_KEEPER", category: "Armadura de Tela", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_CLOTH_KEEPER", materials: { CLOTH: 16, artifact: 1 } },
        "ARMOR_CLOTH_MORGANA": { displayName: "Túnica de Morgana", name: "ARMOR_CLOTH_MORGANA", category: "Armadura de Tela", type: "armor",
        artifactKey: "ARTEFACT_ARMOR_CLOTH_MORGANA", materials: { CLOTH: 16, artifact: 1 } },
        "ARMOR_CLOTH_SET1": { displayName: "Túnica del Erudito", name: "ARMOR_CLOTH_SET1", category: "Armadura de Tela", type: "armor", materials: { CLOTH: 16 } },
        "ARMOR_CLOTH_SET2": { displayName: "Túnica del Clérigo", name: "ARMOR_CLOTH_SET2", category: "Armadura de Tela", type: "armor", materials: { CLOTH: 16 } },
        "ARMOR_CLOTH_SET3": { displayName: "Túnica del Mago", name: "ARMOR_CLOTH_SET3", category: "Armadura de Tela", type: "armor", materials: { CLOTH: 16 } },

        // === BOTAS DE CUERO ===
        "SHOES_LEATHER_AVALON": { displayName: "Botas de Avalon", name: "SHOES_LEATHER_AVALON", category: "Botas de Cuero", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_LEATHER_AVALON", materials: { LEATHER: 8, artifact: 1 } },
        "SHOES_LEATHER_FEY": { displayName: "Botas Feérico", name: "SHOES_LEATHER_FEY", category: "Botas de Cuero", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_LEATHER_FEY", materials: { LEATHER: 8, artifact: 1 } },
        "SHOES_LEATHER_HELL": { displayName: "Botas del Infierno", name: "SHOES_LEATHER_HELL", category: "Botas de Cuero", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_LEATHER_HELL", materials: { LEATHER: 8, artifact: 1 } },
        "SHOES_LEATHER_MORGANA": { displayName: "Botas de Morgana", name: "SHOES_LEATHER_MORGANA", category: "Botas de Cuero", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_LEATHER_MORGANA", materials: { LEATHER: 8, artifact: 1 } },
        "SHOES_LEATHER_SET1": { displayName: "Botas del Cazador", name: "SHOES_LEATHER_SET1", category: "Botas de Cuero", type: "shoes", materials: { LEATHER: 8 } },
        "SHOES_LEATHER_SET2": { displayName: "Botas Mercenarias", name: "SHOES_LEATHER_SET2", category: "Botas de Cuero", type: "shoes", materials: { LEATHER: 8 } },
        "SHOES_LEATHER_SET3": { displayName: "Botas del Asesino", name: "SHOES_LEATHER_SET3", category: "Botas de Cuero", type: "shoes", materials: { LEATHER: 8 } },
        "SHOES_LEATHER_UNDEAD": { displayName: "Botas Antimuerto", name: "SHOES_LEATHER_UNDEAD", category: "Botas de Cuero", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_LEATHER_UNDEAD", materials: { LEATHER: 8, artifact: 1 } },

        // === BOTAS DE PLACA ===
        "SHOES_PLATE_AVALON": { displayName: "Botas de Placa de Avalon", name: "SHOES_PLATE_AVALON", category: "Botas de Placa", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_PLATE_AVALON", materials: { METALBAR: 8, artifact: 1 } },
        "SHOES_PLATE_FEY": { displayName: "Botas de Placa Feérico", name: "SHOES_PLATE_FEY", category: "Botas de Placa", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_PLATE_FEY", materials: { METALBAR: 8, artifact: 1 } },
        "SHOES_PLATE_HELL": { displayName: "Botas de Placa del Infierno", name: "SHOES_PLATE_HELL", category: "Botas de Placa", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_PLATE_HELL", materials: { METALBAR: 8, artifact: 1 } },
        "SHOES_PLATE_KEEPER": { displayName: "Botas de Placa del Guardián", name: "SHOES_PLATE_KEEPER", category: "Botas de Placa", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_PLATE_KEEPER", materials: { METALBAR: 8, artifact: 1 } },
        "SHOES_PLATE_SET1": { displayName: "Botas del Soldado", name: "SHOES_PLATE_SET1", category: "Botas de Placa", type: "shoes", materials: { METALBAR: 8 } },
        "SHOES_PLATE_SET2": { displayName: "Botas del Caballero", name: "SHOES_PLATE_SET2", category: "Botas de Placa", type: "shoes", materials: { METALBAR: 8 } },
        "SHOES_PLATE_SET3": { displayName: "Botas del Guardián", name: "SHOES_PLATE_SET3", category: "Botas de Placa", type: "shoes", materials: { METALBAR: 8 } },
        "SHOES_PLATE_UNDEAD": { displayName: "Botas de Placa Antimuerto", name: "SHOES_PLATE_UNDEAD", category: "Botas de Placa", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_PLATE_UNDEAD", materials: { METALBAR: 8, artifact: 1 } },

        // === BOTAS DE TELA ===
        "SHOES_CLOTH_AVALON": { displayName: "Sandalias de Avalon", name: "SHOES_CLOTH_AVALON", category: "Botas de Tela", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_CLOTH_AVALON", materials: { CLOTH: 8, artifact: 1 } },
        "SHOES_CLOTH_FEY": { displayName: "Sandalias Feérico", name: "SHOES_CLOTH_FEY", category: "Botas de Tela", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_CLOTH_FEY", materials: { CLOTH: 8, artifact: 1 } },
        "SHOES_CLOTH_HELL": { displayName: "Sandalias del Infierno", name: "SHOES_CLOTH_HELL", category: "Botas de Tela", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_CLOTH_HELL", materials: { CLOTH: 8, artifact: 1 } },
        "SHOES_CLOTH_KEEPER": { displayName: "Sandalias del Guardián", name: "SHOES_CLOTH_KEEPER", category: "Botas de Tela", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_CLOTH_KEEPER", materials: { CLOTH: 8, artifact: 1 } },
        "SHOES_CLOTH_MORGANA": { displayName: "Sandalias de Morgana", name: "SHOES_CLOTH_MORGANA", category: "Botas de Tela", type: "shoes",
        artifactKey: "ARTEFACT_SHOES_CLOTH_MORGANA", materials: { CLOTH: 8, artifact: 1 } },
        "SHOES_CLOTH_SET1": { displayName: "Sandalias del Erudito", name: "SHOES_CLOTH_SET1", category: "Botas de Tela", type: "shoes", materials: { CLOTH: 8 } },
        "SHOES_CLOTH_SET2": { displayName: "Sandalias del Clérigo", name: "SHOES_CLOTH_SET2", category: "Botas de Tela", type: "shoes", materials: { CLOTH: 8 } },
        "SHOES_CLOTH_SET3": { displayName: "Sandalias del Mago", name: "SHOES_CLOTH_SET3", category: "Botas de Tela", type: "shoes", materials: { CLOTH: 8 } },

        // === CASCO DE CUERO ===
        "HEAD_LEATHER_AVALON": { displayName: "Capucha de Avalon", name: "HEAD_LEATHER_AVALON", category: "Casco de Cuero", type: "head",
        artifactKey: "ARTEFACT_HEAD_LEATHER_AVALON", materials: { LEATHER: 8, artifact: 1 } },
        "HEAD_LEATHER_FEY": { displayName: "Capucha Feérico", name: "HEAD_LEATHER_FEY", category: "Casco de Cuero", type: "head",
        artifactKey: "ARTEFACT_HEAD_LEATHER_FEY", materials: { LEATHER: 8, artifact: 1 } },
        "HEAD_LEATHER_HELL": { displayName: "Capucha del Infierno", name: "HEAD_LEATHER_HELL", category: "Casco de Cuero", type: "head",
        artifactKey: "ARTEFACT_HEAD_LEATHER_HELL", materials: { LEATHER: 8, artifact: 1 } },
        "HEAD_LEATHER_MORGANA": { displayName: "Capucha de Morgana", name: "HEAD_LEATHER_MORGANA", category: "Casco de Cuero", type: "head",
        artifactKey: "ARTEFACT_HEAD_LEATHER_MORGANA", materials: { LEATHER: 8, artifact: 1 } },
        "HEAD_LEATHER_SET1": { displayName: "Capucha del Cazador", name: "HEAD_LEATHER_SET1", category: "Casco de Cuero", type: "head", materials: { LEATHER: 8 } },
        "HEAD_LEATHER_SET2": { displayName: "Capucha Mercenaria", name: "HEAD_LEATHER_SET2", category: "Casco de Cuero", type: "head", materials: { LEATHER: 8 } },
        "HEAD_LEATHER_SET3": { displayName: "Capucha del Asesino", name: "HEAD_LEATHER_SET3", category: "Casco de Cuero", type: "head", materials: { LEATHER: 8 } },
        "HEAD_LEATHER_UNDEAD": { displayName: "Capucha Antimuerto", name: "HEAD_LEATHER_UNDEAD", category: "Casco de Cuero", type: "head",
        artifactKey: "ARTEFACT_HEAD_LEATHER_UNDEAD", materials: { LEATHER: 8, artifact: 1 } },

        // === CASCO DE PLACA ===
        "HEAD_PLATE_AVALON": { displayName: "Casco de Avalon", name: "HEAD_PLATE_AVALON", category: "Casco de Placa", type: "head",
        artifactKey: "ARTEFACT_HEAD_PLATE_AVALON", materials: { METALBAR: 8, artifact: 1 } },
        "HEAD_PLATE_FEY": { displayName: "Casco Feérico", name: "HEAD_PLATE_FEY", category: "Casco de Placa", type: "head",
        artifactKey: "ARTEFACT_HEAD_PLATE_FEY", materials: { METALBAR: 8, artifact: 1 } },
        "HEAD_PLATE_HELL": { displayName: "Casco del Infierno", name: "HEAD_PLATE_HELL", category: "Casco de Placa", type: "head",
        artifactKey: "ARTEFACT_HEAD_PLATE_HELL", materials: { METALBAR: 8, artifact: 1 } },
        "HEAD_PLATE_KEEPER": { displayName: "Casco del Guardián", name: "HEAD_PLATE_KEEPER", category: "Casco de Placa", type: "head",
        artifactKey: "ARTEFACT_HEAD_PLATE_KEEPER", materials: { METALBAR: 8, artifact: 1 } },
        "HEAD_PLATE_SET1": { displayName: "Casco del Soldado", name: "HEAD_PLATE_SET1", category: "Casco de Placa", type: "head", materials: { METALBAR: 8 } },
        "HEAD_PLATE_SET2": { displayName: "Casco del Caballero", name: "HEAD_PLATE_SET2", category: "Casco de Placa", type: "head", materials: { METALBAR: 8 } },
        "HEAD_PLATE_SET3": { displayName: "Casco del Guardián", name: "HEAD_PLATE_SET3", category: "Casco de Placa", type: "head", materials: { METALBAR: 8 } },
        "HEAD_PLATE_UNDEAD": { displayName: "Casco Antimuerto", name: "HEAD_PLATE_UNDEAD", category: "Casco de Placa", type: "head",
        artifactKey: "ARTEFACT_HEAD_PLATE_UNDEAD", materials: { METALBAR: 8, artifact: 1 } },

        // === CASCO DE TELA ===
        "HEAD_CLOTH_AVALON": { displayName: "Gorro de Avalon", name: "HEAD_CLOTH_AVALON", category: "Casco de Tela", type: "head",
        artifactKey: "ARTEFACT_HEAD_CLOTH_AVALON", materials: { CLOTH: 8, artifact: 1 } },
        "HEAD_CLOTH_FEY": { displayName: "Gorro Feérico", name: "HEAD_CLOTH_FEY", category: "Casco de Tela", type: "head",
        artifactKey: "ARTEFACT_HEAD_CLOTH_FEY", materials: { CLOTH: 8, artifact: 1 } },
        "HEAD_CLOTH_HELL": { displayName: "Gorro del Infierno", name: "HEAD_CLOTH_HELL", category: "Casco de Tela", type: "head",
        artifactKey: "ARTEFACT_HEAD_CLOTH_HELL", materials: { CLOTH: 8, artifact: 1 } },
        "HEAD_CLOTH_KEEPER": { displayName: "Gorro del Guardián", name: "HEAD_CLOTH_KEEPER", category: "Casco de Tela", type: "head",
        artifactKey: "ARTEFACT_HEAD_CLOTH_KEEPER", materials: { CLOTH: 8, artifact: 1 } },
        "HEAD_CLOTH_MORGANA": { displayName: "Gorro de Morgana", name: "HEAD_CLOTH_MORGANA", category: "Casco de Tela", type: "head",
        artifactKey: "ARTEFACT_HEAD_CLOTH_MORGANA", materials: { CLOTH: 8, artifact: 1 } },
        "HEAD_CLOTH_SET1": { displayName: "Gorro del Erudito", name: "HEAD_CLOTH_SET1", category: "Casco de Tela", type: "head", materials: { CLOTH: 8 } },
        "HEAD_CLOTH_SET2": { displayName: "Gorro del Clérigo", name: "HEAD_CLOTH_SET2", category: "Casco de Tela", type: "head", materials: { CLOTH: 8 } },
        "HEAD_CLOTH_SET3": { displayName: "Gorro del Mago", name: "HEAD_CLOTH_SET3", category: "Casco de Tela", type: "head", materials: { CLOTH: 8 } },

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
