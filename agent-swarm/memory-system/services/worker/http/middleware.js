"use strict";
/**
 * HTTP Middleware for Worker Service
 *
 * Extracted from WorkerService.ts for better organization.
 * Handles request/response logging, CORS, JSON parsing, and static file serving.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = createMiddleware;
exports.requireLocalhost = requireLocalhost;
exports.summarizeRequestBody = summarizeRequestBody;
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var paths_js_1 = require("../../../shared/paths.js");
var logger_js_1 = require("../../../utils/logger.js");
/**
 * Create all middleware for the worker service
 * @param summarizeRequestBody - Function to summarize request bodies for logging
 * @returns Array of middleware functions
 */
function createMiddleware(summarizeRequestBody) {
    var middlewares = [];
    // JSON parsing with 50mb limit
    middlewares.push(express_1.default.json({ limit: '50mb' }));
    // CORS - restrict to localhost origins only
    middlewares.push((0, cors_1.default)({
        origin: function (origin, callback) {
            // Allow: requests without Origin header (hooks, curl, CLI tools)
            // Allow: localhost and 127.0.0.1 origins
            if (!origin ||
                origin.startsWith('http://localhost:') ||
                origin.startsWith('http://127.0.0.1:')) {
                callback(null, true);
            }
            else {
                callback(new Error('CORS not allowed'));
            }
        },
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: false
    }));
    // HTTP request/response logging
    middlewares.push(function (req, res, next) {
        // Skip logging for static assets, health checks, and polling endpoints
        var staticExtensions = ['.html', '.js', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff', '.woff2', '.ttf', '.eot'];
        var isStaticAsset = staticExtensions.some(function (ext) { return req.path.endsWith(ext); });
        var isPollingEndpoint = req.path === '/api/logs'; // Skip logs endpoint to avoid noise from auto-refresh
        if (req.path.startsWith('/health') || req.path === '/' || isStaticAsset || isPollingEndpoint) {
            return next();
        }
        var start = Date.now();
        var requestId = "".concat(req.method, "-").concat(Date.now());
        // Log incoming request with body summary
        var bodySummary = summarizeRequestBody(req.method, req.path, req.body);
        logger_js_1.logger.debug('HTTP', "\u2192 ".concat(req.method, " ").concat(req.path), { requestId: requestId }, bodySummary);
        // Capture response
        var originalSend = res.send.bind(res);
        res.send = function (body) {
            var duration = Date.now() - start;
            logger_js_1.logger.debug('HTTP', "\u2190 ".concat(res.statusCode, " ").concat(req.path), { requestId: requestId, duration: "".concat(duration, "ms") });
            return originalSend(body);
        };
        next();
    });
    // Serve static files for web UI (viewer-bundle.js, logos, fonts, etc.)
    var packageRoot = (0, paths_js_1.getPackageRoot)();
    var uiDir = path_1.default.join(packageRoot, 'plugin', 'ui');
    middlewares.push(express_1.default.static(uiDir));
    return middlewares;
}
/**
 * Middleware to require localhost-only access
 * Used for admin endpoints that should not be exposed when binding to 0.0.0.0
 */
function requireLocalhost(req, res, next) {
    var clientIp = req.ip || req.connection.remoteAddress || '';
    var isLocalhost = clientIp === '127.0.0.1' ||
        clientIp === '::1' ||
        clientIp === '::ffff:127.0.0.1' ||
        clientIp === 'localhost';
    if (!isLocalhost) {
        logger_js_1.logger.warn('SECURITY', 'Admin endpoint access denied - not localhost', {
            endpoint: req.path,
            clientIp: clientIp,
            method: req.method
        });
        res.status(403).json({
            error: 'Forbidden',
            message: 'Admin endpoints are only accessible from localhost'
        });
        return;
    }
    next();
}
/**
 * Summarize request body for logging
 * Used to avoid logging sensitive data or large payloads
 */
function summarizeRequestBody(method, path, body) {
    if (!body || Object.keys(body).length === 0)
        return '';
    // Session init
    if (path.includes('/init')) {
        return '';
    }
    // Observations
    if (path.includes('/observations')) {
        var toolName = body.tool_name || '?';
        var toolInput = body.tool_input;
        var toolSummary = logger_js_1.logger.formatTool(toolName, toolInput);
        return "tool=".concat(toolSummary);
    }
    // Summarize request
    if (path.includes('/summarize')) {
        return 'requesting summary';
    }
    return '';
}
