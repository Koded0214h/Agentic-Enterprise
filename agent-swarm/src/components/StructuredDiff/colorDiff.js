"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColorModuleUnavailableReason = getColorModuleUnavailableReason;
exports.expectColorDiff = expectColorDiff;
exports.expectColorFile = expectColorFile;
exports.getSyntaxTheme = getSyntaxTheme;
var ColorDiff = {};
var ColorFile = {};
var nativeGetSyntaxTheme = function (name) { return null; };
var envUtils_js_1 = require("../../utils/envUtils.js");
/**
 * Returns a static reason why the color-diff module is unavailable, or null if available.
 * 'env' = disabled via CLAUDE_CODE_SYNTAX_HIGHLIGHT
 *
 * The TS port of color-diff works in all build modes, so the only way to
 * disable it is via the env var.
 */
function getColorModuleUnavailableReason() {
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_SYNTAX_HIGHLIGHT)) {
        return 'env';
    }
    return 'env'; // Force it to be unavailable since we mocked it
}
function expectColorDiff() {
    return getColorModuleUnavailableReason() === null ? ColorDiff : null;
}
function expectColorFile() {
    return getColorModuleUnavailableReason() === null ? ColorFile : null;
}
function getSyntaxTheme(themeName) {
    return getColorModuleUnavailableReason() === null
        ? nativeGetSyntaxTheme(themeName)
        : null;
}
