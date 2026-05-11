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
exports.setupTokenHandler = setupTokenHandler;
exports.doctorHandler = doctorHandler;
exports.installHandler = installHandler;
var compiler_runtime_1 = require("react/compiler-runtime");
/**
 * Miscellaneous subcommand handlers — extracted from main.tsx for lazy loading.
 * setup-token, doctor, install
 */
/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */
var process_1 = require("process");
var react_1 = require("react");
var WelcomeV2_js_1 = require("../../components/LogoV2/WelcomeV2.js");
var useManagePlugins_js_1 = require("../../hooks/useManagePlugins.js");
var ink_js_1 = require("../../ink.js");
var KeybindingProviderSetup_js_1 = require("../../keybindings/KeybindingProviderSetup.js");
var index_js_1 = require("../../services/analytics/index.js");
var MCPConnectionManager_js_1 = require("../../services/mcp/MCPConnectionManager.js");
var AppState_js_1 = require("../../state/AppState.js");
var onChangeAppState_js_1 = require("../../state/onChangeAppState.js");
var auth_js_1 = require("../../utils/auth.js");
function setupTokenHandler(root) {
    return __awaiter(this, void 0, void 0, function () {
        var showAuthWarning, ConsoleOAuthFlow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, index_js_1.logEvent)('tengu_setup_token_command', {});
                    showAuthWarning = !(0, auth_js_1.isAnthropicAuthEnabled)();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../components/ConsoleOAuthFlow.js'); })];
                case 1:
                    ConsoleOAuthFlow = (_a.sent()).ConsoleOAuthFlow;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            root.render(<AppState_js_1.AppStateProvider onChangeAppState={onChangeAppState_js_1.onChangeAppState}>
        <KeybindingProviderSetup_js_1.KeybindingSetup>
          <ink_js_1.Box flexDirection="column" gap={1}>
            <WelcomeV2_js_1.WelcomeV2 />
            {showAuthWarning && <ink_js_1.Box flexDirection="column">
                <ink_js_1.Text color="warning">
                  Warning: You already have authentication configured via
                  environment variable or API key helper.
                </ink_js_1.Text>
                <ink_js_1.Text color="warning">
                  The setup-token command will create a new OAuth token which
                  you can use instead.
                </ink_js_1.Text>
              </ink_js_1.Box>}
            <ConsoleOAuthFlow onDone={function () {
                                    void resolve();
                                }} mode="setup-token" startingMessage="This will guide you through long-lived (1-year) auth token setup for your Claude account. Claude subscription required."/>
          </ink_js_1.Box>
        </KeybindingProviderSetup_js_1.KeybindingSetup>
      </AppState_js_1.AppStateProvider>);
                        })];
                case 2:
                    _a.sent();
                    root.unmount();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
// DoctorWithPlugins wrapper + doctor handler
var DoctorLazy = react_1.default.lazy(function () { return Promise.resolve().then(function () { return require('../../screens/Doctor.js'); }).then(function (m) { return ({
    default: m.Doctor
}); }); });
function DoctorWithPlugins(t0) {
    var $ = (0, compiler_runtime_1.c)(2);
    var onDone = t0.onDone;
    (0, useManagePlugins_js_1.useManagePlugins)();
    var t1;
    if ($[0] !== onDone) {
        t1 = <react_1.default.Suspense fallback={null}><DoctorLazy onDone={onDone}/></react_1.default.Suspense>;
        $[0] = onDone;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    return t1;
}
function doctorHandler(root) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, index_js_1.logEvent)('tengu_doctor_command', {});
                    return [4 /*yield*/, new Promise(function (resolve) {
                            root.render(<AppState_js_1.AppStateProvider>
        <KeybindingProviderSetup_js_1.KeybindingSetup>
          <MCPConnectionManager_js_1.MCPConnectionManager dynamicMcpConfig={undefined} isStrictMcpConfig={false}>
            <DoctorWithPlugins onDone={function () {
                                    void resolve();
                                }}/>
          </MCPConnectionManager_js_1.MCPConnectionManager>
        </KeybindingProviderSetup_js_1.KeybindingSetup>
      </AppState_js_1.AppStateProvider>);
                        })];
                case 1:
                    _a.sent();
                    root.unmount();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
