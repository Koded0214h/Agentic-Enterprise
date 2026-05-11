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
exports.useApiKeyVerification = useApiKeyVerification;
var react_1 = require("react");
var state_js_1 = require("../bootstrap/state.js");
var claude_js_1 = require("../services/api/claude.js");
var auth_js_1 = require("../utils/auth.js");
function useApiKeyVerification() {
    var _this = this;
    var _a = (0, react_1.useState)(function () {
        if (!(0, auth_js_1.isAnthropicAuthEnabled)() || (0, auth_js_1.isClaudeAISubscriber)()) {
            return 'valid';
        }
        // Use skipRetrievingKeyFromApiKeyHelper to avoid executing apiKeyHelper
        // before trust dialog is shown (security: prevents RCE via settings.json)
        var _a = (0, auth_js_1.getAnthropicApiKeyWithSource)({
            skipRetrievingKeyFromApiKeyHelper: true,
        }), key = _a.key, source = _a.source;
        // If apiKeyHelper is configured, we have a key source even though we
        // haven't executed it yet - return 'loading' to indicate we'll verify later
        if (key || source === 'apiKeyHelper') {
            return 'loading';
        }
        return 'missing';
    }), status = _a[0], setStatus = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var verify = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, apiKey, source, newStatus, isValid, newStatus, error_1, newStatus;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, auth_js_1.isAnthropicAuthEnabled)() || (0, auth_js_1.isClaudeAISubscriber)()) {
                        setStatus('valid');
                        return [2 /*return*/];
                    }
                    // Warm the apiKeyHelper cache (no-op if not configured), then read from
                    // all sources. getAnthropicApiKeyWithSource() reads the now-warm cache.
                    return [4 /*yield*/, (0, auth_js_1.getApiKeyFromApiKeyHelper)((0, state_js_1.getIsNonInteractiveSession)())];
                case 1:
                    // Warm the apiKeyHelper cache (no-op if not configured), then read from
                    // all sources. getAnthropicApiKeyWithSource() reads the now-warm cache.
                    _b.sent();
                    _a = (0, auth_js_1.getAnthropicApiKeyWithSource)(), apiKey = _a.key, source = _a.source;
                    if (!apiKey) {
                        if (source === 'apiKeyHelper') {
                            setStatus('error');
                            setError(new Error('API key helper did not return a valid key'));
                            return [2 /*return*/];
                        }
                        newStatus = 'missing';
                        setStatus(newStatus);
                        return [2 /*return*/];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, claude_js_1.verifyApiKey)(apiKey, false)];
                case 3:
                    isValid = _b.sent();
                    newStatus = isValid ? 'valid' : 'invalid';
                    setStatus(newStatus);
                    return [2 /*return*/];
                case 4:
                    error_1 = _b.sent();
                    // This happens when there an error response from the API but it's not an invalid API key error
                    // In this case, we still mark the API key as invalid - but we also log the error so we can
                    // display it to the user to be more helpful
                    setError(error_1);
                    newStatus = 'error';
                    setStatus(newStatus);
                    return [2 /*return*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, []);
    return {
        status: status,
        reverify: verify,
        error: error,
    };
}
