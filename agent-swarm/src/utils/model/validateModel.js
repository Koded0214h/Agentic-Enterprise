"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateModel = validateModel;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var aliases_js_1 = require("./aliases.js");
var modelAllowlist_js_1 = require("./modelAllowlist.js");
var providers_js_1 = require("./providers.js");
var sideQuery_js_1 = require("../sideQuery.js");
var sdk_1 = require("@anthropic-ai/sdk");
var modelStrings_js_1 = require("./modelStrings.js");
// Cache valid models to avoid repeated API calls
var validModelCache = new Map();
/**
 * Validates a model by attempting an actual API call.
 */
function validateModel(model) {
    return __awaiter(this, void 0, void 0, function () {
        var normalizedModel, lowerModel, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    normalizedModel = model.trim();
                    // Empty model is invalid
                    if (!normalizedModel) {
                        return [2 /*return*/, { valid: false, error: 'Model name cannot be empty' }];
                    }
                    // Check against availableModels allowlist before any API call
                    if (!(0, modelAllowlist_js_1.isModelAllowed)(normalizedModel)) {
                        return [2 /*return*/, {
                                valid: false,
                                error: "Model '".concat(normalizedModel, "' is not in the list of available models"),
                            }];
                    }
                    lowerModel = normalizedModel.toLowerCase();
                    if (aliases_js_1.MODEL_ALIASES.includes(lowerModel)) {
                        return [2 /*return*/, { valid: true }];
                    }
                    // Check if it matches ANTHROPIC_CUSTOM_MODEL_OPTION (pre-validated by the user)
                    if (normalizedModel === process.env.ANTHROPIC_CUSTOM_MODEL_OPTION) {
                        return [2 /*return*/, { valid: true }];
                    }
                    // Check cache first
                    if (validModelCache.has(normalizedModel)) {
                        return [2 /*return*/, { valid: true }];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            model: normalizedModel,
                            max_tokens: 1,
                            maxRetries: 0,
                            querySource: 'model_validation',
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'text',
                                            text: 'Hi',
                                            cache_control: { type: 'ephemeral' },
                                        },
                                    ],
                                },
                            ],
                        })
                        // If we got here, the model is valid
                    ];
                case 2:
                    _a.sent();
                    // If we got here, the model is valid
                    validModelCache.set(normalizedModel, true);
                    return [2 /*return*/, { valid: true }];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, handleValidationError(error_1, normalizedModel)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleValidationError(error, modelName) {
    // NotFoundError (404) means the model doesn't exist
    if (error instanceof sdk_1.NotFoundError) {
        var fallback = get3PFallbackSuggestion(modelName);
        var suggestion = fallback ? ". Try '".concat(fallback, "' instead") : '';
        return {
            valid: false,
            error: "Model '".concat(modelName, "' not found").concat(suggestion),
        };
    }
    // For other API errors, provide context-specific messages
    if (error instanceof sdk_1.APIError) {
        if (error instanceof sdk_1.AuthenticationError) {
            return {
                valid: false,
                error: 'Authentication failed. Please check your API credentials.',
            };
        }
        if (error instanceof sdk_1.APIConnectionError) {
            return {
                valid: false,
                error: 'Network error. Please check your internet connection.',
            };
        }
        // Check error body for model-specific errors
        var errorBody = error.error;
        if (errorBody &&
            typeof errorBody === 'object' &&
            'type' in errorBody &&
            errorBody.type === 'not_found_error' &&
            'message' in errorBody &&
            typeof errorBody.message === 'string' &&
            errorBody.message.includes('model:')) {
            return { valid: false, error: "Model '".concat(modelName, "' not found") };
        }
        // Generic API error
        return { valid: false, error: "API error: ".concat(error.message) };
    }
    // For unknown errors, be safe and reject
    var errorMessage = error instanceof Error ? error.message : String(error);
    return {
        valid: false,
        error: "Unable to validate model: ".concat(errorMessage),
    };
}
// @[MODEL LAUNCH]: Add a fallback suggestion chain for the new model → previous version
/**
 * Suggest a fallback model for 3P users when the selected model is unavailable.
 */
function get3PFallbackSuggestion(model) {
    if ((0, providers_js_1.getAPIProvider)() === 'firstParty') {
        return undefined;
    }
    var lowerModel = model.toLowerCase();
    if (lowerModel.includes('opus-4-6') || lowerModel.includes('opus_4_6')) {
        return (0, modelStrings_js_1.getModelStrings)().opus41;
    }
    if (lowerModel.includes('sonnet-4-6') || lowerModel.includes('sonnet_4_6')) {
        return (0, modelStrings_js_1.getModelStrings)().sonnet45;
    }
    if (lowerModel.includes('sonnet-4-5') || lowerModel.includes('sonnet_4_5')) {
        return (0, modelStrings_js_1.getModelStrings)().sonnet40;
    }
    return undefined;
}
