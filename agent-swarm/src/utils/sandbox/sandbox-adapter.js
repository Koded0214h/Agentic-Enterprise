"use strict";
/**
 * Adapter layer that wraps @anthropic-ai/sandbox-runtime with Claude CLI-specific integrations.
 * This file provides the bridge between the external sandbox-runtime package and Claude CLI's
 * settings system, tool integration, and additional features.
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
exports.SandboxRuntimeConfigSchema = exports.SandboxViolationStore = exports.SandboxManager = void 0;
exports.resolvePathPatternForSandbox = resolvePathPatternForSandbox;
exports.resolveSandboxFilesystemPath = resolveSandboxFilesystemPath;
exports.shouldAllowManagedSandboxDomainsOnly = shouldAllowManagedSandboxDomainsOnly;
exports.convertToSandboxRuntimeConfig = convertToSandboxRuntimeConfig;
exports.addToExcludedCommands = addToExcludedCommands;
var sandbox_runtime_1 = require("@anthropic-ai/sandbox-runtime");
Object.defineProperty(exports, "SandboxRuntimeConfigSchema", { enumerable: true, get: function () { return sandbox_runtime_1.SandboxRuntimeConfigSchema; } });
Object.defineProperty(exports, "SandboxViolationStore", { enumerable: true, get: function () { return sandbox_runtime_1.SandboxViolationStore; } });
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var lodash_es_1 = require("lodash-es");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var path_js_1 = require("../path.js");
var platform_js_1 = require("../platform.js");
var changeDetector_js_1 = require("../settings/changeDetector.js");
var constants_js_1 = require("../settings/constants.js");
var managedPath_js_1 = require("../settings/managedPath.js");
var settings_js_1 = require("../settings/settings.js");
// ============================================================================
// Settings Converter
// ============================================================================
var toolName_js_1 = require("src/tools/BashTool/toolName.js");
var constants_js_2 = require("src/tools/FileEditTool/constants.js");
var prompt_js_1 = require("src/tools/FileReadTool/prompt.js");
var prompt_js_2 = require("src/tools/WebFetchTool/prompt.js");
var errors_js_1 = require("../errors.js");
var filesystem_js_1 = require("../permissions/filesystem.js");
var ripgrep_js_1 = require("../ripgrep.js");
// Local copies to avoid circular dependency
// (permissions.ts imports SandboxManager, bashPermissions.ts imports permissions.ts)
function permissionRuleValueFromString(ruleString) {
    var matches = ruleString.match(/^([^(]+)\(([^)]+)\)$/);
    if (!matches) {
        return { toolName: ruleString };
    }
    var toolName = matches[1];
    var ruleContent = matches[2];
    if (!toolName || !ruleContent) {
        return { toolName: ruleString };
    }
    return { toolName: toolName, ruleContent: ruleContent };
}
function permissionRuleExtractPrefix(permissionRule) {
    var _a;
    var match = permissionRule.match(/^(.+):\*$/);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
}
/**
 * Resolve Claude Code-specific path patterns for sandbox-runtime.
 *
 * Claude Code uses special path prefixes in permission rules:
 * - `//path` → absolute from filesystem root (becomes `/path`)
 * - `/path` → relative to settings file directory (becomes `$SETTINGS_DIR/path`)
 * - `~/path` → passed through (sandbox-runtime handles this)
 * - `./path` or `path` → passed through (sandbox-runtime handles this)
 *
 * This function only handles CC-specific conventions (`//` and `/`).
 * Standard path patterns like `~/` and relative paths are passed through
 * for sandbox-runtime's normalizePathForSandbox to handle.
 *
 * @param pattern The path pattern from a permission rule
 * @param source The settings source this pattern came from (needed to resolve `/path` patterns)
 */
function resolvePathPatternForSandbox(pattern, source) {
    // Handle // prefix - absolute from root (CC-specific convention)
    if (pattern.startsWith('//')) {
        return pattern.slice(1); // "//.aws/**" → "/.aws/**"
    }
    // Handle / prefix - relative to settings file directory (CC-specific convention)
    // Note: ~/path and relative paths are passed through for sandbox-runtime to handle
    if (pattern.startsWith('/') && !pattern.startsWith('//')) {
        var root = (0, settings_js_1.getSettingsRootPathForSource)(source);
        // Pattern like "/foo/**" becomes "${root}/foo/**"
        return (0, path_1.resolve)(root, pattern.slice(1));
    }
    // Other patterns (~/path, ./path, path) pass through as-is
    // sandbox-runtime's normalizePathForSandbox will handle them
    return pattern;
}
/**
 * Resolve paths from sandbox.filesystem.* settings (allowWrite, denyWrite, etc).
 *
 * Unlike permission rules (Edit/Read), these settings use standard path semantics:
 * - `/path` → absolute path (as written, NOT settings-relative)
 * - `~/path` → expanded to home directory
 * - `./path` or `path` → relative to settings file directory
 * - `//path` → absolute (legacy permission-rule syntax, accepted for compat)
 *
 * Fix for #30067: resolvePathPatternForSandbox treats `/Users/foo/.cargo` as
 * settings-relative (permission-rule convention). Users reasonably expect
 * absolute paths in sandbox.filesystem.allowWrite to work as-is.
 *
 * Also expands `~` here rather than relying on sandbox-runtime, because
 * sandbox-runtime's getFsWriteConfig() does not call normalizePathForSandbox
 * on allowWrite paths (it only strips trailing glob suffixes).
 */
