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
exports.isMcpbSource = isMcpbSource;
exports.loadMcpServerUserConfig = loadMcpServerUserConfig;
exports.saveMcpServerUserConfig = saveMcpServerUserConfig;
exports.validateUserConfig = validateUserConfig;
exports.checkMcpbChanged = checkMcpbChanged;
exports.loadMcpbFile = loadMcpbFile;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var helpers_js_1 = require("../dxt/helpers.js");
var zip_js_1 = require("../dxt/zip.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var index_js_1 = require("../secureStorage/index.js");
var settings_js_1 = require("../settings/settings.js");
var slowOperations_js_1 = require("../slowOperations.js");
var systemDirectories_js_1 = require("../systemDirectories.js");
var fetchTelemetry_js_1 = require("./fetchTelemetry.js");
/**
 * Check if a source string is an MCPB file reference
 */
function isMcpbSource(source) {
    return source.endsWith('.mcpb') || source.endsWith('.dxt');
}
/**
 * Check if a source is a URL
 */
function isUrl(source) {
    return source.startsWith('http://') || source.startsWith('https://');
}
/**
 * Generate content hash for an MCPB file
 */
function generateContentHash(data) {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex').substring(0, 16);
}
/**
 * Get cache directory for MCPB files
 */
function getMcpbCacheDir(pluginPath) {
    return (0, path_1.join)(pluginPath, '.mcpb-cache');
}
/**
 * Get metadata file path for cached MCPB
 */
function getMetadataPath(cacheDir, source) {
    var sourceHash = (0, crypto_1.createHash)('md5')
        .update(source)
        .digest('hex')
        .substring(0, 8);
    return (0, path_1.join)(cacheDir, "".concat(sourceHash, ".metadata.json"));
}
/**
 * Compose the secureStorage key for a per-server secret bucket.
 * `pluginSecrets` is a flat map — per-server secrets share it with top-level
 * plugin options (pluginOptionsStorage.ts) using a `${pluginId}/${server}`
 * composite key. `/` can't appear in plugin IDs (`name@marketplace`) or
 * server names (MCP identifier constraints), so it's unambiguous. Keeps the
 * SecureStorageData schema unchanged and the single-keychain-entry size
 * budget (~2KB stdin-safe, see INC-3028) shared across all plugin secrets.
 */
function serverSecretsKey(pluginId, serverName) {
    return "".concat(pluginId, "/").concat(serverName);
}
/**
 * Load user configuration for an MCP server, merging non-sensitive values
 * (from settings.json) with sensitive values (from secureStorage keychain).
 * secureStorage wins on collision — schema determines destination so
 * collision shouldn't happen, but if a user hand-edits settings.json we
 * trust the more secure source.
 *
 * Returns null only if NEITHER source has anything — callers skip
 * ${user_config.X} substitution in that case.
 *
 * @param pluginId - Plugin identifier in "plugin@marketplace" format
 * @param serverName - MCP server name from DXT manifest
 */
function loadMcpServerUserConfig(pluginId, serverName) {
    var _a, _b, _c, _d, _e;
    try {
        var settings = (0, settings_js_1.getSettings_DEPRECATED)();
        var nonSensitive = (_c = (_b = (_a = settings.pluginConfigs) === null || _a === void 0 ? void 0 : _a[pluginId]) === null || _b === void 0 ? void 0 : _b.mcpServers) === null || _c === void 0 ? void 0 : _c[serverName];
        var sensitive = (_e = (_d = (0, index_js_1.getSecureStorage)().read()) === null || _d === void 0 ? void 0 : _d.pluginSecrets) === null || _e === void 0 ? void 0 : _e[serverSecretsKey(pluginId, serverName)];
        if (!nonSensitive && !sensitive) {
            return null;
        }
        (0, debug_js_1.logForDebugging)("Loaded user config for ".concat(pluginId, "/").concat(serverName, " (settings + secureStorage)"));
        return __assign(__assign({}, nonSensitive), sensitive);
    }
    catch (error) {
        var errorObj = (0, errors_js_1.toError)(error);
        (0, log_js_1.logError)(errorObj);
        (0, debug_js_1.logForDebugging)("Failed to load user config for ".concat(pluginId, "/").concat(serverName, ": ").concat(error), { level: 'error' });
        return null;
    }
}
/**
 * Save user configuration for an MCP server, splitting by `schema[key].sensitive`.
 * Mirrors savePluginOptions (pluginOptionsStorage.ts:90) for top-level options:
 *   - `sensitive: true` → secureStorage (keychain on macOS, .credentials.json 0600 elsewhere)
 *   - everything else   → settings.json pluginConfigs[pluginId].mcpServers[serverName]
 *
 * Without this split, per-channel `sensitive: true` was a false sense of
 * security — the dialog masked the input but the save went to plaintext
 * settings.json anyway. H1 #3617646 (Telegram/Discord bot tokens in
 * world-readable .env) surfaced this as the gap to close.
 *
 * Writes are skipped if nothing in that category is present.
 *
 * @param pluginId - Plugin identifier in "plugin@marketplace" format
 * @param serverName - MCP server name from DXT manifest
 * @param config - User configuration values
 * @param schema - The userConfig schema for this server (manifest.user_config
 *   or channels[].userConfig) — drives the sensitive/non-sensitive split
 */
function saveMcpServerUserConfig(pluginId, serverName, config, schema) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        var nonSensitive = {};
        var sensitive = {};
        for (var _i = 0, _k = Object.entries(config); _i < _k.length; _i++) {
            var _l = _k[_i], key = _l[0], value = _l[1];
            if (((_a = schema[key]) === null || _a === void 0 ? void 0 : _a.sensitive) === true) {
                sensitive[key] = String(value);
            }
            else {
                nonSensitive[key] = value;
            }
        }
        // Scrub ONLY keys we're writing in this call. Covers both directions
        // across schema-version flips:
        //  - sensitive→secureStorage ⇒ remove stale plaintext from settings.json
        //  - nonSensitive→settings.json ⇒ remove stale entry from secureStorage
        //    (otherwise loadMcpServerUserConfig's {...nonSensitive, ...sensitive}
        //    would let the stale secureStorage value win on next read)
        // Partial `config` (user only re-enters one field) leaves other fields
        // untouched in BOTH stores — defense-in-depth against future callers.
        var sensitiveKeysInThisSave_1 = new Set(Object.keys(sensitive));
        var nonSensitiveKeysInThisSave_1 = new Set(Object.keys(nonSensitive));
        // Sensitive → secureStorage FIRST. If this fails (keychain locked,
        // .credentials.json perms), throw before touching settings.json — the
        // old plaintext stays as a fallback instead of losing BOTH copies.
        //
        // Also scrub non-sensitive keys from secureStorage — schema flipped
        // sensitive→false and they're being written to settings.json now. Without
        // this, loadMcpServerUserConfig's merge would let the stale secureStorage
        // value win on next read.
        var storage = (0, index_js_1.getSecureStorage)();
        var k = serverSecretsKey(pluginId, serverName);
        var existingInSecureStorage = (_d = (_c = (_b = storage.read()) === null || _b === void 0 ? void 0 : _b.pluginSecrets) === null || _c === void 0 ? void 0 : _c[k]) !== null && _d !== void 0 ? _d : undefined;
        var secureScrubbed = existingInSecureStorage
            ? Object.fromEntries(Object.entries(existingInSecureStorage).filter(function (_a) {
                var key = _a[0];
                return !nonSensitiveKeysInThisSave_1.has(key);
            }))
            : undefined;
        var needSecureScrub = secureScrubbed &&
            existingInSecureStorage &&
            Object.keys(secureScrubbed).length !==
                Object.keys(existingInSecureStorage).length;
        if (Object.keys(sensitive).length > 0 || needSecureScrub) {
            var existing = (_e = storage.read()) !== null && _e !== void 0 ? _e : {};
            if (!existing.pluginSecrets) {
                existing.pluginSecrets = {};
            }
            // secureStorage keyvault is a flat object — direct replace, no merge
            // semantics to worry about (unlike settings.json's mergeWith).
            existing.pluginSecrets[k] = __assign(__assign({}, secureScrubbed), sensitive);
            var result = storage.update(existing);
            if (!result.success) {
                throw new Error("Failed to save sensitive config to secure storage for ".concat(k));
            }
            if (result.warning) {
                (0, debug_js_1.logForDebugging)("Server secrets save warning: ".concat(result.warning), {
                    level: 'warn',
                });
            }
            if (needSecureScrub) {
                (0, debug_js_1.logForDebugging)("saveMcpServerUserConfig: scrubbed ".concat(Object.keys(existingInSecureStorage).length -
                    Object.keys(secureScrubbed).length, " stale non-sensitive key(s) from secureStorage for ").concat(k));
            }
        }
        // Non-sensitive → settings.json. Write whenever there are new non-sensitive
        // values OR existing plaintext sensitive values to scrub — so reconfiguring
        // a sensitive-only schema still cleans up the old settings.json. Runs
        // AFTER the secureStorage write succeeded, so the scrub can't leave you
        // with zero copies of the secret.
        //
        // updateSettingsForSource does mergeWith(diskSettings, ourSettings, ...)
        // which PRESERVES destination keys absent from source — so simply omitting
        // sensitive keys doesn't scrub them, the disk copy merges back in. Instead:
        // set each sensitive key to explicit `undefined` — mergeWith (with the
        // customizer at settings.ts:349) treats explicit undefined as a delete.
        var settings = (0, settings_js_1.getSettings_DEPRECATED)();
        var existingInSettings = (_j = (_h = (_g = (_f = settings.pluginConfigs) === null || _f === void 0 ? void 0 : _f[pluginId]) === null || _g === void 0 ? void 0 : _g.mcpServers) === null || _h === void 0 ? void 0 : _h[serverName]) !== null && _j !== void 0 ? _j : {};
        var keysToScrubFromSettings = Object.keys(existingInSettings).filter(function (k) {
            return sensitiveKeysInThisSave_1.has(k);
        });
        if (Object.keys(nonSensitive).length > 0 ||
            keysToScrubFromSettings.length > 0) {
            if (!settings.pluginConfigs) {
                settings.pluginConfigs = {};
            }
            if (!settings.pluginConfigs[pluginId]) {
                settings.pluginConfigs[pluginId] = {};
            }
            if (!settings.pluginConfigs[pluginId].mcpServers) {
                settings.pluginConfigs[pluginId].mcpServers = {};
            }
            // Build the scrub-via-undefined map. The UserConfigValues type doesn't
            // include undefined, but updateSettingsForSource's mergeWith customizer
            // needs explicit undefined to delete — cast is deliberate internal
            // plumbing (same rationale as deletePluginOptions in
            // pluginOptionsStorage.ts:184, see CLAUDE.md's 10% case).
            var scrubbed = Object.fromEntries(keysToScrubFromSettings.map(function (k) { return [k, undefined]; }));
            settings.pluginConfigs[pluginId].mcpServers[serverName] = __assign(__assign({}, nonSensitive), scrubbed);
            var result = (0, settings_js_1.updateSettingsForSource)('userSettings', settings);
            if (result.error) {
                throw result.error;
            }
            if (keysToScrubFromSettings.length > 0) {
                (0, debug_js_1.logForDebugging)("saveMcpServerUserConfig: scrubbed ".concat(keysToScrubFromSettings.length, " plaintext sensitive key(s) from settings.json for ").concat(pluginId, "/").concat(serverName));
            }
        }
        (0, debug_js_1.logForDebugging)("Saved user config for ".concat(pluginId, "/").concat(serverName, " (").concat(Object.keys(nonSensitive).length, " non-sensitive, ").concat(Object.keys(sensitive).length, " sensitive)"));
    }
    catch (error) {
        var errorObj = (0, errors_js_1.toError)(error);
        (0, log_js_1.logError)(errorObj);
        throw new Error("Failed to save user configuration for ".concat(pluginId, "/").concat(serverName, ": ").concat(errorObj.message));
    }
}
/**
 * Validate user configuration values against DXT user_config schema
 */
