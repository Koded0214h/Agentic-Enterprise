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
var execa_1 = require("execa");
var React = require("react");
var react_1 = require("react");
var index_js_1 = require("../../components/CustomSelect/index.js");
var Dialog_js_1 = require("../../components/design-system/Dialog.js");
var LoadingState_js_1 = require("../../components/design-system/LoadingState.js");
var ink_js_1 = require("../../ink.js");
var index_js_2 = require("../../services/analytics/index.js");
var browser_js_1 = require("../../utils/browser.js");
var ghAuthStatus_js_1 = require("../../utils/github/ghAuthStatus.js");
var api_js_1 = require("./api.js");
function checkLoginState() {
    return __awaiter(this, void 0, void 0, function () {
        var ghStatus, stdout, trimmed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, api_js_1.isSignedIn)()];
                case 1:
                    if (!(_a.sent())) {
                        return [2 /*return*/, {
                                status: 'not_signed_in'
                            }];
                    }
                    return [4 /*yield*/, (0, ghAuthStatus_js_1.getGhAuthStatus)()];
                case 2:
                    ghStatus = _a.sent();
                    if (ghStatus === 'not_installed') {
                        return [2 /*return*/, {
                                status: 'gh_not_installed'
                            }];
                    }
                    if (ghStatus === 'not_authenticated') {
                        return [2 /*return*/, {
                                status: 'gh_not_authenticated'
                            }];
                    }
                    return [4 /*yield*/, (0, execa_1.execa)('gh', ['auth', 'token'], {
                            stdout: 'pipe',
                            stderr: 'ignore',
                            timeout: 5000,
                            reject: false
                        })];
                case 3:
                    stdout = (_a.sent()).stdout;
                    trimmed = stdout.trim();
                    if (!trimmed) {
                        return [2 /*return*/, {
                                status: 'gh_not_authenticated'
                            }];
                    }
                    return [2 /*return*/, {
                            status: 'has_gh_token',
                            token: new api_js_1.RedactedGithubToken(trimmed)
                        }];
            }
        });
    });
}
function errorMessage(err, codeUrl) {
    switch (err.kind) {
        case 'not_signed_in':
            return "Login failed. Please visit ".concat(codeUrl, " and login using the GitHub App");
        case 'invalid_token':
            return 'GitHub rejected that token. Run `gh auth login` and try again.';
        case 'server':
            return "Server error (".concat(err.status, "). Try again in a moment.");
        case 'network':
            return "Couldn't reach the server. Check your connection.";
    }
}
function Web(_a) {
    var _this = this;
    var onDone = _a.onDone;
    var _b = (0, react_1.useState)({
        name: 'checking'
    }), step = _b[0], setStep = _b[1];
    (0, react_1.useEffect)(function () {
        (0, index_js_2.logEvent)('tengu_remote_setup_started', {});
        void checkLoginState().then(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var _a, url;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = result.status;
                        switch (_a) {
                            case 'not_signed_in': return [3 /*break*/, 1];
                            case 'gh_not_installed': return [3 /*break*/, 2];
                            case 'gh_not_authenticated': return [3 /*break*/, 2];
                            case 'has_gh_token': return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        (0, index_js_2.logEvent)('tengu_remote_setup_result', {
                            result: 'not_signed_in'
                        });
                        onDone('Not signed in to Claude. Run /login first.');
                        return [2 /*return*/];
                    case 2:
                        url = "".concat((0, api_js_1.getCodeWebUrl)(), "/onboarding?step=alt-auth");
                        return [4 /*yield*/, (0, browser_js_1.openBrowser)(url)];
                    case 3:
                        _b.sent();
                        (0, index_js_2.logEvent)('tengu_remote_setup_result', {
                            result: result.status
                        });
                        onDone(result.status === 'gh_not_installed' ? "GitHub CLI not found. Install it via https://cli.github.com/, then run `gh auth login`, or connect GitHub on the web: ".concat(url) : "GitHub CLI not authenticated. Run `gh auth login` and try again, or connect GitHub on the web: ".concat(url));
                        return [2 /*return*/];
                    case 4:
                        setStep({
                            name: 'confirm',
                            token: result.token
                        });
                        _b.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // onDone is stable across renders; intentionally not in deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var handleCancel = function () {
        (0, index_js_2.logEvent)('tengu_remote_setup_result', {
            result: 'cancelled'
        });
        onDone();
    };
    var handleConfirm = function (token) { return __awaiter(_this, void 0, void 0, function () {
        var result, url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setStep({
                        name: 'uploading'
                    });
                    return [4 /*yield*/, (0, api_js_1.importGithubToken)(token)];
                case 1:
                    result = _a.sent();
                    if (!result.ok) {
                        (0, index_js_2.logEvent)('tengu_remote_setup_result', {
                            result: 'import_failed',
                            error_kind: result.error.kind
                        });
                        onDone(errorMessage(result.error, (0, api_js_1.getCodeWebUrl)()));
                        return [2 /*return*/];
                    }
                    // Token import succeeded. Environment creation is best-effort — if it
                    // fails, the web state machine routes to env-setup on landing, which is
                    // one extra click but still better than the OAuth dance.
                    return [4 /*yield*/, (0, api_js_1.createDefaultEnvironment)()];
                case 2:
                    // Token import succeeded. Environment creation is best-effort — if it
                    // fails, the web state machine routes to env-setup on landing, which is
                    // one extra click but still better than the OAuth dance.
                    _a.sent();
                    url = (0, api_js_1.getCodeWebUrl)();
                    return [4 /*yield*/, (0, browser_js_1.openBrowser)(url)];
                case 3:
                    _a.sent();
                    (0, index_js_2.logEvent)('tengu_remote_setup_result', {
                        result: 'success'
                    });
                    onDone("Connected as ".concat(result.result.github_username, ". Opened ").concat(url));
                    return [2 /*return*/];
            }
        });
    }); };
    if (step.name === 'checking') {
        return <LoadingState_js_1.LoadingState message="Checking login status…"/>;
    }
    if (step.name === 'uploading') {
        return <LoadingState_js_1.LoadingState message="Connecting GitHub to Claude…"/>;
    }
    var token = step.token;
    return <Dialog_js_1.Dialog title="Connect Claude on the web to GitHub?" onCancel={handleCancel} hideInputGuide>
      <ink_js_1.Box flexDirection="column">
        <ink_js_1.Text>
          Claude on the web requires connecting to your GitHub account to clone
          and push code on your behalf.
        </ink_js_1.Text>
        <ink_js_1.Text dimColor>
          Your local credentials are used to authenticate with GitHub
        </ink_js_1.Text>
      </ink_js_1.Box>
      <index_js_1.Select options={[{
                label: 'Continue',
                value: 'send'
            }, {
                label: 'Cancel',
                value: 'cancel'
            }]} onChange={function (value) {
            if (value === 'send') {
                void handleConfirm(token);
            }
            else {
                handleCancel();
            }
        }} onCancel={handleCancel}/>
    </Dialog_js_1.Dialog>;
}
function call(onDone) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, <Web onDone={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjYSIsIlJlYWN0IiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJTZWxlY3QiLCJEaWFsb2ciLCJMb2FkaW5nU3RhdGUiLCJCb3giLCJUZXh0IiwibG9nRXZlbnQiLCJBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTIiwiU2FmZVN0cmluZyIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsIm9wZW5Ccm93c2VyIiwiZ2V0R2hBdXRoU3RhdHVzIiwiY3JlYXRlRGVmYXVsdEVudmlyb25tZW50IiwiZ2V0Q29kZVdlYlVybCIsIkltcG9ydFRva2VuRXJyb3IiLCJpbXBvcnRHaXRodWJUb2tlbiIsImlzU2lnbmVkSW4iLCJSZWRhY3RlZEdpdGh1YlRva2VuIiwiQ2hlY2tSZXN1bHQiLCJzdGF0dXMiLCJ0b2tlbiIsImNoZWNrTG9naW5TdGF0ZSIsIlByb21pc2UiLCJnaFN0YXR1cyIsInN0ZG91dCIsInN0ZGVyciIsInRpbWVvdXQiLCJyZWplY3QiLCJ0cmltbWVkIiwidHJpbSIsImVycm9yTWVzc2FnZSIsImVyciIsImNvZGVVcmwiLCJraW5kIiwiU3RlcCIsIm5hbWUiLCJXZWIiLCJvbkRvbmUiLCJzdGVwIiwic2V0U3RlcCIsInRoZW4iLCJyZXN1bHQiLCJ1cmwiLCJoYW5kbGVDYW5jZWwiLCJoYW5kbGVDb25maXJtIiwib2siLCJlcnJvcl9raW5kIiwiZXJyb3IiLCJnaXRodWJfdXNlcm5hbWUiLCJsYWJlbCIsInZhbHVlIiwiY2FsbCIsIlJlYWN0Tm9kZSJdLCJzb3VyY2VzIjpbInJlbW90ZS1zZXR1cC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlY2EgfSBmcm9tICdleGVjYSdcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgU2VsZWN0IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9DdXN0b21TZWxlY3QvaW5kZXguanMnXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL2Rlc2lnbi1zeXN0ZW0vRGlhbG9nLmpzJ1xuaW1wb3J0IHsgTG9hZGluZ1N0YXRlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kZXNpZ24tc3lzdGVtL0xvYWRpbmdTdGF0ZS5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7XG4gIGxvZ0V2ZW50LFxuICB0eXBlIEFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMgYXMgU2FmZVN0cmluZyxcbn0gZnJvbSAnLi4vLi4vc2VydmljZXMvYW5hbHl0aWNzL2luZGV4LmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHsgb3BlbkJyb3dzZXIgfSBmcm9tICcuLi8uLi91dGlscy9icm93c2VyLmpzJ1xuaW1wb3J0IHsgZ2V0R2hBdXRoU3RhdHVzIH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViL2doQXV0aFN0YXR1cy5qcydcbmltcG9ydCB7XG4gIGNyZWF0ZURlZmF1bHRFbnZpcm9ubWVudCxcbiAgZ2V0Q29kZVdlYlVybCxcbiAgdHlwZSBJbXBvcnRUb2tlbkVycm9yLFxuICBpbXBvcnRHaXRodWJUb2tlbixcbiAgaXNTaWduZWRJbixcbiAgUmVkYWN0ZWRHaXRodWJUb2tlbixcbn0gZnJvbSAnLi9hcGkuanMnXG5cbnR5cGUgQ2hlY2tSZXN1bHQgPVxuICB8IHsgc3RhdHVzOiAnbm90X3NpZ25lZF9pbicgfVxuICB8IHsgc3RhdHVzOiAnaGFzX2doX3Rva2VuJzsgdG9rZW46IFJlZGFjdGVkR2l0aHViVG9rZW4gfVxuICB8IHsgc3RhdHVzOiAnZ2hfbm90X2luc3RhbGxlZCcgfVxuICB8IHsgc3RhdHVzOiAnZ2hfbm90X2F1dGhlbnRpY2F0ZWQnIH1cblxuYXN5bmMgZnVuY3Rpb24gY2hlY2tMb2dpblN0YXRlKCk6IFByb21pc2U8Q2hlY2tSZXN1bHQ+IHtcbiAgaWYgKCEoYXdhaXQgaXNTaWduZWRJbigpKSkge1xuICAgIHJldHVybiB7IHN0YXR1czogJ25vdF9zaWduZWRfaW4nIH1cbiAgfVxuXG4gIGNvbnN0IGdoU3RhdHVzID0gYXdhaXQgZ2V0R2hBdXRoU3RhdHVzKClcbiAgaWYgKGdoU3RhdHVzID09PSAnbm90X2luc3RhbGxlZCcpIHtcbiAgICByZXR1cm4geyBzdGF0dXM6ICdnaF9ub3RfaW5zdGFsbGVkJyB9XG4gIH1cbiAgaWYgKGdoU3RhdHVzID09PSAnbm90X2F1dGhlbnRpY2F0ZWQnKSB7XG4gICAgcmV0dXJuIHsgc3RhdHVzOiAnZ2hfbm90X2F1dGhlbnRpY2F0ZWQnIH1cbiAgfVxuXG4gIC8vIGdoU3RhdHVzID09PSAnYXV0aGVudGljYXRlZCcuIGdldEdoQXV0aFN0YXR1cyBzcGF3bnMgd2l0aCBzdGRvdXQ6J2lnbm9yZSdcbiAgLy8gKHRlbGVtZXRyeS1zYWZlKTsgc3Bhd24gb25jZSBtb3JlIHdpdGggc3Rkb3V0OidwaXBlJyB0byByZWFkIHRoZSB0b2tlbi5cbiAgY29uc3QgeyBzdGRvdXQgfSA9IGF3YWl0IGV4ZWNhKCdnaCcsIFsnYXV0aCcsICd0b2tlbiddLCB7XG4gICAgc3Rkb3V0OiAncGlwZScsXG4gICAgc3RkZXJyOiAnaWdub3JlJyxcbiAgICB0aW1lb3V0OiA1MDAwLFxuICAgIHJlamVjdDogZmFsc2UsXG4gIH0pXG4gIGNvbnN0IHRyaW1tZWQgPSBzdGRvdXQudHJpbSgpXG4gIGlmICghdHJpbW1lZCkge1xuICAgIHJldHVybiB7IHN0YXR1czogJ2doX25vdF9hdXRoZW50aWNhdGVkJyB9XG4gIH1cbiAgcmV0dXJuIHsgc3RhdHVzOiAnaGFzX2doX3Rva2VuJywgdG9rZW46IG5ldyBSZWRhY3RlZEdpdGh1YlRva2VuKHRyaW1tZWQpIH1cbn1cblxuZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycjogSW1wb3J0VG9rZW5FcnJvciwgY29kZVVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgc3dpdGNoIChlcnIua2luZCkge1xuICAgIGNhc2UgJ25vdF9zaWduZWRfaW4nOlxuICAgICAgcmV0dXJuIGBMb2dpbiBmYWlsZWQuIFBsZWFzZSB2aXNpdCAke2NvZGVVcmx9IGFuZCBsb2dpbiB1c2luZyB0aGUgR2l0SHViIEFwcGBcbiAgICBjYXNlICdpbnZhbGlkX3Rva2VuJzpcbiAgICAgIHJldHVybiAnR2l0SHViIHJlamVjdGVkIHRoYXQgdG9rZW4uIFJ1biBgZ2ggYXV0aCBsb2dpbmAgYW5kIHRyeSBhZ2Fpbi4nXG4gICAgY2FzZSAnc2VydmVyJzpcbiAgICAgIHJldHVybiBgU2VydmVyIGVycm9yICgke2Vyci5zdGF0dXN9KS4gVHJ5IGFnYWluIGluIGEgbW9tZW50LmBcbiAgICBjYXNlICduZXR3b3JrJzpcbiAgICAgIHJldHVybiBcIkNvdWxkbid0IHJlYWNoIHRoZSBzZXJ2ZXIuIENoZWNrIHlvdXIgY29ubmVjdGlvbi5cIlxuICB9XG59XG5cbnR5cGUgU3RlcCA9XG4gIHwgeyBuYW1lOiAnY2hlY2tpbmcnIH1cbiAgfCB7IG5hbWU6ICdjb25maXJtJzsgdG9rZW46IFJlZGFjdGVkR2l0aHViVG9rZW4gfVxuICB8IHsgbmFtZTogJ3VwbG9hZGluZycgfVxuXG5mdW5jdGlvbiBXZWIoeyBvbkRvbmUgfTogeyBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9KSB7XG4gIGNvbnN0IFtzdGVwLCBzZXRTdGVwXSA9IHVzZVN0YXRlPFN0ZXA+KHsgbmFtZTogJ2NoZWNraW5nJyB9KVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbG9nRXZlbnQoJ3Rlbmd1X3JlbW90ZV9zZXR1cF9zdGFydGVkJywge30pXG4gICAgdm9pZCBjaGVja0xvZ2luU3RhdGUoKS50aGVuKGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICBzd2l0Y2ggKHJlc3VsdC5zdGF0dXMpIHtcbiAgICAgICAgY2FzZSAnbm90X3NpZ25lZF9pbic6XG4gICAgICAgICAgbG9nRXZlbnQoJ3Rlbmd1X3JlbW90ZV9zZXR1cF9yZXN1bHQnLCB7XG4gICAgICAgICAgICByZXN1bHQ6ICdub3Rfc2lnbmVkX2luJyBhcyBTYWZlU3RyaW5nLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgb25Eb25lKCdOb3Qgc2lnbmVkIGluIHRvIENsYXVkZS4gUnVuIC9sb2dpbiBmaXJzdC4nKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICBjYXNlICdnaF9ub3RfaW5zdGFsbGVkJzpcbiAgICAgICAgY2FzZSAnZ2hfbm90X2F1dGhlbnRpY2F0ZWQnOiB7XG4gICAgICAgICAgY29uc3QgdXJsID0gYCR7Z2V0Q29kZVdlYlVybCgpfS9vbmJvYXJkaW5nP3N0ZXA9YWx0LWF1dGhgXG4gICAgICAgICAgYXdhaXQgb3BlbkJyb3dzZXIodXJsKVxuICAgICAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9yZW1vdGVfc2V0dXBfcmVzdWx0Jywge1xuICAgICAgICAgICAgcmVzdWx0OiByZXN1bHQuc3RhdHVzIGFzIFNhZmVTdHJpbmcsXG4gICAgICAgICAgfSlcbiAgICAgICAgICBvbkRvbmUoXG4gICAgICAgICAgICByZXN1bHQuc3RhdHVzID09PSAnZ2hfbm90X2luc3RhbGxlZCdcbiAgICAgICAgICAgICAgPyBgR2l0SHViIENMSSBub3QgZm91bmQuIEluc3RhbGwgaXQgdmlhIGh0dHBzOi8vY2xpLmdpdGh1Yi5jb20vLCB0aGVuIHJ1biBcXGBnaCBhdXRoIGxvZ2luXFxgLCBvciBjb25uZWN0IEdpdEh1YiBvbiB0aGUgd2ViOiAke3VybH1gXG4gICAgICAgICAgICAgIDogYEdpdEh1YiBDTEkgbm90IGF1dGhlbnRpY2F0ZWQuIFJ1biBcXGBnaCBhdXRoIGxvZ2luXFxgIGFuZCB0cnkgYWdhaW4sIG9yIGNvbm5lY3QgR2l0SHViIG9uIHRoZSB3ZWI6ICR7dXJsfWAsXG4gICAgICAgICAgKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hhc19naF90b2tlbic6XG4gICAgICAgICAgc2V0U3RlcCh7IG5hbWU6ICdjb25maXJtJywgdG9rZW46IHJlc3VsdC50b2tlbiB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gb25Eb25lIGlzIHN0YWJsZSBhY3Jvc3MgcmVuZGVyczsgaW50ZW50aW9uYWxseSBub3QgaW4gZGVwcy5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGhhbmRsZUNhbmNlbCA9ICgpID0+IHtcbiAgICBsb2dFdmVudCgndGVuZ3VfcmVtb3RlX3NldHVwX3Jlc3VsdCcsIHtcbiAgICAgIHJlc3VsdDogJ2NhbmNlbGxlZCcgYXMgU2FmZVN0cmluZyxcbiAgICB9KVxuICAgIG9uRG9uZSgpXG4gIH1cblxuICBjb25zdCBoYW5kbGVDb25maXJtID0gYXN5bmMgKHRva2VuOiBSZWRhY3RlZEdpdGh1YlRva2VuKSA9PiB7XG4gICAgc2V0U3RlcCh7IG5hbWU6ICd1cGxvYWRpbmcnIH0pXG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpbXBvcnRHaXRodWJUb2tlbih0b2tlbilcbiAgICBpZiAoIXJlc3VsdC5vaykge1xuICAgICAgbG9nRXZlbnQoJ3Rlbmd1X3JlbW90ZV9zZXR1cF9yZXN1bHQnLCB7XG4gICAgICAgIHJlc3VsdDogJ2ltcG9ydF9mYWlsZWQnIGFzIFNhZmVTdHJpbmcsXG4gICAgICAgIGVycm9yX2tpbmQ6IHJlc3VsdC5lcnJvci5raW5kIGFzIFNhZmVTdHJpbmcsXG4gICAgICB9KVxuICAgICAgb25Eb25lKGVycm9yTWVzc2FnZShyZXN1bHQuZXJyb3IsIGdldENvZGVXZWJVcmwoKSkpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBUb2tlbiBpbXBvcnQgc3VjY2VlZGVkLiBFbnZpcm9ubWVudCBjcmVhdGlvbiBpcyBiZXN0LWVmZm9ydCDigJQgaWYgaXRcbiAgICAvLyBmYWlscywgdGhlIHdlYiBzdGF0ZSBtYWNoaW5lIHJvdXRlcyB0byBlbnYtc2V0dXAgb24gbGFuZGluZywgd2hpY2ggaXNcbiAgICAvLyBvbmUgZXh0cmEgY2xpY2sgYnV0IHN0aWxsIGJldHRlciB0aGFuIHRoZSBPQXV0aCBkYW5jZS5cbiAgICBhd2FpdCBjcmVhdGVEZWZhdWx0RW52aXJvbm1lbnQoKVxuXG4gICAgY29uc3QgdXJsID0gZ2V0Q29kZVdlYlVybCgpXG4gICAgYXdhaXQgb3BlbkJyb3dzZXIodXJsKVxuXG4gICAgbG9nRXZlbnQoJ3Rlbmd1X3JlbW90ZV9zZXR1cF9yZXN1bHQnLCB7XG4gICAgICByZXN1bHQ6ICdzdWNjZXNzJyBhcyBTYWZlU3RyaW5nLFxuICAgIH0pXG4gICAgb25Eb25lKGBDb25uZWN0ZWQgYXMgJHtyZXN1bHQucmVzdWx0LmdpdGh1Yl91c2VybmFtZX0uIE9wZW5lZCAke3VybH1gKVxuICB9XG5cbiAgaWYgKHN0ZXAubmFtZSA9PT0gJ2NoZWNraW5nJykge1xuICAgIHJldHVybiA8TG9hZGluZ1N0YXRlIG1lc3NhZ2U9XCJDaGVja2luZyBsb2dpbiBzdGF0dXPigKZcIiAvPlxuICB9XG5cbiAgaWYgKHN0ZXAubmFtZSA9PT0gJ3VwbG9hZGluZycpIHtcbiAgICByZXR1cm4gPExvYWRpbmdTdGF0ZSBtZXNzYWdlPVwiQ29ubmVjdGluZyBHaXRIdWIgdG8gQ2xhdWRl4oCmXCIgLz5cbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gc3RlcC50b2tlblxuICByZXR1cm4gKFxuICAgIDxEaWFsb2dcbiAgICAgIHRpdGxlPVwiQ29ubmVjdCBDbGF1ZGUgb24gdGhlIHdlYiB0byBHaXRIdWI/XCJcbiAgICAgIG9uQ2FuY2VsPXtoYW5kbGVDYW5jZWx9XG4gICAgICBoaWRlSW5wdXRHdWlkZVxuICAgID5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICA8VGV4dD5cbiAgICAgICAgICBDbGF1ZGUgb24gdGhlIHdlYiByZXF1aXJlcyBjb25uZWN0aW5nIHRvIHlvdXIgR2l0SHViIGFjY291bnQgdG8gY2xvbmVcbiAgICAgICAgICBhbmQgcHVzaCBjb2RlIG9uIHlvdXIgYmVoYWxmLlxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgICAgIFlvdXIgbG9jYWwgY3JlZGVudGlhbHMgYXJlIHVzZWQgdG8gYXV0aGVudGljYXRlIHdpdGggR2l0SHViXG4gICAgICAgIDwvVGV4dD5cbiAgICAgIDwvQm94PlxuICAgICAgPFNlbGVjdFxuICAgICAgICBvcHRpb25zPXtbXG4gICAgICAgICAgeyBsYWJlbDogJ0NvbnRpbnVlJywgdmFsdWU6ICdzZW5kJyB9LFxuICAgICAgICAgIHsgbGFiZWw6ICdDYW5jZWwnLCB2YWx1ZTogJ2NhbmNlbCcgfSxcbiAgICAgICAgXX1cbiAgICAgICAgb25DaGFuZ2U9e3ZhbHVlID0+IHtcbiAgICAgICAgICBpZiAodmFsdWUgPT09ICdzZW5kJykge1xuICAgICAgICAgICAgdm9pZCBoYW5kbGVDb25maXJtKHRva2VuKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoYW5kbGVDYW5jZWwoKVxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgICAgb25DYW5jZWw9e2hhbmRsZUNhbmNlbH1cbiAgICAgIC8+XG4gICAgPC9EaWFsb2c+XG4gIClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGwoXG4gIG9uRG9uZTogTG9jYWxKU1hDb21tYW5kT25Eb25lLFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGU+IHtcbiAgcmV0dXJuIDxXZWIgb25Eb25lPXtvbkRvbmV9IC8+XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLEtBQUssUUFBUSxPQUFPO0FBQzdCLE9BQU8sS0FBS0MsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsU0FBUyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUMzQyxTQUFTQyxNQUFNLFFBQVEsd0NBQXdDO0FBQy9ELFNBQVNDLE1BQU0sUUFBUSwwQ0FBMEM7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
