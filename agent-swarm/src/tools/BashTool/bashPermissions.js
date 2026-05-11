"use strict";
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
exports.bashToolCheckPermission = exports.bashToolCheckExactMatchPermission = exports.BINARY_HIJACK_VARS = exports.bashPermissionRule = exports.permissionRuleExtractPrefix = exports.MAX_SUGGESTED_RULES_FOR_COMPOUND = exports.MAX_SUBCOMMANDS_FOR_SECURITY_CHECK = void 0;
exports.getSimpleCommandPrefix = getSimpleCommandPrefix;
exports.getFirstWordPrefix = getFirstWordPrefix;
exports.matchWildcardPattern = matchWildcardPattern;
exports.stripSafeWrappers = stripSafeWrappers;
exports.stripWrappersFromArgv = stripWrappersFromArgv;
exports.stripAllLeadingEnvVars = stripAllLeadingEnvVars;
exports.checkCommandAndSuggestRules = checkCommandAndSuggestRules;
exports.peekSpeculativeClassifierCheck = peekSpeculativeClassifierCheck;
exports.startSpeculativeClassifierCheck = startSpeculativeClassifierCheck;
exports.consumeSpeculativeClassifierCheck = consumeSpeculativeClassifierCheck;
exports.clearSpeculativeChecks = clearSpeculativeChecks;
exports.awaitClassifierAutoApproval = awaitClassifierAutoApproval;
exports.executeAsyncClassifierCheck = executeAsyncClassifierCheck;
exports.bashToolHasPermission = bashToolHasPermission;
exports.isNormalizedGitCommand = isNormalizedGitCommand;
exports.isNormalizedCdCommand = isNormalizedCdCommand;
exports.commandHasAnyCd = commandHasAnyCd;
var bun_bundle_1 = require("bun:bundle");
var sdk_1 = require("@anthropic-ai/sdk");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var array_js_1 = require("../../utils/array.js");
var ast_js_1 = require("../../utils/bash/ast.js");
var commands_js_1 = require("../../utils/bash/commands.js");
var parser_js_1 = require("../../utils/bash/parser.js");
var shellQuote_js_1 = require("../../utils/bash/shellQuote.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var bashClassifier_js_1 = require("../../utils/permissions/bashClassifier.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var permissionRuleParser_js_1 = require("../../utils/permissions/permissionRuleParser.js");
var permissions_js_1 = require("../../utils/permissions/permissions.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var platform_js_1 = require("../../utils/platform.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var windowsPaths_js_1 = require("../../utils/windowsPaths.js");
var BashTool_js_1 = require("./BashTool.js");
var bashCommandHelpers_js_1 = require("./bashCommandHelpers.js");
var bashSecurity_js_1 = require("./bashSecurity.js");
var modeValidation_js_1 = require("./modeValidation.js");
var pathValidation_js_1 = require("./pathValidation.js");
var sedValidation_js_1 = require("./sedValidation.js");
var shouldUseSandbox_js_1 = require("./shouldUseSandbox.js");
// DCE cliff: Bun's feature() evaluator has a per-function complexity budget.
// bashToolHasPermission is right at the limit. `import { X as Y }` aliases
// inside the import block count toward this budget; when they push it over
// the threshold Bun can no longer prove feature('BASH_CLASSIFIER') is a
// constant and silently evaluates the ternaries to `false`, dropping every
// pendingClassifierCheck spread. Keep aliases as top-level const rebindings
// instead. (See also the comment on checkSemanticsDeny below.)
var bashCommandIsSafeAsync = bashSecurity_js_1.bashCommandIsSafeAsync_DEPRECATED;
var splitCommand = commands_js_1.splitCommand_DEPRECATED;
// Env-var assignment prefix (VAR=value). Shared across three while-loops that
// skip safe env vars before extracting the command name.
var ENV_VAR_ASSIGN_RE = /^[A-Za-z_]\w*=/;
// CC-643: On complex compound commands, splitCommand_DEPRECATED can produce a
// very large subcommands array (possible exponential growth; #21405's ReDoS fix
// may have been incomplete). Each subcommand then runs tree-sitter parse +
// ~20 validators + logEvent (bashSecurity.ts), and with memoized metadata the
// resulting microtask chain starves the event loop — REPL freeze at 100% CPU,
// strace showed /proc/self/stat reads at ~127Hz with no epoll_wait. Fifty is
// generous: legitimate user commands don't split that wide. Above the cap we
// fall back to 'ask' (safe default — we can't prove safety, so we prompt).
exports.MAX_SUBCOMMANDS_FOR_SECURITY_CHECK = 50;
// GH#11380: Cap the number of per-subcommand rules suggested for compound
// commands. Beyond this, the "Yes, and don't ask again for X, Y, Z…" label
// degrades to "similar commands" anyway, and saving 10+ rules from one prompt
// is more likely noise than intent. Users chaining this many write commands
// in one && list are rare; they can always approve once and add rules manually.
exports.MAX_SUGGESTED_RULES_FOR_COMPOUND = 5;
/**
 * [ANT-ONLY] Log classifier evaluation results for analysis.
 * This helps us understand which classifier rules are being evaluated
 * and how the classifier is deciding on commands.
 */
function logClassifierResultForAnts(command, behavior, descriptions, result) {
    var _a;
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    (0, index_js_1.logEvent)('tengu_internal_bash_classifier_result', {
        behavior: behavior,
        descriptions: (0, slowOperations_js_1.jsonStringify)(descriptions),
        matches: result.matches,
        matchedDescription: ((_a = result.matchedDescription) !== null && _a !== void 0 ? _a : ''),
        confidence: result.confidence,
        reason: result.reason,
        // Note: command contains code/filepaths - this is ANT-ONLY so it's OK
        command: command,
    });
}
/**
 * Extract a stable command prefix (command + subcommand) from a raw command string.
 * Skips leading env var assignments only if they are in SAFE_ENV_VARS (or
 * ANT_ONLY_SAFE_ENV_VARS for ant users). Returns null if a non-safe env var is
 * encountered (to fall back to exact match), or if the second token doesn't look
 * like a subcommand (lowercase alphanumeric, e.g., "commit", "run").
 *
 * Examples:
 *   'git commit -m "fix typo"' → 'git commit'
 *   'NODE_ENV=prod npm run build' → 'npm run' (NODE_ENV is safe)
 *   'MY_VAR=val npm run build' → null (MY_VAR is not safe)
 *   'ls -la' → null (flag, not a subcommand)
 *   'cat file.txt' → null (filename, not a subcommand)
 *   'chmod 755 file' → null (number, not a subcommand)
 */
function getSimpleCommandPrefix(command) {
    var tokens = command.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0)
        return null;
    // Skip env var assignments (VAR=value) at the start, but only if they are
    // in SAFE_ENV_VARS (or ANT_ONLY_SAFE_ENV_VARS for ant users). If a non-safe
    // env var is encountered, return null to fall back to exact match. This
    // prevents generating prefix rules like Bash(npm run:*) that can never match
    // at allow-rule check time, because stripSafeWrappers only strips safe vars.
    var i = 0;
    while (i < tokens.length && ENV_VAR_ASSIGN_RE.test(tokens[i])) {
        var varName = tokens[i].split('=')[0];
        var isAntOnlySafe = process.env.USER_TYPE === 'ant' && ANT_ONLY_SAFE_ENV_VARS.has(varName);
        if (!SAFE_ENV_VARS.has(varName) && !isAntOnlySafe) {
            return null;
        }
        i++;
    }
    var remaining = tokens.slice(i);
    if (remaining.length < 2)
        return null;
    var subcmd = remaining[1];
    // Second token must look like a subcommand (e.g., "commit", "run", "compose"),
    // not a flag (-rf), filename (file.txt), path (/tmp), URL, or number (755).
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(subcmd))
        return null;
    return remaining.slice(0, 2).join(' ');
}
// Bare-prefix suggestions like `bash:*` or `sh:*` would allow arbitrary code
// via `-c`. Wrapper suggestions like `env:*` or `sudo:*` would do the same:
// `env` is NOT in SAFE_WRAPPER_PATTERNS, so `env bash -c "evil"` survives
// stripSafeWrappers unchanged and hits the startsWith("env ") check at
// the prefix-rule matcher. Shell list mirrors DANGEROUS_SHELL_PREFIXES in
// src/utils/shell/prefix.ts which guarded the old Haiku extractor.
var BARE_SHELL_PREFIXES = new Set([
    'sh',
    'bash',
    'zsh',
    'fish',
    'csh',
    'tcsh',
    'ksh',
    'dash',
    'cmd',
    'powershell',
    'pwsh',
    // wrappers that exec their args as a command
    'env',
    'xargs',
    // SECURITY: checkSemantics (ast.ts) strips these wrappers to check the
    // wrapped command. Suggesting `Bash(nice:*)` would be ≈ `Bash(*)` — users
    // would add it after a prompt, then `nice rm -rf /` passes semantics while
    // deny/cd+git gates see 'nice' (SAFE_WRAPPER_PATTERNS below didn't strip
    // bare `nice` until this fix). Block these from ever being suggested.
    'nice',
    'stdbuf',
    'nohup',
    'timeout',
    'time',
    // privilege escalation — sudo:* from `sudo -u foo ...` would auto-approve
    // any future sudo invocation
    'sudo',
    'doas',
    'pkexec',
]);
/**
 * UI-only fallback: extract the first word alone when getSimpleCommandPrefix
 * declines. In external builds TREE_SITTER_BASH is off, so the async
 * tree-sitter refinement in BashPermissionRequest never fires — without this,
 * pipes and compounds (`python3 file.py 2>&1 | tail -20`) dump into the
 * editable field verbatim.
 *
 * Deliberately not used by suggestionForExactCommand: a backend-suggested
 * `Bash(rm:*)` is too broad to auto-generate, but as an editable starting
 * point it's what users expect (Slack C07VBSHV7EV/p1772670433193449).
 *
 * Reuses the same SAFE_ENV_VARS gate as getSimpleCommandPrefix — a rule like
 * `Bash(python3:*)` can never match `RUN=/path python3 ...` at check time
 * because stripSafeWrappers won't strip RUN.
 */
function getFirstWordPrefix(command) {
    var tokens = command.trim().split(/\s+/).filter(Boolean);
    var i = 0;
    while (i < tokens.length && ENV_VAR_ASSIGN_RE.test(tokens[i])) {
        var varName = tokens[i].split('=')[0];
        var isAntOnlySafe = process.env.USER_TYPE === 'ant' && ANT_ONLY_SAFE_ENV_VARS.has(varName);
        if (!SAFE_ENV_VARS.has(varName) && !isAntOnlySafe) {
            return null;
        }
        i++;
    }
    var cmd = tokens[i];
    if (!cmd)
        return null;
    // Same shape check as the subcommand regex in getSimpleCommandPrefix:
    // rejects paths (./script.sh, /usr/bin/python), flags, numbers, filenames.
    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(cmd))
        return null;
    if (BARE_SHELL_PREFIXES.has(cmd))
        return null;
    return cmd;
}
function suggestionForExactCommand(command) {
    // Heredoc commands contain multi-line content that changes each invocation,
    // making exact-match rules useless (they'll never match again). Extract a
    // stable prefix before the heredoc operator and suggest a prefix rule instead.
    var heredocPrefix = extractPrefixBeforeHeredoc(command);
    if (heredocPrefix) {
        return (0, shellRuleMatching_js_1.suggestionForPrefix)(BashTool_js_1.BashTool.name, heredocPrefix);
    }
    // Multiline commands without heredoc also make poor exact-match rules.
    // Saving the full multiline text can produce patterns containing `:*` in
    // the middle, which fails permission validation and corrupts the settings
    // file. Use the first line as a prefix rule instead.
    if (command.includes('\n')) {
        var firstLine = command.split('\n')[0].trim();
        if (firstLine) {
            return (0, shellRuleMatching_js_1.suggestionForPrefix)(BashTool_js_1.BashTool.name, firstLine);
        }
    }
    // Single-line commands: extract a 2-word prefix for reusable rules.
    // Without this, exact-match rules are saved that never match future
    // invocations with different arguments.
    var prefix = getSimpleCommandPrefix(command);
    if (prefix) {
        return (0, shellRuleMatching_js_1.suggestionForPrefix)(BashTool_js_1.BashTool.name, prefix);
    }
    return (0, shellRuleMatching_js_1.suggestionForExactCommand)(BashTool_js_1.BashTool.name, command);
}
/**
 * If the command contains a heredoc (<<), extract the command prefix before it.
 * Returns the first word(s) before the heredoc operator as a stable prefix,
 * or null if the command doesn't contain a heredoc.
 *
 * Examples:
 *   'git commit -m "$(cat <<\'EOF\'\n...\nEOF\n)"' → 'git commit'
 *   'cat <<EOF\nhello\nEOF' → 'cat'
 *   'echo hello' → null (no heredoc)
 */
