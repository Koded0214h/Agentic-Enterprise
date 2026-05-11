"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAutoMemPath = void 0;
exports.isAutoMemoryEnabled = isAutoMemoryEnabled;
exports.isExtractModeActive = isExtractModeActive;
exports.getMemoryBaseDir = getMemoryBaseDir;
exports.hasAutoMemPathOverride = hasAutoMemPathOverride;
exports.getAutoMemDailyLogPath = getAutoMemDailyLogPath;
exports.getAutoMemEntrypoint = getAutoMemEntrypoint;
exports.isAutoMemPath = isAutoMemPath;
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var git_js_1 = require("../utils/git.js");
var path_js_1 = require("../utils/path.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Whether auto-memory features are enabled (memdir, agent memory, past session search).
 * Enabled by default. Priority chain (first defined wins):
 *   1. CLAUDE_CODE_DISABLE_AUTO_MEMORY env var (1/true → OFF, 0/false → ON)
 *   2. CLAUDE_CODE_SIMPLE (--bare) → OFF
 *   3. CCR without persistent storage → OFF (no CLAUDE_CODE_REMOTE_MEMORY_DIR)
 *   4. autoMemoryEnabled in settings.json (supports project-level opt-out)
 *   5. Default: enabled
 */
function isAutoMemoryEnabled() {
    var envVal = process.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY;
    if ((0, envUtils_js_1.isEnvTruthy)(envVal)) {
        return false;
    }
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(envVal)) {
        return true;
    }
    // --bare / SIMPLE: prompts.ts already drops the memory section from the
    // system prompt via its SIMPLE early-return; this gate stops the other half
    // (extractMemories turn-end fork, autoDream, /remember, /dream, team sync).
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
        return false;
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
        !process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR) {
        return false;
    }
    var settings = (0, settings_js_1.getInitialSettings)();
    if (settings.autoMemoryEnabled !== undefined) {
        return settings.autoMemoryEnabled;
    }
    return true;
}
/**
 * Whether the extract-memories background agent will run this session.
 *
 * The main agent's prompt always has full save instructions regardless of
 * this gate — when the main agent writes memories, the background agent
 * skips that range (hasMemoryWritesSince in extractMemories.ts); when it
 * doesn't, the background agent catches anything missed.
 *
 * Callers must also gate on feature('EXTRACT_MEMORIES') — that check cannot
 * live inside this helper because feature() only tree-shakes when used
 * directly in an `if` condition.
 */
function isExtractModeActive() {
    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_passport_quail', false)) {
        return false;
    }
    return (!(0, state_js_1.getIsNonInteractiveSession)() ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_slate_thimble', false));
}
/**
 * Returns the base directory for persistent memory storage.
 * Resolution order:
 *   1. CLAUDE_CODE_REMOTE_MEMORY_DIR env var (explicit override, set in CCR)
 *   2. ~/.claude (default config home)
 */
function getMemoryBaseDir() {
    if (process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR) {
        return process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR;
    }
    return (0, envUtils_js_1.getClaudeConfigHomeDir)();
}
var AUTO_MEM_DIRNAME = 'memory';
var AUTO_MEM_ENTRYPOINT_NAME = 'MEMORY.md';
/**
 * Normalize and validate a candidate auto-memory directory path.
 *
 * SECURITY: Rejects paths that would be dangerous as a read-allowlist root
 * or that normalize() doesn't fully resolve:
 * - relative (!isAbsolute): "../foo" — would be interpreted relative to CWD
 * - root/near-root (length < 3): "/" → "" after strip; "/a" too short
 * - Windows drive-root (C: regex): "C:\" → "C:" after strip
 * - UNC paths (\\server\share): network paths — opaque trust boundary
 * - null byte: survives normalize(), can truncate in syscalls
 *
 * Returns the normalized path with exactly one trailing separator,
 * or undefined if the path is unset/empty/rejected.
 */
