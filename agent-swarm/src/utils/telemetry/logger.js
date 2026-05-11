"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaudeCodeDiagLogger = void 0;
var debug_js_1 = require("../debug.js");
var log_js_1 = require("../log.js");
var ClaudeCodeDiagLogger = /** @class */ (function () {
    function ClaudeCodeDiagLogger() {
    }
    ClaudeCodeDiagLogger.prototype.error = function (message) {
        var _ = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _[_i - 1] = arguments[_i];
        }
        (0, log_js_1.logError)(new Error(message));
        (0, debug_js_1.logForDebugging)("[3P telemetry] OTEL diag error: ".concat(message), {
            level: 'error',
        });
    };
    ClaudeCodeDiagLogger.prototype.warn = function (message) {
        var _ = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _[_i - 1] = arguments[_i];
        }
        (0, log_js_1.logError)(new Error(message));
        (0, debug_js_1.logForDebugging)("[3P telemetry] OTEL diag warn: ".concat(message), {
            level: 'warn',
        });
    };
    ClaudeCodeDiagLogger.prototype.info = function (_message) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        return;
    };
    ClaudeCodeDiagLogger.prototype.debug = function (_message) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        return;
    };
    ClaudeCodeDiagLogger.prototype.verbose = function (_message) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        return;
    };
    return ClaudeCodeDiagLogger;
}());
exports.ClaudeCodeDiagLogger = ClaudeCodeDiagLogger;
