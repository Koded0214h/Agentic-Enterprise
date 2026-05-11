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
exports.showInvalidConfigDialog = showInvalidConfigDialog;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var KeybindingProviderSetup_js_1 = require("../keybindings/KeybindingProviderSetup.js");
var AppState_js_1 = require("../state/AppState.js");
var renderOptions_js_1 = require("../utils/renderOptions.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var index_js_1 = require("./CustomSelect/index.js");
var Dialog_js_1 = require("./design-system/Dialog.js");
/**
 * Dialog shown when the Claude config file contains invalid JSON
 */
function InvalidConfigDialog(t0) {
    var $ = (0, compiler_runtime_1.c)(19);
    var filePath = t0.filePath, errorDescription = t0.errorDescription, onExit = t0.onExit, onReset = t0.onReset;
    var t1;
    if ($[0] !== onExit || $[1] !== onReset) {
        t1 = function (value) {
            if (value === "exit") {
                onExit();
            }
            else {
                onReset();
            }
        };
        $[0] = onExit;
        $[1] = onReset;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var handleSelect = t1;
    var t2;
    if ($[3] !== filePath) {
        t2 = <ink_js_1.Text>The configuration file at <ink_js_1.Text bold={true}>{filePath}</ink_js_1.Text> contains invalid JSON.</ink_js_1.Text>;
        $[3] = filePath;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    var t3;
    if ($[5] !== errorDescription) {
        t3 = <ink_js_1.Text>{errorDescription}</ink_js_1.Text>;
        $[5] = errorDescription;
        $[6] = t3;
    }
    else {
        t3 = $[6];
    }
    var t4;
    if ($[7] !== t2 || $[8] !== t3) {
        t4 = <ink_js_1.Box flexDirection="column" gap={1}>{t2}{t3}</ink_js_1.Box>;
        $[7] = t2;
        $[8] = t3;
        $[9] = t4;
    }
    else {
        t4 = $[9];
    }
    var t5;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = <ink_js_1.Text bold={true}>Choose an option:</ink_js_1.Text>;
        $[10] = t5;
    }
    else {
        t5 = $[10];
    }
    var t6;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = [{
                label: "Exit and fix manually",
                value: "exit"
            }, {
                label: "Reset with default configuration",
                value: "reset"
            }];
        $[11] = t6;
    }
    else {
        t6 = $[11];
    }
    var t7;
    if ($[12] !== handleSelect || $[13] !== onExit) {
        t7 = <ink_js_1.Box flexDirection="column">{t5}<index_js_1.Select options={t6} onChange={handleSelect} onCancel={onExit}/></ink_js_1.Box>;
        $[12] = handleSelect;
        $[13] = onExit;
        $[14] = t7;
    }
    else {
        t7 = $[14];
    }
    var t8;
    if ($[15] !== onExit || $[16] !== t4 || $[17] !== t7) {
        t8 = <Dialog_js_1.Dialog title="Configuration Error" color="error" onCancel={onExit}>{t4}{t7}</Dialog_js_1.Dialog>;
        $[15] = onExit;
        $[16] = t4;
        $[17] = t7;
        $[18] = t8;
    }
    else {
        t8 = $[18];
    }
    return t8;
}
/**
 * Safe fallback theme name for error dialogs to avoid circular dependency.
 * Uses a hardcoded dark theme that doesn't require reading from config.
 */
var SAFE_ERROR_THEME_NAME = 'dark';
function showInvalidConfigDialog(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var renderOptions;
        var _this = this;
        var error = _b.error;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    renderOptions = __assign(__assign({}, (0, renderOptions_js_1.getBaseRenderOptions)(false)), { 
                        // IMPORTANT: Use hardcoded theme name to avoid circular dependency with getGlobalConfig()
                        // This allows the error dialog to show even when config file has JSON syntax errors
                        theme: SAFE_ERROR_THEME_NAME });
                    return [4 /*yield*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var unmount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, ink_js_1.render)(<AppState_js_1.AppStateProvider>
        <KeybindingProviderSetup_js_1.KeybindingSetup>
          <InvalidConfigDialog filePath={error.filePath} errorDescription={error.message} onExit={function () {
                                                unmount();
                                                void resolve();
                                                process.exit(1);
                                            }} onReset={function () {
                                                (0, slowOperations_js_1.writeFileSync_DEPRECATED)(error.filePath, (0, slowOperations_js_1.jsonStringify)(error.defaultConfig, null, 2), {
                                                    flush: false,
                                                    encoding: 'utf8'
                                                });
                                                unmount();
                                                void resolve();
                                                process.exit(0);
                                            }}/>
        </KeybindingProviderSetup_js_1.KeybindingSetup>
      </AppState_js_1.AppStateProvider>, renderOptions)];
                                    case 1:
                                        unmount = (_a.sent()).unmount;
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkJveCIsInJlbmRlciIsIlRleHQiLCJLZXliaW5kaW5nU2V0dXAiLCJBcHBTdGF0ZVByb3ZpZGVyIiwiQ29uZmlnUGFyc2VFcnJvciIsImdldEJhc2VSZW5kZXJPcHRpb25zIiwianNvblN0cmluZ2lmeSIsIndyaXRlRmlsZVN5bmNfREVQUkVDQVRFRCIsIlRoZW1lTmFtZSIsIlNlbGVjdCIsIkRpYWxvZyIsIkludmFsaWRDb25maWdIYW5kbGVyUHJvcHMiLCJlcnJvciIsIkludmFsaWRDb25maWdEaWFsb2dQcm9wcyIsImZpbGVQYXRoIiwiZXJyb3JEZXNjcmlwdGlvbiIsIm9uRXhpdCIsIm9uUmVzZXQiLCJJbnZhbGlkQ29uZmlnRGlhbG9nIiwidDAiLCIkIiwiX2MiLCJ0MSIsInZhbHVlIiwiaGFuZGxlU2VsZWN0IiwidDIiLCJ0MyIsInQ0IiwidDUiLCJTeW1ib2wiLCJmb3IiLCJ0NiIsImxhYmVsIiwidDciLCJ0OCIsIlNBRkVfRVJST1JfVEhFTUVfTkFNRSIsInNob3dJbnZhbGlkQ29uZmlnRGlhbG9nIiwiUHJvbWlzZSIsIlNhZmVSZW5kZXJPcHRpb25zIiwiUGFyYW1ldGVycyIsInRoZW1lIiwicmVuZGVyT3B0aW9ucyIsInJlc29sdmUiLCJ1bm1vdW50IiwibWVzc2FnZSIsInByb2Nlc3MiLCJleGl0IiwiZGVmYXVsdENvbmZpZyIsImZsdXNoIiwiZW5jb2RpbmciXSwic291cmNlcyI6WyJJbnZhbGlkQ29uZmlnRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBCb3gsIHJlbmRlciwgVGV4dCB9IGZyb20gJy4uL2luay5qcydcbmltcG9ydCB7IEtleWJpbmRpbmdTZXR1cCB9IGZyb20gJy4uL2tleWJpbmRpbmdzL0tleWJpbmRpbmdQcm92aWRlclNldHVwLmpzJ1xuaW1wb3J0IHsgQXBwU3RhdGVQcm92aWRlciB9IGZyb20gJy4uL3N0YXRlL0FwcFN0YXRlLmpzJ1xuaW1wb3J0IHR5cGUgeyBDb25maWdQYXJzZUVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzLmpzJ1xuaW1wb3J0IHsgZ2V0QmFzZVJlbmRlck9wdGlvbnMgfSBmcm9tICcuLi91dGlscy9yZW5kZXJPcHRpb25zLmpzJ1xuaW1wb3J0IHtcbiAganNvblN0cmluZ2lmeSxcbiAgd3JpdGVGaWxlU3luY19ERVBSRUNBVEVELFxufSBmcm9tICcuLi91dGlscy9zbG93T3BlcmF0aW9ucy5qcydcbmltcG9ydCB0eXBlIHsgVGhlbWVOYW1lIH0gZnJvbSAnLi4vdXRpbHMvdGhlbWUuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuL0N1c3RvbVNlbGVjdC9pbmRleC5qcydcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gJy4vZGVzaWduLXN5c3RlbS9EaWFsb2cuanMnXG5cbmludGVyZmFjZSBJbnZhbGlkQ29uZmlnSGFuZGxlclByb3BzIHtcbiAgZXJyb3I6IENvbmZpZ1BhcnNlRXJyb3Jcbn1cblxuaW50ZXJmYWNlIEludmFsaWRDb25maWdEaWFsb2dQcm9wcyB7XG4gIGZpbGVQYXRoOiBzdHJpbmdcbiAgZXJyb3JEZXNjcmlwdGlvbjogc3RyaW5nXG4gIG9uRXhpdDogKCkgPT4gdm9pZFxuICBvblJlc2V0OiAoKSA9PiB2b2lkXG59XG5cbi8qKlxuICogRGlhbG9nIHNob3duIHdoZW4gdGhlIENsYXVkZSBjb25maWcgZmlsZSBjb250YWlucyBpbnZhbGlkIEpTT05cbiAqL1xuZnVuY3Rpb24gSW52YWxpZENvbmZpZ0RpYWxvZyh7XG4gIGZpbGVQYXRoLFxuICBlcnJvckRlc2NyaXB0aW9uLFxuICBvbkV4aXQsXG4gIG9uUmVzZXQsXG59OiBJbnZhbGlkQ29uZmlnRGlhbG9nUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAvLyBIYW5kbGVyIGZvciBTZWxlY3Qgb25DaGFuZ2VcbiAgY29uc3QgaGFuZGxlU2VsZWN0ID0gKHZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICBpZiAodmFsdWUgPT09ICdleGl0Jykge1xuICAgICAgb25FeGl0KClcbiAgICB9IGVsc2Uge1xuICAgICAgb25SZXNldCgpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8RGlhbG9nIHRpdGxlPVwiQ29uZmlndXJhdGlvbiBFcnJvclwiIGNvbG9yPVwiZXJyb3JcIiBvbkNhbmNlbD17b25FeGl0fT5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgIDxUZXh0PlxuICAgICAgICAgIFRoZSBjb25maWd1cmF0aW9uIGZpbGUgYXQgPFRleHQgYm9sZD57ZmlsZVBhdGh9PC9UZXh0PiBjb250YWluc1xuICAgICAgICAgIGludmFsaWQgSlNPTi5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgICA8VGV4dD57ZXJyb3JEZXNjcmlwdGlvbn08L1RleHQ+XG4gICAgICA8L0JveD5cbiAgICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgICA8VGV4dCBib2xkPkNob29zZSBhbiBvcHRpb246PC9UZXh0PlxuICAgICAgICA8U2VsZWN0XG4gICAgICAgICAgb3B0aW9ucz17W1xuICAgICAgICAgICAgeyBsYWJlbDogJ0V4aXQgYW5kIGZpeCBtYW51YWxseScsIHZhbHVlOiAnZXhpdCcgfSxcbiAgICAgICAgICAgIHsgbGFiZWw6ICdSZXNldCB3aXRoIGRlZmF1bHQgY29uZmlndXJhdGlvbicsIHZhbHVlOiAncmVzZXQnIH0sXG4gICAgICAgICAgXX1cbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlU2VsZWN0fVxuICAgICAgICAgIG9uQ2FuY2VsPXtvbkV4aXR9XG4gICAgICAgIC8+XG4gICAgICA8L0JveD5cbiAgICA8L0RpYWxvZz5cbiAgKVxufVxuXG4vKipcbiAqIFNhZmUgZmFsbGJhY2sgdGhlbWUgbmFtZSBmb3IgZXJyb3IgZGlhbG9ncyB0byBhdm9pZCBjaXJjdWxhciBkZXBlbmRlbmN5LlxuICogVXNlcyBhIGhhcmRjb2RlZCBkYXJrIHRoZW1lIHRoYXQgZG9lc24ndCByZXF1aXJlIHJlYWRpbmcgZnJvbSBjb25maWcuXG4gKi9cbmNvbnN0IFNBRkVfRVJST1JfVEhFTUVfTkFNRTogVGhlbWVOYW1lID0gJ2RhcmsnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93SW52YWxpZENvbmZpZ0RpYWxvZyh7XG4gIGVycm9yLFxufTogSW52YWxpZENvbmZpZ0hhbmRsZXJQcm9wcyk6IFByb21pc2U8dm9pZD4ge1xuICAvLyBFeHRlbmQgUmVuZGVyT3B0aW9ucyB3aXRoIHRoZW1lIHByb3BlcnR5IGZvciB0aGlzIHNwZWNpZmljIHVzYWdlXG4gIHR5cGUgU2FmZVJlbmRlck9wdGlvbnMgPSBQYXJhbWV0ZXJzPHR5cGVvZiByZW5kZXI+WzFdICYgeyB0aGVtZT86IFRoZW1lTmFtZSB9XG5cbiAgY29uc3QgcmVuZGVyT3B0aW9uczogU2FmZVJlbmRlck9wdGlvbnMgPSB7XG4gICAgLi4uZ2V0QmFzZVJlbmRlck9wdGlvbnMoZmFsc2UpLFxuICAgIC8vIElNUE9SVEFOVDogVXNlIGhhcmRjb2RlZCB0aGVtZSBuYW1lIHRvIGF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY3kgd2l0aCBnZXRHbG9iYWxDb25maWcoKVxuICAgIC8vIFRoaXMgYWxsb3dzIHRoZSBlcnJvciBkaWFsb2cgdG8gc2hvdyBldmVuIHdoZW4gY29uZmlnIGZpbGUgaGFzIEpTT04gc3ludGF4IGVycm9yc1xuICAgIHRoZW1lOiBTQUZFX0VSUk9SX1RIRU1FX05BTUUsXG4gIH1cblxuICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihhc3luYyByZXNvbHZlID0+IHtcbiAgICBjb25zdCB7IHVubW91bnQgfSA9IGF3YWl0IHJlbmRlcihcbiAgICAgIDxBcHBTdGF0ZVByb3ZpZGVyPlxuICAgICAgICA8S2V5YmluZGluZ1NldHVwPlxuICAgICAgICAgIDxJbnZhbGlkQ29uZmlnRGlhbG9nXG4gICAgICAgICAgICBmaWxlUGF0aD17ZXJyb3IuZmlsZVBhdGh9XG4gICAgICAgICAgICBlcnJvckRlc2NyaXB0aW9uPXtlcnJvci5tZXNzYWdlfVxuICAgICAgICAgICAgb25FeGl0PXsoKSA9PiB7XG4gICAgICAgICAgICAgIHVubW91bnQoKVxuICAgICAgICAgICAgICB2b2lkIHJlc29sdmUoKVxuICAgICAgICAgICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvblJlc2V0PXsoKSA9PiB7XG4gICAgICAgICAgICAgIHdyaXRlRmlsZVN5bmNfREVQUkVDQVRFRChcbiAgICAgICAgICAgICAgICBlcnJvci5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICBqc29uU3RyaW5naWZ5KGVycm9yLmRlZmF1bHRDb25maWcsIG51bGwsIDIpLFxuICAgICAgICAgICAgICAgIHsgZmx1c2g6IGZhbHNlLCBlbmNvZGluZzogJ3V0ZjgnIH0sXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgdW5tb3VudCgpXG4gICAgICAgICAgICAgIHZvaWQgcmVzb2x2ZSgpXG4gICAgICAgICAgICAgIHByb2Nlc3MuZXhpdCgwKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L0tleWJpbmRpbmdTZXR1cD5cbiAgICAgIDwvQXBwU3RhdGVQcm92aWRlcj4sXG4gICAgICByZW5kZXJPcHRpb25zLFxuICAgIClcbiAgfSlcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU9BLEtBQUssTUFBTSxPQUFPO0FBQ3pCLFNBQVNDLEdBQUcsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLFFBQVEsV0FBVztBQUM3QyxTQUFTQyxlQUFlLFFBQVEsMkNBQTJDO0FBQzNFLFNBQVNDLGdCQUFnQixRQUFRLHNCQUFzQjtBQUN2RCxjQUFjQyxnQkFBZ0IsUUFBUSxvQkFBb0I7QUFDMUQsU0FBU0Msb0JBQW9CLFFBQVEsMkJBQTJCO0FBQ2hFLFNBQ0VDLGFBQWEsRUFDYkMsd0JBQXdCLFFBQ25CLDRCQUE0QjtBQUNuQyxjQUFjQyxTQUFTLFFBQVEsbUJBQW1CO0FBQ2xELFNBQVNDLE1B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
