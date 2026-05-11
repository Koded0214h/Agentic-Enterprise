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
exports.call = void 0;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var select_js_1 = require("../../components/CustomSelect/select.js");
var Dialog_js_1 = require("../../components/design-system/Dialog.js");
var ink_js_1 = require("../../ink.js");
var AppState_js_1 = require("../../state/AppState.js");
var auth_js_1 = require("../../utils/auth.js");
var browser_js_1 = require("../../utils/browser.js");
var common_js_1 = require("../../utils/claudeInChrome/common.js");
var setup_js_1 = require("../../utils/claudeInChrome/setup.js");
var config_js_1 = require("../../utils/config.js");
var env_js_1 = require("../../utils/env.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var CHROME_EXTENSION_URL = 'https://claude.ai/chrome';
var CHROME_PERMISSIONS_URL = 'https://clau.de/chrome/permissions';
var CHROME_RECONNECT_URL = 'https://clau.de/chrome/reconnect';
function ClaudeInChromeMenu(t0) {
    var $ = (0, compiler_runtime_1.c)(41);
    var onDone = t0.onDone, installed = t0.isExtensionInstalled, configEnabled = t0.configEnabled, isClaudeAISubscriber = t0.isClaudeAISubscriber, isWSL = t0.isWSL;
    var mcpClients = (0, AppState_js_1.useAppState)(_temp);
    var _a = (0, react_1.useState)(0), selectKey = _a[0], setSelectKey = _a[1];
    var _b = (0, react_1.useState)(configEnabled !== null && configEnabled !== void 0 ? configEnabled : false), enabledByDefault = _b[0], setEnabledByDefault = _b[1];
    var _d = (0, react_1.useState)(false), showInstallHint = _d[0], setShowInstallHint = _d[1];
    var _e = (0, react_1.useState)(installed), isExtensionInstalled = _e[0], setIsExtensionInstalled = _e[1];
    var t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = false && (0, envUtils_js_1.isRunningOnHomespace)();
        $[0] = t1;
    }
    else {
        t1 = $[0];
    }
    var isHomespace = t1;
    var t2;
    if ($[1] !== mcpClients) {
        t2 = mcpClients.find(_temp2);
        $[1] = mcpClients;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var chromeClient = t2;
    var isConnected = (chromeClient === null || chromeClient === void 0 ? void 0 : chromeClient.type) === "connected";
    var t3;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = function openUrl(url) {
            if (isHomespace) {
                (0, browser_js_1.openBrowser)(url);
            }
            else {
                (0, common_js_1.openInChrome)(url);
            }
        };
        $[3] = t3;
    }
    else {
        t3 = $[3];
    }
    var openUrl = t3;
    var t4;
    if ($[4] !== enabledByDefault) {
        t4 = function handleAction(action) {
            bb22: switch (action) {
                case "install-extension":
                    {
                        setSelectKey(_temp3);
                        setShowInstallHint(true);
                        openUrl(CHROME_EXTENSION_URL);
                        break bb22;
                    }
                case "reconnect":
                    {
                        setSelectKey(_temp4);
                        (0, setup_js_1.isChromeExtensionInstalled)().then(function (installed_0) {
                            setIsExtensionInstalled(installed_0);
                            if (installed_0) {
                                setShowInstallHint(false);
                            }
                        });
                        openUrl(CHROME_RECONNECT_URL);
                        break bb22;
                    }
                case "manage-permissions":
                    {
                        setSelectKey(_temp5);
                        openUrl(CHROME_PERMISSIONS_URL);
                        break bb22;
                    }
                case "toggle-default":
                    {
                        var newValue_1 = !enabledByDefault;
                        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { claudeInChromeDefaultEnabled: newValue_1 })); });
                        setEnabledByDefault(newValue_1);
                    }
            }
        };
        $[4] = enabledByDefault;
        $[5] = t4;
    }
    else {
        t4 = $[5];
    }
    var handleAction = t4;
    var options;
    if ($[6] !== enabledByDefault || $[7] !== isExtensionInstalled) {
        options = [];
        var requiresExtensionSuffix = isExtensionInstalled ? "" : " (requires extension)";
        if (!isExtensionInstalled && !isHomespace) {
            var t5_1;
            if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
                t5_1 = {
                    label: "Install Chrome extension",
                    value: "install-extension"
                };
                $[9] = t5_1;
            }
            else {
                t5_1 = $[9];
            }
            options.push(t5_1);
        }
        var t5_2;
        if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
            t5_2 = <ink_js_1.Text>Manage permissions</ink_js_1.Text>;
            $[10] = t5_2;
        }
        else {
            t5_2 = $[10];
        }
        var t6_1;
        if ($[11] !== requiresExtensionSuffix) {
            t6_1 = {
                label: <>{t5_2}<ink_js_1.Text dimColor={true}>{requiresExtensionSuffix}</ink_js_1.Text></>,
                value: "manage-permissions"
            };
            $[11] = requiresExtensionSuffix;
            $[12] = t6_1;
        }
        else {
            t6_1 = $[12];
        }
        var t7_1;
        if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
            t7_1 = <ink_js_1.Text>Reconnect extension</ink_js_1.Text>;
            $[13] = t7_1;
        }
        else {
            t7_1 = $[13];
        }
        var t8_1;
        if ($[14] !== requiresExtensionSuffix) {
            t8_1 = {
                label: <>{t7_1}<ink_js_1.Text dimColor={true}>{requiresExtensionSuffix}</ink_js_1.Text></>,
                value: "reconnect"
            };
            $[14] = requiresExtensionSuffix;
            $[15] = t8_1;
        }
        else {
            t8_1 = $[15];
        }
        var t9_1 = "Enabled by default: ".concat(enabledByDefault ? "Yes" : "No");
        var t10_1;
        if ($[16] !== t9_1) {
            t10_1 = {
                label: t9_1,
                value: "toggle-default"
            };
            $[16] = t9_1;
            $[17] = t10_1;
        }
        else {
            t10_1 = $[17];
        }
        options.push(t6_1, t8_1, t10_1);
        $[6] = enabledByDefault;
        $[7] = isExtensionInstalled;
        $[8] = options;
    }
    else {
        options = $[8];
    }
    var isDisabled = isWSL || true && !isClaudeAISubscriber;
    var t5;
    if ($[18] !== onDone) {
        t5 = function () { return onDone(); };
        $[18] = onDone;
        $[19] = t5;
    }
    else {
        t5 = $[19];
    }
    var t6;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = <ink_js_1.Text>Claude in Chrome works with the Chrome extension to let you control your browser directly from Claude Code. Navigate websites, fill forms, capture screenshots, record GIFs, and debug with console logs and network requests.</ink_js_1.Text>;
        $[20] = t6;
    }
    else {
        t6 = $[20];
    }
    var t7;
    if ($[21] !== isWSL) {
        t7 = isWSL && <ink_js_1.Text color="error">Claude in Chrome is not supported in WSL at this time.</ink_js_1.Text>;
        $[21] = isWSL;
        $[22] = t7;
    }
    else {
        t7 = $[22];
    }
    var t8;
    if ($[23] !== isClaudeAISubscriber) {
        t8 = true && !isClaudeAISubscriber && <ink_js_1.Text color="error">Claude in Chrome requires a claude.ai subscription.</ink_js_1.Text>;
        $[23] = isClaudeAISubscriber;
        $[24] = t8;
    }
    else {
        t8 = $[24];
    }
    var t9;
    if ($[25] !== handleAction || $[26] !== isConnected || $[27] !== isDisabled || $[28] !== isExtensionInstalled || $[29] !== options || $[30] !== selectKey || $[31] !== showInstallHint) {
        t9 = !isDisabled && <>{!isHomespace && <ink_js_1.Box flexDirection="column"><ink_js_1.Text>Status:{" "}{isConnected ? <ink_js_1.Text color="success">Enabled</ink_js_1.Text> : <ink_js_1.Text color="inactive">Disabled</ink_js_1.Text>}</ink_js_1.Text><ink_js_1.Text>Extension:{" "}{isExtensionInstalled ? <ink_js_1.Text color="success">Installed</ink_js_1.Text> : <ink_js_1.Text color="warning">Not detected</ink_js_1.Text>}</ink_js_1.Text></ink_js_1.Box>}<select_js_1.Select key={selectKey} options={options} onChange={handleAction} hideIndexes={true}/>{showInstallHint && <ink_js_1.Text color="warning">Once installed, select {"\"Reconnect extension\""} to connect.</ink_js_1.Text>}<ink_js_1.Text><ink_js_1.Text dimColor={true}>Usage: </ink_js_1.Text><ink_js_1.Text>claude --chrome</ink_js_1.Text><ink_js_1.Text dimColor={true}> or </ink_js_1.Text><ink_js_1.Text>claude --no-chrome</ink_js_1.Text></ink_js_1.Text><ink_js_1.Text dimColor={true}>Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings to control which sites Claude can browse, click, and type on.</ink_js_1.Text></>;
        $[25] = handleAction;
        $[26] = isConnected;
        $[27] = isDisabled;
        $[28] = isExtensionInstalled;
        $[29] = options;
        $[30] = selectKey;
        $[31] = showInstallHint;
        $[32] = t9;
    }
    else {
        t9 = $[32];
    }
    var t10;
    if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = <ink_js_1.Text dimColor={true}>Learn more: https://code.claude.com/docs/en/chrome</ink_js_1.Text>;
        $[33] = t10;
    }
    else {
        t10 = $[33];
    }
    var t11;
    if ($[34] !== t7 || $[35] !== t8 || $[36] !== t9) {
        t11 = <ink_js_1.Box flexDirection="column" gap={1}>{t6}{t7}{t8}{t9}{t10}</ink_js_1.Box>;
        $[34] = t7;
        $[35] = t8;
        $[36] = t9;
        $[37] = t11;
    }
    else {
        t11 = $[37];
    }
    var t12;
    if ($[38] !== t11 || $[39] !== t5) {
        t12 = <Dialog_js_1.Dialog title="Claude in Chrome (Beta)" onCancel={t5} color="chromeYellow">{t11}</Dialog_js_1.Dialog>;
        $[38] = t11;
        $[39] = t5;
        $[40] = t12;
    }
    else {
        t12 = $[40];
    }
    return t12;
}
function _temp5(k) {
    return k + 1;
}
function _temp4(k_0) {
    return k_0 + 1;
}
function _temp3(k_1) {
    return k_1 + 1;
}
function _temp2(c) {
    return c.name === common_js_1.CLAUDE_IN_CHROME_MCP_SERVER_NAME;
}
function _temp(s) {
    return s.mcp.clients;
}
var call = function (onDone) {
    return __awaiter(this, void 0, void 0, function () {
        var isExtensionInstalled, config, isSubscriber, isWSL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, setup_js_1.isChromeExtensionInstalled)()];
                case 1:
                    isExtensionInstalled = _a.sent();
                    config = (0, config_js_1.getGlobalConfig)();
                    isSubscriber = (0, auth_js_1.isClaudeAISubscriber)();
                    isWSL = env_js_1.env.isWslEnvironment();
                    return [2 /*return*/, <ClaudeInChromeMenu onDone={onDone} isExtensionInstalled={isExtensionInstalled} configEnabled={config.claudeInChromeDefaultEnabled} isClaudeAISubscriber={isSubscriber} isWSL={isWSL}/>];
            }
        });
    });
};
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZVN0YXRlIiwiT3B0aW9uV2l0aERlc2NyaXB0aW9uIiwiU2VsZWN0IiwiRGlhbG9nIiwiQm94IiwiVGV4dCIsInVzZUFwcFN0YXRlIiwiaXNDbGF1ZGVBSVN1YnNjcmliZXIiLCJvcGVuQnJvd3NlciIsIkNMQVVERV9JTl9DSFJPTUVfTUNQX1NFUlZFUl9OQU1FIiwib3BlbkluQ2hyb21lIiwiaXNDaHJvbWVFeHRlbnNpb25JbnN0YWxsZWQiLCJnZXRHbG9iYWxDb25maWciLCJzYXZlR2xvYmFsQ29uZmlnIiwiZW52IiwiaXNSdW5uaW5nT25Ib21lc3BhY2UiLCJDSFJPTUVfRVhURU5TSU9OX1VSTCIsIkNIUk9NRV9QRVJNSVNTSU9OU19VUkwiLCJDSFJPTUVfUkVDT05ORUNUX1VSTCIsIk1lbnVBY3Rpb24iLCJQcm9wcyIsIm9uRG9uZSIsInJlc3VsdCIsImlzRXh0ZW5zaW9uSW5zdGFsbGVkIiwiY29uZmlnRW5hYmxlZCIsImlzV1NMIiwiQ2xhdWRlSW5DaHJvbWVNZW51IiwidDAiLCIkIiwiX2MiLCJpbnN0YWxsZWQiLCJtY3BDbGllbnRzIiwiX3RlbXAiLCJzZWxlY3RLZXkiLCJzZXRTZWxlY3RLZXkiLCJlbmFibGVkQnlEZWZhdWx0Iiwic2V0RW5hYmxlZEJ5RGVmYXVsdCIsInNob3dJbnN0YWxsSGludCIsInNldFNob3dJbnN0YWxsSGludCIsInNldElzRXh0ZW5zaW9uSW5zdGFsbGVkIiwidDEiLCJTeW1ib2wiLCJmb3IiLCJpc0hvbWVzcGFjZSIsInQyIiwiZmluZCIsIl90ZW1wMiIsImNocm9tZUNsaWVudCIsImlzQ29ubmVjdGVkIiwidHlwZSIsInQzIiwib3BlblVybCIsInVybCIsInQ0IiwiaGFuZGxlQWN0aW9uIiwiYWN0aW9uIiwiYmIyMiIsIl90ZW1wMyIsIl90ZW1wNCIsInRoZW4iLCJpbnN0YWxsZWRfMCIsIl90ZW1wNSIsIm5ld1ZhbHVlIiwiY3VycmVudCIsImNsYXVkZUluQ2hyb21lRGVmYXVsdEVuYWJsZWQiLCJvcHRpb25zIiwicmVxdWlyZXNFeHRlbnNpb25TdWZmaXgiLCJ0NSIsImxhYmVsIiwidmFsdWUiLCJwdXNoIiwidDYiLCJ0NyIsInQ4IiwidDkiLCJ0MTAiLCJpc0Rpc2FibGVkIiwidDExIiwidDEyIiwiayIsImtfMCIsImtfMSIsImMiLCJuYW1lIiwicyIsIm1jcCIsImNsaWVudHMiLCJjYWxsIiwiUHJvbWlzZSIsIlJlYWN0Tm9kZSIsImNvbmZpZyIsImlzU3Vic2NyaWJlciIsImlzV3NsRW52aXJvbm1lbnQiXSwic291cmNlcyI6WyJjaHJvbWUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgdHlwZSBPcHRpb25XaXRoRGVzY3JpcHRpb24sXG4gIFNlbGVjdCxcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9DdXN0b21TZWxlY3Qvc2VsZWN0LmpzJ1xuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kZXNpZ24tc3lzdGVtL0RpYWxvZy5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IHVzZUFwcFN0YXRlIH0gZnJvbSAnLi4vLi4vc3RhdGUvQXBwU3RhdGUuanMnXG5pbXBvcnQgeyBpc0NsYXVkZUFJU3Vic2NyaWJlciB9IGZyb20gJy4uLy4uL3V0aWxzL2F1dGguanMnXG5pbXBvcnQgeyBvcGVuQnJvd3NlciB9IGZyb20gJy4uLy4uL3V0aWxzL2Jyb3dzZXIuanMnXG5pbXBvcnQge1xuICBDTEFVREVfSU5fQ0hST01FX01DUF9TRVJWRVJfTkFNRSxcbiAgb3BlbkluQ2hyb21lLFxufSBmcm9tICcuLi8uLi91dGlscy9jbGF1ZGVJbkNocm9tZS9jb21tb24uanMnXG5pbXBvcnQgeyBpc0Nocm9tZUV4dGVuc2lvbkluc3RhbGxlZCB9IGZyb20gJy4uLy4uL3V0aWxzL2NsYXVkZUluQ2hyb21lL3NldHVwLmpzJ1xuaW1wb3J0IHsgZ2V0R2xvYmFsQ29uZmlnLCBzYXZlR2xvYmFsQ29uZmlnIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnLmpzJ1xuaW1wb3J0IHsgZW52IH0gZnJvbSAnLi4vLi4vdXRpbHMvZW52LmpzJ1xuaW1wb3J0IHsgaXNSdW5uaW5nT25Ib21lc3BhY2UgfSBmcm9tICcuLi8uLi91dGlscy9lbnZVdGlscy5qcydcblxuY29uc3QgQ0hST01FX0VYVEVOU0lPTl9VUkwgPSAnaHR0cHM6Ly9jbGF1ZGUuYWkvY2hyb21lJ1xuY29uc3QgQ0hST01FX1BFUk1JU1NJT05TX1VSTCA9ICdodHRwczovL2NsYXUuZGUvY2hyb21lL3Blcm1pc3Npb25zJ1xuY29uc3QgQ0hST01FX1JFQ09OTkVDVF9VUkwgPSAnaHR0cHM6Ly9jbGF1LmRlL2Nocm9tZS9yZWNvbm5lY3QnXG5cbnR5cGUgTWVudUFjdGlvbiA9XG4gIHwgJ2luc3RhbGwtZXh0ZW5zaW9uJ1xuICB8ICdyZWNvbm5lY3QnXG4gIHwgJ21hbmFnZS1wZXJtaXNzaW9ucydcbiAgfCAndG9nZ2xlLWRlZmF1bHQnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIG9uRG9uZTogKHJlc3VsdD86IHN0cmluZykgPT4gdm9pZFxuICBpc0V4dGVuc2lvbkluc3RhbGxlZDogYm9vbGVhblxuICBjb25maWdFbmFibGVkOiBib29sZWFuIHwgdW5kZWZpbmVkXG4gIGlzQ2xhdWRlQUlTdWJzY3JpYmVyOiBib29sZWFuXG4gIGlzV1NMOiBib29sZWFuXG59XG5cbmZ1bmN0aW9uIENsYXVkZUluQ2hyb21lTWVudSh7XG4gIG9uRG9uZSxcbiAgaXNFeHRlbnNpb25JbnN0YWxsZWQ6IGluc3RhbGxlZCxcbiAgY29uZmlnRW5hYmxlZCxcbiAgaXNDbGF1ZGVBSVN1YnNjcmliZXIsXG4gIGlzV1NMLFxufTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBtY3BDbGllbnRzID0gdXNlQXBwU3RhdGUocyA9PiBzLm1jcC5jbGllbnRzKVxuICBjb25zdCBbc2VsZWN0S2V5LCBzZXRTZWxlY3RLZXldID0gdXNlU3RhdGUoMClcbiAgY29uc3QgW2VuYWJsZWRCeURlZmF1bHQsIHNldEVuYWJsZWRCeURlZmF1bHRdID0gdXNlU3RhdGUoXG4gICAgY29uZmlnRW5hYmxlZCA/PyBmYWxzZSxcbiAgKVxuICBjb25zdCBbc2hvd0luc3RhbGxIaW50LCBzZXRTaG93SW5zdGFsbEhpbnRdID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpc0V4dGVuc2lvbkluc3RhbGxlZCwgc2V0SXNFeHRlbnNpb25JbnN0YWxsZWRdID0gdXNlU3RhdGUoaW5zdGFsbGVkKVxuXG4gIGNvbnN0IGlzSG9tZXNwYWNlID0gXCJleHRlcm5hbFwiID09PSAnYW50JyAmJiBpc1J1bm5pbmdPbkhvbWVzcGFjZSgpXG5cbiAgY29uc3QgY2hyb21lQ2xpZW50ID0gbWNwQ2xpZW50cy5maW5kKFxuICAgIGMgPT4gYy5uYW1lID09PSBDTEFVREVfSU5fQ0hST01FX01DUF9TRVJWRVJfTkFNRSxcbiAgKVxuICBjb25zdCBpc0Nvbm5lY3RlZCA9IGNocm9tZUNsaWVudD8udHlwZSA9PT0gJ2Nvbm5lY3RlZCdcblxuICBmdW5jdGlvbiBvcGVuVXJsKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGlzSG9tZXNwYWNlKSB7XG4gICAgICB2b2lkIG9wZW5Ccm93c2VyKHVybClcbiAgICB9IGVsc2Uge1xuICAgICAgdm9pZCBvcGVuSW5DaHJvbWUodXJsKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUFjdGlvbihhY3Rpb246IE1lbnVBY3Rpb24pOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnaW5zdGFsbC1leHRlbnNpb24nOlxuICAgICAgICBzZXRTZWxlY3RLZXkoayA9PiBrICsgMSlcbiAgICAgICAgc2V0U2hvd0luc3RhbGxIaW50KHRydWUpXG4gICAgICAgIG9wZW5VcmwoQ0hST01FX0VYVEVOU0lPTl9VUkwpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdyZWNvbm5lY3QnOlxuICAgICAgICBzZXRTZWxlY3RLZXkoayA9PiBrICsgMSlcbiAgICAgICAgdm9pZCBpc0Nocm9tZUV4dGVuc2lvbkluc3RhbGxlZCgpLnRoZW4oaW5zdGFsbGVkID0+IHtcbiAgICAgICAgICBzZXRJc0V4dGVuc2lvbkluc3RhbGxlZChpbnN0YWxsZWQpXG4gICAgICAgICAgaWYgKGluc3RhbGxlZCkge1xuICAgICAgICAgICAgc2V0U2hvd0luc3RhbGxIaW50KGZhbHNlKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgb3BlblVybChDSFJPTUVfUkVDT05ORUNUX1VSTClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ21hbmFnZS1wZXJtaXNzaW9ucyc6XG4gICAgICAgIHNldFNlbGVjdEtleShrID0+IGsgKyAxKVxuICAgICAgICBvcGVuVXJsKENIUk9NRV9QRVJNSVNTSU9OU19VUkwpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd0b2dnbGUtZGVmYXVsdCc6IHtcbiAgICAgICAgY29uc3QgbmV3VmFsdWUgPSAhZW5hYmxlZEJ5RGVmYXVsdFxuICAgICAgICBzYXZlR2xvYmFsQ29uZmlnKGN1cnJlbnQgPT4gKHtcbiAgICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICAgIGNsYXVkZUluQ2hyb21lRGVmYXVsdEVuYWJsZWQ6IG5ld1ZhbHVlLFxuICAgICAgICB9KSlcbiAgICAgICAgc2V0RW5hYmxlZEJ5RGVmYXVsdChuZXdWYWx1ZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBvcHRpb25zOiBPcHRpb25XaXRoRGVzY3JpcHRpb248TWVudUFjdGlvbj5bXSA9IFtdXG4gIGNvbnN0IHJlcXVpcmVzRXh0ZW5zaW9uU3VmZml4ID0gaXNFeHRlbnNpb25JbnN0YWxsZWRcbiAgICA/ICcnXG4gICAgOiAnIChyZXF1aXJlcyBleHRlbnNpb24pJ1xuXG4gIGlmICghaXNFeHRlbnNpb25JbnN0YWxsZWQgJiYgIWlzSG9tZXNwYWNlKSB7XG4gICAgb3B0aW9ucy5wdXNoKHtcbiAgICAgIGxhYmVsOiAnSW5zdGFsbCBDaHJvbWUgZXh0ZW5zaW9uJyxcbiAgICAgIHZhbHVlOiAnaW5zdGFsbC1leHRlbnNpb24nLFxuICAgIH0pXG4gIH1cblxuICBvcHRpb25zLnB1c2goXG4gICAge1xuICAgICAgbGFiZWw6IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8VGV4dD5NYW5hZ2UgcGVybWlzc2lvbnM8L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+e3JlcXVpcmVzRXh0ZW5zaW9uU3VmZml4fTwvVGV4dD5cbiAgICAgICAgPC8+XG4gICAgICApLFxuICAgICAgdmFsdWU6ICdtYW5hZ2UtcGVybWlzc2lvbnMnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8VGV4dD5SZWNvbm5lY3QgZXh0ZW5zaW9uPC9UZXh0PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPntyZXF1aXJlc0V4dGVuc2lvblN1ZmZpeH08L1RleHQ+XG4gICAgICAgIDwvPlxuICAgICAgKSxcbiAgICAgIHZhbHVlOiAncmVjb25uZWN0JyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiBgRW5hYmxlZCBieSBkZWZhdWx0OiAke2VuYWJsZWRCeURlZmF1bHQgPyAnWWVzJyA6ICdObyd9YCxcbiAgICAgIHZhbHVlOiAndG9nZ2xlLWRlZmF1bHQnLFxuICAgIH0sXG4gIClcblxuICBjb25zdCBpc0Rpc2FibGVkID1cbiAgICBpc1dTTCB8fCAoXCJleHRlcm5hbFwiICE9PSAnYW50JyAmJiAhaXNDbGF1ZGVBSVN1YnNjcmliZXIpXG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nXG4gICAgICB0aXRsZT1cIkNsYXVkZSBpbiBDaHJvbWUgKEJldGEpXCJcbiAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkRvbmUoKX1cbiAgICAgIGNvbG9yPVwiY2hyb21lWWVsbG93XCJcbiAgICA+XG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICBDbGF1ZGUgaW4gQ2hyb21lIHdvcmtzIHdpdGggdGhlIENocm9tZSBleHRlbnNpb24gdG8gbGV0IHlvdSBjb250cm9sXG4gICAgICAgICAgeW91ciBicm93c2VyIGRpcmVjdGx5IGZyb20gQ2xhdWRlIENvZGUuIE5hdmlnYXRlIHdlYnNpdGVzLCBmaWxsIGZvcm1zLFxuICAgICAgICAgIGNhcHR1cmUgc2NyZWVuc2hvdHMsIHJlY29yZCBHSUZzLCBhbmQgZGVidWcgd2l0aCBjb25zb2xlIGxvZ3MgYW5kXG4gICAgICAgICAgbmV0d29yayByZXF1ZXN0cy5cbiAgICAgICAgPC9UZXh0PlxuXG4gICAgICAgIHtpc1dTTCAmJiAoXG4gICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPlxuICAgICAgICAgICAgQ2xhdWRlIGluIENocm9tZSBpcyBub3Qgc3VwcG9ydGVkIGluIFdTTCBhdCB0aGlzIHRpbWUuXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICApfVxuXG5cbiAgICAgICAge1wiZXh0ZXJuYWxcIiAhPT0gJ2FudCcgJiYgIWlzQ2xhdWRlQUlTdWJzY3JpYmVyICYmIChcbiAgICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+XG4gICAgICAgICAgICBDbGF1ZGUgaW4gQ2hyb21lIHJlcXVpcmVzIGEgY2xhdWRlLmFpIHN1YnNjcmlwdGlvbi5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICl9XG5cbiAgICAgICAgeyFpc0Rpc2FibGVkICYmIChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgeyFpc0hvbWVzcGFjZSAmJiAoXG4gICAgICAgICAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgICAgICAgU3RhdHVzOnsnICd9XG4gICAgICAgICAgICAgICAgICB7aXNDb25uZWN0ZWQgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwic3VjY2Vzc1wiPkVuYWJsZWQ8L1RleHQ+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cImluYWN0aXZlXCI+RGlzYWJsZWQ8L1RleHQ+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgICAgIEV4dGVuc2lvbjp7JyAnfVxuICAgICAgICAgICAgICAgICAge2lzRXh0ZW5zaW9uSW5zdGFsbGVkID8gKFxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cInN1Y2Nlc3NcIj5JbnN0YWxsZWQ8L1RleHQ+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5Ob3QgZGV0ZWN0ZWQ8L1RleHQ+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPFNlbGVjdFxuICAgICAgICAgICAgICBrZXk9e3NlbGVjdEtleX1cbiAgICAgICAgICAgICAgb3B0aW9ucz17b3B0aW9uc31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZUFjdGlvbn1cbiAgICAgICAgICAgICAgaGlkZUluZGV4ZXNcbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIHtzaG93SW5zdGFsbEhpbnQgJiYgKFxuICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICBPbmNlIGluc3RhbGxlZCwgc2VsZWN0IHsnXCJSZWNvbm5lY3QgZXh0ZW5zaW9uXCInfSB0byBjb25uZWN0LlxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICApfVxuXG4gICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgZGltQ29sb3I+VXNhZ2U6IDwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQ+Y2xhdWRlIC0tY2hyb21lPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBkaW1Db2xvcj4gb3IgPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dD5jbGF1ZGUgLS1uby1jaHJvbWU8L1RleHQ+XG4gICAgICAgICAgICA8L1RleHQ+XG5cbiAgICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgICAgICAgICBTaXRlLWxldmVsIHBlcm1pc3Npb25zIGFyZSBpbmhlcml0ZWQgZnJvbSB0aGUgQ2hyb21lIGV4dGVuc2lvbi5cbiAgICAgICAgICAgICAgTWFuYWdlIHBlcm1pc3Npb25zIGluIHRoZSBDaHJvbWUgZXh0ZW5zaW9uIHNldHRpbmdzIHRvIGNvbnRyb2xcbiAgICAgICAgICAgICAgd2hpY2ggc2l0ZXMgQ2xhdWRlIGNhbiBicm93c2UsIGNsaWNrLCBhbmQgdHlwZSBvbi5cbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgICAgPFRleHQgZGltQ29sb3I+TGVhcm4gbW9yZTogaHR0cHM6Ly9jb2RlLmNsYXVkZS5jb20vZG9jcy9lbi9jaHJvbWU8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuXG5leHBvcnQgY29uc3QgY2FsbCA9IGFzeW5jIGZ1bmN0aW9uIChcbiAgb25Eb25lOiAocmVzdWx0Pzogc3RyaW5nKSA9PiB2b2lkLFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGU+IHtcbiAgY29uc3QgaXNFeHRlbnNpb25JbnN0YWxsZWQgPSBhd2FpdCBpc0Nocm9tZUV4dGVuc2lvbkluc3RhbGxlZCgpXG4gIGNvbnN0IGNvbmZpZyA9IGdldEdsb2JhbENvbmZpZygpXG4gIGNvbnN0IGlzU3Vic2NyaWJlciA9IGlzQ2xhdWRlQUlTdWJzY3JpYmVyKClcbiAgY29uc3QgaXNXU0wgPSBlbnYuaXNXc2xFbnZpcm9ubWVudCgpXG5cbiAgcmV0dXJuIChcbiAgICA8Q2xhdWRlSW5DaHJvbWVNZW51XG4gICAgICBvbkRvbmU9e29uRG9uZX1cbiAgICAgIGlzRXh0ZW5zaW9uSW5zdGFsbGVkPXtpc0V4dGVuc2lvbkluc3RhbGxlZH1cbiAgICAgIGNvbmZpZ0VuYWJsZWQ9e2NvbmZpZy5jbGF1ZGVJbkNocm9tZURlZmF1bHRFbmFibGVkfVxuICAgICAgaXNDbGF1ZGVBSVN1YnNjcmliZXI9e2lzU3Vic2NyaWJlcn1cbiAgICAgIGlzV1NMPXtpc1dTTH1cbiAgICAvPlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLElBQUlDLFFBQVEsUUFBUSxPQUFPO0FBQ3ZDLFNBQ0UsS0FBS0MscUJBQXFCLEVBQzFCQyxNQUFNLFFBQ0QseUNBQXlDO0FBQ2hELFNBQVNDLE1BQU0sUUFBUSwwQ0FBMEM7QUFDakUsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLFFBQVEsY0FBYztBQUN4QyxTQUFTQyxXQUFXLFFBQVEseUJBQXlCO0FBQ3JELFNBQVNDLG9CQUFvQixRQUFRLHFCQUFxQjtBQUMxRCxTQUFTQyxXQUFXLFFBQVEsd0JBQXdCO0FBQ3BELFNBQ0VDLGdDQUFnQyxFQUNoQ0MsWUFBWSxRQUNQLHNDQUFzQztBQUM3QyxTQUFTQywwQkFBMEIsUUFBUSxxQ0FBcUM7QUFDaEYsU0FBU0MsZUFBZSxFQUFFQyxnQkFBZ0IsUUFBUSx1QkFBdUI7QUFDekUsU0FBU0MsR0FBRyxRQUFRLG9CQUFvQjtBQUN4QyxTQUFTQyxvQkFBb0IsUUFBUSx5QkFBeUI7QUFFOUQsTUFBTUMsb0JBQW9CLEdBQUcsMEJBQTBCO0FBQ3ZELE1BQU1DLHNCQUFzQixHQUFHLG9DQUFvQztBQUNuRSxNQUFNQyxvQkFBb0IsR0FBRyxrQ0FBa0M7QUFFL0QsS0FBS0MsVUFBVSxHQUNYLG1CQUFtQixHQUNuQixXQUFXLEdBQ1gsb0JBQW9CLEdBQ3BCLGdCQUFnQjtBQUVwQixLQUFLQyxLQUFLLEdBQUc7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
