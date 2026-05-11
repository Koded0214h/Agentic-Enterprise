"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAUTH_ORG_NOT_ALLOWED_ERROR_MESSAGE = exports.API_TIMEOUT_ERROR_MESSAGE = exports.CUSTOM_OFF_SWITCH_MESSAGE = exports.REPEATED_529_ERROR_MESSAGE = exports.CCR_AUTH_ERROR_MESSAGE = exports.TOKEN_REVOKED_ERROR_MESSAGE = exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY = exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY_WITH_OAUTH = exports.INVALID_API_KEY_ERROR_MESSAGE_EXTERNAL = exports.INVALID_API_KEY_ERROR_MESSAGE = exports.CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE = exports.PROMPT_TOO_LONG_ERROR_MESSAGE = exports.API_ERROR_MESSAGE_PREFIX = void 0;
exports.startsWithApiErrorPrefix = startsWithApiErrorPrefix;
exports.isPromptTooLongMessage = isPromptTooLongMessage;
exports.parsePromptTooLongTokenCounts = parsePromptTooLongTokenCounts;
exports.getPromptTooLongTokenGap = getPromptTooLongTokenGap;
exports.isMediaSizeError = isMediaSizeError;
exports.isMediaSizeErrorMessage = isMediaSizeErrorMessage;
exports.getPdfTooLargeErrorMessage = getPdfTooLargeErrorMessage;
exports.getPdfPasswordProtectedErrorMessage = getPdfPasswordProtectedErrorMessage;
exports.getPdfInvalidErrorMessage = getPdfInvalidErrorMessage;
exports.getImageTooLargeErrorMessage = getImageTooLargeErrorMessage;
exports.getRequestTooLargeErrorMessage = getRequestTooLargeErrorMessage;
exports.getTokenRevokedErrorMessage = getTokenRevokedErrorMessage;
exports.getOauthOrgNotAllowedErrorMessage = getOauthOrgNotAllowedErrorMessage;
exports.isValidAPIMessage = isValidAPIMessage;
exports.extractUnknownErrorFormat = extractUnknownErrorFormat;
exports.getAssistantMessageFromError = getAssistantMessageFromError;
exports.classifyAPIError = classifyAPIError;
exports.categorizeRetryableAPIError = categorizeRetryableAPIError;
exports.getErrorMessageIfRefusal = getErrorMessageIfRefusal;
var sdk_1 = require("@anthropic-ai/sdk");
var betas_js_1 = require("src/constants/betas.js");
var auth_js_1 = require("src/utils/auth.js");
var messages_js_1 = require("src/utils/messages.js");
var model_js_1 = require("src/utils/model/model.js");
var modelStrings_js_1 = require("src/utils/model/modelStrings.js");
var providers_js_1 = require("src/utils/model/providers.js");
var state_js_1 = require("../../bootstrap/state.js");
var apiLimits_js_1 = require("../../constants/apiLimits.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var format_js_1 = require("../../utils/format.js");
var imageResizer_js_1 = require("../../utils/imageResizer.js");
var imageValidation_js_1 = require("../../utils/imageValidation.js");
var index_js_1 = require("../analytics/index.js");
var claudeAiLimits_js_1 = require("../claudeAiLimits.js");
var rateLimitMocking_js_1 = require("../rateLimitMocking.js"); // Used for /mock-limits command
var errorUtils_js_1 = require("./errorUtils.js");
exports.API_ERROR_MESSAGE_PREFIX = 'API Error';
function startsWithApiErrorPrefix(text) {
    return (text.startsWith(exports.API_ERROR_MESSAGE_PREFIX) ||
        text.startsWith("Please run /login \u00B7 ".concat(exports.API_ERROR_MESSAGE_PREFIX)));
}
exports.PROMPT_TOO_LONG_ERROR_MESSAGE = 'Prompt is too long';
function isPromptTooLongMessage(msg) {
    if (!msg.isApiErrorMessage) {
        return false;
    }
    var content = msg.message.content;
    if (!Array.isArray(content)) {
        return false;
    }
    return content.some(function (block) {
        return block.type === 'text' &&
            block.text.startsWith(exports.PROMPT_TOO_LONG_ERROR_MESSAGE);
    });
}
/**
 * Parse actual/limit token counts from a raw prompt-too-long API error
 * message like "prompt is too long: 137500 tokens > 135000 maximum".
 * The raw string may be wrapped in SDK prefixes or JSON envelopes, or
 * have different casing (Vertex), so this is intentionally lenient.
 */
function parsePromptTooLongTokenCounts(rawMessage) {
    var match = rawMessage.match(/prompt is too long[^0-9]*(\d+)\s*tokens?\s*>\s*(\d+)/i);
    return {
        actualTokens: match ? parseInt(match[1], 10) : undefined,
        limitTokens: match ? parseInt(match[2], 10) : undefined,
    };
}
/**
 * Returns how many tokens over the limit a prompt-too-long error reports,
 * or undefined if the message isn't PTL or its errorDetails are unparseable.
 * Reactive compact uses this gap to jump past multiple groups in one retry
 * instead of peeling one-at-a-time.
 */
function getPromptTooLongTokenGap(msg) {
    if (!isPromptTooLongMessage(msg) || !msg.errorDetails) {
        return undefined;
    }
    var _a = parsePromptTooLongTokenCounts(msg.errorDetails), actualTokens = _a.actualTokens, limitTokens = _a.limitTokens;
    if (actualTokens === undefined || limitTokens === undefined) {
        return undefined;
    }
    var gap = actualTokens - limitTokens;
    return gap > 0 ? gap : undefined;
}
/**
 * Is this raw API error text a media-size rejection that stripImagesFromMessages
 * can fix? Reactive compact's summarize retry uses this to decide whether to
 * strip and retry (media error) or bail (anything else).
 *
 * Patterns MUST stay in sync with the getAssistantMessageFromError branches
 * that populate errorDetails (~L523 PDF, ~L560 image, ~L573 many-image) and
 * the classifyAPIError branches (~L929-946). The closed loop: errorDetails is
 * only set after those branches already matched these same substrings, so
 * isMediaSizeError(errorDetails) is tautologically true for that path. API
 * wording drift causes graceful degradation (errorDetails stays undefined,
 * caller short-circuits), not a false negative.
 */
function isMediaSizeError(raw) {
    return ((raw.includes('image exceeds') && raw.includes('maximum')) ||
        (raw.includes('image dimensions exceed') && raw.includes('many-image')) ||
        /maximum of \d+ PDF pages/.test(raw));
}
/**
 * Message-level predicate: is this assistant message a media-size rejection?
 * Parallel to isPromptTooLongMessage. Checks errorDetails (the raw API error
 * string populated by the getAssistantMessageFromError branches at ~L523/560/573)
 * rather than content text, since media errors have per-variant content strings.
 */
function isMediaSizeErrorMessage(msg) {
    return (msg.isApiErrorMessage === true &&
        msg.errorDetails !== undefined &&
        isMediaSizeError(msg.errorDetails));
}
exports.CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE = 'Credit balance is too low';
exports.INVALID_API_KEY_ERROR_MESSAGE = 'Not logged in · Please run /login';
exports.INVALID_API_KEY_ERROR_MESSAGE_EXTERNAL = 'Invalid API key · Fix external API key';
exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY_WITH_OAUTH = 'Your ANTHROPIC_API_KEY belongs to a disabled organization · Unset the environment variable to use your subscription instead';
exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY = 'Your ANTHROPIC_API_KEY belongs to a disabled organization · Update or unset the environment variable';
exports.TOKEN_REVOKED_ERROR_MESSAGE = 'OAuth token revoked · Please run /login';
exports.CCR_AUTH_ERROR_MESSAGE = 'Authentication error · This may be a temporary network issue, please try again';
exports.REPEATED_529_ERROR_MESSAGE = 'Repeated 529 Overloaded errors';
exports.CUSTOM_OFF_SWITCH_MESSAGE = 'Opus is experiencing high load, please use /model to switch to Sonnet';
exports.API_TIMEOUT_ERROR_MESSAGE = 'Request timed out';
function getPdfTooLargeErrorMessage() {
    var limits = "max ".concat(apiLimits_js_1.API_PDF_MAX_PAGES, " pages, ").concat((0, format_js_1.formatFileSize)(apiLimits_js_1.PDF_TARGET_RAW_SIZE));
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? "PDF too large (".concat(limits, "). Try reading the file a different way (e.g., extract text with pdftotext).")
        : "PDF too large (".concat(limits, "). Double press esc to go back and try again, or use pdftotext to convert to text first.");
}
function getPdfPasswordProtectedErrorMessage() {
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? 'PDF is password protected. Try using a CLI tool to extract or convert the PDF.'
        : 'PDF is password protected. Please double press esc to edit your message and try again.';
}
function getPdfInvalidErrorMessage() {
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? 'The PDF file was not valid. Try converting it to text first (e.g., pdftotext).'
        : 'The PDF file was not valid. Double press esc to go back and try again with a different file.';
}
function getImageTooLargeErrorMessage() {
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? 'Image was too large. Try resizing the image or using a different approach.'
        : 'Image was too large. Double press esc to go back and try again with a smaller image.';
}
function getRequestTooLargeErrorMessage() {
    var limits = "max ".concat((0, format_js_1.formatFileSize)(apiLimits_js_1.PDF_TARGET_RAW_SIZE));
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? "Request too large (".concat(limits, "). Try with a smaller file.")
        : "Request too large (".concat(limits, "). Double press esc to go back and try with a smaller file.");
}
exports.OAUTH_ORG_NOT_ALLOWED_ERROR_MESSAGE = 'Your account does not have access to Claude Code. Please run /login.';
function getTokenRevokedErrorMessage() {
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? 'Your account does not have access to Claude. Please login again or contact your administrator.'
        : exports.TOKEN_REVOKED_ERROR_MESSAGE;
}
function getOauthOrgNotAllowedErrorMessage() {
    return (0, state_js_1.getIsNonInteractiveSession)()
        ? 'Your organization does not have access to Claude. Please login again or contact your administrator.'
        : exports.OAUTH_ORG_NOT_ALLOWED_ERROR_MESSAGE;
}
/**
 * Check if we're in CCR (Claude Code Remote) mode.
 * In CCR mode, auth is handled via JWTs provided by the infrastructure,
 * not via /login. Transient auth errors should suggest retrying, not logging in.
 */
function isCCRMode() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE);
}
// Temp helper to log tool_use/tool_result mismatch errors
function logToolUseToolResultMismatch(toolUseId, messages, messagesForAPI) {
    var _a;
    try {
        // Find tool_use in normalized messages
        var normalizedIndex = -1;
        for (var i = 0; i < messagesForAPI.length; i++) {
            var msg = messagesForAPI[i];
            if (!msg)
                continue;
            var content = msg.message.content;
            if (Array.isArray(content)) {
                for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
                    var block = content_1[_i];
                    if (block.type === 'tool_use' &&
                        'id' in block &&
                        block.id === toolUseId) {
                        normalizedIndex = i;
                        break;
                    }
                }
            }
            if (normalizedIndex !== -1)
                break;
        }
        // Find tool_use in original messages
        var originalIndex = -1;
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            if (!msg)
                continue;
            if (msg.type === 'assistant' && 'message' in msg) {
                var content = msg.message.content;
                if (Array.isArray(content)) {
                    for (var _b = 0, content_2 = content; _b < content_2.length; _b++) {
                        var block = content_2[_b];
                        if (block.type === 'tool_use' &&
                            'id' in block &&
                            block.id === toolUseId) {
                            originalIndex = i;
                            break;
                        }
                    }
                }
            }
            if (originalIndex !== -1)
                break;
        }
        // Build normalized sequence
        var normalizedSeq = [];
        for (var i = normalizedIndex + 1; i < messagesForAPI.length; i++) {
            var msg = messagesForAPI[i];
            if (!msg)
                continue;
            var content = msg.message.content;
            if (Array.isArray(content)) {
                for (var _c = 0, content_3 = content; _c < content_3.length; _c++) {
                    var block = content_3[_c];
                    var role = msg.message.role;
                    if (block.type === 'tool_use' && 'id' in block) {
                        normalizedSeq.push("".concat(role, ":tool_use:").concat(block.id));
                    }
                    else if (block.type === 'tool_result' && 'tool_use_id' in block) {
                        normalizedSeq.push("".concat(role, ":tool_result:").concat(block.tool_use_id));
                    }
                    else if (block.type === 'text') {
                        normalizedSeq.push("".concat(role, ":text"));
                    }
                    else if (block.type === 'thinking') {
                        normalizedSeq.push("".concat(role, ":thinking"));
                    }
                    else if (block.type === 'image') {
                        normalizedSeq.push("".concat(role, ":image"));
                    }
                    else {
                        normalizedSeq.push("".concat(role, ":").concat(block.type));
                    }
                }
            }
            else if (typeof content === 'string') {
                normalizedSeq.push("".concat(msg.message.role, ":string_content"));
            }
        }
        // Build pre-normalized sequence
        var preNormalizedSeq = [];
        for (var i = originalIndex + 1; i < messages.length; i++) {
            var msg = messages[i];
            if (!msg)
                continue;
            switch (msg.type) {
                case 'user':
                case 'assistant': {
                    if ('message' in msg) {
                        var content = msg.message.content;
                        if (Array.isArray(content)) {
                            for (var _d = 0, content_4 = content; _d < content_4.length; _d++) {
                                var block = content_4[_d];
                                var role = msg.message.role;
                                if (block.type === 'tool_use' && 'id' in block) {
                                    preNormalizedSeq.push("".concat(role, ":tool_use:").concat(block.id));
                                }
                                else if (block.type === 'tool_result' &&
                                    'tool_use_id' in block) {
                                    preNormalizedSeq.push("".concat(role, ":tool_result:").concat(block.tool_use_id));
                                }
                                else if (block.type === 'text') {
                                    preNormalizedSeq.push("".concat(role, ":text"));
                                }
                                else if (block.type === 'thinking') {
                                    preNormalizedSeq.push("".concat(role, ":thinking"));
                                }
                                else if (block.type === 'image') {
                                    preNormalizedSeq.push("".concat(role, ":image"));
                                }
                                else {
                                    preNormalizedSeq.push("".concat(role, ":").concat(block.type));
                                }
                            }
                        }
                        else if (typeof content === 'string') {
                            preNormalizedSeq.push("".concat(msg.message.role, ":string_content"));
                        }
                    }
                    break;
                }
                case 'attachment':
                    if ('attachment' in msg) {
                        preNormalizedSeq.push("attachment:".concat(msg.attachment.type));
                    }
                    break;
                case 'system':
                    if ('subtype' in msg) {
                        preNormalizedSeq.push("system:".concat(msg.subtype));
                    }
                    break;
                case 'progress':
                    if ('progress' in msg &&
                        msg.progress &&
                        typeof msg.progress === 'object' &&
                        'type' in msg.progress) {
                        preNormalizedSeq.push("progress:".concat((_a = msg.progress.type) !== null && _a !== void 0 ? _a : 'unknown'));
                    }
                    else {
                        preNormalizedSeq.push('progress:unknown');
                    }
                    break;
            }
        }
        // Log to Statsig
        (0, index_js_1.logEvent)('tengu_tool_use_tool_result_mismatch_error', {
            toolUseId: toolUseId,
            normalizedSequence: normalizedSeq.join(', '),
            preNormalizedSequence: preNormalizedSeq.join(', '),
            normalizedMessageCount: messagesForAPI.length,
            originalMessageCount: messages.length,
            normalizedToolUseIndex: normalizedIndex,
            originalToolUseIndex: originalIndex,
        });
    }
    catch (_) {
        // Ignore errors in debug logging
    }
}
/**
 * Type guard to check if a value is a valid Message response from the API
 */
