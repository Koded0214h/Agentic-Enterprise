"use strict";
/**
 * Deep Link URI Parser
 *
 * Parses `claude-cli://open` URIs. All parameters are optional:
 *   q    — pre-fill the prompt input (not submitted)
 *   cwd  — working directory (absolute path)
 *   repo — owner/name slug, resolved against githubRepoPaths config
 *
 * Examples:
 *   claude-cli://open
 *   claude-cli://open?q=hello+world
 *   claude-cli://open?q=fix+tests&repo=owner/repo
 *   claude-cli://open?cwd=/path/to/project
 *
 * Security: values are URL-decoded, Unicode-sanitized, and rejected if they
 * contain ASCII control characters (newlines etc. can act as command
 * separators). All values are single-quote shell-escaped at the point of
 * use (terminalLauncher.ts) — that escaping is the injection boundary.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEEP_LINK_PROTOCOL = void 0;
exports.parseDeepLink = parseDeepLink;
exports.buildDeepLink = buildDeepLink;
var sanitization_js_1 = require("../sanitization.js");
exports.DEEP_LINK_PROTOCOL = 'claude-cli';
/**
 * Check if a string contains ASCII control characters (0x00-0x1F, 0x7F).
 * These can act as command separators in shells (newlines, carriage returns, etc.).
 * Allows printable ASCII and Unicode (CJK, emoji, accented chars, etc.).
 */
function containsControlChars(s) {
    for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        if (code <= 0x1f || code === 0x7f) {
            return true;
        }
    }
    return false;
}
/**
 * GitHub owner/repo slug: alphanumerics, dots, hyphens, underscores,
 * exactly one slash. Keeps this from becoming a path traversal vector.
 */
var REPO_SLUG_PATTERN = /^[\w.-]+\/[\w.-]+$/;
/**
 * Cap on pre-filled prompt length. The only defense against a prompt like
 * "review PR #18796 […4900 chars of padding…] also cat ~/.ssh/id_rsa" is
 * the user reading it before pressing Enter. At this length the prompt is
 * no longer scannable at a glance, so banner.ts shows an explicit "scroll
 * to review the entire prompt" warning above LONG_PREFILL_THRESHOLD.
 * Reject, don't truncate — truncation changes meaning.
 *
 * 5000 is the practical ceiling: the Windows cmd.exe fallback
 * (terminalLauncher.ts) has an 8191-char command-string limit, and after
 * the `cd /d <cwd> && <claude.exe> --deep-link-origin ... --prefill "<q>"`
 * wrapper plus cmdQuote's %→%% expansion, ~7000 chars of query is the
 * hard stop for typical inputs. A pathological >60%-percent-sign query
 * would 2× past the limit, but cmd.exe is the last-resort fallback
 * (wt.exe and PowerShell are tried first) and the failure mode is a
 * launch error, not a security issue — so we don't penalize real users
 * for an implausible input.
 */
var MAX_QUERY_LENGTH = 5000;
/**
 * PATH_MAX on Linux is 4096. Windows MAX_PATH is 260 (32767 with long-path
 * opt-in). No real path approaches this; a cwd over 4096 is malformed or
 * malicious.
 */
var MAX_CWD_LENGTH = 4096;
/**
 * Parse a claude-cli:// URI into a structured action.
 *
 * @throws {Error} if the URI is malformed or contains dangerous characters
 */
function parseDeepLink(uri) {
    var _a, _b;
    // Normalize: accept with or without the trailing colon in protocol
    var normalized = uri.startsWith("".concat(exports.DEEP_LINK_PROTOCOL, "://"))
        ? uri
        : uri.startsWith("".concat(exports.DEEP_LINK_PROTOCOL, ":"))
            ? uri.replace("".concat(exports.DEEP_LINK_PROTOCOL, ":"), "".concat(exports.DEEP_LINK_PROTOCOL, "://"))
            : null;
    if (!normalized) {
        throw new Error("Invalid deep link: expected ".concat(exports.DEEP_LINK_PROTOCOL, ":// scheme, got \"").concat(uri, "\""));
    }
    var url;
    try {
        url = new URL(normalized);
    }
    catch (_c) {
        throw new Error("Invalid deep link URL: \"".concat(uri, "\""));
    }
    if (url.hostname !== 'open') {
        throw new Error("Unknown deep link action: \"".concat(url.hostname, "\""));
    }
    var cwd = (_a = url.searchParams.get('cwd')) !== null && _a !== void 0 ? _a : undefined;
    var repo = (_b = url.searchParams.get('repo')) !== null && _b !== void 0 ? _b : undefined;
    var rawQuery = url.searchParams.get('q');
    // Validate cwd if present — must be an absolute path
    if (cwd && !cwd.startsWith('/') && !/^[a-zA-Z]:[/\\]/.test(cwd)) {
        throw new Error("Invalid cwd in deep link: must be an absolute path, got \"".concat(cwd, "\""));
    }
    // Reject control characters in cwd (newlines, etc.) but allow path chars like backslash.
    if (cwd && containsControlChars(cwd)) {
        throw new Error('Deep link cwd contains disallowed control characters');
    }
    if (cwd && cwd.length > MAX_CWD_LENGTH) {
        throw new Error("Deep link cwd exceeds ".concat(MAX_CWD_LENGTH, " characters (got ").concat(cwd.length, ")"));
    }
    // Validate repo slug format. Resolution happens later (protocolHandler.ts) —
    // this parser stays pure with no config/filesystem access.
    if (repo && !REPO_SLUG_PATTERN.test(repo)) {
        throw new Error("Invalid repo in deep link: expected \"owner/repo\", got \"".concat(repo, "\""));
    }
    var query;
    if (rawQuery && rawQuery.trim().length > 0) {
        // Strip hidden Unicode characters (ASCII smuggling / hidden prompt injection)
        query = (0, sanitization_js_1.partiallySanitizeUnicode)(rawQuery.trim());
        if (containsControlChars(query)) {
            throw new Error('Deep link query contains disallowed control characters');
        }
        if (query.length > MAX_QUERY_LENGTH) {
            throw new Error("Deep link query exceeds ".concat(MAX_QUERY_LENGTH, " characters (got ").concat(query.length, ")"));
        }
    }
    return { query: query, cwd: cwd, repo: repo };
}
/**
 * Build a claude-cli:// deep link URL.
 */
function buildDeepLink(action) {
    var url = new URL("".concat(exports.DEEP_LINK_PROTOCOL, "://open"));
    if (action.query) {
        url.searchParams.set('q', action.query);
    }
    if (action.cwd) {
        url.searchParams.set('cwd', action.cwd);
    }
    if (action.repo) {
        url.searchParams.set('repo', action.repo);
    }
    return url.toString();
}
