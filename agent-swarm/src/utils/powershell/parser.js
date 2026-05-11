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
exports.PS_TOKENIZER_DASH_CHARS = exports.COMMON_ALIASES = exports.parsePowerShellCommand = exports.MAX_COMMAND_LENGTH = exports.WINDOWS_MAX_COMMAND_LENGTH = exports.PARSE_SCRIPT_BODY = void 0;
exports.mapStatementType = mapStatementType;
exports.mapElementType = mapElementType;
exports.classifyCommandName = classifyCommandName;
exports.stripModulePrefix = stripModulePrefix;
exports.transformCommandAst = transformCommandAst;
exports.transformExpressionElement = transformExpressionElement;
exports.transformRedirection = transformRedirection;
exports.transformStatement = transformStatement;
exports.getAllCommandNames = getAllCommandNames;
exports.getAllCommands = getAllCommands;
exports.getAllRedirections = getAllRedirections;
exports.getVariablesByScope = getVariablesByScope;
exports.hasCommandNamed = hasCommandNamed;
exports.hasDirectoryChange = hasDirectoryChange;
exports.isSingleCommand = isSingleCommand;
exports.commandHasArg = commandHasArg;
exports.isPowerShellParameter = isPowerShellParameter;
exports.commandHasArgAbbreviation = commandHasArgAbbreviation;
exports.getPipelineSegments = getPipelineSegments;
exports.isNullRedirectionTarget = isNullRedirectionTarget;
exports.getFileRedirections = getFileRedirections;
exports.deriveSecurityFlags = deriveSecurityFlags;
var execa_1 = require("execa");
var debug_js_1 = require("../debug.js");
var memoize_js_1 = require("../memoize.js");
var powershellDetection_js_1 = require("../shell/powershellDetection.js");
var slowOperations_js_1 = require("../slowOperations.js");
// ---------------------------------------------------------------------------
// Default 5s is fine for interactive use (warm pwsh spawn is ~450ms). Windows
// CI under Defender/AMSI load can exceed 5s on consecutive spawns even after
// CAN_SPAWN_PARSE_SCRIPT() warms the JIT (run 23574701241 windows-shard-5:
// attackVectors F1 hit 2×5s timeout → valid:false → 'ask' instead of 'deny').
// Override via env for tests. Read inside parsePowerShellCommandImpl, not
// top-level, per CLAUDE.md (globalSettings.env ordering).
var DEFAULT_PARSE_TIMEOUT_MS = 5000;
function getParseTimeoutMs() {
    var env = process.env.CLAUDE_CODE_PWSH_PARSE_TIMEOUT_MS;
    if (env) {
        var parsed = parseInt(env, 10);
        if (!isNaN(parsed) && parsed > 0)
            return parsed;
    }
    return DEFAULT_PARSE_TIMEOUT_MS;
}
// This is the canonical copy of the parse script. There is no separate .ps1 file.
/**
 * The core parse logic.
 * The command is passed via Base64-encoded $EncodedCommand variable
 * to avoid here-string injection attacks.
 *
 * SECURITY — top-level ParamBlock: ScriptBlockAst.ParamBlock is a SIBLING of
 * the named blocks (Begin/Process/End/Clean/DynamicParam), not nested inside
 * them, so Process-BlockStatements never reaches it. Commands inside param()
 * default-value expressions and attribute arguments (e.g. [ValidateScript({...})])
 * were invisible to every downstream check. PoC:
 *   param($x = (Remove-Item /)); Get-Process   → only Get-Process surfaced
 *   param([ValidateScript({rm /;$true})]$x='t') → rm invisible, runs on bind
 * Function-level param() IS covered: FindAll on the FunctionDefinitionAst
 * statement recurses into its descendants. The gap was only the script-level
 * ParamBlock. ParamBlockAst has .Parameters (not .Statements) so we FindAll
 * on it directly rather than reusing Process-BlockStatements. We only emit a
 * statement if there is something to report, to avoid noise for plain
 * param($x) declarations. (Kept compact in-script to preserve argv budget.)
 */
/**
 * PS1 parse script. Comments live here (not inline) — every char inside the
 * backticks eats into WINDOWS_MAX_COMMAND_LENGTH (argv budget).
 *
 * Structure:
 * - Get-RawCommandElements: extract CommandAst element data (type, text, value,
 *   expressionType, children for colon-bound param .Argument)
 * - Get-RawRedirections: extract FileRedirectionAst operator+target
 * - Get-SecurityPatterns: FindAll for security flags (hasSubExpressions via
 *   Sub/Array/ParenExpressionAst, hasScriptBlocks, etc.)
 * - Type literals: emit TypeExpressionAst names for CLM allowlist check
 * - --% token: PS7 MinusMinus, PS5.1 Generic kind
 * - CommandExpressionAst.Redirections: inherits from CommandBaseAst —
 *   `1 > /tmp/x` statement has FileRedirectionAst that element-iteration misses
 * - Nested commands: FindAll for ALL statement types (if/for/foreach/while/
 *   switch/try/function/assignment/PipelineChainAst) — skip direct pipeline
 *   elements already in the loop
 */
