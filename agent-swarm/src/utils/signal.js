"use strict";
/**
 * Tiny listener-set primitive for pure event signals (no stored state).
 *
 * Collapses the ~8-line `const listeners = new Set(); function subscribe(){…};
 * function notify(){for(const l of listeners) l()}` boilerplate that was
 * duplicated ~15× across the codebase into a one-liner.
 *
 * Distinct from a store (AppState, createStore) — there is no snapshot, no
 * getState. Use this when subscribers only need to know "something happened",
 * optionally with event args, not "what is the current value".
 *
 * Usage:
 *   const changed = createSignal<[SettingSource]>()
 *   export const subscribe = changed.subscribe
 *   // later: changed.emit('userSettings')
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignal = createSignal;
function createSignal() {
    var listeners = new Set();
    return {
        subscribe: function (listener) {
            listeners.add(listener);
            return function () {
                listeners.delete(listener);
            };
        },
        emit: function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            for (var _a = 0, listeners_1 = listeners; _a < listeners_1.length; _a++) {
                var listener = listeners_1[_a];
                listener.apply(void 0, args);
            }
        },
        clear: function () {
            listeners.clear();
        },
    };
}
