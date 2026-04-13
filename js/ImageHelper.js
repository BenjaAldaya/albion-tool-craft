/**
 * Helpers para URLs de imágenes de Albion Online (render.albiononline.com)
 */

const RENDER_URL = 'https://render.albiononline.com/v1/item';

// Mapeo de keys de materiales → ID del elemento <img> en el HTML
const MAT_IMG = { LEATHER: 'leatherImg', METALBAR: 'barsImg', PLANKS: 'planksImg', CLOTH: 'clothImg' };

function getCurrentTier() {
    return parseInt(document.getElementById('tier').value) || 7;
}

function getCurrentQuality() {
    return parseInt(document.getElementById('quality').value) || 1;
}

function getCurrentEnchantment() {
    return parseInt(document.getElementById('enchantment').value) || 0;
}

function getItemImageUrl(itemKey, tier, enchantment = 0, quality = 1) {
    const ids = AlbionConfig.ITEM_API_NAMES[itemKey];
    if (!ids) return '';
    let id = ids[tier] || ids[4];
    if (enchantment > 0) id += `@${enchantment}`;
    return `${RENDER_URL}/${id}.png?quality=${quality}&size=80`;
}

function getMaterialImageUrl(materialKey, tier, enchantment = 0) {
    const ids = AlbionConfig.ITEM_API_NAMES[materialKey];
    if (!ids) return '';
    const baseId = ids[tier] || ids[4];
    const id = enchantment > 0 ? `${baseId}_LEVEL${enchantment}` : baseId;
    return `${RENDER_URL}/${id}.png?quality=1&size=80`;
}

function getArtifactImageUrl(artifactKey, tier) {
    if (!artifactKey) return '';
    const ids = AlbionConfig.ITEM_API_NAMES[artifactKey];
    if (!ids) return '';
    return `${RENDER_URL}/${ids[tier] || ids[4]}.png?quality=1&size=80`;
}

function updateSelectedWeaponImage() {
    const itemType = document.getElementById('itemType').value;
    const tier = getCurrentTier();
    const enchantment = getCurrentEnchantment();
    const quality = getCurrentQuality();
    const img = document.getElementById('selectedWeaponImg');
    const url = getItemImageUrl(itemType, tier, enchantment, quality);
    if (url) {
        img.src = url;
        img.style.opacity = '1';
    }
}

function updateMaterialImages() {
    const tier = getCurrentTier();
    const enchantment = getCurrentEnchantment();
    const itemType = document.getElementById('itemType').value;
    const recipe = AlbionConfig.TOOL_RECIPES[itemType]
        || AlbionConfig.WEAPON_RECIPES[itemType]
        || AlbionConfig.ARMOR_RECIPES[itemType];

    Object.values(MAT_IMG).forEach(id => {
        const img = document.getElementById(id);
        if (img) img.src = '';
    });

    const isTool = !!AlbionConfig.TOOL_RECIPES[itemType];
    const matEnchant = isTool ? 0 : enchantment;
    if (recipe) {
        Object.keys(recipe.materials).forEach(matKey => {
            if (matKey === 'artifact') return;
            const imgId = MAT_IMG[matKey];
            const img = imgId && document.getElementById(imgId);
            if (img) img.src = getMaterialImageUrl(matKey, tier, matEnchant);
        });
    }

    const artifactImg = document.getElementById('artifactImg');
    if (artifactImg) {
        artifactImg.src = recipe?.artifactKey
            ? getArtifactImageUrl(recipe.artifactKey, tier)
            : '';
    }
}