function resolveSandboxFilesystemPath(pattern, source) {
    // Legacy permission-rule escape: //path → /path. Kept for compat with
    // users who worked around #30067 by writing //Users/foo/.cargo in config.
    if (pattern.startsWith('//'))
        return pattern.slice(1);
    return (0, path_js_1.expandPath)(pattern, (0, settings_js_1.getSettingsRootPathForSource)(source));
}
/**
 * Check if only managed sandbox domains should be used.
 * This is true when policySettings has sandbox.network.allowManagedDomainsOnly: true
 */
function shouldAllowManagedSandboxDomainsOnly() {
    var _a, _b, _c;
    return (((_c = (_b = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.sandbox) === null || _b === void 0 ? void 0 : _b.network) === null || _c === void 0 ? void 0 : _c.allowManagedDomainsOnly) === true);
}
function shouldAllowManagedReadPathsOnly() {
    var _a, _b, _c;
    return (((_c = (_b = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.sandbox) === null || _b === void 0 ? void 0 : _b.filesystem) === null || _c === void 0 ? void 0 : _c.allowManagedReadPathsOnly) === true);
}
/**
 * Convert Claude Code settings format to SandboxRuntimeConfig format
 * (Function exported for testing)
 *
 * @param settings Merged settings (used for sandbox config like network, ripgrep, etc.)
 */
