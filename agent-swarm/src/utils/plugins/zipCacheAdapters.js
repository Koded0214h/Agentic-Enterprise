"use strict";
/**
 * Zip Cache Adapters
 *
 * I/O helpers for the plugin zip cache. These functions handle reading/writing
 * zip-cache-local metadata files, extracting ZIPs to session directories,
 * and creating ZIPs for newly installed plugins.
 *
 * The zip cache stores data on a mounted volume (e.g., Filestore) that persists
 * across ephemeral container lifetimes. The session cache is a local temp dir
 * for extracted plugins used during a single session.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readZipCacheKnownMarketplaces = readZipCacheKnownMarketplaces;
exports.writeZipCacheKnownMarketplaces = writeZipCacheKnownMarketplaces;
exports.readMarketplaceJson = readMarketplaceJson;
exports.saveMarketplaceJsonToZipCache = saveMarketplaceJsonToZipCache;
exports.syncMarketplacesToZipCache = syncMarketplacesToZipCache;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var slowOperations_js_1 = require("../slowOperations.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var schemas_js_1 = require("./schemas.js");
var zipCache_js_1 = require("./zipCache.js");
// ── Metadata I/O ──
/**
 * Read known_marketplaces.json from the zip cache.
 * Returns empty object if file doesn't exist, can't be parsed, or fails schema
 * validation (data comes from a shared mounted volume — other containers may write).
 */
function readZipCacheKnownMarketplaces() {
    return __awaiter(this, void 0, void 0, function () {
        var content, parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, zipCache_js_1.getZipCacheKnownMarketplacesPath)(), 'utf-8')];
                case 1:
                    content = _b.sent();
                    parsed = (0, schemas_js_1.KnownMarketplacesFileSchema)().safeParse((0, slowOperations_js_1.jsonParse)(content));
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("Invalid known_marketplaces.json in zip cache: ".concat(parsed.error.message), { level: 'error' });
                        return [2 /*return*/, {}];
                    }
                    return [2 /*return*/, parsed.data];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Write known_marketplaces.json to the zip cache atomically.
 */
function writeZipCacheKnownMarketplaces(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, zipCache_js_1.atomicWriteToZipCache)((0, zipCache_js_1.getZipCacheKnownMarketplacesPath)(), (0, slowOperations_js_1.jsonStringify)(data, null, 2))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ── Marketplace JSON ──
/**
 * Read a marketplace JSON file from the zip cache.
 */
function readMarketplaceJson(marketplaceName) {
    return __awaiter(this, void 0, void 0, function () {
        var zipCachePath, relPath, fullPath, content, parsed, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    zipCachePath = (0, zipCache_js_1.getPluginZipCachePath)();
                    if (!zipCachePath) {
                        return [2 /*return*/, null];
                    }
                    relPath = (0, zipCache_js_1.getMarketplaceJsonRelativePath)(marketplaceName);
                    fullPath = (0, path_1.join)(zipCachePath, relPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(fullPath, 'utf-8')];
                case 2:
                    content = _b.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    result = (0, schemas_js_1.PluginMarketplaceSchema)().safeParse(parsed);
                    if (result.success) {
                        return [2 /*return*/, result.data];
                    }
                    (0, debug_js_1.logForDebugging)("Invalid marketplace JSON for ".concat(marketplaceName, ": ").concat(result.error));
                    return [2 /*return*/, null];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save a marketplace JSON to the zip cache from its install location.
 */
function saveMarketplaceJsonToZipCache(marketplaceName, installLocation) {
    return __awaiter(this, void 0, void 0, function () {
        var zipCachePath, content, relPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zipCachePath = (0, zipCache_js_1.getPluginZipCachePath)();
                    if (!zipCachePath) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, readMarketplaceJsonContent(installLocation)];
                case 1:
                    content = _a.sent();
                    if (!(content !== null)) return [3 /*break*/, 3];
                    relPath = (0, zipCache_js_1.getMarketplaceJsonRelativePath)(marketplaceName);
                    return [4 /*yield*/, (0, zipCache_js_1.atomicWriteToZipCache)((0, path_1.join)(zipCachePath, relPath), content)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read marketplace.json content from a cloned marketplace directory or file.
 * For directory sources: checks .claude-plugin/marketplace.json, marketplace.json
 * For URL sources: the installLocation IS the marketplace JSON file itself.
 */
function readMarketplaceJsonContent(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var candidates, _i, candidates_1, candidate, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    candidates = [
                        (0, path_1.join)(dir, '.claude-plugin', 'marketplace.json'),
                        (0, path_1.join)(dir, 'marketplace.json'),
                        dir, // For URL sources, installLocation IS the marketplace JSON file
                    ];
                    _i = 0, candidates_1 = candidates;
                    _b.label = 1;
                case 1:
                    if (!(_i < candidates_1.length)) return [3 /*break*/, 6];
                    candidate = candidates_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)(candidate, 'utf-8')];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Sync marketplace data to zip cache for offline access.
 * Saves marketplace JSONs and merges with previously cached data
 * so ephemeral containers can access marketplaces without re-cloning.
 */
function syncMarketplacesToZipCache() {
    return __awaiter(this, void 0, void 0, function () {
        var knownMarketplaces, _i, _a, _b, name_1, entry, error_1, zipCacheKnownMarketplaces, mergedKnownMarketplaces;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfigSafe)()
                    // Save marketplace JSONs to zip cache
                ];
                case 1:
                    knownMarketplaces = _c.sent();
                    _i = 0, _a = Object.entries(knownMarketplaces);
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], name_1 = _b[0], entry = _b[1];
                    if (!entry.installLocation)
                        return [3 /*break*/, 6];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, saveMarketplaceJsonToZipCache(name_1, entry.installLocation)];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Failed to save marketplace JSON for ".concat(name_1, ": ").concat(error_1));
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [4 /*yield*/, readZipCacheKnownMarketplaces()];
                case 8:
                    zipCacheKnownMarketplaces = _c.sent();
                    mergedKnownMarketplaces = __assign(__assign({}, zipCacheKnownMarketplaces), knownMarketplaces);
                    return [4 /*yield*/, writeZipCacheKnownMarketplaces(mergedKnownMarketplaces)];
                case 9:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
