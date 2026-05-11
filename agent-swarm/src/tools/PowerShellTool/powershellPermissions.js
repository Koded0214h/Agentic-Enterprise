"use strict";
/**
 * PowerShell-specific permission checking, adapted from bashPermissions.ts
 * for case-insensitive cmdlet matching.
 */
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
exports.powershellPermissionRule = powershellPermissionRule;
exports.powershellToolCheckExactMatchPermission = powershellToolCheckExactMatchPermission;
exports.powershellToolCheckPermission = powershellToolCheckPermission;
exports.powershellToolHasPermission = powershellToolHasPermission;
var path_1 = require("path");
var cwd_js_1 = require("../../utils/cwd.js");
var git_js_1 = require("../../utils/git.js");
var permissions_js_1 = require("../../utils/permissions/permissions.js");
var shellRuleMatching_js_1 = require("../../utils/permissions/shellRuleMatching.js");
var parser_js_1 = require("../../utils/powershell/parser.js");
var readOnlyCommandValidation_js_1 = require("../../utils/shell/readOnlyCommandValidation.js");
var gitSafety_js_1 = require("./gitSafety.js");
var modeValidation_js_1 = require("./modeValidation.js");
var pathValidation_js_1 = require("./pathValidation.js");
var powershellSecurity_js_1 = require("./powershellSecurity.js");
var readOnlyValidation_js_1 = require("./readOnlyValidation.js");
var toolName_js_1 = require("./toolName.js");
// Matches `$var = `, `$var += `, `$env:X = `, `$x ??= ` etc. Used to strip
// nested assignment prefixes in the parse-failed fallback path.
var PS_ASSIGN_PREFIX_RE = /^\$[\w:]+\s*(?:[+\-*/%]|\?\?)?\s*=\s*/;
/**
 * Cmdlets that can place a file at a caller-specified path. The
 * git-internal-paths guard checks whether any arg is a git-internal path
 * (hooks/, refs/, objects/, HEAD). Non-creating writers (remove-item,
 * clear-content) are intentionally absent — they can't plant new hooks.
 */
var GIT_SAFETY_WRITE_CMDLETS = new Set([
    'new-item',
    'set-content',
    'add-content',
    'out-file',
    'copy-item',
    'move-item',
    'rename-item',
    'expand-archive',
    'invoke-webrequest',
    'invoke-restmethod',
    'tee-object',
    'export-csv',
    'export-clixml',
]);
/**
 * External archive-extraction applications that write files to cwd with
 * archive-controlled paths. `tar -xf payload.tar; git status` defeats
 * isCurrentDirectoryBareGitRepo (TOCTOU): the check runs at
 * permission-eval time, tar extracts HEAD/hooks/refs/ AFTER the check and
 * BEFORE git runs. Unlike GIT_SAFETY_WRITE_CMDLETS (where we can inspect
 * args for git-internal paths), archive contents are opaque — any
 * extraction preceding git must ask. Matched by name only (lowercase,
 * with and without .exe).
 */
var GIT_SAFETY_ARCHIVE_EXTRACTORS = new Set([
    'tar',
    'tar.exe',
    'bsdtar',
    'bsdtar.exe',
    'unzip',
    'unzip.exe',
    '7z',
    '7z.exe',
    '7za',
    '7za.exe',
    'gzip',
    'gzip.exe',
    'gunzip',
    'gunzip.exe',
    'expand-archive',
]);
/**
 * Extract the command name from a PowerShell command string.
 * Uses the parser to get the first command name from the AST.
 */
function extractCommandName(command) {
    return __awaiter(this, void 0, void 0, function () {
        var trimmed, parsed, names;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmed = command.trim();
                    if (!trimmed) {
                        return [2 /*return*/, ''];
                    }
                    return [4 /*yield*/, (0, parser_js_1.parsePowerShellCommand)(trimmed)];
                case 1:
                    parsed = _b.sent();
                    names = (0, parser_js_1.getAllCommandNames)(parsed);
                    return [2 /*return*/, (_a = names[0]) !== null && _a !== void 0 ? _a : ''];
            }
        });
    });
}
/**
 * Parse a permission rule string into a structured rule object.
 * Delegates to shared parsePermissionRule.
 */
function powershellPermissionRule(permissionRule) {
    return (0, shellRuleMatching_js_1.parsePermissionRule)(permissionRule);
}
/**
 * Generate permission update suggestion for exact command match.
 *
 * Skip exact-command suggestion for commands that can't round-trip cleanly:
 * - Multi-line: newlines don't survive normalization, rule would never match
 * - Literal *: storing `Remove-Item * -Force` verbatim re-parses as a wildcard
 *   rule via hasWildcards() (matches `^Remove-Item .* -Force$`). Escaping to
 *   `\*` creates a dead rule — parsePermissionRule's exact branch returns the
 *   raw string with backslash intact, so `Remove-Item \* -Force` never matches
 *   the incoming `Remove-Item * -Force`. Globs are unsafe to exact-auto-allow
 *   anyway; prefix suggestion still offered. (finding #12)
 */
function suggestionForExactCommand(command) {
    if (command.includes('\n') || command.includes('*')) {
        return [];
    }
    return (0, shellRuleMatching_js_1.suggestionForExactCommand)(toolName_js_1.POWERSHELL_TOOL_NAME, command);
}
/**
 * Filter rules by contents matching an input command.
 * PowerShell-specific: uses case-insensitive matching throughout.
 * Follows the same structure as BashTool's local filterRulesByContentsMatchingInput.
 */