function convertToSandboxRuntimeConfig(settings) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    var permissions = settings.permissions || {};
    // Extract network domains from WebFetch rules
    var allowedDomains = [];
    var deniedDomains = [];
    // When allowManagedSandboxDomainsOnly is enabled, only use domains from policy settings
    if (shouldAllowManagedSandboxDomainsOnly()) {
        var policySettings = (0, settings_js_1.getSettingsForSource)('policySettings');
        for (var _i = 0, _1 = ((_b = (_a = policySettings === null || policySettings === void 0 ? void 0 : policySettings.sandbox) === null || _a === void 0 ? void 0 : _a.network) === null || _b === void 0 ? void 0 : _b.allowedDomains) ||
            []; _i < _1.length; _i++) {
            var domain = _1[_i];
            allowedDomains.push(domain);
        }
        for (var _2 = 0, _3 = ((_c = policySettings === null || policySettings === void 0 ? void 0 : policySettings.permissions) === null || _c === void 0 ? void 0 : _c.allow) || []; _2 < _3.length; _2++) {
            var ruleString = _3[_2];
            var rule = permissionRuleValueFromString(ruleString);
            if (rule.toolName === prompt_js_2.WEB_FETCH_TOOL_NAME &&
                ((_d = rule.ruleContent) === null || _d === void 0 ? void 0 : _d.startsWith('domain:'))) {
                allowedDomains.push(rule.ruleContent.substring('domain:'.length));
            }
        }
    }
    else {
        for (var _4 = 0, _5 = ((_f = (_e = settings.sandbox) === null || _e === void 0 ? void 0 : _e.network) === null || _f === void 0 ? void 0 : _f.allowedDomains) || []; _4 < _5.length; _4++) {
            var domain = _5[_4];
            allowedDomains.push(domain);
        }
        for (var _6 = 0, _7 = permissions.allow || []; _6 < _7.length; _6++) {
            var ruleString = _7[_6];
            var rule = permissionRuleValueFromString(ruleString);
            if (rule.toolName === prompt_js_2.WEB_FETCH_TOOL_NAME &&
                ((_g = rule.ruleContent) === null || _g === void 0 ? void 0 : _g.startsWith('domain:'))) {
                allowedDomains.push(rule.ruleContent.substring('domain:'.length));
            }
        }
    }
    for (var _8 = 0, _9 = permissions.deny || []; _8 < _9.length; _8++) {
        var ruleString = _9[_8];
        var rule = permissionRuleValueFromString(ruleString);
        if (rule.toolName === prompt_js_2.WEB_FETCH_TOOL_NAME &&
            ((_h = rule.ruleContent) === null || _h === void 0 ? void 0 : _h.startsWith('domain:'))) {
            deniedDomains.push(rule.ruleContent.substring('domain:'.length));
        }
    }
    // Extract filesystem paths from Edit and Read rules
    // Always include current directory and Claude temp directory as writable
    // The temp directory is needed for Shell.ts cwd tracking files
    var allowWrite = ['.', (0, filesystem_js_1.getClaudeTempDir)()];
    var denyWrite = [];
    var denyRead = [];
    var allowRead = [];
    // Always deny writes to settings.json files to prevent sandbox escape
    // This blocks settings in the original working directory (where Claude Code started)
    var settingsPaths = constants_js_1.SETTING_SOURCES.map(function (source) {
        return (0, settings_js_1.getSettingsFilePathForSource)(source);
    }).filter(function (p) { return p !== undefined; });
    denyWrite.push.apply(denyWrite, settingsPaths);
    denyWrite.push((0, managedPath_js_1.getManagedSettingsDropInDir)());
    // Also block settings files in the current working directory if it differs from original
    // This handles the case where the user has cd'd to a different directory
    var cwd = (0, state_js_1.getCwdState)();
    var originalCwd = (0, state_js_1.getOriginalCwd)();
    if (cwd !== originalCwd) {
        denyWrite.push((0, path_1.resolve)(cwd, '.claude', 'settings.json'));
        denyWrite.push((0, path_1.resolve)(cwd, '.claude', 'settings.local.json'));
    }
    // Block writes to .claude/skills in both original and current working directories.
    // The sandbox-runtime's getDangerousDirectories() protects .claude/commands and
    // .claude/agents but not .claude/skills. Skills have the same privilege level
    // (auto-discovered, auto-loaded, full Claude capabilities) so they need the
    // same OS-level sandbox protection.
    denyWrite.push((0, path_1.resolve)(originalCwd, '.claude', 'skills'));
    if (cwd !== originalCwd) {
        denyWrite.push((0, path_1.resolve)(cwd, '.claude', 'skills'));
    }
    // SECURITY: Git's is_git_directory() treats cwd as a bare repo if it has
    // HEAD + objects/ + refs/. An attacker planting these (plus a config with
    // core.fsmonitor) escapes the sandbox when Claude's unsandboxed git runs.
    //
    // Unconditionally denying these paths makes sandbox-runtime mount
    // /dev/null at non-existent ones, which (a) leaves a 0-byte HEAD stub on
    // the host and (b) breaks `git log HEAD` inside bwrap ("ambiguous argument").
    // So: if a file exists, denyWrite (ro-bind in place, no stub). If not, scrub
    // it post-command in scrubBareGitRepoFiles() — planted files are gone before
    // unsandboxed git runs; inside the command, git is itself sandboxed.
    bareGitRepoScrubPaths.length = 0;
    var bareGitRepoFiles = ['HEAD', 'objects', 'refs', 'hooks', 'config'];
    for (var _10 = 0, _11 = cwd === originalCwd ? [originalCwd] : [originalCwd, cwd]; _10 < _11.length; _10++) {
        var dir = _11[_10];
        for (var _12 = 0, bareGitRepoFiles_1 = bareGitRepoFiles; _12 < bareGitRepoFiles_1.length; _12++) {
            var gitFile = bareGitRepoFiles_1[_12];
            var p = (0, path_1.resolve)(dir, gitFile);
            try {
                // eslint-disable-next-line custom-rules/no-sync-fs -- refreshConfig() must be sync
                (0, fs_1.statSync)(p);
                denyWrite.push(p);
            }
            catch (_13) {
                bareGitRepoScrubPaths.push(p);
            }
        }
    }
    // If we detected a git worktree during initialize(), the main repo path is
    // cached in worktreeMainRepoPath. Git operations in a worktree need write
    // access to the main repo's .git directory for index.lock etc.
    // This is resolved once at init time (worktree status doesn't change mid-session).
    if (worktreeMainRepoPath && worktreeMainRepoPath !== cwd) {
        allowWrite.push(worktreeMainRepoPath);
    }
    // Include directories added via --add-dir CLI flag or /add-dir command.
    // These must be in allowWrite so that Bash commands (which run inside the
    // sandbox) can access them — not just file tools, which check permissions
    // at the app level via pathInAllowedWorkingPath().
    // Two sources: persisted in settings, and session-only in bootstrap state.
    var additionalDirs = new Set(__spreadArray(__spreadArray([], (((_j = settings.permissions) === null || _j === void 0 ? void 0 : _j.additionalDirectories) || []), true), (0, state_js_1.getAdditionalDirectoriesForClaudeMd)(), true));
    allowWrite.push.apply(allowWrite, additionalDirs);
    // Iterate through each settings source to resolve paths correctly
    // Path patterns like `/foo` are relative to the settings file directory,
    // so we need to know which source each rule came from
    for (var _14 = 0, SETTING_SOURCES_1 = constants_js_1.SETTING_SOURCES; _14 < SETTING_SOURCES_1.length; _14++) {
        var source = SETTING_SOURCES_1[_14];
        var sourceSettings = (0, settings_js_1.getSettingsForSource)(source);
        // Extract filesystem paths from permission rules
        if (sourceSettings === null || sourceSettings === void 0 ? void 0 : sourceSettings.permissions) {
            for (var _15 = 0, _16 = sourceSettings.permissions.allow || []; _15 < _16.length; _15++) {
                var ruleString = _16[_15];
                var rule = permissionRuleValueFromString(ruleString);
                if (rule.toolName === constants_js_2.FILE_EDIT_TOOL_NAME && rule.ruleContent) {
                    allowWrite.push(resolvePathPatternForSandbox(rule.ruleContent, source));
                }
            }
            for (var _17 = 0, _18 = sourceSettings.permissions.deny || []; _17 < _18.length; _17++) {
                var ruleString = _18[_17];
                var rule = permissionRuleValueFromString(ruleString);
                if (rule.toolName === constants_js_2.FILE_EDIT_TOOL_NAME && rule.ruleContent) {
                    denyWrite.push(resolvePathPatternForSandbox(rule.ruleContent, source));
                }
                if (rule.toolName === prompt_js_1.FILE_READ_TOOL_NAME && rule.ruleContent) {
                    denyRead.push(resolvePathPatternForSandbox(rule.ruleContent, source));
                }
            }
        }
        // Extract filesystem paths from sandbox.filesystem settings
        // sandbox.filesystem.* uses standard path semantics (/path = absolute),
        // NOT the permission-rule convention (/path = settings-relative). #30067
        var fs = (_k = sourceSettings === null || sourceSettings === void 0 ? void 0 : sourceSettings.sandbox) === null || _k === void 0 ? void 0 : _k.filesystem;
        if (fs) {
            for (var _19 = 0, _20 = fs.allowWrite || []; _19 < _20.length; _19++) {
                var p = _20[_19];
                allowWrite.push(resolveSandboxFilesystemPath(p, source));
            }
            for (var _21 = 0, _22 = fs.denyWrite || []; _21 < _22.length; _21++) {
                var p = _22[_21];
                denyWrite.push(resolveSandboxFilesystemPath(p, source));
            }
            for (var _23 = 0, _24 = fs.denyRead || []; _23 < _24.length; _23++) {
                var p = _24[_23];
                denyRead.push(resolveSandboxFilesystemPath(p, source));
            }
            if (!shouldAllowManagedReadPathsOnly() || source === 'policySettings') {
                for (var _25 = 0, _26 = fs.allowRead || []; _25 < _26.length; _25++) {
                    var p = _26[_25];
                    allowRead.push(resolveSandboxFilesystemPath(p, source));
                }
            }
        }
    }
    // Ripgrep config for sandbox. User settings take priority; otherwise pass our rg.
    // In embedded mode (argv0='rg' dispatch), sandbox-runtime spawns with argv0 set.
    var _27 = (0, ripgrep_js_1.ripgrepCommand)(), rgPath = _27.rgPath, rgArgs = _27.rgArgs, argv0 = _27.argv0;
    var ripgrepConfig = (_m = (_l = settings.sandbox) === null || _l === void 0 ? void 0 : _l.ripgrep) !== null && _m !== void 0 ? _m : {
        command: rgPath,
        args: rgArgs,
        argv0: argv0,
    };
    return {
        network: {
            allowedDomains: allowedDomains,
            deniedDomains: deniedDomains,
            allowUnixSockets: (_p = (_o = settings.sandbox) === null || _o === void 0 ? void 0 : _o.network) === null || _p === void 0 ? void 0 : _p.allowUnixSockets,
            allowAllUnixSockets: (_r = (_q = settings.sandbox) === null || _q === void 0 ? void 0 : _q.network) === null || _r === void 0 ? void 0 : _r.allowAllUnixSockets,
            allowLocalBinding: (_t = (_s = settings.sandbox) === null || _s === void 0 ? void 0 : _s.network) === null || _t === void 0 ? void 0 : _t.allowLocalBinding,
            httpProxyPort: (_v = (_u = settings.sandbox) === null || _u === void 0 ? void 0 : _u.network) === null || _v === void 0 ? void 0 : _v.httpProxyPort,
            socksProxyPort: (_x = (_w = settings.sandbox) === null || _w === void 0 ? void 0 : _w.network) === null || _x === void 0 ? void 0 : _x.socksProxyPort,
        },
        filesystem: {
            denyRead: denyRead,
            allowRead: allowRead,
            allowWrite: allowWrite,
            denyWrite: denyWrite,
        },
        ignoreViolations: (_y = settings.sandbox) === null || _y === void 0 ? void 0 : _y.ignoreViolations,
        enableWeakerNestedSandbox: (_z = settings.sandbox) === null || _z === void 0 ? void 0 : _z.enableWeakerNestedSandbox,
        enableWeakerNetworkIsolation: (_0 = settings.sandbox) === null || _0 === void 0 ? void 0 : _0.enableWeakerNetworkIsolation,
        ripgrep: ripgrepConfig,
    };
}
// ============================================================================
// Claude CLI-specific state
// ============================================================================
var initializationPromise;
var settingsSubscriptionCleanup;
// Cached main repo path for git worktrees, resolved once during initialize().
// In a worktree, .git is a file containing "gitdir: /path/to/main/repo/.git/worktrees/name".
// undefined = not yet resolved; null = not a worktree or detection failed.
var worktreeMainRepoPath;
// Bare-repo files at cwd that didn't exist at config time and should be
// scrubbed if they appear after a sandboxed command. See anthropics/claude-code#29316.
var bareGitRepoScrubPaths = [];
/**
 * Delete bare-repo files planted at cwd during a sandboxed command, before
 * Claude's unsandboxed git calls can see them. See the SECURITY block above
 * bareGitRepoFiles. anthropics/claude-code#29316.
 */
