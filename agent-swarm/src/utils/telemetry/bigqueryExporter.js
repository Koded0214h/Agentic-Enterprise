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
exports.BigQueryMetricsExporter = void 0;
var core_1 = require("@opentelemetry/core");
var sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
var axios_1 = require("axios");
var metricsOptOut_js_1 = require("src/services/api/metricsOptOut.js");
var state_js_1 = require("../../bootstrap/state.js");
var auth_js_1 = require("../auth.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var http_js_1 = require("../http.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var userAgent_js_1 = require("../userAgent.js");
var BigQueryMetricsExporter = /** @class */ (function () {
    function BigQueryMetricsExporter(options) {
        if (options === void 0) { options = {}; }
        this.pendingExports = [];
        this.isShutdown = false;
        var defaultEndpoint = 'https://api.anthropic.com/api/claude_code/metrics';
        if (process.env.USER_TYPE === 'ant' &&
            process.env.ANT_CLAUDE_CODE_METRICS_ENDPOINT) {
            this.endpoint =
                process.env.ANT_CLAUDE_CODE_METRICS_ENDPOINT +
                    '/api/claude_code/metrics';
        }
        else {
            this.endpoint = defaultEndpoint;
        }
        this.timeout = options.timeout || 5000;
    }
    BigQueryMetricsExporter.prototype.export = function (metrics, resultCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var exportPromise;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isShutdown) {
                    resultCallback({
                        code: core_1.ExportResultCode.FAILED,
                        error: new Error('Exporter has been shutdown'),
                    });
                    return [2 /*return*/];
                }
                exportPromise = this.doExport(metrics, resultCallback);
                this.pendingExports.push(exportPromise);
                // Clean up completed exports
                void exportPromise.finally(function () {
                    var index = _this.pendingExports.indexOf(exportPromise);
                    if (index > -1) {
                        void _this.pendingExports.splice(index, 1);
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    BigQueryMetricsExporter.prototype.doExport = function (metrics, resultCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var hasTrust, metricsStatus, payload, authResult, headers, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)() || (0, state_js_1.getIsNonInteractiveSession)();
                        if (!hasTrust) {
                            (0, debug_js_1.logForDebugging)('BigQuery metrics export: trust not established, skipping');
                            resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, metricsOptOut_js_1.checkMetricsEnabled)()];
                    case 1:
                        metricsStatus = _a.sent();
                        if (!metricsStatus.enabled) {
                            (0, debug_js_1.logForDebugging)('Metrics export disabled by organization setting');
                            resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                            return [2 /*return*/];
                        }
                        payload = this.transformMetricsForInternal(metrics);
                        authResult = (0, http_js_1.getAuthHeaders)();
                        if (authResult.error) {
                            (0, debug_js_1.logForDebugging)("Metrics export failed: ".concat(authResult.error));
                            resultCallback({
                                code: core_1.ExportResultCode.FAILED,
                                error: new Error(authResult.error),
                            });
                            return [2 /*return*/];
                        }
                        headers = __assign({ 'Content-Type': 'application/json', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }, authResult.headers);
                        return [4 /*yield*/, axios_1.default.post(this.endpoint, payload, {
                                timeout: this.timeout,
                                headers: headers,
                            })];
                    case 2:
                        response = _a.sent();
                        (0, debug_js_1.logForDebugging)('BigQuery metrics exported successfully');
                        (0, debug_js_1.logForDebugging)("BigQuery API Response: ".concat((0, slowOperations_js_1.jsonStringify)(response.data, null, 2)));
                        resultCallback({ code: core_1.ExportResultCode.SUCCESS });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        (0, debug_js_1.logForDebugging)("BigQuery metrics export failed: ".concat((0, errors_js_1.errorMessage)(error_1)));
                        (0, log_js_1.logError)(error_1);
                        resultCallback({
                            code: core_1.ExportResultCode.FAILED,
                            error: (0, errors_js_1.toError)(error_1),
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BigQueryMetricsExporter.prototype.transformMetricsForInternal = function (metrics) {
        var _this = this;
        var attrs = metrics.resource.attributes;
        var resourceAttributes = {
            'service.name': attrs['service.name'] || 'claude-code',
            'service.version': attrs['service.version'] || 'unknown',
            'os.type': attrs['os.type'] || 'unknown',
            'os.version': attrs['os.version'] || 'unknown',
            'host.arch': attrs['host.arch'] || 'unknown',
            'aggregation.temporality': this.selectAggregationTemporality() === sdk_metrics_1.AggregationTemporality.DELTA
                ? 'delta'
                : 'cumulative',
        };
        // Only add wsl.version if it exists (omit instead of default)
        if (attrs['wsl.version']) {
            resourceAttributes['wsl.version'] = attrs['wsl.version'];
        }
        // Add customer type and subscription type
        if ((0, auth_js_1.isClaudeAISubscriber)()) {
            resourceAttributes['user.customer_type'] = 'claude_ai';
            var subscriptionType = (0, auth_js_1.getSubscriptionType)();
            if (subscriptionType) {
                resourceAttributes['user.subscription_type'] = subscriptionType;
            }
        }
        else {
            resourceAttributes['user.customer_type'] = 'api';
        }
        var transformed = {
            resource_attributes: resourceAttributes,
            metrics: metrics.scopeMetrics.flatMap(function (scopeMetric) {
                return scopeMetric.metrics.map(function (metric) { return ({
                    name: metric.descriptor.name,
                    description: metric.descriptor.description,
                    unit: metric.descriptor.unit,
                    data_points: _this.extractDataPoints(metric),
                }); });
            }),
        };
        return transformed;
    };
    BigQueryMetricsExporter.prototype.extractDataPoints = function (metric) {
        var _this = this;
        var dataPoints = metric.dataPoints || [];
        return dataPoints
            .filter(function (point) {
            return typeof point.value === 'number';
        })
            .map(function (point) { return ({
            attributes: _this.convertAttributes(point.attributes),
            value: point.value,
            timestamp: _this.hrTimeToISOString(point.endTime || point.startTime || [Date.now() / 1000, 0]),
        }); });
    };
    BigQueryMetricsExporter.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isShutdown = true;
                        return [4 /*yield*/, this.forceFlush()];
                    case 1:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)('BigQuery metrics exporter shutdown complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    BigQueryMetricsExporter.prototype.forceFlush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.pendingExports)];
                    case 1:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)('BigQuery metrics exporter flush complete');
                        return [2 /*return*/];
                }
            });
        });
    };
    BigQueryMetricsExporter.prototype.convertAttributes = function (attributes) {
        var result = {};
        if (attributes) {
            for (var _i = 0, _a = Object.entries(attributes); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                if (value !== undefined && value !== null) {
                    result[key] = String(value);
                }
            }
        }
        return result;
    };
    BigQueryMetricsExporter.prototype.hrTimeToISOString = function (hrTime) {
        var seconds = hrTime[0], nanoseconds = hrTime[1];
        var date = new Date(seconds * 1000 + nanoseconds / 1000000);
        return date.toISOString();
    };
    BigQueryMetricsExporter.prototype.selectAggregationTemporality = function () {
        // DO NOT CHANGE THIS TO CUMULATIVE
        // It would mess up the aggregation of metrics
        // for CC Productivity metrics dashboard
        return sdk_metrics_1.AggregationTemporality.DELTA;
    };
    return BigQueryMetricsExporter;
}());
exports.BigQueryMetricsExporter = BigQueryMetricsExporter;
