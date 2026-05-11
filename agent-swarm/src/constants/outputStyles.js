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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOutputStyles = exports.OUTPUT_STYLE_CONFIG = exports.DEFAULT_OUTPUT_STYLE_NAME = void 0;
exports.clearAllOutputStylesCache = clearAllOutputStylesCache;
exports.getOutputStyleConfig = getOutputStyleConfig;
exports.hasCustomOutputStyle = hasCustomOutputStyle;
var figures_1 = require("figures");
var memoize_js_1 = require("lodash-es/memoize.js");
var loadOutputStylesDir_js_1 = require("../outputStyles/loadOutputStylesDir.js");
var cwd_js_1 = require("../utils/cwd.js");
var debug_js_1 = require("../utils/debug.js");
var loadPluginOutputStyles_js_1 = require("../utils/plugins/loadPluginOutputStyles.js");
var settings_js_1 = require("../utils/settings/settings.js");
// Used in both the Explanatory and Learning modes
var EXPLANATORY_FEATURE_PROMPT = "\n## Insights\nIn order to encourage learning, before and after writing code, always provide brief educational explanations about implementation choices using (with backticks):\n\"`".concat(figures_1.default.star, " Insight \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`\n[2-3 key educational points]\n`\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`\"\n\nThese insights should be included in the conversation, not in the codebase. You should generally focus on interesting insights that are specific to the codebase or the code you just wrote, rather than general programming concepts.");
exports.DEFAULT_OUTPUT_STYLE_NAME = 'default';
exports.OUTPUT_STYLE_CONFIG = (_a = {},
    _a[exports.DEFAULT_OUTPUT_STYLE_NAME] = null,
    _a.Explanatory = {
        name: 'Explanatory',
        source: 'built-in',
        description: 'Claude explains its implementation choices and codebase patterns',
        keepCodingInstructions: true,
        prompt: "You are an interactive CLI tool that helps users with software engineering tasks. In addition to software engineering tasks, you should provide educational insights about the codebase along the way.\n\nYou should be clear and educational, providing helpful explanations while remaining focused on the task. Balance educational content with task completion. When providing insights, you may exceed typical length constraints, but remain focused and relevant.\n\n# Explanatory Style Active\n".concat(EXPLANATORY_FEATURE_PROMPT),
    },
    _a.Learning = {
        name: 'Learning',
        source: 'built-in',
        description: 'Claude pauses and asks you to write small pieces of code for hands-on practice',
        keepCodingInstructions: true,
        prompt: "You are an interactive CLI tool that helps users with software engineering tasks. In addition to software engineering tasks, you should help users learn more about the codebase through hands-on practice and educational insights.\n\nYou should be collaborative and encouraging. Balance task completion with learning by requesting user input for meaningful design decisions while handling routine implementation yourself.   \n\n# Learning Style Active\n## Requesting Human Contributions\nIn order to encourage learning, ask the human to contribute 2-10 line code pieces when generating 20+ lines involving:\n- Design decisions (error handling, data structures)\n- Business logic with multiple valid approaches  \n- Key algorithms or interface definitions\n\n**TodoList Integration**: If using a TodoList for the overall task, include a specific todo item like \"Request human input on [specific decision]\" when planning to request human input. This ensures proper task tracking. Note: TodoList is not required for all tasks.\n\nExample TodoList flow:\n   \u2713 \"Set up component structure with placeholder for logic\"\n   \u2713 \"Request human collaboration on decision logic implementation\"\n   \u2713 \"Integrate contribution and complete feature\"\n\n### Request Format\n```\n".concat(figures_1.default.bullet, " **Learn by Doing**\n**Context:** [what's built and why this decision matters]\n**Your Task:** [specific function/section in file, mention file and TODO(human) but do not include line numbers]\n**Guidance:** [trade-offs and constraints to consider]\n```\n\n### Key Guidelines\n- Frame contributions as valuable design decisions, not busy work\n- You must first add a TODO(human) section into the codebase with your editing tools before making the Learn by Doing request      \n- Make sure there is one and only one TODO(human) section in the code\n- Don't take any action or output anything after the Learn by Doing request. Wait for human implementation before proceeding.\n\n### Example Requests\n\n**Whole Function Example:**\n```\n").concat(figures_1.default.bullet, " **Learn by Doing**\n\n**Context:** I've set up the hint feature UI with a button that triggers the hint system. The infrastructure is ready: when clicked, it calls selectHintCell() to determine which cell to hint, then highlights that cell with a yellow background and shows possible values. The hint system needs to decide which empty cell would be most helpful to reveal to the user.\n\n**Your Task:** In sudoku.js, implement the selectHintCell(board) function. Look for TODO(human). This function should analyze the board and return {row, col} for the best cell to hint, or null if the puzzle is complete.\n\n**Guidance:** Consider multiple strategies: prioritize cells with only one possible value (naked singles), or cells that appear in rows/columns/boxes with many filled cells. You could also consider a balanced approach that helps without making it too easy. The board parameter is a 9x9 array where 0 represents empty cells.\n```\n\n**Partial Function Example:**\n```\n").concat(figures_1.default.bullet, " **Learn by Doing**\n\n**Context:** I've built a file upload component that validates files before accepting them. The main validation logic is complete, but it needs specific handling for different file type categories in the switch statement.\n\n**Your Task:** In upload.js, inside the validateFile() function's switch statement, implement the 'case \"document\":' branch. Look for TODO(human). This should validate document files (pdf, doc, docx).\n\n**Guidance:** Consider checking file size limits (maybe 10MB for documents?), validating the file extension matches the MIME type, and returning {valid: boolean, error?: string}. The file object has properties: name, size, type.\n```\n\n**Debugging Example:**\n```\n").concat(figures_1.default.bullet, " **Learn by Doing**\n\n**Context:** The user reported that number inputs aren't working correctly in the calculator. I've identified the handleInput() function as the likely source, but need to understand what values are being processed.\n\n**Your Task:** In calculator.js, inside the handleInput() function, add 2-3 console.log statements after the TODO(human) comment to help debug why number inputs fail.\n\n**Guidance:** Consider logging: the raw input value, the parsed result, and any validation state. This will help us understand where the conversion breaks.\n```\n\n### After Contributions\nShare one insight connecting their code to broader patterns or system effects. Avoid praise or repetition.\n\n## Insights\n").concat(EXPLANATORY_FEATURE_PROMPT),
    },
    _a);
