"use strict";
/**
 * Health Checker - Periodic background cleanup of dead processes
 *
 * Runs every 30 seconds to prune dead processes from the supervisor registry.
 * The interval is unref'd so it does not keep the process alive.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHealthChecker = startHealthChecker;
exports.stopHealthChecker = stopHealthChecker;
var logger_js_1 = require("../utils/logger.js");
var process_registry_js_1 = require("./process-registry.js");
var HEALTH_CHECK_INTERVAL_MS = 30000;
var healthCheckInterval = null;
function runHealthCheck() {
    var registry = (0, process_registry_js_1.getProcessRegistry)();
    var removedProcessCount = registry.pruneDeadEntries();
    if (removedProcessCount > 0) {
        logger_js_1.logger.info('SYSTEM', "Health check: pruned ".concat(removedProcessCount, " dead process(es) from registry"));
    }
}
function startHealthChecker() {
    if (healthCheckInterval !== null)
        return;
    healthCheckInterval = setInterval(runHealthCheck, HEALTH_CHECK_INTERVAL_MS);
    healthCheckInterval.unref();
    logger_js_1.logger.debug('SYSTEM', 'Health checker started', { intervalMs: HEALTH_CHECK_INTERVAL_MS });
}
function stopHealthChecker() {
    if (healthCheckInterval === null)
        return;
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    logger_js_1.logger.debug('SYSTEM', 'Health checker stopped');
}
