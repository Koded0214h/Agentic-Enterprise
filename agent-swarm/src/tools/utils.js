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
exports.tagMessagesWithToolUseID = tagMessagesWithToolUseID;
exports.getToolUseIDFromParentMessage = getToolUseIDFromParentMessage;
/**
 * Tags user messages with a sourceToolUseID so they stay transient until the tool resolves.
 * This prevents the "is running" message from being duplicated in the UI.
 */
function tagMessagesWithToolUseID(messages, toolUseID) {
    if (!toolUseID) {
        return messages;
    }
    return messages.map(function (m) {
        if (m.type === 'user') {
            return __assign(__assign({}, m), { sourceToolUseID: toolUseID });
        }
        return m;
    });
}
/**
 * Extracts the tool use ID from a parent message for a given tool name.
 */
function getToolUseIDFromParentMessage(parentMessage, toolName) {
    var toolUseBlock = parentMessage.message.content.find(function (block) { return block.type === 'tool_use' && block.name === toolName; });
    return toolUseBlock && toolUseBlock.type === 'tool_use'
        ? toolUseBlock.id
        : undefined;
}