function extractPrefixBeforeHeredoc(command) {
    if (!command.includes('<<'))
        return null;
    var idx = command.indexOf('<<');
    if (idx <= 0)
        return null;
    var before = command.substring(0, idx).trim();
    if (!before)
        return null;
    var prefix = getSimpleCommandPrefix(before);
    if (prefix)
        return prefix;
    // Fallback: skip safe env var assignments and take up to 2 tokens.
    // This preserves flag tokens (e.g., "python3 -c" stays "python3 -c",
    // not just "python3") and skips safe env var prefixes like "NODE_ENV=test".
    // If a non-safe env var is encountered, return null to avoid generating
    // prefix rules that can never match (same rationale as getSimpleCommandPrefix).
    var tokens = before.split(/\s+/).filter(Boolean);
    var i = 0;
    while (i < tokens.length && ENV_VAR_ASSIGN_RE.test(tokens[i])) {
        var varName = tokens[i].split('=')[0];
        var isAntOnlySafe = process.env.USER_TYPE === 'ant' && ANT_ONLY_SAFE_ENV_VARS.has(varName);
        if (!SAFE_ENV_VARS.has(varName) && !isAntOnlySafe) {
            return null;
        }
        i++;
    }
    if (i >= tokens.length)
        return null;
    return tokens.slice(i, i + 2).join(' ') || null;
}
function suggestionForPrefix(prefix) {
    return (0, shellRuleMatching_js_1.suggestionForPrefix)(BashTool_js_1.BashTool.name, prefix);
}
/**
 * Extract prefix from legacy :* syntax (e.g., "npm:*" -> "npm")
 * Delegates to shared implementation.
 */
exports.permissionRuleExtractPrefix = shellRuleMatching_js_1.permissionRuleExtractPrefix;
/**
 * Match a command against a wildcard pattern (case-sensitive for Bash).
 * Delegates to shared implementation.
 */
function matchWildcardPattern(pattern, command) {
    return (0, shellRuleMatching_js_1.matchWildcardPattern)(pattern, command);
}
/**
 * Parse a permission rule into a structured rule object.
 * Delegates to shared implementation.
 */
exports.bashPermissionRule = shellRuleMatching_js_1.parsePermissionRule;
/**
 * Whitelist of environment variables that are safe to strip from commands.
 * These variables CANNOT execute code or load libraries.
 *
 * SECURITY: These must NEVER be added to the whitelist:
 * - PATH, LD_PRELOAD, LD_LIBRARY_PATH, DYLD_* (execution/library loading)
 * - PYTHONPATH, NODE_PATH, CLASSPATH, RUBYLIB (module loading)
 * - GOFLAGS, RUSTFLAGS, NODE_OPTIONS (can contain code execution flags)
 * - HOME, TMPDIR, SHELL, BASH_ENV (affect system behavior)
 */
var SAFE_ENV_VARS = new Set([
    // Go - build/runtime settings only
    'GOEXPERIMENT', // experimental features
    'GOOS', // target OS
    'GOARCH', // target architecture
    'CGO_ENABLED', // enable/disable CGO
    'GO111MODULE', // module mode
    // Rust - logging/debugging only
    'RUST_BACKTRACE', // backtrace verbosity
    'RUST_LOG', // logging filter
    // Node - environment name only (not NODE_OPTIONS!)
    'NODE_ENV',
    // Python - behavior flags only (not PYTHONPATH!)
    'PYTHONUNBUFFERED', // disable buffering
    'PYTHONDONTWRITEBYTECODE', // no .pyc files
    // Pytest - test configuration
    'PYTEST_DISABLE_PLUGIN_AUTOLOAD', // disable plugin loading
    'PYTEST_DEBUG', // debug output
    // API keys and authentication
    'ANTHROPIC_API_KEY', // API authentication
    // Locale and character encoding
    'LANG', // default locale
    'LANGUAGE', // language preference list
    'LC_ALL', // override all locale settings
    'LC_CTYPE', // character classification
    'LC_TIME', // time format
    'CHARSET', // character set preference
    // Terminal and display
    'TERM', // terminal type
    'COLORTERM', // color terminal indicator
    'NO_COLOR', // disable color output (universal standard)
    'FORCE_COLOR', // force color output
    'TZ', // timezone
    // Color configuration for various tools
    'LS_COLORS', // colors for ls (GNU)
    'LSCOLORS', // colors for ls (BSD/macOS)
    'GREP_COLOR', // grep match color (deprecated)
    'GREP_COLORS', // grep color scheme
    'GCC_COLORS', // GCC diagnostic colors
    // Display formatting
    'TIME_STYLE', // time display format for ls
    'BLOCK_SIZE', // block size for du/df
    'BLOCKSIZE', // alternative block size
]);
/**
 * ANT-ONLY environment variables that are safe to strip from commands.
 * These are only enabled when USER_TYPE === 'ant'.
 *
 * SECURITY: These env vars are stripped before permission-rule matching, which
 * means `DOCKER_HOST=tcp://evil.com docker ps` matches a `Bash(docker ps:*)`
 * rule after stripping. This is INTENTIONALLY ANT-ONLY (gated at line ~380)
 * and MUST NEVER ship to external users. DOCKER_HOST redirects the Docker
 * daemon endpoint — stripping it defeats prefix-based permission restrictions
 * by hiding the network endpoint from the permission check. KUBECONFIG
 * similarly controls which cluster kubectl talks to. These are convenience
 * strippings for internal power users who accept the risk.
 *
 * Based on analysis of 30 days of tengu_internal_bash_tool_use_permission_request events.
 */
var ANT_ONLY_SAFE_ENV_VARS = new Set([
    // Kubernetes and container config (config file pointers, not execution)
    'KUBECONFIG', // kubectl config file path — controls which cluster kubectl uses
    'DOCKER_HOST', // Docker daemon socket/endpoint — controls which daemon docker talks to
    // Cloud provider project/profile selection (just names/identifiers)
    'AWS_PROFILE', // AWS profile name selection
    'CLOUDSDK_CORE_PROJECT', // GCP project ID
    'CLUSTER', // generic cluster name
    // Anthropic internal cluster selection (just names/identifiers)
    'COO_CLUSTER', // coo cluster name
    'COO_CLUSTER_NAME', // coo cluster name (alternate)
    'COO_NAMESPACE', // coo namespace
    'COO_LAUNCH_YAML_DRY_RUN', // dry run mode
    // Feature flags (boolean/string flags only)
    'SKIP_NODE_VERSION_CHECK', // skip version check
    'EXPECTTEST_ACCEPT', // accept test expectations
    'CI', // CI environment indicator
    'GIT_LFS_SKIP_SMUDGE', // skip LFS downloads
    // GPU/Device selection (just device IDs)
    'CUDA_VISIBLE_DEVICES', // GPU device selection
    'JAX_PLATFORMS', // JAX platform selection
    // Display/terminal settings
    'COLUMNS', // terminal width
    'TMUX', // TMUX socket info
    // Test/debug configuration
    'POSTGRESQL_VERSION', // postgres version string
    'FIRESTORE_EMULATOR_HOST', // emulator host:port
    'HARNESS_QUIET', // quiet mode flag
    'TEST_CROSSCHECK_LISTS_MATCH_UPDATE', // test update flag
    'DBT_PER_DEVELOPER_ENVIRONMENTS', // DBT config
    'STATSIG_FORD_DB_CHECKS', // statsig DB check flag
    // Build configuration
    'ANT_ENVIRONMENT', // Anthropic environment name
    'ANT_SERVICE', // Anthropic service name
    'MONOREPO_ROOT_DIR', // monorepo root path
    // Version selectors
    'PYENV_VERSION', // Python version selection
    // Credentials (approved subset - these don't change exfil risk)
    'PGPASSWORD', // Postgres password
    'GH_TOKEN', // GitHub token
    'GROWTHBOOK_API_KEY', // self-hosted growthbook
]);
/**
 * Strips full-line comments from a command.
 * This handles cases where Claude adds comments in bash commands, e.g.:
 *   "# Check the logs directory\nls /home/user/logs"
 * Should be stripped to: "ls /home/user/logs"
 *
 * Only strips full-line comments (lines where the entire line is a comment),
 * not inline comments that appear after a command on the same line.
 */
