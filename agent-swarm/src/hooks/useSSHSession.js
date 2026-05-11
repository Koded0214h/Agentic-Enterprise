"use strict";
/**
 * REPL integration hook for `claude ssh` sessions.
 *
 * Sibling to useDirectConnect — same shape (isRemoteMode/sendMessage/
 * cancelRequest/disconnect), same REPL wiring, but drives an SSH child
 * process instead of a WebSocket. Kept separate rather than generalizing
 * useDirectConnect because the lifecycle differs: the ssh process and auth
 * proxy are created BEFORE this hook runs (during startup, in main.tsx) and
 * handed in; useDirectConnect creates its WebSocket inside the effect.
 */
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
exports.useSSHSession = useSSHSession;
var crypto_1 = require("crypto");
var react_1 = require("react");
var remotePermissionBridge_js_1 = require("../remote/remotePermissionBridge.js");
var sdkMessageAdapter_js_1 = require("../remote/sdkMessageAdapter.js");
var Tool_js_1 = require("../Tool.js");
var debug_js_1 = require("../utils/debug.js");
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
function useSSHSession(_a) {
    var _this = this;
    var session = _a.session, setMessages = _a.setMessages, setIsLoading = _a.setIsLoading, setToolUseConfirmQueue = _a.setToolUseConfirmQueue, tools = _a.tools;
    var isRemoteMode = !!session;
    var managerRef = (0, react_1.useRef)(null);
    var hasReceivedInitRef = (0, react_1.useRef)(false);
    var isConnectedRef = (0, react_1.useRef)(false);
    var toolsRef = (0, react_1.useRef)(tools);
    (0, react_1.useEffect)(function () {
        toolsRef.current = tools;
    }, [tools]);
    (0, react_1.useEffect)(function () {
        if (!session)
            return;
        hasReceivedInitRef.current = false;
        (0, debug_js_1.logForDebugging)('[useSSHSession] wiring SSH session manager');
        var manager = session.createManager({
            onMessage: function (sdkMessage) {
                if ((0, sdkMessageAdapter_js_1.isSessionEndMessage)(sdkMessage)) {
                    setIsLoading(false);
                }
                // Skip duplicate init messages (one per turn from stream-json mode).
                if (sdkMessage.type === 'system' && sdkMessage.subtype === 'init') {
                    if (hasReceivedInitRef.current)
                        return;
                    hasReceivedInitRef.current = true;
                }
                var converted = (0, sdkMessageAdapter_js_1.convertSDKMessage)(sdkMessage, {
                    convertToolResults: true,
                });
                if (converted.type === 'message') {
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [converted.message], false); });
                }
            },
            onPermissionRequest: function (request, requestId) {
                var _a, _b, _c;
                (0, debug_js_1.logForDebugging)("[useSSHSession] permission request: ".concat(request.tool_name));
                var tool = (_a = (0, Tool_js_1.findToolByName)(toolsRef.current, request.tool_name)) !== null && _a !== void 0 ? _a : (0, remotePermissionBridge_js_1.createToolStub)(request.tool_name);
                var syntheticMessage = (0, remotePermissionBridge_js_1.createSyntheticAssistantMessage)(request, requestId);
                var permissionResult = {
                    behavior: 'ask',
                    message: (_b = request.description) !== null && _b !== void 0 ? _b : "".concat(request.tool_name, " requires permission"),
                    suggestions: request.permission_suggestions,
                    blockedPath: request.blocked_path,
                };
                var toolUseConfirm = {
                    assistantMessage: syntheticMessage,
                    tool: tool,
                    description: (_c = request.description) !== null && _c !== void 0 ? _c : "".concat(request.tool_name, " requires permission"),
                    input: request.input,
                    toolUseContext: {},
                    toolUseID: request.tool_use_id,
                    permissionResult: permissionResult,
                    permissionPromptStartTimeMs: Date.now(),
                    onUserInteraction: function () { },
                    onAbort: function () {
                        manager.respondToPermissionRequest(requestId, {
                            behavior: 'deny',
                            message: 'User aborted',
                        });
                        setToolUseConfirmQueue(function (q) {
                            return q.filter(function (i) { return i.toolUseID !== request.tool_use_id; });
                        });
                    },
                    onAllow: function (updatedInput) {
                        manager.respondToPermissionRequest(requestId, {
                            behavior: 'allow',
                            updatedInput: updatedInput,
                        });
                        setToolUseConfirmQueue(function (q) {
                            return q.filter(function (i) { return i.toolUseID !== request.tool_use_id; });
                        });
                        setIsLoading(true);
                    },
                    onReject: function (feedback) {
                        manager.respondToPermissionRequest(requestId, {
                            behavior: 'deny',
                            message: feedback !== null && feedback !== void 0 ? feedback : 'User denied permission',
                        });
                        setToolUseConfirmQueue(function (q) {
                            return q.filter(function (i) { return i.toolUseID !== request.tool_use_id; });
                        });
                    },
                    recheckPermission: function () {
                        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/];
                        }); });
                    },
                };
                setToolUseConfirmQueue(function (q) { return __spreadArray(__spreadArray([], q, true), [toolUseConfirm], false); });
                setIsLoading(false);
            },
            onConnected: function () {
                (0, debug_js_1.logForDebugging)('[useSSHSession] connected');
                isConnectedRef.current = true;
            },
            onReconnecting: function (attempt, max) {
                (0, debug_js_1.logForDebugging)("[useSSHSession] ssh dropped, reconnecting (".concat(attempt, "/").concat(max, ")"));
                isConnectedRef.current = false;
                // Surface a transient system message in the transcript so the user
                // knows what's happening — the next onConnected clears the state.
                // Any in-flight request is lost; the remote's --continue reloads
                // history but there's no turn in progress to resume.
                setIsLoading(false);
                var msg = {
                    type: 'system',
                    subtype: 'informational',
                    content: "SSH connection dropped \u2014 reconnecting (attempt ".concat(attempt, "/").concat(max, ")..."),
                    timestamp: new Date().toISOString(),
                    uuid: (0, crypto_1.randomUUID)(),
                    level: 'warning',
                };
                setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [msg], false); });
            },
            onDisconnected: function () {
                (0, debug_js_1.logForDebugging)('[useSSHSession] ssh process exited (giving up)');
                var stderr = session.getStderrTail().trim();
                var connected = isConnectedRef.current;
                var exitCode = session.proc.exitCode;
                isConnectedRef.current = false;
                setIsLoading(false);
                var msg = connected
                    ? 'Remote session ended.'
                    : 'SSH session failed before connecting.';
                // Surface remote stderr if it looks like an error (pre-connect always,
                // post-connect only on nonzero exit — normal --verbose noise otherwise).
                if (stderr && (!connected || exitCode !== 0)) {
                    msg += "\nRemote stderr (exit ".concat(exitCode !== null && exitCode !== void 0 ? exitCode : 'signal ' + session.proc.signalCode, "):\n").concat(stderr);
                }
                void (0, gracefulShutdown_js_1.gracefulShutdown)(1, 'other', { finalMessage: msg });
            },
            onError: function (error) {
                (0, debug_js_1.logForDebugging)("[useSSHSession] error: ".concat(error.message));
            },
        });
        managerRef.current = manager;
        manager.connect();
        return function () {
            (0, debug_js_1.logForDebugging)('[useSSHSession] cleanup');
            manager.disconnect();
            session.proxy.stop();
            managerRef.current = null;
        };
    }, [session, setMessages, setIsLoading, setToolUseConfirmQueue]);
    var sendMessage = (0, react_1.useCallback)(function (content) { return __awaiter(_this, void 0, void 0, function () {
        var m;
        return __generator(this, function (_a) {
            m = managerRef.current;
            if (!m)
                return [2 /*return*/, false];
            setIsLoading(true);
            return [2 /*return*/, m.sendMessage(content)];
        });
    }); }, [setIsLoading]);
    var cancelRequest = (0, react_1.useCallback)(function () {
        var _a;
        (_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.sendInterrupt();
        setIsLoading(false);
    }, [setIsLoading]);
    var disconnect = (0, react_1.useCallback)(function () {
        var _a;
        (_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
        managerRef.current = null;
        isConnectedRef.current = false;
    }, []);
    return (0, react_1.useMemo)(function () { return ({ isRemoteMode: isRemoteMode, sendMessage: sendMessage, cancelRequest: cancelRequest, disconnect: disconnect }); }, [isRemoteMode, sendMessage, cancelRequest, disconnect]);
}
