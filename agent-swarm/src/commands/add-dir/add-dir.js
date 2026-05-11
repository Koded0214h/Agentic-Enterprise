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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = call;
var compiler_runtime_1 = require("react/compiler-runtime");
var chalk_1 = require("chalk");
var figures_1 = require("figures");
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var MessageResponse_js_1 = require("../../components/MessageResponse.js");
var AddWorkspaceDirectory_js_1 = require("../../components/permissions/rules/AddWorkspaceDirectory.js");
var ink_js_1 = require("../../ink.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var validation_js_1 = require("./validation.js");
function AddDirError(t0) {
    var $ = (0, compiler_runtime_1.c)(10);
    var message = t0.message, args = t0.args, onDone = t0.onDone;
    var t1;
    var t2;
    if ($[0] !== onDone) {
        t1 = function () {
            var timer = setTimeout(onDone, 0);
            return function () { return clearTimeout(timer); };
        };
        t2 = [onDone];
        $[0] = onDone;
        $[1] = t1;
        $[2] = t2;
    }
    else {
        t1 = $[1];
        t2 = $[2];
    }
    (0, react_1.useEffect)(t1, t2);
    var t3;
    if ($[3] !== args) {
        t3 = <ink_js_1.Text dimColor={true}>{figures_1.default.pointer} /add-dir {args}</ink_js_1.Text>;
        $[3] = args;
        $[4] = t3;
    }
    else {
        t3 = $[4];
    }
    var t4;
    if ($[5] !== message) {
        t4 = <MessageResponse_js_1.MessageResponse><ink_js_1.Text>{message}</ink_js_1.Text></MessageResponse_js_1.MessageResponse>;
        $[5] = message;
        $[6] = t4;
    }
    else {
        t4 = $[6];
    }
    var t5;
    if ($[7] !== t3 || $[8] !== t4) {
        t5 = <ink_js_1.Box flexDirection="column">{t3}{t4}</ink_js_1.Box>;
        $[7] = t3;
        $[8] = t4;
        $[9] = t5;
    }
    else {
        t5 = $[9];
    }
    return t5;
}
function call(onDone, context, args) {
    return __awaiter(this, void 0, void 0, function () {
        var directoryPath, appState, handleAddDirectory, result, message_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    directoryPath = (args !== null && args !== void 0 ? args : '').trim();
                    appState = context.getAppState();
                    handleAddDirectory = function (path_1) {
                        var args_1 = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            args_1[_i - 1] = arguments[_i];
                        }
                        return __awaiter(_this, __spreadArray([path_1], args_1, true), void 0, function (path, remember) {
                            var destination, permissionUpdate, latestAppState, updatedContext, currentDirs, message, messageWithHint;
                            if (remember === void 0) { remember = false; }
                            return __generator(this, function (_a) {
                                destination = remember ? 'localSettings' : 'session';
                                permissionUpdate = {
                                    type: 'addDirectories',
                                    directories: [path],
                                    destination: destination
                                };
                                latestAppState = context.getAppState();
                                updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(latestAppState.toolPermissionContext, permissionUpdate);
                                context.setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: updatedContext })); });
                                currentDirs = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)();
                                if (!currentDirs.includes(path)) {
                                    (0, state_js_1.setAdditionalDirectoriesForClaudeMd)(__spreadArray(__spreadArray([], currentDirs, true), [path], false));
                                }
                                sandbox_adapter_js_1.SandboxManager.refreshConfig();
                                if (remember) {
                                    try {
                                        (0, PermissionUpdate_js_1.persistPermissionUpdate)(permissionUpdate);
                                        message = "Added ".concat(chalk_1.default.bold(path), " as a working directory and saved to local settings");
                                    }
                                    catch (error) {
                                        message = "Added ".concat(chalk_1.default.bold(path), " as a working directory. Failed to save to local settings: ").concat(error instanceof Error ? error.message : 'Unknown error');
                                    }
                                }
                                else {
                                    message = "Added ".concat(chalk_1.default.bold(path), " as a working directory for this session");
                                }
                                messageWithHint = "".concat(message, " ").concat(chalk_1.default.dim('· /permissions to manage'));
                                onDone(messageWithHint);
                                return [2 /*return*/];
                            });
                        });
                    };
                    // When no path is provided, show AddWorkspaceDirectory input form directly
                    // and return to REPL after confirmation
                    if (!directoryPath) {
                        return [2 /*return*/, <AddWorkspaceDirectory_js_1.AddWorkspaceDirectory permissionContext={appState.toolPermissionContext} onAddDirectory={handleAddDirectory} onCancel={function () {
                                    onDone('Did not add a working directory.');
                                }}/>];
                    }
                    return [4 /*yield*/, (0, validation_js_1.validateDirectoryForWorkspace)(directoryPath, appState.toolPermissionContext)];
                case 1:
                    result = _a.sent();
                    if (result.resultType !== 'success') {
                        message_1 = (0, validation_js_1.addDirHelpMessage)(result);
                        return [2 /*return*/, <AddDirError message={message_1} args={args !== null && args !== void 0 ? args : ''} onDone={function () { return onDone(message_1); }}/>];
                    }
                    return [2 /*return*/, <AddWorkspaceDirectory_js_1.AddWorkspaceDirectory directoryPath={result.absolutePath} permissionContext={appState.toolPermissionContext} onAddDirectory={handleAddDirectory} onCancel={function () {
                                onDone("Did not add ".concat(chalk_1.default.bold(result.absolutePath), " as a working directory."));
                            }}/>];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsImZpZ3VyZXMiLCJSZWFjdCIsInVzZUVmZmVjdCIsImdldEFkZGl0aW9uYWxEaXJlY3Rvcmllc0ZvckNsYXVkZU1kIiwic2V0QWRkaXRpb25hbERpcmVjdG9yaWVzRm9yQ2xhdWRlTWQiLCJMb2NhbEpTWENvbW1hbmRDb250ZXh0IiwiTWVzc2FnZVJlc3BvbnNlIiwiQWRkV29ya3NwYWNlRGlyZWN0b3J5IiwiQm94IiwiVGV4dCIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsImFwcGx5UGVybWlzc2lvblVwZGF0ZSIsInBlcnNpc3RQZXJtaXNzaW9uVXBkYXRlIiwiUGVybWlzc2lvblVwZGF0ZURlc3RpbmF0aW9uIiwiU2FuZGJveE1hbmFnZXIiLCJhZGREaXJIZWxwTWVzc2FnZSIsInZhbGlkYXRlRGlyZWN0b3J5Rm9yV29ya3NwYWNlIiwiQWRkRGlyRXJyb3IiLCJ0MCIsIiQiLCJfYyIsIm1lc3NhZ2UiLCJhcmdzIiwib25Eb25lIiwidDEiLCJ0MiIsInRpbWVyIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsInQzIiwicG9pbnRlciIsInQ0IiwidDUiLCJjYWxsIiwiY29udGV4dCIsIlByb21pc2UiLCJSZWFjdE5vZGUiLCJkaXJlY3RvcnlQYXRoIiwidHJpbSIsImFwcFN0YXRlIiwiZ2V0QXBwU3RhdGUiLCJoYW5kbGVBZGREaXJlY3RvcnkiLCJwYXRoIiwicmVtZW1iZXIiLCJkZXN0aW5hdGlvbiIsInBlcm1pc3Npb25VcGRhdGUiLCJ0eXBlIiwiY29uc3QiLCJkaXJlY3RvcmllcyIsImxhdGVzdEFwcFN0YXRlIiwidXBkYXRlZENvbnRleHQiLCJ0b29sUGVybWlzc2lvbkNvbnRleHQiLCJzZXRBcHBTdGF0ZSIsInByZXYiLCJjdXJyZW50RGlycyIsImluY2x1ZGVzIiwicmVmcmVzaENvbmZpZyIsImJvbGQiLCJlcnJvciIsIkVycm9yIiwibWVzc2FnZVdpdGhIaW50IiwiZGltIiwicmVzdWx0IiwicmVzdWx0VHlwZSIsImFic29sdXRlUGF0aCJdLCJzb3VyY2VzIjpbImFkZC1kaXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjaGFsayBmcm9tICdjaGFsaydcbmltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnXG5pbXBvcnQge1xuICBnZXRBZGRpdGlvbmFsRGlyZWN0b3JpZXNGb3JDbGF1ZGVNZCxcbiAgc2V0QWRkaXRpb25hbERpcmVjdG9yaWVzRm9yQ2xhdWRlTWQsXG59IGZyb20gJy4uLy4uL2Jvb3RzdHJhcC9zdGF0ZS5qcydcbmltcG9ydCB0eXBlIHsgTG9jYWxKU1hDb21tYW5kQ29udGV4dCB9IGZyb20gJy4uLy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgTWVzc2FnZVJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9NZXNzYWdlUmVzcG9uc2UuanMnXG5pbXBvcnQgeyBBZGRXb3Jrc3BhY2VEaXJlY3RvcnkgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL3Blcm1pc3Npb25zL3J1bGVzL0FkZFdvcmtzcGFjZURpcmVjdG9yeS5qcydcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB0eXBlIHsgTG9jYWxKU1hDb21tYW5kT25Eb25lIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB7XG4gIGFwcGx5UGVybWlzc2lvblVwZGF0ZSxcbiAgcGVyc2lzdFBlcm1pc3Npb25VcGRhdGUsXG59IGZyb20gJy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zL1Blcm1pc3Npb25VcGRhdGUuanMnXG5pbXBvcnQgdHlwZSB7IFBlcm1pc3Npb25VcGRhdGVEZXN0aW5hdGlvbiB9IGZyb20gJy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zL1Blcm1pc3Npb25VcGRhdGVTY2hlbWEuanMnXG5pbXBvcnQgeyBTYW5kYm94TWFuYWdlciB9IGZyb20gJy4uLy4uL3V0aWxzL3NhbmRib3gvc2FuZGJveC1hZGFwdGVyLmpzJ1xuaW1wb3J0IHtcbiAgYWRkRGlySGVscE1lc3NhZ2UsXG4gIHZhbGlkYXRlRGlyZWN0b3J5Rm9yV29ya3NwYWNlLFxufSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5cbmZ1bmN0aW9uIEFkZERpckVycm9yKHtcbiAgbWVzc2FnZSxcbiAgYXJncyxcbiAgb25Eb25lLFxufToge1xuICBtZXNzYWdlOiBzdHJpbmdcbiAgYXJnczogc3RyaW5nXG4gIG9uRG9uZTogKCkgPT4gdm9pZFxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gV2UgbmVlZCB0byBkZWZlciBjYWxsaW5nIG9uRG9uZSB0byBhdm9pZCB0aGUgXCJyZXR1cm4gbnVsbFwiIGJ1ZyB3aGVyZVxuICAgIC8vIHRoZSBjb21wb25lbnQgdW5tb3VudHMgYmVmb3JlIFJlYWN0IGNhbiByZW5kZXIgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgLy8gVXNpbmcgc2V0VGltZW91dCBlbnN1cmVzIHRoZSBlcnJvciBkaXNwbGF5cyBiZWZvcmUgdGhlIGNvbW1hbmQgZXhpdHMuXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KG9uRG9uZSwgMClcbiAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHRpbWVyKVxuICB9LCBbb25Eb25lXSlcblxuICByZXR1cm4gKFxuICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgIHtmaWd1cmVzLnBvaW50ZXJ9IC9hZGQtZGlyIHthcmdzfVxuICAgICAgPC9UZXh0PlxuICAgICAgPE1lc3NhZ2VSZXNwb25zZT5cbiAgICAgICAgPFRleHQ+e21lc3NhZ2V9PC9UZXh0PlxuICAgICAgPC9NZXNzYWdlUmVzcG9uc2U+XG4gICAgPC9Cb3g+XG4gIClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGwoXG4gIG9uRG9uZTogTG9jYWxKU1hDb21tYW5kT25Eb25lLFxuICBjb250ZXh0OiBMb2NhbEpTWENvbW1hbmRDb250ZXh0LFxuICBhcmdzPzogc3RyaW5nLFxuKTogUHJvbWlzZTxSZWFjdC5SZWFjdE5vZGU+IHtcbiAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IChhcmdzID8/ICcnKS50cmltKClcbiAgY29uc3QgYXBwU3RhdGUgPSBjb250ZXh0LmdldEFwcFN0YXRlKClcblxuICAvLyBIZWxwZXIgdG8gaGFuZGxlIGFkZGluZyBhIGRpcmVjdG9yeSAoc2hhcmVkIGJ5IGJvdGggd2l0aC1wYXRoIGFuZCBuby1wYXRoIGNhc2VzKVxuICBjb25zdCBoYW5kbGVBZGREaXJlY3RvcnkgPSBhc3luYyAocGF0aDogc3RyaW5nLCByZW1lbWJlciA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgZGVzdGluYXRpb246IFBlcm1pc3Npb25VcGRhdGVEZXN0aW5hdGlvbiA9IHJlbWVtYmVyXG4gICAgICA/ICdsb2NhbFNldHRpbmdzJ1xuICAgICAgOiAnc2Vzc2lvbidcblxuICAgIGNvbnN0IHBlcm1pc3Npb25VcGRhdGUgPSB7XG4gICAgICB0eXBlOiAnYWRkRGlyZWN0b3JpZXMnIGFzIGNvbnN0LFxuICAgICAgZGlyZWN0b3JpZXM6IFtwYXRoXSxcbiAgICAgIGRlc3RpbmF0aW9uLFxuICAgIH1cblxuICAgIC8vIEFwcGx5IHRvIHNlc3Npb24gY29udGV4dFxuICAgIGNvbnN0IGxhdGVzdEFwcFN0YXRlID0gY29udGV4dC5nZXRBcHBTdGF0ZSgpXG4gICAgY29uc3QgdXBkYXRlZENvbnRleHQgPSBhcHBseVBlcm1pc3Npb25VcGRhdGUoXG4gICAgICBsYXRlc3RBcHBTdGF0ZS50b29sUGVybWlzc2lvbkNvbnRleHQsXG4gICAgICBwZXJtaXNzaW9uVXBkYXRlLFxuICAgIClcbiAgICBjb250ZXh0LnNldEFwcFN0YXRlKHByZXYgPT4gKHtcbiAgICAgIC4uLnByZXYsXG4gICAgICB0b29sUGVybWlzc2lvbkNvbnRleHQ6IHVwZGF0ZWRDb250ZXh0LFxuICAgIH0pKVxuXG4gICAgLy8gVXBkYXRlIHNhbmRib3ggY29uZmlnIHNvIEJhc2ggY29tbWFuZHMgY2FuIGFjY2VzcyB0aGUgbmV3IGRpcmVjdG9yeS5cbiAgICAvLyBCb290c3RyYXAgc3RhdGUgaXMgdGhlIHNvdXJjZSBvZiB0cnV0aCBmb3Igc2Vzc2lvbi1vbmx5IGRpcnM7IHBlcnNpc3RlZFxuICAgIC8vIGRpcnMgYXJlIHBpY2tlZCB1cCB2aWEgdGhlIHNldHRpbmdzIHN1YnNjcmlwdGlvbiwgYnV0IHdlIHJlZnJlc2hcbiAgICAvLyBlYWdlcmx5IGhlcmUgdG8gYXZvaWQgYSByYWNlIHdoZW4gdGhlIHVzZXIgYWN0cyBpbW1lZGlhdGVseS5cbiAgICBjb25zdCBjdXJyZW50RGlycyA9IGdldEFkZGl0aW9uYWxEaXJlY3Rvcmllc0ZvckNsYXVkZU1kKClcbiAgICBpZiAoIWN1cnJlbnREaXJzLmluY2x1ZGVzKHBhdGgpKSB7XG4gICAgICBzZXRBZGRpdGlvbmFsRGlyZWN0b3JpZXNGb3JDbGF1ZGVNZChbLi4uY3VycmVudERpcnMsIHBhdGhdKVxuICAgIH1cbiAgICBTYW5kYm94TWFuYWdlci5yZWZyZXNoQ29uZmlnKClcblxuICAgIGxldCBtZXNzYWdlOiBzdHJpbmdcblxuICAgIGlmIChyZW1lbWJlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcGVyc2lzdFBlcm1pc3Npb25VcGRhdGUocGVybWlzc2lvblVwZGF0ZSlcbiAgICAgICAgbWVzc2FnZSA9IGBBZGRlZCAke2NoYWxrLmJvbGQocGF0aCl9IGFzIGEgd29ya2luZyBkaXJlY3RvcnkgYW5kIHNhdmVkIHRvIGxvY2FsIHNldHRpbmdzYFxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbWVzc2FnZSA9IGBBZGRlZCAke2NoYWxrLmJvbGQocGF0aCl9IGFzIGEgd29ya2luZyBkaXJlY3RvcnkuIEZhaWxlZCB0byBzYXZlIHRvIGxvY2FsIHNldHRpbmdzOiAke2Vycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InfWBcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZSA9IGBBZGRlZCAke2NoYWxrLmJvbGQocGF0aCl9IGFzIGEgd29ya2luZyBkaXJlY3RvcnkgZm9yIHRoaXMgc2Vzc2lvbmBcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlV2l0aEhpbnQgPSBgJHttZXNzYWdlfSAke2NoYWxrLmRpbSgnwrcgL3Blcm1pc3Npb25zIHRvIG1hbmFnZScpfWBcbiAgICBvbkRvbmUobWVzc2FnZVdpdGhIaW50KVxuICB9XG5cbiAgLy8gV2hlbiBubyBwYXRoIGlzIHByb3ZpZGVkLCBzaG93IEFkZFdvcmtzcGFjZURpcmVjdG9yeSBpbnB1dCBmb3JtIGRpcmVjdGx5XG4gIC8vIGFuZCByZXR1cm4gdG8gUkVQTCBhZnRlciBjb25maXJtYXRpb25cbiAgaWYgKCFkaXJlY3RvcnlQYXRoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxBZGRXb3Jrc3BhY2VEaXJlY3RvcnlcbiAgICAgICAgcGVybWlzc2lvbkNvbnRleHQ9e2FwcFN0YXRlLnRvb2xQZXJtaXNzaW9uQ29udGV4dH1cbiAgICAgICAgb25BZGREaXJlY3Rvcnk9e2hhbmRsZUFkZERpcmVjdG9yeX1cbiAgICAgICAgb25DYW5jZWw9eygpID0+IHtcbiAgICAgICAgICBvbkRvbmUoJ0RpZCBub3QgYWRkIGEgd29ya2luZyBkaXJlY3RvcnkuJylcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgKVxuICB9XG5cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdmFsaWRhdGVEaXJlY3RvcnlGb3JXb3Jrc3BhY2UoXG4gICAgZGlyZWN0b3J5UGF0aCxcbiAgICBhcHBTdGF0ZS50b29sUGVybWlzc2lvbkNvbnRleHQsXG4gIClcblxuICBpZiAocmVzdWx0LnJlc3VsdFR5cGUgIT09ICdzdWNjZXNzJykge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhZGREaXJIZWxwTWVzc2FnZShyZXN1bHQpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPEFkZERpckVycm9yXG4gICAgICAgIG1lc3NhZ2U9e21lc3NhZ2V9XG4gICAgICAgIGFyZ3M9e2FyZ3MgPz8gJyd9XG4gICAgICAgIG9uRG9uZT17KCkgPT4gb25Eb25lKG1lc3NhZ2UpfVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxBZGRXb3Jrc3BhY2VEaXJlY3RvcnlcbiAgICAgIGRpcmVjdG9yeVBhdGg9e3Jlc3VsdC5hYnNvbHV0ZVBhdGh9XG4gICAgICBwZXJtaXNzaW9uQ29udGV4dD17YXBwU3RhdGUudG9vbFBlcm1pc3Npb25Db250ZXh0fVxuICAgICAgb25BZGREaXJlY3Rvcnk9e2hhbmRsZUFkZERpcmVjdG9yeX1cbiAgICAgIG9uQ2FuY2VsPXsoKSA9PiB7XG4gICAgICAgIG9uRG9uZShcbiAgICAgICAgICBgRGlkIG5vdCBhZGQgJHtjaGFsay5ib2xkKHJlc3VsdC5hYnNvbHV0ZVBhdGgpfSBhcyBhIHdvcmtpbmcgZGlyZWN0b3J5LmAsXG4gICAgICAgIClcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsT0FBT0EsS0FBSyxNQUFNLE9BQU87QUFDekIsT0FBT0MsT0FBTyxNQUFNLFNBQVM7QUFDN0IsT0FBT0MsS0FBSyxJQUFJQyxTQUFTLFFBQVEsT0FBTztBQUN4QyxTQUNFQyxtQ0FBbUMsRUFDbkNDLG1DQUFtQyxRQUM5QiwwQkFBMEI7QUFDakMsY0FBY0Msc0JBQXNCLFFBQVEsbUJBQW1CO0FBQy9ELFNBQVNDLGVBQWUsUUFBUSxxQ0FBcUM7QUFDckUsU0FBU0MscUJBQXFCLFFBQVEsNkRBQTZEO0FBQ25HLFNBQVNDLEdBQUcsRUFBRUMsSUFBSSxRQUFRLGNBQWM7QUFDeEMsY0FBY0MscUJBQXFCLFFBQVEsd0JBQXdCO0FBQ25FLFNBQ0VDLHFCQUFxQixFQUNyQkMsdUJBQXVCLFFBQ2xCLDZDQUE2QztBQUNwRCxjQUFjQywyQkFBMkIsUUFBUSxtREFBbUQ7QUFDcEcsU0FBU0MsY0FBYyxRQUFRLHdDQUF3QztBQUN2RSxTQUNFQyxpQkFBaUIsRUFDakJDLDZCQUE2QixRQUN4QixpQkFBaUI7QUFFeEIsU0FBQUMsWUFBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUFxQjtJQUFBQyxPQUFBO0lBQUFDLElBQUE7SUFBQUM7RUFBQSxJQUFBTCxFQVFwQjtFQUFBLElBQUFNLEVBQUE7RUFBQSxJQUFBQyxFQUFBO0VBQUEsSUFBQU4sQ0FBQSxRQUFBSSxNQUFBO0lBQ1dDLEVBQUEsR0FBQUEsQ0FBQTtNQUlSLE1BQUFFLEtBQUEsR0FBY0MsVUFBVSxDQUFDSixNQUFNLEVBQUUsQ0FBQyxDQUFDO01BQUEsT0FDNUIsTUFBTUssWUFBWSxDQUFDRixLQUFLLENBQUM7SUFBQSxDQUNqQztJQUFFRCxFQUFBLElBQUNGLE1BQU0sQ0FBQztJQUFBSixDQUFBLE1BQUFJLE1BQUE7SUFBQUosQ0FBQSxNQUFBSyxFQUFBO0lBQUFMLENBQUEsTUFBQU0sRUFBQTtFQUFBO0lBQUFELEVBQUEsR0FBQUwsQ0FBQTtJQUFBTSxFQUFBLEdBQUFOLENBQUE7RUFBQTtFQU5YakIsU0FBUyxDQUFDc0IsRUFNVCxFQUFFQyxFQUFRLENBQUM7RUFBQSxJQUFBSSxFQUFBO0VBQUEsSUFBQVYsQ0FBQSxRQUFBRyxJQUFBO0lBSVJPLEVBQUEsSUFBQyxJQUFJLENBQUMsUUFBUSxDQUFSLEtBQU8sQ0FBQyxDQUNYLENBQUE3QixPQUFPLENBQUE4QixPQUFPLENBQUUsVUFBV1IsS0FBRyxDQUNqQyxFQUZDLElBQUksQ0FFRTtJQUFBSCxDQUFBLE1BQUFHLElBQUE7SUFBQUgsQ0FBQSxNQUFBVSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBVixDQUFBO0VBQUE7RUFBQSxJQUFBWSxFQUFBO0VBQUEsSUFBQVosQ0FBQSxRQUFBRSxPQUFBO0lBQ1BVLEVBQUEsSUFBQyxlQUFlLENBQ2QsQ0FBQyxJQUFJLENBQUVWLFFBQU0sQ0FBRSxFQUFkLElBQUksQ0FDUCxFQUZDLGVBQWUsQ0FFRTtJQUFBRixDQUFBLE1BQUFFLE9BQUE7SUFBQUYsQ0FBQSxNQUFBWSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBWixDQUFBO0VBQUE7RUFBQSxJQUFBYSxFQUFBO0VBQUEsSUFBQWIsQ0FBQSxRQUFBVSxFQUFBLElBQUFWLENBQUEsUUFBQVksRUFBQTtJQU5wQkMsRUFBQSxJQUFDLEdBQUcsQ0FBZSxhQUFRLENBQVIsUUFBUSxDQUN6QixDQUFBSCxFQUVNLENBQ04sQ0FBQUUsRUFFaUIsQ0FDbkIsRUFQQyxHQUFHLENBT0U7SUFBQVosQ0FBQSxNQUFBVSxFQUFBO0lBQUFWLENBQUEsTUFBQVksRUFBQTtJQUFBWixDQUFBLE1BQUFhLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFiLENBQUE7RUFBQTtFQUFBLE9BUE5hLEVBT007QUFBQTtBQUlWLE9BQU8sZUFBZUMsSUFBSUEsQ0FDeEJWLE1BQU0sRUFBRWIscUJBQXFCLEVBQzdCd0IsT0FBTyxFQUFFN0Isc0JBQXNCLEVBQy9CaUIsSUFBYSxDQUFSLEVBQUUsTUFBTSxDQUNkLEVBQUVhLE9BQU8sQ0FBQ2xDLEtBQUssQ0FBQ21DLFNBQVMsQ0FBQyxDQUFDO0VBQzFCLE1BQU1DLGFBQWEsR0FBRyxDQUFDZixJQUFJLElBQUksRUFBRSxFQUFFZ0IsSUFBSSxDQUFDLENBQUM7RUFDekMsTUFBTUMsUUFBUSxHQUFHTCxPQUFPLENBQUNNLFdBQVcsQ0FBQyxDQUFDOztFQUV0QztFQUNBLE1BQU1DLGtCQUFrQixHQUFHLE1BQUFBLENBQU9DLElBQUksRUFBRSxNQUFNLEVBQUVDLFFBQVEsR0FBRyxLQUFLLEtBQUs7SUFDbkUsTUFBTUMsV0FBVyxFQUFFL0IsMkJBQTJCLEdBQUc4QixRQUFRLEdBQ3JELGVBQWUsR0FDZixTQUFTO0lBRWIsTUFBTUUsZ0JBQWdCLEdBQUc7TUFDdkJDLElBQUksRUFBRSxnQkFBZ0IsSUFBSUMsS0FBSztNQUMvQkMsV0FBVyxFQUFFLENBQUNOLElBQUksQ0FBQztNQUNuQkU7SUFDRixDQUFDOztJQUVEO0lBQ0EsTUFBTUssY0FBYyxHQUFHZixPQUFPLENBQUNNLFdBQVcsQ0FBQyxDQUFDO0lBQzVDLE1BQU1VLGNBQWMsR0FBR3ZDLHFCQUFxQixDQUMxQ3NDLGNBQWMsQ0FBQ0UscUJBQXFCLEVBQ3BDTixnQkFDRixDQUFDO0lBQ0RYLE9BQU8sQ0FBQ2tCLFdBQVcsQ0FBQ0MsSUFBSSxLQUFLO01BQzNCLEdBQUdBLElBQUk7TUFDUEYscUJBQXFCLEVBQUVEO0lBQ3pCLENBQUMsQ0FBQyxDQUFDOztJQUVIO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTUksV0FBVyxHQUFHbkQsbUNBQW1DLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUNtRCxXQUFXLENBQUNDLFFBQVEsQ0FBQ2IsSUFBSSxDQUFDLEVBQUU7TUFDL0J0QyxtQ0FBbUMsQ0FBQyxDQUFDLEdBQUdrRCxXQUFXLEVBQUVaLElBQUksQ0FBQyxDQUFDO0lBQzdEO0lBQ0E1QixjQUFjLENBQUMwQyxhQUFhLENBQUMsQ0FBQztJQUU5QixJQUFJbkMsT0FBTyxFQUFFLE1BQU07SUFFbkIsSUFBSXNCLFFBQVEsRUFBRTtNQUNaLElBQUk7UUFDRi9CLHVCQUF1QixDQUFDaUMsZ0JBQWdCLENBQUM7UUFDekN4QixPQUFPLEdBQUcsU0FBU3RCLEtBQUssQ0FBQzBELElBQUksQ0FBQ2YsSUFBSSxDQUFDLHFEQUFxRDtNQUMxRixDQUFDLENBQUMsT0FBT2dCLEtBQUssRUFBRTtRQUNkckMsT0FBTyxHQUFHLFNBQVN0QixLQUFLLENBQUMwRCxJQUFJLENBQUNmLElBQUksQ0FBQyw4REFBOERnQixLQUFLLFlBQVlDLEtBQUssR0FBR0QsS0FBSyxDQUFDckMsT0FBTyxHQUFHLGVBQWUsRUFBRTtNQUM3SjtJQUNGLENBQUMsTUFBTTtNQUNMQSxPQUFPLEdBQUcsU0FBU3RCLEtBQUssQ0FBQzBELElBQUksQ0FBQ2YsSUFBSSxDQUFDLDBDQUEwQztJQUMvRTtJQUVBLE1BQU1rQixlQUFlLEdBQUcsR0FBR3ZDLE9BQU8sSUFBSXRCLEtBQUssQ0FBQzhELEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFO0lBQzdFdEMsTUFBTSxDQUFDcUMsZUFBZSxDQUFDO0VBQ3pCLENBQUM7O0VBRUQ7RUFDQTtFQUNBLElBQUksQ0FBQ3ZCLGFBQWEsRUFBRTtJQUNsQixPQUNFLENBQUMscUJBQXFCLENBQ3BCLGlCQUFpQixDQUFDLENBQUNFLFFBQVEsQ0FBQ1kscUJBQXFCLENBQUMsQ0FDbEQsY0FBYyxDQUFDLENBQUNWLGtCQUFrQixDQUFDLENBQ25DLFFBQVEsQ0FBQyxDQUFDLE1BQU07TUFDZGxCLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBQztJQUM1QyxDQUFDLENBQUMsR0FDRjtFQUVOO0VBRUEsTUFBTXVDLE1BQU0sR0FBRyxNQUFNOUMsNkJBQTZCLENBQ2hEcUIsYUFBYSxFQUNiRSxRQUFRLENBQUNZLHFCQUNYLENBQUM7RUFFRCxJQUFJVyxNQUFNLENBQUNDLFVBQVUsS0FBSyxTQUFTLEVBQUU7SUFDbkMsTUFBTTFDLE9BQU8sR0FBR04saUJBQWlCLENBQUMrQyxNQUFNLENBQUM7SUFFekMsT0FDRSxDQUFDLFdBQVcsQ0FDVixPQUFPLENBQUMsQ0FBQ3pDLE9BQU8sQ0FBQyxDQUNqQixJQUFJLENBQUMsQ0FBQ0MsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUNqQixNQUFNLENBQUMsQ0FBQyxNQUFNQyxNQUFNLENBQUNGLE9BQU8sQ0FBQyxDQUFDLEdBQzlCO0VBRU47RUFFQSxPQUNFLENBQUMscUJBQXFCLENBQ3BCLGFBQWEsQ0FBQyxDQUFDeUMsTUFBTSxDQUFDRSxZQUFZLENBQUMsQ0FDbkMsaUJBQWlCLENBQUMsQ0FBQ3pCLFFBQVEsQ0FBQ1kscUJBQXFCLENBQUMsQ0FDbEQsY0FBYyxDQUFDLENBQUNWLGtCQUFrQixDQUFDLENBQ25DLFFBQVEsQ0FBQyxDQUFDLE1BQU07SUFDZGxCLE1BQU0sQ0FDSixlQUFleEIsS0FBSyxDQUFDMEQsSUFBSSxDQUFDSyxNQUFNLENBQUNFLFlBQVksQ0FBQywwQkFDaEQsQ0FBQztFQUNILENBQUMsQ0FBQyxHQUNGO0FBRU4iLCJpZ25vcmVMaXN0IjpbXX0=