function stripCommentLines(command) {
    var lines = command.split('\n');
    var nonCommentLines = lines.filter(function (line) {
        var trimmed = line.trim();
        // Keep lines that are not empty and don't start with #
        return trimmed !== '' && !trimmed.startsWith('#');
    });
    // If all lines were comments/empty, return original
    if (nonCommentLines.length === 0) {
        return command;
    }
    return nonCommentLines.join('\n');
}
function stripSafeWrappers(command) {
    // SECURITY: Use [ \t]+ not \s+ — \s matches \n/\r which are command
    // separators in bash. Matching across a newline would strip the wrapper from
    // one line and leave a different command on the next line for bash to execute.
    //
    // SECURITY: `(?:--[ \t]+)?` consumes the wrapper's own `--` so
    // `nohup -- rm -- -/../foo` strips to `rm -- -/../foo` (not `-- rm ...`
    // which would skip path validation with `--` as an unknown baseCmd).
    var SAFE_WRAPPER_PATTERNS = [
        // timeout: enumerate GNU long flags — no-value (--foreground,
        // --preserve-status, --verbose), value-taking in both =fused and
        // space-separated forms (--kill-after=5, --kill-after 5, --signal=TERM,
        // --signal TERM). Short: -v (no-arg), -k/-s with separate or fused value.
        // SECURITY: flag VALUES use allowlist [A-Za-z0-9_.+-] (signals are
        // TERM/KILL/9, durations are 5/5s/10.5). Previously [^ \t]+ matched
        // $ ( ) ` | ; & — `timeout -k$(id) 10 ls` stripped to `ls`, matched
        // Bash(ls:*), while bash expanded $(id) during word splitting BEFORE
        // timeout ran. Contrast ENV_VAR_PATTERN below which already allowlists.
        /^timeout[ \t]+(?:(?:--(?:foreground|preserve-status|verbose)|--(?:kill-after|signal)=[A-Za-z0-9_.+-]+|--(?:kill-after|signal)[ \t]+[A-Za-z0-9_.+-]+|-v|-[ks][ \t]+[A-Za-z0-9_.+-]+|-[ks][A-Za-z0-9_.+-]+)[ \t]+)*(?:--[ \t]+)?\d+(?:\.\d+)?[smhd]?[ \t]+/,
        /^time[ \t]+(?:--[ \t]+)?/,
        // SECURITY: keep in sync with checkSemantics wrapper-strip (ast.ts
        // ~:1990-2080) AND stripWrappersFromArgv (pathValidation.ts ~:1260).
        // Previously this pattern REQUIRED `-n N`; checkSemantics already handled
        // bare `nice` and legacy `-N`. Asymmetry meant checkSemantics exposed the
        // wrapped command to semantic checks but deny-rule matching and the cd+git
        // gate saw the wrapper name. `nice rm -rf /` with Bash(rm:*) deny became
        // ask instead of deny; `cd evil && nice git status` skipped the bare-repo
        // RCE gate. PR #21503 fixed stripWrappersFromArgv; this was missed.
        // Now matches: `nice cmd`, `nice -n N cmd`, `nice -N cmd` (all forms
        // checkSemantics strips).
        /^nice(?:[ \t]+-n[ \t]+-?\d+|[ \t]+-\d+)?[ \t]+(?:--[ \t]+)?/,
        // stdbuf: fused short flags only (-o0, -eL). checkSemantics handles more
        // (space-separated, long --output=MODE), but we fail-closed on those
        // above so not over-stripping here is safe. Main need: `stdbuf -o0 cmd`.
        /^stdbuf(?:[ \t]+-[ioe][LN0-9]+)+[ \t]+(?:--[ \t]+)?/,
        /^nohup[ \t]+(?:--[ \t]+)?/,
    ];
    // Pattern for environment variables:
    // ^([A-Za-z_][A-Za-z0-9_]*)  - Variable name (standard identifier)
    // =                           - Equals sign
    // ([A-Za-z0-9_./:-]+)         - Value: alphanumeric + safe punctuation only
    // [ \t]+                      - Required HORIZONTAL whitespace after value
    //
    // SECURITY: Only matches unquoted values with safe characters (no $(), `, $var, ;|&).
    //
    // SECURITY: Trailing whitespace MUST be [ \t]+ (horizontal only), NOT \s+.
    // \s matches \n/\r. If reconstructCommand emits an unquoted newline between
    // `TZ=UTC` and `echo`, \s+ would match across it and strip `TZ=UTC<NL>`,
    // leaving `echo curl evil.com` to match Bash(echo:*). But bash treats the
    // newline as a command separator. Defense-in-depth with needsQuoting fix.
    var ENV_VAR_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)=([A-Za-z0-9_./:-]+)[ \t]+/;
    var stripped = command;
    var previousStripped = '';
    // Phase 1: Strip leading env vars and comments only.
    // In bash, env var assignments before a command (VAR=val cmd) are genuine
    // shell-level assignments. These are safe to strip for permission matching.
    while (stripped !== previousStripped) {
        previousStripped = stripped;
        stripped = stripCommentLines(stripped);
        var envVarMatch = stripped.match(ENV_VAR_PATTERN);
        if (envVarMatch) {
            var varName = envVarMatch[1];
            var isAntOnlySafe = process.env.USER_TYPE === 'ant' && ANT_ONLY_SAFE_ENV_VARS.has(varName);
            if (SAFE_ENV_VARS.has(varName) || isAntOnlySafe) {
                stripped = stripped.replace(ENV_VAR_PATTERN, '');
            }
        }
    }
    // Phase 2: Strip wrapper commands and comments only. Do NOT strip env vars.
    // Wrapper commands (timeout, time, nice, nohup) use execvp to run their
    // arguments, so VAR=val after a wrapper is treated as the COMMAND to execute,
    // not as an env var assignment. Stripping env vars here would create a
    // mismatch between what the parser sees and what actually executes.
    // (HackerOne #3543050)
    previousStripped = '';
    while (stripped !== previousStripped) {
        previousStripped = stripped;
        stripped = stripCommentLines(stripped);
        for (var _i = 0, SAFE_WRAPPER_PATTERNS_1 = SAFE_WRAPPER_PATTERNS; _i < SAFE_WRAPPER_PATTERNS_1.length; _i++) {
            var pattern = SAFE_WRAPPER_PATTERNS_1[_i];
            stripped = stripped.replace(pattern, '');
        }
    }
    return stripped.trim();
}
// SECURITY: allowlist for timeout flag VALUES (signals are TERM/KILL/9,
// durations are 5/5s/10.5). Rejects $ ( ) ` | ; & and newlines that
// previously matched via [^ \t]+ — `timeout -k$(id) 10 ls` must NOT strip.
var TIMEOUT_FLAG_VALUE_RE = /^[A-Za-z0-9_.+-]+$/;
/**
 * Parse timeout's GNU flags (long + short, fused + space-separated) and
 * return the argv index of the DURATION token, or -1 if flags are unparseable.
 * Enumerates: --foreground/--preserve-status/--verbose (no value),
 * --kill-after/--signal (value, both =fused and space-separated), -v (no
 * value), -k/-s (value, both fused and space-separated).
 *
 * Extracted from stripWrappersFromArgv to keep bashToolHasPermission under
 * Bun's feature() DCE complexity threshold — inlining this breaks
 * feature('BASH_CLASSIFIER') evaluation in classifier tests.
 */
function skipTimeoutFlags(a) {
    var i = 1;
    while (i < a.length) {
        var arg = a[i];
        var next = a[i + 1];
        if (arg === '--foreground' ||
            arg === '--preserve-status' ||
            arg === '--verbose')
            i++;
        else if (/^--(?:kill-after|signal)=[A-Za-z0-9_.+-]+$/.test(arg))
            i++;
        else if ((arg === '--kill-after' || arg === '--signal') &&
            next &&
            TIMEOUT_FLAG_VALUE_RE.test(next))
            i += 2;
        else if (arg === '--') {
            i++;
            break;
        } // end-of-options marker
        else if (arg.startsWith('--'))
            return -1;
        else if (arg === '-v')
            i++;
        else if ((arg === '-k' || arg === '-s') &&
            next &&
            TIMEOUT_FLAG_VALUE_RE.test(next))
            i += 2;
        else if (/^-[ks][A-Za-z0-9_.+-]+$/.test(arg))
            i++;
        else if (arg.startsWith('-'))
            return -1;
        else
            break;
    }
    return i;
}
/**
 * Argv-level counterpart to stripSafeWrappers. Strips the same wrapper
 * commands (timeout, time, nice, nohup) from AST-derived argv. Env vars
 * are already separated into SimpleCommand.envVars so no env-var stripping.
 *
 * KEEP IN SYNC with SAFE_WRAPPER_PATTERNS above — if you add a wrapper
 * there, add it here too.
 */
function stripWrappersFromArgv(argv) {
    // SECURITY: Consume optional `--` after wrapper options, matching what the
    // wrapper does. Otherwise `['nohup','--','rm','--','-/../foo']` yields `--`
    // as baseCmd and skips path validation. See SAFE_WRAPPER_PATTERNS comment.
    var a = argv;
    for (;;) {
        if (a[0] === 'time' || a[0] === 'nohup') {
            a = a.slice(a[1] === '--' ? 2 : 1);
        }
        else if (a[0] === 'timeout') {
            var i = skipTimeoutFlags(a);
            if (i < 0 || !a[i] || !/^\d+(?:\.\d+)?[smhd]?$/.test(a[i]))
                return a;
            a = a.slice(i + 1);
        }
        else if (a[0] === 'nice' &&
            a[1] === '-n' &&
            a[2] &&
            /^-?\d+$/.test(a[2])) {
            a = a.slice(a[3] === '--' ? 4 : 3);
        }
        else {
            return a;
        }
    }
}
/**
 * Env vars that make a *different binary* run (injection or resolution hijack).
 * Heuristic only — export-&& form bypasses this, and excludedCommands isn't a
 * security boundary anyway.
 */
exports.BINARY_HIJACK_VARS = /^(LD_|DYLD_|PATH$)/;
/**
 * Strip ALL leading env var prefixes from a command, regardless of whether the
 * var name is in the safe-list.
 *
 * Used for deny/ask rule matching: when a user denies `claude` or `rm`, the
 * command should stay blocked even if prefixed with arbitrary env vars like
 * `FOO=bar claude`. The safe-list restriction in stripSafeWrappers is correct
 * for allow rules (prevents `DOCKER_HOST=evil docker ps` from auto-matching
 * `Bash(docker ps:*)`), but deny rules must be harder to circumvent.
 *
 * Also used for sandbox.excludedCommands matching (not a security boundary —
 * permission prompts are), with BINARY_HIJACK_VARS as a blocklist.
 *
 * SECURITY: Uses a broader value pattern than stripSafeWrappers. The value
 * pattern excludes only actual shell injection characters ($, backtick, ;, |,
 * &, parens, redirects, quotes, backslash) and whitespace. Characters like
 * =, +, @, ~, , are harmless in unquoted env var assignment position and must
 * be matched to prevent trivial bypass via e.g. `FOO=a=b denied_command`.
 *
 * @param blocklist - optional regex tested against each var name; matching vars
 *   are NOT stripped (and stripping stops there). Omit for deny rules; pass
 *   BINARY_HIJACK_VARS for excludedCommands.
 */
