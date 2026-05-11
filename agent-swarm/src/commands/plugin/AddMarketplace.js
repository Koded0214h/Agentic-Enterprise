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
exports.AddMarketplace = AddMarketplace;
var React = require("react");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var ConfigurableShortcutHint_js_1 = require("../../components/ConfigurableShortcutHint.js");
var Byline_js_1 = require("../../components/design-system/Byline.js");
var KeyboardShortcutHint_js_1 = require("../../components/design-system/KeyboardShortcutHint.js");
var Spinner_js_1 = require("../../components/Spinner.js");
var TextInput_js_1 = require("../../components/TextInput.js");
var ink_js_1 = require("../../ink.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var cacheUtils_js_1 = require("../../utils/plugins/cacheUtils.js");
var marketplaceManager_js_1 = require("../../utils/plugins/marketplaceManager.js");
var parseMarketplaceInput_js_1 = require("../../utils/plugins/parseMarketplaceInput.js");
function AddMarketplace(_a) {
    var _this = this;
    var inputValue = _a.inputValue, setInputValue = _a.setInputValue, cursorOffset = _a.cursorOffset, setCursorOffset = _a.setCursorOffset, error = _a.error, setError = _a.setError, result = _a.result, setResult = _a.setResult, setViewState = _a.setViewState, onAddComplete = _a.onAddComplete, _b = _a.cliMode, cliMode = _b === void 0 ? false : _b;
    var hasAttemptedAutoAdd = (0, react_1.useRef)(false);
    var _c = (0, react_1.useState)(false), isLoading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(''), progressMessage = _d[0], setProgressMessage = _d[1];
    var handleAdd = function () { return __awaiter(_this, void 0, void 0, function () {
        var input, parsed, _a, name_1, resolvedSource, sourceType, err_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    input = inputValue.trim();
                    if (!input) {
                        setError('Please enter a marketplace source');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, parseMarketplaceInput_js_1.parseMarketplaceInput)(input)];
                case 1:
                    parsed = _b.sent();
                    if (!parsed) {
                        setError('Invalid marketplace source format. Try: owner/repo, https://..., or ./path');
                        return [2 /*return*/];
                    }
                    // Check if parseMarketplaceInput returned an error
                    if ('error' in parsed) {
                        setError(parsed.error);
                        return [2 /*return*/];
                    }
                    setError(null);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    setLoading(true);
                    setProgressMessage('');
                    return [4 /*yield*/, (0, marketplaceManager_js_1.addMarketplaceSource)(parsed, function (message) {
                            setProgressMessage(message);
                        })];
                case 3:
                    _a = _b.sent(), name_1 = _a.name, resolvedSource = _a.resolvedSource;
                    (0, marketplaceManager_js_1.saveMarketplaceToSettings)(name_1, {
                        source: resolvedSource
                    });
                    (0, cacheUtils_js_1.clearAllCaches)();
                    sourceType = parsed.source;
                    if (parsed.source === 'github') {
                        sourceType = parsed.repo;
                    }
                    (0, index_js_1.logEvent)('tengu_marketplace_added', {
                        source_type: sourceType
                    });
                    if (!onAddComplete) return [3 /*break*/, 5];
                    return [4 /*yield*/, onAddComplete()];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    setProgressMessage('');
                    setLoading(false);
                    if (cliMode) {
                        // In CLI mode, set result to trigger completion
                        setResult("Successfully added marketplace: ".concat(name_1));
                    }
                    else {
                        // In interactive mode, switch to browse view
                        setViewState({
                            type: 'browse-marketplace',
                            targetMarketplace: name_1
                        });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _b.sent();
                    error_1 = (0, errors_js_1.toError)(err_1);
                    (0, log_js_1.logError)(error_1);
                    setError(error_1.message);
                    setProgressMessage('');
                    setLoading(false);
                    if (cliMode) {
                        // In CLI mode, set result with error to trigger completion
                        setResult("Error: ".concat(error_1.message));
                    }
                    else {
                        setResult(null);
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Auto-add if inputValue is provided
    (0, react_1.useEffect)(function () {
        if (inputValue && !hasAttemptedAutoAdd.current && !error && !result) {
            hasAttemptedAutoAdd.current = true;
            void handleAdd();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
    }, []); // Only run once on mount
    return <ink_js_1.Box flexDirection="column">
      <ink_js_1.Box flexDirection="column" paddingX={1} borderStyle="round">
        <ink_js_1.Box marginBottom={1}>
          <ink_js_1.Text bold>Add Marketplace</ink_js_1.Text>
        </ink_js_1.Box>
        <ink_js_1.Box flexDirection="column">
          <ink_js_1.Text>Enter marketplace source:</ink_js_1.Text>
          <ink_js_1.Text dimColor>Examples:</ink_js_1.Text>
          <ink_js_1.Text dimColor> · owner/repo (GitHub)</ink_js_1.Text>
          <ink_js_1.Text dimColor> · git@github.com:owner/repo.git (SSH)</ink_js_1.Text>
          <ink_js_1.Text dimColor> · https://example.com/marketplace.json</ink_js_1.Text>
          <ink_js_1.Text dimColor> · ./path/to/marketplace</ink_js_1.Text>
          <ink_js_1.Box marginTop={1}>
            <TextInput_js_1.default value={inputValue} onChange={setInputValue} onSubmit={handleAdd} columns={80} cursorOffset={cursorOffset} onChangeCursorOffset={setCursorOffset} focus showCursor/>
          </ink_js_1.Box>
        </ink_js_1.Box>
        {isLoading && <ink_js_1.Box marginTop={1}>
            <Spinner_js_1.Spinner />
            <ink_js_1.Text>
              {progressMessage || 'Adding marketplace to configuration…'}
            </ink_js_1.Text>
          </ink_js_1.Box>}
        {error && <ink_js_1.Box marginTop={1}>
            <ink_js_1.Text color="error">{error}</ink_js_1.Text>
          </ink_js_1.Box>}
        {result && <ink_js_1.Box marginTop={1}>
            <ink_js_1.Text>{result}</ink_js_1.Text>
          </ink_js_1.Box>}
      </ink_js_1.Box>
      <ink_js_1.Box marginLeft={3}>
        <ink_js_1.Text dimColor italic>
          <Byline_js_1.Byline>
            <KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut="Enter" action="add"/>
            <ConfigurableShortcutHint_js_1.ConfigurableShortcutHint action="confirm:no" context="Settings" fallback="Esc" description="cancel"/>
          </Byline_js_1.Byline>
        </ink_js_1.Text>
      </ink_js_1.Box>
    </ink_js_1.Box>;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsInVzZUVmZmVjdCIsInVzZVJlZiIsInVzZVN0YXRlIiwiQW5hbHl0aWNzTWV0YWRhdGFfSV9WRVJJRklFRF9USElTX0lTX05PVF9DT0RFX09SX0ZJTEVQQVRIUyIsImxvZ0V2ZW50IiwiQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50IiwiQnlsaW5lIiwiS2V5Ym9hcmRTaG9ydGN1dEhpbnQiLCJTcGlubmVyIiwiVGV4dElucHV0IiwiQm94IiwiVGV4dCIsInRvRXJyb3IiLCJsb2dFcnJvciIsImNsZWFyQWxsQ2FjaGVzIiwiYWRkTWFya2V0cGxhY2VTb3VyY2UiLCJzYXZlTWFya2V0cGxhY2VUb1NldHRpbmdzIiwicGFyc2VNYXJrZXRwbGFjZUlucHV0IiwiVmlld1N0YXRlIiwiUHJvcHMiLCJpbnB1dFZhbHVlIiwic2V0SW5wdXRWYWx1ZSIsInZhbHVlIiwiY3Vyc29yT2Zmc2V0Iiwic2V0Q3Vyc29yT2Zmc2V0Iiwib2Zmc2V0IiwiZXJyb3IiLCJzZXRFcnJvciIsInJlc3VsdCIsInNldFJlc3VsdCIsInNldFZpZXdTdGF0ZSIsInN0YXRlIiwib25BZGRDb21wbGV0ZSIsIlByb21pc2UiLCJjbGlNb2RlIiwiQWRkTWFya2V0cGxhY2UiLCJSZWFjdE5vZGUiLCJoYXNBdHRlbXB0ZWRBdXRvQWRkIiwiaXNMb2FkaW5nIiwic2V0TG9hZGluZyIsInByb2dyZXNzTWVzc2FnZSIsInNldFByb2dyZXNzTWVzc2FnZSIsImhhbmRsZUFkZCIsImlucHV0IiwidHJpbSIsInBhcnNlZCIsIm5hbWUiLCJyZXNvbHZlZFNvdXJjZSIsIm1lc3NhZ2UiLCJzb3VyY2UiLCJzb3VyY2VUeXBlIiwicmVwbyIsInNvdXJjZV90eXBlIiwidHlwZSIsInRhcmdldE1hcmtldHBsYWNlIiwiZXJyIiwiY3VycmVudCJdLCJzb3VyY2VzIjpbIkFkZE1hcmtldHBsYWNlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHtcbiAgdHlwZSBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICBsb2dFdmVudCxcbn0gZnJvbSAnc3JjL3NlcnZpY2VzL2FuYWx5dGljcy9pbmRleC5qcydcbmltcG9ydCB7IENvbmZpZ3VyYWJsZVNob3J0Y3V0SGludCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvQ29uZmlndXJhYmxlU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgQnlsaW5lIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kZXNpZ24tc3lzdGVtL0J5bGluZS5qcydcbmltcG9ydCB7IEtleWJvYXJkU2hvcnRjdXRIaW50IH0gZnJvbSAnLi4vLi4vY29tcG9uZW50cy9kZXNpZ24tc3lzdGVtL0tleWJvYXJkU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgU3Bpbm5lciB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvU3Bpbm5lci5qcydcbmltcG9ydCBUZXh0SW5wdXQgZnJvbSAnLi4vLi4vY29tcG9uZW50cy9UZXh0SW5wdXQuanMnXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tICcuLi8uLi9pbmsuanMnXG5pbXBvcnQgeyB0b0Vycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzLmpzJ1xuaW1wb3J0IHsgbG9nRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9sb2cuanMnXG5pbXBvcnQgeyBjbGVhckFsbENhY2hlcyB9IGZyb20gJy4uLy4uL3V0aWxzL3BsdWdpbnMvY2FjaGVVdGlscy5qcydcbmltcG9ydCB7XG4gIGFkZE1hcmtldHBsYWNlU291cmNlLFxuICBzYXZlTWFya2V0cGxhY2VUb1NldHRpbmdzLFxufSBmcm9tICcuLi8uLi91dGlscy9wbHVnaW5zL21hcmtldHBsYWNlTWFuYWdlci5qcydcbmltcG9ydCB7IHBhcnNlTWFya2V0cGxhY2VJbnB1dCB9IGZyb20gJy4uLy4uL3V0aWxzL3BsdWdpbnMvcGFyc2VNYXJrZXRwbGFjZUlucHV0LmpzJ1xuaW1wb3J0IHR5cGUgeyBWaWV3U3RhdGUgfSBmcm9tICcuL3R5cGVzLmpzJ1xuXG50eXBlIFByb3BzID0ge1xuICBpbnB1dFZhbHVlOiBzdHJpbmdcbiAgc2V0SW5wdXRWYWx1ZTogKHZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgY3Vyc29yT2Zmc2V0OiBudW1iZXJcbiAgc2V0Q3Vyc29yT2Zmc2V0OiAob2Zmc2V0OiBudW1iZXIpID0+IHZvaWRcbiAgZXJyb3I6IHN0cmluZyB8IG51bGxcbiAgc2V0RXJyb3I6IChlcnJvcjogc3RyaW5nIHwgbnVsbCkgPT4gdm9pZFxuICByZXN1bHQ6IHN0cmluZyB8IG51bGxcbiAgc2V0UmVzdWx0OiAocmVzdWx0OiBzdHJpbmcgfCBudWxsKSA9PiB2b2lkXG4gIHNldFZpZXdTdGF0ZTogKHN0YXRlOiBWaWV3U3RhdGUpID0+IHZvaWRcbiAgb25BZGRDb21wbGV0ZT86ICgpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+XG4gIGNsaU1vZGU/OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBZGRNYXJrZXRwbGFjZSh7XG4gIGlucHV0VmFsdWUsXG4gIHNldElucHV0VmFsdWUsXG4gIGN1cnNvck9mZnNldCxcbiAgc2V0Q3Vyc29yT2Zmc2V0LFxuICBlcnJvcixcbiAgc2V0RXJyb3IsXG4gIHJlc3VsdCxcbiAgc2V0UmVzdWx0LFxuICBzZXRWaWV3U3RhdGUsXG4gIG9uQWRkQ29tcGxldGUsXG4gIGNsaU1vZGUgPSBmYWxzZSxcbn06IFByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgaGFzQXR0ZW1wdGVkQXV0b0FkZCA9IHVzZVJlZihmYWxzZSlcbiAgY29uc3QgW2lzTG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Byb2dyZXNzTWVzc2FnZSwgc2V0UHJvZ3Jlc3NNZXNzYWdlXSA9IHVzZVN0YXRlPHN0cmluZz4oJycpXG5cbiAgY29uc3QgaGFuZGxlQWRkID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGlucHV0ID0gaW5wdXRWYWx1ZS50cmltKClcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICBzZXRFcnJvcignUGxlYXNlIGVudGVyIGEgbWFya2V0cGxhY2Ugc291cmNlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZCA9IGF3YWl0IHBhcnNlTWFya2V0cGxhY2VJbnB1dChpbnB1dClcbiAgICBpZiAoIXBhcnNlZCkge1xuICAgICAgc2V0RXJyb3IoXG4gICAgICAgICdJbnZhbGlkIG1hcmtldHBsYWNlIHNvdXJjZSBmb3JtYXQuIFRyeTogb3duZXIvcmVwbywgaHR0cHM6Ly8uLi4sIG9yIC4vcGF0aCcsXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBwYXJzZU1hcmtldHBsYWNlSW5wdXQgcmV0dXJuZWQgYW4gZXJyb3JcbiAgICBpZiAoJ2Vycm9yJyBpbiBwYXJzZWQpIHtcbiAgICAgIHNldEVycm9yKHBhcnNlZC5lcnJvcilcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHNldEVycm9yKG51bGwpXG5cbiAgICB0cnkge1xuICAgICAgc2V0TG9hZGluZyh0cnVlKVxuICAgICAgc2V0UHJvZ3Jlc3NNZXNzYWdlKCcnKVxuICAgICAgY29uc3QgeyBuYW1lLCByZXNvbHZlZFNvdXJjZSB9ID0gYXdhaXQgYWRkTWFya2V0cGxhY2VTb3VyY2UoXG4gICAgICAgIHBhcnNlZCxcbiAgICAgICAgbWVzc2FnZSA9PiB7XG4gICAgICAgICAgc2V0UHJvZ3Jlc3NNZXNzYWdlKG1lc3NhZ2UpXG4gICAgICAgIH0sXG4gICAgICApXG4gICAgICBzYXZlTWFya2V0cGxhY2VUb1NldHRpbmdzKG5hbWUsIHsgc291cmNlOiByZXNvbHZlZFNvdXJjZSB9KVxuICAgICAgY2xlYXJBbGxDYWNoZXMoKVxuXG4gICAgICBsZXQgc291cmNlVHlwZSA9IHBhcnNlZC5zb3VyY2VcbiAgICAgIGlmIChwYXJzZWQuc291cmNlID09PSAnZ2l0aHViJykge1xuICAgICAgICBzb3VyY2VUeXBlID1cbiAgICAgICAgICBwYXJzZWQucmVwbyBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTXG4gICAgICB9XG5cbiAgICAgIGxvZ0V2ZW50KCd0ZW5ndV9tYXJrZXRwbGFjZV9hZGRlZCcsIHtcbiAgICAgICAgc291cmNlX3R5cGU6XG4gICAgICAgICAgc291cmNlVHlwZSBhcyBBbmFseXRpY3NNZXRhZGF0YV9JX1ZFUklGSUVEX1RISVNfSVNfTk9UX0NPREVfT1JfRklMRVBBVEhTLFxuICAgICAgfSlcblxuICAgICAgaWYgKG9uQWRkQ29tcGxldGUpIHtcbiAgICAgICAgYXdhaXQgb25BZGRDb21wbGV0ZSgpXG4gICAgICB9XG5cbiAgICAgIHNldFByb2dyZXNzTWVzc2FnZSgnJylcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG5cbiAgICAgIGlmIChjbGlNb2RlKSB7XG4gICAgICAgIC8vIEluIENMSSBtb2RlLCBzZXQgcmVzdWx0IHRvIHRyaWdnZXIgY29tcGxldGlvblxuICAgICAgICBzZXRSZXN1bHQoYFN1Y2Nlc3NmdWxseSBhZGRlZCBtYXJrZXRwbGFjZTogJHtuYW1lfWApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJbiBpbnRlcmFjdGl2ZSBtb2RlLCBzd2l0Y2ggdG8gYnJvd3NlIHZpZXdcbiAgICAgICAgc2V0Vmlld1N0YXRlKHsgdHlwZTogJ2Jyb3dzZS1tYXJrZXRwbGFjZScsIHRhcmdldE1hcmtldHBsYWNlOiBuYW1lIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zdCBlcnJvciA9IHRvRXJyb3IoZXJyKVxuICAgICAgbG9nRXJyb3IoZXJyb3IpXG4gICAgICBzZXRFcnJvcihlcnJvci5tZXNzYWdlKVxuICAgICAgc2V0UHJvZ3Jlc3NNZXNzYWdlKCcnKVxuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcblxuICAgICAgaWYgKGNsaU1vZGUpIHtcbiAgICAgICAgLy8gSW4gQ0xJIG1vZGUsIHNldCByZXN1bHQgd2l0aCBlcnJvciB0byB0cmlnZ2VyIGNvbXBsZXRpb25cbiAgICAgICAgc2V0UmVzdWx0KGBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRSZXN1bHQobnVsbClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBBdXRvLWFkZCBpZiBpbnB1dFZhbHVlIGlzIHByb3ZpZGVkXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGlucHV0VmFsdWUgJiYgIWhhc0F0dGVtcHRlZEF1dG9BZGQuY3VycmVudCAmJiAhZXJyb3IgJiYgIXJlc3VsdCkge1xuICAgICAgaGFzQXR0ZW1wdGVkQXV0b0FkZC5jdXJyZW50ID0gdHJ1ZVxuICAgICAgdm9pZCBoYW5kbGVBZGQoKVxuICAgIH1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgLy8gYmlvbWUtaWdub3JlIGxpbnQvY29ycmVjdG5lc3MvdXNlRXhoYXVzdGl2ZURlcGVuZGVuY2llczogaW50ZW50aW9uYWxcbiAgfSwgW10pIC8vIE9ubHkgcnVuIG9uY2Ugb24gbW91bnRcblxuICByZXR1cm4gKFxuICAgIDxCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPlxuICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgcGFkZGluZ1g9ezF9IGJvcmRlclN0eWxlPVwicm91bmRcIj5cbiAgICAgICAgPEJveCBtYXJnaW5Cb3R0b209ezF9PlxuICAgICAgICAgIDxUZXh0IGJvbGQ+QWRkIE1hcmtldHBsYWNlPC9UZXh0PlxuICAgICAgICA8L0JveD5cbiAgICAgICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICAgICAgPFRleHQ+RW50ZXIgbWFya2V0cGxhY2Ugc291cmNlOjwvVGV4dD5cbiAgICAgICAgICA8VGV4dCBkaW1Db2xvcj5FeGFtcGxlczo8L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+IMK3IG93bmVyL3JlcG8gKEdpdEh1Yik8L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+IMK3IGdpdEBnaXRodWIuY29tOm93bmVyL3JlcG8uZ2l0IChTU0gpPC9UZXh0PlxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPiDCtyBodHRwczovL2V4YW1wbGUuY29tL21hcmtldHBsYWNlLmpzb248L1RleHQ+XG4gICAgICAgICAgPFRleHQgZGltQ29sb3I+IMK3IC4vcGF0aC90by9tYXJrZXRwbGFjZTwvVGV4dD5cbiAgICAgICAgICA8Qm94IG1hcmdpblRvcD17MX0+XG4gICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgIHZhbHVlPXtpbnB1dFZhbHVlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0SW5wdXRWYWx1ZX1cbiAgICAgICAgICAgICAgb25TdWJtaXQ9e2hhbmRsZUFkZH1cbiAgICAgICAgICAgICAgY29sdW1ucz17ODB9XG4gICAgICAgICAgICAgIGN1cnNvck9mZnNldD17Y3Vyc29yT2Zmc2V0fVxuICAgICAgICAgICAgICBvbkNoYW5nZUN1cnNvck9mZnNldD17c2V0Q3Vyc29yT2Zmc2V0fVxuICAgICAgICAgICAgICBmb2N1c1xuICAgICAgICAgICAgICBzaG93Q3Vyc29yXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICA8L0JveD5cbiAgICAgICAge2lzTG9hZGluZyAmJiAoXG4gICAgICAgICAgPEJveCBtYXJnaW5Ub3A9ezF9PlxuICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgICB7cHJvZ3Jlc3NNZXNzYWdlIHx8ICdBZGRpbmcgbWFya2V0cGxhY2UgdG8gY29uZmlndXJhdGlvbuKApid9XG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICAgIHtlcnJvciAmJiAoXG4gICAgICAgICAgPEJveCBtYXJnaW5Ub3A9ezF9PlxuICAgICAgICAgICAgPFRleHQgY29sb3I9XCJlcnJvclwiPntlcnJvcn08L1RleHQ+XG4gICAgICAgICAgPC9Cb3g+XG4gICAgICAgICl9XG4gICAgICAgIHtyZXN1bHQgJiYgKFxuICAgICAgICAgIDxCb3ggbWFyZ2luVG9wPXsxfT5cbiAgICAgICAgICAgIDxUZXh0PntyZXN1bHR9PC9UZXh0PlxuICAgICAgICAgIDwvQm94PlxuICAgICAgICApfVxuICAgICAgPC9Cb3g+XG4gICAgICA8Qm94IG1hcmdpbkxlZnQ9ezN9PlxuICAgICAgICA8VGV4dCBkaW1Db2xvciBpdGFsaWM+XG4gICAgICAgICAgPEJ5bGluZT5cbiAgICAgICAgICAgIDxLZXlib2FyZFNob3J0Y3V0SGludCBzaG9ydGN1dD1cIkVudGVyXCIgYWN0aW9uPVwiYWRkXCIgLz5cbiAgICAgICAgICAgIDxDb25maWd1cmFibGVTaG9ydGN1dEhpbnRcbiAgICAgICAgICAgICAgYWN0aW9uPVwiY29uZmlybTpub1wiXG4gICAgICAgICAgICAgIGNvbnRleHQ9XCJTZXR0aW5nc1wiXG4gICAgICAgICAgICAgIGZhbGxiYWNrPVwiRXNjXCJcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb249XCJjYW5jZWxcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0J5bGluZT5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cbiJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxLQUFLLE1BQU0sT0FBTztBQUM5QixTQUFTQyxTQUFTLEVBQUVDLE1BQU0sRUFBRUMsUUFBUSxRQUFRLE9BQU87QUFDbkQsU0FDRSxLQUFLQywwREFBMEQsRUFDL0RDLFFBQVEsUUFDSCxpQ0FBaUM7QUFDeEMsU0FBU0Msd0JBQXdCLFFBQVEsOENBQThD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
