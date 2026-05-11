"use strict";
/**
 * ErrorHandler - Centralized error handling for Express
 *
 * Provides error handling middleware and utilities for the server.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
exports.createErrorResponse = createErrorResponse;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
var logger_js_1 = require("../../utils/logger.js");
/**
 * Application error with additional context
 */
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(message, statusCode, code, details) {
        if (statusCode === void 0) { statusCode = 500; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.code = code;
        _this.details = details;
        _this.name = 'AppError';
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
/**
 * Create an error response object
 */
function createErrorResponse(error, message, code, details) {
    var response = { error: error, message: message };
    if (code)
        response.code = code;
    if (details)
        response.details = details;
    return response;
}
/**
 * Global error handler middleware
 * Should be registered last in the middleware chain
 */
var errorHandler = function (err, req, res, _next) {
    // Determine status code
    var statusCode = err instanceof AppError ? err.statusCode : 500;
    // Log error
    logger_js_1.logger.error('HTTP', "Error handling ".concat(req.method, " ").concat(req.path), {
        statusCode: statusCode,
        error: err.message,
        code: err instanceof AppError ? err.code : undefined
    }, err);
    // Build response
    var response = createErrorResponse(err.name || 'Error', err.message, err instanceof AppError ? err.code : undefined, err instanceof AppError ? err.details : undefined);
    // Send response (don't call next, as we've handled the error)
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
/**
 * Not found handler - for routes that don't exist
 */
function notFoundHandler(req, res) {
    res.status(404).json(createErrorResponse('NotFound', "Cannot ".concat(req.method, " ").concat(req.path)));
}
/**
 * Async wrapper to catch errors in async route handlers
 * Automatically passes errors to Express error handler
 */
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
