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
exports.CronCreateTool = void 0;
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var Tool_js_1 = require("../../Tool.js");
var cron_js_1 = require("../../utils/cron.js");
var cronTasks_js_1 = require("../../utils/cronTasks.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var semanticBoolean_js_1 = require("../../utils/semanticBoolean.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var MAX_JOBS = 50;
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        cron: v4_1.z
            .string()
            .describe('Standard 5-field cron expression in local time: "M H DoM Mon DoW" (e.g. "*/5 * * * *" = every 5 minutes, "30 14 28 2 *" = Feb 28 at 2:30pm local once).'),
        prompt: v4_1.z.string().describe('The prompt to enqueue at each fire time.'),
        recurring: (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().optional()).describe("true (default) = fire on every cron match until deleted or auto-expired after ".concat(prompt_js_1.DEFAULT_MAX_AGE_DAYS, " days. false = fire once at the next match, then auto-delete. Use false for \"remind me at X\" one-shot requests with pinned minute/hour/dom/month.")),
        durable: (0, semanticBoolean_js_1.semanticBoolean)(v4_1.z.boolean().optional()).describe('true = persist to .claude/scheduled_tasks.json and survive restarts. false (default) = in-memory only, dies when this Claude session ends. Use true only when the user asks the task to survive across sessions.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        id: v4_1.z.string(),
        humanSchedule: v4_1.z.string(),
        recurring: v4_1.z.boolean(),
        durable: v4_1.z.boolean().optional(),
    });
});
exports.CronCreateTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.CRON_CREATE_TOOL_NAME,
    searchHint: 'schedule a recurring or one-shot prompt',
    maxResultSizeChars: 100000,
    shouldDefer: true,
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    isEnabled: function () {
        return (0, prompt_js_1.isKairosCronEnabled)();
    },
    toAutoClassifierInput: function (input) {
        return "".concat(input.cron, ": ").concat(input.prompt);
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.buildCronCreateDescription)((0, prompt_js_1.isDurableCronEnabled)())];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.buildCronCreatePrompt)((0, prompt_js_1.isDurableCronEnabled)())];
            });
        });
    },
    getPath: function () {
        return (0, cronTasks_js_1.getCronFilePath)();
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(0, cron_js_1.parseCronExpression)(input.cron)) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Invalid cron expression '".concat(input.cron, "'. Expected 5 fields: M H DoM Mon DoW."),
                                    errorCode: 1,
                                }];
                        }
                        if ((0, cronTasks_js_1.nextCronRunMs)(input.cron, Date.now()) === null) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Cron expression '".concat(input.cron, "' does not match any calendar date in the next year."),
                                    errorCode: 2,
                                }];
                        }
                        return [4 /*yield*/, (0, cronTasks_js_1.listAllCronTasks)()];
                    case 1:
                        tasks = _a.sent();
                        if (tasks.length >= MAX_JOBS) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Too many scheduled jobs (max ".concat(MAX_JOBS, "). Cancel one first."),
                                    errorCode: 3,
                                }];
                        }
                        // Teammates don't persist across sessions, so a durable teammate cron
                        // would orphan on restart (agentId would point to a nonexistent teammate).
                        if (input.durable && (0, teammateContext_js_1.getTeammateContext)()) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: 'durable crons are not supported for teammates (teammates do not persist across sessions)',
                                    errorCode: 4,
                                }];
                        }
                        return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    call: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var effectiveDurable, id;
            var _c;
            var cron = _b.cron, prompt = _b.prompt, _d = _b.recurring, recurring = _d === void 0 ? true : _d, _e = _b.durable, durable = _e === void 0 ? false : _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        effectiveDurable = durable && (0, prompt_js_1.isDurableCronEnabled)();
                        return [4 /*yield*/, (0, cronTasks_js_1.addCronTask)(cron, prompt, recurring, effectiveDurable, (_c = (0, teammateContext_js_1.getTeammateContext)()) === null || _c === void 0 ? void 0 : _c.agentId)
                            // Enable the scheduler so the task fires in this session. The
                            // useScheduledTasks hook polls this flag and will start watching
                            // on the next tick. For durable: false tasks the file never changes
                            // — check() reads the session store directly — but the enable flag
                            // is still what starts the tick loop.
                        ];
                    case 1:
                        id = _f.sent();
                        // Enable the scheduler so the task fires in this session. The
                        // useScheduledTasks hook polls this flag and will start watching
                        // on the next tick. For durable: false tasks the file never changes
                        // — check() reads the session store directly — but the enable flag
                        // is still what starts the tick loop.
                        (0, state_js_1.setScheduledTasksEnabled)(true);
                        return [2 /*return*/, {
                                data: {
                                    id: id,
                                    humanSchedule: (0, cron_js_1.cronToHuman)(cron),
                                    recurring: recurring,
                                    durable: effectiveDurable,
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        var where = output.durable
            ? 'Persisted to .claude/scheduled_tasks.json'
            : 'Session-only (not written to disk, dies when Claude exits)';
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: output.recurring
                ? "Scheduled recurring job ".concat(output.id, " (").concat(output.humanSchedule, "). ").concat(where, ". Auto-expires after ").concat(prompt_js_1.DEFAULT_MAX_AGE_DAYS, " days. Use CronDelete to cancel sooner.")
                : "Scheduled one-shot task ".concat(output.id, " (").concat(output.humanSchedule, "). ").concat(where, ". It will fire once then auto-delete."),
        };
    },
    renderToolUseMessage: UI_js_1.renderCreateToolUseMessage,
    renderToolResultMessage: UI_js_1.renderCreateResultMessage,
});
