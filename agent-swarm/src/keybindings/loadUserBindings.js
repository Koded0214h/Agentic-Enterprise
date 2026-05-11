"use strict";
/**
 * User keybinding configuration loader with hot-reload support.
 *
 * Loads keybindings from ~/.claude/keybindings.json and watches
 * for changes to reload them automatically.
 *
 * NOTE: User keybinding customization is currently only available for
 * Anthropic employees (USER_TYPE === 'ant'). External users always
 * use the default bindings.
 */
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
exports.subscribeToKeybindingChanges = void 0;
exports.isKeybindingCustomizationEnabled = isKeybindingCustomizationEnabled;
exports.getKeybindingsPath = getKeybindingsPath;
exports.loadKeybindings = loadKeybindings;
exports.loadKeybindingsSync = loadKeybindingsSync;
exports.loadKeybindingsSyncWithWarnings = loadKeybindingsSyncWithWarnings;
exports.initializeKeybindingWatcher = initializeKeybindingWatcher;
exports.disposeKeybindingWatcher = disposeKeybindingWatcher;
exports.getCachedKeybindingWarnings = getCachedKeybindingWarnings;
exports.resetKeybindingLoaderForTesting = resetKeybindingLoaderForTesting;
var chokidar_1 = require("chokidar");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var debug_js_1 = require("../utils/debug.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var signal_js_1 = require("../utils/signal.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var defaultBindings_js_1 = require("./defaultBindings.js");
var parser_js_1 = require("./parser.js");
var validate_js_1 = require("./validate.js");
/**
 * Check if keybinding customization is enabled.
 *
 * Returns true if the tengu_keybinding_customization_release GrowthBook gate is enabled.
 *
 * This function is exported so other parts of the codebase (e.g., /doctor)
 * can check the same condition consistently.
 */
function isKeybindingCustomizationEnabled() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_keybinding_customization_release', false);
}
/**
 * Time in milliseconds to wait for file writes to stabilize.
 */
var FILE_STABILITY_THRESHOLD_MS = 500;
/**
 * Polling interval for checking file stability.
 */
var FILE_STABILITY_POLL_INTERVAL_MS = 200;
var watcher = null;
var initialized = false;
var disposed = false;
var cachedBindings = null;
var cachedWarnings = [];
var keybindingsChanged = (0, signal_js_1.createSignal)();
/**
 * Tracks the date (YYYY-MM-DD) when we last logged a custom keybindings load event.
 * Used to ensure we fire the event at most once per day.
 */
var lastCustomBindingsLogDate = null;
/**
 * Log a telemetry event when custom keybindings are loaded, at most once per day.
 * This lets us estimate the percentage of users who customize their keybindings.
 */
function logCustomBindingsLoadedOncePerDay(userBindingCount) {
    var today = new Date().toISOString().slice(0, 10);
    if (lastCustomBindingsLogDate === today)
        return;
    lastCustomBindingsLogDate = today;
    (0, index_js_1.logEvent)('tengu_custom_keybindings_loaded', {
        user_binding_count: userBindingCount,
    });
}
/**
 * Type guard to check if an object is a valid KeybindingBlock.
 */
function isKeybindingBlock(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    var b = obj;
    return (typeof b.context === 'string' &&
        typeof b.bindings === 'object' &&
        b.bindings !== null);
}
/**
 * Type guard to check if an array contains only valid KeybindingBlocks.
 */
function isKeybindingBlockArray(arr) {
    return Array.isArray(arr) && arr.every(isKeybindingBlock);
}
/**
 * Get the path to the user keybindings file.
 */
function getKeybindingsPath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'keybindings.json');
}
/**
 * Parse default bindings (cached for performance).
 */
function getDefaultParsedBindings() {
    return (0, parser_js_1.parseBindings)(defaultBindings_js_1.DEFAULT_BINDINGS);
}
/**
 * Load and parse keybindings from user config file.
 * Returns merged default + user bindings along with validation warnings.
 *
 * For external users, always returns default bindings only.
 * User customization is currently gated to Anthropic employees.
 */
