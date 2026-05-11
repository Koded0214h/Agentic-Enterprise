"use strict";
/**
 * Shell-agnostic git operation tracking for usage metrics.
 *
 * Detects `git commit`, `git push`, `gh pr create`, `glab mr create`, and
 * curl-based PR creation in command strings, then increments OTLP counters
 * and fires analytics events. The regexes operate on raw command text so they
 * work identically for Bash and PowerShell (both invoke git/gh/glab/curl as
 * external binaries with the same argv syntax).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGitCommitId = parseGitCommitId;
exports.detectGitOperation = detectGitOperation;
exports.trackGitOperations = trackGitOperations;
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
/**
 * Build a regex that matches `git <subcmd>` while tolerating git's global
 * options between `git` and the subcommand (e.g. `-c key=val`, `-C path`,
 * `--git-dir=path`). Common when the model retries with
 * `git -c commit.gpgsign=false commit` after a signing failure.
 */
function gitCmdRe(subcmd, suffix) {
    if (suffix === void 0) { suffix = ''; }
    return new RegExp("\\bgit(?:\\s+-[cC]\\s+\\S+|\\s+--\\S+=\\S+)*\\s+".concat(subcmd, "\\b").concat(suffix));
}
var GIT_COMMIT_RE = gitCmdRe('commit');
var GIT_PUSH_RE = gitCmdRe('push');
var GIT_CHERRY_PICK_RE = gitCmdRe('cherry-pick');
var GIT_MERGE_RE = gitCmdRe('merge', '(?!-)');
var GIT_REBASE_RE = gitCmdRe('rebase');
var GH_PR_ACTIONS = [
    { re: /\bgh\s+pr\s+create\b/, action: 'created', op: 'pr_create' },
    { re: /\bgh\s+pr\s+edit\b/, action: 'edited', op: 'pr_edit' },
    { re: /\bgh\s+pr\s+merge\b/, action: 'merged', op: 'pr_merge' },
    { re: /\bgh\s+pr\s+comment\b/, action: 'commented', op: 'pr_comment' },
    { re: /\bgh\s+pr\s+close\b/, action: 'closed', op: 'pr_close' },
    { re: /\bgh\s+pr\s+ready\b/, action: 'ready', op: 'pr_ready' },
];
/**
 * Parse PR info from a GitHub PR URL.
 * Returns { prNumber, prUrl, prRepository } or null if not a valid PR URL.
 */
