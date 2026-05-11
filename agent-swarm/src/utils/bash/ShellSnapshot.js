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
exports.createAndSaveSnapshot = void 0;
exports.createRipgrepShellIntegration = createRipgrepShellIntegration;
exports.createFindGrepShellIntegration = createFindGrepShellIntegration;
var child_process_1 = require("child_process");
var execa_1 = require("execa");
var promises_1 = require("fs/promises");
var os = require("os");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var cwd_js_1 = require("../cwd.js");
var debug_js_1 = require("../debug.js");
var embeddedTools_js_1 = require("../embeddedTools.js");
var envUtils_js_1 = require("../envUtils.js");
var file_js_1 = require("../file.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var platform_js_1 = require("../platform.js");
var ripgrep_js_1 = require("../ripgrep.js");
var subprocessEnv_js_1 = require("../subprocessEnv.js");
var shellQuote_js_1 = require("./shellQuote.js");
var LITERAL_BACKSLASH = '\\';
var SNAPSHOT_CREATION_TIMEOUT = 10000; // 10 seconds
/**
 * Creates a shell function that invokes `binaryPath` with a specific argv[0].
 * This uses the bun-internal ARGV0 dispatch trick: the bun binary checks its
 * argv[0] and runs the embedded tool (rg, bfs, ugrep) that matches.
 *
 * @param prependArgs - Arguments to inject before the user's args (e.g.,
 *   default flags). Injected literally; each element must be a valid shell
 *   word (no spaces/special chars).
 */
function createArgv0ShellFunction(funcName, argv0, binaryPath, prependArgs) {
    if (prependArgs === void 0) { prependArgs = []; }
    var quotedPath = (0, shellQuote_js_1.quote)([binaryPath]);
    var argSuffix = prependArgs.length > 0 ? "".concat(prependArgs.join(' '), " \"$@\"") : '"$@"';
    return [
        "function ".concat(funcName, " {"),
        '  if [[ -n $ZSH_VERSION ]]; then',
        "    ARGV0=".concat(argv0, " ").concat(quotedPath, " ").concat(argSuffix),
        '  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then',
        // On Windows (git bash), exec -a does not work, so use ARGV0 env var instead
        // The bun binary reads from ARGV0 natively to set argv[0]
        "    ARGV0=".concat(argv0, " ").concat(quotedPath, " ").concat(argSuffix),
        '  elif [[ $BASHPID != $$ ]]; then',
        "    exec -a ".concat(argv0, " ").concat(quotedPath, " ").concat(argSuffix),
        '  else',
        "    (exec -a ".concat(argv0, " ").concat(quotedPath, " ").concat(argSuffix, ")"),
        '  fi',
        '}',
    ].join('\n');
}
/**
 * Creates ripgrep shell integration (alias or function)
 * @returns Object with type and the shell snippet to use
 */
function createRipgrepShellIntegration() {
    var rgCommand = (0, ripgrep_js_1.ripgrepCommand)();
    // For embedded ripgrep (bun-internal), we need a shell function that sets argv0
    if (rgCommand.argv0) {
        return {
            type: 'function',
            snippet: createArgv0ShellFunction('rg', rgCommand.argv0, rgCommand.rgPath),
        };
    }
    // For regular ripgrep, use a simple alias target
    var quotedPath = (0, shellQuote_js_1.quote)([rgCommand.rgPath]);
    var quotedArgs = rgCommand.rgArgs.map(function (arg) { return (0, shellQuote_js_1.quote)([arg]); });
    var aliasTarget = rgCommand.rgArgs.length > 0
        ? "".concat(quotedPath, " ").concat(quotedArgs.join(' '))
        : quotedPath;
    return { type: 'alias', snippet: aliasTarget };
}
/**
 * VCS directories to exclude from grep searches. Matches the list in
 * GrepTool (see GrepTool.ts: VCS_DIRECTORIES_TO_EXCLUDE).
 */
var VCS_DIRECTORIES_TO_EXCLUDE = [
    '.git',
    '.svn',
    '.hg',
    '.bzr',
    '.jj',
    '.sl',
];
/**
 * Creates shell integration for `find` and `grep`, backed by bfs and ugrep
 * embedded in the bun binary (ant-native only). Unlike the rg integration,
 * this always shadows the system find/grep since bfs/ugrep are drop-in
 * replacements and we want consistent fast behavior.
 *
 * These wrappers replace the GlobTool/GrepTool dedicated tools (which are
 * removed from the tool registry when embedded search tools are available),
 * so they're tuned to match those tools' semantics, not GNU find/grep.
 *
 * `find` ↔ GlobTool:
 * - Inject `-regextype findutils-default`: bfs defaults to POSIX BRE for
 *   -regex, but GNU find defaults to emacs-flavor (which supports `\|`
 *   alternation). Without this, `find . -regex '.*\.\(js\|ts\)'` silently
 *   returns zero results. A later user-supplied -regextype still overrides.
 * - No gitignore filtering: GlobTool passes `--no-ignore` to rg. bfs has no
 *   gitignore support anyway, so this matches by default.
 * - Hidden files included: both GlobTool (`--hidden`) and bfs's default.
 *
 * Caveat: even with findutils-default, Oniguruma (bfs's regex engine) uses
 * leftmost-first alternation, not POSIX leftmost-longest. Patterns where
 * one alternative is a prefix of another (e.g., `\(ts\|tsx\)`) may miss
 * matches that GNU find catches. Workaround: put the longer alternative first.
 *
 * `grep` ↔ GrepTool (file filtering) + GNU grep (regex syntax):
 * - `-G` (basic regex / BRE): GNU grep defaults to BRE where `\|` is
 *   alternation. ugrep defaults to ERE where `|` is alternation and `\|` is a
 *   literal pipe. Without -G, `grep "foo\|bar"` silently returns zero results.
 *   User-supplied `-E`, `-F`, or `-P` later in argv overrides this.
 * - `--ignore-files`: respect .gitignore (GrepTool uses rg's default, which
 *   respects gitignore). Override with `grep --no-ignore-files`.
 * - `--hidden`: include hidden files (GrepTool passes `--hidden` to rg).
 *   Override with `grep --no-hidden`.
 * - `--exclude-dir` for VCS dirs: GrepTool passes `--glob '!.git'` etc. to rg.
 * - `-I`: skip binary files. rg's recursion silently skips binary matches
 *   by default (different from direct-file-arg behavior); ugrep doesn't, so
 *   we inject -I to match. Override with `grep -a`.
 *
 * Not replicated from GrepTool:
 * - `--max-columns 500`: ugrep's `--width` hard-truncates output which could
 *   break pipelines; rg's version replaces the line with a placeholder.
 * - Read deny rules / plugin cache exclusions: require toolPermissionContext
 *   which isn't available at shell-snapshot creation time.
 *
 * Returns null if embedded search tools are not available in this build.
 */
function createFindGrepShellIntegration() {
    if (!(0, embeddedTools_js_1.hasEmbeddedSearchTools)()) {
        return null;
    }
    var binaryPath = (0, embeddedTools_js_1.embeddedSearchToolsBinaryPath)();
    return [
        // User shell configs may define aliases like `alias find=gfind` or
        // `alias grep=ggrep` (common on macOS with Homebrew GNU tools). The
        // snapshot sources user aliases before these function definitions, and
        // bash expands aliases before function lookup — so a renaming alias
        // would silently bypass the embedded bfs/ugrep dispatch. Clear them first
        // (same fix the rg integration uses).
        'unalias find 2>/dev/null || true',
        'unalias grep 2>/dev/null || true',
        createArgv0ShellFunction('find', 'bfs', binaryPath, [
            '-regextype',
            'findutils-default',
        ]),
        createArgv0ShellFunction('grep', 'ugrep', binaryPath, __spreadArray([
            '-G',
            '--ignore-files',
            '--hidden',
            '-I'
        ], VCS_DIRECTORIES_TO_EXCLUDE.map(function (d) { return "--exclude-dir=".concat(d); }), true)),
    ].join('\n');
}
function getConfigFile(shellPath) {
    var fileName = shellPath.includes('zsh')
        ? '.zshrc'
        : shellPath.includes('bash')
            ? '.bashrc'
            : '.profile';
    var configPath = (0, path_1.join)(os.homedir(), fileName);
    return configPath;
}
/**
 * Generates user-specific snapshot content (functions, options, aliases)
 * This content is derived from the user's shell configuration file
 */
function getUserSnapshotContent(configFile) {
    var isZsh = configFile.endsWith('.zshrc');
    var content = '';
    // User functions
    if (isZsh) {
        content += "\n      echo \"# Functions\" >> \"$SNAPSHOT_FILE\"\n\n      # Force autoload all functions first\n      typeset -f > /dev/null 2>&1\n\n      # Now get user function names - filter completion functions (single underscore prefix)\n      # but keep double-underscore helpers (e.g. __zsh_like_cd from mise, __pyenv_init)\n      typeset +f | grep -vE '^_[^_]' | while read func; do\n        typeset -f \"$func\" >> \"$SNAPSHOT_FILE\"\n      done\n    ";
    }
    else {
        content += "\n      echo \"# Functions\" >> \"$SNAPSHOT_FILE\"\n\n      # Force autoload all functions first\n      declare -f > /dev/null 2>&1\n\n      # Now get user function names - filter completion functions (single underscore prefix)\n      # but keep double-underscore helpers (e.g. __zsh_like_cd from mise, __pyenv_init)\n      declare -F | cut -d' ' -f3 | grep -vE '^_[^_]' | while read func; do\n        # Encode the function to base64, preserving all special characters\n        encoded_func=$(declare -f \"$func\" | base64 )\n        # Write the function definition to the snapshot\n        echo \"eval ".concat(LITERAL_BACKSLASH, "\"").concat(LITERAL_BACKSLASH, "$(echo '$encoded_func' | base64 -d)").concat(LITERAL_BACKSLASH, "\" > /dev/null 2>&1\" >> \"$SNAPSHOT_FILE\"\n      done\n    ");
    }
    // Shell options
    if (isZsh) {
        content += "\n      echo \"# Shell Options\" >> \"$SNAPSHOT_FILE\"\n      setopt | sed 's/^/setopt /' | head -n 1000 >> \"$SNAPSHOT_FILE\"\n    ";
    }
    else {
        content += "\n      echo \"# Shell Options\" >> \"$SNAPSHOT_FILE\"\n      shopt -p | head -n 1000 >> \"$SNAPSHOT_FILE\"\n      set -o | grep \"on\" | awk '{print \"set -o \" $1}' | head -n 1000 >> \"$SNAPSHOT_FILE\"\n      echo \"shopt -s expand_aliases\" >> \"$SNAPSHOT_FILE\"\n    ";
    }
    // User aliases
    content += "\n      echo \"# Aliases\" >> \"$SNAPSHOT_FILE\"\n      # Filter out winpty aliases on Windows to avoid \"stdin is not a tty\" errors\n      # Git Bash automatically creates aliases like \"alias node='winpty node.exe'\" for\n      # programs that need Win32 Console in mintty, but winpty fails when there's no TTY\n      if [[ \"$OSTYPE\" == \"msys\" ]] || [[ \"$OSTYPE\" == \"cygwin\" ]]; then\n        alias | grep -v \"='winpty \" | sed 's/^alias //g' | sed 's/^/alias -- /' | head -n 1000 >> \"$SNAPSHOT_FILE\"\n      else\n        alias | sed 's/^alias //g' | sed 's/^/alias -- /' | head -n 1000 >> \"$SNAPSHOT_FILE\"\n      fi\n  ";
    return content;
}
/**
 * Generates Claude Code specific snapshot content
 * This content is always included regardless of user configuration
 */
function getClaudeCodeSnapshotContent() {
    return __awaiter(this, void 0, void 0, function () {
        var pathValue, cygwinResult, rgIntegration, content, escapedSnippet, findGrepIntegration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathValue = process.env.PATH;
                    if (!((0, platform_js_1.getPlatform)() === 'windows')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execa_1.execa)('echo $PATH', {
                            shell: true,
                            reject: false,
                        })];
                case 1:
                    cygwinResult = _a.sent();
                    if (cygwinResult.exitCode === 0 && cygwinResult.stdout) {
                        pathValue = cygwinResult.stdout.trim();
                    }
                    _a.label = 2;
                case 2:
                    rgIntegration = createRipgrepShellIntegration();
                    content = '';
                    // Check if rg is available, if not create an alias/function to bundled ripgrep
                    // We use a subshell to unalias rg before checking, so that user aliases like
                    // `alias rg='rg --smart-case'` don't shadow the real binary check. The subshell
                    // ensures we don't modify the user's aliases in the parent shell.
                    content += "\n      # Check for rg availability\n      echo \"# Check for rg availability\" >> \"$SNAPSHOT_FILE\"\n      echo \"if ! (unalias rg 2>/dev/null; command -v rg) >/dev/null 2>&1; then\" >> \"$SNAPSHOT_FILE\"\n  ";
                    if (rgIntegration.type === 'function') {
                        // For embedded ripgrep, write the function definition using heredoc
                        content += "\n      cat >> \"$SNAPSHOT_FILE\" << 'RIPGREP_FUNC_END'\n  ".concat(rgIntegration.snippet, "\nRIPGREP_FUNC_END\n    ");
                    }
                    else {
                        escapedSnippet = rgIntegration.snippet.replace(/'/g, "'\\''");
                        content += "\n      echo '  alias rg='\"'".concat(escapedSnippet, "'\" >> \"$SNAPSHOT_FILE\"\n    ");
                    }
                    content += "\n      echo \"fi\" >> \"$SNAPSHOT_FILE\"\n  ";
                    findGrepIntegration = createFindGrepShellIntegration();
                    if (findGrepIntegration !== null) {
                        content += "\n      # Shadow find/grep with embedded bfs/ugrep (ant-native only)\n      echo \"# Shadow find/grep with embedded bfs/ugrep\" >> \"$SNAPSHOT_FILE\"\n      cat >> \"$SNAPSHOT_FILE\" << 'FIND_GREP_FUNC_END'\n".concat(findGrepIntegration, "\nFIND_GREP_FUNC_END\n    ");
                    }
                    // Add PATH to the file
                    content += "\n\n      # Add PATH to the file\n      echo \"export PATH=".concat((0, shellQuote_js_1.quote)([pathValue || '']), "\" >> \"$SNAPSHOT_FILE\"\n  ");
                    return [2 /*return*/, content];
            }
        });
    });
}
/**
 * Creates the appropriate shell script for capturing environment
 */
