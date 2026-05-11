"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runWithCwdOverride = runWithCwdOverride;
exports.pwd = pwd;
exports.getCwd = getCwd;
var async_hooks_1 = require("async_hooks");
var state_js_1 = require("../bootstrap/state.js");
var cwdOverrideStorage = new async_hooks_1.AsyncLocalStorage();
/**
 * Run a function with an overridden working directory for the current async context.
 * All calls to pwd()/getCwd() within the function (and its async descendants) will
 * return the overridden cwd instead of the global one. This enables concurrent
 * agents to each see their own working directory without affecting each other.
 */
function runWithCwdOverride(cwd, fn) {
    return cwdOverrideStorage.run(cwd, fn);
}
/**
 * Get the current working directory
 */
function pwd() {
    var _a;
    return (_a = cwdOverrideStorage.getStore()) !== null && _a !== void 0 ? _a : (0, state_js_1.getCwdState)();
}
/**
 * Get the current working directory or the original working directory if the current one is not available
 */
function getCwd() {
    try {
        return pwd();
    }
    catch (_a) {
        return (0, state_js_1.getOriginalCwd)();
    }
}
