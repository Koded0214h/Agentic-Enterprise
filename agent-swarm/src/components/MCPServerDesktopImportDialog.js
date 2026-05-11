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
exports.MCPServerDesktopImportDialog = MCPServerDesktopImportDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var gracefulShutdown_js_1 = require("src/utils/gracefulShutdown.js");
var process_js_1 = require("src/utils/process.js");
var ink_js_1 = require("../ink.js");
var config_js_1 = require("../services/mcp/config.js");
var stringUtils_js_1 = require("../utils/stringUtils.js");
var ConfigurableShortcutHint_js_1 = require("./ConfigurableShortcutHint.js");
var SelectMulti_js_1 = require("./CustomSelect/SelectMulti.js");
var Byline_js_1 = require("./design-system/Byline.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
var KeyboardShortcutHint_js_1 = require("./design-system/KeyboardShortcutHint.js");
function MCPServerDesktopImportDialog(t0) {
    var $ = (0, compiler_runtime_1.c)(36);
    var servers = t0.servers, scope = t0.scope, onDone = t0.onDone;
    var t1;
    if ($[0] !== servers) {
        t1 = Object.keys(servers);
        $[0] = servers;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var serverNames = t1;
    var t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = {};
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var _a = (0, react_1.useState)(t2), existingServers = _a[0], setExistingServers = _a[1];
    var t3;
    var t4;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = function () {
            (0, config_js_1.getAllMcpConfigs)().then(function (t5) {
                var servers_0 = t5.servers;
                return setExistingServers(servers_0);
            });
        };
        t4 = [];
        $[3] = t3;
        $[4] = t4;
    }
    else {
        t3 = $[3];
        t4 = $[4];
    }
    (0, react_1.useEffect)(t3, t4);
    var t5;
    if ($[5] !== existingServers || $[6] !== serverNames) {
        t5 = serverNames.filter(function (name) { return existingServers[name] !== undefined; });
        $[5] = existingServers;
        $[6] = serverNames;
        $[7] = t5;
    }
    else {
        t5 = $[7];
    }
    var collisions = t5;
    var onSubmit = function onSubmit(selectedServers) {
        return __awaiter(this, void 0, void 0, function () {
            var importedCount, _i, selectedServers_1, serverName, serverConfig, finalName, counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        importedCount = 0;
                        _i = 0, selectedServers_1 = selectedServers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < selectedServers_1.length)) return [3 /*break*/, 4];
                        serverName = selectedServers_1[_i];
                        serverConfig = servers[serverName];
                        if (!serverConfig) return [3 /*break*/, 3];
                        finalName = serverName;
                        if (existingServers[finalName] !== undefined) {
                            counter = 1;
                            while (existingServers["".concat(serverName, "_").concat(counter)] !== undefined) {
                                counter++;
                            }
                            finalName = "".concat(serverName, "_").concat(counter);
                        }
                        return [4 /*yield*/, (0, config_js_1.addMcpConfig)(finalName, serverConfig, scope)];
                    case 2:
                        _a.sent();
                        importedCount++;
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        done(importedCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    var theme = (0, ink_js_1.useTheme)()[0];
    var t6;
    if ($[8] !== onDone || $[9] !== scope || $[10] !== theme) {
        t6 = function (importedCount_0) {
            if (importedCount_0 > 0) {
                (0, process_js_1.writeToStdout)("\n".concat((0, ink_js_1.color)("success", theme)("Successfully imported ".concat(importedCount_0, " MCP ").concat((0, stringUtils_js_1.plural)(importedCount_0, "server"), " to ").concat(scope, " config.")), "\n"));
            }
            else {
                (0, process_js_1.writeToStdout)("\nNo servers were imported.");
            }
            onDone();
            (0, gracefulShutdown_js_1.gracefulShutdown)();
        };
        $[8] = onDone;
        $[9] = scope;
        $[10] = theme;
        $[11] = t6;
    }
    else {
        t6 = $[11];
    }
    var done = t6;
    var t7;
    if ($[12] !== done) {
        t7 = function () {
            done(0);
        };
        $[12] = done;
        $[13] = t7;
    }
    else {
        t7 = $[13];
    }
    done;
    var handleEscCancel = t7;
    var t8 = serverNames.length;
    var t9;
    if ($[14] !== serverNames.length) {
        t9 = (0, stringUtils_js_1.plural)(serverNames.length, "server");
        $[14] = serverNames.length;
        $[15] = t9;
    }
    else {
        t9 = $[15];
    }
    var t10 = "Found ".concat(t8, " MCP ").concat(t9, " in Claude Desktop.");
    var t11;
    if ($[16] !== collisions.length) {
        t11 = collisions.length > 0 && <ink_js_1.Text color="warning">Note: Some servers already exist with the same name. If selected, they will be imported with a numbered suffix.</ink_js_1.Text>;
        $[16] = collisions.length;
        $[17] = t11;
    }
    else {
        t11 = $[17];
    }
    var t12;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = <ink_js_1.Text>Please select the servers you want to import:</ink_js_1.Text>;
        $[18] = t12;
    }
    else {
        t12 = $[18];
    }
    var t13;
    var t14;
    if ($[19] !== collisions || $[20] !== serverNames) {
        t13 = serverNames.map(function (server) { return ({
            label: "".concat(server).concat(collisions.includes(server) ? " (already exists)" : ""),
            value: server
        }); });
        t14 = serverNames.filter(function (name_0) { return !collisions.includes(name_0); });
        $[19] = collisions;
        $[20] = serverNames;
        $[21] = t13;
        $[22] = t14;
    }
    else {
        t13 = $[21];
        t14 = $[22];
    }
    var t15;
    if ($[23] !== handleEscCancel || $[24] !== onSubmit || $[25] !== t13 || $[26] !== t14) {
        t15 = <SelectMulti_js_1.SelectMulti options={t13} defaultValue={t14} onSubmit={onSubmit} onCancel={handleEscCancel} hideIndexes={true}/>;
        $[23] = handleEscCancel;
        $[24] = onSubmit;
        $[25] = t13;
        $[26] = t14;
        $[27] = t15;
    }
    else {
        t15 = $[27];
    }
    var t16;
    if ($[28] !== handleEscCancel || $[29] !== t10 || $[30] !== t11 || $[31] !== t15) {
        t16 = <Dialog_js_1.Dialog title="Import MCP Servers from Claude Desktop" subtitle={t10} color="success" onCancel={handleEscCancel} hideInputGuide={true}>{t11}{t12}{t15}</Dialog_js_1.Dialog>;
        $[28] = handleEscCancel;
        $[29] = t10;
        $[30] = t11;
        $[31] = t15;
        $[32] = t16;
    }
    else {
        t16 = $[32];
    }
    var t17;
    if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = <ink_js_1.Box paddingX={1}><ink_js_1.Text dimColor={true} italic={true}><Byline_js_1.Byline><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Space" action="select"/><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="confirm"/><ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Confirmation" fallback="Esc" description="cancel"/></Byline_js_1.Byline></ink_js_1.Text></ink_js_1.Box>;
        $[33] = t17;
    }
    else {
        t17 = $[33];
    }
    var t18;
    if ($[34] !== t16) {
        t18 = <>{t16}{t17}</>;
        $[34] = t16;
        $[35] = t18;
    }
    else {
        t18 = $[35];
    }
    return t18;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUNhbGxiYWNrIiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJncmFjZWZ1bFNodXRkb3duIiwid3JpdGVUb1N0ZG91dCIsIkJveCIsImNvbG9yIiwiVGV4dCIsInVzZVRoZW1lIiwiYWRkTWNwQ29uZmlnIiwiZ2V0QWxsTWNwQ29uZmlncyIsIkNvbmZpZ1Njb3BlIiwiTWNwU2VydmVyQ29uZmlnIiwiU2NvcGVkTWNwU2VydmVyQ29uZmlnIiwicGx1cmFsIiwiQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50IiwiU2VsZWN0TXVsdGkiLCJCeWxpbmUiLCJEaWFsb2ciLCJLZXlib2FyZFNob3J0Y3V0SGludCIsIlByb3BzIiwic2VydmVycyIsIlJlY29yZCIsInNjb3BlIiwib25Eb25lIiwiTUNQU2VydmVyRGVza3RvcEltcG9ydERpYWxvZyIsInQwIiwiJCIsIl9jIiwidDEiLCJPYmplY3QiLCJrZXlzIiwic2VydmVyTmFtZXMiLCJ0MiIsIlN5bWJvbCIsImZvciIsImV4aXN0aW5nU2VydmVycyIsInNldEV4aXN0aW5nU2VydmVycyIsInQzIiwidDQiLCJ0aGVuIiwidDUiLCJzZXJ2ZXJzXzAiLCJmaWx0ZXIiLCJuYW1lIiwidW5kZWZpbmVkIiwiY29sbGlzaW9ucyIsIm9uU3VibWl0Iiwic2VsZWN0ZWRTZXJ2ZXJzIiwiaW1wb3J0ZWRDb3VudCIsInNlcnZlck5hbWUiLCJzZXJ2ZXJDb25maWciLCJmaW5hbE5hbWUiLCJjb3VudGVyIiwiZG9uZSIsInRoZW1lIiwidDYiLCJpbXBvcnRlZENvdW50XzAiLCJ0NyIsImhhbmRsZUVzY0NhbmNlbCIsInQ4IiwibGVuZ3RoIiwidDkiLCJ0MTAiLCJ0MTEiLCJ0MTIiLCJ0MTMiLCJ0MTQiLCJtYXAiLCJzZXJ2ZXIiLCJsYWJlbCIsImluY2x1ZGVzIiwidmFsdWUiLCJuYW1lXzAiLCJ0MTUiLCJ0MTYiLCJ0MTciLCJ0MTgiXSwic291cmNlcyI6WyJNQ1BTZXJ2ZXJEZXNrdG9wSW1wb3J0RGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGdyYWNlZnVsU2h1dGRvd24gfSBmcm9tICdzcmMvdXRpbHMvZ3JhY2VmdWxTaHV0ZG93bi5qcydcbmltcG9ydCB7IHdyaXRlVG9TdGRvdXQgfSBmcm9tICdzcmMvdXRpbHMvcHJvY2Vzcy5qcydcbmltcG9ydCB7IEJveCwgY29sb3IsIFRleHQsIHVzZVRoZW1lIH0gZnJvbSAnLi4vaW5rLmpzJ1xuaW1wb3J0IHsgYWRkTWNwQ29uZmlnLCBnZXRBbGxNY3BDb25maWdzIH0gZnJvbSAnLi4vc2VydmljZXMvbWNwL2NvbmZpZy5qcydcbmltcG9ydCB0eXBlIHtcbiAgQ29uZmlnU2NvcGUsXG4gIE1jcFNlcnZlckNvbmZpZyxcbiAgU2NvcGVkTWNwU2VydmVyQ29uZmlnLFxufSBmcm9tICcuLi9zZXJ2aWNlcy9tY3AvdHlwZXMuanMnXG5pbXBvcnQgeyBwbHVyYWwgfSBmcm9tICcuLi91dGlscy9zdHJpbmdVdGlscy5qcydcbmltcG9ydCB7IENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCB9IGZyb20gJy4vQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgU2VsZWN0TXVsdGkgfSBmcm9tICcuL0N1c3RvbVNlbGVjdC9TZWxlY3RNdWx0aS5qcydcbmltcG9ydCB7IEJ5bGluZSB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9CeWxpbmUuanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgS2V5Ym9hcmRTaG9ydGN1dEhpbnQgfSBmcm9tICcuL2Rlc2lnbi1zeXN0ZW0vS2V5Ym9hcmRTaG9ydGN1dEhpbnQuanMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHNlcnZlcnM6IFJlY29yZDxzdHJpbmcsIE1jcFNlcnZlckNvbmZpZz5cbiAgc2NvcGU6IENvbmZpZ1Njb3BlXG4gIG9uRG9uZSgpOiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNQ1BTZXJ2ZXJEZXNrdG9wSW1wb3J0RGlhbG9nKHtcbiAgc2VydmVycyxcbiAgc2NvcGUsXG4gIG9uRG9uZSxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3Qgc2VydmVyTmFtZXMgPSBPYmplY3Qua2V5cyhzZXJ2ZXJzKVxuICBjb25zdCBbZXhpc3RpbmdTZXJ2ZXJzLCBzZXRFeGlzdGluZ1NlcnZlcnNdID0gdXNlU3RhdGU8XG4gICAgUmVjb3JkPHN0cmluZywgU2NvcGVkTWNwU2VydmVyQ29uZmlnPlxuICA+KHt9KVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdm9pZCBnZXRBbGxNY3BDb25maWdzKCkudGhlbigoeyBzZXJ2ZXJzIH0pID0+IHNldEV4aXN0aW5nU2VydmVycyhzZXJ2ZXJzKSlcbiAgfSwgW10pXG5cbiAgY29uc3QgY29sbGlzaW9ucyA9IHNlcnZlck5hbWVzLmZpbHRlcihcbiAgICBuYW1lID0+IGV4aXN0aW5nU2VydmVyc1tuYW1lXSAhPT0gdW5kZWZpbmVkLFxuICApXG5cbiAgYXN5bmMgZnVuY3Rpb24gb25TdWJtaXQoc2VsZWN0ZWRTZXJ2ZXJzOiBzdHJpbmdbXSkge1xuICAgIGxldCBpbXBvcnRlZENvdW50ID0gMFxuXG4gICAgZm9yIChjb25zdCBzZXJ2ZXJOYW1lIG9mIHNlbGVjdGVkU2VydmVycykge1xuICAgICAgY29uc3Qgc2VydmVyQ29uZmlnID0gc2VydmVyc1tzZXJ2ZXJOYW1lXVxuICAgICAgaWYgKHNlcnZlckNvbmZpZykge1xuICAgICAgICAvLyBJZiB0aGUgc2VydmVyIG5hbWUgYWxyZWFkeSBleGlzdHMsIGZpbmQgYSBuZXcgbmFtZSB3aXRoIF8xLCBfMiwgZXRjLlxuICAgICAgICBsZXQgZmluYWxOYW1lID0gc2VydmVyTmFtZVxuICAgICAgICBpZiAoZXhpc3RpbmdTZXJ2ZXJzW2ZpbmFsTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGxldCBjb3VudGVyID0gMVxuICAgICAgICAgIHdoaWxlIChleGlzdGluZ1NlcnZlcnNbYCR7c2VydmVyTmFtZX1fJHtjb3VudGVyfWBdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvdW50ZXIrK1xuICAgICAgICAgIH1cbiAgICAgICAgICBmaW5hbE5hbWUgPSBgJHtzZXJ2ZXJOYW1lfV8ke2NvdW50ZXJ9YFxuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgYWRkTWNwQ29uZmlnKGZpbmFsTmFtZSwgc2VydmVyQ29uZmlnLCBzY29wZSlcbiAgICAgICAgaW1wb3J0ZWRDb3VudCsrXG4gICAgICB9XG4gICAgfVxuXG4gICAgZG9uZShpbXBvcnRlZENvdW50KVxuICB9XG5cbiAgY29uc3QgW3RoZW1lXSA9IHVzZVRoZW1lKClcblxuICAvLyBEZWZpbmUgZG9uZSBiZWZvcmUgdXNpbmcgaW4gdXNlQ2FsbGJhY2tcbiAgY29uc3QgZG9uZSA9IHVzZUNhbGxiYWNrKFxuICAgIChpbXBvcnRlZENvdW50OiBudW1iZXIpID0+IHtcbiAgICAgIGlmIChpbXBvcnRlZENvdW50ID4gMCkge1xuICAgICAgICB3cml0ZVRvU3Rkb3V0KFxuICAgICAgICAgIGBcXG4ke2NvbG9yKCdzdWNjZXNzJywgdGhlbWUpKGBTdWNjZXNzZnVsbHkgaW1wb3J0ZWQgJHtpbXBvcnRlZENvdW50fSBNQ1AgJHtwbHVyYWwoaW1wb3J0ZWRDb3VudCwgJ3NlcnZlcicpfSB0byAke3Njb3BlfSBjb25maWcuYCl9XFxuYCxcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd3JpdGVUb1N0ZG91dCgnXFxuTm8gc2VydmVycyB3ZXJlIGltcG9ydGVkLicpXG4gICAgICB9XG4gICAgICBvbkRvbmUoKVxuXG4gICAgICB2b2lkIGdyYWNlZnVsU2h1dGRvd24oKVxuICAgIH0sXG4gICAgW3RoZW1lLCBzY29wZSwgb25Eb25lXSxcbiAgKVxuXG4gIC8vIEhhbmRsZSBFU0MgdG8gY2FuY2VsIChpbXBvcnQgMCBzZXJ2ZXJzKVxuICBjb25zdCBoYW5kbGVFc2NDYW5jZWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZG9uZSgwKVxuICB9LCBbZG9uZV0pXG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPERpYWxvZ1xuICAgICAgICB0aXRsZT1cIkltcG9ydCBNQ1AgU2VydmVycyBmcm9tIENsYXVkZSBEZXNrdG9wXCJcbiAgICAgICAgc3VidGl0bGU9e2BGb3VuZCAke3NlcnZlck5hbWVzLmxlbmd0aH0gTUNQICR7cGx1cmFsKHNlcnZlck5hbWVzLmxlbmd0aCwgJ3NlcnZlcicpfSBpbiBDbGF1ZGUgRGVza3RvcC5gfVxuICAgICAgICBjb2xvcj1cInN1Y2Nlc3NcIlxuICAgICAgICBvbkNhbmNlbD17aGFuZGxlRXNjQ2FuY2VsfVxuICAgICAgICBoaWRlSW5wdXRHdWlkZVxuICAgICAgPlxuICAgICAgICB7Y29sbGlzaW9ucy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgIE5vdGU6IFNvbWUgc2VydmVycyBhbHJlYWR5IGV4aXN0IHdpdGggdGhlIHNhbWUgbmFtZS4gSWYgc2VsZWN0ZWQsXG4gICAgICAgICAgICB0aGV5IHdpbGwgYmUgaW1wb3J0ZWQgd2l0aCBhIG51bWJlcmVkIHN1ZmZpeC5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICl9XG4gICAgICAgIDxUZXh0PlBsZWFzZSBzZWxlY3QgdGhlIHNlcnZlcnMgeW91IHdhbnQgdG8gaW1wb3J0OjwvVGV4dD5cblxuICAgICAgICA8U2VsZWN0TXVsdGlcbiAgICAgICAgICBvcHRpb25zPXtzZXJ2ZXJOYW1lcy5tYXAoc2VydmVyID0+ICh7XG4gICAgICAgICAgICBsYWJlbDogYCR7c2VydmVyfSR7Y29sbGlzaW9ucy5pbmNsdWRlcyhzZXJ2ZXIpID8gJyAoYWxyZWFkeSBleGlzdHMpJyA6ICcnfWAsXG4gICAgICAgICAgICB2YWx1ZTogc2VydmVyLFxuICAgICAgICAgIH0pKX1cbiAgICAgICAgICBkZWZhdWx0VmFsdWU9e3NlcnZlck5hbWVzLmZpbHRlcihuYW1lID0+ICFjb2xsaXNpb25zLmluY2x1ZGVzKG5hbWUpKX0gLy8gT25seSBwcmVzZWxlY3Qgbm9uLWNvbGxpZGluZyBzZXJ2ZXJzXG4gICAgICAgICAgb25TdWJtaXQ9e29uU3VibWl0fVxuICAgICAgICAgIG9uQ2FuY2VsPXtoYW5kbGVFc2NDYW5jZWx9XG4gICAgICAgICAgaGlkZUluZGV4ZXNcbiAgICAgICAgLz5cbiAgICAgIDwvRGlhbG9nPlxuICAgICAgPEJveCBwYWRkaW5nWD17MX0+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yIGl0YWxpYz5cbiAgICAgICAgICA8QnlsaW5lPlxuICAgICAgICAgICAgPEtleWJvYXJkU2hvcnRjdXRIaW50IHNob3J0Y3V0PVwiU3BhY2VcIiBhY3Rpb249XCJzZWxlY3RcIiAvPlxuICAgICAgICAgICAgPEtleWJvYXJkU2hvcnRjdXRIaW50IHNob3J0Y3V0PVwiRW50ZXJcIiBhY3Rpb249XCJjb25maXJtXCIgLz5cbiAgICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgICAgYWN0aW9uPVwiY29uZmlybTpub1wiXG4gICAgICAgICAgICAgIGNvbnRleHQ9XCJDb25maXJtYXRpb25cIlxuICAgICAgICAgICAgICBmYWxsYmFjaz1cIkVzY1wiXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uPVwiY2FuY2VsXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9CeWxpbmU+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgIDwvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLElBQUlDLFdBQVcsRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUMvRCxTQUFTQyxnQkFBZ0IsUUFBUSwrQkFBK0I7QUFDaEUsU0FBU0MsYUFBYSxRQUFRLHNCQUFzQjtBQUNwRCxTQUFTQyxHQUFHLEVBQUVDLEtB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
