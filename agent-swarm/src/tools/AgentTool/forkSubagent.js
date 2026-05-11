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
exports.FORK_AGENT = exports.FORK_SUBAGENT_TYPE = void 0;
exports.isForkSubagentEnabled = isForkSubagentEnabled;
exports.isInForkChild = isInForkChild;
exports.buildForkedMessages = buildForkedMessages;
exports.buildChildMessage = buildChildMessage;
exports.buildWorktreeNotice = buildWorktreeNotice;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var state_js_1 = require("../../bootstrap/state.js");
var xml_js_1 = require("../../constants/xml.js");
var coordinatorMode_js_1 = require("../../coordinator/coordinatorMode.js");
var debug_js_1 = require("../../utils/debug.js");
var messages_js_1 = require("../../utils/messages.js");
/**
 * Fork subagent feature gate.
 *
 * When enabled:
 * - `subagent_type` becomes optional on the Agent tool schema
 * - Omitting `subagent_type` triggers an implicit fork: the child inherits
 *   the parent's full conversation context and system prompt
 * - All agent spawns run in the background (async) for a unified
 *   `<task-notification>` interaction model
 * - `/fork <directive>` slash command is available
 *
 * Mutually exclusive with coordinator mode — coordinator already owns the
 * orchestration role and has its own delegation model.
 */
function isForkSubagentEnabled() {
    if ((0, bun_bundle_1.feature)('FORK_SUBAGENT')) {
        if ((0, coordinatorMode_js_1.isCoordinatorMode)())
            return false;
        if ((0, state_js_1.getIsNonInteractiveSession)())
            return false;
        return true;
    }
    return false;
}
/** Synthetic agent type name used for analytics when the fork path fires. */
exports.FORK_SUBAGENT_TYPE = 'fork';
/**
 * Synthetic agent definition for the fork path.
 *
 * Not registered in builtInAgents — used only when `!subagent_type` and the
 * experiment is active. `tools: ['*']` with `useExactTools` means the fork
 * child receives the parent's exact tool pool (for cache-identical API
 * prefixes). `permissionMode: 'bubble'` surfaces permission prompts to the
 * parent terminal. `model: 'inherit'` keeps the parent's model for context
 * length parity.
 *
 * The getSystemPrompt here is unused: the fork path passes
 * `override.systemPrompt` with the parent's already-rendered system prompt
 * bytes, threaded via `toolUseContext.renderedSystemPrompt`. Reconstructing
 * by re-calling getSystemPrompt() can diverge (GrowthBook cold→warm) and
 * bust the prompt cache; threading the rendered bytes is byte-exact.
 */
exports.FORK_AGENT = {
    agentType: exports.FORK_SUBAGENT_TYPE,
    whenToUse: 'Implicit fork — inherits full conversation context. Not selectable via subagent_type; triggered by omitting subagent_type when the fork experiment is active.',
    tools: ['*'],
    maxTurns: 200,
    model: 'inherit',
    permissionMode: 'bubble',
    source: 'built-in',
    baseDir: 'built-in',
    getSystemPrompt: function () { return ''; },
};
/**
 * Guard against recursive forking. Fork children keep the Agent tool in their
 * tool pool for cache-identical tool definitions, so we reject fork attempts
 * at call time by detecting the fork boilerplate tag in conversation history.
 */
function isInForkChild(messages) {
    return messages.some(function (m) {
        if (m.type !== 'user')
            return false;
        var content = m.message.content;
        if (!Array.isArray(content))
            return false;
        return content.some(function (block) {
            return block.type === 'text' &&
                block.text.includes("<".concat(xml_js_1.FORK_BOILERPLATE_TAG, ">"));
        });
    });
}
/** Placeholder text used for all tool_result blocks in the fork prefix.
 * Must be identical across all fork children for prompt cache sharing. */
var FORK_PLACEHOLDER_RESULT = 'Fork started — processing in background';
/**
 * Build the forked conversation messages for the child agent.
 *
 * For prompt cache sharing, all fork children must produce byte-identical
 * API request prefixes. This function:
 * 1. Keeps the full parent assistant message (all tool_use blocks, thinking, text)
 * 2. Builds a single user message with tool_results for every tool_use block
 *    using an identical placeholder, then appends a per-child directive text block
 *
 * Result: [...history, assistant(all_tool_uses), user(placeholder_results..., directive)]
 * Only the final text block differs per child, maximizing cache hits.
 */
