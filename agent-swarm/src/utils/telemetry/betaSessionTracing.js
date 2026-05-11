"use strict";
/**
 * Beta Session Tracing for Claude Code
 *
 * This module contains beta tracing features enabled when
 * ENABLE_BETA_TRACING_DETAILED=1 and BETA_TRACING_ENDPOINT are set.
 *
 * For external users, tracing is enabled in SDK/headless mode, or in
 * interactive mode when the org is allowlisted via the
 * tengu_trace_lantern GrowthBook gate.
 * For ant users, tracing is enabled in all modes.
 *
 * Visibility Rules:
 * | Content          | External | Ant  |
 * |------------------|----------|------|
 * | System prompts   | ✅                  | ✅   |
 * | Model output     | ✅                  | ✅   |
 * | Thinking output  | ❌                  | ✅   |
 * | Tools            | ✅                  | ✅   |
 * | new_context      | ✅                  | ✅   |
 *
 * Features:
 * - Per-agent message tracking with hash-based deduplication
 * - System prompt logging (once per unique hash)
 * - Hook execution spans
 * - Detailed new_context attributes for LLM requests
 */
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
exports.clearBetaTracingState = clearBetaTracingState;
exports.isBetaTracingEnabled = isBetaTracingEnabled;
exports.truncateContent = truncateContent;
exports.addBetaInteractionAttributes = addBetaInteractionAttributes;
exports.addBetaLLMRequestAttributes = addBetaLLMRequestAttributes;
exports.addBetaLLMResponseAttributes = addBetaLLMResponseAttributes;
exports.addBetaToolInputAttributes = addBetaToolInputAttributes;
exports.addBetaToolResultAttributes = addBetaToolResultAttributes;
var crypto_1 = require("crypto");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var metadata_js_1 = require("../../services/analytics/metadata.js");
var envUtils_js_1 = require("../envUtils.js");
var slowOperations_js_1 = require("../slowOperations.js");
var events_js_1 = require("./events.js");
/**
 * Track hashes we've already logged this session (system prompts, tools, etc).
 *
 * WHY: System prompts and tool schemas are large and rarely change within a session.
 * Sending full content on every request would be wasteful. Instead, we hash and
 * only log the full content once per unique hash.
 */
var seenHashes = new Set();
/**
 * Track the last reported message hash per querySource (agent) for incremental context.
 *
 * WHY: When debugging traces, we want to see what NEW information was added each turn,
 * not the entire conversation history (which can be huge). By tracking the last message
 * we reported per agent, we can compute and send only the delta (new messages since
 * the last request). This is tracked per-agent (querySource) because different agents
 * (main thread, subagents, warmup requests) have independent conversation contexts.
 */
var lastReportedMessageHash = new Map();
/**
 * Clear tracking state after compaction.
 * Old hashes are irrelevant once messages have been replaced.
 */
function clearBetaTracingState() {
    seenHashes.clear();
    lastReportedMessageHash.clear();
}
var MAX_CONTENT_SIZE = 60 * 1024; // 60KB (Honeycomb limit is 64KB, staying safe)
/**
 * Check if beta detailed tracing is enabled.
 * - Requires ENABLE_BETA_TRACING_DETAILED=1 and BETA_TRACING_ENDPOINT
 * - For external users, enabled in SDK/headless mode OR when org is
 *   allowlisted via the tengu_trace_lantern GrowthBook gate
 */
