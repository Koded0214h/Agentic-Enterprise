"use strict";
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
exports.macOsKeychainStorage = void 0;
exports.isMacOsKeychainLocked = isMacOsKeychainLocked;
var execa_1 = require("execa");
var debug_js_1 = require("../debug.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var execFileNoThrowPortable_js_1 = require("../execFileNoThrowPortable.js");
var slowOperations_js_1 = require("../slowOperations.js");
var macOsKeychainHelpers_js_1 = require("./macOsKeychainHelpers.js");
// `security -i` reads stdin with a 4096-byte fgets() buffer (BUFSIZ on darwin).
// A command line longer than this is truncated mid-argument: the first 4096
// bytes are consumed as one command (unterminated quote → fails), the overflow
// is interpreted as a second unknown command. Net: non-zero exit with NO data
// written, but the *previous* keychain entry is left intact — which fallback
// storage then reads as stale. See #30337.
// Headroom of 64B below the limit guards against edge-case line-terminator
// accounting differences.
var SECURITY_STDIN_LINE_LIMIT = 4096 - 64;
exports.macOsKeychainStorage = {
    name: 'keychain',
    read: function () {
        var prev = macOsKeychainHelpers_js_1.keychainCacheState.cache;
        if (Date.now() - prev.cachedAt < macOsKeychainHelpers_js_1.KEYCHAIN_CACHE_TTL_MS) {
            return prev.data;
        }
        try {
            var storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)(macOsKeychainHelpers_js_1.CREDENTIALS_SERVICE_SUFFIX);
            var username = (0, macOsKeychainHelpers_js_1.getUsername)();
            var result = (0, execFileNoThrowPortable_js_1.execSyncWithDefaults_DEPRECATED)("security find-generic-password -a \"".concat(username, "\" -w -s \"").concat(storageServiceName, "\""));
            if (result) {
                var data = (0, slowOperations_js_1.jsonParse)(result);
                macOsKeychainHelpers_js_1.keychainCacheState.cache = { data: data, cachedAt: Date.now() };
                return data;
            }
        }
        catch (_e) {
            // fall through
        }
        // Stale-while-error: if we had a value before and the refresh failed,
        // keep serving the stale value rather than caching null. Since #23192
        // clears the upstream memoize on every API request (macOS path), a
        // single transient `security` spawn failure would otherwise poison the
        // cache and surface as "Not logged in" across all subsystems until the
        // next user interaction. clearKeychainCache() sets data=null, so
        // explicit invalidation (logout, delete) still reads through.
        if (prev.data !== null) {
            (0, debug_js_1.logForDebugging)('[keychain] read failed; serving stale cache', {
                level: 'warn',
            });
            macOsKeychainHelpers_js_1.keychainCacheState.cache = { data: prev.data, cachedAt: Date.now() };
            return prev.data;
        }
        macOsKeychainHelpers_js_1.keychainCacheState.cache = { data: null, cachedAt: Date.now() };
        return null;
    },
    readAsync: function () {
        return __awaiter(this, void 0, void 0, function () {
            var prev, gen, promise;
            return __generator(this, function (_a) {
                prev = macOsKeychainHelpers_js_1.keychainCacheState.cache;
                if (Date.now() - prev.cachedAt < macOsKeychainHelpers_js_1.KEYCHAIN_CACHE_TTL_MS) {
                    return [2 /*return*/, prev.data];
                }
                if (macOsKeychainHelpers_js_1.keychainCacheState.readInFlight) {
                    return [2 /*return*/, macOsKeychainHelpers_js_1.keychainCacheState.readInFlight];
                }
                gen = macOsKeychainHelpers_js_1.keychainCacheState.generation;
                promise = doReadAsync().then(function (data) {
                    // If the cache was invalidated or updated while we were reading,
                    // our subprocess result is stale — don't overwrite the newer entry.
                    if (gen === macOsKeychainHelpers_js_1.keychainCacheState.generation) {
                        // Stale-while-error — mirror read() above.
                        if (data === null && prev.data !== null) {
                            (0, debug_js_1.logForDebugging)('[keychain] readAsync failed; serving stale cache', {
                                level: 'warn',
                            });
                        }
                        var next = data !== null && data !== void 0 ? data : prev.data;
                        macOsKeychainHelpers_js_1.keychainCacheState.cache = { data: next, cachedAt: Date.now() };
                        macOsKeychainHelpers_js_1.keychainCacheState.readInFlight = null;
                        return next;
                    }
                    return data;
                });
                macOsKeychainHelpers_js_1.keychainCacheState.readInFlight = promise;
                return [2 /*return*/, promise];
            });
        });
    },
    update: function (data) {
        // Invalidate cache before update
        (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
        try {
            var storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)(macOsKeychainHelpers_js_1.CREDENTIALS_SERVICE_SUFFIX);
            var username = (0, macOsKeychainHelpers_js_1.getUsername)();
            var jsonString = (0, slowOperations_js_1.jsonStringify)(data);
            // Convert to hexadecimal to avoid any escaping issues
            var hexValue = Buffer.from(jsonString, 'utf-8').toString('hex');
            // Prefer stdin (`security -i`) so process monitors (CrowdStrike et al.)
            // see only "security -i", not the payload (INC-3028).
            // When the payload would overflow the stdin line buffer, fall back to
            // argv. Hex in argv is recoverable by a determined observer but defeats
            // naive plaintext-grep rules, and the alternative — silent credential
            // corruption — is strictly worse. ARG_MAX on darwin is 1MB so argv has
            // effectively no size limit for our purposes.
            var command = "add-generic-password -U -a \"".concat(username, "\" -s \"").concat(storageServiceName, "\" -X \"").concat(hexValue, "\"\n");
            var result = void 0;
            if (command.length <= SECURITY_STDIN_LINE_LIMIT) {
                result = (0, execa_1.execaSync)('security', ['-i'], {
                    input: command,
                    stdio: ['pipe', 'pipe', 'pipe'],
                    reject: false,
                });
            }
            else {
                (0, debug_js_1.logForDebugging)("Keychain payload (".concat(jsonString.length, "B JSON) exceeds security -i stdin limit; using argv"), { level: 'warn' });
                result = (0, execa_1.execaSync)('security', [
                    'add-generic-password',
                    '-U',
                    '-a',
                    username,
                    '-s',
                    storageServiceName,
                    '-X',
                    hexValue,
                ], { stdio: ['ignore', 'pipe', 'pipe'], reject: false });
            }
            if (result.exitCode !== 0) {
                return { success: false };
            }
            // Update cache with new data on success
            macOsKeychainHelpers_js_1.keychainCacheState.cache = { data: data, cachedAt: Date.now() };
            return { success: true };
        }
        catch (_e) {
            return { success: false };
        }
    },
    delete: function () {
        // Invalidate cache before delete
        (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
        try {
            var storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)(macOsKeychainHelpers_js_1.CREDENTIALS_SERVICE_SUFFIX);
            var username = (0, macOsKeychainHelpers_js_1.getUsername)();
            (0, execFileNoThrowPortable_js_1.execSyncWithDefaults_DEPRECATED)("security delete-generic-password -a \"".concat(username, "\" -s \"").concat(storageServiceName, "\""));
            return true;
        }
        catch (_e) {
            return false;
        }
    },
};
function doReadAsync() {
    return __awaiter(this, void 0, void 0, function () {
        var storageServiceName, username, _a, stdout, code, _e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    storageServiceName = (0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)(macOsKeychainHelpers_js_1.CREDENTIALS_SERVICE_SUFFIX);
                    username = (0, macOsKeychainHelpers_js_1.getUsername)();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('security', ['find-generic-password', '-a', username, '-w', '-s', storageServiceName], { useCwd: false, preserveOutputOnError: false })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code === 0 && stdout) {
                        return [2 /*return*/, (0, slowOperations_js_1.jsonParse)(stdout.trim())];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _e_1 = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
var keychainLockedCache;
/**
 * Checks if the macOS keychain is locked.
 * Returns true if on macOS and keychain is locked (exit code 36 from security show-keychain-info).
 * This commonly happens in SSH sessions where the keychain isn't automatically unlocked.
 *
 * Cached for process lifetime — execaSync('security', ...) is a ~27ms sync
 * subprocess spawn, and this is called from render (AssistantTextMessage).
 * During virtual-scroll remounts on sessions with "Not logged in" messages,
 * each remount re-spawned security(1), adding 27ms/message to the commit.
 * Keychain lock state doesn't change during a CLI session.
 */
function isMacOsKeychainLocked() {
    if (keychainLockedCache !== undefined)
        return keychainLockedCache;
    // Only check on macOS
    if (process.platform !== 'darwin') {
        keychainLockedCache = false;
        return false;
    }
    try {
        var result = (0, execa_1.execaSync)('security', ['show-keychain-info'], {
            reject: false,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        // Exit code 36 indicates the keychain is locked
        keychainLockedCache = result.exitCode === 36;
    }
    catch (_a) {
        // If the command fails for any reason, assume keychain is not locked
        keychainLockedCache = false;
    }
    return keychainLockedCache;
}
