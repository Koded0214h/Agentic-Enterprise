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
exports.clearRepositoryCaches = clearRepositoryCaches;
exports.detectCurrentRepository = detectCurrentRepository;
exports.detectCurrentRepositoryWithHost = detectCurrentRepositoryWithHost;
exports.getCachedRepository = getCachedRepository;
exports.parseGitRemote = parseGitRemote;
exports.parseGitHubRepository = parseGitHubRepository;
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var git_js_1 = require("./git.js");
var repositoryWithHostCache = new Map();
function clearRepositoryCaches() {
    repositoryWithHostCache.clear();
}
function detectCurrentRepository() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, detectCurrentRepositoryWithHost()];
                case 1:
                    result = _a.sent();
                    if (!result)
                        return [2 /*return*/, null
                            // Only return results for github.com to avoid breaking downstream consumers
                            // that assume the result is a github.com repository.
                            // Use detectCurrentRepositoryWithHost() for GHE support.
                        ];
                    // Only return results for github.com to avoid breaking downstream consumers
                    // that assume the result is a github.com repository.
                    // Use detectCurrentRepositoryWithHost() for GHE support.
                    if (result.host !== 'github.com')
                        return [2 /*return*/, null];
                    return [2 /*return*/, "".concat(result.owner, "/").concat(result.name)];
            }
        });
    });
}
/**
 * Like detectCurrentRepository, but also returns the host (e.g. "github.com"
 * or a GHE hostname). Callers that need to construct URLs against a specific
 * GitHub host should use this variant.
 */
function detectCurrentRepositoryWithHost() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, remoteUrl, parsed, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    if (repositoryWithHostCache.has(cwd)) {
                        return [2 /*return*/, (_a = repositoryWithHostCache.get(cwd)) !== null && _a !== void 0 ? _a : null];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, git_js_1.getRemoteUrl)()];
                case 2:
                    remoteUrl = _b.sent();
                    (0, debug_js_1.logForDebugging)("Git remote URL: ".concat(remoteUrl));
                    if (!remoteUrl) {
                        (0, debug_js_1.logForDebugging)('No git remote URL found');
                        repositoryWithHostCache.set(cwd, null);
                        return [2 /*return*/, null];
                    }
                    parsed = parseGitRemote(remoteUrl);
                    (0, debug_js_1.logForDebugging)("Parsed repository: ".concat(parsed ? "".concat(parsed.host, "/").concat(parsed.owner, "/").concat(parsed.name) : null, " from URL: ").concat(remoteUrl));
                    repositoryWithHostCache.set(cwd, parsed);
                    return [2 /*return*/, parsed];
                case 3:
                    error_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("Error detecting repository: ".concat(error_1));
                    repositoryWithHostCache.set(cwd, null);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Synchronously returns the cached github.com repository for the current cwd
 * as "owner/name", or null if it hasn't been resolved yet or the host is not
 * github.com. Call detectCurrentRepository() first to populate the cache.
 *
 * Callers construct github.com URLs, so GHE hosts are filtered out here.
 */
function getCachedRepository() {
    var parsed = repositoryWithHostCache.get((0, cwd_js_1.getCwd)());
    if (!parsed || parsed.host !== 'github.com')
        return null;
    return "".concat(parsed.owner, "/").concat(parsed.name);
}
/**
 * Parses a git remote URL into host, owner, and name components.
 * Accepts any host (github.com, GHE instances, etc.).
 *
 * Supports:
 *   https://host/owner/repo.git
 *   git@host:owner/repo.git
 *   ssh://git@host/owner/repo.git
 *   git://host/owner/repo.git
 *   https://host/owner/repo (no .git)
 *
 * Note: repo names can contain dots (e.g., cc.kurs.web)
 */
function parseGitRemote(input) {
    var _a;
    var trimmed = input.trim();
    // SSH format: git@host:owner/repo.git
    var sshMatch = trimmed.match(/^git@([^:]+):([^/]+)\/([^/]+?)(?:\.git)?$/);
    if ((sshMatch === null || sshMatch === void 0 ? void 0 : sshMatch[1]) && sshMatch[2] && sshMatch[3]) {
        if (!looksLikeRealHostname(sshMatch[1]))
            return null;
        return {
            host: sshMatch[1],
            owner: sshMatch[2],
            name: sshMatch[3],
        };
    }
    // URL format: https://host/owner/repo.git, ssh://git@host/owner/repo, git://host/owner/repo
    var urlMatch = trimmed.match(/^(https?|ssh|git):\/\/(?:[^@]+@)?([^/:]+(?::\d+)?)\/([^/]+)\/([^/]+?)(?:\.git)?$/);
    if ((urlMatch === null || urlMatch === void 0 ? void 0 : urlMatch[1]) && urlMatch[2] && urlMatch[3] && urlMatch[4]) {
        var protocol = urlMatch[1];
        var hostWithPort = urlMatch[2];
        var hostWithoutPort = (_a = hostWithPort.split(':')[0]) !== null && _a !== void 0 ? _a : '';
        if (!looksLikeRealHostname(hostWithoutPort))
            return null;
        // Only preserve port for HTTPS — SSH/git ports are not usable for constructing
        // web URLs (e.g. ssh://git@ghe.corp.com:2222 → port 2222 is SSH, not HTTPS).
        var host = protocol === 'https' || protocol === 'http'
            ? hostWithPort
            : hostWithoutPort;
        return {
            host: host,
            owner: urlMatch[3],
            name: urlMatch[4],
        };
    }
    return null;
}
/**
 * Parses a git remote URL or "owner/repo" string and returns "owner/repo".
 * Only returns results for github.com hosts — GHE URLs return null.
 * Use parseGitRemote() for GHE support.
 * Also accepts plain "owner/repo" strings for backward compatibility.
 */
function parseGitHubRepository(input) {
    var trimmed = input.trim();
    // Try parsing as a full remote URL first.
    // Only return results for github.com hosts — existing callers (VS Code extension,
    // bridge) assume this function is GitHub.com-specific. Use parseGitRemote() directly
    // for GHE support.
    var parsed = parseGitRemote(trimmed);
    if (parsed) {
        if (parsed.host !== 'github.com')
            return null;
        return "".concat(parsed.owner, "/").concat(parsed.name);
    }
    // If no URL pattern matched, check if it's already in owner/repo format
    if (!trimmed.includes('://') &&
        !trimmed.includes('@') &&
        trimmed.includes('/')) {
        var parts = trimmed.split('/');
        if (parts.length === 2 && parts[0] && parts[1]) {
            // Remove .git extension if present
            var repo = parts[1].replace(/\.git$/, '');
            return "".concat(parts[0], "/").concat(repo);
        }
    }
    (0, debug_js_1.logForDebugging)("Could not parse repository from: ".concat(trimmed));
    return null;
}
/**
 * Checks whether a hostname looks like a real domain name rather than an
 * SSH config alias. A simple dot-check is not enough because aliases like
 * "github.com-work" still contain a dot. We additionally require that the
 * last segment (the TLD) is purely alphabetic — real TLDs (com, org, io, net)
 * never contain hyphens or digits.
 */
function looksLikeRealHostname(host) {
    if (!host.includes('.'))
        return false;
    var lastSegment = host.split('.').pop();
    if (!lastSegment)
        return false;
    // Real TLDs are purely alphabetic (e.g., "com", "org", "io").
    // SSH aliases like "github.com-work" have a last segment "com-work" which
    // contains a hyphen.
    return /^[a-zA-Z]+$/.test(lastSegment);
}
