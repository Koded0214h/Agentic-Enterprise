"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSinks = initSinks;
var sink_js_1 = require("../services/analytics/sink.js");
var errorLogSink_js_1 = require("./errorLogSink.js");
/**
 * Attach error log and analytics sinks, draining any events queued before
 * attachment. Both inits are idempotent. Called from setup() for the default
 * command; other entrypoints (subcommands, daemon, bridge) call this directly
 * since they bypass setup().
 *
 * Leaf module — kept out of setup.ts to avoid the setup → commands → bridge
 * → setup import cycle.
 */
function initSinks() {
    (0, errorLogSink_js_1.initializeErrorLogSink)();
    (0, sink_js_1.initializeAnalyticsSink)();
}
