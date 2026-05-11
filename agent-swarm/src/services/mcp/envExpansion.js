"use strict";
/**
 * Shared utilities for expanding environment variables in MCP server configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandEnvVarsInString = expandEnvVarsInString;
/**
 * Expand environment variables in a string value
 * Handles ${VAR} and ${VAR:-default} syntax
 * @returns Object with expanded string and list of missing variables
 */
function expandEnvVarsInString(value) {
    var missingVars = [];
    var expanded = value.replace(/\$\{([^}]+)\}/g, function (match, varContent) {
        // Split on :- to support default values (limit to 2 parts to preserve :- in defaults)
        var _a = varContent.split(':-', 2), varName = _a[0], defaultValue = _a[1];
        var envValue = process.env[varName];
        if (envValue !== undefined) {
            return envValue;
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        // Track missing variable for error reporting
        missingVars.push(varName);
        // Return original if not found (allows debugging but will be reported as error)
        return match;
    });
    return {
        expanded: expanded,
        missingVars: missingVars,
    };
}
