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
exports.isDangerousBashPermission = isDangerousBashPermission;
exports.isDangerousPowerShellPermission = isDangerousPowerShellPermission;
exports.isDangerousTaskPermission = isDangerousTaskPermission;
exports.findDangerousClassifierPermissions = findDangerousClassifierPermissions;
exports.isOverlyBroadBashAllowRule = isOverlyBroadBashAllowRule;
exports.isOverlyBroadPowerShellAllowRule = isOverlyBroadPowerShellAllowRule;
exports.findOverlyBroadBashPermissions = findOverlyBroadBashPermissions;
exports.findOverlyBroadPowerShellPermissions = findOverlyBroadPowerShellPermissions;
exports.removeDangerousPermissions = removeDangerousPermissions;
exports.stripDangerousPermissionsForAutoMode = stripDangerousPermissionsForAutoMode;
exports.restoreDangerousPermissions = restoreDangerousPermissions;
exports.transitionPermissionMode = transitionPermissionMode;
exports.parseBaseToolsFromCLI = parseBaseToolsFromCLI;
exports.initialPermissionModeFromCLI = initialPermissionModeFromCLI;
exports.parseToolListFromCLI = parseToolListFromCLI;
exports.initializeToolPermissionContext = initializeToolPermissionContext;
exports.getAutoModeUnavailableNotification = getAutoModeUnavailableNotification;
exports.verifyAutoModeGateAccess = verifyAutoModeGateAccess;
exports.shouldDisableBypassPermissions = shouldDisableBypassPermissions;
exports.isAutoModeGateEnabled = isAutoModeGateEnabled;
exports.getAutoModeUnavailableReason = getAutoModeUnavailableReason;
exports.getAutoModeEnabledState = getAutoModeEnabledState;
exports.getAutoModeEnabledStateIfCached = getAutoModeEnabledStateIfCached;
exports.hasAutoModeOptInAnySource = hasAutoModeOptInAnySource;
exports.isBypassPermissionsModeDisabled = isBypassPermissionsModeDisabled;
exports.createDisabledBypassPermissionsContext = createDisabledBypassPermissionsContext;
exports.checkAndDisableBypassPermissions = checkAndDisableBypassPermissions;
exports.isDefaultPermissionModeAuto = isDefaultPermissionModeAuto;
exports.shouldPlanUseAutoMode = shouldPlanUseAutoMode;
exports.prepareContextForPlanMode = prepareContextForPlanMode;
exports.transitionPlanAutoMode = transitionPlanAutoMode;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cwd_js_1 = require("../cwd.js");
var envUtils_js_1 = require("../envUtils.js");
var constants_js_1 = require("../settings/constants.js");
var settings_js_1 = require("../settings/settings.js");
var PermissionMode_js_1 = require("./PermissionMode.js");
var permissions_js_1 = require("./permissions.js");
var permissionsLoader_js_1 = require("./permissionsLoader.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var autoModeStateModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('./autoModeState.js')
    : null;
var path_2 = require("path");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var validation_js_1 = require("../../commands/add-dir/validation.js");
var index_js_1 = require("../../services/analytics/index.js");
var constants_js_2 = require("../../tools/AgentTool/constants.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var toolName_js_2 = require("../../tools/PowerShellTool/toolName.js");
var tools_js_1 = require("../../tools.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var betas_js_1 = require("../betas.js");
var debug_js_1 = require("../debug.js");
var gracefulShutdown_js_1 = require("../gracefulShutdown.js");
var model_js_1 = require("../model/model.js");
var dangerousPatterns_js_1 = require("./dangerousPatterns.js");
var PermissionUpdate_js_1 = require("./PermissionUpdate.js");
var permissionRuleParser_js_1 = require("./permissionRuleParser.js");
/**
 * Checks if a Bash permission rule is dangerous for auto mode.
 * A rule is dangerous if it would auto-allow commands that execute arbitrary code,
 * bypassing the classifier's safety evaluation.
 *
 * Dangerous patterns:
 * 1. Tool-level allow (Bash with no ruleContent) - allows ALL commands
 * 2. Prefix rules for script interpreters (python:*, node:*, etc.)
 * 3. Wildcard rules matching interpreters (python*, node*, etc.)
 */
function isDangerousBashPermission(toolName, ruleContent) {
    // Only check Bash rules
    if (toolName !== toolName_js_1.BASH_TOOL_NAME) {
        return false;
    }
    // Tool-level allow (Bash with no content, or Bash(*)) - allows ALL commands
    if (ruleContent === undefined || ruleContent === '') {
        return true;
    }
    var content = ruleContent.trim().toLowerCase();
    // Standalone wildcard (*) matches everything
    if (content === '*') {
        return true;
    }
    // Check for dangerous patterns with prefix syntax (e.g., "python:*")
    // or wildcard syntax (e.g., "python*")
    for (var _i = 0, DANGEROUS_BASH_PATTERNS_1 = dangerousPatterns_js_1.DANGEROUS_BASH_PATTERNS; _i < DANGEROUS_BASH_PATTERNS_1.length; _i++) {
        var pattern = DANGEROUS_BASH_PATTERNS_1[_i];
        var lowerPattern = pattern.toLowerCase();
        // Exact match to the pattern itself (e.g., "python" as a rule)
        if (content === lowerPattern) {
            return true;
        }
        // Prefix syntax: "python:*" allows any python command
        if (content === "".concat(lowerPattern, ":*")) {
            return true;
        }
        // Wildcard at end: "python*" matches python, python3, etc.
        if (content === "".concat(lowerPattern, "*")) {
            return true;
        }
        // Wildcard with space: "python *" would match "python script.py"
        if (content === "".concat(lowerPattern, " *")) {
            return true;
        }
        // Check for patterns like "python -*" which would match "python -c 'code'"
        if (content.startsWith("".concat(lowerPattern, " -")) && content.endsWith('*')) {
            return true;
        }
    }
    return false;
}
/**
 * Checks if a PowerShell permission rule is dangerous for auto mode.
 * A rule is dangerous if it would auto-allow commands that execute arbitrary
 * code (nested shells, Invoke-Expression, Start-Process, etc.), bypassing the
 * classifier's safety evaluation.
 *
 * PowerShell is case-insensitive, so rule content is lowercased before matching.
 */
function isDangerousPowerShellPermission(toolName, ruleContent) {
    if (toolName !== toolName_js_2.POWERSHELL_TOOL_NAME) {
        return false;
    }
    // Tool-level allow (PowerShell with no content, or PowerShell(*)) - allows ALL commands
    if (ruleContent === undefined || ruleContent === '') {
        return true;
    }
    var content = ruleContent.trim().toLowerCase();
    // Standalone wildcard (*) matches everything
    if (content === '*') {
        return true;
    }
    // PS-specific cmdlet names. CROSS_PLATFORM_CODE_EXEC is shared with bash.
    var patterns = __spreadArray(__spreadArray([], dangerousPatterns_js_1.CROSS_PLATFORM_CODE_EXEC, true), [
        // Nested PS + shells launchable from PS
        'pwsh',
        'powershell',
        'cmd',
        'wsl',
        // String/scriptblock evaluators
        'iex',
        'invoke-expression',
        'icm',
        'invoke-command',
        // Process spawners
        'start-process',
        'saps',
        'start',
        'start-job',
        'sajb',
        'start-threadjob', // bundled PS 6.1+; takes -ScriptBlock like Start-Job
        // Event/session code exec
        'register-objectevent',
        'register-engineevent',
        'register-wmievent',
        'register-scheduledjob',
        'new-pssession',
        'nsn', // alias
        'enter-pssession',
        'etsn', // alias
        // .NET escape hatches
        'add-type', // Add-Type -TypeDefinition '<C#>' → P/Invoke
        'new-object', // New-Object -ComObject WScript.Shell → .Run()
    ], false);
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        // patterns stored lowercase; content lowercased above
        if (content === pattern)
            return true;
        if (content === "".concat(pattern, ":*"))
            return true;
        if (content === "".concat(pattern, "*"))
            return true;
        if (content === "".concat(pattern, " *"))
            return true;
        if (content.startsWith("".concat(pattern, " -")) && content.endsWith('*'))
            return true;
        // .exe — goes on the FIRST word. `python` → `python.exe`.
        // `npm run` → `npm.exe run` (npm.exe is the real Windows binary name).
        // A rule like `PowerShell(npm.exe run:*)` needs to match `npm run`.
        var sp = pattern.indexOf(' ');
        var exe = sp === -1
            ? "".concat(pattern, ".exe")
            : "".concat(pattern.slice(0, sp), ".exe").concat(pattern.slice(sp));
        if (content === exe)
            return true;
        if (content === "".concat(exe, ":*"))
            return true;
        if (content === "".concat(exe, "*"))
            return true;
        if (content === "".concat(exe, " *"))
            return true;
        if (content.startsWith("".concat(exe, " -")) && content.endsWith('*'))
            return true;
    }
    return false;
}
/**
 * Checks if an Agent (sub-agent) permission rule is dangerous for auto mode.
 * Any Agent allow rule would auto-approve sub-agent spawns before the auto mode classifier
 * can evaluate the sub-agent's prompt, defeating delegation attack prevention.
 */
function isDangerousTaskPermission(toolName, _ruleContent) {
    return (0, permissionRuleParser_js_1.normalizeLegacyToolName)(toolName) === constants_js_2.AGENT_TOOL_NAME;
}
function formatPermissionSource(source) {
    if (constants_js_1.SETTING_SOURCES.includes(source)) {
        var filePath = (0, settings_js_1.getSettingsFilePathForSource)(source);
        if (filePath) {
            var relativePath = (0, path_1.relative)((0, cwd_js_1.getCwd)(), filePath);
            return relativePath.length < filePath.length ? relativePath : filePath;
        }
    }
    return source;
}
/**
 * Checks if a permission rule is dangerous for auto mode.
 * A rule is dangerous if it would auto-allow actions before the auto mode classifier
 * can evaluate them, bypassing safety checks.
 */
function isDangerousClassifierPermission(toolName, ruleContent) {
    if (process.env.USER_TYPE === 'ant') {
        // Tmux send-keys executes arbitrary shell, bypassing the classifier same as Bash(*)
        if (toolName === 'Tmux')
            return true;
    }
    return (isDangerousBashPermission(toolName, ruleContent) ||
        isDangerousPowerShellPermission(toolName, ruleContent) ||
        isDangerousTaskPermission(toolName, ruleContent));
}
/**
 * Finds all dangerous permissions from rules loaded from disk and CLI arguments.
 * Returns structured info about each dangerous permission found.
 *
 * Checks Bash permissions (wildcard/interpreter patterns), PowerShell permissions
 * (wildcard/iex/Start-Process patterns), and Agent permissions (any allow rule
 * bypasses the classifier's sub-agent evaluation).
 */
function findDangerousClassifierPermissions(rules, cliAllowedTools) {
    var _a;
    var dangerous = [];
    // Check rules loaded from settings
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        if (rule.ruleBehavior === 'allow' &&
            isDangerousClassifierPermission(rule.ruleValue.toolName, rule.ruleValue.ruleContent)) {
            var ruleString = rule.ruleValue.ruleContent
                ? "".concat(rule.ruleValue.toolName, "(").concat(rule.ruleValue.ruleContent, ")")
                : "".concat(rule.ruleValue.toolName, "(*)");
            dangerous.push({
                ruleValue: rule.ruleValue,
                source: rule.source,
                ruleDisplay: ruleString,
                sourceDisplay: formatPermissionSource(rule.source),
            });
        }
    }
    // Check CLI --allowed-tools arguments
    for (var _b = 0, cliAllowedTools_1 = cliAllowedTools; _b < cliAllowedTools_1.length; _b++) {
        var toolSpec = cliAllowedTools_1[_b];
        // Parse tool spec: "Bash" or "Bash(pattern)" or "Agent" or "Agent(subagent_type)"
        var match = toolSpec.match(/^([^(]+)(?:\(([^)]*)\))?$/);
        if (match) {
            var toolName = match[1].trim();
            var ruleContent = (_a = match[2]) === null || _a === void 0 ? void 0 : _a.trim();
            if (isDangerousClassifierPermission(toolName, ruleContent)) {
                dangerous.push({
                    ruleValue: { toolName: toolName, ruleContent: ruleContent },
                    source: 'cliArg',
                    ruleDisplay: ruleContent ? toolSpec : "".concat(toolName, "(*)"),
                    sourceDisplay: '--allowed-tools',
                });
            }
        }
    }
    return dangerous;
}
/**
 * Checks if a Bash allow rule is overly broad (equivalent to YOLO mode).
 * Returns true for tool-level Bash allow rules with no content restriction,
 * which auto-allow every bash command.
 *
 * Matches: Bash, Bash(*), Bash() — all parse to { toolName: 'Bash' } with no ruleContent.
 */
function isOverlyBroadBashAllowRule(ruleValue) {
    return (ruleValue.toolName === toolName_js_1.BASH_TOOL_NAME && ruleValue.ruleContent === undefined);
}
/**
 * PowerShell equivalent of isOverlyBroadBashAllowRule.
 *
 * Matches: PowerShell, PowerShell(*), PowerShell() — all parse to
 * { toolName: 'PowerShell' } with no ruleContent.
 */
function isOverlyBroadPowerShellAllowRule(ruleValue) {
    return (ruleValue.toolName === toolName_js_2.POWERSHELL_TOOL_NAME &&
        ruleValue.ruleContent === undefined);
}
/**
 * Finds all overly broad Bash allow rules from settings and CLI arguments.
 * An overly broad rule allows ALL bash commands (e.g., Bash or Bash(*)),
 * which is effectively equivalent to YOLO/bypass-permissions mode.
 */
function findOverlyBroadBashPermissions(rules, cliAllowedTools) {
    var overlyBroad = [];
    for (var _i = 0, rules_2 = rules; _i < rules_2.length; _i++) {
        var rule = rules_2[_i];
        if (rule.ruleBehavior === 'allow' &&
            isOverlyBroadBashAllowRule(rule.ruleValue)) {
            overlyBroad.push({
                ruleValue: rule.ruleValue,
                source: rule.source,
                ruleDisplay: "".concat(toolName_js_1.BASH_TOOL_NAME, "(*)"),
                sourceDisplay: formatPermissionSource(rule.source),
            });
        }
    }
    for (var _a = 0, cliAllowedTools_2 = cliAllowedTools; _a < cliAllowedTools_2.length; _a++) {
        var toolSpec = cliAllowedTools_2[_a];
        var parsed = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(toolSpec);
        if (isOverlyBroadBashAllowRule(parsed)) {
            overlyBroad.push({
                ruleValue: parsed,
                source: 'cliArg',
                ruleDisplay: "".concat(toolName_js_1.BASH_TOOL_NAME, "(*)"),
                sourceDisplay: '--allowed-tools',
            });
        }
    }
    return overlyBroad;
}
/**
 * PowerShell equivalent of findOverlyBroadBashPermissions.
 */
function findOverlyBroadPowerShellPermissions(rules, cliAllowedTools) {
    var overlyBroad = [];
    for (var _i = 0, rules_3 = rules; _i < rules_3.length; _i++) {
        var rule = rules_3[_i];
        if (rule.ruleBehavior === 'allow' &&
            isOverlyBroadPowerShellAllowRule(rule.ruleValue)) {
            overlyBroad.push({
                ruleValue: rule.ruleValue,
                source: rule.source,
                ruleDisplay: "".concat(toolName_js_2.POWERSHELL_TOOL_NAME, "(*)"),
                sourceDisplay: formatPermissionSource(rule.source),
            });
        }
    }
    for (var _a = 0, cliAllowedTools_3 = cliAllowedTools; _a < cliAllowedTools_3.length; _a++) {
        var toolSpec = cliAllowedTools_3[_a];
        var parsed = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(toolSpec);
        if (isOverlyBroadPowerShellAllowRule(parsed)) {
            overlyBroad.push({
                ruleValue: parsed,
                source: 'cliArg',
                ruleDisplay: "".concat(toolName_js_2.POWERSHELL_TOOL_NAME, "(*)"),
                sourceDisplay: '--allowed-tools',
            });
        }
    }
    return overlyBroad;
}
/**
 * Type guard to check if a PermissionRuleSource is a valid PermissionUpdateDestination.
 * Sources like 'flagSettings', 'policySettings', and 'command' are not valid destinations.
 */
function isPermissionUpdateDestination(source) {
    return [
        'userSettings',
        'projectSettings',
        'localSettings',
        'session',
        'cliArg',
    ].includes(source);
}
/**
 * Removes dangerous permissions from the in-memory context, and optionally
 * persists the removal to settings files on disk.
 */
function removeDangerousPermissions(context, dangerousPermissions) {
    // Group dangerous rules by their source (destination for updates)
    var rulesBySource = new Map();
    for (var _i = 0, dangerousPermissions_1 = dangerousPermissions; _i < dangerousPermissions_1.length; _i++) {
        var perm = dangerousPermissions_1[_i];
        // Skip sources that can't be persisted (flagSettings, policySettings, command)
        if (!isPermissionUpdateDestination(perm.source)) {
            continue;
        }
        var destination = perm.source;
        var existing = rulesBySource.get(destination) || [];
        existing.push(perm.ruleValue);
        rulesBySource.set(destination, existing);
    }
    var updatedContext = context;
    for (var _a = 0, rulesBySource_1 = rulesBySource; _a < rulesBySource_1.length; _a++) {
        var _b = rulesBySource_1[_a], destination = _b[0], rules = _b[1];
        updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(updatedContext, {
            type: 'removeRules',
            rules: rules,
            behavior: 'allow',
            destination: destination,
        });
    }
    return updatedContext;
}
/**
 * Prepares a ToolPermissionContext for auto mode by stripping
 * dangerous permissions that would bypass the classifier.
 * Returns the cleaned context (with mode unchanged — caller sets the mode).
 */
function stripDangerousPermissionsForAutoMode(context) {
    var _a, _b;
    var _c;
    var rules = [];
    for (var _i = 0, _d = Object.entries(context.alwaysAllowRules); _i < _d.length; _i++) {
        var _e = _d[_i], source = _e[0], ruleStrings = _e[1];
        if (!ruleStrings) {
            continue;
        }
        for (var _f = 0, ruleStrings_1 = ruleStrings; _f < ruleStrings_1.length; _f++) {
            var ruleString = ruleStrings_1[_f];
            var ruleValue = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ruleString);
            rules.push({
                source: source,
                ruleBehavior: 'allow',
                ruleValue: ruleValue,
            });
        }
    }
    var dangerousPermissions = findDangerousClassifierPermissions(rules, []);
    if (dangerousPermissions.length === 0) {
        return __assign(__assign({}, context), { strippedDangerousRules: (_a = context.strippedDangerousRules) !== null && _a !== void 0 ? _a : {} });
    }
    for (var _g = 0, dangerousPermissions_2 = dangerousPermissions; _g < dangerousPermissions_2.length; _g++) {
        var permission = dangerousPermissions_2[_g];
        (0, debug_js_1.logForDebugging)("Ignoring dangerous permission ".concat(permission.ruleDisplay, " from ").concat(permission.sourceDisplay, " (bypasses classifier)"));
    }
    // Mirror removeDangerousPermissions' source filter so stash == what was actually removed.
    var stripped = {};
    for (var _h = 0, dangerousPermissions_3 = dangerousPermissions; _h < dangerousPermissions_3.length; _h++) {
        var perm = dangerousPermissions_3[_h];
        if (!isPermissionUpdateDestination(perm.source))
            continue;
        ((_b = stripped[_c = perm.source]) !== null && _b !== void 0 ? _b : (stripped[_c] = [])).push((0, permissionRuleParser_js_1.permissionRuleValueToString)(perm.ruleValue));
    }
    return __assign(__assign({}, removeDangerousPermissions(context, dangerousPermissions)), { strippedDangerousRules: stripped });
}
/**
 * Restores dangerous allow rules previously stashed by
 * stripDangerousPermissionsForAutoMode. Called when leaving auto mode so that
 * the user's Bash(python:*), Agent(*), etc. rules work again in default mode.
 * Clears the stash so a second exit is a no-op.
 */
