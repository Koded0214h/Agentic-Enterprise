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
var attribution_js_1 = require("../utils/attribution.js");
var git_js_1 = require("../utils/git.js");
var promptShellExecution_js_1 = require("../utils/promptShellExecution.js");
var undercover_js_1 = require("../utils/undercover.js");
var ALLOWED_TOOLS = [
    'Bash(git checkout --branch:*)',
    'Bash(git checkout -b:*)',
    'Bash(git add:*)',
    'Bash(git status:*)',
    'Bash(git push:*)',
    'Bash(git commit:*)',
    'Bash(gh pr create:*)',
    'Bash(gh pr edit:*)',
    'Bash(gh pr view:*)',
    'Bash(gh pr merge:*)',
    'ToolSearch',
    'mcp__slack__send_message',
    'mcp__claude_ai_Slack__slack_send_message',
];
function getPromptContent(defaultBranch, prAttribution) {
    var _a = (0, attribution_js_1.getAttributionTexts)(), commitAttribution = _a.commit, defaultPrAttribution = _a.pr;
    // Use provided PR attribution or fall back to default
    var effectivePrAttribution = prAttribution !== null && prAttribution !== void 0 ? prAttribution : defaultPrAttribution;
    var safeUser = process.env.SAFEUSER || '';
    var username = process.env.USER || '';
    var prefix = '';
    var reviewerArg = ' and `--reviewer anthropics/claude-code`';
    var addReviewerArg = ' (and add `--add-reviewer anthropics/claude-code`)';
    var changelogSection = "\n\n## Changelog\n<!-- CHANGELOG:START -->\n[If this PR contains user-facing changes, add a changelog entry here. Otherwise, remove this section.]\n<!-- CHANGELOG:END -->";
    var slackStep = "\n\n5. After creating/updating the PR, check if the user's CLAUDE.md mentions posting to Slack channels. If it does, use ToolSearch to search for \"slack send message\" tools. If ToolSearch finds a Slack tool, ask the user if they'd like you to post the PR URL to the relevant Slack channel. Only post if the user confirms. If ToolSearch returns no results or errors, skip this step silently\u2014do not mention the failure, do not attempt workarounds, and do not try alternative approaches.";
    if (process.env.USER_TYPE === 'ant' && (0, undercover_js_1.isUndercover)()) {
        prefix = (0, undercover_js_1.getUndercoverInstructions)() + '\n';
        reviewerArg = '';
        addReviewerArg = '';
        changelogSection = '';
        slackStep = '';
    }
    return "".concat(prefix, "## Context\n\n- `SAFEUSER`: ").concat(safeUser, "\n- `whoami`: ").concat(username, "\n- `git status`: !`git status`\n- `git diff HEAD`: !`git diff HEAD`\n- `git branch --show-current`: !`git branch --show-current`\n- `git diff ").concat(defaultBranch, "...HEAD`: !`git diff ").concat(defaultBranch, "...HEAD`\n- `gh pr view --json number 2>/dev/null || true`: !`gh pr view --json number 2>/dev/null || true`\n\n## Git Safety Protocol\n\n- NEVER update the git config\n- NEVER run destructive/irreversible git commands (like push --force, hard reset, etc) unless the user explicitly requests them\n- NEVER skip hooks (--no-verify, --no-gpg-sign, etc) unless the user explicitly requests it\n- NEVER run force push to main/master, warn the user if they request it\n- Do not commit files that likely contain secrets (.env, credentials.json, etc)\n- Never use git commands with the -i flag (like git rebase -i or git add -i) since they require interactive input which is not supported\n\n## Your task\n\nAnalyze all changes that will be included in the pull request, making sure to look at all relevant commits (NOT just the latest commit, but ALL commits that will be included in the pull request from the git diff ").concat(defaultBranch, "...HEAD output above).\n\nBased on the above changes:\n1. Create a new branch if on ").concat(defaultBranch, " (use SAFEUSER from context above for the branch name prefix, falling back to whoami if SAFEUSER is empty, e.g., `username/feature-name`)\n2. Create a single commit with an appropriate message using heredoc syntax").concat(commitAttribution ? ", ending with the attribution text shown in the example below" : '', ":\n```\ngit commit -m \"$(cat <<'EOF'\nCommit message here.").concat(commitAttribution ? "\n\n".concat(commitAttribution) : '', "\nEOF\n)\"\n```\n3. Push the branch to origin\n4. If a PR already exists for this branch (check the gh pr view output above), update the PR title and body using `gh pr edit` to reflect the current diff").concat(addReviewerArg, ". Otherwise, create a pull request using `gh pr create` with heredoc syntax for the body").concat(reviewerArg, ".\n   - IMPORTANT: Keep PR titles short (under 70 characters). Use the body for details.\n```\ngh pr create --title \"Short, descriptive title\" --body \"$(cat <<'EOF'\n## Summary\n<1-3 bullet points>\n\n## Test plan\n[Bulleted markdown checklist of TODOs for testing the pull request...]").concat(changelogSection).concat(effectivePrAttribution ? "\n\n".concat(effectivePrAttribution) : '', "\nEOF\n)\"\n```\n\nYou have the capability to call multiple tools in a single response. You MUST do all of the above in a single message.").concat(slackStep, "\n\nReturn the PR URL when you're done, so the user can see it.");
}
var command = {
    type: 'prompt',
    name: 'commit-push-pr',
    description: 'Commit, push, and open a PR',
    allowedTools: ALLOWED_TOOLS,
    get contentLength() {
        // Use 'main' as estimate for content length calculation
        return getPromptContent('main').length;
    },
    progressMessage: 'creating commit and PR',
    source: 'builtin',
    getPromptForCommand: function (args, context) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, defaultBranch, prAttribution, promptContent, trimmedArgs, finalContent;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            (0, git_js_1.getDefaultBranch)(),
                            (0, attribution_js_1.getEnhancedPRAttribution)(context.getAppState),
                        ])];
                    case 1:
                        _a = _b.sent(), defaultBranch = _a[0], prAttribution = _a[1];
                        promptContent = getPromptContent(defaultBranch, prAttribution);
                        trimmedArgs = args === null || args === void 0 ? void 0 : args.trim();
                        if (trimmedArgs) {
                            promptContent += "\n\n## Additional instructions from user\n\n".concat(trimmedArgs);
                        }
                        return [4 /*yield*/, (0, promptShellExecution_js_1.executeShellCommandsInPrompt)(promptContent, __assign(__assign({}, context), { getAppState: function () {
                                    var appState = context.getAppState();
                                    return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: ALLOWED_TOOLS }) }) });
                                } }), '/commit-push-pr')];
                    case 2:
                        finalContent = _b.sent();
                        return [2 /*return*/, [{ type: 'text', text: finalContent }]];
                }
            });
        });
    },
};
exports.default = command;
