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
exports.useSurveyState = useSurveyState;
var crypto_1 = require("crypto");
var react_1 = require("react");
function useSurveyState(_a) {
    var _this = this;
    var hideThanksAfterMs = _a.hideThanksAfterMs, onOpen = _a.onOpen, onSelect = _a.onSelect, shouldShowTranscriptPrompt = _a.shouldShowTranscriptPrompt, onTranscriptPromptShown = _a.onTranscriptPromptShown, onTranscriptSelect = _a.onTranscriptSelect;
    var _b = (0, react_1.useState)('closed'), state = _b[0], setState = _b[1];
    var _c = (0, react_1.useState)(null), lastResponse = _c[0], setLastResponse = _c[1];
    var appearanceId = (0, react_1.useRef)((0, crypto_1.randomUUID)());
    var lastResponseRef = (0, react_1.useRef)(null);
    var showThanksThenClose = (0, react_1.useCallback)(function () {
        setState('thanks');
        setTimeout(function (setState_0, setLastResponse_0) {
            setState_0('closed');
            setLastResponse_0(null);
        }, hideThanksAfterMs, setState, setLastResponse);
    }, [hideThanksAfterMs]);
    var showSubmittedThenClose = (0, react_1.useCallback)(function () {
        setState('submitted');
        setTimeout(setState, hideThanksAfterMs, 'closed');
    }, [hideThanksAfterMs]);
    var open = (0, react_1.useCallback)(function () {
        if (state !== 'closed') {
            return;
        }
        setState('open');
        appearanceId.current = (0, crypto_1.randomUUID)();
        void onOpen(appearanceId.current);
    }, [state, onOpen]);
    var handleSelect = (0, react_1.useCallback)(function (selected) {
        setLastResponse(selected);
        lastResponseRef.current = selected;
        // Always fire the survey response event first
        void onSelect(appearanceId.current, selected);
        if (selected === 'dismissed') {
            setState('closed');
            setLastResponse(null);
        }
        else if (shouldShowTranscriptPrompt === null || shouldShowTranscriptPrompt === void 0 ? void 0 : shouldShowTranscriptPrompt(selected)) {
            setState('transcript_prompt');
            onTranscriptPromptShown === null || onTranscriptPromptShown === void 0 ? void 0 : onTranscriptPromptShown(appearanceId.current, selected);
            return true;
        }
        else {
            showThanksThenClose();
        }
        return false;
    }, [showThanksThenClose, onSelect, shouldShowTranscriptPrompt, onTranscriptPromptShown]);
    var handleTranscriptSelect = (0, react_1.useCallback)(function (selected_0) {
        switch (selected_0) {
            case 'yes':
                setState('submitting');
                void (function () { return __awaiter(_this, void 0, void 0, function () {
                    var success, _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, (onTranscriptSelect === null || onTranscriptSelect === void 0 ? void 0 : onTranscriptSelect(appearanceId.current, selected_0, lastResponseRef.current))];
                            case 1:
                                success = _b.sent();
                                if (success) {
                                    showSubmittedThenClose();
                                }
                                else {
                                    showThanksThenClose();
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                _a = _b.sent();
                                showThanksThenClose();
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })();
                break;
            case 'no':
            case 'dont_ask_again':
                void (onTranscriptSelect === null || onTranscriptSelect === void 0 ? void 0 : onTranscriptSelect(appearanceId.current, selected_0, lastResponseRef.current));
                showThanksThenClose();
                break;
        }
    }, [showThanksThenClose, showSubmittedThenClose, onTranscriptSelect]);
    return {
        state: state,
        lastResponse: lastResponse,
        open: open,
        handleSelect: handleSelect,
        handleTranscriptSelect: handleTranscriptSelect
    };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyYW5kb21VVUlEIiwidXNlQ2FsbGJhY2siLCJ1c2VSZWYiLCJ1c2VTdGF0ZSIsIlRyYW5zY3JpcHRTaGFyZVJlc3BvbnNlIiwiRmVlZGJhY2tTdXJ2ZXlSZXNwb25zZSIsIlN1cnZleVN0YXRlIiwiVXNlU3VydmV5U3RhdGVPcHRpb25zIiwiaGlkZVRoYW5rc0FmdGVyTXMiLCJvbk9wZW4iLCJhcHBlYXJhbmNlSWQiLCJQcm9taXNlIiwib25TZWxlY3QiLCJzZWxlY3RlZCIsInNob3VsZFNob3dUcmFuc2NyaXB0UHJvbXB0Iiwib25UcmFuc2NyaXB0UHJvbXB0U2hvd24iLCJzdXJ2ZXlSZXNwb25zZSIsIm9uVHJhbnNjcmlwdFNlbGVjdCIsInVzZVN1cnZleVN0YXRlIiwic3RhdGUiLCJsYXN0UmVzcG9uc2UiLCJvcGVuIiwiaGFuZGxlU2VsZWN0IiwiaGFuZGxlVHJhbnNjcmlwdFNlbGVjdCIsInNldFN0YXRlIiwic2V0TGFzdFJlc3BvbnNlIiwibGFzdFJlc3BvbnNlUmVmIiwic2hvd1RoYW5rc1RoZW5DbG9zZSIsInNldFRpbWVvdXQiLCJzaG93U3VibWl0dGVkVGhlbkNsb3NlIiwiY3VycmVudCIsInN1Y2Nlc3MiXSwic291cmNlcyI6WyJ1c2VTdXJ2ZXlTdGF0ZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmFuZG9tVVVJRCB9IGZyb20gJ2NyeXB0bydcbmltcG9ydCB7IHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgdHlwZSB7IFRyYW5zY3JpcHRTaGFyZVJlc3BvbnNlIH0gZnJvbSAnLi9UcmFuc2NyaXB0U2hhcmVQcm9tcHQuanMnXG5pbXBvcnQgdHlwZSB7IEZlZWRiYWNrU3VydmV5UmVzcG9uc2UgfSBmcm9tICcuL3V0aWxzLmpzJ1xuXG50eXBlIFN1cnZleVN0YXRlID1cbiAgfCAnY2xvc2VkJ1xuICB8ICdvcGVuJ1xuICB8ICd0aGFua3MnXG4gIHwgJ3RyYW5zY3JpcHRfcHJvbXB0J1xuICB8ICdzdWJtaXR0aW5nJ1xuICB8ICdzdWJtaXR0ZWQnXG5cbnR5cGUgVXNlU3VydmV5U3RhdGVPcHRpb25zID0ge1xuICBoaWRlVGhhbmtzQWZ0ZXJNczogbnVtYmVyXG4gIG9uT3BlbjogKGFwcGVhcmFuY2VJZDogc3RyaW5nKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPlxuICBvblNlbGVjdDogKFxuICAgIGFwcGVhcmFuY2VJZDogc3RyaW5nLFxuICAgIHNlbGVjdGVkOiBGZWVkYmFja1N1cnZleVJlc3BvbnNlLFxuICApID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+XG4gIHNob3VsZFNob3dUcmFuc2NyaXB0UHJvbXB0PzogKHNlbGVjdGVkOiBGZWVkYmFja1N1cnZleVJlc3BvbnNlKSA9PiBib29sZWFuXG4gIG9uVHJhbnNjcmlwdFByb21wdFNob3duPzogKFxuICAgIGFwcGVhcmFuY2VJZDogc3RyaW5nLFxuICAgIHN1cnZleVJlc3BvbnNlOiBGZWVkYmFja1N1cnZleVJlc3BvbnNlLFxuICApID0+IHZvaWRcbiAgb25UcmFuc2NyaXB0U2VsZWN0PzogKFxuICAgIGFwcGVhcmFuY2VJZDogc3RyaW5nLFxuICAgIHNlbGVjdGVkOiBUcmFuc2NyaXB0U2hhcmVSZXNwb25zZSxcbiAgICBzdXJ2ZXlSZXNwb25zZTogRmVlZGJhY2tTdXJ2ZXlSZXNwb25zZSB8IG51bGwsXG4gICkgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVN1cnZleVN0YXRlKHtcbiAgaGlkZVRoYW5rc0FmdGVyTXMsXG4gIG9uT3BlbixcbiAgb25TZWxlY3QsXG4gIHNob3VsZFNob3dUcmFuc2NyaXB0UHJvbXB0LFxuICBvblRyYW5zY3JpcHRQcm9tcHRTaG93bixcbiAgb25UcmFuc2NyaXB0U2VsZWN0LFxufTogVXNlU3VydmV5U3RhdGVPcHRpb25zKToge1xuICBzdGF0ZTogU3VydmV5U3RhdGVcbiAgbGFzdFJlc3BvbnNlOiBGZWVkYmFja1N1cnZleVJlc3BvbnNlIHwgbnVsbFxuICBvcGVuOiAoKSA9PiB2b2lkXG4gIGhhbmRsZVNlbGVjdDogKHNlbGVjdGVkOiBGZWVkYmFja1N1cnZleVJlc3BvbnNlKSA9PiBib29sZWFuXG4gIGhhbmRsZVRyYW5zY3JpcHRTZWxlY3Q6IChzZWxlY3RlZDogVHJhbnNjcmlwdFNoYXJlUmVzcG9uc2UpID0+IHZvaWRcbn0ge1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPFN1cnZleVN0YXRlPignY2xvc2VkJylcbiAgY29uc3QgW2xhc3RSZXNwb25zZSwgc2V0TGFzdFJlc3BvbnNlXSA9XG4gICAgdXNlU3RhdGU8RmVlZGJhY2tTdXJ2ZXlSZXNwb25zZSB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGFwcGVhcmFuY2VJZCA9IHVzZVJlZihyYW5kb21VVUlEKCkpXG4gIGNvbnN0IGxhc3RSZXNwb25zZVJlZiA9IHVzZVJlZjxGZWVkYmFja1N1cnZleVJlc3BvbnNlIHwgbnVsbD4obnVsbClcblxuICBjb25zdCBzaG93VGhhbmtzVGhlbkNsb3NlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKCd0aGFua3MnKVxuICAgIHNldFRpbWVvdXQoXG4gICAgICAoc2V0U3RhdGUsIHNldExhc3RSZXNwb25zZSkgPT4ge1xuICAgICAgICBzZXRTdGF0ZSgnY2xvc2VkJylcbiAgICAgICAgc2V0TGFzdFJlc3BvbnNlKG51bGwpXG4gICAgICB9LFxuICAgICAgaGlkZVRoYW5rc0FmdGVyTXMsXG4gICAgICBzZXRTdGF0ZSxcbiAgICAgIHNldExhc3RSZXNwb25zZSxcbiAgICApXG4gIH0sIFtoaWRlVGhhbmtzQWZ0ZXJNc10pXG5cbiAgY29uc3Qgc2hvd1N1Ym1pdHRlZFRoZW5DbG9zZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgnc3VibWl0dGVkJylcbiAgICBzZXRUaW1lb3V0KHNldFN0YXRlLCBoaWRlVGhhbmtzQWZ0ZXJNcywgJ2Nsb3NlZCcpXG4gIH0sIFtoaWRlVGhhbmtzQWZ0ZXJNc10pXG5cbiAgY29uc3Qgb3BlbiA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoc3RhdGUgIT09ICdjbG9zZWQnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0U3RhdGUoJ29wZW4nKVxuICAgIGFwcGVhcmFuY2VJZC5jdXJyZW50ID0gcmFuZG9tVVVJRCgpXG4gICAgdm9pZCBvbk9wZW4oYXBwZWFyYW5jZUlkLmN1cnJlbnQpXG4gIH0sIFtzdGF0ZSwgb25PcGVuXSlcblxuICBjb25zdCBoYW5kbGVTZWxlY3QgPSB1c2VDYWxsYmFjayhcbiAgICAoc2VsZWN0ZWQ6IEZlZWRiYWNrU3VydmV5UmVzcG9uc2UpOiBib29sZWFuID0+IHtcbiAgICAgIHNldExhc3RSZXNwb25zZShzZWxlY3RlZClcbiAgICAgIGxhc3RSZXNwb25zZVJlZi5jdXJyZW50ID0gc2VsZWN0ZWRcbiAgICAgIC8vIEFsd2F5cyBmaXJlIHRoZSBzdXJ2ZXkgcmVzcG9uc2UgZXZlbnQgZmlyc3RcbiAgICAgIHZvaWQgb25TZWxlY3QoYXBwZWFyYW5jZUlkLmN1cnJlbnQsIHNlbGVjdGVkKVxuXG4gICAgICBpZiAoc2VsZWN0ZWQgPT09ICdkaXNtaXNzZWQnKSB7XG4gICAgICAgIHNldFN0YXRlKCdjbG9zZWQnKVxuICAgICAgICBzZXRMYXN0UmVzcG9uc2UobnVsbClcbiAgICAgIH0gZWxzZSBpZiAoc2hvdWxkU2hvd1RyYW5zY3JpcHRQcm9tcHQ/LihzZWxlY3RlZCkpIHtcbiAgICAgICAgc2V0U3RhdGUoJ3RyYW5zY3JpcHRfcHJvbXB0JylcbiAgICAgICAgb25UcmFuc2NyaXB0UHJvbXB0U2hvd24/LihhcHBlYXJhbmNlSWQuY3VycmVudCwgc2VsZWN0ZWQpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaG93VGhhbmtzVGhlbkNsb3NlKClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0sXG4gICAgW1xuICAgICAgc2hvd1RoYW5rc1RoZW5DbG9zZSxcbiAgICAgIG9uU2VsZWN0LFxuICAgICAgc2hvdWxkU2hvd1RyYW5zY3JpcHRQcm9tcHQsXG4gICAgICBvblRyYW5zY3JpcHRQcm9tcHRTaG93bixcbiAgICBdLFxuICApXG5cbiAgY29uc3QgaGFuZGxlVHJhbnNjcmlwdFNlbGVjdCA9IHVzZUNhbGxiYWNrKFxuICAgIChzZWxlY3RlZDogVHJhbnNjcmlwdFNoYXJlUmVzcG9uc2UpID0+IHtcbiAgICAgIHN3aXRjaCAoc2VsZWN0ZWQpIHtcbiAgICAgICAgY2FzZSAneWVzJzpcbiAgICAgICAgICBzZXRTdGF0ZSgnc3VibWl0dGluZycpXG4gICAgICAgICAgdm9pZCAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IG9uVHJhbnNjcmlwdFNlbGVjdD8uKFxuICAgICAgICAgICAgICAgIGFwcGVhcmFuY2VJZC5jdXJyZW50LFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGxhc3RSZXNwb25zZVJlZi5jdXJyZW50LFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgc2hvd1N1Ym1pdHRlZFRoZW5DbG9zZSgpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd1RoYW5rc1RoZW5DbG9zZSgpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgICBzaG93VGhhbmtzVGhlbkNsb3NlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAnbm8nOlxuICAgICAgICBjYXNlICdkb250X2Fza19hZ2Fpbic6XG4gICAgICAgICAgdm9pZCBvblRyYW5zY3JpcHRTZWxlY3Q/LihcbiAgICAgICAgICAgIGFwcGVhcmFuY2VJZC5jdXJyZW50LFxuICAgICAgICAgICAgc2VsZWN0ZWQsXG4gICAgICAgICAgICBsYXN0UmVzcG9uc2VSZWYuY3VycmVudCxcbiAgICAgICAgICApXG4gICAgICAgICAgc2hvd1RoYW5rc1RoZW5DbG9zZSgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9LFxuICAgIFtzaG93VGhhbmtzVGhlbkNsb3NlLCBzaG93U3VibWl0dGVkVGhlbkNsb3NlLCBvblRyYW5zY3JpcHRTZWxlY3RdLFxuICApXG5cbiAgcmV0dXJuIHsgc3RhdGUsIGxhc3RSZXNwb25zZSwgb3BlbiwgaGFuZGxlU2VsZWN0LCBoYW5kbGVUcmFuc2NyaXB0U2VsZWN0IH1cbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsVUFBVSxRQUFRLFFBQVE7QUFDbkMsU0FBU0MsV0FBVyxFQUFFQyxNQUFNLEVBQUVDLFFBQVEsUUFBUSxPQUFPO0FBQ3JELGNBQWNDLHVCQUF1QixRQUFRLDRCQUE0QjtBQUN6RSxjQUFjQyxzQkFBc0IsUUFBUSxZQUFZO0FBRXhELEtBQUtDLFdBQVcsR0FDWixRQUFRLEdBQ1IsTUFBTSxHQUNOLFFBQVEsR0FDUixtQkFBbUIsR0FDbkIsWUFBWSxHQUNaLFdBQVc7QUFFZixLQUFLQyxxQkFBcUIsR0FBRztFQUMzQkMsaUJBQWlCLEVBQUUsTUFBTTtFQUN6QkMsTUFBTSxFQUFFLENBQUNDLFlBQVksRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDdERDLFFBQVEsRUFBRSxDQUNSRixZQUFZLEVBQUUsTUFBTSxFQUNwQkcsUUFBUSxFQUFFUixzQkFBc0IsRUFDaEMsR0FBRyxJQUFJLEdBQUdNLE9BQU8sQ0FBQyxJQUFJLENBQUM7RUFDekJHLDBCQUEwQixDQUFDLEVBQUUsQ0FBQ0QsUUFBUSxFQUFFUixzQkFBc0IsRUFBRSxHQUFHLE9BQU87RUFDMUVVLHVCQUF1QixDQUFDLEVBQUUsQ0FDeEJMLFlBQVksRUFBRSxNQUFNLEVBQ3BCTSxjQUFjLEVBQUVYLHNCQUFzQixFQUN0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
