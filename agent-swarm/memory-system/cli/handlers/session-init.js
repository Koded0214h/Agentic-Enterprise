"use strict";
/**
 * Session Init Handler - UserPromptSubmit
 *
 * Extracted from new-hook.ts - initializes session and starts SDK agent.
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
exports.sessionInitHandler = void 0;
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var project_name_js_1 = require("../../utils/project-name.js");
var logger_js_1 = require("../../utils/logger.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var project_filter_js_1 = require("../../utils/project-filter.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
exports.sessionInitHandler = {
    execute: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, sessionId, cwd, rawPrompt, settings, prompt, project, initResponse, initResult, sessionDbId, promptNumber, cleanedPrompt, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _a.sent();
                        if (!workerReady) {
                            // Worker not available - skip session init gracefully
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        sessionId = input.sessionId, cwd = input.cwd, rawPrompt = input.prompt;
                        // Guard: Codex CLI and other platforms may not provide a session_id (#744)
                        if (!sessionId) {
                            logger_js_1.logger.warn('HOOK', 'session-init: No sessionId provided, skipping (Codex CLI or unknown platform)');
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
                        if (cwd && (0, project_filter_js_1.isProjectExcluded)(cwd, settings.CLAUDE_MEM_EXCLUDED_PROJECTS)) {
                            logger_js_1.logger.info('HOOK', 'Project excluded from tracking', { cwd: cwd });
                            return [2 /*return*/, { continue: true, suppressOutput: true }];
                        }
                        prompt = (!rawPrompt || !rawPrompt.trim()) ? '[media prompt]' : rawPrompt;
                        project = (0, project_name_js_1.getProjectName)(cwd);
                        logger_js_1.logger.debug('HOOK', 'session-init: Calling /api/sessions/init', { contentSessionId: sessionId, project: project });
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/sessions/init', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contentSessionId: sessionId,
                                    project: project,
                                    prompt: prompt
                                })
                            })];
                    case 2:
                        initResponse = _a.sent();
                        if (!initResponse.ok) {
                            // Log but don't throw - a worker 500 should not block the user's prompt
                            logger_js_1.logger.failure('HOOK', "Session initialization failed: ".concat(initResponse.status), { contentSessionId: sessionId, project: project });
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        return [4 /*yield*/, initResponse.json()];
                    case 3:
                        initResult = _a.sent();
                        sessionDbId = initResult.sessionDbId;
                        promptNumber = initResult.promptNumber;
                        logger_js_1.logger.debug('HOOK', 'session-init: Received from /api/sessions/init', { sessionDbId: sessionDbId, promptNumber: promptNumber, skipped: initResult.skipped, contextInjected: initResult.contextInjected });
                        // Debug-level alignment log for detailed tracing
                        logger_js_1.logger.debug('HOOK', "[ALIGNMENT] Hook Entry | contentSessionId=".concat(sessionId, " | prompt#=").concat(promptNumber, " | sessionDbId=").concat(sessionDbId));
                        // Check if prompt was entirely private (worker performs privacy check)
                        if (initResult.skipped && initResult.reason === 'private') {
                            logger_js_1.logger.info('HOOK', "INIT_COMPLETE | sessionDbId=".concat(sessionDbId, " | promptNumber=").concat(promptNumber, " | skipped=true | reason=private"), {
                                sessionId: sessionDbId
                            });
                            return [2 /*return*/, { continue: true, suppressOutput: true }];
                        }
                        // Skip SDK agent re-initialization if context was already injected for this session (#1079)
                        // The prompt was already saved to the database by /api/sessions/init above —
                        // no need to re-start the SDK agent on every turn
                        if (initResult.contextInjected) {
                            logger_js_1.logger.info('HOOK', "INIT_COMPLETE | sessionDbId=".concat(sessionDbId, " | promptNumber=").concat(promptNumber, " | skipped_agent_init=true | reason=context_already_injected"), {
                                sessionId: sessionDbId
                            });
                            return [2 /*return*/, { continue: true, suppressOutput: true }];
                        }
                        if (!(input.platform !== 'cursor' && sessionDbId)) return [3 /*break*/, 5];
                        cleanedPrompt = prompt.startsWith('/') ? prompt.substring(1) : prompt;
                        logger_js_1.logger.debug('HOOK', 'session-init: Calling /sessions/{sessionDbId}/init', { sessionDbId: sessionDbId, promptNumber: promptNumber });
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/sessions/".concat(sessionDbId, "/init"), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userPrompt: cleanedPrompt, promptNumber: promptNumber })
                            })];
                    case 4:
                        response = _a.sent();
                        if (!response.ok) {
                            // Log but don't throw - SDK agent failure should not block the user's prompt
                            logger_js_1.logger.failure('HOOK', "SDK agent start failed: ".concat(response.status), { sessionDbId: sessionDbId, promptNumber: promptNumber });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (input.platform === 'cursor') {
                            logger_js_1.logger.debug('HOOK', 'session-init: Skipping SDK agent init for Cursor platform', { sessionDbId: sessionDbId, promptNumber: promptNumber });
                        }
                        _a.label = 6;
                    case 6:
                        logger_js_1.logger.info('HOOK', "INIT_COMPLETE | sessionDbId=".concat(sessionDbId, " | promptNumber=").concat(promptNumber, " | project=").concat(project), {
                            sessionId: sessionDbId
                        });
                        return [2 /*return*/, { continue: true, suppressOutput: true }];
                }
            });
        });
    }
};
