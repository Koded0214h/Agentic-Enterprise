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
exports.MAX_WARNING_KEYS = void 0;
exports.resetWarningHandler = resetWarningHandler;
exports.initializeWarningHandler = initializeWarningHandler;
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var platform_js_1 = require("./platform.js");
// Track warnings to avoid spam — bounded to prevent unbounded memory growth
exports.MAX_WARNING_KEYS = 1000;
var warningCounts = new Map();
// Check if running from a build directory (development mode)
// This is a sync version of the logic in getCurrentInstallationType()
function isRunningFromBuildDirectory() {
    var invokedPath = process.argv[1] || '';
    var execPath = process.execPath || process.argv[0] || '';
    // On Windows, convert backslashes to forward slashes for consistent path matching
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        invokedPath = invokedPath.split(path_1.win32.sep).join(path_1.posix.sep);
        execPath = execPath.split(path_1.win32.sep).join(path_1.posix.sep);
    }
    var pathsToCheck = [invokedPath, execPath];
    var buildDirs = [
        '/build-ant/',
        '/build-external/',
        '/build-external-native/',
        '/build-ant-native/',
    ];
    return pathsToCheck.some(function (path) { return buildDirs.some(function (dir) { return path.includes(dir); }); });
}
// Warnings we know about and want to suppress from users
var INTERNAL_WARNINGS = [
    /MaxListenersExceededWarning.*AbortSignal/,
    /MaxListenersExceededWarning.*EventTarget/,
];
function isInternalWarning(warning) {
    var warningStr = "".concat(warning.name, ": ").concat(warning.message);
    return INTERNAL_WARNINGS.some(function (pattern) { return pattern.test(warningStr); });
}
// Store reference to our warning handler so we can detect if it's already installed
var warningHandler = null;
// For testing only - allows resetting the warning handler state
function resetWarningHandler() {
    if (warningHandler) {
        process.removeListener('warning', warningHandler);
    }
    warningHandler = null;
    warningCounts.clear();
}
function initializeWarningHandler() {
    // Only set up handler once - check if our handler is already installed
    var currentListeners = process.listeners('warning');
    if (warningHandler && currentListeners.includes(warningHandler)) {
        return;
    }
    // For external users, remove default Node.js handler to suppress stderr output
    // For internal users, only keep default warnings for development builds
    // Check development mode directly to avoid async call in init
    // This preserves the same logic as getCurrentInstallationType() without async
    var isDevelopment = process.env.NODE_ENV === 'development' || isRunningFromBuildDirectory();
    if (!isDevelopment) {
        process.removeAllListeners('warning');
    }
    // Create and store our warning handler
    warningHandler = function (warning) {
        try {
            var warningKey = "".concat(warning.name, ": ").concat(warning.message.slice(0, 50));
            var count = warningCounts.get(warningKey) || 0;
            // Bound the map to prevent unbounded memory growth from unique warning keys.
            // Once the cap is reached, new unique keys are not tracked — their
            // occurrence_count will always be reported as 1 in analytics.
            if (warningCounts.has(warningKey) ||
                warningCounts.size < exports.MAX_WARNING_KEYS) {
                warningCounts.set(warningKey, count + 1);
            }
            var isInternal = isInternalWarning(warning);
            // Always log to Statsig for monitoring
            // Include full details for ant users only, since they may contain code or filepaths
            (0, index_js_1.logEvent)('tengu_node_warning', __assign({ is_internal: isInternal ? 1 : 0, occurrence_count: count + 1, classname: warning.name }, (process.env.USER_TYPE === 'ant' && {
                message: warning.message,
            })));
            // In debug mode, show all warnings with context
            if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_DEBUG)) {
                var prefix = isInternal ? '[Internal Warning]' : '[Warning]';
                (0, debug_js_1.logForDebugging)("".concat(prefix, " ").concat(warning.toString()), { level: 'warn' });
            }
            // Hide all warnings from users - they are only logged to Statsig for monitoring
        }
        catch (_a) {
            // Fail silently - we don't want the warning handler to cause issues
        }
    };
    // Install the warning handler
    process.on('warning', warningHandler);
}