function isValidAPIMessage(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'content' in value &&
        'model' in value &&
        'usage' in value &&
        Array.isArray(value.content) &&
        typeof value.model === 'string' &&
        typeof value.usage === 'object');
}
/**
 * Given a response that doesn't look quite right, see if it contains any known error types we can extract.
 */
function extractUnknownErrorFormat(value) {
    var _a;
    // Check if value is a valid object first
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    // Amazon Bedrock routing errors
    if ((_a = value.Output) === null || _a === void 0 ? void 0 : _a.__type) {
        return value.Output.__type;
    }
    return undefined;
}
function getAssistantMessageFromError(error, model, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    // Check for SDK timeout errors
    if (error instanceof sdk_1.APIConnectionTimeoutError ||
        (error instanceof sdk_1.APIConnectionError &&
            error.message.toLowerCase().includes('timeout'))) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: exports.API_TIMEOUT_ERROR_MESSAGE,
            error: 'unknown',
        });
    }
    // Check for image size/resize errors (thrown before API call during validation)
    // Use getImageTooLargeErrorMessage() to show "esc esc" hint for CLI users
    // but a generic message for SDK users (non-interactive mode)
    if (error instanceof imageValidation_js_1.ImageSizeError || error instanceof imageResizer_js_1.ImageResizeError) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getImageTooLargeErrorMessage(),
        });
    }
    // Check for emergency capacity off switch for Opus PAYG users
    if (error instanceof Error &&
        error.message.includes(exports.CUSTOM_OFF_SWITCH_MESSAGE)) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: exports.CUSTOM_OFF_SWITCH_MESSAGE,
            error: 'rate_limit',
        });
    }
    if (error instanceof sdk_1.APIError &&
        error.status === 429 &&
        (0, rateLimitMocking_js_1.shouldProcessRateLimits)((0, auth_js_1.isClaudeAISubscriber)())) {
        // Check if this is the new API with multiple rate limit headers
        var rateLimitType = (_b = (_a = error.headers) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, 'anthropic-ratelimit-unified-representative-claim');
        var overageStatus = (_d = (_c = error.headers) === null || _c === void 0 ? void 0 : _c.get) === null || _d === void 0 ? void 0 : _d.call(_c, 'anthropic-ratelimit-unified-overage-status');
        // If we have the new headers, use the new message generation
        if (rateLimitType || overageStatus) {
            // Build limits object from error headers to determine the appropriate message
            var limits = {
                status: 'rejected',
                unifiedRateLimitFallbackAvailable: false,
                isUsingOverage: false,
            };
            // Extract rate limit information from headers
            var resetHeader = (_f = (_e = error.headers) === null || _e === void 0 ? void 0 : _e.get) === null || _f === void 0 ? void 0 : _f.call(_e, 'anthropic-ratelimit-unified-reset');
            if (resetHeader) {
                limits.resetsAt = Number(resetHeader);
            }
            if (rateLimitType) {
                limits.rateLimitType = rateLimitType;
            }
            if (overageStatus) {
                limits.overageStatus = overageStatus;
            }
            var overageResetHeader = (_h = (_g = error.headers) === null || _g === void 0 ? void 0 : _g.get) === null || _h === void 0 ? void 0 : _h.call(_g, 'anthropic-ratelimit-unified-overage-reset');
            if (overageResetHeader) {
                limits.overageResetsAt = Number(overageResetHeader);
            }
            var overageDisabledReason = (_k = (_j = error.headers) === null || _j === void 0 ? void 0 : _j.get) === null || _k === void 0 ? void 0 : _k.call(_j, 'anthropic-ratelimit-unified-overage-disabled-reason');
            if (overageDisabledReason) {
                limits.overageDisabledReason = overageDisabledReason;
            }
            // Use the new message format for all new API rate limits
            var specificErrorMessage = (0, claudeAiLimits_js_1.getRateLimitErrorMessage)(limits, model);
            if (specificErrorMessage) {
                return (0, messages_js_1.createAssistantAPIErrorMessage)({
                    content: specificErrorMessage,
                    error: 'rate_limit',
                });
            }
            // If getRateLimitErrorMessage returned null, it means the fallback mechanism
            // will handle this silently (e.g., Opus -> Sonnet fallback for eligible users).
            // Return NO_RESPONSE_REQUESTED so no error is shown to the user, but the
            // message is still recorded in conversation history for Claude to see.
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                content: messages_js_1.NO_RESPONSE_REQUESTED,
                error: 'rate_limit',
            });
        }
        // No quota headers — this is NOT a quota limit. Surface what the API actually
        // said instead of a generic "Rate limit reached". Entitlement rejections
        // (e.g. 1M context without Extra Usage) and infra capacity 429s land here.
        if (error.message.includes('Extra usage is required for long context')) {
            var hint = (0, state_js_1.getIsNonInteractiveSession)()
                ? 'enable extra usage at claude.ai/settings/usage, or use --model to switch to standard context'
                : 'run /extra-usage to enable, or /model to switch to standard context';
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                content: "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": Extra usage is required for 1M context \u00B7 ").concat(hint),
                error: 'rate_limit',
            });
        }
        // SDK's APIError.makeMessage prepends "429 " and JSON-stringifies the body
        // when there's no top-level .message — extract the inner error.message.
        var stripped = error.message.replace(/^429\s+/, '');
        var innerMessage = (_l = stripped.match(/"message"\s*:\s*"([^"]*)"/)) === null || _l === void 0 ? void 0 : _l[1];
        var detail = innerMessage || stripped;
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": Request rejected (429) \u00B7 ").concat(detail || 'this may be a temporary capacity issue — check status.anthropic.com'),
            error: 'rate_limit',
        });
    }
    // Handle prompt too long errors (Vertex returns 413, direct API returns 400)
    // Use case-insensitive check since Vertex returns "Prompt is too long" (capitalized)
    if (error instanceof Error &&
        error.message.toLowerCase().includes('prompt is too long')) {
        // Content stays generic (UI matches on exact string). The raw error with
        // token counts goes into errorDetails — reactive compact's retry loop
        // parses the gap from there via getPromptTooLongTokenGap.
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: exports.PROMPT_TOO_LONG_ERROR_MESSAGE,
            error: 'invalid_request',
            errorDetails: error.message,
        });
    }
    // Check for PDF page limit errors
    if (error instanceof Error &&
        /maximum of \d+ PDF pages/.test(error.message)) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getPdfTooLargeErrorMessage(),
            error: 'invalid_request',
            errorDetails: error.message,
        });
    }
    // Check for password-protected PDF errors
    if (error instanceof Error &&
        error.message.includes('The PDF specified is password protected')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getPdfPasswordProtectedErrorMessage(),
            error: 'invalid_request',
        });
    }
    // Check for invalid PDF errors (e.g., HTML file renamed to .pdf)
    // Without this handler, invalid PDF document blocks persist in conversation
    // context and cause every subsequent API call to fail with 400.
    if (error instanceof Error &&
        error.message.includes('The PDF specified was not valid')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getPdfInvalidErrorMessage(),
            error: 'invalid_request',
        });
    }
    // Check for image size errors (e.g., "image exceeds 5 MB maximum: 5316852 bytes > 5242880 bytes")
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('image exceeds') &&
        error.message.includes('maximum')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getImageTooLargeErrorMessage(),
            errorDetails: error.message,
        });
    }
    // Check for many-image dimension errors (API enforces stricter 2000px limit for many-image requests)
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('image dimensions exceed') &&
        error.message.includes('many-image')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: (0, state_js_1.getIsNonInteractiveSession)()
                ? 'An image in the conversation exceeds the dimension limit for many-image requests (2000px). Start a new session with fewer images.'
                : 'An image in the conversation exceeds the dimension limit for many-image requests (2000px). Run /compact to remove old images from context, or start a new session.',
            error: 'invalid_request',
            errorDetails: error.message,
        });
    }
    // Server rejected the afk-mode beta header (plan does not include auto
    // mode). AFK_MODE_BETA_HEADER is '' in non-TRANSCRIPT_CLASSIFIER builds,
    // so the truthy guard keeps this inert there.
    if (betas_js_1.AFK_MODE_BETA_HEADER &&
        error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes(betas_js_1.AFK_MODE_BETA_HEADER) &&
        error.message.includes('anthropic-beta')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: 'Auto mode is unavailable for your plan',
            error: 'invalid_request',
        });
    }
    // Check for request too large errors (413 status)
    // This typically happens when a large PDF + conversation context exceeds the 32MB API limit
    if (error instanceof sdk_1.APIError && error.status === 413) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: getRequestTooLargeErrorMessage(),
            error: 'invalid_request',
        });
    }
    // Check for tool_use/tool_result concurrency error
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('`tool_use` ids were found without `tool_result` blocks immediately after')) {
        // Log to Statsig if we have the message context
        if ((options === null || options === void 0 ? void 0 : options.messages) && (options === null || options === void 0 ? void 0 : options.messagesForAPI)) {
            var toolUseIdMatch = error.message.match(/toolu_[a-zA-Z0-9]+/);
            var toolUseId = toolUseIdMatch ? toolUseIdMatch[0] : null;
            if (toolUseId) {
                logToolUseToolResultMismatch(toolUseId, options.messages, options.messagesForAPI);
            }
        }
        if (process.env.USER_TYPE === 'ant') {
            var baseMessage = "API Error: 400 ".concat(error.message, "\n\nRun /share and post the JSON file to ").concat(MACRO.FEEDBACK_CHANNEL, ".");
            var rewindInstruction = (0, state_js_1.getIsNonInteractiveSession)()
                ? ''
                : ' Then, use /rewind to recover the conversation.';
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                content: baseMessage + rewindInstruction,
                error: 'invalid_request',
            });
        }
        else {
            var baseMessage = 'API Error: 400 due to tool use concurrency issues.';
            var rewindInstruction = (0, state_js_1.getIsNonInteractiveSession)()
                ? ''
                : ' Run /rewind to recover the conversation.';
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                content: baseMessage + rewindInstruction,
                error: 'invalid_request',
            });
        }
    }
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('unexpected `tool_use_id` found in `tool_result`')) {
        (0, index_js_1.logEvent)('tengu_unexpected_tool_result', {});
    }
    // Duplicate tool_use IDs (CC-1212). ensureToolResultPairing strips these
    // before send, so hitting this means a new corruption path slipped through.
    // Log for root-causing, and give users a recovery path instead of deadlock.
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('`tool_use` ids must be unique')) {
        (0, index_js_1.logEvent)('tengu_duplicate_tool_use_id', {});
        var rewindInstruction = (0, state_js_1.getIsNonInteractiveSession)()
            ? ''
            : ' Run /rewind to recover the conversation.';
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: "API Error: 400 duplicate tool_use ID in conversation history.".concat(rewindInstruction),
            error: 'invalid_request',
            errorDetails: error.message,
        });
    }
    // Check for invalid model name error for subscription users trying to use Opus
    if ((0, auth_js_1.isClaudeAISubscriber)() &&
        error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.toLowerCase().includes('invalid model name') &&
        ((0, model_js_1.isNonCustomOpusModel)(model) || model === 'opus')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: 'Claude Opus is not available with the Claude Pro plan. If you have updated your subscription plan recently, run /logout and /login for the plan to take effect.',
            error: 'invalid_request',
        });
    }
    // Check for invalid model name error for Ant users. Claude Code may be
    // defaulting to a custom internal-only model for Ants, and there might be
    // Ants using new or unknown org IDs that haven't been gated in.
    if (process.env.USER_TYPE === 'ant' &&
        !process.env.ANTHROPIC_MODEL &&
        error instanceof Error &&
        error.message.toLowerCase().includes('invalid model name')) {
        // Get organization ID from config - only use OAuth account data when actively using OAuth
        var orgId = (_m = (0, auth_js_1.getOauthAccountInfo)()) === null || _m === void 0 ? void 0 : _m.organizationUuid;
        var baseMsg = "[ANT-ONLY] Your org isn't gated into the `".concat(model, "` model. Either run `claude` with `ANTHROPIC_MODEL=").concat((0, model_js_1.getDefaultMainLoopModelSetting)(), "`");
        var msg = orgId
            ? "".concat(baseMsg, " or share your orgId (").concat(orgId, ") in ").concat(MACRO.FEEDBACK_CHANNEL, " for help getting access.")
            : "".concat(baseMsg, " or reach out in ").concat(MACRO.FEEDBACK_CHANNEL, " for help getting access.");
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: msg,
            error: 'invalid_request',
        });
    }
    if (error instanceof Error &&
        error.message.includes('Your credit balance is too low')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: exports.CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE,
            error: 'billing_error',
        });
    }
    // "Organization has been disabled" — commonly a stale ANTHROPIC_API_KEY
    // from a previous employer/project overriding subscription auth. Only handle
    // the env-var case; apiKeyHelper and /login-managed keys mean the active
    // auth's org is genuinely disabled with no dormant fallback to point at.
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.toLowerCase().includes('organization has been disabled')) {
        var source = (0, auth_js_1.getAnthropicApiKeyWithSource)().source;
        // getAnthropicApiKeyWithSource conflates the env var with FD-passed keys
        // under the same source value, and in CCR mode OAuth stays active despite
        // the env var. The three guards ensure we only blame the env var when it's
        // actually set and actually on the wire.
        if (source === 'ANTHROPIC_API_KEY' &&
            process.env.ANTHROPIC_API_KEY &&
            !(0, auth_js_1.isClaudeAISubscriber)()) {
            var hasStoredOAuth = ((_o = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _o === void 0 ? void 0 : _o.accessToken) != null;
            // Not 'authentication_failed' — that triggers VS Code's showLogin(), but
            // login can't fix this (approved env var keeps overriding OAuth). The fix
            // is configuration-based (unset the var), so invalid_request is correct.
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                error: 'invalid_request',
                content: hasStoredOAuth
                    ? exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY_WITH_OAUTH
                    : exports.ORG_DISABLED_ERROR_MESSAGE_ENV_KEY,
            });
        }
    }
    if (error instanceof Error &&
        error.message.toLowerCase().includes('x-api-key')) {
        // In CCR mode, auth is via JWTs - this is likely a transient network issue
        if (isCCRMode()) {
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                error: 'authentication_failed',
                content: exports.CCR_AUTH_ERROR_MESSAGE,
            });
        }
        // Check if the API key is from an external source
        var source = (0, auth_js_1.getAnthropicApiKeyWithSource)().source;
        var isExternalSource = source === 'ANTHROPIC_API_KEY' || source === 'apiKeyHelper';
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            error: 'authentication_failed',
            content: isExternalSource
                ? exports.INVALID_API_KEY_ERROR_MESSAGE_EXTERNAL
                : exports.INVALID_API_KEY_ERROR_MESSAGE,
        });
    }
    // Check for OAuth token revocation error
    if (error instanceof sdk_1.APIError &&
        error.status === 403 &&
        error.message.includes('OAuth token has been revoked')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            error: 'authentication_failed',
            content: getTokenRevokedErrorMessage(),
        });
    }
    // Check for OAuth organization not allowed error
    if (error instanceof sdk_1.APIError &&
        (error.status === 401 || error.status === 403) &&
        error.message.includes('OAuth authentication is currently not allowed for this organization')) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            error: 'authentication_failed',
            content: getOauthOrgNotAllowedErrorMessage(),
        });
    }
    // Generic handler for other 401/403 authentication errors
    if (error instanceof sdk_1.APIError &&
        (error.status === 401 || error.status === 403)) {
        // In CCR mode, auth is via JWTs - this is likely a transient network issue
        if (isCCRMode()) {
            return (0, messages_js_1.createAssistantAPIErrorMessage)({
                error: 'authentication_failed',
                content: exports.CCR_AUTH_ERROR_MESSAGE,
            });
        }
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            error: 'authentication_failed',
            content: (0, state_js_1.getIsNonInteractiveSession)()
                ? "Failed to authenticate. ".concat(exports.API_ERROR_MESSAGE_PREFIX, ": ").concat(error.message)
                : "Please run /login \u00B7 ".concat(exports.API_ERROR_MESSAGE_PREFIX, ": ").concat(error.message),
        });
    }
    // Bedrock errors like "403 You don't have access to the model with the specified model ID."
    // don't contain the actual model ID
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) &&
        error instanceof Error &&
        error.message.toLowerCase().includes('model id')) {
        var switchCmd = (0, state_js_1.getIsNonInteractiveSession)() ? '--model' : '/model';
        var fallbackSuggestion = get3PModelFallbackSuggestion(model);
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: fallbackSuggestion
                ? "".concat(exports.API_ERROR_MESSAGE_PREFIX, " (").concat(model, "): ").concat(error.message, ". Try ").concat(switchCmd, " to switch to ").concat(fallbackSuggestion, ".")
                : "".concat(exports.API_ERROR_MESSAGE_PREFIX, " (").concat(model, "): ").concat(error.message, ". Run ").concat(switchCmd, " to pick a different model."),
            error: 'invalid_request',
        });
    }
    // 404 Not Found — usually means the selected model doesn't exist or isn't
    // available. Guide the user to /model so they can pick a valid one.
    // For 3P users, suggest a specific fallback model they can try.
    if (error instanceof sdk_1.APIError && error.status === 404) {
        var switchCmd = (0, state_js_1.getIsNonInteractiveSession)() ? '--model' : '/model';
        var fallbackSuggestion = get3PModelFallbackSuggestion(model);
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: fallbackSuggestion
                ? "The model ".concat(model, " is not available on your ").concat((0, providers_js_1.getAPIProvider)(), " deployment. Try ").concat(switchCmd, " to switch to ").concat(fallbackSuggestion, ", or ask your admin to enable this model.")
                : "There's an issue with the selected model (".concat(model, "). It may not exist or you may not have access to it. Run ").concat(switchCmd, " to pick a different model."),
            error: 'invalid_request',
        });
    }
    // Connection errors (non-timeout) — use formatAPIError for detailed messages
    if (error instanceof sdk_1.APIConnectionError) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": ").concat((0, errorUtils_js_1.formatAPIError)(error)),
            error: 'unknown',
        });
    }
    if (error instanceof Error) {
        return (0, messages_js_1.createAssistantAPIErrorMessage)({
            content: "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": ").concat(error.message),
            error: 'unknown',
        });
    }
    return (0, messages_js_1.createAssistantAPIErrorMessage)({
        content: exports.API_ERROR_MESSAGE_PREFIX,
        error: 'unknown',
    });
}
/**
 * For 3P users, suggest a fallback model when the selected model is unavailable.
 * Returns a model name suggestion, or undefined if no suggestion is applicable.
 */