function restoreDangerousPermissions(context) {
    var stash = context.strippedDangerousRules;
    if (!stash) {
        return context;
    }
    var result = context;
    for (var _i = 0, _a = Object.entries(stash); _i < _a.length; _i++) {
        var _b = _a[_i], source = _b[0], ruleStrings = _b[1];
        if (!ruleStrings || ruleStrings.length === 0)
            continue;
        result = (0, PermissionUpdate_js_1.applyPermissionUpdate)(result, {
            type: 'addRules',
            rules: ruleStrings.map(permissionRuleParser_js_1.permissionRuleValueFromString),
            behavior: 'allow',
            destination: source,
        });
    }
    return __assign(__assign({}, result), { strippedDangerousRules: undefined });
}
/**
 * Handles all state transitions when switching permission modes.
 * Centralises side-effects so that every activation path (CLI Shift+Tab,
 * SDK control messages, etc.) behaves identically.
 *
 * Currently handles:
 * - Plan mode enter/exit attachments (via handlePlanModeTransition)
 * - Auto mode activation: setAutoModeActive, stripDangerousPermissionsForAutoMode
 *
 * Returns the (possibly modified) context. Caller is responsible for setting
 * the mode on the returned context.
 *
 * @param fromMode The current permission mode
 * @param toMode The target permission mode
 * @param context The current tool permission context
 */