function scrubBareGitRepoFiles() {
    for (var _i = 0, bareGitRepoScrubPaths_1 = bareGitRepoScrubPaths; _i < bareGitRepoScrubPaths_1.length; _i++) {
        var p = bareGitRepoScrubPaths_1[_i];
        try {
            // eslint-disable-next-line custom-rules/no-sync-fs -- cleanupAfterCommand must be sync (Shell.ts:367)
            (0, fs_1.rmSync)(p, { recursive: true });
            (0, debug_js_1.logForDebugging)("[Sandbox] scrubbed planted bare-repo file: ".concat(p));
        }
        catch (_a) {
            // ENOENT is the expected common case — nothing was planted
        }
    }
}
/**
 * Detect if cwd is a git worktree and resolve the main repo path.
 * Called once during initialize() and cached for the session.
 * In a worktree, .git is a file (not a directory) containing "gitdir: ...".
 * If .git is a directory, readFile throws EISDIR and we return null.
 */
function detectWorktreeMainRepoPath(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var gitPath, gitContent, gitdirMatch, gitdir, marker, markerIndex, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gitPath = (0, path_1.join)(cwd, '.git');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(gitPath, { encoding: 'utf8' })];
                case 2:
                    gitContent = _b.sent();
                    gitdirMatch = gitContent.match(/^gitdir:\s*(.+)$/m);
                    if (!(gitdirMatch === null || gitdirMatch === void 0 ? void 0 : gitdirMatch[1])) {
                        return [2 /*return*/, null];
                    }
                    gitdir = (0, path_1.resolve)(cwd, gitdirMatch[1].trim());
                    marker = "".concat(path_1.sep, ".git").concat(path_1.sep, "worktrees").concat(path_1.sep);
                    markerIndex = gitdir.lastIndexOf(marker);
                    if (markerIndex > 0) {
                        return [2 /*return*/, gitdir.substring(0, markerIndex)];
                    }
                    return [2 /*return*/, null];
                case 3:
                    _a = _b.sent();
                    // Not in a worktree, .git is a directory (EISDIR), or can't read .git file
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if dependencies are available (memoized)
 * Returns { errors, warnings } - errors mean sandbox cannot run
 */
