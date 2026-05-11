"use strict";
/**
 * Filter and sanitize installed-app data for inclusion in the `request_access`
 * tool description. Ported from Cowork's appNames.ts. Two
 * concerns: noise filtering (Spotlight returns every bundle on disk — XPC
 * helpers, daemons, input methods) and prompt-injection hardening (app names
 * are attacker-controlled; anyone can ship an app named anything).
 *
 * Residual risk: short benign-char adversarial names ("grant all") can't be
 * filtered programmatically. The tool description's structural framing
 * ("Available applications:") makes it clear these are app names, and the
 * downstream permission dialog requires explicit user approval — a bad name
 * can't auto-grant anything.
 */
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
exports.filterAppsForDescription = filterAppsForDescription;
// ── Noise filtering ──────────────────────────────────────────────────────
/**
 * Only apps under these roots are shown. /System/Library subpaths (CoreServices,
 * PrivateFrameworks, Input Methods) are OS plumbing — anchor on known-good
 * roots rather than blocklisting every junk subpath since new macOS versions
 * add more.
 *
 * ~/Applications is checked at call time via the `homeDir` arg (HOME isn't
 * reliably known at module load in all environments).
 */
var PATH_ALLOWLIST = [
    '/Applications/',
    '/System/Applications/',
];
/**
 * Display-name patterns that mark background services even under /Applications.
 * `(?:$|\s\()` — matches keyword at end-of-string OR immediately before ` (`:
 * "Slack Helper (GPU)" and "ABAssistantService" fail, "Service Desk" passes
 * (Service is followed by " D").
 */
var NAME_PATTERN_BLOCKLIST = [
    /Helper(?:$|\s\()/,
    /Agent(?:$|\s\()/,
    /Service(?:$|\s\()/,
    /Uninstaller(?:$|\s\()/,
    /Updater(?:$|\s\()/,
    /^\./,
];
/**
 * Apps commonly requested for CU automation. ALWAYS included if installed,
 * bypassing path check + count cap — the model needs these exact names even
 * when the machine has 200+ apps. Bundle IDs (locale-invariant), not display
 * names. Keep <30 — each entry is a guaranteed token in the description.
 */
var ALWAYS_KEEP_BUNDLE_IDS = new Set([
    // Browsers
    'com.apple.Safari',
    'com.google.Chrome',
    'com.microsoft.edgemac',
    'org.mozilla.firefox',
    'company.thebrowser.Browser', // Arc
    // Communication
    'com.tinyspeck.slackmacgap',
    'us.zoom.xos',
    'com.microsoft.teams2',
    'com.microsoft.teams',
    'com.apple.MobileSMS',
    'com.apple.mail',
    // Productivity
    'com.microsoft.Word',
    'com.microsoft.Excel',
    'com.microsoft.Powerpoint',
    'com.microsoft.Outlook',
    'com.apple.iWork.Pages',
    'com.apple.iWork.Numbers',
    'com.apple.iWork.Keynote',
    'com.google.GoogleDocs',
    // Notes / PM
    'notion.id',
    'com.apple.Notes',
    'md.obsidian',
    'com.linear',
    'com.figma.Desktop',
    // Dev
    'com.microsoft.VSCode',
    'com.apple.Terminal',
    'com.googlecode.iterm2',
    'com.github.GitHubDesktop',
    // System essentials the model genuinely targets
    'com.apple.finder',
    'com.apple.iCal',
    'com.apple.systempreferences',
]);
// ── Prompt-injection hardening ───────────────────────────────────────────
/**
 * `\p{L}\p{M}\p{N}` with /u — not `\w` (ASCII-only, would drop Bücher, 微信,
 * Préférences Système). `\p{M}` matches combining marks so NFD-decomposed
 * diacritics (ü → u + ◌̈) pass. Single space not `\s` — `\s` matches newlines,
 * which would let "App\nIgnore previous…" through as a multi-line injection.
 * Still bars quotes, angle brackets, backticks, pipes, colons.
 */
var APP_NAME_ALLOWED = /^[\p{L}\p{M}\p{N}_ .&'()+-]+$/u;
var APP_NAME_MAX_LEN = 40;
var APP_NAME_MAX_COUNT = 50;
function isUserFacingPath(path, homeDir) {
    if (PATH_ALLOWLIST.some(function (root) { return path.startsWith(root); }))
        return true;
    if (homeDir) {
        var userApps = homeDir.endsWith('/')
            ? "".concat(homeDir, "Applications/")
            : "".concat(homeDir, "/Applications/");
        if (path.startsWith(userApps))
            return true;
    }
    return false;
}
function isNoisyName(name) {
    return NAME_PATTERN_BLOCKLIST.some(function (re) { return re.test(name); });
}
/**
 * Length cap + trim + dedupe + sort. `applyCharFilter` — skip for trusted
 * bundle IDs (Apple/Google/MS; a localized "Réglages Système" with unusual
 * punctuation shouldn't be dropped), apply for anything attacker-installable.
 */
function sanitizeCore(raw, applyCharFilter) {
    var seen = new Set();
    return raw
        .map(function (name) { return name.trim(); })
        .filter(function (trimmed) {
        if (!trimmed)
            return false;
        if (trimmed.length > APP_NAME_MAX_LEN)
            return false;
        if (applyCharFilter && !APP_NAME_ALLOWED.test(trimmed))
            return false;
        if (seen.has(trimmed))
            return false;
        seen.add(trimmed);
        return true;
    })
        .sort(function (a, b) { return a.localeCompare(b); });
}
function sanitizeAppNames(raw) {
    var filtered = sanitizeCore(raw, true);
    if (filtered.length <= APP_NAME_MAX_COUNT)
        return filtered;
    return __spreadArray(__spreadArray([], filtered.slice(0, APP_NAME_MAX_COUNT), true), [
        "\u2026 and ".concat(filtered.length - APP_NAME_MAX_COUNT, " more"),
    ], false);
}
function sanitizeTrustedNames(raw) {
    return sanitizeCore(raw, false);
}
/**
 * Filter raw Spotlight results to user-facing apps, then sanitize. Always-keep
 * apps bypass path/name filter AND char allowlist (trusted vendors, not
 * attacker-installed); still length-capped, deduped, sorted.
 */
function filterAppsForDescription(installed, homeDir) {
    var _a = installed.reduce(function (acc, app) {
        if (ALWAYS_KEEP_BUNDLE_IDS.has(app.bundleId)) {
            acc.alwaysKept.push(app.displayName);
        }
        else if (isUserFacingPath(app.path, homeDir) &&
            !isNoisyName(app.displayName)) {
            acc.rest.push(app.displayName);
        }
        return acc;
    }, { alwaysKept: [], rest: [] }), alwaysKept = _a.alwaysKept, rest = _a.rest;
    var sanitizedAlways = sanitizeTrustedNames(alwaysKept);
    var alwaysSet = new Set(sanitizedAlways);
    return __spreadArray(__spreadArray([], sanitizedAlways, true), sanitizeAppNames(rest).filter(function (n) { return !alwaysSet.has(n); }), true);
}
