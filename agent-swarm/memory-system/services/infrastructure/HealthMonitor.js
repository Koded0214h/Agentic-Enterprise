"use strict";
/**
 * HealthMonitor - Port monitoring, health checks, and version checking
 *
 * Extracted from worker-service.ts monolith to provide centralized health monitoring.
 * Handles:
 * - Port availability checking
 * - Worker health/readiness polling
 * - Version mismatch detection (critical for plugin updates)
 * - HTTP-based shutdown requests
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
exports.isPortInUse = isPortInUse;
exports.waitForHealth = waitForHealth;
exports.waitForReadiness = waitForReadiness;
exports.waitForPortFree = waitForPortFree;
exports.httpShutdown = httpShutdown;
exports.getInstalledPluginVersion = getInstalledPluginVersion;
exports.getRunningWorkerVersion = getRunningWorkerVersion;
exports.checkVersionMatch = checkVersionMatch;
var path_1 = require("path");
var fs_1 = require("fs");
var logger_js_1 = require("../../utils/logger.js");
var paths_js_1 = require("../../shared/paths.js");
/**
 * Make an HTTP request to the worker via TCP.
 * Returns { ok, statusCode, body } or throws on transport error.
 */
function httpRequestToWorker(port_1, endpointPath_1) {
    return __awaiter(this, arguments, void 0, function (port, endpointPath, method) {
        var response, body, _a;
        if (method === void 0) { method = 'GET'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("http://127.0.0.1:".concat(port).concat(endpointPath), { method: method })];
                case 1:
                    response = _b.sent();
                    body = '';
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, response.text()];
                case 3:
                    body = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, { ok: response.ok, statusCode: response.status, body: body }];
            }
        });
    });
}
/**
 * Check if a port is in use by querying the health endpoint
 */
function isPortInUse(port) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("http://127.0.0.1:".concat(port, "/api/health"))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.ok];
                case 2:
                    error_1 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Health check polls every 500ms, logging would flood
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Poll a worker endpoint until it returns 200 OK or timeout.
 * Shared implementation for liveness and readiness checks.
 */
function pollEndpointUntilOk(port, endpointPath, timeoutMs, retryLogMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var start, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - start < timeoutMs)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, httpRequestToWorker(port, endpointPath)];
                case 3:
                    result = _a.sent();
                    if (result.ok)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Retry loop - expected failures during startup, will retry
                    logger_js_1.logger.debug('SYSTEM', retryLogMessage, {}, error_2);
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Wait for the worker HTTP server to become responsive (liveness check).
 * Uses /api/health which returns 200 as soon as the HTTP server is listening.
 * For full initialization (DB + search), use waitForReadiness() instead.
 */
function waitForHealth(port, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 30000; }
    return pollEndpointUntilOk(port, '/api/health', timeoutMs, 'Service not ready yet, will retry');
}
/**
 * Wait for the worker to be fully initialized (DB + search ready).
 * Uses /api/readiness which returns 200 only after core initialization completes.
 * Now that initializationCompleteFlag is set after DB/search init (not MCP),
 * this typically completes in a few seconds.
 */
function waitForReadiness(port, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = 30000; }
    return pollEndpointUntilOk(port, '/api/readiness', timeoutMs, 'Worker not ready yet, will retry');
}
/**
 * Wait for a port to become free (no longer responding to health checks)
 * Used after shutdown to confirm the port is available for restart
 */
function waitForPortFree(port_1) {
    return __awaiter(this, arguments, void 0, function (port, timeoutMs) {
        var start;
        if (timeoutMs === void 0) { timeoutMs = 10000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - start < timeoutMs)) return [3 /*break*/, 4];
                    return [4 /*yield*/, isPortInUse(port)];
                case 2:
                    if (!(_a.sent()))
                        return [2 /*return*/, true];
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Send HTTP shutdown request to a running worker
 * @returns true if shutdown request was acknowledged, false otherwise
 */
function httpShutdown(port) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpRequestToWorker(port, '/api/admin/shutdown', 'POST')];
                case 1:
                    result = _b.sent();
                    if (!result.ok) {
                        logger_js_1.logger.warn('SYSTEM', 'Shutdown request returned error', { status: result.statusCode });
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                case 2:
                    error_3 = _b.sent();
                    // Connection refused is expected if worker already stopped
                    if (error_3 instanceof Error && ((_a = error_3.message) === null || _a === void 0 ? void 0 : _a.includes('ECONNREFUSED'))) {
                        logger_js_1.logger.debug('SYSTEM', 'Worker already stopped', {}, error_3);
                        return [2 /*return*/, false];
                    }
                    // Unexpected error - log full details
                    logger_js_1.logger.error('SYSTEM', 'Shutdown request failed unexpectedly', {}, error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the plugin version from the installed marketplace package.json
 * This is the "expected" version that should be running.
 * Returns 'unknown' on ENOENT/EBUSY (shutdown race condition, fix #1042).
 */
function getInstalledPluginVersion() {
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
 * Get the running worker's version via API
 * This is the "actual" version currently running.
 */
function getRunningWorkerVersion(port) {
    return __awaiter(this, void 0, void 0, function () {
        var result, data, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, httpRequestToWorker(port, '/api/version')];
                case 1:
                    result = _b.sent();
                    if (!result.ok)
                        return [2 /*return*/, null];
                    data = JSON.parse(result.body);
                    return [2 /*return*/, data.version];
                case 2:
                    _a = _b.sent();
                    // Expected: worker not running or version endpoint unavailable
                    logger_js_1.logger.debug('SYSTEM', 'Could not fetch worker version', {});
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if worker version matches plugin version
 * Critical for detecting when plugin is updated but worker is still running old code
 * Returns true if versions match or if we can't determine (assume match for graceful degradation)
 */
function checkVersionMatch(port) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginVersion, workerVersion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pluginVersion = getInstalledPluginVersion();
                    return [4 /*yield*/, getRunningWorkerVersion(port)];
                case 1:
                    workerVersion = _a.sent();
                    // If either version is unknown/null, assume match (graceful degradation, fix #1042)
                    if (!workerVersion || pluginVersion === 'unknown') {
                        return [2 /*return*/, { matches: true, pluginVersion: pluginVersion, workerVersion: workerVersion }];
                    }
                    return [2 /*return*/, { matches: pluginVersion === workerVersion, pluginVersion: pluginVersion, workerVersion: workerVersion }];
            }
        });
    });
}