function validateUserConfig(values, schema) {
    var errors = [];
    // Check each field in the schema
    for (var _i = 0, _a = Object.entries(schema); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], fieldSchema = _b[1];
        var value = values[key];
        // Check required fields
        if (fieldSchema.required && (value === undefined || value === '')) {
            errors.push("".concat(fieldSchema.title || key, " is required but not provided"));
            continue;
        }
        // Skip validation for optional fields that aren't provided
        if (value === undefined || value === '') {
            continue;
        }
        // Type validation
        if (fieldSchema.type === 'string') {
            if (Array.isArray(value)) {
                // String arrays are allowed if multiple: true
                if (!fieldSchema.multiple) {
                    errors.push("".concat(fieldSchema.title || key, " must be a string, not an array"));
                }
                else if (!value.every(function (v) { return typeof v === 'string'; })) {
                    errors.push("".concat(fieldSchema.title || key, " must be an array of strings"));
                }
            }
            else if (typeof value !== 'string') {
                errors.push("".concat(fieldSchema.title || key, " must be a string"));
            }
        }
        else if (fieldSchema.type === 'number' && typeof value !== 'number') {
            errors.push("".concat(fieldSchema.title || key, " must be a number"));
        }
        else if (fieldSchema.type === 'boolean' && typeof value !== 'boolean') {
            errors.push("".concat(fieldSchema.title || key, " must be a boolean"));
        }
        else if ((fieldSchema.type === 'file' || fieldSchema.type === 'directory') &&
            typeof value !== 'string') {
            errors.push("".concat(fieldSchema.title || key, " must be a path string"));
        }
        // Number range validation
        if (fieldSchema.type === 'number' && typeof value === 'number') {
            if (fieldSchema.min !== undefined && value < fieldSchema.min) {
                errors.push("".concat(fieldSchema.title || key, " must be at least ").concat(fieldSchema.min));
            }
            if (fieldSchema.max !== undefined && value > fieldSchema.max) {
                errors.push("".concat(fieldSchema.title || key, " must be at most ").concat(fieldSchema.max));
            }
        }
    }
    return { valid: errors.length === 0, errors: errors };
}
/**
 * Generate MCP server configuration from DXT manifest
 */