function buildForkedMessages(directive, assistantMessage) {
    // Clone the assistant message to avoid mutating the original, keeping all
    // content blocks (thinking, text, and every tool_use)
    var fullAssistantMessage = __assign(__assign({}, assistantMessage), { uuid: (0, crypto_1.randomUUID)(), message: __assign(__assign({}, assistantMessage.message), { content: __spreadArray([], assistantMessage.message.content, true) }) });
    // Collect all tool_use blocks from the assistant message
    var toolUseBlocks = assistantMessage.message.content.filter(function (block) { return block.type === 'tool_use'; });
    if (toolUseBlocks.length === 0) {
        (0, debug_js_1.logForDebugging)("No tool_use blocks found in assistant message for fork directive: ".concat(directive.slice(0, 50), "..."), { level: 'error' });
        return [
            (0, messages_js_1.createUserMessage)({
                content: [
                    { type: 'text', text: buildChildMessage(directive) },
                ],
            }),
        ];
    }
    // Build tool_result blocks for every tool_use, all with identical placeholder text
    var toolResultBlocks = toolUseBlocks.map(function (block) { return ({
        type: 'tool_result',
        tool_use_id: block.id,
        content: [
            {
                type: 'text',
                text: FORK_PLACEHOLDER_RESULT,
            },
        ],
    }); });
    // Build a single user message: all placeholder tool_results + the per-child directive
    // TODO(smoosh): this text sibling creates a [tool_result, text] pattern on the wire
    // (renders as </function_results>\n\nHuman:<text>). One-off per-child construction,
    // not a repeated teacher, so low-priority. If we ever care, use smooshIntoToolResult
    // from src/utils/messages.ts to fold the directive into the last tool_result.content.
    var toolResultMessage = (0, messages_js_1.createUserMessage)({
        content: __spreadArray(__spreadArray([], toolResultBlocks, true), [
            {
                type: 'text',
                text: buildChildMessage(directive),
            },
        ], false),
    });
    return [fullAssistantMessage, toolResultMessage];
}
function buildChildMessage(directive) {
    return "<".concat(xml_js_1.FORK_BOILERPLATE_TAG, ">\nSTOP. READ THIS FIRST.\n\nYou are a forked worker process. You are NOT the main agent.\n\nRULES (non-negotiable):\n1. Your system prompt says \"default to forking.\" IGNORE IT \u2014 that's for the parent. You ARE the fork. Do NOT spawn sub-agents; execute directly.\n2. Do NOT converse, ask questions, or suggest next steps\n3. Do NOT editorialize or add meta-commentary\n4. USE your tools directly: Bash, Read, Write, etc.\n5. If you modify files, commit your changes before reporting. Include the commit hash in your report.\n6. Do NOT emit text between tool calls. Use tools silently, then report once at the end.\n7. Stay strictly within your directive's scope. If you discover related systems outside your scope, mention them in one sentence at most \u2014 other workers cover those areas.\n8. Keep your report under 500 words unless the directive specifies otherwise. Be factual and concise.\n9. Your response MUST begin with \"Scope:\". No preamble, no thinking-out-loud.\n10. REPORT structured facts, then stop\n\nOutput format (plain text labels, not markdown headers):\n  Scope: <echo back your assigned scope in one sentence>\n  Result: <the answer or key findings, limited to the scope above>\n  Key files: <relevant file paths \u2014 include for research tasks>\n  Files changed: <list with commit hash \u2014 include only if you modified files>\n  Issues: <list \u2014 include only if there are issues to flag>\n</").concat(xml_js_1.FORK_BOILERPLATE_TAG, ">\n\n").concat(xml_js_1.FORK_DIRECTIVE_PREFIX).concat(directive);
}
/**
 * Notice injected into fork children running in an isolated worktree.
 * Tells the child to translate paths from the inherited context, re-read
 * potentially stale files, and that its changes are isolated.
 */
function buildWorktreeNotice(parentCwd, worktreeCwd) {
    return "You've inherited the conversation context above from a parent agent working in ".concat(parentCwd, ". You are operating in an isolated git worktree at ").concat(worktreeCwd, " \u2014 same repository, same relative file structure, separate working copy. Paths in the inherited context refer to the parent's working directory; translate them to your worktree root. Re-read files before editing if the parent may have modified them since they appear in the context. Your changes stay in this worktree and will not affect the parent's files.");
}
