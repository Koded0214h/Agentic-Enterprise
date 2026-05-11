"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServerApprovalDialog = MCPServerApprovalDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var settings_js_1 = require("../utils/settings/settings.js");
var index_js_2 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
var MCPServerDialogCopy_js_1 = require("./MCPServerDialogCopy.js");
function MCPServerApprovalDialog(t0) {
    var $ = (0, compiler_runtime_1.c)(13);
    var serverName = t0.serverName, onDone = t0.onDone;
    var t1;
    if ($[0] !== onDone || $[1] !== serverName) {
        t1 = function onChange(value) {
            (0, index_js_1.logEvent)("tengu_mcp_dialog_choice", {
                choice: value
            });
            bb2: switch (value) {
                case "yes":
                case "yes_all":
                    {
                        var currentSettings_0 = (0, settings_js_1.getSettings_DEPRECATED)() || {};
                        var enabledServers = currentSettings_0.enabledMcpjsonServers || [];
                        if (!enabledServers.includes(serverName)) {
                            (0, settings_js_1.updateSettingsForSource)("localSettings", {
                                enabledMcpjsonServers: __spreadArray(__spreadArray([], enabledServers, true), [serverName], false)
                            });
                        }
                        if (value === "yes_all") {
                            (0, settings_js_1.updateSettingsForSource)("localSettings", {
                                enableAllProjectMcpServers: true
                            });
                        }
                        onDone();
                        break bb2;
                    }
                case "no":
                    {
                        var currentSettings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
                        var disabledServers = currentSettings.disabledMcpjsonServers || [];
                        if (!disabledServers.includes(serverName)) {
                            (0, settings_js_1.updateSettingsForSource)("localSettings", {
                                disabledMcpjsonServers: __spreadArray(__spreadArray([], disabledServers, true), [serverName], false)
                            });
                        }
                        onDone();
                    }
            }
        };
        $[0] = onDone;
        $[1] = serverName;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var onChange = t1;
    var t2 = "New MCP server found in .mcp.json: ".concat(serverName);
    var t3;
    if ($[3] !== onChange) {
        t3 = function () { return onChange("no"); };
        $[3] = onChange;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var t4;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = <MCPServerDialogCopy_js_1.MCPServerDialogCopy />;
        $[5] = t4;
    }
    else {
        t4 = $[5];
    }
    var t5;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = [{
                label: "Use this and all future MCP servers in this project",
                value: "yes_all"
            }, {
                label: "Use this MCP server",
                value: "yes"
            }, {
                label: "Continue without using this MCP server",
                value: "no"
            }];
        $[6] = t5;
    }
    else {
        t5 = $[6];
    }
    var t6;
    if ($[7] !== onChange) {
        t6 = <index_js_2.Select options={t5} onChange={function (value_0) { return onChange(value_0); }} onCancel={function () { return onChange("no"); }}/>;
        $[7] = onChange;
        $[8] = t6;
    }
    else {
        t6 = $[8];
    }
    var t7;
    if ($[9] !== t2 || $[10] !== t3 || $[11] !== t6) {
        t7 = <Dialog_js_1.Dialog title={t2} color="warning" onCancel={t3}>{t4}{t6}</Dialog_js_1.Dialog>;
        $[9] = t2;
        $[10] = t3;
        $[11] = t6;
        $[12] = t7;
    }
    else {
        t7 = $[12];
    }
    return t7;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMiLCJsb2dFdmVudCIsImdldFNldHRpbmdzX0RFUFJFQ0FURUQiLCJ1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSIsIlNlbGVjdCIsIkRpYWxvZyIsIk1DUFNlcnZlckRpYWxvZ0NvcHkiLCJQcm9wcyIsInNlcnZlck5hbWUiLCJvbkRvbmUiLCJNQ1BTZXJ2ZXJBcHByb3ZhbERpYWxvZyIsInQwIiwiJCIsIl9jIiwidDEiLCJvbkNoYW5nZSIsInZhbHVlIiwiY2hvaWNlIiwiYmIyIiwiY3VycmVudFNldHRpbmdzXzAiLCJlbmFibGVkU2VydmVycyIsImN1cnJlbnRTZXR0aW5ncyIsImVuYWJsZWRNY3Bqc29uU2VydmVycyIsImluY2x1ZGVzIiwiZW5hYmxlQWxsUHJvamVjdE1jcFNlcnZlcnMiLCJkaXNhYmxlZFNlcnZlcnMiLCJkaXNhYmxlZE1jcGpzb25TZXJ2ZXJzIiwidDIiLCJ0MyIsInQ0IiwiU3ltYm9sIiwiZm9yIiwidDUiLCJsYWJlbCIsInQ2IiwidmFsdWVfMCIsInQ3Il0sInNvdXJjZXMiOlsiTUNQU2VydmVyQXBwcm92YWxEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7XG4gIHR5cGUgQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyxcbiAgbG9nRXZlbnQsXG59IGZyb20gJ3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQge1xuICBnZXRTZXR0aW5nc19ERVBSRUNBVEVELFxuICB1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSxcbn0gZnJvbSAnLi4vdXRpbHMvc2V0dGluZ3Mvc2V0dGluZ3MuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuL0N1c3RvbVNlbGVjdC9pbmRleC5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9EaWFsb2cuanMnXG5pbXBvcnQgeyBNQ1BTZXJ2ZXJEaWFsb2dDb3B5IH0gZnJvbSAnLi9NQ1BTZXJ2ZXJEaWFsb2dDb3B5LmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBzZXJ2ZXJOYW1lOiBzdHJpbmdcbiAgb25Eb25lKCk6IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1DUFNlcnZlckFwcHJvdmFsRGlhbG9nKHtcbiAgc2VydmVyTmFtZSxcbiAgb25Eb25lLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBmdW5jdGlvbiBvbkNoYW5nZSh2YWx1ZTogJ3llcycgfCAneWVzX2FsbCcgfCAnbm8nKSB7XG4gICAgbG9nRXZlbnQoJ3Rlbmd1X21jcF9kaWFsb2dfY2hvaWNlJywge1xuICAgICAgY2hvaWNlOlxuICAgICAgICB2YWx1ZSBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgIH0pXG5cbiAgICBzd2l0Y2ggKHZhbHVlKSB7XG4gICAgICBjYXNlICd5ZXMnOlxuICAgICAgY2FzZSAneWVzX2FsbCc6IHtcbiAgICAgICAgLy8gR2V0IGN1cnJlbnQgZW5hYmxlZCBzZXJ2ZXJzIGZyb20gc2V0dGluZ3NcbiAgICAgICAgY29uc3QgY3VycmVudFNldHRpbmdzID0gZ2V0U2V0dGluZ3NfREVQUkVDQVRFRCgpIHx8IHt9XG4gICAgICAgIGNvbnN0IGVuYWJsZWRTZXJ2ZXJzID0gY3VycmVudFNldHRpbmdzLmVuYWJsZWRNY3Bqc29uU2VydmVycyB8fCBbXVxuXG4gICAgICAgIC8vIEFkZCBzZXJ2ZXIgaWYgbm90IGFscmVhZHkgZW5hYmxlZFxuICAgICAgICBpZiAoIWVuYWJsZWRTZXJ2ZXJzLmluY2x1ZGVzKHNlcnZlck5hbWUpKSB7XG4gICAgICAgICAgdXBkYXRlU2V0dGluZ3NGb3JTb3VyY2UoJ2xvY2FsU2V0dGluZ3MnLCB7XG4gICAgICAgICAgICBlbmFibGVkTWNwanNvblNlcnZlcnM6IFsuLi5lbmFibGVkU2VydmVycywgc2VydmVyTmFtZV0sXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gJ3llc19hbGwnKSB7XG4gICAgICAgICAgdXBkYXRlU2V0dGluZ3NGb3JTb3VyY2UoJ2xvY2FsU2V0dGluZ3MnLCB7XG4gICAgICAgICAgICBlbmFibGVBbGxQcm9qZWN0TWNwU2VydmVyczogdHJ1ZSxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIG9uRG9uZSgpXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlICdubyc6IHtcbiAgICAgICAgLy8gR2V0IGN1cnJlbnQgZGlzYWJsZWQgc2VydmVycyBmcm9tIHNldHRpbmdzXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTZXR0aW5ncyA9IGdldFNldHRpbmdzX0RFUFJFQ0FURUQoKSB8fCB7fVxuICAgICAgICBjb25zdCBkaXNhYmxlZFNlcnZlcnMgPSBjdXJyZW50U2V0dGluZ3MuZGlzYWJsZWRNY3Bqc29uU2VydmVycyB8fCBbXVxuXG4gICAgICAgIC8vIEFkZCBzZXJ2ZXIgaWYgbm90IGFscmVhZHkgZGlzYWJsZWRcbiAgICAgICAgaWYgKCFkaXNhYmxlZFNlcnZlcnMuaW5jbHVkZXMoc2VydmVyTmFtZSkpIHtcbiAgICAgICAgICB1cGRhdGVTZXR0aW5nc0ZvclNvdXJjZSgnbG9jYWxTZXR0aW5ncycsIHtcbiAgICAgICAgICAgIGRpc2FibGVkTWNwanNvblNlcnZlcnM6IFsuLi5kaXNhYmxlZFNlcnZlcnMsIHNlcnZlck5hbWVdLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgb25Eb25lKClcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxEaWFsb2dcbiAgICAgIHRpdGxlPXtgTmV3IE1DUCBzZXJ2ZXIgZm91bmQgaW4gLm1jcC5qc29uOiAke3NlcnZlck5hbWV9YH1cbiAgICAgIGNvbG9yPVwid2FybmluZ1wiXG4gICAgICBvbkNhbmNlbD17KCkgPT4gb25DaGFuZ2UoJ25vJyl9XG4gICAgPlxuICAgICAgPE1DUFNlcnZlckRpYWxvZ0NvcHkgLz5cblxuICAgICAgPFNlbGVjdFxuICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6IGBVc2UgdGhpcyBhbmQgYWxsIGZ1dHVyZSBNQ1Agc2VydmVycyBpbiB0aGlzIHByb2plY3RgLFxuICAgICAgICAgICAgdmFsdWU6ICd5ZXNfYWxsJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgbGFiZWw6IGBVc2UgdGhpcyBNQ1Agc2VydmVyYCwgdmFsdWU6ICd5ZXMnIH0sXG4gICAgICAgICAgeyBsYWJlbDogYENvbnRpbnVlIHdpdGhvdXQgdXNpbmcgdGhpcyBNQ1Agc2VydmVyYCwgdmFsdWU6ICdubycgfSxcbiAgICAgICAgXX1cbiAgICAgICAgb25DaGFuZ2U9e3ZhbHVlID0+IG9uQ2hhbmdlKHZhbHVlIGFzICd5ZXNfYWxsJyB8ICd5ZXMnIHwgJ25vJyl9XG4gICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkNoYW5nZSgnbm8nKX1cbiAgICAgIC8+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLFNBQ0UsS0FBS0MsMERBQTBELEVBQy9EQyxRQUFRLFFBQ0gsaUNBQWlDO0FBQ3hDLFNBQ0VDLHNCQUFzQixFQUN0QkMsdUJBQXVCLFFBQ2xCLCtCQUErQjtBQUN0QyxTQUFTQyxNQUFNLFFBQVEseUJBQXlCO0FBQ2hELFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFDbEQsU0FBU0MsbUJBQW1CLFFBQVEsMEJBQTBCO0FBRTlELEtBQUtDLEtBQUssR0FBRztFQUNYQyxVQUFVLEVBQUUsTUFBTTtFQUNsQkMsTUFBTSxFQUFFLEVBQUUsSUFBSTtBQUNoQixDQUFDO0FBRUQsT0FBTyxT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
