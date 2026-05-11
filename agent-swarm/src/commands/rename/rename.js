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
exports.call = call;
var state_js_1 = require("../../bootstrap/state.js");
var bridgeConfig_js_1 = require("../../bridge/bridgeConfig.js");
var messages_js_1 = require("../../utils/messages.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var teammate_js_1 = require("../../utils/teammate.js");
var generateSessionName_js_1 = require("./generateSessionName.js");
function call(onDone, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var newName, generated, sessionId, fullPath, appState, bridgeSessionId, tokenOverride_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Prevent teammates from renaming - their names are set by team leader
                    if ((0, teammate_js_1.isTeammate)()) {
                        onDone('Cannot rename: This session is a swarm teammate. Teammate names are set by the team leader.', { display: 'system' });
                        return [2 /*return*/, null];
                    }
                    if (!(!args || args.trim() === '')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, generateSessionName_js_1.generateSessionName)((0, messages_js_1.getMessagesAfterCompactBoundary)(context.messages), context.abortController.signal)];
                case 1:
                    generated = _a.sent();
                    if (!generated) {
                        onDone('Could not generate a name: no conversation context yet. Usage: /rename <name>', { display: 'system' });
                        return [2 /*return*/, null];
                    }
                    newName = generated;
                    return [3 /*break*/, 3];
                case 2:
                    newName = args.trim();
                    _a.label = 3;
                case 3:
                    sessionId = (0, state_js_1.getSessionId)();
                    fullPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    // Always save the custom title (session name)
                    return [4 /*yield*/, (0, sessionStorage_js_1.saveCustomTitle)(sessionId, newName, fullPath)
                        // Sync title to bridge session on claude.ai/code (best-effort, non-blocking).
                        // v2 env-less bridge stores cse_* in replBridgeSessionId —
                        // updateBridgeSessionTitle retags internally for the compat endpoint.
                    ];
                case 4:
                    // Always save the custom title (session name)
                    _a.sent();
                    appState = context.getAppState();
                    bridgeSessionId = appState.replBridgeSessionId;
                    if (bridgeSessionId) {
                        tokenOverride_1 = (0, bridgeConfig_js_1.getBridgeTokenOverride)();
                        void Promise.resolve().then(function () { return require('../../bridge/createSession.js'); }).then(function (_a) {
                            var updateBridgeSessionTitle = _a.updateBridgeSessionTitle;
                            return updateBridgeSessionTitle(bridgeSessionId, newName, {
                                baseUrl: (0, bridgeConfig_js_1.getBridgeBaseUrlOverride)(),
                                getAccessToken: tokenOverride_1 ? function () { return tokenOverride_1; } : undefined,
                            }).catch(function () { });
                        });
                    }
                    // Also persist as the session's agent name for prompt-bar display
                    return [4 /*yield*/, (0, sessionStorage_js_1.saveAgentName)(sessionId, newName, fullPath)];
                case 5:
                    // Also persist as the session's agent name for prompt-bar display
                    _a.sent();
                    context.setAppState(function (prev) { return (__assign(__assign({}, prev), { standaloneAgentContext: __assign(__assign({}, prev.standaloneAgentContext), { name: newName }) })); });
                    onDone("Session renamed to: ".concat(newName), { display: 'system' });
                    return [2 /*return*/, null];
            }
        });
    });
}
