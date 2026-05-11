"use strict";
/**
 * Summarize Handler - Stop
 *
 * Extracted from summary-hook.ts - sends summary request to worker.
 * Transcript parsing stays in the hook because only the hook has access to
 * the transcript file path.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeHandler = void 0;
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var logger_js_1 = require("../../utils/logger.js");
var transcript_parser_js_1 = require("../../shared/transcript-parser.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var SUMMARIZE_TIMEOUT_MS = (0, hook_constants_js_1.getTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.DEFAULT);
exports.summarizeHandler = {
    execute: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, sessionId, transcriptPath, lastAssistantMessage, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _a.sent();
                        if (!workerReady) {
                            // Worker not available - skip summary gracefully
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        sessionId = input.sessionId, transcriptPath = input.transcriptPath;
                        // Validate required fields before processing
                        if (!transcriptPath) {
                            // No transcript available - skip summary gracefully (not an error)
                            logger_js_1.logger.debug('HOOK', "No transcriptPath in Stop hook input for session ".concat(sessionId, " - skipping summary"));
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        lastAssistantMessage = '';
                        try {
                            lastAssistantMessage = (0, transcript_parser_js_1.extractLastMessage)(transcriptPath, 'assistant', true);
                        }
                        catch (err) {
                            logger_js_1.logger.warn('HOOK', "Stop hook: failed to extract last assistant message for session ".concat(sessionId, ": ").concat(err instanceof Error ? err.message : err));
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        logger_js_1.logger.dataIn('HOOK', 'Stop: Requesting summary', {
                            hasLastAssistantMessage: !!lastAssistantMessage
                        });
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/sessions/summarize', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contentSessionId: sessionId,
                                    last_assistant_message: lastAssistantMessage
                                }),
                                timeoutMs: SUMMARIZE_TIMEOUT_MS
                            })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            // Return standard response even on failure (matches original behavior)
                            return [2 /*return*/, { continue: true, suppressOutput: true }];
                        }
                        logger_js_1.logger.debug('HOOK', 'Summary request sent successfully');
                        return [2 /*return*/, { continue: true, suppressOutput: true }];
                }
            });
        });
    }
};
