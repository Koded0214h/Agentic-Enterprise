"use strict";
/**
 * Marketplace reconciler — makes known_marketplaces.json consistent with
 * declared intent in settings.
 *
 * Two layers:
 * - diffMarketplaces(): comparison (reads .git for worktree canonicalization, memoized)
 * - reconcileMarketplaces(): bundled diff + install (I/O, idempotent, additive)
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
exports.diffMarketplaces = diffMarketplaces;
exports.reconcileMarketplaces = reconcileMarketplaces;
var isEqual_js_1 = require("lodash-es/isEqual.js");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var file_js_1 = require("../file.js");
var git_js_1 = require("../git.js");
var log_js_1 = require("../log.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var schemas_js_1 = require("./schemas.js");
/**
 * Compare declared intent (settings) against materialized state (JSON).
 *
 * Resolves relative directory/file paths in `declared` before comparing,
 * so project settings with `./path` match JSON's absolute path. Path
 * resolution reads `.git` to canonicalize worktree paths (memoized).
 */
function diffMarketplaces(declared, materialized, opts) {
    var missing = [];
    var sourceChanged = [];
    var upToDate = [];
    for (var _i = 0, _a = Object.entries(declared); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], intent = _b[1];
        var state = materialized[name_1];
        var normalizedIntent = normalizeSource(intent.source, opts === null || opts === void 0 ? void 0 : opts.projectRoot);
        if (!state) {
            missing.push(name_1);
        }
        else if (intent.sourceIsFallback) {
            // Fallback: presence suffices. Don't compare sources — the declared source
            // is only a default for the `missing` branch. If seed/prior-install/mirror
            // materialized this marketplace under ANY source, leave it alone. Comparing
            // would report sourceChanged → re-clone → stomp the materialized content.
            upToDate.push(name_1);
        }
        else if (!(0, isEqual_js_1.default)(normalizedIntent, state.source)) {
            sourceChanged.push({
                name: name_1,
                declaredSource: normalizedIntent,
                materializedSource: state.source,
            });
        }
        else {
            upToDate.push(name_1);
        }
    }
    return { missing: missing, sourceChanged: sourceChanged, upToDate: upToDate };
}
/**
 * Make known_marketplaces.json consistent with declared intent.
 * Idempotent. Additive only (never deletes). Does not touch AppState.
 */
