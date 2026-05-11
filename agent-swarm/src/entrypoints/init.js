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
exports.init = void 0;
exports.initializeTelemetryAfterTrust = initializeTelemetryAfterTrust;
var startupProfiler_js_1 = require("../utils/startupProfiler.js");
require("../bootstrap/state.js");
require("../utils/config.js");
var memoize_js_1 = require("lodash-es/memoize.js");
var state_js_1 = require("src/bootstrap/state.js");
var state_js_2 = require("../bootstrap/state.js");
var manager_js_1 = require("../services/lsp/manager.js");
var client_js_1 = require("../services/oauth/client.js");
var index_js_1 = require("../services/policyLimits/index.js");
var index_js_2 = require("../services/remoteManagedSettings/index.js");
var apiPreconnect_js_1 = require("../utils/apiPreconnect.js");
var caCertsConfig_js_1 = require("../utils/caCertsConfig.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var config_js_1 = require("../utils/config.js");
var debug_js_1 = require("../utils/debug.js");
var detectRepository_js_1 = require("../utils/detectRepository.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var envDynamic_js_1 = require("../utils/envDynamic.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
// showInvalidConfigDialog is dynamically imported in the error path to avoid loading React at init
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
var managedEnv_js_1 = require("../utils/managedEnv.js");
var mtls_js_1 = require("../utils/mtls.js");
var filesystem_js_1 = require("../utils/permissions/filesystem.js");
// initializeTelemetry is loaded lazily via import() in setMeterState() to defer
// ~400KB of OpenTelemetry + protobuf modules until telemetry is actually initialized.
// gRPC exporters (~700KB via @grpc/grpc-js) are further lazy-loaded within instrumentation.ts.
var proxy_js_1 = require("../utils/proxy.js");
var betaSessionTracing_js_1 = require("../utils/telemetry/betaSessionTracing.js");
var telemetryAttributes_js_1 = require("../utils/telemetryAttributes.js");
var windowsPaths_js_1 = require("../utils/windowsPaths.js");
// initialize1PEventLogging is dynamically imported to defer OpenTelemetry sdk-logs/resources
// Track if telemetry has been initialized to prevent double initialization
var telemetryInitialized = false;
exports.init = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var initStartTime, configsStart, envVarsStart, mtlsStart, proxyStart, _a, initUpstreamProxy, getUpstreamProxyEnv, registerUpstreamProxyEnvFn, err_1, scratchpadStart, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                initStartTime = Date.now();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_started');
                (0, startupProfiler_js_1.profileCheckpoint)('init_function_start');
                _b.label = 1;
            case 1:
                _b.trys.push([1, 10, , 11]);
                configsStart = Date.now();
                (0, config_js_1.enableConfigs)();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_configs_enabled', {
                    duration_ms: Date.now() - configsStart,
                });
                (0, startupProfiler_js_1.profileCheckpoint)('init_configs_enabled');
                envVarsStart = Date.now();
                (0, managedEnv_js_1.applySafeConfigEnvironmentVariables)();
                // Apply NODE_EXTRA_CA_CERTS from settings.json to process.env early,
                // before any TLS connections. Bun caches the TLS cert store at boot
                // via BoringSSL, so this must happen before the first TLS handshake.
                (0, caCertsConfig_js_1.applyExtraCACertsFromConfig)();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_safe_env_vars_applied', {
                    duration_ms: Date.now() - envVarsStart,
                });
                (0, startupProfiler_js_1.profileCheckpoint)('init_safe_env_vars_applied');
                // Make sure things get flushed on exit
                (0, gracefulShutdown_js_1.setupGracefulShutdown)();
                (0, startupProfiler_js_1.profileCheckpoint)('init_after_graceful_shutdown');
                // Initialize 1P event logging (no security concerns, but deferred to avoid
                // loading OpenTelemetry sdk-logs at startup). growthbook.js is already in
                // the module cache by this point (firstPartyEventLogger imports it), so the
                // second dynamic import adds no load cost.
                void Promise.all([
                    Promise.resolve().then(function () { return require('../services/analytics/firstPartyEventLogger.js'); }),
                    Promise.resolve().then(function () { return require('../services/analytics/growthbook.js'); }),
                ]).then(function (_a) {
                    var fp = _a[0], gb = _a[1];
                    fp.initialize1PEventLogging();
                    // Rebuild the logger provider if tengu_1p_event_batch_config changes
                    // mid-session. Change detection (isEqual) is inside the handler so
                    // unchanged refreshes are no-ops.
                    gb.onGrowthBookRefresh(function () {
                        void fp.reinitialize1PEventLoggingIfConfigChanged();
                    });
                });
                (0, startupProfiler_js_1.profileCheckpoint)('init_after_1p_event_logging');
                // Populate OAuth account info if it is not already cached in config. This is needed since the
                // OAuth account info may not be populated when logging in through the VSCode extension.
                void (0, client_js_1.populateOAuthAccountInfoIfNeeded)();
                (0, startupProfiler_js_1.profileCheckpoint)('init_after_oauth_populate');
                // Initialize JetBrains IDE detection asynchronously (populates cache for later sync access)
                void (0, envDynamic_js_1.initJetBrainsDetection)();
                (0, startupProfiler_js_1.profileCheckpoint)('init_after_jetbrains_detection');
                // Detect GitHub repository asynchronously (populates cache for gitDiff PR linking)
                void (0, detectRepository_js_1.detectCurrentRepository)();
                // Initialize the loading promise early so that other systems (like plugin hooks)
                // can await remote settings loading. The promise includes a timeout to prevent
                // deadlocks if loadRemoteManagedSettings() is never called (e.g., Agent SDK tests).
                if ((0, index_js_2.isEligibleForRemoteManagedSettings)()) {
                    (0, index_js_2.initializeRemoteManagedSettingsLoadingPromise)();
                }
                if ((0, index_js_1.isPolicyLimitsEligible)()) {
                    (0, index_js_1.initializePolicyLimitsLoadingPromise)();
                }
                (0, startupProfiler_js_1.profileCheckpoint)('init_after_remote_settings_check');
                // Record the first start time
                (0, config_js_1.recordFirstStartTime)();
                mtlsStart = Date.now();
                (0, debug_js_1.logForDebugging)('[init] configureGlobalMTLS starting');
                (0, mtls_js_1.configureGlobalMTLS)();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_mtls_configured', {
                    duration_ms: Date.now() - mtlsStart,
                });
                (0, debug_js_1.logForDebugging)('[init] configureGlobalMTLS complete');
                proxyStart = Date.now();
                (0, debug_js_1.logForDebugging)('[init] configureGlobalAgents starting');
                (0, proxy_js_1.configureGlobalAgents)();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_proxy_configured', {
                    duration_ms: Date.now() - proxyStart,
                });
                (0, debug_js_1.logForDebugging)('[init] configureGlobalAgents complete');
                (0, startupProfiler_js_1.profileCheckpoint)('init_network_configured');
                // Preconnect to the Anthropic API — overlap TCP+TLS handshake
                // (~100-200ms) with the ~100ms of action-handler work before the API
                // request. After CA certs + proxy agents are configured so the warmed
                // connection uses the right transport. Fire-and-forget; skipped for
                // proxy/mTLS/unix/cloud-provider where the SDK's dispatcher wouldn't
                // reuse the global pool.
                (0, apiPreconnect_js_1.preconnectAnthropicApi)();
                if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) return [3 /*break*/, 7];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 6, , 7]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../upstreamproxy/upstreamproxy.js'); })];
            case 3:
                _a = _b.sent(), initUpstreamProxy = _a.initUpstreamProxy, getUpstreamProxyEnv = _a.getUpstreamProxyEnv;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/subprocessEnv.js'); })];
            case 4:
                registerUpstreamProxyEnvFn = (_b.sent()).registerUpstreamProxyEnvFn;
                registerUpstreamProxyEnvFn(getUpstreamProxyEnv);
                return [4 /*yield*/, initUpstreamProxy()];
            case 5:
                _b.sent();
                return [3 /*break*/, 7];
            case 6:
                err_1 = _b.sent();
                (0, debug_js_1.logForDebugging)("[init] upstreamproxy init failed: ".concat(err_1 instanceof Error ? err_1.message : String(err_1), "; continuing without proxy"), { level: 'warn' });
                return [3 /*break*/, 7];
            case 7:
                // Set up git-bash if relevant
                (0, windowsPaths_js_1.setShellIfWindows)();
                // Register LSP manager cleanup (initialization happens in main.tsx after --plugin-dir is processed)
                (0, cleanupRegistry_js_1.registerCleanup)(manager_js_1.shutdownLspServerManager);
                // gh-32730: teams created by subagents (or main agent without
                // explicit TeamDelete) were left on disk forever. Register cleanup
                // for all teams created this session. Lazy import: swarm code is
                // behind feature gate and most sessions never create teams.
                (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(void 0, void 0, void 0, function () {
                    var cleanupSessionTeams;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/swarm/teamHelpers.js'); })];
                            case 1:
                                cleanupSessionTeams = (_a.sent()).cleanupSessionTeams;
                                return [4 /*yield*/, cleanupSessionTeams()];
                            case 2:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); });
                if (!(0, filesystem_js_1.isScratchpadEnabled)()) return [3 /*break*/, 9];
                scratchpadStart = Date.now();
                return [4 /*yield*/, (0, filesystem_js_1.ensureScratchpadDir)()];
            case 8:
                _b.sent();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_scratchpad_created', {
                    duration_ms: Date.now() - scratchpadStart,
                });
                _b.label = 9;
            case 9:
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'init_completed', {
                    duration_ms: Date.now() - initStartTime,
                });
                (0, startupProfiler_js_1.profileCheckpoint)('init_function_end');
                return [3 /*break*/, 11];
            case 10:
                error_1 = _b.sent();
                if (error_1 instanceof errors_js_1.ConfigParseError) {
                    // Skip the interactive Ink dialog when we can't safely render it.
                    // The dialog breaks JSON consumers (e.g. desktop marketplace plugin
                    // manager running `plugin marketplace list --json` in a VM sandbox).
                    if ((0, state_js_1.getIsNonInteractiveSession)()) {
                        process.stderr.write("Configuration error in ".concat(error_1.filePath, ": ").concat(error_1.message, "\n"));
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)(1);
                        return [2 /*return*/];
                    }
                    // Show the invalid config dialog with the error object and wait for it to complete
                    return [2 /*return*/, Promise.resolve().then(function () { return require('../components/InvalidConfigDialog.js'); }).then(function (m) {
                            return m.showInvalidConfigDialog({ error: error_1 });
                        })
                        // Dialog itself handles process.exit, so we don't need additional cleanup here
                    ];
                    // Dialog itself handles process.exit, so we don't need additional cleanup here
                }
                else {
                    // For non-config errors, rethrow them
                    throw error_1;
                }
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 * Initialize telemetry after trust has been granted.
 * For remote-settings-eligible users, waits for settings to load (non-blocking),
 * then re-applies env vars (to include remote settings) before initializing telemetry.
 * For non-eligible users, initializes telemetry immediately.
 * This should only be called once, after the trust dialog has been accepted.
 */
