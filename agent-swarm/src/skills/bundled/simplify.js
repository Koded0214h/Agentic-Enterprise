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
exports.registerSimplifySkill = registerSimplifySkill;
var constants_js_1 = require("../../tools/AgentTool/constants.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var SIMPLIFY_PROMPT = "# Simplify: Code Review and Cleanup\n\nReview all changed files for reuse, quality, and efficiency. Fix any issues found.\n\n## Phase 1: Identify Changes\n\nRun `git diff` (or `git diff HEAD` if there are staged changes) to see what changed. If there are no git changes, review the most recently modified files that the user mentioned or that you edited earlier in this conversation.\n\n## Phase 2: Launch Three Review Agents in Parallel\n\nUse the ".concat(constants_js_1.AGENT_TOOL_NAME, " tool to launch all three agents concurrently in a single message. Pass each agent the full diff so it has the complete context.\n\n### Agent 1: Code Reuse Review\n\nFor each change:\n\n1. **Search for existing utilities and helpers** that could replace newly written code. Look for similar patterns elsewhere in the codebase \u2014 common locations are utility directories, shared modules, and files adjacent to the changed ones.\n2. **Flag any new function that duplicates existing functionality.** Suggest the existing function to use instead.\n3. **Flag any inline logic that could use an existing utility** \u2014 hand-rolled string manipulation, manual path handling, custom environment checks, ad-hoc type guards, and similar patterns are common candidates.\n\n### Agent 2: Code Quality Review\n\nReview the same changes for hacky patterns:\n\n1. **Redundant state**: state that duplicates existing state, cached values that could be derived, observers/effects that could be direct calls\n2. **Parameter sprawl**: adding new parameters to a function instead of generalizing or restructuring existing ones\n3. **Copy-paste with slight variation**: near-duplicate code blocks that should be unified with a shared abstraction\n4. **Leaky abstractions**: exposing internal details that should be encapsulated, or breaking existing abstraction boundaries\n5. **Stringly-typed code**: using raw strings where constants, enums (string unions), or branded types already exist in the codebase\n6. **Unnecessary JSX nesting**: wrapper Boxes/elements that add no layout value \u2014 check if inner component props (flexShrink, alignItems, etc.) already provide the needed behavior\n7. **Unnecessary comments**: comments explaining WHAT the code does (well-named identifiers already do that), narrating the change, or referencing the task/caller \u2014 delete; keep only non-obvious WHY (hidden constraints, subtle invariants, workarounds)\n\n### Agent 3: Efficiency Review\n\nReview the same changes for efficiency:\n\n1. **Unnecessary work**: redundant computations, repeated file reads, duplicate network/API calls, N+1 patterns\n2. **Missed concurrency**: independent operations run sequentially when they could run in parallel\n3. **Hot-path bloat**: new blocking work added to startup or per-request/per-render hot paths\n4. **Recurring no-op updates**: state/store updates inside polling loops, intervals, or event handlers that fire unconditionally \u2014 add a change-detection guard so downstream consumers aren't notified when nothing changed. Also: if a wrapper function takes an updater/reducer callback, verify it honors same-reference returns (or whatever the \"no change\" signal is) \u2014 otherwise callers' early-return no-ops are silently defeated\n5. **Unnecessary existence checks**: pre-checking file/resource existence before operating (TOCTOU anti-pattern) \u2014 operate directly and handle the error\n6. **Memory**: unbounded data structures, missing cleanup, event listener leaks\n7. **Overly broad operations**: reading entire files when only a portion is needed, loading all items when filtering for one\n\n## Phase 3: Fix Issues\n\nWait for all three agents to complete. Aggregate their findings and fix each issue directly. If a finding is a false positive or not worth addressing, note it and move on \u2014 do not argue with the finding, just skip it.\n\nWhen done, briefly summarize what was fixed (or confirm the code was already clean).\n");
function registerSimplifySkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'simplify',
        description: 'Review changed code for reuse, quality, and efficiency, then fix any issues found.',
        userInvocable: true,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt;
                return __generator(this, function (_a) {
                    prompt = SIMPLIFY_PROMPT;
                    if (args) {
                        prompt += "\n\n## Additional Focus\n\n".concat(args);
                    }
                    return [2 /*return*/, [{ type: 'text', text: prompt }]];
                });
            });
        },
    });
}
