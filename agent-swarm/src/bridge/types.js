"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMOTE_CONTROL_DISCONNECTED_MSG = exports.BRIDGE_LOGIN_ERROR = exports.BRIDGE_LOGIN_INSTRUCTION = exports.DEFAULT_SESSION_TIMEOUT_MS = void 0;
/** Default per-session timeout (24 hours). */
exports.DEFAULT_SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000;
/** Reusable login guidance appended to bridge auth errors. */
exports.BRIDGE_LOGIN_INSTRUCTION = 'Remote Control is only available with claude.ai subscriptions. Please use `/login` to sign in with your claude.ai account.';
/** Full error printed when `claude remote-control` is run without auth. */
exports.BRIDGE_LOGIN_ERROR = 'Error: You must be logged in to use Remote Control.\n\n' +
    exports.BRIDGE_LOGIN_INSTRUCTION;
/** Shown when the user disconnects Remote Control (via /remote-control or ultraplan launch). */
exports.REMOTE_CONTROL_DISCONNECTED_MSG = 'Remote Control disconnected.';
