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
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLegacyToolName = normalizeLegacyToolName;
exports.getLegacyToolNames = getLegacyToolNames;
exports.escapeRuleContent = escapeRuleContent;
exports.unescapeRuleContent = unescapeRuleContent;
exports.permissionRuleValueFromString = permissionRuleValueFromString;
exports.permissionRuleValueToString = permissionRuleValueToString;
var bun_bundle_1 = require("bun:bundle");
var constants_js_1 = require("../../tools/AgentTool/constants.js");
var constants_js_2 = require("../../tools/TaskOutputTool/constants.js");
var prompt_js_1 = require("../../tools/TaskStopTool/prompt.js");
// Dead code elimination: ant-only tool names are conditionally required so
// their strings don't leak into external builds. Static imports always bundle.
/* eslint-disable @typescript-eslint/no-require-imports */
var BRIEF_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('../../tools/BriefTool/prompt.js').BRIEF_TOOL_NAME
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
// Maps legacy tool names to their current canonical names.
// When a tool is renamed, add old → new here so permission rules,
// hooks, and persisted wire names resolve to the canonical name.
var LEGACY_TOOL_NAME_ALIASES = __assign({ Task: constants_js_1.AGENT_TOOL_NAME, KillShell: prompt_js_1.TASK_STOP_TOOL_NAME, AgentOutputTool: constants_js_2.TASK_OUTPUT_TOOL_NAME, BashOutputTool: constants_js_2.TASK_OUTPUT_TOOL_NAME }, (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')) && BRIEF_TOOL_NAME
    ? { Brief: BRIEF_TOOL_NAME }
    : {}));
function normalizeLegacyToolName(name) {
    var _a;
    return (_a = LEGACY_TOOL_NAME_ALIASES[name]) !== null && _a !== void 0 ? _a : name;
}
function getLegacyToolNames(canonicalName) {
    var result = [];
    for (var _i = 0, _a = Object.entries(LEGACY_TOOL_NAME_ALIASES); _i < _a.length; _i++) {
        var _b = _a[_i], legacy = _b[0], canonical = _b[1];
        if (canonical === canonicalName)
            result.push(legacy);
    }
    return result;
}
/**
 * Escapes special characters in rule content for safe storage in permission rules.
 * Permission rules use the format "Tool(content)", so parentheses in content must be escaped.
 *
 * Escaping order matters:
 * 1. Escape existing backslashes first (\ -> \\)
 * 2. Then escape parentheses (( -> \(, ) -> \))
 *
 * @example
 * escapeRuleContent('psycopg2.connect()') // => 'psycopg2.connect\\(\\)'
 * escapeRuleContent('echo "test\\nvalue"') // => 'echo "test\\\\nvalue"'
 */
function escapeRuleContent(content) {
    return content
        .replace(/\\/g, '\\\\') // Escape backslashes first
        .replace(/\(/g, '\\(') // Escape opening parentheses
        .replace(/\)/g, '\\)'); // Escape closing parentheses
}
/**
 * Unescapes special characters in rule content after parsing from permission rules.
 * This reverses the escaping done by escapeRuleContent.
 *
 * Unescaping order matters (reverse of escaping):
 * 1. Unescape parentheses first (\( -> (, \) -> ))
 * 2. Then unescape backslashes (\\ -> \)
 *
 * @example
 * unescapeRuleContent('psycopg2.connect\\(\\)') // => 'psycopg2.connect()'
 * unescapeRuleContent('echo "test\\\\nvalue"') // => 'echo "test\\nvalue"'
 */
function unescapeRuleContent(content) {
    return content
        .replace(/\\\(/g, '(') // Unescape opening parentheses
        .replace(/\\\)/g, ')') // Unescape closing parentheses
        .replace(/\\\\/g, '\\'); // Unescape backslashes last
}
/**
 * Parses a permission rule string into its components.
 * Handles escaped parentheses in the content portion.
 *
 * Format: "ToolName" or "ToolName(content)"
 * Content may contain escaped parentheses: \( and \)
 *
 * @example
 * permissionRuleValueFromString('Bash') // => { toolName: 'Bash' }
 * permissionRuleValueFromString('Bash(npm install)') // => { toolName: 'Bash', ruleContent: 'npm install' }
 * permissionRuleValueFromString('Bash(python -c "print\\(1\\)")') // => { toolName: 'Bash', ruleContent: 'python -c "print(1)"' }
 */
