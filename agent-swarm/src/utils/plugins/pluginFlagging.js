"use strict";
/**
 * Flagged plugin tracking utilities
 *
 * Tracks plugins that were auto-removed because they were delisted from
 * their marketplace. Data is stored in ~/.claude/plugins/flagged-plugins.json.
 * Flagged plugins appear in a "Flagged" section in /plugins until the user
 * dismisses them.
 *
 * Uses a module-level cache so that getFlaggedPlugins() can be called
 * synchronously during React render. The cache is populated on the first
 * async call (loadFlaggedPlugins or addFlaggedPlugin) and kept in sync
 * with writes.
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFlaggedPlugins = loadFlaggedPlugins;
exports.getFlaggedPlugins = getFlaggedPlugins;
exports.addFlaggedPlugin = addFlaggedPlugin;
exports.markFlaggedPluginsSeen = markFlaggedPluginsSeen;
exports.removeFlaggedPlugin = removeFlaggedPlugin;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var FLAGGED_PLUGINS_FILENAME = 'flagged-plugins.json';
var SEEN_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours
// Module-level cache — populated by loadFlaggedPlugins(), updated by writes.
var cache = null;
function getFlaggedPluginsPath() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), FLAGGED_PLUGINS_FILENAME);
}
function parsePluginsData(content) {
    var parsed = (0, slowOperations_js_1.jsonParse)(content);
    if (typeof parsed !== 'object' ||
        parsed === null ||
        !('plugins' in parsed) ||
        typeof parsed.plugins !== 'object' ||
        parsed.plugins === null) {
        return {};
    }
    var plugins = parsed.plugins;
    var result = {};
    for (var _i = 0, _a = Object.entries(plugins); _i < _a.length; _i++) {
        var _b = _a[_i], id = _b[0], entry = _b[1];
        if (entry &&
            typeof entry === 'object' &&
            'flaggedAt' in entry &&
            typeof entry.flaggedAt === 'string') {
            var parsed_1 = {
                flaggedAt: entry.flaggedAt,
            };
            if ('seenAt' in entry &&
                typeof entry.seenAt === 'string') {
                parsed_1.seenAt = entry.seenAt;
            }
            result[id] = parsed_1;
        }
    }
    return result;
}
function readFromDisk() {
    return __awaiter(this, void 0, void 0, function () {
        var content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(getFlaggedPluginsPath(), {
                            encoding: 'utf-8',
                        })];
                case 1:
                    content = _b.sent();
                    return [2 /*return*/, parsePluginsData(content)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function writeToDisk(plugins) {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, tempPath, content, error_1, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    filePath = getFlaggedPluginsPath();
                    tempPath = "".concat(filePath, ".").concat((0, crypto_1.randomBytes)(8).toString('hex'), ".tmp");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 10]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, pluginDirectories_js_1.getPluginsDirectory)())];
                case 2:
                    _b.sent();
                    content = (0, slowOperations_js_1.jsonStringify)({ plugins: plugins }, null, 2);
                    return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, content, {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.rename)(tempPath, filePath)];
                case 4:
                    _b.sent();
                    cache = plugins;
                    return [3 /*break*/, 10];
                case 5:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.unlink)(tempPath)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _a = _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load flagged plugins from disk into the module cache.
 * Must be called (and awaited) before getFlaggedPlugins() returns
 * meaningful data. Called by useManagePlugins during plugin refresh.
 */
function loadFlaggedPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var all, now, changed, _i, _a, _b, id, entry;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, readFromDisk()];
                case 1:
                    all = _c.sent();
                    now = Date.now();
                    changed = false;
                    for (_i = 0, _a = Object.entries(all); _i < _a.length; _i++) {
                        _b = _a[_i], id = _b[0], entry = _b[1];
                        if (entry.seenAt &&
                            now - new Date(entry.seenAt).getTime() >= SEEN_EXPIRY_MS) {
                            delete all[id];
                            changed = true;
                        }
                    }
                    cache = all;
                    if (!changed) return [3 /*break*/, 3];
                    return [4 /*yield*/, writeToDisk(all)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get all flagged plugins from the in-memory cache.
 * Returns an empty object if loadFlaggedPlugins() has not been called yet.
 */
function getFlaggedPlugins() {
    return cache !== null && cache !== void 0 ? cache : {};
}
/**
 * Add a plugin to the flagged list.
 *
 * @param pluginId "name@marketplace" format
 */
function addFlaggedPlugin(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var updated;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(cache === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFromDisk()];
                case 1:
                    cache = _b.sent();
                    _b.label = 2;
                case 2:
                    updated = __assign(__assign({}, cache), (_a = {}, _a[pluginId] = {
                        flaggedAt: new Date().toISOString(),
                    }, _a));
                    return [4 /*yield*/, writeToDisk(updated)];
                case 3:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("Flagged plugin: ".concat(pluginId));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Mark flagged plugins as seen. Called when the Installed view renders
 * flagged plugins. Sets seenAt on entries that don't already have it.
 * After 48 hours from seenAt, entries are auto-cleared on next load.
 */
function markFlaggedPluginsSeen(pluginIds) {
    return __awaiter(this, void 0, void 0, function () {
        var now, changed, updated, _i, pluginIds_1, id, entry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(cache === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFromDisk()];
                case 1:
                    cache = _a.sent();
                    _a.label = 2;
                case 2:
                    now = new Date().toISOString();
                    changed = false;
                    updated = __assign({}, cache);
                    for (_i = 0, pluginIds_1 = pluginIds; _i < pluginIds_1.length; _i++) {
                        id = pluginIds_1[_i];
                        entry = updated[id];
                        if (entry && !entry.seenAt) {
                            updated[id] = __assign(__assign({}, entry), { seenAt: now });
                            changed = true;
                        }
                    }
                    if (!changed) return [3 /*break*/, 4];
                    return [4 /*yield*/, writeToDisk(updated)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove a plugin from the flagged list. Called when the user dismisses
 * a flagged plugin notification in /plugins.
 */
function removeFlaggedPlugin(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _, rest;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(cache === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, readFromDisk()];
                case 1:
                    cache = _c.sent();
                    _c.label = 2;
                case 2:
                    if (!(pluginId in cache))
                        return [2 /*return*/];
                    _a = cache, _b = pluginId, _ = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                    cache = rest;
                    return [4 /*yield*/, writeToDisk(rest)];
                case 3:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
