"use strict";
/**
 * Viewer Routes
 *
 * Handles health check, viewer UI, and SSE stream endpoints.
 * These are used by the web viewer UI at http://localhost:37777
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
exports.ViewerRoutes = void 0;
var express_1 = require("express");
var path_1 = require("path");
var fs_1 = require("fs");
var paths_js_1 = require("../../../../shared/paths.js");
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
var ViewerRoutes = /** @class */ (function (_super) {
    __extends(ViewerRoutes, _super);
    function ViewerRoutes(sseBroadcaster, dbManager, sessionManager) {
        var _this = _super.call(this) || this;
        _this.sseBroadcaster = sseBroadcaster;
        _this.dbManager = dbManager;
        _this.sessionManager = sessionManager;
        /**
         * Health check endpoint
         */
        _this.handleHealth = _this.wrapHandler(function (req, res) {
            res.json({ status: 'ok', timestamp: Date.now() });
        });
        /**
         * Serve viewer UI
         */
        _this.handleViewerUI = _this.wrapHandler(function (req, res) {
            var packageRoot = (0, paths_js_1.getPackageRoot)();
            // Try cache structure first (ui/viewer.html), then marketplace structure (plugin/ui/viewer.html)
            var viewerPaths = [
                path_1.default.join(packageRoot, 'ui', 'viewer.html'),
                path_1.default.join(packageRoot, 'plugin', 'ui', 'viewer.html')
            ];
            var viewerPath = viewerPaths.find(function (p) { return (0, fs_1.existsSync)(p); });
            if (!viewerPath) {
                throw new Error('Viewer UI not found at any expected location');
            }
            var html = (0, fs_1.readFileSync)(viewerPath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        });
        /**
         * SSE stream endpoint
         */
        _this.handleSSEStream = _this.wrapHandler(function (req, res) {
            // Setup SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            // Add client to broadcaster
            _this.sseBroadcaster.addClient(res);
            // Send initial_load event with projects list
            var allProjects = _this.dbManager.getSessionStore().getAllProjects();
            _this.sseBroadcaster.broadcast({
                type: 'initial_load',
                projects: allProjects,
                timestamp: Date.now()
            });
            // Send initial processing status (based on queue depth + active generators)
            var isProcessing = _this.sessionManager.isAnySessionProcessing();
            var queueDepth = _this.sessionManager.getTotalActiveWork(); // Includes queued + actively processing
            _this.sseBroadcaster.broadcast({
                type: 'processing_status',
                isProcessing: isProcessing,
                queueDepth: queueDepth
            });
        });
        return _this;
    }
    ViewerRoutes.prototype.setupRoutes = function (app) {
        // Serve static UI assets (JS, CSS, fonts, etc.)
        var packageRoot = (0, paths_js_1.getPackageRoot)();
        app.use(express_1.default.static(path_1.default.join(packageRoot, 'ui')));
        app.get('/health', this.handleHealth.bind(this));
        app.get('/', this.handleViewerUI.bind(this));
        app.get('/stream', this.handleSSEStream.bind(this));
    };
    return ViewerRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.ViewerRoutes = ViewerRoutes;
