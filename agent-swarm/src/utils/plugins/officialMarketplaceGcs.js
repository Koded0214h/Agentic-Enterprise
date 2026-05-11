"use strict";
/**
 * inc-5046: fetch the official marketplace from a GCS mirror instead of
 * git-cloning GitHub on every startup.
 *
 * Backend (anthropic#317037) publishes a marketplace-only zip alongside the
 * titanium squashfs, keyed by base repo SHA. This module fetches the `latest`
 * pointer, compares against a local sentinel, and downloads+extracts the zip
 * when there's a new SHA. Callers decide fallback behavior on failure.
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
exports.fetchOfficialMarketplaceFromGcs = fetchOfficialMarketplaceFromGcs;
exports.classifyGcsError = classifyGcsError;
var axios_1 = require("axios");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var debug_js_1 = require("../debug.js");
var zip_js_1 = require("../dxt/zip.js");
var errors_js_1 = require("../errors.js");
// CDN-fronted domain for the public GCS bucket (same bucket the native
// binary ships from — nativeInstaller/download.ts:24 uses the raw GCS URL).
// `{sha}.zip` is content-addressed so CDN can cache it indefinitely;
// `latest` has Cache-Control: max-age=300 so CDN staleness is bounded.
// Backend (anthropic#317037) populates this prefix.
var GCS_BASE = 'https://downloads.claude.ai/claude-code-releases/plugins/claude-plugins-official';
// Zip arc paths are seed-dir-relative (marketplaces/claude-plugins-official/…)
// so the titanium seed machinery can use the same zip. Strip this prefix when
// extracting for a laptop install.
var ARC_PREFIX = 'marketplaces/claude-plugins-official/';
/**
 * Fetch the official marketplace from GCS and extract to installLocation.
 * Idempotent — checks a `.gcs-sha` sentinel before downloading the ~3.5MB zip.
 *
 * @param installLocation where to extract (must be inside marketplacesCacheDir)
 * @param marketplacesCacheDir the plugins marketplace cache root — passed in
 *   by callers (rather than imported from pluginDirectories) to break a
 *   circular-dep edge through marketplaceManager
 * @returns the fetched SHA on success (including no-op), null on any failure
 *   (network, 404, zip parse). Caller decides whether to fall through to git.
 */