function generateMcpConfig(manifest_1, extractedPath_1) {
    return __awaiter(this, arguments, void 0, function (manifest, extractedPath, userConfig) {
        var getMcpConfigForManifest, mcpConfig, error;
        if (userConfig === void 0) { userConfig = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@anthropic-ai/mcpb'); })];
                case 1:
                    getMcpConfigForManifest = (_a.sent()).getMcpConfigForManifest;
                    return [4 /*yield*/, getMcpConfigForManifest({
                            manifest: manifest,
                            extensionPath: extractedPath,
                            systemDirs: (0, systemDirectories_js_1.getSystemDirectories)(),
                            userConfig: userConfig,
                            pathSeparator: '/',
                        })];
                case 2:
                    mcpConfig = _a.sent();
                    if (!mcpConfig) {
                        error = new Error("Failed to generate MCP server configuration from manifest \"".concat(manifest.name, "\""));
                        (0, log_js_1.logError)(error);
                        throw error;
                    }
                    return [2 /*return*/, mcpConfig];
            }
        });
    });
}
/**
 * Load cache metadata for an MCPB source
 */
function loadCacheMetadata(cacheDir, source) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, metadataPath, content, error_1, code, errorObj;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    metadataPath = getMetadataPath(cacheDir, source);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(metadataPath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    return [2 /*return*/, (0, slowOperations_js_1.jsonParse)(content)];
                case 3:
                    error_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    if (code === 'ENOENT')
                        return [2 /*return*/, null];
                    errorObj = (0, errors_js_1.toError)(error_1);
                    (0, log_js_1.logError)(errorObj);
                    (0, debug_js_1.logForDebugging)("Failed to load MCPB cache metadata: ".concat(error_1), {
                        level: 'error',
                    });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save cache metadata for an MCPB source
 */
function saveCacheMetadata(cacheDir, source, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var metadataPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    metadataPath = getMetadataPath(cacheDir, source);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(cacheDir)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(metadataPath, (0, slowOperations_js_1.jsonStringify)(metadata, null, 2), 'utf-8')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Download MCPB file from URL
 */
function downloadMcpb(url, destPath, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var started, fetchTelemetryFired, response, data, error_2, errorMsg, fullError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Downloading MCPB from ".concat(url));
                    if (onProgress) {
                        onProgress("Downloading ".concat(url, "..."));
                    }
                    started = performance.now();
                    fetchTelemetryFired = false;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            timeout: 120000, // 2 minute timeout
                            responseType: 'arraybuffer',
                            maxRedirects: 5, // Follow redirects (like curl -L)
                            onDownloadProgress: function (progressEvent) {
                                if (progressEvent.total && onProgress) {
                                    var percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                                    onProgress("Downloading... ".concat(percent, "%"));
                                }
                            },
                        })];
                case 2:
                    response = _a.sent();
                    data = new Uint8Array(response.data);
                    // Fire telemetry before writeFile — the event measures the network
                    // fetch, not disk I/O. A writeFile EACCES would otherwise match
                    // classifyFetchError's /permission denied/ → misreport as auth.
                    (0, fetchTelemetry_js_1.logPluginFetch)('mcpb', url, 'success', performance.now() - started);
                    fetchTelemetryFired = true;
                    // Save to disk (binary data)
                    return [4 /*yield*/, (0, promises_1.writeFile)(destPath, Buffer.from(data))];
                case 3:
                    // Save to disk (binary data)
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Downloaded ".concat(data.length, " bytes to ").concat(destPath));
                    if (onProgress) {
                        onProgress('Download complete');
                    }
                    return [2 /*return*/, data];
                case 4:
                    error_2 = _a.sent();
                    if (!fetchTelemetryFired) {
                        (0, fetchTelemetry_js_1.logPluginFetch)('mcpb', url, 'failure', performance.now() - started, (0, fetchTelemetry_js_1.classifyFetchError)(error_2));
                    }
                    errorMsg = (0, errors_js_1.errorMessage)(error_2);
                    fullError = new Error("Failed to download MCPB file from ".concat(url, ": ").concat(errorMsg));
                    (0, log_js_1.logError)(fullError);
                    throw fullError;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract MCPB file and write contents to extraction directory.
 *
 * @param modes - name→mode map from `parseZipModes`. MCPB bundles can ship
 *   native MCP server binaries, so preserving the exec bit matters here.
 */
