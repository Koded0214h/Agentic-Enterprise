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
exports.fetchWithTimeout = fetchWithTimeout;
exports.getWorkerPort = getWorkerPort;
exports.getWorkerHost = getWorkerHost;
exports.clearPortCache = clearPortCache;
exports.buildWorkerUrl = buildWorkerUrl;
exports.workerHttpRequest = workerHttpRequest;
exports.ensureWorkerRunning = ensureWorkerRunning;
var path_1 = require("path");
var fs_1 = require("fs");
var logger_js_1 = require("../utils/logger.js");
var hook_constants_js_1 = require("./hook-constants.js");
var SettingsDefaultsManager_js_1 = require("./SettingsDefaultsManager.js");
var paths_js_1 = require("./paths.js");
// Named constants for health checks
// Allow env var override for users on slow systems (e.g., CLAUDE_MEM_HEALTH_TIMEOUT_MS=10000)
var HEALTH_CHECK_TIMEOUT_MS = (function () {
    var envVal = process.env.CLAUDE_MEM_HEALTH_TIMEOUT_MS;
    if (envVal) {
        var parsed = parseInt(envVal, 10);
        if (Number.isFinite(parsed) && parsed >= 500 && parsed <= 300000) {
            return parsed;
        }
        // Invalid env var — log once and use default
        logger_js_1.logger.warn('SYSTEM', 'Invalid CLAUDE_MEM_HEALTH_TIMEOUT_MS, using default', {
            value: envVal, min: 500, max: 300000
        });
    }
    return (0, hook_constants_js_1.getTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.HEALTH_CHECK);
})();
/**
 * Fetch with a timeout using Promise.race instead of AbortSignal.
 * AbortSignal.timeout() causes a libuv assertion crash in Bun on Windows,
 * so we use a racing setTimeout pattern that avoids signal cleanup entirely.
 * The orphaned fetch is harmless since the process exits shortly after.
 */
function fetchWithTimeout(url, init, timeoutMs) {
    if (init === void 0) { init = {}; }
    return new Promise(function (resolve, reject) {
        var timeoutId = setTimeout(function () { return reject(new Error("Request timed out after ".concat(timeoutMs, "ms"))); }, timeoutMs);
        fetch(url, init).then(function (response) { clearTimeout(timeoutId); resolve(response); }, function (err) { clearTimeout(timeoutId); reject(err); });
    });
}
// Cache to avoid repeated settings file reads
var cachedPort = null;
var cachedHost = null;
/**
 * Get the worker port number from settings
 * Uses CLAUDE_MEM_WORKER_PORT from settings file or default (37777)
 * Caches the port value to avoid repeated file reads
 */
function getWorkerPort() {
    if (cachedPort !== null) {
        return cachedPort;
    }
    var settingsPath = path_1.default.join(SettingsDefaultsManager_js_1.SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'), 'settings.json');
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    cachedPort = parseInt(settings.CLAUDE_MEM_WORKER_PORT, 10);
    return cachedPort;
}
/**
 * Get the worker host address
 * Uses CLAUDE_MEM_WORKER_HOST from settings file or default (127.0.0.1)
 * Caches the host value to avoid repeated file reads
 */
function getWorkerHost() {
    if (cachedHost !== null) {
        return cachedHost;
    }
    var settingsPath = path_1.default.join(SettingsDefaultsManager_js_1.SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'), 'settings.json');
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    cachedHost = settings.CLAUDE_MEM_WORKER_HOST;
    return cachedHost;
}
/**
 * Clear the cached port and host values.
 * Call this when settings are updated to force re-reading from file.
 */
function clearPortCache() {
    cachedPort = null;
    cachedHost = null;
}
/**
 * Build a full URL for a given API path.
 */
function buildWorkerUrl(apiPath) {
    return "http://".concat(getWorkerHost(), ":").concat(getWorkerPort()).concat(apiPath);
}
/**
 * Make an HTTP request to the worker over TCP.
 *
 * This is the preferred way for hooks to communicate with the worker.
 */
function workerHttpRequest(apiPath, options) {
    var _a, _b;
    if (options === void 0) { options = {}; }
    var method = (_a = options.method) !== null && _a !== void 0 ? _a : 'GET';
    var timeoutMs = (_b = options.timeoutMs) !== null && _b !== void 0 ? _b : HEALTH_CHECK_TIMEOUT_MS;
    var url = buildWorkerUrl(apiPath);
    var init = { method: method };
    if (options.headers) {
        init.headers = options.headers;
    }
    if (options.body) {
        init.body = options.body;
    }
    if (timeoutMs > 0) {
        return fetchWithTimeout(url, init, timeoutMs);
    }
    return fetch(url, init);
}
/**
 * Check if worker HTTP server is responsive.
 * Uses /api/health (liveness) instead of /api/readiness because:
 * - Hooks have 15-second timeout, but full initialization can take 5+ minutes (MCP connection)
 * - /api/health returns 200 as soon as HTTP server is up (sufficient for hook communication)
 * - /api/readiness returns 503 until full initialization completes (too slow for hooks)
 * See: https://github.com/thedotmack/claude-mem/issues/811
 */
function isWorkerHealthy() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, workerHttpRequest('/api/health', { timeoutMs: HEALTH_CHECK_TIMEOUT_MS })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.ok];
            }
        });
    });
}
/**
 * Get the current plugin version from package.json.
 * Returns 'unknown' on ENOENT/EBUSY (shutdown race condition, fix #1042).
 */
