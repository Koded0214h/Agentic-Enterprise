"use strict";
/**
 * MDM (Mobile Device Management) profile enforcement for Claude Code managed settings.
 *
 * Reads enterprise settings from OS-level MDM configuration:
 * - macOS: `com.anthropic.claudecode` preference domain
 *   (MDM profiles at /Library/Managed Preferences/ only — not user-writable ~/Library/Preferences/)
 * - Windows: `HKLM\SOFTWARE\Policies\ClaudeCode` (admin-only)
 *   and `HKCU\SOFTWARE\Policies\ClaudeCode` (user-writable, lowest priority)
 * - Linux: No MDM equivalent (uses /etc/claude-code/managed-settings.json instead)
 *
 * Policy settings use "first source wins" — the highest-priority source that exists
 * provides all policy settings. Priority (highest to lowest):
 *   remote → HKLM/plist → managed-settings.json → HKCU
 *
 * Architecture:
 *   constants.ts — shared constants and plist path builder (zero heavy imports)
 *   rawRead.ts   — subprocess I/O only (zero heavy imports, fires at main.tsx evaluation)
 *   settings.ts  — parsing, caching, first-source-wins logic (this file)
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
exports.startMdmSettingsLoad = startMdmSettingsLoad;
exports.ensureMdmSettingsLoaded = ensureMdmSettingsLoaded;
exports.getMdmSettings = getMdmSettings;
exports.getHkcuSettings = getHkcuSettings;
exports.clearMdmSettingsCache = clearMdmSettingsCache;
exports.setMdmSettingsCache = setMdmSettingsCache;
exports.refreshMdmSettings = refreshMdmSettings;
exports.parseCommandOutputAsSettings = parseCommandOutputAsSettings;
exports.parseRegQueryStdout = parseRegQueryStdout;
var path_1 = require("path");
var debug_js_1 = require("../../debug.js");
var diagLogs_js_1 = require("../../diagLogs.js");
var fileRead_js_1 = require("../../fileRead.js");
var fsOperations_js_1 = require("../../fsOperations.js");
var json_js_1 = require("../../json.js");
var startupProfiler_js_1 = require("../../startupProfiler.js");
var managedPath_js_1 = require("../managedPath.js");
var types_js_1 = require("../types.js");
var validation_js_1 = require("../validation.js");
var constants_js_1 = require("./constants.js");
var rawRead_js_1 = require("./rawRead.js");
var EMPTY_RESULT = Object.freeze({ settings: {}, errors: [] });
var mdmCache = null;
var hkcuCache = null;
var mdmLoadPromise = null;
// ---------------------------------------------------------------------------
// Startup load — fires early, awaited before first settings read
// ---------------------------------------------------------------------------
/**
 * Kick off async MDM/HKCU reads. Call this as early as possible in
 * startup so the subprocess runs in parallel with module loading.
 */
function startMdmSettingsLoad() {
    var _this = this;
    if (mdmLoadPromise)
        return;
    mdmLoadPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
        var startTime, rawPromise, _a, mdm, hkcu, _b, duration;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    (0, startupProfiler_js_1.profileCheckpoint)('mdm_load_start');
                    startTime = Date.now();
                    rawPromise = (_c = (0, rawRead_js_1.getMdmRawReadPromise)()) !== null && _c !== void 0 ? _c : (0, rawRead_js_1.fireRawRead)();
                    _b = consumeRawReadResult;
                    return [4 /*yield*/, rawPromise];
                case 1:
                    _a = _b.apply(void 0, [_d.sent()]), mdm = _a.mdm, hkcu = _a.hkcu;
                    mdmCache = mdm;
                    hkcuCache = hkcu;
                    (0, startupProfiler_js_1.profileCheckpoint)('mdm_load_end');
                    duration = Date.now() - startTime;
                    (0, debug_js_1.logForDebugging)("MDM settings load completed in ".concat(duration, "ms"));
                    if (Object.keys(mdm.settings).length > 0) {
                        (0, debug_js_1.logForDebugging)("MDM settings found: ".concat(Object.keys(mdm.settings).join(', ')));
                        try {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'mdm_settings_loaded', {
                                duration_ms: duration,
                                key_count: Object.keys(mdm.settings).length,
                                error_count: mdm.errors.length,
                            });
                        }
                        catch (_e) {
                            // Diagnostic logging is best-effort
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); })();
}
/**
 * Await the in-flight MDM load. Call this before the first settings read.
 * If startMdmSettingsLoad() was called early enough, this resolves immediately.
 */