function isBetaTracingEnabled() {
    var baseEnabled = (0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_BETA_TRACING_DETAILED) &&
        Boolean(process.env.BETA_TRACING_ENDPOINT);
    if (!baseEnabled) {
        return false;
    }
    // For external users, enable in SDK/headless mode OR when org is allowlisted.
    // Gate reads from disk cache, so first run after allowlisting returns false;
    // works from second run onward (same behavior as enhanced_telemetry_beta).
    if (process.env.USER_TYPE !== 'ant') {
        return ((0, state_js_1.getIsNonInteractiveSession)() ||
            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_trace_lantern', false));
    }
    return true;
}
/**
 * Truncate content to fit within Honeycomb limits.
 */
function truncateContent(content, maxSize) {
    if (maxSize === void 0) { maxSize = MAX_CONTENT_SIZE; }
    if (content.length <= maxSize) {
        return { content: content, truncated: false };
    }
    return {
        content: content.slice(0, maxSize) +
            '\n\n[TRUNCATED - Content exceeds 60KB limit]',
        truncated: true,
    };
}
/**
 * Generate a short hash (first 12 hex chars of SHA-256).
 */
function shortHash(content) {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex').slice(0, 12);
}
/**
 * Generate a hash for a system prompt.
 */
function hashSystemPrompt(systemPrompt) {
    return "sp_".concat(shortHash(systemPrompt));
}
/**
 * Generate a hash for a message based on its content.
 */
function hashMessage(message) {
    var content = (0, slowOperations_js_1.jsonStringify)(message.message.content);
    return "msg_".concat(shortHash(content));
}
// Regex to detect content wrapped in <system-reminder> tags
var SYSTEM_REMINDER_REGEX = /^<system-reminder>\n?([\s\S]*?)\n?<\/system-reminder>$/;
/**
 * Check if text is entirely a system reminder (wrapped in <system-reminder> tags).
 * Returns the inner content if it is, null otherwise.
 */
function extractSystemReminderContent(text) {
    var match = text.trim().match(SYSTEM_REMINDER_REGEX);
    return match && match[1] ? match[1].trim() : null;
}
/**
 * Format user messages for new_context display, separating system reminders.
 * Only handles user messages (assistant messages are filtered out before this is called).
 */
function formatMessagesForContext(messages) {
    var contextParts = [];
    var systemReminders = [];
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        var content = message.message.content;
        if (typeof content === 'string') {
            var reminderContent = extractSystemReminderContent(content);
            if (reminderContent) {
                systemReminders.push(reminderContent);
            }
            else {
                contextParts.push("[USER]\n".concat(content));
            }
        }
        else if (Array.isArray(content)) {
            for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
                var block = content_1[_a];
                if (block.type === 'text') {
                    var reminderContent = extractSystemReminderContent(block.text);
                    if (reminderContent) {
                        systemReminders.push(reminderContent);
                    }
                    else {
                        contextParts.push("[USER]\n".concat(block.text));
                    }
                }
                else if (block.type === 'tool_result') {
                    var resultContent = typeof block.content === 'string'
                        ? block.content
                        : (0, slowOperations_js_1.jsonStringify)(block.content);
                    // Tool results can also contain system reminders (e.g., malware warning)
                    var reminderContent = extractSystemReminderContent(resultContent);
                    if (reminderContent) {
                        systemReminders.push(reminderContent);
                    }
                    else {
                        contextParts.push("[TOOL RESULT: ".concat(block.tool_use_id, "]\n").concat(resultContent));
                    }
                }
            }
        }
    }
    return { contextParts: contextParts, systemReminders: systemReminders };
}
/**
 * Add beta attributes to an interaction span.
 * Adds new_context with the user prompt.
 */
function addBetaInteractionAttributes(span, userPrompt) {
    if (!isBetaTracingEnabled()) {
        return;
    }
    var _a = truncateContent("[USER PROMPT]\n".concat(userPrompt)), truncatedPrompt = _a.content, truncated = _a.truncated;
    span.setAttributes(__assign({ new_context: truncatedPrompt }, (truncated && {
        new_context_truncated: true,
        new_context_original_length: userPrompt.length,
    })));
}
/**
 * Add beta attributes to an LLM request span.
 * Handles system prompt logging and new_context computation.
 */