// exported for testing
exports.PARSE_SCRIPT_BODY = "\nif (-not $EncodedCommand) {\n    Write-Output '{\"valid\":false,\"errors\":[{\"message\":\"No command provided\",\"errorId\":\"NoInput\"}],\"statements\":[],\"variables\":[],\"hasStopParsing\":false,\"originalCommand\":\"\"}'\n    exit 0\n}\n\n$Command = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($EncodedCommand))\n\n$tokens = $null\n$parseErrors = $null\n$ast = [System.Management.Automation.Language.Parser]::ParseInput(\n    $Command,\n    [ref]$tokens,\n    [ref]$parseErrors\n)\n\n$allVariables = [System.Collections.ArrayList]::new()\n\nfunction Get-RawCommandElements {\n    param([System.Management.Automation.Language.CommandAst]$CmdAst)\n    $elems = [System.Collections.ArrayList]::new()\n    foreach ($ce in $CmdAst.CommandElements) {\n        $ceData = @{ type = $ce.GetType().Name; text = $ce.Extent.Text }\n        if ($ce.PSObject.Properties['Value'] -and $null -ne $ce.Value -and $ce.Value -is [string]) {\n            $ceData.value = $ce.Value\n        }\n        if ($ce -is [System.Management.Automation.Language.CommandExpressionAst]) {\n            $ceData.expressionType = $ce.Expression.GetType().Name\n        }\n        $a=$ce.Argument;if($a){$ceData.children=@(@{type=$a.GetType().Name;text=$a.Extent.Text})}\n        [void]$elems.Add($ceData)\n    }\n    return $elems\n}\n\nfunction Get-RawRedirections {\n    param($Redirections)\n    $result = [System.Collections.ArrayList]::new()\n    foreach ($redir in $Redirections) {\n        $redirData = @{ type = $redir.GetType().Name }\n        if ($redir -is [System.Management.Automation.Language.FileRedirectionAst]) {\n            $redirData.append = [bool]$redir.Append\n            $redirData.fromStream = $redir.FromStream.ToString()\n            $redirData.locationText = $redir.Location.Extent.Text\n        }\n        [void]$result.Add($redirData)\n    }\n    return $result\n}\n\nfunction Get-SecurityPatterns($A) {\n    $p = @{}\n    foreach ($n in $A.FindAll({ param($x)\n        $x -is [System.Management.Automation.Language.MemberExpressionAst] -or\n        $x -is [System.Management.Automation.Language.SubExpressionAst] -or\n        $x -is [System.Management.Automation.Language.ArrayExpressionAst] -or\n        $x -is [System.Management.Automation.Language.ExpandableStringExpressionAst] -or\n        $x -is [System.Management.Automation.Language.ScriptBlockExpressionAst] -or\n        $x -is [System.Management.Automation.Language.ParenExpressionAst]\n    }, $true)) { switch ($n.GetType().Name) {\n        'InvokeMemberExpressionAst' { $p.hasMemberInvocations = $true }\n        'MemberExpressionAst' { $p.hasMemberInvocations = $true }\n        'SubExpressionAst' { $p.hasSubExpressions = $true }\n        'ArrayExpressionAst' { $p.hasSubExpressions = $true }\n        'ParenExpressionAst' { $p.hasSubExpressions = $true }\n        'ExpandableStringExpressionAst' { $p.hasExpandableStrings = $true }\n        'ScriptBlockExpressionAst' { $p.hasScriptBlocks = $true }\n    }}\n    if ($p.Count -gt 0) { return $p }\n    return $null\n}\n\n$varExprs = $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.VariableExpressionAst] }, $true)\nforeach ($v in $varExprs) {\n    [void]$allVariables.Add(@{\n        path = $v.VariablePath.ToString()\n        isSplatted = [bool]$v.Splatted\n    })\n}\n\n$typeLiterals = [System.Collections.ArrayList]::new()\nforeach ($t in $ast.FindAll({ param($n)\n    $n -is [System.Management.Automation.Language.TypeExpressionAst] -or\n    $n -is [System.Management.Automation.Language.TypeConstraintAst]\n}, $true)) { [void]$typeLiterals.Add($t.TypeName.FullName) }\n\n$hasStopParsing = $false\n$tk = [System.Management.Automation.Language.TokenKind]\nforeach ($tok in $tokens) {\n    if ($tok.Kind -eq $tk::MinusMinus) { $hasStopParsing = $true; break }\n    if ($tok.Kind -eq $tk::Generic -and ($tok.Text -replace '[\u2013\u2014\u2015]','-') -eq '--%') {\n        $hasStopParsing = $true; break\n    }\n}\n\n$statements = [System.Collections.ArrayList]::new()\n\nfunction Process-BlockStatements {\n    param($Block)\n    if (-not $Block) { return }\n\n    foreach ($stmt in $Block.Statements) {\n        $statement = @{\n            type = $stmt.GetType().Name\n            text = $stmt.Extent.Text\n        }\n\n        if ($stmt -is [System.Management.Automation.Language.PipelineAst]) {\n            $elements = [System.Collections.ArrayList]::new()\n            foreach ($element in $stmt.PipelineElements) {\n                $elemData = @{\n                    type = $element.GetType().Name\n                    text = $element.Extent.Text\n                }\n\n                if ($element -is [System.Management.Automation.Language.CommandAst]) {\n                    $elemData.commandElements = @(Get-RawCommandElements -CmdAst $element)\n                    $elemData.redirections = @(Get-RawRedirections -Redirections $element.Redirections)\n                } elseif ($element -is [System.Management.Automation.Language.CommandExpressionAst]) {\n                    $elemData.expressionType = $element.Expression.GetType().Name\n                    $elemData.redirections = @(Get-RawRedirections -Redirections $element.Redirections)\n                }\n\n                [void]$elements.Add($elemData)\n            }\n            $statement.elements = @($elements)\n\n            $allNestedCmds = $stmt.FindAll(\n                { param($node) $node -is [System.Management.Automation.Language.CommandAst] },\n                $true\n            )\n            $nestedCmds = [System.Collections.ArrayList]::new()\n            foreach ($cmd in $allNestedCmds) {\n                if ($cmd.Parent -eq $stmt) { continue }\n                $nested = @{\n                    type = $cmd.GetType().Name\n                    text = $cmd.Extent.Text\n                    commandElements = @(Get-RawCommandElements -CmdAst $cmd)\n                    redirections = @(Get-RawRedirections -Redirections $cmd.Redirections)\n                }\n                [void]$nestedCmds.Add($nested)\n            }\n            if ($nestedCmds.Count -gt 0) {\n                $statement.nestedCommands = @($nestedCmds)\n            }\n            $r = $stmt.FindAll({param($n) $n -is [System.Management.Automation.Language.FileRedirectionAst]}, $true)\n            if ($r.Count -gt 0) {\n                $rr = @(Get-RawRedirections -Redirections $r)\n                $statement.redirections = if ($statement.redirections) { @($statement.redirections) + $rr } else { $rr }\n            }\n        } else {\n            $nestedCmdAsts = $stmt.FindAll(\n                { param($node) $node -is [System.Management.Automation.Language.CommandAst] },\n                $true\n            )\n            $nested = [System.Collections.ArrayList]::new()\n            foreach ($cmd in $nestedCmdAsts) {\n                [void]$nested.Add(@{\n                    type = 'CommandAst'\n                    text = $cmd.Extent.Text\n                    commandElements = @(Get-RawCommandElements -CmdAst $cmd)\n                    redirections = @(Get-RawRedirections -Redirections $cmd.Redirections)\n                })\n            }\n            if ($nested.Count -gt 0) {\n                $statement.nestedCommands = @($nested)\n            }\n            $r = $stmt.FindAll({param($n) $n -is [System.Management.Automation.Language.FileRedirectionAst]}, $true)\n            if ($r.Count -gt 0) { $statement.redirections = @(Get-RawRedirections -Redirections $r) }\n        }\n\n        $sp = Get-SecurityPatterns $stmt\n        if ($sp) { $statement.securityPatterns = $sp }\n\n        [void]$statements.Add($statement)\n    }\n\n    if ($Block.Traps) {\n        foreach ($trap in $Block.Traps) {\n            $statement = @{\n                type = 'TrapStatementAst'\n                text = $trap.Extent.Text\n            }\n            $nestedCmdAsts = $trap.FindAll(\n                { param($node) $node -is [System.Management.Automation.Language.CommandAst] },\n                $true\n            )\n            $nestedCmds = [System.Collections.ArrayList]::new()\n            foreach ($cmd in $nestedCmdAsts) {\n                $nested = @{\n                    type = $cmd.GetType().Name\n                    text = $cmd.Extent.Text\n                    commandElements = @(Get-RawCommandElements -CmdAst $cmd)\n                    redirections = @(Get-RawRedirections -Redirections $cmd.Redirections)\n                }\n                [void]$nestedCmds.Add($nested)\n            }\n            if ($nestedCmds.Count -gt 0) {\n                $statement.nestedCommands = @($nestedCmds)\n            }\n            $r = $trap.FindAll({param($n) $n -is [System.Management.Automation.Language.FileRedirectionAst]}, $true)\n            if ($r.Count -gt 0) { $statement.redirections = @(Get-RawRedirections -Redirections $r) }\n            $sp = Get-SecurityPatterns $trap\n            if ($sp) { $statement.securityPatterns = $sp }\n            [void]$statements.Add($statement)\n        }\n    }\n}\n\nProcess-BlockStatements -Block $ast.BeginBlock\nProcess-BlockStatements -Block $ast.ProcessBlock\nProcess-BlockStatements -Block $ast.EndBlock\nProcess-BlockStatements -Block $ast.CleanBlock\nProcess-BlockStatements -Block $ast.DynamicParamBlock\n\nif ($ast.ParamBlock) {\n  $pb = $ast.ParamBlock\n  $pn = [System.Collections.ArrayList]::new()\n  foreach ($c in $pb.FindAll({param($n) $n -is [System.Management.Automation.Language.CommandAst]}, $true)) {\n    [void]$pn.Add(@{type='CommandAst';text=$c.Extent.Text;commandElements=@(Get-RawCommandElements -CmdAst $c);redirections=@(Get-RawRedirections -Redirections $c.Redirections)})\n  }\n  $pr = $pb.FindAll({param($n) $n -is [System.Management.Automation.Language.FileRedirectionAst]}, $true)\n  $ps = Get-SecurityPatterns $pb\n  if ($pn.Count -gt 0 -or $pr.Count -gt 0 -or $ps) {\n    $st = @{type='ParamBlockAst';text=$pb.Extent.Text}\n    if ($pn.Count -gt 0) { $st.nestedCommands = @($pn) }\n    if ($pr.Count -gt 0) { $st.redirections = @(Get-RawRedirections -Redirections $pr) }\n    if ($ps) { $st.securityPatterns = $ps }\n    [void]$statements.Add($st)\n  }\n}\n\n$hasUsingStatements = $ast.UsingStatements -and $ast.UsingStatements.Count -gt 0\n$hasScriptRequirements = $ast.ScriptRequirements -ne $null\n\n$output = @{\n    valid = ($parseErrors.Count -eq 0)\n    errors = @($parseErrors | ForEach-Object {\n        @{\n            message = $_.Message\n            errorId = $_.ErrorId\n        }\n    })\n    statements = @($statements)\n    variables = @($allVariables)\n    hasStopParsing = $hasStopParsing\n    originalCommand = $Command\n    typeLiterals = @($typeLiterals)\n    hasUsingStatements = [bool]$hasUsingStatements\n    hasScriptRequirements = [bool]$hasScriptRequirements\n}\n\n$output | ConvertTo-Json -Depth 10 -Compress\n";
// ---------------------------------------------------------------------------
// Windows CreateProcess has a 32,767 char command-line limit. The encoding
// chain is:
//   command (N UTF-8 bytes) → Base64 (~4N/3 chars) → $EncodedCommand = '...'\n
//   → full script (wrapper + PARSE_SCRIPT_BODY) → UTF-16LE (2× bytes)
//   → Base64 (4/3× chars) → -EncodedCommand argv
// Final cmdline ≈ argv_overhead + (wrapper + 4N/3 + body) × 8/3
//
// Solving for N (UTF-8 bytes) with a 32,767 cap:
//   script_budget   = (32767 - argv_overhead) × 3/8
//   cmd_b64_budget  = script_budget - PARSE_SCRIPT_BODY.length - wrapper
//   N               = cmd_b64_budget × 3/4 - safety_margin
//
// SECURITY: N is a UTF-8 BYTE budget, not a UTF-16 code-unit budget. The
// length gate MUST measure Buffer.byteLength(command, 'utf8'), not
// command.length. A BMP character in U+0800–U+FFFF (CJK ideographs, most
// non-Latin scripts) is 1 UTF-16 code unit but 3 UTF-8 bytes. With
// PARSE_SCRIPT_BODY ≈ 10.6K, N ≈ 1,092 bytes. Comparing against .length
// permits a 1,092-code-unit pure-CJK command (≈3,276 UTF-8 bytes) → inner
// base64 ≈ 4,368 chars → final argv ≈ 40K chars, overflowing 32,767 by
// ~7.4K. CreateProcess fails → valid:false → parse-fail degradation (deny
// rules silently downgrade to ask). Finding #36.
//
// COMPUTED from PARSE_SCRIPT_BODY.length so it cannot drift. The prior
// hardcoded value (4,500) was derived from a ~6K body estimate; the body is
// actually ~11K chars, so the real ceiling was ~1,850. Commands in the
// 1,850–4,500 range passed this gate but then failed CreateProcess on
// Windows, returning valid=false and skipping all AST-based security checks.
//
// Unix argv limits are typically 2MB+ (ARG_MAX) with ~128KB per-argument
// limit (MAX_ARG_STRLEN on Linux; macOS has no per-arg limit below ARG_MAX).
// At MAX=4,500 the -EncodedCommand argument is ~45KB — well under either.
// Applying the Windows-derived limit on Unix would REGRESS: commands in the
// ~1K–4.5K range previously parsed successfully and reached the sub-command
// deny loop at powershellPermissions.ts; rejecting them pre-spawn degrades
// user-configured deny rules from deny→ask for compound commands with a
// denied cmdlet buried mid-script. So the Windows limit is platform-gated.
//
// If the Windows limit becomes too restrictive, switch to -File with a temp
// file for large inputs.
// ---------------------------------------------------------------------------
var WINDOWS_ARGV_CAP = 32767;
// pwsh path + " -NoProfile -NonInteractive -NoLogo -EncodedCommand " +
// argv quoting. A long Windows pwsh path (C:\Program Files\PowerShell\7\
// pwsh.exe) + flags is ~95 chars; 200 leaves headroom for unusual installs.
var FIXED_ARGV_OVERHEAD = 200;
// "$EncodedCommand = '" + "'\n" wrapper around the user command's base64
var ENCODED_CMD_WRAPPER = "$EncodedCommand = ''\n".length;
// Margin for base64 padding rounding (≤4 chars at each of 2 levels) and minor
// estimation drift. Multibyte expansion is NOT absorbed here — the gate
// measures actual UTF-8 bytes (Buffer.byteLength), not code units.
var SAFETY_MARGIN = 100;
var SCRIPT_CHARS_BUDGET = ((WINDOWS_ARGV_CAP - FIXED_ARGV_OVERHEAD) * 3) / 8;
var CMD_B64_BUDGET = SCRIPT_CHARS_BUDGET - exports.PARSE_SCRIPT_BODY.length - ENCODED_CMD_WRAPPER;
// Exported for drift-guard tests (the drift-prone value is the Windows one).
// Unit: UTF-8 BYTES. Compare against Buffer.byteLength, not .length.
exports.WINDOWS_MAX_COMMAND_LENGTH = Math.max(0, Math.floor((CMD_B64_BUDGET * 3) / 4) - SAFETY_MARGIN);
// Pre-existing value, known to work on Unix. See comment above re: why the
// Windows derivation must NOT be applied here. Unit: UTF-8 BYTES — for ASCII
// commands (the common case) bytes==chars so no regression; for multibyte
// commands this is slightly tighter but still far below Unix ARG_MAX (~128KB
// per-arg), so the argv spawn cannot overflow.
var UNIX_MAX_COMMAND_LENGTH = 4500;
// Unit: UTF-8 BYTES (see SECURITY note above).
exports.MAX_COMMAND_LENGTH = process.platform === 'win32'
    ? exports.WINDOWS_MAX_COMMAND_LENGTH
    : UNIX_MAX_COMMAND_LENGTH;
