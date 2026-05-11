"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMAND_OPERATION_TYPE = exports.PATH_EXTRACTORS = void 0;
exports.createPathChecker = createPathChecker;
exports.checkPathConstraints = checkPathConstraints;
exports.stripWrappersFromArgv = stripWrappersFromArgv;
var os_1 = require("os");
var path_1 = require("path");
var commands_js_1 = require("../../utils/bash/commands.js");
var shellQuote_js_1 = require("../../utils/bash/shellQuote.js");
var path_js_1 = require("../../utils/path.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var pathValidation_js_1 = require("../../utils/permissions/pathValidation.js");
var bashPermissions_js_1 = require("./bashPermissions.js");
var sedValidation_js_1 = require("./sedValidation.js");
/**
 * Checks if an rm/rmdir command targets dangerous paths that should always
 * require explicit user approval, even if allowlist rules exist.
 * This prevents catastrophic data loss from commands like `rm -rf /`.
 */
function checkDangerousRemovalPaths(command, args, cwd) {
    // Extract paths using the existing path extractor
    var extractor = exports.PATH_EXTRACTORS[command];
    var paths = extractor(args);
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var path = paths_1[_i];
        // Expand tilde and resolve to absolute path
        // NOTE: We check the path WITHOUT resolving symlinks, because dangerous paths
        // like /tmp should be caught even though /tmp is a symlink to /private/tmp on macOS
        var cleanPath = (0, pathValidation_js_1.expandTilde)(path.replace(/^['"]|['"]$/g, ''));
        var absolutePath = (0, path_1.isAbsolute)(cleanPath)
            ? cleanPath
            : (0, path_1.resolve)(cwd, cleanPath);
        // Check if this is a dangerous path (using the non-symlink-resolved path)
        if ((0, pathValidation_js_1.isDangerousRemovalPath)(absolutePath)) {
            return {
                behavior: 'ask',
                message: "Dangerous ".concat(command, " operation detected: '").concat(absolutePath, "'\n\nThis command would remove a critical system directory. This requires explicit approval and cannot be auto-allowed by permission rules."),
                decisionReason: {
                    type: 'other',
                    reason: "Dangerous ".concat(command, " operation on critical path: ").concat(absolutePath),
                },
                // Don't provide suggestions - we don't want to encourage saving dangerous commands
                suggestions: [],
            };
        }
    }
    // No dangerous paths found
    return {
        behavior: 'passthrough',
        message: "No dangerous removals detected for ".concat(command, " command"),
    };
}
/**
 * SECURITY: Extract positional (non-flag) arguments, correctly handling the
 * POSIX `--` end-of-options delimiter.
 *
 * Most commands (rm, cat, touch, etc.) stop parsing options at `--` and treat
 * ALL subsequent arguments as positional, even if they start with `-`. Naive
 * `!arg.startsWith('-')` filtering drops these, causing path validation to be
 * silently skipped for attack payloads like:
 *
 *   rm -- -/../.claude/settings.local.json
 *
 * Here `-/../.claude/settings.local.json` starts with `-` so the naive filter
 * drops it, validation sees zero paths, returns passthrough, and the file is
 * deleted without a prompt. With `--` handling, the path IS extracted and
 * validated (blocked by isClaudeConfigFilePath / pathInAllowedWorkingPath).
 */
function filterOutFlags(args) {
    var result = [];
    var afterDoubleDash = false;
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        if (afterDoubleDash) {
            result.push(arg);
        }
        else if (arg === '--') {
            afterDoubleDash = true;
        }
        else if (!(arg === null || arg === void 0 ? void 0 : arg.startsWith('-'))) {
            result.push(arg);
        }
    }
    return result;
}
// Helper: Parse grep/rg style commands (pattern then paths)
function parsePatternCommand(args, flagsWithArgs, defaults) {
    if (defaults === void 0) { defaults = []; }
    var paths = [];
    var patternFound = false;
    // SECURITY: Track `--` end-of-options delimiter. After `--`, all args are
    // positional regardless of leading `-`. See filterOutFlags() doc comment.
    var afterDoubleDash = false;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg === undefined || arg === null)
            continue;
        if (!afterDoubleDash && arg === '--') {
            afterDoubleDash = true;
            continue;
        }
        if (!afterDoubleDash && arg.startsWith('-')) {
            var flag = arg.split('=')[0];
            // Pattern flags mark that we've found the pattern
            if (flag && ['-e', '--regexp', '-f', '--file'].includes(flag)) {
                patternFound = true;
            }
            // Skip next arg if flag needs it
            if (flag && flagsWithArgs.has(flag) && !arg.includes('=')) {
                i++;
            }
            continue;
        }
        // First non-flag is pattern, rest are paths
        if (!patternFound) {
            patternFound = true;
            continue;
        }
        paths.push(arg);
    }
    return paths.length > 0 ? paths : defaults;
}
/**
 * Extracts paths from command arguments for different path commands.
 * Each command has specific logic for how it handles paths and flags.
 */
