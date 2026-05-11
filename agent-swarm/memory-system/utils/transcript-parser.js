"use strict";
/**
 * TranscriptParser - Properly parse Claude Code transcript JSONL files
 * Handles all transcript entry types based on validated model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptParser = void 0;
var fs_1 = require("fs");
var logger_js_1 = require("./logger.js");
var TranscriptParser = /** @class */ (function () {
    function TranscriptParser(transcriptPath) {
        this.entries = [];
        this.parseErrors = [];
        this.parseTranscript(transcriptPath);
    }
    TranscriptParser.prototype.parseTranscript = function (transcriptPath) {
        var _this = this;
        var content = (0, fs_1.readFileSync)(transcriptPath, 'utf-8').trim();
        if (!content)
            return;
        var lines = content.split('\n');
        lines.forEach(function (line, index) {
            try {
                var entry = JSON.parse(line);
                _this.entries.push(entry);
            }
            catch (error) {
                logger_js_1.logger.debug('PARSER', 'Failed to parse transcript line', { lineNumber: index + 1 }, error);
                _this.parseErrors.push({
                    lineNumber: index + 1,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
        // Log summary if there were parse errors
        if (this.parseErrors.length > 0) {
            logger_js_1.logger.error('PARSER', "Failed to parse ".concat(this.parseErrors.length, " lines"), {
                path: transcriptPath,
                totalLines: lines.length,
                errorCount: this.parseErrors.length
            });
        }
    };
    /**
     * Get all entries of a specific type
     */
    TranscriptParser.prototype.getEntriesByType = function (type) {
        return this.entries.filter(function (e) { return e.type === type; });
    };
    /**
     * Get all user entries
     */
    TranscriptParser.prototype.getUserEntries = function () {
        return this.getEntriesByType('user');
    };
    /**
     * Get all assistant entries
     */
    TranscriptParser.prototype.getAssistantEntries = function () {
        return this.getEntriesByType('assistant');
    };
    /**
     * Get all summary entries
     */
    TranscriptParser.prototype.getSummaryEntries = function () {
        return this.getEntriesByType('summary');
    };
    /**
     * Get all system entries
     */
    TranscriptParser.prototype.getSystemEntries = function () {
        return this.getEntriesByType('system');
    };
    /**
     * Get all queue operation entries
     */
    TranscriptParser.prototype.getQueueOperationEntries = function () {
        return this.getEntriesByType('queue-operation');
    };
    /**
     * Get last entry of a specific type
     */
    TranscriptParser.prototype.getLastEntryByType = function (type) {
        var entries = this.getEntriesByType(type);
        return entries.length > 0 ? entries[entries.length - 1] : null;
    };
    /**
     * Extract text content from content items
     */
    TranscriptParser.prototype.extractTextFromContent = function (content) {
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            return content
                .filter(function (item) { return item.type === 'text'; })
                .map(function (item) { return item.text; })
                .join('\n');
        }
        return '';
    };
    /**
     * Get last user message text (finds last entry with actual text content)
     */
    TranscriptParser.prototype.getLastUserMessage = function () {
        var _a;
        var userEntries = this.getUserEntries();
        // Iterate backward to find the last user message with text content
        for (var i = userEntries.length - 1; i >= 0; i--) {
            var entry = userEntries[i];
            if (!((_a = entry === null || entry === void 0 ? void 0 : entry.message) === null || _a === void 0 ? void 0 : _a.content))
                continue;
            var text = this.extractTextFromContent(entry.message.content);
            if (text)
                return text;
        }
        return '';
    };
    /**
     * Get last assistant message text (finds last entry with text content, with optional system-reminder filtering)
     */
    TranscriptParser.prototype.getLastAssistantMessage = function (filterSystemReminders) {
        var _a;
        if (filterSystemReminders === void 0) { filterSystemReminders = true; }
        var assistantEntries = this.getAssistantEntries();
        // Iterate backward to find the last assistant message with text content
        for (var i = assistantEntries.length - 1; i >= 0; i--) {
            var entry = assistantEntries[i];
            if (!((_a = entry === null || entry === void 0 ? void 0 : entry.message) === null || _a === void 0 ? void 0 : _a.content))
                continue;
            var text = this.extractTextFromContent(entry.message.content);
            if (!text)
                continue;
            if (filterSystemReminders) {
                // Filter out system-reminder tags and their content
                text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
                // Clean up excessive whitespace
                text = text.replace(/\n{3,}/g, '\n\n').trim();
            }
            if (text)
                return text;
        }
        return '';
    };
    /**
     * Get all tool use operations from assistant entries
     */
    TranscriptParser.prototype.getToolUseHistory = function () {
        var toolUses = [];
        for (var _i = 0, _a = this.getAssistantEntries(); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (Array.isArray(entry.message.content)) {
                for (var _b = 0, _c = entry.message.content; _b < _c.length; _b++) {
                    var item = _c[_b];
                    if (item.type === 'tool_use') {
                        toolUses.push({
                            name: item.name,
                            timestamp: entry.timestamp,
                            input: item.input,
                        });
                    }
                }
            }
        }
        return toolUses;
    };
    /**
     * Get total token usage across all assistant messages
     */
    TranscriptParser.prototype.getTotalTokenUsage = function () {
        var assistantEntries = this.getAssistantEntries();
        return assistantEntries.reduce(function (acc, entry) {
            var usage = entry.message.usage;
            if (usage) {
                acc.inputTokens += usage.input_tokens || 0;
                acc.outputTokens += usage.output_tokens || 0;
                acc.cacheCreationTokens += usage.cache_creation_input_tokens || 0;
                acc.cacheReadTokens += usage.cache_read_input_tokens || 0;
            }
            return acc;
        }, {
            inputTokens: 0,
            outputTokens: 0,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
        });
    };
    /**
     * Get parse statistics
     */
    TranscriptParser.prototype.getParseStats = function () {
        var entriesByType = {};
        for (var _i = 0, _a = this.entries; _i < _a.length; _i++) {
            var entry = _a[_i];
            entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
        }
        var totalLines = this.entries.length + this.parseErrors.length;
        return {
            totalLines: totalLines,
            parsedEntries: this.entries.length,
            failedLines: this.parseErrors.length,
            entriesByType: entriesByType,
            failureRate: totalLines > 0 ? this.parseErrors.length / totalLines : 0,
        };
    };
    /**
     * Get parse errors
     */
    TranscriptParser.prototype.getParseErrors = function () {
        return this.parseErrors;
    };
    /**
     * Get all entries (raw)
     */
    TranscriptParser.prototype.getAllEntries = function () {
        return this.entries;
    };
    return TranscriptParser;
}());
exports.TranscriptParser = TranscriptParser;