function transitionPermissionMode(fromMode, toMode, context) {
    var _a;
    // plan→plan (SDK set_permission_mode) would wrongly hit the leave branch below
    if (fromMode === toMode)
        return context;
    (0, state_js_1.handlePlanModeTransition)(fromMode, toMode);
    (0, state_js_1.handleAutoModeTransition)(fromMode, toMode);
    if (fromMode === 'plan' && toMode !== 'plan') {
        (0, state_js_1.setHasExitedPlanMode)(true);
    }
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        if (toMode === 'plan' && fromMode !== 'plan') {
            return prepareContextForPlanMode(context);
        }
        // Plan with auto active counts as using the classifier (for the leaving side).
        // isAutoModeActive() is the authoritative signal — prePlanMode/strippedDangerousRules
        // are unreliable proxies because auto can be deactivated mid-plan (non-opt-in
        // entry, transitionPlanAutoMode) while those fields remain set/unset.
        var fromUsesClassifier = fromMode === 'auto' ||
            (fromMode === 'plan' &&
                ((_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _a !== void 0 ? _a : false));
        var toUsesClassifier = toMode === 'auto'; // plan entry handled above
        if (toUsesClassifier && !fromUsesClassifier) {
            if (!isAutoModeGateEnabled()) {
                throw new Error('Cannot transition to auto mode: gate is not enabled');
            }
            autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(true);
            context = stripDangerousPermissionsForAutoMode(context);
        }
        else if (fromUsesClassifier && !toUsesClassifier) {
            autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(false);
            (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
            context = restoreDangerousPermissions(context);
        }
    }
    // Only spread if there's something to clear (preserves ref equality)
    if (fromMode === 'plan' && toMode !== 'plan' && context.prePlanMode) {
        return __assign(__assign({}, context), { prePlanMode: undefined });
    }
    return context;
}
/**
 * Parse base tools specification from CLI
 * Handles both preset names (default, none) and custom tool lists
 */
function parseBaseToolsFromCLI(baseTools) {
    // Join all array elements and check if it's a single preset name
    var joinedInput = baseTools.join(' ').trim();
    var preset = (0, tools_js_1.parseToolPreset)(joinedInput);
    if (preset) {
        return (0, tools_js_1.getToolsForDefaultPreset)();
    }
    // Parse as a custom tool list using the same parsing logic as allowedTools/disallowedTools
    var parsedTools = parseToolListFromCLI(baseTools);
    return parsedTools;
}
/**
 * Check if processPwd is a symlink that resolves to originalCwd
 */
function isSymlinkTo(_a) {
    var processPwd = _a.processPwd, originalCwd = _a.originalCwd;
    // Use safeResolvePath to check if processPwd is a symlink and get its resolved path
    var _b = (0, fsOperations_js_1.safeResolvePath)((0, fsOperations_js_1.getFsImplementation)(), processPwd), resolvedProcessPwd = _b.resolvedPath, isProcessPwdSymlink = _b.isSymlink;
    return isProcessPwdSymlink
        ? resolvedProcessPwd === (0, path_2.resolve)(originalCwd)
        : false;
}
/**
 * Safely convert CLI flags to a PermissionMode
 */
function initialPermissionModeFromCLI(_a) {
    var _b, _c;
    var permissionModeCli = _a.permissionModeCli, dangerouslySkipPermissions = _a.dangerouslySkipPermissions;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    // Check GrowthBook gate first - highest precedence
    var growthBookDisableBypassPermissionsMode = (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_disable_bypass_permissions_mode');
    // Then check settings - lower precedence
    var settingsDisableBypassPermissionsMode = ((_b = settings.permissions) === null || _b === void 0 ? void 0 : _b.disableBypassPermissionsMode) === 'disable';
    // Statsig gate takes precedence over settings
    var disableBypassPermissionsMode = growthBookDisableBypassPermissionsMode ||
        settingsDisableBypassPermissionsMode;
    // Sync circuit-breaker check (cached GB read). Prevents the
    // AutoModeOptInDialog from showing in showSetupScreens() when auto can't
    // actually be entered. autoModeFlagCli still carries intent through to
    // verifyAutoModeGateAccess, which notifies the user why.
    var autoModeCircuitBrokenSync = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
        ? getAutoModeEnabledStateIfCached() === 'disabled'
        : false;
    // Modes in order of priority
    var orderedModes = [];
    var notification;
    if (dangerouslySkipPermissions) {
        orderedModes.push('bypassPermissions');
    }
    if (permissionModeCli) {
        var parsedMode = (0, PermissionMode_js_1.permissionModeFromString)(permissionModeCli);
        if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && parsedMode === 'auto') {
            if (autoModeCircuitBrokenSync) {
                (0, debug_js_1.logForDebugging)('auto mode circuit breaker active (cached) — falling back to default', { level: 'warn' });
            }
            else {
                orderedModes.push('auto');
            }
        }
        else {
            orderedModes.push(parsedMode);
        }
    }
    if ((_c = settings.permissions) === null || _c === void 0 ? void 0 : _c.defaultMode) {
        var settingsMode = settings.permissions.defaultMode;
        // CCR only supports acceptEdits and plan — ignore other defaultModes from
        // settings (e.g. bypassPermissions would otherwise silently grant full
        // access in a remote environment).
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
            !['acceptEdits', 'plan', 'default'].includes(settingsMode)) {
            (0, debug_js_1.logForDebugging)("settings defaultMode \"".concat(settingsMode, "\" is not supported in CLAUDE_CODE_REMOTE \u2014 only acceptEdits and plan are allowed"), { level: 'warn' });
            (0, index_js_1.logEvent)('tengu_ccr_unsupported_default_mode_ignored', {
                mode: settingsMode,
            });
        }
        // auto from settings requires the same gate check as from CLI
        else if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && settingsMode === 'auto') {
            if (autoModeCircuitBrokenSync) {
                (0, debug_js_1.logForDebugging)('auto mode circuit breaker active (cached) — falling back to default', { level: 'warn' });
            }
            else {
                orderedModes.push('auto');
            }
        }
        else {
            orderedModes.push(settingsMode);
        }
    }
    var result;
    for (var _i = 0, orderedModes_1 = orderedModes; _i < orderedModes_1.length; _i++) {
        var mode = orderedModes_1[_i];
        if (mode === 'bypassPermissions' && disableBypassPermissionsMode) {
            if (growthBookDisableBypassPermissionsMode) {
                (0, debug_js_1.logForDebugging)('bypassPermissions mode is disabled by Statsig gate', {
                    level: 'warn',
                });
                notification =
                    'Bypass permissions mode was disabled by your organization policy';
            }
            else {
                (0, debug_js_1.logForDebugging)('bypassPermissions mode is disabled by settings', {
                    level: 'warn',
                });
                notification = 'Bypass permissions mode was disabled by settings';
            }
            continue; // Skip this mode if it's disabled
        }
        result = { mode: mode, notification: notification }; // Use the first valid mode
        break;
    }
    if (!result) {
        result = { mode: 'default', notification: notification };
    }
    if (!result) {
        result = { mode: 'default', notification: notification };
    }
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && result.mode === 'auto') {
        autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(true);
    }
    return result;
}
function parseToolListFromCLI(tools) {
    if (tools.length === 0) {
        return [];
    }
    var result = [];
    // Process each string in the array
    for (var _i = 0, tools_1 = tools; _i < tools_1.length; _i++) {
        var toolString = tools_1[_i];
        if (!toolString)
            continue;
        var current = '';
        var isInParens = false;
        // Parse each character in the string
        for (var _a = 0, toolString_1 = toolString; _a < toolString_1.length; _a++) {
            var char = toolString_1[_a];
            switch (char) {
                case '(':
                    isInParens = true;
                    current += char;
                    break;
                case ')':
                    isInParens = false;
                    current += char;
                    break;
                case ',':
                    if (isInParens) {
                        current += char;
                    }
                    else {
                        // Comma separator - push current tool and start new one
                        if (current.trim()) {
                            result.push(current.trim());
                        }
                        current = '';
                    }
                    break;
                case ' ':
                    if (isInParens) {
                        current += char;
                    }
                    else if (current.trim()) {
                        // Space separator - push current tool and start new one
                        result.push(current.trim());
                        current = '';
                    }
                    break;
                default:
                    current += char;
            }
        }
        // Push any remaining tool
        if (current.trim()) {
            result.push(current.trim());
        }
    }
    return result;
}
function initializeToolPermissionContext(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var parsedAllowedToolsCli, parsedDisallowedToolsCli, baseToolsResult, baseToolsSet_1, allToolNames, toolsToDisallow, warnings, additionalWorkingDirectories, processPwd, growthBookDisableBypassPermissionsMode, settings, settingsDisableBypassPermissionsMode, isBypassPermissionsModeAvailable, rulesFromDisk, overlyBroadBashPermissions, dangerousPermissions, toolPermissionContext, allAdditionalDirectories, validationResults, _i, validationResults_1, result;
        var _c, _d;
        var allowedToolsCli = _b.allowedToolsCli, disallowedToolsCli = _b.disallowedToolsCli, baseToolsCli = _b.baseToolsCli, permissionMode = _b.permissionMode, allowDangerouslySkipPermissions = _b.allowDangerouslySkipPermissions, addDirs = _b.addDirs;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    parsedAllowedToolsCli = parseToolListFromCLI(allowedToolsCli).map(function (rule) { return (0, permissionRuleParser_js_1.permissionRuleValueToString)((0, permissionRuleParser_js_1.permissionRuleValueFromString)(rule)); });
                    parsedDisallowedToolsCli = parseToolListFromCLI(disallowedToolsCli);
                    // If base tools are specified, automatically deny all tools NOT in the base set
                    // We need to check if base tools were explicitly provided (not just empty default)
                    if (baseToolsCli && baseToolsCli.length > 0) {
                        baseToolsResult = parseBaseToolsFromCLI(baseToolsCli);
                        baseToolsSet_1 = new Set(baseToolsResult.map(permissionRuleParser_js_1.normalizeLegacyToolName));
                        allToolNames = (0, tools_js_1.getToolsForDefaultPreset)();
                        toolsToDisallow = allToolNames.filter(function (tool) { return !baseToolsSet_1.has(tool); });
                        parsedDisallowedToolsCli = __spreadArray(__spreadArray([], parsedDisallowedToolsCli, true), toolsToDisallow, true);
                    }
                    warnings = [];
                    additionalWorkingDirectories = new Map();
                    processPwd = process.env.PWD;
                    if (processPwd &&
                        processPwd !== (0, state_js_1.getOriginalCwd)() &&
                        isSymlinkTo({ originalCwd: (0, state_js_1.getOriginalCwd)(), processPwd: processPwd })) {
                        additionalWorkingDirectories.set(processPwd, {
                            path: processPwd,
                            source: 'session',
                        });
                    }
                    growthBookDisableBypassPermissionsMode = (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_disable_bypass_permissions_mode');
                    settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
                    settingsDisableBypassPermissionsMode = ((_c = settings.permissions) === null || _c === void 0 ? void 0 : _c.disableBypassPermissionsMode) === 'disable';
                    isBypassPermissionsModeAvailable = (permissionMode === 'bypassPermissions' ||
                        allowDangerouslySkipPermissions) &&
                        !growthBookDisableBypassPermissionsMode &&
                        !settingsDisableBypassPermissionsMode;
                    rulesFromDisk = (0, permissionsLoader_js_1.loadAllPermissionRulesFromDisk)();
                    overlyBroadBashPermissions = [];
                    if (process.env.USER_TYPE === 'ant' &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
                        process.env.CLAUDE_CODE_ENTRYPOINT !== 'local-agent') {
                        overlyBroadBashPermissions = __spreadArray(__spreadArray([], findOverlyBroadBashPermissions(rulesFromDisk, parsedAllowedToolsCli), true), findOverlyBroadPowerShellPermissions(rulesFromDisk, parsedAllowedToolsCli), true);
                    }
                    dangerousPermissions = [];
                    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') && permissionMode === 'auto') {
                        dangerousPermissions = findDangerousClassifierPermissions(rulesFromDisk, parsedAllowedToolsCli);
                    }
                    toolPermissionContext = (0, permissions_js_1.applyPermissionRulesToPermissionContext)(__assign({ mode: permissionMode, additionalWorkingDirectories: additionalWorkingDirectories, alwaysAllowRules: { cliArg: parsedAllowedToolsCli }, alwaysDenyRules: { cliArg: parsedDisallowedToolsCli }, alwaysAskRules: {}, isBypassPermissionsModeAvailable: isBypassPermissionsModeAvailable }, ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
                        ? { isAutoModeAvailable: isAutoModeGateEnabled() }
                        : {})), rulesFromDisk);
                    allAdditionalDirectories = __spreadArray(__spreadArray([], (((_d = settings.permissions) === null || _d === void 0 ? void 0 : _d.additionalDirectories) || []), true), addDirs, true);
                    return [4 /*yield*/, Promise.all(allAdditionalDirectories.map(function (dir) {
                            return (0, validation_js_1.validateDirectoryForWorkspace)(dir, toolPermissionContext);
                        }))];
                case 1:
                    validationResults = _e.sent();
                    for (_i = 0, validationResults_1 = validationResults; _i < validationResults_1.length; _i++) {
                        result = validationResults_1[_i];
                        if (result.resultType === 'success') {
                            toolPermissionContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(toolPermissionContext, {
                                type: 'addDirectories',
                                directories: [result.absolutePath],
                                destination: 'cliArg',
                            });
                        }
                        else if (result.resultType !== 'alreadyInWorkingDirectory' &&
                            result.resultType !== 'pathNotFound') {
                            // Warn for actual config mistakes (e.g. specifying a file instead of a
                            // directory). But if the directory doesn't exist anymore (e.g. someone
                            // was working under /tmp and it got cleared), silently skip. They'll get
                            // prompted again if they try to access it later.
                            warnings.push((0, validation_js_1.addDirHelpMessage)(result));
                        }
                    }
                    return [2 /*return*/, {
                            toolPermissionContext: toolPermissionContext,
                            warnings: warnings,
                            dangerousPermissions: dangerousPermissions,
                            overlyBroadBashPermissions: overlyBroadBashPermissions,
                        }];
            }
        });
    });
}
function getAutoModeUnavailableNotification(reason) {
    var base;
    switch (reason) {
        case 'settings':
            base = 'auto mode disabled by settings';
            break;
        case 'circuit-breaker':
            base = 'auto mode is unavailable for your plan';
            break;
        case 'model':
            base = 'auto mode unavailable for this model';
            break;
    }
    return process.env.USER_TYPE === 'ant'
        ? "".concat(base, " \u00B7 #claude-code-feedback")
        : base;
}
/**
 * Async check of auto mode availability.
 *
 * Returns a transform function (not a pre-computed context) that callers
 * apply inside setAppState(prev => ...) against the CURRENT context. This
 * prevents the async GrowthBook await from clobbering mid-turn mode changes
 * (e.g., user shift-tabs to acceptEdits while this check is in flight).
 *
 * The transform re-checks mode/prePlanMode against the fresh ctx to avoid
 * kicking the user out of a mode they've already left during the await.
 */
