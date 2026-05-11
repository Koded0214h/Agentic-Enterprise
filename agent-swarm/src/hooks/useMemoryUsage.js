"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMemoryUsage = useMemoryUsage;
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var HIGH_MEMORY_THRESHOLD = 1.5 * 1024 * 1024 * 1024; // 1.5GB in bytes
var CRITICAL_MEMORY_THRESHOLD = 2.5 * 1024 * 1024 * 1024; // 2.5GB in bytes
/**
 * Hook to monitor Node.js process memory usage.
 * Polls every 10 seconds; returns null while status is 'normal'.
 */
function useMemoryUsage() {
    var _a = (0, react_1.useState)(null), memoryUsage = _a[0], setMemoryUsage = _a[1];
    (0, usehooks_ts_1.useInterval)(function () {
        var heapUsed = process.memoryUsage().heapUsed;
        var status = heapUsed >= CRITICAL_MEMORY_THRESHOLD
            ? 'critical'
            : heapUsed >= HIGH_MEMORY_THRESHOLD
                ? 'high'
                : 'normal';
        setMemoryUsage(function (prev) {
            // Bail when status is 'normal' — nothing is shown, so heapUsed is
            // irrelevant and we avoid re-rendering the whole Notifications subtree
            // every 10 seconds for the 99%+ of users who never reach 1.5GB.
            if (status === 'normal')
                return prev === null ? prev : null;
            return { heapUsed: heapUsed, status: status };
        });
    }, 10000);
    return memoryUsage;
}
