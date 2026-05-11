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
exports.initSkillImprovement = initSkillImprovement;
exports.applySkillImprovement = applySkillImprovement;
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var claude_js_1 = require("../../services/api/claude.js");
var Tool_js_1 = require("../../Tool.js");
var abortController_js_1 = require("../abortController.js");
var array_js_1 = require("../array.js");
var cwd_js_1 = require("../cwd.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var messages_js_1 = require("../messages.js");
var model_js_1 = require("../model/model.js");
var slowOperations_js_1 = require("../slowOperations.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
var apiQueryHookHelper_js_1 = require("./apiQueryHookHelper.js");
var postSamplingHooks_js_1 = require("./postSamplingHooks.js");
var TURN_BATCH_SIZE = 5;
function formatRecentMessages(messages) {
    return messages
        .filter(function (m) { return m.type === 'user' || m.type === 'assistant'; })
        .map(function (m) {
        var role = m.type === 'user' ? 'User' : 'Assistant';
        var content = m.message.content;
        if (typeof content === 'string')
            return "".concat(role, ": ").concat(content.slice(0, 500));
        var text = content
            .filter(function (b) { return b.type === 'text'; })
            .map(function (b) { return b.text; })
            .join('\n');
        return "".concat(role, ": ").concat(text.slice(0, 500));
    })
        .join('\n\n');
}
function findProjectSkill() {
    var skills = (0, state_js_1.getInvokedSkillsForAgent)(null);
    for (var _i = 0, skills_1 = skills; _i < skills_1.length; _i++) {
        var _a = skills_1[_i], info = _a[1];
        if (info.skillPath.startsWith('projectSettings:')) {
            return info;
        }
    }
    return undefined;
}
function createSkillImprovementHook() {
    var lastAnalyzedCount = 0;
    var lastAnalyzedIndex = 0;
    var config = {
        name: 'skill_improvement',
        shouldRun: function (context) {
            return __awaiter(this, void 0, void 0, function () {
                var userCount;
                return __generator(this, function (_a) {
                    if (context.querySource !== 'repl_main_thread') {
                        return [2 /*return*/, false];
                    }
                    if (!findProjectSkill()) {
                        return [2 /*return*/, false];
                    }
                    userCount = (0, array_js_1.count)(context.messages, function (m) { return m.type === 'user'; });
                    if (userCount - lastAnalyzedCount < TURN_BATCH_SIZE) {
                        return [2 /*return*/, false];
                    }
                    lastAnalyzedCount = userCount;
                    return [2 /*return*/, true];
                });
            });
        },
        buildMessages: function (context) {
            var projectSkill = findProjectSkill();
            // Only analyze messages since the last check — the skill definition
            // provides enough context for the classifier to understand corrections
            var newMessages = context.messages.slice(lastAnalyzedIndex);
            lastAnalyzedIndex = context.messages.length;
            return [
                (0, messages_js_1.createUserMessage)({
                    content: "You are analyzing a conversation where a user is executing a skill (a repeatable process).\nYour job: identify if the user's recent messages contain preferences, requests, or corrections that should be permanently added to the skill definition for future runs.\n\n<skill_definition>\n".concat(projectSkill.content, "\n</skill_definition>\n\n<recent_messages>\n").concat(formatRecentMessages(newMessages), "\n</recent_messages>\n\nLook for:\n- Requests to add, change, or remove steps: \"can you also ask me X\", \"please do Y too\", \"don't do Z\"\n- Preferences about how steps should work: \"ask me about energy levels\", \"note the time\", \"use a casual tone\"\n- Corrections: \"no, do X instead\", \"always use Y\", \"make sure to...\"\n\nIgnore:\n- Routine conversation that doesn't generalize (one-time answers, chitchat)\n- Things the skill already does\n\nOutput a JSON array inside <updates> tags. Each item: {\"section\": \"which step/section to modify or 'new step'\", \"change\": \"what to add/modify\", \"reason\": \"which user message prompted this\"}.\nOutput <updates>[]</updates> if no updates are needed."),
                }),
            ];
        },
        systemPrompt: 'You detect user preferences and process improvements during skill execution. Flag anything the user asks for that should be remembered for next time.',
        useTools: false,
        parseResponse: function (content) {
            var updatesStr = (0, messages_js_1.extractTag)(content, 'updates');
            if (!updatesStr) {
                return [];
            }
            try {
                return (0, slowOperations_js_1.jsonParse)(updatesStr);
            }
            catch (_a) {
                return [];
            }
        },
        logResult: function (result, context) {
            var _a;
            if (result.type === 'success' && result.result.length > 0) {
                var projectSkill = findProjectSkill();
                var skillName_1 = (_a = projectSkill === null || projectSkill === void 0 ? void 0 : projectSkill.skillName) !== null && _a !== void 0 ? _a : 'unknown';
                (0, index_js_1.logEvent)('tengu_skill_improvement_detected', {
                    updateCount: result.result
                        .length,
                    uuid: result.uuid,
                    // _PROTO_skill_name routes to the privileged skill_name BQ column.
                    _PROTO_skill_name: skillName_1,
                });
                context.toolUseContext.setAppState(function (prev) { return (__assign(__assign({}, prev), { skillImprovement: {
                        suggestion: { skillName: skillName_1, updates: result.result },
                    } })); });
            }
        },
        getModel: model_js_1.getSmallFastModel,
    };
    return (0, apiQueryHookHelper_js_1.createApiQueryHook)(config);
}
function initSkillImprovement() {
    if ((0, bun_bundle_1.feature)('SKILL_IMPROVEMENT') &&
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_copper_panda', false)) {
        (0, postSamplingHooks_js_1.registerPostSamplingHook)(createSkillImprovementHook());
    }
}
/**
 * Apply skill improvements by calling a side-channel LLM to rewrite the skill file.
 * Fire-and-forget — does not block the main conversation.
 */
function applySkillImprovement(skillName, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var join, fs, filePath, currentContent, _a, updateList, response, responseText, updatedContent, e_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!skillName)
                        return [2 /*return*/];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('path'); })];
                case 1:
                    join = (_b.sent()).join;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('fs/promises'); })];
                case 2:
                    fs = _b.sent();
                    filePath = join((0, cwd_js_1.getCwd)(), '.claude', 'skills', skillName, 'SKILL.md');
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fs.readFile(filePath, 'utf-8')];
                case 4:
                    currentContent = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    (0, log_js_1.logError)(new Error("Failed to read skill file for improvement: ".concat(filePath)));
                    return [2 /*return*/];
                case 6:
                    updateList = updates.map(function (u) { return "- ".concat(u.section, ": ").concat(u.change); }).join('\n');
                    return [4 /*yield*/, (0, claude_js_1.queryModelWithoutStreaming)({
                            messages: [
                                (0, messages_js_1.createUserMessage)({
                                    content: "You are editing a skill definition file. Apply the following improvements to the skill.\n\n<current_skill_file>\n".concat(currentContent, "\n</current_skill_file>\n\n<improvements>\n").concat(updateList, "\n</improvements>\n\nRules:\n- Integrate the improvements naturally into the existing structure\n- Preserve frontmatter (--- block) exactly as-is\n- Preserve the overall format and style\n- Do not remove existing content unless an improvement explicitly replaces it\n- Output the complete updated file inside <updated_file> tags"),
                                }),
                            ],
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([
                                'You edit skill definition files to incorporate user preferences. Output only the updated file content.',
                            ]),
                            thinkingConfig: { type: 'disabled' },
                            tools: [],
                            signal: (0, abortController_js_1.createAbortController)().signal,
                            options: {
                                getToolPermissionContext: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, (0, Tool_js_1.getEmptyToolPermissionContext)()];
                                }); }); },
                                model: (0, model_js_1.getSmallFastModel)(),
                                toolChoice: undefined,
                                isNonInteractiveSession: false,
                                hasAppendSystemPrompt: false,
                                temperatureOverride: 0,
                                agents: [],
                                querySource: 'skill_improvement_apply',
                                mcpTools: [],
                            },
                        })];
                case 7:
                    response = _b.sent();
                    responseText = (0, messages_js_1.extractTextContent)(response.message.content).trim();
                    updatedContent = (0, messages_js_1.extractTag)(responseText, 'updated_file');
                    if (!updatedContent) {
                        (0, log_js_1.logError)(new Error('Skill improvement apply: no updated_file tag in response'));
                        return [2 /*return*/];
                    }
                    _b.label = 8;
                case 8:
                    _b.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, fs.writeFile(filePath, updatedContent, 'utf-8')];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_1 = _b.sent();
                    (0, log_js_1.logError)((0, errors_js_1.toError)(e_1));
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
