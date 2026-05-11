"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDefaultShell = resolveDefaultShell;
var settings_js_1 = require("../settings/settings.js");
/**
 * Resolve the default shell for input-box `!` commands.
 *
 * Resolution order (docs/design/ps-shell-selection.md §4.2):
 *   settings.defaultShell → 'bash'
 *
 * Platform default is 'bash' everywhere — we do NOT auto-flip Windows to
 * PowerShell (would break existing Windows users with bash hooks).
 */
function resolveDefaultShell() {
    var _a;
    return (_a = (0, settings_js_1.getInitialSettings)().defaultShell) !== null && _a !== void 0 ? _a : 'bash';
}