var checkDependencies = (0, lodash_es_1.memoize)(function () {
    var _a = (0, ripgrep_js_1.ripgrepCommand)(), rgPath = _a.rgPath, rgArgs = _a.rgArgs;
    return sandbox_runtime_1.SandboxManager.checkDependencies({
        command: rgPath,
        args: rgArgs,
    });
});
function getSandboxEnabledSetting() {
    var _a, _b;
    try {
        var settings = (0, settings_js_1.getSettings_DEPRECATED)();
        return (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.enabled) !== null && _b !== void 0 ? _b : false;
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to get settings for sandbox check: ".concat(error));
        return false;
    }
}
function isAutoAllowBashIfSandboxedEnabled() {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    return (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.autoAllowBashIfSandboxed) !== null && _b !== void 0 ? _b : true;
}
function areUnsandboxedCommandsAllowed() {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    return (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.allowUnsandboxedCommands) !== null && _b !== void 0 ? _b : true;
}
function isSandboxRequired() {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    return (getSandboxEnabledSetting() &&
        ((_b = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.failIfUnavailable) !== null && _b !== void 0 ? _b : false));
}
/**
 * Check if the current platform is supported for sandboxing (memoized)
 * Supports: macOS, Linux, and WSL2+ (WSL1 is not supported)
 */
var isSupportedPlatform = (0, lodash_es_1.memoize)(function () {
    return sandbox_runtime_1.SandboxManager.isSupportedPlatform();
});
/**
 * Check if the current platform is in the enabledPlatforms list.
 *
 * This is an undocumented setting that allows restricting sandbox to specific platforms.
 * When enabledPlatforms is not set, all supported platforms are allowed.
 *
 * Added to unblock NVIDIA enterprise rollout: they want to enable autoAllowBashIfSandboxed
 * but only on macOS initially, since Linux/WSL sandbox support is newer. This allows
 * setting enabledPlatforms: ["macos"] to disable sandbox (and auto-allow) on other platforms.
 */
function isPlatformInEnabledList() {
    var _a;
    try {
        var settings = (0, settings_js_1.getInitialSettings)();
        var enabledPlatforms = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.enabledPlatforms;
        if (enabledPlatforms === undefined) {
            return true;
        }
        if (enabledPlatforms.length === 0) {
            return false;
        }
        var currentPlatform = (0, platform_js_1.getPlatform)();
        return enabledPlatforms.includes(currentPlatform);
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to check enabledPlatforms: ".concat(error));
        return true; // Default to enabled if we can't read settings
    }
}
/**
 * Check if sandboxing is enabled
 * This checks the user's enabled setting, platform support, and enabledPlatforms restriction
 */