function filterRulesByContentsMatchingInput(input, rules, matchMode, behavior) {
    var _a;
    var command = input.command.trim();
    function strEquals(a, b) {
        return a.toLowerCase() === b.toLowerCase();
    }
    function strStartsWith(str, prefix) {
        return str.toLowerCase().startsWith(prefix.toLowerCase());
    }
    // SECURITY: stripModulePrefix on RULE names widens the
    // secondary-canonical match — a deny rule `Module\Remove-Item:*` blocking
    // `rm` is the intent (fail-safe over-match), but an allow rule
    // `ModuleA\Get-Thing:*` also matching `ModuleB\Get-Thing` is fail-OPEN.
    // Deny/ask over-match is fine; allow must never over-match.
    function stripModulePrefixForRule(name) {
        if (behavior === 'allow') {
            return name;
        }
        return (0, parser_js_1.stripModulePrefix)(name);
    }
    // Extract the first word (command name) from the input for canonical matching.
    // Keep both raw (for slicing the original `command` string) and stripped
    // (for canonical resolution) versions. For module-qualified inputs like
    // `Microsoft.PowerShell.Utility\Invoke-Expression foo`, rawCmdName holds the
    // full token so `command.slice(rawCmdName.length)` yields the correct rest.
    var rawCmdName = (_a = command.split(/\s+/)[0]) !== null && _a !== void 0 ? _a : '';
    var inputCmdName = (0, parser_js_1.stripModulePrefix)(rawCmdName);
    var inputCanonical = (0, readOnlyValidation_js_1.resolveToCanonical)(inputCmdName);
    // Build a version of the command with the canonical name substituted
    // e.g., 'rm foo.txt' -> 'remove-item foo.txt' so deny rules on Remove-Item also block rm.
    // SECURITY: Normalize the whitespace separator between name and args to a
    // single space. PowerShell accepts any whitespace (tab, etc.) as separator,
    // but prefix rule matching uses `prefix + ' '` (literal space). Without this,
    // `rm\t./x` canonicalizes to `remove-item\t./x` and misses the deny rule
    // `Remove-Item:*`, while acceptEdits auto-allow (using AST cmd.name) still
    // matches — a deny-rule bypass. Build unconditionally (not just when the
    // canonical differs) so non-space-separated raw commands are also normalized.
    var rest = command.slice(rawCmdName.length).replace(/^\s+/, ' ');
    var canonicalCommand = inputCanonical + rest;
    return Array.from(rules.entries())
        .filter(function (_a) {
        var _b, _c, _d;
        var ruleContent = _a[0];
        var rule = powershellPermissionRule(ruleContent);
        // Also resolve the rule's command name to canonical for cross-matching
        // e.g., a deny rule for 'rm' should also block 'Remove-Item'
        function matchesCommand(cmd) {
            switch (rule.type) {
                case 'exact':
                    return strEquals(rule.command, cmd);
                case 'prefix':
                    switch (matchMode) {
                        case 'exact':
                            return strEquals(rule.prefix, cmd);
                        case 'prefix': {
                            if (strEquals(cmd, rule.prefix)) {
                                return true;
                            }
                            return strStartsWith(cmd, rule.prefix + ' ');
                        }
                    }
                    break;
                case 'wildcard':
                    if (matchMode === 'exact') {
                        return false;
                    }
                    return (0, shellRuleMatching_js_1.matchWildcardPattern)(rule.pattern, cmd, true);
            }
        }
        // Check against the original command
        if (matchesCommand(command)) {
            return true;
        }
        // Also check against the canonical form of the command
        // This ensures 'deny Remove-Item' also blocks 'rm', 'del', 'ri', etc.
        if (matchesCommand(canonicalCommand)) {
            return true;
        }
        // Also resolve the rule's command name to canonical and compare
        // This ensures 'deny rm' also blocks 'Remove-Item'
        // SECURITY: stripModulePrefix applied to DENY/ASK rule command
        // names too, not just input. Otherwise a deny rule written as
        // `Microsoft.PowerShell.Management\Remove-Item:*` is bypassed by `rm`,
        // `del`, or plain `Remove-Item` — resolveToCanonical won't match the
        // module-qualified form against COMMON_ALIASES.
        if (rule.type === 'exact') {
            var rawRuleCmdName = (_b = rule.command.split(/\s+/)[0]) !== null && _b !== void 0 ? _b : '';
            var ruleCanonical = (0, readOnlyValidation_js_1.resolveToCanonical)(stripModulePrefixForRule(rawRuleCmdName));
            if (ruleCanonical === inputCanonical) {
                // Rule and input resolve to same canonical cmdlet
                // SECURITY: use normalized `rest` not a raw re-slice
                // from `command`. The raw slice preserves tab separators so
                // `Remove-Item\t./secret.txt` vs deny rule `rm ./secret.txt` misses.
                // Normalize both sides identically.
                var ruleRest = rule.command
                    .slice(rawRuleCmdName.length)
                    .replace(/^\s+/, ' ');
                var inputRest = rest;
                if (strEquals(ruleRest, inputRest)) {
                    return true;
                }
            }
        }
        else if (rule.type === 'prefix') {
            var rawRuleCmdName = (_c = rule.prefix.split(/\s+/)[0]) !== null && _c !== void 0 ? _c : '';
            var ruleCanonical = (0, readOnlyValidation_js_1.resolveToCanonical)(stripModulePrefixForRule(rawRuleCmdName));
            if (ruleCanonical === inputCanonical) {
                var ruleRest = rule.prefix
                    .slice(rawRuleCmdName.length)
                    .replace(/^\s+/, ' ');
                var canonicalPrefix = inputCanonical + ruleRest;
                if (matchMode === 'exact') {
                    if (strEquals(canonicalPrefix, canonicalCommand)) {
                        return true;
                    }
                }
                else {
                    if (strEquals(canonicalCommand, canonicalPrefix) ||
                        strStartsWith(canonicalCommand, canonicalPrefix + ' ')) {
                        return true;
                    }
                }
            }
        }
        else if (rule.type === 'wildcard') {
            // Resolve the wildcard pattern's command name to canonical and re-match
            // This ensures 'deny rm *' also blocks 'Remove-Item secret.txt'
            var rawRuleCmdName = (_d = rule.pattern.split(/\s+/)[0]) !== null && _d !== void 0 ? _d : '';
            var ruleCanonical = (0, readOnlyValidation_js_1.resolveToCanonical)(stripModulePrefixForRule(rawRuleCmdName));
            if (ruleCanonical === inputCanonical && matchMode !== 'exact') {
                // Rebuild the pattern with the canonical cmdlet name
                // Normalize separator same as exact and prefix branches.
                // Without this, a wildcard rule `rm\t*` produces canonicalPattern
                // with a literal tab that never matches the space-normalized
                // canonicalCommand.
                var ruleRest = rule.pattern
                    .slice(rawRuleCmdName.length)
                    .replace(/^\s+/, ' ');
                var canonicalPattern = inputCanonical + ruleRest;
                if ((0, shellRuleMatching_js_1.matchWildcardPattern)(canonicalPattern, canonicalCommand, true)) {
                    return true;
                }
            }
        }
        return false;
    })
        .map(function (_a) {
        var rule = _a[1];
        return rule;
    });
}
/**
 * Get matching rules for input across all rule types (deny, ask, allow)
 */
function matchingRulesForInput(input, toolPermissionContext, matchMode) {
    var denyRuleByContents = (0, permissions_js_1.getRuleByContentsForToolName)(toolPermissionContext, toolName_js_1.POWERSHELL_TOOL_NAME, 'deny');
    var matchingDenyRules = filterRulesByContentsMatchingInput(input, denyRuleByContents, matchMode, 'deny');
    var askRuleByContents = (0, permissions_js_1.getRuleByContentsForToolName)(toolPermissionContext, toolName_js_1.POWERSHELL_TOOL_NAME, 'ask');
    var matchingAskRules = filterRulesByContentsMatchingInput(input, askRuleByContents, matchMode, 'ask');
    var allowRuleByContents = (0, permissions_js_1.getRuleByContentsForToolName)(toolPermissionContext, toolName_js_1.POWERSHELL_TOOL_NAME, 'allow');
    var matchingAllowRules = filterRulesByContentsMatchingInput(input, allowRuleByContents, matchMode, 'allow');
    return { matchingDenyRules: matchingDenyRules, matchingAskRules: matchingAskRules, matchingAllowRules: matchingAllowRules };
}
/**
 * Check if the command is an exact match for a permission rule.
 */
function powershellToolCheckExactMatchPermission(input, toolPermissionContext) {
    var trimmedCommand = input.command.trim();
    var _a = matchingRulesForInput(input, toolPermissionContext, 'exact'), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules, matchingAllowRules = _a.matchingAllowRules;
    if (matchingDenyRules[0] !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(trimmedCommand, " has been denied."),
            decisionReason: { type: 'rule', rule: matchingDenyRules[0] },
        };
    }
    if (matchingAskRules[0] !== undefined) {
        return {
            behavior: 'ask',
            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME),
            decisionReason: { type: 'rule', rule: matchingAskRules[0] },
        };
    }
    if (matchingAllowRules[0] !== undefined) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: { type: 'rule', rule: matchingAllowRules[0] },
        };
    }
    var decisionReason = {
        type: 'other',
        reason: 'This command requires approval',
    };
    return {
        behavior: 'passthrough',
        message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason),
        decisionReason: decisionReason,
        suggestions: suggestionForExactCommand(trimmedCommand),
    };
}
/**
 * Check permission for a PowerShell command including prefix matches.
 */
