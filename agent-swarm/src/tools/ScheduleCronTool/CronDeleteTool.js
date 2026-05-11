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
exports.CronDeleteTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var cronTasks_js_1 = require("../../utils/cronTasks.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        id: v4_1.z.string().describe('Job ID returned by CronCreate.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        id: v4_1.z.string(),
    });
});
exports.CronDeleteTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.CRON_DELETE_TOOL_NAME,
    searchHint: 'cancel a scheduled cron job',
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
        return input.id;
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.CRON_DELETE_DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.buildCronDeletePrompt)((0, prompt_js_1.isDurableCronEnabled)())];
            });
        });
    },
    getPath: function () {
        return (0, cronTasks_js_1.getCronFilePath)();
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, task, ctx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, cronTasks_js_1.listAllCronTasks)()];
                    case 1:
                        tasks = _a.sent();
                        task = tasks.find(function (t) { return t.id === input.id; });
                        if (!task) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "No scheduled job with id '".concat(input.id, "'"),
                                    errorCode: 1,
                                }];
                        }
                        ctx = (0, teammateContext_js_1.getTeammateContext)();
                        if (ctx && task.agentId !== ctx.agentId) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Cannot delete cron job '".concat(input.id, "': owned by another agent"),
                                    errorCode: 2,
                                }];
                        }
                        return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    call: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var id = _b.id;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, cronTasks_js_1.removeCronTasks)([id])];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { data: { id: id } }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "Cancelled job ".concat(output.id, "."),
        };
    },
    renderToolUseMessage: UI_js_1.renderDeleteToolUseMessage,
    renderToolResultMessage: UI_js_1.renderDeleteResultMessage,
});
