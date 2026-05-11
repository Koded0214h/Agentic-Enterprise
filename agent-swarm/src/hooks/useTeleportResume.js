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
exports.useTeleportResume = useTeleportResume;
var compiler_runtime_1 = require("react/compiler-runtime");
var react_1 = require("react");
var state_js_1 = require("src/bootstrap/state.js");
var index_js_1 = require("src/services/analytics/index.js");
var errors_js_1 = require("../utils/errors.js");
var teleport_js_1 = require("../utils/teleport.js");
function useTeleportResume(source) {
    var _this = this;
    var $ = (0, compiler_runtime_1.c)(8);
    var _a = (0, react_1.useState)(false), isResuming = _a[0], setIsResuming = _a[1];
    var _b = (0, react_1.useState)(null), error = _b[0], setError = _b[1];
    var _d = (0, react_1.useState)(null), selectedSession = _d[0], setSelectedSession = _d[1];
    var t0;
    if ($[0] !== source) {
        t0 = function (session) { return __awaiter(_this, void 0, void 0, function () {
            var result, t1_1, err, teleportError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsResuming(true);
                        setError(null);
                        setSelectedSession(session);
                        (0, index_js_1.logEvent)("tengu_teleport_resume_session", {
                            source: source,
                            session_id: session.id
                        });
                        ;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, teleport_js_1.teleportResumeCodeSession)(session.id)];
                    case 2:
                        result = _a.sent();
                        (0, state_js_1.setTeleportedSessionInfo)({
                            sessionId: session.id
                        });
                        setIsResuming(false);
                        return [2 /*return*/, result];
                    case 3:
                        t1_1 = _a.sent();
                        err = t1_1;
                        teleportError = {
                            message: err instanceof errors_js_1.TeleportOperationError ? err.message : (0, errors_js_1.errorMessage)(err),
                            formattedMessage: err instanceof errors_js_1.TeleportOperationError ? err.formattedMessage : undefined,
                            isOperationError: err instanceof errors_js_1.TeleportOperationError
                        };
                        setError(teleportError);
                        setIsResuming(false);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        $[0] = source;
        $[1] = t0;
    }
    else {
        t0 = $[1];
    }
    var resumeSession = t0;
    var t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = function () {
            setError(null);
        };
        $[2] = t1;
    }
    else {
        t1 = $[2];
    }
    var clearError = t1;
    var t2;
    if ($[3] !== error || $[4] !== isResuming || $[5] !== resumeSession || $[6] !== selectedSession) {
        t2 = {
            resumeSession: resumeSession,
            isResuming: isResuming,
            error: error,
            selectedSession: selectedSession,
            clearError: clearError
        };
        $[3] = error;
        $[4] = isResuming;
        $[5] = resumeSession;
        $[6] = selectedSession;
        $[7] = t2;
    }
    else {
        t2 = $[7];
    }
    return t2;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VDYWxsYmFjayIsInVzZVN0YXRlIiwic2V0VGVsZXBvcnRlZFNlc3Npb25JbmZvIiwiQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyIsImxvZ0V2ZW50IiwiVGVsZXBvcnRSZW1vdGVSZXNwb25zZSIsIkNvZGVTZXNzaW9uIiwiZXJyb3JNZXNzYWdlIiwiVGVsZXBvcnRPcGVyYXRpb25FcnJvciIsInRlbGVwb3J0UmVzdW1lQ29kZVNlc3Npb24iLCJUZWxlcG9ydFJlc3VtZUVycm9yIiwibWVzc2FnZSIsImZvcm1hdHRlZE1lc3NhZ2UiLCJpc09wZXJhdGlvbkVycm9yIiwiVGVsZXBvcnRTb3VyY2UiLCJ1c2VUZWxlcG9ydFJlc3VtZSIsInNvdXJjZSIsIiQiLCJfYyIsImlzUmVzdW1pbmciLCJzZXRJc1Jlc3VtaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsInNlbGVjdGVkU2Vzc2lvbiIsInNldFNlbGVjdGVkU2Vzc2lvbiIsInQwIiwic2Vzc2lvbiIsInNlc3Npb25faWQiLCJpZCIsInJlc3VsdCIsInNlc3Npb25JZCIsInQxIiwiZXJyIiwidGVsZXBvcnRFcnJvciIsInVuZGVmaW5lZCIsInJlc3VtZVNlc3Npb24iLCJTeW1ib2wiLCJmb3IiLCJjbGVhckVycm9yIiwidDIiXSwic291cmNlcyI6WyJ1c2VUZWxlcG9ydFJlc3VtZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlQ2FsbGJhY2ssIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBzZXRUZWxlcG9ydGVkU2Vzc2lvbkluZm8gfSBmcm9tICdzcmMvYm9vdHN0cmFwL3N0YXRlLmpzJ1xuaW1wb3J0IHtcbiAgdHlwZSBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICBsb2dFdmVudCxcbn0gZnJvbSAnc3JjL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB0eXBlIHsgVGVsZXBvcnRSZW1vdGVSZXNwb25zZSB9IGZyb20gJ3NyYy91dGlscy9jb252ZXJzYXRpb25SZWNvdmVyeS5qcydcbmltcG9ydCB0eXBlIHsgQ29kZVNlc3Npb24gfSBmcm9tICdzcmMvdXRpbHMvdGVsZXBvcnQvYXBpLmpzJ1xuaW1wb3J0IHsgZXJyb3JNZXNzYWdlLCBUZWxlcG9ydE9wZXJhdGlvbkVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzLmpzJ1xuaW1wb3J0IHsgdGVsZXBvcnRSZXN1bWVDb2RlU2Vzc2lvbiB9IGZyb20gJy4uL3V0aWxzL3RlbGVwb3J0LmpzJ1xuXG5leHBvcnQgdHlwZSBUZWxlcG9ydFJlc3VtZUVycm9yID0ge1xuICBtZXNzYWdlOiBzdHJpbmdcbiAgZm9ybWF0dGVkTWVzc2FnZT86IHN0cmluZ1xuICBpc09wZXJhdGlvbkVycm9yOiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIFRlbGVwb3J0U291cmNlID0gJ2NsaUFyZycgfCAnbG9jYWxDb21tYW5kJ1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlVGVsZXBvcnRSZXN1bWUoc291cmNlOiBUZWxlcG9ydFNvdXJjZSkge1xuICBjb25zdCBbaXNSZXN1bWluZywgc2V0SXNSZXN1bWluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxUZWxlcG9ydFJlc3VtZUVycm9yIHwgbnVsbD4obnVsbClcbiAgY29uc3QgW3NlbGVjdGVkU2Vzc2lvbiwgc2V0U2VsZWN0ZWRTZXNzaW9uXSA9IHVzZVN0YXRlPENvZGVTZXNzaW9uIHwgbnVsbD4oXG4gICAgbnVsbCxcbiAgKVxuXG4gIGNvbnN0IHJlc3VtZVNlc3Npb24gPSB1c2VDYWxsYmFjayhcbiAgICBhc3luYyAoc2Vzc2lvbjogQ29kZVNlc3Npb24pOiBQcm9taXNlPFRlbGVwb3J0UmVtb3RlUmVzcG9uc2UgfCBudWxsPiA9PiB7XG4gICAgICBzZXRJc1Jlc3VtaW5nKHRydWUpXG4gICAgICBzZXRFcnJvcihudWxsKVxuICAgICAgc2V0U2VsZWN0ZWRTZXNzaW9uKHNlc3Npb24pXG5cbiAgICAgIC8vIExvZyB0ZWxlcG9ydCBzZXNzaW9uIHNlbGVjdGlvblxuICAgICAgbG9nRXZlbnQoJ3Rlbmd1X3RlbGVwb3J0X3Jlc3VtZV9zZXNzaW9uJywge1xuICAgICAgICBzb3VyY2U6XG4gICAgICAgICAgc291cmNlIGFzIEFuYWx5dGljc01ldGFkYXRhX0lfVkVSSUZJRURfVEhJU19JU19OT1RfQ09ERV9PUl9GSUxFUEFUSFMsXG4gICAgICAgIHNlc3Npb25faWQ6XG4gICAgICAgICAgc2Vzc2lvbi5pZCBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgICAgfSlcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGVsZXBvcnRSZXN1bWVDb2RlU2Vzc2lvbihzZXNzaW9uLmlkKVxuICAgICAgICAvLyBUcmFjayB0ZWxlcG9ydGVkIHNlc3Npb24gZm9yIHJlbGlhYmlsaXR5IGxvZ2dpbmdcbiAgICAgICAgc2V0VGVsZXBvcnRlZFNlc3Npb25JbmZvKHsgc2Vzc2lvbklkOiBzZXNzaW9uLmlkIH0pXG4gICAgICAgIHNldElzUmVzdW1pbmcoZmFsc2UpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zdCB0ZWxlcG9ydEVycm9yOiBUZWxlcG9ydFJlc3VtZUVycm9yID0ge1xuICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICBlcnIgaW5zdGFuY2VvZiBUZWxlcG9ydE9wZXJhdGlvbkVycm9yXG4gICAgICAgICAgICAgID8gZXJyLm1lc3NhZ2VcbiAgICAgICAgICAgICAgOiBlcnJvck1lc3NhZ2UoZXJyKSxcbiAgICAgICAgICBmb3JtYXR0ZWRNZXNzYWdlOlxuICAgICAgICAgICAgZXJyIGluc3RhbmNlb2YgVGVsZXBvcnRPcGVyYXRpb25FcnJvclxuICAgICAgICAgICAgICA/IGVyci5mb3JtYXR0ZWRNZXNzYWdlXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIGlzT3BlcmF0aW9uRXJyb3I6IGVyciBpbnN0YW5jZW9mIFRlbGVwb3J0T3BlcmF0aW9uRXJyb3IsXG4gICAgICAgIH1cbiAgICAgICAgc2V0RXJyb3IodGVsZXBvcnRFcnJvcilcbiAgICAgICAgc2V0SXNSZXN1bWluZyhmYWxzZSlcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICB9LFxuICAgIFtzb3VyY2VdLFxuICApXG5cbiAgY29uc3QgY2xlYXJFcnJvciA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRFcnJvcihudWxsKVxuICB9LCBbXSlcblxuICByZXR1cm4ge1xuICAgIHJlc3VtZVNlc3Npb24sXG4gICAgaXNSZXN1bWluZyxcbiAgICBlcnJvcixcbiAgICBzZWxlY3RlZFNlc3Npb24sXG4gICAgY2xlYXJFcnJvcixcbiAgfVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUEsU0FBU0EsV0FBVyxFQUFFQyxRQUFRLFFBQVEsT0FBTztBQUM3QyxTQUFTQyx3QkFBd0IsUUFBUSx3QkFBd0I7QUFDakUsU0FDRSxLQUFLQywwREFBMEQsRUFDL0RDLFFBQVEsUUFDSCxpQ0FBaUM7QUFDeEMsY0FBY0Msc0JBQXNCLFFBQVEsbUNBQW1DO0FBQy9FLGNBQWNDLFdBQVcsUUFBUSwyQkFBMkI7QUFDNUQsU0FBU0MsWUFBWSxFQUFFQyxzQkFBc0IsUUFBUSxvQkFBb0I7QUFDekUsU0FBU0MseUJBQXlCLFFBQVEsc0JBQXNCO0FBRWhFLE9BQU8sS0FBS0MsbUJBQW1CLEdBQUc7RUFDaENDLE9BQU8sRUFBRSxNQUFNO0VBQ2ZDLGdCQUFnQixDQUFDLEVBQUUsTUFBTTtFQUN6QkMsZ0JBQWdCLEVBQUUsT0FBTztBQUMzQixDQUFDO0FBRUQsT0FBTyxLQUFLQyxjQUFjLEdBQUcsUUFBUSxHQUFHLGNBQWM7QUFFdEQsT0FBTyxT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
