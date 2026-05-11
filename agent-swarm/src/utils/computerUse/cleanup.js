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
exports.cleanupComputerUseAfterTurn = cleanupComputerUseAfterTurn;
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var withResolvers_js_1 = require("../withResolvers.js");
var computerUseLock_js_1 = require("./computerUseLock.js");
var escHotkey_js_1 = require("./escHotkey.js");
// cu.apps.unhide is NOT one of the four @MainActor methods wrapped by
// drainRunLoop's 30s backstop. On abort paths (where the user hit Ctrl+C
// because something was slow) a hang here would wedge the abort. Generous
// timeout — unhide should be ~instant; if it takes 5s something is wrong
// and proceeding is better than waiting. The Swift call continues in the
// background regardless; we just stop blocking on it.
var UNHIDE_TIMEOUT_MS = 5000;
/**
 * Turn-end cleanup for the chicago MCP surface: auto-unhide apps that
 * `prepareForAction` hid, then release the file-based lock.
 *
 * Called from three sites: natural turn end (`stopHooks.ts`), abort during
 * streaming (`query.ts` aborted_streaming), abort during tool execution
 * (`query.ts` aborted_tools). All three reach this via dynamic import gated
 * on `feature('CHICAGO_MCP')`. `executor.js` (which pulls both native
 * modules) is dynamic-imported below so non-CU turns don't load native
 * modules just to no-op.
 *
 * No-ops cheaply on non-CU turns: both gate checks are zero-syscall.
 */
function cleanupComputerUseAfterTurn(ctx) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, hidden, unhideComputerUseApps, unhide, timeout, timer_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    appState = ctx.getAppState();
                    hidden = (_a = appState.computerUseMcpState) === null || _a === void 0 ? void 0 : _a.hiddenDuringTurn;
                    if (!(hidden && hidden.size > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./executor.js'); })];
                case 1:
                    unhideComputerUseApps = (_c.sent()).unhideComputerUseApps;
                    unhide = unhideComputerUseApps(__spreadArray([], hidden, true)).catch(function (err) {
                        return (0, debug_js_1.logForDebugging)("[Computer Use MCP] auto-unhide failed: ".concat((0, errors_js_1.errorMessage)(err)));
                    });
                    timeout = (0, withResolvers_js_1.withResolvers)();
                    timer_1 = setTimeout(timeout.resolve, UNHIDE_TIMEOUT_MS);
                    return [4 /*yield*/, Promise.race([unhide, timeout.promise]).finally(function () {
                            return clearTimeout(timer_1);
                        })];
                case 2:
                    _c.sent();
                    ctx.setAppState(function (prev) {
                        var _a;
                        return ((_a = prev.computerUseMcpState) === null || _a === void 0 ? void 0 : _a.hiddenDuringTurn) === undefined
                            ? prev
                            : __assign(__assign({}, prev), { computerUseMcpState: __assign(__assign({}, prev.computerUseMcpState), { hiddenDuringTurn: undefined }) });
                    });
                    _c.label = 3;
                case 3:
                    // Zero-syscall pre-check so non-CU turns don't touch disk. Release is still
                    // idempotent (returns false if already released or owned by another session).
                    if (!(0, computerUseLock_js_1.isLockHeldLocally)())
                        return [2 /*return*/];
                    // Unregister before lock release so the pump-retain drops as soon as the
                    // CU session ends. Idempotent — no-ops if registration failed at acquire.
                    // Swallow throws so a NAPI unregister error never prevents lock release —
                    // a held lock blocks the next CU session with "in use by another session".
                    try {
                        (0, escHotkey_js_1.unregisterEscHotkey)();
                    }
                    catch (err) {
                        (0, debug_js_1.logForDebugging)("[Computer Use MCP] unregisterEscHotkey failed: ".concat((0, errors_js_1.errorMessage)(err)));
                    }
                    return [4 /*yield*/, (0, computerUseLock_js_1.releaseComputerUseLock)()];
                case 4:
                    if (_c.sent()) {
                        (_b = ctx.sendOSNotification) === null || _b === void 0 ? void 0 : _b.call(ctx, {
                            message: 'Claude is done using your computer',
                            notificationType: 'computer_use_exit',
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
