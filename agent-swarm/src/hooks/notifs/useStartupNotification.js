"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStartupNotification = useStartupNotification;
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var notifications_js_1 = require("../../context/notifications.js");
var log_js_1 = require("../../utils/log.js");
/**
 * Fires notification(s) once on mount. Encapsulates the remote-mode gate and
 * once-per-session ref guard that was hand-rolled across 10+ notifs/ hooks.
 *
 * The compute fn runs exactly once on first effect. Return null to skip,
 * a Notification to fire one, or an array to fire several. Sync or async.
 * Rejections are routed to logError.
 */
function useStartupNotification(compute) {
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    var hasRunRef = (0, react_1.useRef)(false);
    var computeRef = (0, react_1.useRef)(compute);
    computeRef.current = compute;
    (0, react_1.useEffect)(function () {
        if ((0, state_js_1.getIsRemoteMode)() || hasRunRef.current)
            return;
        hasRunRef.current = true;
        void Promise.resolve()
            .then(function () { return computeRef.current(); })
            .then(function (result) {
            if (!result)
                return;
            for (var _i = 0, _a = Array.isArray(result) ? result : [result]; _i < _a.length; _i++) {
                var n = _a[_i];
                addNotification(n);
            }
        })
            .catch(log_js_1.logError);
    }, [addNotification]);
}
