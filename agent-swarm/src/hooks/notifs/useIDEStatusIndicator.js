"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIDEStatusIndicator = useIDEStatusIndicator;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var notifications_js_1 = require("src/context/notifications.js");
var ink_js_1 = require("src/ink.js");
var config_js_1 = require("src/utils/config.js");
var ide_js_1 = require("src/utils/ide.js");
var state_js_1 = require("../../bootstrap/state.js");
var useIdeConnectionStatus_js_1 = require("../useIdeConnectionStatus.js");
var MAX_IDE_HINT_SHOW_COUNT = 5;
function useIDEStatusIndicator(t0) {
    var $ = (0, compiler_runtime_1.c)(26);
    var ideSelection = t0.ideSelection, mcpClients = t0.mcpClients, ideInstallationStatus = t0.ideInstallationStatus;
    var _a = (0, notifications_js_1.useNotifications)(), addNotification = _a.addNotification, removeNotification = _a.removeNotification;
    var _b = (0, useIdeConnectionStatus_js_1.useIdeConnectionStatus)(mcpClients), ideStatus = _b.status, ideName = _b.ideName;
    var hasShownHintRef = (0, react_1.useRef)(false);
    var t1;
    if ($[0] !== ideInstallationStatus) {
        t1 = ideInstallationStatus ? (0, ide_js_1.isJetBrainsIde)(ideInstallationStatus === null || ideInstallationStatus === void 0 ? void 0 : ideInstallationStatus.ideType) : false;
        $[0] = ideInstallationStatus;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var isJetBrains = t1;
    var showIDEInstallErrorOrJetBrainsInfo = (ideInstallationStatus === null || ideInstallationStatus === void 0 ? void 0 : ideInstallationStatus.error) || isJetBrains;
    var shouldShowIdeSelection = ideStatus === "connected" && ((ideSelection === null || ideSelection === void 0 ? void 0 : ideSelection.filePath) || (ideSelection === null || ideSelection === void 0 ? void 0 : ideSelection.text) && ideSelection.lineCount > 0);
    var shouldShowConnected = ideStatus === "connected" && !shouldShowIdeSelection;
    var showIDEInstallError = showIDEInstallErrorOrJetBrainsInfo && !isJetBrains && !shouldShowConnected && !shouldShowIdeSelection;
    var showJetBrainsInfo = showIDEInstallErrorOrJetBrainsInfo && isJetBrains && !shouldShowConnected && !shouldShowIdeSelection;
    var t2;
    var t3;
    if ($[2] !== addNotification || $[3] !== ideStatus || $[4] !== removeNotification || $[5] !== showJetBrainsInfo) {
        t2 = function () {
            var _a;
            if ((0, state_js_1.getIsRemoteMode)()) {
                return;
            }
            if ((0, ide_js_1.isSupportedTerminal)() || ideStatus !== null || showJetBrainsInfo) {
                removeNotification("ide-status-hint");
                return;
            }
            if (hasShownHintRef.current || ((_a = (0, config_js_1.getGlobalConfig)().ideHintShownCount) !== null && _a !== void 0 ? _a : 0) >= MAX_IDE_HINT_SHOW_COUNT) {
                return;
            }
            var timeoutId = setTimeout(_temp2, 3000, hasShownHintRef, addNotification);
            return function () { return clearTimeout(timeoutId); };
        };
        t3 = [addNotification, removeNotification, ideStatus, showJetBrainsInfo];
        $[2] = addNotification;
        $[3] = ideStatus;
        $[4] = removeNotification;
        $[5] = showJetBrainsInfo;
        $[6] = t2;
        $[7] = t3;
    }
    else {
        t2 = $[6];
        t3 = $[7];
    }
    (0, react_1.useEffect)(t2, t3);
    var t4;
    var t5;
    if ($[8] !== addNotification || $[9] !== ideName || $[10] !== ideStatus || $[11] !== removeNotification || $[12] !== showIDEInstallError || $[13] !== showJetBrainsInfo) {
        t4 = function () {
            if ((0, state_js_1.getIsRemoteMode)()) {
                return;
            }
            if (showIDEInstallError || showJetBrainsInfo || ideStatus !== "disconnected" || !ideName) {
                removeNotification("ide-status-disconnected");
                return;
            }
            addNotification({
                key: "ide-status-disconnected",
                text: "".concat(ideName, " disconnected"),
                color: "error",
                priority: "medium"
            });
        };
        t5 = [addNotification, removeNotification, ideStatus, ideName, showIDEInstallError, showJetBrainsInfo];
        $[8] = addNotification;
        $[9] = ideName;
        $[10] = ideStatus;
        $[11] = removeNotification;
        $[12] = showIDEInstallError;
        $[13] = showJetBrainsInfo;
        $[14] = t4;
        $[15] = t5;
    }
    else {
        t4 = $[14];
        t5 = $[15];
    }
    (0, react_1.useEffect)(t4, t5);
    var t6;
    var t7;
    if ($[16] !== addNotification || $[17] !== removeNotification || $[18] !== showJetBrainsInfo) {
        t6 = function () {
            if ((0, state_js_1.getIsRemoteMode)()) {
                return;
            }
            if (!showJetBrainsInfo) {
                removeNotification("ide-status-jetbrains-disconnected");
                return;
            }
            addNotification({
                key: "ide-status-jetbrains-disconnected",
                text: "IDE plugin not connected \xB7 /status for info",
                priority: "medium"
            });
        };
        t7 = [addNotification, removeNotification, showJetBrainsInfo];
        $[16] = addNotification;
        $[17] = removeNotification;
        $[18] = showJetBrainsInfo;
        $[19] = t6;
        $[20] = t7;
    }
    else {
        t6 = $[19];
        t7 = $[20];
    }
    (0, react_1.useEffect)(t6, t7);
    var t8;
    var t9;
    if ($[21] !== addNotification || $[22] !== removeNotification || $[23] !== showIDEInstallError) {
        t8 = function () {
            if ((0, state_js_1.getIsRemoteMode)()) {
                return;
            }
            if (!showIDEInstallError) {
                removeNotification("ide-status-install-error");
                return;
            }
            addNotification({
                key: "ide-status-install-error",
                text: "IDE extension install failed (see /status for info)",
                color: "error",
                priority: "medium"
            });
        };
        t9 = [addNotification, removeNotification, showIDEInstallError];
        $[21] = addNotification;
        $[22] = removeNotification;
        $[23] = showIDEInstallError;
        $[24] = t8;
        $[25] = t9;
    }
    else {
        t8 = $[24];
        t9 = $[25];
    }
    (0, react_1.useEffect)(t8, t9);
}
function _temp2(hasShownHintRef_0, addNotification_0) {
    (0, ide_js_1.detectIDEs)(true).then(function (infos) {
        var _a;
        var ideName_0 = (_a = infos[0]) === null || _a === void 0 ? void 0 : _a.name;
        if (ideName_0 && !hasShownHintRef_0.current) {
            hasShownHintRef_0.current = true;
            (0, config_js_1.saveGlobalConfig)(_temp);
            addNotification_0({
                key: "ide-status-hint",
                jsx: <ink_js_1.Text dimColor={true}>/ide for <ink_js_1.Text color="ide">{ideName_0}</ink_js_1.Text></ink_js_1.Text>,
                priority: "low"
            });
        }
    });
}
function _temp(current) {
    var _a;
    return __assign(__assign({}, current), { ideHintShownCount: ((_a = current.ideHintShownCount) !== null && _a !== void 0 ? _a : 0) + 1 });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVJlZiIsInVzZU5vdGlmaWNhdGlvbnMiLCJUZXh0IiwiTUNQU2VydmVyQ29ubmVjdGlvbiIsImdldEdsb2JhbENvbmZpZyIsInNhdmVHbG9iYWxDb25maWciLCJkZXRlY3RJREVzIiwiSURFRXh0ZW5zaW9uSW5zdGFsbGF0aW9uU3RhdHVzIiwiaXNKZXRCcmFpbnNJZGUiLCJpc1N1cHBvcnRlZFRlcm1pbmFsIiwiZ2V0SXNSZW1vdGVNb2RlIiwidXNlSWRlQ29ubmVjdGlvblN0YXR1cyIsIklERVNlbGVjdGlvbiIsIk1BWF9JREVfSElOVF9TSE9XX0NPVU5UIiwiUHJvcHMiLCJpZGVJbnN0YWxsYXRpb25TdGF0dXMiLCJpZGVTZWxlY3Rpb24iLCJtY3BDbGllbnRzIiwidXNlSURFU3RhdHVzSW5kaWNhdG9yIiwidDAiLCIkIiwiX2MiLCJhZGROb3RpZmljYXRpb24iLCJyZW1vdmVOb3RpZmljYXRpb24iLCJzdGF0dXMiLCJpZGVTdGF0dXMiLCJpZGVOYW1lIiwiaGFzU2hvd25IaW50UmVmIiwidDEiLCJpZGVUeXBlIiwiaXNKZXRCcmFpbnMiLCJzaG93SURFSW5zdGFsbEVycm9yT3JKZXRCcmFpbnNJbmZvIiwiZXJyb3IiLCJzaG91bGRTaG93SWRlU2VsZWN0aW9uIiwiZmlsZVBhdGgiLCJ0ZXh0IiwibGluZUNvdW50Iiwic2hvdWxkU2hvd0Nvbm5lY3RlZCIsInNob3dJREVJbnN0YWxsRXJyb3IiLCJzaG93SmV0QnJhaW5zSW5mbyIsInQyIiwidDMiLCJjdXJyZW50IiwiaWRlSGludFNob3duQ291bnQiLCJ0aW1lb3V0SWQiLCJzZXRUaW1lb3V0IiwiX3RlbXAyIiwiY2xlYXJUaW1lb3V0IiwidDQiLCJ0NSIsImtleSIsImNvbG9yIiwicHJpb3JpdHkiLCJ0NiIsInQ3IiwidDgiLCJ0OSIsImhhc1Nob3duSGludFJlZl8wIiwiYWRkTm90aWZpY2F0aW9uXzAiLCJ0aGVuIiwiaW5mb3MiLCJpZGVOYW1lXzAiLCJuYW1lIiwiX3RlbXAiLCJqc3giXSwic291cmNlcyI6WyJ1c2VJREVTdGF0dXNJbmRpY2F0b3IudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlTm90aWZpY2F0aW9ucyB9IGZyb20gJ3NyYy9jb250ZXh0L25vdGlmaWNhdGlvbnMuanMnXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnc3JjL2luay5qcydcbmltcG9ydCB0eXBlIHsgTUNQU2VydmVyQ29ubmVjdGlvbiB9IGZyb20gJ3NyYy9zZXJ2aWNlcy9tY3AvdHlwZXMuanMnXG5pbXBvcnQgeyBnZXRHbG9iYWxDb25maWcsIHNhdmVHbG9iYWxDb25maWcgfSBmcm9tICdzcmMvdXRpbHMvY29uZmlnLmpzJ1xuaW1wb3J0IHtcbiAgZGV0ZWN0SURFcyxcbiAgdHlwZSBJREVFeHRlbnNpb25JbnN0YWxsYXRpb25TdGF0dXMsXG4gIGlzSmV0QnJhaW5zSWRlLFxuICBpc1N1cHBvcnRlZFRlcm1pbmFsLFxufSBmcm9tICdzcmMvdXRpbHMvaWRlLmpzJ1xuaW1wb3J0IHsgZ2V0SXNSZW1vdGVNb2RlIH0gZnJvbSAnLi4vLi4vYm9vdHN0cmFwL3N0YXRlLmpzJ1xuaW1wb3J0IHsgdXNlSWRlQ29ubmVjdGlvblN0YXR1cyB9IGZyb20gJy4uL3VzZUlkZUNvbm5lY3Rpb25TdGF0dXMuanMnXG5pbXBvcnQgdHlwZSB7IElERVNlbGVjdGlvbiB9IGZyb20gJy4uL3VzZUlkZVNlbGVjdGlvbi5qcydcblxuY29uc3QgTUFYX0lERV9ISU5UX1NIT1dfQ09VTlQgPSA1XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGlkZUluc3RhbGxhdGlvblN0YXR1czogSURFRXh0ZW5zaW9uSW5zdGFsbGF0aW9uU3RhdHVzIHwgbnVsbFxuICBpZGVTZWxlY3Rpb246IElERVNlbGVjdGlvbiB8IHVuZGVmaW5lZFxuICBtY3BDbGllbnRzOiBNQ1BTZXJ2ZXJDb25uZWN0aW9uW11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUlERVN0YXR1c0luZGljYXRvcih7XG4gIGlkZVNlbGVjdGlvbixcbiAgbWNwQ2xpZW50cyxcbiAgaWRlSW5zdGFsbGF0aW9uU3RhdHVzLFxufTogUHJvcHMpOiB2b2lkIHtcbiAgY29uc3QgeyBhZGROb3RpZmljYXRpb24sIHJlbW92ZU5vdGlmaWNhdGlvbiB9ID0gdXNlTm90aWZpY2F0aW9ucygpXG4gIGNvbnN0IHsgc3RhdHVzOiBpZGVTdGF0dXMsIGlkZU5hbWUgfSA9IHVzZUlkZUNvbm5lY3Rpb25TdGF0dXMobWNwQ2xpZW50cylcbiAgY29uc3QgaGFzU2hvd25IaW50UmVmID0gdXNlUmVmKGZhbHNlKVxuXG4gIGNvbnN0IGlzSmV0QnJhaW5zID0gaWRlSW5zdGFsbGF0aW9uU3RhdHVzXG4gICAgPyBpc0pldEJyYWluc0lkZShpZGVJbnN0YWxsYXRpb25TdGF0dXM/LmlkZVR5cGUpXG4gICAgOiBmYWxzZVxuICBjb25zdCBzaG93SURFSW5zdGFsbEVycm9yT3JKZXRCcmFpbnNJbmZvID1cbiAgICBpZGVJbnN0YWxsYXRpb25TdGF0dXM/LmVycm9yIHx8IGlzSmV0QnJhaW5zXG5cbiAgY29uc3Qgc2hvdWxkU2hvd0lkZVNlbGVjdGlvbiA9XG4gICAgaWRlU3RhdHVzID09PSAnY29ubmVjdGVkJyAmJlxuICAgIChpZGVTZWxlY3Rpb24/LmZpbGVQYXRoIHx8XG4gICAgICAoaWRlU2VsZWN0aW9uPy50ZXh0ICYmIGlkZVNlbGVjdGlvbi5saW5lQ291bnQgPiAwKSlcblxuICAvLyBPbmx5IHNob3cgdGhlIGNvbm5lY3RlZCBpZiBub3Qgc2hvd2luZyBjb250ZXh0XG4gIGNvbnN0IHNob3VsZFNob3dDb25uZWN0ZWQgPVxuICAgIGlkZVN0YXR1cyA9PT0gJ2Nvbm5lY3RlZCcgJiYgIXNob3VsZFNob3dJZGVTZWxlY3Rpb25cblxuICBjb25zdCBzaG93SURFSW5zdGFsbEVycm9yID1cbiAgICBzaG93SURFSW5zdGFsbEVycm9yT3JKZXRCcmFpbnNJbmZvICYmXG4gICAgIWlzSmV0QnJhaW5zICYmXG4gICAgIXNob3VsZFNob3dDb25uZWN0ZWQgJiZcbiAgICAhc2hvdWxkU2hvd0lkZVNlbGVjdGlvblxuXG4gIGNvbnN0IHNob3dKZXRCcmFpbnNJbmZvID1cbiAgICBzaG93SURFSW5zdGFsbEVycm9yT3JKZXRCcmFpbnNJbmZvICYmXG4gICAgaXNKZXRCcmFpbnMgJiZcbiAgICAhc2hvdWxkU2hvd0Nvbm5lY3RlZCAmJlxuICAgICFzaG91bGRTaG93SWRlU2VsZWN0aW9uXG5cbiAgLy8gU2hvdyB0aGUgL2lkZSBjb21tYW5kIGhpbnQgaWYgcnVubmluZyBmcm9tIGFuIGV4dGVybmFsIHRlcm1pbmFsIGFuZCBmb3VuZCBydW5uaW5nIElERShzKVxuICAvLyBEZWxheSBzaG93aW5nIGhpbnQgdG8gYXZvaWQgYnJpZWYgZmxhc2ggZHVyaW5nIGF1dG8tY29ubmVjdCBzdGFydHVwXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdldElzUmVtb3RlTW9kZSgpKSByZXR1cm5cbiAgICBpZiAoaXNTdXBwb3J0ZWRUZXJtaW5hbCgpIHx8IGlkZVN0YXR1cyAhPT0gbnVsbCB8fCBzaG93SmV0QnJhaW5zSW5mbykge1xuICAgICAgcmVtb3ZlTm90aWZpY2F0aW9uKCdpZGUtc3RhdHVzLWhpbnQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIFdhaXQgYSBiaXQgdG8gbGV0IGF1dG8tY29ubmVjdCBoYXBwZW4gZmlyc3QsIGF2b2lkaW5nIGJyaWVmIGhpbnQgZmxhc2hcbiAgICBpZiAoXG4gICAgICBoYXNTaG93bkhpbnRSZWYuY3VycmVudCB8fFxuICAgICAgKGdldEdsb2JhbENvbmZpZygpLmlkZUhpbnRTaG93bkNvdW50ID8/IDApID49IE1BWF9JREVfSElOVF9TSE9XX0NPVU5UXG4gICAgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdGltZW91dElkID0gc2V0VGltZW91dChcbiAgICAgIChoYXNTaG93bkhpbnRSZWYsIGFkZE5vdGlmaWNhdGlvbikgPT4ge1xuICAgICAgICB2b2lkIGRldGVjdElERXModHJ1ZSkudGhlbihpbmZvcyA9PiB7XG4gICAgICAgICAgY29uc3QgaWRlTmFtZSA9IGluZm9zWzBdPy5uYW1lXG4gICAgICAgICAgaWYgKGlkZU5hbWUgJiYgIWhhc1Nob3duSGludFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICBoYXNTaG93bkhpbnRSZWYuY3VycmVudCA9IHRydWVcbiAgICAgICAgICAgIHNhdmVHbG9iYWxDb25maWcoY3VycmVudCA9PiAoe1xuICAgICAgICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICAgICAgICBpZGVIaW50U2hvd25Db3VudDogKGN1cnJlbnQuaWRlSGludFNob3duQ291bnQgPz8gMCkgKyAxLFxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICBhZGROb3RpZmljYXRpb24oe1xuICAgICAgICAgICAgICBrZXk6ICdpZGUtc3RhdHVzLWhpbnQnLFxuICAgICAgICAgICAgICBqc3g6IChcbiAgICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgICAgICAgICAgIC9pZGUgZm9yIDxUZXh0IGNvbG9yPVwiaWRlXCI+e2lkZU5hbWV9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgcHJpb3JpdHk6ICdsb3cnLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgMzAwMCxcbiAgICAgIGhhc1Nob3duSGludFJlZixcbiAgICAgIGFkZE5vdGlmaWNhdGlvbixcbiAgICApXG4gICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpXG4gIH0sIFthZGROb3RpZmljYXRpb24sIHJlbW92ZU5vdGlmaWNhdGlvbiwgaWRlU3RhdHVzLCBzaG93SmV0QnJhaW5zSW5mb10pXG5cbiAgLy8gU2hvdyBJREUgZGlzY29ubmVjdGVkL2ZhaWxlZCBub3RpZmljYXRpb24gd2hlbiBzdGF0dXMgaXMgZGlzY29ubmVjdGVkXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdldElzUmVtb3RlTW9kZSgpKSByZXR1cm5cbiAgICBpZiAoXG4gICAgICBzaG93SURFSW5zdGFsbEVycm9yIHx8XG4gICAgICBzaG93SmV0QnJhaW5zSW5mbyB8fFxuICAgICAgaWRlU3RhdHVzICE9PSAnZGlzY29ubmVjdGVkJyB8fFxuICAgICAgIWlkZU5hbWVcbiAgICApIHtcbiAgICAgIHJlbW92ZU5vdGlmaWNhdGlvbignaWRlLXN0YXR1cy1kaXNjb25uZWN0ZWQnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGFkZE5vdGlmaWNhdGlvbih7XG4gICAgICBrZXk6ICdpZGUtc3RhdHVzLWRpc2Nvbm5lY3RlZCcsXG4gICAgICB0ZXh0OiBgJHtpZGVOYW1lfSBkaXNjb25uZWN0ZWRgLFxuICAgICAgY29sb3I6ICdlcnJvcicsXG4gICAgICBwcmlvcml0eTogJ21lZGl1bScsXG4gICAgfSlcbiAgfSwgW1xuICAgIGFkZE5vdGlmaWNhdGlvbixcbiAgICByZW1vdmVOb3RpZmljYXRpb24sXG4gICAgaWRlU3RhdHVzLFxuICAgIGlkZU5hbWUsXG4gICAgc2hvd0lERUluc3RhbGxFcnJvcixcbiAgICBzaG93SmV0QnJhaW5zSW5mbyxcbiAgXSlcblxuICAvLyBTaG93IEpldEJyYWlucyBwbHVnaW4gbm90IGNvbm5lY3RlZCBoaW50XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGdldElzUmVtb3RlTW9kZSgpKSByZXR1cm5cbiAgICBpZiAoIXNob3dKZXRCcmFpbnNJbmZvKSB7XG4gICAgICByZW1vdmVOb3RpZmljYXRpb24oJ2lkZS1zdGF0dXMtamV0YnJhaW5zLWRpc2Nvbm5lY3RlZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgYWRkTm90aWZpY2F0aW9uKHtcbiAgICAgIGtleTogJ2lkZS1zdGF0dXMtamV0YnJhaW5zLWRpc2Nvbm5lY3RlZCcsXG4gICAgICB0ZXh0OiAnSURFIHBsdWdpbiBub3QgY29ubmVjdGVkIMK3IC9zdGF0dXMgZm9yIGluZm8nLFxuICAgICAgcHJpb3JpdHk6ICdtZWRpdW0nLFxuICAgIH0pXG4gIH0sIFthZGROb3RpZmljYXRpb24sIHJlbW92ZU5vdGlmaWNhdGlvbiwgc2hvd0pldEJyYWluc0luZm9dKVxuXG4gIC8vIFNob3cgSURFIGluc3RhbGwgZXJyb3JcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZ2V0SXNSZW1vdGVNb2RlKCkpIHJldHVyblxuICAgIGlmICghc2hvd0lERUluc3RhbGxFcnJvcikge1xuICAgICAgcmVtb3ZlTm90aWZpY2F0aW9uKCdpZGUtc3RhdHVzLWluc3RhbGwtZXJyb3InKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGFkZE5vdGlmaWNhdGlvbih7XG4gICAgICBrZXk6ICdpZGUtc3RhdHVzLWluc3RhbGwtZXJyb3InLFxuICAgICAgdGV4dDogJ0lERSBleHRlbnNpb24gaW5zdGFsbCBmYWlsZWQgKHNlZSAvc3RhdHVzIGZvciBpbmZvKScsXG4gICAgICBjb2xvcjogJ2Vycm9yJyxcbiAgICAgIHByaW9yaXR5OiAnbWVkaXVtJyxcbiAgICB9KVxuICB9LCBbYWRkTm90aWZpY2F0aW9uLCByZW1vdmVOb3RpZmljYXRpb24sIHNob3dJREVJbnN0YWxsRXJyb3JdKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxJQUFJQyxTQUFTLEVBQUVDLE1BQU0sUUFBUSxPQUFPO0FBQ2hELFNBQVNDLGdCQUFnQixRQUFRLDhCQUE4QjtBQUMvRCxTQUFTQyxJQUFJLFFBQVEsWUFBWTtBQUNqQyxjQUFjQyxtQkFBbUIsUUFBUSwyQkFBMkI7QUFDcEUsU0FBU0MsZUFBZSxFQUFFQyxnQkFBZ0IsUUFBUSxxQkFBcUI7QUFDdkUsU0FDRUMsVUFBVSxFQUNWLEtBQUtDLDhCQUE4QixFQUNuQ0MsY0FBYyxFQUNkQyxtQkFBbUIsUUFDZCxrQkFBa0I7QUFDekIsU0FBU0MsZUFBZSxRQUFRLDBCQUEwQjtBQUMx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O1FBQUE7TUFBQTtNQUNyQixJQUFJLENBQUM0QixtQkFBbUI7UUFDdEJmLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDO1FBQUE7TUFBQTtNQUdoREQsZUFBZSxDQUFDO1FBQUE0QixHQUFBLEVBQ1QsMEJBQTBCO1FBQUFmLElBQUEsRUFDekIscURBQXFEO1FBQUFnQixLQUFBLEVBQ3BELE9BQU87UUFBQUMsUUFBQSxFQUNKO01BQ1osQ0FBQyxDQUFDO0lBQUEsQ0FDSDtJQUFFSSxFQUFBLElBQUNsQyxlQUFlLEVBQUVDLGtCQUFrQixFQUFFZSxtQkFBbUIsQ0FBQztJQUFBbEIsQ0FBQSxPQUFBRSxlQUFBO0lBQUFGLENBQUEsT0FBQUcsa0JBQUE7SUFBQUgsQ0FBQSxPQUFBa0IsbUJBQUE7SUFBQWxCLENBQUEsT0FBQW1DLEVBQUE7SUFBQW5DLENBQUEsT0FBQW9DLEVBQUE7RUFBQTtJQUFBRCxFQUFBLEdBQUFuQyxDQUFBO0lBQUFvQyxFQUFBLEdBQUFwQyxDQUFBO0VBQUE7RUFaN0RyQixTQUFTLENBQUN3RCxFQVlULEVBQUVDLEVBQTBELENBQUM7QUFBQTtBQXRJekQsU0FBQVYsT0FBQVcsaUJBQUEsRUFBQUMsaUJBQUE7RUFxRE1wRCxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUFxRCxJQUFLLENBQUNDLEtBQUE7SUFDekIsTUFBQUMsU0FBQSxHQUFnQkQsS0FBSyxHQUFTLEVBQUFFLElBQUE7SUFDOUIsSUFBSUQsU0FBbUMsSUFBbkMsQ0FBWWxDLGlCQUFlLENBQUFlLE9BQVE7TUFDckNmLGlCQUFlLENBQUFlLE9BQUEsR0FBVyxJQUFIO01BQ3ZCckMsZ0JBQWdCLENBQUMwRCxLQUdmLENBQUM7TUFDSHpDLGlCQUFlLENBQUM7UUFBQTRCLEdBQUEsRUFDVCxpQkFBaUI7UUFBQWMsR0FBQSxFQUVwQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQVIsS0FBTyxDQUFDLENBQUMsU0FDSixDQUFDLElBQUksQ0FBTyxLQUFLLENBQUwsS0FBSyxDQUFFdEMsVUFBTSxDQUFFLEVBQTFCLElBQUksQ0FDaEIsRUFGQyxJQUFJLENBRUU7UUFBQTBCLFFBQUEsRUFFQztNQUNaLENBQUMsQ0FBQztJQUFBO0VBQ0gsQ0FDRixDQUFDO0FBQUE7QUF2RUgsU0FBQVcsTUFBQXJCLE9BQUE7RUFBQSxPQXlEa0M7SUFBQSxHQUN4QkEsT0FBTztJQUFBQyxpQkFBQSxFQUNTLENBQUNELE9BQU8sQ0FBQUMsaUJBQXVCLElBQTlCLENBQThCLElBQUk7RUFDeEQsQ0FBQztBQUFBIiwiaWdub3JlTGlzdCI6W119
