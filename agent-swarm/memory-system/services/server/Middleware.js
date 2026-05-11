"use strict";
/**
 * Server Middleware - Re-exports and enhances existing middleware
 *
 * This module provides a unified interface for server middleware.
 * Re-exports from worker/http/middleware.ts to maintain backward compatibility
 * while providing a cleaner import path for server setup.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeRequestBody = exports.requireLocalhost = exports.createMiddleware = void 0;
// Re-export all middleware from the existing location
var middleware_js_1 = require("../worker/http/middleware.js");
Object.defineProperty(exports, "createMiddleware", { enumerable: true, get: function () { return middleware_js_1.createMiddleware; } });
Object.defineProperty(exports, "requireLocalhost", { enumerable: true, get: function () { return middleware_js_1.requireLocalhost; } });
Object.defineProperty(exports, "summarizeRequestBody", { enumerable: true, get: function () { return middleware_js_1.summarizeRequestBody; } });
