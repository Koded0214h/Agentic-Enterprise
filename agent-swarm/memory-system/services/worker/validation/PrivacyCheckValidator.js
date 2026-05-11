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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyCheckValidator = void 0;
var logger_js_1 = require("../../../utils/logger.js");
/**
 * Validates user prompt privacy for session operations
 *
 * Centralizes privacy checks to avoid duplicate validation logic across route handlers.
 * If user prompt was entirely private (stripped to empty string), we skip processing.
 */
var PrivacyCheckValidator = /** @class */ (function () {
    function PrivacyCheckValidator() {
    }
    /**
     * Check if user prompt is public (not entirely private)
     *
     * @param store - SessionStore instance
     * @param contentSessionId - Claude session ID
     * @param promptNumber - Prompt number within session
     * @param operationType - Type of operation being validated ('observation' or 'summarize')
     * @returns User prompt text if public, null if private
     */
    PrivacyCheckValidator.checkUserPromptPrivacy = function (store, contentSessionId, promptNumber, operationType, sessionDbId, additionalContext) {
        var userPrompt = store.getUserPrompt(contentSessionId, promptNumber);
        if (!userPrompt || userPrompt.trim() === '') {
            logger_js_1.logger.debug('HOOK', "Skipping ".concat(operationType, " - user prompt was entirely private"), __assign({ sessionId: sessionDbId, promptNumber: promptNumber }, additionalContext));
            return null;
        }
        return userPrompt;
    };
    return PrivacyCheckValidator;
}());
exports.PrivacyCheckValidator = PrivacyCheckValidator;
