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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.initializeDatadog = void 0;
exports.shutdownDatadog = shutdownDatadog;
exports.trackDatadogEvent = trackDatadogEvent;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var memoize_js_1 = require("lodash-es/memoize.js");
var config_js_1 = require("../../utils/config.js");
var log_js_1 = require("../../utils/log.js");
var model_js_1 = require("../../utils/model/model.js");
var providers_js_1 = require("../../utils/model/providers.js");
var modelCost_js_1 = require("../../utils/modelCost.js");
var config_js_2 = require("./config.js");
var metadata_js_1 = require("./metadata.js");
var DATADOG_LOGS_ENDPOINT = 'https://http-intake.logs.us5.datadoghq.com/api/v2/logs';
var DATADOG_CLIENT_TOKEN = 'pubbbf48e6d78dae54bceaa4acf463299bf';
var DEFAULT_FLUSH_INTERVAL_MS = 15000;
var MAX_BATCH_SIZE = 100;
var NETWORK_TIMEOUT_MS = 5000;
var DATADOG_ALLOWED_EVENTS = new Set([
    'chrome_bridge_connection_succeeded',
    'chrome_bridge_connection_failed',
    'chrome_bridge_disconnected',
    'chrome_bridge_tool_call_completed',
    'chrome_bridge_tool_call_error',
    'chrome_bridge_tool_call_started',
    'chrome_bridge_tool_call_timeout',
    'tengu_api_error',
    'tengu_api_success',
    'tengu_brief_mode_enabled',
    'tengu_brief_mode_toggled',
    'tengu_brief_send',
    'tengu_cancel',
    'tengu_compact_failed',
    'tengu_exit',
    'tengu_flicker',
    'tengu_init',
    'tengu_model_fallback_triggered',
    'tengu_oauth_error',
    'tengu_oauth_success',
    'tengu_oauth_token_refresh_failure',
    'tengu_oauth_token_refresh_success',
    'tengu_oauth_token_refresh_lock_acquiring',
    'tengu_oauth_token_refresh_lock_acquired',
    'tengu_oauth_token_refresh_starting',
    'tengu_oauth_token_refresh_completed',
    'tengu_oauth_token_refresh_lock_releasing',
    'tengu_oauth_token_refresh_lock_released',
    'tengu_query_error',
    'tengu_session_file_read',
    'tengu_started',
    'tengu_tool_use_error',
    'tengu_tool_use_granted_in_prompt_permanent',
    'tengu_tool_use_granted_in_prompt_temporary',
    'tengu_tool_use_rejected_in_prompt',
    'tengu_tool_use_success',
    'tengu_uncaught_exception',
    'tengu_unhandled_rejection',
    'tengu_voice_recording_started',
    'tengu_voice_toggled',
    'tengu_team_mem_sync_pull',
    'tengu_team_mem_sync_push',
    'tengu_team_mem_sync_started',
    'tengu_team_mem_entries_capped',
]);
var TAG_FIELDS = [
    'arch',
    'clientType',
    'errorType',
    'http_status_range',
    'http_status',
    'kairosActive',
    'model',
    'platform',
    'provider',
    'skillMode',
    'subscriptionType',
    'toolName',
    'userBucket',
    'userType',
    'version',
    'versionBase',
];
function camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, function (letter) { return "_".concat(letter.toLowerCase()); });
}
var logBatch = [];
var flushTimer = null;
var datadogInitialized = null;
function flushLogs() {
    return __awaiter(this, void 0, void 0, function () {
        var logsToSend, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (logBatch.length === 0)
                        return [2 /*return*/];
                    logsToSend = logBatch;
                    logBatch = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post(DATADOG_LOGS_ENDPOINT, logsToSend, {
                            headers: {
                                'Content-Type': 'application/json',
                                'DD-API-KEY': DATADOG_CLIENT_TOKEN,
                            },
                            timeout: NETWORK_TIMEOUT_MS,
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function scheduleFlush() {
    if (flushTimer)
        return;
    flushTimer = setTimeout(function () {
        flushTimer = null;
        void flushLogs();
    }, getFlushIntervalMs()).unref();
}
exports.initializeDatadog = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if ((0, config_js_2.isAnalyticsDisabled)()) {
            datadogInitialized = false;
            return [2 /*return*/, false];
        }
        try {
            datadogInitialized = true;
            return [2 /*return*/, true];
        }
        catch (error) {
            (0, log_js_1.logError)(error);
            datadogInitialized = false;
            return [2 /*return*/, false];
        }
        return [2 /*return*/];
    });
}); });
/**
 * Flush remaining Datadog logs and shut down.
 * Called from gracefulShutdown() before process.exit() since
 * forceExit() prevents the beforeExit handler from firing.
 */
