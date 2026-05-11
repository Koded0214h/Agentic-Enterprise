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
exports.processTextPrompt = processTextPrompt;
var crypto_1 = require("crypto");
var state_js_1 = require("src/bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var messages_js_1 = require("../messages.js");
var events_js_1 = require("../telemetry/events.js");
var sessionTracing_js_1 = require("../telemetry/sessionTracing.js");
var userPromptKeywords_js_1 = require("../userPromptKeywords.js");
function processTextPrompt(input, imageContentBlocks, imagePasteIds, attachmentMessages, uuid, permissionMode, isMeta) {
    var _a, _b;
    var promptId = (0, crypto_1.randomUUID)();
    (0, state_js_1.setPromptId)(promptId);
    var userPromptText = typeof input === 'string'
        ? input
        : ((_a = input.find(function (block) { return block.type === 'text'; })) === null || _a === void 0 ? void 0 : _a.text) || '';
    (0, sessionTracing_js_1.startInteractionSpan)(userPromptText);
    // Emit user_prompt OTEL event for both string (CLI) and array (SDK/VS Code)
    // input shapes. Previously gated on `typeof input === 'string'`, so VS Code
    // sessions never emitted user_prompt (anthropics/claude-code#33301).
    // For array input, use the LAST text block: createUserContent pushes the
    // user's message last (after any <ide_selection>/attachment context blocks),
    // so .findLast gets the actual prompt. userPromptText (first block) is kept
    // unchanged for startInteractionSpan to preserve existing span attributes.
    var otelPromptText = typeof input === 'string'
        ? input
        : ((_b = input.findLast(function (block) { return block.type === 'text'; })) === null || _b === void 0 ? void 0 : _b.text) || '';
    if (otelPromptText) {
        void (0, events_js_1.logOTelEvent)('user_prompt', {
            prompt_length: String(otelPromptText.length),
            prompt: (0, events_js_1.redactIfDisabled)(otelPromptText),
            'prompt.id': promptId,
        });
    }
    var isNegative = (0, userPromptKeywords_js_1.matchesNegativeKeyword)(userPromptText);
    var isKeepGoing = (0, userPromptKeywords_js_1.matchesKeepGoingKeyword)(userPromptText);
    (0, index_js_1.logEvent)('tengu_input_prompt', {
        is_negative: isNegative,
        is_keep_going: isKeepGoing,
    });
    // If we have pasted images, create a message with image content
    if (imageContentBlocks.length > 0) {
        // Build content: text first, then images below
        var textContent = typeof input === 'string'
            ? input.trim()
                ? [{ type: 'text', text: input }]
                : []
            : input;
        var userMessage_1 = (0, messages_js_1.createUserMessage)({
            content: __spreadArray(__spreadArray([], textContent, true), imageContentBlocks, true),
            uuid: uuid,
            imagePasteIds: imagePasteIds.length > 0 ? imagePasteIds : undefined,
            permissionMode: permissionMode,
            isMeta: isMeta || undefined,
        });
        return {
            messages: __spreadArray([userMessage_1], attachmentMessages, true),
            shouldQuery: true,
        };
    }
    var userMessage = (0, messages_js_1.createUserMessage)({
        content: input,
        uuid: uuid,
        permissionMode: permissionMode,
        isMeta: isMeta || undefined,
    });
    return {
        messages: __spreadArray([userMessage], attachmentMessages, true),
        shouldQuery: true,
    };
}
