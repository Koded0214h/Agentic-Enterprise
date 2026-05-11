"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRuleValueSchema = exports.permissionBehaviorSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../lazySchema.js");
/**
 * ToolPermissionBehavior is the behavior associated with a permission rule.
 * 'allow' means the rule allows the tool to run.
 * 'deny' means the rule denies the tool from running.
 * 'ask' means the rule forces a prompt to be shown to the user.
 */
exports.permissionBehaviorSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.enum(['allow', 'deny', 'ask']);
});
/**
 * PermissionRuleValue is the content of a permission rule.
 * @param toolName - The name of the tool this rule applies to
 * @param ruleContent - The optional content of the rule.
 *   Each tool may implement custom handling in `checkPermissions()`
 */
exports.permissionRuleValueSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.object({
        toolName: v4_1.default.string(),
        ruleContent: v4_1.default.string().optional(),
    });
});
