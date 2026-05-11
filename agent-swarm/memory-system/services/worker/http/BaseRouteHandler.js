"use strict";
/**
 * BaseRouteHandler
 *
 * Base class for all route handlers providing:
 * - Automatic try-catch wrapping with error logging
 * - Integer parameter validation
 * - Required body parameter validation
 * - Standard HTTP response helpers
 * - Centralized error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRouteHandler = void 0;
var logger_js_1 = require("../../../utils/logger.js");
var BaseRouteHandler = /** @class */ (function () {
    function BaseRouteHandler() {
    }
    /**
     * Wrap handler with automatic try-catch and error logging
     */
    BaseRouteHandler.prototype.wrapHandler = function (handler) {
        var _this = this;
        return function (req, res) {
            try {
                var result = handler(req, res);
                if (result instanceof Promise) {
                    result.catch(function (error) { return _this.handleError(res, error); });
                }
            }
            catch (error) {
                logger_js_1.logger.error('HTTP', 'Route handler error', { path: req.path }, error);
                _this.handleError(res, error);
            }
        };
    };
    /**
     * Parse and validate integer parameter
     * Returns the integer value or sends 400 error response
     */
    BaseRouteHandler.prototype.parseIntParam = function (req, res, paramName) {
        var value = parseInt(req.params[paramName], 10);
        if (isNaN(value)) {
            this.badRequest(res, "Invalid ".concat(paramName));
            return null;
        }
        return value;
    };
    /**
     * Validate required body parameters
     * Returns true if all required params present, sends 400 error otherwise
     */
    BaseRouteHandler.prototype.validateRequired = function (req, res, params) {
        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
            var param = params_1[_i];
            if (req.body[param] === undefined || req.body[param] === null) {
                this.badRequest(res, "Missing ".concat(param));
                return false;
            }
        }
        return true;
    };
    /**
     * Send 400 Bad Request response
     */
    BaseRouteHandler.prototype.badRequest = function (res, message) {
        res.status(400).json({ error: message });
    };
    /**
     * Send 404 Not Found response
     */
    BaseRouteHandler.prototype.notFound = function (res, message) {
        res.status(404).json({ error: message });
    };
    /**
     * Centralized error logging and response
     * Checks headersSent to avoid "Cannot set headers after they are sent" errors
     */
    BaseRouteHandler.prototype.handleError = function (res, error, context) {
        logger_js_1.logger.failure('WORKER', context || 'Request failed', {}, error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    };
    return BaseRouteHandler;
}());
exports.BaseRouteHandler = BaseRouteHandler;