function fetchOfficialMarketplaceFromGcs(installLocation, marketplacesCacheDir) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheDir, resolvedLoc, start, outcome, sha, bytes, errKind, latest, sentinelPath, currentSha, zipResp, zipBuf, files, modes, staging, _i, _a, _b, arcPath, data, rel, dest, mode, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cacheDir = (0, path_1.resolve)(marketplacesCacheDir);
                    resolvedLoc = (0, path_1.resolve)(installLocation);
                    if (resolvedLoc !== cacheDir && !resolvedLoc.startsWith(cacheDir + path_1.sep)) {
                        (0, debug_js_1.logForDebugging)("fetchOfficialMarketplaceFromGcs: refusing path outside cache dir: ".concat(installLocation), { level: 'error' });
                        return [2 /*return*/, null];
                    }
                    // Network + zip extraction competes for the event loop with scroll frames.
                    // This is a fire-and-forget startup call — delaying by a few hundred ms
                    // until scroll settles is invisible to the user.
                    return [4 /*yield*/, (0, state_js_1.waitForScrollIdle)()];
                case 1:
                    // Network + zip extraction competes for the event loop with scroll frames.
                    // This is a fire-and-forget startup call — delaying by a few hundred ms
                    // until scroll settles is invisible to the user.
                    _c.sent();
                    start = performance.now();
                    outcome = 'failed';
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 18, 19, 20]);
                    return [4 /*yield*/, axios_1.default.get("".concat(GCS_BASE, "/latest"), {
                            responseType: 'text',
                            timeout: 10000,
                        })];
                case 3:
                    latest = _c.sent();
                    sha = String(latest.data).trim();
                    if (!sha) {
                        // Empty /latest body — backend misconfigured. Bail (null), don't
                        // lock into a permanently-broken empty-sentinel state.
                        throw new Error('latest pointer returned empty body');
                    }
                    sentinelPath = (0, path_1.join)(installLocation, '.gcs-sha');
                    return [4 /*yield*/, (0, promises_1.readFile)(sentinelPath, 'utf8').then(function (s) { return s.trim(); }, function () { return null; })];
                case 4:
                    currentSha = _c.sent();
                    if (currentSha === sha) {
                        outcome = 'noop';
                        return [2 /*return*/, sha];
                    }
                    return [4 /*yield*/, axios_1.default.get("".concat(GCS_BASE, "/").concat(sha, ".zip"), {
                            responseType: 'arraybuffer',
                            timeout: 60000,
                        })];
                case 5:
                    zipResp = _c.sent();
                    zipBuf = Buffer.from(zipResp.data);
                    bytes = zipBuf.length;
                    return [4 /*yield*/, (0, zip_js_1.unzipFile)(zipBuf)
                        // fflate doesn't surface external_attr, so parse the central directory
                        // ourselves to recover exec bits. Without this, hooks/scripts extract as
                        // 0644 and `sh -c "/path/script.sh"` (hooks.ts:~1002) fails with EACCES
                        // on Unix. Git-clone preserves +x natively; this keeps GCS at parity.
                    ];
                case 6:
                    files = _c.sent();
                    modes = (0, zip_js_1.parseZipModes)(zipBuf);
                    staging = "".concat(installLocation, ".staging");
                    return [4 /*yield*/, (0, promises_1.rm)(staging, { recursive: true, force: true })];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.mkdir)(staging, { recursive: true })];
                case 8:
                    _c.sent();
                    _i = 0, _a = Object.entries(files);
                    _c.label = 9;
                case 9:
                    if (!(_i < _a.length)) return [3 /*break*/, 14];
                    _b = _a[_i], arcPath = _b[0], data = _b[1];
                    if (!arcPath.startsWith(ARC_PREFIX))
                        return [3 /*break*/, 13];
                    rel = arcPath.slice(ARC_PREFIX.length);
                    if (!rel || rel.endsWith('/'))
                        return [3 /*break*/, 13]; // prefix dir entry or subdir entry
                    dest = (0, path_1.join)(staging, rel);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(dest), { recursive: true })];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(dest, data)];
                case 11:
                    _c.sent();
                    mode = modes[arcPath];
                    if (!(mode && mode & 73)) return [3 /*break*/, 13];
                    // Only chmod when an exec bit is set — skip plain files to save syscalls.
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    return [4 /*yield*/, (0, promises_1.chmod)(dest, mode & 511).catch(function () { })];
                case 12:
                    // Only chmod when an exec bit is set — skip plain files to save syscalls.
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    _c.sent();
                    _c.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 9];
                case 14: return [4 /*yield*/, (0, promises_1.writeFile)((0, path_1.join)(staging, '.gcs-sha'), sha)
                    // Atomic swap: rm old, rename staging. Brief window where installLocation
                    // doesn't exist — acceptable for a background refresh (caller retries next
                    // startup if it crashes here).
                ];
                case 15:
                    _c.sent();
                    // Atomic swap: rm old, rename staging. Brief window where installLocation
                    // doesn't exist — acceptable for a background refresh (caller retries next
                    // startup if it crashes here).
                    return [4 /*yield*/, (0, promises_1.rm)(installLocation, { recursive: true, force: true })];
                case 16:
                    // Atomic swap: rm old, rename staging. Brief window where installLocation
                    // doesn't exist — acceptable for a background refresh (caller retries next
                    // startup if it crashes here).
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.rename)(staging, installLocation)];
                case 17:
                    _c.sent();
                    outcome = 'updated';
                    return [2 /*return*/, sha];
                case 18:
                    e_1 = _c.sent();
                    errKind = classifyGcsError(e_1);
                    (0, debug_js_1.logForDebugging)("Official marketplace GCS fetch failed: ".concat((0, errors_js_1.errorMessage)(e_1)), { level: 'warn' });
                    return [2 /*return*/, null];
                case 19:
                    // tengu_plugin_remote_fetch schema shared with the telemetry PR
                    // (.daisy/inc-5046/index.md) — adds source:'marketplace_gcs'. All string
                    // values below are static enums or a git SHA — not code/filepaths/PII.
                    (0, index_js_1.logEvent)('tengu_plugin_remote_fetch', __assign(__assign(__assign({ source: 'marketplace_gcs', host: 'downloads.claude.ai', is_official: true, outcome: outcome, duration_ms: Math.round(performance.now() - start) }, (bytes !== undefined && { bytes: bytes })), (sha && { sha: sha })), (errKind && { error_kind: errKind })));
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/];
            }
        });
    });
}
// Bounded set of errno codes we report by name. Anything else buckets as
// fs_other to keep dashboard cardinality tractable.
var KNOWN_FS_CODES = new Set([
    'ENOSPC',
    'EACCES',
    'EPERM',
    'EXDEV',
    'EBUSY',
    'ENOENT',
    'ENOTDIR',
    'EROFS',
    'EMFILE',
    'ENAMETOOLONG',
]);
/**
 * Classify a GCS fetch error into a stable telemetry bucket.
 *
 * Telemetry from v2.1.83+ showed 50% of failures landing in 'other' — and
 * 99.99% of those had both sha+bytes set, meaning download succeeded but
 * extraction/fs failed. This splits that bucket so we can see whether the
 * failures are fixable (wrong staging dir, cross-device rename) or inherent
 * (disk full, permission denied) before flipping the git-fallback kill switch.
 */
function classifyGcsError(e) {
    if (axios_1.default.isAxiosError(e)) {
        if (e.code === 'ECONNABORTED')
            return 'timeout';
        if (e.response)
            return "http_".concat(e.response.status);
        return 'network';
    }
    var code = (0, errors_js_1.getErrnoCode)(e);
    // Node fs errno codes are E<UPPERCASE> (ENOSPC, EACCES). Axios also sets
    // .code (ERR_NETWORK, ERR_BAD_OPTION, EPROTO) — don't bucket those as fs.
    if (code && /^E[A-Z]+$/.test(code) && !code.startsWith('ERR_')) {
        return KNOWN_FS_CODES.has(code) ? "fs_".concat(code) : 'fs_other';
    }
    // fflate sets numeric .code (0-14) on inflate/unzip errors — catches
    // deflate-level corruption ("unexpected EOF", "invalid block type") that
    // the message regex misses.
    if (typeof (e === null || e === void 0 ? void 0 : e.code) === 'number')
        return 'zip_parse';
    var msg = (0, errors_js_1.errorMessage)(e);
    if (/unzip|invalid zip|central directory/i.test(msg))
        return 'zip_parse';
    if (/empty body/.test(msg))
        return 'empty_latest';
    return 'other';
}
