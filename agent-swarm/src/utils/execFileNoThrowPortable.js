"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.execSyncWithDefaults_DEPRECATED = execSyncWithDefaults_DEPRECATED;
var execa_1 = require("execa");
var cwd_js_1 = require("../utils/cwd.js");
var slowOperations_js_1 = require("./slowOperations.js");
var MS_IN_SECOND = 1000;
var SECONDS_IN_MINUTE = 60;
/**
 * @deprecated Use `execa` directly with `{ shell: true, reject: false }` for non-blocking execution.
 * Sync exec calls block the event loop and cause performance issues.
 */
function execSyncWithDefaults_DEPRECATED(command, optionsOrAbortSignal, timeout) {
    if (timeout === void 0) { timeout = 10 * SECONDS_IN_MINUTE * MS_IN_SECOND; }
    var env_1 = { stack: [], error: void 0, hasError: false };
    try {
        var options = void 0;
        if (optionsOrAbortSignal === undefined) {
            // No second argument - use defaults
            options = {};
        }
        else if (optionsOrAbortSignal instanceof AbortSignal) {
            // Old signature - second argument is AbortSignal
            options = {
                abortSignal: optionsOrAbortSignal,
                timeout: timeout,
            };
        }
        else {
            // New signature - second argument is options object
            options = optionsOrAbortSignal;
        }
        var abortSignal = options.abortSignal, _a = options.timeout, finalTimeout = _a === void 0 ? 10 * SECONDS_IN_MINUTE * MS_IN_SECOND : _a, input = options.input, _b = options.stdio, stdio = _b === void 0 ? ['ignore', 'pipe', 'pipe'] : _b;
        abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.throwIfAborted();
        var _ = __addDisposableResource(env_1, (0, slowOperations_js_1.slowLogging)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["exec: ", ""], ["exec: ", ""])), command.slice(0, 200)), false);
        try {
            var result = (0, execa_1.execaSync)(command, {
                env: process.env,
                maxBuffer: 1000000,
                timeout: finalTimeout,
                cwd: (0, cwd_js_1.getCwd)(),
                stdio: stdio,
                shell: true, // execSync typically runs shell commands
                reject: false, // Don't throw on non-zero exit codes
                input: input,
            });
            if (!result.stdout) {
                return null;
            }
            return result.stdout.trim() || null;
        }
        catch (_c) {
            return null;
        }
    }
    catch (e_1) {
        env_1.error = e_1;
        env_1.hasError = true;
    }
    finally {
        __disposeResources(env_1);
    }
}
var templateObject_1;
