"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSharedSettingSource = isSharedSettingSource;
exports.detectUnreachableRules = detectUnreachableRules;
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var permissions_js_1 = require("./permissions.js");
/**
 * Check if a permission rule source is shared (visible to other users).
 * Shared settings include:
 * - projectSettings: Committed to git, shared with team
 * - policySettings: Enterprise-managed, pushed to all users
 * - command: From slash command frontmatter, potentially shared
 *
 * Personal settings include:
 * - userSettings: User's global ~/.claude settings
 * - localSettings: Gitignored per-project settings
 * - cliArg: Runtime CLI arguments
 * - session: In-memory session rules
 * - flagSettings: From --settings flag (runtime)
 */
function isSharedSettingSource(source) {
    return (source === 'projectSettings' ||
        source === 'policySettings' ||
        source === 'command');
}
/**
 * Format a rule source for display in warning messages.
 */
function formatSource(source) {
    return (0, permissions_js_1.permissionRuleSourceDisplayString)(source);
}
/**
 * Generate a fix suggestion based on the shadow type.
 */
function generateFixSuggestion(shadowType, shadowingRule, shadowedRule) {
    var shadowingSource = formatSource(shadowingRule.source);
    var shadowedSource = formatSource(shadowedRule.source);
    var toolName = shadowingRule.ruleValue.toolName;
    if (shadowType === 'deny') {
        return "Remove the \"".concat(toolName, "\" deny rule from ").concat(shadowingSource, ", or remove the specific allow rule from ").concat(shadowedSource);
    }
    return "Remove the \"".concat(toolName, "\" ask rule from ").concat(shadowingSource, ", or remove the specific allow rule from ").concat(shadowedSource);
}
/**
 * Check if a specific allow rule is shadowed (unreachable) by an ask rule.
 *
 * An allow rule is unreachable when:
 * 1. There's a tool-wide ask rule (e.g., "Bash" in ask list)
 * 2. And a specific allow rule (e.g., "Bash(ls:*)" in allow list)
 *
 * The ask rule takes precedence, making the specific allow rule unreachable
 * because the user will always be prompted first.
 *
 * Exception: For Bash with sandbox auto-allow enabled, tool-wide ask rules
 * from PERSONAL settings don't shadow specific allow rules because:
 * - Sandboxed commands are auto-allowed regardless of ask rules
 * - This only applies to personal settings (userSettings, localSettings, etc.)
 * - Shared settings (projectSettings, policySettings) always warn because
 *   other team members may not have sandbox enabled
 */
function isAllowRuleShadowedByAskRule(allowRule, askRules, options) {
    var _a = allowRule.ruleValue, toolName = _a.toolName, ruleContent = _a.ruleContent;
    // Only check allow rules that have specific content (e.g., "Bash(ls:*)")
    // Tool-wide allow rules cannot be shadowed by ask rules
    if (ruleContent === undefined) {
        return { shadowed: false };
    }
    // Find any tool-wide ask rule for the same tool
    var shadowingAskRule = askRules.find(function (askRule) {
        return askRule.ruleValue.toolName === toolName &&
            askRule.ruleValue.ruleContent === undefined;
    });
    if (!shadowingAskRule) {
        return { shadowed: false };
    }
    // Special case: Bash with sandbox auto-allow from personal settings
    // The sandbox exception is based on the ASK rule's source, not the allow rule's source.
    // If the ask rule is from personal settings, the user's own sandbox will auto-allow.
    // If the ask rule is from shared settings, other team members may not have sandbox enabled.
    if (toolName === toolName_js_1.BASH_TOOL_NAME && options.sandboxAutoAllowEnabled) {
        if (!isSharedSettingSource(shadowingAskRule.source)) {
            return { shadowed: false };
        }
        // Fall through to mark as shadowed - shared settings should always warn
    }
    return { shadowed: true, shadowedBy: shadowingAskRule, shadowType: 'ask' };
}
/**
 * Check if an allow rule is shadowed (completely blocked) by a deny rule.
 *
 * An allow rule is unreachable when:
 * 1. There's a tool-wide deny rule (e.g., "Bash" in deny list)
 * 2. And a specific allow rule (e.g., "Bash(ls:*)" in allow list)
 *
 * Deny rules are checked first in the permission evaluation order,
 * so the allow rule will never be reached - the tool is always denied.
 * This is more severe than ask-shadowing because the rule is truly blocked.
 */
function isAllowRuleShadowedByDenyRule(allowRule, denyRules) {
    var _a = allowRule.ruleValue, toolName = _a.toolName, ruleContent = _a.ruleContent;
    // Only check allow rules that have specific content (e.g., "Bash(ls:*)")
    // Tool-wide allow rules conflict with tool-wide deny rules but are not "shadowed"
    if (ruleContent === undefined) {
        return { shadowed: false };
    }
    // Find any tool-wide deny rule for the same tool
    var shadowingDenyRule = denyRules.find(function (denyRule) {
        return denyRule.ruleValue.toolName === toolName &&
            denyRule.ruleValue.ruleContent === undefined;
    });
    if (!shadowingDenyRule) {
        return { shadowed: false };
    }
    return { shadowed: true, shadowedBy: shadowingDenyRule, shadowType: 'deny' };
}
/**
 * Detect all unreachable permission rules in the given context.
 *
 * Currently detects:
 * - Allow rules shadowed by tool-wide deny rules (more severe - completely blocked)
 * - Allow rules shadowed by tool-wide ask rules (will always prompt)
 */
function detectUnreachableRules(context, options) {
    var unreachable = [];
    var allowRules = (0, permissions_js_1.getAllowRules)(context);
    var askRules = (0, permissions_js_1.getAskRules)(context);
    var denyRules = (0, permissions_js_1.getDenyRules)(context);
    // Check each allow rule for shadowing
    for (var _i = 0, allowRules_1 = allowRules; _i < allowRules_1.length; _i++) {
        var allowRule = allowRules_1[_i];
        // Check deny shadowing first (more severe)
        var denyResult = isAllowRuleShadowedByDenyRule(allowRule, denyRules);
        if (denyResult.shadowed) {
            var shadowSource = formatSource(denyResult.shadowedBy.source);
            unreachable.push({
                rule: allowRule,
                reason: "Blocked by \"".concat(denyResult.shadowedBy.ruleValue.toolName, "\" deny rule (from ").concat(shadowSource, ")"),
                shadowedBy: denyResult.shadowedBy,
                shadowType: 'deny',
                fix: generateFixSuggestion('deny', denyResult.shadowedBy, allowRule),
            });
            continue; // Don't also report ask-shadowing if deny-shadowed
        }
        // Check ask shadowing
        var askResult = isAllowRuleShadowedByAskRule(allowRule, askRules, options);
        if (askResult.shadowed) {
            var shadowSource = formatSource(askResult.shadowedBy.source);
            unreachable.push({
                rule: allowRule,
                reason: "Shadowed by \"".concat(askResult.shadowedBy.ruleValue.toolName, "\" ask rule (from ").concat(shadowSource, ")"),
                shadowedBy: askResult.shadowedBy,
                shadowType: 'ask',
                fix: generateFixSuggestion('ask', askResult.shadowedBy, allowRule),
            });
        }
    }
    return unreachable;
}
