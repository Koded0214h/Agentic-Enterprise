"use strict";
/**
 * Context Handler - SessionStart
 *
 * Extracted from context-hook.ts - calls worker to generate context.
 * Returns context as hookSpecificOutput for Claude Code to inject.
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
exports.contextHandler = void 0;
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var project_name_js_1 = require("../../utils/project-name.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var logger_js_1 = require("../../utils/logger.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
exports.contextHandler = {
    execute: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var workerReady, cwd, context, port, settings, showTerminalOutput, projectsParam, apiPath, colorApiPath, _a, response, colorResponse, _b, contextResult, colorResult, additionalContext, coloredTimeline, platform, displayContent, systemMessage, error_1;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, (0, worker_utils_js_1.ensureWorkerRunning)()];
                    case 1:
                        workerReady = _d.sent();
                        if (!workerReady) {
                            // Worker not available - return empty context gracefully
                            return [2 /*return*/, {
                                    hookSpecificOutput: {
                                        hookEventName: 'SessionStart',
                                        additionalContext: ''
                                    },
                                    exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS
                                }];
                        }
                        cwd = (_c = input.cwd) !== null && _c !== void 0 ? _c : process.cwd();
                        context = (0, project_name_js_1.getProjectContext)(cwd);
                        port = (0, worker_utils_js_1.getWorkerPort)();
                        settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
                        showTerminalOutput = settings.CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT === 'true';
                        projectsParam = context.allProjects.join(',');
                        apiPath = "/api/context/inject?projects=".concat(encodeURIComponent(projectsParam));
                        colorApiPath = "".concat(apiPath, "&colors=true");
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, Promise.all([
                                (0, worker_utils_js_1.workerHttpRequest)(apiPath),
                                showTerminalOutput ? (0, worker_utils_js_1.workerHttpRequest)(colorApiPath).catch(function () { return null; }) : Promise.resolve(null)
                            ])];
                    case 3:
                        _a = _d.sent(), response = _a[0], colorResponse = _a[1];
                        if (!response.ok) {
                            // Log but don't throw — context fetch failure should not block session start
                            logger_js_1.logger.warn('HOOK', 'Context generation failed, returning empty', { status: response.status });
                            return [2 /*return*/, {
                                    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: '' },
                                    exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS
                                }];
                        }
                        return [4 /*yield*/, Promise.all([
                                response.text(),
                                (colorResponse === null || colorResponse === void 0 ? void 0 : colorResponse.ok) ? colorResponse.text() : Promise.resolve('')
                            ])];
                    case 4:
                        _b = _d.sent(), contextResult = _b[0], colorResult = _b[1];
                        additionalContext = contextResult.trim();
                        coloredTimeline = colorResult.trim();
                        platform = input.platform;
                        displayContent = coloredTimeline || (platform === 'gemini-cli' || platform === 'gemini' ? additionalContext : '');
                        systemMessage = showTerminalOutput && displayContent
                            ? "".concat(displayContent, "\n\nView Observations Live @ http://localhost:").concat(port)
                            : undefined;
                        return [2 /*return*/, {
                                hookSpecificOutput: {
                                    hookEventName: 'SessionStart',
                                    additionalContext: additionalContext
                                },
                                systemMessage: systemMessage
                            }];
                    case 5:
                        error_1 = _d.sent();
                        // Worker unreachable — return empty context gracefully
                        logger_js_1.logger.warn('HOOK', 'Context fetch error, returning empty', { error: error_1 instanceof Error ? error_1.message : String(error_1) });
                        return [2 /*return*/, {
                                hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: '' },
                                exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
};