function stripAllLeadingEnvVars(command, blocklist) {
    // Broader value pattern for deny-rule stripping. Handles:
    //
    // - Standard assignment (FOO=bar), append (FOO+=bar), array (FOO[0]=bar)
    // - Single-quoted values: '[^'\n\r]*' — bash suppresses all expansion
    // - Double-quoted values with backslash escapes: "(?:\\.|[^"$`\\\n\r])*"
    //   In bash double quotes, only \$, \`, \", \\, and \newline are special.
    //   Other \x sequences are harmless, so we allow \. inside double quotes.
    //   We still exclude raw $ and ` (without backslash) to block expansion.
    // - Unquoted values: excludes shell metacharacters, allows backslash escapes
    // - Concatenated segments: FOO='x'y"z" — bash concatenates adjacent segments
    //
    // SECURITY: Trailing whitespace MUST be [ \t]+ (horizontal only), NOT \s+.
    //
    // The outer * matches one atomic unit per iteration: a complete quoted
    // string, a backslash-escape pair, or a single unquoted safe character.
    // The inner double-quote alternation (?:...|...)* is bounded by the
    // closing ", so it cannot interact with the outer * for backtracking.
    //
    // Note: $ is excluded from unquoted/double-quoted value classes to block
    // dangerous forms like $(cmd), ${var}, and $((expr)). This means
    // FOO=$VAR is not stripped — adding $VAR matching creates ReDoS risk
    // (CodeQL #671) and $VAR bypasses are low-priority.
    var ENV_VAR_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*(?:\[[^\]]*\])?)\+?=(?:'[^'\n\r]*'|"(?:\\.|[^"$`\\\n\r])*"|\\.|[^ \t\n\r$`;|&()<>\\\\'"])*[ \t]+/;
    var stripped = command;
    var previousStripped = '';
    while (stripped !== previousStripped) {
        previousStripped = stripped;
        stripped = stripCommentLines(stripped);
        var m = stripped.match(ENV_VAR_PATTERN);
        if (!m)
            continue;
        if (blocklist === null || blocklist === void 0 ? void 0 : blocklist.test(m[1]))
            break;
        stripped = stripped.slice(m[0].length);
    }
    return stripped.trim();
}
function filterRulesByContentsMatchingInput(input, rules, matchMode, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.stripAllEnvVars, stripAllEnvVars = _c === void 0 ? false : _c, _d = _b.skipCompoundCheck, skipCompoundCheck = _d === void 0 ? false : _d;
    var command = input.command.trim();
    // Strip output redirections for permission matching
    // This allows rules like Bash(python:*) to match "python script.py > output.txt"
    // Security validation of redirection targets happens separately in checkPathConstraints
    var commandWithoutRedirections = (0, commands_js_1.extractOutputRedirections)(command).commandWithoutRedirections;
    // For exact matching, try both the original command (to preserve quotes)
    // and the command without redirections (to allow rules without redirections to match)
    // For prefix matching, only use the command without redirections
    var commandsForMatching = matchMode === 'exact'
        ? [command, commandWithoutRedirections]
        : [commandWithoutRedirections];
    // Strip safe wrapper commands (timeout, time, nice, nohup) and env vars for matching
    // This allows rules like Bash(npm install:*) to match "timeout 10 npm install foo"
    // or "GOOS=linux go build"
    var commandsToTry = commandsForMatching.flatMap(function (cmd) {
        var strippedCommand = stripSafeWrappers(cmd);
        return strippedCommand !== cmd ? [cmd, strippedCommand] : [cmd];
    });
    // SECURITY: For deny/ask rules, also try matching after stripping ALL leading
    // env var prefixes. This prevents bypass via `FOO=bar denied_command` where
    // FOO is not in the safe-list. The safe-list restriction in stripSafeWrappers
    // is intentional for allow rules (see HackerOne #3543050), but deny rules
    // must be harder to circumvent — a denied command should stay denied
    // regardless of env var prefixes.
    //
    // We iteratively apply both stripping operations to all candidates until no
    // new candidates are produced (fixed-point). This handles interleaved patterns
    // like `nohup FOO=bar timeout 5 claude` where:
    //   1. stripSafeWrappers strips `nohup` → `FOO=bar timeout 5 claude`
    //   2. stripAllLeadingEnvVars strips `FOO=bar` → `timeout 5 claude`
    //   3. stripSafeWrappers strips `timeout 5` → `claude` (deny match)
    //
    // Without iteration, single-pass compositions miss multi-layer interleaving.
    if (stripAllEnvVars) {
        var seen = new Set(commandsToTry);
        var startIdx = 0;
        // Iterate until no new candidates are produced (fixed-point)
        while (startIdx < commandsToTry.length) {
            var endIdx = commandsToTry.length;
            for (var i = startIdx; i < endIdx; i++) {
                var cmd = commandsToTry[i];
                if (!cmd) {
                    continue;
                }
                // Try stripping env vars
                var envStripped = stripAllLeadingEnvVars(cmd);
                if (!seen.has(envStripped)) {
                    commandsToTry.push(envStripped);
                    seen.add(envStripped);
                }
                // Try stripping safe wrappers
                var wrapperStripped = stripSafeWrappers(cmd);
                if (!seen.has(wrapperStripped)) {
                    commandsToTry.push(wrapperStripped);
                    seen.add(wrapperStripped);
                }
            }
            startIdx = endIdx;
        }
    }
    // Precompute compound-command status for each candidate to avoid re-parsing
    // inside the rule filter loop (which would scale splitCommand calls with
    // rules.length × commandsToTry.length). The compound check only applies to
    // prefix/wildcard matching in 'prefix' mode, and only for allow rules.
    // SECURITY: deny/ask rules must match compound commands so they can't be
    // bypassed by wrapping a denied command in a compound expression.
    var isCompoundCommand = new Map();
    if (matchMode === 'prefix' && !skipCompoundCheck) {
        for (var _i = 0, commandsToTry_1 = commandsToTry; _i < commandsToTry_1.length; _i++) {
            var cmd = commandsToTry_1[_i];
            if (!isCompoundCommand.has(cmd)) {
                isCompoundCommand.set(cmd, splitCommand(cmd).length > 1);
            }
        }
    }
    return Array.from(rules.entries())
        .filter(function (_a) {
        var ruleContent = _a[0];
        var bashRule = (0, exports.bashPermissionRule)(ruleContent);
        return commandsToTry.some(function (cmdToMatch) {
            switch (bashRule.type) {
                case 'exact':
                    return bashRule.command === cmdToMatch;
                case 'prefix':
                    switch (matchMode) {
                        // In 'exact' mode, only return true if the command exactly matches the prefix rule
                        case 'exact':
                            return bashRule.prefix === cmdToMatch;
                        case 'prefix': {
                            // SECURITY: Don't allow prefix rules to match compound commands.
                            // e.g., Bash(cd:*) must NOT match "cd /path && python3 evil.py".
                            // In the normal flow commands are split before reaching here, but
                            // shell escaping can defeat the first splitCommand pass — e.g.,
                            //   cd src\&\& python3 hello.py  →  splitCommand  →  ["cd src&& python3 hello.py"]
                            // which then looks like a single command that starts with "cd ".
                            // Re-splitting the candidate here catches those cases.
                            if (isCompoundCommand.get(cmdToMatch)) {
                                return false;
                            }
                            // Ensure word boundary: prefix must be followed by space or end of string
                            // This prevents "ls:*" from matching "lsof" or "lsattr"
                            if (cmdToMatch === bashRule.prefix) {
                                return true;
                            }
                            if (cmdToMatch.startsWith(bashRule.prefix + ' ')) {
                                return true;
                            }
                            // Also match "xargs <prefix>" for bare xargs with no flags.
                            // This allows Bash(grep:*) to match "xargs grep pattern",
                            // and deny rules like Bash(rm:*) to block "xargs rm file".
                            // Natural word-boundary: "xargs -n1 grep" does NOT start with
                            // "xargs grep " so flagged xargs invocations are not matched.
                            var xargsPrefix = 'xargs ' + bashRule.prefix;
                            if (cmdToMatch === xargsPrefix) {
                                return true;
                            }
                            return cmdToMatch.startsWith(xargsPrefix + ' ');
                        }
                    }
                    break;
                case 'wildcard':
                    // SECURITY FIX: In exact match mode, wildcards must NOT match because we're
                    // checking the full unparsed command. Wildcard matching on unparsed commands
                    // allows "foo *" to match "foo arg && curl evil.com" since .* matches operators.
                    // Wildcards should only match after splitting into individual subcommands.
                    if (matchMode === 'exact') {
                        return false;
                    }
                    // SECURITY: Same as for prefix rules, don't allow wildcard rules to match
                    // compound commands in prefix mode. e.g., Bash(cd *) must not match
                    // "cd /path && python3 evil.py" even though "cd *" pattern would match it.
                    if (isCompoundCommand.get(cmdToMatch)) {
                        return false;
                    }
                    // In prefix mode (after splitting), wildcards can safely match subcommands
                    return matchWildcardPattern(bashRule.pattern, cmdToMatch);
            }
        });
    })
        .map(function (_a) {
        var rule = _a[1];
        return rule;
    });
}
function matchingRulesForInput(input, toolPermissionContext, matchMode, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.skipCompoundCheck, skipCompoundCheck = _c === void 0 ? false : _c;
    var denyRuleByContents = (0, permissions_js_1.getRuleByContentsForTool)(toolPermissionContext, BashTool_js_1.BashTool, 'deny');
    // SECURITY: Deny/ask rules use aggressive env var stripping so that
    // `FOO=bar denied_command` still matches a deny rule for `denied_command`.
    var matchingDenyRules = filterRulesByContentsMatchingInput(input, denyRuleByContents, matchMode, { stripAllEnvVars: true, skipCompoundCheck: true });
    var askRuleByContents = (0, permissions_js_1.getRuleByContentsForTool)(toolPermissionContext, BashTool_js_1.BashTool, 'ask');
    var matchingAskRules = filterRulesByContentsMatchingInput(input, askRuleByContents, matchMode, { stripAllEnvVars: true, skipCompoundCheck: true });
    var allowRuleByContents = (0, permissions_js_1.getRuleByContentsForTool)(toolPermissionContext, BashTool_js_1.BashTool, 'allow');
    var matchingAllowRules = filterRulesByContentsMatchingInput(input, allowRuleByContents, matchMode, { skipCompoundCheck: skipCompoundCheck });
    return {
        matchingDenyRules: matchingDenyRules,
        matchingAskRules: matchingAskRules,
        matchingAllowRules: matchingAllowRules,
    };
}
/**
 * Checks if the subcommand is an exact match for a permission rule
 */
var bashToolCheckExactMatchPermission = function (input, toolPermissionContext) {
    var command = input.command.trim();
    var _a = matchingRulesForInput(input, toolPermissionContext, 'exact'), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules, matchingAllowRules = _a.matchingAllowRules;
    // 1. Deny if exact command was denied
    if (matchingDenyRules[0] !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(command, " has been denied."),
            decisionReason: {
                type: 'rule',
                rule: matchingDenyRules[0],
            },
        };
    }
    // 2. Ask if exact command was in ask rules
    if (matchingAskRules[0] !== undefined) {
        return {
            behavior: 'ask',
            message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name),
            decisionReason: {
                type: 'rule',
                rule: matchingAskRules[0],
            },
        };
    }
    // 3. Allow if exact command was allowed
    if (matchingAllowRules[0] !== undefined) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'rule',
                rule: matchingAllowRules[0],
            },
        };
    }
    // 4. Otherwise, passthrough
    var decisionReason = {
        type: 'other',
        reason: 'This command requires approval',
    };
    return {
        behavior: 'passthrough',
        message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason),
        decisionReason: decisionReason,
        // Suggest exact match rule to user
        // this may be overridden by prefix suggestions in `checkCommandAndSuggestRules()`
        suggestions: suggestionForExactCommand(command),
    };
};
exports.bashToolCheckExactMatchPermission = bashToolCheckExactMatchPermission;
var bashToolCheckPermission = function (input, toolPermissionContext, compoundCommandHasCd, astCommand) {
    var command = input.command.trim();
    // 1. Check exact match first
    var exactMatchResult = (0, exports.bashToolCheckExactMatchPermission)(input, toolPermissionContext);
    // 1a. Deny/ask if exact command has a rule
    if (exactMatchResult.behavior === 'deny' ||
        exactMatchResult.behavior === 'ask') {
        return exactMatchResult;
    }
    // 2. Find all matching rules (prefix or exact)
    // SECURITY FIX: Check Bash deny/ask rules BEFORE path constraints to prevent bypass
    // via absolute paths outside the project directory (HackerOne report)
    // When AST-parsed, the subcommand is already atomic — skip the legacy
    // splitCommand re-check that misparses mid-word # as compound.
    var _a = matchingRulesForInput(input, toolPermissionContext, 'prefix', {
        skipCompoundCheck: astCommand !== undefined,
    }), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules, matchingAllowRules = _a.matchingAllowRules;
    // 2a. Deny if command has a deny rule
    if (matchingDenyRules[0] !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(command, " has been denied."),
            decisionReason: {
                type: 'rule',
                rule: matchingDenyRules[0],
            },
        };
    }
    // 2b. Ask if command has an ask rule
    if (matchingAskRules[0] !== undefined) {
        return {
            behavior: 'ask',
            message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name),
            decisionReason: {
                type: 'rule',
                rule: matchingAskRules[0],
            },
        };
    }
    // 3. Check path constraints
    // This check comes after deny/ask rules so explicit rules take precedence.
    // SECURITY: When AST-derived argv is available for this subcommand, pass
    // it through so checkPathConstraints uses it directly instead of re-parsing
    // with shell-quote (which has a single-quote backslash bug that causes
    // parseCommandArguments to return [] and silently skip path validation).
    var pathResult = (0, pathValidation_js_1.checkPathConstraints)(input, (0, cwd_js_1.getCwd)(), toolPermissionContext, compoundCommandHasCd, astCommand === null || astCommand === void 0 ? void 0 : astCommand.redirects, astCommand ? [astCommand] : undefined);
    if (pathResult.behavior !== 'passthrough') {
        return pathResult;
    }
    // 4. Allow if command had an exact match allow
    if (exactMatchResult.behavior === 'allow') {
        return exactMatchResult;
    }
    // 5. Allow if command has an allow rule
    if (matchingAllowRules[0] !== undefined) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'rule',
                rule: matchingAllowRules[0],
            },
        };
    }
    // 5b. Check sed constraints (blocks dangerous sed operations before mode auto-allow)
    var sedConstraintResult = (0, sedValidation_js_1.checkSedConstraints)(input, toolPermissionContext);
    if (sedConstraintResult.behavior !== 'passthrough') {
        return sedConstraintResult;
    }
    // 6. Check for mode-specific permission handling
    var modeResult = (0, modeValidation_js_1.checkPermissionMode)(input, toolPermissionContext);
    if (modeResult.behavior !== 'passthrough') {
        return modeResult;
    }
    // 7. Check read-only rules
    if (BashTool_js_1.BashTool.isReadOnly(input)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Read-only command is allowed',
            },
        };
    }
    // 8. Passthrough since no rules match, will trigger permission prompt
    var decisionReason = {
        type: 'other',
        reason: 'This command requires approval',
    };
    return {
        behavior: 'passthrough',
        message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason),
        decisionReason: decisionReason,
        // Suggest exact match rule to user
        // this may be overridden by prefix suggestions in `checkCommandAndSuggestRules()`
        suggestions: suggestionForExactCommand(command),
    };
};
exports.bashToolCheckPermission = bashToolCheckPermission;
/**
 * Processes an individual subcommand and applies prefix checks & suggestions
 */