function reconcileMarketplaces(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var declared, materialized, e_1, diff, work, skipped, toProcess, _i, work_1, item, _a, installed, updated, failed, i, _b, name_2, source, action, result, e_2, error;
        var _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    declared = (0, marketplaceManager_js_1.getDeclaredMarketplaces)();
                    if (Object.keys(declared).length === 0) {
                        return [2 /*return*/, { installed: [], updated: [], failed: [], upToDate: [], skipped: [] }];
                    }
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 2:
                    materialized = _g.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _g.sent();
                    (0, log_js_1.logError)(e_1);
                    materialized = {};
                    return [3 /*break*/, 4];
                case 4:
                    diff = diffMarketplaces(declared, materialized, {
                        projectRoot: (0, state_js_1.getOriginalCwd)(),
                    });
                    work = __spreadArray(__spreadArray([], diff.missing.map(function (name) { return ({
                        name: name,
                        source: normalizeSource(declared[name].source),
                        action: 'install',
                    }); }), true), diff.sourceChanged.map(function (_a) {
                        var name = _a.name, declaredSource = _a.declaredSource;
                        return ({
                            name: name,
                            source: declaredSource,
                            action: 'update',
                        });
                    }), true);
                    skipped = [];
                    toProcess = [];
                    _i = 0, work_1 = work;
                    _g.label = 5;
                case 5:
                    if (!(_i < work_1.length)) return [3 /*break*/, 9];
                    item = work_1[_i];
                    if ((_c = opts === null || opts === void 0 ? void 0 : opts.skip) === null || _c === void 0 ? void 0 : _c.call(opts, item.name, item.source)) {
                        skipped.push(item.name);
                        return [3 /*break*/, 8];
                    }
                    _a = item.action === 'update' &&
                        (0, schemas_js_1.isLocalMarketplaceSource)(item.source);
                    if (!_a) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(item.source.path)];
                case 6:
                    _a = !(_g.sent());
                    _g.label = 7;
                case 7:
                    // For sourceChanged local-path entries, skip if the declared path doesn't
                    // exist. Guards multi-checkout scenarios where normalizeSource can't
                    // canonicalize and produces a dead path — the materialized entry may still
                    // be valid; addMarketplaceSource would fail anyway, so skipping avoids a
                    // noisy "failed" event and preserves the working entry. Missing entries
                    // are NOT skipped (nothing to preserve; the user should see the error).
                    if (_a) {
                        (0, debug_js_1.logForDebugging)("[reconcile] '".concat(item.name, "' declared path does not exist; keeping materialized entry"));
                        skipped.push(item.name);
                        return [3 /*break*/, 8];
                    }
                    toProcess.push(item);
                    _g.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 5];
                case 9:
                    if (toProcess.length === 0) {
                        return [2 /*return*/, {
                                installed: [],
                                updated: [],
                                failed: [],
                                upToDate: diff.upToDate,
                                skipped: skipped,
                            }];
                    }
                    (0, debug_js_1.logForDebugging)("[reconcile] ".concat(toProcess.length, " marketplace(s): ").concat(toProcess.map(function (w) { return "".concat(w.name, "(").concat(w.action, ")"); }).join(', ')));
                    installed = [];
                    updated = [];
                    failed = [];
                    i = 0;
                    _g.label = 10;
                case 10:
                    if (!(i < toProcess.length)) return [3 /*break*/, 15];
                    _b = toProcess[i], name_2 = _b.name, source = _b.source, action = _b.action;
                    (_d = opts === null || opts === void 0 ? void 0 : opts.onProgress) === null || _d === void 0 ? void 0 : _d.call(opts, {
                        type: 'installing',
                        name: name_2,
                        action: action,
                        index: i + 1,
                        total: toProcess.length,
                    });
                    _g.label = 11;
                case 11:
                    _g.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.addMarketplaceSource)(source)];
                case 12:
                    result = _g.sent();
                    if (action === 'install')
                        installed.push(name_2);
                    else
                        updated.push(name_2);
                    (_e = opts === null || opts === void 0 ? void 0 : opts.onProgress) === null || _e === void 0 ? void 0 : _e.call(opts, {
                        type: 'installed',
                        name: name_2,
                        alreadyMaterialized: result.alreadyMaterialized,
                    });
                    return [3 /*break*/, 14];
                case 13:
                    e_2 = _g.sent();
                    error = (0, errors_js_1.errorMessage)(e_2);
                    failed.push({ name: name_2, error: error });
                    (_f = opts === null || opts === void 0 ? void 0 : opts.onProgress) === null || _f === void 0 ? void 0 : _f.call(opts, { type: 'failed', name: name_2, error: error });
                    (0, log_js_1.logError)(e_2);
                    return [3 /*break*/, 14];
                case 14:
                    i++;
                    return [3 /*break*/, 10];
                case 15: return [2 /*return*/, { installed: installed, updated: updated, failed: failed, upToDate: diff.upToDate, skipped: skipped }];
            }
        });
    });
}
/**
 * Resolve relative directory/file paths for stable comparison.
 * Settings declared at project scope may use project-relative paths;
 * JSON stores absolute paths.
 *
 * For git worktrees, resolve against the main checkout (canonical root)
 * instead of the worktree cwd. Project settings are checked into git,
 * so `./foo` means "relative to this repo" — but known_marketplaces.json is
 * user-global with one entry per marketplace name. Resolving against the
 * worktree cwd means each worktree session overwrites the shared entry with
 * its own absolute path, and deleting the worktree leaves a dead
 * installLocation. The canonical root is stable across all worktrees.
 */
function normalizeSource(source, projectRoot) {
    if ((source.source === 'directory' || source.source === 'file') &&
        !(0, path_1.isAbsolute)(source.path)) {
        var base = projectRoot !== null && projectRoot !== void 0 ? projectRoot : (0, state_js_1.getOriginalCwd)();
        var canonicalRoot = (0, git_js_1.findCanonicalGitRoot)(base);
        return __assign(__assign({}, source), { path: (0, path_1.resolve)(canonicalRoot !== null && canonicalRoot !== void 0 ? canonicalRoot : base, source.path) });
    }
    return source;
}
