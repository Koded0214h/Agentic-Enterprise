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
var React = require("react");
var HooksConfigMenu_js_1 = require("../../components/hooks/HooksConfigMenu.js");
var index_js_1 = require("../../services/analytics/index.js");
var tools_js_1 = require("../../tools.js");
var call = function (onDone, context) { return __awaiter(void 0, void 0, void 0, function () {
    var appState, permissionContext, toolNames;
    return __generator(this, function (_a) {
        (0, index_js_1.logEvent)('tengu_hooks_command', {});
        appState = context.getAppState();
        permissionContext = appState.toolPermissionContext;
        toolNames = (0, tools_js_1.getTools)(permissionContext).map(function (tool) { return tool.name; });
        return [2 /*return*/, <HooksConfigMenu_js_1.HooksConfigMenu toolNames={toolNames} onExit={onDone}/>];
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkhvb2tzQ29uZmlnTWVudSIsImxvZ0V2ZW50IiwiZ2V0VG9vbHMiLCJMb2NhbEpTWENvbW1hbmRDYWxsIiwiY2FsbCIsIm9uRG9uZSIsImNvbnRleHQiLCJhcHBTdGF0ZSIsImdldEFwcFN0YXRlIiwicGVybWlzc2lvbkNvbnRleHQiLCJ0b29sUGVybWlzc2lvbkNvbnRleHQiLCJ0b29sTmFtZXMiLCJtYXAiLCJ0b29sIiwibmFtZSJdLCJzb3VyY2VzIjpbImhvb2tzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEhvb2tzQ29uZmlnTWVudSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvaG9va3MvSG9va3NDb25maWdNZW51LmpzJ1xuaW1wb3J0IHsgbG9nRXZlbnQgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9hbmFseXRpY3MvaW5kZXguanMnXG5pbXBvcnQgeyBnZXRUb29scyB9IGZyb20gJy4uLy4uL3Rvb2xzLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDYWxsIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcblxuZXhwb3J0IGNvbnN0IGNhbGw6IExvY2FsSlNYQ29tbWFuZENhbGwgPSBhc3luYyAob25Eb25lLCBjb250ZXh0KSA9PiB7XG4gIGxvZ0V2ZW50KCd0ZW5ndV9ob29rc19jb21tYW5kJywge30pXG4gIGNvbnN0IGFwcFN0YXRlID0gY29udGV4dC5nZXRBcHBTdGF0ZSgpXG4gIGNvbnN0IHBlcm1pc3Npb25Db250ZXh0ID0gYXBwU3RhdGUudG9vbFBlcm1pc3Npb25Db250ZXh0XG4gIGNvbnN0IHRvb2xOYW1lcyA9IGdldFRvb2xzKHBlcm1pc3Npb25Db250ZXh0KS5tYXAodG9vbCA9PiB0b29sLm5hbWUpXG4gIHJldHVybiA8SG9va3NDb25maWdNZW51IHRvb2xOYW1lcz17dG9vbE5hbWVzfSBvbkV4aXQ9e29uRG9uZX0gLz5cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxlQUFlLFFBQVEsMkNBQTJDO0FBQzNFLFNBQVNDLFFBQVEsUUFBUSxtQ0FBbUM7QUFDNUQsU0FBU0MsUUFBUSxRQUFRLGdCQUFnQjtBQUN6QyxjQUFjQyxtQkFBbUIsUUFBUSx3QkFBd0I7QUFFakUsT0FBTyxNQUFNQyxJQUFJLEVBQUVELG1CQUFtQixHQUFHLE1BQUFDLENBQU9DLE1BQU0sRUFBRUMsT0FBTyxLQUFLO0VBQ2xFTCxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDbkMsTUFBTU0sUUFBUSxHQUFHRCxPQUFPLENBQUNFLFdBQVcsQ0FBQyxDQUFDO0VBQ3RDLE1BQU1DLGlCQUFpQixHQUFHRixRQUFRLENBQUNHLHFCQUFxQjtFQUN4RCxNQUFNQyxTQUFTLEdBQUdULFFBQVEsQ0FBQ08saUJBQWlCLENBQUMsQ0FBQ0csR0FBRyxDQUFDQyxJQUFJLElBQUlBLElBQUksQ0FBQ0MsSUFBSSxDQUFDO0VBQ3BFLE9BQU8sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUNILFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDTixNQUFNLENBQUMsR0FBRztBQUNsRSxDQUFDIiwiaWdub3JlTGlzdCI6W119
