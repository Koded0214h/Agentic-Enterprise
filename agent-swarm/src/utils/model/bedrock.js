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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInferenceProfileBackingModel = exports.getBedrockInferenceProfiles = void 0;
exports.findFirstMatch = findFirstMatch;
exports.createBedrockRuntimeClient = createBedrockRuntimeClient;
exports.isFoundationModel = isFoundationModel;
exports.extractModelIdFromArn = extractModelIdFromArn;
exports.getBedrockRegionPrefix = getBedrockRegionPrefix;
exports.applyBedrockRegionPrefix = applyBedrockRegionPrefix;
var memoize_js_1 = require("lodash-es/memoize.js");
var auth_js_1 = require("../auth.js");
var envUtils_js_1 = require("../envUtils.js");
var log_js_1 = require("../log.js");
var proxy_js_1 = require("../proxy.js");
exports.getBedrockInferenceProfiles = (0, memoize_js_1.default)(function () {
    return __awaiter(this, void 0, void 0, function () {
        var _a, client, ListInferenceProfilesCommand, allProfiles, nextToken, command, response, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        createBedrockClient(),
                        Promise.resolve().then(function () { return require('@aws-sdk/client-bedrock'); }),
                    ])];
                case 1:
                    _a = _b.sent(), client = _a[0], ListInferenceProfilesCommand = _a[1].ListInferenceProfilesCommand;
                    allProfiles = [];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    _b.label = 3;
                case 3:
                    command = new ListInferenceProfilesCommand(__assign(__assign({}, (nextToken && { nextToken: nextToken })), { typeEquals: 'SYSTEM_DEFINED' }));
                    return [4 /*yield*/, client.send(command)];
                case 4:
                    response = _b.sent();
                    if (response.inferenceProfileSummaries) {
                        allProfiles.push.apply(allProfiles, response.inferenceProfileSummaries);
                    }
                    nextToken = response.nextToken;
                    _b.label = 5;
                case 5:
                    if (nextToken) return [3 /*break*/, 3];
                    _b.label = 6;
                case 6: 
                // Filter for Anthropic models (SYSTEM_DEFINED filtering handled in query)
                return [2 /*return*/, allProfiles
                        .filter(function (profile) { var _a; return (_a = profile.inferenceProfileId) === null || _a === void 0 ? void 0 : _a.includes('anthropic'); })
                        .map(function (profile) { return profile.inferenceProfileId; })
                        .filter(Boolean)];
                case 7:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
});
function findFirstMatch(profiles, substring) {
    var _a;
    return (_a = profiles.find(function (p) { return p.includes(substring); })) !== null && _a !== void 0 ? _a : null;
}
function createBedrockClient() {
    return __awaiter(this, void 0, void 0, function () {
        var BedrockClient, region, skipAuth, clientConfig, _a, _b, _c, cachedCredentials;
        var _d, _e;
        var _this = this;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@aws-sdk/client-bedrock'); })];
                case 1:
                    BedrockClient = (_f.sent()).BedrockClient;
                    region = (0, envUtils_js_1.getAWSRegion)();
                    skipAuth = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH);
                    _a = [__assign({ region: region }, (process.env.ANTHROPIC_BEDROCK_BASE_URL && {
                            endpoint: process.env.ANTHROPIC_BEDROCK_BASE_URL,
                        }))];
                    return [4 /*yield*/, (0, proxy_js_1.getAWSClientProxyConfig)()];
                case 2:
                    _b = [__assign.apply(void 0, _a.concat([(_f.sent())]))];
                    _c = skipAuth;
                    if (!_c) return [3 /*break*/, 5];
                    _d = {};
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@smithy/node-http-handler'); })];
                case 3:
                    _d.requestHandler = new (_f.sent()).NodeHttpHandler();
                    _e = {
                        schemeId: 'smithy.api#noAuth',
                        identityProvider: function () { return function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({})];
                        }); }); }; }
                    };
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@smithy/core'); })];
                case 4:
                    _c = (_d.httpAuthSchemes = [
                        (_e.signer = new (_f.sent()).NoAuthSigner(),
                            _e)
                    ],
                        _d.httpAuthSchemeProvider = function () { return [{ schemeId: 'smithy.api#noAuth' }]; },
                        _d);
                    _f.label = 5;
                case 5:
                    clientConfig = __assign.apply(void 0, _b.concat([(_c)]));
                    if (!(!skipAuth && !process.env.AWS_BEARER_TOKEN_BEDROCK)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, auth_js_1.refreshAndGetAwsCredentials)()];
                case 6:
                    cachedCredentials = _f.sent();
                    if (cachedCredentials) {
                        clientConfig.credentials = {
                            accessKeyId: cachedCredentials.accessKeyId,
                            secretAccessKey: cachedCredentials.secretAccessKey,
                            sessionToken: cachedCredentials.sessionToken,
                        };
                    }
                    _f.label = 7;
                case 7: return [2 /*return*/, new BedrockClient(clientConfig)];
            }
        });
    });
}
function createBedrockRuntimeClient() {
    return __awaiter(this, void 0, void 0, function () {
        var BedrockRuntimeClient, region, skipAuth, clientConfig, _a, _b, _c, cachedCredentials;
        var _d, _e;
        var _this = this;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('@aws-sdk/client-bedrock-runtime'); })];
                case 1:
                    BedrockRuntimeClient = (_f.sent()).BedrockRuntimeClient;
                    region = (0, envUtils_js_1.getAWSRegion)();
                    skipAuth = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_BEDROCK_AUTH);
                    _a = [__assign({ region: region }, (process.env.ANTHROPIC_BEDROCK_BASE_URL && {
                            endpoint: process.env.ANTHROPIC_BEDROCK_BASE_URL,
                        }))];
                    return [4 /*yield*/, (0, proxy_js_1.getAWSClientProxyConfig)()];
                case 2:
                    _b = [__assign.apply(void 0, _a.concat([(_f.sent())]))];
                    _c = skipAuth;
                    if (!_c) return [3 /*break*/, 5];
                    _d = {};
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@smithy/node-http-handler'); })];
                case 3:
                    // BedrockRuntimeClient defaults to HTTP/2 without fallback
                    // proxy servers may not support this, so we explicitly force HTTP/1.1
                    _d.requestHandler = new (_f.sent()).NodeHttpHandler();
                    _e = {
                        schemeId: 'smithy.api#noAuth',
                        identityProvider: function () { return function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({})];
                        }); }); }; }
                    };
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@smithy/core'); })];
                case 4:
                    _c = (_d.httpAuthSchemes = [
                        (_e.signer = new (_f.sent()).NoAuthSigner(),
                            _e)
                    ],
                        _d.httpAuthSchemeProvider = function () { return [{ schemeId: 'smithy.api#noAuth' }]; },
                        _d);
                    _f.label = 5;
                case 5:
                    clientConfig = __assign.apply(void 0, _b.concat([(_c)]));
                    if (!(!skipAuth && !process.env.AWS_BEARER_TOKEN_BEDROCK)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, auth_js_1.refreshAndGetAwsCredentials)()];
                case 6:
                    cachedCredentials = _f.sent();
                    if (cachedCredentials) {
                        clientConfig.credentials = {
                            accessKeyId: cachedCredentials.accessKeyId,
                            secretAccessKey: cachedCredentials.secretAccessKey,
                            sessionToken: cachedCredentials.sessionToken,
                        };
                    }
                    _f.label = 7;
                case 7: return [2 /*return*/, new BedrockRuntimeClient(clientConfig)];
            }
        });
    });
}
exports.getInferenceProfileBackingModel = (0, memoize_js_1.default)(function (profileId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, client, GetInferenceProfileCommand, command, response, primaryModel, lastSlashIndex, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            createBedrockClient(),
                            Promise.resolve().then(function () { return require('@aws-sdk/client-bedrock'); }),
                        ])];
                case 1:
                    _a = _b.sent(), client = _a[0], GetInferenceProfileCommand = _a[1].GetInferenceProfileCommand;
                    command = new GetInferenceProfileCommand({
                        inferenceProfileIdentifier: profileId,
                    });
                    return [4 /*yield*/, client.send(command)];
                case 2:
                    response = _b.sent();
                    if (!response.models || response.models.length === 0) {
                        return [2 /*return*/, null];
                    }
                    primaryModel = response.models[0];
                    if (!(primaryModel === null || primaryModel === void 0 ? void 0 : primaryModel.modelArn)) {
                        return [2 /*return*/, null];
                    }
                    lastSlashIndex = primaryModel.modelArn.lastIndexOf('/');
                    return [2 /*return*/, lastSlashIndex >= 0
                            ? primaryModel.modelArn.substring(lastSlashIndex + 1)
                            : primaryModel.modelArn];
                case 3:
                    error_2 = _b.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
});
/**
 * Check if a model ID is a foundation model (e.g., "anthropic.claude-sonnet-4-5-20250929-v1:0")
 */