var INVALID_RESULT_BASE = {
    valid: false,
    statements: [],
    variables: [],
    hasStopParsing: false,
};
function makeInvalidResult(command, message, errorId) {
    return __assign(__assign({}, INVALID_RESULT_BASE), { errors: [{ message: message, errorId: errorId }], originalCommand: command });
}
/**
 * Base64-encode a string as UTF-16LE, which is the encoding required by
 * PowerShell's -EncodedCommand parameter.
 */
function toUtf16LeBase64(text) {
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(text, 'utf16le').toString('base64');
    }
    // Fallback for non-Node environments
    var bytes = [];
    for (var i = 0; i < text.length; i++) {
        var code = text.charCodeAt(i);
        bytes.push(code & 0xff, (code >> 8) & 0xff);
    }
    return btoa(bytes.map(function (b) { return String.fromCharCode(b); }).join(''));
}
/**
 * Build the full PowerShell script that parses a command.
 * The user command is Base64-encoded (UTF-8) and embedded in a variable
 * to prevent injection attacks.
 */
function buildParseScript(command) {
    var encoded = typeof Buffer !== 'undefined'
        ? Buffer.from(command, 'utf8').toString('base64')
        : btoa(new TextEncoder()
            .encode(command)
            .reduce(function (s, b) { return s + String.fromCharCode(b); }, ''));
    return "$EncodedCommand = '".concat(encoded, "'\n").concat(exports.PARSE_SCRIPT_BODY);
}
/**
 * Ensure a value is an array. PowerShell 5.1's ConvertTo-Json may unwrap
 * single-element arrays into plain objects.
 */
