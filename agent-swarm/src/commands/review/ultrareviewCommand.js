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
var react_1 = require("react");
var reviewRemote_js_1 = require("./reviewRemote.js");
var UltrareviewOverageDialog_js_1 = require("./UltrareviewOverageDialog.js");
function contentBlocksToString(blocks) {
    return blocks.map(function (b) { return b.type === 'text' ? b.text : ''; }).filter(Boolean).join('\n');
}
function launchAndDone(args, context, onDone, billingNote, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, reviewRemote_js_1.launchRemoteReview)(args, context, billingNote)];
                case 1:
                    result = _a.sent();
                    // User hit Escape during the ~5s launch — the dialog already showed
                    // "cancelled" and unmounted, so skip onDone (would write to a dead
                    // transcript slot) and let the caller skip confirmOverage.
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted)
                        return [2 /*return*/];
                    if (result) {
                        onDone(contentBlocksToString(result), {
                            shouldQuery: true
                        });
                    }
                    else {
                        // Precondition failures now return specific ContentBlockParam[] above.
                        // null only reaches here on teleport failure (PR mode) or non-github
                        // repo — both are CCR/repo connectivity issues.
                        onDone('Ultrareview failed to launch the remote session. Check that this is a GitHub repo and try again.', {
                            display: 'system'
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var call = function (onDone, context, args) { return __awaiter(void 0, void 0, void 0, function () {
    var gate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, reviewRemote_js_1.checkOverageGate)()];
            case 1:
                gate = _a.sent();
                if (gate.kind === 'not-enabled') {
                    onDone('Free ultrareviews used. Enable Extra Usage at https://claude.ai/settings/billing to continue.', {
                        display: 'system'
                    });
                    return [2 /*return*/, null];
                }
                if (gate.kind === 'low-balance') {
                    onDone("Balance too low to launch ultrareview ($".concat(gate.available.toFixed(2), " available, $10 minimum). Top up at https://claude.ai/settings/billing"), {
                        display: 'system'
                    });
                    return [2 /*return*/, null];
                }
                if (gate.kind === 'needs-confirm') {
                    return [2 /*return*/, <UltrareviewOverageDialog_js_1.UltrareviewOverageDialog onProceed={function (signal) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, launchAndDone(args, context, onDone, ' This review bills as Extra Usage.', signal)];
                                        case 1:
                                            _a.sent();
                                            // Only persist the confirmation flag after a non-aborted launch —
                                            // otherwise Escape-during-launch would leave the flag set and
                                            // skip this dialog on the next attempt.
                                            if (!signal.aborted)
                                                (0, reviewRemote_js_1.confirmOverage)();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }} onCancel={function () { return onDone('Ultrareview cancelled.', {
                                display: 'system'
                            }); }}/>];
                }
                // gate.kind === 'proceed'
                return [4 /*yield*/, launchAndDone(args, context, onDone, gate.billingNote)];
            case 2:
                // gate.kind === 'proceed'
                _a.sent();
                return [2 /*return*/, null];
        }
    });
}); };
exports.call = call;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250ZW50QmxvY2tQYXJhbSIsIlJlYWN0IiwiTG9jYWxKU1hDb21tYW5kQ2FsbCIsIkxvY2FsSlNYQ29tbWFuZE9uRG9uZSIsImNoZWNrT3ZlcmFnZUdhdGUiLCJjb25maXJtT3ZlcmFnZSIsImxhdW5jaFJlbW90ZVJldmlldyIsIlVsdHJhcmV2aWV3T3ZlcmFnZURpYWxvZyIsImNvbnRlbnRCbG9ja3NUb1N0cmluZyIsImJsb2NrcyIsIm1hcCIsImIiLCJ0eXBlIiwidGV4dCIsImZpbHRlciIsIkJvb2xlYW4iLCJqb2luIiwibGF1bmNoQW5kRG9uZSIsImFyZ3MiLCJjb250ZXh0IiwiUGFyYW1ldGVycyIsIm9uRG9uZSIsImJpbGxpbmdOb3RlIiwic2lnbmFsIiwiQWJvcnRTaWduYWwiLCJQcm9taXNlIiwicmVzdWx0IiwiYWJvcnRlZCIsInNob3VsZFF1ZXJ5IiwiZGlzcGxheSIsImNhbGwiLCJnYXRlIiwia2luZCIsImF2YWlsYWJsZSIsInRvRml4ZWQiXSwic291cmNlcyI6WyJ1bHRyYXJldmlld0NvbW1hbmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29udGVudEJsb2NrUGFyYW0gfSBmcm9tICdAYW50aHJvcGljLWFpL3Nkay9yZXNvdXJjZXMvbWVzc2FnZXMuanMnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7XG4gIExvY2FsSlNYQ29tbWFuZENhbGwsXG4gIExvY2FsSlNYQ29tbWFuZE9uRG9uZSxcbn0gZnJvbSAnLi4vLi4vdHlwZXMvY29tbWFuZC5qcydcbmltcG9ydCB7XG4gIGNoZWNrT3ZlcmFnZUdhdGUsXG4gIGNvbmZpcm1PdmVyYWdlLFxuICBsYXVuY2hSZW1vdGVSZXZpZXcsXG59IGZyb20gJy4vcmV2aWV3UmVtb3RlLmpzJ1xuaW1wb3J0IHsgVWx0cmFyZXZpZXdPdmVyYWdlRGlhbG9nIH0gZnJvbSAnLi9VbHRyYXJldmlld092ZXJhZ2VEaWFsb2cuanMnXG5cbmZ1bmN0aW9uIGNvbnRlbnRCbG9ja3NUb1N0cmluZyhibG9ja3M6IENvbnRlbnRCbG9ja1BhcmFtW10pOiBzdHJpbmcge1xuICByZXR1cm4gYmxvY2tzXG4gICAgLm1hcChiID0+IChiLnR5cGUgPT09ICd0ZXh0JyA/IGIudGV4dCA6ICcnKSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLmpvaW4oJ1xcbicpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGxhdW5jaEFuZERvbmUoXG4gIGFyZ3M6IHN0cmluZyxcbiAgY29udGV4dDogUGFyYW1ldGVyczxMb2NhbEpTWENvbW1hbmRDYWxsPlsxXSxcbiAgb25Eb25lOiBMb2NhbEpTWENvbW1hbmRPbkRvbmUsXG4gIGJpbGxpbmdOb3RlOiBzdHJpbmcsXG4gIHNpZ25hbD86IEFib3J0U2lnbmFsLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGxhdW5jaFJlbW90ZVJldmlldyhhcmdzLCBjb250ZXh0LCBiaWxsaW5nTm90ZSlcbiAgLy8gVXNlciBoaXQgRXNjYXBlIGR1cmluZyB0aGUgfjVzIGxhdW5jaCDigJQgdGhlIGRpYWxvZyBhbHJlYWR5IHNob3dlZFxuICAvLyBcImNhbmNlbGxlZFwiIGFuZCB1bm1vdW50ZWQsIHNvIHNraXAgb25Eb25lICh3b3VsZCB3cml0ZSB0byBhIGRlYWRcbiAgLy8gdHJhbnNjcmlwdCBzbG90KSBhbmQgbGV0IHRoZSBjYWxsZXIgc2tpcCBjb25maXJtT3ZlcmFnZS5cbiAgaWYgKHNpZ25hbD8uYWJvcnRlZCkgcmV0dXJuXG4gIGlmIChyZXN1bHQpIHtcbiAgICBvbkRvbmUoY29udGVudEJsb2Nrc1RvU3RyaW5nKHJlc3VsdCksIHsgc2hvdWxkUXVlcnk6IHRydWUgfSlcbiAgfSBlbHNlIHtcbiAgICAvLyBQcmVjb25kaXRpb24gZmFpbHVyZXMgbm93IHJldHVybiBzcGVjaWZpYyBDb250ZW50QmxvY2tQYXJhbVtdIGFib3ZlLlxuICAgIC8vIG51bGwgb25seSByZWFjaGVzIGhlcmUgb24gdGVsZXBvcnQgZmFpbHVyZSAoUFIgbW9kZSkgb3Igbm9uLWdpdGh1YlxuICAgIC8vIHJlcG8g4oCUIGJvdGggYXJlIENDUi9yZXBvIGNvbm5lY3Rpdml0eSBpc3N1ZXMuXG4gICAgb25Eb25lKFxuICAgICAgJ1VsdHJhcmV2aWV3IGZhaWxlZCB0byBsYXVuY2ggdGhlIHJlbW90ZSBzZXNzaW9uLiBDaGVjayB0aGF0IHRoaXMgaXMgYSBHaXRIdWIgcmVwbyBhbmQgdHJ5IGFnYWluLicsXG4gICAgICB7IGRpc3BsYXk6ICdzeXN0ZW0nIH0sXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBjYWxsOiBMb2NhbEpTWENvbW1hbmRDYWxsID0gYXN5bmMgKG9uRG9uZSwgY29udGV4dCwgYXJncykgPT4ge1xuICBjb25zdCBnYXRlID0gYXdhaXQgY2hlY2tPdmVyYWdlR2F0ZSgpXG5cbiAgaWYgKGdhdGUua2luZCA9PT0gJ25vdC1lbmFibGVkJykge1xuICAgIG9uRG9uZShcbiAgICAgICdGcmVlIHVsdHJhcmV2aWV3cyB1c2VkLiBFbmFibGUgRXh0cmEgVXNhZ2UgYXQgaHR0cHM6Ly9jbGF1ZGUuYWkvc2V0dGluZ3MvYmlsbGluZyB0byBjb250aW51ZS4nLFxuICAgICAgeyBkaXNwbGF5OiAnc3lzdGVtJyB9LFxuICAgIClcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGdhdGUua2luZCA9PT0gJ2xvdy1iYWxhbmNlJykge1xuICAgIG9uRG9uZShcbiAgICAgIGBCYWxhbmNlIHRvbyBsb3cgdG8gbGF1bmNoIHVsdHJhcmV2aWV3ICgkJHtnYXRlLmF2YWlsYWJsZS50b0ZpeGVkKDIpfSBhdmFpbGFibGUsICQxMCBtaW5pbXVtKS4gVG9wIHVwIGF0IGh0dHBzOi8vY2xhdWRlLmFpL3NldHRpbmdzL2JpbGxpbmdgLFxuICAgICAgeyBkaXNwbGF5OiAnc3lzdGVtJyB9LFxuICAgIClcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGdhdGUua2luZCA9PT0gJ25lZWRzLWNvbmZpcm0nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxVbHRyYXJldmlld092ZXJhZ2VEaWFsb2dcbiAgICAgICAgb25Qcm9jZWVkPXthc3luYyBzaWduYWwgPT4ge1xuICAgICAgICAgIGF3YWl0IGxhdW5jaEFuZERvbmUoXG4gICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgIG9uRG9uZSxcbiAgICAgICAgICAgICcgVGhpcyByZXZpZXcgYmlsbHMgYXMgRXh0cmEgVXNhZ2UuJyxcbiAgICAgICAgICAgIHNpZ25hbCxcbiAgICAgICAgICApXG4gICAgICAgICAgLy8gT25seSBwZXJzaXN0IHRoZSBjb25maXJtYXRpb24gZmxhZyBhZnRlciBhIG5vbi1hYm9ydGVkIGxhdW5jaCDigJRcbiAgICAgICAgICAvLyBvdGhlcndpc2UgRXNjYXBlLWR1cmluZy1sYXVuY2ggd291bGQgbGVhdmUgdGhlIGZsYWcgc2V0IGFuZFxuICAgICAgICAgIC8vIHNraXAgdGhpcyBkaWFsb2cgb24gdGhlIG5leHQgYXR0ZW1wdC5cbiAgICAgICAgICBpZiAoIXNpZ25hbC5hYm9ydGVkKSBjb25maXJtT3ZlcmFnZSgpXG4gICAgICAgIH19XG4gICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkRvbmUoJ1VsdHJhcmV2aWV3IGNhbmNlbGxlZC4nLCB7IGRpc3BsYXk6ICdzeXN0ZW0nIH0pfVxuICAgICAgLz5cbiAgICApXG4gIH1cblxuICAvLyBnYXRlLmtpbmQgPT09ICdwcm9jZWVkJ1xuICBhd2FpdCBsYXVuY2hBbmREb25lKGFyZ3MsIGNvbnRleHQsIG9uRG9uZSwgZ2F0ZS5iaWxsaW5nTm90ZSlcbiAgcmV0dXJuIG51bGxcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsY0FBY0EsaUJBQWlCLFFBQVEseUNBQXlDO0FBQ2hGLE9BQU9DLEtBQUssTUFBTSxPQUFPO0FBQ3pCLGNBQ0VDLG1CQUFtQixFQUNuQkMscUJBQXFCLFFBQ2hCLHdCQUF3QjtBQUMvQixTQUNFQyxnQkFBZ0IsRUFDaEJDLGNBQWMsRUFDZEMsa0JBQWtCLFFBQ2IsbUJBQW1CO0FBQzFCLFNBQVNDLHdCQUF3QixRQUFRLCtCQUErQjtBQUV4RSxTQUFTQyxxQkFBcUJBLENBQUNDLE1BQU0sRUFBRVQsaUJBQWlCLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQztFQUNsRSxPQUFPUyxNQUFNLENBQ1ZDLEdBQUcsQ0FBQ0MsQ0FBQyxJQUFLQSxDQUFDLENBQUNDLElBQUksS0FBSyxNQUFNLEdBQUdELENBQUMsQ0FBQ0UsSUFBSSxHQUFHLEVBQUcsQ0FBQyxDQUMzQ0MsTUFBTSxDQUFDQyxPQUFPLENBQUMsQ0FDZkMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUNmO0FBRUEsZUFBZUMsYUFBYUEsQ0FDMUJDLElBQUksRUFBRSxNQUFNLEVBQ1pDLE9BQU8sRUFBRUMsVUFBVSxDQUFDbEIsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDM0NtQixNQUFNLEVBQUVsQixxQkFBcUIsRUFDN0JtQixXQUFXLEVBQUUsTUFBTSxFQUNuQkMsTUFBb0IsQ0FBYixFQUFFQyxXQUFXLENBQ3JCLEVBQUVDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNmLE1BQU1DLE1BQU0sR0FBRyxNQUFNcEIsa0JBQWtCLENBQUNZLElBQUksRUFBRUMsT0FBTyxFQUFFRyxXQUFXLENBQUM7RUFDbkU7RUFDQTtFQUNBO0VBQ0EsSUFBSUMsTUFBTSxFQUFFSSxPQUFPLEVBQUU7RUFDckIsSUFBSUQsTUFBTSxFQUFFO0lBQ1ZMLE1BQU0sQ0FBQ2IscUJBQXFCLENBQUNrQixNQUFNLENBQUMsRUFBRTtNQUFFRSxXQUFXLEVBQUU7SUFBSyxDQUFDLENBQUM7RUFDOUQsQ0FBQyxNQUFNO0lBQ0w7SUFDQTtJQUNBO0lBQ0FQLE1BQU0sQ0FDSixrR0FBa0csRUFDbEc7TUFBRVEsT0FBTyxFQUFFO0lBQVMsQ0FDdEIsQ0FBQztFQUNIO0FBQ0Y7QUFFQSxPQUFPLE1BQU1DLElBQUksRUFBRTVCLG1CQUFtQixHQUFHLE1BQUE0QixDQUFPVCxNQUFNLEVBQUVGLE9BQU8sRUFBRUQsSUFBSSxLQUFLO0VBQ3hFLE1BQU1hLElBQUksR0FBRyxNQUFNM0IsZ0JBQWdCLENBQUMsQ0FBQztFQUVyQyxJQUFJMkIsSUFBSSxDQUFDQyxJQUFJLEtBQUssYUFBYSxFQUFFO0lBQy9CWCxNQUFNLENBQ0osK0ZBQStGLEVBQy9GO01BQUVRLE9BQU8sRUFBRTtJQUFTLENBQ3RCLENBQUM7SUFDRCxPQUFPLElBQUk7RUFDYjtFQUVBLElBQUlFLElBQUksQ0FBQ0MsSUFBSSxLQUFLLGFBQWEsRUFBRTtJQUMvQlgsTUFBTSxDQUNKLDJDQUEyQ1UsSUFBSSxDQUFDRSxTQUFTLENBQUNDLE9BQU8sQ0FBQyxDQUFDLENBQUMsd0VBQXdFLEVBQzVJO01BQUVMLE9BQU8sRUFBRTtJQUFTLENBQ3RCLENBQUM7SUFDRCxPQUFPLElBQUk7RUFDYjtFQUVBLElBQUlFLElBQUksQ0FBQ0MsSUFBSSxLQUFLLGVBQWUsRUFBRTtJQUNqQyxPQUNFLENBQUMsd0JBQXdCLENBQ3ZCLFNBQVMsQ0FBQyxDQUFDLE1BQU1ULE1BQU0sSUFBSTtNQUN6QixNQUFNTixhQUFhLENBQ2pCQyxJQUFJLEVBQ0pDLE9BQU8sRUFDUEUsTUFBTSxFQUNOLG9DQUFvQyxFQUNwQ0UsTUFDRixDQUFDO01BQ0Q7TUFDQTtNQUNBO01BQ0EsSUFBSSxDQUFDQSxNQUFNLENBQUNJLE9BQU8sRUFBRXRCLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUNGLFFBQVEsQ0FBQyxDQUFDLE1BQU1nQixNQUFNLENBQUMsd0JBQXdCLEVBQUU7TUFBRVEsT0FBTyxFQUFFO0lBQVMsQ0FBQyxDQUFDLENBQUMsR0FDeEU7RUFFTjs7RUFFQTtFQUNBLE1BQU1aLGFBQWEsQ0FBQ0MsSUFBSSxFQUFFQyxPQUFPLEVBQUVFLE1BQU0sRUFBRVUsSUFBSSxDQUFDVCxXQUFXLENBQUM7RUFDNUQsT0FBTyxJQUFJO0FBQ2IsQ0FBQyIsImlnbm9yZUxpc3QiOltdfQ==
