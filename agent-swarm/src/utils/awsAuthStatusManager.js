"use strict";
/**
 * Singleton manager for cloud-provider authentication status (AWS Bedrock,
 * GCP Vertex). Communicates auth refresh state between auth utilities and
 * React components / SDK output. The SDK 'auth_status' message shape is
 * provider-agnostic, so a single manager serves all providers.
 *
 * Legacy name: originally AWS-only; now used by all cloud auth refresh flows.
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsAuthStatusManager = void 0;
var signal_js_1 = require("./signal.js");
var AwsAuthStatusManager = /** @class */ (function () {
    function AwsAuthStatusManager() {
        this.status = {
            isAuthenticating: false,
            output: [],
        };
        this.changed = (0, signal_js_1.createSignal)();
        this.subscribe = this.changed.subscribe;
    }
    AwsAuthStatusManager.getInstance = function () {
        if (!AwsAuthStatusManager.instance) {
            AwsAuthStatusManager.instance = new AwsAuthStatusManager();
        }
        return AwsAuthStatusManager.instance;
    };
    AwsAuthStatusManager.prototype.getStatus = function () {
        return __assign(__assign({}, this.status), { output: __spreadArray([], this.status.output, true) });
    };
    AwsAuthStatusManager.prototype.startAuthentication = function () {
        this.status = {
            isAuthenticating: true,
            output: [],
        };
        this.changed.emit(this.getStatus());
    };
    AwsAuthStatusManager.prototype.addOutput = function (line) {
        this.status.output.push(line);
        this.changed.emit(this.getStatus());
    };
    AwsAuthStatusManager.prototype.setError = function (error) {
        this.status.error = error;
        this.changed.emit(this.getStatus());
    };
    AwsAuthStatusManager.prototype.endAuthentication = function (success) {
        if (success) {
            // Clear the status completely on success
            this.status = {
                isAuthenticating: false,
                output: [],
            };
        }
        else {
            // Keep the output visible on failure
            this.status.isAuthenticating = false;
        }
        this.changed.emit(this.getStatus());
    };
    // Clean up for testing
    AwsAuthStatusManager.reset = function () {
        if (AwsAuthStatusManager.instance) {
            AwsAuthStatusManager.instance.changed.clear();
            AwsAuthStatusManager.instance = null;
        }
    };
    AwsAuthStatusManager.instance = null;
    return AwsAuthStatusManager;
}());
exports.AwsAuthStatusManager = AwsAuthStatusManager;
