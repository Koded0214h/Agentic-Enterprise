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
var React = require("react");
var AgentsMenu_js_1 = require("../../components/agents/AgentsMenu.js");
var tools_js_1 = require("../../tools.js");
function call(onDone, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, permissionContext, tools;
        return __generator(this, function (_a) {
            appState = context.getAppState();
            permissionContext = appState.toolPermissionContext;
            tools = (0, tools_js_1.getTools)(permissionContext);
            return [2 /*return*/, <AgentsMenu_js_1.AgentsMenu tools={tools} onExit={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkFnZW50c01lbnUiLCJUb29sVXNlQ29udGV4dCIsImdldFRvb2xzIiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiY2FsbCIsIm9uRG9uZSIsImNvbnRleHQiLCJQcm9taXNlIiwiUmVhY3ROb2RlIiwiYXBwU3RhdGUiLCJnZXRBcHBTdGF0ZSIsInBlcm1pc3Npb25Db250ZXh0IiwidG9vbFBlcm1pc3Npb25Db250ZXh0IiwidG9vbHMiXSwic291cmNlcyI6WyJhZ2VudHMudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgQWdlbnRzTWVudSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvYWdlbnRzL0FnZW50c01lbnUuanMnXG5pbXBvcnQgdHlwZSB7IFRvb2xVc2VDb250ZXh0IH0gZnJvbSAnLi4vLi4vVG9vbC5qcydcbmltcG9ydCB7IGdldFRvb2xzIH0gZnJvbSAnLi4vLi4vdG9vbHMuanMnXG5pbXBvcnQgdHlwZSB7IExvY2FsSlNYQ29tbWFuZE9uRG9uZSB9IGZyb20gJy4uLy4uL3R5cGVzL2NvbW1hbmQuanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsKFxuICBvbkRvbmU6IExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbiAgY29udGV4dDogVG9vbFVzZUNvbnRleHQsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICBjb25zdCBhcHBTdGF0ZSA9IGNvbnRleHQuZ2V0QXBwU3RhdGUoKVxuICBjb25zdCBwZXJtaXNzaW9uQ29udGV4dCA9IGFwcFN0YXRlLnRvb2xQZXJtaXNzaW9uQ29udGV4dFxuICBjb25zdCB0b29scyA9IGdldFRvb2xzKHBlcm1pc3Npb25Db250ZXh0KVxuXG4gIHJldHVybiA8QWdlbnRzTWVudSB0b29scz17dG9vbHN9IG9uRXhpdD17b25Eb25lfSAvPlxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUtBLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLFVBQVUsUUFBUSx1Q0FBdUM7QUFDbEUsY0FBY0MsY0FBYyxRQUFRLGVBQWU7QUFDbkQsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUN6QyxjQUFjQyxxQkFBcUIsUUFBUSx3QkFBd0I7QUFFbkUsT0FBTyxlQUFlQyxJQUFJQSxDQUN4QkMsTUFBTSxFQUFFRixxQkFBcUIsRUFDN0JHLE9BQU8sRUFBRUwsY0FBYyxDQUN4QixFQUFFTSxPQUFPLENBQUNSLEtBQUssQ0FBQ1MsU0FBUyxDQUFDLENBQUM7RUFDMUIsTUFBTUMsUUFBUSxHQUFHSCxPQUFPLENBQUNJLFdBQVcsQ0FBQyxDQUFDO0VBQ3RDLE1BQU1DLGlCQUFpQixHQUFHRixRQUFRLENBQUNHLHFCQUFxQjtFQUN4RCxNQUFNQyxLQUFLLEdBQUdYLFFBQVEsQ0FBQ1MsaUJBQWlCLENBQUM7RUFFekMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQ0UsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUNSLE1BQU0sQ0FBQyxHQUFHO0FBQ3JEIiwiaWdub3JlTGlzdCI6W119
