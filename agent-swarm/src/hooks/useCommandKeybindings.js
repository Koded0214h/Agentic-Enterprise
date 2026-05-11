"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandKeybindingHandlers = CommandKeybindingHandlers;
var compiler_runtime_1 = require("react/compiler-runtime");
var overlayContext_js_1 = require("../context/overlayContext.js");
var KeybindingContext_js_1 = require("../keybindings/KeybindingContext.js");
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
var NOOP_HELPERS = {
    setCursorOffset: function () { },
    clearBuffer: function () { },
    resetHistory: function () { }
};
/**
 * Registers keybinding handlers for all "command:*" actions found in the
 * user's keybinding configuration. When triggered, each handler submits
 * the corresponding slash command (e.g., "command:commit" submits "/commit").
 */
function CommandKeybindingHandlers(t0) {
    var _a;
    var $ = (0, compiler_runtime_1.c)(8);
    var onSubmit = t0.onSubmit, t1 = t0.isActive;
    var isActive = t1 === undefined ? true : t1;
    var keybindingContext = (0, KeybindingContext_js_1.useOptionalKeybindingContext)();
    var isModalOverlayActive = (0, overlayContext_js_1.useIsModalOverlayActive)();
    var t2;
    bb0: {
        if (!keybindingContext) {
            var t3_1;
            if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
                t3_1 = new Set();
                $[0] = t3_1;
            }
            else {
                t3_1 = $[0];
            }
            t2 = t3_1;
            break bb0;
        }
        var actions = void 0;
        if ($[1] !== keybindingContext.bindings) {
            actions = new Set();
            for (var _i = 0, _b = keybindingContext.bindings; _i < _b.length; _i++) {
                var binding = _b[_i];
                if ((_a = binding.action) === null || _a === void 0 ? void 0 : _a.startsWith("command:")) {
                    actions.add(binding.action);
                }
            }
            $[1] = keybindingContext.bindings;
            $[2] = actions;
        }
        else {
            actions = $[2];
        }
        t2 = actions;
    }
    var commandActions = t2;
    var map;
    if ($[3] !== commandActions || $[4] !== onSubmit) {
        map = {};
        var _loop_1 = function (action) {
            var commandName = action.slice(8);
            map[action] = function () {
                onSubmit("/".concat(commandName), NOOP_HELPERS, undefined, {
                    fromKeybinding: true
                });
            };
        };
        for (var _d = 0, commandActions_1 = commandActions; _d < commandActions_1.length; _d++) {
            var action = commandActions_1[_d];
            _loop_1(action);
        }
        $[3] = commandActions;
        $[4] = onSubmit;
        $[5] = map;
    }
    else {
        map = $[5];
    }
    var handlers = map;
    var t3 = isActive && !isModalOverlayActive;
    var t4;
    if ($[6] !== t3) {
        t4 = {
            context: "Chat",
            isActive: t3
        };
        $[6] = t3;
        $[7] = t4;
    }
    else {
        t4 = $[7];
    }
    (0, useKeybinding_js_1.useKeybindings)(handlers, t4);
    return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VNZW1vIiwidXNlSXNNb2RhbE92ZXJsYXlBY3RpdmUiLCJ1c2VPcHRpb25hbEtleWJpbmRpbmdDb250ZXh0IiwidXNlS2V5YmluZGluZ3MiLCJQcm9tcHRJbnB1dEhlbHBlcnMiLCJQcm9wcyIsIm9uU3VibWl0IiwiaW5wdXQiLCJoZWxwZXJzIiwicmVzdCIsInNwZWN1bGF0aW9uQWNjZXB0Iiwib3B0aW9ucyIsImZyb21LZXliaW5kaW5nIiwiaXNBY3RpdmUiLCJOT09QX0hFTFBFUlMiLCJzZXRDdXJzb3JPZmZzZXQiLCJjbGVhckJ1ZmZlciIsInJlc2V0SGlzdG9yeSIsIkNvbW1hbmRLZXliaW5kaW5nSGFuZGxlcnMiLCJ0MCIsIiQiLCJfYyIsInQxIiwidW5kZWZpbmVkIiwia2V5YmluZGluZ0NvbnRleHQiLCJpc01vZGFsT3ZlcmxheUFjdGl2ZSIsInQyIiwiYmIwIiwidDMiLCJTeW1ib2wiLCJmb3IiLCJTZXQiLCJhY3Rpb25zIiwiYmluZGluZ3MiLCJiaW5kaW5nIiwiYWN0aW9uIiwic3RhcnRzV2l0aCIsImFkZCIsImNvbW1hbmRBY3Rpb25zIiwibWFwIiwiY29tbWFuZE5hbWUiLCJzbGljZSIsImhhbmRsZXJzIiwidDQiLCJjb250ZXh0Il0sInNvdXJjZXMiOlsidXNlQ29tbWFuZEtleWJpbmRpbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbXBvbmVudCB0aGF0IHJlZ2lzdGVycyBrZXliaW5kaW5nIGhhbmRsZXJzIGZvciBjb21tYW5kIGJpbmRpbmdzLlxuICpcbiAqIE11c3QgYmUgcmVuZGVyZWQgaW5zaWRlIEtleWJpbmRpbmdTZXR1cCB0byBoYXZlIGFjY2VzcyB0byB0aGUga2V5YmluZGluZyBjb250ZXh0LlxuICogUmVhZHMgXCJjb21tYW5kOipcIiBhY3Rpb25zIGZyb20gdGhlIGN1cnJlbnQga2V5YmluZGluZyBjb25maWd1cmF0aW9uIGFuZCByZWdpc3RlcnNcbiAqIGhhbmRsZXJzIHRoYXQgaW52b2tlIHRoZSBjb3JyZXNwb25kaW5nIHNsYXNoIGNvbW1hbmQgdmlhIG9uU3VibWl0LlxuICpcbiAqIENvbW1hbmRzIHRyaWdnZXJlZCB2aWEga2V5YmluZGluZyBhcmUgdHJlYXRlZCBhcyBcImltbWVkaWF0ZVwiIC0gdGhleSBleGVjdXRlIHJpZ2h0XG4gKiBhd2F5IGFuZCBwcmVzZXJ2ZSB0aGUgdXNlcidzIGV4aXN0aW5nIGlucHV0IHRleHQgKHRoZSBwcm9tcHQgaXMgbm90IGNsZWFyZWQpLlxuICovXG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VJc01vZGFsT3ZlcmxheUFjdGl2ZSB9IGZyb20gJy4uL2NvbnRleHQvb3ZlcmxheUNvbnRleHQuanMnXG5pbXBvcnQgeyB1c2VPcHRpb25hbEtleWJpbmRpbmdDb250ZXh0IH0gZnJvbSAnLi4va2V5YmluZGluZ3MvS2V5YmluZGluZ0NvbnRleHQuanMnXG5pbXBvcnQgeyB1c2VLZXliaW5kaW5ncyB9IGZyb20gJy4uL2tleWJpbmRpbmdzL3VzZUtleWJpbmRpbmcuanMnXG5pbXBvcnQgdHlwZSB7IFByb21wdElucHV0SGVscGVycyB9IGZyb20gJy4uL3V0aWxzL2hhbmRsZVByb21wdFN1Ym1pdC5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gb25TdWJtaXQgYWNjZXB0cyBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgYmV5b25kIHdoYXQgd2UgcGFzcyBoZXJlLFxuICAvLyBzbyB3ZSB1c2UgYSByZXN0IHBhcmFtZXRlciB0byBhbGxvdyBhbnkgYWRkaXRpb25hbCBhcmdzXG4gIG9uU3VibWl0OiAoXG4gICAgaW5wdXQ6IHN0cmluZyxcbiAgICBoZWxwZXJzOiBQcm9tcHRJbnB1dEhlbHBlcnMsXG4gICAgLi4ucmVzdDogW1xuICAgICAgc3BlY3VsYXRpb25BY2NlcHQ/OiB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zPzogeyBmcm9tS2V5YmluZGluZz86IGJvb2xlYW4gfSxcbiAgICBdXG4gICkgPT4gdm9pZFxuICAvKiogU2V0IHRvIGZhbHNlIHRvIGRpc2FibGUgY29tbWFuZCBrZXliaW5kaW5ncyAoZS5nLiwgd2hlbiBhIGRpYWxvZyBpcyBvcGVuKSAqL1xuICBpc0FjdGl2ZT86IGJvb2xlYW5cbn1cblxuY29uc3QgTk9PUF9IRUxQRVJTOiBQcm9tcHRJbnB1dEhlbHBlcnMgPSB7XG4gIHNldEN1cnNvck9mZnNldDogKCkgPT4ge30sXG4gIGNsZWFyQnVmZmVyOiAoKSA9PiB7fSxcbiAgcmVzZXRIaXN0b3J5OiAoKSA9PiB7fSxcbn1cblxuLyoqXG4gKiBSZWdpc3RlcnMga2V5YmluZGluZyBoYW5kbGVycyBmb3IgYWxsIFwiY29tbWFuZDoqXCIgYWN0aW9ucyBmb3VuZCBpbiB0aGVcbiAqIHVzZXIncyBrZXliaW5kaW5nIGNvbmZpZ3VyYXRpb24uIFdoZW4gdHJpZ2dlcmVkLCBlYWNoIGhhbmRsZXIgc3VibWl0c1xuICogdGhlIGNvcnJlc3BvbmRpbmcgc2xhc2ggY29tbWFuZCAoZS5nLiwgXCJjb21tYW5kOmNvbW1pdFwiIHN1Ym1pdHMgXCIvY29tbWl0XCIpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gQ29tbWFuZEtleWJpbmRpbmdIYW5kbGVycyh7XG4gIG9uU3VibWl0LFxuICBpc0FjdGl2ZSA9IHRydWUsXG59OiBQcm9wcyk6IG51bGwge1xuICBjb25zdCBrZXliaW5kaW5nQ29udGV4dCA9IHVzZU9wdGlvbmFsS2V5YmluZGluZ0NvbnRleHQoKVxuICBjb25zdCBpc01vZGFsT3ZlcmxheUFjdGl2ZSA9IHVzZUlzTW9kYWxPdmVybGF5QWN0aXZlKClcblxuICAvLyBFeHRyYWN0IGNvbW1hbmQgYWN0aW9ucyBmcm9tIHBhcnNlZCBiaW5kaW5nc1xuICBjb25zdCBjb21tYW5kQWN0aW9ucyA9IHVzZU1lbW8oKCkgPT4ge1xuICAgIGlmICgha2V5YmluZGluZ0NvbnRleHQpIHJldHVybiBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGNvbnN0IGFjdGlvbnMgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIGZvciAoY29uc3QgYmluZGluZyBvZiBrZXliaW5kaW5nQ29udGV4dC5iaW5kaW5ncykge1xuICAgICAgaWYgKGJpbmRpbmcuYWN0aW9uPy5zdGFydHNXaXRoKCdjb21tYW5kOicpKSB7XG4gICAgICAgIGFjdGlvbnMuYWRkKGJpbmRpbmcuYWN0aW9uKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWN0aW9uc1xuICB9LCBba2V5YmluZGluZ0NvbnRleHRdKVxuXG4gIC8vIEJ1aWxkIGhhbmRsZXIgbWFwIGZvciBhbGwgY29tbWFuZCBhY3Rpb25zXG4gIGNvbnN0IGhhbmRsZXJzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3QgbWFwOiBSZWNvcmQ8c3RyaW5nLCAoKSA9PiB2b2lkPiA9IHt9XG4gICAgZm9yIChjb25zdCBhY3Rpb24gb2YgY29tbWFuZEFjdGlvbnMpIHtcbiAgICAgIGNvbnN0IGNvbW1hbmROYW1lID0gYWN0aW9uLnNsaWNlKCdjb21tYW5kOicubGVuZ3RoKVxuICAgICAgbWFwW2FjdGlvbl0gPSAoKSA9PiB7XG4gICAgICAgIG9uU3VibWl0KGAvJHtjb21tYW5kTmFtZX1gLCBOT09QX0hFTFBFUlMsIHVuZGVmaW5lZCwge1xuICAgICAgICAgIGZyb21LZXliaW5kaW5nOiB0cnVlLFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwXG4gIH0sIFtjb21tYW5kQWN0aW9ucywgb25TdWJtaXRdKVxuXG4gIHVzZUtleWJpbmRpbmdzKGhhbmRsZXJzLCB7XG4gICAgY29udGV4dDogJ0NoYXQnLFxuICAgIGlzQWN0aXZlOiBpc0FjdGl2ZSAmJiAhaXNNb2RhbE92ZXJsYXlBY3RpdmUsXG4gIH0pXG5cbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0EsT0FBTyxRQUFRLE9BQU87QUFDL0IsU0FBU0MsdUJBQXVCLFFBQVEsOEJBQThCO0FBQ3RFLFNBQVND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
