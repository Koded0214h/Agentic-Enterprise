"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = formatError;
exports.getErrorParts = getErrorParts;
exports.formatZodValidationError = formatZodValidationError;
var errors_js_1 = require("./errors.js");
var messages_js_1 = require("./messages.js");
function formatError(error) {
    if (error instanceof errors_js_1.AbortError) {
        return error.message || messages_js_1.INTERRUPT_MESSAGE_FOR_TOOL_USE;
    }
    if (!(error instanceof Error)) {
        return String(error);
    }
    var parts = getErrorParts(error);
    var fullMessage = parts.filter(Boolean).join('\n').trim() || 'Command failed with no output';
    if (fullMessage.length <= 10000) {
        return fullMessage;
    }
    var halfLength = 5000;
    var start = fullMessage.slice(0, halfLength);
    var end = fullMessage.slice(-halfLength);
    return "".concat(start, "\n\n... [").concat(fullMessage.length - 10000, " characters truncated] ...\n\n").concat(end);
}
function getErrorParts(error) {
    if (error instanceof errors_js_1.ShellError) {
        return [
            "Exit code ".concat(error.code),
            error.interrupted ? messages_js_1.INTERRUPT_MESSAGE_FOR_TOOL_USE : '',
            error.stderr,
            error.stdout,
        ];
    }
    var parts = [error.message];
    if ('stderr' in error && typeof error.stderr === 'string') {
        parts.push(error.stderr);
    }
    if ('stdout' in error && typeof error.stdout === 'string') {
        parts.push(error.stdout);
    }
    return parts;
}
/**
 * Formats a Zod validation path into a readable string
 * e.g., ['todos', 0, 'activeForm'] => 'todos[0].activeForm'
 */
function formatValidationPath(path) {
    if (path.length === 0)
        return '';
    return path.reduce(function (acc, segment, index) {
        var segmentStr = String(segment);
        if (typeof segment === 'number') {
            return "".concat(String(acc), "[").concat(segmentStr, "]");
        }
        return index === 0 ? segmentStr : "".concat(String(acc), ".").concat(segmentStr);
    }, '');
}
/**
 * Converts Zod validation errors into a human-readable and LLM friendly error message
 *
 * @param toolName The name of the tool that failed validation
 * @param error The Zod error object
 * @returns A formatted error message string
 */
function formatZodValidationError(toolName, error) {
    var missingParams = error.issues
        .filter(function (err) {
        return err.code === 'invalid_type' &&
            err.message.includes('received undefined');
    })
        .map(function (err) { return formatValidationPath(err.path); });
    var unexpectedParams = error.issues
        .filter(function (err) { return err.code === 'unrecognized_keys'; })
        .flatMap(function (err) { return err.keys; });
    var typeMismatchParams = error.issues
        .filter(function (err) {
        return err.code === 'invalid_type' &&
            !err.message.includes('received undefined');
    })
        .map(function (err) {
        var typeErr = err;
        var receivedMatch = err.message.match(/received (\w+)/);
        var received = receivedMatch ? receivedMatch[1] : 'unknown';
        return {
            param: formatValidationPath(err.path),
            expected: typeErr.expected,
            received: received,
        };
    });
    // Default to original error message if we can't create a better one
    var errorContent = error.message;
    // Build a human-readable error message
    var errorParts = [];
    if (missingParams.length > 0) {
        var missingParamErrors = missingParams.map(function (param) { return "The required parameter `".concat(param, "` is missing"); });
        errorParts.push.apply(errorParts, missingParamErrors);
    }
    if (unexpectedParams.length > 0) {
        var unexpectedParamErrors = unexpectedParams.map(function (param) { return "An unexpected parameter `".concat(param, "` was provided"); });
        errorParts.push.apply(errorParts, unexpectedParamErrors);
    }
    if (typeMismatchParams.length > 0) {
        var typeErrors = typeMismatchParams.map(function (_a) {
            var param = _a.param, expected = _a.expected, received = _a.received;
            return "The parameter `".concat(param, "` type is expected as `").concat(expected, "` but provided as `").concat(received, "`");
        });
        errorParts.push.apply(errorParts, typeErrors);
    }
    if (errorParts.length > 0) {
        errorContent = "".concat(toolName, " failed due to the following ").concat(errorParts.length > 1 ? 'issues' : 'issue', ":\n").concat(errorParts.join('\n'));
    }
    return errorContent;
}
