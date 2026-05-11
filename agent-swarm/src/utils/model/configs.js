"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANONICAL_ID_TO_KEY = exports.CANONICAL_MODEL_IDS = exports.ALL_MODEL_CONFIGS = exports.CLAUDE_SONNET_4_6_CONFIG = exports.CLAUDE_OPUS_4_6_CONFIG = exports.CLAUDE_OPUS_4_5_CONFIG = exports.CLAUDE_OPUS_4_1_CONFIG = exports.CLAUDE_OPUS_4_CONFIG = exports.CLAUDE_SONNET_4_5_CONFIG = exports.CLAUDE_SONNET_4_CONFIG = exports.CLAUDE_HAIKU_4_5_CONFIG = exports.CLAUDE_3_5_HAIKU_CONFIG = exports.CLAUDE_3_5_V2_SONNET_CONFIG = exports.CLAUDE_3_7_SONNET_CONFIG = void 0;
// @[MODEL LAUNCH]: Add a new CLAUDE_*_CONFIG constant here. Double check the correct model strings
// here since the pattern may change.
exports.CLAUDE_3_7_SONNET_CONFIG = {
    firstParty: 'claude-3-7-sonnet-20250219',
    bedrock: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
    vertex: 'claude-3-7-sonnet@20250219',
    foundry: 'claude-3-7-sonnet',
};
exports.CLAUDE_3_5_V2_SONNET_CONFIG = {
    firstParty: 'claude-3-5-sonnet-20241022',
    bedrock: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    vertex: 'claude-3-5-sonnet-v2@20241022',
    foundry: 'claude-3-5-sonnet',
};
exports.CLAUDE_3_5_HAIKU_CONFIG = {
    firstParty: 'claude-3-5-haiku-20241022',
    bedrock: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
    vertex: 'claude-3-5-haiku@20241022',
    foundry: 'claude-3-5-haiku',
};
exports.CLAUDE_HAIKU_4_5_CONFIG = {
    firstParty: 'claude-haiku-4-5-20251001',
    bedrock: 'us.anthropic.claude-haiku-4-5-20251001-v1:0',
    vertex: 'claude-haiku-4-5@20251001',
    foundry: 'claude-haiku-4-5',
};
exports.CLAUDE_SONNET_4_CONFIG = {
    firstParty: 'claude-sonnet-4-20250514',
    bedrock: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    vertex: 'claude-sonnet-4@20250514',
    foundry: 'claude-sonnet-4',
};
exports.CLAUDE_SONNET_4_5_CONFIG = {
    firstParty: 'claude-sonnet-4-5-20250929',
    bedrock: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
    vertex: 'claude-sonnet-4-5@20250929',
    foundry: 'claude-sonnet-4-5',
};
exports.CLAUDE_OPUS_4_CONFIG = {
    firstParty: 'claude-opus-4-20250514',
    bedrock: 'us.anthropic.claude-opus-4-20250514-v1:0',
    vertex: 'claude-opus-4@20250514',
    foundry: 'claude-opus-4',
};
exports.CLAUDE_OPUS_4_1_CONFIG = {
    firstParty: 'claude-opus-4-1-20250805',
    bedrock: 'us.anthropic.claude-opus-4-1-20250805-v1:0',
    vertex: 'claude-opus-4-1@20250805',
    foundry: 'claude-opus-4-1',
};
exports.CLAUDE_OPUS_4_5_CONFIG = {
    firstParty: 'claude-opus-4-5-20251101',
    bedrock: 'us.anthropic.claude-opus-4-5-20251101-v1:0',
    vertex: 'claude-opus-4-5@20251101',
    foundry: 'claude-opus-4-5',
};
exports.CLAUDE_OPUS_4_6_CONFIG = {
    firstParty: 'claude-opus-4-6',
    bedrock: 'us.anthropic.claude-opus-4-6-v1',
    vertex: 'claude-opus-4-6',
    foundry: 'claude-opus-4-6',
};
exports.CLAUDE_SONNET_4_6_CONFIG = {
    firstParty: 'claude-sonnet-4-6',
    bedrock: 'us.anthropic.claude-sonnet-4-6',
    vertex: 'claude-sonnet-4-6',
    foundry: 'claude-sonnet-4-6',
};
// @[MODEL LAUNCH]: Register the new config here.
exports.ALL_MODEL_CONFIGS = {
    haiku35: exports.CLAUDE_3_5_HAIKU_CONFIG,
    haiku45: exports.CLAUDE_HAIKU_4_5_CONFIG,
    sonnet35: exports.CLAUDE_3_5_V2_SONNET_CONFIG,
    sonnet37: exports.CLAUDE_3_7_SONNET_CONFIG,
    sonnet40: exports.CLAUDE_SONNET_4_CONFIG,
    sonnet45: exports.CLAUDE_SONNET_4_5_CONFIG,
    sonnet46: exports.CLAUDE_SONNET_4_6_CONFIG,
    opus40: exports.CLAUDE_OPUS_4_CONFIG,
    opus41: exports.CLAUDE_OPUS_4_1_CONFIG,
    opus45: exports.CLAUDE_OPUS_4_5_CONFIG,
    opus46: exports.CLAUDE_OPUS_4_6_CONFIG,
};
/** Runtime list of canonical model IDs — used by comprehensiveness tests. */
exports.CANONICAL_MODEL_IDS = Object.values(exports.ALL_MODEL_CONFIGS).map(function (c) { return c.firstParty; });
/** Map canonical ID → internal short key. Used to apply settings-based modelOverrides. */
exports.CANONICAL_ID_TO_KEY = Object.fromEntries(Object.entries(exports.ALL_MODEL_CONFIGS).map(function (_a) {
    var key = _a[0], cfg = _a[1];
    return [cfg.firstParty, key];
}));
