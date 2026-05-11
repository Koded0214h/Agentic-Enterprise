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
exports.call = call;
var React = require("react");
var Passes_js_1 = require("../../components/Passes/Passes.js");
var index_js_1 = require("../../services/analytics/index.js");
var referral_js_1 = require("../../services/api/referral.js");
var config_js_1 = require("../../utils/config.js");
function call(onDone) {
    return __awaiter(this, void 0, void 0, function () {
        var config, isFirstVisit, remaining_1;
        return __generator(this, function (_a) {
            config = (0, config_js_1.getGlobalConfig)();
            isFirstVisit = !config.hasVisitedPasses;
            if (isFirstVisit) {
                remaining_1 = (0, referral_js_1.getCachedRemainingPasses)();
                (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { hasVisitedPasses: true, passesLastSeenRemaining: remaining_1 !== null && remaining_1 !== void 0 ? remaining_1 : current.passesLastSeenRemaining })); });
            }
            (0, index_js_1.logEvent)('tengu_guest_passes_visited', {
                is_first_visit: isFirstVisit
            });
            return [2 /*return*/, <Passes_js_1.Passes onDone={onDone}/>];
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIlBhc3NlcyIsImxvZ0V2ZW50IiwiZ2V0Q2FjaGVkUmVtYWluaW5nUGFzc2VzIiwiTG9jYWxKU1hDb21tYW5kT25Eb25lIiwiZ2V0R2xvYmFsQ29uZmlnIiwic2F2ZUdsb2JhbENvbmZpZyIsImNhbGwiLCJvbkRvbmUiLCJQcm9taXNlIiwiUmVhY3ROb2RlIiwiY29uZmlnIiwiaXNGaXJzdFZpc2l0IiwiaGFzVmlzaXRlZFBhc3NlcyIsInJlbWFpbmluZyIsImN1cnJlbnQiLCJwYXNzZXNMYXN0U2VlblJlbWFpbmluZyIsImlzX2ZpcnN0X3Zpc2l0Il0sInNvdXJjZXMiOlsicGFzc2VzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFBhc3NlcyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvUGFzc2VzL1Bhc3Nlcy5qcydcbmltcG9ydCB7IGxvZ0V2ZW50IH0gZnJvbSAnLi4vLi4vc2VydmljZXMvYW5hbHl0aWNzL2luZGV4LmpzJ1xuaW1wb3J0IHsgZ2V0Q2FjaGVkUmVtYWluaW5nUGFzc2VzIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvYXBpL3JlZmVycmFsLmpzJ1xuaW1wb3J0IHR5cGUgeyBMb2NhbEpTWENvbW1hbmRPbkRvbmUgfSBmcm9tICcuLi8uLi90eXBlcy9jb21tYW5kLmpzJ1xuaW1wb3J0IHsgZ2V0R2xvYmFsQ29uZmlnLCBzYXZlR2xvYmFsQ29uZmlnIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnLmpzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbChcbiAgb25Eb25lOiBMb2NhbEpTWENvbW1hbmRPbkRvbmUsXG4pOiBQcm9taXNlPFJlYWN0LlJlYWN0Tm9kZT4ge1xuICAvLyBNYXJrIHRoYXQgdXNlciBoYXMgdmlzaXRlZCAvcGFzc2VzIHNvIHdlIHN0b3Agc2hvd2luZyB0aGUgdXBzZWxsXG4gIGNvbnN0IGNvbmZpZyA9IGdldEdsb2JhbENvbmZpZygpXG4gIGNvbnN0IGlzRmlyc3RWaXNpdCA9ICFjb25maWcuaGFzVmlzaXRlZFBhc3Nlc1xuICBpZiAoaXNGaXJzdFZpc2l0KSB7XG4gICAgY29uc3QgcmVtYWluaW5nID0gZ2V0Q2FjaGVkUmVtYWluaW5nUGFzc2VzKClcbiAgICBzYXZlR2xvYmFsQ29uZmlnKGN1cnJlbnQgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBoYXNWaXNpdGVkUGFzc2VzOiB0cnVlLFxuICAgICAgcGFzc2VzTGFzdFNlZW5SZW1haW5pbmc6IHJlbWFpbmluZyA/PyBjdXJyZW50LnBhc3Nlc0xhc3RTZWVuUmVtYWluaW5nLFxuICAgIH0pKVxuICB9XG4gIGxvZ0V2ZW50KCd0ZW5ndV9ndWVzdF9wYXNzZXNfdmlzaXRlZCcsIHsgaXNfZmlyc3RfdmlzaXQ6IGlzRmlyc3RWaXNpdCB9KVxuICByZXR1cm4gPFBhc3NlcyBvbkRvbmU9e29uRG9uZX0gLz5cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxNQUFNLFFBQVEsbUNBQW1DO0FBQzFELFNBQVNDLFFBQVEsUUFBUSxtQ0FBbUM7QUFDNUQsU0FBU0Msd0JBQXdCLFFBQVEsZ0NBQWdDO0FBQ3pFLGNBQWNDLHFCQUFxQixRQUFRLHdCQUF3QjtBQUNuRSxTQUFTQyxlQUFlLEVBQUVDLGdCQUFnQixRQUFRLHVCQUF1QjtBQUV6RSxPQUFPLGVBQWVDLElBQUlBLENBQ3hCQyxNQUFNLEVBQUVKLHFCQUFxQixDQUM5QixFQUFFSyxPQUFPLENBQUNULEtBQUssQ0FBQ1UsU0FBUyxDQUFDLENBQUM7RUFDMUI7RUFDQSxNQUFNQyxNQUFNLEdBQUdOLGVBQWUsQ0FBQyxDQUFDO0VBQ2hDLE1BQU1PLFlBQVksR0FBRyxDQUFDRCxNQUFNLENBQUNFLGdCQUFnQjtFQUM3QyxJQUFJRCxZQUFZLEVBQUU7SUFDaEIsTUFBTUUsU0FBUyxHQUFHWCx3QkFBd0IsQ0FBQyxDQUFDO0lBQzVDRyxnQkFBZ0IsQ0FBQ1MsT0FBTyxLQUFLO01BQzNCLEdBQUdBLE9BQU87TUFDVkYsZ0JBQWdCLEVBQUUsSUFBSTtNQUN0QkcsdUJBQXVCLEVBQUVGLFNBQVMsSUFBSUMsT0FBTyxDQUFDQztJQUNoRCxDQUFDLENBQUMsQ0FBQztFQUNMO0VBQ0FkLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtJQUFFZSxjQUFjLEVBQUVMO0VBQWEsQ0FBQyxDQUFDO0VBQ3hFLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUNKLE1BQU0sQ0FBQyxHQUFHO0FBQ25DIiwiaWdub3JlTGlzdCI6W119
