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
exports.TestingPermissionTool = void 0;
/**
 * This testing-only tool will always pop up a permission dialog when called by
 * the model.
 */
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var NAME = 'TestingPermission';
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.strictObject({}); });
exports.TestingPermissionTool = (0, Tool_js_1.buildTool)({
    name: NAME,
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Test tool that always asks for permission'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Test tool that always asks for permission before executing. Used for end-to-end testing.'];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    userFacingName: function () {
        return 'TestingPermission';
    },
    isEnabled: function () {
        return "production" === 'test';
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    checkPermissions: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This tool always requires permission
                return [2 /*return*/, {
                        behavior: 'ask',
                        message: "Run test?"
                    }];
            });
        });
    },
    renderToolUseMessage: function () {
        return null;
    },
    renderToolUseProgressMessage: function () {
        return null;
    },
    renderToolUseQueuedMessage: function () {
        return null;
    },
    renderToolUseRejectedMessage: function () {
        return null;
    },
    renderToolResultMessage: function () {
        return null;
    },
    renderToolUseErrorMessage: function () {
        return null;
    },
    call: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        data: "".concat(NAME, " executed successfully")
                    }];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (result, toolUseID) {
        return {
            type: 'tool_result',
            content: String(result),
            tool_use_id: toolUseID
        };
    }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ6IiwiVG9vbCIsImJ1aWxkVG9vbCIsIlRvb2xEZWYiLCJsYXp5U2NoZW1hIiwiTkFNRSIsImlucHV0U2NoZW1hIiwic3RyaWN0T2JqZWN0IiwiSW5wdXRTY2hlbWEiLCJSZXR1cm5UeXBlIiwiVGVzdGluZ1Blcm1pc3Npb25Ub29sIiwibmFtZSIsIm1heFJlc3VsdFNpemVDaGFycyIsImRlc2NyaXB0aW9uIiwicHJvbXB0IiwidXNlckZhY2luZ05hbWUiLCJpc0VuYWJsZWQiLCJpc0NvbmN1cnJlbmN5U2FmZSIsImlzUmVhZE9ubHkiLCJjaGVja1Blcm1pc3Npb25zIiwiYmVoYXZpb3IiLCJjb25zdCIsIm1lc3NhZ2UiLCJyZW5kZXJUb29sVXNlTWVzc2FnZSIsInJlbmRlclRvb2xVc2VQcm9ncmVzc01lc3NhZ2UiLCJyZW5kZXJUb29sVXNlUXVldWVkTWVzc2FnZSIsInJlbmRlclRvb2xVc2VSZWplY3RlZE1lc3NhZ2UiLCJyZW5kZXJUb29sUmVzdWx0TWVzc2FnZSIsInJlbmRlclRvb2xVc2VFcnJvck1lc3NhZ2UiLCJjYWxsIiwiZGF0YSIsIm1hcFRvb2xSZXN1bHRUb1Rvb2xSZXN1bHRCbG9ja1BhcmFtIiwicmVzdWx0IiwidG9vbFVzZUlEIiwidHlwZSIsImNvbnRlbnQiLCJTdHJpbmciLCJ0b29sX3VzZV9pZCJdLCJzb3VyY2VzIjpbIlRlc3RpbmdQZXJtaXNzaW9uVG9vbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIHRlc3Rpbmctb25seSB0b29sIHdpbGwgYWx3YXlzIHBvcCB1cCBhIHBlcm1pc3Npb24gZGlhbG9nIHdoZW4gY2FsbGVkIGJ5XG4gKiB0aGUgbW9kZWwuXG4gKi9cbmltcG9ydCB7IHogfSBmcm9tICd6b2QvdjQnXG5pbXBvcnQgdHlwZSB7IFRvb2wgfSBmcm9tICcuLi8uLi9Ub29sLmpzJ1xuaW1wb3J0IHsgYnVpbGRUb29sLCB0eXBlIFRvb2xEZWYgfSBmcm9tICcuLi8uLi9Ub29sLmpzJ1xuaW1wb3J0IHsgbGF6eVNjaGVtYSB9IGZyb20gJy4uLy4uL3V0aWxzL2xhenlTY2hlbWEuanMnXG5cbmNvbnN0IE5BTUUgPSAnVGVzdGluZ1Blcm1pc3Npb24nXG5cbmNvbnN0IGlucHV0U2NoZW1hID0gbGF6eVNjaGVtYSgoKSA9PiB6LnN0cmljdE9iamVjdCh7fSkpXG50eXBlIElucHV0U2NoZW1hID0gUmV0dXJuVHlwZTx0eXBlb2YgaW5wdXRTY2hlbWE+XG5cbmV4cG9ydCBjb25zdCBUZXN0aW5nUGVybWlzc2lvblRvb2w6IFRvb2w8SW5wdXRTY2hlbWEsIHN0cmluZz4gPSBidWlsZFRvb2woe1xuICBuYW1lOiBOQU1FLFxuICBtYXhSZXN1bHRTaXplQ2hhcnM6IDEwMF8wMDAsXG4gIGFzeW5jIGRlc2NyaXB0aW9uKCkge1xuICAgIHJldHVybiAnVGVzdCB0b29sIHRoYXQgYWx3YXlzIGFza3MgZm9yIHBlcm1pc3Npb24nXG4gIH0sXG4gIGFzeW5jIHByb21wdCgpIHtcbiAgICByZXR1cm4gJ1Rlc3QgdG9vbCB0aGF0IGFsd2F5cyBhc2tzIGZvciBwZXJtaXNzaW9uIGJlZm9yZSBleGVjdXRpbmcuIFVzZWQgZm9yIGVuZC10by1lbmQgdGVzdGluZy4nXG4gIH0sXG4gIGdldCBpbnB1dFNjaGVtYSgpOiBJbnB1dFNjaGVtYSB7XG4gICAgcmV0dXJuIGlucHV0U2NoZW1hKClcbiAgfSxcbiAgdXNlckZhY2luZ05hbWUoKSB7XG4gICAgcmV0dXJuICdUZXN0aW5nUGVybWlzc2lvbidcbiAgfSxcbiAgaXNFbmFibGVkKCkge1xuICAgIHJldHVybiBcInByb2R1Y3Rpb25cIiA9PT0gJ3Rlc3QnXG4gIH0sXG4gIGlzQ29uY3VycmVuY3lTYWZlKCkge1xuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIGlzUmVhZE9ubHkoKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgYXN5bmMgY2hlY2tQZXJtaXNzaW9ucygpIHtcbiAgICAvLyBUaGlzIHRvb2wgYWx3YXlzIHJlcXVpcmVzIHBlcm1pc3Npb25cbiAgICByZXR1cm4ge1xuICAgICAgYmVoYXZpb3I6ICdhc2snIGFzIGNvbnN0LFxuICAgICAgbWVzc2FnZTogYFJ1biB0ZXN0P2AsXG4gICAgfVxuICB9LFxuICByZW5kZXJUb29sVXNlTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9LFxuICByZW5kZXJUb29sVXNlUHJvZ3Jlc3NNZXNzYWdlKCkge1xuICAgIHJldHVybiBudWxsXG4gIH0sXG4gIHJlbmRlclRvb2xVc2VRdWV1ZWRNZXNzYWdlKCkge1xuICAgIHJldHVybiBudWxsXG4gIH0sXG4gIHJlbmRlclRvb2xVc2VSZWplY3RlZE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSxcbiAgcmVuZGVyVG9vbFJlc3VsdE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSxcbiAgcmVuZGVyVG9vbFVzZUVycm9yTWVzc2FnZSgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9LFxuICBhc3luYyBjYWxsKCkge1xuICAgIHJldHVybiB7XG4gICAgICBkYXRhOiBgJHtOQU1FfSBleGVjdXRlZCBzdWNjZXNzZnVsbHlgLFxuICAgIH1cbiAgfSxcbiAgbWFwVG9vbFJlc3VsdFRvVG9vbFJlc3VsdEJsb2NrUGFyYW0ocmVzdWx0LCB0b29sVXNlSUQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ3Rvb2xfcmVzdWx0JyxcbiAgICAgIGNvbnRlbnQ6IFN0cmluZyhyZXN1bHQpLFxuICAgICAgdG9vbF91c2VfaWQ6IHRvb2xVc2VJRCxcbiAgICB9XG4gIH0sXG59IHNhdGlzZmllcyBUb29sRGVmPElucHV0U2NoZW1hLCBzdHJpbmc+KVxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVNBLENBQUMsUUFBUSxRQUFRO0FBQzFCLGNBQWNDLElBQUksUUFBUSxlQUFlO0FBQ3pDLFNBQVNDLFNBQVMsRUFBRSxLQUFLQyxPQUFPLFFBQVEsZUFBZTtBQUN2RCxTQUFTQyxVQUFVLFFBQVEsMkJBQTJCO0FBRXRELE1BQU1DLElBQUksR0FBRyxtQkFBbUI7QUFFaEMsTUFBTUMsV0FBVyxHQUFHRixVQUFVLENBQUMsTUFBTUosQ0FBQyxDQUFDTyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4RCxLQUFLQyxXQUFXLEdBQUdDLFVBQVUsQ0FBQyxPQUFPSCxXQUFXLENBQUM7QUFFakQsT0FBTyxNQUFNSSxxQkFBcUIsRUFBRVQsSUFBSSxDQUFDTyxXQUFXLEVBQUUsTUFBTSxDQUFDLEdBQUdOLFNBQVMsQ0FBQztFQUN4RVMsSUFBSSxFQUFFTixJQUFJO0VBQ1ZPLGtCQUFrQixFQUFFLE9BQU87RUFDM0IsTUFBTUMsV0FBV0EsQ0FBQSxFQUFHO0lBQ2xCLE9BQU8sMkNBQTJDO0VBQ3BELENBQUM7RUFDRCxNQUFNQyxNQUFNQSxDQUFBLEVBQUc7SUFDYixPQUFPLDBGQUEwRjtFQUNuRyxDQUFDO0VBQ0QsSUFBSVIsV0FBV0EsQ0FBQSxDQUFFLEVBQUVFLFdBQVcsQ0FBQztJQUM3QixPQUFPRixXQUFXLENBQUMsQ0FBQztFQUN0QixDQUFDO0VBQ0RTLGNBQWNBLENBQUEsRUFBRztJQUNmLE9BQU8sbUJBQW1CO0VBQzVCLENBQUM7RUFDREMsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsT0FBTyxZQUFZLEtBQUssTUFBTTtFQUNoQyxDQUFDO0VBQ0RDLGlCQUFpQkEsQ0FBQSxFQUFHO0lBQ2xCLE9BQU8sSUFBSTtFQUNiLENBQUM7RUFDREMsVUFBVUEsQ0FBQSxFQUFHO0lBQ1gsT0FBTyxJQUFJO0VBQ2IsQ0FBQztFQUNELE1BQU1DLGdCQUFnQkEsQ0FBQSxFQUFHO0lBQ3ZCO0lBQ0EsT0FBTztNQUNMQyxRQUFRLEVBQUUsS0FBSyxJQUFJQyxLQUFLO01BQ3hCQyxPQUFPLEVBQUU7SUFDWCxDQUFDO0VBQ0gsQ0FBQztFQUNEQyxvQkFBb0JBLENBQUEsRUFBRztJQUNyQixPQUFPLElBQUk7RUFDYixDQUFDO0VBQ0RDLDRCQUE0QkEsQ0FBQSxFQUFHO0lBQzdCLE9BQU8sSUFBSTtFQUNiLENBQUM7RUFDREMsMEJBQTBCQSxDQUFBLEVBQUc7SUFDM0IsT0FBTyxJQUFJO0VBQ2IsQ0FBQztFQUNEQyw0QkFBNEJBLENBQUEsRUFBRztJQUM3QixPQUFPLElBQUk7RUFDYixDQUFDO0VBQ0RDLHVCQUF1QkEsQ0FBQSxFQUFHO0lBQ3hCLE9BQU8sSUFBSTtFQUNiLENBQUM7RUFDREMseUJBQXlCQSxDQUFBLEVBQUc7SUFDMUIsT0FBTyxJQUFJO0VBQ2IsQ0FBQztFQUNELE1BQU1DLElBQUlBLENBQUEsRUFBRztJQUNYLE9BQU87TUFDTEMsSUFBSSxFQUFFLEdBQUd6QixJQUFJO0lBQ2YsQ0FBQztFQUNILENBQUM7RUFDRDBCLG1DQUFtQ0EsQ0FBQ0MsTUFBTSxFQUFFQyxTQUFTLEVBQUU7SUFDckQsT0FBTztNQUNMQyxJQUFJLEVBQUUsYUFBYTtNQUNuQkMsT0FBTyxFQUFFQyxNQUFNLENBQUNKLE1BQU0sQ0FBQztNQUN2QkssV0FBVyxFQUFFSjtJQUNmLENBQUM7RUFDSDtBQUNGLENBQUMsV0FBVzlCLE9BQU8sQ0FBQ0ssV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDIiwiaWdub3JlTGlzdCI6W119
