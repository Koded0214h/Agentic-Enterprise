"use strict";
/**
 * Teleported /ultrareview execution. Creates a CCR session with the current repo,
 * sends the review prompt as the initial message, and registers a
 * RemoteAgentTask so the polling loop pipes results back into the local
 * session via task-notification. Mirrors the /ultraplan → CCR flow.
 *
 * TODO(#22051): pass useBundleMode once landed so local-only / uncommitted
 * repo state is captured. The GitHub-clone path (current) only works for
 * pushed branches on repos with the Claude GitHub app installed.
 */
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
exports.confirmOverage = confirmOverage;
exports.checkOverageGate = checkOverageGate;
exports.launchRemoteReview = launchRemoteReview;
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var ultrareviewQuota_js_1 = require("../../services/api/ultrareviewQuota.js");
var usage_js_1 = require("../../services/api/usage.js");
var RemoteAgentTask_js_1 = require("../../tasks/RemoteAgentTask/RemoteAgentTask.js");
var auth_js_1 = require("../../utils/auth.js");
var detectRepository_js_1 = require("../../utils/detectRepository.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var git_js_1 = require("../../utils/git.js");
var teleport_js_1 = require("../../utils/teleport.js");
// One-time session flag: once the user confirms overage billing via the
// dialog, all subsequent /ultrareview invocations in this session proceed
// without re-prompting.
var sessionOverageConfirmed = false;
function confirmOverage() {
    sessionOverageConfirmed = true;
}
/**
 * Determine whether the user can launch an ultrareview and under what
 * billing terms. Fetches quota and utilization in parallel.
 */
function checkOverageGate() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, quota, utilization, extraUsage, monthlyLimit, usedCredits, available;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Team and Enterprise plans include ultrareview — no free-review quota
                    // or Extra Usage dialog. The quota endpoint is scoped to consumer plans
                    // (pro/max); hitting it on team/ent would surface a confusing dialog.
                    if ((0, auth_js_1.isTeamSubscriber)() || (0, auth_js_1.isEnterpriseSubscriber)()) {
                        return [2 /*return*/, { kind: 'proceed', billingNote: '' }];
                    }
                    return [4 /*yield*/, Promise.all([
                            (0, ultrareviewQuota_js_1.fetchUltrareviewQuota)(),
                            (0, usage_js_1.fetchUtilization)().catch(function () { return null; }),
                        ])
                        // No quota info (non-subscriber or endpoint down) — let it through,
                        // server-side billing will handle it.
                    ];
                case 1:
                    _a = _c.sent(), quota = _a[0], utilization = _a[1];
                    // No quota info (non-subscriber or endpoint down) — let it through,
                    // server-side billing will handle it.
                    if (!quota) {
                        return [2 /*return*/, { kind: 'proceed', billingNote: '' }];
                    }
                    if (quota.reviews_remaining > 0) {
                        return [2 /*return*/, {
                                kind: 'proceed',
                                billingNote: " This is free ultrareview ".concat(quota.reviews_used + 1, " of ").concat(quota.reviews_limit, "."),
                            }];
                    }
                    // Utilization fetch failed (transient network error, timeout, etc.) —
                    // let it through, same rationale as the quota fallback above.
                    if (!utilization) {
                        return [2 /*return*/, { kind: 'proceed', billingNote: '' }];
                    }
                    extraUsage = utilization.extra_usage;
                    if (!(extraUsage === null || extraUsage === void 0 ? void 0 : extraUsage.is_enabled)) {
                        (0, index_js_1.logEvent)('tengu_review_overage_not_enabled', {});
                        return [2 /*return*/, { kind: 'not-enabled' }];
                    }
                    monthlyLimit = extraUsage.monthly_limit;
                    usedCredits = (_b = extraUsage.used_credits) !== null && _b !== void 0 ? _b : 0;
                    available = monthlyLimit === null || monthlyLimit === undefined
                        ? Infinity
                        : monthlyLimit - usedCredits;
                    if (available < 10) {
                        (0, index_js_1.logEvent)('tengu_review_overage_low_balance', { available: available });
                        return [2 /*return*/, { kind: 'low-balance', available: available }];
                    }
                    if (!sessionOverageConfirmed) {
                        (0, index_js_1.logEvent)('tengu_review_overage_dialog_shown', {});
                        return [2 /*return*/, { kind: 'needs-confirm' }];
                    }
                    return [2 /*return*/, {
                            kind: 'proceed',
                            billingNote: ' This review bills as Extra Usage.',
                        }];
            }
        });
    });
}
/**
 * Launch a teleported review session. Returns ContentBlockParam[] describing
 * the launch outcome for injection into the local conversation (model is then
 * queried with this content, so it can narrate the launch to the user).
 *
 * Returns ContentBlockParam[] with user-facing error messages on recoverable
 * failures (missing merge-base, empty diff, bundle too large), or null on
 * other failures so the caller falls through to the local-review prompt.
 * Reason is captured in analytics.
 *
 * Caller must run checkOverageGate() BEFORE calling this function
 * (ultrareviewCommand.tsx handles the dialog).
 */