function isFoundationModel(modelId) {
    return modelId.startsWith('anthropic.');
}
/**
 * Cross-region inference profile prefixes for Bedrock.
 * These prefixes allow routing requests to models in specific regions.
 */
var BEDROCK_REGION_PREFIXES = ['us', 'eu', 'apac', 'global'];
/**
 * Extract the model/inference profile ID from a Bedrock ARN.
 * If the input is not an ARN, returns it unchanged.
 *
 * ARN format: arn:aws:bedrock:<region>:<account>:inference-profile/<profile-id>
 * Also handles: arn:aws:bedrock:<region>:<account>:application-inference-profile/<profile-id>
 * And foundation model ARNs: arn:aws:bedrock:<region>::foundation-model/<model-id>
 */
function extractModelIdFromArn(modelId) {
    if (!modelId.startsWith('arn:')) {
        return modelId;
    }
    var lastSlashIndex = modelId.lastIndexOf('/');
    if (lastSlashIndex === -1) {
        return modelId;
    }
    return modelId.substring(lastSlashIndex + 1);
}
/**
 * Extract the region prefix from a Bedrock cross-region inference model ID.
 * Handles both plain model IDs and full ARN format.
 * For example:
 * - "eu.anthropic.claude-sonnet-4-5-20250929-v1:0" → "eu"
 * - "us.anthropic.claude-3-7-sonnet-20250219-v1:0" → "us"
 * - "arn:aws:bedrock:ap-northeast-2:123:inference-profile/global.anthropic.claude-opus-4-6-v1" → "global"
 * - "anthropic.claude-3-5-sonnet-20241022-v2:0" → undefined (foundation model)
 * - "claude-sonnet-4-5-20250929" → undefined (first-party format)
 */
