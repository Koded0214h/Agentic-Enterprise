"use strict";
/**
 * Combines settings validation errors with MCP configuration errors.
 *
 * This module exists to break a circular dependency:
 *   settings.ts → mcp/config.ts → settings.ts
 *
 * By moving the MCP error aggregation here (a leaf that imports both
 * settings.ts and mcp/config.ts, but is imported by neither), the cycle
 * is eliminated.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsWithAllErrors = getSettingsWithAllErrors;
var config_js_1 = require("../../services/mcp/config.js");
var settings_js_1 = require("./settings.js");
/**
 * Get merged settings with all validation errors, including MCP config errors.
 *
 * Use this instead of getSettingsWithErrors() when you need the full set of
 * errors (settings + MCP). The underlying getSettingsWithErrors() no longer
 * includes MCP errors to avoid the circular dependency.
 */
function getSettingsWithAllErrors() {
    var result = (0, settings_js_1.getSettingsWithErrors)();
    // 'dynamic' scope does not have errors returned; it throws and is set on cli startup
    var scopes = ['user', 'project', 'local'];
    var mcpErrors = scopes.flatMap(function (scope) { return (0, config_js_1.getMcpConfigsByScope)(scope).errors; });
    return {
        settings: result.settings,
        errors: __spreadArray(__spreadArray([], result.errors, true), mcpErrors, true),
    };
}
