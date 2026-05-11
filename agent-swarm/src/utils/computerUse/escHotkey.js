"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEscHotkey = registerEscHotkey;
exports.unregisterEscHotkey = unregisterEscHotkey;
exports.notifyExpectedEscape = notifyExpectedEscape;
var debug_js_1 = require("../debug.js");
var drainRunLoop_js_1 = require("./drainRunLoop.js");
var swiftLoader_js_1 = require("./swiftLoader.js");
/**
 * Global Escape → abort. Mirrors Cowork's `escAbort.ts` but without Electron:
 * CGEventTap via `@ant/computer-use-swift`. While registered, Escape is
 * consumed system-wide (PI defense — a prompt-injected action can't dismiss
 * a dialog with Escape).
 *
 * Lifecycle: register on fresh lock acquire (`wrapper.tsx` `acquireCuLock`),
 * unregister on lock release (`cleanup.ts`). The tap's CFRunLoopSource sits
 * in .defaultMode on CFRunLoopGetMain(), so we hold a drainRunLoop pump
 * retain for the registration's lifetime — same refcounted setInterval as
 * the `@MainActor` methods.
 *
 * `notifyExpectedEscape()` punches a hole for model-synthesized Escapes: the
 * executor's `key("escape")` calls it before posting the CGEvent. Swift
 * schedules a 100ms decay so a CGEvent that never reaches the tap callback
 * doesn't eat the next user ESC.
 */
var registered = false;
function registerEscHotkey(onEscape) {
    if (registered)
        return true;
    var cu = (0, swiftLoader_js_1.requireComputerUseSwift)();
    if (!cu.hotkey.registerEscape(onEscape)) {
        // CGEvent.tapCreate failed — typically missing Accessibility permission.
        // CU still works, just without ESC abort. Mirrors Cowork's escAbort.ts:81.
        (0, debug_js_1.logForDebugging)('[cu-esc] registerEscape returned false', { level: 'warn' });
        return false;
    }
    (0, drainRunLoop_js_1.retainPump)();
    registered = true;
    (0, debug_js_1.logForDebugging)('[cu-esc] registered');
    return true;
}
function unregisterEscHotkey() {
    if (!registered)
        return;
    try {
        (0, swiftLoader_js_1.requireComputerUseSwift)().hotkey.unregister();
    }
    finally {
        (0, drainRunLoop_js_1.releasePump)();
        registered = false;
        (0, debug_js_1.logForDebugging)('[cu-esc] unregistered');
    }
}
function notifyExpectedEscape() {
    if (!registered)
        return;
    (0, swiftLoader_js_1.requireComputerUseSwift)().hotkey.notifyExpectedEscape();
}
