"use strict";
/**
 * Minimal module for firing macOS keychain reads in parallel with main.tsx
 * module evaluation, same pattern as startMdmRawRead() in settings/mdm/rawRead.ts.
 *
 * isRemoteManagedSettingsEligible() reads two separate keychain entries
 * SEQUENTIALLY via sync execSync during applySafeConfigEnvironmentVariables():
 *   1. "Claude Code-credentials" (OAuth tokens)  — ~32ms
 *   2. "Claude Code" (legacy API key)            — ~33ms
 * Sequential cost: ~65ms on every macOS startup.
 *
 * Firing both here lets the subprocesses run in parallel with the ~65ms of
 * main.tsx imports. ensureKeychainPrefetchCompleted() is awaited alongside
 * ensureMdmSettingsLoaded() in main.tsx preAction — nearly free since the
 * subprocesses finish during import evaluation. Sync read() and
 * getApiKeyFromConfigOrMacOSKeychain() then hit their caches.
 *
 * Imports stay minimal: child_process + macOsKeychainHelpers.ts (NOT
 * macOsKeychainStorage.ts — that pulls in execa → human-signals →
 * cross-spawn, ~58ms of synchronous module init). The helpers file's own
 * import chain (envUtils, oauth constants, crypto) is already evaluated by
 * startupProfiler.ts at main.tsx:5, so no new module-init cost lands here.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKeychainPrefetch = startKeychainPrefetch;
exports.ensureKeychainPrefetchCompleted = ensureKeychainPrefetchCompleted;
exports.getLegacyApiKeyPrefetchResult = getLegacyApiKeyPrefetchResult;
exports.clearLegacyApiKeyPrefetch = clearLegacyApiKeyPrefetch;
var child_process_1 = require("child_process");
var envUtils_js_1 = require("../envUtils.js");
var macOsKeychainHelpers_js_1 = require("./macOsKeychainHelpers.js");
var KEYCHAIN_PREFETCH_TIMEOUT_MS = 10000;
// Shared with auth.ts getApiKeyFromConfigOrMacOSKeychain() so it can skip its
// sync spawn when the prefetch already landed. Distinguishing "not started" (null)
// from "completed with no key" ({ stdout: null }) lets the sync reader only
// trust a completed prefetch.
var legacyApiKeyPrefetch = null;
var prefetchPromise = null;
function spawnSecurity(serviceName) {
    return new Promise(function (resolve) {
        (0, child_process_1.execFile)('security', ['find-generic-password', '-a', (0, macOsKeychainHelpers_js_1.getUsername)(), '-w', '-s', serviceName], { encoding: 'utf-8', timeout: KEYCHAIN_PREFETCH_TIMEOUT_MS }, function (err, stdout) {
            // Exit 44 (entry not found) is a valid "no key" result and safe to
            // prime as null. But timeout (err.killed) means the keychain MAY have
            // a key we couldn't fetch — don't prime, let sync spawn retry.
            // biome-ignore lint/nursery/noFloatingPromises: resolve() is not a floating promise
            resolve({
                stdout: err ? null : (stdout === null || stdout === void 0 ? void 0 : stdout.trim()) || null,
                timedOut: Boolean(err && 'killed' in err && err.killed),
            });
        });
    });
}
/**
 * Fire both keychain reads in parallel. Called at main.tsx top-level
 * immediately after startMdmRawRead(). Non-darwin is a no-op.
 */
function startKeychainPrefetch() {
    if (process.platform !== 'darwin' || prefetchPromise || (0, envUtils_js_1.isBareMode)())
        return;
    // Fire both subprocesses immediately (non-blocking). They run in parallel
    // with each other AND with main.tsx imports. The await in Promise.all
    // happens later via ensureKeychainPrefetchCompleted().
    var oauthSpawn = spawnSecurity((0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)(macOsKeychainHelpers_js_1.CREDENTIALS_SERVICE_SUFFIX));
    var legacySpawn = spawnSecurity((0, macOsKeychainHelpers_js_1.getMacOsKeychainStorageServiceName)());
    prefetchPromise = Promise.all([oauthSpawn, legacySpawn]).then(function (_a) {
        var oauth = _a[0], legacy = _a[1];
        // Timed-out prefetch: don't prime. Sync read/spawn will retry with its
        // own (longer) timeout. Priming null here would shadow a key that the
        // sync path might successfully fetch.
        if (!oauth.timedOut)
            (0, macOsKeychainHelpers_js_1.primeKeychainCacheFromPrefetch)(oauth.stdout);
        if (!legacy.timedOut)
            legacyApiKeyPrefetch = { stdout: legacy.stdout };
    });
}
/**
 * Await prefetch completion. Called in main.tsx preAction alongside
 * ensureMdmSettingsLoaded() — nearly free since subprocesses finish during
 * the ~65ms of main.tsx imports. Resolves immediately on non-darwin.
 */
function ensureKeychainPrefetchCompleted() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!prefetchPromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, prefetchPromise];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Consumed by getApiKeyFromConfigOrMacOSKeychain() in auth.ts before it
 * falls through to sync execSync. Returns null if prefetch hasn't completed.
 */
function getLegacyApiKeyPrefetchResult() {
    return legacyApiKeyPrefetch;
}
/**
 * Clear prefetch result. Called alongside getApiKeyFromConfigOrMacOSKeychain
 * cache invalidation so a stale prefetch doesn't shadow a fresh write.
 */
function clearLegacyApiKeyPrefetch() {
    legacyApiKeyPrefetch = null;
}
