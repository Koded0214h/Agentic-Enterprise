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
exports.formatFailureDetails = formatFailureDetails;
exports.getMarketplaceSourceDisplay = getMarketplaceSourceDisplay;
exports.createPluginId = createPluginId;
exports.loadMarketplacesWithGracefulDegradation = loadMarketplacesWithGracefulDegradation;
exports.formatMarketplaceLoadingErrors = formatMarketplaceLoadingErrors;
exports.getStrictKnownMarketplaces = getStrictKnownMarketplaces;
exports.getBlockedMarketplaces = getBlockedMarketplaces;
exports.getPluginTrustMessage = getPluginTrustMessage;
exports.extractHostFromSource = extractHostFromSource;
exports.getHostPatternsFromAllowlist = getHostPatternsFromAllowlist;
exports.isSourceInBlocklist = isSourceInBlocklist;
exports.isSourceAllowedByPolicy = isSourceAllowedByPolicy;
exports.formatSourceForDisplay = formatSourceForDisplay;
exports.detectEmptyMarketplaceReason = detectEmptyMarketplaceReason;
var isEqual_js_1 = require("lodash-es/isEqual.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var settings_js_1 = require("../settings/settings.js");
var stringUtils_js_1 = require("../stringUtils.js");
var gitAvailability_js_1 = require("./gitAvailability.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
/**
 * Format plugin failure details for user display
 * @param failures - Array of failures with names and reasons
 * @param includeReasons - Whether to include failure reasons (true for full errors, false for summaries)
 * @returns Formatted string like "plugin-a (reason); plugin-b (reason)" or "plugin-a, plugin-b"
 */
function formatFailureDetails(failures, includeReasons) {
    var maxShow = 2;
    var details = failures
        .slice(0, maxShow)
        .map(function (f) {
        var reason = f.reason || f.error || 'unknown error';
        return includeReasons ? "".concat(f.name, " (").concat(reason, ")") : f.name;
    })
        .join(includeReasons ? '; ' : ', ');
    var remaining = failures.length - maxShow;
    var moreText = remaining > 0 ? " and ".concat(remaining, " more") : '';
    return "".concat(details).concat(moreText);
}
/**
 * Extract source display string from marketplace configuration
 */
function getMarketplaceSourceDisplay(source) {
    switch (source.source) {
        case 'github':
            return source.repo;
        case 'url':
            return source.url;
        case 'git':
            return source.url;
        case 'directory':
            return source.path;
        case 'file':
            return source.path;
        case 'settings':
            return "settings:".concat(source.name);
        default:
            return 'Unknown source';
    }
}
/**
 * Create a plugin ID from plugin name and marketplace name
 */
function createPluginId(pluginName, marketplaceName) {
    return "".concat(pluginName, "@").concat(marketplaceName);
}
/**
 * Load marketplaces with graceful degradation for individual failures.
 * Blocked marketplaces (per enterprise policy) are excluded from the results.
 */
function loadMarketplacesWithGracefulDegradation(config) {
    return __awaiter(this, void 0, void 0, function () {
        var marketplaces, failures, _i, _a, _b, name_1, marketplaceConfig, data, err_1, errorMessage;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    marketplaces = [];
                    failures = [];
                    _i = 0, _a = Object.entries(config);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], name_1 = _b[0], marketplaceConfig = _b[1];
                    // Skip marketplaces blocked by enterprise policy
                    if (!isSourceAllowedByPolicy(marketplaceConfig.source)) {
                        return [3 /*break*/, 6];
                    }
                    data = null;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplace)(name_1)];
                case 3:
                    data = _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _c.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : String(err_1);
                    failures.push({ name: name_1, error: errorMessage });
                    // Log for monitoring
                    (0, log_js_1.logError)((0, errors_js_1.toError)(err_1));
                    return [3 /*break*/, 5];
                case 5:
                    marketplaces.push({
                        name: name_1,
                        config: marketplaceConfig,
                        data: data,
                    });
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, { marketplaces: marketplaces, failures: failures }];
            }
        });
    });
}
/**
 * Format marketplace loading failures into appropriate user messages
 */
