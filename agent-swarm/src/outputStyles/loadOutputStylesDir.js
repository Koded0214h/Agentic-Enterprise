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
exports.getOutputStyleDirStyles = void 0;
exports.clearOutputStyleCaches = clearOutputStyleCaches;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var debug_js_1 = require("../utils/debug.js");
var frontmatterParser_js_1 = require("../utils/frontmatterParser.js");
var log_js_1 = require("../utils/log.js");
var markdownConfigLoader_js_1 = require("../utils/markdownConfigLoader.js");
var loadPluginOutputStyles_js_1 = require("../utils/plugins/loadPluginOutputStyles.js");
/**
 * Loads markdown files from .claude/output-styles directories throughout the project
 * and from ~/.claude/output-styles directory and converts them to output styles.
 *
 * Each filename becomes a style name, and the file content becomes the style prompt.
 * The frontmatter provides name and description.
 *
 * Structure:
 * - Project .claude/output-styles/*.md -> project styles
 * - User ~/.claude/output-styles/*.md -> user styles (overridden by project styles)
 *
 * @param cwd Current working directory for project directory traversal
 */
exports.getOutputStyleDirStyles = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var markdownFiles, styles, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, markdownConfigLoader_js_1.loadMarkdownFilesForSubdir)('output-styles', cwd)];
            case 1:
                markdownFiles = _a.sent();
                styles = markdownFiles
                    .map(function (_a) {
                    var _b;
                    var filePath = _a.filePath, frontmatter = _a.frontmatter, content = _a.content, source = _a.source;
                    try {
                        var fileName = (0, path_1.basename)(filePath);
                        var styleName = fileName.replace(/\.md$/, '');
                        // Get style configuration from frontmatter
                        var name_1 = (frontmatter['name'] || styleName);
                        var description = (_b = (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter['description'], styleName)) !== null && _b !== void 0 ? _b : (0, markdownConfigLoader_js_1.extractDescriptionFromMarkdown)(content, "Custom ".concat(styleName, " output style"));
                        // Parse keep-coding-instructions flag (supports both boolean and string values)
                        var keepCodingInstructionsRaw = frontmatter['keep-coding-instructions'];
                        var keepCodingInstructions = keepCodingInstructionsRaw === true ||
                            keepCodingInstructionsRaw === 'true'
                            ? true
                            : keepCodingInstructionsRaw === false ||
                                keepCodingInstructionsRaw === 'false'
                                ? false
                                : undefined;
                        // Warn if force-for-plugin is set on non-plugin output style
                        if (frontmatter['force-for-plugin'] !== undefined) {
                            (0, debug_js_1.logForDebugging)("Output style \"".concat(name_1, "\" has force-for-plugin set, but this option only applies to plugin output styles. Ignoring."), { level: 'warn' });
                        }
                        return {
                            name: name_1,
                            description: description,
                            prompt: content.trim(),
                            source: source,
                            keepCodingInstructions: keepCodingInstructions,
                        };
                    }
                    catch (error) {
                        (0, log_js_1.logError)(error);
                        return null;
                    }
                })
                    .filter(function (style) { return style !== null; });
                return [2 /*return*/, styles];
            case 2:
                error_1 = _a.sent();
                (0, log_js_1.logError)(error_1);
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); });
function clearOutputStyleCaches() {
    var _a, _b, _c, _d;
    (_b = (_a = exports.getOutputStyleDirStyles.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = markdownConfigLoader_js_1.loadMarkdownFilesForSubdir.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    (0, loadPluginOutputStyles_js_1.clearPluginOutputStyleCache)();
}
