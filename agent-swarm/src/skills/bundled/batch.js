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
exports.registerBatchSkill = registerBatchSkill;
var constants_js_1 = require("../../tools/AgentTool/constants.js");
var prompt_js_1 = require("../../tools/AskUserQuestionTool/prompt.js");
var constants_js_2 = require("../../tools/EnterPlanModeTool/constants.js");
var constants_js_3 = require("../../tools/ExitPlanModeTool/constants.js");
var constants_js_4 = require("../../tools/SkillTool/constants.js");
var git_js_1 = require("../../utils/git.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var MIN_AGENTS = 5;
var MAX_AGENTS = 30;
var WORKER_INSTRUCTIONS = "After you finish implementing the change:\n1. **Simplify** \u2014 Invoke the `".concat(constants_js_4.SKILL_TOOL_NAME, "` tool with `skill: \"simplify\"` to review and clean up your changes.\n2. **Run unit tests** \u2014 Run the project's test suite (check for package.json scripts, Makefile targets, or common commands like `npm test`, `bun test`, `pytest`, `go test`). If tests fail, fix them.\n3. **Test end-to-end** \u2014 Follow the e2e test recipe from the coordinator's prompt (below). If the recipe says to skip e2e for this unit, skip it.\n4. **Commit and push** \u2014 Commit all changes with a clear message, push the branch, and create a PR with `gh pr create`. Use a descriptive title. If `gh` is not available or the push fails, note it in your final message.\n5. **Report** \u2014 End with a single line: `PR: <url>` so the coordinator can track it. If no PR was created, end with `PR: none \u2014 <reason>`.");
function buildPrompt(instruction) {
    return "# Batch: Parallel Work Orchestration\n\nYou are orchestrating a large, parallelizable change across this codebase.\n\n## User Instruction\n\n".concat(instruction, "\n\n## Phase 1: Research and Plan (Plan Mode)\n\nCall the `").concat(constants_js_2.ENTER_PLAN_MODE_TOOL_NAME, "` tool now to enter plan mode, then:\n\n1. **Understand the scope.** Launch one or more subagents (in the foreground \u2014 you need their results) to deeply research what this instruction touches. Find all the files, patterns, and call sites that need to change. Understand the existing conventions so the migration is consistent.\n\n2. **Decompose into independent units.** Break the work into ").concat(MIN_AGENTS, "\u2013").concat(MAX_AGENTS, " self-contained units. Each unit must:\n   - Be independently implementable in an isolated git worktree (no shared state with sibling units)\n   - Be mergeable on its own without depending on another unit's PR landing first\n   - Be roughly uniform in size (split large units, merge trivial ones)\n\n   Scale the count to the actual work: few files \u2192 closer to ").concat(MIN_AGENTS, "; hundreds of files \u2192 closer to ").concat(MAX_AGENTS, ". Prefer per-directory or per-module slicing over arbitrary file lists.\n\n3. **Determine the e2e test recipe.** Figure out how a worker can verify its change actually works end-to-end \u2014 not just that unit tests pass. Look for:\n   - A `claude-in-chrome` skill or browser-automation tool (for UI changes: click through the affected flow, screenshot the result)\n   - A `tmux` or CLI-verifier skill (for CLI changes: launch the app interactively, exercise the changed behavior)\n   - A dev-server + curl pattern (for API changes: start the server, hit the affected endpoints)\n   - An existing e2e/integration test suite the worker can run\n\n   If you cannot find a concrete e2e path, use the `").concat(prompt_js_1.ASK_USER_QUESTION_TOOL_NAME, "` tool to ask the user how to verify this change end-to-end. Offer 2\u20133 specific options based on what you found (e.g., \"Screenshot via chrome extension\", \"Run `bun run dev` and curl the endpoint\", \"No e2e \u2014 unit tests are sufficient\"). Do not skip this \u2014 the workers cannot ask the user themselves.\n\n   Write the recipe as a short, concrete set of steps that a worker can execute autonomously. Include any setup (start a dev server, build first) and the exact command/interaction to verify.\n\n4. **Write the plan.** In your plan file, include:\n   - A summary of what you found during research\n   - A numbered list of work units \u2014 for each: a short title, the list of files/directories it covers, and a one-line description of the change\n   - The e2e test recipe (or \"skip e2e because \u2026\" if the user chose that)\n   - The exact worker instructions you will give each agent (the shared template)\n\n5. Call `").concat(constants_js_3.EXIT_PLAN_MODE_TOOL_NAME, "` to present the plan for approval.\n\n## Phase 2: Spawn Workers (After Plan Approval)\n\nOnce the plan is approved, spawn one background agent per work unit using the `").concat(constants_js_1.AGENT_TOOL_NAME, "` tool. **All agents must use `isolation: \"worktree\"` and `run_in_background: true`.** Launch them all in a single message block so they run in parallel.\n\nFor each agent, the prompt must be fully self-contained. Include:\n- The overall goal (the user's instruction)\n- This unit's specific task (title, file list, change description \u2014 copied verbatim from your plan)\n- Any codebase conventions you discovered that the worker needs to follow\n- The e2e test recipe from your plan (or \"skip e2e because \u2026\")\n- The worker instructions below, copied verbatim:\n\n```\n").concat(WORKER_INSTRUCTIONS, "\n```\n\nUse `subagent_type: \"general-purpose\"` unless a more specific agent type fits.\n\n## Phase 3: Track Progress\n\nAfter launching all workers, render an initial status table:\n\n| # | Unit | Status | PR |\n|---|------|--------|----|\n| 1 | <title> | running | \u2014 |\n| 2 | <title> | running | \u2014 |\n\nAs background-agent completion notifications arrive, parse the `PR: <url>` line from each agent's result and re-render the table with updated status (`done` / `failed`) and PR links. Keep a brief failure note for any agent that did not produce a PR.\n\nWhen all agents have reported, render the final table and a one-line summary (e.g., \"22/24 units landed as PRs\").\n");
}
var NOT_A_GIT_REPO_MESSAGE = "This is not a git repository. The `/batch` command requires a git repo because it spawns agents in isolated git worktrees and creates PRs from each. Initialize a repo first, or run this from inside an existing one.";
var MISSING_INSTRUCTION_MESSAGE = "Provide an instruction describing the batch change you want to make.\n\nExamples:\n  /batch migrate from react to vue\n  /batch replace all uses of lodash with native equivalents\n  /batch add type annotations to all untyped function parameters";
function registerBatchSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'batch',
        description: 'Research and plan a large-scale change, then execute it in parallel across 5–30 isolated worktree agents that each open a PR.',
        whenToUse: 'Use when the user wants to make a sweeping, mechanical change across many files (migrations, refactors, bulk renames) that can be decomposed into independent parallel units.',
        argumentHint: '<instruction>',
        userInvocable: true,
        disableModelInvocation: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var instruction, isGit;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            instruction = args.trim();
                            if (!instruction) {
                                return [2 /*return*/, [{ type: 'text', text: MISSING_INSTRUCTION_MESSAGE }]];
                            }
                            return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                        case 1:
                            isGit = _a.sent();
                            if (!isGit) {
                                return [2 /*return*/, [{ type: 'text', text: NOT_A_GIT_REPO_MESSAGE }]];
                            }
                            return [2 /*return*/, [{ type: 'text', text: buildPrompt(instruction) }]];
                    }
                });
            });
        },
    });
}