function get3PModelFallbackSuggestion(model) {
    if ((0, providers_js_1.getAPIProvider)() === 'firstParty') {
        return undefined;
    }
    // @[MODEL LAUNCH]: Add a fallback suggestion chain for the new model → previous version for 3P
    var m = model.toLowerCase();
    // If the failing model looks like an Opus 4.6 variant, suggest the default Opus (4.1 for 3P)
    if (m.includes('opus-4-6') || m.includes('opus_4_6')) {
        return (0, modelStrings_js_1.getModelStrings)().opus41;
    }
    // If the failing model looks like a Sonnet 4.6 variant, suggest Sonnet 4.5
    if (m.includes('sonnet-4-6') || m.includes('sonnet_4_6')) {
        return (0, modelStrings_js_1.getModelStrings)().sonnet45;
    }
    // If the failing model looks like a Sonnet 4.5 variant, suggest Sonnet 4
    if (m.includes('sonnet-4-5') || m.includes('sonnet_4_5')) {
        return (0, modelStrings_js_1.getModelStrings)().sonnet40;
    }
    return undefined;
}
/**
 * Classifies an API error into a specific error type for analytics tracking.
 * Returns a standardized error type string suitable for Datadog tagging.
 */
function classifyAPIError(error) {
    var _a;
    // Aborted requests
    if (error instanceof Error && error.message === 'Request was aborted.') {
        return 'aborted';
    }
    // Timeout errors
    if (error instanceof sdk_1.APIConnectionTimeoutError ||
        (error instanceof sdk_1.APIConnectionError &&
            error.message.toLowerCase().includes('timeout'))) {
        return 'api_timeout';
    }
    // Check for repeated 529 errors
    if (error instanceof Error &&
        error.message.includes(exports.REPEATED_529_ERROR_MESSAGE)) {
        return 'repeated_529';
    }
    // Check for emergency capacity off switch
    if (error instanceof Error &&
        error.message.includes(exports.CUSTOM_OFF_SWITCH_MESSAGE)) {
        return 'capacity_off_switch';
    }
    // Rate limiting
    if (error instanceof sdk_1.APIError && error.status === 429) {
        return 'rate_limit';
    }
    // Server overload (529)
    if (error instanceof sdk_1.APIError &&
        (error.status === 529 ||
            ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('"type":"overloaded_error"')))) {
        return 'server_overload';
    }
    // Prompt/content size errors
    if (error instanceof Error &&
        error.message
            .toLowerCase()
            .includes(exports.PROMPT_TOO_LONG_ERROR_MESSAGE.toLowerCase())) {
        return 'prompt_too_long';
    }
    // PDF errors
    if (error instanceof Error &&
        /maximum of \d+ PDF pages/.test(error.message)) {
        return 'pdf_too_large';
    }
    if (error instanceof Error &&
        error.message.includes('The PDF specified is password protected')) {
        return 'pdf_password_protected';
    }
    // Image size errors
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('image exceeds') &&
        error.message.includes('maximum')) {
        return 'image_too_large';
    }
    // Many-image dimension errors
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('image dimensions exceed') &&
        error.message.includes('many-image')) {
        return 'image_too_large';
    }
    // Tool use errors (400)
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('`tool_use` ids were found without `tool_result` blocks immediately after')) {
        return 'tool_use_mismatch';
    }
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('unexpected `tool_use_id` found in `tool_result`')) {
        return 'unexpected_tool_result';
    }
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.includes('`tool_use` ids must be unique')) {
        return 'duplicate_tool_use_id';
    }
    // Invalid model errors (400)
    if (error instanceof sdk_1.APIError &&
        error.status === 400 &&
        error.message.toLowerCase().includes('invalid model name')) {
        return 'invalid_model';
    }
    // Credit/billing errors
    if (error instanceof Error &&
        error.message
            .toLowerCase()
            .includes(exports.CREDIT_BALANCE_TOO_LOW_ERROR_MESSAGE.toLowerCase())) {
        return 'credit_balance_low';
    }
    // Authentication errors
    if (error instanceof Error &&
        error.message.toLowerCase().includes('x-api-key')) {
        return 'invalid_api_key';
    }
    if (error instanceof sdk_1.APIError &&
        error.status === 403 &&
        error.message.includes('OAuth token has been revoked')) {
        return 'token_revoked';
    }
    if (error instanceof sdk_1.APIError &&
        (error.status === 401 || error.status === 403) &&
        error.message.includes('OAuth authentication is currently not allowed for this organization')) {
        return 'oauth_org_not_allowed';
    }
    // Generic auth errors
    if (error instanceof sdk_1.APIError &&
        (error.status === 401 || error.status === 403)) {
        return 'auth_error';
    }
    // Bedrock-specific errors
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) &&
        error instanceof Error &&
        error.message.toLowerCase().includes('model id')) {
        return 'bedrock_model_access';
    }
    // Status code based fallbacks
    if (error instanceof sdk_1.APIError) {
        var status_1 = error.status;
        if (status_1 >= 500)
            return 'server_error';
        if (status_1 >= 400)
            return 'client_error';
    }
    // Connection errors - check for SSL/TLS issues first
    if (error instanceof sdk_1.APIConnectionError) {
        var connectionDetails = (0, errorUtils_js_1.extractConnectionErrorDetails)(error);
        if (connectionDetails === null || connectionDetails === void 0 ? void 0 : connectionDetails.isSSLError) {
            return 'ssl_cert_error';
        }
        return 'connection_error';
    }
    return 'unknown';
}
function categorizeRetryableAPIError(error) {
    var _a;
    if (error.status === 529 ||
        ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('"type":"overloaded_error"'))) {
        return 'rate_limit';
    }
    if (error.status === 429) {
        return 'rate_limit';
    }
    if (error.status === 401 || error.status === 403) {
        return 'authentication_failed';
    }
    if (error.status !== undefined && error.status >= 408) {
        return 'server_error';
    }
    return 'unknown';
}
function getErrorMessageIfRefusal(stopReason, model) {
    if (stopReason !== 'refusal') {
        return;
    }
    (0, index_js_1.logEvent)('tengu_refusal_api_response', {});
    var baseMessage = (0, state_js_1.getIsNonInteractiveSession)()
        ? "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": Claude Code is unable to respond to this request, which appears to violate our Usage Policy (https://www.anthropic.com/legal/aup). Try rephrasing the request or attempting a different approach.")
        : "".concat(exports.API_ERROR_MESSAGE_PREFIX, ": Claude Code is unable to respond to this request, which appears to violate our Usage Policy (https://www.anthropic.com/legal/aup). Please double press esc to edit your last message or start a new session for Claude Code to assist with a different task.");
    var modelSuggestion = model !== 'claude-sonnet-4-20250514'
        ? ' If you are seeing this refusal repeatedly, try running /model claude-sonnet-4-20250514 to switch models.'
        : '';
    return (0, messages_js_1.createAssistantAPIErrorMessage)({
        content: baseMessage + modelSuggestion,
        error: 'invalid_request',
    });
}