function initializeTelemetryAfterTrust() {
    var _this = this;
    if ((0, index_js_2.isEligibleForRemoteManagedSettings)()) {
        // For SDK/headless mode with beta tracing, initialize eagerly first
        // to ensure the tracer is ready before the first query runs.
        // The async path below will still run but doInitializeTelemetry() guards against double init.
        if ((0, state_js_1.getIsNonInteractiveSession)() && (0, betaSessionTracing_js_1.isBetaTracingEnabled)()) {
            void doInitializeTelemetry().catch(function (error) {
                (0, debug_js_1.logForDebugging)("[3P telemetry] Eager telemetry init failed (beta tracing): ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
            });
        }
        (0, debug_js_1.logForDebugging)('[3P telemetry] Waiting for remote managed settings before telemetry init');
        void (0, index_js_2.waitForRemoteManagedSettingsToLoad)()
            .then(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)('[3P telemetry] Remote managed settings loaded, initializing telemetry');
                        // Re-apply env vars to pick up remote settings before initializing telemetry.
                        (0, managedEnv_js_1.applyConfigEnvironmentVariables)();
                        return [4 /*yield*/, doInitializeTelemetry()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })
            .catch(function (error) {
            (0, debug_js_1.logForDebugging)("[3P telemetry] Telemetry init failed (remote settings path): ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
        });
    }
    else {
        void doInitializeTelemetry().catch(function (error) {
            (0, debug_js_1.logForDebugging)("[3P telemetry] Telemetry init failed: ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
        });
    }
}
function doInitializeTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (telemetryInitialized) {
                        // Already initialized, nothing to do
                        return [2 /*return*/];
                    }
                    // Set flag before init to prevent double initialization
                    telemetryInitialized = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, setMeterState()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    // Reset flag on failure so subsequent calls can retry
                    telemetryInitialized = false;
                    throw error_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setMeterState() {
    return __awaiter(this, void 0, void 0, function () {
        var initializeTelemetry, meter, createAttributedCounter;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/telemetry/instrumentation.js'); })];
                case 1:
                    initializeTelemetry = (_b.sent()).initializeTelemetry;
                    return [4 /*yield*/, initializeTelemetry()];
                case 2:
                    meter = _b.sent();
                    if (meter) {
                        createAttributedCounter = function (name, options) {
                            var counter = meter === null || meter === void 0 ? void 0 : meter.createCounter(name, options);
                            return {
                                add: function (value, additionalAttributes) {
                                    if (additionalAttributes === void 0) { additionalAttributes = {}; }
                                    // Always fetch fresh telemetry attributes to ensure they're up to date
                                    var currentAttributes = (0, telemetryAttributes_js_1.getTelemetryAttributes)();
                                    var mergedAttributes = __assign(__assign({}, currentAttributes), additionalAttributes);
                                    counter === null || counter === void 0 ? void 0 : counter.add(value, mergedAttributes);
                                },
                            };
                        };
                        (0, state_js_2.setMeter)(meter, createAttributedCounter);
                        // Increment session counter here because the startup telemetry path
                        // runs before this async initialization completes, so the counter
                        // would be null there.
                        (_a = (0, state_js_2.getSessionCounter)()) === null || _a === void 0 ? void 0 : _a.add(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