function permissionRuleValueFromString(ruleString) {
    // Find the first unescaped opening parenthesis
    var openParenIndex = findFirstUnescapedChar(ruleString, '(');
    if (openParenIndex === -1) {
        // No parenthesis found - this is just a tool name
        return { toolName: normalizeLegacyToolName(ruleString) };
    }
    // Find the last unescaped closing parenthesis
    var closeParenIndex = findLastUnescapedChar(ruleString, ')');
    if (closeParenIndex === -1 || closeParenIndex <= openParenIndex) {
        // No matching closing paren or malformed - treat as tool name
        return { toolName: normalizeLegacyToolName(ruleString) };
    }
    // Ensure the closing paren is at the end
    if (closeParenIndex !== ruleString.length - 1) {
        // Content after closing paren - treat as tool name
        return { toolName: normalizeLegacyToolName(ruleString) };
    }
    var toolName = ruleString.substring(0, openParenIndex);
    var rawContent = ruleString.substring(openParenIndex + 1, closeParenIndex);
    // Missing toolName (e.g., "(foo)") is malformed - treat whole string as tool name
    if (!toolName) {
        return { toolName: normalizeLegacyToolName(ruleString) };
    }
    // Empty content (e.g., "Bash()") or standalone wildcard (e.g., "Bash(*)")
    // should be treated as just the tool name (tool-wide rule)
    if (rawContent === '' || rawContent === '*') {
        return { toolName: normalizeLegacyToolName(toolName) };
    }
    // Unescape the content
    var ruleContent = unescapeRuleContent(rawContent);
    return { toolName: normalizeLegacyToolName(toolName), ruleContent: ruleContent };
}
/**
 * Converts a permission rule value to its string representation.
 * Escapes parentheses in the content to prevent parsing issues.
 *
 * @example
 * permissionRuleValueToString({ toolName: 'Bash' }) // => 'Bash'
 * permissionRuleValueToString({ toolName: 'Bash', ruleContent: 'npm install' }) // => 'Bash(npm install)'
 * permissionRuleValueToString({ toolName: 'Bash', ruleContent: 'python -c "print(1)"' }) // => 'Bash(python -c "print\\(1\\)")'
 */
function permissionRuleValueToString(ruleValue) {
    if (!ruleValue.ruleContent) {
        return ruleValue.toolName;
    }
    var escapedContent = escapeRuleContent(ruleValue.ruleContent);
    return "".concat(ruleValue.toolName, "(").concat(escapedContent, ")");
}
/**
 * Find the index of the first unescaped occurrence of a character.
 * A character is escaped if preceded by an odd number of backslashes.
 */
function findFirstUnescapedChar(str, char) {
    for (var i = 0; i < str.length; i++) {
        if (str[i] === char) {
            // Count preceding backslashes
            var backslashCount = 0;
            var j = i - 1;
            while (j >= 0 && str[j] === '\\') {
                backslashCount++;
                j--;
            }
            // If even number of backslashes, the char is unescaped
            if (backslashCount % 2 === 0) {
                return i;
            }
        }
    }
    return -1;
}
/**
 * Find the index of the last unescaped occurrence of a character.
 * A character is escaped if preceded by an odd number of backslashes.
 */
function findLastUnescapedChar(str, char) {
    for (var i = str.length - 1; i >= 0; i--) {
        if (str[i] === char) {
            // Count preceding backslashes
            var backslashCount = 0;
            var j = i - 1;
            while (j >= 0 && str[j] === '\\') {
                backslashCount++;
                j--;
            }
            // If even number of backslashes, the char is unescaped
            if (backslashCount % 2 === 0) {
                return i;
            }
        }
    }
    return -1;
}