function getPluginVersion() {
    try {
        var packageJsonPath = path_1.default.join(paths_js_1.MARKETPLACE_ROOT, 'package.json');
        var packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf-8'));
        return packageJson.version;
    }
    catch (error) {
        var code = error.code;
        if (code === 'ENOENT' || code === 'EBUSY') {
            logger_js_1.logger.debug('SYSTEM', 'Could not read plugin version (shutdown race)', { code: code });
            return 'unknown';
        }
        throw error;
    }
}
/**
 * Get the running worker's version from the API
 */
function getWorkerVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, workerHttpRequest('/api/version', { timeoutMs: HEALTH_CHECK_TIMEOUT_MS })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to get worker version: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data.version];
            }
        });
    });
}
/**
 * Check if worker version matches plugin version
 * Note: Auto-restart on version mismatch is now handled in worker-service.ts start command (issue #484)
 * This function logs for informational purposes only.
 * Skips comparison when either version is 'unknown' (fix #1042 — avoids restart loops).
 */
function checkWorkerVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var pluginVersion, workerVersion, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    pluginVersion = getPluginVersion();
                    // Skip version check if plugin version couldn't be read (shutdown race)
                    if (pluginVersion === 'unknown')
                        return [2 /*return*/];
                    return [4 /*yield*/, getWorkerVersion()];
                case 1:
                    workerVersion = _a.sent();
                    // Skip version check if worker version is 'unknown' (avoids restart loops)
                    if (workerVersion === 'unknown')
                        return [2 /*return*/];
                    if (pluginVersion !== workerVersion) {
                        // Just log debug info - auto-restart handles the mismatch in worker-service.ts
                        logger_js_1.logger.debug('SYSTEM', 'Version check', {
                            pluginVersion: pluginVersion,
                            workerVersion: workerVersion,
                            note: 'Mismatch will be auto-restarted by worker-service start command'
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    // Version check is informational — don't fail the hook
                    logger_js_1.logger.debug('SYSTEM', 'Version check failed', {
                        error: error_1 instanceof Error ? error_1.message : String(error_1)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Ensure worker service is running
 * Quick health check - returns false if worker not healthy (doesn't block)
 * Port might be in use by another process, or worker might not be started yet
 */
function ensureWorkerRunning() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, isWorkerHealthy()];
                case 1:
                    if (!_a.sent()) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkWorkerVersion()];
                case 2:
                    _a.sent(); // logs warning on mismatch, doesn't restart
                    return [2 /*return*/, true]; // Worker healthy
                case 3: return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    // Not healthy - log for debugging
                    logger_js_1.logger.debug('SYSTEM', 'Worker health check failed', {
                        error: e_1 instanceof Error ? e_1.message : String(e_1)
                    });
                    return [3 /*break*/, 5];
                case 5:
                    // Port might be in use by something else, or worker not started
                    // Return false but don't throw - let caller decide how to handle
                    logger_js_1.logger.warn('SYSTEM', 'Worker not healthy, hook will proceed gracefully');
                    return [2 /*return*/, false];
            }
        });
    });
}
