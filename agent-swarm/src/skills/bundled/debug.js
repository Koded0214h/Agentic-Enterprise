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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDebugSkill = registerDebugSkill;
var promises_1 = require("fs/promises");
var claudeCodeGuideAgent_js_1 = require("src/tools/AgentTool/built-in/claudeCodeGuideAgent.js");
var settings_js_1 = require("src/utils/settings/settings.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var format_js_1 = require("../../utils/format.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var DEFAULT_DEBUG_LINES_READ = 20;
var TAIL_READ_BYTES = 64 * 1024;
function registerDebugSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'debug',
        description: process.env.USER_TYPE === 'ant'
            ? 'Debug your current Claude Code session by reading the session debug log. Includes all event logging'
            : 'Enable debug logging for this session and help diagnose issues',
        allowedTools: ['Read', 'Grep', 'Glob'],
        argumentHint: '[issue description]',
        // disableModelInvocation so that the user has to explicitly request it in
        // interactive mode and so the description does not take up context.
        disableModelInvocation: true,
        userInvocable: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var wasAlreadyLogging, debugLogPath, logInfo, stats, readSize, startOffset, fd, _a, buffer, bytesRead, tail, e_1, justEnabledSection, prompt;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            wasAlreadyLogging = (0, debug_js_1.enableDebugLogging)();
                            debugLogPath = (0, debug_js_1.getDebugLogPath)();
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 9, , 10]);
                            return [4 /*yield*/, (0, promises_1.stat)(debugLogPath)];
                        case 2:
                            stats = _b.sent();
                            readSize = Math.min(stats.size, TAIL_READ_BYTES);
                            startOffset = stats.size - readSize;
                            return [4 /*yield*/, (0, promises_1.open)(debugLogPath, 'r')];
                        case 3:
                            fd = _b.sent();
                            _b.label = 4;
                        case 4:
                            _b.trys.push([4, , 6, 8]);
                            return [4 /*yield*/, fd.read({
                                    buffer: Buffer.alloc(readSize),
                                    position: startOffset,
                                })];
                        case 5:
                            _a = _b.sent(), buffer = _a.buffer, bytesRead = _a.bytesRead;
                            tail = buffer
                                .toString('utf-8', 0, bytesRead)
                                .split('\n')
                                .slice(-DEFAULT_DEBUG_LINES_READ)
                                .join('\n');
                            logInfo = "Log size: ".concat((0, format_js_1.formatFileSize)(stats.size), "\n\n### Last ").concat(DEFAULT_DEBUG_LINES_READ, " lines\n\n```\n").concat(tail, "\n```");
                            return [3 /*break*/, 8];
                        case 6: return [4 /*yield*/, fd.close()];
                        case 7:
                            _b.sent();
                            return [7 /*endfinally*/];
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            e_1 = _b.sent();
                            logInfo = (0, errors_js_1.isENOENT)(e_1)
                                ? 'No debug log exists yet — logging was just enabled.'
                                : "Failed to read last ".concat(DEFAULT_DEBUG_LINES_READ, " lines of debug log: ").concat((0, errors_js_1.errorMessage)(e_1));
                            return [3 /*break*/, 10];
                        case 10:
                            justEnabledSection = wasAlreadyLogging
                                ? ''
                                : "\n## Debug Logging Just Enabled\n\nDebug logging was OFF for this session until now. Nothing prior to this /debug invocation was captured.\n\nTell the user that debug logging is now active at `".concat(debugLogPath, "`, ask them to reproduce the issue, then re-read the log. If they can't reproduce, they can also restart with `claude --debug` to capture logs from startup.\n");
                            prompt = "# Debug Skill\n\nHelp the user debug an issue they're encountering in this current Claude Code session.\n".concat(justEnabledSection, "\n## Session Debug Log\n\nThe debug log for the current session is at: `").concat(debugLogPath, "`\n\n").concat(logInfo, "\n\nFor additional context, grep for [ERROR] and [WARN] lines across the full file.\n\n## Issue Description\n\n").concat(args || 'The user did not describe a specific issue. Read the debug log and summarize any errors, warnings, or notable issues.', "\n\n## Settings\n\nRemember that settings are in:\n* user - ").concat((0, settings_js_1.getSettingsFilePathForSource)('userSettings'), "\n* project - ").concat((0, settings_js_1.getSettingsFilePathForSource)('projectSettings'), "\n* local - ").concat((0, settings_js_1.getSettingsFilePathForSource)('localSettings'), "\n\n## Instructions\n\n1. Review the user's issue description\n2. The last ").concat(DEFAULT_DEBUG_LINES_READ, " lines show the debug file format. Look for [ERROR] and [WARN] entries, stack traces, and failure patterns across the file\n3. Consider launching the ").concat(claudeCodeGuideAgent_js_1.CLAUDE_CODE_GUIDE_AGENT_TYPE, " subagent to understand the relevant Claude Code features\n4. Explain what you found in plain language\n5. Suggest concrete fixes or next steps\n");
                            return [2 /*return*/, [{ type: 'text', text: prompt }]];
                    }
                });
            });
        },
    });
}
