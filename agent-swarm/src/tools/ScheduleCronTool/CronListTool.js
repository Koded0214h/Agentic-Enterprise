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
exports.CronListTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var cron_js_1 = require("../../utils/cron.js");
var cronTasks_js_1 = require("../../utils/cronTasks.js");
var format_js_1 = require("../../utils/format.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.strictObject({}); });
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        jobs: v4_1.z.array(v4_1.z.object({
            id: v4_1.z.string(),
            cron: v4_1.z.string(),
            humanSchedule: v4_1.z.string(),
            prompt: v4_1.z.string(),
            recurring: v4_1.z.boolean().optional(),
            durable: v4_1.z.boolean().optional(),
        })),
    });
});
exports.CronListTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.CRON_LIST_TOOL_NAME,
    searchHint: 'list active cron jobs',
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
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.CRON_LIST_DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.buildCronListPrompt)((0, prompt_js_1.isDurableCronEnabled)())];
            });
        });
    },
    call: function () {
        return __awaiter(this, void 0, void 0, function () {
            var allTasks, ctx, tasks, jobs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, cronTasks_js_1.listAllCronTasks)()
                        // Teammates only see their own crons; team lead (no ctx) sees all.
                    ];
                    case 1:
                        allTasks = _a.sent();
                        ctx = (0, teammateContext_js_1.getTeammateContext)();
                        tasks = ctx
                            ? allTasks.filter(function (t) { return t.agentId === ctx.agentId; })
                            : allTasks;
                        jobs = tasks.map(function (t) { return (__assign(__assign({ id: t.id, cron: t.cron, humanSchedule: (0, cron_js_1.cronToHuman)(t.cron), prompt: t.prompt }, (t.recurring ? { recurring: true } : {})), (t.durable === false ? { durable: false } : {}))); });
                        return [2 /*return*/, { data: { jobs: jobs } }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: output.jobs.length > 0
                ? output.jobs
                    .map(function (j) {
                    return "".concat(j.id, " \u2014 ").concat(j.humanSchedule).concat(j.recurring ? ' (recurring)' : ' (one-shot)').concat(j.durable === false ? ' [session-only]' : '', ": ").concat((0, format_js_1.truncate)(j.prompt, 80, true));
                })
                    .join('\n')
                : 'No scheduled jobs.',
        };
    },
    renderToolUseMessage: UI_js_1.renderListToolUseMessage,
    renderToolResultMessage: UI_js_1.renderListResultMessage,
});
