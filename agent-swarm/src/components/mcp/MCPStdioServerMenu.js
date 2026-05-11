"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPStdioServerMenu = MCPStdioServerMenu;
var figures_1 = require("figures");
var react_1 = require("react");
var useExitOnCtrlCDWithKeybindings_js_1 = require("../../hooks/useExitOnCtrlCDWithKeybindings.js");
var ink_js_1 = require("../../ink.js");
var config_js_1 = require("../../services/mcp/config.js");
var MCPConnectionManager_js_1 = require("../../services/mcp/MCPConnectionManager.js");
var utils_js_1 = require("../../services/mcp/utils.js");
var AppState_js_1 = require("../../state/AppState.js");
var errors_js_1 = require("../../utils/errors.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var ConfigurableShortcutHint_js_1 = require("../ConfigurableShortcutHint.js");
var index_js_1 = require("../CustomSelect/index.js");
var Byline_js_1 = require("../design-system/Byline.js");
var KeyboardShortcutHint_js_1 = require("../design-system/KeyboardShortcutHint.js");
var Spinner_js_1 = require("../Spinner.js");
var CapabilitiesSection_js_1 = require("./CapabilitiesSection.js");
var reconnectHelpers_js_1 = require("./utils/reconnectHelpers.js");
function MCPStdioServerMenu(_a) {
    var _this = this;
    var _b, _c, _d;
    var server = _a.server, serverToolsCount = _a.serverToolsCount, onViewTools = _a.onViewTools, onCancel = _a.onCancel, onComplete = _a.onComplete, _e = _a.borderless, borderless = _e === void 0 ? false : _e;
    var theme = (0, ink_js_1.useTheme)()[0];
    var exitState = (0, useExitOnCtrlCDWithKeybindings_js_1.useExitOnCtrlCDWithKeybindings)();
    var mcp = (0, AppState_js_1.useAppState)(function (s) { return s.mcp; });
    var reconnectMcpServer = (0, MCPConnectionManager_js_1.useMcpReconnect)();
    var toggleMcpServer = (0, MCPConnectionManager_js_1.useMcpToggleEnabled)();
    var _f = (0, react_1.useState)(false), isReconnecting = _f[0], setIsReconnecting = _f[1];
    var handleToggleEnabled = react_1.default.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var wasEnabled, err_1, action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wasEnabled = server.client.type !== 'disabled';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, toggleMcpServer(server.name)];
                case 2:
                    _a.sent();
                    // Return to the server list so user can continue managing other servers
                    onCancel();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    action = wasEnabled ? 'disable' : 'enable';
                    onComplete("Failed to ".concat(action, " MCP server '").concat(server.name, "': ").concat((0, errors_js_1.errorMessage)(err_1)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [server.client.type, server.name, toggleMcpServer, onCancel, onComplete]);
    var capitalizedServerName = (0, stringUtils_js_1.capitalize)(String(server.name));
    // Count MCP prompts for this server (skills are shown in /skills, not here)
    var serverCommandsCount = (0, utils_js_1.filterMcpPromptsByServer)(mcp.commands, server.name).length;
    var menuOptions = [];
    // Only show "View tools" if server is not disabled and has tools
    if (server.client.type !== 'disabled' && serverToolsCount > 0) {
        menuOptions.push({
            label: 'View tools',
            value: 'tools'
        });
    }
    // Only show reconnect option if the server is not disabled
    if (server.client.type !== 'disabled') {
        menuOptions.push({
            label: 'Reconnect',
            value: 'reconnectMcpServer'
        });
    }
    menuOptions.push({
        label: server.client.type !== 'disabled' ? 'Disable' : 'Enable',
        value: 'toggle-enabled'
    });
    // If there are no other options, add a back option so Select handles escape
    if (menuOptions.length === 0) {
        menuOptions.push({
            label: 'Back',
            value: 'back'
        });
    }
    if (isReconnecting) {
        return <ink_js_1.Box flexDirection="column" gap={1} padding={1}>
        <ink_js_1.Text color="text">
          Reconnecting to <ink_js_1.Text bold>{server.name}</ink_js_1.Text>
        </ink_js_1.Text>
        <ink_js_1.Box>
          <Spinner_js_1.Spinner />
          <ink_js_1.Text> Restarting MCP server process</ink_js_1.Text>
        </ink_js_1.Box>
        <ink_js_1.Text dimColor>This may take a few moments.</ink_js_1.Text>
      </ink_js_1.Box>;
    }
    return <ink_js_1.Box flexDirection="column">
      <ink_js_1.Box flexDirection="column" paddingX={1} borderStyle={borderless ? undefined : 'round'}>
        <ink_js_1.Box marginBottom={1}>
          <ink_js_1.Text bold>{capitalizedServerName} MCP Server</ink_js_1.Text>
        </ink_js_1.Box>

        <ink_js_1.Box flexDirection="column" gap={0}>
          <ink_js_1.Box>
            <ink_js_1.Text bold>Status: </ink_js_1.Text>
            {server.client.type === 'disabled' ? <ink_js_1.Text>{(0, ink_js_1.color)('inactive', theme)(figures_1.default.radioOff)} disabled</ink_js_1.Text> : server.client.type === 'connected' ? <ink_js_1.Text>{(0, ink_js_1.color)('success', theme)(figures_1.default.tick)} connected</ink_js_1.Text> : server.client.type === 'pending' ? <>
                <ink_js_1.Text dimColor>{figures_1.default.radioOff}</ink_js_1.Text>
                <ink_js_1.Text> connecting…</ink_js_1.Text>
              </> : <ink_js_1.Text>{(0, ink_js_1.color)('error', theme)(figures_1.default.cross)} failed</ink_js_1.Text>}
          </ink_js_1.Box>

          <ink_js_1.Box>
            <ink_js_1.Text bold>Command: </ink_js_1.Text>
            <ink_js_1.Text dimColor>{server.config.command}</ink_js_1.Text>
          </ink_js_1.Box>

          {server.config.args && server.config.args.length > 0 && <ink_js_1.Box>
              <ink_js_1.Text bold>Args: </ink_js_1.Text>
              <ink_js_1.Text dimColor>{server.config.args.join(' ')}</ink_js_1.Text>
            </ink_js_1.Box>}

          <ink_js_1.Box>
            <ink_js_1.Text bold>Config location: </ink_js_1.Text>
            <ink_js_1.Text dimColor>
              {(0, utils_js_1.describeMcpConfigFilePath)((_c = (_b = (0, config_js_1.getMcpConfigByName)(server.name)) === null || _b === void 0 ? void 0 : _b.scope) !== null && _c !== void 0 ? _c : 'dynamic')}
            </ink_js_1.Text>
          </ink_js_1.Box>

          {server.client.type === 'connected' && <CapabilitiesSection_js_1.CapabilitiesSection serverToolsCount={serverToolsCount} serverPromptsCount={serverCommandsCount} serverResourcesCount={((_d = mcp.resources[server.name]) === null || _d === void 0 ? void 0 : _d.length) || 0}/>}

          {server.client.type === 'connected' && serverToolsCount > 0 && <ink_js_1.Box>
              <ink_js_1.Text bold>Tools: </ink_js_1.Text>
              <ink_js_1.Text dimColor>{serverToolsCount} tools</ink_js_1.Text>
            </ink_js_1.Box>}
        </ink_js_1.Box>

        {menuOptions.length > 0 && <ink_js_1.Box marginTop={1}>
            <index_js_1.Select options={menuOptions} onChange={function (value) { return __awaiter(_this, void 0, void 0, function () {
                var result, message, err_0_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(value === 'tools')) return [3 /*break*/, 1];
                            onViewTools();
                            return [3 /*break*/, 10];
                        case 1:
                            if (!(value === 'reconnectMcpServer')) return [3 /*break*/, 7];
                            setIsReconnecting(true);
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, 5, 6]);
                            return [4 /*yield*/, reconnectMcpServer(server.name)];
                        case 3:
                            result = _a.sent();
                            message = (0, reconnectHelpers_js_1.handleReconnectResult)(result, server.name).message;
                            onComplete === null || onComplete === void 0 ? void 0 : onComplete(message);
                            return [3 /*break*/, 6];
                        case 4:
                            err_0_1 = _a.sent();
                            onComplete === null || onComplete === void 0 ? void 0 : onComplete((0, reconnectHelpers_js_1.handleReconnectError)(err_0_1, server.name));
                            return [3 /*break*/, 6];
                        case 5:
                            setIsReconnecting(false);
                            return [7 /*endfinally*/];
                        case 6: return [3 /*break*/, 10];
                        case 7:
                            if (!(value === 'toggle-enabled')) return [3 /*break*/, 9];
                            return [4 /*yield*/, handleToggleEnabled()];
                        case 8:
                            _a.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            if (value === 'back') {
                                onCancel();
                            }
                            _a.label = 10;
                        case 10: return [2 /*return*/];
                    }
                });
            }); }} onCancel={onCancel}/>
          </ink_js_1.Box>}
      </ink_js_1.Box>

      <ink_js_1.Box marginTop={1}>
        <ink_js_1.Text dimColor italic>
          {exitState.pending ? <>Press {exitState.keyName} again to exit</> : <Byline_js_1.Byline>
              <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="↑↓" action="navigate"/>
              <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="select"/>
              <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="back"/>
            </Byline_js_1.Byline>}
        </ink_js_1.Text>
      </ink_js_1.Box>
    </ink_js_1.Box>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VTdGF0ZSIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwidXNlRXhpdE9uQ3RybENEV2l0aEtleWJpbmRpbmdzIiwiQm94IiwiY29sb3IiLCJUZXh0IiwidXNlVGhlbWUiLCJnZXRNY3BDb25maWdCeU5hbWUiLCJ1c2VNY3BSZWNvbm5lY3QiLCJ1c2VNY3BUb2dnbGVFbmFibGVkIiwiZGVzY3JpYmVNY3BDb25maWdGaWxlUGF0aCIsImZpbHRlck1jcFByb21wdHNCeVNlcnZlciIsInVzZUFwcFN0YXRlIiwiZXJyb3JNZXNzYWdlIiwiY2FwaXRhbGl6ZSIsIkNvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCIsIlNlbGVjdCIsIkJ5bGluZSIsIktleWJvYXJkU2hvcnRjdXRIaW50IiwiU3Bpbm5lciIsIkNhcGFiaWxpdGllc1NlY3Rpb24iLCJTdGRpb1NlcnZlckluZm8iLCJoYW5kbGVSZWNvbm5lY3RFcnJvciIsImhhbmRsZVJlY29ubmVjdFJlc3VsdCIsIlByb3BzIiwic2VydmVyIiwic2VydmVyVG9vbHNDb3VudCIsIm9uVmlld1Rvb2xzIiwib25DYW5jZWwiLCJvbkNvbXBsZXRlIiwicmVzdWx0Iiwib3B0aW9ucyIsImRpc3BsYXkiLCJib3JkZXJsZXNzIiwiTUNQU3RkaW9TZXJ2ZXJNZW51IiwiUmVhY3ROb2RlIiwidGhlbWUiLCJleGl0U3RhdGUiLCJtY3AiLCJzIiwicmVjb25uZWN0TWNwU2VydmVyIiwidG9nZ2xlTWNwU2VydmVyIiwiaXNSZWNvbm5lY3RpbmciLCJzZXRJc1JlY29ubmVjdGluZyIsImhhbmRsZVRvZ2dsZUVuYWJsZWQiLCJ1c2VDYWxsYmFjayIsIndhc0VuYWJsZWQiLCJjbGllbnQiLCJ0eXBlIiwibmFtZSIsImVyciIsImFjdGlvbiIsImNhcGl0YWxpemVkU2VydmVyTmFtZSIsIlN0cmluZyIsInNlcnZlckNvbW1hbmRzQ291bnQiLCJjb21tYW5kcyIsImxlbmd0aCIsIm1lbnVPcHRpb25zIiwicHVzaCIsImxhYmVsIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJyYWRpb09mZiIsInRpY2siLCJjcm9zcyIsImNvbmZpZyIsImNvbW1hbmQiLCJhcmdzIiwiam9pbiIsInNjb3BlIiwicmVzb3VyY2VzIiwibWVzc2FnZSIsInBlbmRpbmciLCJrZXlOYW1lIl0sInNvdXJjZXMiOlsiTUNQU3RkaW9TZXJ2ZXJNZW51LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlndXJlcyBmcm9tICdmaWd1cmVzJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENvbW1hbmRSZXN1bHREaXNwbGF5IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyB1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MgfSBmcm9tICcuLi8uLi9ob29rcy91c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MuanMnXG5pbXBvcnQgeyBCb3gsIGNvbG9yLCBUZXh0LCB1c2VUaGVtZSB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IGdldE1jcENvbmZpZ0J5TmFtZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL21jcC9jb25maWcuanMnXG5pbXBvcnQge1xuICB1c2VNY3BSZWNvbm5lY3QsXG4gIHVzZU1jcFRvZ2dsZUVuYWJsZWQsXG59IGZyb20gJy4uLy4uL3NlcnZpY2VzL21jcC9NQ1BDb25uZWN0aW9uTWFuYWdlci5qcydcbmltcG9ydCB7XG4gIGRlc2NyaWJlTWNwQ29uZmlnRmlsZVBhdGgsXG4gIGZpbHRlck1jcFByb21wdHNCeVNlcnZlcixcbn0gZnJvbSAnLi4vLi4vc2VydmljZXMvbWNwL3V0aWxzLmpzJ1xuaW1wb3J0IHsgdXNlQXBwU3RhdGUgfSBmcm9tICcuLi8uLi9zdGF0ZS9BcHBTdGF0ZS5qcydcbmltcG9ydCB7IGVycm9yTWVzc2FnZSB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycy5qcydcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tICcuLi8uLi91dGlscy9zdHJpbmdVdGlscy5qcydcbmltcG9ydCB7IENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCB9IGZyb20gJy4uL0NvbmZpZ3VyYWJsZVNob3J0Y3V0SGludC5qcydcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL0N1c3RvbVNlbGVjdC9pbmRleC5qcydcbmltcG9ydCB7IEJ5bGluZSB9IGZyb20gJy4uL2Rlc2lnbi1zeXN0ZW0vQnlsaW5lLmpzJ1xuaW1wb3J0IHsgS2V5Ym9hcmRTaG9ydGN1dEhpbnQgfSBmcm9tICcuLi9kZXNpZ24tc3lzdGVtL0tleWJvYXJkU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL1NwaW5uZXIuanMnXG5pbXBvcnQgeyBDYXBhYmlsaXRpZXNTZWN0aW9uIH0gZnJvbSAnLi9DYXBhYmlsaXRpZXNTZWN0aW9uLmpzJ1xuaW1wb3J0IHR5cGUgeyBTdGRpb1NlcnZlckluZm8gfSBmcm9tICcuL3R5cGVzLmpzJ1xuaW1wb3J0IHtcbiAgaGFuZGxlUmVjb25uZWN0RXJyb3IsXG4gIGhhbmRsZVJlY29ubmVjdFJlc3VsdCxcbn0gZnJvbSAnLi91dGlscy9yZWNvbm5lY3RIZWxwZXJzLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBzZXJ2ZXI6IFN0ZGlvU2VydmVySW5mb1xuICBzZXJ2ZXJUb29sc0NvdW50OiBudW1iZXJcbiAgb25WaWV3VG9vbHM6ICgpID0+IHZvaWRcbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgb25Db21wbGV0ZTogKFxuICAgIHJlc3VsdD86IHN0cmluZyxcbiAgICBvcHRpb25zPzogeyBkaXNwbGF5PzogQ29tbWFuZFJlc3VsdERpc3BsYXkgfSxcbiAgKSA9PiB2b2lkXG4gIGJvcmRlcmxlc3M/OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNQ1BTdGRpb1NlcnZlck1lbnUoe1xuICBzZXJ2ZXIsXG4gIHNlcnZlclRvb2xzQ291bnQsXG4gIG9uVmlld1Rvb2xzLFxuICBvbkNhbmNlbCxcbiAgb25Db21wbGV0ZSxcbiAgYm9yZGVybGVzcyA9IGZhbHNlLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbdGhlbWVdID0gdXNlVGhlbWUoKVxuICBjb25zdCBleGl0U3RhdGUgPSB1c2VFeGl0T25DdHJsQ0RXaXRoS2V5YmluZGluZ3MoKVxuICBjb25zdCBtY3AgPSB1c2VBcHBTdGF0ZShzID0+IHMubWNwKVxuICBjb25zdCByZWNvbm5lY3RNY3BTZXJ2ZXIgPSB1c2VNY3BSZWNvbm5lY3QoKVxuICBjb25zdCB0b2dnbGVNY3BTZXJ2ZXIgPSB1c2VNY3BUb2dnbGVFbmFibGVkKClcbiAgY29uc3QgW2lzUmVjb25uZWN0aW5nLCBzZXRJc1JlY29ubmVjdGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBoYW5kbGVUb2dnbGVFbmFibGVkID0gUmVhY3QudXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHdhc0VuYWJsZWQgPSBzZXJ2ZXIuY2xpZW50LnR5cGUgIT09ICdkaXNhYmxlZCdcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0b2dnbGVNY3BTZXJ2ZXIoc2VydmVyLm5hbWUpXG4gICAgICAvLyBSZXR1cm4gdG8gdGhlIHNlcnZlciBsaXN0IHNvIHVzZXIgY2FuIGNvbnRpbnVlIG1hbmFnaW5nIG90aGVyIHNlcnZlcnNcbiAgICAgIG9uQ2FuY2VsKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IGFjdGlvbiA9IHdhc0VuYWJsZWQgPyAnZGlzYWJsZScgOiAnZW5hYmxlJ1xuICAgICAgb25Db21wbGV0ZShcbiAgICAgICAgYEZhaWxlZCB0byAke2FjdGlvbn0gTUNQIHNlcnZlciAnJHtzZXJ2ZXIubmFtZX0nOiAke2Vycm9yTWVzc2FnZShlcnIpfWAsXG4gICAgICApXG4gICAgfVxuICB9LCBbc2VydmVyLmNsaWVudC50eXBlLCBzZXJ2ZXIubmFtZSwgdG9nZ2xlTWNwU2VydmVyLCBvbkNhbmNlbCwgb25Db21wbGV0ZV0pXG5cbiAgY29uc3QgY2FwaXRhbGl6ZWRTZXJ2ZXJOYW1lID0gY2FwaXRhbGl6ZShTdHJpbmcoc2VydmVyLm5hbWUpKVxuXG4gIC8vIENvdW50IE1DUCBwcm9tcHRzIGZvciB0aGlzIHNlcnZlciAoc2tpbGxzIGFyZSBzaG93biBpbiAvc2tpbGxzLCBub3QgaGVyZSlcbiAgY29uc3Qgc2VydmVyQ29tbWFuZHNDb3VudCA9IGZpbHRlck1jcFByb21wdHNCeVNlcnZlcihcbiAgICBtY3AuY29tbWFuZHMsXG4gICAgc2VydmVyLm5hbWUsXG4gICkubGVuZ3RoXG5cbiAgY29uc3QgbWVudU9wdGlvbnMgPSBbXVxuXG4gIC8vIE9ubHkgc2hvdyBcIlZpZXcgdG9vbHNcIiBpZiBzZXJ2ZXIgaXMgbm90IGRpc2FibGVkIGFuZCBoYXMgdG9vbHNcbiAgaWYgKHNlcnZlci5jbGllbnQudHlwZSAhPT0gJ2Rpc2FibGVkJyAmJiBzZXJ2ZXJUb29sc0NvdW50ID4gMCkge1xuICAgIG1lbnVPcHRpb25zLnB1c2goe1xuICAgICAgbGFiZWw6ICdWaWV3IHRvb2xzJyxcbiAgICAgIHZhbHVlOiAndG9vbHMnLFxuICAgIH0pXG4gIH1cblxuICAvLyBPbmx5IHNob3cgcmVjb25uZWN0IG9wdGlvbiBpZiB0aGUgc2VydmVyIGlzIG5vdCBkaXNhYmxlZFxuICBpZiAoc2VydmVyLmNsaWVudC50eXBlICE9PSAnZGlzYWJsZWQnKSB7XG4gICAgbWVudU9wdGlvbnMucHVzaCh7XG4gICAgICBsYWJlbDogJ1JlY29ubmVjdCcsXG4gICAgICB2YWx1ZTogJ3JlY29ubmVjdE1jcFNlcnZlcicsXG4gICAgfSlcbiAgfVxuXG4gIG1lbnVPcHRpb25zLnB1c2goe1xuICAgIGxhYmVsOiBzZXJ2ZXIuY2xpZW50LnR5cGUgIT09ICdkaXNhYmxlZCcgPyAnRGlzYWJsZScgOiAnRW5hYmxlJyxcbiAgICB2YWx1ZTogJ3RvZ2dsZS1lbmFibGVkJyxcbiAgfSlcblxuICAvLyBJZiB0aGVyZSBhcmUgbm8gb3RoZXIgb3B0aW9ucywgYWRkIGEgYmFjayBvcHRpb24gc28gU2VsZWN0IGhhbmRsZXMgZXNjYXBlXG4gIGlmIChtZW51T3B0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICBtZW51T3B0aW9ucy5wdXNoKHtcbiAgICAgIGxhYmVsOiAnQmFjaycsXG4gICAgICB2YWx1ZTogJ2JhY2snLFxuICAgIH0pXG4gIH1cblxuICBpZiAoaXNSZWNvbm5lY3RpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfSBwYWRkaW5nPXsxfT5cbiAgICAgICAgPFRleHQgY29sb3I9XCJ0ZXh0XCI+XG4gICAgICAgICAgUmVjb25uZWN0aW5nIHRvIDxUZXh0IGJvbGQ+e3NlcnZlci5uYW1lfTwvVGV4dD5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8Qm94PlxuICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgPFRleHQ+IFJlc3RhcnRpbmcgTUNQIHNlcnZlciBwcm9jZXNzPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICAgPFRleHQgZGltQ29sb3I+VGhpcyBtYXkgdGFrZSBhIGZldyBtb21lbnRzLjwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8Qm94XG4gICAgICAgIGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgICBwYWRkaW5nWD17MX1cbiAgICAgICAgYm9yZGVyU3R5bGU9e2JvcmRlcmxlc3MgPyB1bmRlZmluZWQgOiAncm91bmQnfVxuICAgICAgPlxuICAgICAgICA8Qm94IG1hcmdpbkJvdHRvbT17MX0+XG4gICAgICAgICAgPFRleHQgYm9sZD57Y2FwaXRhbGl6ZWRTZXJ2ZXJOYW1lfSBNQ1AgU2VydmVyPC9UZXh0PlxuICAgICAgICA8L0JveD5cblxuICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezB9PlxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8VGV4dCBib2xkPlN0YXR1czogPC9UZXh0PlxuICAgICAgICAgICAge3NlcnZlci5jbGllbnQudHlwZSA9PT0gJ2Rpc2FibGVkJyA/IChcbiAgICAgICAgICAgICAgPFRleHQ+e2NvbG9yKCdpbmFjdGl2ZScsIHRoZW1lKShmaWd1cmVzLnJhZGlvT2ZmKX0gZGlzYWJsZWQ8L1RleHQ+XG4gICAgICAgICAgICApIDogc2VydmVyLmNsaWVudC50eXBlID09PSAnY29ubmVjdGVkJyA/IChcbiAgICAgICAgICAgICAgPFRleHQ+e2NvbG9yKCdzdWNjZXNzJywgdGhlbWUpKGZpZ3VyZXMudGljayl9IGNvbm5lY3RlZDwvVGV4dD5cbiAgICAgICAgICAgICkgOiBzZXJ2ZXIuY2xpZW50LnR5cGUgPT09ICdwZW5kaW5nJyA/IChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj57ZmlndXJlcy5yYWRpb09mZn08L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQ+IGNvbm5lY3RpbmfigKY8L1RleHQ+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPFRleHQ+e2NvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKX0gZmFpbGVkPC9UZXh0PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8VGV4dCBib2xkPkNvbW1hbmQ6IDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPntzZXJ2ZXIuY29uZmlnLmNvbW1hbmR9PC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuXG4gICAgICAgICAge3NlcnZlci5jb25maWcuYXJncyAmJiBzZXJ2ZXIuY29uZmlnLmFyZ3MubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICA8Qm94PlxuICAgICAgICAgICAgICA8VGV4dCBib2xkPkFyZ3M6IDwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+e3NlcnZlci5jb25maWcuYXJncy5qb2luKCcgJyl9PC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICA8VGV4dCBib2xkPkNvbmZpZyBsb2NhdGlvbjogPC9UZXh0PlxuICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgICAgIHtkZXNjcmliZU1jcENvbmZpZ0ZpbGVQYXRoKFxuICAgICAgICAgICAgICAgIGdldE1jcENvbmZpZ0J5TmFtZShzZXJ2ZXIubmFtZSk/LnNjb3BlID8/ICdkeW5hbWljJyxcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8L0JveD5cblxuICAgICAgICAgIHtzZXJ2ZXIuY2xpZW50LnR5cGUgPT09ICdjb25uZWN0ZWQnICYmIChcbiAgICAgICAgICAgIDxDYXBhYmlsaXRpZXNTZWN0aW9uXG4gICAgICAgICAgICAgIHNlcnZlclRvb2xzQ291bnQ9e3NlcnZlclRvb2xzQ291bnR9XG4gICAgICAgICAgICAgIHNlcnZlclByb21wdHNDb3VudD17c2VydmVyQ29tbWFuZHNDb3VudH1cbiAgICAgICAgICAgICAgc2VydmVyUmVzb3VyY2VzQ291bnQ9e21jcC5yZXNvdXJjZXNbc2VydmVyLm5hbWVdPy5sZW5ndGggfHwgMH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHtzZXJ2ZXIuY2xpZW50LnR5cGUgPT09ICdjb25uZWN0ZWQnICYmIHNlcnZlclRvb2xzQ291bnQgPiAwICYmIChcbiAgICAgICAgICAgIDxCb3g+XG4gICAgICAgICAgICAgIDxUZXh0IGJvbGQ+VG9vbHM6IDwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+e3NlcnZlclRvb2xzQ291bnR9IHRvb2xzPC9UZXh0PlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAge21lbnVPcHRpb25zLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICAgIDxTZWxlY3RcbiAgICAgICAgICAgICAgb3B0aW9ucz17bWVudU9wdGlvbnN9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXthc3luYyB2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSAndG9vbHMnKSB7XG4gICAgICAgICAgICAgICAgICBvblZpZXdUb29scygpXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJ3JlY29ubmVjdE1jcFNlcnZlcicpIHtcbiAgICAgICAgICAgICAgICAgIHNldElzUmVjb25uZWN0aW5nKHRydWUpXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZWNvbm5lY3RNY3BTZXJ2ZXIoc2VydmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gaGFuZGxlUmVjb25uZWN0UmVzdWx0KFxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCxcbiAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXIubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlPy4obWVzc2FnZSlcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlPy4oaGFuZGxlUmVjb25uZWN0RXJyb3IoZXJyLCBzZXJ2ZXIubmFtZSkpXG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBzZXRJc1JlY29ubmVjdGluZyhmYWxzZSlcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAndG9nZ2xlLWVuYWJsZWQnKSB7XG4gICAgICAgICAgICAgICAgICBhd2FpdCBoYW5kbGVUb2dnbGVFbmFibGVkKClcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSAnYmFjaycpIHtcbiAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICA8L0JveD5cblxuICAgICAgPEJveCBtYXJnaW5Ub3A9ezF9PlxuICAgICAgICA8VGV4dCBkaW1Db2xvciBpdGFsaWM+XG4gICAgICAgICAge2V4aXRTdGF0ZS5wZW5kaW5nID8gKFxuICAgICAgICAgICAgPD5QcmVzcyB7ZXhpdFN0YXRlLmtleU5hbWV9IGFnYWluIHRvIGV4aXQ8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPEJ5bGluZT5cbiAgICAgICAgICAgICAgPEtleWJvYXJkU2hvcnRjdXRIaW50IHNob3J0Y3V0PVwi4oaR4oaTXCIgYWN0aW9uPVwibmF2aWdhdGVcIiAvPlxuICAgICAgICAgICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9XCJFbnRlclwiIGFjdGlvbj1cInNlbGVjdFwiIC8+XG4gICAgICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgICAgICAgICBjb250ZXh0PVwiQ29uZmlybWF0aW9uXCJcbiAgICAgICAgICAgICAgICBmYWxsYmFjaz1cIkVzY1wiXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb249XCJiYWNrXCJcbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQnlsaW5lPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLE9BQU9BLE9BQU8sTUFBTSxTQUFTO0FBQzdCLE9BQU9DLEtBQUssSUFBSUMsUUFBUSxRQUFRLE9BQU87QUFDdkMsY0FBY0Msb0JBQW9CLFFBQVEsbUJBQW1CO0FBQzdELFNBQVNDLDhCQUE4QixRQUFRLCtDQUErQztBQUM5RixTQUFTQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxRQUFRLFFBQVEsY0FBYztBQUN6RCxTQUFTQyxrQkFBa0IsUUFBUSw4QkFBOEI7QUFDakUsU0FDRUMsZUFBZSxFQUNmQyxtQkFBbUIsUUFDZCw0Q0FBNEM7QUFDbkQsU0FDRUMseUJBQXlCLEVBQ3pCQyx3QkFBd0IsUUFDbkIsNkJBQTZCO0FBQ3BDLFNBQVNDLFdBQVcsUUFBUSx5QkFBeUI7QUFDckQsU0FBU0MsWUFBWSxRQUFRLHVCQUF1QjtBQUNwRCxTQUFTQyxVQUFVLFFBQVEsNEJBQTRCO0FBQ3ZELFNBQVNDLHdCQUF3QixRQUFRLGdDQUFnQztBQUN6RSxTQUFTQyxNQUFNLFFBQVEsMEJBQTBCO0FBQ2pELFNBQVNDLE1BQU0sUUFBUSw0QkFBNEI7QUFDbkQsU0FBU0Msb0JBQW9CLFFBQVEsMENBQTBDO0FBQy9FLFNBQVNDLE9BQU8sUUFBUSxlQUFlO0FBQ3ZDLFNBQVNDLG1CQUFtQixRQUFRLDBCQUEwQjtBQUM5RCxjQUFjQyxlQUFlLFFBQVEsWUFBWTtBQUNqRCxTQUNFQyxvQkFBb0IsRUFDcEJDLHFCQUFxQixRQUNoQiw2QkFBNkI7QUFFcEMsS0FBS0MsS0FBSyxHQUFHO0VBQ1hDLE1BQU0sRUFBRUosZUFBZTtFQUN2QkssZ0JBQWdCLEVBQUUsTUFBTTtFQUN4QkMsV0FBVyxFQUFFLEdBQUcsR0FBRyxJQUFJO0VBQ3ZCQyxRQUFRLEVBQUUsR0FBRyxHQUFHLElBQUk7RUFDcEJDLFVBQVUsRUFBRSxDQUNWQyxNQUFlLENBQVIsRUFBRSxNQUFNLEVBQ2ZDLE9BQTRDLENBQXBDLEVBQUU7SUFBRUMsT0FBTyxDQUFDLEVBQUUvQixvQkFBb0I7RUFBQyxDQUFDLEVBQzVDLEdBQUcsSUFBSTtFQUNUZ0MsVUFBVSxDQUFDLEVBQUUsT0FBTztBQUN0QixDQUFDO0FBRUQsT0FBTyxTQUFTQyxrQkFBa0JBLENBQUM7RUFDakNULE1BQU07RUFDTkMsZ0JBQWdCO0VBQ2hCQyxXQUFXO0VBQ1hDLFFBQVE7RUFDUkMsVUFBVTtFQUNWSSxVQUFVLEdBQUc7QUFDUixDQUFOLEVBQUVULEtBQUssQ0FBQyxFQUFFekIsS0FBSyxDQUFDb0MsU0FBUyxDQUFDO0VBQ3pCLE1BQU0sQ0FBQ0MsS0FBSyxDQUFDLEdBQUc5QixRQUFRLENBQUMsQ0FBQztFQUMxQixNQUFNK0IsU0FBUyxHQUFHbkMsOEJBQThCLENBQUMsQ0FBQztFQUNsRCxNQUFNb0MsR0FBRyxHQUFHMUIsV0FBVyxDQUFDMkIsQ0FBQyxJQUFJQSxDQUFDLENBQUNELEdBQUcsQ0FBQztFQUNuQyxNQUFNRSxrQkFBa0IsR0FBR2hDLGVBQWUsQ0FBQyxDQUFDO0VBQzVDLE1BQU1pQyxlQUFlLEdBQUdoQyxtQkFBbUIsQ0FBQyxDQUFDO0VBQzdDLE1BQU0sQ0FBQ2lDLGNBQWMsRUFBRUMsaUJBQWlCLENBQUMsR0FBRzNDLFFBQVEsQ0FBQyxLQUFLLENBQUM7RUFFM0QsTUFBTTRDLG1CQUFtQixHQUFHN0MsS0FBSyxDQUFDOEMsV0FBVyxDQUFDLFlBQVk7SUFDeEQsTUFBTUMsVUFBVSxHQUFHckIsTUFBTSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLEtBQUssVUFBVTtJQUVwRCxJQUFJO01BQ0YsTUFBTVAsZUFBZSxDQUFDaEIsTUFBTSxDQUFDd0IsSUFBSSxDQUFDO01BQ2xDO01BQ0FyQixRQUFRLENBQUMsQ0FBQztJQUNaLENBQUMsQ0FBQyxPQUFPc0IsR0FBRyxFQUFFO01BQ1osTUFBTUMsTUFBTSxHQUFHTCxVQUFVLEdBQUcsU0FBUyxHQUFHLFFBQVE7TUFDaERqQixVQUFVLENBQ1IsYUFBYXNCLE1BQU0sZ0JBQWdCMUIsTUFBTSxDQUFDd0IsSUFBSSxNQUFNcEMsWUFBWSxDQUFDcUMsR0FBRyxDQUFDLEVBQ3ZFLENBQUM7SUFDSDtFQUNGLENBQUMsRUFBRSxDQUFDekIsTUFBTSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLEVBQUV2QixNQUFNLENBQUN3QixJQUFJLEVBQUVSLGVBQWUsRUFBRWIsUUFBUSxFQUFFQyxVQUFVLENBQUMsQ0FBQztFQUU1RSxNQUFNdUIscUJBQXFCLEdBQUd0QyxVQUFVLENBQUN1QyxNQUFNLENBQUM1QixNQUFNLENBQUN3QixJQUFJLENBQUMsQ0FBQzs7RUFFN0Q7RUFDQSxNQUFNSyxtQkFBbUIsR0FBRzNDLHdCQUF3QixDQUNsRDJCLEdBQUcsQ0FBQ2lCLFFBQVEsRUFDWjlCLE1BQU0sQ0FBQ3dCLElBQ1QsQ0FBQyxDQUFDTyxNQUFNO0VBRVIsTUFBTUMsV0FBVyxHQUFHLEVBQUU7O0VBRXRCO0VBQ0EsSUFBSWhDLE1BQU0sQ0FBQ3NCLE1BQU0sQ0FBQ0MsSUFBSSxLQUFLLFVBQVUsSUFBSXRCLGdCQUFnQixHQUFHLENBQUMsRUFBRTtJQUM3RCtCLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDO01BQ2ZDLEtBQUssRUFBRSxZQUFZO01BQ25CQyxLQUFLLEVBQUU7SUFDVCxDQUFDLENBQUM7RUFDSjs7RUFFQTtFQUNBLElBQUluQyxNQUFNLENBQUNzQixNQUFNLENBQUNDLElBQUksS0FBSyxVQUFVLEVBQUU7SUFDckNTLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDO01BQ2ZDLEtBQUssRUFBRSxXQUFXO01BQ2xCQyxLQUFLLEVBQUU7SUFDVCxDQUFDLENBQUM7RUFDSjtFQUVBSCxXQUFXLENBQUNDLElBQUksQ0FBQztJQUNmQyxLQUFLLEVBQUVsQyxNQUFNLENBQUNzQixNQUFNLENBQUNDLElBQUksS0FBSyxVQUFVLEdBQUcsU0FBUyxHQUFHLFFBQVE7SUFDL0RZLEtBQUssRUFBRTtFQUNULENBQUMsQ0FBQzs7RUFFRjtFQUNBLElBQUlILFdBQVcsQ0FBQ0QsTUFBTSxLQUFLLENBQUMsRUFBRTtJQUM1QkMsV0FBVyxDQUFDQyxJQUFJLENBQUM7TUFDZkMsS0FBSyxFQUFFLE1BQU07TUFDYkMsS0FBSyxFQUFFO0lBQ1QsQ0FBQyxDQUFDO0VBQ0o7RUFFQSxJQUFJbEIsY0FBYyxFQUFFO0lBQ2xCLE9BQ0UsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUMxQiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUNqQixNQUFNLENBQUN3QixJQUFJLENBQUMsRUFBRSxJQUFJO0FBQ3hELFFBQVEsRUFBRSxJQUFJO0FBQ2QsUUFBUSxDQUFDLEdBQUc7QUFDWixVQUFVLENBQUMsT0FBTztBQUNsQixVQUFVLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLElBQUk7QUFDcEQsUUFBUSxFQUFFLEdBQUc7QUFDYixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxJQUFJO0FBQ3pELE1BQU0sRUFBRSxHQUFHLENBQUM7RUFFVjtFQUVBLE9BQ0UsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVE7QUFDL0IsTUFBTSxDQUFDLEdBQUcsQ0FDRixhQUFhLENBQUMsUUFBUSxDQUN0QixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDWixXQUFXLENBQUMsQ0FBQ2hCLFVBQVUsR0FBRzRCLFNBQVMsR0FBRyxPQUFPLENBQUM7QUFFdEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0IsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQ1QscUJBQXFCLENBQUMsV0FBVyxFQUFFLElBQUk7QUFDN0QsUUFBUSxFQUFFLEdBQUc7QUFDYjtBQUNBLFFBQVEsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0MsVUFBVSxDQUFDLEdBQUc7QUFDZCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSTtBQUNyQyxZQUFZLENBQUMzQixNQUFNLENBQUNzQixNQUFNLENBQUNDLElBQUksS0FBSyxVQUFVLEdBQ2hDLENBQUMsSUFBSSxDQUFDLENBQUM1QyxLQUFLLENBQUMsVUFBVSxFQUFFZ0MsS0FBSyxDQUFDLENBQUN0QyxPQUFPLENBQUNnRSxRQUFRLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQ2hFckMsTUFBTSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLEtBQUssV0FBVyxHQUNwQyxDQUFDLElBQUksQ0FBQyxDQUFDNUMsS0FBSyxDQUFDLFNBQVMsRUFBRWdDLEtBQUssQ0FBQyxDQUFDdEMsT0FBTyxDQUFDaUUsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUM1RHRDLE1BQU0sQ0FBQ3NCLE1BQU0sQ0FBQ0MsSUFBSSxLQUFLLFNBQVMsR0FDbEM7QUFDZCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUNsRCxPQUFPLENBQUNnRSxRQUFRLENBQUMsRUFBRSxJQUFJO0FBQ3ZELGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSTtBQUN4QyxjQUFjLEdBQUcsR0FFSCxDQUFDLElBQUksQ0FBQyxDQUFDMUQsS0FBSyxDQUFDLE9BQU8sRUFBRWdDLEtBQUssQ0FBQyxDQUFDdEMsT0FBTyxDQUFDa0UsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FDMUQ7QUFDYixVQUFVLEVBQUUsR0FBRztBQUNmO0FBQ0EsVUFBVSxDQUFDLEdBQUc7QUFDZCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSTtBQUN0QyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDdkMsTUFBTSxDQUFDd0MsTUFBTSxDQUFDQyxPQUFPLENBQUMsRUFBRSxJQUFJO0FBQ3hELFVBQVUsRUFBRSxHQUFHO0FBQ2Y7QUFDQSxVQUFVLENBQUN6QyxNQUFNLENBQUN3QyxNQUFNLENBQUNFLElBQUksSUFBSTFDLE1BQU0sQ0FBQ3dDLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDWCxNQUFNLEdBQUcsQ0FBQyxJQUNsRCxDQUFDLEdBQUc7QUFDaEIsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUk7QUFDckMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQy9CLE1BQU0sQ0FBQ3dDLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJO0FBQ2pFLFlBQVksRUFBRSxHQUFHLENBQ047QUFDWDtBQUNBLFVBQVUsQ0FBQyxHQUFHO0FBQ2QsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSTtBQUM5QyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVE7QUFDMUIsY0FBYyxDQUFDMUQseUJBQXlCLENBQ3hCSCxrQkFBa0IsQ0FBQ2tCLE1BQU0sQ0FBQ3dCLElBQUksQ0FBQyxFQUFFb0IsS0FBSyxJQUFJLFNBQzVDLENBQUM7QUFDZixZQUFZLEVBQUUsSUFBSTtBQUNsQixVQUFVLEVBQUUsR0FBRztBQUNmO0FBQ0EsVUFBVSxDQUFDNUMsTUFBTSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLEtBQUssV0FBVyxJQUNqQyxDQUFDLG1CQUFtQixDQUNsQixnQkFBZ0IsQ0FBQyxDQUFDdEIsZ0JBQWdCLENBQUMsQ0FDbkMsa0JBQWtCLENBQUMsQ0FBQzRCLG1CQUFtQixDQUFDLENBQ3hDLG9CQUFvQixDQUFDLENBQUNoQixHQUFHLENBQUNnQyxTQUFTLENBQUM3QyxNQUFNLENBQUN3QixJQUFJLENBQUMsRUFBRU8sTUFBTSxJQUFJLENBQUMsQ0FBQyxHQUVqRTtBQUNYO0FBQ0EsVUFBVSxDQUFDL0IsTUFBTSxDQUFDc0IsTUFBTSxDQUFDQyxJQUFJLEtBQUssV0FBVyxJQUFJdEIsZ0JBQWdCLEdBQUcsQ0FBQyxJQUN6RCxDQUFDLEdBQUc7QUFDaEIsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUk7QUFDdEMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQ0EsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUk7QUFDM0QsWUFBWSxFQUFFLEdBQUcsQ0FDTjtBQUNYLFFBQVEsRUFBRSxHQUFHO0FBQ2I7QUFDQSxRQUFRLENBQUMrQixXQUFXLENBQUNELE1BQU0sR0FBRyxDQUFDLElBQ3JCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixZQUFZLENBQUMsTUFBTSxDQUNMLE9BQU8sQ0FBQyxDQUFDQyxXQUFXLENBQUMsQ0FDckIsUUFBUSxDQUFDLENBQUMsTUFBTUcsS0FBSyxJQUFJO1VBQ3ZCLElBQUlBLEtBQUssS0FBSyxPQUFPLEVBQUU7WUFDckJqQyxXQUFXLENBQUMsQ0FBQztVQUNmLENBQUMsTUFBTSxJQUFJaUMsS0FBSyxLQUFLLG9CQUFvQixFQUFFO1lBQ3pDakIsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLElBQUk7Y0FDRixNQUFNYixNQUFNLEdBQUcsTUFBTVUsa0JBQWtCLENBQUNmLE1BQU0sQ0FBQ3dCLElBQUksQ0FBQztjQUNwRCxNQUFNO2dCQUFFc0I7Y0FBUSxDQUFDLEdBQUdoRCxxQkFBcUIsQ0FDdkNPLE1BQU0sRUFDTkwsTUFBTSxDQUFDd0IsSUFDVCxDQUFDO2NBQ0RwQixVQUFVLEdBQUcwQyxPQUFPLENBQUM7WUFDdkIsQ0FBQyxDQUFDLE9BQU9yQixLQUFHLEVBQUU7Y0FDWnJCLFVBQVUsR0FBR1Asb0JBQW9CLENBQUM0QixLQUFHLEVBQUV6QixNQUFNLENBQUN3QixJQUFJLENBQUMsQ0FBQztZQUN0RCxDQUFDLFNBQVM7Y0FDUk4saUJBQWlCLENBQUMsS0FBSyxDQUFDO1lBQzFCO1VBQ0YsQ0FBQyxNQUFNLElBQUlpQixLQUFLLEtBQUssZ0JBQWdCLEVBQUU7WUFDckMsTUFBTWhCLG1CQUFtQixDQUFDLENBQUM7VUFDN0IsQ0FBQyxNQUFNLElBQUlnQixLQUFLLEtBQUssTUFBTSxFQUFFO1lBQzNCaEMsUUFBUSxDQUFDLENBQUM7VUFDWjtRQUNGLENBQUMsQ0FBQyxDQUNGLFFBQVEsQ0FBQyxDQUFDQSxRQUFRLENBQUM7QUFFakMsVUFBVSxFQUFFLEdBQUcsQ0FDTjtBQUNULE1BQU0sRUFBRSxHQUFHO0FBQ1g7QUFDQSxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO0FBQzdCLFVBQVUsQ0FBQ1MsU0FBUyxDQUFDbUMsT0FBTyxHQUNoQixFQUFFLE1BQU0sQ0FBQ25DLFNBQVMsQ0FBQ29DLE9BQU8sQ0FBQyxjQUFjLEdBQUcsR0FFNUMsQ0FBQyxNQUFNO0FBQ25CLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ25FLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRO0FBQ3BFLGNBQWMsQ0FBQyx3QkFBd0IsQ0FDdkIsTUFBTSxDQUFDLFlBQVksQ0FDbkIsT0FBTyxDQUFDLGNBQWMsQ0FDdEIsUUFBUSxDQUFDLEtBQUssQ0FDZCxXQUFXLENBQUMsTUFBTTtBQUVsQyxZQUFZLEVBQUUsTUFBTSxDQUNUO0FBQ1gsUUFBUSxFQUFFLElBQUk7QUFDZCxNQUFNLEVBQUUsR0FBRztBQUNYLElBQUksRUFBRSxHQUFHLENBQUM7QUFFViIsImlnbm9yZUxpc3QiOltdfQ==
