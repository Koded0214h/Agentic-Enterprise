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
exports.collapseBackgroundBashNotifications = collapseBackgroundBashNotifications;
var xml_js_1 = require("../constants/xml.js");
var LocalShellTask_js_1 = require("../tasks/LocalShellTask/LocalShellTask.js");
var fullscreen_js_1 = require("./fullscreen.js");
var messages_js_1 = require("./messages.js");
function isCompletedBackgroundBash(msg) {
    var _a, _b;
    if (msg.type !== 'user')
        return false;
    var content = msg.message.content[0];
    if ((content === null || content === void 0 ? void 0 : content.type) !== 'text')
        return false;
    if (!content.text.includes("<".concat(xml_js_1.TASK_NOTIFICATION_TAG)))
        return false;
    // Only collapse successful completions — failed/killed stay visible individually.
    if ((0, messages_js_1.extractTag)(content.text, xml_js_1.STATUS_TAG) !== 'completed')
        return false;
    // The prefix constant distinguishes bash-kind LocalShellTask completions from
    // agent/workflow/monitor notifications. Monitor-kind completions have their
    // own summary wording and deliberately don't collapse here.
    return ((_b = (_a = (0, messages_js_1.extractTag)(content.text, xml_js_1.SUMMARY_TAG)) === null || _a === void 0 ? void 0 : _a.startsWith(LocalShellTask_js_1.BACKGROUND_BASH_SUMMARY_PREFIX)) !== null && _b !== void 0 ? _b : false);
}
/**
 * Collapses consecutive completed-background-bash task-notifications into a
 * single synthetic "N background commands completed" notification. Failed/killed
 * tasks and agent/workflow notifications are left alone. Monitor stream
 * events (enqueueStreamEvent) have no <status> tag and never match.
 *
 * Pass-through in verbose mode so ctrl+O shows each completion.
 */
function collapseBackgroundBashNotifications(messages, verbose) {
    if (!(0, fullscreen_js_1.isFullscreenEnvEnabled)())
        return messages;
    if (verbose)
        return messages;
    var result = [];
    var i = 0;
    while (i < messages.length) {
        var msg = messages[i];
        if (isCompletedBackgroundBash(msg)) {
            var count = 0;
            while (i < messages.length && isCompletedBackgroundBash(messages[i])) {
                count++;
                i++;
            }
            if (count === 1) {
                result.push(msg);
            }
            else {
                // Synthesize a task-notification that UserAgentNotificationMessage
                // already knows how to render — no new renderer needed.
                result.push(__assign(__assign({}, msg), { message: {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: "<".concat(xml_js_1.TASK_NOTIFICATION_TAG, "><").concat(xml_js_1.STATUS_TAG, ">completed</").concat(xml_js_1.STATUS_TAG, "><").concat(xml_js_1.SUMMARY_TAG, ">").concat(count, " background commands completed</").concat(xml_js_1.SUMMARY_TAG, "></").concat(xml_js_1.TASK_NOTIFICATION_TAG, ">"),
                            },
                        ],
                    } }));
            }
        }
        else {
            result.push(msg);
            i++;
        }
    }
    return result;
}