function loadKeybindings() {
    return __awaiter(this, void 0, void 0, function () {
        var defaultBindings, userPath, content, parsed, userBlocks, errorMessage_1, suggestion, errorMessage_2, suggestion, userParsed, mergedBindings, duplicateKeyWarnings, warnings, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    defaultBindings = getDefaultParsedBindings();
                    // Skip user config loading for external users
                    if (!isKeybindingCustomizationEnabled()) {
                        return [2 /*return*/, { bindings: defaultBindings, warnings: [] }];
                    }
                    userPath = getKeybindingsPath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(userPath, 'utf-8')];
                case 2:
                    content = _a.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    userBlocks = void 0;
                    if (typeof parsed === 'object' && parsed !== null && 'bindings' in parsed) {
                        userBlocks = parsed.bindings;
                    }
                    else {
                        errorMessage_1 = 'keybindings.json must have a "bindings" array';
                        suggestion = 'Use format: { "bindings": [ ... ] }';
                        (0, debug_js_1.logForDebugging)("[keybindings] Invalid keybindings.json: ".concat(errorMessage_1));
                        return [2 /*return*/, {
                                bindings: defaultBindings,
                                warnings: [
                                    {
                                        type: 'parse_error',
                                        severity: 'error',
                                        message: errorMessage_1,
                                        suggestion: suggestion,
                                    },
                                ],
                            }];
                    }
                    // Validate structure - bindings must be an array of valid keybinding blocks
                    if (!isKeybindingBlockArray(userBlocks)) {
                        errorMessage_2 = !Array.isArray(userBlocks)
                            ? '"bindings" must be an array'
                            : 'keybindings.json contains invalid block structure';
                        suggestion = !Array.isArray(userBlocks)
                            ? 'Set "bindings" to an array of keybinding blocks'
                            : 'Each block must have "context" (string) and "bindings" (object)';
                        (0, debug_js_1.logForDebugging)("[keybindings] Invalid keybindings.json: ".concat(errorMessage_2));
                        return [2 /*return*/, {
                                bindings: defaultBindings,
                                warnings: [
                                    {
                                        type: 'parse_error',
                                        severity: 'error',
                                        message: errorMessage_2,
                                        suggestion: suggestion,
                                    },
                                ],
                            }];
                    }
                    userParsed = (0, parser_js_1.parseBindings)(userBlocks);
                    (0, debug_js_1.logForDebugging)("[keybindings] Loaded ".concat(userParsed.length, " user bindings from ").concat(userPath));
                    mergedBindings = __spreadArray(__spreadArray([], defaultBindings, true), userParsed, true);
                    logCustomBindingsLoadedOncePerDay(userParsed.length);
                    duplicateKeyWarnings = (0, validate_js_1.checkDuplicateKeysInJson)(content);
                    warnings = __spreadArray(__spreadArray([], duplicateKeyWarnings, true), (0, validate_js_1.validateBindings)(userBlocks, mergedBindings), true);
                    if (warnings.length > 0) {
                        (0, debug_js_1.logForDebugging)("[keybindings] Found ".concat(warnings.length, " validation issue(s)"));
                    }
                    return [2 /*return*/, { bindings: mergedBindings, warnings: warnings }];
                case 3:
                    error_1 = _a.sent();
                    // File doesn't exist - use defaults (user can run /keybindings to create)
                    if ((0, errors_js_1.isENOENT)(error_1)) {
                        return [2 /*return*/, { bindings: defaultBindings, warnings: [] }];
                    }
                    // Other error - log and return defaults with warning
                    (0, debug_js_1.logForDebugging)("[keybindings] Error loading ".concat(userPath, ": ").concat((0, errors_js_1.errorMessage)(error_1)));
                    return [2 /*return*/, {
                            bindings: defaultBindings,
                            warnings: [
                                {
                                    type: 'parse_error',
                                    severity: 'error',
                                    message: "Failed to parse keybindings.json: ".concat((0, errors_js_1.errorMessage)(error_1)),
                                },
                            ],
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Load keybindings synchronously (for initial render).
 * Uses cached value if available.
 */
function loadKeybindingsSync() {
    if (cachedBindings) {
        return cachedBindings;
    }
    var result = loadKeybindingsSyncWithWarnings();
    return result.bindings;
}
/**
 * Load keybindings synchronously with validation warnings.
 * Uses cached values if available.
 *
 * For external users, always returns default bindings only.
 * User customization is currently gated to Anthropic employees.
 */
function loadKeybindingsSyncWithWarnings() {
    if (cachedBindings) {
        return { bindings: cachedBindings, warnings: cachedWarnings };
    }
    var defaultBindings = getDefaultParsedBindings();
    // Skip user config loading for external users
    if (!isKeybindingCustomizationEnabled()) {
        cachedBindings = defaultBindings;
        cachedWarnings = [];
        return { bindings: cachedBindings, warnings: cachedWarnings };
    }
    var userPath = getKeybindingsPath();
    try {
        // sync IO: called from sync context (React useState initializer)
        var content = (0, fs_1.readFileSync)(userPath, 'utf-8');
        var parsed = (0, slowOperations_js_1.jsonParse)(content);
        // Extract bindings array from object wrapper format: { "bindings": [...] }
        var userBlocks = void 0;
        if (typeof parsed === 'object' && parsed !== null && 'bindings' in parsed) {
            userBlocks = parsed.bindings;
        }
        else {
            // Invalid format - missing bindings property
            cachedBindings = defaultBindings;
            cachedWarnings = [
                {
                    type: 'parse_error',
                    severity: 'error',
                    message: 'keybindings.json must have a "bindings" array',
                    suggestion: 'Use format: { "bindings": [ ... ] }',
                },
            ];
            return { bindings: cachedBindings, warnings: cachedWarnings };
        }
        // Validate structure - bindings must be an array of valid keybinding blocks
        if (!isKeybindingBlockArray(userBlocks)) {
            var errorMessage_3 = !Array.isArray(userBlocks)
                ? '"bindings" must be an array'
                : 'keybindings.json contains invalid block structure';
            var suggestion = !Array.isArray(userBlocks)
                ? 'Set "bindings" to an array of keybinding blocks'
                : 'Each block must have "context" (string) and "bindings" (object)';
            cachedBindings = defaultBindings;
            cachedWarnings = [
                {
                    type: 'parse_error',
                    severity: 'error',
                    message: errorMessage_3,
                    suggestion: suggestion,
                },
            ];
            return { bindings: cachedBindings, warnings: cachedWarnings };
        }
        var userParsed = (0, parser_js_1.parseBindings)(userBlocks);
        (0, debug_js_1.logForDebugging)("[keybindings] Loaded ".concat(userParsed.length, " user bindings from ").concat(userPath));
        cachedBindings = __spreadArray(__spreadArray([], defaultBindings, true), userParsed, true);
        logCustomBindingsLoadedOncePerDay(userParsed.length);
        // Run validation - check for duplicate keys in raw JSON first
        var duplicateKeyWarnings = (0, validate_js_1.checkDuplicateKeysInJson)(content);
        cachedWarnings = __spreadArray(__spreadArray([], duplicateKeyWarnings, true), (0, validate_js_1.validateBindings)(userBlocks, cachedBindings), true);
        if (cachedWarnings.length > 0) {
            (0, debug_js_1.logForDebugging)("[keybindings] Found ".concat(cachedWarnings.length, " validation issue(s)"));
        }
        return { bindings: cachedBindings, warnings: cachedWarnings };
    }
    catch (_a) {
        // File doesn't exist or error - use defaults (user can run /keybindings to create)
        cachedBindings = defaultBindings;
        cachedWarnings = [];
        return { bindings: cachedBindings, warnings: cachedWarnings };
    }
}
/**
 * Initialize file watching for keybindings.json.
 * Call this once when the app starts.
 *
 * For external users, this is a no-op since user customization is disabled.
 */
function initializeKeybindingWatcher() {
    return __awaiter(this, void 0, void 0, function () {
        var userPath, watchDir, stats, _a;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (initialized || disposed)
                        return [2 /*return*/];
                    // Skip file watching for external users
                    if (!isKeybindingCustomizationEnabled()) {
                        (0, debug_js_1.logForDebugging)('[keybindings] Skipping file watcher - user customization disabled');
                        return [2 /*return*/];
                    }
                    userPath = getKeybindingsPath();
                    watchDir = (0, path_1.dirname)(userPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(watchDir)];
                case 2:
                    stats = _b.sent();
                    if (!stats.isDirectory()) {
                        (0, debug_js_1.logForDebugging)("[keybindings] Not watching: ".concat(watchDir, " is not a directory"));
                        return [2 /*return*/];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    (0, debug_js_1.logForDebugging)("[keybindings] Not watching: ".concat(watchDir, " does not exist"));
                    return [2 /*return*/];
                case 4:
                    // Set initialized only after we've confirmed we can watch
                    initialized = true;
                    (0, debug_js_1.logForDebugging)("[keybindings] Watching for changes to ".concat(userPath));
                    watcher = chokidar_1.default.watch(userPath, {
                        persistent: true,
                        ignoreInitial: true,
                        awaitWriteFinish: {
                            stabilityThreshold: FILE_STABILITY_THRESHOLD_MS,
                            pollInterval: FILE_STABILITY_POLL_INTERVAL_MS,
                        },
                        ignorePermissionErrors: true,
                        usePolling: false,
                        atomic: true,
                    });
                    watcher.on('add', handleChange);
                    watcher.on('change', handleChange);
                    watcher.on('unlink', handleDelete);
                    // Register cleanup
                    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, disposeKeybindingWatcher()];
                    }); }); });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up the file watcher.
 */
function disposeKeybindingWatcher() {
    disposed = true;
    if (watcher) {
        void watcher.close();
        watcher = null;
    }
    keybindingsChanged.clear();
}
/**
 * Subscribe to keybinding changes.
 * The listener receives the new parsed bindings when the file changes.
 */
exports.subscribeToKeybindingChanges = keybindingsChanged.subscribe;
function handleChange(path) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("[keybindings] Detected change to ".concat(path));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadKeybindings()];
                case 2:
                    result = _a.sent();
                    cachedBindings = result.bindings;
                    cachedWarnings = result.warnings;
                    // Notify all listeners with the full result
                    keybindingsChanged.emit(result);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[keybindings] Error reloading: ".concat((0, errors_js_1.errorMessage)(error_2)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleDelete(path) {
    (0, debug_js_1.logForDebugging)("[keybindings] Detected deletion of ".concat(path));
    // Reset to defaults when file is deleted
    var defaultBindings = getDefaultParsedBindings();
    cachedBindings = defaultBindings;
    cachedWarnings = [];
    keybindingsChanged.emit({ bindings: defaultBindings, warnings: [] });
}
/**
 * Get the cached keybinding warnings.
 * Returns empty array if no warnings or bindings haven't been loaded yet.
 */
function getCachedKeybindingWarnings() {
    return cachedWarnings;
}
/**
 * Reset internal state for testing.
 */
function resetKeybindingLoaderForTesting() {
    initialized = false;
    disposed = false;
    cachedBindings = null;
    cachedWarnings = [];
    lastCustomBindingsLogDate = null;
    if (watcher) {
        void watcher.close();
        watcher = null;
    }
    keybindingsChanged.clear();
}
