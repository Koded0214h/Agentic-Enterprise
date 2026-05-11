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
exports.registerLoopSkill = registerLoopSkill;
var prompt_js_1 = require("../../tools/ScheduleCronTool/prompt.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var DEFAULT_INTERVAL = '10m';
var USAGE_MESSAGE = "Usage: /loop [interval] <prompt>\n\nRun a prompt or slash command on a recurring interval.\n\nIntervals: Ns, Nm, Nh, Nd (e.g. 5m, 30m, 2h, 1d). Minimum granularity is 1 minute.\nIf no interval is specified, defaults to ".concat(DEFAULT_INTERVAL, ".\n\nExamples:\n  /loop 5m /babysit-prs\n  /loop 30m check the deploy\n  /loop 1h /standup 1\n  /loop check the deploy          (defaults to ").concat(DEFAULT_INTERVAL, ")\n  /loop check the deploy every 20m");
function buildPrompt(args) {
    return "# /loop \u2014 schedule a recurring prompt\n\nParse the input below into `[interval] <prompt\u2026>` and schedule it with ".concat(prompt_js_1.CRON_CREATE_TOOL_NAME, ".\n\n## Parsing (in priority order)\n\n1. **Leading token**: if the first whitespace-delimited token matches `^\\d+[smhd]$` (e.g. `5m`, `2h`), that's the interval; the rest is the prompt.\n2. **Trailing \"every\" clause**: otherwise, if the input ends with `every <N><unit>` or `every <N> <unit-word>` (e.g. `every 20m`, `every 5 minutes`, `every 2 hours`), extract that as the interval and strip it from the prompt. Only match when what follows \"every\" is a time expression \u2014 `check every PR` has no interval.\n3. **Default**: otherwise, interval is `").concat(DEFAULT_INTERVAL, "` and the entire input is the prompt.\n\nIf the resulting prompt is empty, show usage `/loop [interval] <prompt>` and stop \u2014 do not call ").concat(prompt_js_1.CRON_CREATE_TOOL_NAME, ".\n\nExamples:\n- `5m /babysit-prs` \u2192 interval `5m`, prompt `/babysit-prs` (rule 1)\n- `check the deploy every 20m` \u2192 interval `20m`, prompt `check the deploy` (rule 2)\n- `run tests every 5 minutes` \u2192 interval `5m`, prompt `run tests` (rule 2)\n- `check the deploy` \u2192 interval `").concat(DEFAULT_INTERVAL, "`, prompt `check the deploy` (rule 3)\n- `check every PR` \u2192 interval `").concat(DEFAULT_INTERVAL, "`, prompt `check every PR` (rule 3 \u2014 \"every\" not followed by time)\n- `5m` \u2192 empty prompt \u2192 show usage\n\n## Interval \u2192 cron\n\nSupported suffixes: `s` (seconds, rounded up to nearest minute, min 1), `m` (minutes), `h` (hours), `d` (days). Convert:\n\n| Interval pattern      | Cron expression     | Notes                                    |\n|-----------------------|---------------------|------------------------------------------|\n| `Nm` where N \u2264 59   | `*/N * * * *`     | every N minutes                          |\n| `Nm` where N \u2265 60   | `0 */H * * *`     | round to hours (H = N/60, must divide 24)|\n| `Nh` where N \u2264 23   | `0 */N * * *`     | every N hours                            |\n| `Nd`                | `0 0 */N * *`     | every N days at midnight local           |\n| `Ns`                | treat as `ceil(N/60)m` | cron minimum granularity is 1 minute  |\n\n**If the interval doesn't cleanly divide its unit** (e.g. `7m` \u2192 `*/7 * * * *` gives uneven gaps at :56\u2192:00; `90m` \u2192 1.5h which cron can't express), pick the nearest clean interval and tell the user what you rounded to before scheduling.\n\n## Action\n\n1. Call ").concat(prompt_js_1.CRON_CREATE_TOOL_NAME, " with:\n   - `cron`: the expression from the table above\n   - `prompt`: the parsed prompt from above, verbatim (slash commands are passed through unchanged)\n   - `recurring`: `true`\n2. Briefly confirm: what's scheduled, the cron expression, the human-readable cadence, that recurring tasks auto-expire after ").concat(prompt_js_1.DEFAULT_MAX_AGE_DAYS, " days, and that they can cancel sooner with ").concat(prompt_js_1.CRON_DELETE_TOOL_NAME, " (include the job ID).\n3. **Then immediately execute the parsed prompt now** \u2014 don't wait for the first cron fire. If it's a slash command, invoke it via the Skill tool; otherwise act on it directly.\n\n## Input\n\n").concat(args);
}
function registerLoopSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'loop',
        description: 'Run a prompt or slash command on a recurring interval (e.g. /loop 5m /foo, defaults to 10m)',
        whenToUse: 'When the user wants to set up a recurring task, poll for status, or run something repeatedly on an interval (e.g. "check the deploy every 5 minutes", "keep running /babysit-prs"). Do NOT invoke for one-off tasks.',
        argumentHint: '[interval] <prompt>',
        userInvocable: true,
        isEnabled: prompt_js_1.isKairosCronEnabled,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var trimmed;
                return __generator(this, function (_a) {
                    trimmed = args.trim();
                    if (!trimmed) {
                        return [2 /*return*/, [{ type: 'text', text: USAGE_MESSAGE }]];
                    }
                    return [2 /*return*/, [{ type: 'text', text: buildPrompt(trimmed) }]];
                });
            });
        },
    });
}
