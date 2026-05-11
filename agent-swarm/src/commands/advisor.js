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
var advisor_js_1 = require("../utils/advisor.js");
var model_js_1 = require("../utils/model/model.js");
var validateModel_js_1 = require("../utils/model/validateModel.js");
var settings_js_1 = require("../utils/settings/settings.js");
var call = function (args, context) { return __awaiter(void 0, void 0, void 0, function () {
    var arg, baseModel, current, prev, normalizedModel, resolvedModel, _a, valid, error;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                arg = args.trim().toLowerCase();
                baseModel = (0, model_js_1.parseUserSpecifiedModel)((_b = context.getAppState().mainLoopModel) !== null && _b !== void 0 ? _b : (0, model_js_1.getDefaultMainLoopModelSetting)());
                if (!arg) {
                    current = context.getAppState().advisorModel;
                    if (!current) {
                        return [2 /*return*/, {
                                type: 'text',
                                value: 'Advisor: not set\nUse "/advisor <model>" to enable (e.g. "/advisor opus").',
                            }];
                    }
                    if (!(0, advisor_js_1.modelSupportsAdvisor)(baseModel)) {
                        return [2 /*return*/, {
                                type: 'text',
                                value: "Advisor: ".concat(current, " (inactive)\nThe current model (").concat(baseModel, ") does not support advisors."),
                            }];
                    }
                    return [2 /*return*/, {
                            type: 'text',
                            value: "Advisor: ".concat(current, "\nUse \"/advisor unset\" to disable or \"/advisor <model>\" to change."),
                        }];
                }
                if (arg === 'unset' || arg === 'off') {
                    prev = context.getAppState().advisorModel;
                    context.setAppState(function (s) {
                        if (s.advisorModel === undefined)
                            return s;
                        return __assign(__assign({}, s), { advisorModel: undefined });
                    });
                    (0, settings_js_1.updateSettingsForSource)('userSettings', { advisorModel: undefined });
                    return [2 /*return*/, {
                            type: 'text',
                            value: prev
                                ? "Advisor disabled (was ".concat(prev, ").")
                                : 'Advisor already unset.',
                        }];
                }
                normalizedModel = (0, model_js_1.normalizeModelStringForAPI)(arg);
                resolvedModel = (0, model_js_1.parseUserSpecifiedModel)(arg);
                return [4 /*yield*/, (0, validateModel_js_1.validateModel)(resolvedModel)];
            case 1:
                _a = _c.sent(), valid = _a.valid, error = _a.error;
                if (!valid) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: error
                                ? "Invalid advisor model: ".concat(error)
                                : "Unknown model: ".concat(arg, " (").concat(resolvedModel, ")"),
                        }];
                }
                if (!(0, advisor_js_1.isValidAdvisorModel)(resolvedModel)) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: "The model ".concat(arg, " (").concat(resolvedModel, ") cannot be used as an advisor"),
                        }];
                }
                context.setAppState(function (s) {
                    if (s.advisorModel === normalizedModel)
                        return s;
                    return __assign(__assign({}, s), { advisorModel: normalizedModel });
                });
                (0, settings_js_1.updateSettingsForSource)('userSettings', { advisorModel: normalizedModel });
                if (!(0, advisor_js_1.modelSupportsAdvisor)(baseModel)) {
                    return [2 /*return*/, {
                            type: 'text',
                            value: "Advisor set to ".concat(normalizedModel, ".\nNote: Your current model (").concat(baseModel, ") does not support advisors. Switch to a supported model to use the advisor."),
                        }];
                }
                return [2 /*return*/, {
                        type: 'text',
                        value: "Advisor set to ".concat(normalizedModel, "."),
                    }];
        }
    });
}); };
var advisor = {
    type: 'local',
    name: 'advisor',
    description: 'Configure the advisor model',
    argumentHint: '[<model>|off]',
    isEnabled: function () { return (0, advisor_js_1.canUserConfigureAdvisor)(); },
    get isHidden() {
        return !(0, advisor_js_1.canUserConfigureAdvisor)();
    },
    supportsNonInteractive: true,
    load: function () { return Promise.resolve({ call: call }); },
};
exports.default = advisor;
