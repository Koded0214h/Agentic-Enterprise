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
exports.redactIfDisabled = redactIfDisabled;
exports.logOTelEvent = logOTelEvent;
var state_js_1 = require("src/bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var telemetryAttributes_js_1 = require("../telemetryAttributes.js");
// Monotonically increasing counter for ordering events within a session
var eventSequence = 0;
// Track whether we've already warned about a null event logger to avoid spamming
var hasWarnedNoEventLogger = false;
function isUserPromptLoggingEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.OTEL_LOG_USER_PROMPTS);
}
function redactIfDisabled(content) {
    return isUserPromptLoggingEnabled() ? content : '<REDACTED>';
}
function logOTelEvent(eventName_1) {
    return __awaiter(this, arguments, void 0, function (eventName, metadata) {
        var eventLogger, attributes, promptId, workspaceDir, _i, _a, _b, key, value;
        if (metadata === void 0) { metadata = {}; }
        return __generator(this, function (_c) {
            eventLogger = (0, state_js_1.getEventLogger)();
            if (!eventLogger) {
                if (!hasWarnedNoEventLogger) {
                    hasWarnedNoEventLogger = true;
                    (0, debug_js_1.logForDebugging)("[3P telemetry] Event dropped (no event logger initialized): ".concat(eventName), { level: 'warn' });
                }
                return [2 /*return*/];
            }
            // Skip logging in test environment
            if (process.env.NODE_ENV === 'test') {
                return [2 /*return*/];
            }
            attributes = __assign(__assign({}, (0, telemetryAttributes_js_1.getTelemetryAttributes)()), { 'event.name': eventName, 'event.timestamp': new Date().toISOString(), 'event.sequence': eventSequence++ });
            promptId = (0, state_js_1.getPromptId)();
            if (promptId) {
                attributes['prompt.id'] = promptId;
            }
            workspaceDir = process.env.CLAUDE_CODE_WORKSPACE_HOST_PATHS;
            if (workspaceDir) {
                attributes['workspace.host_paths'] = workspaceDir.split('|');
            }
            // Add metadata as attributes - all values are already strings
            for (_i = 0, _a = Object.entries(metadata); _i < _a.length; _i++) {
                _b = _a[_i], key = _b[0], value = _b[1];
                if (value !== undefined) {
                    attributes[key] = value;
                }
            }
            // Emit log record as an event
            eventLogger.emit({
                body: "claude_code.".concat(eventName),
                attributes: attributes,
            });
            return [2 /*return*/];
        });
    });
}
