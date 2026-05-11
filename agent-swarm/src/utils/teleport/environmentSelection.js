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
exports.getEnvironmentSelectionInfo = getEnvironmentSelectionInfo;
var constants_js_1 = require("../settings/constants.js");
var settings_js_1 = require("../settings/settings.js");
var environments_js_1 = require("./environments.js");
/**
 * Gets information about available environments and the currently selected one.
 *
 * @returns Promise<EnvironmentSelectionInfo> containing:
 *   - availableEnvironments: all environments from the API
 *   - selectedEnvironment: the environment that would be used (based on settings or first available),
 *     or null if no environments are available
 *   - selectedEnvironmentSource: the SettingSource where defaultEnvironmentId is configured,
 *     or null if using the default (first environment)
 */
function getEnvironmentSelectionInfo() {
    return __awaiter(this, void 0, void 0, function () {
        var environments, mergedSettings, defaultEnvironmentId, selectedEnvironment, selectedEnvironmentSource, matchingEnvironment, i, source, sourceSettings;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, environments_js_1.fetchEnvironments)()];
                case 1:
                    environments = _d.sent();
                    if (environments.length === 0) {
                        return [2 /*return*/, {
                                availableEnvironments: [],
                                selectedEnvironment: null,
                                selectedEnvironmentSource: null,
                            }];
                    }
                    mergedSettings = (0, settings_js_1.getSettings_DEPRECATED)();
                    defaultEnvironmentId = (_a = mergedSettings === null || mergedSettings === void 0 ? void 0 : mergedSettings.remote) === null || _a === void 0 ? void 0 : _a.defaultEnvironmentId;
                    selectedEnvironment = (_b = environments.find(function (env) { return env.kind !== 'bridge'; })) !== null && _b !== void 0 ? _b : environments[0];
                    selectedEnvironmentSource = null;
                    if (defaultEnvironmentId) {
                        matchingEnvironment = environments.find(function (env) { return env.environment_id === defaultEnvironmentId; });
                        if (matchingEnvironment) {
                            selectedEnvironment = matchingEnvironment;
                            // Find which source has this setting
                            // Iterate from lowest to highest priority, so the last match wins (highest priority)
                            for (i = constants_js_1.SETTING_SOURCES.length - 1; i >= 0; i--) {
                                source = constants_js_1.SETTING_SOURCES[i];
                                if (!source || source === 'flagSettings') {
                                    // Skip flagSettings as it's not a normal source we check
                                    continue;
                                }
                                sourceSettings = (0, settings_js_1.getSettingsForSource)(source);
                                if (((_c = sourceSettings === null || sourceSettings === void 0 ? void 0 : sourceSettings.remote) === null || _c === void 0 ? void 0 : _c.defaultEnvironmentId) === defaultEnvironmentId) {
                                    selectedEnvironmentSource = source;
                                    break;
                                }
                            }
                        }
                    }
                    return [2 /*return*/, {
                            availableEnvironments: environments,
                            selectedEnvironment: selectedEnvironment,
                            selectedEnvironmentSource: selectedEnvironmentSource,
                        }];
            }
        });
    });
}
