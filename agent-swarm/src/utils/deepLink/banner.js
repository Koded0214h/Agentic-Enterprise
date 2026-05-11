"use strict";
/**
 * Deep Link Origin Banner
 *
 * Builds the warning text shown when a session was opened by an external
 * claude-cli:// deep link. Linux xdg-open and browsers with "always allow"
 * set dispatch the link with no OS-level confirmation, so the application
 * provides its own provenance signal — mirroring claude.ai's security
 * interstitial for external-source prefills.
 *
 * The user must press Enter to submit; this banner primes them to read the
 * prompt (which may use homoglyphs or padding to hide instructions) and
 * notice which directory — and therefore which CLAUDE.md — was loaded.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeepLinkBanner = buildDeepLinkBanner;
exports.readLastFetchTime = readLastFetchTime;
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var format_js_1 = require("../format.js");
var gitFilesystem_js_1 = require("../git/gitFilesystem.js");
var git_js_1 = require("../git.js");
var STALE_FETCH_WARN_MS = 7 * 24 * 60 * 60 * 1000;
/**
 * Above this length, a pre-filled prompt no longer fits on one screen
 * (~12-15 lines on an 80-col terminal). The banner switches from "review
 * carefully" to an explicit "scroll to review the entire prompt" so a
 * malicious tail buried past line 60 isn't silently off-screen.
 */
var LONG_PREFILL_THRESHOLD = 1000;
/**
 * Build the multi-line warning banner for a deep-link-originated session.
 *
 * Always shows the working directory so the user can see which CLAUDE.md
 * will load. When the link pre-filled a prompt, adds a second line prompting
 * the user to review it — the prompt itself is visible in the input box.
 *
 * When the cwd was resolved from a ?repo= slug, also shows the slug and the
 * clone's last-fetch age so the user knows which local clone was selected
 * and whether its CLAUDE.md may be stale relative to upstream.
 */
function buildDeepLinkBanner(info) {
    var lines = [
        "This session was opened by an external deep link in ".concat(tildify(info.cwd)),
    ];
    if (info.repo) {
        var age = info.lastFetch ? (0, format_js_1.formatRelativeTimeAgo)(info.lastFetch) : 'never';
        var stale = !info.lastFetch ||
            Date.now() - info.lastFetch.getTime() > STALE_FETCH_WARN_MS;
        lines.push("Resolved ".concat(info.repo, " from local clones \u00B7 last fetched ").concat(age).concat(stale ? ' — CLAUDE.md may be stale' : ''));
    }
    if (info.prefillLength) {
        lines.push(info.prefillLength > LONG_PREFILL_THRESHOLD
            ? "The prompt below (".concat((0, format_js_1.formatNumber)(info.prefillLength), " chars) was supplied by the link \u2014 scroll to review the entire prompt before pressing Enter.")
            : 'The prompt below was supplied by the link — review carefully before pressing Enter.');
    }
    return lines.join('\n');
}
/**
 * Read the mtime of .git/FETCH_HEAD, which git updates on every fetch or
 * pull. Returns undefined if the directory is not a git repo or has never
 * been fetched.
 *
 * FETCH_HEAD is per-worktree — fetching from the main worktree does not
 * touch a sibling worktree's FETCH_HEAD. When cwd is a worktree, we check
 * both and return whichever is newer so a recently-fetched main repo
 * doesn't read as "never fetched" just because the deep link landed in
 * a worktree.
 */
function readLastFetchTime(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, commonDir, _a, local, common;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getGitDir)(cwd)];
                case 1:
                    gitDir = _b.sent();
                    if (!gitDir)
                        return [2 /*return*/, undefined];
                    return [4 /*yield*/, (0, gitFilesystem_js_1.getCommonDir)(gitDir)];
                case 2:
                    commonDir = _b.sent();
                    return [4 /*yield*/, Promise.all([
                            mtimeOrUndefined((0, path_1.join)(gitDir, 'FETCH_HEAD')),
                            commonDir
                                ? mtimeOrUndefined((0, path_1.join)(commonDir, 'FETCH_HEAD'))
                                : Promise.resolve(undefined),
                        ])];
                case 3:
                    _a = _b.sent(), local = _a[0], common = _a[1];
                    if (local && common)
                        return [2 /*return*/, local > common ? local : common];
                    return [2 /*return*/, local !== null && local !== void 0 ? local : common];
            }
        });
    });
}
function mtimeOrUndefined(p) {
    return __awaiter(this, void 0, void 0, function () {
        var mtime, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(p)];
                case 1:
                    mtime = (_b.sent()).mtime;
                    return [2 /*return*/, mtime];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Shorten home-dir-prefixed paths to ~ notation for the banner.
 * Not using getDisplayPath() because cwd is the current working directory,
 * so the relative-path branch would collapse it to the empty string.
 */
function tildify(p) {
    var home = (0, os_1.homedir)();
    if (p === home)
        return '~';
    if (p.startsWith(home + path_1.sep))
        return '~' + p.slice(home.length);
    return p;
}
