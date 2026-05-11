"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIdleTimeoutManager = createIdleTimeoutManager;
var debug_js_1 = require("./debug.js");
var gracefulShutdown_js_1 = require("./gracefulShutdown.js");
/**
 * Creates an idle timeout manager for SDK mode.
 * Automatically exits the process after the specified idle duration.
 *
 * @param isIdle Function that returns true if the system is currently idle
 * @returns Object with start/stop methods to control the idle timer
 */
function createIdleTimeoutManager(isIdle) {
    // Parse CLAUDE_CODE_EXIT_AFTER_STOP_DELAY environment variable
    var exitAfterStopDelay = process.env.CLAUDE_CODE_EXIT_AFTER_STOP_DELAY;
    var delayMs = exitAfterStopDelay ? parseInt(exitAfterStopDelay, 10) : null;
    var isValidDelay = delayMs && !isNaN(delayMs) && delayMs > 0;
    var timer = null;
    var lastIdleTime = 0;
    return {
        start: function () {
            // Clear any existing timer
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            // Only start timer if delay is configured and valid
            if (isValidDelay) {
                lastIdleTime = Date.now();
                timer = setTimeout(function () {
                    // Check if we've been continuously idle for the full duration
                    var idleDuration = Date.now() - lastIdleTime;
                    if (isIdle() && idleDuration >= delayMs) {
                        (0, debug_js_1.logForDebugging)("Exiting after ".concat(delayMs, "ms of idle time"));
                        (0, gracefulShutdown_js_1.gracefulShutdownSync)();
                    }
                }, delayMs);
            }
        },
        stop: function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        },
    };
}