function getSnapshotScript(shellPath, snapshotFilePath, configFileExists) {
    return __awaiter(this, void 0, void 0, function () {
        var configFile, isZsh, userContent, claudeCodeContent, script;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    configFile = getConfigFile(shellPath);
                    isZsh = configFile.endsWith('.zshrc');
                    userContent = configFileExists
                        ? getUserSnapshotContent(configFile)
                        : !isZsh
                            ? // we need to manually force alias expansion in bash - normally `getUserSnapshotContent` takes care of this
                                'echo "shopt -s expand_aliases" >> "$SNAPSHOT_FILE"'
                            : '';
                    return [4 /*yield*/, getClaudeCodeSnapshotContent()];
                case 1:
                    claudeCodeContent = _a.sent();
                    script = "SNAPSHOT_FILE=".concat((0, shellQuote_js_1.quote)([snapshotFilePath]), "\n      ").concat(configFileExists ? "source \"".concat(configFile, "\" < /dev/null") : '# No user config file to source', "\n\n      # First, create/clear the snapshot file\n      echo \"# Snapshot file\" >| \"$SNAPSHOT_FILE\"\n\n      # When this file is sourced, we first unalias to avoid conflicts\n      # This is necessary because aliases get \"frozen\" inside function definitions at definition time,\n      # which can cause unexpected behavior when functions use commands that conflict with aliases\n      echo \"# Unset all aliases to avoid conflicts with functions\" >> \"$SNAPSHOT_FILE\"\n      echo \"unalias -a 2>/dev/null || true\" >> \"$SNAPSHOT_FILE\"\n\n      ").concat(userContent, "\n\n      ").concat(claudeCodeContent, "\n\n      # Exit silently on success, only report errors\n      if [ ! -f \"$SNAPSHOT_FILE\" ]; then\n        echo \"Error: Snapshot file was not created at $SNAPSHOT_FILE\" >&2\n        exit 1\n      fi\n    ");
                    return [2 /*return*/, script];
            }
        });
    });
}
/**
 * Creates and saves the shell environment snapshot by loading the user's shell configuration
 *
 * This function is a critical part of Claude CLI's shell integration strategy. It:
 *
 * 1. Identifies the user's shell config file (.zshrc, .bashrc, etc.)
 * 2. Creates a temporary script that sources this configuration file
 * 3. Captures the resulting shell environment state including:
 *    - Functions defined in the user's shell configuration
 *    - Shell options and settings that affect command behavior
 *    - Aliases that the user has defined
 *
 * The snapshot is saved to a temporary file that can be sourced by subsequent shell
 * commands, ensuring they run with the user's expected environment, aliases, and functions.
 *
 * This approach allows Claude CLI to execute commands as if they were run in the user's
 * interactive shell, while avoiding the overhead of creating a new login shell for each command.
 * It handles both Bash and Zsh shells with their different syntax for functions, options, and aliases.
 *
 * If the snapshot creation fails (e.g., timeout, permissions issues), the CLI will still
 * function but without the user's custom shell environment, potentially missing aliases
 * and functions the user relies on.
 *
 * @returns Promise that resolves to the snapshot file path or undefined if creation failed
 */
