"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodError = formatZodError;
exports.validateSettingsFileContent = validateSettingsFileContent;
exports.filterInvalidPermissionRules = filterInvalidPermissionRules;
var slowOperations_js_1 = require("../slowOperations.js");
var stringUtils_js_1 = require("../stringUtils.js");
var permissionValidation_js_1 = require("./permissionValidation.js");
var schemaOutput_js_1 = require("./schemaOutput.js");
var types_js_1 = require("./types.js");
var validationTips_js_1 = require("./validationTips.js");
/**
 * Helper type guards for specific Zod v4 issue types
 * In v4, issue types have different structures than v3
 */
function isInvalidTypeIssue(issue) {
    return issue.code === 'invalid_type';
}
function isInvalidValueIssue(issue) {
    return issue.code === 'invalid_value';
}
function isUnrecognizedKeysIssue(issue) {
    return issue.code === 'unrecognized_keys';
}
function isTooSmallIssue(issue) {
    return issue.code === 'too_small';
}
/**
 * Format a Zod validation error into human-readable validation errors
 */
/**
 * Get the type string for an unknown value (for error messages)
 */
function getReceivedType(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (Array.isArray(value))
        return 'array';
    return typeof value;
}
function extractReceivedFromMessage(msg) {
    var match = msg.match(/received (\w+)/);
    return match ? match[1] : undefined;
}
function formatZodError(error, filePath) {
    return error.issues.map(function (issue) {
        var _a;
        var path = issue.path.map(String).join('.');
        var message = issue.message;
        var expected;
        var enumValues;
        var expectedValue;
        var receivedValue;
        var invalidValue;
        if (isInvalidValueIssue(issue)) {
            enumValues = issue.values.map(function (v) { return String(v); });
            expectedValue = enumValues.join(' | ');
            receivedValue = undefined;
            invalidValue = undefined;
        }
        else if (isInvalidTypeIssue(issue)) {
            expectedValue = issue.expected;
            var receivedType = extractReceivedFromMessage(issue.message);
            receivedValue = receivedType !== null && receivedType !== void 0 ? receivedType : getReceivedType(issue.input);
            invalidValue = receivedType !== null && receivedType !== void 0 ? receivedType : getReceivedType(issue.input);
        }
        else if (isTooSmallIssue(issue)) {
            expectedValue = String(issue.minimum);
        }
        else if (issue.code === 'custom' && 'params' in issue) {
            var params = issue.params;
            receivedValue = params.received;
            invalidValue = receivedValue;
        }
        var tip = (0, validationTips_js_1.getValidationTip)({
            path: path,
            code: issue.code,
            expected: expectedValue,
            received: receivedValue,
            enumValues: enumValues,
            message: issue.message,
            value: receivedValue,
        });
        if (isInvalidValueIssue(issue)) {
            expected = enumValues === null || enumValues === void 0 ? void 0 : enumValues.map(function (v) { return "\"".concat(v, "\""); }).join(', ');
            message = "Invalid value. Expected one of: ".concat(expected);
        }
        else if (isInvalidTypeIssue(issue)) {
            var receivedType = (_a = extractReceivedFromMessage(issue.message)) !== null && _a !== void 0 ? _a : getReceivedType(issue.input);
            if (issue.expected === 'object' &&
                receivedType === 'null' &&
                path === '') {
                message = 'Invalid or malformed JSON';
            }
            else {
                message = "Expected ".concat(issue.expected, ", but received ").concat(receivedType);
            }
        }
        else if (isUnrecognizedKeysIssue(issue)) {
            var keys = issue.keys.join(', ');
            message = "Unrecognized ".concat((0, stringUtils_js_1.plural)(issue.keys.length, 'field'), ": ").concat(keys);
        }
        else if (isTooSmallIssue(issue)) {
            message = "Number must be greater than or equal to ".concat(issue.minimum);
            expected = String(issue.minimum);
        }
        return {
            file: filePath,
            path: path,
            message: message,
            expected: expected,
            invalidValue: invalidValue,
            suggestion: tip === null || tip === void 0 ? void 0 : tip.suggestion,
            docLink: tip === null || tip === void 0 ? void 0 : tip.docLink,
        };
    });
}
/**
 * Validates that settings file content conforms to the SettingsSchema.
 * This is used during file edits to ensure the resulting file is valid.
 */
function validateSettingsFileContent(content) {
    try {
        // Parse the JSON first
        var jsonData = (0, slowOperations_js_1.jsonParse)(content);
        // Validate against SettingsSchema in strict mode
        var result = (0, types_js_1.SettingsSchema)().strict().safeParse(jsonData);
        if (result.success) {
            return { isValid: true };
        }
        // Format the validation error in a helpful way
        var errors = formatZodError(result.error, 'settings');
        var errorMessage = 'Settings validation failed:\n' +
            errors.map(function (err) { return "- ".concat(err.path, ": ").concat(err.message); }).join('\n');
        return {
            isValid: false,
            error: errorMessage,
            fullSchema: (0, schemaOutput_js_1.generateSettingsJSONSchema)(),
        };
    }
    catch (parseError) {
        return {
            isValid: false,
            error: "Invalid JSON: ".concat(parseError instanceof Error ? parseError.message : 'Unknown parsing error'),
            fullSchema: (0, schemaOutput_js_1.generateSettingsJSONSchema)(),
        };
    }
}
/**
 * Filters invalid permission rules from raw parsed JSON data before schema validation.
 * This prevents one bad rule from poisoning the entire settings file.
 * Returns warnings for each filtered rule.
 */
function filterInvalidPermissionRules(data, filePath) {
    if (!data || typeof data !== 'object')
        return [];
    var obj = data;
    if (!obj.permissions || typeof obj.permissions !== 'object')
        return [];
    var perms = obj.permissions;
    var warnings = [];
    var _loop_1 = function (key) {
        var rules = perms[key];
        if (!Array.isArray(rules))
            return "continue";
        perms[key] = rules.filter(function (rule) {
            if (typeof rule !== 'string') {
                warnings.push({
                    file: filePath,
                    path: "permissions.".concat(key),
                    message: "Non-string value in ".concat(key, " array was removed"),
                    invalidValue: rule,
                });
                return false;
            }
            var result = (0, permissionValidation_js_1.validatePermissionRule)(rule);
            if (!result.valid) {
                var message = "Invalid permission rule \"".concat(rule, "\" was skipped");
                if (result.error)
                    message += ": ".concat(result.error);
                if (result.suggestion)
                    message += ". ".concat(result.suggestion);
                warnings.push({
                    file: filePath,
                    path: "permissions.".concat(key),
                    message: message,
                    invalidValue: rule,
                });
                return false;
            }
            return true;
        });
    };
    for (var _i = 0, _a = ['allow', 'deny', 'ask']; _i < _a.length; _i++) {
        var key = _a[_i];
        _loop_1(key);
    }
    return warnings;
}