function ensureMdmSettingsLoaded() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!mdmLoadPromise) {
                        startMdmSettingsLoad();
                    }
                    return [4 /*yield*/, mdmLoadPromise];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Sync cache readers — used by the settings pipeline (loadSettingsFromDisk)
// ---------------------------------------------------------------------------
/**
 * Read admin-controlled MDM settings from the session cache.
 *
 * Returns settings from admin-only sources:
 * - macOS: /Library/Managed Preferences/ (requires root)
 * - Windows: HKLM registry (requires admin)
 *
 * Does NOT include HKCU (user-writable) — use getHkcuSettings() for that.
 */
function getMdmSettings() {
    return mdmCache !== null && mdmCache !== void 0 ? mdmCache : EMPTY_RESULT;
}
/**
 * Read HKCU registry settings (user-writable, lowest policy priority).
 * Only relevant on Windows — returns empty on other platforms.
 */
function getHkcuSettings() {
    return hkcuCache !== null && hkcuCache !== void 0 ? hkcuCache : EMPTY_RESULT;
}
// ---------------------------------------------------------------------------
// Cache management
// ---------------------------------------------------------------------------
/**
 * Clear the MDM and HKCU settings caches, forcing a fresh read on next load.
 */
function clearMdmSettingsCache() {
    mdmCache = null;
    hkcuCache = null;
    mdmLoadPromise = null;
}
/**
 * Update the session caches directly. Used by the change detector poll.
 */
function setMdmSettingsCache(mdm, hkcu) {
    mdmCache = mdm;
    hkcuCache = hkcu;
}
// ---------------------------------------------------------------------------
// Refresh — fires a fresh raw read, parses, returns results.
// Used by the 30-minute poll in changeDetector.ts.
// ---------------------------------------------------------------------------
/**
 * Fire a fresh MDM subprocess read and parse the results.
 * Does NOT update the cache — caller decides whether to apply.
 */
function refreshMdmSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var raw;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, rawRead_js_1.fireRawRead)()];
                case 1:
                    raw = _a.sent();
                    return [2 /*return*/, consumeRawReadResult(raw)];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Parsing — converts raw subprocess output to validated MdmResult
// ---------------------------------------------------------------------------
/**
 * Parse JSON command output (plutil stdout or registry JSON value) into SettingsJson.
 * Filters invalid permission rules before schema validation so one bad rule
 * doesn't cause the entire MDM settings to be rejected.
 */
function parseCommandOutputAsSettings(stdout, sourcePath) {
    var data = (0, json_js_1.safeParseJSON)(stdout, false);
    if (!data || typeof data !== 'object') {
        return { settings: {}, errors: [] };
    }
    var ruleWarnings = (0, validation_js_1.filterInvalidPermissionRules)(data, sourcePath);
    var parseResult = (0, types_js_1.SettingsSchema)().safeParse(data);
    if (!parseResult.success) {
        var errors = (0, validation_js_1.formatZodError)(parseResult.error, sourcePath);
        return { settings: {}, errors: __spreadArray(__spreadArray([], ruleWarnings, true), errors, true) };
    }
    return { settings: parseResult.data, errors: ruleWarnings };
}
/**
 * Parse reg query stdout to extract a registry string value.
 * Matches both REG_SZ and REG_EXPAND_SZ, case-insensitive.
 *
 * Expected format:
 *     Settings    REG_SZ    {"json":"value"}
 */
