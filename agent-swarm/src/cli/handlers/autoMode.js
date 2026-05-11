"use strict";
/**
 * Auto mode subcommand handlers — dump default/merged classifier rules and
 * critique user-written rules. Dynamically imported when `claude auto-mode ...` runs.
 */
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
exports.autoModeDefaultsHandler = autoModeDefaultsHandler;
exports.autoModeConfigHandler = autoModeConfigHandler;
exports.autoModeCritiqueHandler = autoModeCritiqueHandler;
var errors_js_1 = require("../../utils/errors.js");
var model_js_1 = require("../../utils/model/model.js");
var yoloClassifier_js_1 = require("../../utils/permissions/yoloClassifier.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var sideQuery_js_1 = require("../../utils/sideQuery.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
function writeRules(rules) {
    process.stdout.write((0, slowOperations_js_1.jsonStringify)(rules, null, 2) + '\n');
}
function autoModeDefaultsHandler() {
    writeRules((0, yoloClassifier_js_1.getDefaultExternalAutoModeRules)());
}
/**
 * Dump the effective auto mode config: user settings where provided, external
 * defaults otherwise. Per-section REPLACE semantics — matches how
 * buildYoloSystemPrompt resolves the external template (a non-empty user
 * section replaces that section's defaults entirely; an empty/absent section
 * falls through to defaults).
 */
function autoModeConfigHandler() {
    var _a, _b, _c;
    var config = (0, settings_js_1.getAutoModeConfig)();
    var defaults = (0, yoloClassifier_js_1.getDefaultExternalAutoModeRules)();
    writeRules({
        allow: ((_a = config === null || config === void 0 ? void 0 : config.allow) === null || _a === void 0 ? void 0 : _a.length) ? config.allow : defaults.allow,
        soft_deny: ((_b = config === null || config === void 0 ? void 0 : config.soft_deny) === null || _b === void 0 ? void 0 : _b.length)
            ? config.soft_deny
            : defaults.soft_deny,
        environment: ((_c = config === null || config === void 0 ? void 0 : config.environment) === null || _c === void 0 ? void 0 : _c.length)
            ? config.environment
            : defaults.environment,
    });
}
var CRITIQUE_SYSTEM_PROMPT = 'You are an expert reviewer of auto mode classifier rules for Claude Code.\n' +
    '\n' +
    'Claude Code has an "auto mode" that uses an AI classifier to decide whether ' +
    'tool calls should be auto-approved or require user confirmation. Users can ' +
    'write custom rules in three categories:\n' +
    '\n' +
    '- **allow**: Actions the classifier should auto-approve\n' +
    '- **soft_deny**: Actions the classifier should block (require user confirmation)\n' +
    "- **environment**: Context about the user's setup that helps the classifier make decisions\n" +
    '\n' +
    "Your job is to critique the user's custom rules for clarity, completeness, " +
    'and potential issues. The classifier is an LLM that reads these rules as ' +
    'part of its system prompt.\n' +
    '\n' +
    'For each rule, evaluate:\n' +
    '1. **Clarity**: Is the rule unambiguous? Could the classifier misinterpret it?\n' +
    "2. **Completeness**: Are there gaps or edge cases the rule doesn't cover?\n" +
    '3. **Conflicts**: Do any of the rules conflict with each other?\n' +
    '4. **Actionability**: Is the rule specific enough for the classifier to act on?\n' +
    '\n' +
    'Be concise and constructive. Only comment on rules that could be improved. ' +
    'If all rules look good, say so.';
function autoModeCritiqueHandler(options) {
    return __awaiter(this, void 0, void 0, function () {
        var config, hasCustomRules, model, defaults, classifierPrompt, userRulesSummary, response, error_1, textBlock;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    config = (0, settings_js_1.getAutoModeConfig)();
                    hasCustomRules = ((_b = (_a = config === null || config === void 0 ? void 0 : config.allow) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0 ||
                        ((_d = (_c = config === null || config === void 0 ? void 0 : config.soft_deny) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 ||
                        ((_f = (_e = config === null || config === void 0 ? void 0 : config.environment) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0) > 0;
                    if (!hasCustomRules) {
                        process.stdout.write('No custom auto mode rules found.\n\n' +
                            'Add rules to your settings file under autoMode.{allow, soft_deny, environment}.\n' +
                            'Run `claude auto-mode defaults` to see the default rules for reference.\n');
                        return [2 /*return*/];
                    }
                    model = options.model
                        ? (0, model_js_1.parseUserSpecifiedModel)(options.model)
                        : (0, model_js_1.getMainLoopModel)();
                    defaults = (0, yoloClassifier_js_1.getDefaultExternalAutoModeRules)();
                    classifierPrompt = (0, yoloClassifier_js_1.buildDefaultExternalSystemPrompt)();
                    userRulesSummary = formatRulesForCritique('allow', (_g = config === null || config === void 0 ? void 0 : config.allow) !== null && _g !== void 0 ? _g : [], defaults.allow) +
                        formatRulesForCritique('soft_deny', (_h = config === null || config === void 0 ? void 0 : config.soft_deny) !== null && _h !== void 0 ? _h : [], defaults.soft_deny) +
                        formatRulesForCritique('environment', (_j = config === null || config === void 0 ? void 0 : config.environment) !== null && _j !== void 0 ? _j : [], defaults.environment);
                    process.stdout.write('Analyzing your auto mode rules…\n\n');
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            querySource: 'auto_mode_critique',
                            model: model,
                            system: CRITIQUE_SYSTEM_PROMPT,
                            skipSystemPromptPrefix: true,
                            max_tokens: 4096,
                            messages: [
                                {
                                    role: 'user',
                                    content: 'Here is the full classifier system prompt that the auto mode classifier receives:\n\n' +
                                        '<classifier_system_prompt>\n' +
                                        classifierPrompt +
                                        '\n</classifier_system_prompt>\n\n' +
                                        "Here are the user's custom rules that REPLACE the corresponding default sections:\n\n" +
                                        userRulesSummary +
                                        '\nPlease critique these custom rules.',
                                },
                            ],
                        })];
                case 2:
                    response = _k.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _k.sent();
                    process.stderr.write('Failed to analyze rules: ' + (0, errors_js_1.errorMessage)(error_1) + '\n');
                    process.exitCode = 1;
                    return [2 /*return*/];
                case 4:
                    textBlock = response.content.find(function (block) { return block.type === 'text'; });
                    if ((textBlock === null || textBlock === void 0 ? void 0 : textBlock.type) === 'text') {
                        process.stdout.write(textBlock.text + '\n');
                    }
                    else {
                        process.stdout.write('No critique was generated. Please try again.\n');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function formatRulesForCritique(section, userRules, defaultRules) {
    if (userRules.length === 0)
        return '';
    var customLines = userRules.map(function (r) { return '- ' + r; }).join('\n');
    var defaultLines = defaultRules.map(function (r) { return '- ' + r; }).join('\n');
    return ('## ' +
        section +
        ' (custom rules replacing defaults)\n' +
        'Custom:\n' +
        customLines +
        '\n\n' +
        'Defaults being replaced:\n' +
        defaultLines +
        '\n\n');
}