function checkCommandAndSuggestRules(input, toolPermissionContext, commandPrefixResult, compoundCommandHasCd, astParseSucceeded) {
    return __awaiter(this, void 0, void 0, function () {
        var exactMatchResult, permissionResult, safetyResult, decisionReason, suggestedUpdates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exactMatchResult = (0, exports.bashToolCheckExactMatchPermission)(input, toolPermissionContext);
                    if (exactMatchResult.behavior !== 'passthrough') {
                        return [2 /*return*/, exactMatchResult];
                    }
                    permissionResult = (0, exports.bashToolCheckPermission)(input, toolPermissionContext, compoundCommandHasCd);
                    // 2a. Deny/ask if command was explictly denied/asked
                    if (permissionResult.behavior === 'deny' ||
                        permissionResult.behavior === 'ask') {
                        return [2 /*return*/, permissionResult];
                    }
                    if (!(!astParseSucceeded &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK))) return [3 /*break*/, 2];
                    return [4 /*yield*/, bashCommandIsSafeAsync(input.command)];
                case 1:
                    safetyResult = _a.sent();
                    if (safetyResult.behavior !== 'passthrough') {
                        decisionReason = {
                            type: 'other',
                            reason: safetyResult.behavior === 'ask' && safetyResult.message
                                ? safetyResult.message
                                : 'This command contains patterns that could pose security risks and requires approval',
                        };
                        return [2 /*return*/, {
                                behavior: 'ask',
                                message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason),
                                decisionReason: decisionReason,
                                suggestions: [], // Don't suggest saving a potentially dangerous command
                            }];
                    }
                    _a.label = 2;
                case 2:
                    // 4. Allow if command was allowed
                    if (permissionResult.behavior === 'allow') {
                        return [2 /*return*/, permissionResult];
                    }
                    suggestedUpdates = (commandPrefixResult === null || commandPrefixResult === void 0 ? void 0 : commandPrefixResult.commandPrefix)
                        ? suggestionForPrefix(commandPrefixResult.commandPrefix)
                        : suggestionForExactCommand(input.command);
                    return [2 /*return*/, __assign(__assign({}, permissionResult), { suggestions: suggestedUpdates })];
            }
        });
    });
}
/**
 * Checks if a command should be auto-allowed when sandboxed.
 * Returns early if there are explicit deny/ask rules that should be respected.
 *
 * NOTE: This function should only be called when sandboxing and auto-allow are enabled.
 *
 * @param input - The bash tool input
 * @param toolPermissionContext - The permission context
 * @returns PermissionResult with:
 *   - deny/ask if explicit rule exists (exact or prefix)
 *   - allow if no explicit rules (sandbox auto-allow applies)
 *   - passthrough should not occur since we're in auto-allow mode
 */
function checkSandboxAutoAllow(input, toolPermissionContext) {
    var command = input.command.trim();
    // Check for explicit deny/ask rules on the full command (exact + prefix)
    var _a = matchingRulesForInput(input, toolPermissionContext, 'prefix'), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules;
    // Return immediately if there's an explicit deny rule on the full command
    if (matchingDenyRules[0] !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(command, " has been denied."),
            decisionReason: {
                type: 'rule',
                rule: matchingDenyRules[0],
            },
        };
    }
    // SECURITY: For compound commands, check each subcommand against deny/ask
    // rules. Prefix rules like Bash(rm:*) won't match the full compound command
    // (e.g., "echo hello && rm -rf /" doesn't start with "rm"), so we must
    // check each subcommand individually.
    // IMPORTANT: Subcommand deny checks must run BEFORE full-command ask returns.
    // Otherwise a wildcard ask rule matching the full command (e.g., Bash(*echo*))
    // would return 'ask' before a prefix deny rule on a subcommand (e.g., Bash(rm:*))
    // gets checked, downgrading a deny to an ask.
    var subcommands = splitCommand(command);
    if (subcommands.length > 1) {
        var firstAskRule = void 0;
        for (var _i = 0, subcommands_1 = subcommands; _i < subcommands_1.length; _i++) {
            var sub = subcommands_1[_i];
            var subResult = matchingRulesForInput({ command: sub }, toolPermissionContext, 'prefix');
            // Deny takes priority — return immediately
            if (subResult.matchingDenyRules[0] !== undefined) {
                return {
                    behavior: 'deny',
                    message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(command, " has been denied."),
                    decisionReason: {
                        type: 'rule',
                        rule: subResult.matchingDenyRules[0],
                    },
                };
            }
            // Stash first ask match; don't return yet (deny across all subs takes priority)
            firstAskRule !== null && firstAskRule !== void 0 ? firstAskRule : (firstAskRule = subResult.matchingAskRules[0]);
        }
        if (firstAskRule) {
            return {
                behavior: 'ask',
                message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name),
                decisionReason: {
                    type: 'rule',
                    rule: firstAskRule,
                },
            };
        }
    }
    // Full-command ask check (after all deny sources have been exhausted)
    if (matchingAskRules[0] !== undefined) {
        return {
            behavior: 'ask',
            message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name),
            decisionReason: {
                type: 'rule',
                rule: matchingAskRules[0],
            },
        };
    }
    // No explicit rules, so auto-allow with sandbox
    return {
        behavior: 'allow',
        updatedInput: input,
        decisionReason: {
            type: 'other',
            reason: 'Auto-allowed with sandbox (autoAllowBashIfSandboxed enabled)',
        },
    };
}
/**
 * Filter out `cd ${cwd}` prefix subcommands, keeping astCommands aligned.
 * Extracted to keep bashToolHasPermission under Bun's feature() DCE
 * complexity threshold — inlining this breaks pendingClassifierCheck
 * attachment in ~10 classifier tests.
 */
function filterCdCwdSubcommands(rawSubcommands, astCommands, cwd, cwdMingw) {
    var subcommands = [];
    var astCommandsByIdx = [];
    for (var i = 0; i < rawSubcommands.length; i++) {
        var cmd = rawSubcommands[i];
        if (cmd === "cd ".concat(cwd) || cmd === "cd ".concat(cwdMingw))
            continue;
        subcommands.push(cmd);
        astCommandsByIdx.push(astCommands === null || astCommands === void 0 ? void 0 : astCommands[i]);
    }
    return { subcommands: subcommands, astCommandsByIdx: astCommandsByIdx };
}
/**
 * Early-exit deny enforcement for the AST too-complex and checkSemantics
 * paths. Returns the exact-match result if non-passthrough (deny/ask/allow),
 * then checks prefix/wildcard deny rules. Returns null if neither matched,
 * meaning the caller should fall through to ask. Extracted to keep
 * bashToolHasPermission under Bun's feature() DCE complexity threshold.
 */
function checkEarlyExitDeny(input, toolPermissionContext) {
    var exactMatchResult = (0, exports.bashToolCheckExactMatchPermission)(input, toolPermissionContext);
    if (exactMatchResult.behavior !== 'passthrough') {
        return exactMatchResult;
    }
    var denyMatch = matchingRulesForInput(input, toolPermissionContext, 'prefix').matchingDenyRules[0];
    if (denyMatch !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(input.command, " has been denied."),
            decisionReason: { type: 'rule', rule: denyMatch },
        };
    }
    return null;
}
/**
 * checkSemantics-path deny enforcement. Calls checkEarlyExitDeny (exact-match
 * + full-command prefix deny), then checks each individual SimpleCommand .text
 * span against prefix deny rules. The per-subcommand check is needed because
 * filterRulesByContentsMatchingInput has a compound-command guard
 * (splitCommand().length > 1 → prefix rules return false) that defeats
 * `Bash(eval:*)` matching against a full pipeline like `echo foo | eval rm`.
 * Each SimpleCommand span is a single command, so the guard doesn't fire.
 *
 * Separate helper (not folded into checkEarlyExitDeny or inlined at the call
 * site) because bashToolHasPermission is tight against Bun's feature() DCE
 * complexity threshold — adding even ~5 lines there breaks
 * feature('BASH_CLASSIFIER') evaluation and drops pendingClassifierCheck.
 */
function checkSemanticsDeny(input, toolPermissionContext, commands) {
    var fullCmd = checkEarlyExitDeny(input, toolPermissionContext);
    if (fullCmd !== null)
        return fullCmd;
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var cmd = commands_1[_i];
        var subDeny = matchingRulesForInput(__assign(__assign({}, input), { command: cmd.text }), toolPermissionContext, 'prefix').matchingDenyRules[0];
        if (subDeny !== undefined) {
            return {
                behavior: 'deny',
                message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(input.command, " has been denied."),
                decisionReason: { type: 'rule', rule: subDeny },
            };
        }
    }
    return null;
}
/**
 * Builds the pending classifier check metadata if classifier is enabled and has allow descriptions.
 * Returns undefined if classifier is disabled, in auto mode, or no allow descriptions exist.
 */
function buildPendingClassifierCheck(command, toolPermissionContext) {
    if (!(0, bashClassifier_js_1.isClassifierPermissionsEnabled)()) {
        return undefined;
    }
    // Skip in auto mode - auto mode classifier handles all permission decisions
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && toolPermissionContext.mode === 'auto')
        return undefined;
    if (toolPermissionContext.mode === 'bypassPermissions')
        return undefined;
    var allowDescriptions = (0, bashClassifier_js_1.getBashPromptAllowDescriptions)(toolPermissionContext);
    if (allowDescriptions.length === 0)
        return undefined;
    return {
        command: command,
        cwd: (0, cwd_js_1.getCwd)(),
        descriptions: allowDescriptions,
    };
}
var speculativeChecks = new Map();
/**
 * Start a speculative bash allow classifier check early, so it runs in
 * parallel with pre-tool hooks, deny/ask classifiers, and permission dialog setup.
 * The result can be consumed later by executeAsyncClassifierCheck via
 * consumeSpeculativeClassifierCheck.
 */
function peekSpeculativeClassifierCheck(command) {
    return speculativeChecks.get(command);
}
function startSpeculativeClassifierCheck(command, toolPermissionContext, signal, isNonInteractiveSession) {
    // Same guards as buildPendingClassifierCheck
    if (!(0, bashClassifier_js_1.isClassifierPermissionsEnabled)())
        return false;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && toolPermissionContext.mode === 'auto')
        return false;
    if (toolPermissionContext.mode === 'bypassPermissions')
        return false;
    var allowDescriptions = (0, bashClassifier_js_1.getBashPromptAllowDescriptions)(toolPermissionContext);
    if (allowDescriptions.length === 0)
        return false;
    var cwd = (0, cwd_js_1.getCwd)();
    var promise = (0, bashClassifier_js_1.classifyBashCommand)(command, cwd, allowDescriptions, 'allow', signal, isNonInteractiveSession);
    // Prevent unhandled rejection if the signal aborts before this promise is consumed.
    // The original promise (which may reject) is still stored in the Map for consumers to await.
    promise.catch(function () { });
    speculativeChecks.set(command, promise);
    return true;
}
/**
 * Consume a speculative classifier check result for the given command.
 * Returns the promise if one exists (and removes it from the map), or undefined.
 */
function consumeSpeculativeClassifierCheck(command) {
    var promise = speculativeChecks.get(command);
    if (promise) {
        speculativeChecks.delete(command);
    }
    return promise;
}
function clearSpeculativeChecks() {
    speculativeChecks.clear();
}
/**
 * Await a pending classifier check and return a PermissionDecisionReason if
 * high-confidence allow, or undefined otherwise.
 *
 * Used by swarm agents (both tmux and in-process) to gate permission
 * forwarding: run the classifier first, and only escalate to the leader
 * if the classifier doesn't auto-approve.
 */