// install handler
function installHandler(target, options) {
    return __awaiter(this, void 0, void 0, function () {
        var setup, install;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../../setup.js'); })];
                case 1:
                    setup = (_a.sent()).setup;
                    return [4 /*yield*/, setup((0, process_1.cwd)(), 'default', false, false, undefined, false)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../commands/install.js'); })];
                case 3:
                    install = (_a.sent()).install;
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var args = [];
                            if (target)
                                args.push(target);
                            if (options.force)
                                args.push('--force');
                            void install.call(function (result) {
                                void resolve();
                                process.exit(result.includes('failed') ? 1 : 0);
                            }, {}, args);
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjd2QiLCJSZWFjdCIsIldlbGNvbWVWMiIsInVzZU1hbmFnZVBsdWdpbnMiLCJSb290IiwiQm94IiwiVGV4dCIsIktleWJpbmRpbmdTZXR1cCIsImxvZ0V2ZW50IiwiTUNQQ29ubmVjdGlvbk1hbmFnZXIiLCJBcHBTdGF0ZVByb3ZpZGVyIiwib25DaGFuZ2VBcHBTdGF0ZSIsImlzQW50aHJvcGljQXV0aEVuYWJsZWQiLCJzZXR1cFRva2VuSGFuZGxlciIsInJvb3QiLCJQcm9taXNlIiwic2hvd0F1dGhXYXJuaW5nIiwiQ29uc29sZU9BdXRoRmxvdyIsInJlc29sdmUiLCJyZW5kZXIiLCJ1bm1vdW50IiwicHJvY2VzcyIsImV4aXQiLCJEb2N0b3JMYXp5IiwibGF6eSIsInRoZW4iLCJtIiwiZGVmYXVsdCIsIkRvY3RvciIsIkRvY3RvcldpdGhQbHVnaW5zIiwidDAiLCIkIiwiX2MiLCJvbkRvbmUiLCJ0MSIsImRvY3RvckhhbmRsZXIiLCJ1bmRlZmluZWQiLCJpbnN0YWxsSGFuZGxlciIsInRhcmdldCIsIm9wdGlvbnMiLCJmb3JjZSIsInNldHVwIiwiaW5zdGFsbCIsImFyZ3MiLCJwdXNoIiwiY2FsbCIsInJlc3VsdCIsImluY2x1ZGVzIl0sInNvdXJjZXMiOlsidXRpbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNaXNjZWxsYW5lb3VzIHN1YmNvbW1hbmQgaGFuZGxlcnMg4oCUIGV4dHJhY3RlZCBmcm9tIG1haW4udHN4IGZvciBsYXp5IGxvYWRpbmcuXG4gKiBzZXR1cC10b2tlbiwgZG9jdG9yLCBpbnN0YWxsXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIGN1c3RvbS1ydWxlcy9uby1wcm9jZXNzLWV4aXQgLS0gQ0xJIHN1YmNvbW1hbmQgaGFuZGxlcnMgaW50ZW50aW9uYWxseSBleGl0ICovXG5cbmltcG9ydCB7IGN3ZCB9IGZyb20gJ3Byb2Nlc3MnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBXZWxjb21lVjIgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL0xvZ29WMi9XZWxjb21lVjIuanMnXG5pbXBvcnQgeyB1c2VNYW5hZ2VQbHVnaW5zIH0gZnJvbSAnLi4vLi4vaG9va3MvdXNlTWFuYWdlUGx1Z2lucy5qcydcbmltcG9ydCB0eXBlIHsgUm9vdCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IEtleWJpbmRpbmdTZXR1cCB9IGZyb20gJy4uLy4uL2tleWJpbmRpbmdzL0tleWJpbmRpbmdQcm92aWRlclNldHVwLmpzJ1xuaW1wb3J0IHsgbG9nRXZlbnQgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQgeyBNQ1BDb25uZWN0aW9uTWFuYWdlciB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL21jcC9NQ1BDb25uZWN0aW9uTWFuYWdlci5qcydcbmltcG9ydCB7IEFwcFN0YXRlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9zdGF0ZS9BcHBTdGF0ZS5qcydcbmltcG9ydCB7IG9uQ2hhbmdlQXBwU3RhdGUgfSBmcm9tICcuLi8uLi9zdGF0ZS9vbkNoYW5nZUFwcFN0YXRlLmpzJ1xuaW1wb3J0IHsgaXNBbnRocm9waWNBdXRoRW5hYmxlZCB9IGZyb20gJy4uLy4uL3V0aWxzL2F1dGguanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXR1cFRva2VuSGFuZGxlcihyb290OiBSb290KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxvZ0V2ZW50KCd0ZW5ndV9zZXR1cF90b2tlbl9jb21tYW5kJywge30pXG5cbiAgY29uc3Qgc2hvd0F1dGhXYXJuaW5nID0gIWlzQW50aHJvcGljQXV0aEVuYWJsZWQoKVxuICBjb25zdCB7IENvbnNvbGVPQXV0aEZsb3cgfSA9IGF3YWl0IGltcG9ydChcbiAgICAnLi4vLi4vY29tcG9uZW50cy9Db25zb2xlT0F1dGhGbG93LmpzJ1xuICApXG4gIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4ge1xuICAgIHJvb3QucmVuZGVyKFxuICAgICAgPEFwcFN0YXRlUHJvdmlkZXIgb25DaGFuZ2VBcHBTdGF0ZT17b25DaGFuZ2VBcHBTdGF0ZX0+XG4gICAgICAgIDxLZXliaW5kaW5nU2V0dXA+XG4gICAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAgICAgIDxXZWxjb21lVjIgLz5cbiAgICAgICAgICAgIHtzaG93QXV0aFdhcm5pbmcgJiYgKFxuICAgICAgICAgICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgIFdhcm5pbmc6IFlvdSBhbHJlYWR5IGhhdmUgYXV0aGVudGljYXRpb24gY29uZmlndXJlZCB2aWFcbiAgICAgICAgICAgICAgICAgIGVudmlyb25tZW50IHZhcmlhYmxlIG9yIEFQSSBrZXkgaGVscGVyLlxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgICAgICAgIFRoZSBzZXR1cC10b2tlbiBjb21tYW5kIHdpbGwgY3JlYXRlIGEgbmV3IE9BdXRoIHRva2VuIHdoaWNoXG4gICAgICAgICAgICAgICAgICB5b3UgY2FuIHVzZSBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPENvbnNvbGVPQXV0aEZsb3dcbiAgICAgICAgICAgICAgb25Eb25lPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgdm9pZCByZXNvbHZlKClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgbW9kZT1cInNldHVwLXRva2VuXCJcbiAgICAgICAgICAgICAgc3RhcnRpbmdNZXNzYWdlPVwiVGhpcyB3aWxsIGd1aWRlIHlvdSB0aHJvdWdoIGxvbmctbGl2ZWQgKDEteWVhcikgYXV0aCB0b2tlbiBzZXR1cCBmb3IgeW91ciBDbGF1ZGUgYWNjb3VudC4gQ2xhdWRlIHN1YnNjcmlwdGlvbiByZXF1aXJlZC5cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0JveD5cbiAgICAgICAgPC9LZXliaW5kaW5nU2V0dXA+XG4gICAgICA8L0FwcFN0YXRlUHJvdmlkZXI+LFxuICAgIClcbiAgfSlcbiAgcm9vdC51bm1vdW50KClcbiAgcHJvY2Vzcy5leGl0KDApXG59XG5cbi8vIERvY3RvcldpdGhQbHVnaW5zIHdyYXBwZXIgKyBkb2N0b3IgaGFuZGxlclxuY29uc3QgRG9jdG9yTGF6eSA9IFJlYWN0LmxhenkoKCkgPT5cbiAgaW1wb3J0KCcuLi8uLi9zY3JlZW5zL0RvY3Rvci5qcycpLnRoZW4obSA9PiAoeyBkZWZhdWx0OiBtLkRvY3RvciB9KSksXG4pXG5cbmZ1bmN0aW9uIERvY3RvcldpdGhQbHVnaW5zKHtcbiAgb25Eb25lLFxufToge1xuICBvbkRvbmU6ICgpID0+IHZvaWRcbn0pOiBSZWFjdC5SZWFjdE5vZGUge1xuICB1c2VNYW5hZ2VQbHVnaW5zKClcbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuU3VzcGVuc2UgZmFsbGJhY2s9e251bGx9PlxuICAgICAgPERvY3Rvckxhenkgb25Eb25lPXtvbkRvbmV9IC8+XG4gICAgPC9SZWFjdC5TdXNwZW5zZT5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG9jdG9ySGFuZGxlcihyb290OiBSb290KTogUHJvbWlzZTx2b2lkPiB7XG4gIGxvZ0V2ZW50KCd0ZW5ndV9kb2N0b3JfY29tbWFuZCcsIHt9KVxuXG4gIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4ge1xuICAgIHJvb3QucmVuZGVyKFxuICAgICAgPEFwcFN0YXRlUHJvdmlkZXI+XG4gICAgICAgIDxLZXliaW5kaW5nU2V0dXA+XG4gICAgICAgICAgPE1DUENvbm5lY3Rpb25NYW5hZ2VyXG4gICAgICAgICAgICBkeW5hbWljTWNwQ29uZmlnPXt1bmRlZmluZWR9XG4gICAgICAgICAgICBpc1N0cmljdE1jcENvbmZpZz17ZmFsc2V9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPERvY3RvcldpdGhQbHVnaW5zXG4gICAgICAgICAgICAgIG9uRG9uZT17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHZvaWQgcmVzb2x2ZSgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvTUNQQ29ubmVjdGlvbk1hbmFnZXI+XG4gICAgICAgIDwvS2V5YmluZGluZ1NldHVwPlxuICAgICAgPC9BcHBTdGF0ZVByb3ZpZGVyPixcbiAgICApXG4gIH0pXG4gIHJvb3QudW5tb3VudCgpXG4gIHByb2Nlc3MuZXhpdCgwKVxufVxuXG4vLyBpbnN0YWxsIGhhbmRsZXJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnN0YWxsSGFuZGxlcihcbiAgdGFyZ2V0OiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM6IHsgZm9yY2U/OiBib29sZWFuIH0sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgeyBzZXR1cCB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi9zZXR1cC5qcycpXG4gIGF3YWl0IHNldHVwKGN3ZCgpLCAnZGVmYXVsdCcsIGZhbHNlLCBmYWxzZSwgdW5kZWZpbmVkLCBmYWxzZSlcbiAgY29uc3QgeyBpbnN0YWxsIH0gPSBhd2FpdCBpbXBvcnQoJy4uLy4uL2NvbW1hbmRzL2luc3RhbGwuanMnKVxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICBjb25zdCBhcmdzOiBzdHJpbmdbXSA9IFtdXG4gICAgaWYgKHRhcmdldCkgYXJncy5wdXNoKHRhcmdldClcbiAgICBpZiAob3B0aW9ucy5mb3JjZSkgYXJncy5wdXNoKCctLWZvcmNlJylcblxuICAgIHZvaWQgaW5zdGFsbC5jYWxsKFxuICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgdm9pZCByZXNvbHZlKClcbiAgICAgICAgcHJvY2Vzcy5leGl0KHJlc3VsdC5pbmNsdWRlcygnZmFpbGVkJykgPyAxIDogMClcbiAgICAgIH0sXG4gICAgICB7fSxcbiAgICAgIGFyZ3MsXG4gICAgKVxuICB9KVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxHQUFHLFFBQVEsU0FBUztBQUM3QixPQUFPQyxLQUFLLE1BQU0sT0FBTztBQUN6QixTQUFTQyxTQUFTLFFBQVEsc0NBQXNDO0FBQ2hFLFNBQVNDLGdCQUFnQixRQUFRLGlDQUFpQztBQUNsRSxjQUFjQyxJQUFJLFFBQVEsY0FBYztBQUN4QyxTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxjQUFjO0FBQ3hDLFNBQVNDLGVBQWUsUUFBUSw4Q0FBOEM7QUFDOUUsU0FBU0MsUUFBUSxRQUFRLG1DQUFtQztBQUM1RCxTQUFTQyxvQkFBb0IsUUFBUSw0Q0FBNEM7QUFDakYsU0FBU0MsZ0JBQWdCLFFBQVEseUJBQXlCO0FBQzFELFNBQVNDLGdCQUFnQixRQUFRLGlDQUFpQztBQUNsRSxTQUFTQyxzQkFBc0IsUUFBUSxxQkFBcUI7QUFFNUQsT0FBTyxlQUFlQyxpQkFBaUJBLENBQUNDLElBQUksRUFBRVYsSUFBSSxDQUFDLEVBQUVXLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNqRVAsUUFBUSxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxDQUFDO0VBRXpDLE1BQU1RLGVBQWUsR0FBRyxDQUFDSixzQkFBc0IsQ0FBQyxDQUFDO0VBQ2pELE1BQU07SUFBRUs7RUFBaUIsQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUN2QyxzQ0FDRixDQUFDO0VBQ0QsTUFBTSxJQUFJRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUNHLE9BQU8sSUFBSTtJQUNqQ0osSUFBSSxDQUFDSyxNQUFNLENBQ1QsQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDUixnQkFBZ0IsQ0FBQztBQUMzRCxRQUFRLENBQUMsZUFBZTtBQUN4QixVQUFVLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFlBQVksQ0FBQyxTQUFTO0FBQ3RCLFlBQVksQ0FBQ0ssZUFBZSxJQUNkLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRO0FBQ3pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUztBQUNyQztBQUNBO0FBQ0EsZ0JBQWdCLEVBQUUsSUFBSTtBQUN0QixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVM7QUFDckM7QUFDQTtBQUNBLGdCQUFnQixFQUFFLElBQUk7QUFDdEIsY0FBYyxFQUFFLEdBQUcsQ0FDTjtBQUNiLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDZixNQUFNLENBQUMsQ0FBQyxNQUFNO1lBQ1osS0FBS0UsT0FBTyxDQUFDLENBQUM7VUFDaEIsQ0FBQyxDQUFDLENBQ0YsSUFBSSxDQUFDLGFBQWEsQ0FDbEIsZUFBZSxDQUFDLHlIQUF5SDtBQUV2SixVQUFVLEVBQUUsR0FBRztBQUNmLFFBQVEsRUFBRSxlQUFlO0FBQ3pCLE1BQU0sRUFBRSxnQkFBZ0IsQ0FDcEIsQ0FBQztFQUNILENBQUMsQ0FBQztFQUNGSixJQUFJLENBQUNNLE9BQU8sQ0FBQyxDQUFDO0VBQ2RDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqQjs7QUFFQTtBQUNBLE1BQU1DLFVBQVUsR0FBR3RCLEtBQUssQ0FBQ3VCLElBQUksQ0FBQyxNQUM1QixNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQ0MsSUFBSSxDQUFDQyxDQUFDLEtBQUs7RUFBRUMsT0FBTyxFQUFFRCxDQUFDLENBQUNFO0FBQU8sQ0FBQyxDQUFDLENBQ3JFLENBQUM7QUFFRCxTQUFBQyxrQkFBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUEyQjtJQUFBQztFQUFBLElBQUFILEVBSTFCO0VBQ0MzQixnQkFBZ0IsQ0FBQyxDQUFDO0VBQUEsSUFBQStCLEVBQUE7RUFBQSxJQUFBSCxDQUFBLFFBQUFFLE1BQUE7SUFFaEJDLEVBQUEsbUJBQTBCLFFBQUksQ0FBSixLQUFHLENBQUMsQ0FDNUIsQ0FBQyxVQUFVLENBQVNELE1BQU0sQ0FBTkEsT0FBSyxDQUFDLEdBQzVCLGlCQUFpQjtJQUFBRixDQUFBLE1BQUFFLE1BQUE7SUFBQUYsQ0FBQSxNQUFBRyxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBSCxDQUFBO0VBQUE7RUFBQSxPQUZqQkcsRUFFaUI7QUFBQTtBQUlyQixPQUFPLGVBQWVDLGFBQWFBLENBQUNyQixJQUFJLEVBQUVWLElBQUksQ0FBQyxFQUFFVyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDN0RQLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUVwQyxNQUFNLElBQUlPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQ0csT0FBTyxJQUFJO0lBQ2pDSixJQUFJLENBQUNLLE1BQU0sQ0FDVCxDQUFDLGdCQUFnQjtBQUN2QixRQUFRLENBQUMsZUFBZTtBQUN4QixVQUFVLENBQUMsb0JBQW9CLENBQ25CLGdCQUFnQixDQUFDLENBQUNpQixTQUFTLENBQUMsQ0FDNUIsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFFckMsWUFBWSxDQUFDLGlCQUFpQixDQUNoQixNQUFNLENBQUMsQ0FBQyxNQUFNO1lBQ1osS0FBS2xCLE9BQU8sQ0FBQyxDQUFDO1VBQ2hCLENBQUMsQ0FBQztBQUVoQixVQUFVLEVBQUUsb0JBQW9CO0FBQ2hDLFFBQVEsRUFBRSxlQUFlO0FBQ3pCLE1BQU0sRUFBRSxnQkFBZ0IsQ0FDcEIsQ0FBQztFQUNILENBQUMsQ0FBQztFQUNGSixJQUFJLENBQUNNLE9BQU8sQ0FBQyxDQUFDO0VBQ2RDLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqQjs7QUFFQTtBQUNBLE9BQU8sZUFBZWUsY0FBY0EsQ0FDbENDLE1BQU0sRUFBRSxNQUFNLEdBQUcsU0FBUyxFQUMxQkMsT0FBTyxFQUFFO0VBQUVDLEtBQUssQ0FBQyxFQUFFLE9BQU87QUFBQyxDQUFDLENBQzdCLEVBQUV6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixNQUFNO0lBQUUwQjtFQUFNLENBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztFQUNoRCxNQUFNQSxLQUFLLENBQUN6QyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFb0MsU0FBUyxFQUFFLEtBQUssQ0FBQztFQUM3RCxNQUFNO0lBQUVNO0VBQVEsQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLDJCQUEyQixDQUFDO0VBQzdELE1BQU0sSUFBSTNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQ0csT0FBTyxJQUFJO0lBQ2pDLE1BQU15QixJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJTCxNQUFNLEVBQUVLLElBQUksQ0FBQ0MsSUFBSSxDQUFDTixNQUFNLENBQUM7SUFDN0IsSUFBSUMsT0FBTyxDQUFDQyxLQUFLLEVBQUVHLElBQUksQ0FBQ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUV2QyxLQUFLRixPQUFPLENBQUNHLElBQUksQ0FDZkMsTUFBTSxJQUFJO01BQ1IsS0FBSzVCLE9BQU8sQ0FBQyxDQUFDO01BQ2RHLE9BQU8sQ0FBQ0MsSUFBSSxDQUFDd0IsTUFBTSxDQUFDQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRCxDQUFDLEVBQ0QsQ0FBQyxDQUFDLEVBQ0ZKLElBQ0YsQ0FBQztFQUNILENBQUMsQ0FBQztBQUNKIiwiaWdub3JlTGlzdCI6W119
