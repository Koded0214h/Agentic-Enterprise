"use strict";
/**
 * Command semantics configuration for interpreting exit codes in different contexts.
 *
 * Many commands use exit codes to convey information other than just success/failure.
 * For example, grep returns 1 when no matches are found, which is not an error condition.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpretCommandResult = interpretCommandResult;
var commands_js_1 = require("../../utils/bash/commands.js");
/**
 * Default semantic: treat only 0 as success, everything else as error
 */
var DEFAULT_SEMANTIC = function (exitCode, _stdout, _stderr) { return ({
    isError: exitCode !== 0,
    message: exitCode !== 0 ? "Command failed with exit code ".concat(exitCode) : undefined,
}); };
/**
 * Command-specific semantics
 */
var COMMAND_SEMANTICS = new Map([
    // grep: 0=matches found, 1=no matches, 2+=error
    [
        'grep',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'No matches found' : undefined,
        }); },
    ],
    // ripgrep has same semantics as grep
    [
        'rg',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'No matches found' : undefined,
        }); },
    ],
    // find: 0=success, 1=partial success (some dirs inaccessible), 2+=error
    [
        'find',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'Some directories were inaccessible' : undefined,
        }); },
    ],
    // diff: 0=no differences, 1=differences found, 2+=error
    [
        'diff',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'Files differ' : undefined,
        }); },
    ],
    // test/[: 0=condition true, 1=condition false, 2+=error
    [
        'test',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'Condition is false' : undefined,
        }); },
    ],
    // [ is an alias for test
    [
        '[',
        function (exitCode, _stdout, _stderr) { return ({
            isError: exitCode >= 2,
            message: exitCode === 1 ? 'Condition is false' : undefined,
        }); },
    ],
    // wc, head, tail, cat, etc.: these typically only fail on real errors
    // so we use default semantics
]);
/**
 * Get the semantic interpretation for a command
 */
function getCommandSemantic(command) {
    // Extract the base command (first word, handling pipes)
    var baseCommand = heuristicallyExtractBaseCommand(command);
    var semantic = COMMAND_SEMANTICS.get(baseCommand);
    return semantic !== undefined ? semantic : DEFAULT_SEMANTIC;
}
/**
 * Extract just the command name (first word) from a single command string.
 */
function extractBaseCommand(command) {
    return command.trim().split(/\s+/)[0] || '';
}
/**
 * Extract the primary command from a complex command line;
 * May get it super wrong - don't depend on this for security
 */
function heuristicallyExtractBaseCommand(command) {
    var segments = (0, commands_js_1.splitCommand_DEPRECATED)(command);
    // Take the last command as that's what determines the exit code
    var lastCommand = segments[segments.length - 1] || command;
    return extractBaseCommand(lastCommand);
}
/**
 * Interpret command result based on semantic rules
 */
function interpretCommandResult(command, exitCode, stdout, stderr) {
    var semantic = getCommandSemantic(command);
    var result = semantic(exitCode, stdout, stderr);
    return {
        isError: result.isError,
        message: result.message,
    };
}