function validateMemoryPath(raw, expandTilde) {
    if (!raw) {
        return undefined;
    }
    var candidate = raw;
    // Settings.json paths support ~/ expansion (user-friendly). The env var
    // override does not (it's set programmatically by Cowork/SDK, which should
    // always pass absolute paths). Bare "~", "~/", "~/.", "~/..", etc. are NOT
    // expanded — they would make isAutoMemPath() match all of $HOME or its
    // parent (same class of danger as "/" or "C:\").
    if (expandTilde &&
        (candidate.startsWith('~/') || candidate.startsWith('~\\'))) {
        var rest = candidate.slice(2);
        // Reject trivial remainders that would expand to $HOME or an ancestor.
        // normalize('') = '.', normalize('.') = '.', normalize('foo/..') = '.',
        // normalize('..') = '..', normalize('foo/../..') = '..'
        var restNorm = (0, path_1.normalize)(rest || '.');
        if (restNorm === '.' || restNorm === '..') {
            return undefined;
        }
        candidate = (0, path_1.join)((0, os_1.homedir)(), rest);
    }
    // normalize() may preserve a trailing separator; strip before adding
    // exactly one to match the trailing-sep contract of getAutoMemPath()
    var normalized = (0, path_1.normalize)(candidate).replace(/[/\\]+$/, '');
    if (!(0, path_1.isAbsolute)(normalized) ||
        normalized.length < 3 ||
        /^[A-Za-z]:$/.test(normalized) ||
        normalized.startsWith('\\\\') ||
        normalized.startsWith('//') ||
        normalized.includes('\0')) {
        return undefined;
    }
    return (normalized + path_1.sep).normalize('NFC');
}
/**
 * Direct override for the full auto-memory directory path via env var.
 * When set, getAutoMemPath()/getAutoMemEntrypoint() return this path directly
 * instead of computing `{base}/projects/{sanitized-cwd}/memory/`.
 *
 * Used by Cowork to redirect memory to a space-scoped mount where the
 * per-session cwd (which contains the VM process name) would otherwise
 * produce a different project-key for every session.
 */
function getAutoMemPathOverride() {
    return validateMemoryPath(process.env.CLAUDE_COWORK_MEMORY_PATH_OVERRIDE, false);
}
/**
 * Settings.json override for the full auto-memory directory path.
 * Supports ~/ expansion for user convenience.
 *
 * SECURITY: projectSettings (.claude/settings.json committed to the repo) is
 * intentionally excluded — a malicious repo could otherwise set
 * autoMemoryDirectory: "~/.ssh" and gain silent write access to sensitive
 * directories via the filesystem.ts write carve-out (which fires when
 * isAutoMemPath() matches and hasAutoMemPathOverride() is false). This follows
 * the same pattern as hasSkipDangerousModePermissionPrompt() etc.
 */
function getAutoMemPathSetting() {
    var _a, _b, _c, _d, _e, _f, _g;
    var dir = (_f = (_d = (_b = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.autoMemoryDirectory) !== null && _b !== void 0 ? _b : (_c = (0, settings_js_1.getSettingsForSource)('flagSettings')) === null || _c === void 0 ? void 0 : _c.autoMemoryDirectory) !== null && _d !== void 0 ? _d : (_e = (0, settings_js_1.getSettingsForSource)('localSettings')) === null || _e === void 0 ? void 0 : _e.autoMemoryDirectory) !== null && _f !== void 0 ? _f : (_g = (0, settings_js_1.getSettingsForSource)('userSettings')) === null || _g === void 0 ? void 0 : _g.autoMemoryDirectory;
    return validateMemoryPath(dir, true);
}
/**
 * Check if CLAUDE_COWORK_MEMORY_PATH_OVERRIDE is set to a valid override.
 * Use this as a signal that the SDK caller has explicitly opted into
 * the auto-memory mechanics — e.g. to decide whether to inject the
 * memory prompt when a custom system prompt replaces the default.
 */
