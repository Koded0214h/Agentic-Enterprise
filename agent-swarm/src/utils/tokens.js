"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenUsage = getTokenUsage;
exports.getTokenCountFromUsage = getTokenCountFromUsage;
exports.tokenCountFromLastAPIResponse = tokenCountFromLastAPIResponse;
exports.finalContextTokensFromLastResponse = finalContextTokensFromLastResponse;
exports.messageTokenCountFromLastAPIResponse = messageTokenCountFromLastAPIResponse;
exports.getCurrentUsage = getCurrentUsage;
exports.doesMostRecentAssistantMessageExceed200k = doesMostRecentAssistantMessageExceed200k;
exports.getAssistantMessageContentLength = getAssistantMessageContentLength;
exports.tokenCountWithEstimation = tokenCountWithEstimation;
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var messages_js_1 = require("./messages.js");
var slowOperations_js_1 = require("./slowOperations.js");
function getTokenUsage(message) {
    var _a;
    if ((message === null || message === void 0 ? void 0 : message.type) === 'assistant' &&
        'usage' in message.message &&
        !(((_a = message.message.content[0]) === null || _a === void 0 ? void 0 : _a.type) === 'text' &&
            messages_js_1.SYNTHETIC_MESSAGES.has(message.message.content[0].text)) &&
        message.message.model !== messages_js_1.SYNTHETIC_MODEL) {
        return message.message.usage;
    }
    return undefined;
}
/**
 * Get the API response id for an assistant message with real (non-synthetic) usage.
 * Used to identify split assistant records that came from the same API response —
 * when parallel tool calls are streamed, each content block becomes a separate
 * AssistantMessage record, but they all share the same message.id.
 */
function getAssistantMessageId(message) {
    if ((message === null || message === void 0 ? void 0 : message.type) === 'assistant' &&
        'id' in message.message &&
        message.message.model !== messages_js_1.SYNTHETIC_MODEL) {
        return message.message.id;
    }
    return undefined;
}
/**
 * Calculate total context window tokens from an API response's usage data.
 * Includes input_tokens + cache tokens + output_tokens.
 *
 * This represents the full context size at the time of that API call.
 * Use tokenCountWithEstimation() when you need context size from messages.
 */
function getTokenCountFromUsage(usage) {
    var _a, _b;
    return (usage.input_tokens +
        ((_a = usage.cache_creation_input_tokens) !== null && _a !== void 0 ? _a : 0) +
        ((_b = usage.cache_read_input_tokens) !== null && _b !== void 0 ? _b : 0) +
        usage.output_tokens);
}
function tokenCountFromLastAPIResponse(messages) {
    var i = messages.length - 1;
    while (i >= 0) {
        var message = messages[i];
        var usage = message ? getTokenUsage(message) : undefined;
        if (usage) {
            return getTokenCountFromUsage(usage);
        }
        i--;
    }
    return 0;
}
/**
 * Final context window size from the last API response's usage.iterations[-1].
 * Used for task_budget.remaining computation across compaction boundaries —
 * the server's budget countdown is context-based, so remaining decrements by
 * the pre-compact final window, not billing spend. See monorepo
 * api/api/sampling/prompt/renderer.py:292 for the server-side computation.
 *
 * Falls back to top-level input_tokens + output_tokens when iterations is
 * absent (no server-side tool loops, so top-level usage IS the final window).
 * Both paths exclude cache tokens to match #304930's formula.
 */
function finalContextTokensFromLastResponse(messages) {
    var i = messages.length - 1;
    while (i >= 0) {
        var message = messages[i];
        var usage = message ? getTokenUsage(message) : undefined;
        if (usage) {
            // Stainless types don't include iterations yet — cast like advisor.ts:43
            var iterations = usage.iterations;
            if (iterations && iterations.length > 0) {
                var last = iterations.at(-1);
                return last.input_tokens + last.output_tokens;
            }
            // No iterations → no server tool loop → top-level usage IS the final
            // window. Match the iterations path's formula (input + output, no cache)
            // rather than getTokenCountFromUsage — #304930 defines final window as
            // non-cache input + output. Whether the server's budget countdown
            // (renderer.py:292 calculate_context_tokens) counts cache the same way
            // is an open question; aligning with the iterations path keeps the two
            // branches consistent until that's resolved.
            return usage.input_tokens + usage.output_tokens;
        }
        i--;
    }
    return 0;
}
/**
 * Get only the output_tokens from the last API response.
 * This excludes input context (system prompt, tools, prior messages).
 *
 * WARNING: Do NOT use this for threshold comparisons (autocompact, session memory).
 * Use tokenCountWithEstimation() instead, which measures full context size.
 * This function is only useful for measuring how many tokens Claude generated
 * in a single response, not how full the context window is.
 */
