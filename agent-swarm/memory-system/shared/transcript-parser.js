"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractLastMessage = extractLastMessage;
var fs_1 = require("fs");
var logger_js_1 = require("../utils/logger.js");
/**
 * Extract last message of specified role from transcript JSONL file
 * @param transcriptPath Path to transcript file
 * @param role 'user' or 'assistant'
 * @param stripSystemReminders Whether to remove <system-reminder> tags (for assistant)
 */
function extractLastMessage(transcriptPath, role, stripSystemReminders) {
    var _a;
    if (stripSystemReminders === void 0) { stripSystemReminders = false; }
    if (!transcriptPath || !(0, fs_1.existsSync)(transcriptPath)) {
        logger_js_1.logger.warn('PARSER', "Transcript path missing or file does not exist: ".concat(transcriptPath));
        return '';
    }
    var content = (0, fs_1.readFileSync)(transcriptPath, 'utf-8').trim();
    if (!content) {
        logger_js_1.logger.warn('PARSER', "Transcript file exists but is empty: ".concat(transcriptPath));
        return '';
    }
    var lines = content.split('\n');
    var foundMatchingRole = false;
    for (var i = lines.length - 1; i >= 0; i--) {
        var line = JSON.parse(lines[i]);
        if (line.type === role) {
            foundMatchingRole = true;
            if ((_a = line.message) === null || _a === void 0 ? void 0 : _a.content) {
                var text = '';
                var msgContent = line.message.content;
                if (typeof msgContent === 'string') {
                    text = msgContent;
                }
                else if (Array.isArray(msgContent)) {
                    text = msgContent
                        .filter(function (c) { return c.type === 'text'; })
                        .map(function (c) { return c.text; })
                        .join('\n');
                }
                else {
                    // Unknown content format - throw error
                    throw new Error("Unknown message content format in transcript. Type: ".concat(typeof msgContent));
                }
                if (stripSystemReminders) {
                    text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
                    text = text.replace(/\n{3,}/g, '\n\n').trim();
                }
                // Return text even if empty - caller decides if that's an error
                return text;
            }
        }
    }
    // If we searched the whole transcript and didn't find any message of this role
    if (!foundMatchingRole) {
        return '';
    }
    return '';
}