function extractMcpbContents(unzipped, extractPath, modes, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var filesWritten, entries, totalFiles, _i, entries_1, _a, filePath, fileData, fullPath, dir, isTextFile, content, mode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (onProgress) {
                        onProgress('Extracting files...');
                    }
                    // Create extraction directory
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(extractPath)
                        // Write all files. Filter directory entries from the count so progress
                        // messages use the same denominator as filesWritten (which skips them).
                    ];
                case 1:
                    // Create extraction directory
                    _b.sent();
                    filesWritten = 0;
                    entries = Object.entries(unzipped).filter(function (_a) {
                        var k = _a[0];
                        return !k.endsWith('/');
                    });
                    totalFiles = entries.length;
                    _i = 0, entries_1 = entries;
                    _b.label = 2;
                case 2:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 12];
                    _a = entries_1[_i], filePath = _a[0], fileData = _a[1];
                    fullPath = (0, path_1.join)(extractPath, filePath);
                    dir = (0, path_1.dirname)(fullPath);
                    if (!(dir !== extractPath)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dir)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    isTextFile = filePath.endsWith('.json') ||
                        filePath.endsWith('.js') ||
                        filePath.endsWith('.ts') ||
                        filePath.endsWith('.txt') ||
                        filePath.endsWith('.md') ||
                        filePath.endsWith('.yml') ||
                        filePath.endsWith('.yaml');
                    if (!isTextFile) return [3 /*break*/, 6];
                    content = new TextDecoder().decode(fileData);
                    return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, content, 'utf-8')];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, Buffer.from(fileData))];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8:
                    mode = modes[filePath];
                    if (!(mode && mode & 73)) return [3 /*break*/, 10];
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    return [4 /*yield*/, (0, promises_1.chmod)(fullPath, mode & 511).catch(function () { })];
                case 9:
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    _b.sent();
                    _b.label = 10;
                case 10:
                    filesWritten++;
                    if (onProgress && filesWritten % 10 === 0) {
                        onProgress("Extracted ".concat(filesWritten, "/").concat(totalFiles, " files"));
                    }
                    _b.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 2];
                case 12:
                    (0, debug_js_1.logForDebugging)("Extracted ".concat(filesWritten, " files to ").concat(extractPath));
                    if (onProgress) {
                        onProgress("Extraction complete (".concat(filesWritten, " files)"));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if an MCPB source has changed and needs re-extraction
 */
function checkMcpbChanged(source, pluginPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cacheDir, metadata, error_3, code, localPath, stats, error_4, code, cachedTime, fileTime;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cacheDir = getMcpbCacheDir(pluginPath);
                    return [4 /*yield*/, loadCacheMetadata(cacheDir, source)];
                case 1:
                    metadata = _a.sent();
                    if (!metadata) {
                        // No cache metadata, needs loading
                        return [2 /*return*/, true];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.stat(metadata.extractedPath)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_3);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("MCPB extraction path missing: ".concat(metadata.extractedPath));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("MCPB extraction path inaccessible: ".concat(metadata.extractedPath, ": ").concat(error_3), { level: 'error' });
                    }
                    return [2 /*return*/, true];
                case 5:
                    if (!!isUrl(source)) return [3 /*break*/, 10];
                    localPath = (0, path_1.join)(pluginPath, source);
                    stats = void 0;
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, fs.stat(localPath)];
                case 7:
                    stats = _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_4);
                    if (code === 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("MCPB source file missing: ".concat(localPath));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("MCPB source file inaccessible: ".concat(localPath, ": ").concat(error_4), { level: 'error' });
                    }
                    return [2 /*return*/, true];
                case 9:
                    cachedTime = new Date(metadata.cachedAt).getTime();
                    fileTime = Math.floor(stats.mtimeMs);
                    if (fileTime > cachedTime) {
                        (0, debug_js_1.logForDebugging)("MCPB file modified: ".concat(new Date(fileTime), " > ").concat(new Date(cachedTime)));
                        return [2 /*return*/, true];
                    }
                    _a.label = 10;
                case 10: 
                // For URLs, we'll re-check on explicit update (handled elsewhere)
                return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Load and extract an MCPB file, with caching and user configuration support
 *
 * @param source - MCPB file path or URL
 * @param pluginPath - Plugin directory path
 * @param pluginId - Plugin identifier in "plugin@marketplace" format (for config storage)
 * @param onProgress - Progress callback
 * @param providedUserConfig - User configuration values (for initial setup or reconfiguration)
 * @returns Success with MCP config, or needs-config status with schema
 */