function verifyAutoModeGateAccess(currentContext, 
// Runtime AppState.fastMode — passed from callers with AppState access so
// the disableFastMode circuit breaker reads current state, not stale
// settings.fastMode (which is intentionally sticky across /model auto-
// downgrades). Optional for callers without AppState (e.g. SDK init paths).
fastMode) {
    return __awaiter(this, void 0, void 0, function () {
        var autoModeConfig, enabledState, disabledBySettings, mainModel, disableFastModeBreakerFires, modelSupported, carouselAvailable, canEnterAuto, autoModeFlagCli, setAvailable, reason, notification, kickOutOfAutoIfNeeded, wasInAuto, autoActiveDuringPlan, wantedAuto;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)('tengu_auto_mode_config', {})];
                case 1:
                    autoModeConfig = _b.sent();
                    enabledState = parseAutoModeEnabledState(autoModeConfig === null || autoModeConfig === void 0 ? void 0 : autoModeConfig.enabled);
                    disabledBySettings = isAutoModeDisabledBySettings();
                    // Treat settings-disable the same as GrowthBook 'disabled' for circuit-breaker
                    // semantics — blocks SDK/explicit re-entry via isAutoModeGateEnabled().
                    autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeCircuitBroken(enabledState === 'disabled' || disabledBySettings);
                    mainModel = (0, model_js_1.getMainLoopModel)();
                    disableFastModeBreakerFires = !!(autoModeConfig === null || autoModeConfig === void 0 ? void 0 : autoModeConfig.disableFastMode) &&
                        (!!fastMode ||
                            (process.env.USER_TYPE === 'ant' &&
                                mainModel.toLowerCase().includes('-fast')));
                    modelSupported = (0, betas_js_1.modelSupportsAutoMode)(mainModel) && !disableFastModeBreakerFires;
                    carouselAvailable = false;
                    if (enabledState !== 'disabled' && !disabledBySettings && modelSupported) {
                        carouselAvailable =
                            enabledState === 'enabled' || hasAutoModeOptInAnySource();
                    }
                    canEnterAuto = enabledState !== 'disabled' && !disabledBySettings && modelSupported;
                    (0, debug_js_1.logForDebugging)("[auto-mode] verifyAutoModeGateAccess: enabledState=".concat(enabledState, " disabledBySettings=").concat(disabledBySettings, " model=").concat(mainModel, " modelSupported=").concat(modelSupported, " disableFastModeBreakerFires=").concat(disableFastModeBreakerFires, " carouselAvailable=").concat(carouselAvailable, " canEnterAuto=").concat(canEnterAuto));
                    autoModeFlagCli = (_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.getAutoModeFlagCli()) !== null && _a !== void 0 ? _a : false;
                    setAvailable = function (ctx, available) {
                        if (ctx.isAutoModeAvailable !== available) {
                            (0, debug_js_1.logForDebugging)("[auto-mode] verifyAutoModeGateAccess setAvailable: ".concat(ctx.isAutoModeAvailable, " -> ").concat(available));
                        }
                        return ctx.isAutoModeAvailable === available
                            ? ctx
                            : __assign(__assign({}, ctx), { isAutoModeAvailable: available });
                    };
                    if (canEnterAuto) {
                        return [2 /*return*/, { updateContext: function (ctx) { return setAvailable(ctx, carouselAvailable); } }];
                    }
                    if (disabledBySettings) {
                        reason = 'settings';
                        (0, debug_js_1.logForDebugging)('auto mode disabled: disableAutoMode in settings', {
                            level: 'warn',
                        });
                    }
                    else if (enabledState === 'disabled') {
                        reason = 'circuit-breaker';
                        (0, debug_js_1.logForDebugging)('auto mode disabled: tengu_auto_mode_config.enabled === "disabled" (circuit breaker)', { level: 'warn' });
                    }
                    else {
                        reason = 'model';
                        (0, debug_js_1.logForDebugging)("auto mode disabled: model ".concat((0, model_js_1.getMainLoopModel)(), " does not support auto mode"), { level: 'warn' });
                    }
                    notification = getAutoModeUnavailableNotification(reason);
                    kickOutOfAutoIfNeeded = function (ctx) {
                        var inAuto = ctx.mode === 'auto';
                        (0, debug_js_1.logForDebugging)("[auto-mode] kickOutOfAutoIfNeeded applying: ctx.mode=".concat(ctx.mode, " ctx.prePlanMode=").concat(ctx.prePlanMode, " reason=").concat(reason));
                        // Plan mode with auto active: either from prePlanMode='auto' (entered
                        // from auto) or from opt-in (strippedDangerousRules present).
                        var inPlanWithAutoActive = ctx.mode === 'plan' &&
                            (ctx.prePlanMode === 'auto' || !!ctx.strippedDangerousRules);
                        if (!inAuto && !inPlanWithAutoActive) {
                            return setAvailable(ctx, false);
                        }
                        if (inAuto) {
                            autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(false);
                            (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
                            return __assign(__assign({}, (0, PermissionUpdate_js_1.applyPermissionUpdate)(restoreDangerousPermissions(ctx), {
                                type: 'setMode',
                                mode: 'default',
                                destination: 'session',
                            })), { isAutoModeAvailable: false });
                        }
                        // Plan with auto active: deactivate auto, restore permissions, defuse
                        // prePlanMode so ExitPlanMode goes to default.
                        autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(false);
                        (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
                        return __assign(__assign({}, restoreDangerousPermissions(ctx)), { prePlanMode: ctx.prePlanMode === 'auto' ? 'default' : ctx.prePlanMode, isAutoModeAvailable: false });
                    };
                    wasInAuto = currentContext.mode === 'auto';
                    autoActiveDuringPlan = currentContext.mode === 'plan' &&
                        (currentContext.prePlanMode === 'auto' ||
                            !!currentContext.strippedDangerousRules);
                    wantedAuto = wasInAuto || autoActiveDuringPlan || autoModeFlagCli;
                    if (!wantedAuto) {
                        // User didn't want auto at call time — no notification. But still apply
                        // the full kick-out transform: if they shift-tabbed INTO auto during the
                        // await (before setAutoModeCircuitBroken landed), we need to evict them.
                        return [2 /*return*/, { updateContext: kickOutOfAutoIfNeeded }];
                    }
                    if (wasInAuto || autoActiveDuringPlan) {
                        // User was in auto or had auto active during plan — kick out + notify.
                        return [2 /*return*/, { updateContext: kickOutOfAutoIfNeeded, notification: notification }];
                    }
                    // autoModeFlagCli only: defaultMode was auto but sync check rejected it.
                    // Suppress notification if isAutoModeAvailable is already false (already
                    // notified on a prior check; prevents repeat notifications on successive
                    // unsupported-model switches).
                    return [2 /*return*/, {
                            updateContext: kickOutOfAutoIfNeeded,
                            notification: currentContext.isAutoModeAvailable ? notification : undefined,
                        }];
            }
        });
    });
}
/**
 * Core logic to check if bypassPermissions should be disabled based on Statsig gate
 */
