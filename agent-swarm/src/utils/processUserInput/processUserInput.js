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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUserInput = processUserInput;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var index_js_1 = require("src/services/analytics/index.js");
var messages_js_1 = require("src/utils/messages.js");
var commands_js_1 = require("../../commands.js");
var textInputTypes_js_1 = require("../../types/textInputTypes.js");
var attachments_js_1 = require("../attachments.js");
var generators_js_1 = require("../generators.js");
var hooks_js_1 = require("../hooks.js");
var imageResizer_js_1 = require("../imageResizer.js");
var imageStore_js_1 = require("../imageStore.js");
var messages_js_2 = require("../messages.js");
var queryProfiler_js_1 = require("../queryProfiler.js");
var slashCommandParsing_js_1 = require("../slashCommandParsing.js");
var keyword_js_1 = require("../ultraplan/keyword.js");
var processTextPrompt_js_1 = require("./processTextPrompt.js");
function processUserInput(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var inputString, appState, result, inputMessage, _c, _d, _e, hookResult, blockingMessage, message, e_1_1;
        var _f, e_1, _g, _h;
        var _j;
        var input = _b.input, preExpansionInput = _b.preExpansionInput, mode = _b.mode, setToolJSX = _b.setToolJSX, context = _b.context, pastedContents = _b.pastedContents, ideSelection = _b.ideSelection, messages = _b.messages, setUserInputOnProcessing = _b.setUserInputOnProcessing, uuid = _b.uuid, isAlreadyProcessing = _b.isAlreadyProcessing, querySource = _b.querySource, canUseTool = _b.canUseTool, skipSlashCommands = _b.skipSlashCommands, bridgeOrigin = _b.bridgeOrigin, isMeta = _b.isMeta, skipAttachments = _b.skipAttachments;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    inputString = typeof input === 'string' ? input : null;
                    // Immediately show the user input prompt while we are still processing the input.
                    // Skip for isMeta (system-generated prompts like scheduled tasks) — those
                    // should run invisibly.
                    if (mode === 'prompt' && inputString !== null && !isMeta) {
                        setUserInputOnProcessing === null || setUserInputOnProcessing === void 0 ? void 0 : setUserInputOnProcessing(inputString);
                    }
                    (0, queryProfiler_js_1.queryCheckpoint)('query_process_user_input_base_start');
                    appState = context.getAppState();
                    return [4 /*yield*/, processUserInputBase(input, mode, setToolJSX, context, pastedContents, ideSelection, messages, uuid, isAlreadyProcessing, querySource, canUseTool, appState.toolPermissionContext.mode, skipSlashCommands, bridgeOrigin, isMeta, skipAttachments, preExpansionInput)];
                case 1:
                    result = _k.sent();
                    (0, queryProfiler_js_1.queryCheckpoint)('query_process_user_input_base_end');
                    if (!result.shouldQuery) {
                        return [2 /*return*/, result];
                    }
                    // Execute UserPromptSubmit hooks and handle blocking
                    (0, queryProfiler_js_1.queryCheckpoint)('query_hooks_start');
                    inputMessage = (0, messages_js_1.getContentText)(input) || '';
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 7, 8, 13]);
                    _c = true, _d = __asyncValues((0, hooks_js_1.executeUserPromptSubmitHooks)(inputMessage, appState.toolPermissionContext.mode, context, context.requestPrompt));
                    _k.label = 3;
                case 3: return [4 /*yield*/, _d.next()];
                case 4:
                    if (!(_e = _k.sent(), _f = _e.done, !_f)) return [3 /*break*/, 6];
                    _h = _e.value;
                    _c = false;
                    hookResult = _h;
                    // We only care about the result
                    if (((_j = hookResult.message) === null || _j === void 0 ? void 0 : _j.type) === 'progress') {
                        return [3 /*break*/, 5];
                    }
                    // Return only a system-level error message, erasing the original user input
                    if (hookResult.blockingError) {
                        blockingMessage = (0, hooks_js_1.getUserPromptSubmitHookBlockingMessage)(hookResult.blockingError);
                        return [2 /*return*/, {
                                messages: [
                                    // TODO: Make this an attachment message
                                    (0, messages_js_2.createSystemMessage)("".concat(blockingMessage, "\n\nOriginal prompt: ").concat(input), 'warning'),
                                ],
                                shouldQuery: false,
                                allowedTools: result.allowedTools,
                            }];
                    }
                    // If preventContinuation is set, stop processing but keep the original
                    // prompt in context.
                    if (hookResult.preventContinuation) {
                        message = hookResult.stopReason
                            ? "Operation stopped by hook: ".concat(hookResult.stopReason)
                            : 'Operation stopped by hook';
                        result.messages.push((0, messages_js_2.createUserMessage)({
                            content: message,
                        }));
                        result.shouldQuery = false;
                        return [2 /*return*/, result];
                    }
                    // Collect additional contexts
                    if (hookResult.additionalContexts &&
                        hookResult.additionalContexts.length > 0) {
                        result.messages.push((0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_additional_context',
                            content: hookResult.additionalContexts.map(applyTruncation),
                            hookName: 'UserPromptSubmit',
                            toolUseID: "hook-".concat((0, crypto_1.randomUUID)()),
                            hookEvent: 'UserPromptSubmit',
                        }));
                    }
                    // TODO: Clean this up
                    if (hookResult.message) {
                        switch (hookResult.message.attachment.type) {
                            case 'hook_success':
                                if (!hookResult.message.attachment.content) {
                                    // Skip if there is no content
                                    break;
                                }
                                result.messages.push(__assign(__assign({}, hookResult.message), { attachment: __assign(__assign({}, hookResult.message.attachment), { content: applyTruncation(hookResult.message.attachment.content) }) }));
                                break;
                            default:
                                result.messages.push(hookResult.message);
                                break;
                        }
                    }
                    _k.label = 5;
                case 5:
                    _c = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _k.trys.push([8, , 11, 12]);
                    if (!(!_c && !_f && (_g = _d.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _g.call(_d)];
                case 9:
                    _k.sent();
                    _k.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    (0, queryProfiler_js_1.queryCheckpoint)('query_hooks_end');
                    // Happy path: onQuery will clear userInputOnProcessing via startTransition
                    // so it resolves in the same frame as deferredMessages (no flicker gap).
                    // Error paths are handled by handlePromptSubmit's finally block.
                    return [2 /*return*/, result];
            }
        });
    });
}
var MAX_HOOK_OUTPUT_LENGTH = 10000;
function applyTruncation(content) {
    if (content.length > MAX_HOOK_OUTPUT_LENGTH) {
        return "".concat(content.substring(0, MAX_HOOK_OUTPUT_LENGTH), "\u2026 [output truncated - exceeded ").concat(MAX_HOOK_OUTPUT_LENGTH, " characters]");
    }
    return content;
}
function processUserInputBase(input, mode, setToolJSX, context, pastedContents, ideSelection, messages, uuid, isAlreadyProcessing, querySource, canUseTool, permissionMode, skipSlashCommands, bridgeOrigin, isMeta, skipAttachments, preExpansionInput) {
    return __awaiter(this, void 0, void 0, function () {
        var inputString, precedingInputBlocks, imageMetadataTexts, normalizedInput, processedBlocks, _i, input_1, block, resized, metadataText, lastBlock, imageContents, imagePasteIds, storedImagePaths, _a, imageProcessingResults, imageContentBlocks, _b, imageProcessingResults_1, _c, resized, originalDimensions, sourcePath, metadataText, metadataText, effectiveSkipSlash, parsed, cmd, msg, rewritten, processSlashCommand, slashResult, shouldExtractAttachments, attachmentMessages, _d, processBashCommand, _e, processSlashCommand, slashResult, trimmedInput, agentMention, agentMentionString, isSubagentOnly, isPrefix;
        var _this = this;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    inputString = null;
                    precedingInputBlocks = [];
                    imageMetadataTexts = [];
                    normalizedInput = input;
                    if (!(typeof input === 'string')) return [3 /*break*/, 1];
                    inputString = input;
                    return [3 /*break*/, 7];
                case 1:
                    if (!(input.length > 0)) return [3 /*break*/, 7];
                    (0, queryProfiler_js_1.queryCheckpoint)('query_image_processing_start');
                    processedBlocks = [];
                    _i = 0, input_1 = input;
                    _f.label = 2;
                case 2:
                    if (!(_i < input_1.length)) return [3 /*break*/, 6];
                    block = input_1[_i];
                    if (!(block.type === 'image')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBlock)(block)
                        // Collect image metadata for isMeta message
                    ];
                case 3:
                    resized = _f.sent();
                    // Collect image metadata for isMeta message
                    if (resized.dimensions) {
                        metadataText = (0, imageResizer_js_1.createImageMetadataText)(resized.dimensions);
                        if (metadataText) {
                            imageMetadataTexts.push(metadataText);
                        }
                    }
                    processedBlocks.push(resized.block);
                    return [3 /*break*/, 5];
                case 4:
                    processedBlocks.push(block);
                    _f.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    normalizedInput = processedBlocks;
                    (0, queryProfiler_js_1.queryCheckpoint)('query_image_processing_end');
                    lastBlock = processedBlocks[processedBlocks.length - 1];
                    if ((lastBlock === null || lastBlock === void 0 ? void 0 : lastBlock.type) === 'text') {
                        inputString = lastBlock.text;
                        precedingInputBlocks = processedBlocks.slice(0, -1);
                    }
                    else {
                        precedingInputBlocks = processedBlocks;
                    }
                    _f.label = 7;
                case 7:
                    if (inputString === null && mode !== 'prompt') {
                        throw new Error("Mode: ".concat(mode, " requires a string input."));
                    }
                    imageContents = pastedContents
                        ? Object.values(pastedContents).filter(textInputTypes_js_1.isValidImagePaste)
                        : [];
                    imagePasteIds = imageContents.map(function (img) { return img.id; });
                    if (!pastedContents) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, imageStore_js_1.storeImages)(pastedContents)];
                case 8:
                    _a = _f.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _a = new Map();
                    _f.label = 10;
                case 10:
                    storedImagePaths = _a;
                    // Resize pasted images to ensure they fit within API limits (parallel processing)
                    (0, queryProfiler_js_1.queryCheckpoint)('query_pasted_image_processing_start');
                    return [4 /*yield*/, Promise.all(imageContents.map(function (pastedImage) { return __awaiter(_this, void 0, void 0, function () {
                            var imageBlock, resized;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        imageBlock = {
                                            type: 'image',
                                            source: {
                                                type: 'base64',
                                                media_type: (pastedImage.mediaType ||
                                                    'image/png'),
                                                data: pastedImage.content,
                                            },
                                        };
                                        (0, index_js_1.logEvent)('tengu_pasted_image_resize_attempt', {
                                            original_size_bytes: pastedImage.content.length,
                                        });
                                        return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBlock)(imageBlock)];
                                    case 1:
                                        resized = _b.sent();
                                        return [2 /*return*/, {
                                                resized: resized,
                                                originalDimensions: pastedImage.dimensions,
                                                sourcePath: (_a = pastedImage.sourcePath) !== null && _a !== void 0 ? _a : storedImagePaths.get(pastedImage.id),
                                            }];
                                }
                            });
                        }); }))
                        // Collect results preserving order
                    ];
                case 11:
                    imageProcessingResults = _f.sent();
                    imageContentBlocks = [];
                    for (_b = 0, imageProcessingResults_1 = imageProcessingResults; _b < imageProcessingResults_1.length; _b++) {
                        _c = imageProcessingResults_1[_b], resized = _c.resized, originalDimensions = _c.originalDimensions, sourcePath = _c.sourcePath;
                        // Collect image metadata for isMeta message (prefer resized dimensions)
                        if (resized.dimensions) {
                            metadataText = (0, imageResizer_js_1.createImageMetadataText)(resized.dimensions, sourcePath);
                            if (metadataText) {
                                imageMetadataTexts.push(metadataText);
                            }
                        }
                        else if (originalDimensions) {
                            metadataText = (0, imageResizer_js_1.createImageMetadataText)(originalDimensions, sourcePath);
                            if (metadataText) {
                                imageMetadataTexts.push(metadataText);
                            }
                        }
                        else if (sourcePath) {
                            // If we have a source path but no dimensions, still add source info
                            imageMetadataTexts.push("[Image source: ".concat(sourcePath, "]"));
                        }
                        imageContentBlocks.push(resized.block);
                    }
                    (0, queryProfiler_js_1.queryCheckpoint)('query_pasted_image_processing_end');
                    effectiveSkipSlash = skipSlashCommands;
                    if (bridgeOrigin && inputString !== null && inputString.startsWith('/')) {
                        parsed = (0, slashCommandParsing_js_1.parseSlashCommand)(inputString);
                        cmd = parsed
                            ? (0, commands_js_1.findCommand)(parsed.commandName, context.options.commands)
                            : undefined;
                        if (cmd) {
                            if ((0, commands_js_1.isBridgeSafeCommand)(cmd)) {
                                effectiveSkipSlash = false;
                            }
                            else {
                                msg = "/".concat((0, commands_js_1.getCommandName)(cmd), " isn't available over Remote Control.");
                                return [2 /*return*/, {
                                        messages: [
                                            (0, messages_js_2.createUserMessage)({ content: inputString, uuid: uuid }),
                                            (0, messages_js_2.createCommandInputMessage)("<local-command-stdout>".concat(msg, "</local-command-stdout>")),
                                        ],
                                        shouldQuery: false,
                                        resultText: msg,
                                    }];
                            }
                        }
                        // Unknown /foo or unparseable — fall through to plain text, same as
                        // pre-#19134. A mobile user typing "/shrug" shouldn't see "Unknown skill".
                    }
                    if (!((0, bun_bundle_1.feature)('ULTRAPLAN') &&
                        mode === 'prompt' &&
                        !context.options.isNonInteractiveSession &&
                        inputString !== null &&
                        !effectiveSkipSlash &&
                        !inputString.startsWith('/') &&
                        !context.getAppState().ultraplanSessionUrl &&
                        !context.getAppState().ultraplanLaunching &&
                        (0, keyword_js_1.hasUltraplanKeyword)(preExpansionInput !== null && preExpansionInput !== void 0 ? preExpansionInput : inputString))) return [3 /*break*/, 14];
                    (0, index_js_1.logEvent)('tengu_ultraplan_keyword', {});
                    rewritten = (0, keyword_js_1.replaceUltraplanKeyword)(inputString).trim();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./processSlashCommand.js'); })];
                case 12:
                    processSlashCommand = (_f.sent()).processSlashCommand;
                    return [4 /*yield*/, processSlashCommand("/ultraplan ".concat(rewritten), precedingInputBlocks, imageContentBlocks, [], context, setToolJSX, uuid, isAlreadyProcessing, canUseTool)];
                case 13:
                    slashResult = _f.sent();
                    return [2 /*return*/, addImageMetadataMessage(slashResult, imageMetadataTexts)];
                case 14:
                    shouldExtractAttachments = !skipAttachments &&
                        inputString !== null &&
                        (mode !== 'prompt' || effectiveSkipSlash || !inputString.startsWith('/'));
                    (0, queryProfiler_js_1.queryCheckpoint)('query_attachment_loading_start');
                    if (!shouldExtractAttachments) return [3 /*break*/, 16];
                    return [4 /*yield*/, (0, generators_js_1.toArray)((0, attachments_js_1.getAttachmentMessages)(inputString, context, ideSelection !== null && ideSelection !== void 0 ? ideSelection : null, [], // queuedCommands - handled by query.ts for mid-turn attachments
                        messages, querySource))];
                case 15:
                    _d = _f.sent();
                    return [3 /*break*/, 17];
                case 16:
                    _d = [];
                    _f.label = 17;
                case 17:
                    attachmentMessages = _d;
                    (0, queryProfiler_js_1.queryCheckpoint)('query_attachment_loading_end');
                    if (!(inputString !== null && mode === 'bash')) return [3 /*break*/, 20];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./processBashCommand.js'); })];
                case 18:
                    processBashCommand = (_f.sent()).processBashCommand;
                    _e = addImageMetadataMessage;
                    return [4 /*yield*/, processBashCommand(inputString, precedingInputBlocks, attachmentMessages, context, setToolJSX)];
                case 19: return [2 /*return*/, _e.apply(void 0, [_f.sent(), imageMetadataTexts])];
                case 20:
                    if (!(inputString !== null &&
                        !effectiveSkipSlash &&
                        inputString.startsWith('/'))) return [3 /*break*/, 23];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./processSlashCommand.js'); })];
                case 21:
                    processSlashCommand = (_f.sent()).processSlashCommand;
                    return [4 /*yield*/, processSlashCommand(inputString, precedingInputBlocks, imageContentBlocks, attachmentMessages, context, setToolJSX, uuid, isAlreadyProcessing, canUseTool)];
                case 22:
                    slashResult = _f.sent();
                    return [2 /*return*/, addImageMetadataMessage(slashResult, imageMetadataTexts)];
                case 23:
                    // Log agent mention queries for analysis
                    if (inputString !== null && mode === 'prompt') {
                        trimmedInput = inputString.trim();
                        agentMention = attachmentMessages.find(function (m) {
                            return m.attachment.type === 'agent_mention';
                        });
                        if (agentMention) {
                            agentMentionString = "@agent-".concat(agentMention.attachment.agentType);
                            isSubagentOnly = trimmedInput === agentMentionString;
                            isPrefix = trimmedInput.startsWith(agentMentionString) && !isSubagentOnly;
                            // Log whenever users use @agent-<name> syntax
                            (0, index_js_1.logEvent)('tengu_subagent_at_mention', {
                                is_subagent_only: isSubagentOnly,
                                is_prefix: isPrefix,
                            });
                        }
                    }
                    // Regular user prompt
                    return [2 /*return*/, addImageMetadataMessage((0, processTextPrompt_js_1.processTextPrompt)(normalizedInput, imageContentBlocks, imagePasteIds, attachmentMessages, uuid, permissionMode, isMeta), imageMetadataTexts)];
            }
        });
    });
}
// Adds image metadata texts as isMeta message to result
function addImageMetadataMessage(result, imageMetadataTexts) {
    if (imageMetadataTexts.length > 0) {
        result.messages.push((0, messages_js_2.createUserMessage)({
            content: imageMetadataTexts.map(function (text) { return ({ type: 'text', text: text }); }),
            isMeta: true,
        }));
    }
    return result;
}
