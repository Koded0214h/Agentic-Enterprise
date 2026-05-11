"use strict";
/**
 * Logs Routes
 *
 * Handles fetching and clearing log files from ~/.claude-mem/logs/
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
exports.LogsRoutes = void 0;
exports.readLastLines = readLastLines;
var fs_1 = require("fs");
var path_1 = require("path");
var logger_js_1 = require("../../../../utils/logger.js");
var SettingsDefaultsManager_js_1 = require("../../../../shared/SettingsDefaultsManager.js");
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
/**
 * Read the last N lines from a file without loading the entire file into memory.
 * Reads backwards from the end of the file in chunks until enough lines are found.
 */
function readLastLines(filePath, lineCount) {
    var fd = (0, fs_1.openSync)(filePath, 'r');
    try {
        var stat = (0, fs_1.fstatSync)(fd);
        var fileSize = stat.size;
        if (fileSize === 0) {
            return { lines: '', totalEstimate: 0 };
        }
        // Start with a reasonable chunk size, expand if needed
        var INITIAL_CHUNK_SIZE = 64 * 1024; // 64KB
        var MAX_READ_SIZE = 10 * 1024 * 1024; // 10MB cap to prevent OOM on huge single-line files
        var readSize = Math.min(INITIAL_CHUNK_SIZE, fileSize);
        var content = '';
        var newlineCount = 0;
        while (readSize <= fileSize && readSize <= MAX_READ_SIZE) {
            var startPosition = Math.max(0, fileSize - readSize);
            var bytesToRead = fileSize - startPosition;
            var buffer = Buffer.alloc(bytesToRead);
            (0, fs_1.readSync)(fd, buffer, 0, bytesToRead, startPosition);
            content = buffer.toString('utf-8');
            // Count newlines to see if we have enough
            newlineCount = 0;
            for (var i = 0; i < content.length; i++) {
                if (content[i] === '\n')
                    newlineCount++;
            }
            // We need lineCount newlines to get lineCount full lines (trailing newline)
            if (newlineCount >= lineCount || startPosition === 0) {
                break;
            }
            // Double the read size for next attempt
            readSize = Math.min(readSize * 2, fileSize, MAX_READ_SIZE);
        }
        // Split and take the last N lines
        var allLines = content.split('\n');
        // Remove trailing empty element from final newline
        if (allLines.length > 0 && allLines[allLines.length - 1] === '') {
            allLines.pop();
        }
        var startIndex = Math.max(0, allLines.length - lineCount);
        var resultLines = allLines.slice(startIndex);
        // Estimate total lines: if we read the whole file, we know exactly; otherwise estimate
        var totalEstimate = void 0;
        if (fileSize <= readSize) {
            totalEstimate = allLines.length;
        }
        else {
            // Rough estimate based on average line length in the chunk we read
            var avgLineLength = content.length / Math.max(newlineCount, 1);
            totalEstimate = Math.round(fileSize / avgLineLength);
        }
        return {
            lines: resultLines.join('\n'),
            totalEstimate: totalEstimate,
        };
    }
    finally {
        (0, fs_1.closeSync)(fd);
    }
}
var LogsRoutes = /** @class */ (function (_super) {
    __extends(LogsRoutes, _super);
    function LogsRoutes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * GET /api/logs
         * Returns the current day's log file contents
         * Query params:
         *  - lines: number of lines to return (default: 1000, max: 10000)
         */
        _this.handleGetLogs = _this.wrapHandler(function (req, res) {
            var logFilePath = _this.getLogFilePath();
            if (!(0, fs_1.existsSync)(logFilePath)) {
                res.json({
                    logs: '',
                    path: logFilePath,
                    exists: false
                });
                return;
            }
            var requestedLines = parseInt(req.query.lines || '1000', 10);
            var maxLines = Math.min(requestedLines, 10000); // Cap at 10k lines
            var _a = readLastLines(logFilePath, maxLines), recentLines = _a.lines, totalEstimate = _a.totalEstimate;
            var returnedLines = recentLines === '' ? 0 : recentLines.split('\n').length;
            res.json({
                logs: recentLines,
                path: logFilePath,
                exists: true,
                totalLines: totalEstimate,
                returnedLines: returnedLines,
            });
        });
        /**
         * POST /api/logs/clear
         * Clears the current day's log file
         */
        _this.handleClearLogs = _this.wrapHandler(function (req, res) {
            var logFilePath = _this.getLogFilePath();
            if (!(0, fs_1.existsSync)(logFilePath)) {
                res.json({
                    success: true,
                    message: 'Log file does not exist',
                    path: logFilePath
                });
                return;
            }
            // Clear the log file by writing empty string
            (0, fs_1.writeFileSync)(logFilePath, '', 'utf-8');
            logger_js_1.logger.info('SYSTEM', 'Log file cleared via UI', { path: logFilePath });
            res.json({
                success: true,
                message: 'Log file cleared',
                path: logFilePath
            });
        });
        return _this;
    }
    LogsRoutes.prototype.getLogFilePath = function () {
        var dataDir = SettingsDefaultsManager_js_1.SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR');
        var logsDir = (0, path_1.join)(dataDir, 'logs');
        var date = new Date().toISOString().split('T')[0];
        return (0, path_1.join)(logsDir, "claude-mem-".concat(date, ".log"));
    };
    LogsRoutes.prototype.getLogsDir = function () {
        var dataDir = SettingsDefaultsManager_js_1.SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR');
        return (0, path_1.join)(dataDir, 'logs');
    };
    LogsRoutes.prototype.setupRoutes = function (app) {
        app.get('/api/logs', this.handleGetLogs.bind(this));
        app.post('/api/logs/clear', this.handleClearLogs.bind(this));
    };
    return LogsRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.LogsRoutes = LogsRoutes;