function addBetaLLMRequestAttributes(span, newContext, messagesForAPI) {
    if (!isBetaTracingEnabled()) {
        return;
    }
    // Add system prompt info to the span
    if (newContext === null || newContext === void 0 ? void 0 : newContext.systemPrompt) {
        var promptHash = hashSystemPrompt(newContext.systemPrompt);
        var preview = newContext.systemPrompt.slice(0, 500);
        // Always add hash, preview, and length to the span
        span.setAttribute('system_prompt_hash', promptHash);
        span.setAttribute('system_prompt_preview', preview);
        span.setAttribute('system_prompt_length', newContext.systemPrompt.length);
        // Log the full system prompt only once per unique hash this session
        if (!seenHashes.has(promptHash)) {
            seenHashes.add(promptHash);
            // Truncate for the log if needed
            var _a = truncateContent(newContext.systemPrompt), truncatedPrompt = _a.content, truncated = _a.truncated;
            void (0, events_js_1.logOTelEvent)('system_prompt', __assign({ system_prompt_hash: promptHash, system_prompt: truncatedPrompt, system_prompt_length: String(newContext.systemPrompt.length) }, (truncated && { system_prompt_truncated: 'true' })));
        }
    }
    // Add tools info to the span
    if (newContext === null || newContext === void 0 ? void 0 : newContext.tools) {
        try {
            var toolsArray = (0, slowOperations_js_1.jsonParse)(newContext.tools);
            // Build array of {name, hash} for each tool
            var toolsWithHashes = toolsArray.map(function (tool) {
                var toolJson = (0, slowOperations_js_1.jsonStringify)(tool);
                var toolHash = shortHash(toolJson);
                return {
                    name: typeof tool.name === 'string' ? tool.name : 'unknown',
                    hash: toolHash,
                    json: toolJson,
                };
            });
            // Set span attribute with array of name/hash pairs
            span.setAttribute('tools', (0, slowOperations_js_1.jsonStringify)(toolsWithHashes.map(function (_a) {
                var name = _a.name, hash = _a.hash;
                return ({ name: name, hash: hash });
            })));
            span.setAttribute('tools_count', toolsWithHashes.length);
            // Log each tool's full description once per unique hash
            for (var _i = 0, toolsWithHashes_1 = toolsWithHashes; _i < toolsWithHashes_1.length; _i++) {
                var _b = toolsWithHashes_1[_i], name_1 = _b.name, hash = _b.hash, json = _b.json;
                if (!seenHashes.has("tool_".concat(hash))) {
                    seenHashes.add("tool_".concat(hash));
                    var _c = truncateContent(json), truncatedTool = _c.content, truncated = _c.truncated;
                    void (0, events_js_1.logOTelEvent)('tool', __assign({ tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(name_1), tool_hash: hash, tool: truncatedTool }, (truncated && { tool_truncated: 'true' })));
                }
            }
        }
        catch (_d) {
            // If parsing fails, log the raw tools string
            span.setAttribute('tools_parse_error', true);
        }
    }
    // Add new_context using hash-based tracking (visible to all users)
    if (messagesForAPI && messagesForAPI.length > 0 && (newContext === null || newContext === void 0 ? void 0 : newContext.querySource)) {
        var querySource = newContext.querySource;
        var lastHash = lastReportedMessageHash.get(querySource);
        // Find where the last reported message is in the array
        var startIndex = 0;
        if (lastHash) {
            for (var i = 0; i < messagesForAPI.length; i++) {
                var msg = messagesForAPI[i];
                if (msg && hashMessage(msg) === lastHash) {
                    startIndex = i + 1; // Start after the last reported message
                    break;
                }
            }
            // If lastHash not found, startIndex stays 0 (send everything)
        }
        // Get new messages (filter out assistant messages - we only want user input/tool results)
        var newMessages = messagesForAPI
            .slice(startIndex)
            .filter(function (m) { return m.type === 'user'; });
        if (newMessages.length > 0) {
            // Format new messages, separating system reminders from regular content
            var _e = formatMessagesForContext(newMessages), contextParts = _e.contextParts, systemReminders = _e.systemReminders;
            // Set new_context (regular user content and tool results)
            if (contextParts.length > 0) {
                var fullContext = contextParts.join('\n\n---\n\n');
                var _f = truncateContent(fullContext), truncatedContext = _f.content, truncated = _f.truncated;
                span.setAttributes(__assign({ new_context: truncatedContext, new_context_message_count: newMessages.length }, (truncated && {
                    new_context_truncated: true,
                    new_context_original_length: fullContext.length,
                })));
            }
            // Set system_reminders as a separate attribute
            if (systemReminders.length > 0) {
                var fullReminders = systemReminders.join('\n\n---\n\n');
                var _g = truncateContent(fullReminders), truncatedReminders = _g.content, remindersTruncated = _g.truncated;
                span.setAttributes(__assign({ system_reminders: truncatedReminders, system_reminders_count: systemReminders.length }, (remindersTruncated && {
                    system_reminders_truncated: true,
                    system_reminders_original_length: fullReminders.length,
                })));
            }
            // Update last reported hash to the last message in the array
            var lastMessage = messagesForAPI[messagesForAPI.length - 1];
            if (lastMessage) {
                lastReportedMessageHash.set(querySource, hashMessage(lastMessage));
            }
        }
    }
}
/**
 * Add beta attributes to endLLMRequestSpan.
 * Handles model_output and thinking_output truncation.
 */