function parsePrUrl(url) {
    var match = url.match(/https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
    if ((match === null || match === void 0 ? void 0 : match[1]) && (match === null || match === void 0 ? void 0 : match[2])) {
        return {
            prNumber: parseInt(match[2], 10),
            prUrl: url,
            prRepository: match[1],
        };
    }
    return null;
}
/** Find a GitHub PR URL embedded anywhere in stdout and parse it. */
function findPrInStdout(stdout) {
    var m = stdout.match(/https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/pull\/\d+/);
    return m ? parsePrUrl(m[0]) : null;
}
// Exported for testing purposes
function parseGitCommitId(stdout) {
    // git commit output: [branch abc1234] message
    // or for root commit: [branch (root-commit) abc1234] message
    var match = stdout.match(/\[[\w./-]+(?: \(root-commit\))? ([0-9a-f]+)\]/);
    return match === null || match === void 0 ? void 0 : match[1];
}
/**
 * Parse branch name from git push output. Push writes progress to stderr but
 * the ref update line ("abc..def  branch -> branch", "* [new branch]
 * branch -> branch", or " + abc...def  branch -> branch (forced update)") is
 * the signal. Works on either stdout or stderr. Git prefixes each ref line
 * with a status flag (space, +, -, *, !, =); the char class tolerates any.
 */
function parseGitPushBranch(output) {
    var match = output.match(/^\s*[+\-*!= ]?\s*(?:\[new branch\]|\S+\.\.+\S+)\s+\S+\s*->\s*(\S+)/m);
    return match === null || match === void 0 ? void 0 : match[1];
}
/**
 * gh pr merge/close/ready print "✓ <Verb> pull request owner/repo#1234" with
 * no URL. Extract the PR number from the text.
 */
function parsePrNumberFromText(stdout) {
    var match = stdout.match(/[Pp]ull request (?:\S+#)?#?(\d+)/);
    return (match === null || match === void 0 ? void 0 : match[1]) ? parseInt(match[1], 10) : undefined;
}
/**
 * Extract target ref from `git merge <ref>` / `git rebase <ref>` command.
 * Skips flags and keywords — first non-flag argument is the ref.
 */
function parseRefFromCommand(command, verb) {
    var after = command.split(gitCmdRe(verb))[1];
    if (!after)
        return undefined;
    for (var _i = 0, _a = after.trim().split(/\s+/); _i < _a.length; _i++) {
        var t = _a[_i];
        if (/^[&|;><]/.test(t))
            break;
        if (t.startsWith('-'))
            continue;
        return t;
    }
    return undefined;
}
/**
 * Scan bash command + output for git operations worth surfacing in the
 * collapsed tool-use summary ("committed a1b2c3, created PR #42, ran 3 bash
 * commands"). Checks the command to avoid matching SHAs/URLs that merely
 * appear in unrelated output (e.g. `git log`).
 *
 * Pass stdout+stderr concatenated — git push writes the ref update to stderr.
 */
function detectGitOperation(command, output) {
    var _a;
    var result = {};
    // commit and cherry-pick both produce "[branch sha] msg" output
    var isCherryPick = GIT_CHERRY_PICK_RE.test(command);
    if (GIT_COMMIT_RE.test(command) || isCherryPick) {
        var sha = parseGitCommitId(output);
        if (sha) {
            result.commit = {
                sha: sha.slice(0, 6),
                kind: isCherryPick
                    ? 'cherry-picked'
                    : /--amend\b/.test(command)
                        ? 'amended'
                        : 'committed',
            };
        }
    }
    if (GIT_PUSH_RE.test(command)) {
        var branch = parseGitPushBranch(output);
        if (branch)
            result.push = { branch: branch };
    }
    if (GIT_MERGE_RE.test(command) &&
        /(Fast-forward|Merge made by)/.test(output)) {
        var ref = parseRefFromCommand(command, 'merge');
        if (ref)
            result.branch = { ref: ref, action: 'merged' };
    }
    if (GIT_REBASE_RE.test(command) && /Successfully rebased/.test(output)) {
        var ref = parseRefFromCommand(command, 'rebase');
        if (ref)
            result.branch = { ref: ref, action: 'rebased' };
    }
    var prAction = (_a = GH_PR_ACTIONS.find(function (a) { return a.re.test(command); })) === null || _a === void 0 ? void 0 : _a.action;
    if (prAction) {
        var pr = findPrInStdout(output);
        if (pr) {
            result.pr = { number: pr.prNumber, url: pr.prUrl, action: prAction };
        }
        else {
            var num = parsePrNumberFromText(output);
            if (num)
                result.pr = { number: num, action: prAction };
        }
    }
    return result;
}
// Exported for testing purposes
function trackGitOperations(command, exitCode, stdout) {
    var _a, _b, _c, _d;
    var success = exitCode === 0;
    if (!success) {
        return;
    }
    if (GIT_COMMIT_RE.test(command)) {
        (0, index_js_1.logEvent)('tengu_git_operation', {
            operation: 'commit',
        });
        if (command.match(/--amend\b/)) {
            (0, index_js_1.logEvent)('tengu_git_operation', {
                operation: 'commit_amend',
            });
        }
        (_a = (0, state_js_1.getCommitCounter)()) === null || _a === void 0 ? void 0 : _a.add(1);
    }
    if (GIT_PUSH_RE.test(command)) {
        (0, index_js_1.logEvent)('tengu_git_operation', {
            operation: 'push',
        });
    }
    var prHit = GH_PR_ACTIONS.find(function (a) { return a.re.test(command); });
    if (prHit) {
        (0, index_js_1.logEvent)('tengu_git_operation', {
            operation: prHit.op,
        });
    }
    if ((prHit === null || prHit === void 0 ? void 0 : prHit.action) === 'created') {
        (_b = (0, state_js_1.getPrCounter)()) === null || _b === void 0 ? void 0 : _b.add(1);
        // Auto-link session to PR if we can extract PR URL from stdout
        if (stdout) {
            var prInfo_1 = findPrInStdout(stdout);
            if (prInfo_1) {
                // Import is done dynamically to avoid circular dependency
                void Promise.resolve().then(function () { return require('../../utils/sessionStorage.js'); }).then(function (_a) {
                    var linkSessionToPR = _a.linkSessionToPR;
                    void Promise.resolve().then(function () { return require('../../bootstrap/state.js'); }).then(function (_a) {
                        var getSessionId = _a.getSessionId;
                        var sessionId = getSessionId();
                        if (sessionId) {
                            void linkSessionToPR(sessionId, prInfo_1.prNumber, prInfo_1.prUrl, prInfo_1.prRepository);
                        }
                    });
                });
            }
        }
    }
    if (command.match(/\bglab\s+mr\s+create\b/)) {
        (0, index_js_1.logEvent)('tengu_git_operation', {
            operation: 'pr_create',
        });
        (_c = (0, state_js_1.getPrCounter)()) === null || _c === void 0 ? void 0 : _c.add(1);
    }
    // Detect PR creation via curl to REST APIs (Bitbucket, GitHub API, GitLab API)
    // Check for POST method and PR endpoint separately to handle any argument order
    // Also detect implicit POST when -d is used (curl defaults to POST with data)
    var isCurlPost = command.match(/\bcurl\b/) &&
        (command.match(/-X\s*POST\b/i) ||
            command.match(/--request\s*=?\s*POST\b/i) ||
            command.match(/\s-d\s/));
    // Match PR endpoints in URLs, but not sub-resources like /pulls/123/comments
    // Require https?:// prefix to avoid matching text in POST body or other params
    var isPrEndpoint = command.match(/https?:\/\/[^\s'"]*\/(pulls|pull-requests|merge[-_]requests)(?!\/\d)/i);
    if (isCurlPost && isPrEndpoint) {
        (0, index_js_1.logEvent)('tengu_git_operation', {
            operation: 'pr_create',
        });
        (_d = (0, state_js_1.getPrCounter)()) === null || _d === void 0 ? void 0 : _d.add(1);
    }
}
