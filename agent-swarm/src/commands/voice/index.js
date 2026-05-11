"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var voiceModeEnabled_js_1 = require("../../voice/voiceModeEnabled.js");
var voice = {
    type: 'local',
    name: 'voice',
    description: 'Toggle voice mode',
    availability: ['claude-ai'],
    isEnabled: function () { return (0, voiceModeEnabled_js_1.isVoiceGrowthBookEnabled)(); },
    get isHidden() {
        return !(0, voiceModeEnabled_js_1.isVoiceModeEnabled)();
    },
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./voice.js'); }); },
};
exports.default = voice;
