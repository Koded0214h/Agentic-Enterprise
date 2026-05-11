"use strict";
/**
 * PowerShell permission mode validation.
 *
 * Checks if commands should be auto-allowed based on the current permission mode.
 * In acceptEdits mode, filesystem-modifying PowerShell cmdlets are auto-allowed.
 * Follows the same patterns as BashTool/modeValidation.ts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSymlinkCreatingCommand = isSymlinkCreatingCommand;
exports.checkPermissionMode = checkPermissionMode;
var parser_js_1 = require("../../utils/powershell/parser.js");
var readOnlyValidation_js_1 = require("./readOnlyValidation.js");
/**
 * Filesystem-modifying cmdlets that are auto-allowed in acceptEdits mode.
 * Stored as canonical (lowercase) cmdlet names.
 *
 * Tier 3 cmdlets with complex parameter binding removed — they fall through to
 * 'ask'. Only simple write cmdlets (first positional = -Path) are auto-allowed
 * here, and they get path validation via CMDLET_PATH_CONFIG in pathValidation.ts.
 */
var ACCEPT_EDITS_ALLOWED_CMDLETS = new Set([
    'set-content',
    'add-content',
    'remove-item',
    'clear-content',
]);
function isAcceptEditsAllowedCmdlet(name) {
    // resolveToCanonical handles aliases via COMMON_ALIASES, so e.g. 'rm' → 'remove-item',
    // 'ac' → 'add-content'. Any alias that resolves to an allowed cmdlet is automatically
    // allowed. Tier 3 cmdlets (new-item, copy-item, move-item, etc.) and their aliases
    // (mkdir, ni, cp, mv, etc.) resolve to cmdlets NOT in the set and fall through to 'ask'.
    var canonical = (0, readOnlyValidation_js_1.resolveToCanonical)(name);
    return ACCEPT_EDITS_ALLOWED_CMDLETS.has(canonical);
}
/**
 * New-Item -ItemType values that create filesystem links (reparse points or
 * hard links). All three redirect path resolution at runtime — symbolic links
 * and junctions are directory/file reparse points; hard links alias a file's
 * inode. Any of these let a later relative-path write land outside the
 * validator's view.
 */
var LINK_ITEM_TYPES = new Set(['symboliclink', 'junction', 'hardlink']);
/**
 * Check if a lowered, dash-normalized arg (colon-value stripped) is an
 * unambiguous PowerShell abbreviation of New-Item's -ItemType or -Type param.
 * Min prefixes: `-it` (avoids ambiguity with other New-Item params), `-ty`
 * (avoids `-t` colliding with `-Target`).
 */
function isItemTypeParamAbbrev(p) {
    return ((p.length >= 3 && '-itemtype'.startsWith(p)) ||
        (p.length >= 3 && '-type'.startsWith(p)));
}
/**
 * Detects New-Item creating a filesystem link (-ItemType SymbolicLink /
 * Junction / HardLink, or the -Type alias). Links poison subsequent path
 * resolution the same way Set-Location/New-PSDrive do: a relative path
 * through the link resolves to the link target, not the validator's view.
 * Finding #18.
 *
 * Handles PS parameter abbreviation (`-it`, `-ite`, ... `-itemtype`; `-ty`,
 * `-typ`, `-type`), unicode dash prefixes (en-dash/em-dash/horizontal-bar),
 * and colon-bound values (`-it:Junction`).
 */
