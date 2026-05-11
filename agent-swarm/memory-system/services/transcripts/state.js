"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWatchState = loadWatchState;
exports.saveWatchState = saveWatchState;
var fs_1 = require("fs");
var path_1 = require("path");
var logger_js_1 = require("../../utils/logger.js");
function loadWatchState(statePath) {
    try {
        if (!(0, fs_1.existsSync)(statePath)) {
            return { offsets: {} };
        }
        var raw = (0, fs_1.readFileSync)(statePath, 'utf-8');
        var parsed = JSON.parse(raw);
        if (!parsed.offsets)
            return { offsets: {} };
        return parsed;
    }
    catch (error) {
        logger_js_1.logger.warn('TRANSCRIPT', 'Failed to load watch state, starting fresh', {
            statePath: statePath,
            error: error instanceof Error ? error.message : String(error)
        });
        return { offsets: {} };
    }
}
function saveWatchState(statePath, state) {
    try {
        var dir = (0, path_1.dirname)(statePath);
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
        (0, fs_1.writeFileSync)(statePath, JSON.stringify(state, null, 2));
    }
    catch (error) {
        logger_js_1.logger.warn('TRANSCRIPT', 'Failed to save watch state', {
            statePath: statePath,
            error: error instanceof Error ? error.message : String(error)
        });
    }
}
