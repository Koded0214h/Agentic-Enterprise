"use strict";
/**
 * Observation Handler - PostToolUse
 *
 * Extracted from save-hook.ts - sends tool usage to worker for storage.
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
exports.observationHandler = void 0;
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var logger_js_1 = require("../../utils/logger.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var project_filter_js_1 = require("../../utils/project-filter.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
exports.observationHandler = {
    execute: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, sessionId, cwd, toolName, toolInput, toolResponse, toolStr, settings, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _a.sent();
                        if (!workerReady) {
                            // Worker not available - skip observation gracefully
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        sessionId = input.sessionId, cwd = input.cwd, toolName = input.toolName, toolInput = input.toolInput, toolResponse = input.toolResponse;
                        if (!toolName) {
                            // No tool name provided - skip observation gracefully
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        toolStr = logger_js_1.logger.formatTool(toolName, toolInput);
                        logger_js_1.logger.dataIn('HOOK', "PostToolUse: ".concat(toolStr), {});
                        // Validate required fields before sending to worker
                        if (!cwd) {
                            throw new Error("Missing cwd in PostToolUse hook input for session ".concat(sessionId, ", tool ").concat(toolName));
                        }
                        settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
                        if ((0, project_filter_js_1.isProjectExcluded)(cwd, settings.CLAUDE_MEM_EXCLUDED_PROJECTS)) {
                            logger_js_1.logger.debug('HOOK', 'Project excluded from tracking, skipping observation', { cwd: cwd, toolName: toolName });
                            return [2 /*return*/, { continue: true, suppressOutput: true }];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/sessions/observations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contentSessionId: sessionId,
                                    tool_name: toolName,
                                    tool_input: toolInput,
                                    tool_response: toolResponse,
                                    cwd: cwd
                                })
                            })];
                    case 3:
                        response = _a.sent();
                        if (!response.ok) {
                            // Log but don't throw — observation storage failure should not block tool use
                            logger_js_1.logger.warn('HOOK', 'Observation storage failed, skipping', { status: response.status, toolName: toolName });
                            return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                        }
                        logger_js_1.logger.debug('HOOK', 'Observation sent successfully', { toolName: toolName });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        // Worker unreachable — skip observation gracefully
                        logger_js_1.logger.warn('HOOK', 'Observation fetch error, skipping', { error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                    case 5: return [2 /*return*/, { continue: true, suppressOutput: true }];
                }
            });
        });
    }
};