function powershellToolCheckPermission(input, toolPermissionContext) {
    var command = input.command.trim();
    // 1. Check exact match first
    var exactMatchResult = powershellToolCheckExactMatchPermission(input, toolPermissionContext);
    // 1a. Deny/ask if exact command has a rule
    if (exactMatchResult.behavior === 'deny' ||
        exactMatchResult.behavior === 'ask') {
        return exactMatchResult;
    }
    // 2. Find all matching rules (prefix or exact)
    var _a = matchingRulesForInput(input, toolPermissionContext, 'prefix'), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules, matchingAllowRules = _a.matchingAllowRules;
    // 2a. Deny if command has a deny rule
    if (matchingDenyRules[0] !== undefined) {
        return {
            behavior: 'deny',
            message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(command, " has been denied."),
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
            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME),
            decisionReason: {
                type: 'rule',
                rule: matchingAskRules[0],
            },
        };
    }
    // 3. Allow if command had an exact match allow
    if (exactMatchResult.behavior === 'allow') {
        return exactMatchResult;
    }
    // 4. Allow if command has an allow rule
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
    // 5. Passthrough since no rules match, will trigger permission prompt
    var decisionReason = {
        type: 'other',
        reason: 'This command requires approval',
    };
    return {
        behavior: 'passthrough',
        message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason),
        decisionReason: decisionReason,
        suggestions: suggestionForExactCommand(command),
    };
}
/**
 * Extract sub-commands that need independent permission checking from a parsed command.
 * Safe output cmdlets (Format-Table, Select-Object, etc.) are flagged but NOT
 * filtered out — step 4.4 still checks deny rules against them (deny always
 * wins), step 5 skips them for approval collection (they inherit the permission
 * of the preceding command).
 *
 * Also includes nested commands from control flow statements (if, for, foreach, etc.)
 * to ensure commands hidden inside control flow are checked.
 *
 * Returns sub-command info including both text and the parsed element for accurate
 * suggestion generation.
 */
function getSubCommandsForPermissionCheck(parsed, originalCommand) {
    return __awaiter(this, void 0, void 0, function () {
        var subCommands, _i, _a, statement, _b, _c, cmd, _d, _e, cmd;
        var _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (!!parsed.valid) return [3 /*break*/, 2];
                    _f = {
                        text: originalCommand
                    };
                    _g = {};
                    return [4 /*yield*/, extractCommandName(originalCommand)];
                case 1: 
                // Return a fallback element for unparsed commands
                return [2 /*return*/, [
                        (_f.element = (_g.name = _k.sent(),
                            _g.nameType = 'unknown',
                            _g.elementType = 'CommandAst',
                            _g.args = [],
                            _g.text = originalCommand,
                            _g),
                            _f.statement = null,
                            _f.isSafeOutput = false,
                            _f)
                    ]];
                case 2:
                    subCommands = [];
                    // Check direct commands in pipelines
                    for (_i = 0, _a = parsed.statements; _i < _a.length; _i++) {
                        statement = _a[_i];
                        for (_b = 0, _c = statement.commands; _b < _c.length; _b++) {
                            cmd = _c[_b];
                            // Only check actual commands (CommandAst), not expressions
                            if (cmd.elementType !== 'CommandAst') {
                                continue;
                            }
                            subCommands.push({
                                text: cmd.text,
                                element: cmd,
                                statement: statement,
                                // SECURITY: nameType gate — scripts\\Out-Null strips to Out-Null and
                                // would match SAFE_OUTPUT_CMDLETS, but PowerShell runs the .ps1 file.
                                // isSafeOutput: true causes step 5 to filter this command out of the
                                // approval list, so it would silently execute. See isAllowlistedCommand.
                                // SECURITY: args.length === 0 gate — Out-Null -InputObject:(1 > /etc/x)
                                // was filtered as safe-output (name-only) → step-5 subCommands empty →
                                // auto-allow → redirection inside paren writes file. Only zero-arg
                                // Out-String/Out-Null/Out-Host invocations are provably safe.
                                isSafeOutput: cmd.nameType !== 'application' &&
                                    (0, readOnlyValidation_js_1.isSafeOutputCommand)(cmd.name) &&
                                    cmd.args.length === 0,
                            });
                        }
                        // Also check nested commands from control flow statements
                        if (statement.nestedCommands) {
                            for (_d = 0, _e = statement.nestedCommands; _d < _e.length; _d++) {
                                cmd = _e[_d];
                                subCommands.push({
                                    text: cmd.text,
                                    element: cmd,
                                    statement: statement,
                                    isSafeOutput: cmd.nameType !== 'application' &&
                                        (0, readOnlyValidation_js_1.isSafeOutputCommand)(cmd.name) &&
                                        cmd.args.length === 0,
                                });
                            }
                        }
                    }
                    if (subCommands.length > 0) {
                        return [2 /*return*/, subCommands];
                    }
                    _h = {
                        text: originalCommand
                    };
                    _j = {};
                    return [4 /*yield*/, extractCommandName(originalCommand)];
                case 3: 
                // Fallback for commands with no sub-commands
                return [2 /*return*/, [
                        (_h.element = (_j.name = _k.sent(),
                            _j.nameType = 'unknown',
                            _j.elementType = 'CommandAst',
                            _j.args = [],
                            _j.text = originalCommand,
                            _j),
                            _h.statement = null,
                            _h.isSafeOutput = false,
                            _h)
                    ]];
            }
        });
    });
}
/**
 * Main permission check function for PowerShell tool.
 *
 * This function implements the full permission flow:
 * 1. Check exact match against deny/ask/allow rules
 * 2. Check prefix match against rules
 * 3. Run security check via powershellCommandIsSafe()
 * 4. Return appropriate PermissionResult
 *
 * @param input - The PowerShell tool input
 * @param context - The tool use context (for abort signal and session info)
 * @returns Promise resolving to PermissionResult
 */
