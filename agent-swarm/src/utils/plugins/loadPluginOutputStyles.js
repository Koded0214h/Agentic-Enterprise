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
exports.loadPluginOutputStyles = void 0;
exports.clearPluginOutputStyleCache = clearPluginOutputStyleCache;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var plugin_js_1 = require("../../types/plugin.js");
var debug_js_1 = require("../debug.js");
var frontmatterParser_js_1 = require("../frontmatterParser.js");
var fsOperations_js_1 = require("../fsOperations.js");
var markdownConfigLoader_js_1 = require("../markdownConfigLoader.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var walkPluginMarkdown_js_1 = require("./walkPluginMarkdown.js");
function loadOutputStylesFromDirectory(outputStylesPath, pluginName, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var styles;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    styles = [];
                    return [4 /*yield*/, (0, walkPluginMarkdown_js_1.walkPluginMarkdown)(outputStylesPath, function (fullPath) { return __awaiter(_this, void 0, void 0, function () {
                            var style;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, loadOutputStyleFromFile(fullPath, pluginName, loadedPaths)];
                                    case 1:
                                        style = _a.sent();
                                        if (style)
                                            styles.push(style);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { logLabel: 'output-styles' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, styles];
            }
        });
    });
}
function loadOutputStyleFromFile(filePath, pluginName, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, content, _a, frontmatter, markdownContent, fileName, baseStyleName, name_1, description, forceRaw, forceForPlugin, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    if ((0, fsOperations_js_1.isDuplicatePath)(fs, filePath, loadedPaths)) {
                        return [2 /*return*/, null];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf-8' })];
                case 2:
                    content = _c.sent();
                    _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, filePath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                    fileName = (0, path_1.basename)(filePath, '.md');
                    baseStyleName = frontmatter.name || fileName;
                    name_1 = "".concat(pluginName, ":").concat(baseStyleName);
                    description = (_b = (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter.description, name_1)) !== null && _b !== void 0 ? _b : (0, markdownConfigLoader_js_1.extractDescriptionFromMarkdown)(markdownContent, "Output style from ".concat(pluginName, " plugin"));
                    forceRaw = frontmatter['force-for-plugin'];
                    forceForPlugin = forceRaw === true || forceRaw === 'true'
                        ? true
                        : forceRaw === false || forceRaw === 'false'
                            ? false
                            : undefined;
                    return [2 /*return*/, {
                            name: name_1,
                            description: description,
                            prompt: markdownContent.trim(),
                            source: 'plugin',
                            forceForPlugin: forceForPlugin,
                        }];
                case 3:
                    error_1 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Failed to load output style from ".concat(filePath, ": ").concat(error_1), {
                        level: 'error',
                    });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.loadPluginOutputStyles = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, errors, allStyles, _i, enabled_1, plugin, loadedPaths, styles, error_2, _b, _c, stylePath, fs, stats, styles, style, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
            case 1:
                _a = _d.sent(), enabled = _a.enabled, errors = _a.errors;
                allStyles = [];
                if (errors.length > 0) {
                    (0, debug_js_1.logForDebugging)("Plugin loading errors: ".concat(errors.map(function (e) { return (0, plugin_js_1.getPluginErrorMessage)(e); }).join(', ')));
                }
                _i = 0, enabled_1 = enabled;
                _d.label = 2;
            case 2:
                if (!(_i < enabled_1.length)) return [3 /*break*/, 17];
                plugin = enabled_1[_i];
                loadedPaths = new Set();
                if (!plugin.outputStylesPath) return [3 /*break*/, 6];
                _d.label = 3;
            case 3:
                _d.trys.push([3, 5, , 6]);
                return [4 /*yield*/, loadOutputStylesFromDirectory(plugin.outputStylesPath, plugin.name, loadedPaths)];
            case 4:
                styles = _d.sent();
                allStyles.push.apply(allStyles, styles);
                if (styles.length > 0) {
                    (0, debug_js_1.logForDebugging)("Loaded ".concat(styles.length, " output styles from plugin ").concat(plugin.name, " default directory"));
                }
                return [3 /*break*/, 6];
            case 5:
                error_2 = _d.sent();
                (0, debug_js_1.logForDebugging)("Failed to load output styles from plugin ".concat(plugin.name, " default directory: ").concat(error_2), { level: 'error' });
                return [3 /*break*/, 6];
            case 6:
                if (!plugin.outputStylesPaths) return [3 /*break*/, 16];
                _b = 0, _c = plugin.outputStylesPaths;
                _d.label = 7;
            case 7:
                if (!(_b < _c.length)) return [3 /*break*/, 16];
                stylePath = _c[_b];
                _d.label = 8;
            case 8:
                _d.trys.push([8, 14, , 15]);
                fs = (0, fsOperations_js_1.getFsImplementation)();
                return [4 /*yield*/, fs.stat(stylePath)];
            case 9:
                stats = _d.sent();
                if (!stats.isDirectory()) return [3 /*break*/, 11];
                return [4 /*yield*/, loadOutputStylesFromDirectory(stylePath, plugin.name, loadedPaths)];
            case 10:
                styles = _d.sent();
                allStyles.push.apply(allStyles, styles);
                if (styles.length > 0) {
                    (0, debug_js_1.logForDebugging)("Loaded ".concat(styles.length, " output styles from plugin ").concat(plugin.name, " custom path: ").concat(stylePath));
                }
                return [3 /*break*/, 13];
            case 11:
                if (!(stats.isFile() && stylePath.endsWith('.md'))) return [3 /*break*/, 13];
                return [4 /*yield*/, loadOutputStyleFromFile(stylePath, plugin.name, loadedPaths)];
            case 12:
                style = _d.sent();
                if (style) {
                    allStyles.push(style);
                    (0, debug_js_1.logForDebugging)("Loaded output style from plugin ".concat(plugin.name, " custom file: ").concat(stylePath));
                }
                _d.label = 13;
            case 13: return [3 /*break*/, 15];
            case 14:
                error_3 = _d.sent();
                (0, debug_js_1.logForDebugging)("Failed to load output styles from plugin ".concat(plugin.name, " custom path ").concat(stylePath, ": ").concat(error_3), { level: 'error' });
                return [3 /*break*/, 15];
            case 15:
                _b++;
                return [3 /*break*/, 7];
            case 16:
                _i++;
                return [3 /*break*/, 2];
            case 17:
                (0, debug_js_1.logForDebugging)("Total plugin output styles loaded: ".concat(allStyles.length));
                return [2 /*return*/, allStyles];
        }
    });
}); });
function clearPluginOutputStyleCache() {
    var _a, _b;
    (_b = (_a = exports.loadPluginOutputStyles.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
