"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIdeLogging = useIdeLogging;
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var v4_1 = require("zod/v4");
var ide_js_1 = require("../utils/ide.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var LogEventSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        method: v4_1.z.literal('log_event'),
        params: v4_1.z.object({
            eventName: v4_1.z.string(),
            eventData: v4_1.z.object({}).passthrough(),
        }),
    });
});
function useIdeLogging(mcpClients) {
    (0, react_1.useEffect)(function () {
        // Skip if there are no clients
        if (!mcpClients.length) {
            return;
        }
        // Find the IDE client from the MCP clients list
        var ideClient = (0, ide_js_1.getConnectedIdeClient)(mcpClients);
        if (ideClient) {
            // Register the log event handler
            ideClient.client.setNotificationHandler(LogEventSchema(), function (notification) {
                var _a = notification.params, eventName = _a.eventName, eventData = _a.eventData;
                (0, index_js_1.logEvent)("tengu_ide_".concat(eventName), eventData);
            });
        }
    }, [mcpClients]);
}