function isSymlinkCreatingCommand(cmd) {
    var _a, _b, _c;
    var canonical = (0, readOnlyValidation_js_1.resolveToCanonical)(cmd.name);
    if (canonical !== 'new-item')
        return false;
    for (var i = 0; i < cmd.args.length; i++) {
        var raw = (_a = cmd.args[i]) !== null && _a !== void 0 ? _a : '';
        if (raw.length === 0)
            continue;
        // Normalize unicode dash prefixes (–, —, ―) and forward-slash (PS 5.1
        // parameter prefix) → ASCII `-` so prefix comparison works. PS tokenizer
        // treats all four dash chars plus `/` as parameter markers. (bug #26)
        var normalized = parser_js_1.PS_TOKENIZER_DASH_CHARS.has(raw[0]) || raw[0] === '/'
            ? '-' + raw.slice(1)
            : raw;
        var lower = normalized.toLowerCase();
        // Split colon-bound value: -it:SymbolicLink → param='-it', val='symboliclink'
        var colonIdx = lower.indexOf(':', 1);
        var paramRaw = colonIdx > 0 ? lower.slice(0, colonIdx) : lower;
        // Strip backtick escapes: -Item`Type → -ItemType (bug #22)
        var param = paramRaw.replace(/`/g, '');
        if (!isItemTypeParamAbbrev(param))
            continue;
        var rawVal = colonIdx > 0
            ? lower.slice(colonIdx + 1)
            : ((_c = (_b = cmd.args[i + 1]) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '');
        // Strip backtick escapes from colon-bound value: -it:Sym`bolicLink → symboliclink
        // Mirrors the param-name strip at L103. Space-separated args use .value
        // (backtick-resolved by .NET parser), but colon-bound uses .text (raw source).
        // Strip surrounding quotes: -it:'SymbolicLink' or -it:"Junction" (bug #6)
        var val = rawVal.replace(/`/g, '').replace(/^['"]|['"]$/g, '');
        if (LINK_ITEM_TYPES.has(val))
            return true;
    }
    return false;
}
/**
 * Checks if commands should be handled differently based on the current permission mode.
 *
 * In acceptEdits mode, auto-allows filesystem-modifying PowerShell cmdlets.
 * Uses the AST to resolve aliases before checking the allowlist.
 *
 * @param input - The PowerShell command input
 * @param parsed - The parsed AST of the command
 * @param toolPermissionContext - Context containing mode and permissions
 * @returns
 * - 'allow' if the current mode permits auto-approval
 * - 'passthrough' if no mode-specific handling applies
 */
function checkPermissionMode(input, parsed, toolPermissionContext) {
    var _a;
    // Skip bypass and dontAsk modes (handled elsewhere)
    if (toolPermissionContext.mode === 'bypassPermissions' ||
        toolPermissionContext.mode === 'dontAsk') {
        return {
            behavior: 'passthrough',
            message: 'Mode is handled in main permission flow',
        };
    }
    if (toolPermissionContext.mode !== 'acceptEdits') {
        return {
            behavior: 'passthrough',
            message: 'No mode-specific validation required',
        };
    }
    // acceptEdits mode: check if all commands are filesystem-modifying cmdlets
    if (!parsed.valid) {
        return {
            behavior: 'passthrough',
            message: 'Cannot validate mode for unparsed command',
        };
    }
    // SECURITY: Check for subexpressions, script blocks, or member invocations
    // that could be used to smuggle arbitrary code through acceptEdits mode.
    var securityFlags = (0, parser_js_1.deriveSecurityFlags)(parsed);
    if (securityFlags.hasSubExpressions ||
        securityFlags.hasScriptBlocks ||
        securityFlags.hasMemberInvocations ||
        securityFlags.hasSplatting ||
        securityFlags.hasAssignments ||
        securityFlags.hasStopParsing ||
        securityFlags.hasExpandableStrings) {
        return {
            behavior: 'passthrough',
            message: 'Command contains subexpressions, script blocks, or member invocations that require approval',
        };
    }
    var segments = (0, parser_js_1.getPipelineSegments)(parsed);
    // SECURITY: Empty segments with valid parse = no commands to check, don't auto-allow
    if (segments.length === 0) {
        return {
            behavior: 'passthrough',
            message: 'No commands found to validate for acceptEdits mode',
        };
    }
    // SECURITY: Compound cwd desync guard — BashTool parity.
    // When any statement in a compound contains Set-Location/Push-Location/Pop-Location
    // (or aliases like cd, sl, chdir, pushd, popd), the cwd changes between statements.
    // Path validation resolves relative paths against the stale process cwd, so a write
    // cmdlet in a later statement targets a different directory than the validator checked.
    // Example: `Set-Location ./.claude; Set-Content ./settings.json '...'` — the validator
    // sees ./settings.json as /project/settings.json, but PowerShell writes to
    // /project/.claude/settings.json. Refuse to auto-allow any write operation in a
    // compound that contains a cwd-changing command. This matches BashTool's
    // compoundCommandHasCd guard (BashTool/pathValidation.ts:630-655).
    var totalCommands = segments.reduce(function (sum, seg) { return sum + seg.commands.length; }, 0);
    if (totalCommands > 1) {
        var hasCdCommand = false;
        var hasSymlinkCreate = false;
        var hasWriteCommand = false;
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var seg = segments_1[_i];
            for (var _b = 0, _c = seg.commands; _b < _c.length; _b++) {
                var cmd = _c[_b];
                if (cmd.elementType !== 'CommandAst')
                    continue;
                if ((0, readOnlyValidation_js_1.isCwdChangingCmdlet)(cmd.name))
                    hasCdCommand = true;
                if (isSymlinkCreatingCommand(cmd))
                    hasSymlinkCreate = true;
                if (isAcceptEditsAllowedCmdlet(cmd.name))
                    hasWriteCommand = true;
            }
        }
        if (hasCdCommand && hasWriteCommand) {
            return {
                behavior: 'passthrough',
                message: 'Compound command contains a directory-changing command (Set-Location/Push-Location/Pop-Location) with a write operation — cannot auto-allow because path validation uses stale cwd',
            };
        }
        // SECURITY: Link-create compound guard (finding #18). Mirrors the cd
        // guard above. `New-Item -ItemType SymbolicLink -Path ./link -Value /etc;
        // Get-Content ./link/passwd` — path validation resolves ./link/passwd
        // against cwd (no link there at validation time), but runtime follows
        // the just-created link to /etc/passwd. Same TOCTOU shape as cwd desync.
        // Applies to SymbolicLink, Junction, and HardLink — all three redirect
        // path resolution at runtime.
        // No `hasWriteCommand` requirement: read-through-symlink is equally
        // dangerous (exfil via Get-Content ./link/etc/shadow), and any other
        // command using paths after a just-created link is unvalidatable.
        if (hasSymlinkCreate) {
            return {
                behavior: 'passthrough',
                message: 'Compound command creates a filesystem link (New-Item -ItemType SymbolicLink/Junction/HardLink) — cannot auto-allow because path validation cannot follow just-created links',
            };
        }
    }
    for (var _d = 0, segments_2 = segments; _d < segments_2.length; _d++) {
        var segment = segments_2[_d];
        for (var _e = 0, _f = segment.commands; _e < _f.length; _e++) {
            var cmd = _f[_e];
            if (cmd.elementType !== 'CommandAst') {
                // SECURITY: This guard is load-bearing for THREE cases. Do not narrow it.
                //
                // 1. Expression pipeline sources (designed): '/etc/passwd' | Remove-Item
                //    — the string literal is CommandExpressionAst, piped value binds to
                //    -Path. We cannot statically know what path it represents.
                //
                // 2. Control-flow statements (accidental but relied upon):
                //    foreach ($x in ...) { Remove-Item $x }. Non-PipelineAst statements
                //    produce a synthetic CommandExpressionAst entry in segment.commands
                //    (parser.ts transformStatement). Without this guard, Remove-Item $x
                //    in nestedCommands would be checked below and auto-allowed — but $x
                //    is a loop-bound variable we cannot validate.
                //
                // 3. Non-PipelineAst redirection coverage (accidental): cmd && cmd2 > /tmp
                //    also produces a synthetic element here. isReadOnlyCommand relies on
                //    the same accident (its allowlist rejects the synthetic element's
                //    full-text name), so both paths fail safe together.
                return {
                    behavior: 'passthrough',
                    message: "Pipeline contains expression source (".concat(cmd.elementType, ") that cannot be statically validated"),
                };
            }
            // SECURITY: nameType is computed from the raw name before stripModulePrefix.
            // 'application' = raw name had path chars (. \\ /). scripts\\Remove-Item
            // strips to Remove-Item and would match ACCEPT_EDITS_ALLOWED_CMDLETS below,
            // but PowerShell runs scripts\\Remove-Item.ps1. Same gate as isAllowlistedCommand.
            if (cmd.nameType === 'application') {
                return {
                    behavior: 'passthrough',
                    message: "Command '".concat(cmd.name, "' resolved from a path-like name and requires approval"),
                };
            }
            // SECURITY: elementTypes whitelist — same as isAllowlistedCommand.
            // deriveSecurityFlags above checks hasSubExpressions/etc. but does NOT
            // flag bare Variable/Other elementTypes. `Remove-Item $env:PATH`:
            //   elementTypes = ['StringConstant', 'Variable']
            //   deriveSecurityFlags: no subexpression → passes
            //   checkPathConstraints: resolves literal text '$env:PATH' as relative
            //     path → cwd/$env:PATH → inside cwd → allow
            //   RUNTIME: PowerShell expands $env:PATH → deletes actual env value path
            // isAllowlistedCommand rejects non-StringConstant/Parameter; this is the
            // acceptEdits parity gate.
            //
            // Also check colon-bound expression metachars (same as isAllowlistedCommand's
            // colon-bound check). `Remove-Item -Path:(1 > /tmp/x)`:
            //   elementTypes = ['StringConstant', 'Parameter'] — passes whitelist above
            //   deriveSecurityFlags: ParenExpressionAst in .Argument not detected by
            //     Get-SecurityPatterns (ParenExpressionAst not in FindAll filter)
            //   checkPathConstraints: literal text '-Path:(1 > /tmp/x)' not a path
            //   RUNTIME: paren evaluates, redirection writes /tmp/x → arbitrary write
            if (cmd.elementTypes) {
                for (var i = 1; i < cmd.elementTypes.length; i++) {
                    var t = cmd.elementTypes[i];
                    if (t !== 'StringConstant' && t !== 'Parameter') {
                        return {
                            behavior: 'passthrough',
                            message: "Command argument has unvalidatable type (".concat(t, ") \u2014 variable paths cannot be statically resolved"),
                        };
                    }
                    if (t === 'Parameter') {
                        // elementTypes[i] ↔ args[i-1] (elementTypes[0] is the command name).
                        var arg = (_a = cmd.args[i - 1]) !== null && _a !== void 0 ? _a : '';
                        var colonIdx = arg.indexOf(':');
                        if (colonIdx > 0 && /[$(@{[]/.test(arg.slice(colonIdx + 1))) {
                            return {
                                behavior: 'passthrough',
                                message: 'Colon-bound parameter contains an expression that cannot be statically validated',
                            };
                        }
                    }
                }
            }
            // Safe output cmdlets (Out-Null, etc.) and allowlisted pipeline-tail
            // transformers (Format-*, Measure-Object, Select-Object, etc.) don't
            // affect the semantics of the preceding command. Skip them so
            // `Remove-Item ./foo | Out-Null` or `Set-Content ./foo hi | Format-Table`
            // auto-allows the same as the bare write cmdlet. isAllowlistedPipelineTail
            // is the narrow fallback for cmdlets moved from SAFE_OUTPUT_CMDLETS to
            // CMDLET_ALLOWLIST (argLeaksValue validates their args).
            if ((0, readOnlyValidation_js_1.isSafeOutputCommand)(cmd.name) ||
                (0, readOnlyValidation_js_1.isAllowlistedPipelineTail)(cmd, input.command)) {
                continue;
            }
            if (!isAcceptEditsAllowedCmdlet(cmd.name)) {
                return {
                    behavior: 'passthrough',
                    message: "No mode-specific handling for '".concat(cmd.name, "' in acceptEdits mode"),
                };
            }
            // SECURITY: Reject commands with unclassifiable argument types. 'Other'
            // covers HashtableAst, ConvertExpressionAst, BinaryExpressionAst — all
            // can contain nested redirections or code that the parser cannot fully
            // decompose. isAllowlistedCommand (readOnlyValidation.ts) already
            // enforces this whitelist via argLeaksValue; this closes the same gap
            // in acceptEdits mode. Without this, @{k='payload' > ~/.bashrc} as a
            // -Value argument passes because HashtableAst maps to 'Other'.
            // argLeaksValue also catches colon-bound variables (-Flag:$env:SECRET).
            if ((0, readOnlyValidation_js_1.argLeaksValue)(cmd.name, cmd)) {
                return {
                    behavior: 'passthrough',
                    message: "Arguments in '".concat(cmd.name, "' cannot be statically validated in acceptEdits mode"),
                };
            }
        }
        // Also check nested commands from control flow statements
        if (segment.nestedCommands) {
            for (var _g = 0, _h = segment.nestedCommands; _g < _h.length; _g++) {
                var cmd = _h[_g];
                if (cmd.elementType !== 'CommandAst') {
                    // SECURITY: Same as above — non-CommandAst element in nested commands
                    // (control flow bodies) cannot be statically validated as a path source.
                    return {
                        behavior: 'passthrough',
                        message: "Nested expression element (".concat(cmd.elementType, ") cannot be statically validated"),
                    };
                }
                if (cmd.nameType === 'application') {
                    return {
                        behavior: 'passthrough',
                        message: "Nested command '".concat(cmd.name, "' resolved from a path-like name and requires approval"),
                    };
                }
                if ((0, readOnlyValidation_js_1.isSafeOutputCommand)(cmd.name) ||
                    (0, readOnlyValidation_js_1.isAllowlistedPipelineTail)(cmd, input.command)) {
                    continue;
                }
                if (!isAcceptEditsAllowedCmdlet(cmd.name)) {
                    return {
                        behavior: 'passthrough',
                        message: "No mode-specific handling for '".concat(cmd.name, "' in acceptEdits mode"),
                    };
                }
                // SECURITY: Same argLeaksValue check as the main command loop above.
                if ((0, readOnlyValidation_js_1.argLeaksValue)(cmd.name, cmd)) {
                    return {
                        behavior: 'passthrough',
                        message: "Arguments in nested '".concat(cmd.name, "' cannot be statically validated in acceptEdits mode"),
                    };
                }
            }
        }
    }
    // All commands are filesystem-modifying cmdlets -- auto-allow
    return {
        behavior: 'allow',
        updatedInput: input,
        decisionReason: {
            type: 'mode',
            mode: 'acceptEdits',
        },
    };
}
