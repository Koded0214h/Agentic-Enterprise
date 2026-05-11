"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.bootstrapTelemetry = bootstrapTelemetry;
exports.parseExporterTypes = parseExporterTypes;
exports.isTelemetryEnabled = isTelemetryEnabled;
exports.initializeTelemetry = initializeTelemetry;
exports.flushTelemetry = flushTelemetry;
var api_1 = require("@opentelemetry/api");
var api_logs_1 = require("@opentelemetry/api-logs");
// OTLP/Prometheus exporters are dynamically imported inside the protocol
// switch statements below. A process uses at most one protocol variant per
// signal, but static imports would load all 6 (~1.2MB) on every startup.
var resources_1 = require("@opentelemetry/resources");
var sdk_logs_1 = require("@opentelemetry/sdk-logs");
var sdk_metrics_1 = require("@opentelemetry/sdk-metrics");
var sdk_trace_base_1 = require("@opentelemetry/sdk-trace-base");
var semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
var https_proxy_agent_1 = require("https-proxy-agent");
var state_js_1 = require("src/bootstrap/state.js");
var auth_js_1 = require("src/utils/auth.js");
var platform_js_1 = require("src/utils/platform.js");
var caCerts_js_1 = require("../caCerts.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var mtls_js_1 = require("../mtls.js");
var proxy_js_1 = require("../proxy.js");
var settings_js_1 = require("../settings/settings.js");
var slowOperations_js_1 = require("../slowOperations.js");
var startupProfiler_js_1 = require("../startupProfiler.js");
var betaSessionTracing_js_1 = require("./betaSessionTracing.js");
var bigqueryExporter_js_1 = require("./bigqueryExporter.js");
var logger_js_1 = require("./logger.js");
var perfettoTracing_js_1 = require("./perfettoTracing.js");
var sessionTracing_js_1 = require("./sessionTracing.js");
var DEFAULT_METRICS_EXPORT_INTERVAL_MS = 60000;
var DEFAULT_LOGS_EXPORT_INTERVAL_MS = 5000;
var DEFAULT_TRACES_EXPORT_INTERVAL_MS = 5000;
var TelemetryTimeoutError = /** @class */ (function (_super) {
    __extends(TelemetryTimeoutError, _super);
    function TelemetryTimeoutError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return TelemetryTimeoutError;
}(Error));
function telemetryTimeout(ms, message) {
    return new Promise(function (_, reject) {
        setTimeout(function (rej, msg) {
            return rej(new TelemetryTimeoutError(msg));
        }, ms, reject, message).unref();
    });
}
function bootstrapTelemetry() {
    if (process.env.USER_TYPE === 'ant') {
        // Read from ANT_ prefixed variables that are defined at build time
        if (process.env.ANT_OTEL_METRICS_EXPORTER) {
            process.env.OTEL_METRICS_EXPORTER = process.env.ANT_OTEL_METRICS_EXPORTER;
        }
        if (process.env.ANT_OTEL_LOGS_EXPORTER) {
            process.env.OTEL_LOGS_EXPORTER = process.env.ANT_OTEL_LOGS_EXPORTER;
        }
        if (process.env.ANT_OTEL_TRACES_EXPORTER) {
            process.env.OTEL_TRACES_EXPORTER = process.env.ANT_OTEL_TRACES_EXPORTER;
        }
        if (process.env.ANT_OTEL_EXPORTER_OTLP_PROTOCOL) {
            process.env.OTEL_EXPORTER_OTLP_PROTOCOL =
                process.env.ANT_OTEL_EXPORTER_OTLP_PROTOCOL;
        }
        if (process.env.ANT_OTEL_EXPORTER_OTLP_ENDPOINT) {
            process.env.OTEL_EXPORTER_OTLP_ENDPOINT =
                process.env.ANT_OTEL_EXPORTER_OTLP_ENDPOINT;
        }
        if (process.env.ANT_OTEL_EXPORTER_OTLP_HEADERS) {
            process.env.OTEL_EXPORTER_OTLP_HEADERS =
                process.env.ANT_OTEL_EXPORTER_OTLP_HEADERS;
        }
    }
    // Set default tempoality to 'delta' because it's the more sane default
    if (!process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE) {
        process.env.OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE = 'delta';
    }
}
// Per OTEL spec, "none" means "no automatically configured exporter for this signal".
// https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#exporter-selection
function parseExporterTypes(value) {
    return (value || '')
        .trim()
        .split(',')
        .filter(Boolean)
        .map(function (t) { return t.trim(); })
        .filter(function (t) { return t !== 'none'; });
}
function getOtlpReaders() {
    return __awaiter(this, void 0, void 0, function () {
        var exporterTypes, exportInterval, exporters, _loop_1, _i, exporterTypes_1, exporterType;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    exporterTypes = parseExporterTypes(process.env.OTEL_METRICS_EXPORTER);
                    exportInterval = parseInt(process.env.OTEL_METRIC_EXPORT_INTERVAL ||
                        DEFAULT_METRICS_EXPORT_INTERVAL_MS.toString());
                    exporters = [];
                    _loop_1 = function (exporterType) {
                        var consoleExporter, originalExport_1, protocol, httpConfig, _d, OTLPMetricExporter, OTLPMetricExporter, OTLPMetricExporter, PrometheusExporter;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (!(exporterType === 'console')) return [3 /*break*/, 1];
                                    consoleExporter = new sdk_metrics_1.ConsoleMetricExporter();
                                    originalExport_1 = consoleExporter.export.bind(consoleExporter);
                                    consoleExporter.export = function (metrics, callback) {
                                        // Log resource attributes once at the start
                                        if (metrics.resource && metrics.resource.attributes) {
                                            // The console exporter is for debugging, so console output is intentional here
                                            (0, debug_js_1.logForDebugging)('\n=== Resource Attributes ===');
                                            (0, debug_js_1.logForDebugging)((0, slowOperations_js_1.jsonStringify)(metrics.resource.attributes));
                                            (0, debug_js_1.logForDebugging)('===========================\n');
                                        }
                                        return originalExport_1(metrics, callback);
                                    };
                                    exporters.push(consoleExporter);
                                    return [3 /*break*/, 13];
                                case 1:
                                    if (!(exporterType === 'otlp')) return [3 /*break*/, 10];
                                    protocol = ((_a = process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL) === null || _a === void 0 ? void 0 : _a.trim()) ||
                                        ((_b = process.env.OTEL_EXPORTER_OTLP_PROTOCOL) === null || _b === void 0 ? void 0 : _b.trim());
                                    httpConfig = getOTLPExporterConfig();
                                    _d = protocol;
                                    switch (_d) {
                                        case 'grpc': return [3 /*break*/, 2];
                                        case 'http/json': return [3 /*break*/, 4];
                                        case 'http/protobuf': return [3 /*break*/, 6];
                                    }
                                    return [3 /*break*/, 8];
                                case 2: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-metrics-otlp-grpc'); })];
                                case 3:
                                    OTLPMetricExporter = (_e.sent()).OTLPMetricExporter;
                                    exporters.push(new OTLPMetricExporter());
                                    return [3 /*break*/, 9];
                                case 4: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-metrics-otlp-http'); })];
                                case 5:
                                    OTLPMetricExporter = (_e.sent()).OTLPMetricExporter;
                                    exporters.push(new OTLPMetricExporter(httpConfig));
                                    return [3 /*break*/, 9];
                                case 6: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-metrics-otlp-proto'); })];
                                case 7:
                                    OTLPMetricExporter = (_e.sent()).OTLPMetricExporter;
                                    exporters.push(new OTLPMetricExporter(httpConfig));
                                    return [3 /*break*/, 9];
                                case 8: throw new Error("Unknown protocol set in OTEL_EXPORTER_OTLP_METRICS_PROTOCOL or OTEL_EXPORTER_OTLP_PROTOCOL env var: ".concat(protocol));
                                case 9: return [3 /*break*/, 13];
                                case 10:
                                    if (!(exporterType === 'prometheus')) return [3 /*break*/, 12];
                                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-prometheus'); })];
                                case 11:
                                    PrometheusExporter = (_e.sent()).PrometheusExporter;
                                    exporters.push(new PrometheusExporter());
                                    return [3 /*break*/, 13];
                                case 12: throw new Error("Unknown exporter type set in OTEL_EXPORTER_OTLP_METRICS_PROTOCOL or OTEL_EXPORTER_OTLP_PROTOCOL env var: ".concat(exporterType));
                                case 13: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, exporterTypes_1 = exporterTypes;
                    _c.label = 1;
                case 1:
                    if (!(_i < exporterTypes_1.length)) return [3 /*break*/, 4];
                    exporterType = exporterTypes_1[_i];
                    return [5 /*yield**/, _loop_1(exporterType)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, exporters.map(function (exporter) {
                        if ('export' in exporter) {
                            return new sdk_metrics_1.PeriodicExportingMetricReader({
                                exporter: exporter,
                                exportIntervalMillis: exportInterval,
                            });
                        }
                        return exporter;
                    })];
            }
        });
    });
}
function getOtlpLogExporters() {
    return __awaiter(this, void 0, void 0, function () {
        var exporterTypes, protocol, endpoint, exporters, _i, exporterTypes_2, exporterType, httpConfig, _a, OTLPLogExporter, OTLPLogExporter, OTLPLogExporter;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    exporterTypes = parseExporterTypes(process.env.OTEL_LOGS_EXPORTER);
                    protocol = ((_b = process.env.OTEL_EXPORTER_OTLP_LOGS_PROTOCOL) === null || _b === void 0 ? void 0 : _b.trim()) ||
                        ((_c = process.env.OTEL_EXPORTER_OTLP_PROTOCOL) === null || _c === void 0 ? void 0 : _c.trim());
                    endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
                    (0, debug_js_1.logForDebugging)("[3P telemetry] getOtlpLogExporters: types=".concat((0, slowOperations_js_1.jsonStringify)(exporterTypes), ", protocol=").concat(protocol, ", endpoint=").concat(endpoint));
                    exporters = [];
                    _i = 0, exporterTypes_2 = exporterTypes;
                    _d.label = 1;
                case 1:
                    if (!(_i < exporterTypes_2.length)) return [3 /*break*/, 13];
                    exporterType = exporterTypes_2[_i];
                    if (!(exporterType === 'console')) return [3 /*break*/, 2];
                    exporters.push(new sdk_logs_1.ConsoleLogRecordExporter());
                    return [3 /*break*/, 12];
                case 2:
                    if (!(exporterType === 'otlp')) return [3 /*break*/, 11];
                    httpConfig = getOTLPExporterConfig();
                    _a = protocol;
                    switch (_a) {
                        case 'grpc': return [3 /*break*/, 3];
                        case 'http/json': return [3 /*break*/, 5];
                        case 'http/protobuf': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-logs-otlp-grpc'); })];
                case 4:
                    OTLPLogExporter = (_d.sent()).OTLPLogExporter;
                    exporters.push(new OTLPLogExporter());
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-logs-otlp-http'); })];
                case 6:
                    OTLPLogExporter = (_d.sent()).OTLPLogExporter;
                    exporters.push(new OTLPLogExporter(httpConfig));
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-logs-otlp-proto'); })];
                case 8:
                    OTLPLogExporter = (_d.sent()).OTLPLogExporter;
                    exporters.push(new OTLPLogExporter(httpConfig));
                    return [3 /*break*/, 10];
                case 9: throw new Error("Unknown protocol set in OTEL_EXPORTER_OTLP_LOGS_PROTOCOL or OTEL_EXPORTER_OTLP_PROTOCOL env var: ".concat(protocol));
                case 10: return [3 /*break*/, 12];
                case 11: throw new Error("Unknown exporter type set in OTEL_LOGS_EXPORTER env var: ".concat(exporterType));
                case 12:
                    _i++;
                    return [3 /*break*/, 1];
                case 13: return [2 /*return*/, exporters];
            }
        });
    });
}
function getOtlpTraceExporters() {
    return __awaiter(this, void 0, void 0, function () {
        var exporterTypes, exporters, _i, exporterTypes_3, exporterType, protocol, httpConfig, _a, OTLPTraceExporter, OTLPTraceExporter, OTLPTraceExporter;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    exporterTypes = parseExporterTypes(process.env.OTEL_TRACES_EXPORTER);
                    exporters = [];
                    _i = 0, exporterTypes_3 = exporterTypes;
                    _d.label = 1;
                case 1:
                    if (!(_i < exporterTypes_3.length)) return [3 /*break*/, 13];
                    exporterType = exporterTypes_3[_i];
                    if (!(exporterType === 'console')) return [3 /*break*/, 2];
                    exporters.push(new sdk_trace_base_1.ConsoleSpanExporter());
                    return [3 /*break*/, 12];
                case 2:
                    if (!(exporterType === 'otlp')) return [3 /*break*/, 11];
                    protocol = ((_b = process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL) === null || _b === void 0 ? void 0 : _b.trim()) ||
                        ((_c = process.env.OTEL_EXPORTER_OTLP_PROTOCOL) === null || _c === void 0 ? void 0 : _c.trim());
                    httpConfig = getOTLPExporterConfig();
                    _a = protocol;
                    switch (_a) {
                        case 'grpc': return [3 /*break*/, 3];
                        case 'http/json': return [3 /*break*/, 5];
                        case 'http/protobuf': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-trace-otlp-grpc'); })];
                case 4:
                    OTLPTraceExporter = (_d.sent()).OTLPTraceExporter;
                    exporters.push(new OTLPTraceExporter());
                    return [3 /*break*/, 10];
                case 5: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-trace-otlp-http'); })];
                case 6:
                    OTLPTraceExporter = (_d.sent()).OTLPTraceExporter;
                    exporters.push(new OTLPTraceExporter(httpConfig));
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, Promise.resolve().then(function () { return require('@opentelemetry/exporter-trace-otlp-proto'); })];
                case 8:
                    OTLPTraceExporter = (_d.sent()).OTLPTraceExporter;
                    exporters.push(new OTLPTraceExporter(httpConfig));
                    return [3 /*break*/, 10];
                case 9: throw new Error("Unknown protocol set in OTEL_EXPORTER_OTLP_TRACES_PROTOCOL or OTEL_EXPORTER_OTLP_PROTOCOL env var: ".concat(protocol));
                case 10: return [3 /*break*/, 12];
                case 11: throw new Error("Unknown exporter type set in OTEL_TRACES_EXPORTER env var: ".concat(exporterType));
                case 12:
                    _i++;
                    return [3 /*break*/, 1];
                case 13: return [2 /*return*/, exporters];
            }
        });
    });
}
function isTelemetryEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_TELEMETRY);
}
function getBigQueryExportingReader() {
    var bigqueryExporter = new bigqueryExporter_js_1.BigQueryMetricsExporter();
    return new sdk_metrics_1.PeriodicExportingMetricReader({
        exporter: bigqueryExporter,
        exportIntervalMillis: 5 * 60 * 1000, // 5mins for BigQuery metrics exporter to reduce load
    });
}
function isBigQueryMetricsEnabled() {
    // BigQuery metrics are enabled for:
    // 1. API customers (excluding Claude.ai subscribers and Bedrock/Vertex)
    // 2. Claude for Enterprise (C4E) users
    // 3. Claude for Teams users
    var subscriptionType = (0, auth_js_1.getSubscriptionType)();
    var isC4EOrTeamUser = (0, auth_js_1.isClaudeAISubscriber)() &&
        (subscriptionType === 'enterprise' || subscriptionType === 'team');
    return (0, auth_js_1.is1PApiCustomer)() || isC4EOrTeamUser;
}
/**
 * Initialize beta tracing - a separate code path for detailed debugging.
 * Uses BETA_TRACING_ENDPOINT instead of OTEL_EXPORTER_OTLP_ENDPOINT.
 */
