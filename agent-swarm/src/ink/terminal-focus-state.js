"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTerminalFocused = setTerminalFocused;
exports.getTerminalFocused = getTerminalFocused;
exports.getTerminalFocusState = getTerminalFocusState;
exports.subscribeTerminalFocus = subscribeTerminalFocus;
exports.resetTerminalFocusState = resetTerminalFocusState;
var focusState = 'unknown';
var resolvers = new Set();
var subscribers = new Set();
function setTerminalFocused(v) {
    focusState = v ? 'focused' : 'blurred';
    // Notify useSyncExternalStore subscribers
    for (var _i = 0, subscribers_1 = subscribers; _i < subscribers_1.length; _i++) {
        var cb = subscribers_1[_i];
        cb();
    }
    if (!v) {
        for (var _a = 0, resolvers_1 = resolvers; _a < resolvers_1.length; _a++) {
            var resolve = resolvers_1[_a];
            resolve();
        }
        resolvers.clear();
    }
}
function getTerminalFocused() {
    return focusState !== 'blurred';
}
function getTerminalFocusState() {
    return focusState;
}
// For useSyncExternalStore
function subscribeTerminalFocus(cb) {
    subscribers.add(cb);
    return function () {
        subscribers.delete(cb);
    };
}
function resetTerminalFocusState() {
    focusState = 'unknown';
    for (var _i = 0, subscribers_2 = subscribers; _i < subscribers_2.length; _i++) {
        var cb = subscribers_2[_i];
        cb();
    }
}