function formatMarketplaceLoadingErrors(failures, successCount) {
    if (failures.length === 0) {
        return null;
    }
    // If some marketplaces succeeded, show warning
    if (successCount > 0) {
        var message = failures.length === 1
            ? "Warning: Failed to load marketplace '".concat(failures[0].name, "': ").concat(failures[0].error)
            : "Warning: Failed to load ".concat(failures.length, " marketplaces: ").concat(formatFailureNames(failures));
        return { type: 'warning', message: message };
    }
    // All marketplaces failed - this is a critical error
    return {
        type: 'error',
        message: "Failed to load all marketplaces. Errors: ".concat(formatFailureErrors(failures)),
    };
}
function formatFailureNames(failures) {
    return failures.map(function (f) { return f.name; }).join(', ');
}
function formatFailureErrors(failures) {
    return failures.map(function (f) { return "".concat(f.name, ": ").concat(f.error); }).join('; ');
}
/**
 * Get the strict marketplace source allowlist from policy settings.
 * Returns null if no restriction is in place, or an array of allowed sources.
 */
function getStrictKnownMarketplaces() {
    var policySettings = (0, settings_js_1.getSettingsForSource)('policySettings');
    if (!(policySettings === null || policySettings === void 0 ? void 0 : policySettings.strictKnownMarketplaces)) {
        return null; // No restrictions
    }
    return policySettings.strictKnownMarketplaces;
}
/**
 * Get the marketplace source blocklist from policy settings.
 * Returns null if no blocklist is in place, or an array of blocked sources.
 */
function getBlockedMarketplaces() {
    var policySettings = (0, settings_js_1.getSettingsForSource)('policySettings');
    if (!(policySettings === null || policySettings === void 0 ? void 0 : policySettings.blockedMarketplaces)) {
        return null; // No blocklist
    }
    return policySettings.blockedMarketplaces;
}
/**
 * Get the custom plugin trust message from policy settings.
 * Returns undefined if not configured.
 */
function getPluginTrustMessage() {
    var _a;
    return (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.pluginTrustMessage;
}
/**
 * Compare two MarketplaceSource objects for equality.
 * Sources are equal if they have the same type and all relevant fields match.
 */
function areSourcesEqual(a, b) {
    if (a.source !== b.source)
        return false;
    switch (a.source) {
        case 'url':
            return a.url === b.url;
        case 'github':
            return (a.repo === b.repo &&
                (a.ref || undefined) === (b.ref || undefined) &&
                (a.path || undefined) === (b.path || undefined));
        case 'git':
            return (a.url === b.url &&
                (a.ref || undefined) === (b.ref || undefined) &&
                (a.path || undefined) === (b.path || undefined));
        case 'npm':
            return a.package === b.package;
        case 'file':
            return a.path === b.path;
        case 'directory':
            return a.path === b.path;
        case 'settings':
            return (a.name === b.name &&
                (0, isEqual_js_1.default)(a.plugins, b.plugins));
        default:
            return false;
    }
}
/**
 * Extract the host/domain from a marketplace source.
 * Used for hostPattern matching in strictKnownMarketplaces.
 *
 * Currently only supports github, git, and url sources.
 * npm, file, and directory sources are not supported for hostPattern matching.
 *
 * @param source - The marketplace source to extract host from
 * @returns The hostname string, or null if extraction fails or source type not supported
 */
function extractHostFromSource(source) {
    switch (source.source) {
        case 'github':
            // GitHub shorthand always means github.com
            return 'github.com';
        case 'git': {
            // SSH format: user@HOST:path (e.g., git@github.com:owner/repo.git)
            var sshMatch = source.url.match(/^[^@]+@([^:]+):/);
            if (sshMatch === null || sshMatch === void 0 ? void 0 : sshMatch[1]) {
                return sshMatch[1];
            }
            // HTTPS format: extract hostname from URL
            try {
                return new URL(source.url).hostname;
            }
            catch (_a) {
                return null;
            }
        }
        case 'url':
            try {
                return new URL(source.url).hostname;
            }
            catch (_b) {
                return null;
            }
        // npm, file, directory, hostPattern, pathPattern sources are not supported for hostPattern matching
        default:
            return null;
    }
}
/**
 * Check if a source matches a hostPattern entry.
 * Extracts the host from the source and tests it against the regex pattern.
 *
 * @param source - The marketplace source to check
 * @param pattern - The hostPattern entry from strictKnownMarketplaces
 * @returns true if the source's host matches the pattern
 */
function doesSourceMatchHostPattern(source, pattern) {
    var host = extractHostFromSource(source);
    if (!host) {
        return false;
    }
    try {
        var regex = new RegExp(pattern.hostPattern);
        return regex.test(host);
    }
    catch (_a) {
        // Invalid regex - log and return false
        (0, log_js_1.logError)(new Error("Invalid hostPattern regex: ".concat(pattern.hostPattern)));
        return false;
    }
}
/**
 * Check if a source matches a pathPattern entry.
 * Tests the source's .path (file and directory sources only) against the regex pattern.
 *
 * @param source - The marketplace source to check
 * @param pattern - The pathPattern entry from strictKnownMarketplaces
 * @returns true if the source's path matches the pattern
 */
function doesSourceMatchPathPattern(source, pattern) {
    // Only file and directory sources have a .path to match against
    if (source.source !== 'file' && source.source !== 'directory') {
        return false;
    }
    try {
        var regex = new RegExp(pattern.pathPattern);
        return regex.test(source.path);
    }
    catch (_a) {
        (0, log_js_1.logError)(new Error("Invalid pathPattern regex: ".concat(pattern.pathPattern)));
        return false;
    }
}
/**
 * Get hosts from hostPattern entries in the allowlist.
 * Used to provide helpful error messages.
 */
function getHostPatternsFromAllowlist() {
    var allowlist = getStrictKnownMarketplaces();
    if (!allowlist)
        return [];
    return allowlist
        .filter(function (entry) {
        return entry.source === 'hostPattern';
    })
        .map(function (entry) { return entry.hostPattern; });
}
/**
 * Extract GitHub owner/repo from a git URL if it's a GitHub URL.
 * Returns null if not a GitHub URL.
 *
 * Handles:
 * - git@github.com:owner/repo.git
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo
 */
function extractGitHubRepoFromGitUrl(url) {
    // SSH format: git@github.com:owner/repo.git
    var sshMatch = url.match(/^git@github\.com:([^/]+\/[^/]+?)(?:\.git)?$/);
    if (sshMatch && sshMatch[1]) {
        return sshMatch[1];
    }
    // HTTPS format: https://github.com/owner/repo.git or https://github.com/owner/repo
    var httpsMatch = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+?)(?:\.git)?$/);
    if (httpsMatch && httpsMatch[1]) {
        return httpsMatch[1];
    }
    return null;
}
/**
 * Check if a blocked ref/path constraint matches a source.
 * If the blocklist entry has no ref/path, it matches ALL refs/paths (wildcard).
 * If the blocklist entry has a specific ref/path, it only matches that exact value.
 */
