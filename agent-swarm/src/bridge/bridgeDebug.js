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
exports.registerBridgeDebugHandle = registerBridgeDebugHandle;
exports.clearBridgeDebugHandle = clearBridgeDebugHandle;
exports.getBridgeDebugHandle = getBridgeDebugHandle;
exports.injectBridgeFault = injectBridgeFault;
exports.wrapApiForFaultInjection = wrapApiForFaultInjection;
var debug_js_1 = require("../utils/debug.js");
var bridgeApi_js_1 = require("./bridgeApi.js");
var debugHandle = null;
var faultQueue = [];
function registerBridgeDebugHandle(h) {
    debugHandle = h;
}
function clearBridgeDebugHandle() {
    debugHandle = null;
    faultQueue.length = 0;
}
function getBridgeDebugHandle() {
    return debugHandle;
}
function injectBridgeFault(fault) {
    faultQueue.push(fault);
    (0, debug_js_1.logForDebugging)("[bridge:debug] Queued fault: ".concat(fault.method, " ").concat(fault.kind, "/").concat(fault.status).concat(fault.errorType ? "/".concat(fault.errorType) : '', " \u00D7").concat(fault.count));
}
/**
 * Wrap a BridgeApiClient so each call first checks the fault queue. If a
 * matching fault is queued, throw the specified error instead of calling
 * through. Delegates everything else to the real client.
 *
 * Only called when USER_TYPE === 'ant' — zero overhead in external builds.
 */
function wrapApiForFaultInjection(api) {
    function consume(method) {
        var idx = faultQueue.findIndex(function (f) { return f.method === method; });
        if (idx === -1)
            return null;
        var fault = faultQueue[idx];
        fault.count--;
        if (fault.count <= 0)
            faultQueue.splice(idx, 1);
        return fault;
    }
    function throwFault(fault, context) {
        var _a;
        (0, debug_js_1.logForDebugging)("[bridge:debug] Injecting ".concat(fault.kind, " fault into ").concat(context, ": status=").concat(fault.status, " errorType=").concat((_a = fault.errorType) !== null && _a !== void 0 ? _a : 'none'));
        if (fault.kind === 'fatal') {
            throw new bridgeApi_js_1.BridgeFatalError("[injected] ".concat(context, " ").concat(fault.status), fault.status, fault.errorType);
        }
        // Transient: mimic an axios rejection (5xx / network). No .status on
        // the error itself — that's how the catch blocks distinguish.
        throw new Error("[injected transient] ".concat(context, " ").concat(fault.status));
    }
    return __assign(__assign({}, api), { pollForWork: function (envId, secret, signal, reclaimMs) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    f = consume('pollForWork');
                    if (f)
                        throwFault(f, 'Poll');
                    return [2 /*return*/, api.pollForWork(envId, secret, signal, reclaimMs)];
                });
            });
        }, registerBridgeEnvironment: function (config) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    f = consume('registerBridgeEnvironment');
                    if (f)
                        throwFault(f, 'Registration');
                    return [2 /*return*/, api.registerBridgeEnvironment(config)];
                });
            });
        }, reconnectSession: function (envId, sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    f = consume('reconnectSession');
                    if (f)
                        throwFault(f, 'ReconnectSession');
                    return [2 /*return*/, api.reconnectSession(envId, sessionId)];
                });
            });
        }, heartbeatWork: function (envId, workId, token) {
            return __awaiter(this, void 0, void 0, function () {
                var f;
                return __generator(this, function (_a) {
                    f = consume('heartbeatWork');
                    if (f)
                        throwFault(f, 'Heartbeat');
                    return [2 /*return*/, api.heartbeatWork(envId, workId, token)];
                });
            });
        } });
}
