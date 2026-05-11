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
exports.registerStuckSkill = registerStuckSkill;
var bundledSkills_js_1 = require("../bundledSkills.js");
// Prompt text contains `ps` commands as instructions for Claude to run,
// not commands this file executes.
// eslint-disable-next-line custom-rules/no-direct-ps-commands
var STUCK_PROMPT = "# /stuck \u2014 diagnose frozen/slow Claude Code sessions\n\nThe user thinks another Claude Code session on this machine is frozen, stuck, or very slow. Investigate and post a report to #claude-code-feedback.\n\n## What to look for\n\nScan for other Claude Code processes (excluding the current one \u2014 PID is in `process.pid` but for shell commands just exclude the PID you see running this prompt). Process names are typically `claude` (installed) or `cli` (native dev build).\n\nSigns of a stuck session:\n- **High CPU (\u226590%) sustained** \u2014 likely an infinite loop. Sample twice, 1-2s apart, to confirm it's not a transient spike.\n- **Process state `D` (uninterruptible sleep)** \u2014 often an I/O hang. The `state` column in `ps` output; first character matters (ignore modifiers like `+`, `s`, `<`).\n- **Process state `T` (stopped)** \u2014 user probably hit Ctrl+Z by accident.\n- **Process state `Z` (zombie)** \u2014 parent isn't reaping.\n- **Very high RSS (\u22654GB)** \u2014 possible memory leak making the session sluggish.\n- **Stuck child process** \u2014 a hung `git`, `node`, or shell subprocess can freeze the parent. Check `pgrep -lP <pid>` for each session.\n\n## Investigation steps\n\n1. **List all Claude Code processes** (macOS/Linux):\n   ```\n   ps -axo pid=,pcpu=,rss=,etime=,state=,comm=,command= | grep -E '(claude|cli)' | grep -v grep\n   ```\n   Filter to rows where `comm` is `claude` or (`cli` AND the command path contains \"claude\").\n\n2. **For anything suspicious**, gather more context:\n   - Child processes: `pgrep -lP <pid>`\n   - If high CPU: sample again after 1-2s to confirm it's sustained\n   - If a child looks hung (e.g., a git command), note its full command line with `ps -p <child_pid> -o command=`\n   - Check the session's debug log if you can infer the session ID: `~/.claude/debug/<session-id>.txt` (the last few hundred lines often show what it was doing before hanging)\n\n3. **Consider a stack dump** for a truly frozen process (advanced, optional):\n   - macOS: `sample <pid> 3` gives a 3-second native stack sample\n   - This is big \u2014 only grab it if the process is clearly hung and you want to know *why*\n\n## Report\n\n**Only post to Slack if you actually found something stuck.** If every session looks healthy, tell the user that directly \u2014 do not post an all-clear to the channel.\n\nIf you did find a stuck/slow session, post to **#claude-code-feedback** (channel ID: `C07VBSHV7EV`) using the Slack MCP tool. Use ToolSearch to find `slack_send_message` if it's not already loaded.\n\n**Use a two-message structure** to keep the channel scannable:\n\n1. **Top-level message** \u2014 one short line: hostname, Claude Code version, and a terse symptom (e.g. \"session PID 12345 pegged at 100% CPU for 10min\" or \"git subprocess hung in D state\"). No code blocks, no details.\n2. **Thread reply** \u2014 the full diagnostic dump. Pass the top-level message's `ts` as `thread_ts`. Include:\n   - PID, CPU%, RSS, state, uptime, command line, child processes\n   - Your diagnosis of what's likely wrong\n   - Relevant debug log tail or `sample` output if you captured it\n\nIf Slack MCP isn't available, format the report as a message the user can copy-paste into #claude-code-feedback (and let them know to thread the details themselves).\n\n## Notes\n- Don't kill or signal any processes \u2014 this is diagnostic only.\n- If the user gave an argument (e.g., a specific PID or symptom), focus there first.\n";
function registerStuckSkill() {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'stuck',
        description: '[ANT-ONLY] Investigate frozen/stuck/slow Claude Code sessions on this machine and post a diagnostic report to #claude-code-feedback.',
        userInvocable: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt;
                return __generator(this, function (_a) {
                    prompt = STUCK_PROMPT;
                    if (args) {
                        prompt += "\n## User-provided context\n\n".concat(args, "\n");
                    }
                    return [2 /*return*/, [{ type: 'text', text: prompt }]];
                });
            });
        },
    });
}