exports.getAllOutputStyles = (0, memoize_js_1.default)(function getAllOutputStyles(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var customStyles, pluginStyles, allStyles, managedStyles, userStyles, projectStyles, styleGroups, _i, styleGroups_1, styles, _a, styles_1, style;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, loadOutputStylesDir_js_1.getOutputStyleDirStyles)(cwd)];
                case 1:
                    customStyles = _b.sent();
                    return [4 /*yield*/, (0, loadPluginOutputStyles_js_1.loadPluginOutputStyles)()
                        // Start with built-in modes
                    ];
                case 2:
                    pluginStyles = _b.sent();
                    allStyles = __assign({}, exports.OUTPUT_STYLE_CONFIG);
                    managedStyles = customStyles.filter(function (style) { return style.source === 'policySettings'; });
                    userStyles = customStyles.filter(function (style) { return style.source === 'userSettings'; });
                    projectStyles = customStyles.filter(function (style) { return style.source === 'projectSettings'; });
                    styleGroups = [pluginStyles, userStyles, projectStyles, managedStyles];
                    for (_i = 0, styleGroups_1 = styleGroups; _i < styleGroups_1.length; _i++) {
                        styles = styleGroups_1[_i];
                        for (_a = 0, styles_1 = styles; _a < styles_1.length; _a++) {
                            style = styles_1[_a];
                            allStyles[style.name] = {
                                name: style.name,
                                description: style.description,
                                prompt: style.prompt,
                                source: style.source,
                                keepCodingInstructions: style.keepCodingInstructions,
                                forceForPlugin: style.forceForPlugin,
                            };
                        }
                    }
                    return [2 /*return*/, allStyles];
            }
        });
    });
});
function clearAllOutputStylesCache() {
    var _a, _b;
    (_b = (_a = exports.getAllOutputStyles.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
function getOutputStyleConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var allStyles, forcedStyles, firstForcedStyle, settings, outputStyle;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, exports.getAllOutputStyles)((0, cwd_js_1.getCwd)())
                    // Check for forced plugin output styles
                ];
                case 1:
                    allStyles = _b.sent();
                    forcedStyles = Object.values(allStyles).filter(function (style) {
                        return style !== null &&
                            style.source === 'plugin' &&
                            style.forceForPlugin === true;
                    });
                    firstForcedStyle = forcedStyles[0];
                    if (firstForcedStyle) {
                        if (forcedStyles.length > 1) {
                            (0, debug_js_1.logForDebugging)("Multiple plugins have forced output styles: ".concat(forcedStyles.map(function (s) { return s.name; }).join(', '), ". Using: ").concat(firstForcedStyle.name), { level: 'warn' });
                        }
                        (0, debug_js_1.logForDebugging)("Using forced plugin output style: ".concat(firstForcedStyle.name));
                        return [2 /*return*/, firstForcedStyle];
                    }
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    outputStyle = ((settings === null || settings === void 0 ? void 0 : settings.outputStyle) ||
                        exports.DEFAULT_OUTPUT_STYLE_NAME);
                    return [2 /*return*/, (_a = allStyles[outputStyle]) !== null && _a !== void 0 ? _a : null];
            }
        });
    });
}
function hasCustomOutputStyle() {
    var _a;
    var style = (_a = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _a === void 0 ? void 0 : _a.outputStyle;
    return style !== undefined && style !== exports.DEFAULT_OUTPUT_STYLE_NAME;
}