var createAndSaveSnapshot = function (binShell) { return __awaiter(void 0, void 0, void 0, function () {
    var shellType;
    return __generator(this, function (_a) {
        shellType = binShell.includes('zsh')
            ? 'zsh'
            : binShell.includes('bash')
                ? 'bash'
                : 'sh';
        (0, debug_js_1.logForDebugging)("Creating shell snapshot for ".concat(shellType, " (").concat(binShell, ")"));
        return [2 /*return*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                var configFile, configFileExists_1, timestamp, randomId, snapshotsDir_1, shellSnapshotPath_1, snapshotScript_1, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            configFile = getConfigFile(binShell);
                            (0, debug_js_1.logForDebugging)("Looking for shell config file: ".concat(configFile));
                            return [4 /*yield*/, (0, file_js_1.pathExists)(configFile)];
                        case 1:
                            configFileExists_1 = _a.sent();
                            if (!configFileExists_1) {
                                (0, debug_js_1.logForDebugging)("Shell config file not found: ".concat(configFile, ", creating snapshot with Claude Code defaults only"));
                            }
                            timestamp = Date.now();
                            randomId = Math.random().toString(36).substring(2, 8);
                            snapshotsDir_1 = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'shell-snapshots');
                            (0, debug_js_1.logForDebugging)("Snapshots directory: ".concat(snapshotsDir_1));
                            shellSnapshotPath_1 = (0, path_1.join)(snapshotsDir_1, "snapshot-".concat(shellType, "-").concat(timestamp, "-").concat(randomId, ".sh"));
                            // Ensure snapshots directory exists
                            return [4 /*yield*/, (0, promises_1.mkdir)(snapshotsDir_1, { recursive: true })];
                        case 2:
                            // Ensure snapshots directory exists
                            _a.sent();
                            return [4 /*yield*/, getSnapshotScript(binShell, shellSnapshotPath_1, configFileExists_1)];
                        case 3:
                            snapshotScript_1 = _a.sent();
                            (0, debug_js_1.logForDebugging)("Creating snapshot at: ".concat(shellSnapshotPath_1));
                            (0, debug_js_1.logForDebugging)("Execution timeout: ".concat(SNAPSHOT_CREATION_TIMEOUT, "ms"));
                            (0, child_process_1.execFile)(binShell, ['-c', '-l', snapshotScript_1], {
                                env: __assign(__assign({}, (process.env.CLAUDE_CODE_DONT_INHERIT_ENV
                                    ? {}
                                    : (0, subprocessEnv_js_1.subprocessEnv)())), { SHELL: binShell, GIT_EDITOR: 'true', CLAUDECODE: '1' }),
                                timeout: SNAPSHOT_CREATION_TIMEOUT,
                                maxBuffer: 1024 * 1024, // 1MB buffer
                                encoding: 'utf8',
                            }, function (error, stdout, stderr) { return __awaiter(void 0, void 0, void 0, function () {
                                var execError, signalNumber, snapshotSize, _a, dirContents, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!error) return [3 /*break*/, 1];
                                            execError = error;
                                            (0, debug_js_1.logForDebugging)("Shell snapshot creation failed: ".concat(error.message));
                                            (0, debug_js_1.logForDebugging)("Error details:");
                                            (0, debug_js_1.logForDebugging)("  - Error code: ".concat(execError === null || execError === void 0 ? void 0 : execError.code));
                                            (0, debug_js_1.logForDebugging)("  - Error signal: ".concat(execError === null || execError === void 0 ? void 0 : execError.signal));
                                            (0, debug_js_1.logForDebugging)("  - Error killed: ".concat(execError === null || execError === void 0 ? void 0 : execError.killed));
                                            (0, debug_js_1.logForDebugging)("  - Shell path: ".concat(binShell));
                                            (0, debug_js_1.logForDebugging)("  - Config file: ".concat(getConfigFile(binShell)));
                                            (0, debug_js_1.logForDebugging)("  - Config file exists: ".concat(configFileExists_1));
                                            (0, debug_js_1.logForDebugging)("  - Working directory: ".concat((0, cwd_js_1.getCwd)()));
                                            (0, debug_js_1.logForDebugging)("  - Claude home: ".concat((0, envUtils_js_1.getClaudeConfigHomeDir)()));
                                            (0, debug_js_1.logForDebugging)("Full snapshot script:\n".concat(snapshotScript_1));
                                            if (stdout) {
                                                (0, debug_js_1.logForDebugging)("stdout output (".concat(stdout.length, " chars):\n").concat(stdout));
                                            }
                                            else {
                                                (0, debug_js_1.logForDebugging)("No stdout output captured");
                                            }
                                            if (stderr) {
                                                (0, debug_js_1.logForDebugging)("stderr output (".concat(stderr.length, " chars): ").concat(stderr));
                                            }
                                            else {
                                                (0, debug_js_1.logForDebugging)("No stderr output captured");
                                            }
                                            (0, log_js_1.logError)(new Error("Failed to create shell snapshot: ".concat(error.message)));
                                            signalNumber = (execError === null || execError === void 0 ? void 0 : execError.signal)
                                                ? os.constants.signals[execError.signal]
                                                : undefined;
                                            (0, index_js_1.logEvent)('tengu_shell_snapshot_failed', {
                                                stderr_length: (stderr === null || stderr === void 0 ? void 0 : stderr.length) || 0,
                                                has_error_code: !!(execError === null || execError === void 0 ? void 0 : execError.code),
                                                error_signal_number: signalNumber,
                                                error_killed: execError === null || execError === void 0 ? void 0 : execError.killed,
                                            });
                                            resolve(undefined);
                                            return [3 /*break*/, 11];
                                        case 1:
                                            snapshotSize = void 0;
                                            _c.label = 2;
                                        case 2:
                                            _c.trys.push([2, 4, , 5]);
                                            return [4 /*yield*/, (0, promises_1.stat)(shellSnapshotPath_1)];
                                        case 3:
                                            snapshotSize = (_c.sent()).size;
                                            return [3 /*break*/, 5];
                                        case 4:
                                            _a = _c.sent();
                                            return [3 /*break*/, 5];
                                        case 5:
                                            if (!(snapshotSize !== undefined)) return [3 /*break*/, 6];
                                            (0, debug_js_1.logForDebugging)("Shell snapshot created successfully (".concat(snapshotSize, " bytes)"));
                                            // Register cleanup to remove snapshot on graceful shutdown
                                            (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(void 0, void 0, void 0, function () {
                                                var error_2;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            _a.trys.push([0, 2, , 3]);
                                                            return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().unlink(shellSnapshotPath_1)];
                                                        case 1:
                                                            _a.sent();
                                                            (0, debug_js_1.logForDebugging)("Cleaned up session snapshot: ".concat(shellSnapshotPath_1));
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            error_2 = _a.sent();
                                                            (0, debug_js_1.logForDebugging)("Error cleaning up session snapshot: ".concat(error_2));
                                                            return [3 /*break*/, 3];
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                            resolve(shellSnapshotPath_1);
                                            return [3 /*break*/, 11];
                                        case 6:
                                            (0, debug_js_1.logForDebugging)("Shell snapshot file not found after creation: ".concat(shellSnapshotPath_1));
                                            (0, debug_js_1.logForDebugging)("Checking if parent directory still exists: ".concat(snapshotsDir_1));
                                            _c.label = 7;
                                        case 7:
                                            _c.trys.push([7, 9, , 10]);
                                            return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readdir(snapshotsDir_1)];
                                        case 8:
                                            dirContents = _c.sent();
                                            (0, debug_js_1.logForDebugging)("Directory contains ".concat(dirContents.length, " files"));
                                            return [3 /*break*/, 10];
                                        case 9:
                                            _b = _c.sent();
                                            (0, debug_js_1.logForDebugging)("Parent directory does not exist or is not accessible: ".concat(snapshotsDir_1));
                                            return [3 /*break*/, 10];
                                        case 10:
                                            (0, index_js_1.logEvent)('tengu_shell_unknown_error', {});
                                            resolve(undefined);
                                            _c.label = 11;
                                        case 11: return [2 /*return*/];
                                    }
                                });
                            }); });
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            (0, debug_js_1.logForDebugging)("Unexpected error during snapshot creation: ".concat(error_1));
                            if (error_1 instanceof Error) {
                                (0, debug_js_1.logForDebugging)("Error stack trace: ".concat(error_1.stack));
                            }
                            (0, log_js_1.logError)(error_1);
                            (0, index_js_1.logEvent)('tengu_shell_snapshot_error', {});
                            resolve(undefined);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })];
    });
}); };
exports.createAndSaveSnapshot = createAndSaveSnapshot;