function isSandboxingEnabled() {
    if (!isSupportedPlatform()) {
        return false;
    }
    if (checkDependencies().errors.length > 0) {
        return false;
    }
    // Check if current platform is in the enabledPlatforms list (undocumented setting)
    if (!isPlatformInEnabledList()) {
        return false;
    }
    return getSandboxEnabledSetting();
}
/**
 * If the user explicitly enabled sandbox (sandbox.enabled: true in settings)
 * but it cannot actually run, return a human-readable reason. Otherwise
 * return undefined.
 *
 * Fix for #34044: previously isSandboxingEnabled() silently returned false
 * when dependencies were missing, giving users zero feedback that their
 * explicit security setting was being ignored. This is a security footgun —
 * users configure allowedDomains expecting enforcement, get none.
 *
 * Call this once at startup (REPL/print) and surface the reason if present.
 * Does not cover the case where the user never enabled sandbox (no noise).
 */
function getSandboxUnavailableReason() {
    // Only warn if user explicitly asked for sandbox. If they didn't enable
    // it, missing deps are irrelevant.
    if (!getSandboxEnabledSetting()) {
        return undefined;
    }
    if (!isSupportedPlatform()) {
        var platform = (0, platform_js_1.getPlatform)();
        if (platform === 'wsl') {
            return 'sandbox.enabled is set but WSL1 is not supported (requires WSL2)';
        }
        return "sandbox.enabled is set but ".concat(platform, " is not supported (requires macOS, Linux, or WSL2)");
    }
    if (!isPlatformInEnabledList()) {
        return "sandbox.enabled is set but ".concat((0, platform_js_1.getPlatform)(), " is not in sandbox.enabledPlatforms");
    }
    var deps = checkDependencies();
    if (deps.errors.length > 0) {
        var platform = (0, platform_js_1.getPlatform)();
        var hint = platform === 'macos'
            ? 'run /sandbox or /doctor for details'
            : 'install missing tools (e.g. apt install bubblewrap socat) or run /sandbox for details';
        return "sandbox.enabled is set but dependencies are missing: ".concat(deps.errors.join(', '), " \u00B7 ").concat(hint);
    }
    return undefined;
}
/**
 * Get glob patterns that won't work fully on Linux/WSL
 */
function getLinuxGlobPatternWarnings() {
    var _a;
    // Only return warnings on Linux/WSL (bubblewrap doesn't support globs)
    var platform = (0, platform_js_1.getPlatform)();
    if (platform !== 'linux' && platform !== 'wsl') {
        return [];
    }
    try {
        var settings = (0, settings_js_1.getSettings_DEPRECATED)();
        // Only return warnings when sandboxing is enabled (check settings directly, not cached value)
        if (!((_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.enabled)) {
            return [];
        }
        var permissions = (settings === null || settings === void 0 ? void 0 : settings.permissions) || {};
        var warnings = [];
        // Helper to check if a path has glob characters (excluding trailing /**)
        var hasGlobs = function (path) {
            var stripped = path.replace(/\/\*\*$/, '');
            return /[*?[\]]/.test(stripped);
        };
        // Check all permission rules
        for (var _i = 0, _b = __spreadArray(__spreadArray([], (permissions.allow || []), true), (permissions.deny || []), true); _i < _b.length; _i++) {
            var ruleString = _b[_i];
            var rule = permissionRuleValueFromString(ruleString);
            if ((rule.toolName === constants_js_2.FILE_EDIT_TOOL_NAME ||
                rule.toolName === prompt_js_1.FILE_READ_TOOL_NAME) &&
                rule.ruleContent &&
                hasGlobs(rule.ruleContent)) {
                warnings.push(ruleString);
            }
        }
        return warnings;
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("Failed to get Linux glob pattern warnings: ".concat(error));
        return [];
    }
}
/**
 * Check if sandbox settings are locked by policy
 */
function areSandboxSettingsLockedByPolicy() {
    var _a, _b, _c;
    // Check if sandbox settings are explicitly set in any source that overrides localSettings
    // These sources have higher priority than localSettings and would make local changes ineffective
    var overridingSources = ['flagSettings', 'policySettings'];
    for (var _i = 0, overridingSources_1 = overridingSources; _i < overridingSources_1.length; _i++) {
        var source = overridingSources_1[_i];
        var settings = (0, settings_js_1.getSettingsForSource)(source);
        if (((_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.enabled) !== undefined ||
            ((_b = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _b === void 0 ? void 0 : _b.autoAllowBashIfSandboxed) !== undefined ||
            ((_c = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _c === void 0 ? void 0 : _c.allowUnsandboxedCommands) !== undefined) {
            return true;
        }
    }
    return false;
}
/**
 * Set sandbox settings
 */
function setSandboxSettings(options) {
    return __awaiter(this, void 0, void 0, function () {
        var existingSettings;
        return __generator(this, function (_a) {
            existingSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
            // Note: Memoized caches auto-invalidate when settings change because they use
            // the settings object as the cache key (new settings object = cache miss)
            (0, settings_js_1.updateSettingsForSource)('localSettings', {
                sandbox: __assign(__assign(__assign(__assign({}, existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.sandbox), (options.enabled !== undefined && { enabled: options.enabled })), (options.autoAllowBashIfSandboxed !== undefined && {
                    autoAllowBashIfSandboxed: options.autoAllowBashIfSandboxed,
                })), (options.allowUnsandboxedCommands !== undefined && {
                    allowUnsandboxedCommands: options.allowUnsandboxedCommands,
                })),
            });
            return [2 /*return*/];
        });
    });
}
/**
 * Get excluded commands (commands that should not be sandboxed)
 */
function getExcludedCommands() {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    return (_b = (_a = settings === null || settings === void 0 ? void 0 : settings.sandbox) === null || _a === void 0 ? void 0 : _a.excludedCommands) !== null && _b !== void 0 ? _b : [];
}
/**
 * Wrap command with sandbox, optionally specifying the shell to use
 */
function wrapWithSandbox(command, binShell, customConfig, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isSandboxingEnabled()) return [3 /*break*/, 3];
                    if (!initializationPromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, initializationPromise];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2: throw new Error('Sandbox failed to initialize. ');
                case 3: return [2 /*return*/, sandbox_runtime_1.SandboxManager.wrapWithSandbox(command, binShell, customConfig, abortSignal)];
            }
        });
    });
}
/**
 * Initialize sandbox with log monitoring enabled by default
 */
