"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.extractRules = extractRules;
exports.hasRules = hasRules;
exports.applyPermissionUpdate = applyPermissionUpdate;
exports.applyPermissionUpdates = applyPermissionUpdates;
exports.supportsPersistence = supportsPersistence;
exports.persistPermissionUpdate = persistPermissionUpdate;
exports.persistPermissionUpdates = persistPermissionUpdates;
exports.createReadRuleSuggestion = createReadRuleSuggestion;
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var settings_js_1 = require("../settings/settings.js");
var slowOperations_js_1 = require("../slowOperations.js");
var filesystem_js_1 = require("./filesystem.js");
var permissionRuleParser_js_1 = require("./permissionRuleParser.js");
var permissionsLoader_js_1 = require("./permissionsLoader.js");
function extractRules(updates) {
    if (!updates)
        return [];
    return updates.flatMap(function (update) {
        switch (update.type) {
            case 'addRules':
                return update.rules;
            default:
                return [];
        }
    });
}
function hasRules(updates) {
    return extractRules(updates).length > 0;
}
/**
 * Applies a single permission update to the context and returns the updated context
 * @param context The current permission context
 * @param update The permission update to apply
 * @returns The updated permission context
 */
function applyPermissionUpdate(context, update) {
    var _a, _b, _c, _d, _e, _f;
    switch (update.type) {
        case 'setMode':
            (0, debug_js_1.logForDebugging)("Applying permission update: Setting mode to '".concat(update.mode, "'"));
            return __assign(__assign({}, context), { mode: update.mode });
        case 'addRules': {
            var ruleStrings = update.rules.map(function (rule) {
                return (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule);
            });
            (0, debug_js_1.logForDebugging)("Applying permission update: Adding ".concat(update.rules.length, " ").concat(update.behavior, " rule(s) to destination '").concat(update.destination, "': ").concat((0, slowOperations_js_1.jsonStringify)(ruleStrings)));
            // Determine which collection to update based on behavior
            var ruleKind = update.behavior === 'allow'
                ? 'alwaysAllowRules'
                : update.behavior === 'deny'
                    ? 'alwaysDenyRules'
                    : 'alwaysAskRules';
            return __assign(__assign({}, context), (_a = {}, _a[ruleKind] = __assign(__assign({}, context[ruleKind]), (_b = {}, _b[update.destination] = __spreadArray(__spreadArray([], (context[ruleKind][update.destination] || []), true), ruleStrings, true), _b)), _a));
        }
        case 'replaceRules': {
            var ruleStrings = update.rules.map(function (rule) {
                return (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule);
            });
            (0, debug_js_1.logForDebugging)("Replacing all ".concat(update.behavior, " rules for destination '").concat(update.destination, "' with ").concat(update.rules.length, " rule(s): ").concat((0, slowOperations_js_1.jsonStringify)(ruleStrings)));
            // Determine which collection to update based on behavior
            var ruleKind = update.behavior === 'allow'
                ? 'alwaysAllowRules'
                : update.behavior === 'deny'
                    ? 'alwaysDenyRules'
                    : 'alwaysAskRules';
            return __assign(__assign({}, context), (_c = {}, _c[ruleKind] = __assign(__assign({}, context[ruleKind]), (_d = {}, _d[update.destination] = ruleStrings, _d)), _c));
        }
        case 'addDirectories': {
            (0, debug_js_1.logForDebugging)("Applying permission update: Adding ".concat(update.directories.length, " director").concat(update.directories.length === 1 ? 'y' : 'ies', " with destination '").concat(update.destination, "': ").concat((0, slowOperations_js_1.jsonStringify)(update.directories)));
            var newAdditionalDirs = new Map(context.additionalWorkingDirectories);
            for (var _i = 0, _g = update.directories; _i < _g.length; _i++) {
                var directory = _g[_i];
                newAdditionalDirs.set(directory, {
                    path: directory,
                    source: update.destination,
                });
            }
            return __assign(__assign({}, context), { additionalWorkingDirectories: newAdditionalDirs });
        }
        case 'removeRules': {
            var ruleStrings = update.rules.map(function (rule) {
                return (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule);
            });
            (0, debug_js_1.logForDebugging)("Applying permission update: Removing ".concat(update.rules.length, " ").concat(update.behavior, " rule(s) from source '").concat(update.destination, "': ").concat((0, slowOperations_js_1.jsonStringify)(ruleStrings)));
            // Determine which collection to update based on behavior
            var ruleKind = update.behavior === 'allow'
                ? 'alwaysAllowRules'
                : update.behavior === 'deny'
                    ? 'alwaysDenyRules'
                    : 'alwaysAskRules';
            // Filter out the rules to be removed
            var existingRules = context[ruleKind][update.destination] || [];
            var rulesToRemove_1 = new Set(ruleStrings);
            var filteredRules = existingRules.filter(function (rule) { return !rulesToRemove_1.has(rule); });
            return __assign(__assign({}, context), (_e = {}, _e[ruleKind] = __assign(__assign({}, context[ruleKind]), (_f = {}, _f[update.destination] = filteredRules, _f)), _e));
        }
        case 'removeDirectories': {
            (0, debug_js_1.logForDebugging)("Applying permission update: Removing ".concat(update.directories.length, " director").concat(update.directories.length === 1 ? 'y' : 'ies', ": ").concat((0, slowOperations_js_1.jsonStringify)(update.directories)));
            var newAdditionalDirs = new Map(context.additionalWorkingDirectories);
            for (var _h = 0, _j = update.directories; _h < _j.length; _h++) {
                var directory = _j[_h];
                newAdditionalDirs.delete(directory);
            }
            return __assign(__assign({}, context), { additionalWorkingDirectories: newAdditionalDirs });
        }
        default:
            return context;
    }
}
/**
 * Applies multiple permission updates to the context and returns the updated context
 * @param context The current permission context
 * @param updates The permission updates to apply
 * @returns The updated permission context
 */