function loadMcpbFile(source, pluginPath, pluginId, onProgress, providedUserConfig, forceConfigDialog) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cacheDir, metadata, _a, manifestPath, manifestContent, error_5, err, manifestData_1, manifest_1, serverName, savedConfig, userConfig, validation, mcpConfig_1, mcpConfig_2, mcpbData, mcpbFilePath, sourceHash, localPath, error_6, err, contentHash, unzipped, modes, manifestData, error, manifest, error, extractPath, serverName, savedConfig, userConfig, validation, newMetadata_1, mcpConfig_3, newMetadata_2, mcpConfig, newMetadata;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cacheDir = getMcpbCacheDir(pluginPath);
                    return [4 /*yield*/, fs.mkdir(cacheDir)];
                case 1:
                    _d.sent();
                    (0, debug_js_1.logForDebugging)("Loading MCPB from source: ".concat(source));
                    return [4 /*yield*/, loadCacheMetadata(cacheDir, source)];
                case 2:
                    metadata = _d.sent();
                    _a = metadata;
                    if (!_a) return [3 /*break*/, 4];
                    return [4 /*yield*/, checkMcpbChanged(source, pluginPath)];
                case 3:
                    _a = !(_d.sent());
                    _d.label = 4;
                case 4:
                    if (!_a) return [3 /*break*/, 13];
                    (0, debug_js_1.logForDebugging)("Using cached MCPB from ".concat(metadata.extractedPath, " (hash: ").concat(metadata.contentHash, ")"));
                    manifestPath = (0, path_1.join)(metadata.extractedPath, 'manifest.json');
                    manifestContent = void 0;
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fs.readFile(manifestPath, { encoding: 'utf-8' })];
                case 6:
                    manifestContent = _d.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _d.sent();
                    if ((0, errors_js_1.isENOENT)(error_5)) {
                        err = new Error("Cached manifest not found: ".concat(manifestPath));
                        (0, log_js_1.logError)(err);
                        throw err;
                    }
                    throw error_5;
                case 8:
                    manifestData_1 = new TextEncoder().encode(manifestContent);
                    return [4 /*yield*/, (0, helpers_js_1.parseAndValidateManifestFromBytes)(manifestData_1)
                        // Check for user_config requirement
                    ];
                case 9:
                    manifest_1 = _d.sent();
                    if (!(manifest_1.user_config && Object.keys(manifest_1.user_config).length > 0)) return [3 /*break*/, 11];
                    serverName = manifest_1.name;
                    savedConfig = loadMcpServerUserConfig(pluginId, serverName);
                    userConfig = providedUserConfig || savedConfig || {};
                    validation = validateUserConfig(userConfig, manifest_1.user_config);
                    // Return needs-config if: forced (reconfiguration) OR validation failed
                    if (forceConfigDialog || !validation.valid) {
                        return [2 /*return*/, {
                                status: 'needs-config',
                                manifest: manifest_1,
                                extractedPath: metadata.extractedPath,
                                contentHash: metadata.contentHash,
                                configSchema: manifest_1.user_config,
                                existingConfig: savedConfig || {},
                                validationErrors: validation.valid ? [] : validation.errors,
                            }];
                    }
                    // Save config if it was provided (first time or reconfiguration)
                    if (providedUserConfig) {
                        saveMcpServerUserConfig(pluginId, serverName, providedUserConfig, (_b = manifest_1.user_config) !== null && _b !== void 0 ? _b : {});
                    }
                    return [4 /*yield*/, generateMcpConfig(manifest_1, metadata.extractedPath, userConfig)];
                case 10:
                    mcpConfig_1 = _d.sent();
                    return [2 /*return*/, {
                            manifest: manifest_1,
                            mcpConfig: mcpConfig_1,
                            extractedPath: metadata.extractedPath,
                            contentHash: metadata.contentHash,
                        }];
                case 11: return [4 /*yield*/, generateMcpConfig(manifest_1, metadata.extractedPath)];
                case 12:
                    mcpConfig_2 = _d.sent();
                    return [2 /*return*/, {
                            manifest: manifest_1,
                            mcpConfig: mcpConfig_2,
                            extractedPath: metadata.extractedPath,
                            contentHash: metadata.contentHash,
                        }];
                case 13:
                    if (!isUrl(source)) return [3 /*break*/, 15];
                    sourceHash = (0, crypto_1.createHash)('md5')
                        .update(source)
                        .digest('hex')
                        .substring(0, 8);
                    mcpbFilePath = (0, path_1.join)(cacheDir, "".concat(sourceHash, ".mcpb"));
                    return [4 /*yield*/, downloadMcpb(source, mcpbFilePath, onProgress)];
                case 14:
                    mcpbData = _d.sent();
                    return [3 /*break*/, 19];
                case 15:
                    localPath = (0, path_1.join)(pluginPath, source);
                    if (onProgress) {
                        onProgress("Loading ".concat(source, "..."));
                    }
                    _d.label = 16;
                case 16:
                    _d.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, fs.readFileBytes(localPath)];
                case 17:
                    mcpbData = _d.sent();
                    mcpbFilePath = localPath;
                    return [3 /*break*/, 19];
                case 18:
                    error_6 = _d.sent();
                    if ((0, errors_js_1.isENOENT)(error_6)) {
                        err = new Error("MCPB file not found: ".concat(localPath));
                        (0, log_js_1.logError)(err);
                        throw err;
                    }
                    throw error_6;
                case 19:
                    contentHash = generateContentHash(mcpbData);
                    (0, debug_js_1.logForDebugging)("MCPB content hash: ".concat(contentHash));
                    // Extract ZIP
                    if (onProgress) {
                        onProgress('Extracting MCPB archive...');
                    }
                    return [4 /*yield*/, (0, zip_js_1.unzipFile)(Buffer.from(mcpbData))
                        // fflate doesn't surface external_attr — parse the central directory so
                        // native MCP server binaries keep their exec bit after extraction.
                    ];
                case 20:
                    unzipped = _d.sent();
                    modes = (0, zip_js_1.parseZipModes)(mcpbData);
                    manifestData = unzipped['manifest.json'];
                    if (!manifestData) {
                        error = new Error('No manifest.json found in MCPB file');
                        (0, log_js_1.logError)(error);
                        throw error;
                    }
                    return [4 /*yield*/, (0, helpers_js_1.parseAndValidateManifestFromBytes)(manifestData)];
                case 21:
                    manifest = _d.sent();
                    (0, debug_js_1.logForDebugging)("MCPB manifest: ".concat(manifest.name, " v").concat(manifest.version, " by ").concat(manifest.author.name));
                    // Check if manifest has server config
                    if (!manifest.server) {
                        error = new Error("MCPB manifest for \"".concat(manifest.name, "\" does not define a server configuration"));
                        (0, log_js_1.logError)(error);
                        throw error;
                    }
                    extractPath = (0, path_1.join)(cacheDir, contentHash);
                    return [4 /*yield*/, extractMcpbContents(unzipped, extractPath, modes, onProgress)
                        // Check for user_config requirement
                    ];
                case 22:
                    _d.sent();
                    if (!(manifest.user_config && Object.keys(manifest.user_config).length > 0)) return [3 /*break*/, 27];
                    serverName = manifest.name;
                    savedConfig = loadMcpServerUserConfig(pluginId, serverName);
                    userConfig = providedUserConfig || savedConfig || {};
                    validation = validateUserConfig(userConfig, manifest.user_config);
                    if (!!validation.valid) return [3 /*break*/, 24];
                    newMetadata_1 = {
                        source: source,
                        contentHash: contentHash,
                        extractedPath: extractPath,
                        cachedAt: new Date().toISOString(),
                        lastChecked: new Date().toISOString(),
                    };
                    return [4 /*yield*/, saveCacheMetadata(cacheDir, source, newMetadata_1)
                        // Return "needs configuration" status
                    ];
                case 23:
                    _d.sent();
                    // Return "needs configuration" status
                    return [2 /*return*/, {
                            status: 'needs-config',
                            manifest: manifest,
                            extractedPath: extractPath,
                            contentHash: contentHash,
                            configSchema: manifest.user_config,
                            existingConfig: savedConfig || {},
                            validationErrors: validation.errors,
                        }];
                case 24:
                    // Save config if it was provided (first time or reconfiguration)
                    if (providedUserConfig) {
                        saveMcpServerUserConfig(pluginId, serverName, providedUserConfig, (_c = manifest.user_config) !== null && _c !== void 0 ? _c : {});
                    }
                    // Generate MCP config WITH user config
                    if (onProgress) {
                        onProgress('Generating MCP server configuration...');
                    }
                    return [4 /*yield*/, generateMcpConfig(manifest, extractPath, userConfig)
                        // Save cache metadata
                    ];
                case 25:
                    mcpConfig_3 = _d.sent();
                    newMetadata_2 = {
                        source: source,
                        contentHash: contentHash,
                        extractedPath: extractPath,
                        cachedAt: new Date().toISOString(),
                        lastChecked: new Date().toISOString(),
                    };
                    return [4 /*yield*/, saveCacheMetadata(cacheDir, source, newMetadata_2)];
                case 26:
                    _d.sent();
                    return [2 /*return*/, {
                            manifest: manifest,
                            mcpConfig: mcpConfig_3,
                            extractedPath: extractPath,
                            contentHash: contentHash,
                        }];
                case 27:
                    // No user_config required - generate config without it
                    if (onProgress) {
                        onProgress('Generating MCP server configuration...');
                    }
                    return [4 /*yield*/, generateMcpConfig(manifest, extractPath)
                        // Save cache metadata
                    ];
                case 28:
                    mcpConfig = _d.sent();
                    newMetadata = {
                        source: source,
                        contentHash: contentHash,
                        extractedPath: extractPath,
                        cachedAt: new Date().toISOString(),
                        lastChecked: new Date().toISOString(),
                    };
                    return [4 /*yield*/, saveCacheMetadata(cacheDir, source, newMetadata)];
                case 29:
                    _d.sent();
                    (0, debug_js_1.logForDebugging)("Successfully loaded MCPB: ".concat(manifest.name, " (extracted to ").concat(extractPath, ")"));
                    return [2 /*return*/, {
                            manifest: manifest,
                            mcpConfig: mcpConfig,
                            extractedPath: extractPath,
                            contentHash: contentHash,
                        }];
            }
        });
    });
}
