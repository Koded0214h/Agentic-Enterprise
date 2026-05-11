"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESCRIPTION = void 0;
exports.generatePrompt = generatePrompt;
var bun_bundle_1 = require("bun:bundle");
var modelOptions_js_1 = require("../../utils/model/modelOptions.js");
var voiceModeEnabled_js_1 = require("../../voice/voiceModeEnabled.js");
var supportedSettings_js_1 = require("./supportedSettings.js");
exports.DESCRIPTION = 'Get or set Claude Code configuration settings.';
/**
 * Generate the prompt documentation from the registry
 */
function generatePrompt() {
    var globalSettings = [];
    var projectSettings = [];
    for (var _i = 0, _a = Object.entries(supportedSettings_js_1.SUPPORTED_SETTINGS); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], config = _b[1];
        // Skip model - it gets its own section with dynamic options
        if (key === 'model')
            continue;
        // Voice settings are registered at build-time but gated by GrowthBook
        // at runtime. Hide from model prompt when the kill-switch is on.
        if ((0, bun_bundle_1.feature)('VOICE_MODE') &&
            key === 'voiceEnabled' &&
            !(0, voiceModeEnabled_js_1.isVoiceGrowthBookEnabled)())
            continue;
        var options = (0, supportedSettings_js_1.getOptionsForSetting)(key);
        var line = "- ".concat(key);
        if (options) {
            line += ": ".concat(options.map(function (o) { return "\"".concat(o, "\""); }).join(', '));
        }
        else if (config.type === 'boolean') {
            line += ": true/false";
        }
        line += " - ".concat(config.description);
        if (config.source === 'global') {
            globalSettings.push(line);
        }
        else {
            projectSettings.push(line);
        }
    }
    var modelSection = generateModelSection();
    return "Get or set Claude Code configuration settings.\n\n  View or change Claude Code settings. Use when the user requests configuration changes, asks about current settings, or when adjusting a setting would benefit them.\n\n\n## Usage\n- **Get current value:** Omit the \"value\" parameter\n- **Set new value:** Include the \"value\" parameter\n\n## Configurable settings list\nThe following settings are available for you to change:\n\n### Global Settings (stored in ~/.claude.json)\n".concat(globalSettings.join('\n'), "\n\n### Project Settings (stored in settings.json)\n").concat(projectSettings.join('\n'), "\n\n").concat(modelSection, "\n## Examples\n- Get theme: { \"setting\": \"theme\" }\n- Set dark theme: { \"setting\": \"theme\", \"value\": \"dark\" }\n- Enable vim mode: { \"setting\": \"editorMode\", \"value\": \"vim\" }\n- Enable verbose: { \"setting\": \"verbose\", \"value\": true }\n- Change model: { \"setting\": \"model\", \"value\": \"opus\" }\n- Change permission mode: { \"setting\": \"permissions.defaultMode\", \"value\": \"plan\" }\n");
}
function generateModelSection() {
    try {
        var options = (0, modelOptions_js_1.getModelOptions)();
        var lines = options.map(function (o) {
            var _a;
            var value = o.value === null ? 'null/"default"' : "\"".concat(o.value, "\"");
            return "  - ".concat(value, ": ").concat((_a = o.descriptionForModel) !== null && _a !== void 0 ? _a : o.description);
        });
        return "## Model\n- model - Override the default model. Available options:\n".concat(lines.join('\n'));
    }
    catch (_a) {
        return "## Model\n- model - Override the default model (sonnet, opus, haiku, best, or full model ID)";
    }
}