function awaitClassifierAutoApproval(pendingCheck, signal, isNonInteractiveSession) {
    return __awaiter(this, void 0, void 0, function () {
        var command, cwd, descriptions, speculativeResult, classifierResult, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    command = pendingCheck.command, cwd = pendingCheck.cwd, descriptions = pendingCheck.descriptions;
                    speculativeResult = consumeSpeculativeClassifierCheck(command);
                    if (!speculativeResult) return [3 /*break*/, 2];
                    return [4 /*yield*/, speculativeResult];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, bashClassifier_js_1.classifyBashCommand)(command, cwd, descriptions, 'allow', signal, isNonInteractiveSession)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    classifierResult = _a;
                    logClassifierResultForAnts(command, 'allow', descriptions, classifierResult);
                    if ((0, bun_bundle_1.feature)('BASH_CLASSIFIER') &&
                        classifierResult.matches &&
                        classifierResult.confidence === 'high') {
                        return [2 /*return*/, {
                                type: 'classifier',
                                classifier: 'bash_allow',
                                reason: "Allowed by prompt rule: \"".concat(classifierResult.matchedDescription, "\""),
                            }];
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
/**
 * Execute the bash allow classifier check asynchronously.
 * This runs in the background while the permission prompt is shown.
 * If the classifier allows with high confidence and the user hasn't interacted, auto-approves.
 *
 * @param pendingCheck - Classifier check metadata from bashToolHasPermission
 * @param signal - Abort signal
 * @param isNonInteractiveSession - Whether this is a non-interactive session
 * @param callbacks - Callbacks to check if we should continue and handle approval
 */
function executeAsyncClassifierCheck(pendingCheck, signal, isNonInteractiveSession, callbacks) {
    return __awaiter(this, void 0, void 0, function () {
        var command, cwd, descriptions, speculativeResult, classifierResult, _a, error_1;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    command = pendingCheck.command, cwd = pendingCheck.cwd, descriptions = pendingCheck.descriptions;
                    speculativeResult = consumeSpeculativeClassifierCheck(command);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, , 7]);
                    if (!speculativeResult) return [3 /*break*/, 3];
                    return [4 /*yield*/, speculativeResult];
                case 2:
                    _a = _e.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, bashClassifier_js_1.classifyBashCommand)(command, cwd, descriptions, 'allow', signal, isNonInteractiveSession)];
                case 4:
                    _a = _e.sent();
                    _e.label = 5;
                case 5:
                    classifierResult = _a;
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _e.sent();
                    // When the coordinator session is cancelled, the abort signal fires and the
                    // classifier API call rejects with APIUserAbortError. This is expected and
                    // should not surface as an unhandled promise rejection.
                    if (error_1 instanceof sdk_1.APIUserAbortError || error_1 instanceof errors_js_1.AbortError) {
                        (_b = callbacks.onComplete) === null || _b === void 0 ? void 0 : _b.call(callbacks);
                        return [2 /*return*/];
                    }
                    (_c = callbacks.onComplete) === null || _c === void 0 ? void 0 : _c.call(callbacks);
                    throw error_1;
                case 7:
                    logClassifierResultForAnts(command, 'allow', descriptions, classifierResult);
                    // Don't auto-approve if user already made a decision or has interacted
                    // with the permission dialog (e.g., arrow keys, tab, typing)
                    if (!callbacks.shouldContinue())
                        return [2 /*return*/];
                    if ((0, bun_bundle_1.feature)('BASH_CLASSIFIER') &&
                        classifierResult.matches &&
                        classifierResult.confidence === 'high') {
                        callbacks.onAllow({
                            type: 'classifier',
                            classifier: 'bash_allow',
                            reason: "Allowed by prompt rule: \"".concat(classifierResult.matchedDescription, "\""),
                        });
                    }
                    else {
                        // No match — notify so the checking indicator is cleared
                        (_d = callbacks.onComplete) === null || _d === void 0 ? void 0 : _d.call(callbacks);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * The main implementation to check if we need to ask for user permission to call BashTool with a given input
 */
function bashToolHasPermission(input_1, context_1) {
    return __awaiter(this, arguments, void 0, function (input, context, getCommandSubcommandPrefixFn) {
        var appState, injectionCheckDisabled, shadowEnabled, astRoot, _a, _b, astResult, astSubcommands, astRedirects, astCommands, shadowLegacySubs, available, tooComplex, semanticFail, subsDiffer, tsSubs, legacySubs_1, earlyExit, decisionReason_1, sem, earlyExit, decisionReason_2, parseResult, decisionReason_3, sandboxAutoAllowResult, exactMatchResult, denyDescriptions, askDescriptions, hasDeny, hasAsk, _c, denyResult, askResult, suggestions, commandPrefixResult, commandOperatorResult, safetyResult, _d, pathResult_1, originalCommandSafetyResult, remainder, remainderResult, _e, exactMatchResult_1, decisionReason_4, cwd, cwdMingw, rawSubcommands, _f, subcommands, astCommandsByIdx, decisionReason_5, cdCommands, decisionReason_6, compoundCommandHasCd, hasGitCommand, decisionReason_7, subcommandPermissionDecisions, deniedSubresult, pathResult, askSubresult, nonAllowCount, hasPossibleCommandInjection, divergenceCount_1, onDivergence_1, results, commandSubcommandPrefix, result, subcommandResults, _i, subcommands_2, subcommand, _g, _h, _j, collectedRules, _k, subcommandResults_1, _l, subcommand, permissionResult, updates, rules, _m, rules_1, rule, ruleKey, _o, _p, rule, ruleKey, decisionReason, cappedRules, suggestedUpdates;
        var _q, _r, _s, _t;
        if (getCommandSubcommandPrefixFn === void 0) { getCommandSubcommandPrefixFn = commands_js_1.getCommandSubcommandPrefix; }
        return __generator(this, function (_u) {
            switch (_u.label) {
                case 0:
                    appState = context.getAppState();
                    injectionCheckDisabled = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK);
                    shadowEnabled = (0, bun_bundle_1.feature)('TREE_SITTER_BASH_SHADOW')
                        ? (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_birch_trellis', true)
                        : false;
                    if (!injectionCheckDisabled) return [3 /*break*/, 1];
                    _a = null;
                    return [3 /*break*/, 5];
                case 1:
                    if (!((0, bun_bundle_1.feature)('TREE_SITTER_BASH_SHADOW') && !shadowEnabled)) return [3 /*break*/, 2];
                    _b = null;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, parser_js_1.parseCommandRaw)(input.command)];
                case 3:
                    _b = _u.sent();
                    _u.label = 4;
                case 4:
                    _a = _b;
                    _u.label = 5;
                case 5:
                    astRoot = _a;
                    astResult = astRoot
                        ? (0, ast_js_1.parseForSecurityFromAst)(input.command, astRoot)
                        : { kind: 'parse-unavailable' };
                    astSubcommands = null;
                    // Shadow-test tree-sitter: record its verdict, then force parse-unavailable
                    // so the legacy path stays authoritative. parseCommand stays gated on
                    // TREE_SITTER_BASH (not SHADOW) so legacy internals remain pure regex.
                    // One event per bash call captures both divergence AND unavailability
                    // reasons; module-load failures are separately covered by the
                    // session-scoped tengu_tree_sitter_load event.
                    if ((0, bun_bundle_1.feature)('TREE_SITTER_BASH_SHADOW')) {
                        available = astResult.kind !== 'parse-unavailable';
                        tooComplex = false;
                        semanticFail = false;
                        subsDiffer = false;
                        if (available) {
                            tooComplex = astResult.kind === 'too-complex';
                            semanticFail =
                                astResult.kind === 'simple' && !(0, ast_js_1.checkSemantics)(astResult.commands).ok;
                            tsSubs = astResult.kind === 'simple'
                                ? astResult.commands.map(function (c) { return c.text; })
                                : undefined;
                            legacySubs_1 = splitCommand(input.command);
                            shadowLegacySubs = legacySubs_1;
                            subsDiffer =
                                tsSubs !== undefined &&
                                    (tsSubs.length !== legacySubs_1.length ||
                                        tsSubs.some(function (s, i) { return s !== legacySubs_1[i]; }));
                        }
                        (0, index_js_1.logEvent)('tengu_tree_sitter_shadow', {
                            available: available,
                            astTooComplex: tooComplex,
                            astSemanticFail: semanticFail,
                            subsDiffer: subsDiffer,
                            injectionCheckDisabled: injectionCheckDisabled,
                            killswitchOff: !shadowEnabled,
                            cmdOverLength: input.command.length > 10000,
                        });
                        // Always force legacy — shadow mode is observational only.
                        astResult = { kind: 'parse-unavailable' };
                        astRoot = null;
                    }
                    if (astResult.kind === 'too-complex') {
                        earlyExit = checkEarlyExitDeny(input, appState.toolPermissionContext);
                        if (earlyExit !== null)
                            return [2 /*return*/, earlyExit];
                        decisionReason_1 = {
                            type: 'other',
                            reason: astResult.reason,
                        };
                        (0, index_js_1.logEvent)('tengu_bash_ast_too_complex', {
                            nodeTypeId: (0, ast_js_1.nodeTypeId)(astResult.nodeType),
                        });
                        return [2 /*return*/, __assign({ behavior: 'ask', decisionReason: decisionReason_1, message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_1), suggestions: [] }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    if (astResult.kind === 'simple') {
                        sem = (0, ast_js_1.checkSemantics)(astResult.commands);
                        if (!sem.ok) {
                            earlyExit = checkSemanticsDeny(input, appState.toolPermissionContext, astResult.commands);
                            if (earlyExit !== null)
                                return [2 /*return*/, earlyExit];
                            decisionReason_2 = {
                                type: 'other',
                                reason: sem.reason,
                            };
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: decisionReason_2,
                                    message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_2),
                                    suggestions: [],
                                }];
                        }
                        // Stash the tokenized subcommands for use below. Downstream code (rule
                        // matching, path extraction, cd detection) still operates on strings, so
                        // we pass the original source span for each SimpleCommand. Downstream
                        // processing (stripSafeWrappers, parseCommandArguments) re-tokenizes
                        // these spans — that re-tokenization has known bugs (stripCommentLines
                        // mishandles newlines inside quotes), but checkSemantics already caught
                        // any argv element containing a newline, so those bugs can't bite here.
                        // Migrating downstream to operate on argv directly is a later commit.
                        astSubcommands = astResult.commands.map(function (c) { return c.text; });
                        astRedirects = astResult.commands.flatMap(function (c) { return c.redirects; });
                        astCommands = astResult.commands;
                    }
                    // Legacy shell-quote pre-check. Only reached on 'parse-unavailable'
                    // (tree-sitter not loaded OR TREE_SITTER_BASH feature gated off). Falls
                    // through to the full legacy path below.
                    if (astResult.kind === 'parse-unavailable') {
                        (0, debug_js_1.logForDebugging)('bashToolHasPermission: tree-sitter unavailable, using legacy shell-quote path');
                        parseResult = (0, shellQuote_js_1.tryParseShellCommand)(input.command);
                        if (!parseResult.success) {
                            decisionReason_3 = {
                                type: 'other',
                                reason: "Command contains malformed syntax that cannot be parsed: ".concat(parseResult.error),
                            };
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: decisionReason_3,
                                    message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_3),
                                }];
                        }
                    }
                    // Check sandbox auto-allow (which respects explicit deny/ask rules)
                    // Only call this if sandboxing and auto-allow are both enabled
                    if (sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled() &&
                        sandbox_adapter_js_1.SandboxManager.isAutoAllowBashIfSandboxedEnabled() &&
                        (0, shouldUseSandbox_js_1.shouldUseSandbox)(input)) {
                        sandboxAutoAllowResult = checkSandboxAutoAllow(input, appState.toolPermissionContext);
                        if (sandboxAutoAllowResult.behavior !== 'passthrough') {
                            return [2 /*return*/, sandboxAutoAllowResult];
                        }
                    }
                    exactMatchResult = (0, exports.bashToolCheckExactMatchPermission)(input, appState.toolPermissionContext);
                    // Exact command was denied
                    if (exactMatchResult.behavior === 'deny') {
                        return [2 /*return*/, exactMatchResult];
                    }
                    if (!((0, bashClassifier_js_1.isClassifierPermissionsEnabled)() &&
                        !((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                            appState.toolPermissionContext.mode === 'auto'))) return [3 /*break*/, 10];
                    denyDescriptions = (0, bashClassifier_js_1.getBashPromptDenyDescriptions)(appState.toolPermissionContext);
                    askDescriptions = (0, bashClassifier_js_1.getBashPromptAskDescriptions)(appState.toolPermissionContext);
                    hasDeny = denyDescriptions.length > 0;
                    hasAsk = askDescriptions.length > 0;
                    if (!(hasDeny || hasAsk)) return [3 /*break*/, 10];
                    return [4 /*yield*/, Promise.all([
                            hasDeny
                                ? (0, bashClassifier_js_1.classifyBashCommand)(input.command, (0, cwd_js_1.getCwd)(), denyDescriptions, 'deny', context.abortController.signal, context.options.isNonInteractiveSession)
                                : null,
                            hasAsk
                                ? (0, bashClassifier_js_1.classifyBashCommand)(input.command, (0, cwd_js_1.getCwd)(), askDescriptions, 'ask', context.abortController.signal, context.options.isNonInteractiveSession)
                                : null,
                        ])];
                case 6:
                    _c = _u.sent(), denyResult = _c[0], askResult = _c[1];
                    if (context.abortController.signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    if (denyResult) {
                        logClassifierResultForAnts(input.command, 'deny', denyDescriptions, denyResult);
                    }
                    if (askResult) {
                        logClassifierResultForAnts(input.command, 'ask', askDescriptions, askResult);
                    }
                    // Deny takes precedence
                    if ((denyResult === null || denyResult === void 0 ? void 0 : denyResult.matches) && denyResult.confidence === 'high') {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: "Denied by Bash prompt rule: \"".concat(denyResult.matchedDescription, "\""),
                                decisionReason: {
                                    type: 'other',
                                    reason: "Denied by Bash prompt rule: \"".concat(denyResult.matchedDescription, "\""),
                                },
                            }];
                    }
                    if (!((askResult === null || askResult === void 0 ? void 0 : askResult.matches) && askResult.confidence === 'high')) return [3 /*break*/, 10];
                    suggestions = void 0;
                    if (!(getCommandSubcommandPrefixFn === commands_js_1.getCommandSubcommandPrefix)) return [3 /*break*/, 7];
                    suggestions = suggestionForExactCommand(input.command);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, getCommandSubcommandPrefixFn(input.command, context.abortController.signal, context.options.isNonInteractiveSession)];
                case 8:
                    commandPrefixResult = _u.sent();
                    if (context.abortController.signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    suggestions = (commandPrefixResult === null || commandPrefixResult === void 0 ? void 0 : commandPrefixResult.commandPrefix)
                        ? suggestionForPrefix(commandPrefixResult.commandPrefix)
                        : suggestionForExactCommand(input.command);
                    _u.label = 9;
                case 9: return [2 /*return*/, __assign({ behavior: 'ask', message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name), decisionReason: {
                            type: 'other',
                            reason: "Required by Bash prompt rule: \"".concat(askResult.matchedDescription, "\""),
                        }, suggestions: suggestions }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                        ? {
                            pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                        }
                        : {}))];
                case 10: return [4 /*yield*/, (0, bashCommandHelpers_js_1.checkCommandOperatorPermissions)(input, function (i) {
                        return bashToolHasPermission(i, context, getCommandSubcommandPrefixFn);
                    }, { isNormalizedCdCommand: isNormalizedCdCommand, isNormalizedGitCommand: isNormalizedGitCommand }, astRoot)];
                case 11:
                    commandOperatorResult = _u.sent();
                    if (!(commandOperatorResult.behavior !== 'passthrough')) return [3 /*break*/, 16];
                    if (!(commandOperatorResult.behavior === 'allow')) return [3 /*break*/, 15];
                    if (!(astSubcommands === null)) return [3 /*break*/, 13];
                    return [4 /*yield*/, bashCommandIsSafeAsync(input.command)];
                case 12:
                    _d = _u.sent();
                    return [3 /*break*/, 14];
                case 13:
                    _d = null;
                    _u.label = 14;
                case 14:
                    safetyResult = _d;
                    if (safetyResult !== null &&
                        safetyResult.behavior !== 'passthrough' &&
                        safetyResult.behavior !== 'allow') {
                        // Attach pending classifier check - may auto-approve before user responds
                        appState = context.getAppState();
                        return [2 /*return*/, __assign({ behavior: 'ask', message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, {
                                    type: 'other',
                                    reason: (_q = safetyResult.message) !== null && _q !== void 0 ? _q : 'Command contains patterns that require approval',
                                }), decisionReason: {
                                    type: 'other',
                                    reason: (_r = safetyResult.message) !== null && _r !== void 0 ? _r : 'Command contains patterns that require approval',
                                } }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    appState = context.getAppState();
                    pathResult_1 = (0, pathValidation_js_1.checkPathConstraints)(input, (0, cwd_js_1.getCwd)(), appState.toolPermissionContext, commandHasAnyCd(input.command), astRedirects, astCommands);
                    if (pathResult_1.behavior !== 'passthrough') {
                        return [2 /*return*/, pathResult_1];
                    }
                    _u.label = 15;
                case 15:
                    // When pipe segments return 'ask' (individual segments not allowed by rules),
                    // attach pending classifier check - may auto-approve before user responds.
                    if (commandOperatorResult.behavior === 'ask') {
                        appState = context.getAppState();
                        return [2 /*return*/, __assign(__assign({}, commandOperatorResult), ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    return [2 /*return*/, commandOperatorResult];
                case 16:
                    if (!(astSubcommands === null &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK))) return [3 /*break*/, 21];
                    return [4 /*yield*/, bashCommandIsSafeAsync(input.command)];
                case 17:
                    originalCommandSafetyResult = _u.sent();
                    if (!(originalCommandSafetyResult.behavior === 'ask' &&
                        originalCommandSafetyResult.isBashSecurityCheckForMisparsing)) return [3 /*break*/, 21];
                    remainder = (0, bashSecurity_js_1.stripSafeHeredocSubstitutions)(input.command);
                    if (!(remainder !== null)) return [3 /*break*/, 19];
                    return [4 /*yield*/, bashCommandIsSafeAsync(remainder)];
                case 18:
                    _e = _u.sent();
                    return [3 /*break*/, 20];
                case 19:
                    _e = null;
                    _u.label = 20;
                case 20:
                    remainderResult = _e;
                    if (remainder === null ||
                        ((remainderResult === null || remainderResult === void 0 ? void 0 : remainderResult.behavior) === 'ask' &&
                            remainderResult.isBashSecurityCheckForMisparsing)) {
                        // Allow if the exact command has an explicit allow permission — the user
                        // made a conscious choice to permit this specific command.
                        appState = context.getAppState();
                        exactMatchResult_1 = (0, exports.bashToolCheckExactMatchPermission)(input, appState.toolPermissionContext);
                        if (exactMatchResult_1.behavior === 'allow') {
                            return [2 /*return*/, exactMatchResult_1];
                        }
                        decisionReason_4 = {
                            type: 'other',
                            reason: originalCommandSafetyResult.message,
                        };
                        return [2 /*return*/, __assign({ behavior: 'ask', message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_4), decisionReason: decisionReason_4, suggestions: [] }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    _u.label = 21;
                case 21:
                    cwd = (0, cwd_js_1.getCwd)();
                    cwdMingw = (0, platform_js_1.getPlatform)() === 'windows' ? (0, windowsPaths_js_1.windowsPathToPosixPath)(cwd) : cwd;
                    rawSubcommands = (_s = astSubcommands !== null && astSubcommands !== void 0 ? astSubcommands : shadowLegacySubs) !== null && _s !== void 0 ? _s : splitCommand(input.command);
                    _f = filterCdCwdSubcommands(rawSubcommands, astCommands, cwd, cwdMingw), subcommands = _f.subcommands, astCommandsByIdx = _f.astCommandsByIdx;
                    // CC-643: Cap subcommand fanout. Only the legacy splitCommand path can
                    // explode — the AST path returns a bounded list (astSubcommands !== null)
                    // or short-circuits to 'too-complex' for structures it can't represent.
                    if (astSubcommands === null &&
                        subcommands.length > exports.MAX_SUBCOMMANDS_FOR_SECURITY_CHECK) {
                        (0, debug_js_1.logForDebugging)("bashPermissions: ".concat(subcommands.length, " subcommands exceeds cap (").concat(exports.MAX_SUBCOMMANDS_FOR_SECURITY_CHECK, ") \u2014 returning ask"), { level: 'debug' });
                        decisionReason_5 = {
                            type: 'other',
                            reason: "Command splits into ".concat(subcommands.length, " subcommands, too many to safety-check individually"),
                        };
                        return [2 /*return*/, {
                                behavior: 'ask',
                                message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_5),
                                decisionReason: decisionReason_5,
                            }];
                    }
                    cdCommands = subcommands.filter(function (subCommand) {
                        return isNormalizedCdCommand(subCommand);
                    });
                    if (cdCommands.length > 1) {
                        decisionReason_6 = {
                            type: 'other',
                            reason: 'Multiple directory changes in one command require approval for clarity',
                        };
                        return [2 /*return*/, {
                                behavior: 'ask',
                                decisionReason: decisionReason_6,
                                message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_6),
                            }];
                    }
                    compoundCommandHasCd = cdCommands.length > 0;
                    // SECURITY: Block compound commands that have both cd AND git
                    // This prevents sandbox escape via: cd /malicious/dir && git status
                    // where the malicious directory contains a bare git repo with core.fsmonitor.
                    // This check must happen HERE (before subcommand-level permission checks)
                    // because bashToolCheckPermission checks each subcommand independently via
                    // BashTool.isReadOnly(), which would re-derive compoundCommandHasCd=false
                    // from just "git status" alone, bypassing the readOnlyValidation.ts check.
                    if (compoundCommandHasCd) {
                        hasGitCommand = subcommands.some(function (cmd) {
                            return isNormalizedGitCommand(cmd.trim());
                        });
                        if (hasGitCommand) {
                            decisionReason_7 = {
                                type: 'other',
                                reason: 'Compound commands with cd and git require approval to prevent bare repository attacks',
                            };
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: decisionReason_7,
                                    message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason_7),
                                }];
                        }
                    }
                    appState = context.getAppState(); // re-compute the latest in case the user hit shift+tab
                    subcommandPermissionDecisions = subcommands.map(function (command, i) {
                        return (0, exports.bashToolCheckPermission)({ command: command }, appState.toolPermissionContext, compoundCommandHasCd, astCommandsByIdx[i]);
                    });
                    deniedSubresult = subcommandPermissionDecisions.find(function (_) { return _.behavior === 'deny'; });
                    if (deniedSubresult !== undefined) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: "Permission to use ".concat(BashTool_js_1.BashTool.name, " with command ").concat(input.command, " has been denied."),
                                decisionReason: {
                                    type: 'subcommandResults',
                                    reasons: new Map(subcommandPermissionDecisions.map(function (result, i) { return [
                                        subcommands[i],
                                        result,
                                    ]; })),
                                },
                            }];
                    }
                    pathResult = (0, pathValidation_js_1.checkPathConstraints)(input, (0, cwd_js_1.getCwd)(), appState.toolPermissionContext, compoundCommandHasCd, astRedirects, astCommands);
                    if (pathResult.behavior === 'deny') {
                        return [2 /*return*/, pathResult];
                    }
                    askSubresult = subcommandPermissionDecisions.find(function (_) { return _.behavior === 'ask'; });
                    nonAllowCount = (0, array_js_1.count)(subcommandPermissionDecisions, function (_) { return _.behavior !== 'allow'; });
                    // SECURITY (GH#28784): Only short-circuit on a path-constraint 'ask' when no
                    // subcommand independently produced an 'ask'. checkPathConstraints re-runs the
                    // path-command loop on the full input, so `cd <outside-project> && python3 foo.py`
                    // produces an ask with ONLY a Read(<dir>/**) suggestion — the UI renders it as
                    // "Yes, allow reading from <dir>/" and picking that option silently approves
                    // python3. When a subcommand has its own ask (e.g. the cd subcommand's own
                    // path-constraint ask), fall through: either the askSubresult short-circuit
                    // below fires (single non-allow subcommand) or the merge flow collects Bash
                    // rule suggestions for every non-allow subcommand. The per-subcommand
                    // checkPathConstraints call inside bashToolCheckPermission already captures
                    // the Read rule for the cd target in that path.
                    //
                    // When no subcommand asked (all allow, or all passthrough like `printf > file`),
                    // pathResult IS the only ask — return it so redirection checks surface.
                    if (pathResult.behavior === 'ask' && askSubresult === undefined) {
                        return [2 /*return*/, pathResult];
                    }
                    // Ask if any subcommands require approval (e.g., ls/cd outside boundaries).
                    // Only short-circuit when exactly ONE subcommand needs approval — if multiple
                    // do (e.g. cd-outside-project ask + python3 passthrough), fall through to the
                    // merge flow so the prompt surfaces Bash rule suggestions for all of them
                    // instead of only the first ask's Read rule (GH#28784).
                    if (askSubresult !== undefined && nonAllowCount === 1) {
                        return [2 /*return*/, __assign(__assign({}, askSubresult), ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    // Allow if exact command was allowed
                    if (exactMatchResult.behavior === 'allow') {
                        return [2 /*return*/, exactMatchResult];
                    }
                    hasPossibleCommandInjection = false;
                    if (!(astSubcommands === null &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK))) return [3 /*break*/, 23];
                    divergenceCount_1 = 0;
                    onDivergence_1 = function () {
                        divergenceCount_1++;
                    };
                    return [4 /*yield*/, Promise.all(subcommands.map(function (c) { return bashCommandIsSafeAsync(c, onDivergence_1); }))];
                case 22:
                    results = _u.sent();
                    hasPossibleCommandInjection = results.some(function (r) { return r.behavior !== 'passthrough'; });
                    if (divergenceCount_1 > 0) {
                        (0, index_js_1.logEvent)('tengu_tree_sitter_security_divergence', {
                            quoteContextDivergence: true,
                            count: divergenceCount_1,
                        });
                    }
                    _u.label = 23;
                case 23:
                    if (subcommandPermissionDecisions.every(function (_) { return _.behavior === 'allow'; }) &&
                        !hasPossibleCommandInjection) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: {
                                    type: 'subcommandResults',
                                    reasons: new Map(subcommandPermissionDecisions.map(function (result, i) { return [
                                        subcommands[i],
                                        result,
                                    ]; })),
                                },
                            }];
                    }
                    commandSubcommandPrefix = null;
                    if (!(getCommandSubcommandPrefixFn !== commands_js_1.getCommandSubcommandPrefix)) return [3 /*break*/, 25];
                    return [4 /*yield*/, getCommandSubcommandPrefixFn(input.command, context.abortController.signal, context.options.isNonInteractiveSession)];
                case 24:
                    commandSubcommandPrefix = _u.sent();
                    if (context.abortController.signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    _u.label = 25;
                case 25:
                    // If there is only one command, no need to process subcommands
                    appState = context.getAppState(); // re-compute the latest in case the user hit shift+tab
                    if (!(subcommands.length === 1)) return [3 /*break*/, 27];
                    return [4 /*yield*/, checkCommandAndSuggestRules({ command: subcommands[0] }, appState.toolPermissionContext, commandSubcommandPrefix, compoundCommandHasCd, astSubcommands !== null)
                        // If command wasn't allowed, attach pending classifier check.
                        // At this point, 'ask' can only come from bashCommandIsSafe (security check inside
                        // checkCommandAndSuggestRules), NOT from explicit ask rules - those were already
                        // filtered out at step 13 (askSubresult check). The classifier can bypass security.
                    ];
                case 26:
                    result = _u.sent();
                    // If command wasn't allowed, attach pending classifier check.
                    // At this point, 'ask' can only come from bashCommandIsSafe (security check inside
                    // checkCommandAndSuggestRules), NOT from explicit ask rules - those were already
                    // filtered out at step 13 (askSubresult check). The classifier can bypass security.
                    if (result.behavior === 'ask' || result.behavior === 'passthrough') {
                        return [2 /*return*/, __assign(__assign({}, result), ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                                ? {
                                    pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                                }
                                : {}))];
                    }
                    return [2 /*return*/, result];
                case 27:
                    subcommandResults = new Map();
                    _i = 0, subcommands_2 = subcommands;
                    _u.label = 28;
                case 28:
                    if (!(_i < subcommands_2.length)) return [3 /*break*/, 31];
                    subcommand = subcommands_2[_i];
                    _h = (_g = subcommandResults).set;
                    _j = [subcommand];
                    return [4 /*yield*/, checkCommandAndSuggestRules(__assign(__assign({}, input), { command: subcommand }), appState.toolPermissionContext, commandSubcommandPrefix === null || commandSubcommandPrefix === void 0 ? void 0 : commandSubcommandPrefix.subcommandPrefixes.get(subcommand), compoundCommandHasCd, astSubcommands !== null)];
                case 29:
                    _h.apply(_g, _j.concat([_u.sent()]));
                    _u.label = 30;
                case 30:
                    _i++;
                    return [3 /*break*/, 28];
                case 31:
                    // Allow if all subcommands are allowed
                    // Note that this is different than 6b because we are checking the command injection results.
                    if (subcommands.every(function (subcommand) {
                        var permissionResult = subcommandResults.get(subcommand);
                        return (permissionResult === null || permissionResult === void 0 ? void 0 : permissionResult.behavior) === 'allow';
                    })) {
                        // Keep subcommandResults as PermissionResult for decisionReason
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: {
                                    type: 'subcommandResults',
                                    reasons: subcommandResults,
                                },
                            }];
                    }
                    collectedRules = new Map();
                    for (_k = 0, subcommandResults_1 = subcommandResults; _k < subcommandResults_1.length; _k++) {
                        _l = subcommandResults_1[_k], subcommand = _l[0], permissionResult = _l[1];
                        if (permissionResult.behavior === 'ask' ||
                            permissionResult.behavior === 'passthrough') {
                            updates = 'suggestions' in permissionResult
                                ? permissionResult.suggestions
                                : undefined;
                            rules = (0, PermissionUpdate_js_1.extractRules)(updates);
                            for (_m = 0, rules_1 = rules; _m < rules_1.length; _m++) {
                                rule = rules_1[_m];
                                ruleKey = (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule);
                                collectedRules.set(ruleKey, rule);
                            }
                            // GH#28784 follow-up: security-check asks (compound-cd+write, process
                            // substitution, etc.) carry no suggestions. In a compound command like
                            // `cd ~/out && rm -rf x`, that means only cd's Read rule gets collected
                            // and the UI labels the prompt "Yes, allow reading from <dir>/" — never
                            // mentioning rm. Synthesize a Bash(exact) rule so the UI shows the
                            // chained command. Skip explicit ask rules (decisionReason.type 'rule')
                            // where the user deliberately wants to review each time.
                            if (permissionResult.behavior === 'ask' &&
                                rules.length === 0 &&
                                ((_t = permissionResult.decisionReason) === null || _t === void 0 ? void 0 : _t.type) !== 'rule') {
                                for (_o = 0, _p = (0, PermissionUpdate_js_1.extractRules)(suggestionForExactCommand(subcommand)); _o < _p.length; _o++) {
                                    rule = _p[_o];
                                    ruleKey = (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule);
                                    collectedRules.set(ruleKey, rule);
                                }
                            }
                            // Note: We only collect rules, not other update types like mode changes
                            // This is appropriate for bash subcommands which primarily need rule suggestions
                        }
                    }
                    decisionReason = {
                        type: 'subcommandResults',
                        reasons: subcommandResults,
                    };
                    cappedRules = Array.from(collectedRules.values()).slice(0, exports.MAX_SUGGESTED_RULES_FOR_COMPOUND);
                    suggestedUpdates = cappedRules.length > 0
                        ? [
                            {
                                type: 'addRules',
                                rules: cappedRules,
                                behavior: 'allow',
                                destination: 'localSettings',
                            },
                        ]
                        : undefined;
                    // Attach pending classifier check - may auto-approve before user responds.
                    // Behavior is 'ask' if any subcommand was 'ask' (e.g., path constraint or ask
                    // rule) — before the GH#28784 fix, ask subresults always short-circuited above
                    // so this path only saw 'passthrough' subcommands and hardcoded that.
                    return [2 /*return*/, __assign({ behavior: askSubresult !== undefined ? 'ask' : 'passthrough', message: (0, permissions_js_1.createPermissionRequestMessage)(BashTool_js_1.BashTool.name, decisionReason), decisionReason: decisionReason, suggestions: suggestedUpdates }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
                            ? {
                                pendingClassifierCheck: buildPendingClassifierCheck(input.command, appState.toolPermissionContext),
                            }
                            : {}))];
            }
        });
    });
}
/**
 * Checks if a subcommand is a git command after normalizing away safe wrappers
 * (env vars, timeout, etc.) and shell quotes.
 *
 * SECURITY: Must normalize before matching to prevent bypasses like:
 *   'git' status    — shell quotes hide the command from a naive regex
 *   NO_COLOR=1 git status — env var prefix hides the command
 */
