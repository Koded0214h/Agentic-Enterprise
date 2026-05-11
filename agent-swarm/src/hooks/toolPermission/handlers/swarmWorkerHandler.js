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
exports.handleSwarmWorkerPermission = handleSwarmWorkerPermission;
var bun_bundle_1 = require("bun:bundle");
var agentSwarmsEnabled_js_1 = require("../../../utils/agentSwarmsEnabled.js");
var errors_js_1 = require("../../../utils/errors.js");
var log_js_1 = require("../../../utils/log.js");
var permissionSync_js_1 = require("../../../utils/swarm/permissionSync.js");
var useSwarmPermissionPoller_js_1 = require("../../useSwarmPermissionPoller.js");
var PermissionContext_js_1 = require("../PermissionContext.js");
/**
 * Handles the swarm worker permission flow.
 *
 * When running as a swarm worker:
 * 1. Tries classifier auto-approval for bash commands
 * 2. Forwards the permission request to the leader via mailbox
 * 3. Registers callbacks for when the leader responds
 * 4. Sets the pending indicator while waiting
 *
 * Returns a PermissionDecision if the classifier auto-approves,
 * or a Promise that resolves when the leader responds.
 * Returns null if swarms are not enabled or this is not a swarm worker,
 * so the caller can fall through to interactive handling.
 */
function handleSwarmWorkerPermission(params) {
    return __awaiter(this, void 0, void 0, function () {
        var ctx, description, updatedInput, suggestions, classifierResult, _a, clearPendingRequest_1, decision, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)() || !(0, permissionSync_js_1.isSwarmWorker)()) {
                        return [2 /*return*/, null];
                    }
                    ctx = params.ctx, description = params.description, updatedInput = params.updatedInput, suggestions = params.suggestions;
                    if (!(0, bun_bundle_1.feature)('BASH_CLASSIFIER')) return [3 /*break*/, 2];
                    return [4 /*yield*/, ((_b = ctx.tryClassifier) === null || _b === void 0 ? void 0 : _b.call(ctx, params.pendingClassifierCheck, updatedInput))];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = null;
                    _c.label = 3;
                case 3:
                    classifierResult = _a;
                    if (classifierResult) {
                        return [2 /*return*/, classifierResult];
                    }
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    clearPendingRequest_1 = function () {
                        return ctx.toolUseContext.setAppState(function (prev) { return (__assign(__assign({}, prev), { pendingWorkerRequest: null })); });
                    };
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var _a = (0, PermissionContext_js_1.createResolveOnce)(resolve), resolveOnce = _a.resolve, claim = _a.claim;
                            // Create the permission request
                            var request = (0, permissionSync_js_1.createPermissionRequest)({
                                toolName: ctx.tool.name,
                                toolUseId: ctx.toolUseID,
                                input: ctx.input,
                                description: description,
                                permissionSuggestions: suggestions,
                            });
                            // Register callback BEFORE sending the request to avoid race condition
                            // where leader responds before callback is registered
                            (0, useSwarmPermissionPoller_js_1.registerPermissionCallback)({
                                requestId: request.id,
                                toolUseId: ctx.toolUseID,
                                onAllow: function (allowedInput, permissionUpdates, feedback, contentBlocks) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var finalInput, _a;
                                        return __generator(this, function (_b) {
                                            switch (_b.label) {
                                                case 0:
                                                    if (!claim())
                                                        return [2 /*return*/]; // atomic check-and-mark before await
                                                    clearPendingRequest_1();
                                                    finalInput = allowedInput && Object.keys(allowedInput).length > 0
                                                        ? allowedInput
                                                        : ctx.input;
                                                    _a = resolveOnce;
                                                    return [4 /*yield*/, ctx.handleUserAllow(finalInput, permissionUpdates, feedback, undefined, contentBlocks)];
                                                case 1:
                                                    _a.apply(void 0, [_b.sent()]);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    });
                                },
                                onReject: function (feedback, contentBlocks) {
                                    if (!claim())
                                        return;
                                    clearPendingRequest_1();
                                    ctx.logDecision({
                                        decision: 'reject',
                                        source: { type: 'user_reject', hasFeedback: !!feedback },
                                    });
                                    resolveOnce(ctx.cancelAndAbort(feedback, undefined, contentBlocks));
                                },
                            });
                            // Now that callback is registered, send the request to the leader
                            void (0, permissionSync_js_1.sendPermissionRequestViaMailbox)(request);
                            // Show visual indicator that we're waiting for leader approval
                            ctx.toolUseContext.setAppState(function (prev) { return (__assign(__assign({}, prev), { pendingWorkerRequest: {
                                    toolName: ctx.tool.name,
                                    toolUseId: ctx.toolUseID,
                                    description: description,
                                } })); });
                            // If the abort signal fires while waiting for the leader response,
                            // resolve the promise with a cancel decision so it does not hang.
                            ctx.toolUseContext.abortController.signal.addEventListener('abort', function () {
                                if (!claim())
                                    return;
                                clearPendingRequest_1();
                                ctx.logCancelled();
                                resolveOnce(ctx.cancelAndAbort(undefined, true));
                            }, { once: true });
                        })];
                case 5:
                    decision = _c.sent();
                    return [2 /*return*/, decision];
                case 6:
                    error_1 = _c.sent();
                    // If swarm permission submission fails, fall back to local handling
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    // Continue to local UI handling below
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
}
