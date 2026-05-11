"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get3PModelCapabilityOverride = void 0;
var memoize_js_1 = require("lodash-es/memoize.js");
var providers_js_1 = require("./providers.js");
var TIERS = [
    {
        modelEnvVar: 'ANTHROPIC_DEFAULT_OPUS_MODEL',
        capabilitiesEnvVar: 'ANTHROPIC_DEFAULT_OPUS_MODEL_SUPPORTED_CAPABILITIES',
    },
    {
        modelEnvVar: 'ANTHROPIC_DEFAULT_SONNET_MODEL',
        capabilitiesEnvVar: 'ANTHROPIC_DEFAULT_SONNET_MODEL_SUPPORTED_CAPABILITIES',
    },
    {
        modelEnvVar: 'ANTHROPIC_DEFAULT_HAIKU_MODEL',
        capabilitiesEnvVar: 'ANTHROPIC_DEFAULT_HAIKU_MODEL_SUPPORTED_CAPABILITIES',
    },
];
/**
 * Check whether a 3p model capability override is set for a model that matches one of
 * the pinned ANTHROPIC_DEFAULT_*_MODEL env vars.
 */
exports.get3PModelCapabilityOverride = (0, memoize_js_1.default)(function (model, capability) {
    if ((0, providers_js_1.getAPIProvider)() === 'firstParty') {
        return undefined;
    }
    var m = model.toLowerCase();
    for (var _i = 0, TIERS_1 = TIERS; _i < TIERS_1.length; _i++) {
        var tier = TIERS_1[_i];
        var pinned = process.env[tier.modelEnvVar];
        var capabilities = process.env[tier.capabilitiesEnvVar];
        if (!pinned || capabilities === undefined)
            continue;
        if (m !== pinned.toLowerCase())
            continue;
        return capabilities
            .toLowerCase()
            .split(',')
            .map(function (s) { return s.trim(); })
            .includes(capability);
    }
    return undefined;
}, function (model, capability) { return "".concat(model.toLowerCase(), ":").concat(capability); });
