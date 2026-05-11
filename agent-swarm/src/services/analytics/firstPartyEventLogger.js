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
exports.getEventSamplingConfig = getEventSamplingConfig;
exports.shouldSampleEvent = shouldSampleEvent;
exports.shutdown1PEventLogging = shutdown1PEventLogging;
exports.is1PEventLoggingEnabled = is1PEventLoggingEnabled;
exports.logEventTo1P = logEventTo1P;
exports.logGrowthBookExperimentTo1P = logGrowthBookExperimentTo1P;
exports.initialize1PEventLogging = initialize1PEventLogging;
exports.reinitialize1PEventLoggingIfConfigChanged = reinitialize1PEventLoggingIfConfigChanged;
var resources_1 = require("@opentelemetry/resources");
var sdk_logs_1 = require("@opentelemetry/sdk-logs");
var semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
var crypto_1 = require("crypto");
var lodash_es_1 = require("lodash-es");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var log_js_1 = require("../../utils/log.js");
var platform_js_1 = require("../../utils/platform.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var startupProfiler_js_1 = require("../../utils/startupProfiler.js");
var user_js_1 = require("../../utils/user.js");
var config_js_2 = require("./config.js");
var firstPartyEventLoggingExporter_js_1 = require("./firstPartyEventLoggingExporter.js");
var growthbook_js_1 = require("./growthbook.js");
var metadata_js_1 = require("./metadata.js");
var sinkKillswitch_js_1 = require("./sinkKillswitch.js");
var EVENT_SAMPLING_CONFIG_NAME = 'tengu_event_sampling_config';
/**
 * Get the event sampling configuration from GrowthBook.
 * Uses cached value if available, updates cache in background.
 */
function getEventSamplingConfig() {
    return (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)(EVENT_SAMPLING_CONFIG_NAME, {});
}
/**
 * Determine if an event should be sampled based on its sample rate.
 * Returns the sample rate if sampled, null if not sampled.
 *
 * @param eventName - Name of the event to check
 * @returns The sample_rate if event should be logged, null if it should be dropped
 */
function shouldSampleEvent(eventName) {
    var config = getEventSamplingConfig();
    var eventConfig = config[eventName];
    // If no config for this event, log at 100% rate (no sampling)
    if (!eventConfig) {
        return null;
    }
    var sampleRate = eventConfig.sample_rate;
    // Validate sample rate is in valid range
    if (typeof sampleRate !== 'number' || sampleRate < 0 || sampleRate > 1) {
        return null;
    }
    // Sample rate of 1 means log everything (no need to add metadata)
    if (sampleRate >= 1) {
        return null;
    }
    // Sample rate of 0 means drop everything
    if (sampleRate <= 0) {
        return 0;
    }
    // Randomly decide whether to sample this event
    return Math.random() < sampleRate ? sampleRate : 0;
}
var BATCH_CONFIG_NAME = 'tengu_1p_event_batch_config';
function getBatchConfig() {
    return (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)(BATCH_CONFIG_NAME, {});
}
// Module-local state for event logging (not exposed globally)
var firstPartyEventLogger = null;
var firstPartyEventLoggerProvider = null;
// Last batch config used to construct the provider — used by
// reinitialize1PEventLoggingIfConfigChanged to decide whether a rebuild is
// needed when GrowthBook refreshes.
var lastBatchConfig = null;
/**
 * Flush and shutdown the 1P event logger.
 * This should be called as the final step before process exit to ensure
 * all events (including late ones from API responses) are exported.
 */
function shutdown1PEventLogging() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!firstPartyEventLoggerProvider) {
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, firstPartyEventLoggerProvider.shutdown()];
                case 2:
                    _b.sent();
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)('1P event logging: final shutdown complete');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if 1P event logging is enabled.
 * Respects the same opt-outs as other analytics sinks:
 * - Test environment
 * - Third-party cloud providers (Bedrock/Vertex)
 * - Global telemetry opt-outs
 * - Non-essential traffic disabled
 *
 * Note: Unlike BigQuery metrics, event logging does NOT check organization-level
 * metrics opt-out via API. It follows the same pattern as Statsig event logging.
 */
