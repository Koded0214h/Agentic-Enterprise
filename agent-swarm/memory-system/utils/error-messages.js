"use strict";
/**
 * Platform-aware error message generator for worker connection failures
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerRestartInstructions = getWorkerRestartInstructions;
/**
 * Generate platform-specific worker restart instructions
 * @param options Configuration for error message generation
 * @returns Formatted error message with platform-specific paths and commands
 */
function getWorkerRestartInstructions(options) {
    if (options === void 0) { options = {}; }
    var port = options.port, _a = options.includeSkillFallback, includeSkillFallback = _a === void 0 ? false : _a, customPrefix = options.customPrefix, actualError = options.actualError;
    // Build error message
    var prefix = customPrefix || 'Worker service connection failed.';
    var portInfo = port ? " (port ".concat(port, ")") : '';
    var message = "".concat(prefix).concat(portInfo, "\n\n");
    message += "To restart the worker:\n";
    message += "1. Exit Claude Code completely\n";
    message += "2. Run: npm run worker:restart\n";
    message += "3. Restart Claude Code";
    if (includeSkillFallback) {
        message += "\n\nIf that doesn't work, try: /troubleshoot";
    }
    // Prepend actual error if provided
    if (actualError) {
        message = "Worker Error: ".concat(actualError, "\n\n").concat(message);
    }
    return message;
}