function shouldDisableBypassPermissions() {
    return (0, growthbook_js_1.checkSecurityRestrictionGate)('tengu_disable_bypass_permissions_mode');
}
function isAutoModeDisabledBySettings() {
    var _a;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    return (settings.disableAutoMode ===
        'disable' ||
        ((_a = settings.permissions) === null || _a === void 0 ? void 0 : _a.disableAutoMode) === 'disable');
}
/**
 * Checks if auto mode can be entered: circuit breaker is not active and settings
 * have not disabled it. Synchronous.
 */
function isAutoModeGateEnabled() {
    var _a;
    if ((_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeCircuitBroken()) !== null && _a !== void 0 ? _a : false)
        return false;
    if (isAutoModeDisabledBySettings())
        return false;
    if (!(0, betas_js_1.modelSupportsAutoMode)((0, model_js_1.getMainLoopModel)()))
        return false;
    return true;
}
/**
 * Returns the reason auto mode is currently unavailable, or null if available.
 * Synchronous — uses state populated by verifyAutoModeGateAccess.
 */
function getAutoModeUnavailableReason() {
    var _a;
    if (isAutoModeDisabledBySettings())
        return 'settings';
    if ((_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeCircuitBroken()) !== null && _a !== void 0 ? _a : false) {
        return 'circuit-breaker';
    }
    if (!(0, betas_js_1.modelSupportsAutoMode)((0, model_js_1.getMainLoopModel)()))
        return 'model';
    return null;
}
var AUTO_MODE_ENABLED_DEFAULT = 'disabled';
function parseAutoModeEnabledState(value) {
    if (value === 'enabled' || value === 'disabled' || value === 'opt-in') {
        return value;
    }
    return AUTO_MODE_ENABLED_DEFAULT;
}
/**
 * Reads the `enabled` field from tengu_auto_mode_config (cached, may be stale).
 * Defaults to 'disabled' if GrowthBook is unavailable or the field is unset.
 * Other surfaces (IDE, Desktop) should call this to decide whether to surface
 * auto mode in their mode pickers.
 */
