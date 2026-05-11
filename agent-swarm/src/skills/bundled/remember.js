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
exports.registerRememberSkill = registerRememberSkill;
var paths_js_1 = require("../../memdir/paths.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
function registerRememberSkill() {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    var SKILL_PROMPT = "# Memory Review\n\n## Goal\nReview the user's memory landscape and produce a clear report of proposed changes, grouped by action type. Do NOT apply changes \u2014 present proposals for user approval.\n\n## Steps\n\n### 1. Gather all memory layers\nRead CLAUDE.md and CLAUDE.local.md from the project root (if they exist). Your auto-memory content is already in your system prompt \u2014 review it there. Note which team memory sections exist, if any.\n\n**Success criteria**: You have the contents of all memory layers and can compare them.\n\n### 2. Classify each auto-memory entry\nFor each substantive entry in auto-memory, determine the best destination:\n\n| Destination | What belongs there | Examples |\n|---|---|---|\n| **CLAUDE.md** | Project conventions and instructions for Claude that all contributors should follow | \"use bun not npm\", \"API routes use kebab-case\", \"test command is bun test\", \"prefer functional style\" |\n| **CLAUDE.local.md** | Personal instructions for Claude specific to this user, not applicable to other contributors | \"I prefer concise responses\", \"always explain trade-offs\", \"don't auto-commit\", \"run tests before committing\" |\n| **Team memory** | Org-wide knowledge that applies across repositories (only if team memory is configured) | \"deploy PRs go through #deploy-queue\", \"staging is at staging.internal\", \"platform team owns infra\" |\n| **Stay in auto-memory** | Working notes, temporary context, or entries that don't clearly fit elsewhere | Session-specific observations, uncertain patterns |\n\n**Important distinctions:**\n- CLAUDE.md and CLAUDE.local.md contain instructions for Claude, not user preferences for external tools (editor theme, IDE keybindings, etc. don't belong in either)\n- Workflow practices (PR conventions, merge strategies, branch naming) are ambiguous \u2014 ask the user whether they're personal or team-wide\n- When unsure, ask rather than guess\n\n**Success criteria**: Each entry has a proposed destination or is flagged as ambiguous.\n\n### 3. Identify cleanup opportunities\nScan across all layers for:\n- **Duplicates**: Auto-memory entries already captured in CLAUDE.md or CLAUDE.local.md \u2192 propose removing from auto-memory\n- **Outdated**: CLAUDE.md or CLAUDE.local.md entries contradicted by newer auto-memory entries \u2192 propose updating the older layer\n- **Conflicts**: Contradictions between any two layers \u2192 propose resolution, noting which is more recent\n\n**Success criteria**: All cross-layer issues identified.\n\n### 4. Present the report\nOutput a structured report grouped by action type:\n1. **Promotions** \u2014 entries to move, with destination and rationale\n2. **Cleanup** \u2014 duplicates, outdated entries, conflicts to resolve\n3. **Ambiguous** \u2014 entries where you need the user's input on destination\n4. **No action needed** \u2014 brief note on entries that should stay put\n\nIf auto-memory is empty, say so and offer to review CLAUDE.md for cleanup.\n\n**Success criteria**: User can review and approve/reject each proposal individually.\n\n## Rules\n- Present ALL proposals before making any changes\n- Do NOT modify files without explicit user approval\n- Do NOT create new files unless the target doesn't exist yet\n- Ask about ambiguous entries \u2014 don't guess\n";
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'remember',
        description: 'Review auto-memory entries and propose promotions to CLAUDE.md, CLAUDE.local.md, or shared memory. Also detects outdated, conflicting, and duplicate entries across memory layers.',
        whenToUse: 'Use when the user wants to review, organize, or promote their auto-memory entries. Also useful for cleaning up outdated or conflicting entries across CLAUDE.md, CLAUDE.local.md, and auto-memory.',
        userInvocable: true,
        isEnabled: function () { return (0, paths_js_1.isAutoMemoryEnabled)(); },
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt;
                return __generator(this, function (_a) {
                    prompt = SKILL_PROMPT;
                    if (args) {
                        prompt += "\n## Additional context from user\n\n".concat(args);
                    }
                    return [2 /*return*/, [{ type: 'text', text: prompt }]];
                });
            });
        },
    });
}