exports.PATH_EXTRACTORS = {
    // cd: special case - all args form one path
    cd: function (args) { return (args.length === 0 ? [(0, os_1.homedir)()] : [args.join(' ')]); },
    // ls: filter flags, default to current dir
    ls: function (args) {
        var paths = filterOutFlags(args);
        return paths.length > 0 ? paths : ['.'];
    },
    // find: collect paths until hitting a real flag, also check path-taking flags
    // SECURITY: `find -- -path` makes `-path` a starting point (not a predicate).
    // GNU find supports `--` to allow search roots starting with `-`. After `--`,
    // we conservatively collect all remaining args as paths to validate. This
    // over-includes predicates like `-name foo`, but find is a read-only op and
    // predicates resolve to paths within cwd (allowed), so no false blocks for
    // legitimate use. The over-inclusion ensures attack paths like
    // `find -- -/../../etc` are caught.
    find: function (args) {
        var paths = [];
        var pathFlags = new Set([
            '-newer',
            '-anewer',
            '-cnewer',
            '-mnewer',
            '-samefile',
            '-path',
            '-wholename',
            '-ilname',
            '-lname',
            '-ipath',
            '-iwholename',
        ]);
        var newerPattern = /^-newer[acmBt][acmtB]$/;
        var foundNonGlobalFlag = false;
        var afterDoubleDash = false;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (!arg)
                continue;
            if (afterDoubleDash) {
                paths.push(arg);
                continue;
            }
            if (arg === '--') {
                afterDoubleDash = true;
                continue;
            }
            // Handle flags
            if (arg.startsWith('-')) {
                // Global options don't stop collection
                if (['-H', '-L', '-P'].includes(arg))
                    continue;
                // Mark that we've seen a non-global flag
                foundNonGlobalFlag = true;
                // Check if this flag takes a path argument
                if (pathFlags.has(arg) || newerPattern.test(arg)) {
                    var nextArg = args[i + 1];
                    if (nextArg) {
                        paths.push(nextArg);
                        i++; // Skip the path we just processed
                    }
                }
                continue;
            }
            // Only collect non-flag arguments before first non-global flag
            if (!foundNonGlobalFlag) {
                paths.push(arg);
            }
        }
        return paths.length > 0 ? paths : ['.'];
    },
    // All simple commands: just filter out flags
    mkdir: filterOutFlags,
    touch: filterOutFlags,
    rm: filterOutFlags,
    rmdir: filterOutFlags,
    mv: filterOutFlags,
    cp: filterOutFlags,
    cat: filterOutFlags,
    head: filterOutFlags,
    tail: filterOutFlags,
    sort: filterOutFlags,
    uniq: filterOutFlags,
    wc: filterOutFlags,
    cut: filterOutFlags,
    paste: filterOutFlags,
    column: filterOutFlags,
    file: filterOutFlags,
    stat: filterOutFlags,
    diff: filterOutFlags,
    awk: filterOutFlags,
    strings: filterOutFlags,
    hexdump: filterOutFlags,
    od: filterOutFlags,
    base64: filterOutFlags,
    nl: filterOutFlags,
    sha256sum: filterOutFlags,
    sha1sum: filterOutFlags,
    md5sum: filterOutFlags,
    // tr: special case - skip character sets
    tr: function (args) {
        var hasDelete = args.some(function (a) {
            return a === '-d' ||
                a === '--delete' ||
                (a.startsWith('-') && a.includes('d'));
        });
        var nonFlags = filterOutFlags(args);
        return nonFlags.slice(hasDelete ? 1 : 2); // Skip SET1 or SET1+SET2
    },
    // grep: pattern then paths, defaults to stdin
    grep: function (args) {
        var flags = new Set([
            '-e',
            '--regexp',
            '-f',
            '--file',
            '--exclude',
            '--include',
            '--exclude-dir',
            '--include-dir',
            '-m',
            '--max-count',
            '-A',
            '--after-context',
            '-B',
            '--before-context',
            '-C',
            '--context',
        ]);
        var paths = parsePatternCommand(args, flags);
        // Special: if -r/-R flag present and no paths, use current dir
        if (paths.length === 0 &&
            args.some(function (a) { return ['-r', '-R', '--recursive'].includes(a); })) {
            return ['.'];
        }
        return paths;
    },
    // rg: pattern then paths, defaults to current dir
    rg: function (args) {
        var flags = new Set([
            '-e',
            '--regexp',
            '-f',
            '--file',
            '-t',
            '--type',
            '-T',
            '--type-not',
            '-g',
            '--glob',
            '-m',
            '--max-count',
            '--max-depth',
            '-r',
            '--replace',
            '-A',
            '--after-context',
            '-B',
            '--before-context',
            '-C',
            '--context',
        ]);
        return parsePatternCommand(args, flags, ['.']);
    },
    // sed: processes files in-place or reads from stdin
    sed: function (args) {
        var paths = [];
        var skipNext = false;
        var scriptFound = false;
        // SECURITY: Track `--` end-of-options delimiter. After `--`, all args are
        // positional regardless of leading `-`. See filterOutFlags() doc comment.
        var afterDoubleDash = false;
        for (var i = 0; i < args.length; i++) {
            if (skipNext) {
                skipNext = false;
                continue;
            }
            var arg = args[i];
            if (!arg)
                continue;
            if (!afterDoubleDash && arg === '--') {
                afterDoubleDash = true;
                continue;
            }
            // Handle flags (only before `--`)
            if (!afterDoubleDash && arg.startsWith('-')) {
                // -f flag: next arg is a script file that needs validation
                if (['-f', '--file'].includes(arg)) {
                    var scriptFile = args[i + 1];
                    if (scriptFile) {
                        paths.push(scriptFile); // Add script file to paths for validation
                        skipNext = true;
                    }
                    scriptFound = true;
                }
                // -e flag: next arg is expression, not a file
                else if (['-e', '--expression'].includes(arg)) {
                    skipNext = true;
                    scriptFound = true;
                }
                // Combined flags like -ie or -nf
                else if (arg.includes('e') || arg.includes('f')) {
                    scriptFound = true;
                }
                continue;
            }
            // First non-flag is the script (if not already found via -e/-f)
            if (!scriptFound) {
                scriptFound = true;
                continue;
            }
            // Rest are file paths
            paths.push(arg);
        }
        return paths;
    },
    // jq: filter then file paths (similar to grep)
    // The jq command structure is: jq [flags] filter [files...]
    // If no files are provided, jq reads from stdin
    jq: function (args) {
        var paths = [];
        var flagsWithArgs = new Set([
            '-e',
            '--expression',
            '-f',
            '--from-file',
            '--arg',
            '--argjson',
            '--slurpfile',
            '--rawfile',
            '--args',
            '--jsonargs',
            '-L',
            '--library-path',
            '--indent',
            '--tab',
        ]);
        var filterFound = false;
        // SECURITY: Track `--` end-of-options delimiter. After `--`, all args are
        // positional regardless of leading `-`. See filterOutFlags() doc comment.
        var afterDoubleDash = false;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg === undefined || arg === null)
                continue;
            if (!afterDoubleDash && arg === '--') {
                afterDoubleDash = true;
                continue;
            }
            if (!afterDoubleDash && arg.startsWith('-')) {
                var flag = arg.split('=')[0];
                // Pattern flags mark that we've found the filter
                if (flag && ['-e', '--expression'].includes(flag)) {
                    filterFound = true;
                }
                // Skip next arg if flag needs it
                if (flag && flagsWithArgs.has(flag) && !arg.includes('=')) {
                    i++;
                }
                continue;
            }
            // First non-flag is filter, rest are file paths
            if (!filterFound) {
                filterFound = true;
                continue;
            }
            paths.push(arg);
        }
        // If no file paths, jq reads from stdin (no paths to validate)
        return paths;
    },
    // git: handle subcommands that access arbitrary files outside the repository
    git: function (args) {
        // git diff --no-index is special - it explicitly compares files outside git's control
        // This flag allows git diff to compare any two files on the filesystem, not just
        // files within the repository, which is why it needs path validation
        if (args.length >= 1 && args[0] === 'diff') {
            if (args.includes('--no-index')) {
                // SECURITY: git diff --no-index accepts `--` before file paths.
                // Use filterOutFlags which handles `--` correctly instead of naive
                // startsWith('-') filtering, to catch paths like `-/../etc/passwd`.
                var filePaths = filterOutFlags(args.slice(1));
                return filePaths.slice(0, 2); // git diff --no-index expects exactly 2 paths
            }
        }
        // Other git commands (add, rm, mv, show, etc.) operate within the repository context
        // and are already constrained by git's own security model, so they don't need
        // additional path validation
        return [];
    },
};
var SUPPORTED_PATH_COMMANDS = Object.keys(exports.PATH_EXTRACTORS);
var ACTION_VERBS = {
    cd: 'change directories to',
    ls: 'list files in',
    find: 'search files in',
    mkdir: 'create directories in',
    touch: 'create or modify files in',
    rm: 'remove files from',
    rmdir: 'remove directories from',
    mv: 'move files to/from',
    cp: 'copy files to/from',
    cat: 'concatenate files from',
    head: 'read the beginning of files from',
    tail: 'read the end of files from',
    sort: 'sort contents of files from',
    uniq: 'filter duplicate lines from files in',
    wc: 'count lines/words/bytes in files from',
    cut: 'extract columns from files in',
    paste: 'merge files from',
    column: 'format files from',
    tr: 'transform text from files in',
    file: 'examine file types in',
    stat: 'read file stats from',
    diff: 'compare files from',
    awk: 'process text from files in',
    strings: 'extract strings from files in',
    hexdump: 'display hex dump of files from',
    od: 'display octal dump of files from',
    base64: 'encode/decode files from',
    nl: 'number lines in files from',
    grep: 'search for patterns in files from',
    rg: 'search for patterns in files from',
    sed: 'edit files in',
    git: 'access files with git from',
    jq: 'process JSON from files in',
    sha256sum: 'compute SHA-256 checksums for files in',
    sha1sum: 'compute SHA-1 checksums for files in',
    md5sum: 'compute MD5 checksums for files in',
};
exports.COMMAND_OPERATION_TYPE = {
    cd: 'read',
    ls: 'read',
    find: 'read',
    mkdir: 'create',
    touch: 'create',
    rm: 'write',
    rmdir: 'write',
    mv: 'write',
    cp: 'write',
    cat: 'read',
    head: 'read',
    tail: 'read',
    sort: 'read',
    uniq: 'read',
    wc: 'read',
    cut: 'read',
    paste: 'read',
    column: 'read',
    tr: 'read',
    file: 'read',
    stat: 'read',
    diff: 'read',
    awk: 'read',
    strings: 'read',
    hexdump: 'read',
    od: 'read',
    base64: 'read',
    nl: 'read',
    grep: 'read',
    rg: 'read',
    sed: 'write',
    git: 'read',
    jq: 'read',
    sha256sum: 'read',
    sha1sum: 'read',
    md5sum: 'read',
};
/**
 * Command-specific validators that run before path validation.
 * Returns true if the command is valid, false if it should be rejected.
 * Used to block commands with flags that could bypass path validation.
 */
