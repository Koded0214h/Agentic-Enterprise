"use strict";
// Content for the claude-api bundled skill.
// Each .md file is inlined as a string at build time via Bun's text loader.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKILL_FILES = exports.SKILL_PROMPT = exports.SKILL_MODEL_VARS = void 0;
var claude_api_md_1 = require("./claude-api/csharp/claude-api.md");
var examples_md_1 = require("./claude-api/curl/examples.md");
var claude_api_md_2 = require("./claude-api/go/claude-api.md");
var claude_api_md_3 = require("./claude-api/java/claude-api.md");
var claude_api_md_4 = require("./claude-api/php/claude-api.md");
var patterns_md_1 = require("./claude-api/python/agent-sdk/patterns.md");
var README_md_1 = require("./claude-api/python/agent-sdk/README.md");
var batches_md_1 = require("./claude-api/python/claude-api/batches.md");
var files_api_md_1 = require("./claude-api/python/claude-api/files-api.md");
var README_md_2 = require("./claude-api/python/claude-api/README.md");
var streaming_md_1 = require("./claude-api/python/claude-api/streaming.md");
var tool_use_md_1 = require("./claude-api/python/claude-api/tool-use.md");
var claude_api_md_5 = require("./claude-api/ruby/claude-api.md");
var SKILL_md_1 = require("./claude-api/SKILL.md");
var error_codes_md_1 = require("./claude-api/shared/error-codes.md");
var live_sources_md_1 = require("./claude-api/shared/live-sources.md");
var models_md_1 = require("./claude-api/shared/models.md");
var prompt_caching_md_1 = require("./claude-api/shared/prompt-caching.md");
var tool_use_concepts_md_1 = require("./claude-api/shared/tool-use-concepts.md");
var patterns_md_2 = require("./claude-api/typescript/agent-sdk/patterns.md");
var README_md_3 = require("./claude-api/typescript/agent-sdk/README.md");
var batches_md_2 = require("./claude-api/typescript/claude-api/batches.md");
var files_api_md_2 = require("./claude-api/typescript/claude-api/files-api.md");
var README_md_4 = require("./claude-api/typescript/claude-api/README.md");
var streaming_md_2 = require("./claude-api/typescript/claude-api/streaming.md");
var tool_use_md_2 = require("./claude-api/typescript/claude-api/tool-use.md");
// @[MODEL LAUNCH]: Update the model IDs/names below. These are substituted into {{VAR}}
// placeholders in the .md files at runtime before the skill prompt is sent.
// After updating these constants, manually update the two files that still hardcode models:
//   - claude-api/SKILL.md (Current Models pricing table)
//   - claude-api/shared/models.md (full model catalog with legacy versions and alias mappings)
exports.SKILL_MODEL_VARS = {
    OPUS_ID: 'claude-opus-4-6',
    OPUS_NAME: 'Claude Opus 4.6',
    SONNET_ID: 'claude-sonnet-4-6',
    SONNET_NAME: 'Claude Sonnet 4.6',
    HAIKU_ID: 'claude-haiku-4-5',
    HAIKU_NAME: 'Claude Haiku 4.5',
    // Previous Sonnet ID — used in "do not append date suffixes" example in SKILL.md.
    PREV_SONNET_ID: 'claude-sonnet-4-5',
};
exports.SKILL_PROMPT = SKILL_md_1.default;
exports.SKILL_FILES = {
    'csharp/claude-api.md': claude_api_md_1.default,
    'curl/examples.md': examples_md_1.default,
    'go/claude-api.md': claude_api_md_2.default,
    'java/claude-api.md': claude_api_md_3.default,
    'php/claude-api.md': claude_api_md_4.default,
    'python/agent-sdk/README.md': README_md_1.default,
    'python/agent-sdk/patterns.md': patterns_md_1.default,
    'python/claude-api/README.md': README_md_2.default,
    'python/claude-api/batches.md': batches_md_1.default,
    'python/claude-api/files-api.md': files_api_md_1.default,
    'python/claude-api/streaming.md': streaming_md_1.default,
    'python/claude-api/tool-use.md': tool_use_md_1.default,
    'ruby/claude-api.md': claude_api_md_5.default,
    'shared/error-codes.md': error_codes_md_1.default,
    'shared/live-sources.md': live_sources_md_1.default,
    'shared/models.md': models_md_1.default,
    'shared/prompt-caching.md': prompt_caching_md_1.default,
    'shared/tool-use-concepts.md': tool_use_concepts_md_1.default,
    'typescript/agent-sdk/README.md': README_md_3.default,
    'typescript/agent-sdk/patterns.md': patterns_md_2.default,
    'typescript/claude-api/README.md': README_md_4.default,
    'typescript/claude-api/batches.md': batches_md_2.default,
    'typescript/claude-api/files-api.md': files_api_md_2.default,
    'typescript/claude-api/streaming.md': streaming_md_2.default,
    'typescript/claude-api/tool-use.md': tool_use_md_2.default,
};
