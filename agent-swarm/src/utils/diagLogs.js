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
exports.logForDiagnosticsNoPII = logForDiagnosticsNoPII;
exports.withDiagnosticsTiming = withDiagnosticsTiming;
var path_1 = require("path");
var fsOperations_js_1 = require("./fsOperations.js");
var slowOperations_js_1 = require("./slowOperations.js");
/**
 * Logs diagnostic information to a logfile. This information is sent
 * via the environment manager to session-ingress to monitor issues from
 * within the container.
 *
 * *Important* - this function MUST NOT be called with any PII, including
 * file paths, project names, repo names, prompts, etc.
 *
 * @param level    Log level. Only used for information, not filtering
 * @param event    A specific event: "started", "mcp_connected", etc.
 * @param data     Optional additional data to log
 */
// sync IO: called from sync context
function logForDiagnosticsNoPII(level, event, data) {
    var logFile = getDiagnosticLogFile();
    if (!logFile) {
        return;
    }
    var entry = {
        timestamp: new Date().toISOString(),
        level: level,
        event: event,
        data: data !== null && data !== void 0 ? data : {},
    };
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var line = (0, slowOperations_js_1.jsonStringify)(entry) + '\n';
    try {
        fs.appendFileSync(logFile, line);
    }
    catch (_a) {
        // If append fails, try creating the directory first
        try {
            fs.mkdirSync((0, path_1.dirname)(logFile));
            fs.appendFileSync(logFile, line);
        }
        catch (_b) {
            // Silently fail if logging is not possible
        }
    }
}
function getDiagnosticLogFile() {
    return process.env.CLAUDE_CODE_DIAGNOSTICS_FILE;
}
/**
 * Wraps an async function with diagnostic timing logs.
 * Logs `{event}_started` before execution and `{event}_completed` after with duration_ms.
 *
 * @param event   Event name prefix (e.g., "git_status" -> logs "git_status_started" and "git_status_completed")
 * @param fn      Async function to execute and time
 * @param getData Optional function to extract additional data from the result for the completion log
 * @returns       The result of the wrapped function
 */
function withDiagnosticsTiming(event, fn, getData) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, result, additionalData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    logForDiagnosticsNoPII('info', "".concat(event, "_started"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fn()];
                case 2:
                    result = _a.sent();
                    additionalData = getData ? getData(result) : {};
                    logForDiagnosticsNoPII('info', "".concat(event, "_completed"), __assign({ duration_ms: Date.now() - startTime }, additionalData));
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _a.sent();
                    logForDiagnosticsNoPII('error', "".concat(event, "_failed"), {
                        duration_ms: Date.now() - startTime,
                    });
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