function messageTokenCountFromLastAPIResponse(messages) {
    var i = messages.length - 1;
    while (i >= 0) {
        var message = messages[i];
        var usage = message ? getTokenUsage(message) : undefined;
        if (usage) {
            return usage.output_tokens;
        }
        i--;
    }
    return 0;
}
function getCurrentUsage(messages) {
    var _a, _b;
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        var usage = message ? getTokenUsage(message) : undefined;
        if (usage) {
            return {
                input_tokens: usage.input_tokens,
                output_tokens: usage.output_tokens,
                cache_creation_input_tokens: (_a = usage.cache_creation_input_tokens) !== null && _a !== void 0 ? _a : 0,
                cache_read_input_tokens: (_b = usage.cache_read_input_tokens) !== null && _b !== void 0 ? _b : 0,
            };
        }
    }
    return null;
}
function doesMostRecentAssistantMessageExceed200k(messages) {
    var THRESHOLD = 200000;
    var lastAsst = messages.findLast(function (m) { return m.type === 'assistant'; });
    if (!lastAsst)
        return false;
    var usage = getTokenUsage(lastAsst);
    return usage ? getTokenCountFromUsage(usage) > THRESHOLD : false;
}
/**
 * Calculate the character content length of an assistant message.
 * Used for spinner token estimation (characters / 4 ≈ tokens).
 * This is used when subagent streaming events are filtered out and we
 * need to count content from completed messages instead.
 *
 * Counts the same content that handleMessageFromStream would count via deltas:
 * - text (text_delta)
 * - thinking (thinking_delta)
 * - redacted_thinking data
 * - tool_use input (input_json_delta)
 * Note: signature_delta is excluded from streaming counts (not model output).
 */
function getAssistantMessageContentLength(message) {
    var contentLength = 0;
    for (var _i = 0, _a = message.message.content; _i < _a.length; _i++) {
        var block = _a[_i];
        if (block.type === 'text') {
            contentLength += block.text.length;
        }
        else if (block.type === 'thinking') {
            contentLength += block.thinking.length;
        }
        else if (block.type === 'redacted_thinking') {
            contentLength += block.data.length;
        }
        else if (block.type === 'tool_use') {
            contentLength += (0, slowOperations_js_1.jsonStringify)(block.input).length;
        }
    }
    return contentLength;
}
/**
 * Get the current context window size in tokens.
 *
 * This is the CANONICAL function for measuring context size when checking
 * thresholds (autocompact, session memory init, etc.). Uses the last API
 * response's token count (input + output + cache) plus estimates for any
 * messages added since.
 *
 * Always use this instead of:
 * - Cumulative token counting (which double-counts as context grows)
 * - messageTokenCountFromLastAPIResponse (which only counts output_tokens)
 * - tokenCountFromLastAPIResponse (which doesn't estimate new messages)
 *
 * Implementation note on parallel tool calls: when the model makes multiple
 * tool calls in one response, the streaming code emits a SEPARATE assistant
 * record per content block (all sharing the same message.id and usage), and
 * the query loop interleaves each tool_result immediately after its tool_use.
 * So the messages array looks like:
 *   [..., assistant(id=A), user(result), assistant(id=A), user(result), ...]
 * If we stop at the LAST assistant record, we only estimate the one tool_result
 * after it and miss all the earlier interleaved tool_results — which will ALL
 * be in the next API request. To avoid undercounting, after finding a usage-
 * bearing record we walk back to the FIRST sibling with the same message.id
 * so every interleaved tool_result is included in the rough estimate.
 */
function tokenCountWithEstimation(messages) {
    var i = messages.length - 1;
    while (i >= 0) {
        var message = messages[i];
        var usage = message ? getTokenUsage(message) : undefined;
        if (message && usage) {
            // Walk back past any earlier sibling records split from the same API
            // response (same message.id) so interleaved tool_results between them
            // are included in the estimation slice.
            var responseId = getAssistantMessageId(message);
            if (responseId) {
                var j = i - 1;
                while (j >= 0) {
                    var prior = messages[j];
                    var priorId = prior ? getAssistantMessageId(prior) : undefined;
                    if (priorId === responseId) {
                        // Earlier split of the same API response — anchor here instead.
                        i = j;
                    }
                    else if (priorId !== undefined) {
                        // Hit a different API response — stop walking.
                        break;
                    }
                    // priorId === undefined: a user/tool_result/attachment message,
                    // possibly interleaved between splits — keep walking.
                    j--;
                }
            }
            return (getTokenCountFromUsage(usage) +
                (0, tokenEstimation_js_1.roughTokenCountEstimationForMessages)(messages.slice(i + 1)));
        }
        i--;
    }
    return (0, tokenEstimation_js_1.roughTokenCountEstimationForMessages)(messages);
}
