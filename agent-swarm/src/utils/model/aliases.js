"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_FAMILY_ALIASES = exports.MODEL_ALIASES = void 0;
exports.isModelAlias = isModelAlias;
exports.isModelFamilyAlias = isModelFamilyAlias;
exports.MODEL_ALIASES = [
    'sonnet',
    'opus',
    'haiku',
    'best',
    'sonnet[1m]',
    'opus[1m]',
    'opusplan',
];
function isModelAlias(modelInput) {
    return exports.MODEL_ALIASES.includes(modelInput);
}
/**
 * Bare model family aliases that act as wildcards in the availableModels allowlist.
 * When "opus" is in the allowlist, ANY opus model is allowed (opus 4.5, 4.6, etc.).
 * When a specific model ID is in the allowlist, only that exact version is allowed.
 */
exports.MODEL_FAMILY_ALIASES = ['sonnet', 'opus', 'haiku'];
function isModelFamilyAlias(model) {
    return exports.MODEL_FAMILY_ALIASES.includes(model);
}
