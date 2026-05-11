"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyGrouping = applyGrouping;
// Cache the set of tool names that support grouped rendering, keyed by the
// tools array reference. The tools array is stable across renders (only
// replaced on MCP connect/disconnect), so this avoids rebuilding the set on
// every call. WeakMap lets old entries be GC'd when the array is replaced.
var GROUPING_CACHE = new WeakMap();
function getToolsWithGrouping(tools) {
    var cached = GROUPING_CACHE.get(tools);
    if (!cached) {
        cached = new Set(tools.filter(function (t) { return t.renderGroupedToolUse; }).map(function (t) { return t.name; }));
        GROUPING_CACHE.set(tools, cached);
    }
    return cached;
}
function getToolUseInfo(msg) {
    var _a;
    if (msg.type === 'assistant' && ((_a = msg.message.content[0]) === null || _a === void 0 ? void 0 : _a.type) === 'tool_use') {
        var content = msg.message.content[0];
        return {
            messageId: msg.message.id,
            toolUseId: content.id,
            toolName: content.name,
        };
    }
    return null;
}
/**
 * Groups tool uses by message.id (same API response) if the tool supports grouped rendering.
 * Only groups 2+ tools of the same type from the same message.
 * Also collects corresponding tool_results and attaches them to the grouped message.
 * When verbose is true, skips grouping so messages render at original positions.
 */
function applyGrouping(messages, tools, verbose) {
    var _a;
    if (verbose === void 0) { verbose = false; }
    // In verbose mode, don't group - each message renders at its original position
    if (verbose) {
        return {
            messages: messages,
        };
    }
    var toolsWithGrouping = getToolsWithGrouping(tools);
    // First pass: group tool uses by message.id + tool name
    var groups = new Map();
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        var info = getToolUseInfo(msg);
        if (info && toolsWithGrouping.has(info.toolName)) {
            var key = "".concat(info.messageId, ":").concat(info.toolName);
            var group = (_a = groups.get(key)) !== null && _a !== void 0 ? _a : [];
            group.push(msg);
            groups.set(key, group);
        }
    }
    // Identify valid groups (2+ items) and collect their tool use IDs
    var validGroups = new Map();
    var groupedToolUseIds = new Set();
    for (var _b = 0, groups_1 = groups; _b < groups_1.length; _b++) {
        var _c = groups_1[_b], key = _c[0], group = _c[1];
        if (group.length >= 2) {
            validGroups.set(key, group);
            for (var _d = 0, group_1 = group; _d < group_1.length; _d++) {
                var msg = group_1[_d];
                var info = getToolUseInfo(msg);
                if (info) {
                    groupedToolUseIds.add(info.toolUseId);
                }
            }
        }
    }
    // Collect result messages for grouped tool_uses
    // Map from tool_use_id to the user message containing that result
    var resultsByToolUseId = new Map();
    for (var _e = 0, messages_2 = messages; _e < messages_2.length; _e++) {
        var msg = messages_2[_e];
        if (msg.type === 'user') {
            for (var _f = 0, _g = msg.message.content; _f < _g.length; _f++) {
                var content = _g[_f];
                if (content.type === 'tool_result' &&
                    groupedToolUseIds.has(content.tool_use_id)) {
                    resultsByToolUseId.set(content.tool_use_id, msg);
                }
            }
        }
    }
    // Second pass: build output, emitting each group only once
    var result = [];
    var emittedGroups = new Set();
    for (var _h = 0, messages_3 = messages; _h < messages_3.length; _h++) {
        var msg = messages_3[_h];
        var info = getToolUseInfo(msg);
        if (info) {
            var key = "".concat(info.messageId, ":").concat(info.toolName);
            var group = validGroups.get(key);
            if (group) {
                if (!emittedGroups.has(key)) {
                    emittedGroups.add(key);
                    var firstMsg = group[0];
                    // Collect results for this group
                    var results = [];
                    for (var _j = 0, group_2 = group; _j < group_2.length; _j++) {
                        var assistantMsg = group_2[_j];
                        var toolUseId = assistantMsg.message.content[0].id;
                        var resultMsg = resultsByToolUseId.get(toolUseId);
                        if (resultMsg) {
                            results.push(resultMsg);
                        }
                    }
                    var groupedMessage = {
                        type: 'grouped_tool_use',
                        toolName: info.toolName,
                        messages: group,
                        results: results,
                        displayMessage: firstMsg,
                        uuid: "grouped-".concat(firstMsg.uuid),
                        timestamp: firstMsg.timestamp,
                        messageId: info.messageId,
                    };
                    result.push(groupedMessage);
                }
                continue;
            }
        }
        // Skip user messages whose tool_results are all grouped
        if (msg.type === 'user') {
            var toolResults = msg.message.content.filter(function (c) { return c.type === 'tool_result'; });
            if (toolResults.length > 0) {
                var allGrouped = toolResults.every(function (tr) {
                    return groupedToolUseIds.has(tr.tool_use_id);
                });
                if (allGrouped) {
                    continue;
                }
            }
        }
        result.push(msg);
    }
    return { messages: result };
}