function getAutoModeEnabledState() {
    var config = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_auto_mode_config', {});
    return parseAutoModeEnabledState(config === null || config === void 0 ? void 0 : config.enabled);
}
var NO_CACHED_AUTO_MODE_CONFIG = Symbol('no-cached-auto-mode-config');
/**
 * Like getAutoModeEnabledState but returns undefined when no cached value
 * exists (cold start, before GrowthBook init). Used by the sync
 * circuit-breaker check in initialPermissionModeFromCLI, which must not
 * conflate "not yet fetched" with "fetched and disabled" — the former
 * defers to verifyAutoModeGateAccess, the latter blocks immediately.
 */
function getAutoModeEnabledStateIfCached() {
    var config = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_auto_mode_config', NO_CACHED_AUTO_MODE_CONFIG);
    if (config === NO_CACHED_AUTO_MODE_CONFIG)
        return undefined;
    return parseAutoModeEnabledState(config === null || config === void 0 ? void 0 : config.enabled);
}
/**
 * Returns true if the user has opted in to auto mode via any trusted mechanism:
 * - CLI flag (--enable-auto-mode / --permission-mode auto) — session-scoped
 *   availability request; the startup dialog in showSetupScreens enforces
 *   persistent consent before the REPL renders.
 * - skipAutoPermissionPrompt setting (persistent; set by accepting the opt-in
 *   dialog or by IDE/Desktop settings toggle)
 */
