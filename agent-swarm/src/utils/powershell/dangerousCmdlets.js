"use strict";
/**
 * Shared constants for PowerShell cmdlets that execute arbitrary code.
 *
 * These lists are consumed by both the permission-engine validators
 * (powershellSecurity.ts) and the UI suggestion gate (staticPrefix.ts).
 * Keeping them here avoids duplicating the lists and prevents sync drift
 * — add a cmdlet once, both consumers pick it up.
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
exports.NEVER_SUGGEST = exports.ARG_GATED_CMDLETS = exports.WMI_CIM_CMDLETS = exports.ALIAS_HIJACK_CMDLETS = exports.NETWORK_CMDLETS = exports.MODULE_LOADING_CMDLETS = exports.DANGEROUS_SCRIPT_BLOCK_CMDLETS = exports.FILEPATH_EXECUTION_CMDLETS = void 0;
var dangerousPatterns_js_1 = require("../permissions/dangerousPatterns.js");
var parser_js_1 = require("./parser.js");
/**
 * Cmdlets that accept a -FilePath (or positional path) and execute the
 * file's contents as a script.
 */
exports.FILEPATH_EXECUTION_CMDLETS = new Set([
    'invoke-command',
    'start-job',
    'start-threadjob',
    'register-scheduledjob',
]);
/**
 * Cmdlets where a scriptblock argument executes arbitrary code (not just
 * filtering/transforming pipeline input like Where-Object).
 */
exports.DANGEROUS_SCRIPT_BLOCK_CMDLETS = new Set([
    'invoke-command',
    'invoke-expression',
    'start-job',
    'start-threadjob',
    'register-scheduledjob',
    'register-engineevent',
    'register-objectevent',
    'register-wmievent',
    'new-pssession',
    'enter-pssession',
]);
/**
 * Cmdlets that load and execute module/script code. `.psm1` files run
 * their top-level body on import — same code-execution risk as iex.
 */
exports.MODULE_LOADING_CMDLETS = new Set([
    'import-module',
    'ipmo',
    'install-module',
    'save-module',
    'update-module',
    'install-script',
    'save-script',
]);
/**
 * Shells and process spawners. Small, stable — add here only for cmdlets
 * not covered by the validator lists above.
 */
var SHELLS_AND_SPAWNERS = [
    'pwsh',
    'powershell',
    'cmd',
    'bash',
    'wsl',
    'sh',
    'start-process',
    'start',
    'add-type',
    'new-object',
];
function aliasesOf(targets) {
    return Object.entries(parser_js_1.COMMON_ALIASES)
        .filter(function (_a) {
        var target = _a[1];
        return targets.has(target.toLowerCase());
    })
        .map(function (_a) {
        var alias = _a[0];
        return alias;
    });
}
/**
 * Network cmdlets — wildcard rules for these enable exfil/download without
 * prompt. No legitimate narrow prefix exists.
 */
exports.NETWORK_CMDLETS = new Set([
    'invoke-webrequest',
    'invoke-restmethod',
]);
/**
 * Alias/variable mutation cmdlets — Set-Alias rebinds command resolution,
 * Set-Variable can poison $PSDefaultParameterValues. checkRuntimeStateManipulation
 * validator in powershellSecurity.ts independently gates on the permission path.
 */
exports.ALIAS_HIJACK_CMDLETS = new Set([
    'set-alias',
    'sal', // alias not in COMMON_ALIASES — list explicitly
    'new-alias',
    'nal', // alias not in COMMON_ALIASES — list explicitly
    'set-variable',
    'sv', // alias not in COMMON_ALIASES — list explicitly
    'new-variable',
    'nv', // alias not in COMMON_ALIASES — list explicitly
]);
/**
 * WMI/CIM process spawn — Invoke-WmiMethod -Class Win32_Process -Name Create
 * is a Start-Process equivalent that bypasses checkStartProcess. No legitimate
 * narrow prefix exists; any invocation can spawn arbitrary processes.
 * checkWmiProcessSpawn validator gates on the permission path.
 * (security finding #34)
 */
exports.WMI_CIM_CMDLETS = new Set([
    'invoke-wmimethod',
    'iwmi', // alias not in COMMON_ALIASES — list explicitly
    'invoke-cimmethod',
]);
/**
 * Cmdlets in CMDLET_ALLOWLIST with additionalCommandIsDangerousCallback.
 *
 * The allowlist auto-allows these for safe args (StringConstant identifiers).
 * The permission dialog only fires when the callback rejected — i.e. the args
 * contain a scriptblock, variable, subexpression, etc. Accepting a
 * `Cmdlet:*` wildcard at that point would match ALL future invocations via
 * prefix-startsWith, bypassing the callback forever.
 * `ForEach-Object:*` → `ForEach-Object { Remove-Item -Recurse / }` auto-allows.
 *
 * Sync with readOnlyValidation.ts — test/utils/powershell/dangerousCmdlets.test.ts
 * asserts this set covers every additionalCommandIsDangerousCallback entry.
 */
exports.ARG_GATED_CMDLETS = new Set([
    'select-object',
    'sort-object',
    'group-object',
    'where-object',
    'measure-object',
    'write-output',
    'write-host',
    'start-sleep',
    'format-table',
    'format-list',
    'format-wide',
    'format-custom',
    'out-string',
    'out-host',
    // Native executables with callback-gated args (e.g. ipconfig /flushdns
    // is rejected, ipconfig /all is allowed). Same bypass risk.
    'ipconfig',
    'hostname',
    'route',
]);
/**
 * Commands to never suggest as a wildcard prefix in the permission dialog.
 *
 * Derived from the validator lists above plus the small static shells list.
 * Add a cmdlet to the appropriate validator list and it automatically
 * appears here — no separate maintenance.
 */
exports.NEVER_SUGGEST = (function () {
    var core = new Set(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], SHELLS_AND_SPAWNERS, true), exports.FILEPATH_EXECUTION_CMDLETS, true), exports.DANGEROUS_SCRIPT_BLOCK_CMDLETS, true), exports.MODULE_LOADING_CMDLETS, true), exports.NETWORK_CMDLETS, true), exports.ALIAS_HIJACK_CMDLETS, true), exports.WMI_CIM_CMDLETS, true), exports.ARG_GATED_CMDLETS, true), [
        // ForEach-Object's -MemberName (positional: `% Delete`) resolves against
        // the runtime pipeline object — `Get-ChildItem | % Delete` invokes
        // FileInfo.Delete(). StaticParameterBinder identifies the
        // PropertyAndMethodSet parameter set, but the set handles both; the arg
        // is a plain StringConstantExpressionAst with no property/method signal.
        // Pipeline type inference (upstream OutputType → GetMember) misses ETS
        // AliasProperty members and has no answer for `$var | %` or external
        // upstream. Not in ARG_GATED (no allowlist entry to sync with).
        'foreach-object'
    ], false), dangerousPatterns_js_1.CROSS_PLATFORM_CODE_EXEC.filter(function (p) { return !p.includes(' '); }), true));
    return new Set(__spreadArray(__spreadArray([], core, true), aliasesOf(core), true));
})();