function initialize(sandboxAskCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var wrappedCallback;
        var _this = this;
        return __generator(this, function (_a) {
            // If already initializing or initialized, return the promise
            if (initializationPromise) {
                return [2 /*return*/, initializationPromise];
            }
            // Check if sandboxing is enabled in settings
            if (!isSandboxingEnabled()) {
                return [2 /*return*/];
            }
            wrappedCallback = sandboxAskCallback
                ? function (hostPattern) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (shouldAllowManagedSandboxDomainsOnly()) {
                            (0, debug_js_1.logForDebugging)("[sandbox] Blocked network request to ".concat(hostPattern.host, " (allowManagedDomainsOnly)"));
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, sandboxAskCallback(hostPattern)];
                    });
                }); }
                : undefined;
            // Create the initialization promise synchronously (before any await) to prevent
            // race conditions where wrapWithSandbox() is called before the promise is assigned.
            initializationPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                var settings, runtimeConfig, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            if (!(worktreeMainRepoPath === undefined)) return [3 /*break*/, 2];
                            return [4 /*yield*/, detectWorktreeMainRepoPath((0, state_js_1.getCwdState)())];
                        case 1:
                            worktreeMainRepoPath = _a.sent();
                            _a.label = 2;
                        case 2:
                            settings = (0, settings_js_1.getSettings_DEPRECATED)();
                            runtimeConfig = convertToSandboxRuntimeConfig(settings);
                            // Log monitor is automatically enabled for macOS
                            return [4 /*yield*/, sandbox_runtime_1.SandboxManager.initialize(runtimeConfig, wrappedCallback)
                                // Subscribe to settings changes to update sandbox config dynamically
                            ];
                        case 3:
                            // Log monitor is automatically enabled for macOS
                            _a.sent();
                            // Subscribe to settings changes to update sandbox config dynamically
                            settingsSubscriptionCleanup = changeDetector_js_1.settingsChangeDetector.subscribe(function () {
                                var settings = (0, settings_js_1.getSettings_DEPRECATED)();
                                var newConfig = convertToSandboxRuntimeConfig(settings);
                                sandbox_runtime_1.SandboxManager.updateConfig(newConfig);
                                (0, debug_js_1.logForDebugging)('Sandbox configuration updated from settings change');
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            // Clear the promise on error so initialization can be retried
                            initializationPromise = undefined;
                            // Log error but don't throw - let sandboxing fail gracefully
                            (0, debug_js_1.logForDebugging)("Failed to initialize sandbox: ".concat((0, errors_js_1.errorMessage)(error_1)));
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })();
            return [2 /*return*/, initializationPromise];
        });
    });
}
/**
 * Refresh sandbox config from current settings immediately
 * Call this after updating permissions to avoid race conditions
 */
function refreshConfig() {
    if (!isSandboxingEnabled())
        return;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var newConfig = convertToSandboxRuntimeConfig(settings);
    sandbox_runtime_1.SandboxManager.updateConfig(newConfig);
}
/**
 * Reset sandbox state and clear memoized values
 */
function reset() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            // Clean up settings subscription
            settingsSubscriptionCleanup === null || settingsSubscriptionCleanup === void 0 ? void 0 : settingsSubscriptionCleanup();
            settingsSubscriptionCleanup = undefined;
            worktreeMainRepoPath = undefined;
            bareGitRepoScrubPaths.length = 0;
            // Clear memoized caches
            (_b = (_a = checkDependencies.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_d = (_c = isSupportedPlatform.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
            initializationPromise = undefined;
            // Reset the base sandbox manager
            return [2 /*return*/, sandbox_runtime_1.SandboxManager.reset()];
        });
    });
}
/**
 * Add a command to the excluded commands list (commands that should not be sandboxed)
 * This is a Claude CLI-specific function that updates local settings.
 */
