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
exports.call = void 0;
var React = require("react");
var PermissionRuleList_js_1 = require("../../components/permissions/rules/PermissionRuleList.js");
var messages_js_1 = require("../../utils/messages.js");
var call = function (onDone, context) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, <PermissionRuleList_js_1.PermissionRuleList onExit={onDone} onRetryDenials={function (commands) {
                    context.setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [(0, messages_js_1.createPermissionRetryMessage)(commands)], false); });
                }}/>];
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlBlcm1pc3Npb25SdWxlTGlzdCIsIkxvY2FsSlNYQ29tbWFuZENhbGwiLCJjcmVhdGVQZXJtaXNzaW9uUmV0cnlNZXNzYWdlIiwiY2FsbCIsIm9uRG9uZSIsImNvbnRleHQiLCJjb21tYW5kcyIsInNldE1lc3NhZ2VzIiwicHJldiJdLCJzb3VyY2VzIjpbInBlcm1pc3Npb25zLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFBlcm1pc3Npb25SdWxlTGlzdCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvcGVybWlzc2lvbnMvcnVsZXMvUGVybWlzc2lvblJ1bGVMaXN0LmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRDYWxsIH0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB7IGNyZWF0ZVBlcm1pc3Npb25SZXRyeU1lc3NhZ2UgfSBmcm9tICcuLi8uLi91dGlscy9tZXNzYWdlcy5qcydcblxuZXhwb3J0IGNvbnN0IGNhbGw6IExvY2FsSlNYQ29tbWFuZENhbGwgPSBhc3luYyAob25Eb25lLCBjb250ZXh0KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPFBlcm1pc3Npb25SdWxlTGlzdFxuICAgICAgb25FeGl0PXtvbkRvbmV9XG4gICAgICBvblJldHJ5RGVuaWFscz17Y29tbWFuZHMgPT4ge1xuICAgICAgICBjb250ZXh0LnNldE1lc3NhZ2VzKHByZXYgPT4gW1xuICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgY3JlYXRlUGVybWlzc2lvblJldHJ5TWVzc2FnZShjb21tYW5kcyksXG4gICAgICAgIF0pXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxrQkFBa0IsUUFBUSwwREFBMEQ7QUFDN0YsY0FBY0MsbUJBQW1CLFFBQVEsd0JBQXdCO0FBQ2pFLFNBQVNDLDRCQUE0QixRQUFRLHlCQUF5QjtBQUV0RSxPQUFPLE1BQU1DLElBQUksRUFBRUYsbUJBQW1CLEdBQUcsTUFBQUUsQ0FBT0MsTUFBTSxFQUFFQyxPQUFPLEtBQUs7RUFDbEUsT0FDRSxDQUFDLGtCQUFrQixDQUNqQixNQUFNLENBQUMsQ0FBQ0QsTUFBTSxDQUFDLENBQ2YsY0FBYyxDQUFDLENBQUNFLFFBQVEsSUFBSTtJQUMxQkQsT0FBTyxDQUFDRSxXQUFXLENBQUNDLElBQUksSUFBSSxDQUMxQixHQUFHQSxJQUFJLEVBQ1BOLDRCQUE0QixDQUFDSSxRQUFRLENBQUMsQ0FDdkMsQ0FBQztFQUNKLENBQUMsQ0FBQyxHQUNGO0FBRU4sQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==
