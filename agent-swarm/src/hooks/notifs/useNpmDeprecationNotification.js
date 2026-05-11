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
exports.useNpmDeprecationNotification = useNpmDeprecationNotification;
var bundledMode_js_1 = require("src/utils/bundledMode.js");
var doctorDiagnostic_js_1 = require("src/utils/doctorDiagnostic.js");
var envUtils_js_1 = require("src/utils/envUtils.js");
var useStartupNotification_js_1 = require("./useStartupNotification.js");
var NPM_DEPRECATION_MESSAGE = 'Claude Code has switched from npm to native installer. Run `claude install` or see https://docs.anthropic.com/en/docs/claude-code/getting-started for more options.';
function useNpmDeprecationNotification() {
    (0, useStartupNotification_js_1.useStartupNotification)(_temp);
}
function _temp() {
    return __awaiter(this, void 0, void 0, function () {
        var installationType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, bundledMode_js_1.isInBundledMode)() || (0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_INSTALLATION_CHECKS)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, doctorDiagnostic_js_1.getCurrentInstallationType)()];
                case 1:
                    installationType = _a.sent();
                    if (installationType === "development") {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            timeoutMs: 15000,
                            key: "npm-deprecation-warning",
                            text: NPM_DEPRECATION_MESSAGE,
                            color: "warning",
                            priority: "high"
                        }];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0luQnVuZGxlZE1vZGUiLCJnZXRDdXJyZW50SW5zdGFsbGF0aW9uVHlwZSIsImlzRW52VHJ1dGh5IiwidXNlU3RhcnR1cE5vdGlmaWNhdGlvbiIsIk5QTV9ERVBSRUNBVElPTl9NRVNTQUdFIiwidXNlTnBtRGVwcmVjYXRpb25Ob3RpZmljYXRpb24iLCJfdGVtcCIsInByb2Nlc3MiLCJlbnYiLCJESVNBQkxFX0lOU1RBTExBVElPTl9DSEVDS1MiLCJpbnN0YWxsYXRpb25UeXBlIiwidGltZW91dE1zIiwia2V5IiwidGV4dCIsImNvbG9yIiwicHJpb3JpdHkiXSwic291cmNlcyI6WyJ1c2VOcG1EZXByZWNhdGlvbk5vdGlmaWNhdGlvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgaXNJbkJ1bmRsZWRNb2RlIH0gZnJvbSAnc3JjL3V0aWxzL2J1bmRsZWRNb2RlLmpzJ1xuaW1wb3J0IHsgZ2V0Q3VycmVudEluc3RhbGxhdGlvblR5cGUgfSBmcm9tICdzcmMvdXRpbHMvZG9jdG9yRGlhZ25vc3RpYy5qcydcbmltcG9ydCB7IGlzRW52VHJ1dGh5IH0gZnJvbSAnc3JjL3V0aWxzL2VudlV0aWxzLmpzJ1xuaW1wb3J0IHsgdXNlU3RhcnR1cE5vdGlmaWNhdGlvbiB9IGZyb20gJy4vdXNlU3RhcnR1cE5vdGlmaWNhdGlvbi5qcydcblxuY29uc3QgTlBNX0RFUFJFQ0FUSU9OX01FU1NBR0UgPVxuICAnQ2xhdWRlIENvZGUgaGFzIHN3aXRjaGVkIGZyb20gbnBtIHRvIG5hdGl2ZSBpbnN0YWxsZXIuIFJ1biBgY2xhdWRlIGluc3RhbGxgIG9yIHNlZSBodHRwczovL2RvY3MuYW50aHJvcGljLmNvbS9lbi9kb2NzL2NsYXVkZS1jb2RlL2dldHRpbmctc3RhcnRlZCBmb3IgbW9yZSBvcHRpb25zLidcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU5wbURlcHJlY2F0aW9uTm90aWZpY2F0aW9uKCk6IHZvaWQge1xuICB1c2VTdGFydHVwTm90aWZpY2F0aW9uKGFzeW5jICgpID0+IHtcbiAgICBpZiAoXG4gICAgICBpc0luQnVuZGxlZE1vZGUoKSB8fFxuICAgICAgaXNFbnZUcnV0aHkocHJvY2Vzcy5lbnYuRElTQUJMRV9JTlNUQUxMQVRJT05fQ0hFQ0tTKVxuICAgICkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gICAgY29uc3QgaW5zdGFsbGF0aW9uVHlwZSA9IGF3YWl0IGdldEN1cnJlbnRJbnN0YWxsYXRpb25UeXBlKClcbiAgICBpZiAoaW5zdGFsbGF0aW9uVHlwZSA9PT0gJ2RldmVsb3BtZW50JykgcmV0dXJuIG51bGxcbiAgICByZXR1cm4ge1xuICAgICAgdGltZW91dE1zOiAxNTAwMCxcbiAgICAgIGtleTogJ25wbS1kZXByZWNhdGlvbi13YXJuaW5nJyxcbiAgICAgIHRleHQ6IE5QTV9ERVBSRUNBVElPTl9NRVNTQUdFLFxuICAgICAgY29sb3I6ICd3YXJuaW5nJyxcbiAgICAgIHByaW9yaXR5OiAnaGlnaCcsXG4gICAgfVxuICB9KVxufVxuIl0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxlQUFlLFFBQVEsMEJBQTBCO0FBQzFELFNBQVNDLDBCQUEwQixRQUFRLCtCQUErQjtBQUMxRSxTQUFTQyxXQUFXLFFBQVEsdUJBQXVCO0FBQ25ELFNBQVNDLHNCQUFzQixRQUFRLDZCQUE2QjtBQUVwRSxNQUFNQyx1QkFBdUIsR0FDM0IscUtBQXFLO0FBRXZLLE9BQU8sU0FBQUMsOEJBQUE7RUFDTEYsc0JBQXNCLENBQUNHLEtBZ0J0QixDQUFDO0FBQUE7QUFqQkcsZUFBQUEsTUFBQTtFQUVILElBQ0VOLGVBQWUsQ0FDb0MsQ0FBQyxJQUFwREUsV0FBVyxDQUFDSyxPQUFPLENBQUFDLEdBQUksQ0FBQUMsMkJBQTRCLENBQUM7SUFBQSxPQUU3QyxJQUFJO0VBQUE7RUFFYixNQUFBQyxnQkFBQSxHQUF5QixNQUFNVCwwQkFBMEIsQ0FBQyxDQUFDO0VBQzNELElBQUlTLGdCQUFnQixLQUFLLGFBQWE7SUFBQSxPQUFTLElBQUk7RUFBQTtFQUFBLE9BQzVDO0lBQUFDLFNBQUEsRUFDTSxLQUFLO0lBQUFDLEdBQUEsRUFDWCx5QkFBeUI7SUFBQUMsSUFBQSxFQUN4QlQsdUJBQXVCO0lBQUFVLEtBQUEsRUFDdEIsU0FBUztJQUFBQyxRQUFBLEVBQ047RUFDWixDQUFDO0FBQUEiLCJpZ25vcmVMaXN0IjpbXX0=
