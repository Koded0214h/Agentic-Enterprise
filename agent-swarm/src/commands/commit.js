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
var promptShellExecution_js_1 = require("../utils/promptShellExecution.js");
var undercover_js_1 = require("../utils/undercover.js");
var ALLOWED_TOOLS = [
    'Bash(git add:*)',
    'Bash(git status:*)',
    'Bash(git commit:*)',
];
function getPromptContent() {
    var commitAttribution = (0, attribution_js_1.getAttributionTexts)().commit;
    var prefix = '';
    if (process.env.USER_TYPE === 'ant' && (0, undercover_js_1.isUndercover)()) {
        prefix = (0, undercover_js_1.getUndercoverInstructions)() + '\n';
    }
    return "".concat(prefix, "## Context\n\n- Current git status: !`git status`\n- Current git diff (staged and unstaged changes): !`git diff HEAD`\n- Current branch: !`git branch --show-current`\n- Recent commits: !`git log --oneline -10`\n\n## Git Safety Protocol\n\n- NEVER update the git config\n- NEVER skip hooks (--no-verify, --no-gpg-sign, etc) unless the user explicitly requests it\n- CRITICAL: ALWAYS create NEW commits. NEVER use git commit --amend, unless the user explicitly requests it\n- Do not commit files that likely contain secrets (.env, credentials.json, etc). Warn the user if they specifically request to commit those files\n- If there are no changes to commit (i.e., no untracked files and no modifications), do not create an empty commit\n- Never use git commands with the -i flag (like git rebase -i or git add -i) since they require interactive input which is not supported\n\n## Your task\n\nBased on the above changes, create a single git commit:\n\n1. Analyze all staged changes and draft a commit message:\n   - Look at the recent commits above to follow this repository's commit message style\n   - Summarize the nature of the changes (new feature, enhancement, bug fix, refactoring, test, docs, etc.)\n   - Ensure the message accurately reflects the changes and their purpose (i.e. \"add\" means a wholly new feature, \"update\" means an enhancement to an existing feature, \"fix\" means a bug fix, etc.)\n   - Draft a concise (1-2 sentences) commit message that focuses on the \"why\" rather than the \"what\"\n\n2. Stage relevant files and create the commit using HEREDOC syntax:\n```\ngit commit -m \"$(cat <<'EOF'\nCommit message here.").concat(commitAttribution ? "\n\n".concat(commitAttribution) : '', "\nEOF\n)\"\n```\n\nYou have the capability to call multiple tools in a single response. Stage and create the commit using a single message. Do not use any other tools or do anything else. Do not send any other text or messages besides these tool calls.");
}
var command = {
    type: 'prompt',
    name: 'commit',
    description: 'Create a git commit',
    allowedTools: ALLOWED_TOOLS,
    contentLength: 0, // Dynamic content
    progressMessage: 'creating commit',
    source: 'builtin',
    getPromptForCommand: function (_args, context) {
        return __awaiter(this, void 0, void 0, function () {
            var promptContent, finalContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promptContent = getPromptContent();
                        return [4 /*yield*/, (0, promptShellExecution_js_1.executeShellCommandsInPrompt)(promptContent, __assign(__assign({}, context), { getAppState: function () {
                                    var appState = context.getAppState();
                                    return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: ALLOWED_TOOLS }) }) });
                                } }), '/commit')];
                    case 1:
                        finalContent = _a.sent();
                        return [2 /*return*/, [{ type: 'text', text: finalContent }]];
                }
            });
        });
    },
};
exports.default = command;