function isNormalizedGitCommand(command) {
    // Fast path: catch the most common case before any parsing
    if (command.startsWith('git ') || command === 'git') {
        return true;
    }
    var stripped = stripSafeWrappers(command);
    var parsed = (0, shellQuote_js_1.tryParseShellCommand)(stripped);
    if (parsed.success && parsed.tokens.length > 0) {
        // Direct git command
        if (parsed.tokens[0] === 'git') {
            return true;
        }
        // "xargs git ..." — xargs runs git in the current directory,
        // so it must be treated as a git command for cd+git security checks.
        // This matches the xargs prefix handling in filterRulesByContentsMatchingInput.
        if (parsed.tokens[0] === 'xargs' && parsed.tokens.includes('git')) {
            return true;
        }
        return false;
    }
    return /^git(?:\s|$)/.test(stripped);
}
/**
 * Checks if a subcommand is a cd command after normalizing away safe wrappers
 * (env vars, timeout, etc.) and shell quotes.
 *
 * SECURITY: Must normalize before matching to prevent bypasses like:
 *   FORCE_COLOR=1 cd sub — env var prefix hides the cd from a naive /^cd / regex
 *   This mirrors isNormalizedGitCommand to ensure symmetric normalization.
 *
 * Also matches pushd/popd — they change cwd just like cd, so
 *   pushd /tmp/bare-repo && git status
 * must trigger the same cd+git guard. Mirrors PowerShell's
 * DIRECTORY_CHANGE_ALIASES (src/utils/powershell/parser.ts).
 */
function isNormalizedCdCommand(command) {
    var stripped = stripSafeWrappers(command);
    var parsed = (0, shellQuote_js_1.tryParseShellCommand)(stripped);
    if (parsed.success && parsed.tokens.length > 0) {
        var cmd = parsed.tokens[0];
        return cmd === 'cd' || cmd === 'pushd' || cmd === 'popd';
    }
    return /^(?:cd|pushd|popd)(?:\s|$)/.test(stripped);
}
/**
 * Checks if a compound command contains any cd command,
 * using normalized detection that handles env var prefixes and shell quotes.
 */
function commandHasAnyCd(command) {
    return splitCommand(command).some(function (subcmd) {
        return isNormalizedCdCommand(subcmd.trim());
    });
}
