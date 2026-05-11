"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateReplBridgeEnabledToRemoteControlAtStartup = migrateReplBridgeEnabledToRemoteControlAtStartup;
var config_js_1 = require("../utils/config.js");
/**
 * Migrate the `replBridgeEnabled` config key to `remoteControlAtStartup`.
 *
 * The old key was an implementation detail that leaked into user-facing config.
 * This migration copies the value to the new key and removes the old one.
 * Idempotent — only acts when the old key exists and the new one doesn't.
 */
function migrateReplBridgeEnabledToRemoteControlAtStartup() {
    (0, config_js_1.saveGlobalConfig)(function (prev) {
        // The old key is no longer in the GlobalConfig type, so access it via
        // an untyped cast. Only migrate if the old key exists and the new key
        // hasn't been set yet.
        var oldValue = prev['replBridgeEnabled'];
        if (oldValue === undefined)
            return prev;
        if (prev.remoteControlAtStartup !== undefined)
            return prev;
        var next = __assign(__assign({}, prev), { remoteControlAtStartup: Boolean(oldValue) });
        delete next['replBridgeEnabled'];
        return next;
    });
}
