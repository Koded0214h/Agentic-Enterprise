"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUnaryPermissionEvent = logUnaryPermissionEvent;
var env_js_1 = require("../../utils/env.js");
var unaryLogging_js_1 = require("../../utils/unaryLogging.js");
function logUnaryPermissionEvent(completion_type, _a, event, hasFeedback) {
    var message_id = _a.assistantMessage.message.id;
    void (0, unaryLogging_js_1.logUnaryEvent)({
        completion_type: completion_type,
        event: event,
        metadata: {
            language_name: 'none',
            message_id: message_id,
            platform: (0, env_js_1.getHostPlatformForAnalytics)(),
            hasFeedback: hasFeedback !== null && hasFeedback !== void 0 ? hasFeedback : false,
        },
    });
}
