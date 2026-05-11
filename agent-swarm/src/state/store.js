"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStore = createStore;
function createStore(initialState, onChange) {
    var state = initialState;
    var listeners = new Set();
    return {
        getState: function () { return state; },
        setState: function (updater) {
            var prev = state;
            var next = updater(prev);
            if (Object.is(next, prev))
                return;
            state = next;
            onChange === null || onChange === void 0 ? void 0 : onChange({ newState: next, oldState: prev });
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var listener = listeners_1[_i];
                listener();
            }
        },
        subscribe: function (listener) {
            listeners.add(listener);
            return function () { return listeners.delete(listener); };
        },
    };
}
