"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTeammateLifecycleNotification = useTeammateLifecycleNotification;
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var notifications_js_1 = require("../../context/notifications.js");
var AppState_js_1 = require("../../state/AppState.js");
var types_js_1 = require("../../tasks/InProcessTeammateTask/types.js");
function parseCount(notif) {
    if (!('text' in notif)) {
        return 1;
    }
    var match = notif.text.match(/^(\d+)/);
    return (match === null || match === void 0 ? void 0 : match[1]) ? parseInt(match[1], 10) : 1;
}
function foldSpawn(acc, _incoming) {
    return makeSpawnNotif(parseCount(acc) + 1);
}
function makeSpawnNotif(count) {
    return {
        key: 'teammate-spawn',
        text: count === 1 ? '1 agent spawned' : "".concat(count, " agents spawned"),
        priority: 'low',
        timeoutMs: 5000,
        fold: foldSpawn,
    };
}
function foldShutdown(acc, _incoming) {
    return makeShutdownNotif(parseCount(acc) + 1);
}
function makeShutdownNotif(count) {
    return {
        key: 'teammate-shutdown',
        text: count === 1 ? '1 agent shut down' : "".concat(count, " agents shut down"),
        priority: 'low',
        timeoutMs: 5000,
        fold: foldShutdown,
    };
}
/**
 * Fires batched notifications when in-process teammates spawn or shut down.
 * Uses fold() to combine repeated events into a single notification
 * like "3 agents spawned" or "2 agents shut down".
 */
function useTeammateLifecycleNotification() {
    var tasks = (0, AppState_js_1.useAppState)(function (s) { return s.tasks; });
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    var seenRunningRef = (0, react_1.useRef)(new Set());
    var seenCompletedRef = (0, react_1.useRef)(new Set());
    (0, react_1.useEffect)(function () {
        if ((0, state_js_1.getIsRemoteMode)())
            return;
        for (var _i = 0, _a = Object.entries(tasks); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], task = _b[1];
            if (!(0, types_js_1.isInProcessTeammateTask)(task)) {
                continue;
            }
            if (task.status === 'running' && !seenRunningRef.current.has(id)) {
                seenRunningRef.current.add(id);
                addNotification(makeSpawnNotif(1));
            }
            if (task.status === 'completed' && !seenCompletedRef.current.has(id)) {
                seenCompletedRef.current.add(id);
                addNotification(makeShutdownNotif(1));
            }
        }
    }, [tasks, addNotification]);
}
