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
exports.parseMarketplaceInput = parseMarketplaceInput;
var os_1 = require("os");
var path_1 = require("path");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
/**
 * Parses a marketplace input string and returns the appropriate marketplace source type.
 * Handles various input formats:
 * - Git SSH URLs (user@host:path or user@host:path.git)
 *   - Standard: git@github.com:owner/repo.git
 *   - GitHub Enterprise SSH certificates: org-123456@github.com:owner/repo.git
 *   - Custom usernames: deploy@gitlab.com:group/project.git
 *   - Self-hosted: user@192.168.10.123:path/to/repo
 * - HTTP/HTTPS URLs
 * - GitHub shorthand (owner/repo)
 * - Local file paths (.json files)
 * - Local directory paths
 *
 * @param input The marketplace source input string
 * @returns MarketplaceSource object, error object, or null if format is unrecognized
 */
function parseMarketplaceInput(input) {
    return __awaiter(this, void 0, void 0, function () {
        var trimmed, fs, sshMatch, url, ref, fragmentMatch, urlWithoutFragment, ref, url, match, gitUrl, isWindows, isWindowsPath, resolvedPath, stats, e_1, code, fragmentMatch, repo, ref;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trimmed = input.trim();
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    sshMatch = trimmed.match(/^([a-zA-Z0-9._-]+@[^:]+:.+?(?:\.git)?)(#(.+))?$/);
                    if (sshMatch === null || sshMatch === void 0 ? void 0 : sshMatch[1]) {
                        url = sshMatch[1];
                        ref = sshMatch[3];
                        return [2 /*return*/, ref ? { source: 'git', url: url, ref: ref } : { source: 'git', url: url }];
                    }
                    // Handle URLs
                    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                        fragmentMatch = trimmed.match(/^([^#]+)(#(.+))?$/);
                        urlWithoutFragment = (fragmentMatch === null || fragmentMatch === void 0 ? void 0 : fragmentMatch[1]) || trimmed;
                        ref = fragmentMatch === null || fragmentMatch === void 0 ? void 0 : fragmentMatch[3];
                        // When user explicitly provides an HTTPS/HTTP URL that looks like a git
                        // repo, use the git source type so we clone rather than fetch-as-JSON.
                        // The .git suffix is a GitHub/GitLab/Bitbucket convention. Azure DevOps
                        // uses /_git/ in the path with NO suffix (appending .git breaks ADO:
                        // TF401019 "repo does not exist"). Without this check, an ADO URL falls
                        // through to source:'url' below, which tries to fetch it as a raw
                        // marketplace.json — the HTML response parses as "expected object,
                        // received string". (gh-31256 / CC-299)
                        if (urlWithoutFragment.endsWith('.git') ||
                            urlWithoutFragment.includes('/_git/')) {
                            return [2 /*return*/, ref
                                    ? { source: 'git', url: urlWithoutFragment, ref: ref }
                                    : { source: 'git', url: urlWithoutFragment }];
                        }
                        url = void 0;
                        try {
                            url = new URL(urlWithoutFragment);
                        }
                        catch (_err) {
                            // Not a valid URL for parsing, treat as generic URL
                            // new URL() throws TypeError for invalid URLs
                            return [2 /*return*/, { source: 'url', url: urlWithoutFragment }];
                        }
                        if (url.hostname === 'github.com' || url.hostname === 'www.github.com') {
                            match = url.pathname.match(/^\/([^/]+\/[^/]+?)(\/|\.git|$)/);
                            if (match === null || match === void 0 ? void 0 : match[1]) {
                                gitUrl = urlWithoutFragment.endsWith('.git')
                                    ? urlWithoutFragment
                                    : "".concat(urlWithoutFragment, ".git");
                                return [2 /*return*/, ref
                                        ? { source: 'git', url: gitUrl, ref: ref }
                                        : { source: 'git', url: gitUrl }];
                            }
                        }
                        return [2 /*return*/, { source: 'url', url: urlWithoutFragment }];
                    }
                    isWindows = process.platform === 'win32';
                    isWindowsPath = isWindows &&
                        (trimmed.startsWith('.\\') ||
                            trimmed.startsWith('..\\') ||
                            /^[a-zA-Z]:[/\\]/.test(trimmed));
                    if (!(trimmed.startsWith('./') ||
                        trimmed.startsWith('../') ||
                        trimmed.startsWith('/') ||
                        trimmed.startsWith('~') ||
                        isWindowsPath)) return [3 /*break*/, 5];
                    resolvedPath = (0, path_1.resolve)(trimmed.startsWith('~') ? trimmed.replace(/^~/, (0, os_1.homedir)()) : trimmed);
                    stats = void 0;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.stat(resolvedPath)];
                case 2:
                    stats = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    return [2 /*return*/, {
                            error: code === 'ENOENT'
                                ? "Path does not exist: ".concat(resolvedPath)
                                : "Cannot access path: ".concat(resolvedPath, " (").concat(code !== null && code !== void 0 ? code : e_1, ")"),
                        }];
                case 4:
                    if (stats.isFile()) {
                        if (resolvedPath.endsWith('.json')) {
                            return [2 /*return*/, { source: 'file', path: resolvedPath }];
                        }
                        else {
                            return [2 /*return*/, {
                                    error: "File path must point to a .json file (marketplace.json), but got: ".concat(resolvedPath),
                                }];
                        }
                    }
                    else if (stats.isDirectory()) {
                        return [2 /*return*/, { source: 'directory', path: resolvedPath }];
                    }
                    else {
                        return [2 /*return*/, {
                                error: "Path is neither a file nor a directory: ".concat(resolvedPath),
                            }];
                    }
                    _a.label = 5;
                case 5:
                    // Handle GitHub shorthand (owner/repo, owner/repo#ref, or owner/repo@ref)
                    // Accept both # and @ as ref separators — the display formatter uses @, so users
                    // naturally type @ when copying from error messages or managed settings.
                    if (trimmed.includes('/') && !trimmed.startsWith('@')) {
                        if (trimmed.includes(':')) {
                            return [2 /*return*/, null];
                        }
                        fragmentMatch = trimmed.match(/^([^#@]+)(?:[#@](.+))?$/);
                        repo = (fragmentMatch === null || fragmentMatch === void 0 ? void 0 : fragmentMatch[1]) || trimmed;
                        ref = fragmentMatch === null || fragmentMatch === void 0 ? void 0 : fragmentMatch[2];
                        // Assume it's a GitHub repo
                        return [2 /*return*/, ref ? { source: 'github', repo: repo, ref: ref } : { source: 'github', repo: repo }];
                    }
                    // NPM packages not yet implemented
                    // Returning null for unrecognized input
                    return [2 /*return*/, null];
            }
        });
    });
}
