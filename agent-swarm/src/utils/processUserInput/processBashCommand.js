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
exports.processBashCommand = processBashCommand;
var crypto_1 = require("crypto");
var React = require("react");
var BashModeProgress_js_1 = require("src/components/BashModeProgress.js");
var BashTool_js_1 = require("src/tools/BashTool/BashTool.js");
var index_js_1 = require("../../services/analytics/index.js");
var errors_js_1 = require("../errors.js");
var messages_js_1 = require("../messages.js");
var resolveDefaultShell_js_1 = require("../shell/resolveDefaultShell.js");
var shellToolUtils_js_1 = require("../shell/shellToolUtils.js");
var toolResultStorage_js_1 = require("../toolResultStorage.js");
var xml_js_1 = require("../xml.js");
function processBashCommand(inputString, precedingInputBlocks, attachmentMessages, context, setToolJSX) {
    return __awaiter(this, void 0, void 0, function () {
        var usePowerShell, userMessage, jsx, bashModeContext, onProgress, PowerShellTool, shellTool, response, _a, data, stderr, mapped, stdout, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    usePowerShell = (0, shellToolUtils_js_1.isPowerShellToolEnabled)() && (0, resolveDefaultShell_js_1.resolveDefaultShell)() === 'powershell';
                    (0, index_js_1.logEvent)('tengu_input_bash', {
                        powershell: usePowerShell
                    });
                    userMessage = (0, messages_js_1.createUserMessage)({
                        content: (0, messages_js_1.prepareUserContent)({
                            inputString: "<bash-input>".concat(inputString, "</bash-input>"),
                            precedingInputBlocks: precedingInputBlocks
                        })
                    });
                    // Just show initial UI
                    setToolJSX({
                        jsx: <BashModeProgress_js_1.BashModeProgress input={inputString} progress={null} verbose={context.options.verbose}/>,
                        shouldHidePromptInput: false
                    });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    bashModeContext = __assign(__assign({}, context), { 
                        // TODO: Clean up this hack
                        setToolJSX: function (_) {
                            jsx = _ === null || _ === void 0 ? void 0 : _.jsx;
                        } });
                    onProgress = function (progress) {
                        setToolJSX({
                            jsx: <>
            <BashModeProgress_js_1.BashModeProgress input={inputString} progress={progress.data} verbose={context.options.verbose}/>
            {jsx}
          </>,
                            shouldHidePromptInput: false,
                            showSpinner: false
                        });
                    };
                    PowerShellTool = null;
                    if (usePowerShell) {
                        /* eslint-disable @typescript-eslint/no-require-imports */
                        PowerShellTool = require('src/tools/PowerShellTool/PowerShellTool.js').PowerShellTool;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                    }
                    shellTool = PowerShellTool !== null && PowerShellTool !== void 0 ? PowerShellTool : BashTool_js_1.BashTool;
                    if (!PowerShellTool) return [3 /*break*/, 3];
                    return [4 /*yield*/, PowerShellTool.call({
                            command: inputString,
                            dangerouslyDisableSandbox: true
                        }, bashModeContext, undefined, undefined, onProgress)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, BashTool_js_1.BashTool.call({
                        command: inputString,
                        dangerouslyDisableSandbox: true
                    }, bashModeContext, undefined, undefined, onProgress)];
                case 4:
                    _a = _b.sent();
                    _b.label = 5;
                case 5:
                    response = _a;
                    data = response.data;
                    if (!data) {
                        throw new Error('No result received from shell command');
                    }
                    stderr = data.stderr;
                    return [4 /*yield*/, (0, toolResultStorage_js_1.processToolResultBlock)(shellTool, __assign(__assign({}, data), { stderr: '' }), (0, crypto_1.randomUUID)())];
                case 6:
                    mapped = _b.sent();
                    stdout = typeof mapped.content === 'string' ? mapped.content : (0, xml_js_1.escapeXml)(data.stdout);
                    return [2 /*return*/, {
                            messages: __spreadArray(__spreadArray([(0, messages_js_1.createSyntheticUserCaveatMessage)(), userMessage], attachmentMessages, true), [(0, messages_js_1.createUserMessage)({
                                    content: "<bash-stdout>".concat(stdout, "</bash-stdout><bash-stderr>").concat((0, xml_js_1.escapeXml)(stderr), "</bash-stderr>")
                                })], false),
                            shouldQuery: false
                        }];
                case 7:
                    e_1 = _b.sent();
                    if (e_1 instanceof errors_js_1.ShellError) {
                        if (e_1.interrupted) {
                            return [2 /*return*/, {
                                    messages: __spreadArray([(0, messages_js_1.createSyntheticUserCaveatMessage)(), userMessage, (0, messages_js_1.createUserInterruptionMessage)({
                                            toolUse: false
                                        })], attachmentMessages, true),
                                    shouldQuery: false
                                }];
                        }
                        return [2 /*return*/, {
                                messages: __spreadArray(__spreadArray([(0, messages_js_1.createSyntheticUserCaveatMessage)(), userMessage], attachmentMessages, true), [(0, messages_js_1.createUserMessage)({
                                        content: "<bash-stdout>".concat((0, xml_js_1.escapeXml)(e_1.stdout), "</bash-stdout><bash-stderr>").concat((0, xml_js_1.escapeXml)(e_1.stderr), "</bash-stderr>")
                                    })], false),
                                shouldQuery: false
                            }];
                    }
                    return [2 /*return*/, {
                            messages: __spreadArray(__spreadArray([(0, messages_js_1.createSyntheticUserCaveatMessage)(), userMessage], attachmentMessages, true), [(0, messages_js_1.createUserMessage)({
                                    content: "<bash-stderr>Command failed: ".concat((0, xml_js_1.escapeXml)((0, errors_js_1.errorMessage)(e_1)), "</bash-stderr>")
                                })], false),
                            shouldQuery: false
                        }];
                case 8:
                    setToolJSX(null);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250ZW50QmxvY2tQYXJhbSIsInJhbmRvbVVVSUQiLCJSZWFjdCIsIkJhc2hNb2RlUHJvZ3Jlc3MiLCJTZXRUb29sSlNYRm4iLCJCYXNoVG9vbCIsIkF0dGFjaG1lbnRNZXNzYWdlIiwiU3lzdGVtTWVzc2FnZSIsIlVzZXJNZXNzYWdlIiwiU2hlbGxQcm9ncmVzcyIsImxvZ0V2ZW50IiwiZXJyb3JNZXNzYWdlIiwiU2hlbGxFcnJvciIsImNyZWF0ZVN5bnRoZXRpY1VzZXJDYXZlYXRNZXNzYWdlIiwiY3JlYXRlVXNlckludGVycnVwdGlvbk1lc3NhZ2UiLCJjcmVhdGVVc2VyTWVzc2FnZSIsInByZXBhcmVVc2VyQ29udGVudCIsInJlc29sdmVEZWZhdWx0U2hlbGwiLCJpc1Bvd2VyU2hlbGxUb29sRW5hYmxlZCIsInByb2Nlc3NUb29sUmVzdWx0QmxvY2siLCJlc2NhcGVYbWwiLCJQcm9jZXNzVXNlcklucHV0Q29udGV4dCIsInByb2Nlc3NCYXNoQ29tbWFuZCIsImlucHV0U3RyaW5nIiwicHJlY2VkaW5nSW5wdXRCbG9ja3MiLCJhdHRhY2htZW50TWVzc2FnZXMiLCJjb250ZXh0Iiwic2V0VG9vbEpTWCIsIlByb21pc2UiLCJtZXNzYWdlcyIsInNob3VsZFF1ZXJ5IiwidXNlUG93ZXJTaGVsbCIsInBvd2Vyc2hlbGwiLCJ1c2VyTWVzc2FnZSIsImNvbnRlbnQiLCJqc3giLCJSZWFjdE5vZGUiLCJvcHRpb25zIiwidmVyYm9zZSIsInNob3VsZEhpZGVQcm9tcHRJbnB1dCIsImJhc2hNb2RlQ29udGV4dCIsIl8iLCJvblByb2dyZXNzIiwicHJvZ3Jlc3MiLCJkYXRhIiwic2hvd1NwaW5uZXIiLCJQU01vZCIsIlBvd2VyU2hlbGxUb29sIiwicmVxdWlyZSIsInNoZWxsVG9vbCIsInJlc3BvbnNlIiwiY2FsbCIsImNvbW1hbmQiLCJkYW5nZXJvdXNseURpc2FibGVTYW5kYm94IiwidW5kZWZpbmVkIiwiRXJyb3IiLCJzdGRlcnIiLCJtYXBwZWQiLCJzdGRvdXQiLCJlIiwiaW50ZXJydXB0ZWQiLCJ0b29sVXNlIl0sInNvdXJjZXMiOlsicHJvY2Vzc0Jhc2hDb21tYW5kLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRlbnRCbG9ja1BhcmFtIH0gZnJvbSAnQGFudGhyb3BpYy1haS9zZGsvcmVzb3VyY2VzJ1xuaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gJ2NyeXB0bydcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQmFzaE1vZGVQcm9ncmVzcyB9IGZyb20gJ3NyYy9jb21wb25lbnRzL0Jhc2hNb2RlUHJvZ3Jlc3MuanMnXG5pbXBvcnQgdHlwZSB7IFNldFRvb2xKU1hGbiB9IGZyb20gJ3NyYy9Ub29sLmpzJ1xuaW1wb3J0IHsgQmFzaFRvb2wgfSBmcm9tICdzcmMvdG9vbHMvQmFzaFRvb2wvQmFzaFRvb2wuanMnXG5pbXBvcnQgdHlwZSB7XG4gIEF0dGFjaG1lbnRNZXNzYWdlLFxuICBTeXN0ZW1NZXNzYWdlLFxuICBVc2VyTWVzc2FnZSxcbn0gZnJvbSAnc3JjL3R5cGVzL21lc3NhZ2UuanMnXG5pbXBvcnQgdHlwZSB7IFNoZWxsUHJvZ3Jlc3MgfSBmcm9tICdzcmMvdHlwZXMvdG9vbHMuanMnXG5pbXBvcnQgeyBsb2dFdmVudCB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7IGVycm9yTWVzc2FnZSwgU2hlbGxFcnJvciB9IGZyb20gJy4uL2Vycm9ycy5qcydcbmltcG9ydCB7XG4gIGNyZWF0ZVN5bnRoZXRpY1VzZXJDYXZlYXRNZXNzYWdlLFxuICBjcmVhdGVVc2VySW50ZXJydXB0aW9uTWVzc2FnZSxcbiAgY3JlYXRlVXNlck1lc3NhZ2UsXG4gIHByZXBhcmVVc2VyQ29udGVudCxcbn0gZnJvbSAnLi4vbWVzc2FnZXMuanMnXG5pbXBvcnQgeyByZXNvbHZlRGVmYXVsdFNoZWxsIH0gZnJvbSAnLi4vc2hlbGwvcmVzb2x2ZURlZmF1bHRTaGVsbC5qcydcbmltcG9ydCB7IGlzUG93ZXJTaGVsbFRvb2xFbmFibGVkIH0gZnJvbSAnLi4vc2hlbGwvc2hlbGxUb29sVXRpbHMuanMnXG5pbXBvcnQgeyBwcm9jZXNzVG9vbFJlc3VsdEJsb2NrIH0gZnJvbSAnLi4vdG9vbFJlc3VsdFN0b3JhZ2UuanMnXG5pbXBvcnQgeyBlc2NhcGVYbWwgfSBmcm9tICcuLi94bWwuanMnXG5pbXBvcnQgdHlwZSB7IFByb2Nlc3NVc2VySW5wdXRDb250ZXh0IH0gZnJvbSAnLi9wcm9jZXNzVXNlcklucHV0LmpzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0Jhc2hDb21tYW5kKFxuICBpbnB1dFN0cmluZzogc3RyaW5nLFxuICBwcmVjZWRpbmdJbnB1dEJsb2NrczogQ29udGVudEJsb2NrUGFyYW1bXSxcbiAgYXR0YWNobWVudE1lc3NhZ2VzOiBBdHRhY2htZW50TWVzc2FnZVtdLFxuICBjb250ZXh0OiBQcm9jZXNzVXNlcklucHV0Q29udGV4dCxcbiAgc2V0VG9vbEpTWDogU2V0VG9vbEpTWEZuLFxuKTogUHJvbWlzZTx7XG4gIG1lc3NhZ2VzOiAoVXNlck1lc3NhZ2UgfCBBdHRhY2htZW50TWVzc2FnZSB8IFN5c3RlbU1lc3NhZ2UpW11cbiAgc2hvdWxkUXVlcnk6IGJvb2xlYW5cbn0+IHtcbiAgLy8gU2hlbGwgcm91dGluZyAoZG9jcy9kZXNpZ24vcHMtc2hlbGwtc2VsZWN0aW9uLm1kIMKnNS4yKTogY29uc3VsdFxuICAvLyBkZWZhdWx0U2hlbGwsIGZhbGwgYmFjayB0byBiYXNoLiBpc1Bvd2VyU2hlbGxUb29sRW5hYmxlZCgpIGFwcGxpZXMgdGhlXG4gIC8vIHNhbWUgcGxhdGZvcm0gKyBlbnYtdmFyIGdhdGUgYXMgdG9vbHMudHMgc28gaW5wdXQtYm94IHJvdXRpbmcgbWF0Y2hlc1xuICAvLyB0b29sLWxpc3QgdmlzaWJpbGl0eS4gQ29tcHV0ZWQgdXAgZnJvbnQgc28gdGVsZW1ldHJ5IHJlY29yZHMgdGhlXG4gIC8vIGFjdHVhbCBzaGVsbCwgbm90IHRoZSByYXcgc2V0dGluZy5cbiAgY29uc3QgdXNlUG93ZXJTaGVsbCA9XG4gICAgaXNQb3dlclNoZWxsVG9vbEVuYWJsZWQoKSAmJiByZXNvbHZlRGVmYXVsdFNoZWxsKCkgPT09ICdwb3dlcnNoZWxsJ1xuXG4gIGxvZ0V2ZW50KCd0ZW5ndV9pbnB1dF9iYXNoJywgeyBwb3dlcnNoZWxsOiB1c2VQb3dlclNoZWxsIH0pXG5cbiAgY29uc3QgdXNlck1lc3NhZ2UgPSBjcmVhdGVVc2VyTWVzc2FnZSh7XG4gICAgY29udGVudDogcHJlcGFyZVVzZXJDb250ZW50KHtcbiAgICAgIGlucHV0U3RyaW5nOiBgPGJhc2gtaW5wdXQ+JHtpbnB1dFN0cmluZ308L2Jhc2gtaW5wdXQ+YCxcbiAgICAgIHByZWNlZGluZ0lucHV0QmxvY2tzLFxuICAgIH0pLFxuICB9KVxuXG4gIC8vIGN0cmwrYiB0byBiYWNrZ3JvdW5kIGluZGljYXRvclxuICBsZXQganN4OiBSZWFjdC5SZWFjdE5vZGVcblxuICAvLyBKdXN0IHNob3cgaW5pdGlhbCBVSVxuICBzZXRUb29sSlNYKHtcbiAgICBqc3g6IChcbiAgICAgIDxCYXNoTW9kZVByb2dyZXNzXG4gICAgICAgIGlucHV0PXtpbnB1dFN0cmluZ31cbiAgICAgICAgcHJvZ3Jlc3M9e251bGx9XG4gICAgICAgIHZlcmJvc2U9e2NvbnRleHQub3B0aW9ucy52ZXJib3NlfVxuICAgICAgLz5cbiAgICApLFxuICAgIHNob3VsZEhpZGVQcm9tcHRJbnB1dDogZmFsc2UsXG4gIH0pXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBiYXNoTW9kZUNvbnRleHQ6IFByb2Nlc3NVc2VySW5wdXRDb250ZXh0ID0ge1xuICAgICAgLi4uY29udGV4dCxcbiAgICAgIC8vIFRPRE86IENsZWFuIHVwIHRoaXMgaGFja1xuICAgICAgc2V0VG9vbEpTWDogXyA9PiB7XG4gICAgICAgIGpzeCA9IF8/LmpzeFxuICAgICAgfSxcbiAgICB9XG5cbiAgICAvLyBQcm9ncmVzcyBVSSDigJQgc2hhcmVkIGFjcm9zcyBib3RoIHNoZWxsIGJhY2tlbmRzIChib3RoIGVtaXQgU2hlbGxQcm9ncmVzcylcbiAgICBjb25zdCBvblByb2dyZXNzID0gKHByb2dyZXNzOiB7IGRhdGE6IFNoZWxsUHJvZ3Jlc3MgfSkgPT4ge1xuICAgICAgc2V0VG9vbEpTWCh7XG4gICAgICAgIGpzeDogKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8QmFzaE1vZGVQcm9ncmVzc1xuICAgICAgICAgICAgICBpbnB1dD17aW5wdXRTdHJpbmchfVxuICAgICAgICAgICAgICBwcm9ncmVzcz17cHJvZ3Jlc3MuZGF0YX1cbiAgICAgICAgICAgICAgdmVyYm9zZT17Y29udGV4dC5vcHRpb25zLnZlcmJvc2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge2pzeH1cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKSxcbiAgICAgICAgc2hvdWxkSGlkZVByb21wdElucHV0OiBmYWxzZSxcbiAgICAgICAgc2hvd1NwaW5uZXI6IGZhbHNlLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBVc2VyLWluaXRpYXRlZCBgIWAgY29tbWFuZHMgcnVuIG91dHNpZGUgc2FuZGJveC4gQm90aCBzaGVsbCB0b29scyBob25vclxuICAgIC8vIGRhbmdlcm91c2x5RGlzYWJsZVNhbmRib3ggKGNoZWNrZWQgYWdhaW5zdCBhcmVVbnNhbmRib3hlZENvbW1hbmRzQWxsb3dlZCgpXG4gICAgLy8gaW4gc2hvdWxkVXNlU2FuZGJveC50cykuIFBTIHNhbmRib3ggaXMgTGludXgvbWFjT1MvV1NMMiBvbmx5IOKAlCBvbiBXaW5kb3dzXG4gICAgLy8gbmF0aXZlLCBzaG91bGRVc2VTYW5kYm94KCkgcmV0dXJucyBmYWxzZSByZWdhcmRsZXNzICh1bnN1cHBvcnRlZCBwbGF0Zm9ybSkuXG4gICAgLy8gTGF6eS1yZXF1aXJlIFBvd2VyU2hlbGxUb29sIHNvIGl0cyB+MzAwS0IgY2h1bmsgb25seSBsb2FkcyB3aGVuIHRoZVxuICAgIC8vIHVzZXIgaGFzIGFjdHVhbGx5IHNlbGVjdGVkIHRoZSBwb3dlcnNoZWxsIGRlZmF1bHQgc2hlbGwuXG4gICAgdHlwZSBQU01vZCA9IHR5cGVvZiBpbXBvcnQoJ3NyYy90b29scy9Qb3dlclNoZWxsVG9vbC9Qb3dlclNoZWxsVG9vbC5qcycpXG4gICAgbGV0IFBvd2VyU2hlbGxUb29sOiBQU01vZFsnUG93ZXJTaGVsbFRvb2wnXSB8IG51bGwgPSBudWxsXG4gICAgaWYgKHVzZVBvd2VyU2hlbGwpIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cbiAgICAgIFBvd2VyU2hlbGxUb29sID0gKFxuICAgICAgICByZXF1aXJlKCdzcmMvdG9vbHMvUG93ZXJTaGVsbFRvb2wvUG93ZXJTaGVsbFRvb2wuanMnKSBhcyBQU01vZFxuICAgICAgKS5Qb3dlclNoZWxsVG9vbFxuICAgICAgLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXG4gICAgfVxuICAgIGNvbnN0IHNoZWxsVG9vbCA9IFBvd2VyU2hlbGxUb29sID8/IEJhc2hUb29sXG5cbiAgICBjb25zdCByZXNwb25zZSA9IFBvd2VyU2hlbGxUb29sXG4gICAgICA/IGF3YWl0IFBvd2VyU2hlbGxUb29sLmNhbGwoXG4gICAgICAgICAgeyBjb21tYW5kOiBpbnB1dFN0cmluZywgZGFuZ2Vyb3VzbHlEaXNhYmxlU2FuZGJveDogdHJ1ZSB9LFxuICAgICAgICAgIGJhc2hNb2RlQ29udGV4dCxcbiAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgIG9uUHJvZ3Jlc3MsXG4gICAgICAgIClcbiAgICAgIDogYXdhaXQgQmFzaFRvb2wuY2FsbChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjb21tYW5kOiBpbnB1dFN0cmluZyxcbiAgICAgICAgICAgIGRhbmdlcm91c2x5RGlzYWJsZVNhbmRib3g6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBiYXNoTW9kZUNvbnRleHQsXG4gICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICBvblByb2dyZXNzLFxuICAgICAgICApXG4gICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlLmRhdGFcblxuICAgIGlmICghZGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXN1bHQgcmVjZWl2ZWQgZnJvbSBzaGVsbCBjb21tYW5kJylcbiAgICB9XG5cbiAgICBjb25zdCBzdGRlcnIgPSBkYXRhLnN0ZGVyclxuICAgIC8vIFJldXNlIHRoZSBzYW1lIGZvcm1hdHRpbmcgcGlwZWxpbmUgYXMgaW5saW5lICFgY21kYCBiYXNoIChwcm9tcHRTaGVsbEV4ZWN1dGlvbilcbiAgICAvLyBhbmQgbW9kZWwtaW5pdGlhdGVkIEJhc2guIFdoZW4gQmFzaFRvb2wuY2FsbCgpIHBlcnNpc3RzIGxhcmdlIG91dHB1dCB0byBkaXNrLFxuICAgIC8vIGRhdGEucGVyc2lzdGVkT3V0cHV0UGF0aCBpcyBzZXQgYW5kIHRoZSBmb3JtYXR0ZXIgd3JhcHMgaW4gPHBlcnNpc3RlZC1vdXRwdXQ+LlxuICAgIC8vIFBhc3Mgc3RkZXJyOicnIHRvIGtlZXAgaXQgc2VwYXJhdGUgZm9yIHRoZSA8YmFzaC1zdGRlcnI+IFVJIHRhZy5cbiAgICBjb25zdCBtYXBwZWQgPSBhd2FpdCBwcm9jZXNzVG9vbFJlc3VsdEJsb2NrKFxuICAgICAgc2hlbGxUb29sLFxuICAgICAgeyAuLi5kYXRhLCBzdGRlcnI6ICcnIH0sXG4gICAgICByYW5kb21VVUlEKCksXG4gICAgKVxuICAgIC8vIG1hcHBlZC5jb250ZW50IG1heSBjb250YWluIG91ciBvd24gPHBlcnNpc3RlZC1vdXRwdXQ+IHdyYXBwZXIgKHRydXN0ZWRcbiAgICAvLyBYTUwgZnJvbSBidWlsZExhcmdlVG9vbFJlc3VsdE1lc3NhZ2UpLiBFc2NhcGluZyBpdCB3b3VsZCB0dXJuIHN0cnVjdHVyYWxcbiAgICAvLyB0YWdzIGludG8gJmx0O3BlcnNpc3RlZC1vdXRwdXQmZ3Q7LCBicmVha2luZyB0aGUgbW9kZWwncyBwYXJzZSBhbmRcbiAgICAvLyBVc2VyQmFzaE91dHB1dE1lc3NhZ2UncyBleHRyYWN0VGFnLiBFc2NhcGUgdGhlIHJhdyBmYWxsYmFjayBvbmx5LlxuICAgIGNvbnN0IHN0ZG91dCA9XG4gICAgICB0eXBlb2YgbWFwcGVkLmNvbnRlbnQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gbWFwcGVkLmNvbnRlbnRcbiAgICAgICAgOiBlc2NhcGVYbWwoZGF0YS5zdGRvdXQpXG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIGNyZWF0ZVN5bnRoZXRpY1VzZXJDYXZlYXRNZXNzYWdlKCksXG4gICAgICAgIHVzZXJNZXNzYWdlLFxuICAgICAgICAuLi5hdHRhY2htZW50TWVzc2FnZXMsXG4gICAgICAgIGNyZWF0ZVVzZXJNZXNzYWdlKHtcbiAgICAgICAgICBjb250ZW50OiBgPGJhc2gtc3Rkb3V0PiR7c3Rkb3V0fTwvYmFzaC1zdGRvdXQ+PGJhc2gtc3RkZXJyPiR7ZXNjYXBlWG1sKHN0ZGVycil9PC9iYXNoLXN0ZGVycj5gLFxuICAgICAgICB9KSxcbiAgICAgIF0sXG4gICAgICBzaG91bGRRdWVyeTogZmFsc2UsXG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBTaGVsbEVycm9yKSB7XG4gICAgICBpZiAoZS5pbnRlcnJ1cHRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgICAgICBjcmVhdGVTeW50aGV0aWNVc2VyQ2F2ZWF0TWVzc2FnZSgpLFxuICAgICAgICAgICAgdXNlck1lc3NhZ2UsXG4gICAgICAgICAgICBjcmVhdGVVc2VySW50ZXJydXB0aW9uTWVzc2FnZSh7IHRvb2xVc2U6IGZhbHNlIH0pLFxuICAgICAgICAgICAgLi4uYXR0YWNobWVudE1lc3NhZ2VzLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgc2hvdWxkUXVlcnk6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtZXNzYWdlczogW1xuICAgICAgICAgIGNyZWF0ZVN5bnRoZXRpY1VzZXJDYXZlYXRNZXNzYWdlKCksXG4gICAgICAgICAgdXNlck1lc3NhZ2UsXG4gICAgICAgICAgLi4uYXR0YWNobWVudE1lc3NhZ2VzLFxuICAgICAgICAgIGNyZWF0ZVVzZXJNZXNzYWdlKHtcbiAgICAgICAgICAgIGNvbnRlbnQ6IGA8YmFzaC1zdGRvdXQ+JHtlc2NhcGVYbWwoZS5zdGRvdXQpfTwvYmFzaC1zdGRvdXQ+PGJhc2gtc3RkZXJyPiR7ZXNjYXBlWG1sKGUuc3RkZXJyKX08L2Jhc2gtc3RkZXJyPmAsXG4gICAgICAgICAgfSksXG4gICAgICAgIF0sXG4gICAgICAgIHNob3VsZFF1ZXJ5OiBmYWxzZSxcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2VzOiBbXG4gICAgICAgIGNyZWF0ZVN5bnRoZXRpY1VzZXJDYXZlYXRNZXNzYWdlKCksXG4gICAgICAgIHVzZXJNZXNzYWdlLFxuICAgICAgICAuLi5hdHRhY2htZW50TWVzc2FnZXMsXG4gICAgICAgIGNyZWF0ZVVzZXJNZXNzYWdlKHtcbiAgICAgICAgICBjb250ZW50OiBgPGJhc2gtc3RkZXJyPkNvbW1hbmQgZmFpbGVkOiAke2VzY2FwZVhtbChlcnJvck1lc3NhZ2UoZSkpfTwvYmFzaC1zdGRlcnI+YCxcbiAgICAgICAgfSksXG4gICAgICBdLFxuICAgICAgc2hvdWxkUXVlcnk6IGZhbHNlLFxuICAgIH1cbiAgfSBmaW5hbGx5IHtcbiAgICBzZXRUb29sSlNYKG51bGwpXG4gIH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsY0FBY0EsaUJBQWlCLFFBQVEsNkJBQTZCO0FBQ3BFLFNBQVNDLFVBQVUsUUFBUSxRQUFRO0FBQ25DLE9BQU8sS0FBS0MsS0FBSyxNQUFNLE9BQU87QUFDOUIsU0FBU0MsZ0JBQWdCLFFB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TUFBTXlELE1BQU0sR0FDVixPQUFPRCxNQUFNLENBQUN2QixPQUFPLEtBQUssUUFBUSxHQUM5QnVCLE1BQU0sQ0FBQ3ZCLE9BQU8sR0FDZGQsU0FBUyxDQUFDd0IsSUFBSSxDQUFDYyxNQUFNLENBQUM7SUFDNUIsT0FBTztNQUNMN0IsUUFBUSxFQUFFLENBQ1JoQixnQ0FBZ0MsQ0FBQyxDQUFDLEVBQ2xDb0IsV0FBVyxFQUNYLEdBQUdSLGtCQUFrQixFQUNyQlYsaUJBQWlCLENBQUM7UUFDaEJtQixPQUFPLEVBQUUsZ0JBQWdCd0IsTUFBTSw4QkFBOEJ0QyxTQUFTLENBQUNvQyxNQUFNLENBQUM7TUFDaEYsQ0FBQyxDQUFDLENBQ0g7TUFDRDFCLFdBQVcsRUFBRTtJQUNmLENBQUM7RUFDSCxDQUFDLENBQUMsT0FBTzZCLENBQUMsRUFBRTtJQUNWLElBQUlBLENBQUMsWUFBWS9DLFVBQVUsRUFBRTtNQUMzQixJQUFJK0MsQ0FBQyxDQUFDQyxXQUFXLEVBQUU7UUFDakIsT0FBTztVQUNML0IsUUFBUSxFQUFFLENBQ1JoQixnQ0FBZ0MsQ0FBQyxDQUFDLEVBQ2xDb0IsV0FBVyxFQUNYbkIsNkJBQTZCLENBQUM7WUFBRStDLE9BQU8sRUFBRTtVQUFNLENBQUMsQ0FBQyxFQUNqRCxHQUFHcEMsa0JBQWtCLENBQ3RCO1VBQ0RLLFdBQVcsRUFBRTtRQUNmLENBQUM7TUFDSDtNQUNBLE9BQU87UUFDTEQsUUFBUSxFQUFFLENBQ1JoQixnQ0FBZ0MsQ0FBQyxDQUFDLEVBQ2xDb0IsV0FBVyxFQUNYLEdBQUdSLGtCQUFrQixFQUNyQlYsaUJBQWlCLENBQUM7VUFDaEJtQixPQUFPLEVBQUUsZ0JBQWdCZCxTQUFTLENBQUN1QyxDQUFDLENBQUNELE1BQU0sQ0FBQyw4QkFBOEJ0QyxTQUFTLENBQUN1QyxDQUFDLENBQUNILE1BQU0sQ0FBQztRQUMvRixDQUFDLENBQUMsQ0FDSDtRQUNEMUIsV0FBVyxFQUFFO01BQ2YsQ0FBQztJQUNIO0lBQ0EsT0FBTztNQUNMRCxRQUFRLEVBQUUsQ0FDUmhCLGdDQUFnQyxDQUFDLENBQUMsRUFDbENvQixXQUFXLEVBQ1gsR0FBR1Isa0JBQWtCLEVBQ3JCVixpQkFBaUIsQ0FBQztRQUNoQm1CLE9BQU8sRUFBRSxnQ0FBZ0NkLFNBQVMsQ0FBQ1QsWUFBWSxDQUFDZ0QsQ0FBQyxDQUFDLENBQUM7TUFDckUsQ0FBQyxDQUFDLENBQ0g7TUFDRDdCLFdBQVcsRUFBRTtJQUNmLENBQUM7RUFDSCxDQUFDLFNBQVM7SUFDUkgsVUFBVSxDQUFDLElBQUksQ0FBQztFQUNsQjtBQUNGIiwiaWdub3JlTGlzdCI6W119
