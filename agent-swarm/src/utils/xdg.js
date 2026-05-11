"use strict";
/**
 * XDG Base Directory utilities for Claude CLI Native Installer
 *
 * Implements the XDG Base Directory specification for organizing
 * native installer components across appropriate system directories.
 *
 * @see https://specifications.freedesktop.org/basedir-spec/latest/
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXDGStateHome = getXDGStateHome;
exports.getXDGCacheHome = getXDGCacheHome;
exports.getXDGDataHome = getXDGDataHome;
exports.getUserBinDir = getUserBinDir;
var os_1 = require("os");
var path_1 = require("path");
function resolveOptions(options) {
    var _a, _b, _c;
    return {
        env: (_a = options === null || options === void 0 ? void 0 : options.env) !== null && _a !== void 0 ? _a : process.env,
        home: (_c = (_b = options === null || options === void 0 ? void 0 : options.homedir) !== null && _b !== void 0 ? _b : process.env.HOME) !== null && _c !== void 0 ? _c : (0, os_1.homedir)(),
    };
}
/**
 * Get XDG state home directory
 * Default: ~/.local/state
 * @param options Optional env and homedir overrides for testing
 */
function getXDGStateHome(options) {
    var _a;
    var _b = resolveOptions(options), env = _b.env, home = _b.home;
    return (_a = env.XDG_STATE_HOME) !== null && _a !== void 0 ? _a : (0, path_1.join)(home, '.local', 'state');
}
/**
 * Get XDG cache home directory
 * Default: ~/.cache
 * @param options Optional env and homedir overrides for testing
 */
function getXDGCacheHome(options) {
    var _a;
    var _b = resolveOptions(options), env = _b.env, home = _b.home;
    return (_a = env.XDG_CACHE_HOME) !== null && _a !== void 0 ? _a : (0, path_1.join)(home, '.cache');
}
/**
 * Get XDG data home directory
 * Default: ~/.local/share
 * @param options Optional env and homedir overrides for testing
 */
function getXDGDataHome(options) {
    var _a;
    var _b = resolveOptions(options), env = _b.env, home = _b.home;
    return (_a = env.XDG_DATA_HOME) !== null && _a !== void 0 ? _a : (0, path_1.join)(home, '.local', 'share');
}
/**
 * Get user bin directory (not technically XDG but follows the convention)
 * Default: ~/.local/bin
 * @param options Optional homedir override for testing
 */
function getUserBinDir(options) {
    var home = resolveOptions(options).home;
    return (0, path_1.join)(home, '.local', 'bin');
}