function applyPermissionUpdates(context, updates) {
    var updatedContext = context;
    for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
        var update = updates_1[_i];
        updatedContext = applyPermissionUpdate(updatedContext, update);
    }
    return updatedContext;
}
function supportsPersistence(destination) {
    return (destination === 'localSettings' ||
        destination === 'userSettings' ||
        destination === 'projectSettings');
}
/**
 * Persists a permission update to the appropriate settings source
 * @param update The permission update to persist
 */
function persistPermissionUpdate(update) {
    var _a, _b;
    var _c, _d;
    if (!supportsPersistence(update.destination))
        return;
    (0, debug_js_1.logForDebugging)("Persisting permission update: ".concat(update.type, " to source '").concat(update.destination, "'"));
    switch (update.type) {
        case 'addRules': {
            (0, debug_js_1.logForDebugging)("Persisting ".concat(update.rules.length, " ").concat(update.behavior, " rule(s) to ").concat(update.destination));
            (0, permissionsLoader_js_1.addPermissionRulesToSettings)({
                ruleValues: update.rules,
                ruleBehavior: update.behavior,
            }, update.destination);
            break;
        }
        case 'addDirectories': {
            (0, debug_js_1.logForDebugging)("Persisting ".concat(update.directories.length, " director").concat(update.directories.length === 1 ? 'y' : 'ies', " to ").concat(update.destination));
            var existingSettings = (0, settings_js_1.getSettingsForSource)(update.destination);
            var existingDirs_1 = ((_c = existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.permissions) === null || _c === void 0 ? void 0 : _c.additionalDirectories) || [];
            // Add new directories, avoiding duplicates
            var dirsToAdd = update.directories.filter(function (dir) { return !existingDirs_1.includes(dir); });
            if (dirsToAdd.length > 0) {
                var updatedDirs = __spreadArray(__spreadArray([], existingDirs_1, true), dirsToAdd, true);
                (0, settings_js_1.updateSettingsForSource)(update.destination, {
                    permissions: {
                        additionalDirectories: updatedDirs,
                    },
                });
            }
            break;
        }
        case 'removeRules': {
            // Handle rule removal
            (0, debug_js_1.logForDebugging)("Removing ".concat(update.rules.length, " ").concat(update.behavior, " rule(s) from ").concat(update.destination));
            var existingSettings = (0, settings_js_1.getSettingsForSource)(update.destination);
            var existingPermissions = (existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.permissions) || {};
            var existingRules = existingPermissions[update.behavior] || [];
            // Convert rules to normalized strings for comparison
            // Normalize via parse→serialize roundtrip so "Bash(*)" and "Bash" match
            var rulesToRemove_2 = new Set(update.rules.map(permissionRuleParser_js_1.permissionRuleValueToString));
            var filteredRules = existingRules.filter(function (rule) {
                var normalized = (0, permissionRuleParser_js_1.permissionRuleValueToString)((0, permissionRuleParser_js_1.permissionRuleValueFromString)(rule));
                return !rulesToRemove_2.has(normalized);
            });
            (0, settings_js_1.updateSettingsForSource)(update.destination, {
                permissions: (_a = {},
                    _a[update.behavior] = filteredRules,
                    _a),
            });
            break;
        }
        case 'removeDirectories': {
            (0, debug_js_1.logForDebugging)("Removing ".concat(update.directories.length, " director").concat(update.directories.length === 1 ? 'y' : 'ies', " from ").concat(update.destination));
            var existingSettings = (0, settings_js_1.getSettingsForSource)(update.destination);
            var existingDirs = ((_d = existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.permissions) === null || _d === void 0 ? void 0 : _d.additionalDirectories) || [];
            // Remove specified directories
            var dirsToRemove_1 = new Set(update.directories);
            var filteredDirs = existingDirs.filter(function (dir) { return !dirsToRemove_1.has(dir); });
            (0, settings_js_1.updateSettingsForSource)(update.destination, {
                permissions: {
                    additionalDirectories: filteredDirs,
                },
            });
            break;
        }
        case 'setMode': {
            (0, debug_js_1.logForDebugging)("Persisting mode '".concat(update.mode, "' to ").concat(update.destination));
            (0, settings_js_1.updateSettingsForSource)(update.destination, {
                permissions: {
                    defaultMode: update.mode,
                },
            });
            break;
        }
        case 'replaceRules': {
            (0, debug_js_1.logForDebugging)("Replacing all ".concat(update.behavior, " rules in ").concat(update.destination, " with ").concat(update.rules.length, " rule(s)"));
            var ruleStrings = update.rules.map(permissionRuleParser_js_1.permissionRuleValueToString);
            (0, settings_js_1.updateSettingsForSource)(update.destination, {
                permissions: (_b = {},
                    _b[update.behavior] = ruleStrings,
                    _b),
            });
            break;
        }
    }
}
/**
 * Persists multiple permission updates to the appropriate settings sources
 * Only persists updates with persistable sources
 * @param updates The permission updates to persist
 */
