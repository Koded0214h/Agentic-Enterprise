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
exports.setupGitHubActions = setupGitHubActions;
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("src/utils/config.js");
var github_app_js_1 = require("../../constants/github-app.js");
var browser_js_1 = require("../../utils/browser.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var log_js_1 = require("../../utils/log.js");
function createWorkflowFile(repoName, branchName, workflowPath, workflowContent, secretName, message, context) {
    return __awaiter(this, void 0, void 0, function () {
        var checkFileResult, fileSha, content, base64Content, apiParams, createFileResult, helpText;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                        'api',
                        "repos/".concat(repoName, "/contents/").concat(workflowPath),
                        '--jq',
                        '.sha',
                    ])];
                case 1:
                    checkFileResult = _a.sent();
                    fileSha = null;
                    if (checkFileResult.code === 0) {
                        fileSha = checkFileResult.stdout.trim();
                    }
                    content = workflowContent;
                    if (secretName === 'CLAUDE_CODE_OAUTH_TOKEN') {
                        // For OAuth tokens, use the claude_code_oauth_token parameter
                        content = workflowContent.replace(/anthropic_api_key: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}/g, "claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}");
                    }
                    else if (secretName !== 'ANTHROPIC_API_KEY') {
                        // For other custom secret names, keep using anthropic_api_key parameter
                        content = workflowContent.replace(/anthropic_api_key: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}/g, "anthropic_api_key: ${{ secrets.".concat(secretName, " }}"));
                    }
                    base64Content = Buffer.from(content).toString('base64');
                    apiParams = [
                        'api',
                        '--method',
                        'PUT',
                        "repos/".concat(repoName, "/contents/").concat(workflowPath),
                        '-f',
                        "message=".concat(fileSha ? "\"Update ".concat(message, "\"") : "\"".concat(message, "\"")),
                        '-f',
                        "content=".concat(base64Content),
                        '-f',
                        "branch=".concat(branchName),
                    ];
                    if (fileSha) {
                        apiParams.push('-f', "sha=".concat(fileSha));
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', apiParams)];
                case 2:
                    createFileResult = _a.sent();
                    if (createFileResult.code !== 0) {
                        if (createFileResult.stderr.includes('422') &&
                            createFileResult.stderr.includes('sha')) {
                            (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_create_workflow_file', exit_code: createFileResult.code }, context));
                            throw new Error("Failed to create workflow file ".concat(workflowPath, ": A Claude workflow file already exists in this repository. Please remove it first or update it manually."));
                        }
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_create_workflow_file', exit_code: createFileResult.code }, context));
                        helpText = '\n\nNeed help? Common issues:\n' +
                            '· Permission denied → Run: gh auth refresh -h github.com -s repo,workflow\n' +
                            '· Not authorized → Ensure you have admin access to the repository\n' +
                            '· For manual setup → Visit: https://github.com/anthropics/claude-code-action';
                        throw new Error("Failed to create workflow file ".concat(workflowPath, ": ").concat(createFileResult.stderr).concat(helpText));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function setupGitHubActions(repoName_1, apiKeyOrOAuthToken_1, secretName_1, updateProgress_1) {
    return __awaiter(this, arguments, void 0, function (repoName, apiKeyOrOAuthToken, secretName, updateProgress, skipWorkflow, selectedWorkflows, authType, context) {
        var repoCheckResult, defaultBranchResult, defaultBranch, shaResult, sha, branchName, createBranchResult, workflows, _i, workflows_1, workflow, setSecretResult, helpText, compareUrl, error_1;
        if (skipWorkflow === void 0) { skipWorkflow = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    (0, index_js_1.logEvent)('tengu_setup_github_actions_started', __assign({ skip_workflow: skipWorkflow, has_api_key: !!apiKeyOrOAuthToken, using_default_secret_name: secretName === 'ANTHROPIC_API_KEY', selected_claude_workflow: selectedWorkflows.includes('claude'), selected_claude_review_workflow: selectedWorkflows.includes('claude-review') }, context));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'api',
                            "repos/".concat(repoName),
                            '--jq',
                            '.id',
                        ])];
                case 1:
                    repoCheckResult = _a.sent();
                    if (repoCheckResult.code !== 0) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'repo_not_found', exit_code: repoCheckResult.code }, context));
                        throw new Error("Failed to access repository ".concat(repoName, ": ").concat(repoCheckResult.stderr));
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'api',
                            "repos/".concat(repoName),
                            '--jq',
                            '.default_branch',
                        ])];
                case 2:
                    defaultBranchResult = _a.sent();
                    if (defaultBranchResult.code !== 0) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_get_default_branch', exit_code: defaultBranchResult.code }, context));
                        throw new Error("Failed to get default branch: ".concat(defaultBranchResult.stderr));
                    }
                    defaultBranch = defaultBranchResult.stdout.trim();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'api',
                            "repos/".concat(repoName, "/git/ref/heads/").concat(defaultBranch),
                            '--jq',
                            '.object.sha',
                        ])];
                case 3:
                    shaResult = _a.sent();
                    if (shaResult.code !== 0) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_get_branch_sha', exit_code: shaResult.code }, context));
                        throw new Error("Failed to get branch SHA: ".concat(shaResult.stderr));
                    }
                    sha = shaResult.stdout.trim();
                    branchName = null;
                    if (!!skipWorkflow) return [3 /*break*/, 8];
                    updateProgress();
                    // Create new branch
                    branchName = "add-claude-github-actions-".concat(Date.now());
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'api',
                            '--method',
                            'POST',
                            "repos/".concat(repoName, "/git/refs"),
                            '-f',
                            "ref=refs/heads/".concat(branchName),
                            '-f',
                            "sha=".concat(sha),
                        ])];
                case 4:
                    createBranchResult = _a.sent();
                    if (createBranchResult.code !== 0) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_create_branch', exit_code: createBranchResult.code }, context));
                        throw new Error("Failed to create branch: ".concat(createBranchResult.stderr));
                    }
                    updateProgress();
                    workflows = [];
                    if (selectedWorkflows.includes('claude')) {
                        workflows.push({
                            path: '.github/workflows/claude.yml',
                            content: github_app_js_1.WORKFLOW_CONTENT,
                            message: 'Claude PR Assistant workflow',
                        });
                    }
                    if (selectedWorkflows.includes('claude-review')) {
                        workflows.push({
                            path: '.github/workflows/claude-code-review.yml',
                            content: github_app_js_1.CODE_REVIEW_PLUGIN_WORKFLOW_CONTENT,
                            message: 'Claude Code Review workflow',
                        });
                    }
                    _i = 0, workflows_1 = workflows;
                    _a.label = 5;
                case 5:
                    if (!(_i < workflows_1.length)) return [3 /*break*/, 8];
                    workflow = workflows_1[_i];
                    return [4 /*yield*/, createWorkflowFile(repoName, branchName, workflow.path, workflow.content, secretName, workflow.message, context)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    updateProgress();
                    if (!apiKeyOrOAuthToken) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'secret',
                            'set',
                            secretName,
                            '--body',
                            apiKeyOrOAuthToken,
                            '--repo',
                            repoName,
                        ])];
                case 9:
                    setSecretResult = _a.sent();
                    if (setSecretResult.code !== 0) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'failed_to_set_api_key_secret', exit_code: setSecretResult.code }, context));
                        helpText = '\n\nNeed help? Common issues:\n' +
                            '· Permission denied → Run: gh auth refresh -h github.com -s repo\n' +
                            '· Not authorized → Ensure you have admin access to the repository\n' +
                            '· For manual setup → Visit: https://github.com/anthropics/claude-code-action';
                        throw new Error("Failed to set API key secret: ".concat(setSecretResult.stderr || 'Unknown error').concat(helpText));
                    }
                    _a.label = 10;
                case 10:
                    if (!(!skipWorkflow && branchName)) return [3 /*break*/, 12];
                    updateProgress();
                    compareUrl = "https://github.com/".concat(repoName, "/compare/").concat(defaultBranch, "...").concat(branchName, "?quick_pull=1&title=").concat(encodeURIComponent(github_app_js_1.PR_TITLE), "&body=").concat(encodeURIComponent(github_app_js_1.PR_BODY));
                    return [4 /*yield*/, (0, browser_js_1.openBrowser)(compareUrl)];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    (0, index_js_1.logEvent)('tengu_setup_github_actions_completed', __assign({ skip_workflow: skipWorkflow, has_api_key: !!apiKeyOrOAuthToken, auth_type: authType, using_default_secret_name: secretName === 'ANTHROPIC_API_KEY', selected_claude_workflow: selectedWorkflows.includes('claude'), selected_claude_review_workflow: selectedWorkflows.includes('claude-review') }, context));
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        var _a;
                        return (__assign(__assign({}, current), { githubActionSetupCount: ((_a = current.githubActionSetupCount) !== null && _a !== void 0 ? _a : 0) + 1 }));
                    });
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _a.sent();
                    if (!error_1 ||
                        !(error_1 instanceof Error) ||
                        !error_1.message.includes('Failed to')) {
                        (0, index_js_1.logEvent)('tengu_setup_github_actions_failed', __assign({ reason: 'unexpected_error' }, context));
                    }
                    if (error_1 instanceof Error) {
                        (0, log_js_1.logError)(error_1);
                    }
                    throw error_1;
                case 14: return [2 /*return*/];
            }
        });
    });
}