function blockedConstraintMatches(blockedValue, sourceValue) {
    // If blocklist doesn't specify a constraint, it's a wildcard - matches anything
    if (!blockedValue) {
        return true;
    }
    // If blocklist specifies a constraint, source must match exactly
    return (blockedValue || undefined) === (sourceValue || undefined);
}
/**
 * Check if two sources refer to the same GitHub repository, even if using
 * different source types (github vs git with GitHub URL).
 *
 * Blocklist matching is asymmetric:
 * - If blocklist entry has no ref/path, it blocks ALL refs/paths (wildcard)
 * - If blocklist entry has a specific ref/path, only that exact value is blocked
 */
function areSourcesEquivalentForBlocklist(source, blocked) {
    // Check exact same source type
    if (source.source === blocked.source) {
        switch (source.source) {
            case 'github': {
                var b = blocked;
                if (source.repo !== b.repo)
                    return false;
                return (blockedConstraintMatches(b.ref, source.ref) &&
                    blockedConstraintMatches(b.path, source.path));
            }
            case 'git': {
                var b = blocked;
                if (source.url !== b.url)
                    return false;
                return (blockedConstraintMatches(b.ref, source.ref) &&
                    blockedConstraintMatches(b.path, source.path));
            }
            case 'url':
                return source.url === blocked.url;
            case 'npm':
                return source.package === blocked.package;
            case 'file':
                return source.path === blocked.path;
            case 'directory':
                return source.path === blocked.path;
            case 'settings':
                return source.name === blocked.name;
            default:
                return false;
        }
    }
    // Check if a git source matches a github blocklist entry
    if (source.source === 'git' && blocked.source === 'github') {
        var extractedRepo = extractGitHubRepoFromGitUrl(source.url);
        if (extractedRepo === blocked.repo) {
            return (blockedConstraintMatches(blocked.ref, source.ref) &&
                blockedConstraintMatches(blocked.path, source.path));
        }
    }
    // Check if a github source matches a git blocklist entry (GitHub URL)
    if (source.source === 'github' && blocked.source === 'git') {
        var extractedRepo = extractGitHubRepoFromGitUrl(blocked.url);
        if (extractedRepo === source.repo) {
            return (blockedConstraintMatches(blocked.ref, source.ref) &&
                blockedConstraintMatches(blocked.path, source.path));
        }
    }
    return false;
}
/**
 * Check if a marketplace source is explicitly in the blocklist.
 * Used for error message differentiation.
 *
 * This also catches attempts to bypass a github blocklist entry by using
 * git URLs (e.g., git@github.com:owner/repo.git or https://github.com/owner/repo.git).
 */
