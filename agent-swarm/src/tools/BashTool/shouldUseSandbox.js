"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldUseSandbox = shouldUseSandbox;
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var commands_js_1 = require("../../utils/bash/commands.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var bashPermissions_js_1 = require("./bashPermissions.js");
// NOTE: excludedCommands is a user-facing convenience feature, not a security boundary.
// It is not a security bug to be able to bypass excludedCommands — the sandbox permission
// system (which prompts users) is the actual security control.
function containsExcludedCommand(command) {
    var _a, _b;
    // Check dynamic config for disabled commands and substrings (only for ants)
    if (process.env.USER_TYPE === 'ant') {
        var disabledCommands = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_sandbox_disabled_commands', { commands: [], substrings: [] });
        // Check if command contains any disabled substrings
        for (var _i = 0, _c = disabledCommands.substrings; _i < _c.length; _i++) {
            var substring = _c[_i];
            if (command.includes(substring)) {
                return true;
            }
        }
        // Check if command starts with any disabled commands
        try {
            var commandParts = (0, commands_js_1.splitCommand_DEPRECATED)(command);
            for (var _d = 0, commandParts_1 = commandParts; _d < commandParts_1.length; _d++) {
                var part = commandParts_1[_d];
                var baseCommand = part.trim().split(' ')[0];
                if (baseCommand && disabledCommands.commands.includes(baseCommand)) {
                    return true;
                }
            }
        }
        catch (_e) {
            // If we can't parse the command (e.g., malformed bash syntax),
            // treat it as not excluded to allow other validation checks to handle it
            // This prevents crashes when rendering tool use messages
        }
    }
    // Check user-configured excluded commands from settings
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var userExcludedCommands = (_b = (_a = settings.sandbox) === null || _a === void 0 ? void 0 : _a.excludedCommands) !== null && _b !== void 0 ? _b : [];
    if (userExcludedCommands.length === 0) {
        return false;
    }
    // Split compound commands (e.g. "docker ps && curl evil.com") into individual
    // subcommands and check each one against excluded patterns. This prevents a
    // compound command from escaping the sandbox just because its first subcommand
    // matches an excluded pattern.
    var subcommands;
    try {
        subcommands = (0, commands_js_1.splitCommand_DEPRECATED)(command);
    }
    catch (_f) {
        subcommands = [command];
    }
    for (var _g = 0, subcommands_1 = subcommands; _g < subcommands_1.length; _g++) {
        var subcommand = subcommands_1[_g];
        var trimmed = subcommand.trim();
        // Also try matching with env var prefixes and wrapper commands stripped, so
        // that `FOO=bar bazel ...` and `timeout 30 bazel ...` match `bazel:*`. Not a
        // security boundary (see NOTE at top); the &&-split above already lets
        // `export FOO=bar && bazel ...` match. BINARY_HIJACK_VARS kept as a heuristic.
        //
        // We iteratively apply both stripping operations until no new candidates are
        // produced (fixed-point), matching the approach in filterRulesByContentsMatchingInput.
        // This handles interleaved patterns like `timeout 300 FOO=bar bazel run`
        // where single-pass composition would fail.
        var candidates = [trimmed];
        var seen = new Set(candidates);
        var startIdx = 0;
        while (startIdx < candidates.length) {
            var endIdx = candidates.length;
            for (var i = startIdx; i < endIdx; i++) {
                var cmd = candidates[i];
                var envStripped = (0, bashPermissions_js_1.stripAllLeadingEnvVars)(cmd, bashPermissions_js_1.BINARY_HIJACK_VARS);
                if (!seen.has(envStripped)) {
                    candidates.push(envStripped);
                    seen.add(envStripped);
                }
                var wrapperStripped = (0, bashPermissions_js_1.stripSafeWrappers)(cmd);
                if (!seen.has(wrapperStripped)) {
                    candidates.push(wrapperStripped);
                    seen.add(wrapperStripped);
                }
            }
            startIdx = endIdx;
        }
        for (var _h = 0, userExcludedCommands_1 = userExcludedCommands; _h < userExcludedCommands_1.length; _h++) {
            var pattern = userExcludedCommands_1[_h];
            var rule = (0, bashPermissions_js_1.bashPermissionRule)(pattern);
            for (var _j = 0, candidates_1 = candidates; _j < candidates_1.length; _j++) {
                var cand = candidates_1[_j];
                switch (rule.type) {
                    case 'prefix':
                        if (cand === rule.prefix || cand.startsWith(rule.prefix + ' ')) {
                            return true;
                        }
                        break;
                    case 'exact':
                        if (cand === rule.command) {
                            return true;
                        }
                        break;
                    case 'wildcard':
                        if ((0, bashPermissions_js_1.matchWildcardPattern)(rule.pattern, cand)) {
                            return true;
                        }
                        break;
                }
            }
        }
    }
    return false;
}
function shouldUseSandbox(input) {
    if (!sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled()) {
        return false;
    }
    // Don't sandbox if explicitly overridden AND unsandboxed commands are allowed by policy
    if (input.dangerouslyDisableSandbox &&
        sandbox_adapter_js_1.SandboxManager.areUnsandboxedCommandsAllowed()) {
        return false;
    }
    if (!input.command) {
        return false;
    }
    // Don't sandbox if the command contains user-configured excluded commands
    if (containsExcludedCommand(input.command)) {
        return false;
    }
    return true;
}