function is1PEventLoggingEnabled() {
    // Respect standard analytics opt-outs
    return !(0, config_js_2.isAnalyticsDisabled)();
}
/**
 * Log a 1st-party event for internal analytics (async version).
 * Events are batched and exported to /api/event_logging/batch
 *
 * This enriches the event with core metadata (model, session, env context, etc.)
 * at log time, similar to logEventToStatsig.
 *
 * @param eventName - Name of the event (e.g., 'tengu_api_query')
 * @param metadata - Additional metadata for the event (intentionally no strings, to avoid accidentally logging code/filepaths)
 */
function logEventTo1PAsync(firstPartyEventLogger_1, eventName_1) {
    return __awaiter(this, arguments, void 0, function (firstPartyEventLogger, eventName, metadata) {
        var coreMetadata, attributes, userId, e_1;
        if (metadata === void 0) { metadata = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, metadata_js_1.getEventMetadata)({
                            model: metadata.model,
                            betas: metadata.betas,
                        })
                        // Build attributes - OTel supports nested objects natively via AnyValueMap
                        // Cast through unknown since our nested objects are structurally compatible
                        // with AnyValue but TS doesn't recognize it due to missing index signatures
                    ];
                case 1:
                    coreMetadata = _a.sent();
                    attributes = {
                        event_name: eventName,
                        event_id: (0, crypto_1.randomUUID)(),
                        // Pass objects directly - no JSON serialization needed
                        core_metadata: coreMetadata,
                        user_metadata: (0, user_js_1.getCoreUserData)(true),
                        event_metadata: metadata,
                    };
                    userId = (0, config_js_1.getOrCreateUserID)();
                    if (userId) {
                        attributes.user_id = userId;
                    }
                    // Debug logging when debug mode is enabled
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("[ANT-ONLY] 1P event: ".concat(eventName, " ").concat((0, slowOperations_js_1.jsonStringify)(metadata, null, 0)));
                    }
                    // Emit log record
                    firstPartyEventLogger.emit({
                        body: eventName,
                        attributes: attributes,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    if (process.env.NODE_ENV === 'development') {
                        throw e_1;
                    }
                    if (process.env.USER_TYPE === 'ant') {
                        (0, log_js_1.logError)(e_1);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Log a 1st-party event for internal analytics.
 * Events are batched and exported to /api/event_logging/batch
 *
 * @param eventName - Name of the event (e.g., 'tengu_api_query')
 * @param metadata - Additional metadata for the event (intentionally no strings, to avoid accidentally logging code/filepaths)
 */
function logEventTo1P(eventName, metadata) {
    if (metadata === void 0) { metadata = {}; }
    if (!is1PEventLoggingEnabled()) {
        return;
    }
    if (!firstPartyEventLogger || (0, sinkKillswitch_js_1.isSinkKilled)('firstParty')) {
        return;
    }
    // Fire and forget - don't block on metadata enrichment
    void logEventTo1PAsync(firstPartyEventLogger, eventName, metadata);
}
// api.anthropic.com only serves the "production" GrowthBook environment
// (see starling/starling/cli/cli.py DEFAULT_ENVIRONMENTS). Staging and
// development environments are not exported to the prod API.
function getEnvironmentForGrowthBook() {
    return 'production';
}
/**
 * Log a GrowthBook experiment assignment event to 1P.
 * Events are batched and exported to /api/event_logging/batch
 *
 * @param data - GrowthBook experiment assignment data
 */
function logGrowthBookExperimentTo1P(data) {
    if (!is1PEventLoggingEnabled()) {
        return;
    }
    if (!firstPartyEventLogger || (0, sinkKillswitch_js_1.isSinkKilled)('firstParty')) {
        return;
    }
    var userId = (0, config_js_1.getOrCreateUserID)();
    var _a = (0, user_js_1.getCoreUserData)(true), accountUuid = _a.accountUuid, organizationUuid = _a.organizationUuid;
    // Build attributes for GrowthbookExperimentEvent
    var attributes = __assign(__assign(__assign(__assign(__assign(__assign({ event_type: 'GrowthbookExperimentEvent', event_id: (0, crypto_1.randomUUID)(), experiment_id: data.experimentId, variation_id: data.variationId }, (userId && { device_id: userId })), (accountUuid && { account_uuid: accountUuid })), (organizationUuid && { organization_uuid: organizationUuid })), (data.userAttributes && {
        session_id: data.userAttributes.sessionId,
        user_attributes: (0, slowOperations_js_1.jsonStringify)(data.userAttributes),
    })), (data.experimentMetadata && {
        experiment_metadata: (0, slowOperations_js_1.jsonStringify)(data.experimentMetadata),
    })), { environment: getEnvironmentForGrowthBook() });
    if (process.env.USER_TYPE === 'ant') {
        (0, debug_js_1.logForDebugging)("[ANT-ONLY] 1P GrowthBook experiment: ".concat(data.experimentId, " variation=").concat(data.variationId));
    }
    firstPartyEventLogger.emit({
        body: 'growthbook_experiment',
        attributes: attributes,
    });
}
var DEFAULT_LOGS_EXPORT_INTERVAL_MS = 10000;
var DEFAULT_MAX_EXPORT_BATCH_SIZE = 200;
var DEFAULT_MAX_QUEUE_SIZE = 8192;
/**
 * Initialize 1P event logging infrastructure.
 * This creates a separate LoggerProvider for internal event logging,
 * independent of customer OTLP telemetry.
 *
 * This uses its own minimal resource configuration with just the attributes
 * we need for internal analytics (service name, version, platform info).
 */
function initialize1PEventLogging() {
    var _a;
    (0, startupProfiler_js_1.profileCheckpoint)('1p_event_logging_start');
    var enabled = is1PEventLoggingEnabled();
    if (!enabled) {
        if (process.env.USER_TYPE === 'ant') {
            (0, debug_js_1.logForDebugging)('1P event logging not enabled');
        }
        return;
    }
    // Fetch batch processor configuration from GrowthBook dynamic config
    // Uses cached value if available, refreshes in background
    var batchConfig = getBatchConfig();
    lastBatchConfig = batchConfig;
    (0, startupProfiler_js_1.profileCheckpoint)('1p_event_after_growthbook_config');
    var scheduledDelayMillis = batchConfig.scheduledDelayMillis ||
        parseInt(process.env.OTEL_LOGS_EXPORT_INTERVAL ||
            DEFAULT_LOGS_EXPORT_INTERVAL_MS.toString());
    var maxExportBatchSize = batchConfig.maxExportBatchSize || DEFAULT_MAX_EXPORT_BATCH_SIZE;
    var maxQueueSize = batchConfig.maxQueueSize || DEFAULT_MAX_QUEUE_SIZE;
    // Build our own resource for 1P event logging with minimal attributes
    var platform = (0, platform_js_1.getPlatform)();
    var attributes = (_a = {},
        _a[semantic_conventions_1.SEMRESATTRS_SERVICE_NAME] = 'claude-code',
        _a[semantic_conventions_1.SEMRESATTRS_SERVICE_VERSION] = MACRO.VERSION,
        _a);
    // Add WSL-specific attributes if running on WSL
    if (platform === 'wsl') {
        var wslVersion = (0, platform_js_1.getWslVersion)();
        if (wslVersion) {
            attributes['wsl.version'] = wslVersion;
        }
    }
    var resource = new resources_1.Resource(attributes);
    // Create a new LoggerProvider with the EventLoggingExporter
    // NOTE: This is kept separate from customer telemetry logs to ensure
    // internal events don't leak to customer endpoints and vice versa.
    // We don't register this globally - it's only used for internal event logging.
    var eventLoggingExporter = new firstPartyEventLoggingExporter_js_1.FirstPartyEventLoggingExporter({
        maxBatchSize: maxExportBatchSize,
        skipAuth: batchConfig.skipAuth,
        maxAttempts: batchConfig.maxAttempts,
        path: batchConfig.path,
        baseUrl: batchConfig.baseUrl,
        isKilled: function () { return (0, sinkKillswitch_js_1.isSinkKilled)('firstParty'); },
    });
    firstPartyEventLoggerProvider = new sdk_logs_1.LoggerProvider({
        resource: resource,
        processors: [
            new sdk_logs_1.BatchLogRecordProcessor(eventLoggingExporter, {
                scheduledDelayMillis: scheduledDelayMillis,
                maxExportBatchSize: maxExportBatchSize,
                maxQueueSize: maxQueueSize,
            }),
        ],
    });
    // Initialize event logger from our internal provider (NOT from global API)
    // IMPORTANT: We must get the logger from our local provider, not logs.getLogger()
    // because logs.getLogger() returns a logger from the global provider, which is
    // separate and used for customer telemetry.
    firstPartyEventLogger = firstPartyEventLoggerProvider.getLogger('com.anthropic.claude_code.events', MACRO.VERSION);
}
/**
 * Rebuild the 1P event logging pipeline if the batch config changed.
 * Register this with onGrowthBookRefresh so long-running sessions pick up
 * changes to batch size, delay, endpoint, etc.
 *
 * Event-loss safety:
 * 1. Null the logger first — concurrent logEventTo1P() calls hit the
 *    !firstPartyEventLogger guard and bail during the swap window. This drops
 *    a handful of events but prevents emitting to a draining provider.
 * 2. forceFlush() drains the old BatchLogRecordProcessor buffer to the
 *    exporter. Export failures go to disk at getCurrentBatchFilePath() which
 *    is keyed by module-level BATCH_UUID + sessionId — unchanged across
 *    reinit — so the NEW exporter's disk-backed retry picks them up.
 * 3. Swap to new provider/logger; old provider shutdown runs in background
 *    (buffer already drained, just cleanup).
 */
function reinitialize1PEventLoggingIfConfigChanged() {
    return __awaiter(this, void 0, void 0, function () {
        var newConfig, oldProvider, oldLogger, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!is1PEventLoggingEnabled() || !firstPartyEventLoggerProvider) {
                        return [2 /*return*/];
                    }
                    newConfig = getBatchConfig();
                    if ((0, lodash_es_1.isEqual)(newConfig, lastBatchConfig)) {
                        return [2 /*return*/];
                    }
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("1P event logging: ".concat(BATCH_CONFIG_NAME, " changed, reinitializing"));
                    }
                    oldProvider = firstPartyEventLoggerProvider;
                    oldLogger = firstPartyEventLogger;
                    firstPartyEventLogger = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, oldProvider.forceFlush()];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    firstPartyEventLoggerProvider = null;
                    try {
                        initialize1PEventLogging();
                    }
                    catch (e) {
                        // Restore so the next GrowthBook refresh can retry. oldProvider was
                        // only forceFlush()'d, not shut down — it's still functional. Without
                        // this, both stay null and the !firstPartyEventLoggerProvider gate at
                        // the top makes recovery impossible.
                        firstPartyEventLoggerProvider = oldProvider;
                        firstPartyEventLogger = oldLogger;
                        (0, log_js_1.logError)(e);
                        return [2 /*return*/];
                    }
                    void oldProvider.shutdown().catch(function () { });
                    return [2 /*return*/];
            }
        });
    });
}
