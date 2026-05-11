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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.getLastApiRequests = getLastApiRequests;
exports.clearApiRequestCache = clearApiRequestCache;
exports.clearDumpState = clearDumpState;
exports.clearAllDumpState = clearAllDumpState;
exports.addApiRequestToCache = addApiRequestToCache;
exports.getDumpPromptsPath = getDumpPromptsPath;
exports.createDumpPromptsFetch = createDumpPromptsFetch;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var path_1 = require("path");
var state_js_1 = require("src/bootstrap/state.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
function hashString(str) {
    return (0, crypto_1.createHash)('sha256').update(str).digest('hex');
}
// Cache last few API requests for ant users (e.g., for /issue command)
var MAX_CACHED_REQUESTS = 5;
var cachedApiRequests = [];
// Track state per session to avoid duplicating data
var dumpState = new Map();
function getLastApiRequests() {
    return __spreadArray([], cachedApiRequests, true);
}
function clearApiRequestCache() {
    cachedApiRequests.length = 0;
}
function clearDumpState(agentIdOrSessionId) {
    dumpState.delete(agentIdOrSessionId);
}
function clearAllDumpState() {
    dumpState.clear();
}
function addApiRequestToCache(requestData) {
    if (process.env.USER_TYPE !== 'ant')
        return;
    cachedApiRequests.push({
        timestamp: new Date().toISOString(),
        request: requestData,
    });
    if (cachedApiRequests.length > MAX_CACHED_REQUESTS) {
        cachedApiRequests.shift();
    }
}
function getDumpPromptsPath(agentIdOrSessionId) {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'dump-prompts', "".concat(agentIdOrSessionId !== null && agentIdOrSessionId !== void 0 ? agentIdOrSessionId : (0, state_js_1.getSessionId)(), ".jsonl"));
}
function appendToFile(filePath, entries) {
    if (entries.length === 0)
        return;
    fs_1.promises.mkdir((0, path_1.dirname)(filePath), { recursive: true })
        .then(function () { return fs_1.promises.appendFile(filePath, entries.join('\n') + '\n'); })
        .catch(function () { });
}
function initFingerprint(req) {
    var _a;
    var tools = req.tools;
    var system = req.system;
    var sysLen = typeof system === 'string'
        ? system.length
        : Array.isArray(system)
            ? system.reduce(function (n, b) { var _a, _b; return n + ((_b = (_a = b.text) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0); }, 0)
            : 0;
    var toolNames = (_a = tools === null || tools === void 0 ? void 0 : tools.map(function (t) { var _a; return (_a = t.name) !== null && _a !== void 0 ? _a : ''; }).join(',')) !== null && _a !== void 0 ? _a : '';
    return "".concat(req.model, "|").concat(toolNames, "|").concat(sysLen);
}
function dumpRequest(body, ts, state, filePath) {
    var _a;
    try {
        var req = (0, slowOperations_js_1.jsonParse)(body);
        addApiRequestToCache(req);
        if (process.env.USER_TYPE !== 'ant')
            return;
        var entries = [];
        var messages = ((_a = req.messages) !== null && _a !== void 0 ? _a : []);
        // Write init data (system, tools, metadata) on first request,
        // and a system_update entry whenever it changes.
        // Cheap fingerprint first: system+tools don't change between turns,
        // so skip the 300ms stringify when the shape is unchanged.
        var fingerprint = initFingerprint(req);
        if (!state.initialized || fingerprint !== state.lastInitFingerprint) {
            var _1 = req.messages, initData = __rest(req, ["messages"]);
            var initDataStr = (0, slowOperations_js_1.jsonStringify)(initData);
            var initDataHash = hashString(initDataStr);
            state.lastInitFingerprint = fingerprint;
            if (!state.initialized) {
                state.initialized = true;
                state.lastInitDataHash = initDataHash;
                // Reuse initDataStr rather than re-serializing initData inside a wrapper.
                // timestamp from toISOString() contains no chars needing JSON escaping.
                entries.push("{\"type\":\"init\",\"timestamp\":\"".concat(ts, "\",\"data\":").concat(initDataStr, "}"));
            }
            else if (initDataHash !== state.lastInitDataHash) {
                state.lastInitDataHash = initDataHash;
                entries.push("{\"type\":\"system_update\",\"timestamp\":\"".concat(ts, "\",\"data\":").concat(initDataStr, "}"));
            }
        }
        // Write only new user messages (assistant messages captured in response)
        for (var _i = 0, _b = messages.slice(state.messageCountSeen); _i < _b.length; _i++) {
            var msg = _b[_i];
            if (msg.role === 'user') {
                entries.push((0, slowOperations_js_1.jsonStringify)({ type: 'message', timestamp: ts, data: msg }));
            }
        }
        state.messageCountSeen = messages.length;
        appendToFile(filePath, entries);
    }
    catch (_c) {
        // Ignore parsing errors
    }
}
function createDumpPromptsFetch(agentIdOrSessionId) {
    var _this = this;
    var filePath = getDumpPromptsPath(agentIdOrSessionId);
    return function (input, init) { return __awaiter(_this, void 0, void 0, function () {
        var state, timestamp, response, cloned_1;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = (_a = dumpState.get(agentIdOrSessionId)) !== null && _a !== void 0 ? _a : {
                        initialized: false,
                        messageCountSeen: 0,
                        lastInitDataHash: '',
                        lastInitFingerprint: '',
                    };
                    dumpState.set(agentIdOrSessionId, state);
                    if ((init === null || init === void 0 ? void 0 : init.method) === 'POST' && init.body) {
                        timestamp = new Date().toISOString();
                        // Parsing + stringifying the request (system prompt + tool schemas = MBs)
                        // takes hundreds of ms. Defer so it doesn't block the actual API call —
                        // this is debug tooling for /issue, not on the critical path.
                        setImmediate(dumpRequest, init.body, timestamp, state, filePath);
                    }
                    return [4 /*yield*/, globalThis.fetch(input, init)
                        // Save response async
                    ];
                case 1:
                    response = _b.sent();
                    // Save response async
                    if (timestamp && response.ok && process.env.USER_TYPE === 'ant') {
                        cloned_1 = response.clone();
                        void (function () { return __awaiter(_this, void 0, void 0, function () {
                            var isStreaming, data, reader, decoder, buffer, _a, done, value, chunks, _i, _b, event_1, _c, _d, line, _e;
                            var _f;
                            return __generator(this, function (_g) {
                                switch (_g.label) {
                                    case 0:
                                        _g.trys.push([0, 11, , 12]);
                                        isStreaming = (_f = cloned_1.headers
                                            .get('content-type')) === null || _f === void 0 ? void 0 : _f.includes('text/event-stream');
                                        data = void 0;
                                        if (!(isStreaming && cloned_1.body)) return [3 /*break*/, 7];
                                        reader = cloned_1.body.getReader();
                                        decoder = new TextDecoder();
                                        buffer = '';
                                        _g.label = 1;
                                    case 1:
                                        _g.trys.push([1, , 5, 6]);
                                        _g.label = 2;
                                    case 2:
                                        if (!true) return [3 /*break*/, 4];
                                        return [4 /*yield*/, reader.read()];
                                    case 3:
                                        _a = _g.sent(), done = _a.done, value = _a.value;
                                        if (done)
                                            return [3 /*break*/, 4];
                                        buffer += decoder.decode(value, { stream: true });
                                        return [3 /*break*/, 2];
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        reader.releaseLock();
                                        return [7 /*endfinally*/];
                                    case 6:
                                        chunks = [];
                                        for (_i = 0, _b = buffer.split('\n\n'); _i < _b.length; _i++) {
                                            event_1 = _b[_i];
                                            for (_c = 0, _d = event_1.split('\n'); _c < _d.length; _c++) {
                                                line = _d[_c];
                                                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                                                    try {
                                                        chunks.push((0, slowOperations_js_1.jsonParse)(line.slice(6)));
                                                    }
                                                    catch (_h) {
                                                        // Ignore parse errors
                                                    }
                                                }
                                            }
                                        }
                                        data = { stream: true, chunks: chunks };
                                        return [3 /*break*/, 9];
                                    case 7: return [4 /*yield*/, cloned_1.json()];
                                    case 8:
                                        data = _g.sent();
                                        _g.label = 9;
                                    case 9: return [4 /*yield*/, fs_1.promises.appendFile(filePath, (0, slowOperations_js_1.jsonStringify)({ type: 'response', timestamp: timestamp, data: data }) + '\n')];
                                    case 10:
                                        _g.sent();
                                        return [3 /*break*/, 12];
                                    case 11:
                                        _e = _g.sent();
                                        return [3 /*break*/, 12];
                                    case 12: return [2 /*return*/];
                                }
                            });
                        }); })();
                    }
                    return [2 /*return*/, response];
            }
        });
    }); };
}
