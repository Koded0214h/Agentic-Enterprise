"use strict";
/**
 * Git bundle creation + upload for CCR seed-bundle seeding.
 *
 * Flow:
 *   1. git stash create → update-ref refs/seed/stash (makes it reachable)
 *   2. git bundle create --all (packs refs/seed/stash + its objects)
 *   3. Upload to /v1/files
 *   4. Cleanup refs/seed/stash (don't pollute user's repo)
 *   5. Caller sets seed_bundle_file_id on SessionContext
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndUploadGitBundle = createAndUploadGitBundle;
var promises_1 = require("fs/promises");
var index_js_1 = require("src/services/analytics/index.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var filesApi_js_1 = require("../../services/api/filesApi.js");
var cwd_js_1 = require("../cwd.js");
var debug_js_1 = require("../debug.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var git_js_1 = require("../git.js");
var tempfile_js_1 = require("../tempfile.js");
// Tunable via tengu_ccr_bundle_max_bytes.
var DEFAULT_BUNDLE_MAX_BYTES = 100 * 1024 * 1024;
// Bundle --all → HEAD → squashed-root. HEAD drops side branches/tags but
// keeps full current-branch history. Squashed-root is a single parentless
// commit of HEAD's tree (or the stash tree if WIP exists) — no history,
// just the snapshot. Receiver needs refs/seed/root handling for that tier.
function _bundleWithFallback(gitRoot, bundlePath, maxBytes, hasStash, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var extra, mkBundle, allResult, allSize, headResult, headSize, treeRef, commitTree, squashedSha, squashResult, squashSize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    extra = hasStash ? ['refs/seed/stash'] : [];
                    mkBundle = function (base) {
                        return (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(['bundle', 'create', bundlePath, base], extra, true), { cwd: gitRoot, abortSignal: signal });
                    };
                    return [4 /*yield*/, mkBundle('--all')];
                case 1:
                    allResult = _a.sent();
                    if (allResult.code !== 0) {
                        return [2 /*return*/, {
                                ok: false,
                                error: "git bundle create --all failed (".concat(allResult.code, "): ").concat(allResult.stderr.slice(0, 200)),
                                failReason: 'git_error',
                            }];
                    }
                    return [4 /*yield*/, (0, promises_1.stat)(bundlePath)];
                case 2:
                    allSize = (_a.sent()).size;
                    if (allSize <= maxBytes) {
                        return [2 /*return*/, { ok: true, size: allSize, scope: 'all' }];
                    }
                    // bundle create overwrites in place.
                    (0, debug_js_1.logForDebugging)("[gitBundle] --all bundle is ".concat((allSize / 1024 / 1024).toFixed(1), "MB (> ").concat((maxBytes / 1024 / 1024).toFixed(0), "MB), retrying HEAD-only"));
                    return [4 /*yield*/, mkBundle('HEAD')];
                case 3:
                    headResult = _a.sent();
                    if (headResult.code !== 0) {
                        return [2 /*return*/, {
                                ok: false,
                                error: "git bundle create HEAD failed (".concat(headResult.code, "): ").concat(headResult.stderr.slice(0, 200)),
                                failReason: 'git_error',
                            }];
                    }
                    return [4 /*yield*/, (0, promises_1.stat)(bundlePath)];
                case 4:
                    headSize = (_a.sent()).size;
                    if (headSize <= maxBytes) {
                        return [2 /*return*/, { ok: true, size: headSize, scope: 'head' }];
                    }
                    // Last resort: squash to a single parentless commit. Uses the stash tree
                    // when WIP exists (bakes uncommitted changes in — can't bundle the stash
                    // ref separately since its parents would drag history back).
                    (0, debug_js_1.logForDebugging)("[gitBundle] HEAD bundle is ".concat((headSize / 1024 / 1024).toFixed(1), "MB, retrying squashed-root"));
                    treeRef = hasStash ? 'refs/seed/stash^{tree}' : 'HEAD^{tree}';
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['commit-tree', treeRef, '-m', 'seed'], { cwd: gitRoot, abortSignal: signal })];
                case 5:
                    commitTree = _a.sent();
                    if (commitTree.code !== 0) {
                        return [2 /*return*/, {
                                ok: false,
                                error: "git commit-tree failed (".concat(commitTree.code, "): ").concat(commitTree.stderr.slice(0, 200)),
                                failReason: 'git_error',
                            }];
                    }
                    squashedSha = commitTree.stdout.trim();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['update-ref', 'refs/seed/root', squashedSha], { cwd: gitRoot })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['bundle', 'create', bundlePath, 'refs/seed/root'], { cwd: gitRoot, abortSignal: signal })];
                case 7:
                    squashResult = _a.sent();
                    if (squashResult.code !== 0) {
                        return [2 /*return*/, {
                                ok: false,
                                error: "git bundle create refs/seed/root failed (".concat(squashResult.code, "): ").concat(squashResult.stderr.slice(0, 200)),
                                failReason: 'git_error',
                            }];
                    }
                    return [4 /*yield*/, (0, promises_1.stat)(bundlePath)];
                case 8:
                    squashSize = (_a.sent()).size;
                    if (squashSize <= maxBytes) {
                        return [2 /*return*/, { ok: true, size: squashSize, scope: 'squashed' }];
                    }
                    return [2 /*return*/, {
                            ok: false,
                            error: 'Repo is too large to bundle. Please setup GitHub on https://claude.ai/code',
                            failReason: 'too_large',
                        }];
            }
        });
    });
}
// Bundle the repo and upload to Files API; return file_id for
// seed_bundle_file_id. --all → HEAD → squashed-root fallback chain.
// Tracked WIP via stash create → refs/seed/stash (or baked into the
// squashed tree); untracked not captured.
function createAndUploadGitBundle(config, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var workdir, gitRoot, _i, _a, ref, refCheck, stashResult, wipStashSha, hasWip, bundlePath, maxBytes, bundle, upload, _b, _c, _d, ref;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    workdir = (_e = opts === null || opts === void 0 ? void 0 : opts.cwd) !== null && _e !== void 0 ? _e : (0, cwd_js_1.getCwd)();
                    gitRoot = (0, git_js_1.findGitRoot)(workdir);
                    if (!gitRoot) {
                        return [2 /*return*/, { success: false, error: 'Not in a git repository' }];
                    }
                    _i = 0, _a = ['refs/seed/stash', 'refs/seed/root'];
                    _g.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    ref = _a[_i];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['update-ref', '-d', ref], {
                            cwd: gitRoot,
                        })];
                case 2:
                    _g.sent();
                    _g.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['for-each-ref', '--count=1', 'refs/'], { cwd: gitRoot })];
                case 5:
                    refCheck = _g.sent();
                    if (refCheck.code === 0 && refCheck.stdout.trim() === '') {
                        (0, index_js_1.logEvent)('tengu_ccr_bundle_upload', {
                            outcome: 'empty_repo',
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Repository has no commits yet',
                                failReason: 'empty_repo',
                            }];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['stash', 'create'], { cwd: gitRoot, abortSignal: opts === null || opts === void 0 ? void 0 : opts.signal })
                        // exit 0 + empty stdout = nothing to stash. Nonzero is rare; non-fatal.
                    ];
                case 6:
                    stashResult = _g.sent();
                    wipStashSha = stashResult.code === 0 ? stashResult.stdout.trim() : '';
                    hasWip = wipStashSha !== '';
                    if (!(stashResult.code !== 0)) return [3 /*break*/, 7];
                    (0, debug_js_1.logForDebugging)("[gitBundle] git stash create failed (".concat(stashResult.code, "), proceeding without WIP: ").concat(stashResult.stderr.slice(0, 200)));
                    return [3 /*break*/, 9];
                case 7:
                    if (!hasWip) return [3 /*break*/, 9];
                    (0, debug_js_1.logForDebugging)("[gitBundle] Captured WIP as stash ".concat(wipStashSha));
                    // env-runner reads the SHA via bundle list-heads refs/seed/stash.
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['update-ref', 'refs/seed/stash', wipStashSha], { cwd: gitRoot })];
                case 8:
                    // env-runner reads the SHA via bundle list-heads refs/seed/stash.
                    _g.sent();
                    _g.label = 9;
                case 9:
                    bundlePath = (0, tempfile_js_1.generateTempFilePath)('ccr-seed', '.bundle');
                    _g.label = 10;
                case 10:
                    _g.trys.push([10, , 13, 21]);
                    maxBytes = (_f = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_ccr_bundle_max_bytes', null)) !== null && _f !== void 0 ? _f : DEFAULT_BUNDLE_MAX_BYTES;
                    return [4 /*yield*/, _bundleWithFallback(gitRoot, bundlePath, maxBytes, hasWip, opts === null || opts === void 0 ? void 0 : opts.signal)];
                case 11:
                    bundle = _g.sent();
                    if (!bundle.ok) {
                        (0, debug_js_1.logForDebugging)("[gitBundle] ".concat(bundle.error));
                        (0, index_js_1.logEvent)('tengu_ccr_bundle_upload', {
                            outcome: bundle.failReason,
                            max_bytes: maxBytes,
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: bundle.error,
                                failReason: bundle.failReason,
                            }];
                    }
                    return [4 /*yield*/, (0, filesApi_js_1.uploadFile)(bundlePath, '_source_seed.bundle', config, {
                            signal: opts === null || opts === void 0 ? void 0 : opts.signal,
                        })];
                case 12:
                    upload = _g.sent();
                    if (!upload.success) {
                        (0, index_js_1.logEvent)('tengu_ccr_bundle_upload', {
                            outcome: 'failed',
                        });
                        return [2 /*return*/, { success: false, error: upload.error }];
                    }
                    (0, debug_js_1.logForDebugging)("[gitBundle] Uploaded ".concat(upload.size, " bytes as file_id ").concat(upload.fileId));
                    (0, index_js_1.logEvent)('tengu_ccr_bundle_upload', {
                        outcome: 'success',
                        size_bytes: upload.size,
                        scope: bundle.scope,
                        has_wip: hasWip,
                    });
                    return [2 /*return*/, {
                            success: true,
                            fileId: upload.fileId,
                            bundleSizeBytes: upload.size,
                            scope: bundle.scope,
                            hasWip: hasWip,
                        }];
                case 13:
                    _g.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, (0, promises_1.unlink)(bundlePath)];
                case 14:
                    _g.sent();
                    return [3 /*break*/, 16];
                case 15:
                    _b = _g.sent();
                    (0, debug_js_1.logForDebugging)("[gitBundle] Could not delete ".concat(bundlePath, " (non-fatal)"));
                    return [3 /*break*/, 16];
                case 16:
                    _c = 0, _d = ['refs/seed/stash', 'refs/seed/root'];
                    _g.label = 17;
                case 17:
                    if (!(_c < _d.length)) return [3 /*break*/, 20];
                    ref = _d[_c];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['update-ref', '-d', ref], {
                            cwd: gitRoot,
                        })];
                case 18:
                    _g.sent();
                    _g.label = 19;
                case 19:
                    _c++;
                    return [3 /*break*/, 17];
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
}
