"use strict";
/**
 * TokenCalculator - Token budget calculations for context economics
 *
 * Handles estimation of token counts for observations and context economics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateObservationTokens = calculateObservationTokens;
exports.calculateTokenEconomics = calculateTokenEconomics;
exports.getWorkEmoji = getWorkEmoji;
exports.formatObservationTokenDisplay = formatObservationTokenDisplay;
exports.shouldShowContextEconomics = shouldShowContextEconomics;
var types_js_1 = require("./types.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
/**
 * Calculate token count for a single observation
 */
function calculateObservationTokens(obs) {
    var _a, _b, _c;
    var obsSize = (((_a = obs.title) === null || _a === void 0 ? void 0 : _a.length) || 0) +
        (((_b = obs.subtitle) === null || _b === void 0 ? void 0 : _b.length) || 0) +
        (((_c = obs.narrative) === null || _c === void 0 ? void 0 : _c.length) || 0) +
        JSON.stringify(obs.facts || []).length;
    return Math.ceil(obsSize / types_js_1.CHARS_PER_TOKEN_ESTIMATE);
}
/**
 * Calculate context economics for a set of observations
 */
function calculateTokenEconomics(observations) {
    var totalObservations = observations.length;
    var totalReadTokens = observations.reduce(function (sum, obs) {
        return sum + calculateObservationTokens(obs);
    }, 0);
    var totalDiscoveryTokens = observations.reduce(function (sum, obs) {
        return sum + (obs.discovery_tokens || 0);
    }, 0);
    var savings = totalDiscoveryTokens - totalReadTokens;
    var savingsPercent = totalDiscoveryTokens > 0
        ? Math.round((savings / totalDiscoveryTokens) * 100)
        : 0;
    return {
        totalObservations: totalObservations,
        totalReadTokens: totalReadTokens,
        totalDiscoveryTokens: totalDiscoveryTokens,
        savings: savings,
        savingsPercent: savingsPercent,
    };
}
/**
 * Get work emoji for an observation type
 */
function getWorkEmoji(obsType) {
    return ModeManager_js_1.ModeManager.getInstance().getWorkEmoji(obsType);
}
/**
 * Format token display for an observation
 */
function formatObservationTokenDisplay(obs, config) {
    var readTokens = calculateObservationTokens(obs);
    var discoveryTokens = obs.discovery_tokens || 0;
    var workEmoji = getWorkEmoji(obs.type);
    var discoveryDisplay = discoveryTokens > 0 ? "".concat(workEmoji, " ").concat(discoveryTokens.toLocaleString()) : '-';
    return { readTokens: readTokens, discoveryTokens: discoveryTokens, discoveryDisplay: discoveryDisplay, workEmoji: workEmoji };
}
/**
 * Check if context economics should be shown
 */
function shouldShowContextEconomics(config) {
    return config.showReadTokens || config.showWorkTokens ||
        config.showSavingsAmount || config.showSavingsPercent;
}
