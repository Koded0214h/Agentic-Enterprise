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
exports.getDownloadUrl = getDownloadUrl;
exports.DesktopHandoff = DesktopHandoff;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- raw input for "any key" dismiss and y/n prompt
var ink_js_1 = require("../ink.js");
var browser_js_1 = require("../utils/browser.js");
var desktopDeepLink_js_1 = require("../utils/desktopDeepLink.js");
var errors_js_1 = require("../utils/errors.js");
var gracefulShutdown_js_1 = require("../utils/gracefulShutdown.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var LoadingState_js_1 = require("./design-system/LoadingState.js");
var DESKTOP_DOCS_URL = 'https://clau.de/desktop';
function getDownloadUrl() {
    switch (process.platform) {
        case 'win32':
            return 'https://claude.ai/api/desktop/win32/x64/exe/latest/redirect';
        default:
            return 'https://claude.ai/api/desktop/darwin/universal/dmg/latest/redirect';
    }
}
function DesktopHandoff(t0) {
    var $ = (0, compiler_runtime_1.c)(20);
    var onDone = t0.onDone;
    var _a = (0, react_1.useState)("checking"), state = _a[0], setState = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _d = (0, react_1.useState)(""), downloadMessage = _d[0], setDownloadMessage = _d[1];
    var t1;
    if ($[0] !== error || $[1] !== onDone || $[2] !== state) {
        t1 = function (input) {
            if (state === "error") {
                onDone(error !== null && error !== void 0 ? error : "Unknown error", {
                    display: "system"
                });
                return;
            }
            if (state === "prompt-download") {
                if (input === "y" || input === "Y") {
                    (0, browser_js_1.openBrowser)(getDownloadUrl()).catch(_temp);
                    onDone("Starting download. Re-run /desktop once you\u2019ve installed the app.\nLearn more at ".concat(DESKTOP_DOCS_URL), {
                        display: "system"
                    });
                }
                else {
                    if (input === "n" || input === "N") {
                        onDone("The desktop app is required for /desktop. Learn more at ".concat(DESKTOP_DOCS_URL), {
                            display: "system"
                        });
                    }
                }
            }
        };
        $[0] = error;
        $[1] = onDone;
        $[2] = state;
        $[3] = t1;
    }
    else {
        t1 = $[3];
    }
    (0, ink_js_1.useInput)(t1);
    var t2;
    var t3;
    if ($[4] !== onDone) {
        t2 = function () {
            var performHandoff = function performHandoff() {
                return __awaiter(this, void 0, void 0, function () {
                    var installStatus, result;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                setState("checking");
                                return [4 /*yield*/, (0, desktopDeepLink_js_1.getDesktopInstallStatus)()];
                            case 1:
                                installStatus = _b.sent();
                                if (installStatus.status === "not-installed") {
                                    setDownloadMessage("Claude Desktop is not installed.");
                                    setState("prompt-download");
                                    return [2 /*return*/];
                                }
                                if (installStatus.status === "version-too-old") {
                                    setDownloadMessage("Claude Desktop needs to be updated (found v".concat(installStatus.version, ", need v1.1.2396+)."));
                                    setState("prompt-download");
                                    return [2 /*return*/];
                                }
                                setState("flushing");
                                return [4 /*yield*/, (0, sessionStorage_js_1.flushSessionStorage)()];
                            case 2:
                                _b.sent();
                                setState("opening");
                                return [4 /*yield*/, (0, desktopDeepLink_js_1.openCurrentSessionInDesktop)()];
                            case 3:
                                result = _b.sent();
                                if (!result.success) {
                                    setError((_a = result.error) !== null && _a !== void 0 ? _a : "Failed to open Claude Desktop");
                                    setState("error");
                                    return [2 /*return*/];
                                }
                                setState("success");
                                setTimeout(_temp2, 500, onDone);
                                return [2 /*return*/];
                        }
                    });
                });
            };
            performHandoff().catch(function (err) {
                setError((0, errors_js_1.errorMessage)(err));
                setState("error");
            });
        };
        t3 = [onDone];
        $[4] = onDone;
        $[5] = t2;
        $[6] = t3;
    }
    else {
        t2 = $[5];
        t3 = $[6];
    }
    (0, react_1.useEffect)(t2, t3);
    if (state === "error") {
        var t4_1;
        if ($[7] !== error) {
            t4_1 = <ink_js_1.Text color="error">Error: {error}</ink_js_1.Text>;
            $[7] = error;
            $[8] = t4_1;
        }
        else {
            t4_1 = $[8];
        }
        var t5_1;
        if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
            t5_1 = <ink_js_1.Text dimColor={true}>Press any key to continue…</ink_js_1.Text>;
            $[9] = t5_1;
        }
        else {
            t5_1 = $[9];
        }
        var t6_1;
        if ($[10] !== t4_1) {
            t6_1 = <ink_js_1.Box flexDirection="column" paddingX={2}>{t4_1}{t5_1}</ink_js_1.Box>;
            $[10] = t4_1;
            $[11] = t6_1;
        }
        else {
            t6_1 = $[11];
        }
        return t6_1;
    }
    if (state === "prompt-download") {
        var t4_2;
        if ($[12] !== downloadMessage) {
            t4_2 = <ink_js_1.Text>{downloadMessage}</ink_js_1.Text>;
            $[12] = downloadMessage;
            $[13] = t4_2;
        }
        else {
            t4_2 = $[13];
        }
        var t5_2;
        if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
            t5_2 = <ink_js_1.Text>Download now? (y/n)</ink_js_1.Text>;
            $[14] = t5_2;
        }
        else {
            t5_2 = $[14];
        }
        var t6_2;
        if ($[15] !== t4_2) {
            t6_2 = <ink_js_1.Box flexDirection="column" paddingX={2}>{t4_2}{t5_2}</ink_js_1.Box>;
            $[15] = t4_2;
            $[16] = t6_2;
        }
        else {
            t6_2 = $[16];
        }
        return t6_2;
    }
    var t4;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            checking: "Checking for Claude Desktop\u2026",
            flushing: "Saving session\u2026",
            opening: "Opening Claude Desktop\u2026",
            success: "Opening in Claude Desktop\u2026"
        };
        $[17] = t4;
    }
    else {
        t4 = $[17];
    }
    var messages = t4;
    var t5 = messages[state];
    var t6;
    if ($[18] !== t5) {
        t6 = <LoadingState_js_1.LoadingState message={t5}/>;
        $[18] = t5;
        $[19] = t6;
    }
    else {
        t6 = $[19];
    }
    return t6;
}
function _temp2(onDone_0) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    onDone_0("Session transferred to Claude Desktop", {
                        display: "system"
                    });
                    return [4 /*yield*/, (0, gracefulShutdown_js_1.gracefulShutdown)(0, "other")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function _temp() { }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiQ29tbWFuZFJlc3VsdERpc3BsYXkiLCJCb3giLCJUZXh0IiwidXNlSW5wdXQiLCJvcGVuQnJvd3NlciIsImdldERlc2t0b3BJbnN0YWxsU3RhdHVzIiwib3BlbkN1cnJlbnRTZXNzaW9uSW5EZXNrdG9wIiwiZXJyb3JNZXNzYWdlIiwiZ3JhY2VmdWxTaHV0ZG93biIsImZsdXNoU2Vzc2lvblN0b3JhZ2UiLCJMb2FkaW5nU3RhdGUiLCJERVNLVE9QX0RPQ1NfVVJMIiwiZ2V0RG93bmxvYWRVcmwiLCJwcm9jZXNzIiwicGxhdGZvcm0iLCJEZXNrdG9wSGFuZG9mZlN0YXRlIiwiUHJvcHMiLCJvbkRvbmUiLCJyZXN1bHQiLCJvcHRpb25zIiwiZGlzcGxheSIsIkRlc2t0b3BIYW5kb2ZmIiwidDAiLCIkIiwiX2MiLCJzdGF0ZSIsInNldFN0YXRlIiwiZXJyb3IiLCJzZXRFcnJvciIsImRvd25sb2FkTWVzc2FnZSIsInNldERvd25sb2FkTWVzc2FnZSIsInQxIiwiaW5wdXQiLCJjYXRjaCIsIl90ZW1wIiwidDIiLCJ0MyIsInBlcmZvcm1IYW5kb2ZmIiwiaW5zdGFsbFN0YXR1cyIsInN0YXR1cyIsInZlcnNpb24iLCJzdWNjZXNzIiwic2V0VGltZW91dCIsIl90ZW1wMiIsImVyciIsInQ0IiwidDUiLCJTeW1ib2wiLCJmb3IiLCJ0NiIsImNoZWNraW5nIiwiZmx1c2hpbmciLCJvcGVuaW5nIiwibWVzc2FnZXMiLCJvbkRvbmVfMCJdLCJzb3VyY2VzIjpbIkRlc2t0b3BIYW5kb2ZmLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kUmVzdWx0RGlzcGxheSB9IGZyb20gJy4uL2NvbW1hbmRzLmpzJ1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGN1c3RvbS1ydWxlcy9wcmVmZXItdXNlLWtleWJpbmRpbmdzIC0tIHJhdyBpbnB1dCBmb3IgXCJhbnkga2V5XCIgZGlzbWlzcyBhbmQgeS9uIHByb21wdFxuaW1wb3J0IHsgQm94LCBUZXh0LCB1c2VJbnB1dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IG9wZW5Ccm93c2VyIH0gZnJvbSAnLi4vdXRpbHMvYnJvd3Nlci5qcydcbmltcG9ydCB7XG4gIGdldERlc2t0b3BJbnN0YWxsU3RhdHVzLFxuICBvcGVuQ3VycmVudFNlc3Npb25JbkRlc2t0b3AsXG59IGZyb20gJy4uL3V0aWxzL2Rlc2t0b3BEZWVwTGluay5qcydcbmltcG9ydCB7IGVycm9yTWVzc2FnZSB9IGZyb20gJy4uL3V0aWxzL2Vycm9ycy5qcydcbmltcG9ydCB7IGdyYWNlZnVsU2h1dGRvd24gfSBmcm9tICcuLi91dGlscy9ncmFjZWZ1bFNodXRkb3duLmpzJ1xuaW1wb3J0IHsgZmx1c2hTZXNzaW9uU3RvcmFnZSB9IGZyb20gJy4uL3V0aWxzL3Nlc3Npb25TdG9yYWdlLmpzJ1xuaW1wb3J0IHsgTG9hZGluZ1N0YXRlIH0gZnJvbSAnLi9kZXNpZ24tc3lzdGVtL0xvYWRpbmdTdGF0ZS5qcydcblxuY29uc3QgREVTS1RPUF9ET0NTX1VSTCA9ICdodHRwczovL2NsYXUuZGUvZGVza3RvcCdcblxuZXhwb3J0IGZ1bmN0aW9uIGdldERvd25sb2FkVXJsKCk6IHN0cmluZyB7XG4gIHN3aXRjaCAocHJvY2Vzcy5wbGF0Zm9ybSkge1xuICAgIGNhc2UgJ3dpbjMyJzpcbiAgICAgIHJldHVybiAnaHR0cHM6Ly9jbGF1ZGUuYWkvYXBpL2Rlc2t0b3Avd2luMzIveDY0L2V4ZS9sYXRlc3QvcmVkaXJlY3QnXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiAnaHR0cHM6Ly9jbGF1ZGUuYWkvYXBpL2Rlc2t0b3AvZGFyd2luL3VuaXZlcnNhbC9kbWcvbGF0ZXN0L3JlZGlyZWN0J1xuICB9XG59XG5cbnR5cGUgRGVza3RvcEhhbmRvZmZTdGF0ZSA9XG4gIHwgJ2NoZWNraW5nJ1xuICB8ICdwcm9tcHQtZG93bmxvYWQnXG4gIHwgJ2ZsdXNoaW5nJ1xuICB8ICdvcGVuaW5nJ1xuICB8ICdzdWNjZXNzJ1xuICB8ICdlcnJvcidcblxudHlwZSBQcm9wcyA9IHtcbiAgb25Eb25lOiAoXG4gICAgcmVzdWx0Pzogc3RyaW5nLFxuICAgIG9wdGlvbnM/OiB7IGRpc3BsYXk/OiBDb21tYW5kUmVzdWx0RGlzcGxheSB9LFxuICApID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlc2t0b3BIYW5kb2ZmKHsgb25Eb25lIH06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSB1c2VTdGF0ZTxEZXNrdG9wSGFuZG9mZlN0YXRlPignY2hlY2tpbmcnKVxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXG4gIGNvbnN0IFtkb3dubG9hZE1lc3NhZ2UsIHNldERvd25sb2FkTWVzc2FnZV0gPSB1c2VTdGF0ZTxzdHJpbmc+KCcnKVxuXG4gIC8vIEhhbmRsZSBrZXlib2FyZCBpbnB1dCBmb3IgZXJyb3IgYW5kIHByb21wdC1kb3dubG9hZCBzdGF0ZXNcbiAgdXNlSW5wdXQoaW5wdXQgPT4ge1xuICAgIGlmIChzdGF0ZSA9PT0gJ2Vycm9yJykge1xuICAgICAgb25Eb25lKGVycm9yID8/ICdVbmtub3duIGVycm9yJywgeyBkaXNwbGF5OiAnc3lzdGVtJyB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChzdGF0ZSA9PT0gJ3Byb21wdC1kb3dubG9hZCcpIHtcbiAgICAgIGlmIChpbnB1dCA9PT0gJ3knIHx8IGlucHV0ID09PSAnWScpIHtcbiAgICAgICAgb3BlbkJyb3dzZXIoZ2V0RG93bmxvYWRVcmwoKSkuY2F0Y2goKCkgPT4ge30pXG4gICAgICAgIG9uRG9uZShcbiAgICAgICAgICBgU3RhcnRpbmcgZG93bmxvYWQuIFJlLXJ1biAvZGVza3RvcCBvbmNlIHlvdVxcdTIwMTl2ZSBpbnN0YWxsZWQgdGhlIGFwcC5cXG5MZWFybiBtb3JlIGF0ICR7REVTS1RPUF9ET0NTX1VSTH1gLFxuICAgICAgICAgIHsgZGlzcGxheTogJ3N5c3RlbScgfSxcbiAgICAgICAgKVxuICAgICAgfSBlbHNlIGlmIChpbnB1dCA9PT0gJ24nIHx8IGlucHV0ID09PSAnTicpIHtcbiAgICAgICAgb25Eb25lKFxuICAgICAgICAgIGBUaGUgZGVza3RvcCBhcHAgaXMgcmVxdWlyZWQgZm9yIC9kZXNrdG9wLiBMZWFybiBtb3JlIGF0ICR7REVTS1RPUF9ET0NTX1VSTH1gLFxuICAgICAgICAgIHsgZGlzcGxheTogJ3N5c3RlbScgfSxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1IYW5kb2ZmKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgLy8gQ2hlY2sgRGVza3RvcCBpbnN0YWxsIHN0YXR1c1xuICAgICAgc2V0U3RhdGUoJ2NoZWNraW5nJylcbiAgICAgIGNvbnN0IGluc3RhbGxTdGF0dXMgPSBhd2FpdCBnZXREZXNrdG9wSW5zdGFsbFN0YXR1cygpXG5cbiAgICAgIGlmIChpbnN0YWxsU3RhdHVzLnN0YXR1cyA9PT0gJ25vdC1pbnN0YWxsZWQnKSB7XG4gICAgICAgIHNldERvd25sb2FkTWVzc2FnZSgnQ2xhdWRlIERlc2t0b3AgaXMgbm90IGluc3RhbGxlZC4nKVxuICAgICAgICBzZXRTdGF0ZSgncHJvbXB0LWRvd25sb2FkJylcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChpbnN0YWxsU3RhdHVzLnN0YXR1cyA9PT0gJ3ZlcnNpb24tdG9vLW9sZCcpIHtcbiAgICAgICAgc2V0RG93bmxvYWRNZXNzYWdlKFxuICAgICAgICAgIGBDbGF1ZGUgRGVza3RvcCBuZWVkcyB0byBiZSB1cGRhdGVkIChmb3VuZCB2JHtpbnN0YWxsU3RhdHVzLnZlcnNpb259LCBuZWVkIHYxLjEuMjM5NispLmAsXG4gICAgICAgIClcbiAgICAgICAgc2V0U3RhdGUoJ3Byb21wdC1kb3dubG9hZCcpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBGbHVzaCBzZXNzaW9uIHN0b3JhZ2UgdG8gZW5zdXJlIHRyYW5zY3JpcHQgaXMgZnVsbHkgd3JpdHRlblxuICAgICAgc2V0U3RhdGUoJ2ZsdXNoaW5nJylcbiAgICAgIGF3YWl0IGZsdXNoU2Vzc2lvblN0b3JhZ2UoKVxuXG4gICAgICAvLyBPcGVuIHRoZSBkZWVwIGxpbmsgKHVzZXMgY2xhdWRlLWRldjovLyBpbiBkZXYgbW9kZSlcbiAgICAgIHNldFN0YXRlKCdvcGVuaW5nJylcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9wZW5DdXJyZW50U2Vzc2lvbkluRGVza3RvcCgpXG5cbiAgICAgIGlmICghcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgc2V0RXJyb3IocmVzdWx0LmVycm9yID8/ICdGYWlsZWQgdG8gb3BlbiBDbGF1ZGUgRGVza3RvcCcpXG4gICAgICAgIHNldFN0YXRlKCdlcnJvcicpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICAvLyBTdWNjZXNzIC0gZXhpdCB0aGUgQ0xJXG4gICAgICBzZXRTdGF0ZSgnc3VjY2VzcycpXG5cbiAgICAgIC8vIEdpdmUgdGhlIHVzZXIgYSBtb21lbnQgdG8gc2VlIHRoZSBzdWNjZXNzIG1lc3NhZ2VcbiAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgIGFzeW5jIChvbkRvbmU6IFByb3BzWydvbkRvbmUnXSkgPT4ge1xuICAgICAgICAgIG9uRG9uZSgnU2Vzc2lvbiB0cmFuc2ZlcnJlZCB0byBDbGF1ZGUgRGVza3RvcCcsIHsgZGlzcGxheTogJ3N5c3RlbScgfSlcbiAgICAgICAgICBhd2FpdCBncmFjZWZ1bFNodXRkb3duKDAsICdvdGhlcicpXG4gICAgICAgIH0sXG4gICAgICAgIDUwMCxcbiAgICAgICAgb25Eb25lLFxuICAgICAgKVxuICAgIH1cblxuICAgIHBlcmZvcm1IYW5kb2ZmKCkuY2F0Y2goZXJyID0+IHtcbiAgICAgIHNldEVycm9yKGVycm9yTWVzc2FnZShlcnIpKVxuICAgICAgc2V0U3RhdGUoJ2Vycm9yJylcbiAgICB9KVxuICB9LCBbb25Eb25lXSlcblxuICBpZiAoc3RhdGUgPT09ICdlcnJvcicpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcGFkZGluZ1g9ezJ9PlxuICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+RXJyb3I6IHtlcnJvcn08L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPlByZXNzIGFueSBrZXkgdG8gY29udGludWXigKY8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBpZiAoc3RhdGUgPT09ICdwcm9tcHQtZG93bmxvYWQnKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHBhZGRpbmdYPXsyfT5cbiAgICAgICAgPFRleHQ+e2Rvd25sb2FkTWVzc2FnZX08L1RleHQ+XG4gICAgICAgIDxUZXh0PkRvd25sb2FkIG5vdz8gKHkvbik8L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICApXG4gIH1cblxuICBjb25zdCBtZXNzYWdlczogUmVjb3JkPFxuICAgIEV4Y2x1ZGU8RGVza3RvcEhhbmRvZmZTdGF0ZSwgJ2Vycm9yJyB8ICdwcm9tcHQtZG93bmxvYWQnPixcbiAgICBzdHJpbmdcbiAgPiA9IHtcbiAgICBjaGVja2luZzogJ0NoZWNraW5nIGZvciBDbGF1ZGUgRGVza3RvcOKApicsXG4gICAgZmx1c2hpbmc6ICdTYXZpbmcgc2Vzc2lvbuKApicsXG4gICAgb3BlbmluZzogJ09wZW5pbmcgQ2xhdWRlIERlc2t0b3DigKYnLFxuICAgIHN1Y2Nlc3M6ICdPcGVuaW5nIGluIENsYXVkZSBEZXNrdG9w4oCmJyxcbiAgfVxuXG4gIHJldHVybiA8TG9hZGluZ1N0YXRlIG1lc3NhZ2U9e21lc3NhZ2VzW3N0YXRl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