function addToExcludedCommands(command, permissionUpdates) {
    var _a;
    var existingSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    var existingExcludedCommands = ((_a = existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.sandbox) === null || _a === void 0 ? void 0 : _a.excludedCommands) || [];
    // Determine the command pattern to add
    // If there are suggestions with Bash rules, extract the pattern (e.g., "npm run test" from "npm run test:*")
    // Otherwise use the exact command
    var commandPattern = command;
    if (permissionUpdates) {
        var bashSuggestions = permissionUpdates.filter(function (update) {
            return update.type === 'addRules' &&
                update.rules.some(function (rule) { return rule.toolName === toolName_js_1.BASH_TOOL_NAME; });
        });
        if (bashSuggestions.length > 0 && bashSuggestions[0].type === 'addRules') {
            var firstBashRule = bashSuggestions[0].rules.find(function (rule) { return rule.toolName === toolName_js_1.BASH_TOOL_NAME; });
            if (firstBashRule === null || firstBashRule === void 0 ? void 0 : firstBashRule.ruleContent) {
                // Extract pattern from Bash(command) or Bash(command:*) format
                var prefix = permissionRuleExtractPrefix(firstBashRule.ruleContent);
                commandPattern = prefix || firstBashRule.ruleContent;
            }
        }
    }
    // Add to excludedCommands if not already present
    if (!existingExcludedCommands.includes(commandPattern)) {
        (0, settings_js_1.updateSettingsForSource)('localSettings', {
            sandbox: __assign(__assign({}, existingSettings === null || existingSettings === void 0 ? void 0 : existingSettings.sandbox), { excludedCommands: __spreadArray(__spreadArray([], existingExcludedCommands, true), [commandPattern], false) }),
        });
    }
    return commandPattern;
}
/**
 * Claude CLI sandbox manager - wraps sandbox-runtime with Claude-specific features
 */
exports.SandboxManager = {
    // Custom implementations
    initialize: initialize,
    isSandboxingEnabled: isSandboxingEnabled,
    isSandboxEnabledInSettings: getSandboxEnabledSetting,
    isPlatformInEnabledList: isPlatformInEnabledList,
    getSandboxUnavailableReason: getSandboxUnavailableReason,
    isAutoAllowBashIfSandboxedEnabled: isAutoAllowBashIfSandboxedEnabled,
    areUnsandboxedCommandsAllowed: areUnsandboxedCommandsAllowed,
    isSandboxRequired: isSandboxRequired,
    areSandboxSettingsLockedByPolicy: areSandboxSettingsLockedByPolicy,
    setSandboxSettings: setSandboxSettings,
    getExcludedCommands: getExcludedCommands,
    wrapWithSandbox: wrapWithSandbox,
    refreshConfig: refreshConfig,
    reset: reset,
    checkDependencies: checkDependencies,
    // Forward to base sandbox manager
    getFsReadConfig: sandbox_runtime_1.SandboxManager.getFsReadConfig,
    getFsWriteConfig: sandbox_runtime_1.SandboxManager.getFsWriteConfig,
    getNetworkRestrictionConfig: sandbox_runtime_1.SandboxManager.getNetworkRestrictionConfig,
    getIgnoreViolations: sandbox_runtime_1.SandboxManager.getIgnoreViolations,
    getLinuxGlobPatternWarnings: getLinuxGlobPatternWarnings,
    isSupportedPlatform: isSupportedPlatform,
    getAllowUnixSockets: sandbox_runtime_1.SandboxManager.getAllowUnixSockets,
    getAllowLocalBinding: sandbox_runtime_1.SandboxManager.getAllowLocalBinding,
    getEnableWeakerNestedSandbox: sandbox_runtime_1.SandboxManager.getEnableWeakerNestedSandbox,
    getProxyPort: sandbox_runtime_1.SandboxManager.getProxyPort,
    getSocksProxyPort: sandbox_runtime_1.SandboxManager.getSocksProxyPort,
    getLinuxHttpSocketPath: sandbox_runtime_1.SandboxManager.getLinuxHttpSocketPath,
    getLinuxSocksSocketPath: sandbox_runtime_1.SandboxManager.getLinuxSocksSocketPath,
    waitForNetworkInitialization: sandbox_runtime_1.SandboxManager.waitForNetworkInitialization,
    getSandboxViolationStore: sandbox_runtime_1.SandboxManager.getSandboxViolationStore,
    annotateStderrWithSandboxFailures: sandbox_runtime_1.SandboxManager.annotateStderrWithSandboxFailures,
    cleanupAfterCommand: function () {
        sandbox_runtime_1.SandboxManager.cleanupAfterCommand();
        scrubBareGitRepoFiles();
    },
};
