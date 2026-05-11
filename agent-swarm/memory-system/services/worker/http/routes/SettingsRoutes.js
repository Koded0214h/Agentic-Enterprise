"use strict";
/**
 * Settings Routes
 *
 * Handles settings management, MCP toggle, and branch switching.
 * Settings are stored in ~/.claude-mem/settings.json
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
exports.SettingsRoutes = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var os_1 = require("os");
var paths_js_1 = require("../../../../shared/paths.js");
var logger_js_1 = require("../../../../utils/logger.js");
var BranchManager_js_1 = require("../../BranchManager.js");
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
var SettingsDefaultsManager_js_1 = require("../../../../shared/SettingsDefaultsManager.js");
var worker_utils_js_1 = require("../../../../shared/worker-utils.js");
var SettingsRoutes = /** @class */ (function (_super) {
    __extends(SettingsRoutes, _super);
    function SettingsRoutes(settingsManager) {
        var _this = _super.call(this) || this;
        _this.settingsManager = settingsManager;
        /**
         * Get environment settings (from ~/.claude-mem/settings.json)
         */
        _this.handleGetSettings = _this.wrapHandler(function (req, res) {
            var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
            _this.ensureSettingsFile(settingsPath);
            var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
            res.json(settings);
        });
        /**
         * Update environment settings (in ~/.claude-mem/settings.json) with validation
         */
        _this.handleUpdateSettings = _this.wrapHandler(function (req, res) {
            // Validate all settings
            var validation = _this.validateSettings(req.body);
            if (!validation.valid) {
                res.status(400).json({
                    success: false,
                    error: validation.error
                });
                return;
            }
            // Read existing settings
            var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
            _this.ensureSettingsFile(settingsPath);
            var settings = {};
            if ((0, fs_1.existsSync)(settingsPath)) {
                var settingsData = (0, fs_1.readFileSync)(settingsPath, 'utf-8');
                try {
                    settings = JSON.parse(settingsData);
                }
                catch (parseError) {
                    logger_js_1.logger.error('SETTINGS', 'Failed to parse settings file', { settingsPath: settingsPath }, parseError);
                    res.status(500).json({
                        success: false,
                        error: 'Settings file is corrupted. Delete ~/.claude-mem/settings.json to reset.'
                    });
                    return;
                }
            }
            // Update all settings from request body
            var settingKeys = [
                'CLAUDE_MEM_MODEL',
                'CLAUDE_MEM_CONTEXT_OBSERVATIONS',
                'CLAUDE_MEM_WORKER_PORT',
                'CLAUDE_MEM_WORKER_HOST',
                // AI Provider Configuration
                'CLAUDE_MEM_PROVIDER',
                'CLAUDE_MEM_GEMINI_API_KEY',
                'CLAUDE_MEM_GEMINI_MODEL',
                'CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED',
                // OpenRouter Configuration
                'CLAUDE_MEM_OPENROUTER_API_KEY',
                'CLAUDE_MEM_OPENROUTER_MODEL',
                'CLAUDE_MEM_OPENROUTER_SITE_URL',
                'CLAUDE_MEM_OPENROUTER_APP_NAME',
                'CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES',
                'CLAUDE_MEM_OPENROUTER_MAX_TOKENS',
                // System Configuration
                'CLAUDE_MEM_DATA_DIR',
                'CLAUDE_MEM_LOG_LEVEL',
                'CLAUDE_MEM_PYTHON_VERSION',
                'CLAUDE_CODE_PATH',
                // Token Economics
                'CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS',
                'CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS',
                'CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT',
                'CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT',
                // Observation Filtering
                'CLAUDE_MEM_CONTEXT_OBSERVATION_TYPES',
                'CLAUDE_MEM_CONTEXT_OBSERVATION_CONCEPTS',
                // Display Configuration
                'CLAUDE_MEM_CONTEXT_FULL_COUNT',
                'CLAUDE_MEM_CONTEXT_FULL_FIELD',
                'CLAUDE_MEM_CONTEXT_SESSION_COUNT',
                // Feature Toggles
                'CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY',
                'CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE',
                'CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED',
            ];
            for (var _i = 0, settingKeys_1 = settingKeys; _i < settingKeys_1.length; _i++) {
                var key = settingKeys_1[_i];
                if (req.body[key] !== undefined) {
                    settings[key] = req.body[key];
                }
            }
            // Write back
            (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
            // Clear port cache to force re-reading from updated settings
            (0, worker_utils_js_1.clearPortCache)();
            logger_js_1.logger.info('WORKER', 'Settings updated');
            res.json({ success: true, message: 'Settings updated successfully' });
        });
        /**
         * GET /api/mcp/status - Check if MCP search server is enabled
         */
        _this.handleGetMcpStatus = _this.wrapHandler(function (req, res) {
            var enabled = _this.isMcpEnabled();
            res.json({ enabled: enabled });
        });
        /**
         * POST /api/mcp/toggle - Toggle MCP search server on/off
         * Body: { enabled: boolean }
         */
        _this.handleToggleMcp = _this.wrapHandler(function (req, res) {
            var enabled = req.body.enabled;
            if (typeof enabled !== 'boolean') {
                _this.badRequest(res, 'enabled must be a boolean');
                return;
            }
            _this.toggleMcp(enabled);
            res.json({ success: true, enabled: _this.isMcpEnabled() });
        });
        /**
         * GET /api/branch/status - Get current branch information
         */
        _this.handleGetBranchStatus = _this.wrapHandler(function (req, res) {
            var info = (0, BranchManager_js_1.getBranchInfo)();
            res.json(info);
        });
        /**
         * POST /api/branch/switch - Switch to a different branch
         * Body: { branch: "main" | "beta/7.0" }
         */
        _this.handleSwitchBranch = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var branch, allowedBranches, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        branch = req.body.branch;
                        if (!branch) {
                            res.status(400).json({ success: false, error: 'Missing branch parameter' });
                            return [2 /*return*/];
                        }
                        allowedBranches = ['main', 'beta/7.0', 'feature/bun-executable'];
                        if (!allowedBranches.includes(branch)) {
                            res.status(400).json({
                                success: false,
                                error: "Invalid branch. Allowed: ".concat(allowedBranches.join(', '))
                            });
                            return [2 /*return*/];
                        }
                        logger_js_1.logger.info('WORKER', 'Branch switch requested', { branch: branch });
                        return [4 /*yield*/, (0, BranchManager_js_1.switchBranch)(branch)];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            // Schedule worker restart after response is sent
                            setTimeout(function () {
                                logger_js_1.logger.info('WORKER', 'Restarting worker after branch switch');
                                process.exit(0); // PM2 will restart the worker
                            }, 1000);
                        }
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * POST /api/branch/update - Pull latest updates for current branch
         */
        _this.handleUpdateBranch = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_js_1.logger.info('WORKER', 'Branch update requested');
                        return [4 /*yield*/, (0, BranchManager_js_1.pullUpdates)()];
                    case 1:
                        result = _a.sent();
                        if (result.success) {
                            // Schedule worker restart after response is sent
                            setTimeout(function () {
                                logger_js_1.logger.info('WORKER', 'Restarting worker after branch update');
                                process.exit(0); // PM2 will restart the worker
                            }, 1000);
                        }
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        return _this;
    }
    SettingsRoutes.prototype.setupRoutes = function (app) {
        // Settings endpoints
        app.get('/api/settings', this.handleGetSettings.bind(this));
        app.post('/api/settings', this.handleUpdateSettings.bind(this));
        // MCP toggle endpoints
        app.get('/api/mcp/status', this.handleGetMcpStatus.bind(this));
        app.post('/api/mcp/toggle', this.handleToggleMcp.bind(this));
        // Branch switching endpoints
        app.get('/api/branch/status', this.handleGetBranchStatus.bind(this));
        app.post('/api/branch/switch', this.handleSwitchBranch.bind(this));
        app.post('/api/branch/update', this.handleUpdateBranch.bind(this));
    };
    /**
     * Validate all settings from request body (single source of truth)
     */
    SettingsRoutes.prototype.validateSettings = function (settings) {
        // Validate CLAUDE_MEM_PROVIDER
        if (settings.CLAUDE_MEM_PROVIDER) {
            var validProviders = ['claude', 'gemini', 'openrouter'];
            if (!validProviders.includes(settings.CLAUDE_MEM_PROVIDER)) {
                return { valid: false, error: 'CLAUDE_MEM_PROVIDER must be "claude", "gemini", or "openrouter"' };
            }
        }
        // Validate CLAUDE_MEM_GEMINI_MODEL
        if (settings.CLAUDE_MEM_GEMINI_MODEL) {
            var validGeminiModels = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-3-flash-preview'];
            if (!validGeminiModels.includes(settings.CLAUDE_MEM_GEMINI_MODEL)) {
                return { valid: false, error: 'CLAUDE_MEM_GEMINI_MODEL must be one of: gemini-2.5-flash-lite, gemini-2.5-flash, gemini-3-flash-preview' };
            }
        }
        // Validate CLAUDE_MEM_CONTEXT_OBSERVATIONS
        if (settings.CLAUDE_MEM_CONTEXT_OBSERVATIONS) {
            var obsCount = parseInt(settings.CLAUDE_MEM_CONTEXT_OBSERVATIONS, 10);
            if (isNaN(obsCount) || obsCount < 1 || obsCount > 200) {
                return { valid: false, error: 'CLAUDE_MEM_CONTEXT_OBSERVATIONS must be between 1 and 200' };
            }
        }
        // Validate CLAUDE_MEM_WORKER_PORT
        if (settings.CLAUDE_MEM_WORKER_PORT) {
            var port = parseInt(settings.CLAUDE_MEM_WORKER_PORT, 10);
            if (isNaN(port) || port < 1024 || port > 65535) {
                return { valid: false, error: 'CLAUDE_MEM_WORKER_PORT must be between 1024 and 65535' };
            }
        }
        // Validate CLAUDE_MEM_WORKER_HOST (IP address or 0.0.0.0)
        if (settings.CLAUDE_MEM_WORKER_HOST) {
            var host = settings.CLAUDE_MEM_WORKER_HOST;
            // Allow localhost variants and valid IP patterns
            var validHostPattern = /^(127\.0\.0\.1|0\.0\.0\.0|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
            if (!validHostPattern.test(host)) {
                return { valid: false, error: 'CLAUDE_MEM_WORKER_HOST must be a valid IP address (e.g., 127.0.0.1, 0.0.0.0)' };
            }
        }
        // Validate CLAUDE_MEM_LOG_LEVEL
        if (settings.CLAUDE_MEM_LOG_LEVEL) {
            var validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'SILENT'];
            if (!validLevels.includes(settings.CLAUDE_MEM_LOG_LEVEL.toUpperCase())) {
                return { valid: false, error: 'CLAUDE_MEM_LOG_LEVEL must be one of: DEBUG, INFO, WARN, ERROR, SILENT' };
            }
        }
        // Validate CLAUDE_MEM_PYTHON_VERSION (must be valid Python version format)
        if (settings.CLAUDE_MEM_PYTHON_VERSION) {
            var pythonVersionRegex = /^3\.\d{1,2}$/;
            if (!pythonVersionRegex.test(settings.CLAUDE_MEM_PYTHON_VERSION)) {
                return { valid: false, error: 'CLAUDE_MEM_PYTHON_VERSION must be in format "3.X" or "3.XX" (e.g., "3.13")' };
            }
        }
        // Validate boolean string values
        var booleanSettings = [
            'CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS',
            'CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS',
            'CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT',
            'CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT',
            'CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY',
            'CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE',
        ];
        for (var _i = 0, booleanSettings_1 = booleanSettings; _i < booleanSettings_1.length; _i++) {
            var key = booleanSettings_1[_i];
            if (settings[key] && !['true', 'false'].includes(settings[key])) {
                return { valid: false, error: "".concat(key, " must be \"true\" or \"false\"") };
            }
        }
        // Validate FULL_COUNT (0-20)
        if (settings.CLAUDE_MEM_CONTEXT_FULL_COUNT) {
            var count = parseInt(settings.CLAUDE_MEM_CONTEXT_FULL_COUNT, 10);
            if (isNaN(count) || count < 0 || count > 20) {
                return { valid: false, error: 'CLAUDE_MEM_CONTEXT_FULL_COUNT must be between 0 and 20' };
            }
        }
        // Validate SESSION_COUNT (1-50)
        if (settings.CLAUDE_MEM_CONTEXT_SESSION_COUNT) {
            var count = parseInt(settings.CLAUDE_MEM_CONTEXT_SESSION_COUNT, 10);
            if (isNaN(count) || count < 1 || count > 50) {
                return { valid: false, error: 'CLAUDE_MEM_CONTEXT_SESSION_COUNT must be between 1 and 50' };
            }
        }
        // Validate FULL_FIELD
        if (settings.CLAUDE_MEM_CONTEXT_FULL_FIELD) {
            if (!['narrative', 'facts'].includes(settings.CLAUDE_MEM_CONTEXT_FULL_FIELD)) {
                return { valid: false, error: 'CLAUDE_MEM_CONTEXT_FULL_FIELD must be "narrative" or "facts"' };
            }
        }
        // Validate CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES
        if (settings.CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES) {
            var count = parseInt(settings.CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES, 10);
            if (isNaN(count) || count < 1 || count > 100) {
                return { valid: false, error: 'CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES must be between 1 and 100' };
            }
        }
        // Validate CLAUDE_MEM_OPENROUTER_MAX_TOKENS
        if (settings.CLAUDE_MEM_OPENROUTER_MAX_TOKENS) {
            var tokens = parseInt(settings.CLAUDE_MEM_OPENROUTER_MAX_TOKENS, 10);
            if (isNaN(tokens) || tokens < 1000 || tokens > 1000000) {
                return { valid: false, error: 'CLAUDE_MEM_OPENROUTER_MAX_TOKENS must be between 1000 and 1000000' };
            }
        }
        // Validate CLAUDE_MEM_OPENROUTER_SITE_URL if provided
        if (settings.CLAUDE_MEM_OPENROUTER_SITE_URL) {
            try {
                new URL(settings.CLAUDE_MEM_OPENROUTER_SITE_URL);
            }
            catch (error) {
                // Invalid URL format
                logger_js_1.logger.debug('SETTINGS', 'Invalid URL format', { url: settings.CLAUDE_MEM_OPENROUTER_SITE_URL, error: error instanceof Error ? error.message : String(error) });
                return { valid: false, error: 'CLAUDE_MEM_OPENROUTER_SITE_URL must be a valid URL' };
            }
        }
        // Skip observation types validation - any type string is valid since modes define their own types
        // The database accepts any TEXT value, and mode-specific validation happens at parse time
        // Skip observation concepts validation - any concept string is valid since modes define their own concepts
        // The database accepts any TEXT value, and mode-specific validation happens at parse time
        return { valid: true };
    };
    /**
     * Check if MCP search server is enabled
     */
    SettingsRoutes.prototype.isMcpEnabled = function () {
        var packageRoot = (0, paths_js_1.getPackageRoot)();
        var mcpPath = path_1.default.join(packageRoot, 'plugin', '.mcp.json');
        return (0, fs_1.existsSync)(mcpPath);
    };
    /**
     * Toggle MCP search server (rename .mcp.json <-> .mcp.json.disabled)
     */
    SettingsRoutes.prototype.toggleMcp = function (enabled) {
        var packageRoot = (0, paths_js_1.getPackageRoot)();
        var mcpPath = path_1.default.join(packageRoot, 'plugin', '.mcp.json');
        var mcpDisabledPath = path_1.default.join(packageRoot, 'plugin', '.mcp.json.disabled');
        if (enabled && (0, fs_1.existsSync)(mcpDisabledPath)) {
            // Enable: rename .mcp.json.disabled -> .mcp.json
            (0, fs_1.renameSync)(mcpDisabledPath, mcpPath);
            logger_js_1.logger.info('WORKER', 'MCP search server enabled');
        }
        else if (!enabled && (0, fs_1.existsSync)(mcpPath)) {
            // Disable: rename .mcp.json -> .mcp.json.disabled
            (0, fs_1.renameSync)(mcpPath, mcpDisabledPath);
            logger_js_1.logger.info('WORKER', 'MCP search server disabled');
        }
        else {
            logger_js_1.logger.debug('WORKER', 'MCP toggle no-op (already in desired state)', { enabled: enabled });
        }
    };
    /**
     * Ensure settings file exists, creating with defaults if missing
     */
    SettingsRoutes.prototype.ensureSettingsFile = function (settingsPath) {
        if (!(0, fs_1.existsSync)(settingsPath)) {
            var defaults = SettingsDefaultsManager_js_1.SettingsDefaultsManager.getAllDefaults();
            // Ensure directory exists
            var dir = path_1.default.dirname(settingsPath);
            if (!(0, fs_1.existsSync)(dir)) {
                (0, fs_1.mkdirSync)(dir, { recursive: true });
            }
            (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(defaults, null, 2), 'utf-8');
            logger_js_1.logger.info('SETTINGS', 'Created settings file with defaults', { settingsPath: settingsPath });
        }
    };
    return SettingsRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.SettingsRoutes = SettingsRoutes;
