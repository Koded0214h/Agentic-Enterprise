"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHardcodedTeammateModelFallback = getHardcodedTeammateModelFallback;
var configs_js_1 = require("../model/configs.js");
var providers_js_1 = require("../model/providers.js");
// @[MODEL LAUNCH]: Update the fallback model below.
// When the user has never set teammateDefaultModel in /config, new teammates
// use Opus 4.6. Must be provider-aware so Bedrock/Vertex/Foundry customers get
// the correct model ID.
function getHardcodedTeammateModelFallback() {
    return configs_js_1.CLAUDE_OPUS_4_6_CONFIG[(0, providers_js_1.getAPIProvider)()];
}