function parseRegQueryStdout(stdout, valueName) {
    if (valueName === void 0) { valueName = 'Settings'; }
    var lines = stdout.split(/\r?\n/);
    var escaped = valueName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp("^\\s+".concat(escaped, "\\s+REG_(?:EXPAND_)?SZ\\s+(.*)$"), 'i');
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var match = line.match(re);
        if (match && match[1]) {
            return match[1].trimEnd();
        }
    }
    return null;
}
/**
 * Convert raw subprocess output into parsed MDM and HKCU results,
 * applying the first-source-wins policy.
 */
function consumeRawReadResult(raw) {
    // macOS: plist result (first source wins — already filtered in mdmRawRead)
    if (raw.plistStdouts && raw.plistStdouts.length > 0) {
        var _a = raw.plistStdouts[0], stdout = _a.stdout, label = _a.label;
        var result = parseCommandOutputAsSettings(stdout, label);
        if (Object.keys(result.settings).length > 0) {
            return { mdm: result, hkcu: EMPTY_RESULT };
        }
    }
    // Windows: HKLM result
    if (raw.hklmStdout) {
        var jsonString = parseRegQueryStdout(raw.hklmStdout);
        if (jsonString) {
            var result = parseCommandOutputAsSettings(jsonString, "Registry: ".concat(constants_js_1.WINDOWS_REGISTRY_KEY_PATH_HKLM, "\\").concat(constants_js_1.WINDOWS_REGISTRY_VALUE_NAME));
            if (Object.keys(result.settings).length > 0) {
                return { mdm: result, hkcu: EMPTY_RESULT };
            }
        }
    }
    // No admin MDM — check managed-settings.json before using HKCU
    if (hasManagedSettingsFile()) {
        return { mdm: EMPTY_RESULT, hkcu: EMPTY_RESULT };
    }
    // Fall through to HKCU (already read in parallel)
    if (raw.hkcuStdout) {
        var jsonString = parseRegQueryStdout(raw.hkcuStdout);
        if (jsonString) {
            var result = parseCommandOutputAsSettings(jsonString, "Registry: ".concat(constants_js_1.WINDOWS_REGISTRY_KEY_PATH_HKCU, "\\").concat(constants_js_1.WINDOWS_REGISTRY_VALUE_NAME));
            return { mdm: EMPTY_RESULT, hkcu: result };
        }
    }
    return { mdm: EMPTY_RESULT, hkcu: EMPTY_RESULT };
}
/**
 * Check if file-based managed settings (managed-settings.json or any
 * managed-settings.d/*.json) exist and have content. Cheap sync check
 * used to skip HKCU when a higher-priority file-based source exists.
 */
function hasManagedSettingsFile() {
    try {
        var filePath = (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), 'managed-settings.json');
        var content = (0, fileRead_js_1.readFileSync)(filePath);
        var data = (0, json_js_1.safeParseJSON)(content, false);
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            return true;
        }
    }
    catch (_a) {
        // fall through to drop-in check
    }
    try {
        var dropInDir = (0, managedPath_js_1.getManagedSettingsDropInDir)();
        var entries = (0, fsOperations_js_1.getFsImplementation)().readdirSync(dropInDir);
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var d = entries_1[_i];
            if (!(d.isFile() || d.isSymbolicLink()) ||
                !d.name.endsWith('.json') ||
                d.name.startsWith('.')) {
                continue;
            }
            try {
                var content = (0, fileRead_js_1.readFileSync)((0, path_1.join)(dropInDir, d.name));
                var data = (0, json_js_1.safeParseJSON)(content, false);
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    return true;
                }
            }
            catch (_b) {
                // skip unreadable/malformed file
            }
        }
    }
    catch (_c) {
        // drop-in dir doesn't exist
    }
    return false;
}
