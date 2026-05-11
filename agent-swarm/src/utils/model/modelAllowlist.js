"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isModelAllowed = isModelAllowed;
var settings_js_1 = require("../settings/settings.js");
var aliases_js_1 = require("./aliases.js");
var model_js_1 = require("./model.js");
var modelStrings_js_1 = require("./modelStrings.js");
/**
 * Check if a model belongs to a given family by checking if its name
 * (or resolved name) contains the family identifier.
 */
function modelBelongsToFamily(model, family) {
    if (model.includes(family)) {
        return true;
    }
    // Resolve aliases like "best" → "claude-opus-4-6" to check family membership
    if ((0, aliases_js_1.isModelAlias)(model)) {
        var resolved = (0, model_js_1.parseUserSpecifiedModel)(model).toLowerCase();
        return resolved.includes(family);
    }
    return false;
}
/**
 * Check if a model name starts with a prefix at a segment boundary.
 * The prefix must match up to the end of the name or a "-" separator.
 * e.g. "claude-opus-4-5" matches "claude-opus-4-5-20251101" but not "claude-opus-4-50".
 */
function prefixMatchesModel(modelName, prefix) {
    if (!modelName.startsWith(prefix)) {
        return false;
    }
    return modelName.length === prefix.length || modelName[prefix.length] === '-';
}
/**
 * Check if a model matches a version-prefix entry in the allowlist.
 * Supports shorthand like "opus-4-5" (mapped to "claude-opus-4-5") and
 * full prefixes like "claude-opus-4-5". Resolves input aliases before matching.
 */
function modelMatchesVersionPrefix(model, entry) {
    // Resolve the input model to a full name if it's an alias
    var resolvedModel = (0, aliases_js_1.isModelAlias)(model)
        ? (0, model_js_1.parseUserSpecifiedModel)(model).toLowerCase()
        : model;
    // Try the entry as-is (e.g. "claude-opus-4-5")
    if (prefixMatchesModel(resolvedModel, entry)) {
        return true;
    }
    // Try with "claude-" prefix (e.g. "opus-4-5" → "claude-opus-4-5")
    if (!entry.startsWith('claude-') &&
        prefixMatchesModel(resolvedModel, "claude-".concat(entry))) {
        return true;
    }
    return false;
}
/**
 * Check if a family alias is narrowed by more specific entries in the allowlist.
 * When the allowlist contains both "opus" and "opus-4-5", the specific entry
 * takes precedence — "opus" alone would be a wildcard, but "opus-4-5" narrows
 * it to only that version.
 */
function familyHasSpecificEntries(family, allowlist) {
    for (var _i = 0, allowlist_1 = allowlist; _i < allowlist_1.length; _i++) {
        var entry = allowlist_1[_i];
        if ((0, aliases_js_1.isModelFamilyAlias)(entry)) {
            continue;
        }
        // Check if entry is a version-qualified variant of this family
        // e.g., "opus-4-5" or "claude-opus-4-5-20251101" for the "opus" family
        // Must match at a segment boundary (followed by '-' or end) to avoid
        // false positives like "opusplan" matching "opus"
        var idx = entry.indexOf(family);
        if (idx === -1) {
            continue;
        }
        var afterFamily = idx + family.length;
        if (afterFamily === entry.length || entry[afterFamily] === '-') {
            return true;
        }
    }
    return false;
}
/**
 * Check if a model is allowed by the availableModels allowlist in settings.
 * If availableModels is not set, all models are allowed.
 *
 * Matching tiers:
 * 1. Family aliases ("opus", "sonnet", "haiku") — wildcard for the entire family,
 *    UNLESS more specific entries for that family also exist (e.g., "opus-4-5").
 *    In that case, the family wildcard is ignored and only the specific entries apply.
 * 2. Version prefixes ("opus-4-5", "claude-opus-4-5") — any build of that version
 * 3. Full model IDs ("claude-opus-4-5-20251101") — exact match only
 */
function isModelAllowed(model) {
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    var availableModels = settings.availableModels;
    if (!availableModels) {
        return true; // No restrictions
    }
    if (availableModels.length === 0) {
        return false; // Empty allowlist blocks all user-specified models
    }
    var resolvedModel = (0, modelStrings_js_1.resolveOverriddenModel)(model);
    var normalizedModel = resolvedModel.trim().toLowerCase();
    var normalizedAllowlist = availableModels.map(function (m) { return m.trim().toLowerCase(); });
    // Direct match (alias-to-alias or full-name-to-full-name)
    // Skip family aliases that have been narrowed by specific entries —
    // e.g., "opus" in ["opus", "opus-4-5"] should NOT directly match,
    // because the admin intends to restrict to opus 4.5 only.
    if (normalizedAllowlist.includes(normalizedModel)) {
        if (!(0, aliases_js_1.isModelFamilyAlias)(normalizedModel) ||
            !familyHasSpecificEntries(normalizedModel, normalizedAllowlist)) {
            return true;
        }
    }
    // Family-level aliases in the allowlist match any model in that family,
    // but only if no more specific entries exist for that family.
    // e.g., ["opus"] allows all opus, but ["opus", "opus-4-5"] only allows opus 4.5.
    for (var _i = 0, normalizedAllowlist_1 = normalizedAllowlist; _i < normalizedAllowlist_1.length; _i++) {
        var entry = normalizedAllowlist_1[_i];
        if ((0, aliases_js_1.isModelFamilyAlias)(entry) &&
            !familyHasSpecificEntries(entry, normalizedAllowlist) &&
            modelBelongsToFamily(normalizedModel, entry)) {
            return true;
        }
    }
    // For non-family entries, do bidirectional alias resolution
    // If model is an alias, resolve it and check if the resolved name is in the list
    if ((0, aliases_js_1.isModelAlias)(normalizedModel)) {
        var resolved = (0, model_js_1.parseUserSpecifiedModel)(normalizedModel).toLowerCase();
        if (normalizedAllowlist.includes(resolved)) {
            return true;
        }
    }
    // If any non-family alias in the allowlist resolves to the input model
    for (var _a = 0, normalizedAllowlist_2 = normalizedAllowlist; _a < normalizedAllowlist_2.length; _a++) {
        var entry = normalizedAllowlist_2[_a];
        if (!(0, aliases_js_1.isModelFamilyAlias)(entry) && (0, aliases_js_1.isModelAlias)(entry)) {
            var resolved = (0, model_js_1.parseUserSpecifiedModel)(entry).toLowerCase();
            if (resolved === normalizedModel) {
                return true;
            }
        }
    }
    // Version-prefix matching: "opus-4-5" or "claude-opus-4-5" matches
    // "claude-opus-4-5-20251101" at a segment boundary
    for (var _b = 0, normalizedAllowlist_3 = normalizedAllowlist; _b < normalizedAllowlist_3.length; _b++) {
        var entry = normalizedAllowlist_3[_b];
        if (!(0, aliases_js_1.isModelFamilyAlias)(entry) && !(0, aliases_js_1.isModelAlias)(entry)) {
            if (modelMatchesVersionPrefix(normalizedModel, entry)) {
                return true;
            }
        }
    }
    return false;
}