function persistPermissionUpdates(updates) {
    for (var _i = 0, updates_2 = updates; _i < updates_2.length; _i++) {
        var update = updates_2[_i];
        persistPermissionUpdate(update);
    }
}
/**
 * Creates a Read rule suggestion for a directory.
 * @param dirPath The directory path to create a rule for
 * @param destination The destination for the permission rule (defaults to 'session')
 * @returns A PermissionUpdate for a Read rule, or undefined for the root directory
 */
function createReadRuleSuggestion(dirPath, destination) {
    if (destination === void 0) { destination = 'session'; }
    // Convert to POSIX format for pattern matching (handles Windows internally)
    var pathForPattern = (0, filesystem_js_1.toPosixPath)(dirPath);
    // Root directory is too broad to be a reasonable permission target
    if (pathForPattern === '/') {
        return undefined;
    }
    // For absolute paths, prepend an extra / to create //path/** pattern
    var ruleContent = path_1.posix.isAbsolute(pathForPattern)
        ? "/".concat(pathForPattern, "/**")
        : "".concat(pathForPattern, "/**");
    return {
        type: 'addRules',
        rules: [
            {
                toolName: 'Read',
                ruleContent: ruleContent,
            },
        ],
        behavior: 'allow',
        destination: destination,
    };
}