function powershellToolHasPermission(input, context) {
    return __awaiter(this, void 0, void 0, function () {
        function extractProviderPathFromArg(arg) {
            // Handle colon parameter syntax: -Path:env:HOME → extract 'env:HOME'.
            // SECURITY: PowerShell's tokenizer accepts en-dash/em-dash/horizontal-bar
            // (U+2013/2014/2015) as parameter prefixes. `–Path:env:HOME` (en-dash)
            // must also strip the `–Path:` prefix or NON_FS_PROVIDER_PATTERN won't
            // match (pattern is `^(env|...):` which fails on `–Path:env:...`).
            var s = arg;
            if (s.length > 0 && parser_js_1.PS_TOKENIZER_DASH_CHARS.has(s[0])) {
                var colonIdx = s.indexOf(':', 1); // skip the leading dash
                if (colonIdx > 0) {
                    s = s.substring(colonIdx + 1);
                }
            }
            // Strip backtick escapes before matching: `Registry`::HKLM\...` has a
            // backtick before `::` that the PS tokenizer removes at runtime but that
            // would otherwise prevent the ^-anchored pattern from matching.
            return s.replace(/`/g, '');
        }
        function providerOrUncDecisionForArg(arg) {
            var value = extractProviderPathFromArg(arg);
            if (NON_FS_PROVIDER_PATTERN.test(value)) {
                return {
                    behavior: 'ask',
                    message: "Command argument '".concat(arg, "' uses a non-filesystem provider path and requires approval"),
                };
            }
            if ((0, readOnlyCommandValidation_js_1.containsVulnerableUncPath)(value)) {
                return {
                    behavior: 'ask',
                    message: "Command argument '".concat(arg, "' contains a UNC path that could trigger network requests"),
                };
            }
            return null;
        }
        var toolPermissionContext, command, parsed, exactMatchResult, _a, matchingDenyRules, matchingAskRules, preParseAskDecision, backtickStripped, _i, _b, fragment, trimmedFrag, normalized, m, rawFirst, firstTok, normalizedFrag, _c, _d, arg, fragDenyRules, decisionReason_1, allSubCommands, decisions, safetyResult, decisionReason_2, decisionReason_3, decisionReason_4, NON_FS_PROVIDER_PATTERN, _e, _f, statement, _g, _h, cmd, _j, _k, arg, decision, _l, _m, cmd, _o, _p, arg, decision, _q, allSubCommands_1, _r, subCmd, element, canonicalSubCmd, subInput, _s, subDenyRules, subAskRules, matchedDenyRule, matchedAskRule, _t, canonicalDenyRules, canonicalAskRules, hasCdSubCommand, hasSymlinkCreate, hasGitSubCommand, writesToGitInternal, redirWritesToGitInternal, hasArchiveExtractor, found, pathResult, fileRedirections, modeResult, deniedDecision, askDecision, allowDecision, subCommands, subCommandsNeedingApproval, statementsSeenInLoop, _u, subCommands_1, _v, subCmd, element, statement, subInput, subResult, subModeResult, _w, _x, stmt, decisionReason, pendingSuggestions, _y, subCommandsNeedingApproval_1, subCmd;
        var _z, _0, _1, _2, _3;
        return __generator(this, function (_4) {
            switch (_4.label) {
                case 0:
                    toolPermissionContext = context.getAppState().toolPermissionContext;
                    command = input.command.trim();
                    // Empty command check
                    if (!command) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: {
                                    type: 'other',
                                    reason: 'Empty command is safe',
                                },
                            }];
                    }
                    return [4 /*yield*/, (0, parser_js_1.parsePowerShellCommand)(command)
                        // SECURITY: Check deny/ask rules BEFORE parse validity check.
                        // Deny rules operate on the raw command string and don't need the parsed AST.
                        // This ensures explicit deny rules still block commands even when parsing fails.
                        // 1. Check exact match first
                    ];
                case 1:
                    parsed = _4.sent();
                    exactMatchResult = powershellToolCheckExactMatchPermission(input, toolPermissionContext);
                    // Exact command was denied
                    if (exactMatchResult.behavior === 'deny') {
                        return [2 /*return*/, exactMatchResult];
                    }
                    _a = matchingRulesForInput(input, toolPermissionContext, 'prefix'), matchingDenyRules = _a.matchingDenyRules, matchingAskRules = _a.matchingAskRules;
                    // 2a. Deny if command has a deny rule
                    if (matchingDenyRules[0] !== undefined) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(command, " has been denied."),
                                decisionReason: {
                                    type: 'rule',
                                    rule: matchingDenyRules[0],
                                },
                            }];
                    }
                    preParseAskDecision = null;
                    if (matchingAskRules[0] !== undefined) {
                        preParseAskDecision = {
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME),
                            decisionReason: {
                                type: 'rule',
                                rule: matchingAskRules[0],
                            },
                        };
                    }
                    // Block UNC paths — reading from UNC paths can trigger network requests
                    // and leak NTLM/Kerberos credentials. DEFERRED into decisions[].
                    // The raw-string UNC check must not early-return before sub-command deny
                    // (step 4+). Same fix as 2b above.
                    if (preParseAskDecision === null && (0, readOnlyCommandValidation_js_1.containsVulnerableUncPath)(command)) {
                        preParseAskDecision = {
                            behavior: 'ask',
                            message: 'Command contains a UNC path that could trigger network requests',
                        };
                    }
                    // 2c. Exact allow rules short-circuit here ONLY when parsing failed AND
                    // no pre-parse ask (2b prefix or UNC) is pending. Converting 2b/UNC from
                    // early-return to deferred-assign meant 2c
                    // fired before L648 consumed preParseAskDecision — silently overriding the
                    // ask with allow. Parse-succeeded path enforces ask > allow via the reduce
                    // (L917); without this guard, parse-failed was inconsistent.
                    // This ensures user-configured exact allow rules work even when pwsh is
                    // unavailable. When parsing succeeds, the exact allow check is deferred to
                    // after step 4.4 (sub-command deny/ask) — matching BashTool's ordering where
                    // the main-flow exact allow at bashPermissions.ts:1520 runs after sub-command
                    // deny checks (1442-1458). Without this, an exact allow on a compound command
                    // would bypass deny rules on sub-commands.
                    //
                    // SECURITY (parse-failed branch): the nameType guard in step 5 lives
                    // inside the sub-command loop, which only runs when parsed.valid.
                    // This is the !parsed.valid escape hatch. Input-side stripModulePrefix
                    // is unconditional — `scripts\build.exe --flag` strips to `build.exe`,
                    // canonicalCommand matches exact allow, and without this guard we'd
                    // return allow here and execute the local script. classifyCommandName
                    // is a pure string function (no AST needed). `scripts\build.exe` →
                    // 'application' (has `\`). Same tradeoff as step 5: `build.exe` alone
                    // also classifies 'application' (has `.`) so legitimate executable
                    // exact-allows downgrade to ask when pwsh is degraded — fail-safe.
                    // Module-qualified cmdlets (Module\Cmdlet) also classify 'application'
                    // (same `\`); same fail-safe over-fire.
                    if (exactMatchResult.behavior === 'allow' &&
                        !parsed.valid &&
                        preParseAskDecision === null &&
                        (0, parser_js_1.classifyCommandName)((_z = command.split(/\s+/)[0]) !== null && _z !== void 0 ? _z : '') !== 'application') {
                        return [2 /*return*/, exactMatchResult];
                    }
                    // 0. Check if command can be parsed - if not, require approval but don't suggest persisting
                    // This matches Bash behavior: invalid syntax triggers a permission prompt but we don't
                    // recommend saving invalid commands to settings
                    // NOTE: This check is intentionally AFTER deny/ask rules so explicit rules still work
                    // even when the parser fails (e.g., pwsh unavailable).
                    if (!parsed.valid) {
                        backtickStripped = command
                            .replace(/`[\r\n]+\s*/g, '')
                            .replace(/`/g, '');
                        for (_i = 0, _b = backtickStripped.split(/[;|\n\r{}()&]+/); _i < _b.length; _i++) {
                            fragment = _b[_i];
                            trimmedFrag = fragment.trim();
                            if (!trimmedFrag)
                                continue; // skip empty fragments
                            // Skip the full command ONLY if it starts with a cmdlet name (no
                            // assignment prefix). The full command was already checked at 2a, but
                            // 2a uses the raw text — $x %= iex as first token `$x` misses the
                            // deny(iex:*) rule. If normalization would change the fragment
                            // (assignment prefix, dot-source), don't skip — let it be re-checked
                            // after normalization. (bug #10/#24)
                            if (trimmedFrag === command &&
                                !/^\$[\w:]/.test(trimmedFrag) &&
                                !/^[&.]\s/.test(trimmedFrag)) {
                                continue;
                            }
                            normalized = trimmedFrag;
                            m = void 0;
                            while ((m = normalized.match(PS_ASSIGN_PREFIX_RE))) {
                                normalized = normalized.slice(m[0].length);
                            }
                            normalized = normalized.replace(/^[&.]\s+/, ''); // & cmd, . cmd (dot-source)
                            rawFirst = (_0 = normalized.split(/\s+/)[0]) !== null && _0 !== void 0 ? _0 : '';
                            firstTok = rawFirst.replace(/^['"]|['"]$/g, '');
                            normalizedFrag = firstTok + normalized.slice(rawFirst.length);
                            // SECURITY: parse-independent dangerous-removal hard-deny. The
                            // isDangerousRemovalPath check in checkPathConstraintsForStatement
                            // requires a valid AST; when pwsh times out or is unavailable,
                            // `Remove-Item /` degrades from hard-deny to generic ask. Check
                            // raw positional args here so root/home/system deletion is denied
                            // regardless of parser availability. Conservative: only positional
                            // args (skip -Param tokens); over-deny in degraded state is safe
                            // (same deny-downgrade rationale as the sub-command scan above).
                            if ((0, readOnlyValidation_js_1.resolveToCanonical)(firstTok) === 'remove-item') {
                                for (_c = 0, _d = normalized.split(/\s+/).slice(1); _c < _d.length; _c++) {
                                    arg = _d[_c];
                                    if (parser_js_1.PS_TOKENIZER_DASH_CHARS.has((_1 = arg[0]) !== null && _1 !== void 0 ? _1 : ''))
                                        continue;
                                    if ((0, pathValidation_js_1.isDangerousRemovalRawPath)(arg)) {
                                        return [2 /*return*/, (0, pathValidation_js_1.dangerousRemovalDeny)(arg)];
                                    }
                                }
                            }
                            fragDenyRules = matchingRulesForInput({ command: normalizedFrag }, toolPermissionContext, 'prefix').matchingDenyRules;
                            if (fragDenyRules[0] !== undefined) {
                                return [2 /*return*/, {
                                        behavior: 'deny',
                                        message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(command, " has been denied."),
                                        decisionReason: { type: 'rule', rule: fragDenyRules[0] },
                                    }];
                            }
                        }
                        // Preserve pre-parse ask messaging when parse fails. The deferred ask
                        // (2b prefix rule or UNC) carries a better decisionReason than the
                        // generic parse-error ask. Sub-command deny can't run the AST loop
                        // without a parse, so the fallback scan above is best-effort.
                        if (preParseAskDecision !== null) {
                            return [2 /*return*/, preParseAskDecision];
                        }
                        decisionReason_1 = {
                            type: 'other',
                            reason: "Command contains malformed syntax that cannot be parsed: ".concat((_3 = (_2 = parsed.errors[0]) === null || _2 === void 0 ? void 0 : _2.message) !== null && _3 !== void 0 ? _3 : 'unknown error'),
                        };
                        return [2 /*return*/, {
                                behavior: 'ask',
                                decisionReason: decisionReason_1,
                                message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason_1),
                                // No suggestions - don't recommend persisting invalid syntax
                            }];
                    }
                    return [4 /*yield*/, getSubCommandsForPermissionCheck(parsed, command)];
                case 2:
                    allSubCommands = _4.sent();
                    decisions = [];
                    // Decision: deferred pre-parse ask (2b prefix ask or UNC path).
                    // Pushed first so its message wins over later asks (first-of-behavior wins),
                    // but the reduce ensures any deny in decisions[] still beats it.
                    if (preParseAskDecision !== null) {
                        decisions.push(preParseAskDecision);
                    }
                    safetyResult = (0, powershellSecurity_js_1.powershellCommandIsSafe)(command, parsed);
                    if (safetyResult.behavior !== 'passthrough') {
                        decisionReason_2 = {
                            type: 'other',
                            reason: safetyResult.behavior === 'ask' && safetyResult.message
                                ? safetyResult.message
                                : 'This command contains patterns that could pose security risks and requires approval',
                        };
                        decisions.push({
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason_2),
                            decisionReason: decisionReason_2,
                            suggestions: suggestionForExactCommand(command),
                        });
                    }
                    // Decision: using statements / script requirements — invisible to AST block walk.
                    // `using module ./evil.psm1` loads and executes a module's top-level script body;
                    // `using assembly ./evil.dll` loads a .NET assembly (module initializers run).
                    // `#Requires -Modules <name>` triggers module loading from PSModulePath.
                    // These are siblings of the named blocks on ScriptBlockAst, not children, so
                    // Process-BlockStatements and all downstream command walkers never see them.
                    // Without this check, a decoy cmdlet like Get-Process fills subCommands,
                    // bypassing the empty-statement fallback, and isReadOnlyCommand auto-allows.
                    if (parsed.hasUsingStatements) {
                        decisionReason_3 = {
                            type: 'other',
                            reason: 'Command contains a `using` statement that may load external code (module or assembly)',
                        };
                        decisions.push({
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason_3),
                            decisionReason: decisionReason_3,
                            suggestions: suggestionForExactCommand(command),
                        });
                    }
                    if (parsed.hasScriptRequirements) {
                        decisionReason_4 = {
                            type: 'other',
                            reason: 'Command contains a `#Requires` directive that may trigger module loading',
                        };
                        decisions.push({
                            behavior: 'ask',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason_4),
                            decisionReason: decisionReason_4,
                            suggestions: suggestionForExactCommand(command),
                        });
                    }
                    NON_FS_PROVIDER_PATTERN = /^(?:[\w.]+\\)?(env|hklm|hkcu|function|alias|variable|cert|wsman|registry)::?/i;
                    providerScan: for (_e = 0, _f = parsed.statements; _e < _f.length; _e++) {
                        statement = _f[_e];
                        for (_g = 0, _h = statement.commands; _g < _h.length; _g++) {
                            cmd = _h[_g];
                            if (cmd.elementType !== 'CommandAst')
                                continue;
                            for (_j = 0, _k = cmd.args; _j < _k.length; _j++) {
                                arg = _k[_j];
                                decision = providerOrUncDecisionForArg(arg);
                                if (decision !== null) {
                                    decisions.push(decision);
                                    break providerScan;
                                }
                            }
                        }
                        if (statement.nestedCommands) {
                            for (_l = 0, _m = statement.nestedCommands; _l < _m.length; _l++) {
                                cmd = _m[_l];
                                for (_o = 0, _p = cmd.args; _o < _p.length; _o++) {
                                    arg = _p[_o];
                                    decision = providerOrUncDecisionForArg(arg);
                                    if (decision !== null) {
                                        decisions.push(decision);
                                        break providerScan;
                                    }
                                }
                            }
                        }
                    }
                    // Decision: per-sub-command deny/ask rules — was step 4 (:711-803).
                    // Each sub-command produces at most one decision (deny or ask). Deny rules
                    // on LATER sub-commands still beat ask rules on EARLIER ones via the reduce.
                    // No stash needed — the reduce structurally enforces deny > ask.
                    //
                    // SECURITY: Always build a canonical command string from AST-derived data
                    // (element.name + space-joined args) and check rules against it too. Deny
                    // and allow must use the same normalized form to close asymmetries:
                    //   - Invocation operators (`& 'Remove-Item' ./x`): raw text starts with `&`,
                    //     splitting on whitespace yields the operator, not the cmdlet name.
                    //   - Non-space whitespace (`rm\t./x`): raw prefix match uses `prefix + ' '`
                    //     (literal space), but PowerShell accepts any whitespace separator.
                    //     checkPermissionMode auto-allow (using AST cmd.name) WOULD match while
                    //     deny-rule match on raw text would miss — a deny-rule bypass.
                    //   - Module prefixes (`Microsoft.PowerShell.Management\Remove-Item`):
                    //     element.name has the module prefix stripped.
                    for (_q = 0, allSubCommands_1 = allSubCommands; _q < allSubCommands_1.length; _q++) {
                        _r = allSubCommands_1[_q], subCmd = _r.text, element = _r.element;
                        canonicalSubCmd = element.name !== '' ? __spreadArray([element.name], element.args, true).join(' ') : null;
                        subInput = { command: subCmd };
                        _s = matchingRulesForInput(subInput, toolPermissionContext, 'prefix'), subDenyRules = _s.matchingDenyRules, subAskRules = _s.matchingAskRules;
                        matchedDenyRule = subDenyRules[0];
                        matchedAskRule = subAskRules[0];
                        if (matchedDenyRule === undefined && canonicalSubCmd !== null) {
                            _t = matchingRulesForInput({ command: canonicalSubCmd }, toolPermissionContext, 'prefix'), canonicalDenyRules = _t.matchingDenyRules, canonicalAskRules = _t.matchingAskRules;
                            matchedDenyRule = canonicalDenyRules[0];
                            if (matchedAskRule === undefined) {
                                matchedAskRule = canonicalAskRules[0];
                            }
                        }
                        if (matchedDenyRule !== undefined) {
                            decisions.push({
                                behavior: 'deny',
                                message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(command, " has been denied."),
                                decisionReason: {
                                    type: 'rule',
                                    rule: matchedDenyRule,
                                },
                            });
                        }
                        else if (matchedAskRule !== undefined) {
                            decisions.push({
                                behavior: 'ask',
                                message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME),
                                decisionReason: {
                                    type: 'rule',
                                    rule: matchedAskRule,
                                },
                            });
                        }
                    }
                    hasCdSubCommand = allSubCommands.length > 1 &&
                        allSubCommands.some(function (_a) {
                            var element = _a.element;
                            return (0, readOnlyValidation_js_1.isCwdChangingCmdlet)(element.name);
                        });
                    hasSymlinkCreate = allSubCommands.length > 1 &&
                        allSubCommands.some(function (_a) {
                            var element = _a.element;
                            return (0, modeValidation_js_1.isSymlinkCreatingCommand)(element);
                        });
                    hasGitSubCommand = allSubCommands.some(function (_a) {
                        var element = _a.element;
                        return (0, readOnlyValidation_js_1.resolveToCanonical)(element.name) === 'git';
                    });
                    if (hasCdSubCommand && hasGitSubCommand) {
                        decisions.push({
                            behavior: 'ask',
                            message: 'Compound commands with cd/Set-Location and git require approval to prevent bare repository attacks',
                        });
                    }
                    // cd+write compound guard — SUBSUMED by checkPathConstraints(compoundCommandHasCd).
                    // Previously this block pushed 'ask' when hasCdSubCommand && hasAcceptEditsWrite,
                    // but checkPathConstraints now receives hasCdSubCommand and pushes 'ask' for ANY
                    // path operation (read or write) in a cd-compound — broader coverage at the path
                    // layer (BashTool parity). The step-5 !hasCdSubCommand gates and modeValidation's
                    // compound-cd guard remain as defense-in-depth for paths that don't reach
                    // checkPathConstraints (e.g., cmdlets not in CMDLET_PATH_CONFIG).
                    // Decision: bare-git-repo guard — bash parity.
                    // If cwd has HEAD/objects/refs/ without a valid .git/HEAD, Git treats
                    // cwd as a bare repository and runs hooks from cwd. Attacker creates
                    // hooks/pre-commit, deletes .git/HEAD, then any git subcommand runs it.
                    // Port of BashTool readOnlyValidation.ts isCurrentDirectoryBareGitRepo.
                    if (hasGitSubCommand && (0, git_js_1.isCurrentDirectoryBareGitRepo)()) {
                        decisions.push({
                            behavior: 'ask',
                            message: 'Git command in a directory with bare-repository indicators (HEAD, objects/, refs/ in cwd without .git/HEAD). Git may execute hooks from cwd.',
                        });
                    }
                    // Decision: git-internal-paths write guard — bash parity.
                    // Compound command creates HEAD/objects/refs/hooks/ then runs git → the
                    // git subcommand executes freshly-created malicious hooks. Check all
                    // extracted write paths + redirection targets against git-internal patterns.
                    // Port of BashTool commandWritesToGitInternalPaths, adapted for AST.
                    if (hasGitSubCommand) {
                        writesToGitInternal = allSubCommands.some(function (_a) {
                            var _b;
                            var element = _a.element, statement = _a.statement;
                            // Redirection targets on this sub-command (raw Extent.Text — quotes
                            // and ./ intact; normalizer handles both)
                            for (var _i = 0, _c = (_b = element.redirections) !== null && _b !== void 0 ? _b : []; _i < _c.length; _i++) {
                                var r = _c[_i];
                                if ((0, gitSafety_js_1.isGitInternalPathPS)(r.target))
                                    return true;
                            }
                            // Write cmdlet args (new-item HEAD; mkdir hooks; set-content hooks/pre-commit)
                            var canonical = (0, readOnlyValidation_js_1.resolveToCanonical)(element.name);
                            if (!GIT_SAFETY_WRITE_CMDLETS.has(canonical))
                                return false;
                            // Raw arg text — normalizer strips colon-bound params, quotes, ./, case.
                            // PS ArrayLiteralAst (`New-Item a,hooks/pre-commit`) surfaces as a single
                            // comma-joined arg — split before checking.
                            if (element.args
                                .flatMap(function (a) { return a.split(','); })
                                .some(function (a) { return (0, gitSafety_js_1.isGitInternalPathPS)(a); })) {
                                return true;
                            }
                            // Pipeline input: `"hooks/pre-commit" | New-Item -ItemType File` binds the
                            // string to -Path at runtime. The path is in a non-CommandAst pipeline
                            // element, not in element.args. The hasExpressionSource guard at step 5
                            // already forces approval here; this check just adds the git-internal
                            // warning text.
                            if (statement !== null) {
                                for (var _d = 0, _e = statement.commands; _d < _e.length; _d++) {
                                    var c = _e[_d];
                                    if (c.elementType === 'CommandAst')
                                        continue;
                                    if ((0, gitSafety_js_1.isGitInternalPathPS)(c.text))
                                        return true;
                                }
                            }
                            return false;
                        });
                        redirWritesToGitInternal = (0, parser_js_1.getFileRedirections)(parsed).some(function (r) {
                            return (0, gitSafety_js_1.isGitInternalPathPS)(r.target);
                        });
                        if (writesToGitInternal || redirWritesToGitInternal) {
                            decisions.push({
                                behavior: 'ask',
                                message: 'Command writes to a git-internal path (HEAD, objects/, refs/, hooks/, .git/) and runs git. This could plant a malicious hook that git then executes.',
                            });
                        }
                        hasArchiveExtractor = allSubCommands.some(function (_a) {
                            var element = _a.element;
                            return GIT_SAFETY_ARCHIVE_EXTRACTORS.has(element.name.toLowerCase());
                        });
                        if (hasArchiveExtractor) {
                            decisions.push({
                                behavior: 'ask',
                                message: 'Compound command extracts an archive and runs git. Archive contents may plant bare-repository indicators (HEAD, hooks/, refs/) that git then treats as the repository root.',
                            });
                        }
                    }
                    // .git/ writes are dangerous even WITHOUT a git subcommand — a planted
                    // .git/hooks/pre-commit fires on the user's next commit. Unlike the
                    // bare-repo check above (which gates on hasGitSubCommand because `hooks/`
                    // is a common project dirname), `.git/` is unambiguous.
                    {
                        found = allSubCommands.some(function (_a) {
                            var _b;
                            var element = _a.element;
                            for (var _i = 0, _c = (_b = element.redirections) !== null && _b !== void 0 ? _b : []; _i < _c.length; _i++) {
                                var r = _c[_i];
                                if ((0, gitSafety_js_1.isDotGitPathPS)(r.target))
                                    return true;
                            }
                            var canonical = (0, readOnlyValidation_js_1.resolveToCanonical)(element.name);
                            if (!GIT_SAFETY_WRITE_CMDLETS.has(canonical))
                                return false;
                            return element.args.flatMap(function (a) { return a.split(','); }).some(gitSafety_js_1.isDotGitPathPS);
                        }) || (0, parser_js_1.getFileRedirections)(parsed).some(function (r) { return (0, gitSafety_js_1.isDotGitPathPS)(r.target); });
                        if (found) {
                            decisions.push({
                                behavior: 'ask',
                                message: 'Command writes to .git/ — hooks or config planted there execute on the next git operation.',
                            });
                        }
                    }
                    pathResult = (0, pathValidation_js_1.checkPathConstraints)(input, parsed, toolPermissionContext, hasCdSubCommand);
                    if (pathResult.behavior !== 'passthrough') {
                        decisions.push(pathResult);
                    }
                    // Decision: exact allow (parse-succeeded case) — was step 4.45 (:861-867).
                    // Matches BashTool ordering: sub-command deny → path constraints → exact
                    // allow. Reduce enforces deny > ask > allow, so the exact allow only
                    // surfaces when no deny or ask fired — same as sequential.
                    //
                    // SECURITY: nameType gate — mirrors the parse-failed guard at L696-700.
                    // Input-side stripModulePrefix is unconditional: `scripts\Get-Content`
                    // strips to `Get-Content`, canonicalCommand matches exact allow. Without
                    // this gate, allow enters decisions[] and reduce returns it before step 5
                    // can inspect nameType — PowerShell runs the local .ps1 file. The AST's
                    // nameType for the first command element is authoritative when parse
                    // succeeded; 'application' means a script/executable path, not a cmdlet.
                    // SECURITY: Same argLeaksValue gate as the per-subcommand loop below
                    // (finding #32). Without it, `PowerShell(Write-Output:*)` exact-matches
                    // `Write-Output $env:ANTHROPIC_API_KEY`, pushes allow to decisions[], and
                    // reduce returns it before the per-subcommand gate ever runs. The
                    // allSubCommands.every check ensures NO command in the statement leaks
                    // (a single-command exact-allow has one element; a pipeline has several).
                    //
                    // SECURITY: nameType gate must check ALL subcommands, not just [0]
                    // (finding #10). canonicalCommand at L171 collapses `\n` → space, so
                    // `code\n.\build.ps1` (two statements) matches exact rule
                    // `PowerShell(code .\build.ps1)`. Checking only allSubCommands[0] lets the
                    // second statement (nameType=application, a script path) through. Require
                    // EVERY subcommand to have nameType !== 'application'.
                    if (exactMatchResult.behavior === 'allow' &&
                        allSubCommands[0] !== undefined &&
                        allSubCommands.every(function (sc) {
                            return sc.element.nameType !== 'application' &&
                                !(0, readOnlyValidation_js_1.argLeaksValue)(sc.text, sc.element);
                        })) {
                        decisions.push(exactMatchResult);
                    }
                    // Decision: read-only allowlist — was step 4.5 (:869-885).
                    // Mirrors Bash auto-allow for ls, cat, git status, etc. PowerShell
                    // equivalents: Get-Process, Get-ChildItem, Get-Content, git log, etc.
                    // Reduce places this below sub-command ask rules (ask > allow).
                    if ((0, readOnlyValidation_js_1.isReadOnlyCommand)(command, parsed)) {
                        decisions.push({
                            behavior: 'allow',
                            updatedInput: input,
                            decisionReason: {
                                type: 'other',
                                reason: 'Command is read-only and safe to execute',
                            },
                        });
                    }
                    fileRedirections = (0, parser_js_1.getFileRedirections)(parsed);
                    if (fileRedirections.length > 0) {
                        decisions.push({
                            behavior: 'ask',
                            message: 'Command contains file redirections that could write to arbitrary paths',
                            suggestions: suggestionForExactCommand(command),
                        });
                    }
                    modeResult = (0, modeValidation_js_1.checkPermissionMode)(input, parsed, toolPermissionContext);
                    if (modeResult.behavior !== 'passthrough') {
                        decisions.push(modeResult);
                    }
                    deniedDecision = decisions.find(function (d) { return d.behavior === 'deny'; });
                    if (deniedDecision !== undefined) {
                        return [2 /*return*/, deniedDecision];
                    }
                    askDecision = decisions.find(function (d) { return d.behavior === 'ask'; });
                    if (askDecision !== undefined) {
                        return [2 /*return*/, askDecision];
                    }
                    allowDecision = decisions.find(function (d) { return d.behavior === 'allow'; });
                    if (allowDecision !== undefined) {
                        return [2 /*return*/, allowDecision];
                    }
                    subCommands = allSubCommands.filter(function (_a) {
                        var element = _a.element, isSafeOutput = _a.isSafeOutput;
                        if (isSafeOutput) {
                            return false;
                        }
                        // SECURITY: nameType gate — sixth location. Filtering out of the approval
                        // list is a form of auto-allow. scripts\\Set-Location . would match below
                        // (stripped name 'Set-Location', arg '.' → CWD) and be silently dropped,
                        // then scripts\\Set-Location.ps1 executes with no prompt. Keep 'application'
                        // commands in the list so they reach isAllowlistedCommand (which rejects them).
                        if (element.nameType === 'application') {
                            return true;
                        }
                        var canonical = (0, readOnlyValidation_js_1.resolveToCanonical)(element.name);
                        if (canonical === 'set-location' && element.args.length > 0) {
                            // SECURITY: use PS_TOKENIZER_DASH_CHARS, not ASCII-only startsWith('-').
                            // `Set-Location –Path .` (en-dash) would otherwise treat `–Path` as the
                            // target, resolve it against cwd (mismatch), and keep the command in the
                            // approval list — correct. But `Set-Location –LiteralPath evil` with
                            // en-dash would find `–LiteralPath` as "target", mismatch cwd, stay in
                            // list — also correct. The risk is the inverse: a Unicode-dash parameter
                            // being treated as the positional target. Use the tokenizer dash set.
                            var target = element.args.find(function (a) { return a.length === 0 || !parser_js_1.PS_TOKENIZER_DASH_CHARS.has(a[0]); });
                            if (target && (0, path_1.resolve)((0, cwd_js_1.getCwd)(), target) === (0, cwd_js_1.getCwd)()) {
                                return false;
                            }
                        }
                        return true;
                    });
                    subCommandsNeedingApproval = [];
                    statementsSeenInLoop = new Set();
                    for (_u = 0, subCommands_1 = subCommands; _u < subCommands_1.length; _u++) {
                        _v = subCommands_1[_u], subCmd = _v.text, element = _v.element, statement = _v.statement;
                        subInput = { command: subCmd };
                        subResult = powershellToolCheckPermission(subInput, toolPermissionContext);
                        if (subResult.behavior === 'deny') {
                            return [2 /*return*/, {
                                    behavior: 'deny',
                                    message: "Permission to use ".concat(toolName_js_1.POWERSHELL_TOOL_NAME, " with command ").concat(command, " has been denied."),
                                    decisionReason: subResult.decisionReason,
                                }];
                        }
                        if (subResult.behavior === 'ask') {
                            if (statement !== null) {
                                statementsSeenInLoop.add(statement);
                            }
                            subCommandsNeedingApproval.push(subCmd);
                            continue;
                        }
                        // Explicitly allowed by a user rule — BUT NOT for applications/scripts.
                        // SECURITY: INPUT-side stripModulePrefix is unconditional, so
                        // `scripts\Get-Content /etc/shadow` strips to 'Get-Content' and matches
                        // an allow rule `Get-Content:*`. Without the nameType guard, continue
                        // skips all checks and the local script runs. nameType is classified from
                        // the RAW name pre-strip — `scripts\Get-Content` → 'application' (has `\`).
                        // Module-qualified cmdlets also classify 'application' — fail-safe over-fire.
                        // An application should NEVER be auto-allowed by a cmdlet allow rule.
                        if (subResult.behavior === 'allow' &&
                            element.nameType !== 'application' &&
                            !hasSymlinkCreate) {
                            // SECURITY: User allow rule asserts the cmdlet is safe, NOT that
                            // arbitrary variable expansion through it is safe. A user who allows
                            // PowerShell(Write-Output:*) did not intend to auto-allow
                            // `Write-Output $env:ANTHROPIC_API_KEY`. Apply the same argLeaksValue
                            // gate that protects the built-in allowlist path below — rejects
                            // Variable/Other/ScriptBlock/SubExpression elementTypes and colon-bound
                            // expression children. (security finding #32)
                            //
                            // SECURITY: Also skip when the compound contains a symlink-creating
                            // command (finding — symlink+read gap). New-Item -ItemType SymbolicLink
                            // can redirect subsequent reads to arbitrary paths. The built-in
                            // allowlist path (below) and acceptEdits path both gate on
                            // !hasSymlinkCreate; the user-rule path must too.
                            if ((0, readOnlyValidation_js_1.argLeaksValue)(subCmd, element)) {
                                if (statement !== null) {
                                    statementsSeenInLoop.add(statement);
                                }
                                subCommandsNeedingApproval.push(subCmd);
                                continue;
                            }
                            continue;
                        }
                        if (subResult.behavior === 'allow') {
                            // nameType === 'application' with a matching allow rule: the rule was
                            // written for a cmdlet, but this is a script/executable masquerading.
                            // Don't continue; fall through to approval (NOT deny — the user may
                            // actually want to run `scripts\Get-Content` and will see a prompt).
                            if (statement !== null) {
                                statementsSeenInLoop.add(statement);
                            }
                            subCommandsNeedingApproval.push(subCmd);
                            continue;
                        }
                        // SECURITY: fail-closed gate. Do NOT take the allowlist shortcut unless
                        // the parent statement is a PipelineAst where every element is a
                        // CommandAst. This subsumes the previous hasExpressionSource check
                        // (expression sources are one way a statement fails the gate) and also
                        // rejects assignments, chain operators, control flow, and any future
                        // AST type by construction. Examples this blocks:
                        //   'env:SECRET_API_KEY' | Get-Content  — CommandExpressionAst element
                        //   $x = Get-Process                   — AssignmentStatementAst
                        //   Get-Process && Get-Service         — PipelineChainAst
                        // Explicit user allow rules (above) run before this gate but apply their
                        // own argLeaksValue check; both paths now gate argument elementTypes.
                        //
                        // SECURITY: Also skip when the compound contains a cwd-changing cmdlet
                        // (finding #27 — cd+read gap). isAllowlistedCommand validates Get-Content
                        // in isolation, but `Set-Location ~; Get-Content ./.ssh/id_rsa` runs
                        // Get-Content from ~, not from the validator's cwd. Path validation saw
                        // /project/.ssh/id_rsa; runtime reads ~/.ssh/id_rsa. Same gate as the
                        // checkPermissionMode call below and the checkPathConstraints threading.
                        if (statement !== null &&
                            !hasCdSubCommand &&
                            !hasSymlinkCreate &&
                            (0, readOnlyValidation_js_1.isProvablySafeStatement)(statement) &&
                            (0, readOnlyValidation_js_1.isAllowlistedCommand)(element, subCmd)) {
                            continue;
                        }
                        // Check per-sub-command acceptEdits mode (BashTool parity).
                        // Delegate to checkPermissionMode on a single-statement AST so that ALL
                        // of its guards apply: expression pipeline sources (non-CommandAst elements),
                        // security flags (subexpressions, script blocks, assignments, splatting, etc.),
                        // and the ACCEPT_EDITS_ALLOWED_CMDLETS allowlist. This keeps one source of
                        // truth for what makes a statement safe in acceptEdits mode — any future
                        // hardening of checkPermissionMode automatically applies here.
                        //
                        // Pass parsed.variables (not []) so splatting from any statement in the
                        // compound command is visible. Conservative: if we can't tell which statement
                        // a splatted variable affects, assume it affects all of them.
                        //
                        // SECURITY: Skip this auto-allow path when the compound contains a
                        // cwd-changing command (Set-Location/Push-Location/Pop-Location). The
                        // synthetic single-statement AST strips compound context, so
                        // checkPermissionMode cannot see the cd in other statements. Without this
                        // gate, `Set-Location ./.claude; Set-Content ./settings.json '...'` would
                        // pass: Set-Content is checked in isolation, matches ACCEPT_EDITS_ALLOWED_CMDLETS,
                        // and auto-allows — but PowerShell runs it from the changed cwd, writing to
                        // .claude/settings.json (a Claude config file the path validator didn't check).
                        // This matches BashTool's compoundCommandHasCd guard.
                        if (statement !== null && !hasCdSubCommand && !hasSymlinkCreate) {
                            subModeResult = (0, modeValidation_js_1.checkPermissionMode)({ command: subCmd }, {
                                valid: true,
                                errors: [],
                                variables: parsed.variables,
                                hasStopParsing: parsed.hasStopParsing,
                                originalCommand: subCmd,
                                statements: [statement],
                            }, toolPermissionContext);
                            if (subModeResult.behavior === 'allow') {
                                continue;
                            }
                        }
                        // Not allowlisted, no mode auto-allow, and no explicit rule — needs approval
                        if (statement !== null) {
                            statementsSeenInLoop.add(statement);
                        }
                        subCommandsNeedingApproval.push(subCmd);
                    }
                    // SECURITY: fail-closed gate (second half). The step-5 loop above only
                    // iterates sub-commands that getSubCommandsForPermissionCheck surfaced
                    // AND survived the safe-output filter. Statements that produce zero
                    // CommandAst sub-commands (bare $env:SECRET) or whose only sub-commands
                    // were filtered as safe-output ($env:X | Out-String) never enter the loop.
                    // Without this, they silently auto-allow on empty subCommandsNeedingApproval.
                    //
                    // Only push statements NOT tracked above: if the loop PUSHED any
                    // sub-command from a statement, the user will see a prompt. Pushing the
                    // statement text too creates a duplicate suggestion where accepting the
                    // sub-command rule does not prevent re-prompting.
                    // If all sub-commands `continue`d (allow-ruled / allowlisted / mode-allowed)
                    // the statement is NOT tracked and the gate re-checks it below — this is
                    // the fail-closed property.
                    for (_w = 0, _x = parsed.statements; _w < _x.length; _w++) {
                        stmt = _x[_w];
                        if (!(0, readOnlyValidation_js_1.isProvablySafeStatement)(stmt) && !statementsSeenInLoop.has(stmt)) {
                            subCommandsNeedingApproval.push(stmt.text);
                        }
                    }
                    if (subCommandsNeedingApproval.length === 0) {
                        // SECURITY: empty-list auto-allow is only safe when there's nothing
                        // unverifiable. If the pipeline has script blocks, every safe-output
                        // cmdlet was filtered at :1032, but the block content wasn't verified —
                        // non-command AST nodes (AssignmentStatementAst etc.) are invisible to
                        // getAllCommands. `Where-Object {$true} | Sort-Object {$env:PATH='evil'}`
                        // would auto-allow here. hasAssignments is top-level-only (parser.ts:1385)
                        // so it doesn't catch nested assignments either. Prompt instead.
                        if ((0, parser_js_1.deriveSecurityFlags)(parsed).hasScriptBlocks) {
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME),
                                    decisionReason: {
                                        type: 'other',
                                        reason: 'Pipeline consists of output-formatting cmdlets with script blocks — block content cannot be verified',
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: {
                                    type: 'other',
                                    reason: 'All pipeline commands are individually allowed',
                                },
                            }];
                    }
                    decisionReason = {
                        type: 'other',
                        reason: 'This command requires approval',
                    };
                    pendingSuggestions = [];
                    for (_y = 0, subCommandsNeedingApproval_1 = subCommandsNeedingApproval; _y < subCommandsNeedingApproval_1.length; _y++) {
                        subCmd = subCommandsNeedingApproval_1[_y];
                        pendingSuggestions.push.apply(pendingSuggestions, suggestionForExactCommand(subCmd));
                    }
                    return [2 /*return*/, {
                            behavior: 'passthrough',
                            message: (0, permissions_js_1.createPermissionRequestMessage)(toolName_js_1.POWERSHELL_TOOL_NAME, decisionReason),
                            decisionReason: decisionReason,
                            suggestions: pendingSuggestions,
                        }];
            }
        });
    });
}
