"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companionIntroText = companionIntroText;
exports.getCompanionIntroAttachment = getCompanionIntroAttachment;
var bun_bundle_1 = require("bun:bundle");
var config_js_1 = require("../utils/config.js");
var companion_js_1 = require("./companion.js");
function companionIntroText(name, species) {
    return "# Companion\n\nA small ".concat(species, " named ").concat(name, " sits beside the user's input box and occasionally comments in a speech bubble. You're not ").concat(name, " \u2014 it's a separate watcher.\n\nWhen the user addresses ").concat(name, " directly (by name), its bubble will answer. Your job in that moment is to stay out of the way: respond in ONE line or less, or just answer any part of the message meant for you. Don't explain that you're not ").concat(name, " \u2014 they know. Don't narrate what ").concat(name, " might say \u2014 the bubble handles that.");
}
function getCompanionIntroAttachment(messages) {
    if (!(0, bun_bundle_1.feature)('BUDDY'))
        return [];
    var companion = (0, companion_js_1.getCompanion)();
    if (!companion || (0, config_js_1.getGlobalConfig)().companionMuted)
        return [];
    // Skip if already announced for this companion.
    for (var _i = 0, _a = messages !== null && messages !== void 0 ? messages : []; _i < _a.length; _i++) {
        var msg = _a[_i];
        if (msg.type !== 'attachment')
            continue;
        if (msg.attachment.type !== 'companion_intro')
            continue;
        if (msg.attachment.name === companion.name)
            return [];
    }
    return [
        {
            type: 'companion_intro',
            name: companion.name,
            species: companion.species,
        },
    ];
}
