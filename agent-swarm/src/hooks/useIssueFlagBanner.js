"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSessionContainerCompatible = isSessionContainerCompatible;
exports.hasFrictionSignal = hasFrictionSignal;
exports.useIssueFlagBanner = useIssueFlagBanner;
var react_1 = require("react");
var toolName_js_1 = require("../tools/BashTool/toolName.js");
var messages_js_1 = require("../utils/messages.js");
var EXTERNAL_COMMAND_PATTERNS = [
    /\bcurl\b/,
    /\bwget\b/,
    /\bssh\b/,
    /\bkubectl\b/,
    /\bsrun\b/,
    /\bdocker\b/,
    /\bbq\b/,
    /\bgsutil\b/,
    /\bgcloud\b/,
    /\baws\b/,
    /\bgit\s+push\b/,
    /\bgit\s+pull\b/,
    /\bgit\s+fetch\b/,
    /\bgh\s+(pr|issue)\b/,
    /\bnc\b/,
    /\bncat\b/,
    /\btelnet\b/,
    /\bftp\b/,
];
var FRICTION_PATTERNS = [
    // "No," or "No!" at start — comma/exclamation implies correction tone
    // (avoids "No problem", "No thanks", "No I think we should...")
    /^no[,!]\s/i,
    // Direct corrections about Claude's output
    /\bthat'?s (wrong|incorrect|not (what|right|correct))\b/i,
    /\bnot what I (asked|wanted|meant|said)\b/i,
    // Referencing prior instructions Claude missed
    /\bI (said|asked|wanted|told you|already said)\b/i,
    // Questioning Claude's actions
    /\bwhy did you\b/i,
    /\byou should(n'?t| not)? have\b/i,
    /\byou were supposed to\b/i,
    // Explicit retry/revert of Claude's work
    /\btry again\b/i,
    /\b(undo|revert) (that|this|it|what you)\b/i,
];
function isSessionContainerCompatible(messages) {
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (msg.type !== 'assistant') {
            continue;
        }
        var content = msg.message.content;
        if (!Array.isArray(content)) {
            continue;
        }
        var _loop_1 = function (block) {
            if (block.type !== 'tool_use' || !('name' in block)) {
                return "continue";
            }
            var toolName = block.name;
            if (toolName.startsWith('mcp__')) {
                return { value: false };
            }
            if (toolName === toolName_js_1.BASH_TOOL_NAME) {
                var input = block.input;
                var command_1 = (input === null || input === void 0 ? void 0 : input.command) || '';
                if (EXTERNAL_COMMAND_PATTERNS.some(function (p) { return p.test(command_1); })) {
                    return { value: false };
                }
            }
        };
        for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
            var block = content_1[_a];
            var state_1 = _loop_1(block);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    return true;
}
function hasFrictionSignal(messages) {
    var _loop_2 = function (i) {
        var msg = messages[i];
        if (msg.type !== 'user') {
            return "continue";
        }
        var text = (0, messages_js_1.getUserMessageText)(msg);
        if (!text) {
            return "continue";
        }
        return { value: FRICTION_PATTERNS.some(function (p) { return p.test(text); }) };
    };
    for (var i = messages.length - 1; i >= 0; i--) {
        var state_2 = _loop_2(i);
        if (typeof state_2 === "object")
            return state_2.value;
    }
    return false;
}
var MIN_SUBMIT_COUNT = 3;
var COOLDOWN_MS = 30 * 60 * 1000;
function useIssueFlagBanner(messages, submitCount) {
    if (process.env.USER_TYPE !== 'ant') {
        return false;
    }
    // biome-ignore lint/correctness/useHookAtTopLevel: process.env.USER_TYPE is a compile-time constant
    var lastTriggeredAtRef = (0, react_1.useRef)(0);
    // biome-ignore lint/correctness/useHookAtTopLevel: process.env.USER_TYPE is a compile-time constant
    var activeForSubmitRef = (0, react_1.useRef)(-1);
    // Memoize the O(messages) scans. This hook runs on every REPL render
    // (including every keystroke), but messages is stable during typing.
    // isSessionContainerCompatible walks all messages + regex-tests each
    // bash command — by far the heaviest work here.
    // biome-ignore lint/correctness/useHookAtTopLevel: process.env.USER_TYPE is a compile-time constant
    var shouldTrigger = (0, react_1.useMemo)(function () { return isSessionContainerCompatible(messages) && hasFrictionSignal(messages); }, [messages]);
    // Keep showing the banner until the user submits another message
    if (activeForSubmitRef.current === submitCount) {
        return true;
    }
    if (Date.now() - lastTriggeredAtRef.current < COOLDOWN_MS) {
        return false;
    }
    if (submitCount < MIN_SUBMIT_COUNT) {
        return false;
    }
    if (!shouldTrigger) {
        return false;
    }
    lastTriggeredAtRef.current = Date.now();
    activeForSubmitRef.current = submitCount;
    return true;
}
