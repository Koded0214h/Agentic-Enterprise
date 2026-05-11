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
exports.useOfficialMarketplaceNotification = useOfficialMarketplaceNotification;
var React = require("react");
var ink_js_1 = require("../ink.js");
var debug_js_1 = require("../utils/debug.js");
var officialMarketplaceStartupCheck_js_1 = require("../utils/plugins/officialMarketplaceStartupCheck.js");
var useStartupNotification_js_1 = require("./notifs/useStartupNotification.js");
/**
 * Hook that handles official marketplace auto-installation and shows
 * notifications for success/failure in the bottom right of the REPL.
 */
function useOfficialMarketplaceNotification() {
    (0, useStartupNotification_js_1.useStartupNotification)(_temp);
}
function _temp() {
    return __awaiter(this, void 0, void 0, function () {
        var result, notifs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, officialMarketplaceStartupCheck_js_1.checkAndInstallOfficialMarketplace)()];
                case 1:
                    result = _a.sent();
                    notifs = [];
                    if (result.configSaveFailed) {
                        (0, debug_js_1.logForDebugging)("Showing marketplace config save failure notification");
                        notifs.push({
                            key: "marketplace-config-save-failed",
                            jsx: <ink_js_1.Text color="error">Failed to save marketplace retry info · Check ~/.claude.json permissions</ink_js_1.Text>,
                            priority: "immediate",
                            timeoutMs: 10000
                        });
                    }
                    if (result.installed) {
                        (0, debug_js_1.logForDebugging)("Showing marketplace installation success notification");
                        notifs.push({
                            key: "marketplace-installed",
                            jsx: <ink_js_1.Text color="success">✓ Anthropic marketplace installed · /plugin to see available plugins</ink_js_1.Text>,
                            priority: "immediate",
                            timeoutMs: 7000
                        });
                    }
                    else {
                        if (result.skipped && result.reason === "unknown") {
                            (0, debug_js_1.logForDebugging)("Showing marketplace installation failure notification");
                            notifs.push({
                                key: "marketplace-install-failed",
                                jsx: <ink_js_1.Text color="warning">Failed to install Anthropic marketplace · Will retry on next startup</ink_js_1.Text>,
                                priority: "immediate",
                                timeoutMs: 8000
                            });
                        }
                    }
                    return [2 /*return*/, notifs];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIk5vdGlmaWNhdGlvbiIsIlRleHQiLCJsb2dGb3JEZWJ1Z2dpbmciLCJjaGVja0FuZEluc3RhbGxPZmZpY2lhbE1hcmtldHBsYWNlIiwidXNlU3RhcnR1cE5vdGlmaWNhdGlvbiIsInVzZU9mZmljaWFsTWFya2V0cGxhY2VOb3RpZmljYXRpb24iLCJfdGVtcCIsInJlc3VsdCIsIm5vdGlmcyIsImNvbmZpZ1NhdmVGYWlsZWQiLCJwdXNoIiwia2V5IiwianN4IiwicHJpb3JpdHkiLCJ0aW1lb3V0TXMiLCJpbnN0YWxsZWQiLCJza2lwcGVkIiwicmVhc29uIl0sInNvdXJjZXMiOlsidXNlT2ZmaWNpYWxNYXJrZXRwbGFjZU5vdGlmaWNhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IE5vdGlmaWNhdGlvbiB9IGZyb20gJy4uL2NvbnRleHQvbm90aWZpY2F0aW9ucy5qcydcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBsb2dGb3JEZWJ1Z2dpbmcgfSBmcm9tICcuLi91dGlscy9kZWJ1Zy5qcydcbmltcG9ydCB7IGNoZWNrQW5kSW5zdGFsbE9mZmljaWFsTWFya2V0cGxhY2UgfSBmcm9tICcuLi91dGlscy9wbHVnaW5zL29mZmljaWFsTWFya2V0cGxhY2VTdGFydHVwQ2hlY2suanMnXG5pbXBvcnQgeyB1c2VTdGFydHVwTm90aWZpY2F0aW9uIH0gZnJvbSAnLi9ub3RpZnMvdXNlU3RhcnR1cE5vdGlmaWNhdGlvbi5qcydcblxuLyoqXG4gKiBIb29rIHRoYXQgaGFuZGxlcyBvZmZpY2lhbCBtYXJrZXRwbGFjZSBhdXRvLWluc3RhbGxhdGlvbiBhbmQgc2hvd3NcbiAqIG5vdGlmaWNhdGlvbnMgZm9yIHN1Y2Nlc3MvZmFpbHVyZSBpbiB0aGUgYm90dG9tIHJpZ2h0IG9mIHRoZSBSRVBMLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXNlT2ZmaWNpYWxNYXJrZXRwbGFjZU5vdGlmaWNhdGlvbigpOiB2b2lkIHtcbiAgdXNlU3RhcnR1cE5vdGlmaWNhdGlvbihhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tBbmRJbnN0YWxsT2ZmaWNpYWxNYXJrZXRwbGFjZSgpXG4gICAgY29uc3Qgbm90aWZzOiBOb3RpZmljYXRpb25bXSA9IFtdXG5cbiAgICAvLyBDaGVjayBmb3IgY29uZmlnIHNhdmUgZmFpbHVyZSBmaXJzdCAtIHRoaXMgaXMgY3JpdGljYWxcbiAgICBpZiAocmVzdWx0LmNvbmZpZ1NhdmVGYWlsZWQpIHtcbiAgICAgIGxvZ0ZvckRlYnVnZ2luZygnU2hvd2luZyBtYXJrZXRwbGFjZSBjb25maWcgc2F2ZSBmYWlsdXJlIG5vdGlmaWNhdGlvbicpXG4gICAgICBub3RpZnMucHVzaCh7XG4gICAgICAgIGtleTogJ21hcmtldHBsYWNlLWNvbmZpZy1zYXZlLWZhaWxlZCcsXG4gICAgICAgIGpzeDogKFxuICAgICAgICAgIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj5cbiAgICAgICAgICAgIEZhaWxlZCB0byBzYXZlIG1hcmtldHBsYWNlIHJldHJ5IGluZm8gwrcgQ2hlY2sgfi8uY2xhdWRlLmpzb25cbiAgICAgICAgICAgIHBlcm1pc3Npb25zXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICApLFxuICAgICAgICBwcmlvcml0eTogJ2ltbWVkaWF0ZScsXG4gICAgICAgIHRpbWVvdXRNczogMTAwMDAsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChyZXN1bHQuaW5zdGFsbGVkKSB7XG4gICAgICBsb2dGb3JEZWJ1Z2dpbmcoJ1Nob3dpbmcgbWFya2V0cGxhY2UgaW5zdGFsbGF0aW9uIHN1Y2Nlc3Mgbm90aWZpY2F0aW9uJylcbiAgICAgIG5vdGlmcy5wdXNoKHtcbiAgICAgICAga2V5OiAnbWFya2V0cGxhY2UtaW5zdGFsbGVkJyxcbiAgICAgICAganN4OiAoXG4gICAgICAgICAgPFRleHQgY29sb3I9XCJzdWNjZXNzXCI+XG4gICAgICAgICAgICDinJMgQW50aHJvcGljIG1hcmtldHBsYWNlIGluc3RhbGxlZCDCtyAvcGx1Z2luIHRvIHNlZSBhdmFpbGFibGUgcGx1Z2luc1xuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgKSxcbiAgICAgICAgcHJpb3JpdHk6ICdpbW1lZGlhdGUnLFxuICAgICAgICB0aW1lb3V0TXM6IDcwMDAsXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAocmVzdWx0LnNraXBwZWQgJiYgcmVzdWx0LnJlYXNvbiA9PT0gJ3Vua25vd24nKSB7XG4gICAgICBsb2dGb3JEZWJ1Z2dpbmcoJ1Nob3dpbmcgbWFya2V0cGxhY2UgaW5zdGFsbGF0aW9uIGZhaWx1cmUgbm90aWZpY2F0aW9uJylcbiAgICAgIG5vdGlmcy5wdXNoKHtcbiAgICAgICAga2V5OiAnbWFya2V0cGxhY2UtaW5zdGFsbC1mYWlsZWQnLFxuICAgICAgICBqc3g6IChcbiAgICAgICAgICA8VGV4dCBjb2xvcj1cIndhcm5pbmdcIj5cbiAgICAgICAgICAgIEZhaWxlZCB0byBpbnN0YWxsIEFudGhyb3BpYyBtYXJrZXRwbGFjZSDCtyBXaWxsIHJldHJ5IG9uIG5leHQgc3RhcnR1cFxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgKSxcbiAgICAgICAgcHJpb3JpdHk6ICdpbW1lZGlhdGUnLFxuICAgICAgICB0aW1lb3V0TXM6IDgwMDAsXG4gICAgICB9KVxuICAgIH1cbiAgICAvLyBEb24ndCBzaG93IG5vdGlmaWNhdGlvbnMgZm9yOlxuICAgIC8vIC0gYWxyZWFkeV9pbnN0YWxsZWQgKHVzZXIgYWxyZWFkeSBoYXMgaXQpXG4gICAgLy8gLSBwb2xpY3lfYmxvY2tlZCAoZW50ZXJwcmlzZSBwb2xpY3ksIGRvbid0IG5hZylcbiAgICAvLyAtIGFscmVhZHlfYXR0ZW1wdGVkIChoYW5kbGVkIGJ5IHJldHJ5IGxvZ2ljIG5vdylcbiAgICAvLyAtIGdpdF91bmF2YWlsYWJsZSAobWFya2V0cGxhY2UgaXMgYSBuaWNlLXRvLWhhdmU7IGlmIGdpdCBpcyBtaXNzaW5nXG4gICAgLy8gICBvciBpcyBhIG5vbi1mdW5jdGlvbmFsIG1hY09TIHhjcnVuIHNoaW0sIHJldHJ5IHNpbGVudGx5IG9uIGJhY2tvZmZcbiAgICAvLyAgIHJhdGhlciB0aGFuIG5hZ2dpbmcg4oCUIHRoZSB1c2VyIHdpbGwgc29ydCBnaXQgb3V0IGZvciBvdGhlciByZWFzb25zKVxuICAgIHJldHVybiBub3RpZnNcbiAgfSlcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixjQUFjQyxZQUFZLFFBQVEsNkJBQTZCO0FBQy9ELFNBQVNDLElBQUksUUFBUSxXQUFXO0FBQ2hDLFNBQVNDLGVBQWUsUUFBUSxtQkFBbUI7QUFDbkQsU0FBU0Msa0NBQWtDLFFBQVEscURBQXFEO0FBQ3hHLFNBQVNDLHNCQUFzQixRQUFRLG9DQUFvQzs7QUFFM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQUFDLG1DQUFBO0VBQ0xELHNCQUFzQixDQUFDRSxLQXFEdEIsQ0FBQztBQUFBO0FBdERHLGVBQUFBLE1BQUE7RUFFSCxNQUFBQyxNQUFBLEdBQWUsTUFBTUosa0NBQWtDLENBQUMsQ0FBQztFQUN6RCxNQUFBSyxNQUFBLEdBQStCLEVBQUU7RUFHakMsSUFBSUQsTUFBTSxDQUFBRSxnQkFBaUI7SUFDekJQLGVBQWUsQ0FBQyxzREFBc0QsQ0FBQztJQUN2RU0sTUFBTSxDQUFBRSxJQUFLLENBQUM7TUFBQUMsR0FBQSxFQUNMLGdDQUFnQztNQUFBQyxHQUFBLEVBRW5DLENBQUMsSUFBSSxDQUFPLEtBQU8sQ0FBUCxPQUFPLENBQUMsd0VBR3BCLEVBSEMsSUFBSSxDQUdFO01BQUFDLFFBQUEsRUFFQyxXQUFXO01BQUFDLFNBQUEsRUFDVjtJQUNiLENBQUMsQ0FBQztFQUFBO0VBR0osSUFBSVAsTUFBTSxDQUFBUSxTQUFVO0lBQ2xCYixlQUFlLENBQUMsdURBQXVELENBQUM7SUFDeEVNLE1BQU0sQ0FBQUUsSUFBSyxDQUFDO01BQUFDLEdBQUEsRUFDTCx1QkFBdUI7TUFBQUMsR0FBQSxFQUUxQixDQUFDLElBQUksQ0FBTyxLQUFTLENBQVQsU0FBUyxDQUFDLG9FQUV0QixFQUZDLElBQUksQ0FFRTtNQUFBQyxRQUFBLEVBRUMsV0FBVztNQUFBQyxTQUFBLEVBQ1Y7SUFDYixDQUFDLENBQUM7RUFBQTtJQUNHLElBQUlQLE1BQU0sQ0FBQVMsT0FBdUMsSUFBM0JULE1BQU0sQ0FBQVUsTUFBTyxLQUFLLFNBQVM7TUFDdERmLGVBQWUsQ0FBQyx1REFBdUQsQ0FBQztNQUN4RU0sTUFBTSxDQUFBRSxJQUFLLENBQUM7UUFBQUMsR0FBQSxFQUNMLDRCQUE0QjtRQUFBQyxHQUFBLEVBRS9CLENBQUMsSUFBSSxDQUFPLEtBQVMsQ0FBVCxTQUFTLENBQUMsb0VBRXRCLEVBRkMsSUFBSSxDQUVFO1FBQUFDLFFBQUEsRUFFQyxXQUFXO1FBQUFDLFNBQUEsRUFDVjtNQUNiLENBQUMsQ0FBQztJQUFBO0VBQ0g7RUFBQSxPQVFNTixNQUFNO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