function initializeBetaTracing(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var endpoint, _a, OTLPTraceExporter, OTLPLogExporter, httpConfig, logHttpConfig, traceExporter, spanProcessor, tracerProvider, logExporter, loggerProvider, eventLogger;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    endpoint = process.env.BETA_TRACING_ENDPOINT;
                    if (!endpoint) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.all([
                            Promise.resolve().then(function () { return require('@opentelemetry/exporter-trace-otlp-http'); }),
                            Promise.resolve().then(function () { return require('@opentelemetry/exporter-logs-otlp-http'); }),
                        ])];
                case 1:
                    _a = _b.sent(), OTLPTraceExporter = _a[0].OTLPTraceExporter, OTLPLogExporter = _a[1].OTLPLogExporter;
                    httpConfig = {
                        url: "".concat(endpoint, "/v1/traces"),
                    };
                    logHttpConfig = {
                        url: "".concat(endpoint, "/v1/logs"),
                    };
                    traceExporter = new OTLPTraceExporter(httpConfig);
                    spanProcessor = new sdk_trace_base_1.BatchSpanProcessor(traceExporter, {
                        scheduledDelayMillis: DEFAULT_TRACES_EXPORT_INTERVAL_MS,
                    });
                    tracerProvider = new sdk_trace_base_1.BasicTracerProvider({
                        resource: resource,
                        spanProcessors: [spanProcessor],
                    });
                    api_1.trace.setGlobalTracerProvider(tracerProvider);
                    (0, state_js_1.setTracerProvider)(tracerProvider);
                    logExporter = new OTLPLogExporter(logHttpConfig);
                    loggerProvider = new sdk_logs_1.LoggerProvider({
                        resource: resource,
                        processors: [
                            new sdk_logs_1.BatchLogRecordProcessor(logExporter, {
                                scheduledDelayMillis: DEFAULT_LOGS_EXPORT_INTERVAL_MS,
                            }),
                        ],
                    });
                    api_logs_1.logs.setGlobalLoggerProvider(loggerProvider);
                    (0, state_js_1.setLoggerProvider)(loggerProvider);
                    eventLogger = api_logs_1.logs.getLogger('com.anthropic.claude_code.events', MACRO.VERSION);
                    (0, state_js_1.setEventLogger)(eventLogger);
                    // Setup flush handlers - flush both logs AND traces
                    process.on('beforeExit', function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.forceFlush())];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (tracerProvider === null || tracerProvider === void 0 ? void 0 : tracerProvider.forceFlush())];
                                case 2:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    process.on('exit', function () {
                        void (loggerProvider === null || loggerProvider === void 0 ? void 0 : loggerProvider.forceFlush());
                        void (tracerProvider === null || tracerProvider === void 0 ? void 0 : tracerProvider.forceFlush());
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function initializeTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, key, v, readers, telemetryEnabled, _b, _c, _d, platform, baseAttributes, wslVersion, baseResource, osResource, hostDetected, hostArchAttributes, hostArchResource, envResource, resource, meterProvider_1, shutdownTelemetry_1, meterProvider, logExporters, loggerProvider_1, eventLogger, traceExporters, spanProcessors, tracerProvider, shutdownTelemetry;
        var _e, _f;
        var _this = this;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    (0, startupProfiler_js_1.profileCheckpoint)('telemetry_init_start');
                    bootstrapTelemetry();
                    // Console exporters call console.dir on a timer (5s logs/traces, 60s
                    // metrics), writing pretty-printed objects to stdout. In stream-json
                    // mode stdout is the SDK message channel; the first line (`{`) breaks
                    // the SDK's line reader. Stripped here (not main.tsx) because init.ts
                    // re-runs applyConfigEnvironmentVariables() inside initializeTelemetry-
                    // AfterTrust for remote-managed-settings users, and bootstrapTelemetry
                    // above copies ANT_OTEL_* for ant users — both would undo an earlier strip.
                    if ((0, debug_js_1.getHasFormattedOutput)()) {
                        for (_i = 0, _a = [
                            'OTEL_METRICS_EXPORTER',
                            'OTEL_LOGS_EXPORTER',
                            'OTEL_TRACES_EXPORTER',
                        ]; _i < _a.length; _i++) {
                            key = _a[_i];
                            v = process.env[key];
                            if (v === null || v === void 0 ? void 0 : v.includes('console')) {
                                process.env[key] = v
                                    .split(',')
                                    .map(function (s) { return s.trim(); })
                                    .filter(function (s) { return s !== 'console'; })
                                    .join(',');
                            }
                        }
                    }
                    api_1.diag.setLogger(new logger_js_1.ClaudeCodeDiagLogger(), api_1.DiagLogLevel.ERROR);
                    // Initialize Perfetto tracing (independent of OTEL)
                    // Enable via CLAUDE_CODE_PERFETTO_TRACE=1 or CLAUDE_CODE_PERFETTO_TRACE=<path>
                    (0, perfettoTracing_js_1.initializePerfettoTracing)();
                    readers = [];
                    telemetryEnabled = isTelemetryEnabled();
                    (0, debug_js_1.logForDebugging)("[3P telemetry] isTelemetryEnabled=".concat(telemetryEnabled, " (CLAUDE_CODE_ENABLE_TELEMETRY=").concat(process.env.CLAUDE_CODE_ENABLE_TELEMETRY, ")"));
                    if (!telemetryEnabled) return [3 /*break*/, 2];
                    _c = (_b = readers.push).apply;
                    _d = [readers];
                    return [4 /*yield*/, getOtlpReaders()];
                case 1:
                    _c.apply(_b, _d.concat([(_h.sent())]));
                    _h.label = 2;
                case 2:
                    // Add BigQuery exporter (for API customers, C4E users, and internal users)
                    if (isBigQueryMetricsEnabled()) {
                        readers.push(getBigQueryExportingReader());
                    }
                    platform = (0, platform_js_1.getPlatform)();
                    baseAttributes = (_e = {},
                        _e[semantic_conventions_1.SEMRESATTRS_SERVICE_NAME] = 'claude-code',
                        _e[semantic_conventions_1.SEMRESATTRS_SERVICE_VERSION] = MACRO.VERSION,
                        _e);
                    // Add WSL-specific attributes if running on WSL
                    if (platform === 'wsl') {
                        wslVersion = (0, platform_js_1.getWslVersion)();
                        if (wslVersion) {
                            baseAttributes['wsl.version'] = wslVersion;
                        }
                    }
                    baseResource = new resources_1.Resource(baseAttributes);
                    osResource = new resources_1.Resource(resources_1.osDetector.detect().attributes || {});
                    hostDetected = resources_1.hostDetector.detect();
                    hostArchAttributes = ((_g = hostDetected.attributes) === null || _g === void 0 ? void 0 : _g[semantic_conventions_1.SEMRESATTRS_HOST_ARCH])
                        ? (_f = {},
                            _f[semantic_conventions_1.SEMRESATTRS_HOST_ARCH] = hostDetected.attributes[semantic_conventions_1.SEMRESATTRS_HOST_ARCH],
                            _f) : {};
                    hostArchResource = new resources_1.Resource(hostArchAttributes);
                    envResource = new resources_1.Resource(resources_1.envDetector.detect().attributes || {});
                    resource = baseResource
                        .merge(osResource)
                        .merge(hostArchResource)
                        .merge(envResource);
                    // Check if beta tracing is enabled - this is a separate code path
                    // Available to all users who set ENABLE_BETA_TRACING_DETAILED=1 and BETA_TRACING_ENDPOINT
                    if ((0, betaSessionTracing_js_1.isBetaTracingEnabled)()) {
                        void initializeBetaTracing(resource).catch(function (e) {
                            return (0, debug_js_1.logForDebugging)("Beta tracing init failed: ".concat(e), { level: 'error' });
                        });
                        meterProvider_1 = new sdk_metrics_1.MeterProvider({
                            resource: resource,
                            views: [],
                            readers: readers,
                        });
                        (0, state_js_1.setMeterProvider)(meterProvider_1);
                        shutdownTelemetry_1 = function () { return __awaiter(_this, void 0, void 0, function () {
                            var timeoutMs, loggerProvider_2, tracerProvider_1, chains, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        timeoutMs = parseInt(process.env.CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS || '2000');
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        (0, sessionTracing_js_1.endInteractionSpan)();
                                        loggerProvider_2 = (0, state_js_1.getLoggerProvider)();
                                        tracerProvider_1 = (0, state_js_1.getTracerProvider)();
                                        chains = [meterProvider_1.shutdown()];
                                        if (loggerProvider_2) {
                                            chains.push(loggerProvider_2.forceFlush().then(function () { return loggerProvider_2.shutdown(); }));
                                        }
                                        if (tracerProvider_1) {
                                            chains.push(tracerProvider_1.forceFlush().then(function () { return tracerProvider_1.shutdown(); }));
                                        }
                                        return [4 /*yield*/, Promise.race([
                                                Promise.all(chains),
                                                telemetryTimeout(timeoutMs, 'OpenTelemetry shutdown timeout'),
                                            ])];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        (0, cleanupRegistry_js_1.registerCleanup)(shutdownTelemetry_1);
                        return [2 /*return*/, meterProvider_1.getMeter('com.anthropic.claude_code', MACRO.VERSION)];
                    }
                    meterProvider = new sdk_metrics_1.MeterProvider({
                        resource: resource,
                        views: [],
                        readers: readers,
                    });
                    // Store reference in state for flushing
                    (0, state_js_1.setMeterProvider)(meterProvider);
                    if (!telemetryEnabled) return [3 /*break*/, 4];
                    return [4 /*yield*/, getOtlpLogExporters()];
                case 3:
                    logExporters = _h.sent();
                    (0, debug_js_1.logForDebugging)("[3P telemetry] Created ".concat(logExporters.length, " log exporter(s)"));
                    if (logExporters.length > 0) {
                        loggerProvider_1 = new sdk_logs_1.LoggerProvider({
                            resource: resource,
                            // Add batch processors for each exporter
                            processors: logExporters.map(function (exporter) {
                                return new sdk_logs_1.BatchLogRecordProcessor(exporter, {
                                    scheduledDelayMillis: parseInt(process.env.OTEL_LOGS_EXPORT_INTERVAL ||
                                        DEFAULT_LOGS_EXPORT_INTERVAL_MS.toString()),
                                });
                            }),
                        });
                        // Register the logger provider globally
                        api_logs_1.logs.setGlobalLoggerProvider(loggerProvider_1);
                        (0, state_js_1.setLoggerProvider)(loggerProvider_1);
                        eventLogger = api_logs_1.logs.getLogger('com.anthropic.claude_code.events', MACRO.VERSION);
                        (0, state_js_1.setEventLogger)(eventLogger);
                        (0, debug_js_1.logForDebugging)('[3P telemetry] Event logger set successfully');
                        // 'beforeExit' is emitted when Node.js empties its event loop and has no additional work to schedule.
                        // Unlike 'exit', it allows us to perform async operations, so it works well for letting
                        // network requests complete before the process exits naturally.
                        process.on('beforeExit', function () { return __awaiter(_this, void 0, void 0, function () {
                            var tracerProvider;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (loggerProvider_1 === null || loggerProvider_1 === void 0 ? void 0 : loggerProvider_1.forceFlush())
                                        // Also flush traces - they use BatchSpanProcessor which needs explicit flush
                                    ];
                                    case 1:
                                        _a.sent();
                                        tracerProvider = (0, state_js_1.getTracerProvider)();
                                        return [4 /*yield*/, (tracerProvider === null || tracerProvider === void 0 ? void 0 : tracerProvider.forceFlush())];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        process.on('exit', function () {
                            var _a;
                            // Final attempt to flush logs and traces
                            void (loggerProvider_1 === null || loggerProvider_1 === void 0 ? void 0 : loggerProvider_1.forceFlush());
                            void ((_a = (0, state_js_1.getTracerProvider)()) === null || _a === void 0 ? void 0 : _a.forceFlush());
                        });
                    }
                    _h.label = 4;
                case 4:
                    if (!(telemetryEnabled && (0, sessionTracing_js_1.isEnhancedTelemetryEnabled)())) return [3 /*break*/, 6];
                    return [4 /*yield*/, getOtlpTraceExporters()];
                case 5:
                    traceExporters = _h.sent();
                    if (traceExporters.length > 0) {
                        spanProcessors = traceExporters.map(function (exporter) {
                            return new sdk_trace_base_1.BatchSpanProcessor(exporter, {
                                scheduledDelayMillis: parseInt(process.env.OTEL_TRACES_EXPORT_INTERVAL ||
                                    DEFAULT_TRACES_EXPORT_INTERVAL_MS.toString()),
                            });
                        });
                        tracerProvider = new sdk_trace_base_1.BasicTracerProvider({
                            resource: resource,
                            spanProcessors: spanProcessors,
                        });
                        // Register the tracer provider globally
                        api_1.trace.setGlobalTracerProvider(tracerProvider);
                        (0, state_js_1.setTracerProvider)(tracerProvider);
                    }
                    _h.label = 6;
                case 6:
                    shutdownTelemetry = function () { return __awaiter(_this, void 0, void 0, function () {
                        var timeoutMs, shutdownPromises, loggerProvider, tracerProvider, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    timeoutMs = parseInt(process.env.CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS || '2000');
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    // End any active interaction span before shutdown
                                    (0, sessionTracing_js_1.endInteractionSpan)();
                                    shutdownPromises = [meterProvider.shutdown()];
                                    loggerProvider = (0, state_js_1.getLoggerProvider)();
                                    if (loggerProvider) {
                                        shutdownPromises.push(loggerProvider.shutdown());
                                    }
                                    tracerProvider = (0, state_js_1.getTracerProvider)();
                                    if (tracerProvider) {
                                        shutdownPromises.push(tracerProvider.shutdown());
                                    }
                                    return [4 /*yield*/, Promise.race([
                                            Promise.all(shutdownPromises),
                                            telemetryTimeout(timeoutMs, 'OpenTelemetry shutdown timeout'),
                                        ])];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    if (error_1 instanceof Error && error_1.message.includes('timeout')) {
                                        (0, debug_js_1.logForDebugging)("\nOpenTelemetry telemetry flush timed out after ".concat(timeoutMs, "ms\n\nTo resolve this issue, you can:\n1. Increase the timeout by setting CLAUDE_CODE_OTEL_SHUTDOWN_TIMEOUT_MS env var (e.g., 5000 for 5 seconds)\n2. Check if your OpenTelemetry backend is experiencing scalability issues\n3. Disable OpenTelemetry by unsetting CLAUDE_CODE_ENABLE_TELEMETRY env var\n\nCurrent timeout: ").concat(timeoutMs, "ms\n"), { level: 'error' });
                                    }
                                    throw error_1;
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Always register shutdown (internal metrics are always enabled)
                    (0, cleanupRegistry_js_1.registerCleanup)(shutdownTelemetry);
                    return [2 /*return*/, meterProvider.getMeter('com.anthropic.claude_code', MACRO.VERSION)];
            }
        });
    });
}
/**
 * Flush all pending telemetry data immediately.
 * This should be called before logout or org switching to prevent data leakage.
 */
function flushTelemetry() {
    return __awaiter(this, void 0, void 0, function () {
        var meterProvider, timeoutMs, flushPromises, loggerProvider, tracerProvider, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    meterProvider = (0, state_js_1.getMeterProvider)();
                    if (!meterProvider) {
                        return [2 /*return*/];
                    }
                    timeoutMs = parseInt(process.env.CLAUDE_CODE_OTEL_FLUSH_TIMEOUT_MS || '5000');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    flushPromises = [meterProvider.forceFlush()];
                    loggerProvider = (0, state_js_1.getLoggerProvider)();
                    if (loggerProvider) {
                        flushPromises.push(loggerProvider.forceFlush());
                    }
                    tracerProvider = (0, state_js_1.getTracerProvider)();
                    if (tracerProvider) {
                        flushPromises.push(tracerProvider.forceFlush());
                    }
                    return [4 /*yield*/, Promise.race([
                            Promise.all(flushPromises),
                            telemetryTimeout(timeoutMs, 'OpenTelemetry flush timeout'),
                        ])];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)('Telemetry flushed successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    if (error_2 instanceof TelemetryTimeoutError) {
                        (0, debug_js_1.logForDebugging)("Telemetry flush timed out after ".concat(timeoutMs, "ms. Some metrics may not be exported."), { level: 'warn' });
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("Telemetry flush failed: ".concat((0, errors_js_1.errorMessage)(error_2)), {
                            level: 'error',
                        });
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function parseOtelHeadersEnvVar() {
    var headers = {};
    var envHeaders = process.env.OTEL_EXPORTER_OTLP_HEADERS;
    if (envHeaders) {
        for (var _i = 0, _a = envHeaders.split(','); _i < _a.length; _i++) {
            var pair = _a[_i];
            var _b = pair.split('='), key = _b[0], valueParts = _b.slice(1);
            if (key && valueParts.length > 0) {
                headers[key.trim()] = valueParts.join('=').trim();
            }
        }
    }
    return headers;
}
/**
 * Get configuration for OTLP exporters including:
 * - HTTP agent options (proxy, mTLS)
 * - Dynamic headers via otelHeadersHelper or static headers from env var
 */
function getOTLPExporterConfig() {
    var _this = this;
    var proxyUrl = (0, proxy_js_1.getProxyUrl)();
    var mtlsConfig = (0, mtls_js_1.getMTLSConfig)();
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    // Build base config
    var config = {};
    // Parse static headers from env var once (doesn't change at runtime)
    var staticHeaders = parseOtelHeadersEnvVar();
    // If otelHeadersHelper is configured, use async headers function for dynamic refresh
    // Otherwise just return static headers if any exist
    if (settings === null || settings === void 0 ? void 0 : settings.otelHeadersHelper) {
        config.headers = function () { return __awaiter(_this, void 0, void 0, function () {
            var dynamicHeaders;
            return __generator(this, function (_a) {
                dynamicHeaders = (0, auth_js_1.getOtelHeadersFromHelper)();
                return [2 /*return*/, __assign(__assign({}, staticHeaders), dynamicHeaders)];
            });
        }); };
    }
    else if (Object.keys(staticHeaders).length > 0) {
        config.headers = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, staticHeaders];
        }); }); };
    }
    // Check if we should bypass proxy for OTEL endpoint
    var otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (!proxyUrl || (otelEndpoint && (0, proxy_js_1.shouldBypassProxy)(otelEndpoint))) {
        // No proxy configured or OTEL endpoint should bypass proxy
        var caCerts_1 = (0, caCerts_js_1.getCACertificates)();
        if (mtlsConfig || caCerts_1) {
            config.httpAgentOptions = __assign(__assign({}, mtlsConfig), (caCerts_1 && { ca: caCerts_1 }));
        }
        return config;
    }
    // Return an HttpAgentFactory function that creates our proxy agent
    var caCerts = (0, caCerts_js_1.getCACertificates)();
    var agentFactory = function (_protocol) {
        // Create and return the proxy agent with mTLS and CA cert config
        var proxyAgent = mtlsConfig || caCerts
            ? new https_proxy_agent_1.HttpsProxyAgent(proxyUrl, __assign(__assign({}, (mtlsConfig && {
                cert: mtlsConfig.cert,
                key: mtlsConfig.key,
                passphrase: mtlsConfig.passphrase,
            })), (caCerts && { ca: caCerts })))
            : new https_proxy_agent_1.HttpsProxyAgent(proxyUrl);
        return proxyAgent;
    };
    config.httpAgentOptions = agentFactory;
    return config;
}