function hasAutoMemPathOverride() {
    return getAutoMemPathOverride() !== undefined;
}
/**
 * Returns the canonical git repo root if available, otherwise falls back to
 * the stable project root. Uses findCanonicalGitRoot so all worktrees of the
 * same repo share one auto-memory directory (anthropics/claude-code#24382).
 */
function getAutoMemBase() {
    var _a;
    return (_a = (0, git_js_1.findCanonicalGitRoot)((0, state_js_1.getProjectRoot)())) !== null && _a !== void 0 ? _a : (0, state_js_1.getProjectRoot)();
}
/**
 * Returns the auto-memory directory path.
 *
 * Resolution order:
 *   1. CLAUDE_COWORK_MEMORY_PATH_OVERRIDE env var (full-path override, used by Cowork)
 *   2. autoMemoryDirectory in settings.json (trusted sources only: policy/local/user)
 *   3. <memoryBase>/projects/<sanitized-git-root>/memory/
 *      where memoryBase is resolved by getMemoryBaseDir()
 *
 * Memoized: render-path callers (collapseReadSearchGroups → isAutoManagedMemoryFile)
 * fire per tool-use message per Messages re-render; each miss costs
 * getSettingsForSource × 4 → parseSettingsFile (realpathSync + readFileSync).
 * Keyed on projectRoot so tests that change its mock mid-block recompute;
 * env vars / settings.json / CLAUDE_CONFIG_DIR are session-stable in
 * production and covered by per-test cache.clear.
 */
exports.getAutoMemPath = (0, memoize_js_1.default)(function () {
    var _a;
    var override = (_a = getAutoMemPathOverride()) !== null && _a !== void 0 ? _a : getAutoMemPathSetting();
    if (override) {
        return override;
    }
    var projectsDir = (0, path_1.join)(getMemoryBaseDir(), 'projects');
    return ((0, path_1.join)(projectsDir, (0, path_js_1.sanitizePath)(getAutoMemBase()), AUTO_MEM_DIRNAME) + path_1.sep).normalize('NFC');
}, function () { return (0, state_js_1.getProjectRoot)(); });
/**
 * Returns the daily log file path for the given date (defaults to today).
 * Shape: <autoMemPath>/logs/YYYY/MM/YYYY-MM-DD.md
 *
 * Used by assistant mode (feature('KAIROS')): rather than maintaining
 * MEMORY.md as a live index, the agent appends to a date-named log file
 * as it works. A separate nightly /dream skill distills these logs into
 * topic files + MEMORY.md.
 */
function getAutoMemDailyLogPath(date) {
    if (date === void 0) { date = new Date(); }
    var yyyy = date.getFullYear().toString();
    var mm = (date.getMonth() + 1).toString().padStart(2, '0');
    var dd = date.getDate().toString().padStart(2, '0');
    return (0, path_1.join)((0, exports.getAutoMemPath)(), 'logs', yyyy, mm, "".concat(yyyy, "-").concat(mm, "-").concat(dd, ".md"));
}
/**
 * Returns the auto-memory entrypoint (MEMORY.md inside the auto-memory dir).
 * Follows the same resolution order as getAutoMemPath().
 */
function getAutoMemEntrypoint() {
    return (0, path_1.join)((0, exports.getAutoMemPath)(), AUTO_MEM_ENTRYPOINT_NAME);
}
/**
 * Check if an absolute path is within the auto-memory directory.
 *
 * When CLAUDE_COWORK_MEMORY_PATH_OVERRIDE is set, this matches against the
 * env-var override directory. Note that a true return here does NOT imply
 * write permission in that case — the filesystem.ts write carve-out is gated
 * on !hasAutoMemPathOverride() (it exists to bypass DANGEROUS_DIRECTORIES).
 *
 * The settings.json autoMemoryDirectory DOES get the write carve-out: it's the
 * user's explicit choice from a trusted settings source (projectSettings is
 * excluded — see getAutoMemPathSetting), and hasAutoMemPathOverride() remains
 * false for it.
 */
function isAutoMemPath(absolutePath) {
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    return normalizedPath.startsWith((0, exports.getAutoMemPath)());
}