var COMMAND_VALIDATOR = {
    mv: function (args) { return !args.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.startsWith('-'); }); },
    cp: function (args) { return !args.some(function (arg) { return arg === null || arg === void 0 ? void 0 : arg.startsWith('-'); }); },
};
function validateCommandPaths(command, args, cwd, toolPermissionContext, compoundCommandHasCd, operationTypeOverride) {
    var extractor = exports.PATH_EXTRACTORS[command];
    var paths = extractor(args);
    var operationType = operationTypeOverride !== null && operationTypeOverride !== void 0 ? operationTypeOverride : exports.COMMAND_OPERATION_TYPE[command];
    // SECURITY: Check command-specific validators (e.g., to block flags that could bypass path validation)
    // Some commands like mv/cp have flags (--target-directory=PATH) that can bypass path extraction,
    // so we block ALL flags for these commands to ensure security.
    var validator = COMMAND_VALIDATOR[command];
    if (validator && !validator(args)) {
        return {
            behavior: 'ask',
            message: "".concat(command, " with flags requires manual approval to ensure path safety. For security, Claude Code cannot automatically validate ").concat(command, " commands that use flags, as some flags like --target-directory=PATH can bypass path validation."),
            decisionReason: {
                type: 'other',
                reason: "".concat(command, " command with flags requires manual approval"),
            },
        };
    }
    // SECURITY: Block write operations in compound commands containing 'cd'
    // This prevents bypassing path safety checks via directory changes before operations.
    // Example attack: cd .claude/ && mv test.txt settings.json
    // This would bypass the check for .claude/settings.json because paths are resolved
    // relative to the original CWD, not accounting for the cd's effect.
    //
    // ALTERNATIVE APPROACH: Instead of blocking all writes with cd, we could track the
    // effective CWD through the command chain (e.g., after "cd .claude/", subsequent
    // commands would be validated with CWD=".claude/"). This would be more permissive
    // but requires careful handling of:
    // - Relative paths (cd ../foo)
    // - Special cd targets (cd ~, cd -, cd with no args)
    // - Multiple cd commands in sequence
    // - Error cases where cd target cannot be determined
    // For now, we take the conservative approach of requiring manual approval.
    if (compoundCommandHasCd && operationType !== 'read') {
        return {
            behavior: 'ask',
            message: "Commands that change directories and perform write operations require explicit approval to ensure paths are evaluated correctly. For security, Claude Code cannot automatically determine the final working directory when 'cd' is used in compound commands.",
            decisionReason: {
                type: 'other',
                reason: 'Compound command contains cd with write operation - manual approval required to prevent path resolution bypass',
            },
        };
    }
    for (var _i = 0, paths_2 = paths; _i < paths_2.length; _i++) {
        var path = paths_2[_i];
        var _a = (0, pathValidation_js_1.validatePath)(path, cwd, toolPermissionContext, operationType), allowed = _a.allowed, resolvedPath = _a.resolvedPath, decisionReason = _a.decisionReason;
        if (!allowed) {
            var workingDirs = Array.from((0, filesystem_js_1.allWorkingDirectories)(toolPermissionContext));
            var dirListStr = (0, pathValidation_js_1.formatDirectoryList)(workingDirs);
            // Use security check's custom reason if available (type: 'other' or 'safetyCheck')
            // Otherwise use the standard "was blocked" message
            var message = (decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'other' ||
                (decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'safetyCheck'
                ? decisionReason.reason
                : "".concat(command, " in '").concat(resolvedPath, "' was blocked. For security, Claude Code may only ").concat(ACTION_VERBS[command], " the allowed working directories for this session: ").concat(dirListStr, ".");
            if ((decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'rule') {
                return {
                    behavior: 'deny',
                    message: message,
                    decisionReason: decisionReason,
                };
            }
            return {
                behavior: 'ask',
                message: message,
                blockedPath: resolvedPath,
                decisionReason: decisionReason,
            };
        }
    }
    // All paths are valid - return passthrough
    return {
        behavior: 'passthrough',
        message: "Path validation passed for ".concat(command, " command"),
    };
}
function createPathChecker(command, operationTypeOverride) {
    return function (args, cwd, context, compoundCommandHasCd) {
        // First check normal path validation (which includes explicit deny rules)
        var result = validateCommandPaths(command, args, cwd, context, compoundCommandHasCd, operationTypeOverride);
        // If explicitly denied, respect that (don't override with dangerous path message)
        if (result.behavior === 'deny') {
            return result;
        }
        // Check for dangerous removal paths AFTER explicit deny rules but BEFORE other results
        // This ensures the check runs even if the user has allowlist rules or if glob patterns
        // were rejected, but respects explicit deny rules. Dangerous patterns get a specific
        // error message that overrides generic glob pattern rejection messages.
        if (command === 'rm' || command === 'rmdir') {
            var dangerousPathResult = checkDangerousRemovalPaths(command, args, cwd);
            if (dangerousPathResult.behavior !== 'passthrough') {
                return dangerousPathResult;
            }
        }
        // If it's a passthrough, return it directly
        if (result.behavior === 'passthrough') {
            return result;
        }
        // If it's an ask decision, add suggestions based on the operation type
        if (result.behavior === 'ask') {
            var operationType = operationTypeOverride !== null && operationTypeOverride !== void 0 ? operationTypeOverride : exports.COMMAND_OPERATION_TYPE[command];
            var suggestions = [];
            // Only suggest adding directory/rules if we have a blocked path
            if (result.blockedPath) {
                if (operationType === 'read') {
                    // For read operations, suggest a Read rule for the directory (only if it exists)
                    var dirPath = (0, path_js_1.getDirectoryForPath)(result.blockedPath);
                    var suggestion = (0, PermissionUpdate_js_1.createReadRuleSuggestion)(dirPath, 'session');
                    if (suggestion) {
                        suggestions.push(suggestion);
                    }
                }
                else {
                    // For write/create operations, suggest adding the directory
                    suggestions.push({
                        type: 'addDirectories',
                        directories: [(0, path_js_1.getDirectoryForPath)(result.blockedPath)],
                        destination: 'session',
                    });
                }
            }
            // For write operations, also suggest enabling accept-edits mode
            if (operationType === 'write' || operationType === 'create') {
                suggestions.push({
                    type: 'setMode',
                    mode: 'acceptEdits',
                    destination: 'session',
                });
            }
            result.suggestions = suggestions;
        }
        // Return the decision directly
        return result;
    };
}
/**
 * Parses command arguments using shell-quote, converting glob objects to strings.
 * This is necessary because shell-quote parses patterns like *.txt as glob objects,
 * but we need them as strings for path validation.
 */
function parseCommandArguments(cmd) {
    var parseResult = (0, shellQuote_js_1.tryParseShellCommand)(cmd, function (env) { return "$".concat(env); });
    if (!parseResult.success) {
        // Malformed shell syntax, return empty array
        return [];
    }
    var parsed = parseResult.tokens;
    var extractedArgs = [];
    for (var _i = 0, parsed_1 = parsed; _i < parsed_1.length; _i++) {
        var arg = parsed_1[_i];
        if (typeof arg === 'string') {
            // Include empty strings - they're valid arguments (e.g., grep "" /tmp/t)
            extractedArgs.push(arg);
        }
        else if (typeof arg === 'object' &&
            arg !== null &&
            'op' in arg &&
            arg.op === 'glob' &&
            'pattern' in arg) {
            // shell-quote parses glob patterns as objects, but we need them as strings for validation
            extractedArgs.push(String(arg.pattern));
        }
    }
    return extractedArgs;
}
/**
 * Validates a single command for path constraints and shell safety.
 *
 * This function:
 * 1. Parses the command arguments
 * 2. Checks if it's a path command (cd, ls, find)
 * 3. Validates for shell injection patterns
 * 4. Validates all paths are within allowed directories
 *
 * @param cmd - The command string to validate
 * @param cwd - Current working directory
 * @param toolPermissionContext - Context containing allowed directories
 * @param compoundCommandHasCd - Whether the full compound command contains a cd
 * @returns PermissionResult - 'passthrough' if not a path command, otherwise validation result
 */
function validateSinglePathCommand(cmd, cwd, toolPermissionContext, compoundCommandHasCd) {
    // SECURITY: Strip wrapper commands (timeout, nice, nohup, time) before extracting
    // the base command. Without this, dangerous commands wrapped with these utilities
    // would bypass path validation since the wrapper command (e.g., 'timeout') would
    // be checked instead of the actual command (e.g., 'rm').
    // Example: 'timeout 10 rm -rf /' would otherwise see 'timeout' as the base command.
    var strippedCmd = (0, bashPermissions_js_1.stripSafeWrappers)(cmd);
    // Parse command into arguments, handling quotes and globs
    var extractedArgs = parseCommandArguments(strippedCmd);
    if (extractedArgs.length === 0) {
        return {
            behavior: 'passthrough',
            message: 'Empty command - no paths to validate',
        };
    }
    // Check if this is a path command we need to validate
    var baseCmd = extractedArgs[0], args = extractedArgs.slice(1);
    if (!baseCmd || !SUPPORTED_PATH_COMMANDS.includes(baseCmd)) {
        return {
            behavior: 'passthrough',
            message: "Command '".concat(baseCmd, "' is not a path-restricted command"),
        };
    }
    // For read-only sed commands (e.g., sed -n '1,10p' file.txt),
    // validate file paths as read operations instead of write operations.
    // sed is normally classified as 'write' for path validation, but when the
    // command is purely reading (line printing with -n), file args are read-only.
    var operationTypeOverride = baseCmd === 'sed' && (0, sedValidation_js_1.sedCommandIsAllowedByAllowlist)(strippedCmd)
        ? 'read'
        : undefined;
    // Validate all paths are within allowed directories
    var pathChecker = createPathChecker(baseCmd, operationTypeOverride);
    return pathChecker(args, cwd, toolPermissionContext, compoundCommandHasCd);
}
/**
 * Like validateSinglePathCommand but operates on AST-derived argv directly
 * instead of re-parsing the command string with shell-quote. Avoids the
 * shell-quote single-quote backslash bug that causes parseCommandArguments
 * to silently return [] and skip path validation.
 */
function validateSinglePathCommandArgv(cmd, cwd, toolPermissionContext, compoundCommandHasCd) {
    var argv = stripWrappersFromArgv(cmd.argv);
    if (argv.length === 0) {
        return {
            behavior: 'passthrough',
            message: 'Empty command - no paths to validate',
        };
    }
    var baseCmd = argv[0], args = argv.slice(1);
    if (!baseCmd || !SUPPORTED_PATH_COMMANDS.includes(baseCmd)) {
        return {
            behavior: 'passthrough',
            message: "Command '".concat(baseCmd, "' is not a path-restricted command"),
        };
    }
    // sed read-only override: use .text for the allowlist check since
    // sedCommandIsAllowedByAllowlist takes a string. argv is already
    // wrapper-stripped but .text is raw tree-sitter span (includes
    // `timeout 5 ` prefix), so strip here too.
    var operationTypeOverride = baseCmd === 'sed' &&
        (0, sedValidation_js_1.sedCommandIsAllowedByAllowlist)((0, bashPermissions_js_1.stripSafeWrappers)(cmd.text))
        ? 'read'
        : undefined;
    var pathChecker = createPathChecker(baseCmd, operationTypeOverride);
    return pathChecker(args, cwd, toolPermissionContext, compoundCommandHasCd);
}
function validateOutputRedirections(redirections, cwd, toolPermissionContext, compoundCommandHasCd) {
    // SECURITY: Block output redirections in compound commands containing 'cd'
    // This prevents bypassing path safety checks via directory changes before redirections.
    // Example attack: cd .claude/ && echo "malicious" > settings.json
    // The redirection target would be validated relative to the original CWD, but the
    // actual write happens in the changed directory after 'cd' executes.
    if (compoundCommandHasCd && redirections.length > 0) {
        return {
            behavior: 'ask',
            message: "Commands that change directories and write via output redirection require explicit approval to ensure paths are evaluated correctly. For security, Claude Code cannot automatically determine the final working directory when 'cd' is used in compound commands.",
            decisionReason: {
                type: 'other',
                reason: 'Compound command contains cd with output redirection - manual approval required to prevent path resolution bypass',
            },
        };
    }
    for (var _i = 0, redirections_1 = redirections; _i < redirections_1.length; _i++) {
        var target = redirections_1[_i].target;
        // /dev/null is always safe - it discards output
        if (target === '/dev/null') {
            continue;
        }
        var _a = (0, pathValidation_js_1.validatePath)(target, cwd, toolPermissionContext, 'create'), allowed = _a.allowed, resolvedPath = _a.resolvedPath, decisionReason = _a.decisionReason;
        if (!allowed) {
            var workingDirs = Array.from((0, filesystem_js_1.allWorkingDirectories)(toolPermissionContext));
            var dirListStr = (0, pathValidation_js_1.formatDirectoryList)(workingDirs);
            // Use security check's custom reason if available (type: 'other' or 'safetyCheck')
            // Otherwise use the standard message for deny rules or working directory restrictions
            var message = (decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'other' ||
                (decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'safetyCheck'
                ? decisionReason.reason
                : (decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'rule'
                    ? "Output redirection to '".concat(resolvedPath, "' was blocked by a deny rule.")
                    : "Output redirection to '".concat(resolvedPath, "' was blocked. For security, Claude Code may only write to files in the allowed working directories for this session: ").concat(dirListStr, ".");
            // If denied by a deny rule, return 'deny' behavior
            if ((decisionReason === null || decisionReason === void 0 ? void 0 : decisionReason.type) === 'rule') {
                return {
                    behavior: 'deny',
                    message: message,
                    decisionReason: decisionReason,
                };
            }
            return {
                behavior: 'ask',
                message: message,
                blockedPath: resolvedPath,
                decisionReason: decisionReason,
                suggestions: [
                    {
                        type: 'addDirectories',
                        directories: [(0, path_js_1.getDirectoryForPath)(resolvedPath)],
                        destination: 'session',
                    },
                ],
            };
        }
    }
    return {
        behavior: 'passthrough',
        message: 'No unsafe redirections found',
    };
}
/**
 * Checks path constraints for commands that access the filesystem (cd, ls, find).
 * Also validates output redirections to ensure they're within allowed directories.
 *
 * @returns
 * - 'ask' if any path command or redirection tries to access outside allowed directories
 * - 'passthrough' if no path commands were found or if all are within allowed directories
 */
function checkPathConstraints(input, cwd, toolPermissionContext, compoundCommandHasCd, astRedirects, astCommands) {
    // SECURITY: Process substitution >(cmd) can execute commands that write to files
    // without those files appearing as redirect targets. For example:
    //   echo secret > >(tee .git/config)
    // The tee command writes to .git/config but it's not detected as a redirect.
    // Require explicit approval for any command containing process substitution.
    // Skip on AST path — process_substitution is in DANGEROUS_TYPES and
    // already returned too-complex before reaching here.
    if (!astCommands && />>\s*>\s*\(|>\s*>\s*\(|<\s*\(/.test(input.command)) {
        return {
            behavior: 'ask',
            message: 'Process substitution (>(...) or <(...)) can execute arbitrary commands and requires manual approval',
            decisionReason: {
                type: 'other',
                reason: 'Process substitution requires manual approval',
            },
        };
    }
    // SECURITY: When AST-derived redirects are available, use them directly
    // instead of re-parsing with shell-quote. shell-quote has a known
    // single-quote backslash bug that silently merges redirect operators into
    // garbled tokens on a successful parse (not a parse failure, so the
    // fail-closed guard doesn't help). The AST already resolved targets
    // correctly and checkSemantics validated them.
    var _a = astRedirects
        ? astRedirectsToOutputRedirections(astRedirects)
        : (0, commands_js_1.extractOutputRedirections)(input.command), redirections = _a.redirections, hasDangerousRedirection = _a.hasDangerousRedirection;
    // SECURITY: If we found a redirection operator with a target containing shell expansion
    // syntax ($VAR or %VAR%), require manual approval since the target can't be safely validated.
    if (hasDangerousRedirection) {
        return {
            behavior: 'ask',
            message: 'Shell expansion syntax in paths requires manual approval',
            decisionReason: {
                type: 'other',
                reason: 'Shell expansion syntax in paths requires manual approval',
            },
        };
    }
    var redirectionResult = validateOutputRedirections(redirections, cwd, toolPermissionContext, compoundCommandHasCd);
    if (redirectionResult.behavior !== 'passthrough') {
        return redirectionResult;
    }
    // SECURITY: When AST-derived commands are available, iterate them with
    // pre-parsed argv instead of re-parsing via splitCommand_DEPRECATED + shell-quote.
    // shell-quote has a single-quote backslash bug that causes
    // parseCommandArguments to silently return [] and skip path validation
    // (isDangerousRemovalPath etc). The AST already resolved argv correctly.
    if (astCommands) {
        for (var _i = 0, astCommands_1 = astCommands; _i < astCommands_1.length; _i++) {
            var cmd = astCommands_1[_i];
            var result = validateSinglePathCommandArgv(cmd, cwd, toolPermissionContext, compoundCommandHasCd);
            if (result.behavior === 'ask' || result.behavior === 'deny') {
                return result;
            }
        }
    }
    else {
        var commands = (0, commands_js_1.splitCommand_DEPRECATED)(input.command);
        for (var _b = 0, commands_1 = commands; _b < commands_1.length; _b++) {
            var cmd = commands_1[_b];
            var result = validateSinglePathCommand(cmd, cwd, toolPermissionContext, compoundCommandHasCd);
            if (result.behavior === 'ask' || result.behavior === 'deny') {
                return result;
            }
        }
    }
    // Always return passthrough to let other permission checks handle the command
    return {
        behavior: 'passthrough',
        message: 'All path commands validated successfully',
    };
}
/**
 * Convert AST-derived Redirect[] to the format expected by
 * validateOutputRedirections. Filters to output-only redirects (excluding
 * fd duplications like 2>&1) and maps operators to '>' | '>>'.
 */
function astRedirectsToOutputRedirections(redirects) {
    var redirections = [];
    for (var _i = 0, redirects_1 = redirects; _i < redirects_1.length; _i++) {
        var r = redirects_1[_i];
        switch (r.op) {
            case '>':
            case '>|':
            case '&>':
                redirections.push({ target: r.target, operator: '>' });
                break;
            case '>>':
            case '&>>':
                redirections.push({ target: r.target, operator: '>>' });
                break;
            case '>&':
                // >&N (digits only) is fd duplication (e.g. 2>&1, >&10), not a file
                // write. >&file is the deprecated form of &>file (redirect to file).
                if (!/^\d+$/.test(r.target)) {
                    redirections.push({ target: r.target, operator: '>' });
                }
                break;
            case '<':
            case '<<':
            case '<&':
            case '<<<':
                // input redirects — skip
                break;
        }
    }
    // AST targets are fully resolved (no shell expansion) — checkSemantics
    // already validated them. No dangerous redirections are possible.
    return { redirections: redirections, hasDangerousRedirection: false };
}
// ───────────────────────────────────────────────────────────────────────────
// Argv-level safe-wrapper stripping (timeout, nice, stdbuf, env, time, nohup)
//
// This is the CANONICAL stripWrappersFromArgv. bashPermissions.ts still
// exports an older narrower copy (timeout/nice-n-N only) that is DEAD CODE
// — no prod consumer — but CANNOT be removed: bashPermissions.ts is right
// at Bun's feature() DCE complexity threshold, and deleting ~80 lines from
// that module silently breaks feature('BASH_CLASSIFIER') evaluation (drops
// every pendingClassifierCheck spread). Verified in PR #21503 round 3:
// baseline classifier tests 30/30 pass, after deletion 22/30 fail. See
// team memory: bun-feature-dce-cliff.md. Hit 3× in PR #21075 + twice in
// #21503. The expanded version lives here (the only prod consumer) instead.
//
// KEEP IN SYNC with:
//   - SAFE_WRAPPER_PATTERNS in bashPermissions.ts (text-based stripSafeWrappers)
//   - the wrapper-stripping loop in checkSemantics (src/utils/bash/ast.ts ~1860)
// If you add a wrapper in either, add it here too. Asymmetry means
// checkSemantics exposes the wrapped command to semantic checks but path
// validation sees the wrapper name → passthrough → wrapped paths never
// validated (PR #21503 review comment 2907319120).
// ───────────────────────────────────────────────────────────────────────────
// SECURITY: allowlist for timeout flag VALUES (signals are TERM/KILL/9,
// durations are 5/5s/10.5). Rejects $ ( ) ` | ; & and newlines that
// previously matched via [^ \t]+ — `timeout -k$(id) 10 ls` must NOT strip.
var TIMEOUT_FLAG_VALUE_RE = /^[A-Za-z0-9_.+-]+$/;
/**
 * Parse timeout's GNU flags (long + short, fused + space-separated) and
 * return the argv index of the DURATION token, or -1 if flags are unparseable.
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
 * Parse stdbuf's flags (-i/-o/-e in fused/space-separated/long-= forms).
 * Returns argv index of wrapped COMMAND, or -1 if unparseable or no flags
 * consumed (stdbuf without flags is inert). Mirrors checkSemantics (ast.ts).
 */
function skipStdbufFlags(a) {
    var i = 1;
    while (i < a.length) {
        var arg = a[i];
        if (/^-[ioe]$/.test(arg) && a[i + 1])
            i += 2;
        else if (/^-[ioe]./.test(arg))
            i++;
        else if (/^--(input|output|error)=/.test(arg))
            i++;
        else if (arg.startsWith('-'))
            return -1; // unknown flag: fail closed
        else
            break;
    }
    return i > 1 && i < a.length ? i : -1;
}
/**
 * Parse env's VAR=val and safe flags (-i/-0/-v/-u NAME). Returns argv index
 * of wrapped COMMAND, or -1 if unparseable/no wrapped cmd. Rejects -S (argv
 * splitter), -C/-P (altwd/altpath). Mirrors checkSemantics (ast.ts).
 */
function skipEnvFlags(a) {
    var i = 1;
    while (i < a.length) {
        var arg = a[i];
        if (arg.includes('=') && !arg.startsWith('-'))
            i++;
        else if (arg === '-i' || arg === '-0' || arg === '-v')
            i++;
        else if (arg === '-u' && a[i + 1])
            i += 2;
        else if (arg.startsWith('-'))
            return -1; // -S/-C/-P/unknown: fail closed
        else
            break;
    }
    return i < a.length ? i : -1;
}
/**
 * Argv-level counterpart to stripSafeWrappers (bashPermissions.ts). Strips
 * wrapper commands from AST-derived argv. Env vars are already separated
 * into SimpleCommand.envVars so no env-var stripping here.
 */
function stripWrappersFromArgv(argv) {
    var a = argv;
    for (;;) {
        if (a[0] === 'time' || a[0] === 'nohup') {
            a = a.slice(a[1] === '--' ? 2 : 1);
        }
        else if (a[0] === 'timeout') {
            var i = skipTimeoutFlags(a);
            // SECURITY (PR #21503 round 3): unrecognized duration (`.5`, `+5`,
            // `inf` — strtod formats GNU timeout accepts) → return a unchanged.
            // Safe because checkSemantics (ast.ts) fails CLOSED on the same input
            // and runs first in bashToolHasPermission, so we never reach here.
            if (i < 0 || !a[i] || !/^\d+(?:\.\d+)?[smhd]?$/.test(a[i]))
                return a;
            a = a.slice(i + 1);
        }
        else if (a[0] === 'nice') {
            // SECURITY (PR #21503 round 3): mirror checkSemantics — handle bare
            // `nice cmd` and legacy `nice -N cmd`, not just `nice -n N cmd`.
            // Previously only `-n N` was stripped: `nice rm /outside` →
            // baseCmd='nice' → passthrough → /outside never path-validated.
            if (a[1] === '-n' && a[2] && /^-?\d+$/.test(a[2]))
                a = a.slice(a[3] === '--' ? 4 : 3);
            else if (a[1] && /^-\d+$/.test(a[1]))
                a = a.slice(a[2] === '--' ? 3 : 2);
            else
                a = a.slice(a[1] === '--' ? 2 : 1);
        }
        else if (a[0] === 'stdbuf') {
            // SECURITY (PR #21503 round 3): PR-WIDENED. Pre-PR, `stdbuf -o0 -eL rm`
            // was rejected by fragment check (old checkSemantics slice(2) left
            // name='-eL'). Post-PR, checkSemantics strips both flags → name='rm'
            // → passes. But stripWrappersFromArgv returned unchanged →
            // baseCmd='stdbuf' → not in SUPPORTED_PATH_COMMANDS → passthrough.
            var i = skipStdbufFlags(a);
            if (i < 0)
                return a;
            a = a.slice(i);
        }
        else if (a[0] === 'env') {
            // Same asymmetry: checkSemantics strips env, we didn't.
            var i = skipEnvFlags(a);
            if (i < 0)
                return a;
            a = a.slice(i);
        }
        else {
            return a;
        }
    }
}
