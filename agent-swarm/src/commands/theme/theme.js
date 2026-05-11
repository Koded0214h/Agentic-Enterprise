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
exports.call = void 0;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var Pane_js_1 = require("../../components/design-system/Pane.js");
var ThemePicker_js_1 = require("../../components/ThemePicker.js");
var ink_js_1 = require("../../ink.js");
function ThemePickerCommand(t0) {
    var $ = (0, compiler_runtime_1.c)(8);
    var onDone = t0.onDone;
    var _a = (0, ink_js_1.useTheme)(), setTheme = _a[1];
    var t1;
    if ($[0] !== onDone || $[1] !== setTheme) {
        t1 = function (setting) {
            setTheme(setting);
            onDone("Theme set to ".concat(setting));
        };
        $[0] = onDone;
        $[1] = setTheme;
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var t2;
    if ($[3] !== onDone) {
        t2 = function () {
            onDone("Theme picker dismissed", {
                display: "system"
            });
        };
        $[3] = onDone;
        $[4] = t2;
    }
    else {
        t2 = $[4];
    }
    var t3;
    if ($[5] !== t1 || $[6] !== t2) {
        t3 = <Pane_js_1.Pane color="permission"><ThemePicker_js_1.ThemePicker onThemeSelect={t1} onCancel={t2} skipExitHandling={true}/></Pane_js_1.Pane>;
        $[5] = t1;
        $[6] = t2;
        $[7] = t3;
    }
    else {
        t3 = $[7];
    }
    return t3;
}
var call = function (onDone, _context) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, <ThemePickerCommand onDone={onDone}/>];
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkNvbW1hbmRSZXN1bHREaXNwbGF5IiwiUGFuZSIsIlRoZW1lUGlja2VyIiwidXNlVGhlbWUiLCJMb2NhbEpTWENvbW1hbmRDYWxsIiwiUHJvcHMiLCJvbkRvbmUiLCJyZXN1bHQiLCJvcHRpb25zIiwiZGlzcGxheSIsIlRoZW1lUGlja2VyQ29tbWFuZCIsInQwIiwiJCIsIl9jIiwic2V0VGhlbWUiLCJ0MSIsInNldHRpbmciLCJ0MiIsInQzIiwiY2FsbCIsIl9jb250ZXh0Il0sInNvdXJjZXMiOlsidGhlbWUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHR5cGUgeyBDb21tYW5kUmVzdWx0RGlzcGxheSB9IGZyb20gJy4uLy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgUGFuZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvZGVzaWduLXN5c3RlbS9QYW5lLmpzJ1xuaW1wb3J0IHsgVGhlbWVQaWNrZXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnRzL1RoZW1lUGlja2VyLmpzJ1xuaW1wb3J0IHsgdXNlVGhlbWUgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZENhbGwgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBvbkRvbmU6IChcbiAgICByZXN1bHQ/OiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IHsgZGlzcGxheT86IENvbW1hbmRSZXN1bHREaXNwbGF5IH0sXG4gICkgPT4gdm9pZFxufVxuXG5mdW5jdGlvbiBUaGVtZVBpY2tlckNvbW1hbmQoeyBvbkRvbmUgfTogUHJvcHMpOiBSZWFjdC5SZWFjdE5vZGUge1xuICBjb25zdCBbLCBzZXRUaGVtZV0gPSB1c2VUaGVtZSgpXG5cbiAgcmV0dXJuIChcbiAgICA8UGFuZSBjb2xvcj1cInBlcm1pc3Npb25cIj5cbiAgICAgIDxUaGVtZVBpY2tlclxuICAgICAgICBvblRoZW1lU2VsZWN0PXtzZXR0aW5nID0+IHtcbiAgICAgICAgICBzZXRUaGVtZShzZXR0aW5nKVxuICAgICAgICAgIG9uRG9uZShgVGhlbWUgc2V0IHRvICR7c2V0dGluZ31gKVxuICAgICAgICB9fVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4ge1xuICAgICAgICAgIG9uRG9uZSgnVGhlbWUgcGlja2VyIGRpc21pc3NlZCcsIHsgZGlzcGxheTogJ3N5c3RlbScgfSlcbiAgICAgICAgfX1cbiAgICAgICAgc2tpcEV4aXRIYW5kbGluZz17dHJ1ZX1cbiAgICAgIC8+XG4gICAgPC9QYW5lPlxuICApXG59XG5cbmV4cG9ydCBjb25zdCBjYWxsOiBMb2NhbEpTWENvbW1hbmRDYWxsID0gYXN5bmMgKG9uRG9uZSwgX2NvbnRleHQpID0+IHtcbiAgcmV0dXJuIDxUaGVtZVBpY2tlckNvbW1hbmQgb25Eb25lPXtvbkRvbmV9IC8+XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUtBLEtBQUssTUFBTSxPQUFPO0FBQzlCLGNBQWNDLG9CQUFvQixRQUFRLG1CQUFtQjtBQUM3RCxTQUFTQyxJQUFJLFFBQVEsd0NBQXdDO0FBQzdELFNBQVNDLFdBQVcsUUFBUSxpQ0FBaUM7QUFDN0QsU0FBU0MsUUFBUSxRQUFRLGNBQWM7QUFDdkMsY0FBY0MsbUJBQW1CLFFBQVEsd0JBQXdCO0FBRWpFLEtBQUtDLEtBQUssR0FBRztFQUNYQyxNQUFNLEVBQUUsQ0FDTkMsTUFBZSxDQUFSLEVBQUUsTUFBTSxFQUNmQyxPQUE0QyxDQUFwQyxFQUFFO0lBQUVDLE9BQU8sQ0FBQyxFQUFFVCxvQkFBb0I7RUFBQyxDQUFDLEVBQzVDLEdBQUcsSUFBSTtBQUNYLENBQUM7QUFFRCxTQUFBVSxtQkFBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUE0QjtJQUFBUDtFQUFBLElBQUFLLEVBQWlCO0VBQzNDLFNBQUFHLFFBQUEsSUFBcUJYLFFBQVEsQ0FBQyxDQUFDO0VBQUEsSUFBQVksRUFBQTtFQUFBLElBQUFILENBQUEsUUFBQU4sTUFBQSxJQUFBTSxDQUFBLFFBQUFFLFFBQUE7SUFLVkMsRUFBQSxHQUFBQyxPQUFBO01BQ2JGLFFBQVEsQ0FBQ0UsT0FBTyxDQUFDO01BQ2pCVixNQUFNLENBQUMsZ0JBQWdCVSxPQUFPLEVBQUUsQ0FBQztJQUFBLENBQ2xDO0lBQUFKLENBQUEsTUFBQU4sTUFBQTtJQUFBTSxDQUFBLE1BQUFFLFFBQUE7SUFBQUYsQ0FBQSxNQUFBRyxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBSCxDQUFBO0VBQUE7RUFBQSxJQUFBSyxFQUFBO0VBQUEsSUFBQUwsQ0FBQSxRQUFBTixNQUFBO0lBQ1NXLEVBQUEsR0FBQUEsQ0FBQTtNQUNSWCxNQUFNLENBQUMsd0JBQXdCLEVBQUU7UUFBQUcsT0FBQSxFQUFXO01BQVMsQ0FBQyxDQUFDO0lBQUEsQ0FDeEQ7SUFBQUcsQ0FBQSxNQUFBTixNQUFBO0lBQUFNLENBQUEsTUFBQUssRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQUwsQ0FBQTtFQUFBO0VBQUEsSUFBQU0sRUFBQTtFQUFBLElBQUFOLENBQUEsUUFBQUcsRUFBQSxJQUFBSCxDQUFBLFFBQUFLLEVBQUE7SUFSTEMsRUFBQSxJQUFDLElBQUksQ0FBTyxLQUFZLENBQVosWUFBWSxDQUN0QixDQUFDLFdBQVcsQ0FDSyxhQUdkLENBSGMsQ0FBQUgsRUFHZixDQUFDLENBQ1MsUUFFVCxDQUZTLENBQUFFLEVBRVYsQ0FBQyxDQUNpQixnQkFBSSxDQUFKLEtBQUcsQ0FBQyxHQUUxQixFQVhDLElBQUksQ0FXRTtJQUFBTCxDQUFBLE1BQUFHLEVBQUE7SUFBQUgsQ0FBQSxNQUFBSyxFQUFBO0lBQUFMLENBQUEsTUFBQU0sRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQU4sQ0FBQTtFQUFBO0VBQUEsT0FYUE0sRUFXTztBQUFBO0FBSVgsT0FBTyxNQUFNQyxJQUFJLEVBQUVmLG1CQUFtQixHQUFHLE1BQUFlLENBQU9iLE1BQU0sRUFBRWMsUUFBUSxLQUFLO0VBQ25FLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQ2QsTUFBTSxDQUFDLEdBQUc7QUFDL0MsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==