function hasAutoModeOptInAnySource() {
    var _a;
    if ((_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.getAutoModeFlagCli()) !== null && _a !== void 0 ? _a : false)
        return true;
    return (0, settings_js_1.hasAutoModeOptIn)();
}
/**
 * Checks if bypassPermissions mode is currently disabled by Statsig gate or settings.
 * This is a synchronous version that uses cached Statsig values.
 */
function isBypassPermissionsModeDisabled() {
    var _a;
    var growthBookDisableBypassPermissionsMode = (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_disable_bypass_permissions_mode');
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    var settingsDisableBypassPermissionsMode = ((_a = settings.permissions) === null || _a === void 0 ? void 0 : _a.disableBypassPermissionsMode) === 'disable';
    return (growthBookDisableBypassPermissionsMode ||
        settingsDisableBypassPermissionsMode);
}
/**
 * Creates an updated context with bypassPermissions disabled
 */
function createDisabledBypassPermissionsContext(currentContext) {
    var updatedContext = currentContext;
    if (currentContext.mode === 'bypassPermissions') {
        updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(currentContext, {
            type: 'setMode',
            mode: 'default',
            destination: 'session',
        });
    }
    return __assign(__assign({}, updatedContext), { isBypassPermissionsModeAvailable: false });
}
/**
 * Asynchronously checks if the bypassPermissions mode should be disabled based on Statsig gate
 * and returns an updated toolPermissionContext if needed
 */
function checkAndDisableBypassPermissions(currentContext) {
    return __awaiter(this, void 0, void 0, function () {
        var shouldDisable;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Only proceed if bypassPermissions mode is available
                    if (!currentContext.isBypassPermissionsModeAvailable) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, shouldDisableBypassPermissions()];
                case 1:
                    shouldDisable = _a.sent();
                    if (!shouldDisable) {
                        return [2 /*return*/];
                    }
                    // Gate is enabled, need to disable bypassPermissions mode
                    (0, debug_js_1.logForDebugging)('bypassPermissions mode is being disabled by Statsig gate (async check)', { level: 'warn' });
                    void (0, gracefulShutdown_js_1.gracefulShutdown)(1, 'bypass_permissions_disabled');
                    return [2 /*return*/];
            }
        });
    });
}
function isDefaultPermissionModeAuto() {
    var _a;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
        return ((_a = settings.permissions) === null || _a === void 0 ? void 0 : _a.defaultMode) === 'auto';
    }
    return false;
}
/**
 * Whether plan mode should use auto mode semantics (classifier runs during
 * plan). True when the user has opted in to auto mode and the gate is enabled.
 * Evaluated at permission-check time so it's reactive to config changes.
 */
