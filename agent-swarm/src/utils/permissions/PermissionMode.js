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
exports.externalPermissionModeSchema = exports.permissionModeSchema = exports.PERMISSION_MODES = exports.EXTERNAL_PERMISSION_MODES = void 0;
exports.isExternalPermissionMode = isExternalPermissionMode;
exports.toExternalPermissionMode = toExternalPermissionMode;
exports.permissionModeFromString = permissionModeFromString;
exports.permissionModeTitle = permissionModeTitle;
exports.isDefaultMode = isDefaultMode;
exports.permissionModeShortTitle = permissionModeShortTitle;
exports.permissionModeSymbol = permissionModeSymbol;
exports.getModeColor = getModeColor;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var figures_js_1 = require("../../constants/figures.js");
// Types extracted to src/types/permissions.ts to break import cycles
var permissions_js_1 = require("../../types/permissions.js");
Object.defineProperty(exports, "EXTERNAL_PERMISSION_MODES", { enumerable: true, get: function () { return permissions_js_1.EXTERNAL_PERMISSION_MODES; } });
Object.defineProperty(exports, "PERMISSION_MODES", { enumerable: true, get: function () { return permissions_js_1.PERMISSION_MODES; } });
var lazySchema_js_1 = require("../lazySchema.js");
exports.permissionModeSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.default.enum(permissions_js_1.PERMISSION_MODES); });
exports.externalPermissionModeSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.enum(permissions_js_1.EXTERNAL_PERMISSION_MODES);
});
var PERMISSION_MODE_CONFIG = __assign({ default: {
        title: 'Default',
        shortTitle: 'Default',
        symbol: '',
        color: 'text',
        external: 'default',
    }, plan: {
        title: 'Plan Mode',
        shortTitle: 'Plan',
        symbol: figures_js_1.PAUSE_ICON,
        color: 'planMode',
        external: 'plan',
    }, acceptEdits: {
        title: 'Accept edits',
        shortTitle: 'Accept',
        symbol: '⏵⏵',
        color: 'autoAccept',
        external: 'acceptEdits',
    }, bypassPermissions: {
        title: 'Bypass Permissions',
        shortTitle: 'Bypass',
        symbol: '⏵⏵',
        color: 'error',
        external: 'bypassPermissions',
    }, dontAsk: {
        title: "Don't Ask",
        shortTitle: 'DontAsk',
        symbol: '⏵⏵',
        color: 'error',
        external: 'dontAsk',
    } }, ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? {
        auto: {
            title: 'Auto mode',
            shortTitle: 'Auto',
            symbol: '⏵⏵',
            color: 'warning',
            external: 'default',
        },
    }
    : {}));
/**
 * Type guard to check if a PermissionMode is an ExternalPermissionMode.
 * auto is ant-only and excluded from external modes.
 */
function isExternalPermissionMode(mode) {
    // External users can't have auto, so always true for them
    if (process.env.USER_TYPE !== 'ant') {
        return true;
    }
    return mode !== 'auto' && mode !== 'bubble';
}
function getModeConfig(mode) {
    var _a;
    return (_a = PERMISSION_MODE_CONFIG[mode]) !== null && _a !== void 0 ? _a : PERMISSION_MODE_CONFIG.default;
}
function toExternalPermissionMode(mode) {
    return getModeConfig(mode).external;
}
function permissionModeFromString(str) {
    return permissions_js_1.PERMISSION_MODES.includes(str)
        ? str
        : 'default';
}
function permissionModeTitle(mode) {
    return getModeConfig(mode).title;
}
function isDefaultMode(mode) {
    return mode === 'default' || mode === undefined;
}
function permissionModeShortTitle(mode) {
    return getModeConfig(mode).shortTitle;
}
function permissionModeSymbol(mode) {
    return getModeConfig(mode).symbol;
}
function getModeColor(mode) {
    return getModeConfig(mode).color;
}
