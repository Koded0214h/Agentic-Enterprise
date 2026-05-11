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
exports.PreflightStep = PreflightStep;
var compiler_runtime_1 = require("react/compiler-runtime");
var axios_1 = require("axios");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var Spinner_js_1 = require("../components/Spinner.js");
var oauth_js_1 = require("../constants/oauth.js");
var useTimeout_js_1 = require("../hooks/useTimeout.js");
var ink_js_1 = require("../ink.js");
var errorUtils_js_1 = require("../services/api/errorUtils.js");
var http_js_1 = require("./http.js");
var log_js_1 = require("./log.js");
function checkEndpoints() {
    return __awaiter(this, void 0, void 0, function () {
        var oauthConfig, tokenUrl, endpoints, checkEndpoint, results, failedResult, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    oauthConfig = (0, oauth_js_1.getOauthConfig)();
                    tokenUrl = new URL(oauthConfig.TOKEN_URL);
                    endpoints = ["".concat(oauthConfig.BASE_API_URL, "/api/hello"), "".concat(tokenUrl.origin, "/v1/oauth/hello")];
                    checkEndpoint = function (url) { return __awaiter(_this, void 0, void 0, function () {
                        var response, hostname, error_2, hostname, sslHint;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, axios_1.default.get(url, {
                                            headers: {
                                                'User-Agent': (0, http_js_1.getUserAgent)()
                                            }
                                        })];
                                case 1:
                                    response = _a.sent();
                                    if (response.status !== 200) {
                                        hostname = new URL(url).hostname;
                                        return [2 /*return*/, {
                                                success: false,
                                                error: "Failed to connect to ".concat(hostname, ": Status ").concat(response.status)
                                            }];
                                    }
                                    return [2 /*return*/, {
                                            success: true
                                        }];
                                case 2:
                                    error_2 = _a.sent();
                                    hostname = new URL(url).hostname;
                                    sslHint = (0, errorUtils_js_1.getSSLErrorHint)(error_2);
                                    return [2 /*return*/, {
                                            success: false,
                                            error: "Failed to connect to ".concat(hostname, ": ").concat(error_2 instanceof Error ? error_2.code || error_2.message : String(error_2)),
                                            sslHint: sslHint !== null && sslHint !== void 0 ? sslHint : undefined
                                        }];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, Promise.all(endpoints.map(checkEndpoint))];
                case 1:
                    results = _a.sent();
                    failedResult = results.find(function (result) { return !result.success; });
                    if (failedResult) {
                        // Log failure to Statsig
                        (0, index_js_1.logEvent)('tengu_preflight_check_failed', {
                            isConnectivityError: false,
                            hasErrorMessage: !!failedResult.error,
                            isSSLError: !!failedResult.sslHint
                        });
                    }
                    return [2 /*return*/, failedResult || {
                            success: true
                        }];
                case 2:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    // Log to Statsig
                    (0, index_js_1.logEvent)('tengu_preflight_check_failed', {
                        isConnectivityError: true
                    });
                    return [2 /*return*/, {
                            success: false,
                            error: "Connectivity check error: ".concat(error_1 instanceof Error ? error_1.code || error_1.message : String(error_1))
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function PreflightStep(t0) {
    var $ = (0, compiler_runtime_1.c)(12);
    var onSuccess = t0.onSuccess;
    var _a = (0, react_1.useState)(null), result = _a[0], setResult = _a[1];
    var _b = (0, react_1.useState)(true), isChecking = _b[0], setIsChecking = _b[1];
    var showSpinner = (0, useTimeout_js_1.useTimeout)(1000) && isChecking;
    var t1;
    var t2;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = function () {
            var run = function run() {
                return __awaiter(this, void 0, void 0, function () {
                    var checkResult;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, checkEndpoints()];
                            case 1:
                                checkResult = _a.sent();
                                setResult(checkResult);
                                setIsChecking(false);
                                return [2 /*return*/];
                        }
                    });
                });
            };
            run();
        };
        t2 = [];
        $[0] = t1;
        $[1] = t2;
    }
    else {
        t1 = $[0];
        t2 = $[1];
    }
    (0, react_1.useEffect)(t1, t2);
    var t3;
    var t4;
    if ($[2] !== onSuccess || $[3] !== result) {
        t3 = function () {
            if (result === null || result === void 0 ? void 0 : result.success) {
                onSuccess();
            }
            else {
                if (result && !result.success) {
                    var timer_1 = setTimeout(_temp, 100);
                    return function () { return clearTimeout(timer_1); };
                }
            }
        };
        t4 = [result, onSuccess];
        $[2] = onSuccess;
        $[3] = result;
        $[4] = t3;
        $[5] = t4;
    }
    else {
        t3 = $[4];
        t4 = $[5];
    }
    (0, react_1.useEffect)(t3, t4);
    var t5;
    if ($[6] !== isChecking || $[7] !== result || $[8] !== showSpinner) {
        t5 = isChecking && showSpinner ? <ink_js_1.Box paddingLeft={1}><Spinner_js_1.Spinner /><ink_js_1.Text>Checking connectivity...</ink_js_1.Text></ink_js_1.Box> : !(result === null || result === void 0 ? void 0 : result.success) && !isChecking && <ink_js_1.Box flexDirection="column" gap={1}><ink_js_1.Text color="error">Unable to connect to Anthropic services</ink_js_1.Text><ink_js_1.Text color="error">{result === null || result === void 0 ? void 0 : result.error}</ink_js_1.Text>{(result === null || result === void 0 ? void 0 : result.sslHint) ? <ink_js_1.Box flexDirection="column" gap={1}><ink_js_1.Text>{result.sslHint}</ink_js_1.Text><ink_js_1.Text color="suggestion">See https://code.claude.com/docs/en/network-config</ink_js_1.Text></ink_js_1.Box> : <ink_js_1.Box flexDirection="column" gap={1}><ink_js_1.Text>Please check your internet connection and network settings.</ink_js_1.Text><ink_js_1.Text>Note: Claude Code might not be available in your country. Check supported countries at{" "}<ink_js_1.Text color="suggestion">https://anthropic.com/supported-countries</ink_js_1.Text></ink_js_1.Text></ink_js_1.Box>}</ink_js_1.Box>;
        $[6] = isChecking;
        $[7] = result;
        $[8] = showSpinner;
        $[9] = t5;
    }
    else {
        t5 = $[9];
    }
    var t6;
    if ($[10] !== t5) {
        t6 = <ink_js_1.Box flexDirection="column" gap={1} paddingLeft={1}>{t5}</ink_js_1.Box>;
        $[10] = t5;
        $[11] = t6;
    }
    else {
        t6 = $[11];
    }
    return t6;
}
function _temp() {
    return process.exit(1);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJheGlvcyIsIlJlYWN0IiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJsb2dFdmVudCIsIlNwaW5uZXIiLCJnZXRPYXV0aENvbmZpZyIsInVzZVRpbWVvdXQiLCJCb3giLCJUZXh0IiwiZ2V0U1NMRXJyb3JIaW50IiwiZ2V0VXNlckFnZW50IiwibG9nRXJyb3IiLCJQcmVmbGlnaHRDaGVja1Jlc3VsdCIsInN1Y2Nlc3MiLCJlcnJvciIsInNzbEhpbnQiLCJjaGVja0VuZHBvaW50cyIsIlByb21pc2UiLCJvYXV0aENvbmZpZyIsInRva2VuVXJsIiwiVVJMIiwiVE9LRU5fVVJMIiwiZW5kcG9pbnRzIiwiQkFTRV9BUElfVVJMIiwib3JpZ2luIiwiY2hlY2tFbmRwb2ludCIsInVybCIsInJlc3BvbnNlIiwiZ2V0IiwiaGVhZGVycyIsInN0YXR1cyIsImhvc3RuYW1lIiwiRXJyb3IiLCJFcnJub0V4Y2VwdGlvbiIsImNvZGUiLCJtZXNzYWdlIiwiU3RyaW5nIiwidW5kZWZpbmVkIiwicmVzdWx0cyIsImFsbCIsIm1hcCIsImZhaWxlZFJlc3VsdCIsImZpbmQiLCJyZXN1bHQiLCJpc0Nvbm5lY3Rpdml0eUVycm9yIiwiaGFzRXJyb3JNZXNzYWdlIiwiaXNTU0xFcnJvciIsIlByZWZsaWdodFN0ZXBQcm9wcyIsIm9uU3VjY2VzcyIsIlByZWZsaWdodFN0ZXAiLCJ0MCIsIiQiLCJfYyIsInNldFJlc3VsdCIsImlzQ2hlY2tpbmciLCJzZXRJc0NoZWNraW5nIiwic2hvd1NwaW5uZXIiLCJ0MSIsInQyIiwiU3ltYm9sIiwiZm9yIiwicnVuIiwiY2hlY2tSZXN1bHQiLCJ0MyIsInQ0IiwidGltZXIiLCJzZXRUaW1lb3V0IiwiX3RlbXAiLCJjbGVhclRpbWVvdXQiLCJ0NSIsInQ2IiwicHJvY2VzcyIsImV4aXQiXSwic291cmNlcyI6WyJwcmVmbGlnaHRDaGVja3MudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcydcbmltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBsb2dFdmVudCB9IGZyb20gJ3NyYy9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSAnLi4vY29tcG9uZW50cy9TcGlubmVyLmpzJ1xuaW1wb3J0IHsgZ2V0T2F1dGhDb25maWcgfSBmcm9tICcuLi9jb25zdGFudHMvb2F1dGguanMnXG5pbXBvcnQgeyB1c2VUaW1lb3V0IH0gZnJvbSAnLi4vaG9va3MvdXNlVGltZW91dC5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IGdldFNTTEVycm9ySGludCB9IGZyb20gJy4uL3NlcnZpY2VzL2FwaS9lcnJvclV0aWxzLmpzJ1xuaW1wb3J0IHsgZ2V0VXNlckFnZW50IH0gZnJvbSAnLi9odHRwLmpzJ1xuaW1wb3J0IHsgbG9nRXJyb3IgfSBmcm9tICcuL2xvZy5qcydcblxuZXhwb3J0IGludGVyZmFjZSBQcmVmbGlnaHRDaGVja1Jlc3VsdCB7XG4gIHN1Y2Nlc3M6IGJvb2xlYW5cbiAgZXJyb3I/OiBzdHJpbmdcbiAgc3NsSGludD86IHN0cmluZ1xufVxuXG5hc3luYyBmdW5jdGlvbiBjaGVja0VuZHBvaW50cygpOiBQcm9taXNlPFByZWZsaWdodENoZWNrUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgb2F1dGhDb25maWcgPSBnZXRPYXV0aENvbmZpZygpXG4gICAgY29uc3QgdG9rZW5VcmwgPSBuZXcgVVJMKG9hdXRoQ29uZmlnLlRPS0VOX1VSTClcbiAgICBjb25zdCBlbmRwb2ludHMgPSBbXG4gICAgICBgJHtvYXV0aENvbmZpZy5CQVNFX0FQSV9VUkx9L2FwaS9oZWxsb2AsXG4gICAgICBgJHt0b2tlblVybC5vcmlnaW59L3YxL29hdXRoL2hlbGxvYCxcbiAgICBdXG5cbiAgICBjb25zdCBjaGVja0VuZHBvaW50ID0gYXN5bmMgKFxuICAgICAgdXJsOiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTxQcmVmbGlnaHRDaGVja1Jlc3VsdD4gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQodXJsLCB7XG4gICAgICAgICAgaGVhZGVyczogeyAnVXNlci1BZ2VudCc6IGdldFVzZXJBZ2VudCgpIH0sXG4gICAgICAgIH0pXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgIT09IDIwMCkge1xuICAgICAgICAgIGNvbnN0IGhvc3RuYW1lID0gbmV3IFVSTCh1cmwpLmhvc3RuYW1lXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgZXJyb3I6IGBGYWlsZWQgdG8gY29ubmVjdCB0byAke2hvc3RuYW1lfTogU3RhdHVzICR7cmVzcG9uc2Uuc3RhdHVzfWAsXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgaG9zdG5hbWUgPSBuZXcgVVJMKHVybCkuaG9zdG5hbWVcbiAgICAgICAgY29uc3Qgc3NsSGludCA9IGdldFNTTEVycm9ySGludChlcnJvcilcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICBlcnJvcjogYEZhaWxlZCB0byBjb25uZWN0IHRvICR7aG9zdG5hbWV9OiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyAoZXJyb3IgYXMgRXJybm9FeGNlcHRpb24pLmNvZGUgfHwgZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcil9YCxcbiAgICAgICAgICBzc2xIaW50OiBzc2xIaW50ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChlbmRwb2ludHMubWFwKGNoZWNrRW5kcG9pbnQpKVxuICAgIGNvbnN0IGZhaWxlZFJlc3VsdCA9IHJlc3VsdHMuZmluZChyZXN1bHQgPT4gIXJlc3VsdC5zdWNjZXNzKVxuXG4gICAgaWYgKGZhaWxlZFJlc3VsdCkge1xuICAgICAgLy8gTG9nIGZhaWx1cmUgdG8gU3RhdHNpZ1xuICAgICAgbG9nRXZlbnQoJ3Rlbmd1X3ByZWZsaWdodF9jaGVja19mYWlsZWQnLCB7XG4gICAgICAgIGlzQ29ubmVjdGl2aXR5RXJyb3I6IGZhbHNlLFxuICAgICAgICBoYXNFcnJvck1lc3NhZ2U6ICEhZmFpbGVkUmVzdWx0LmVycm9yLFxuICAgICAgICBpc1NTTEVycm9yOiAhIWZhaWxlZFJlc3VsdC5zc2xIaW50LFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gZmFpbGVkUmVzdWx0IHx8IHsgc3VjY2VzczogdHJ1ZSB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgbG9nRXJyb3IoZXJyb3IgYXMgRXJyb3IpXG5cbiAgICAvLyBMb2cgdG8gU3RhdHNpZ1xuICAgIGxvZ0V2ZW50KCd0ZW5ndV9wcmVmbGlnaHRfY2hlY2tfZmFpbGVkJywge1xuICAgICAgaXNDb25uZWN0aXZpdHlFcnJvcjogdHJ1ZSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGBDb25uZWN0aXZpdHkgY2hlY2sgZXJyb3I6ICR7ZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IChlcnJvciBhcyBFcnJub0V4Y2VwdGlvbikuY29kZSB8fCBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKX1gLFxuICAgIH1cbiAgfVxufVxuXG5pbnRlcmZhY2UgUHJlZmxpZ2h0U3RlcFByb3BzIHtcbiAgb25TdWNjZXNzOiAoKSA9PiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcmVmbGlnaHRTdGVwKHtcbiAgb25TdWNjZXNzLFxufTogUHJlZmxpZ2h0U3RlcFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlPFByZWZsaWdodENoZWNrUmVzdWx0IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW2lzQ2hlY2tpbmcsIHNldElzQ2hlY2tpbmddID0gdXNlU3RhdGUodHJ1ZSlcblxuICAvLyBkZWxheSBzaG93aW5nIHRoZSBjaGVjayBzaW5jZSBpdCdzIHNvIGZhc3QgdGhhdCB3ZSBub3JtYWxseVxuICAvLyB3YW50IHRvIGp1c3QgaW1tZWRpYXRlbHkgc2hvdyB0aGUgbmV4dCBzdGVwIHdpdGhvdXQgYSBmbGFzaFxuICBjb25zdCBzaG93U3Bpbm5lciA9IHVzZVRpbWVvdXQoMTAwMCkgJiYgaXNDaGVja2luZ1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgYXN5bmMgZnVuY3Rpb24gcnVuKCkge1xuICAgICAgY29uc3QgY2hlY2tSZXN1bHQgPSBhd2FpdCBjaGVja0VuZHBvaW50cygpXG4gICAgICBzZXRSZXN1bHQoY2hlY2tSZXN1bHQpXG4gICAgICBzZXRJc0NoZWNraW5nKGZhbHNlKVxuICAgIH1cbiAgICB2b2lkIHJ1bigpXG4gIH0sIFtdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJlc3VsdD8uc3VjY2Vzcykge1xuICAgICAgb25TdWNjZXNzKClcbiAgICB9IGVsc2UgaWYgKHJlc3VsdCAmJiAhcmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBwcm9jZXNzLmV4aXQoMSksIDEwMClcbiAgICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgfVxuICB9LCBbcmVzdWx0LCBvblN1Y2Nlc3NdKVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfSBwYWRkaW5nTGVmdD17MX0+XG4gICAgICB7aXNDaGVja2luZyAmJiBzaG93U3Bpbm5lciA/IChcbiAgICAgICAgPEJveCBwYWRkaW5nTGVmdD17MX0+XG4gICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICA8VGV4dD5DaGVja2luZyBjb25uZWN0aXZpdHkuLi48L1RleHQ+XG4gICAgICAgIDwvQm94PlxuICAgICAgKSA6IChcbiAgICAgICAgIXJlc3VsdD8uc3VjY2VzcyAmJlxuICAgICAgICAhaXNDaGVja2luZyAmJiAoXG4gICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj5VbmFibGUgdG8gY29ubmVjdCB0byBBbnRocm9waWMgc2VydmljZXM8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBjb2xvcj1cImVycm9yXCI+e3Jlc3VsdD8uZXJyb3J9PC9UZXh0PlxuICAgICAgICAgICAge3Jlc3VsdD8uc3NsSGludCA/IChcbiAgICAgICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgICAgICA8VGV4dD57cmVzdWx0LnNzbEhpbnR9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwic3VnZ2VzdGlvblwiPlxuICAgICAgICAgICAgICAgICAgU2VlIGh0dHBzOi8vY29kZS5jbGF1ZGUuY29tL2RvY3MvZW4vbmV0d29yay1jb25maWdcbiAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgICAgICAgIFBsZWFzZSBjaGVjayB5b3VyIGludGVybmV0IGNvbm5lY3Rpb24gYW5kIG5ldHdvcmsgc2V0dGluZ3MuXG4gICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgICAgICAgTm90ZTogQ2xhdWRlIENvZGUgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBpbiB5b3VyIGNvdW50cnkuXG4gICAgICAgICAgICAgICAgICBDaGVjayBzdXBwb3J0ZWQgY291bnRyaWVzIGF0eycgJ31cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNvbG9yPVwic3VnZ2VzdGlvblwiPlxuICAgICAgICAgICAgICAgICAgICBodHRwczovL2FudGhyb3BpYy5jb20vc3VwcG9ydGVkLWNvdW50cmllc1xuICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApXG4gICAgICApfVxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLE1BQU0sT0FBTztBQUN6QixPQUFPQyxLQUFLLElBQUlDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDbEQsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxPQUFPLFFBQVEsMEJBQTBCO0FBQ2xELFNBQVNDLGNBQWMsUUFBUSx1QkFBdUI7QUFDdEQsU0FBU0MsVUFBVSxRQUFRLHdCQUF3QjtBQUNuRCxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxXQUFXO0FBQ3JDLFNBQVNDLGVBQWUsUUFBUSwrQkFBK0I7QUFDL0QsU0FBU0MsWUFBWSxRQUFRLFdBQVc7QUFDeEMsU0FBU0MsUUFBUSxRQUFRLFVBQVU7QUFFbkMsT0FBTyxVQUFVQyxvQkFBb0IsQ0FBQztFQUNwQ0MsT0FBTyxFQUFFLE9BQU87RUFDaEJDLEtBQUssQ0FBQyxFQUFFLE1BQU07RUFDZEMsT0FBTyxDQUFDLEVBQUUsTUFBTTtBQUNsQjtBQUVBLGVBQWVDLGNBQWNBLENBQUEsQ0FBRSxFQUFFQyxPQUFPLENBQUNMLG9CQUFvQixDQUFDLENBQUM7RUFDN0QsSUFBSTtJQUNGLE1BQU1NLFdBQVcsR0FBR2IsY0FBYyxDQUFDLENBQUM7SUFDcEMsTUFB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
