"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCommandLifecycleListener = setCommandLifecycleListener;
exports.notifyCommandLifecycle = notifyCommandLifecycle;
var listener = null;
function setCommandLifecycleListener(cb) {
    listener = cb;
}
function notifyCommandLifecycle(uuid, state) {
    listener === null || listener === void 0 ? void 0 : listener(uuid, state);
}