function addBetaLLMResponseAttributes(endAttributes, metadata) {
    if (!isBetaTracingEnabled() || !metadata) {
        return;
    }
    // Add model_output (text content) - visible to all users
    if (metadata.modelOutput !== undefined) {
        var _a = truncateContent(metadata.modelOutput), modelOutput = _a.content, outputTruncated = _a.truncated;
        endAttributes['response.model_output'] = modelOutput;
        if (outputTruncated) {
            endAttributes['response.model_output_truncated'] = true;
            endAttributes['response.model_output_original_length'] =
                metadata.modelOutput.length;
        }
    }
    // Add thinking_output - ant-only
    if (process.env.USER_TYPE === 'ant' &&
        metadata.thinkingOutput !== undefined) {
        var _b = truncateContent(metadata.thinkingOutput), thinkingOutput = _b.content, thinkingTruncated = _b.truncated;
        endAttributes['response.thinking_output'] = thinkingOutput;
        if (thinkingTruncated) {
            endAttributes['response.thinking_output_truncated'] = true;
            endAttributes['response.thinking_output_original_length'] =
                metadata.thinkingOutput.length;
        }
    }
}
/**
 * Add beta attributes to startToolSpan.
 * Adds tool_input with the serialized tool input.
 */
function addBetaToolInputAttributes(span, toolName, toolInput) {
    if (!isBetaTracingEnabled()) {
        return;
    }
    var _a = truncateContent("[TOOL INPUT: ".concat(toolName, "]\n").concat(toolInput)), truncatedInput = _a.content, truncated = _a.truncated;
    span.setAttributes(__assign({ tool_input: truncatedInput }, (truncated && {
        tool_input_truncated: true,
        tool_input_original_length: toolInput.length,
    })));
}
/**
 * Add beta attributes to endToolSpan.
 * Adds new_context with the tool result.
 */
function addBetaToolResultAttributes(endAttributes, toolName, toolResult) {
    if (!isBetaTracingEnabled()) {
        return;
    }
    var _a = truncateContent("[TOOL RESULT: ".concat(toolName, "]\n").concat(toolResult)), truncatedResult = _a.content, truncated = _a.truncated;
    endAttributes['new_context'] = truncatedResult;
    if (truncated) {
        endAttributes['new_context_truncated'] = true;
        endAttributes['new_context_original_length'] = toolResult.length;
    }
}