function getBedrockRegionPrefix(modelId) {
    // Extract the inference profile ID from ARN format if present
    // ARN format: arn:aws:bedrock:<region>:<account>:inference-profile/<profile-id>
    var effectiveModelId = extractModelIdFromArn(modelId);
    for (var _i = 0, BEDROCK_REGION_PREFIXES_1 = BEDROCK_REGION_PREFIXES; _i < BEDROCK_REGION_PREFIXES_1.length; _i++) {
        var prefix = BEDROCK_REGION_PREFIXES_1[_i];
        if (effectiveModelId.startsWith("".concat(prefix, ".anthropic."))) {
            return prefix;
        }
    }
    return undefined;
}
/**
 * Apply a region prefix to a Bedrock model ID.
 * If the model already has a different region prefix, it will be replaced.
 * If the model is a foundation model (anthropic.*), the prefix will be added.
 * If the model is not a Bedrock model, it will be returned as-is.
 *
 * For example:
 * - applyBedrockRegionPrefix("us.anthropic.claude-sonnet-4-5-v1:0", "eu") → "eu.anthropic.claude-sonnet-4-5-v1:0"
 * - applyBedrockRegionPrefix("anthropic.claude-sonnet-4-5-v1:0", "eu") → "eu.anthropic.claude-sonnet-4-5-v1:0"
 * - applyBedrockRegionPrefix("claude-sonnet-4-5-20250929", "eu") → "claude-sonnet-4-5-20250929" (not a Bedrock model)
 */
function applyBedrockRegionPrefix(modelId, prefix) {
    // Check if it already has a region prefix and replace it
    var existingPrefix = getBedrockRegionPrefix(modelId);
    if (existingPrefix) {
        return modelId.replace("".concat(existingPrefix, "."), "".concat(prefix, "."));
    }
    // Check if it's a foundation model (anthropic.*) and add the prefix
    if (isFoundationModel(modelId)) {
        return "".concat(prefix, ".").concat(modelId);
    }
    // Not a Bedrock model format, return as-is
    return modelId;
}
