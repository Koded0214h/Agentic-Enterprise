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
exports.MCPAgentServerMenu = MCPAgentServerMenu;
var figures_1 = require("figures");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var useKeybinding_js_1 = require("../../keybindings/useKeybinding.js");
var auth_js_1 = require("../../services/mcp/auth.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
var ConfigurableShortcutHint_js_1 = require("../ConfigurableShortcutHint.js");
var index_js_1 = require("../CustomSelect/index.js");
var Byline_js_1 = require("../design-system/Byline.js");
var Dialog_js_1 = require("../design-system/Dialog.js");
var KeyboardShortcutHint_js_1 = require("../design-system/KeyboardShortcutHint.js");
var Spinner_js_1 = require("../Spinner.js");
/**
 * Menu for agent-specific MCP servers.
 * These servers are defined in agent frontmatter and only connect when the agent runs.
 * For HTTP/SSE servers, this allows pre-authentication before using the agent.
 */
function MCPAgentServerMenu(_a) {
    var _this = this;
    var agentServer = _a.agentServer, onCancel = _a.onCancel, onComplete = _a.onComplete;
    var theme = (0, ink_js_1.useTheme)()[0];
    var _b = (0, react_1.useState)(false), isAuthenticating = _b[0], setIsAuthenticating = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(null), authorizationUrl = _d[0], setAuthorizationUrl = _d[1];
    var authAbortControllerRef = (0, react_1.useRef)(null);
    // Abort OAuth flow on unmount so the callback server is closed even if a
    // parent component's Esc handler navigates away before ours fires.
    (0, react_1.useEffect)(function () { return function () { var _a; return (_a = authAbortControllerRef.current) === null || _a === void 0 ? void 0 : _a.abort(); }; }, []);
    // Handle ESC to cancel authentication flow
    var handleEscCancel = (0, react_1.useCallback)(function () {
        var _a;
        if (isAuthenticating) {
            (_a = authAbortControllerRef.current) === null || _a === void 0 ? void 0 : _a.abort();
            authAbortControllerRef.current = null;
            setIsAuthenticating(false);
            setAuthorizationUrl(null);
        }
    }, [isAuthenticating]);
    (0, useKeybinding_js_1.useKeybinding)('confirm:no', handleEscCancel, {
        context: 'Confirmation',
        isActive: isAuthenticating
    });
    var handleAuthenticate = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var controller, tempConfig, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!agentServer.needsAuth || !agentServer.url) {
                        return [2 /*return*/];
                    }
                    setIsAuthenticating(true);
                    setError(null);
                    controller = new AbortController();
                    authAbortControllerRef.current = controller;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    tempConfig = {
                        type: agentServer.transport,
                        url: agentServer.url
                    };
                    return [4 /*yield*/, (0, auth_js_1.performMCPOAuthFlow)(agentServer.name, tempConfig, setAuthorizationUrl, controller.signal)];
                case 2:
                    _a.sent();
                    onComplete === null || onComplete === void 0 ? void 0 : onComplete("Authentication successful for ".concat(agentServer.name, ". The server will connect when the agent runs."));
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    // Don't show error if it was a cancellation
                    if (err_1 instanceof Error && !(err_1 instanceof auth_js_1.AuthenticationCancelledError)) {
                        setError(err_1.message);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    setIsAuthenticating(false);
                    authAbortControllerRef.current = null;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [agentServer, onComplete]);
    var capitalizedServerName = (0, stringUtils_js_1.capitalize)(String(agentServer.name));
    if (isAuthenticating) {
        return <ink_js_1.Box flexDirection="column" gap={1} padding={1}>
        <ink_js_1.Text color="claude">Authenticating with {agentServer.name}…</ink_js_1.Text>
        <ink_js_1.Box>
          <Spinner_js_1.Spinner />
          <ink_js_1.Text> A browser window will open for authentication</ink_js_1.Text>
        </ink_js_1.Box>
        {authorizationUrl && <ink_js_1.Box flexDirection="column">
            <ink_js_1.Text dimColor>
              If your browser doesn&apos;t open automatically, copy this URL
              manually:
            </ink_js_1.Text>
            <ink_js_1.Link url={authorizationUrl}/>
          </ink_js_1.Box>}
        <ink_js_1.Box marginLeft={3}>
          <ink_js_1.Text dimColor>
            Return here after authenticating in your browser.{' '}
            <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="go back"/>
          </ink_js_1.Text>
        </ink_js_1.Box>
      </ink_js_1.Box>;
    }
    var menuOptions = [];
    // Only show authenticate option for HTTP/SSE servers
    if (agentServer.needsAuth) {
        menuOptions.push({
            label: agentServer.isAuthenticated ? 'Re-authenticate' : 'Authenticate',
            value: 'auth'
        });
    }
    menuOptions.push({
        label: 'Back',
        value: 'back'
    });
    return <Dialog_js_1.Dialog title={"".concat(capitalizedServerName, " MCP Server")} subtitle="agent-only" onCancel={onCancel} inputGuide={function (exitState) { return exitState.pending ? <ink_js_1.Text>Press {exitState.keyName} again to exit</ink_js_1.Text> : <Byline_js_1.Byline>
            <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="↑↓" action="navigate"/>
            <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="confirm"/>
            <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="go back"/>
          </Byline_js_1.Byline>; }}>
      <ink_js_1.Box flexDirection="column" gap={0}>
        <ink_js_1.Box>
          <ink_js_1.Text bold>Type: </ink_js_1.Text>
          <ink_js_1.Text dimColor>{agentServer.transport}</ink_js_1.Text>
        </ink_js_1.Box>

        {agentServer.url && <ink_js_1.Box>
            <ink_js_1.Text bold>URL: </ink_js_1.Text>
            <ink_js_1.Text dimColor>{agentServer.url}</ink_js_1.Text>
          </ink_js_1.Box>}

        {agentServer.command && <ink_js_1.Box>
            <ink_js_1.Text bold>Command: </ink_js_1.Text>
            <ink_js_1.Text dimColor>{agentServer.command}</ink_js_1.Text>
          </ink_js_1.Box>}

        <ink_js_1.Box>
          <ink_js_1.Text bold>Used by: </ink_js_1.Text>
          <ink_js_1.Text dimColor>{agentServer.sourceAgents.join(', ')}</ink_js_1.Text>
        </ink_js_1.Box>

        <ink_js_1.Box marginTop={1}>
          <ink_js_1.Text bold>Status: </ink_js_1.Text>
          <ink_js_1.Text>
            {(0, ink_js_1.color)('inactive', theme)(figures_1.default.radioOff)} not connected
            (agent-only)
          </ink_js_1.Text>
        </ink_js_1.Box>

        {agentServer.needsAuth && <ink_js_1.Box>
            <ink_js_1.Text bold>Auth: </ink_js_1.Text>
            {agentServer.isAuthenticated ? <ink_js_1.Text>{(0, ink_js_1.color)('success', theme)(figures_1.default.tick)} authenticated</ink_js_1.Text> : <ink_js_1.Text>
                {(0, ink_js_1.color)('warning', theme)(figures_1.default.triangleUpOutline)} may need
                authentication
              </ink_js_1.Text>}
          </ink_js_1.Box>}
      </ink_js_1.Box>

      <ink_js_1.Box>
        <ink_js_1.Text dimColor>This server connects only when running the agent.</ink_js_1.Text>
      </ink_js_1.Box>

      {error && <ink_js_1.Box>
          <ink_js_1.Text color="error">Error: {error}</ink_js_1.Text>
        </ink_js_1.Box>}

      <ink_js_1.Box>
        <index_js_1.Select options={menuOptions} onChange={function (value) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = value;
                        switch (_a) {
                            case 'auth': return [3 /*break*/, 1];
                            case 'back': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 4];
                    case 1: return [4 /*yield*/, handleAuthenticate()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        onCancel();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }} onCancel={onCancel}/>
      </ink_js_1.Box>
    </Dialog_js_1.Dialog>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VDYWxsYmFjayIsInVzZUVmZmVjdCIsInVzZVJlZiIsInVzZVN0YXRlIiwiQ29tbWFuZFJlc3VsdERpc3BsYXkiLCJCb3giLCJjb2xvciIsIkxpbmsiLCJUZXh0IiwidXNlVGhlbWUiLCJ1c2VLZXliaW5kaW5nIiwiQXV0aGVudGljYXRpb25DYW5jZWxsZWRFcnJvciIsInBlcmZvcm1NQ1BPQXV0aEZsb3ciLCJjYXBpdGFsaXplIiwiQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50IiwiU2VsZWN0IiwiQnlsaW5lIiwiRGlhbG9nIiwiS2V5Ym9hcmRTaG9ydGN1dEhpbnQiLCJTcGlubmVyIiwiQWdlbnRNY3BTZXJ2ZXJJbmZvIiwiUHJvcHMiLCJhZ2VudFNlcnZlciIsIm9uQ2FuY2VsIiwib25Db21wbGV0ZSIsInJlc3VsdCIsIm9wdGlvbnMiLCJkaXNwbGF5IiwiTUNQQWdlbnRTZXJ2ZXJNZW51IiwiUmVhY3ROb2RlIiwidGhlbWUiLCJpc0F1dGhlbnRpY2F0aW5nIiwic2V0SXNBdXRoZW50aWNhdGluZyIsImVycm9yIiwic2V0RXJyb3IiLCJhdXRob3JpemF0aW9uVXJsIiwic2V0QXV0aG9yaXphdGlvblVybCIsImF1dGhBYm9ydENvbnRyb2xsZXJSZWYiLCJBYm9ydENvbnRyb2xsZXIiLCJjdXJyZW50IiwiYWJvcnQiLCJoYW5kbGVFc2NDYW5jZWwiLCJjb250ZXh0IiwiaXNBY3RpdmUiLCJoYW5kbGVBdXRoZW50aWNhdGUiLCJuZWVkc0F1dGgiLCJ1cmwiLCJjb250cm9sbGVyIiwidGVtcENvbmZpZyIsInR5cGUiLCJ0cmFuc3BvcnQiLCJuYW1lIiwic2lnbmFsIiwiZXJyIiwiRXJyb3IiLCJtZXNzYWdlIiwiY2FwaXRhbGl6ZWRTZXJ2ZXJOYW1lIiwiU3RyaW5nIiwibWVudU9wdGlvbnMiLCJwdXNoIiwibGFiZWwiLCJpc0F1dGhlbnRpY2F0ZWQiLCJ2YWx1ZSIsImV4aXRTdGF0ZSIsInBlbmRpbmciLCJrZXlOYW1lIiwiY29tbWFuZCIsInNvdXJjZUFnZW50cyIsImpvaW4iLCJyYWRpb09mZiIsInRpY2siLCJ0cmlhbmdsZVVwT3V0bGluZSJdLCJzb3VyY2VzIjpbIk1DUEFnZW50U2VydmVyTWVudS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpZ3VyZXMgZnJvbSAnZmlndXJlcydcbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjaywgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IENvbW1hbmRSZXN1bHREaXNwbGF5IH0gZnJvbSAnLi4vLi4vY29tbWFuZHMuanMnXG5pbXBvcnQgeyBCb3gsIGNvbG9yLCBMaW5rLCBUZXh0LCB1c2VUaGVtZSB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IHVzZUtleWJpbmRpbmcgfSBmcm9tICcuLi8uLi9rZXliaW5kaW5ncy91c2VLZXliaW5kaW5nLmpzJ1xuaW1wb3J0IHtcbiAgQXV0aGVudGljYXRpb25DYW5jZWxsZWRFcnJvcixcbiAgcGVyZm9ybU1DUE9BdXRoRmxvdyxcbn0gZnJvbSAnLi4vLi4vc2VydmljZXMvbWNwL2F1dGguanMnXG5pbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSAnLi4vLi4vdXRpbHMvc3RyaW5nVXRpbHMuanMnXG5pbXBvcnQgeyBDb25maWd1cmFibGVTaG9ydGN1dEhpbnQgfSBmcm9tICcuLi9Db25maWd1cmFibGVTaG9ydGN1dEhpbnQuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi9DdXN0b21TZWxlY3QvaW5kZXguanMnXG5pbXBvcnQgeyBCeWxpbmUgfSBmcm9tICcuLi9kZXNpZ24tc3lzdGVtL0J5bGluZS5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4uL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgS2V5Ym9hcmRTaG9ydGN1dEhpbnQgfSBmcm9tICcuLi9kZXNpZ24tc3lzdGVtL0tleWJvYXJkU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL1NwaW5uZXIuanMnXG5pbXBvcnQgdHlwZSB7IEFnZW50TWNwU2VydmVySW5mbyB9IGZyb20gJy4vdHlwZXMuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIGFnZW50U2VydmVyOiBBZ2VudE1jcFNlcnZlckluZm9cbiAgb25DYW5jZWw6ICgpID0+IHZvaWRcbiAgb25Db21wbGV0ZT86IChcbiAgICByZXN1bHQ/OiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHsgZGlzcGxheT86IENvbW1hbmRSZXN1bHREaXNwbGF5IH0sXG4gICkgPT4gdm9pZFxufVxuXG4vKipcbiAqIE1lbnUgZm9yIGFnZW50LXNwZWNpZmljIE1DUCBzZXJ2ZXJzLlxuICogVGhlc2Ugc2VydmVycyBhcmUgZGVmaW5lZCBpbiBhZ2VudCBmcm9udG1hdHRlciBhbmQgb25seSBjb25uZWN0IHdoZW4gdGhlIGFnZW50IHJ1bnMuXG4gKiBGb3IgSFRUUC9TU0Ugc2VydmVycywgdGhpcyBhbGxvd3MgcHJlLWF1dGhlbnRpY2F0aW9uIGJlZm9yZSB1c2luZyB0aGUgYWdlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBNQ1BBZ2VudFNlcnZlck1lbnUoe1xuICBhZ2VudFNlcnZlcixcbiAgb25DYW5jZWwsXG4gIG9uQ29tcGxldGUsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IFt0aGVtZV0gPSB1c2VUaGVtZSgpXG4gIGNvbnN0IFtpc0F1dGhlbnRpY2F0aW5nLCBzZXRJc0F1dGhlbnRpY2F0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFthdXRob3JpemF0aW9uVXJsLCBzZXRBdXRob3JpemF0aW9uVXJsXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGF1dGhBYm9ydENvbnRyb2xsZXJSZWYgPSB1c2VSZWY8QWJvcnRDb250cm9sbGVyIHwgbnVsbD4obnVsbClcblxuICAvLyBBYm9ydCBPQXV0aCBmbG93IG9uIHVubW91bnQgc28gdGhlIGNhbGxiYWNrIHNlcnZlciBpcyBjbG9zZWQgZXZlbiBpZiBhXG4gIC8vIHBhcmVudCBjb21wb25lbnQncyBFc2MgaGFuZGxlciBuYXZpZ2F0ZXMgYXdheSBiZWZvcmUgb3VycyBmaXJlcy5cbiAgdXNlRWZmZWN0KCgpID0+ICgpID0+IGF1dGhBYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudD8uYWJvcnQoKSwgW10pXG5cbiAgLy8gSGFuZGxlIEVTQyB0byBjYW5jZWwgYXV0aGVudGljYXRpb24gZmxvd1xuICBjb25zdCBoYW5kbGVFc2NDYW5jZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGlzQXV0aGVudGljYXRpbmcpIHtcbiAgICAgIGF1dGhBYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudD8uYWJvcnQoKVxuICAgICAgYXV0aEFib3J0Q29udHJvbGxlclJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgc2V0SXNBdXRoZW50aWNhdGluZyhmYWxzZSlcbiAgICAgIHNldEF1dGhvcml6YXRpb25VcmwobnVsbClcbiAgICB9XG4gIH0sIFtpc0F1dGhlbnRpY2F0aW5nXSlcblxuICB1c2VLZXliaW5kaW5nKCdjb25maXJtOm5vJywgaGFuZGxlRXNjQ2FuY2VsLCB7XG4gICAgY29udGV4dDogJ0NvbmZpcm1hdGlvbicsXG4gICAgaXNBY3RpdmU6IGlzQXV0aGVudGljYXRpbmcsXG4gIH0pXG5cbiAgY29uc3QgaGFuZGxlQXV0aGVudGljYXRlID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmICghYWdlbnRTZXJ2ZXIubmVlZHNBdXRoIHx8ICFhZ2VudFNlcnZlci51cmwpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldElzQXV0aGVudGljYXRpbmcodHJ1ZSlcbiAgICBzZXRFcnJvcihudWxsKVxuXG4gICAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKVxuICAgIGF1dGhBYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudCA9IGNvbnRyb2xsZXJcblxuICAgIHRyeSB7XG4gICAgICAvLyBDcmVhdGUgYSB0ZW1wb3JhcnkgY29uZmlnIGZvciBPQXV0aFxuICAgICAgY29uc3QgdGVtcENvbmZpZyA9IHtcbiAgICAgICAgdHlwZTogYWdlbnRTZXJ2ZXIudHJhbnNwb3J0IGFzICdodHRwJyB8ICdzc2UnLFxuICAgICAgICB1cmw6IGFnZW50U2VydmVyLnVybCxcbiAgICAgIH1cblxuICAgICAgYXdhaXQgcGVyZm9ybU1DUE9BdXRoRmxvdyhcbiAgICAgICAgYWdlbnRTZXJ2ZXIubmFtZSxcbiAgICAgICAgdGVtcENvbmZpZyxcbiAgICAgICAgc2V0QXV0aG9yaXphdGlvblVybCxcbiAgICAgICAgY29udHJvbGxlci5zaWduYWwsXG4gICAgICApXG5cbiAgICAgIG9uQ29tcGxldGU/LihcbiAgICAgICAgYEF1dGhlbnRpY2F0aW9uIHN1Y2Nlc3NmdWwgZm9yICR7YWdlbnRTZXJ2ZXIubmFtZX0uIFRoZSBzZXJ2ZXIgd2lsbCBjb25uZWN0IHdoZW4gdGhlIGFnZW50IHJ1bnMuYCxcbiAgICAgIClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIERvbid0IHNob3cgZXJyb3IgaWYgaXQgd2FzIGEgY2FuY2VsbGF0aW9uXG4gICAgICBpZiAoXG4gICAgICAgIGVyciBpbnN0YW5jZW9mIEVycm9yICYmXG4gICAgICAgICEoZXJyIGluc3RhbmNlb2YgQXV0aGVudGljYXRpb25DYW5jZWxsZWRFcnJvcilcbiAgICAgICkge1xuICAgICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0SXNBdXRoZW50aWNhdGluZyhmYWxzZSlcbiAgICAgIGF1dGhBYm9ydENvbnRyb2xsZXJSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFthZ2VudFNlcnZlciwgb25Db21wbGV0ZV0pXG5cbiAgY29uc3QgY2FwaXRhbGl6ZWRTZXJ2ZXJOYW1lID0gY2FwaXRhbGl6ZShTdHJpbmcoYWdlbnRTZXJ2ZXIubmFtZSkpXG5cbiAgaWYgKGlzQXV0aGVudGljYXRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfSBwYWRkaW5nPXsxfT5cbiAgICAgICAgPFRleHQgY29sb3I9XCJjbGF1ZGVcIj5BdXRoZW50aWNhdGluZyB3aXRoIHthZ2VudFNlcnZlci5uYW1lfeKApjwvVGV4dD5cbiAgICAgICAgPEJveD5cbiAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgIDxUZXh0PiBBIGJyb3dzZXIgd2luZG93IHdpbGwgb3BlbiBmb3IgYXV0aGVudGljYXRpb248L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgICB7YXV0aG9yaXphdGlvblVybCAmJiAoXG4gICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgICAgICAgSWYgeW91ciBicm93c2VyIGRvZXNuJmFwb3M7dCBvcGVuIGF1dG9tYXRpY2FsbHksIGNvcHkgdGhpcyBVUkxcbiAgICAgICAgICAgICAgbWFudWFsbHk6XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8TGluayB1cmw9e2F1dGhvcml6YXRpb25Vcmx9IC8+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICAgIDxCb3ggbWFyZ2luTGVmdD17M30+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAgICBSZXR1cm4gaGVyZSBhZnRlciBhdXRoZW50aWNhdGluZyBpbiB5b3VyIGJyb3dzZXIueycgJ31cbiAgICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgICAgYWN0aW9uPVwiY29uZmlybTpub1wiXG4gICAgICAgICAgICAgIGNvbnRleHQ9XCJDb25maXJtYXRpb25cIlxuICAgICAgICAgICAgICBmYWxsYmFjaz1cIkVzY1wiXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiZ28gYmFja1wiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBjb25zdCBtZW51T3B0aW9ucyA9IFtdXG5cbiAgLy8gT25seSBzaG93IGF1dGhlbnRpY2F0ZSBvcHRpb24gZm9yIEhUVFAvU1NFIHNlcnZlcnNcbiAgaWYgKGFnZW50U2VydmVyLm5lZWRzQXV0aCkge1xuICAgIG1lbnVPcHRpb25zLnB1c2goe1xuICAgICAgbGFiZWw6IGFnZW50U2VydmVyLmlzQXV0aGVudGljYXRlZCA/ICdSZS1hdXRoZW50aWNhdGUnIDogJ0F1dGhlbnRpY2F0ZScsXG4gICAgICB2YWx1ZTogJ2F1dGgnLFxuICAgIH0pXG4gIH1cblxuICBtZW51T3B0aW9ucy5wdXNoKHtcbiAgICBsYWJlbDogJ0JhY2snLFxuICAgIHZhbHVlOiAnYmFjaycsXG4gIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT17YCR7Y2FwaXRhbGl6ZWRTZXJ2ZXJOYW1lfSBNQ1AgU2VydmVyYH1cbiAgICAgIHN1YnRpdGxlPVwiYWdlbnQtb25seVwiXG4gICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICBpbnB1dEd1aWRlPXtleGl0U3RhdGUgPT5cbiAgICAgICAgZXhpdFN0YXRlLnBlbmRpbmcgPyAoXG4gICAgICAgICAgPFRleHQ+UHJlc3Mge2V4aXRTdGF0ZS5rZXlOYW1lfSBhZ2FpbiB0byBleGl0PC9UZXh0PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxCeWxpbmU+XG4gICAgICAgICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9XCLihpHihpNcIiBhY3Rpb249XCJuYXZpZ2F0ZVwiIC8+XG4gICAgICAgICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9XCJFbnRlclwiIGFjdGlvbj1cImNvbmZpcm1cIiAvPlxuICAgICAgICAgICAgPENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludFxuICAgICAgICAgICAgICBhY3Rpb249XCJjb25maXJtOm5vXCJcbiAgICAgICAgICAgICAgY29udGV4dD1cIkNvbmZpcm1hdGlvblwiXG4gICAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb249XCJnbyBiYWNrXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9CeWxpbmU+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICA+XG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezB9PlxuICAgICAgICA8Qm94PlxuICAgICAgICAgIDxUZXh0IGJvbGQ+VHlwZTogPC9UZXh0PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPnthZ2VudFNlcnZlci50cmFuc3BvcnR9PC9UZXh0PlxuICAgICAgICA8L0JveD5cblxuICAgICAgICB7YWdlbnRTZXJ2ZXIudXJsICYmIChcbiAgICAgICAgICA8Qm94PlxuICAgICAgICAgICAgPFRleHQgYm9sZD5VUkw6IDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPnthZ2VudFNlcnZlci51cmx9PC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApfVxuXG4gICAgICAgIHthZ2VudFNlcnZlci5jb21tYW5kICYmIChcbiAgICAgICAgICA8Qm94PlxuICAgICAgICAgICAgPFRleHQgYm9sZD5Db21tYW5kOiA8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj57YWdlbnRTZXJ2ZXIuY29tbWFuZH08L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG5cbiAgICAgICAgPEJveD5cbiAgICAgICAgICA8VGV4dCBib2xkPlVzZWQgYnk6IDwvVGV4dD5cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj57YWdlbnRTZXJ2ZXIuc291cmNlQWdlbnRzLmpvaW4oJywgJyl9PC9UZXh0PlxuICAgICAgICA8L0JveD5cblxuICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgPFRleHQgYm9sZD5TdGF0dXM6IDwvVGV4dD5cbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIHtjb2xvcignaW5hY3RpdmUnLCB0aGVtZSkoZmlndXJlcy5yYWRpb09mZil9IG5vdCBjb25uZWN0ZWRcbiAgICAgICAgICAgIChhZ2VudC1vbmx5KVxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG5cbiAgICAgICAge2FnZW50U2VydmVyLm5lZWRzQXV0aCAmJiAoXG4gICAgICAgICAgPEJveD5cbiAgICAgICAgICAgIDxUZXh0IGJvbGQ+QXV0aDogPC9UZXh0PlxuICAgICAgICAgICAge2FnZW50U2VydmVyLmlzQXV0aGVudGljYXRlZCA/IChcbiAgICAgICAgICAgICAgPFRleHQ+e2NvbG9yKCdzdWNjZXNzJywgdGhlbWUpKGZpZ3VyZXMudGljayl9IGF1dGhlbnRpY2F0ZWQ8L1RleHQ+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgICB7Y29sb3IoJ3dhcm5pbmcnLCB0aGVtZSkoZmlndXJlcy50cmlhbmdsZVVwT3V0bGluZSl9IG1heSBuZWVkXG4gICAgICAgICAgICAgICAgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgKX1cbiAgICAgIDwvQm94PlxuXG4gICAgICA8Qm94PlxuICAgICAgICA8VGV4dCBkaW1Db2xvcj5UaGlzIHNlcnZlciBjb25uZWN0cyBvbmx5IHdoZW4gcnVubmluZyB0aGUgYWdlbnQuPC9UZXh0PlxuICAgICAgPC9Cb3g+XG5cbiAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgIDxCb3g+XG4gICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPkVycm9yOiB7ZXJyb3J9PC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICl9XG5cbiAgICAgIDxCb3g+XG4gICAgICAgIDxTZWxlY3RcbiAgICAgICAgICBvcHRpb25zPXttZW51T3B0aW9uc31cbiAgICAgICAgICBvbkNoYW5nZT17YXN5bmMgdmFsdWUgPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xuICAgICAgICAgICAgICBjYXNlICdhdXRoJzpcbiAgICAgICAgICAgICAgICBhd2FpdCBoYW5kbGVBdXRoZW50aWNhdGUoKVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIGNhc2UgJ2JhY2snOlxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsKClcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBT0EsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBT0MsS0FBSyxJQUFJQyxXQUFXLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUN2RSxjQUFjQyxvQkFBb0IsUUFBUSxtQkFBbUI7QUFDN0QsU0FBU0MsR0FBRyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLFFBQVEsY0FBYztBQUMvRCxTQUFTQyxhQUFhLFFBQVEsb0NBQW9DO0FBQ2xFLFNBQ0VDLDRCQUE0QixFQUM1QkMsbUJBQW1CLFFBQ2QsNEJBQTRCO0FBQ25DLFNBQVNDLFVBQVUsUUFBUSw0QkFBNEI7QUFDdkQsU0FBU0Msd0JBQXdCLFFBQVEsZ0NBQWdDO0FBQ3pFLFNBQVNDLE1BQU0sUUFBUSwwQkFBMEI7QUFDakQsU0FBU0MsTUFBTSxRQUFRLDRCQUE0QjtBQUNuRCxT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
