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
exports.call = call;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var index_js_1 = require("../../components/mcp/index.js");
var MCPReconnect_js_1 = require("../../components/mcp/MCPReconnect.js");
var MCPConnectionManager_js_1 = require("../../services/mcp/MCPConnectionManager.js");
var AppState_js_1 = require("../../state/AppState.js");
var PluginSettings_js_1 = require("../plugin/PluginSettings.js");
// TODO: This is a hack to get the context value from toggleMcpServer (useContext only works in a component)
// Ideally, all MCP state and functions would be in global state.
function MCPToggle(t0) {
    var $ = (0, compiler_runtime_1.c)(7);
    var action = t0.action, target = t0.target, onComplete = t0.onComplete;
    var mcpClients = (0, AppState_js_1.useAppState)(_temp);
    var toggleMcpServer = (0, MCPConnectionManager_js_1.useMcpToggleEnabled)();
    var didRun = (0, react_1.useRef)(false);
    var t1;
    var t2;
    if ($[0] !== action || $[1] !== mcpClients || $[2] !== onComplete || $[3] !== target || $[4] !== toggleMcpServer) {
        t1 = function () {
            if (didRun.current) {
                return;
            }
            didRun.current = true;
            var isEnabling = action === "enable";
            var clients = mcpClients.filter(_temp2);
            var toToggle = target === "all" ? clients.filter(function (c_0) { return isEnabling ? c_0.type === "disabled" : c_0.type !== "disabled"; }) : clients.filter(function (c_1) { return c_1.name === target; });
            if (toToggle.length === 0) {
                onComplete(target === "all" ? "All MCP servers are already ".concat(isEnabling ? "enabled" : "disabled") : "MCP server \"".concat(target, "\" not found"));
                return;
            }
            for (var _i = 0, toToggle_1 = toToggle; _i < toToggle_1.length; _i++) {
                var s_0 = toToggle_1[_i];
                toggleMcpServer(s_0.name);
            }
            onComplete(target === "all" ? "".concat(isEnabling ? "Enabled" : "Disabled", " ").concat(toToggle.length, " MCP server(s)") : "MCP server \"".concat(target, "\" ").concat(isEnabling ? "enabled" : "disabled"));
        };
        t2 = [action, target, mcpClients, toggleMcpServer, onComplete];
        $[0] = action;
        $[1] = mcpClients;
        $[2] = onComplete;
        $[3] = target;
        $[4] = toggleMcpServer;
        $[5] = t1;
        $[6] = t2;
    }
    else {
        t1 = $[5];
        t2 = $[6];
    }
    (0, react_1.useEffect)(t1, t2);
    return null;
}
function _temp2(c) {
    return c.name !== "ide";
}
function _temp(s) {
    return s.mcp.clients;
}
function call(onDone, _context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var parts;
        return __generator(this, function (_a) {
            if (args) {
                parts = args.trim().split(/\s+/);
                // Allow /mcp no-redirect to bypass the redirect for testing
                if (parts[0] === 'no-redirect') {
                    return [2 /*return*/, <index_js_1.MCPSettings onComplete={onDone}/>];
                }
                if (parts[0] === 'reconnect' && parts[1]) {
                    return [2 /*return*/, <MCPReconnect_js_1.MCPReconnect serverName={parts.slice(1).join(' ')} onComplete={onDone}/>];
                }
                if (parts[0] === 'enable' || parts[0] === 'disable') {
                    return [2 /*return*/, <MCPToggle action={parts[0]} target={parts.length > 1 ? parts.slice(1).join(' ') : 'all'} onComplete={onDone}/>];
                }
            }
            // Redirect base /mcp command to /plugins installed tab for ant users
            if ("external" === 'ant') {
                return [2 /*return*/, <PluginSettings_js_1.PluginSettings onComplete={onDone} args="manage" showMcpRedirectMessage/>];
            }
            return [2 /*return*/, <index_js_1.MCPSettings onComplete={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVJlZiIsIk1DUFNldHRpbmdzIiwiTUNQUmVjb25uZWN0IiwidXNlTWNwVG9nZ2xlRW5hYmxlZCIsInVzZUFwcFN0YXRlIiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiUGx1Z2luU2V0dGluZ3MiLCJNQ1BUb2dnbGUiLCJ0MCIsIiQiLCJfYyIsImFjdGlvbiIsInRhcmdldCIsIm9uQ29tcGxldGUiLCJtY3BDbGllbnRzIiwiX3RlbXAiLCJ0b2dnbGVNY3BTZXJ2ZXIiLCJkaWRSdW4iLCJ0MSIsInQyIiwiY3VycmVudCIsImlzRW5hYmxpbmciLCJjbGllbnRzIiwiZmlsdGVyIiwiX3RlbXAyIiwidG9Ub2dnbGUiLCJjXzAiLCJjIiwidHlwZSIsImNfMSIsIm5hbWUiLCJsZW5ndGgiLCJzXzAiLCJzIiwibWNwIiwiY2FsbCIsIm9uRG9uZSIsIl9jb250ZXh0IiwiYXJncyIsIlByb21pc2UiLCJSZWFjdE5vZGUiLCJwYXJ0cyIsInRyaW0iLCJzcGxpdCIsInNsaWNlIiwiam9pbiJdLCJzb3VyY2VzIjpbIm1jcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBNQ1BTZXR0aW5ncyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvbWNwL2luZGV4LmpzJ1xuaW1wb3J0IHsgTUNQUmVjb25uZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9tY3AvTUNQUmVjb25uZWN0LmpzJ1xuaW1wb3J0IHsgdXNlTWNwVG9nZ2xlRW5hYmxlZCB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL21jcC9NQ1BDb25uZWN0aW9uTWFuYWdlci5qcydcbmltcG9ydCB7IHVzZUFwcFN0YXRlIH0gZnJvbSAnLi4vLi4vc3RhdGUvQXBwU3RhdGUuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5pbXBvcnQgeyBQbHVnaW5TZXR0aW5ncyB9IGZyb20gJy4uL3BsdWdpbi9QbHVnaW5TZXR0aW5ncy5qcydcblxuLy8gVE9ETzogVGhpcyBpcyBhIGhhY2sgdG8gZ2V0IHRoZSBjb250ZXh0IHZhbHVlIGZyb20gdG9nZ2xlTWNwU2VydmVyICh1c2VDb250ZXh0IG9ubHkgd29ya3MgaW4gYSBjb21wb25lbnQpXG4vLyBJZGVhbGx5LCBhbGwgTUNQIHN0YXRlIGFuZCBmdW5jdGlvbnMgd291bGQgYmUgaW4gZ2xvYmFsIHN0YXRlLlxuZnVuY3Rpb24gTUNQVG9nZ2xlKHtcbiAgYWN0aW9uLFxuICB0YXJnZXQsXG4gIG9uQ29tcGxldGUsXG59OiB7XG4gIGFjdGlvbjogJ2VuYWJsZScgfCAnZGlzYWJsZSdcbiAgdGFyZ2V0OiBzdHJpbmdcbiAgb25Db21wbGV0ZTogKHJlc3VsdDogc3RyaW5nKSA9PiB2b2lkXG59KTogbnVsbCB7XG4gIGNvbnN0IG1jcENsaWVudHMgPSB1c2VBcHBTdGF0ZShzID0+IHMubWNwLmNsaWVudHMpXG4gIGNvbnN0IHRvZ2dsZU1jcFNlcnZlciA9IHVzZU1jcFRvZ2dsZUVuYWJsZWQoKVxuICBjb25zdCBkaWRSdW4gPSB1c2VSZWYoZmFsc2UpXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZGlkUnVuLmN1cnJlbnQpIHJldHVyblxuICAgIGRpZFJ1bi5jdXJyZW50ID0gdHJ1ZVxuXG4gICAgY29uc3QgaXNFbmFibGluZyA9IGFjdGlvbiA9PT0gJ2VuYWJsZSdcbiAgICBjb25zdCBjbGllbnRzID0gbWNwQ2xpZW50cy5maWx0ZXIoYyA9PiBjLm5hbWUgIT09ICdpZGUnKVxuICAgIGNvbnN0IHRvVG9nZ2xlID1cbiAgICAgIHRhcmdldCA9PT0gJ2FsbCdcbiAgICAgICAgPyBjbGllbnRzLmZpbHRlcihjID0+XG4gICAgICAgICAgICBpc0VuYWJsaW5nID8gYy50eXBlID09PSAnZGlzYWJsZWQnIDogYy50eXBlICE9PSAnZGlzYWJsZWQnLFxuICAgICAgICAgIClcbiAgICAgICAgOiBjbGllbnRzLmZpbHRlcihjID0+IGMubmFtZSA9PT0gdGFyZ2V0KVxuXG4gICAgaWYgKHRvVG9nZ2xlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgb25Db21wbGV0ZShcbiAgICAgICAgdGFyZ2V0ID09PSAnYWxsJ1xuICAgICAgICAgID8gYEFsbCBNQ1Agc2VydmVycyBhcmUgYWxyZWFkeSAke2lzRW5hYmxpbmcgPyAnZW5hYmxlZCcgOiAnZGlzYWJsZWQnfWBcbiAgICAgICAgICA6IGBNQ1Agc2VydmVyIFwiJHt0YXJnZXR9XCIgbm90IGZvdW5kYCxcbiAgICAgIClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGZvciAoY29uc3QgcyBvZiB0b1RvZ2dsZSkge1xuICAgICAgdm9pZCB0b2dnbGVNY3BTZXJ2ZXIocy5uYW1lKVxuICAgIH1cblxuICAgIG9uQ29tcGxldGUoXG4gICAgICB0YXJnZXQgPT09ICdhbGwnXG4gICAgICAgID8gYCR7aXNFbmFibGluZyA/ICdFbmFibGVkJyA6ICdEaXNhYmxlZCd9ICR7dG9Ub2dnbGUubGVuZ3RofSBNQ1Agc2VydmVyKHMpYFxuICAgICAgICA6IGBNQ1Agc2VydmVyIFwiJHt0YXJnZXR9XCIgJHtpc0VuYWJsaW5nID8gJ2VuYWJsZWQnIDogJ2Rpc2FibGVkJ31gLFxuICAgIClcbiAgfSwgW2FjdGlvbiwgdGFyZ2V0LCBtY3BDbGllbnRzLCB0b2dnbGVNY3BTZXJ2ZXIsIG9uQ29tcGxldGVdKVxuXG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgX2NvbnRleHQ6IHVua25vd24sXG4gIGFyZ3M/OiBzdHJpbmcsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICBpZiAoYXJncykge1xuICAgIGNvbnN0IHBhcnRzID0gYXJncy50cmltKCkuc3BsaXQoL1xccysvKVxuXG4gICAgLy8gQWxsb3cgL21jcCBuby1yZWRpcmVjdCB0byBieXBhc3MgdGhlIHJlZGlyZWN0IGZvciB0ZXN0aW5nXG4gICAgaWYgKHBhcnRzWzBdID09PSAnbm8tcmVkaXJlY3QnKSB7XG4gICAgICByZXR1cm4gPE1DUFNldHRpbmdzIG9uQ29tcGxldGU9e29uRG9uZX0gLz5cbiAgICB9XG5cbiAgICBpZiAocGFydHNbMF0gPT09ICdyZWNvbm5lY3QnICYmIHBhcnRzWzFdKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8TUNQUmVjb25uZWN0XG4gICAgICAgICAgc2VydmVyTmFtZT17cGFydHMuc2xpY2UoMSkuam9pbignICcpfVxuICAgICAgICAgIG9uQ29tcGxldGU9e29uRG9uZX1cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAocGFydHNbMF0gPT09ICdlbmFibGUnIHx8IHBhcnRzWzBdID09PSAnZGlzYWJsZScpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxNQ1BUb2dnbGVcbiAgICAgICAgICBhY3Rpb249e3BhcnRzWzBdfVxuICAgICAgICAgIHRhcmdldD17cGFydHMubGVuZ3RoID4gMSA/IHBhcnRzLnNsaWNlKDEpLmpvaW4oJyAnKSA6ICdhbGwnfVxuICAgICAgICAgIG9uQ29tcGxldGU9e29uRG9uZX1cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9XG4gIH1cblxuICAvLyBSZWRpcmVjdCBiYXNlIC9tY3AgY29tbWFuZCB0byAvcGx1Z2lucyBpbnN0YWxsZWQgdGFiIGZvciBhbnQgdXNlcnNcbiAgaWYgKFwiZXh0ZXJuYWxcIiA9PT0gJ2FudCcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFBsdWdpblNldHRpbmdzXG4gICAgICAgIG9uQ29tcGxldGU9e29uRG9uZX1cbiAgICAgICAgYXJncz1cIm1hbmFnZVwiXG4gICAgICAgIHNob3dNY3BSZWRpcmVjdE1lc3NhZ2VcbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIDxNQ1BTZXR0aW5ncyBvbkNvbXBsZXRlPXtvbkRvbmV9IC8+XG59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
