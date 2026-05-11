"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContext = analyzeContext;
exports.tokenStatsToStatsigMetrics = tokenStatsToStatsigMetrics;
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var messages_js_1 = require("./messages.js");
var slowOperations_js_1 = require("./slowOperations.js");
function analyzeContext(messages) {
    var stats = {
        toolRequests: new Map(),
        toolResults: new Map(),
        humanMessages: 0,
        assistantMessages: 0,
        localCommandOutputs: 0,
        other: 0,
        attachments: new Map(),
        duplicateFileReads: new Map(),
        total: 0,
    };
    var toolIdsToToolNames = new Map();
    var readToolIdToFilePath = new Map();
    var fileReadStats = new Map();
    messages.forEach(function (msg) {
        if (msg.type === 'attachment') {
            var type = msg.attachment.type || 'unknown';
            stats.attachments.set(type, (stats.attachments.get(type) || 0) + 1);
        }
    });
    var normalizedMessages = (0, messages_js_1.normalizeMessagesForAPI)(messages);
    normalizedMessages.forEach(function (msg) {
        var content = msg.message.content;
        // Not sure if this path is still used, but adding as a fallback
        if (typeof content === 'string') {
            var tokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(content);
            stats.total += tokens;
            // Check if this is a local command output
            if (msg.type === 'user' && content.includes('local-command-stdout')) {
                stats.localCommandOutputs += tokens;
            }
            else {
                stats[msg.type === 'user' ? 'humanMessages' : 'assistantMessages'] +=
                    tokens;
            }
        }
        else {
            content.forEach(function (block) {
                return processBlock(block, msg, stats, toolIdsToToolNames, readToolIdToFilePath, fileReadStats);
            });
        }
    });
    // Calculate duplicate file reads
    fileReadStats.forEach(function (data, path) {
        if (data.count > 1) {
            var averageTokensPerRead = Math.floor(data.totalTokens / data.count);
            var duplicateTokens = averageTokensPerRead * (data.count - 1);
            stats.duplicateFileReads.set(path, {
                count: data.count,
                tokens: duplicateTokens,
            });
        }
    });
    return stats;
}
function processBlock(block, message, stats, toolIds, readToolPaths, fileReads) {
    var tokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)(block));
    stats.total += tokens;
    switch (block.type) {
        case 'text':
            // Check if this is a local command output
            if (message.type === 'user' &&
                'text' in block &&
                block.text.includes('local-command-stdout')) {
                stats.localCommandOutputs += tokens;
            }
            else {
                stats[message.type === 'user' ? 'humanMessages' : 'assistantMessages'] += tokens;
            }
            break;
        case 'tool_use': {
            if ('name' in block && 'id' in block) {
                var toolName = block.name || 'unknown';
                increment(stats.toolRequests, toolName, tokens);
                toolIds.set(block.id, toolName);
                // Track Read tool file paths
                if (toolName === 'Read' &&
                    'input' in block &&
                    block.input &&
                    typeof block.input === 'object' &&
                    'file_path' in block.input) {
                    var path = String(block.input.file_path);
                    readToolPaths.set(block.id, path);
                }
            }
            break;
        }
        case 'tool_result': {
            if ('tool_use_id' in block) {
                var toolName = toolIds.get(block.tool_use_id) || 'unknown';
                increment(stats.toolResults, toolName, tokens);
                // Track file read tokens
                if (toolName === 'Read') {
                    var path = readToolPaths.get(block.tool_use_id);
                    if (path) {
                        var current = fileReads.get(path) || { count: 0, totalTokens: 0 };
                        fileReads.set(path, {
                            count: current.count + 1,
                            totalTokens: current.totalTokens + tokens,
                        });
                    }
                }
            }
            break;
        }
        case 'image':
        case 'server_tool_use':
        case 'web_search_tool_result':
        case 'search_result':
        case 'document':
        case 'thinking':
        case 'redacted_thinking':
        case 'code_execution_tool_result':
        case 'mcp_tool_use':
        case 'mcp_tool_result':
        case 'container_upload':
        case 'web_fetch_tool_result':
        case 'bash_code_execution_tool_result':
        case 'text_editor_code_execution_tool_result':
        case 'tool_search_tool_result':
        case 'compaction':
            // Don't care about these for now..
            stats['other'] += tokens;
            break;
    }
}
function increment(map, key, value) {
    map.set(key, (map.get(key) || 0) + value);
}
function tokenStatsToStatsigMetrics(stats) {
    var metrics = {
        total_tokens: stats.total,
        human_message_tokens: stats.humanMessages,
        assistant_message_tokens: stats.assistantMessages,
        local_command_output_tokens: stats.localCommandOutputs,
        other_tokens: stats.other,
    };
    stats.attachments.forEach(function (count, type) {
        metrics["attachment_".concat(type, "_count")] = count;
    });
    stats.toolRequests.forEach(function (tokens, tool) {
        metrics["tool_request_".concat(tool, "_tokens")] = tokens;
    });
    stats.toolResults.forEach(function (tokens, tool) {
        metrics["tool_result_".concat(tool, "_tokens")] = tokens;
    });
    var duplicateTotal = __spreadArray([], stats.duplicateFileReads.values(), true).reduce(function (sum, d) { return sum + d.tokens; }, 0);
    metrics.duplicate_read_tokens = duplicateTotal;
    metrics.duplicate_read_file_count = stats.duplicateFileReads.size;
    if (stats.total > 0) {
        metrics.human_message_percent = Math.round((stats.humanMessages / stats.total) * 100);
        metrics.assistant_message_percent = Math.round((stats.assistantMessages / stats.total) * 100);
        metrics.local_command_output_percent = Math.round((stats.localCommandOutputs / stats.total) * 100);
        metrics.duplicate_read_percent = Math.round((duplicateTotal / stats.total) * 100);
        var toolRequestTotal = __spreadArray([], stats.toolRequests.values(), true).reduce(function (sum, v) { return sum + v; }, 0);
        var toolResultTotal = __spreadArray([], stats.toolResults.values(), true).reduce(function (sum, v) { return sum + v; }, 0);
        metrics.tool_request_percent = Math.round((toolRequestTotal / stats.total) * 100);
        metrics.tool_result_percent = Math.round((toolResultTotal / stats.total) * 100);
        // Add individual tool request percentages
        stats.toolRequests.forEach(function (tokens, tool) {
            metrics["tool_request_".concat(tool, "_percent")] = Math.round((tokens / stats.total) * 100);
        });
        // Add individual tool result percentages
        stats.toolResults.forEach(function (tokens, tool) {
            metrics["tool_result_".concat(tool, "_percent")] = Math.round((tokens / stats.total) * 100);
        });
    }
    return metrics;
}