function shutdownDatadog() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (flushTimer) {
                        clearTimeout(flushTimer);
                        flushTimer = null;
                    }
                    return [4 /*yield*/, flushLogs()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// NOTE: use via src/services/analytics/index.ts > logEvent
function trackDatadogEvent(eventName, properties) {
    return __awaiter(this, void 0, void 0, function () {
        var initialized, metadata, envContext, restMetadata, allData, shortName, statusCode, firstDigit, allDataRecord_1, tags, log, _i, _a, _b, key, value, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (process.env.NODE_ENV !== 'production') {
                        return [2 /*return*/];
                    }
                    // Don't send events for 3P providers (Bedrock, Vertex, Foundry)
                    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
                        return [2 /*return*/];
                    }
                    initialized = datadogInitialized;
                    if (!(initialized === null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.initializeDatadog)()];
                case 1:
                    initialized = _c.sent();
                    _c.label = 2;
                case 2:
                    if (!initialized || !DATADOG_ALLOWED_EVENTS.has(eventName)) {
                        return [2 /*return*/];
                    }
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, metadata_js_1.getEventMetadata)({
                            model: properties.model,
                            betas: properties.betas,
                        })
                        // Destructure to avoid duplicate envContext (once nested, once flattened)
                    ];
                case 4:
                    metadata = _c.sent();
                    envContext = metadata.envContext, restMetadata = __rest(metadata, ["envContext"]);
                    allData = __assign(__assign(__assign(__assign({}, restMetadata), envContext), properties), { userBucket: getUserBucket() });
                    // Normalize MCP tool names to "mcp" for cardinality reduction
                    if (typeof allData.toolName === 'string' &&
                        allData.toolName.startsWith('mcp__')) {
                        allData.toolName = 'mcp';
                    }
                    // Normalize model names for cardinality reduction (external users only)
                    if (process.env.USER_TYPE !== 'ant' && typeof allData.model === 'string') {
                        shortName = (0, model_js_1.getCanonicalName)(allData.model.replace(/\[1m]$/i, ''));
                        allData.model = shortName in modelCost_js_1.MODEL_COSTS ? shortName : 'other';
                    }
                    // Truncate dev version to base + date (remove timestamp and sha for cardinality reduction)
                    // e.g. "2.0.53-dev.20251124.t173302.sha526cc6a" -> "2.0.53-dev.20251124"
                    if (typeof allData.version === 'string') {
                        allData.version = allData.version.replace(/^(\d+\.\d+\.\d+-dev\.\d{8})\.t\d+\.sha[a-f0-9]+$/, '$1');
                    }
                    // Transform status to http_status and http_status_range to avoid Datadog reserved field
                    if (allData.status !== undefined && allData.status !== null) {
                        statusCode = String(allData.status);
                        allData.http_status = statusCode;
                        firstDigit = statusCode.charAt(0);
                        if (firstDigit >= '1' && firstDigit <= '5') {
                            allData.http_status_range = "".concat(firstDigit, "xx");
                        }
                        // Remove original status field to avoid conflict with Datadog's reserved field
                        delete allData.status;
                    }
                    allDataRecord_1 = allData;
                    tags = __spreadArray([
                        "event:".concat(eventName)
                    ], TAG_FIELDS.filter(function (field) {
                        return allDataRecord_1[field] !== undefined && allDataRecord_1[field] !== null;
                    }).map(function (field) { return "".concat(camelToSnakeCase(field), ":").concat(allDataRecord_1[field]); }), true);
                    log = {
                        ddsource: 'nodejs',
                        ddtags: tags.join(','),
                        message: eventName,
                        service: 'claude-code',
                        hostname: 'claude-code',
                        env: process.env.USER_TYPE,
                    };
                    // Add all fields as searchable attributes (not duplicated in tags)
                    for (_i = 0, _a = Object.entries(allData); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], value = _b[1];
                        if (value !== undefined && value !== null) {
                            log[camelToSnakeCase(key)] = value;
                        }
                    }
                    logBatch.push(log);
                    // Flush immediately if batch is full, otherwise schedule
                    if (logBatch.length >= MAX_BATCH_SIZE) {
                        if (flushTimer) {
                            clearTimeout(flushTimer);
                            flushTimer = null;
                        }
                        void flushLogs();
                    }
                    else {
                        scheduleFlush();
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _c.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var NUM_USER_BUCKETS = 30;
/**
 * Gets a 'bucket' that the user ID falls into.
 *
 * For alerting purposes, we want to alert on the number of users impacted
 * by an issue, rather than the number of events- often a small number of users
 * can generate a large number of events (e.g. due to retries). To approximate
 * this without ruining cardinality by counting user IDs directly, we hash the user ID
 * and assign it to one of a fixed number of buckets.
 *
 * This allows us to estimate the number of unique users by counting unique buckets,
 * while preserving user privacy and reducing cardinality.
 */
var getUserBucket = (0, memoize_js_1.default)(function () {
    var userId = (0, config_js_1.getOrCreateUserID)();
    var hash = (0, crypto_1.createHash)('sha256').update(userId).digest('hex');
    return parseInt(hash.slice(0, 8), 16) % NUM_USER_BUCKETS;
});
function getFlushIntervalMs() {
    // Allow tests to override to not block on the default flush interval.
    return (parseInt(process.env.CLAUDE_CODE_DATADOG_FLUSH_INTERVAL_MS || '', 10) ||
        DEFAULT_FLUSH_INTERVAL_MS);
}
