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
exports.MCPReconnect = MCPReconnect;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var MCPConnectionManager_js_1 = require("../../services/mcp/MCPConnectionManager.js");
var AppState_js_1 = require("../../state/AppState.js");
var Spinner_js_1 = require("../Spinner.js");
function MCPReconnect(t0) {
    var $ = (0, compiler_runtime_1.c)(25);
    var serverName = t0.serverName, onComplete = t0.onComplete;
    var theme = (0, ink_js_1.useTheme)()[0];
    var store = (0, AppState_js_1.useAppStateStore)();
    var reconnectMcpServer = (0, MCPConnectionManager_js_1.useMcpReconnect)();
    var _a = (0, react_1.useState)(true), isReconnecting = _a[0], setIsReconnecting = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var t1;
    var t2;
    if ($[0] !== onComplete || $[1] !== reconnectMcpServer || $[2] !== serverName || $[3] !== store) {
        t1 = function () {
            var attemptReconnect = function attemptReconnect() {
                return __awaiter(this, void 0, void 0, function () {
                    var server, result, t3_1, err, errorMessage;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                ;
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                server = store.getState().mcp.clients.find(function (c) { return c.name === serverName; });
                                if (!server) {
                                    setError("MCP server \"".concat(serverName, "\" not found"));
                                    setIsReconnecting(false);
                                    onComplete("MCP server \"".concat(serverName, "\" not found"));
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, reconnectMcpServer(serverName)];
                            case 2:
                                result = _a.sent();
                                bb43: switch (result.client.type) {
                                    case "connected":
                                        {
                                            setIsReconnecting(false);
                                            onComplete("Successfully reconnected to ".concat(serverName));
                                            break bb43;
                                        }
                                    case "needs-auth":
                                        {
                                            setError("".concat(serverName, " requires authentication"));
                                            setIsReconnecting(false);
                                            onComplete("".concat(serverName, " requires authentication. Use /mcp to authenticate."));
                                            break bb43;
                                        }
                                    case "pending":
                                    case "failed":
                                    case "disabled":
                                        {
                                            setError("Failed to reconnect to ".concat(serverName));
                                            setIsReconnecting(false);
                                            onComplete("Failed to reconnect to ".concat(serverName));
                                        }
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                t3_1 = _a.sent();
                                err = t3_1;
                                errorMessage = err instanceof Error ? err.message : String(err);
                                setError(errorMessage);
                                setIsReconnecting(false);
                                onComplete("Error: ".concat(errorMessage));
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            attemptReconnect();
        };
        t2 = [serverName, reconnectMcpServer, store, onComplete];
        $[0] = onComplete;
        $[1] = reconnectMcpServer;
        $[2] = serverName;
        $[3] = store;
        $[4] = t1;
        $[5] = t2;
    }
    else {
        t1 = $[4];
        t2 = $[5];
    }
    (0, react_1.useEffect)(t1, t2);
    if (isReconnecting) {
        var t3 = void 0;
        if ($[6] !== serverName) {
            t3 = <ink_js_1.Text color="text">Reconnecting to <ink_js_1.Text bold={true}>{serverName}</ink_js_1.Text></ink_js_1.Text>;
            $[6] = serverName;
            $[7] = t3;
        }
        else {
            t3 = $[7];
        }
        var t4 = void 0;
        if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = <ink_js_1.Box><Spinner_js_1.Spinner /><ink_js_1.Text> Establishing connection to MCP server</ink_js_1.Text></ink_js_1.Box>;
            $[8] = t4;
        }
        else {
            t4 = $[8];
        }
        var t5 = void 0;
        if ($[9] !== t3) {
            t5 = <ink_js_1.Box flexDirection="column" gap={1} padding={1}>{t3}{t4}</ink_js_1.Box>;
            $[9] = t3;
            $[10] = t5;
        }
        else {
            t5 = $[10];
        }
        return t5;
    }
    if (error) {
        var t3 = void 0;
        if ($[11] !== theme) {
            t3 = (0, ink_js_1.color)("error", theme)(figures_1.default.cross);
            $[11] = theme;
            $[12] = t3;
        }
        else {
            t3 = $[12];
        }
        var t4 = void 0;
        if ($[13] !== t3) {
            t4 = <ink_js_1.Text>{t3} </ink_js_1.Text>;
            $[13] = t3;
            $[14] = t4;
        }
        else {
            t4 = $[14];
        }
        var t5 = void 0;
        if ($[15] !== serverName) {
            t5 = <ink_js_1.Text color="error">Failed to reconnect to {serverName}</ink_js_1.Text>;
            $[15] = serverName;
            $[16] = t5;
        }
        else {
            t5 = $[16];
        }
        var t6 = void 0;
        if ($[17] !== t4 || $[18] !== t5) {
            t6 = <ink_js_1.Box>{t4}{t5}</ink_js_1.Box>;
            $[17] = t4;
            $[18] = t5;
            $[19] = t6;
        }
        else {
            t6 = $[19];
        }
        var t7 = void 0;
        if ($[20] !== error) {
            t7 = <ink_js_1.Text dimColor={true}>Error: {error}</ink_js_1.Text>;
            $[20] = error;
            $[21] = t7;
        }
        else {
            t7 = $[21];
        }
        var t8 = void 0;
        if ($[22] !== t6 || $[23] !== t7) {
            t8 = <ink_js_1.Box flexDirection="column" gap={1} padding={1}>{t6}{t7}</ink_js_1.Box>;
            $[22] = t6;
            $[23] = t7;
            $[24] = t8;
        }
        else {
            t8 = $[24];
        }
        return t8;
    }
    return null;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiQm94IiwiY29sb3IiLCJUZXh0IiwidXNlVGhlbWUiLCJ1c2VNY3BSZWNvbm5lY3QiLCJ1c2VBcHBTdGF0ZVN0b3JlIiwiU3Bpbm5lciIsIlByb3BzIiwic2VydmVyTmFtZSIsIm9uQ29tcGxldGUiLCJyZXN1bHQiLCJvcHRpb25zIiwiZGlzcGxheSIsIk1DUFJlY29ubmVjdCIsInQwIiwiJCIsIl9jIiwidGhlbWUiLCJzdG9yZSIsInJlY29ubmVjdE1jcFNlcnZlciIsImlzUmVjb25uZWN0aW5nIiwic2V0SXNSZWNvbm5lY3RpbmciLCJlcnJvciIsInNldEVycm9yIiwidDEiLCJ0MiIsImF0dGVtcHRSZWNvbm5lY3QiLCJzZXJ2ZXIiLCJnZXRTdGF0ZSIsIm1jcCIsImNsaWVudHMiLCJmaW5kIiwiYyIsIm5hbWUiLCJiYjQzIiwiY2xpZW50IiwidHlwZSIsInQzIiwiZXJyIiwiZXJyb3JNZXNzYWdlIiwiRXJyb3IiLCJtZXNzYWdlIiwiU3RyaW5nIiwidDQiLCJTeW1ib2wiLCJmb3IiLCJ0NSIsImNyb3NzIiwidDYiLCJ0NyIsInQ4Il0sInNvdXJjZXMiOlsiTUNQUmVjb25uZWN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmlndXJlcyBmcm9tICdmaWd1cmVzJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB0eXBlIHsgQ29tbWFuZFJlc3VsdERpc3BsYXkgfSBmcm9tICcuLi8uLi9jb21tYW5kcy5qcydcbmltcG9ydCB7IEJveCwgY29sb3IsIFRleHQsIHVzZVRoZW1lIH0gZnJvbSAnLi4vLi4vaW5rLmpzJ1xuaW1wb3J0IHsgdXNlTWNwUmVjb25uZWN0IH0gZnJvbSAnLi4vLi4vc2VydmljZXMvbWNwL01DUENvbm5lY3Rpb25NYW5hZ2VyLmpzJ1xuaW1wb3J0IHsgdXNlQXBwU3RhdGVTdG9yZSB9IGZyb20gJy4uLy4uL3N0YXRlL0FwcFN0YXRlLmpzJ1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uL1NwaW5uZXIuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHNlcnZlck5hbWU6IHN0cmluZ1xuICBvbkNvbXBsZXRlOiAoXG4gICAgcmVzdWx0Pzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheSB9LFxuICApID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1DUFJlY29ubmVjdCh7XG4gIHNlcnZlck5hbWUsXG4gIG9uQ29tcGxldGUsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IFt0aGVtZV0gPSB1c2VUaGVtZSgpXG4gIGNvbnN0IHN0b3JlID0gdXNlQXBwU3RhdGVTdG9yZSgpXG4gIGNvbnN0IHJlY29ubmVjdE1jcFNlcnZlciA9IHVzZU1jcFJlY29ubmVjdCgpXG4gIGNvbnN0IFtpc1JlY29ubmVjdGluZywgc2V0SXNSZWNvbm5lY3RpbmddID0gdXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYXN5bmMgZnVuY3Rpb24gYXR0ZW1wdFJlY29ubmVjdCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIENoZWNrIGlmIHNlcnZlciBleGlzdHMuIFJlYWQgdmlhIHN0b3JlLmdldFN0YXRlKCkgaW5zdGVhZCBvZiBhXG4gICAgICAgIC8vIHJlYWN0aXZlIHNlbGVjdG9yIHNvIHRoaXMgZWZmZWN0IGRvZXMgbm90IHJlLWZpcmUgd2hlblxuICAgICAgICAvLyByZWNvbm5lY3RNY3BTZXJ2ZXIgdXBkYXRlcyBtY3AuY2xpZW50cyB2aWEgb25Db25uZWN0aW9uQXR0ZW1wdC5cbiAgICAgICAgY29uc3Qgc2VydmVyID0gc3RvcmVcbiAgICAgICAgICAuZ2V0U3RhdGUoKVxuICAgICAgICAgIC5tY3AuY2xpZW50cy5maW5kKGMgPT4gYy5uYW1lID09PSBzZXJ2ZXJOYW1lKVxuICAgICAgICBpZiAoIXNlcnZlcikge1xuICAgICAgICAgIHNldEVycm9yKGBNQ1Agc2VydmVyIFwiJHtzZXJ2ZXJOYW1lfVwiIG5vdCBmb3VuZGApXG4gICAgICAgICAgc2V0SXNSZWNvbm5lY3RpbmcoZmFsc2UpXG4gICAgICAgICAgb25Db21wbGV0ZShgTUNQIHNlcnZlciBcIiR7c2VydmVyTmFtZX1cIiBub3QgZm91bmRgKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXR0ZW1wdCByZWNvbm5lY3Rpb25cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVjb25uZWN0TWNwU2VydmVyKHNlcnZlck5hbWUpXG5cbiAgICAgICAgc3dpdGNoIChyZXN1bHQuY2xpZW50LnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdjb25uZWN0ZWQnOlxuICAgICAgICAgICAgc2V0SXNSZWNvbm5lY3RpbmcoZmFsc2UpXG4gICAgICAgICAgICBvbkNvbXBsZXRlKGBTdWNjZXNzZnVsbHkgcmVjb25uZWN0ZWQgdG8gJHtzZXJ2ZXJOYW1lfWApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ25lZWRzLWF1dGgnOlxuICAgICAgICAgICAgc2V0RXJyb3IoYCR7c2VydmVyTmFtZX0gcmVxdWlyZXMgYXV0aGVudGljYXRpb25gKVxuICAgICAgICAgICAgc2V0SXNSZWNvbm5lY3RpbmcoZmFsc2UpXG4gICAgICAgICAgICBvbkNvbXBsZXRlKFxuICAgICAgICAgICAgICBgJHtzZXJ2ZXJOYW1lfSByZXF1aXJlcyBhdXRoZW50aWNhdGlvbi4gVXNlIC9tY3AgdG8gYXV0aGVudGljYXRlLmAsXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgICAgICAgc2V0RXJyb3IoYEZhaWxlZCB0byByZWNvbm5lY3QgdG8gJHtzZXJ2ZXJOYW1lfWApXG4gICAgICAgICAgICBzZXRJc1JlY29ubmVjdGluZyhmYWxzZSlcbiAgICAgICAgICAgIG9uQ29tcGxldGUoYEZhaWxlZCB0byByZWNvbm5lY3QgdG8gJHtzZXJ2ZXJOYW1lfWApXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gT25seSBjYXRjaCBhY3R1YWwgZXJyb3JzIChsaWtlIHNlcnZlciBub3QgZm91bmQpXG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKVxuICAgICAgICBzZXRFcnJvcihlcnJvck1lc3NhZ2UpXG4gICAgICAgIHNldElzUmVjb25uZWN0aW5nKGZhbHNlKVxuICAgICAgICBvbkNvbXBsZXRlKGBFcnJvcjogJHtlcnJvck1lc3NhZ2V9YClcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2b2lkIGF0dGVtcHRSZWNvbm5lY3QoKVxuICB9LCBbc2VydmVyTmFtZSwgcmVjb25uZWN0TWNwU2VydmVyLCBzdG9yZSwgb25Db21wbGV0ZV0pXG5cbiAgaWYgKGlzUmVjb25uZWN0aW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0gcGFkZGluZz17MX0+XG4gICAgICAgIDxUZXh0IGNvbG9yPVwidGV4dFwiPlxuICAgICAgICAgIFJlY29ubmVjdGluZyB0byA8VGV4dCBib2xkPntzZXJ2ZXJOYW1lfTwvVGV4dD5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8Qm94PlxuICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgPFRleHQ+IEVzdGFibGlzaGluZyBjb25uZWN0aW9uIHRvIE1DUCBzZXJ2ZXI8L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0gcGFkZGluZz17MX0+XG4gICAgICAgIDxCb3g+XG4gICAgICAgICAgPFRleHQ+e2NvbG9yKCdlcnJvcicsIHRoZW1lKShmaWd1cmVzLmNyb3NzKX0gPC9UZXh0PlxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj5GYWlsZWQgdG8gcmVjb25uZWN0IHRvIHtzZXJ2ZXJOYW1lfTwvVGV4dD5cbiAgICAgICAgPC9Cb3g+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPkVycm9yOiB7ZXJyb3J9PC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLE9BQU8sTUFBTSxTQUFTO0FBQzdCLE9BQU9DLEtBQUssSUFBSUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUNsRCxjQUFjQyxvQkFBb0IsUUFBUSxtQkFBbUI7QUFDN0QsU0FBU0MsR0FBRyxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsUUFBUSxRQUFRLGNBQWM7QUFDekQsU0FBU0MsZUFBZSxRQUFRLDRDQUE0QztBQUM1RSxTQUFTQyxnQkFBZ0IsUUFBUSx5QkFBeUI7QUFDMUQsU0FBU0MsT0FBTyxRQUFRLGVBQWU7QUFFdkMsS0FBS0MsS0FBSyxHQUFHO0VBQ1hDLFVBQVUsRUFBRSxNQUFNO0VBQ2xCQyxVQUFVLEVBQUUsQ0FDVkMsTUFBZSxDQUFSLEVBQUUsTUFBTSxFQUNmQyxPQUE0QyxDQUFwQyxFQUFFO0lBQUVDLE9BQU8sQ0FBQyxFQUFFYixvQkFBb0I7RUFBQyxDQUFDLEVBQzVDLEdBQUcsSUFBSTtBQUNYLENBQUM7QUFFRCxPQUFPLFNBQUFjLGFBQUFDLEVBQUE7RUFBQSxNQUFBQyxDQUFBLEdBQUFD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