function launchRemoteReview(args, context, billingNote) {
    return __awaiter(this, void 0, void 0, function () {
        var eligibility, blockers, reasons, resolvedBillingNote, prNumber, isPrNumber, CODE_REVIEW_ENV_ID, raw, posInt, commonEnvVars, session, command, target, repo, baseBranch, _a, mbOut, mbCode, mergeBaseSha, _b, diffStat, diffCode, sessionUrl;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, RemoteAgentTask_js_1.checkRemoteAgentEligibility)()
                    // Synthetic DEFAULT_CODE_REVIEW_ENVIRONMENT_ID works without per-org CCR
                    // setup, so no_remote_environment isn't a blocker. Server-side quota
                    // consume at session creation routes billing: first N zero-rate, then
                    // anthropic:cccr org-service-key (overage-only).
                ];
                case 1:
                    eligibility = _c.sent();
                    // Synthetic DEFAULT_CODE_REVIEW_ENVIRONMENT_ID works without per-org CCR
                    // setup, so no_remote_environment isn't a blocker. Server-side quota
                    // consume at session creation routes billing: first N zero-rate, then
                    // anthropic:cccr org-service-key (overage-only).
                    if (!eligibility.eligible) {
                        blockers = eligibility.errors.filter(function (e) { return e.type !== 'no_remote_environment'; });
                        if (blockers.length > 0) {
                            (0, index_js_1.logEvent)('tengu_review_remote_precondition_failed', {
                                precondition_errors: blockers
                                    .map(function (e) { return e.type; })
                                    .join(','),
                            });
                            reasons = blockers.map(RemoteAgentTask_js_1.formatPreconditionError).join('\n');
                            return [2 /*return*/, [
                                    {
                                        type: 'text',
                                        text: "Ultrareview cannot launch:\n".concat(reasons),
                                    },
                                ]];
                        }
                    }
                    resolvedBillingNote = billingNote !== null && billingNote !== void 0 ? billingNote : '';
                    prNumber = args.trim();
                    isPrNumber = /^\d+$/.test(prNumber);
                    CODE_REVIEW_ENV_ID = 'env_011111111111111111111113';
                    raw = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_review_bughunter_config', null);
                    posInt = function (v, fallback, max) {
                        if (typeof v !== 'number' || !Number.isFinite(v))
                            return fallback;
                        var n = Math.floor(v);
                        if (n <= 0)
                            return fallback;
                        return max !== undefined && n > max ? fallback : n;
                    };
                    commonEnvVars = __assign({ BUGHUNTER_DRY_RUN: '1', BUGHUNTER_FLEET_SIZE: String(posInt(raw === null || raw === void 0 ? void 0 : raw.fleet_size, 5, 20)), BUGHUNTER_MAX_DURATION: String(posInt(raw === null || raw === void 0 ? void 0 : raw.max_duration_minutes, 10, 25)), BUGHUNTER_AGENT_TIMEOUT: String(posInt(raw === null || raw === void 0 ? void 0 : raw.agent_timeout_seconds, 600, 1800)), BUGHUNTER_TOTAL_WALLCLOCK: String(posInt(raw === null || raw === void 0 ? void 0 : raw.total_wallclock_minutes, 22, 27)) }, (process.env.BUGHUNTER_DEV_BUNDLE_B64 && {
                        BUGHUNTER_DEV_BUNDLE_B64: process.env.BUGHUNTER_DEV_BUNDLE_B64,
                    }));
                    if (!isPrNumber) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, detectRepository_js_1.detectCurrentRepositoryWithHost)()];
                case 2:
                    repo = _c.sent();
                    if (!repo || repo.host !== 'github.com') {
                        (0, index_js_1.logEvent)('tengu_review_remote_precondition_failed', {});
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, teleport_js_1.teleportToRemote)({
                            initialMessage: null,
                            description: "ultrareview: ".concat(repo.owner, "/").concat(repo.name, "#").concat(prNumber),
                            signal: context.abortController.signal,
                            branchName: "refs/pull/".concat(prNumber, "/head"),
                            environmentId: CODE_REVIEW_ENV_ID,
                            environmentVariables: __assign({ BUGHUNTER_PR_NUMBER: prNumber, BUGHUNTER_REPOSITORY: "".concat(repo.owner, "/").concat(repo.name) }, commonEnvVars),
                        })];
                case 3:
                    session = _c.sent();
                    command = "/ultrareview ".concat(prNumber);
                    target = "".concat(repo.owner, "/").concat(repo.name, "#").concat(prNumber);
                    return [3 /*break*/, 9];
                case 4: return [4 /*yield*/, (0, git_js_1.getDefaultBranch)()];
                case 5:
                    baseBranch = (_c.sent()) || 'main';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['merge-base', baseBranch, 'HEAD'], { preserveOutputOnError: false })];
                case 6:
                    _a = _c.sent(), mbOut = _a.stdout, mbCode = _a.code;
                    mergeBaseSha = mbOut.trim();
                    if (mbCode !== 0 || !mergeBaseSha) {
                        (0, index_js_1.logEvent)('tengu_review_remote_precondition_failed', {});
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: "Could not find merge-base with ".concat(baseBranch, ". Make sure you're in a git repo with a ").concat(baseBranch, " branch."),
                                },
                            ]];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['diff', '--shortstat', mergeBaseSha], { preserveOutputOnError: false })];
                case 7:
                    _b = _c.sent(), diffStat = _b.stdout, diffCode = _b.code;
                    if (diffCode === 0 && !diffStat.trim()) {
                        (0, index_js_1.logEvent)('tengu_review_remote_precondition_failed', {});
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: "No changes against the ".concat(baseBranch, " fork point. Make some commits or stage files first."),
                                },
                            ]];
                    }
                    return [4 /*yield*/, (0, teleport_js_1.teleportToRemote)({
                            initialMessage: null,
                            description: "ultrareview: ".concat(baseBranch),
                            signal: context.abortController.signal,
                            useBundle: true,
                            environmentId: CODE_REVIEW_ENV_ID,
                            environmentVariables: __assign({ BUGHUNTER_BASE_BRANCH: mergeBaseSha }, commonEnvVars),
                        })];
                case 8:
                    session = _c.sent();
                    if (!session) {
                        (0, index_js_1.logEvent)('tengu_review_remote_teleport_failed', {});
                        return [2 /*return*/, [
                                {
                                    type: 'text',
                                    text: 'Repo is too large. Push a PR and use `/ultrareview <PR#>` instead.',
                                },
                            ]];
                    }
                    command = '/ultrareview';
                    target = baseBranch;
                    _c.label = 9;
                case 9:
                    if (!session) {
                        (0, index_js_1.logEvent)('tengu_review_remote_teleport_failed', {});
                        return [2 /*return*/, null];
                    }
                    (0, RemoteAgentTask_js_1.registerRemoteAgentTask)({
                        remoteTaskType: 'ultrareview',
                        session: session,
                        command: command,
                        context: context,
                        isRemoteReview: true,
                    });
                    (0, index_js_1.logEvent)('tengu_review_remote_launched', {});
                    sessionUrl = (0, RemoteAgentTask_js_1.getRemoteTaskSessionUrl)(session.id);
                    // Concise — the tool-output block is visible to the user, so the model
                    // shouldn't echo the same info. Just enough for Claude to acknowledge the
                    // launch without restating the target/URL (both already printed above).
                    return [2 /*return*/, [
                            {
                                type: 'text',
                                text: "Ultrareview launched for ".concat(target, " (~10\u201320 min, runs in the cloud). Track: ").concat(sessionUrl).concat(resolvedBillingNote, " Findings arrive via task-notification. Briefly acknowledge the launch to the user without repeating the target or URL \u2014 both are already visible in the tool output above."),
                            },
                        ]];
            }
        });
    });
}