function isSourceInBlocklist(source) {
    var blocklist = getBlockedMarketplaces();
    if (blocklist === null) {
        return false;
    }
    return blocklist.some(function (blocked) {
        return areSourcesEquivalentForBlocklist(source, blocked);
    });
}
/**
 * Check if a marketplace source is allowed by enterprise policy.
 * Returns true if allowed (or no policy), false if blocked.
 * This check happens BEFORE downloading, so blocked sources never touch the filesystem.
 *
 * Policy precedence:
 * 1. blockedMarketplaces (blocklist) - if source matches, it's blocked
 * 2. strictKnownMarketplaces (allowlist) - if set, source must be in the list
 */
function isSourceAllowedByPolicy(source) {
    // Check blocklist first (takes precedence)
    if (isSourceInBlocklist(source)) {
        return false;
    }
    // Then check allowlist
    var allowlist = getStrictKnownMarketplaces();
    if (allowlist === null) {
        return true; // No restrictions
    }
    // Check each entry in the allowlist
    return allowlist.some(function (allowed) {
        // Handle hostPattern entries - match by extracted host
        if (allowed.source === 'hostPattern') {
            return doesSourceMatchHostPattern(source, allowed);
        }
        // Handle pathPattern entries - match file/directory .path by regex
        if (allowed.source === 'pathPattern') {
            return doesSourceMatchPathPattern(source, allowed);
        }
        // Handle regular source entries - exact match
        return areSourcesEqual(source, allowed);
    });
}
/**
 * Format a MarketplaceSource for display in error messages
 */
function formatSourceForDisplay(source) {
    switch (source.source) {
        case 'github':
            return "github:".concat(source.repo).concat(source.ref ? "@".concat(source.ref) : '');
        case 'url':
            return source.url;
        case 'git':
            return "git:".concat(source.url).concat(source.ref ? "@".concat(source.ref) : '');
        case 'npm':
            return "npm:".concat(source.package);
        case 'file':
            return "file:".concat(source.path);
        case 'directory':
            return "dir:".concat(source.path);
        case 'hostPattern':
            return "hostPattern:".concat(source.hostPattern);
        case 'pathPattern':
            return "pathPattern:".concat(source.pathPattern);
        case 'settings':
            return "settings:".concat(source.name, " (").concat(source.plugins.length, " ").concat((0, stringUtils_js_1.plural)(source.plugins.length, 'plugin'), ")");
        default:
            return 'unknown source';
    }
}
/**
 * Detect why no marketplaces are available.
 * Checks in order of priority: git availability → policy restrictions → config state → failures
 */
function detectEmptyMarketplaceReason(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var gitAvailable, allowlist;
        var configuredMarketplaceCount = _b.configuredMarketplaceCount, failedMarketplaceCount = _b.failedMarketplaceCount;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, gitAvailability_js_1.checkGitAvailable)()];
                case 1:
                    gitAvailable = _c.sent();
                    if (!gitAvailable) {
                        return [2 /*return*/, 'git-not-installed'];
                    }
                    allowlist = getStrictKnownMarketplaces();
                    if (allowlist !== null) {
                        if (allowlist.length === 0) {
                            // Policy explicitly blocks all marketplaces
                            return [2 /*return*/, 'all-blocked-by-policy'];
                        }
                        // Policy restricts which sources can be used
                        if (configuredMarketplaceCount === 0) {
                            return [2 /*return*/, 'policy-restricts-sources'];
                        }
                    }
                    // Check if any marketplaces are configured
                    if (configuredMarketplaceCount === 0) {
                        return [2 /*return*/, 'no-marketplaces-configured'];
                    }
                    // Check if all configured marketplaces failed to load
                    if (failedMarketplaceCount > 0 &&
                        failedMarketplaceCount === configuredMarketplaceCount) {
                        return [2 /*return*/, 'all-marketplaces-failed'];
                    }
                    // Marketplaces are configured and loaded, but no plugins available
                    // This typically means all plugins are already installed
                    return [2 /*return*/, 'all-plugins-installed'];
            }
        });
    });
}
