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
exports.submitTranscriptShare = submitTranscriptShare;
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
var auth_js_1 = require("../../utils/auth.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var http_js_1 = require("../../utils/http.js");
var messages_js_1 = require("../../utils/messages.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var Feedback_js_1 = require("../Feedback.js");
function submitTranscriptShare(messages, trigger, appearanceId) {
    return __awaiter(this, void 0, void 0, function () {
        var transcript, agentIds, subagentTranscripts, rawTranscriptJsonl, transcriptPath, size, _a, data, content, authResult, headers, response, result, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 11, , 12]);
                    (0, debug_js_1.logForDebugging)('Collecting transcript for sharing', { level: 'info' });
                    transcript = (0, messages_js_1.normalizeMessagesForAPI)(messages);
                    agentIds = (0, sessionStorage_js_1.extractAgentIdsFromMessages)(messages);
                    return [4 /*yield*/, (0, sessionStorage_js_1.loadSubagentTranscripts)(agentIds)
                        // Read raw JSONL transcript (with size guard to prevent OOM)
                    ];
                case 1:
                    subagentTranscripts = _b.sent();
                    rawTranscriptJsonl = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    transcriptPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    return [4 /*yield*/, (0, promises_1.stat)(transcriptPath)];
                case 3:
                    size = (_b.sent()).size;
                    if (!(size <= sessionStorage_js_1.MAX_TRANSCRIPT_READ_BYTES)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.readFile)(transcriptPath, 'utf-8')];
                case 4:
                    rawTranscriptJsonl = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    (0, debug_js_1.logForDebugging)("Skipping raw transcript read: file too large (".concat(size, " bytes)"), { level: 'warn' });
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    _a = _b.sent();
                    return [3 /*break*/, 8];
                case 8:
                    data = {
                        trigger: trigger,
                        version: MACRO.VERSION,
                        platform: process.platform,
                        transcript: transcript,
                        subagentTranscripts: Object.keys(subagentTranscripts).length > 0
                            ? subagentTranscripts
                            : undefined,
                        rawTranscriptJsonl: rawTranscriptJsonl,
                    };
                    content = (0, Feedback_js_1.redactSensitiveInfo)((0, slowOperations_js_1.jsonStringify)(data));
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 9:
                    _b.sent();
                    authResult = (0, http_js_1.getAuthHeaders)();
                    if (authResult.error) {
                        return [2 /*return*/, { success: false }];
                    }
                    headers = __assign({ 'Content-Type': 'application/json', 'User-Agent': (0, http_js_1.getUserAgent)() }, authResult.headers);
                    return [4 /*yield*/, axios_1.default.post('https://api.anthropic.com/api/claude_code_shared_session_transcripts', { content: content, appearance_id: appearanceId }, {
                            headers: headers,
                            timeout: 30000,
                        })];
                case 10:
                    response = _b.sent();
                    if (response.status === 200 || response.status === 201) {
                        result = response.data;
                        (0, debug_js_1.logForDebugging)('Transcript shared successfully', { level: 'info' });
                        return [2 /*return*/, {
                                success: true,
                                transcriptId: result === null || result === void 0 ? void 0 : result.transcript_id,
                            }];
                    }
                    return [2 /*return*/, { success: false }];
                case 11:
                    err_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)((0, errors_js_1.errorMessage)(err_1), {
                        level: 'error',
                    });
                    return [2 /*return*/, { success: false }];
                case 12: return [2 /*return*/];
            }
        });
    });
}
