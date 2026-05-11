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
exports.getComputerUseHostAdapter = getComputerUseHostAdapter;
var util_1 = require("util");
var debug_js_1 = require("../debug.js");
var common_js_1 = require("./common.js");
var executor_js_1 = require("./executor.js");
var gates_js_1 = require("./gates.js");
var swiftLoader_js_1 = require("./swiftLoader.js");
var DebugLogger = /** @class */ (function () {
    function DebugLogger() {
    }
    DebugLogger.prototype.silly = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'debug' });
    };
    DebugLogger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'debug' });
    };
    DebugLogger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'info' });
    };
    DebugLogger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'warn' });
    };
    DebugLogger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        (0, debug_js_1.logForDebugging)(util_1.format.apply(void 0, __spreadArray([message], args, false)), { level: 'error' });
    };
    return DebugLogger;
}());
var cached;
/**
 * Process-lifetime singleton. Built once on first CU tool call; native modules
 * (both `@ant/computer-use-input` and `@ant/computer-use-swift`) are loaded
 * here via the executor factory, which throws on load failure — there is no
 * degraded mode.
 */
function getComputerUseHostAdapter() {
    var _this = this;
    if (cached)
        return cached;
    cached = {
        serverName: common_js_1.COMPUTER_USE_MCP_SERVER_NAME,
        logger: new DebugLogger(),
        executor: (0, executor_js_1.createCliExecutor)({
            getMouseAnimationEnabled: function () { return (0, gates_js_1.getChicagoSubGates)().mouseAnimation; },
            getHideBeforeActionEnabled: function () { return (0, gates_js_1.getChicagoSubGates)().hideBeforeAction; },
        }),
        ensureOsPermissions: function () { return __awaiter(_this, void 0, void 0, function () {
            var cu, accessibility, screenRecording;
            return __generator(this, function (_a) {
                cu = (0, swiftLoader_js_1.requireComputerUseSwift)();
                accessibility = cu.tcc.checkAccessibility();
                screenRecording = cu.tcc.checkScreenRecording();
                return [2 /*return*/, accessibility && screenRecording
                        ? { granted: true }
                        : { granted: false, accessibility: accessibility, screenRecording: screenRecording }];
            });
        }); },
        isDisabled: function () { return !(0, gates_js_1.getChicagoEnabled)(); },
        getSubGates: gates_js_1.getChicagoSubGates,
        // cleanup.ts always unhides at turn end — no user preference to disable it.
        getAutoUnhideEnabled: function () { return true; },
        // Pixel-validation JPEG decode+crop. MUST be synchronous (the package
        // does `patch1.equals(patch2)` directly on the return value). Cowork uses
        // Electron's `nativeImage` (sync); our `image-processor-napi` is
        // sharp-compatible and async-only. Returning null → validation skipped,
        // click proceeds — the designed fallback per `PixelCompareResult.skipped`.
        // The sub-gate defaults to false anyway.
        cropRawPatch: function () { return null; },
    };
    return cached;
}