function shouldPlanUseAutoMode() {
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        return ((0, settings_js_1.hasAutoModeOptIn)() &&
            isAutoModeGateEnabled() &&
            (0, settings_js_1.getUseAutoModeDuringPlan)());
    }
    return false;
}
/**
 * Centralized plan-mode entry. Stashes the current mode as prePlanMode so
 * ExitPlanMode can restore it. When the user has opted in to auto mode,
 * auto semantics stay active during plan mode.
 */
function prepareContextForPlanMode(context) {
    var currentMode = context.mode;
    if (currentMode === 'plan')
        return context;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var planAutoMode = shouldPlanUseAutoMode();
        if (currentMode === 'auto') {
            if (planAutoMode) {
                return __assign(__assign({}, context), { prePlanMode: 'auto' });
            }
            autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(false);
            (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
            return __assign(__assign({}, restoreDangerousPermissions(context)), { prePlanMode: 'auto' });
        }
        if (planAutoMode && currentMode !== 'bypassPermissions') {
            autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(true);
            return __assign(__assign({}, stripDangerousPermissionsForAutoMode(context)), { prePlanMode: currentMode });
        }
    }
    (0, debug_js_1.logForDebugging)("[prepareContextForPlanMode] plain plan entry, prePlanMode=".concat(currentMode), { level: 'info' });
    return __assign(__assign({}, context), { prePlanMode: currentMode });
}
/**
 * Reconciles auto-mode state during plan mode after a settings change.
 * Compares desired state (shouldPlanUseAutoMode) against actual state
 * (isAutoModeActive) and activates/deactivates auto accordingly. No-op when
 * not in plan mode. Called from applySettingsChange so that toggling
 * useAutoModeDuringPlan mid-plan takes effect immediately.
 */
function transitionPlanAutoMode(context) {
    var _a;
    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER'))
        return context;
    if (context.mode !== 'plan')
        return context;
    // Mirror prepareContextForPlanMode's entry-time exclusion — never activate
    // auto mid-plan when the user entered from a dangerous mode.
    if (context.prePlanMode === 'bypassPermissions') {
        return context;
    }
    var want = shouldPlanUseAutoMode();
    var have = (_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _a !== void 0 ? _a : false;
    if (want && have) {
        // syncPermissionRulesFromDisk (called before us in applySettingsChange)
        // re-adds dangerous rules from disk without touching strippedDangerousRules.
        // Re-strip so the classifier isn't bypassed by prefix-rule allow matches.
        return stripDangerousPermissionsForAutoMode(context);
    }
    if (!want && !have)
        return context;
    if (want) {
        autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(true);
        (0, state_js_1.setNeedsAutoModeExitAttachment)(false);
        return stripDangerousPermissionsForAutoMode(context);
    }
    autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(false);
    (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
    return restoreDangerousPermissions(context);
}
