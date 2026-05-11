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
exports.deriveReviewState = deriveReviewState;
exports.fetchPrStatus = fetchPrStatus;
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var git_js_1 = require("./git.js");
var slowOperations_js_1 = require("./slowOperations.js");
var GH_TIMEOUT_MS = 5000;
/**
 * Derive review state from GitHub API values.
 * Draft PRs always show as 'draft' regardless of reviewDecision.
 * reviewDecision can be: APPROVED, CHANGES_REQUESTED, REVIEW_REQUIRED, or empty string.
 */
function deriveReviewState(isDraft, reviewDecision) {
    if (isDraft)
        return 'draft';
    switch (reviewDecision) {
        case 'APPROVED':
            return 'approved';
        case 'CHANGES_REQUESTED':
            return 'changes_requested';
        default:
            return 'pending';
    }
}
/**
 * Fetch PR status for the current branch using `gh pr view`.
 * Returns null on any failure (gh not installed, no PR, not in git repo, etc).
 * Also returns null if the PR's head branch is the default branch (e.g., main/master).
 */
function fetchPrStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var isGit, _a, branch, defaultBranch, _b, stdout, code, data;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                case 1:
                    isGit = _c.sent();
                    if (!isGit)
                        return [2 /*return*/, null
                            // Skip on the default branch — `gh pr view` returns the most recently
                            // merged PR there, which is misleading.
                        ];
                    return [4 /*yield*/, Promise.all([
                            (0, git_js_1.getBranch)(),
                            (0, git_js_1.getDefaultBranch)(),
                        ])];
                case 2:
                    _a = _c.sent(), branch = _a[0], defaultBranch = _a[1];
                    if (branch === defaultBranch)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('gh', [
                            'pr',
                            'view',
                            '--json',
                            'number,url,reviewDecision,isDraft,headRefName,state',
                        ], { timeout: GH_TIMEOUT_MS, preserveOutputOnError: false })];
                case 3:
                    _b = _c.sent(), stdout = _b.stdout, code = _b.code;
                    if (code !== 0 || !stdout.trim())
                        return [2 /*return*/, null];
                    try {
                        data = (0, slowOperations_js_1.jsonParse)(stdout);
                        // Don't show PR status for PRs from the default branch (e.g., main, master)
                        // This can happen when someone opens a PR from main to another branch
                        if (data.headRefName === defaultBranch ||
                            data.headRefName === 'main' ||
                            data.headRefName === 'master') {
                            return [2 /*return*/, null];
                        }
                        // Don't show PR status for merged or closed PRs — `gh pr view` returns
                        // the most recently associated PR for a branch, which may be merged/closed.
                        // The status line should only display open PRs.
                        if (data.state === 'MERGED' || data.state === 'CLOSED') {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                number: data.number,
                                url: data.url,
                                reviewState: deriveReviewState(data.isDraft, data.reviewDecision),
                            }];
                    }
                    catch (_d) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