function ensureArray(value) {
    if (value === undefined || value === null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}
/** Map raw .NET AST type name to our StatementType union */
// exported for testing
function mapStatementType(rawType) {
    switch (rawType) {
        case 'PipelineAst':
            return 'PipelineAst';
        case 'PipelineChainAst':
            return 'PipelineChainAst';
        case 'AssignmentStatementAst':
            return 'AssignmentStatementAst';
        case 'IfStatementAst':
            return 'IfStatementAst';
        case 'ForStatementAst':
            return 'ForStatementAst';
        case 'ForEachStatementAst':
            return 'ForEachStatementAst';
        case 'WhileStatementAst':
            return 'WhileStatementAst';
        case 'DoWhileStatementAst':
            return 'DoWhileStatementAst';
        case 'DoUntilStatementAst':
            return 'DoUntilStatementAst';
        case 'SwitchStatementAst':
            return 'SwitchStatementAst';
        case 'TryStatementAst':
            return 'TryStatementAst';
        case 'TrapStatementAst':
            return 'TrapStatementAst';
        case 'FunctionDefinitionAst':
            return 'FunctionDefinitionAst';
        case 'DataStatementAst':
            return 'DataStatementAst';
        default:
            return 'UnknownStatementAst';
    }
}
/** Map raw .NET AST type name to our CommandElementType union */
// exported for testing
function mapElementType(rawType, expressionType) {
    switch (rawType) {
        case 'ScriptBlockExpressionAst':
            return 'ScriptBlock';
        case 'SubExpressionAst':
        case 'ArrayExpressionAst':
            // SECURITY: ArrayExpressionAst (@()) is a sibling of SubExpressionAst,
            // not a subclass. Both evaluate arbitrary pipelines with side effects:
            // Get-ChildItem @(Remove-Item ./data) runs Remove-Item inside @().
            // Map both to SubExpression so hasSubExpressions fires and isReadOnlyCommand
            // rejects (it doesn't check nestedCommands, only pipeline.commands[]).
            return 'SubExpression';
        case 'ExpandableStringExpressionAst':
            return 'ExpandableString';
        case 'InvokeMemberExpressionAst':
        case 'MemberExpressionAst':
            return 'MemberInvocation';
        case 'VariableExpressionAst':
            return 'Variable';
        case 'StringConstantExpressionAst':
        case 'ConstantExpressionAst':
            // ConstantExpressionAst covers numeric literals (5, 3.14). For
            // permission purposes a numeric literal is as safe as a string
            // literal — it's an inert value, not code. Without this mapping,
            // `-Seconds:5` produced children[0].type='Other' and consumers
            // checking `children.some(c => c.type !== 'StringConstant')` would
            // false-positive ask on harmless numeric args.
            return 'StringConstant';
        case 'CommandParameterAst':
            return 'Parameter';
        case 'ParenExpressionAst':
            return 'SubExpression';
        case 'CommandExpressionAst':
            // Delegate to the wrapped expression type so we catch SubExpressionAst,
            // ExpandableStringExpressionAst, ScriptBlockExpressionAst, etc.
            // without maintaining a manual list. Falls through to 'Other' if the
            // inner type is unrecognised.
            if (expressionType) {
                return mapElementType(expressionType);
            }
            return 'Other';
        default:
            return 'Other';
    }
}
/** Classify command name as cmdlet, application, or unknown */
// exported for testing
function classifyCommandName(name) {
    if (/^[A-Za-z]+-[A-Za-z][A-Za-z0-9_]*$/.test(name)) {
        return 'cmdlet';
    }
    if (/[.\\/]/.test(name)) {
        return 'application';
    }
    return 'unknown';
}
/** Strip module prefix from command name (e.g. "Microsoft.PowerShell.Utility\\Invoke-Expression" -> "Invoke-Expression") */
// exported for testing
function stripModulePrefix(name) {
    var idx = name.lastIndexOf('\\');
    if (idx < 0)
        return name;
    // Don't strip file paths: drive letters (C:\...), UNC paths (\\server\...), or relative paths (.\, ..\)
    if (/^[A-Za-z]:/.test(name) ||
        name.startsWith('\\\\') ||
        name.startsWith('.\\') ||
        name.startsWith('..\\'))
        return name;
    return name.substring(idx + 1);
}
/** Transform a raw CommandAst pipeline element into ParsedCommandElement */
// exported for testing
function transformCommandAst(raw) {
    var cmdElements = ensureArray(raw.commandElements);
    var name = '';
    var args = [];
    var elementTypes = [];
    var children = [];
    var hasChildren = false;
    // SECURITY: nameType MUST be computed from the raw name (before
    // stripModulePrefix). classifyCommandName('scripts\\Get-Process') returns
    // 'application' (contains \\) — the correct answer, since PowerShell resolves
    // this as a file path. After stripping it becomes 'Get-Process' which
    // classifies as 'cmdlet' — wrong, and allowlist checks would trust it.
    // Auto-allow paths gate on nameType !== 'application' to catch this.
    // name (stripped) is still used for deny-rule matching symmetry, which is
    // fail-safe: deny rules over-match (Module\\Remove-Item still hits a
    // Remove-Item deny), allow rules are separately gated by nameType.
    var nameType = 'unknown';
    if (cmdElements.length > 0) {
        var first = cmdElements[0];
        // SECURITY: only trust .value for string-literal element types with a
        // string-typed value. Numeric ConstantExpressionAst (e.g. `& 1`) emits an
        // integer .value that crashes stripModulePrefix() → parser falls through
        // to passthrough. For non-string-literal or non-string .value, use .text.
        var isFirstStringLiteral = first.type === 'StringConstantExpressionAst' ||
            first.type === 'ExpandableStringExpressionAst';
        var rawNameUnstripped = isFirstStringLiteral && typeof first.value === 'string'
            ? first.value
            : first.text;
        // SECURITY: strip surrounding quotes from the command name. When .value is
        // unavailable (no StaticType on the raw node), .text preserves quotes —
        // `& 'Invoke-Expression' 'x'` yields "'Invoke-Expression'". Stripping here
        // at the source means every downstream reader of element.name (deny-rule
        // matching, GIT_SAFETY_WRITE_CMDLETS lookup, resolveToCanonical, etc.)
        // sees the bare cmdlet name. No-op when .value already stripped.
        var rawName = rawNameUnstripped.replace(/^['"]|['"]$/g, '');
        // SECURITY: PowerShell built-in cmdlet names are ASCII-only. Non-ASCII
        // characters in cmdlet position are inherently suspicious — .NET
        // OrdinalIgnoreCase folds U+017F (ſ) → S and U+0131 (ı) → I per
        // UnicodeData.txt SimpleUppercaseMapping, so PowerShell resolves
        // `ſtart-proceſſ` → Start-Process at runtime. JS .toLowerCase() does NOT
        // fold these (ſ is already lowercase), so every downstream name
        // comparison (NEVER_SUGGEST, deny-rule strEquals, resolveToCanonical,
        // security validators) misses. Force 'application' to gate auto-allow
        // (blocks at the nameType !== 'application' checks). Finding #31.
        // Verified on Windows (pwsh 7.x, 2026-03): ſtart-proceſſ does NOT resolve.
        // Retained as defense-in-depth against future .NET/PS behavior changes
        // or module-provided command resolution hooks.
        if (/[\u0080-\uFFFF]/.test(rawName)) {
            nameType = 'application';
        }
        else {
            nameType = classifyCommandName(rawName);
        }
        name = stripModulePrefix(rawName);
        elementTypes.push(mapElementType(first.type, first.expressionType));
        for (var i = 1; i < cmdElements.length; i++) {
            var ce = cmdElements[i];
            // Use resolved .value for string constants (strips quotes, resolves
            // backtick escapes like `n -> newline) but keep raw .text for parameters
            // (where .value loses the dash prefix, e.g. '-Path' -> 'Path'),
            // variables, and other non-string types.
            var isStringLiteral = ce.type === 'StringConstantExpressionAst' ||
                ce.type === 'ExpandableStringExpressionAst';
            args.push(isStringLiteral && ce.value != null ? ce.value : ce.text);
            elementTypes.push(mapElementType(ce.type, ce.expressionType));
            // Map raw children (CommandParameterAst.Argument) through
            // mapElementType so consumers see 'Variable', 'StringConstant', etc.
            var rawChildren = ensureArray(ce.children);
            if (rawChildren.length > 0) {
                hasChildren = true;
                children.push(rawChildren.map(function (c) { return ({
                    type: mapElementType(c.type),
                    text: c.text,
                }); }));
            }
            else {
                children.push(undefined);
            }
        }
    }
    var result = __assign({ name: name, nameType: nameType, elementType: 'CommandAst', args: args, text: raw.text, elementTypes: elementTypes }, (hasChildren ? { children: children } : {}));
    // Preserve redirections from nested commands (e.g., in && / || chains)
    var rawRedirs = ensureArray(raw.redirections);
    if (rawRedirs.length > 0) {
        result.redirections = rawRedirs.map(transformRedirection);
    }
    return result;
}
/** Transform a non-CommandAst pipeline element into ParsedCommandElement */
// exported for testing
function transformExpressionElement(raw) {
    var elementType = raw.type === 'ParenExpressionAst'
        ? 'ParenExpressionAst'
        : 'CommandExpressionAst';
    var elementTypes = [
        mapElementType(raw.type, raw.expressionType),
    ];
    return {
        name: raw.text,
        nameType: 'unknown',
        elementType: elementType,
        args: [],
        text: raw.text,
        elementTypes: elementTypes,
    };
}
/** Map raw redirection to ParsedRedirection */
// exported for testing
function transformRedirection(raw) {
    var _a, _b, _c;
    if (raw.type === 'MergingRedirectionAst') {
        return { operator: '2>&1', target: '', isMerging: true };
    }
    var append = (_a = raw.append) !== null && _a !== void 0 ? _a : false;
    var fromStream = (_b = raw.fromStream) !== null && _b !== void 0 ? _b : 'Output';
    var operator;
    if (append) {
        switch (fromStream) {
            case 'Error':
                operator = '2>>';
                break;
            case 'All':
                operator = '*>>';
                break;
            default:
                operator = '>>';
                break;
        }
    }
    else {
        switch (fromStream) {
            case 'Error':
                operator = '2>';
                break;
            case 'All':
                operator = '*>';
                break;
            default:
                operator = '>';
                break;
        }
    }
    return { operator: operator, target: (_c = raw.locationText) !== null && _c !== void 0 ? _c : '', isMerging: false };
}
/** Transform a raw statement into ParsedStatement */
// exported for testing
function transformStatement(raw) {
    var statementType = mapStatementType(raw.type);
    var commands = [];
    var redirections = [];
    if (raw.elements) {
        // PipelineAst: walk pipeline elements
        for (var _i = 0, _a = ensureArray(raw.elements); _i < _a.length; _i++) {
            var elem = _a[_i];
            if (elem.type === 'CommandAst') {
                commands.push(transformCommandAst(elem));
                for (var _b = 0, _c = ensureArray(elem.redirections); _b < _c.length; _b++) {
                    var redir = _c[_b];
                    redirections.push(transformRedirection(redir));
                }
            }
            else {
                commands.push(transformExpressionElement(elem));
                // SECURITY: CommandExpressionAst also carries .Redirections (inherited
                // from CommandBaseAst). `1 > /tmp/evil.txt` is a CommandExpressionAst
                // with a FileRedirectionAst. Must extract here or getFileRedirections()
                // misses it and compound commands like `Get-ChildItem; 1 > /tmp/x`
                // auto-allow at step 5 (only Get-ChildItem is checked).
                for (var _d = 0, _e = ensureArray(elem.redirections); _d < _e.length; _d++) {
                    var redir = _e[_d];
                    redirections.push(transformRedirection(redir));
                }
            }
        }
        // SECURITY: The PS1 PipelineAst branch does a deep FindAll for
        // FileRedirectionAst to catch redirections hidden inside:
        //  - colon-bound ParenExpressionAst args: -Name:('payload' > file)
        //  - hashtable value statements: @{k='payload' > ~/.bashrc}
        // Both are invisible at the element level — the redirection's parent
        // is a child of CommandParameterAst / CommandExpressionAst, not a
        // separate pipeline element. Merge into statement-level redirections.
        //
        // The FindAll ALSO re-discovers direct-element redirections already
        // captured in the per-element loop above. Dedupe by (operator, target)
        // so tests and consumers see the real count.
        var seen = new Set(redirections.map(function (r) { return "".concat(r.operator, "\0").concat(r.target); }));
        for (var _f = 0, _g = ensureArray(raw.redirections); _f < _g.length; _f++) {
            var redir = _g[_f];
            var r = transformRedirection(redir);
            var key = "".concat(r.operator, "\0").concat(r.target);
            if (!seen.has(key)) {
                seen.add(key);
                redirections.push(r);
            }
        }
    }
    else {
        // Non-pipeline statement: add synthetic command entry with full text
        commands.push({
            name: raw.text,
            nameType: 'unknown',
            elementType: 'CommandExpressionAst',
            args: [],
            text: raw.text,
        });
        // SECURITY: The PS1 else-branch does a direct recursive FindAll on
        // FileRedirectionAst to catch expression redirections inside control flow
        // (if/for/foreach/while/switch/try/trap/&& and ||). The CommandAst FindAll
        // above CANNOT see these: in if ($x) { 1 > /tmp/evil }, the literal 1 with
        // its attached redirection is a CommandExpressionAst — a SIBLING of
        // CommandAst in the type hierarchy, not a subclass. So nestedCommands never
        // contains it, and without this hoist the redirection is invisible to
        // getFileRedirections → step 4.6 misses it → compound commands like
        // `Get-Process && 1 > /tmp/evil` auto-allow at step 5 (only Get-Process
        // is checked, allowlisted).
        //
        // Finding FileRedirectionAst DIRECTLY (rather than finding CommandExpressionAst
        // and extracting .Redirections) is both simpler and more robust: it catches
        // redirections on any node type, including ones we don't know about yet.
        //
        // Double-counts redirections already on nested CommandAst commands (those are
        // extracted at line ~395 into nestedCommands[i].redirections AND found again
        // here). Harmless: step 4.6 only checks fileRedirections.length > 0, not
        // the exact count. No code does arithmetic on redirection counts.
        //
        // PS1 SIZE NOTE: The full rationale lives here (TS), not in the PS1 script,
        // because PS1 comments bloat the -EncodedCommand payload and push the
        // Windows CreateProcess 32K limit. Keep PS1 comments terse; point them here.
        for (var _h = 0, _j = ensureArray(raw.redirections); _h < _j.length; _h++) {
            var redir = _j[_h];
            redirections.push(transformRedirection(redir));
        }
    }
    var nestedCommands;
    var rawNested = ensureArray(raw.nestedCommands);
    if (rawNested.length > 0) {
        nestedCommands = rawNested.map(transformCommandAst);
    }
    var result = {
        statementType: statementType,
        commands: commands,
        redirections: redirections,
        text: raw.text,
        nestedCommands: nestedCommands,
    };
    if (raw.securityPatterns) {
        result.securityPatterns = raw.securityPatterns;
    }
    return result;
}
/** Transform the complete raw PS output into ParsedPowerShellCommand */
function transformRawOutput(raw) {
    var result = {
        valid: raw.valid,
        errors: ensureArray(raw.errors),
        statements: ensureArray(raw.statements).map(transformStatement),
        variables: ensureArray(raw.variables),
        hasStopParsing: raw.hasStopParsing,
        originalCommand: raw.originalCommand,
    };
    var tl = ensureArray(raw.typeLiterals);
    if (tl.length > 0) {
        result.typeLiterals = tl;
    }
    if (raw.hasUsingStatements) {
        result.hasUsingStatements = true;
    }
    if (raw.hasScriptRequirements) {
        result.hasScriptRequirements = true;
    }
    return result;
}
/**
 * Parse a PowerShell command using the native AST parser.
 * Spawns pwsh to parse the command and returns structured results.
 * Results are memoized by command string.
 *
 * @param command - The PowerShell command to parse
 * @returns Parsed command structure, or a result with valid=false on failure
 */
function parsePowerShellCommandImpl(command) {
    return __awaiter(this, void 0, void 0, function () {
        var commandBytes, pwshPath, script, encodedScript, args, parseTimeoutMs, stdout, stderr, code, timedOut, attempt, result, e_1, trimmed, raw;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commandBytes = Buffer.byteLength(command, 'utf8');
                    if (commandBytes > exports.MAX_COMMAND_LENGTH) {
                        (0, debug_js_1.logForDebugging)("PowerShell parser: command too long (".concat(commandBytes, " bytes, max ").concat(exports.MAX_COMMAND_LENGTH, ")"));
                        return [2 /*return*/, makeInvalidResult(command, "Command too long for parsing (".concat(commandBytes, " bytes). Maximum supported length is ").concat(exports.MAX_COMMAND_LENGTH, " bytes."), 'CommandTooLong')];
                    }
                    return [4 /*yield*/, (0, powershellDetection_js_1.getCachedPowerShellPath)()];
                case 1:
                    pwshPath = _b.sent();
                    if (!pwshPath) {
                        return [2 /*return*/, makeInvalidResult(command, 'PowerShell is not available', 'NoPowerShell')];
                    }
                    script = buildParseScript(command);
                    encodedScript = toUtf16LeBase64(script);
                    args = [
                        '-NoProfile',
                        '-NonInteractive',
                        '-NoLogo',
                        '-EncodedCommand',
                        encodedScript,
                    ];
                    parseTimeoutMs = getParseTimeoutMs();
                    stdout = '';
                    stderr = '';
                    code = null;
                    timedOut = false;
                    attempt = 0;
                    _b.label = 2;
                case 2:
                    if (!(attempt < 2)) return [3 /*break*/, 8];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, execa_1.execa)(pwshPath, args, {
                            timeout: parseTimeoutMs,
                            reject: false,
                        })];
                case 4:
                    result = _b.sent();
                    stdout = result.stdout;
                    stderr = result.stderr;
                    timedOut = result.timedOut;
                    code = result.failed ? ((_a = result.exitCode) !== null && _a !== void 0 ? _a : 1) : 0;
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("PowerShell parser: failed to spawn pwsh: ".concat(e_1 instanceof Error ? e_1.message : e_1));
                    return [2 /*return*/, makeInvalidResult(command, "Failed to spawn PowerShell: ".concat(e_1 instanceof Error ? e_1.message : e_1), 'PwshSpawnError')];
                case 6:
                    if (!timedOut)
                        return [3 /*break*/, 8];
                    (0, debug_js_1.logForDebugging)("PowerShell parser: pwsh timed out after ".concat(parseTimeoutMs, "ms (attempt ").concat(attempt + 1, ")"));
                    _b.label = 7;
                case 7:
                    attempt++;
                    return [3 /*break*/, 2];
                case 8:
                    if (timedOut) {
                        return [2 /*return*/, makeInvalidResult(command, "pwsh timed out after ".concat(parseTimeoutMs, "ms (2 attempts)"), 'PwshTimeout')];
                    }
                    if (code !== 0) {
                        (0, debug_js_1.logForDebugging)("PowerShell parser: pwsh exited with code ".concat(code, ", stderr: ").concat(stderr));
                        return [2 /*return*/, makeInvalidResult(command, "pwsh exited with code ".concat(code, ": ").concat(stderr), 'PwshError')];
                    }
                    trimmed = stdout.trim();
                    if (!trimmed) {
                        (0, debug_js_1.logForDebugging)('PowerShell parser: empty stdout from pwsh');
                        return [2 /*return*/, makeInvalidResult(command, 'No output from PowerShell parser', 'EmptyOutput')];
                    }
                    try {
                        raw = (0, slowOperations_js_1.jsonParse)(trimmed);
                        return [2 /*return*/, transformRawOutput(raw)];
                    }
                    catch (_c) {
                        (0, debug_js_1.logForDebugging)("PowerShell parser: invalid JSON output: ".concat(trimmed.slice(0, 200)));
                        return [2 /*return*/, makeInvalidResult(command, 'Invalid JSON from PowerShell parser', 'InvalidJson')];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
// Error IDs from makeInvalidResult that represent transient process failures.
// These should be evicted from the cache so subsequent calls can retry.
// Deterministic failures (CommandTooLong, syntax errors from successful parses)
// should stay cached since retrying would produce the same result.
var TRANSIENT_ERROR_IDS = new Set([
    'PwshSpawnError',
    'PwshError',
    'PwshTimeout',
    'EmptyOutput',
    'InvalidJson',
]);
var parsePowerShellCommandCached = (0, memoize_js_1.memoizeWithLRU)(function (command) {
    var promise = parsePowerShellCommandImpl(command);
    // Evict transient failures after resolution so they can be retried.
    // The current caller still receives the cached promise for this call,
    // ensuring concurrent callers share the same result.
    void promise.then(function (result) {
        var _a, _b;
        if (!result.valid &&
            TRANSIENT_ERROR_IDS.has((_b = (_a = result.errors[0]) === null || _a === void 0 ? void 0 : _a.errorId) !== null && _b !== void 0 ? _b : '')) {
            parsePowerShellCommandCached.cache.delete(command);
        }
    });
    return promise;
}, function (command) { return command; }, 256);
exports.parsePowerShellCommand = parsePowerShellCommandCached;
/**
 * Common PowerShell aliases mapped to their canonical cmdlet names.
 * Uses Object.create(null) to prevent prototype-chain pollution — attacker-controlled
 * command names like 'constructor' or '__proto__' must return undefined, not inherited
 * Object.prototype properties.
 */
exports.COMMON_ALIASES = Object.assign(Object.create(null), {
    // Directory listing
    ls: 'Get-ChildItem',
    dir: 'Get-ChildItem',
    gci: 'Get-ChildItem',
    // Content
    cat: 'Get-Content',
    type: 'Get-Content',
    gc: 'Get-Content',
    // Navigation
    cd: 'Set-Location',
    sl: 'Set-Location',
    chdir: 'Set-Location',
    pushd: 'Push-Location',
    popd: 'Pop-Location',
    pwd: 'Get-Location',
    gl: 'Get-Location',
    // Items
    gi: 'Get-Item',
    gp: 'Get-ItemProperty',
    ni: 'New-Item',
    mkdir: 'New-Item',
    // `md` is PowerShell's built-in alias for `mkdir`. resolveToCanonical is
    // single-hop (no md→mkdir→New-Item chaining), so it needs its own entry
    // or `md /etc/x` falls through while `mkdir /etc/x` is caught.
    md: 'New-Item',
    ri: 'Remove-Item',
    del: 'Remove-Item',
    rd: 'Remove-Item',
    rmdir: 'Remove-Item',
    rm: 'Remove-Item',
    erase: 'Remove-Item',
    mi: 'Move-Item',
    mv: 'Move-Item',
    move: 'Move-Item',
    ci: 'Copy-Item',
    cp: 'Copy-Item',
    copy: 'Copy-Item',
    cpi: 'Copy-Item',
    si: 'Set-Item',
    rni: 'Rename-Item',
    ren: 'Rename-Item',
    // Process
    ps: 'Get-Process',
    gps: 'Get-Process',
    kill: 'Stop-Process',
    spps: 'Stop-Process',
    start: 'Start-Process',
    saps: 'Start-Process',
    sajb: 'Start-Job',
    ipmo: 'Import-Module',
    // Output
    echo: 'Write-Output',
    write: 'Write-Output',
    sleep: 'Start-Sleep',
    // Help
    help: 'Get-Help',
    man: 'Get-Help',
    gcm: 'Get-Command',
    // Service
    gsv: 'Get-Service',
    // Variables
    gv: 'Get-Variable',
    sv: 'Set-Variable',
    // History
    h: 'Get-History',
    history: 'Get-History',
    // Invoke
    iex: 'Invoke-Expression',
    iwr: 'Invoke-WebRequest',
    irm: 'Invoke-RestMethod',
    icm: 'Invoke-Command',
    ii: 'Invoke-Item',
    // PSSession — remote code execution surface
    nsn: 'New-PSSession',
    etsn: 'Enter-PSSession',
    exsn: 'Exit-PSSession',
    gsn: 'Get-PSSession',
    rsn: 'Remove-PSSession',
    // Misc
    cls: 'Clear-Host',
    clear: 'Clear-Host',
    select: 'Select-Object',
    where: 'Where-Object',
    foreach: 'ForEach-Object',
    '%': 'ForEach-Object',
    '?': 'Where-Object',
    measure: 'Measure-Object',
    ft: 'Format-Table',
    fl: 'Format-List',
    fw: 'Format-Wide',
    oh: 'Out-Host',
    ogv: 'Out-GridView',
    // SECURITY: The following aliases are deliberately omitted because PS Core 6+
    // removed them (they collide with native executables). Our allowlist logic
    // resolves aliases BEFORE checking safety — if we map 'sort' → 'Sort-Object'
    // but PowerShell 7/Windows actually runs sort.exe, we'd auto-allow the wrong
    // program.
    //   'sc'   → sc.exe (Service Controller) — e.g. `sc config Svc binpath= ...`
    //   'sort' → sort.exe — e.g. `sort /O C:\evil.txt` (arbitrary file write)
    //   'curl' → curl.exe (shipped with Windows 10 1803+)
    //   'wget' → wget.exe (if installed)
    // Prefer to leave ambiguous aliases unmapped — users can write the full name.
    // If adding aliases that resolve to SAFE_OUTPUT_CMDLETS or
    // ACCEPT_EDITS_ALLOWED_CMDLETS, verify no native .exe collision on PS Core.
    ac: 'Add-Content',
    clc: 'Clear-Content',
    // Write/export: tee-object/export-csv are in
    // CMDLET_PATH_CONFIG so path-level Edit denies fire on the full cmdlet name,
    // but PowerShell's built-in aliases fell through to ask-then-approve because
    // resolveToCanonical couldn't resolve them). Neither tee-object nor
    // export-csv is in SAFE_OUTPUT_CMDLETS or ACCEPT_EDITS_ALLOWED_CMDLETS, so
    // the native-exe collision warning above doesn't apply — on Linux PS Core
    // where `tee` runs /usr/bin/tee, that binary also writes to its positional
    // file arg and we correctly extract+check it.
    tee: 'Tee-Object',
    epcsv: 'Export-Csv',
    sp: 'Set-ItemProperty',
    rp: 'Remove-ItemProperty',
    cli: 'Clear-Item',
    epal: 'Export-Alias',
    // Text search
    sls: 'Select-String',
});
var DIRECTORY_CHANGE_CMDLETS = new Set([
    'set-location',
    'push-location',
    'pop-location',
]);
var DIRECTORY_CHANGE_ALIASES = new Set(['cd', 'sl', 'chdir', 'pushd', 'popd']);
/**
 * Get all command names across all statements, pipeline segments, and nested commands.
 * Returns lowercased names for case-insensitive comparison.
 */
// exported for testing
function getAllCommandNames(parsed) {
    var names = [];
    for (var _i = 0, _a = parsed.statements; _i < _a.length; _i++) {
        var statement = _a[_i];
        for (var _b = 0, _c = statement.commands; _b < _c.length; _b++) {
            var cmd = _c[_b];
            names.push(cmd.name.toLowerCase());
        }
        if (statement.nestedCommands) {
            for (var _d = 0, _e = statement.nestedCommands; _d < _e.length; _d++) {
                var cmd = _e[_d];
                names.push(cmd.name.toLowerCase());
            }
        }
    }
    return names;
}
/**
 * Get all pipeline segments as flat list of commands.
 * Useful for checking each command independently.
 */
function getAllCommands(parsed) {
    var commands = [];
    for (var _i = 0, _a = parsed.statements; _i < _a.length; _i++) {
        var statement = _a[_i];
        for (var _b = 0, _c = statement.commands; _b < _c.length; _b++) {
            var cmd = _c[_b];
            commands.push(cmd);
        }
        if (statement.nestedCommands) {
            for (var _d = 0, _e = statement.nestedCommands; _d < _e.length; _d++) {
                var cmd = _e[_d];
                commands.push(cmd);
            }
        }
    }
    return commands;
}
/**
 * Get all redirections across all statements.
 */
// exported for testing
function getAllRedirections(parsed) {
    var redirections = [];
    for (var _i = 0, _a = parsed.statements; _i < _a.length; _i++) {
        var statement = _a[_i];
        for (var _b = 0, _c = statement.redirections; _b < _c.length; _b++) {
            var redir = _c[_b];
            redirections.push(redir);
        }
        // Include redirections from nested commands (e.g., from && / || chains)
        if (statement.nestedCommands) {
            for (var _d = 0, _e = statement.nestedCommands; _d < _e.length; _d++) {
                var cmd = _e[_d];
                if (cmd.redirections) {
                    for (var _f = 0, _g = cmd.redirections; _f < _g.length; _f++) {
                        var redir = _g[_f];
                        redirections.push(redir);
                    }
                }
            }
        }
    }
    return redirections;
}
/**
 * Get all variables, optionally filtered by scope (e.g., 'env').
 * Variable paths in PowerShell can have scopes like "env:PATH", "global:x".
 */
function getVariablesByScope(parsed, scope) {
    var prefix = scope.toLowerCase() + ':';
    return parsed.variables.filter(function (v) { return v.path.toLowerCase().startsWith(prefix); });
}
/**
 * Check if any command in the parsed result matches a given name (case-insensitive).
 * Handles common aliases too.
 */
function hasCommandNamed(parsed, name) {
    var _a, _b;
    var lowerName = name.toLowerCase();
    var canonicalFromAlias = (_a = exports.COMMON_ALIASES[lowerName]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    for (var _i = 0, _c = getAllCommandNames(parsed); _i < _c.length; _i++) {
        var cmdName = _c[_i];
        if (cmdName === lowerName) {
            return true;
        }
        // Check if the command is an alias that resolves to the requested name
        var canonical = (_b = exports.COMMON_ALIASES[cmdName]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        if (canonical === lowerName) {
            return true;
        }
        // Check if the requested name is an alias and the command is its canonical form
        if (canonicalFromAlias && cmdName === canonicalFromAlias) {
            return true;
        }
        // Check if both resolve to the same canonical cmdlet (alias-to-alias match)
        if (canonical && canonicalFromAlias && canonical === canonicalFromAlias) {
            return true;
        }
    }
    return false;
}
/**
 * Check if the command contains any directory-changing commands.
 * (Set-Location, cd, sl, chdir, Push-Location, pushd, Pop-Location, popd)
 */
// exported for testing
function hasDirectoryChange(parsed) {
    for (var _i = 0, _a = getAllCommandNames(parsed); _i < _a.length; _i++) {
        var cmdName = _a[_i];
        if (DIRECTORY_CHANGE_CMDLETS.has(cmdName) ||
            DIRECTORY_CHANGE_ALIASES.has(cmdName)) {
            return true;
        }
    }
    return false;
}
/**
 * Check if the command is a single simple command (no pipes, no semicolons, no operators).
 */
// exported for testing
function isSingleCommand(parsed) {
    var stmt = parsed.statements[0];
    return (parsed.statements.length === 1 &&
        stmt !== undefined &&
        stmt.commands.length === 1 &&
        (!stmt.nestedCommands || stmt.nestedCommands.length === 0));
}
/**
 * Check if a specific command has a given argument/flag (case-insensitive).
 * Useful for checking "-EncodedCommand", "-Recurse", etc.
 */
function commandHasArg(command, arg) {
    var lowerArg = arg.toLowerCase();
    return command.args.some(function (a) { return a.toLowerCase() === lowerArg; });
}
/**
 * Tokenizer-level dash characters that PowerShell's parser accepts as
 * parameter prefixes. SpecialCharacters.IsDash (CharTraits.cs) accepts exactly
 * these four: ASCII hyphen-minus, en-dash, em-dash, horizontal bar. These are
 * tokenizer-level — they apply to ALL cmdlet parameters, not just argv to
 * powershell.exe (contrast with `/` which is an argv-parser quirk of
 * powershell.exe 5.1 only; see PS_ALT_PARAM_PREFIXES in powershellSecurity.ts).
 *
 * Extent.Text preserves the raw character; transformCommandAst uses ce.text
 * for CommandParameterAst elements, so these reach callers unchanged.
 */
exports.PS_TOKENIZER_DASH_CHARS = new Set([
    '-', // U+002D hyphen-minus (ASCII)
    '\u2013', // en-dash
    '\u2014', // em-dash
    '\u2015', // horizontal bar
]);
/**
 * Determines if an argument is a PowerShell parameter (flag), using the AST
 * element type as ground truth when available.
 *
 * The parser maps CommandParameterAst → 'Parameter' regardless of which dash
 * character the user typed — PowerShell's tokenizer handles that. So when
 * elementType is available, it's authoritative:
 *   - 'Parameter' → true (covers `-Path`, `–Path`, `—Path`, `―Path`)
 *   - anything else → false (a quoted "-Path" is StringConstant, not a param)
 *
 * When elementType is unavailable (backward compat / no AST detail), fall back
 * to a char check against PS_TOKENIZER_DASH_CHARS.
 */
function isPowerShellParameter(arg, elementType) {
    if (elementType !== undefined) {
        return elementType === 'Parameter';
    }
    return arg.length > 0 && exports.PS_TOKENIZER_DASH_CHARS.has(arg[0]);
}
/**
 * Check if any argument on a command is an unambiguous abbreviation of a PowerShell parameter.
 * PowerShell allows parameter abbreviation as long as the prefix is unambiguous.
 * The minPrefix is the shortest unambiguous prefix for the parameter.
 * For example, minPrefix '-en' for fullParam '-encodedcommand' matches '-en', '-enc', '-enco', etc.
 */
function commandHasArgAbbreviation(command, fullParam, minPrefix) {
    var lowerFull = fullParam.toLowerCase();
    var lowerMin = minPrefix.toLowerCase();
    return command.args.some(function (a) {
        // Strip colon-bound value (e.g., -en:base64value -> -en)
        var colonIndex = a.indexOf(':', 1);
        var paramPart = colonIndex > 0 ? a.slice(0, colonIndex) : a;
        // Strip backtick escapes — PowerShell resolves `-Member`Name` to
        // `-MemberName` but Extent.Text preserves the backtick, causing
        // prefix-comparison misses on the raw text.
        var lower = paramPart.replace(/`/g, '').toLowerCase();
        return (lower.startsWith(lowerMin) &&
            lowerFull.startsWith(lower) &&
            lower.length <= lowerFull.length);
    });
}
/**
 * Split a parsed command into its pipeline segments for per-segment permission checking.
 * Returns each pipeline's commands separately.
 */
function getPipelineSegments(parsed) {
    return parsed.statements;
}
/**
 * True if a redirection target is PowerShell's `$null` automatic variable.
 * `> $null` discards output (like /dev/null) — not a filesystem write.
 * `$null` cannot be reassigned, so this is safe to treat as a no-op sink.
 * `${null}` is the same automatic variable via curly-brace syntax. Spaces
 * inside the braces (`${ null }`) name a different variable, so no regex.
 */
function isNullRedirectionTarget(target) {
    var t = target.trim().toLowerCase();
    return t === '$null' || t === '${null}';
}
/**
 * Get output redirections (file redirections, not merging redirections).
 * Returns only redirections that write to files.
 */
// exported for testing
function getFileRedirections(parsed) {
    return getAllRedirections(parsed).filter(function (r) { return !r.isMerging && !isNullRedirectionTarget(r.target); });
}
/**
 * Derive security-relevant flags from the parsed command structure.
 * This replaces the previous approach of computing flags in PowerShell via
 * separate Find-AstNodes calls. Instead, the PS1 script tags each element
 * with its AST node type, and this function walks those types.
 */
// exported for testing
function deriveSecurityFlags(parsed) {
    var flags = {
        hasSubExpressions: false,
        hasScriptBlocks: false,
        hasSplatting: false,
        hasExpandableStrings: false,
        hasMemberInvocations: false,
        hasAssignments: false,
        hasStopParsing: parsed.hasStopParsing,
    };
    function checkElements(cmd) {
        if (!cmd.elementTypes) {
            return;
        }
        for (var _i = 0, _a = cmd.elementTypes; _i < _a.length; _i++) {
            var et = _a[_i];
            switch (et) {
                case 'ScriptBlock':
                    flags.hasScriptBlocks = true;
                    break;
                case 'SubExpression':
                    flags.hasSubExpressions = true;
                    break;
                case 'ExpandableString':
                    flags.hasExpandableStrings = true;
                    break;
                case 'MemberInvocation':
                    flags.hasMemberInvocations = true;
                    break;
            }
        }
    }
    for (var _i = 0, _a = parsed.statements; _i < _a.length; _i++) {
        var stmt = _a[_i];
        if (stmt.statementType === 'AssignmentStatementAst') {
            flags.hasAssignments = true;
        }
        for (var _b = 0, _c = stmt.commands; _b < _c.length; _b++) {
            var cmd = _c[_b];
            checkElements(cmd);
        }
        if (stmt.nestedCommands) {
            for (var _d = 0, _e = stmt.nestedCommands; _d < _e.length; _d++) {
                var cmd = _e[_d];
                checkElements(cmd);
            }
        }
        // securityPatterns provides a belt-and-suspenders check that catches
        // patterns elementTypes may miss (e.g. member invocations inside
        // assignments, subexpressions in non-pipeline statements).
        if (stmt.securityPatterns) {
            if (stmt.securityPatterns.hasMemberInvocations) {
                flags.hasMemberInvocations = true;
            }
            if (stmt.securityPatterns.hasSubExpressions) {
                flags.hasSubExpressions = true;
            }
            if (stmt.securityPatterns.hasExpandableStrings) {
                flags.hasExpandableStrings = true;
            }
            if (stmt.securityPatterns.hasScriptBlocks) {
                flags.hasScriptBlocks = true;
            }
        }
    }
    for (var _f = 0, _g = parsed.variables; _f < _g.length; _f++) {
        var v = _g[_f];
        if (v.isSplatted) {
            flags.hasSplatting = true;
            break;
        }
    }
    return flags;
}
// Raw types exported for testing (function exports are inline above)
