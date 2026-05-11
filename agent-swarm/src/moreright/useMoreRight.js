"use strict";
// Stub for external builds — the real hook is internal only.
//
// Self-contained: no relative imports. Typecheck sees this file at
// scripts/external-stubs/src/moreright/ before overlay, where ../types/
// would resolve to scripts/external-stubs/src/types/ (doesn't exist).
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
exports.useMoreRight = useMoreRight;
function useMoreRight(_args) {
    var _this = this;
    return {
        onBeforeQuery: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, true];
        }); }); },
        onTurnComplete: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); }); },
        render: function () { return null; }
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNIiwidXNlTW9yZVJpZ2h0IiwiX2FyZ3MiLCJlbmFibGVkIiwic2V0TWVzc2FnZXMiLCJhY3Rpb24iLCJwcmV2IiwiaW5wdXRWYWx1ZSIsInNldElucHV0VmFsdWUiLCJzIiwic2V0VG9vbEpTWCIsImFyZ3MiLCJvbkJlZm9yZVF1ZXJ5IiwiaW5wdXQiLCJhbGwiLCJuIiwiUHJvbWlzZSIsIm9uVHVybkNvbXBsZXRlIiwiYWJvcnRlZCIsInJlbmRlciJdLCJzb3VyY2VzIjpbInVzZU1vcmVSaWdodC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gU3R1YiBmb3IgZXh0ZXJuYWwgYnVpbGRzIOKAlCB0aGUgcmVhbCBob29rIGlzIGludGVybmFsIG9ubHkuXG4vL1xuLy8gU2VsZi1jb250YWluZWQ6IG5vIHJlbGF0aXZlIGltcG9ydHMuIFR5cGVjaGVjayBzZWVzIHRoaXMgZmlsZSBhdFxuLy8gc2NyaXB0cy9leHRlcm5hbC1zdHVicy9zcmMvbW9yZXJpZ2h0LyBiZWZvcmUgb3ZlcmxheSwgd2hlcmUgLi4vdHlwZXMvXG4vLyB3b3VsZCByZXNvbHZlIHRvIHNjcmlwdHMvZXh0ZXJuYWwtc3R1YnMvc3JjL3R5cGVzLyAoZG9lc24ndCBleGlzdCkuXG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG50eXBlIE0gPSBhbnlcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU1vcmVSaWdodChfYXJnczoge1xuICBlbmFibGVkOiBib29sZWFuXG4gIHNldE1lc3NhZ2VzOiAoYWN0aW9uOiBNW10gfCAoKHByZXY6IE1bXSkgPT4gTVtdKSkgPT4gdm9pZFxuICBpbnB1dFZhbHVlOiBzdHJpbmdcbiAgc2V0SW5wdXRWYWx1ZTogKHM6IHN0cmluZykgPT4gdm9pZFxuICBzZXRUb29sSlNYOiAoYXJnczogTSkgPT4gdm9pZFxufSk6IHtcbiAgb25CZWZvcmVRdWVyeTogKGlucHV0OiBzdHJpbmcsIGFsbDogTVtdLCBuOiBudW1iZXIpID0+IFByb21pc2U8Ym9vbGVhbj5cbiAgb25UdXJuQ29tcGxldGU6IChhbGw6IE1bXSwgYWJvcnRlZDogYm9vbGVhbikgPT4gUHJvbWlzZTx2b2lkPlxuICByZW5kZXI6ICgpID0+IG51bGxcbn0ge1xuICByZXR1cm4ge1xuICAgIG9uQmVmb3JlUXVlcnk6IGFzeW5jICgpID0+IHRydWUsXG4gICAgb25UdXJuQ29tcGxldGU6IGFzeW5jICgpID0+IHt9LFxuICAgIHJlbmRlcjogKCkgPT4gbnVsbCxcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBS0EsQ0FBQyxHQUFHLEdBQUc7QUFFWixPQUFPLFNBQVNDLFlBQVlBLENBQUNDLEtBQUssRUFBRTtFQUNsQ0MsT0FBTyxFQUFFLE9BQU87RUFDaEJDLFdBQVcsRUFBRSxDQUFDQyxNQUFNLEVBQUVMLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQ00sSUFBSSxFQUFFTixDQUFDLEVBQUUsRUFBRSxHQUFHQSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsSUFBSTtFQUN6RE8sVUFBVSxFQUFFLE1BQU07RUFDbEJDLGFBQWEsRUFBRSxDQUFDQyxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSTtFQUNsQ0MsVUFBVSxFQUFFLENBQUNDLElBQUksRUFBRVgsQ0FBQyxFQUFFLEdBQUcsSUFBSTtBQUMvQixDQUFDLENBQUMsRUFBRTtFQUNGWSxhQUFhLEVBQUUsQ0FBQ0MsS0FBSyxFQUFFLE1BQU0sRUFBRUMsR0FBRyxFQUFFZCxDQUFDLEVBQUUsRUFBRWUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHQyxPQUFPLENBQUMsT0FBTyxDQUFDO0VBQ3ZFQyxjQUFjLEVBQUUsQ0FBQ0gsR0FBRyxFQUFFZCxDQUFDLEVBQUUsRUFBRWtCLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBR0YsT0FBTyxDQUFDLElBQUksQ0FBQztFQUM3REcsTUFBTSxFQUFFLEdBQUcsR0FBRyxJQUFJO0FBQ3BCLENBQUMsQ0FBQztFQUNBLE9BQU87SUFDTFAsYUFBYSxFQUFFLE1BQUFBLENBQUEsS0FBWSxJQUFJO0lBQy9CSyxjQUFjLEVBQUUsTUFBQUEsQ0FBQSxLQUFZLENBQUMsQ0FBQztJQUM5QkUsTUFBTSxFQUFFQSxDQUFBLEtBQU07RUFDaEIsQ0FBQztBQUNIIiwiaWdub3JlTGlzdCI6W119
