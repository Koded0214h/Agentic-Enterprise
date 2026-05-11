"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERTEX_COUNT_TOKENS_ALLOWED_BETAS = exports.BEDROCK_EXTRA_PARAMS_HEADERS = exports.ADVISOR_BETA_HEADER = exports.CLI_INTERNAL_BETA_HEADER = exports.AFK_MODE_BETA_HEADER = exports.SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER = exports.TOKEN_EFFICIENT_TOOLS_BETA_HEADER = exports.REDACT_THINKING_BETA_HEADER = exports.FAST_MODE_BETA_HEADER = exports.PROMPT_CACHING_SCOPE_BETA_HEADER = exports.TASK_BUDGETS_BETA_HEADER = exports.EFFORT_BETA_HEADER = exports.TOOL_SEARCH_BETA_HEADER_3P = exports.TOOL_SEARCH_BETA_HEADER_1P = exports.WEB_SEARCH_BETA_HEADER = exports.STRUCTURED_OUTPUTS_BETA_HEADER = exports.CONTEXT_MANAGEMENT_BETA_HEADER = exports.CONTEXT_1M_BETA_HEADER = exports.INTERLEAVED_THINKING_BETA_HEADER = exports.CLAUDE_CODE_20250219_BETA_HEADER = void 0;
var bun_bundle_1 = require("bun:bundle");
exports.CLAUDE_CODE_20250219_BETA_HEADER = 'claude-code-20250219';
exports.INTERLEAVED_THINKING_BETA_HEADER = 'interleaved-thinking-2025-05-14';
exports.CONTEXT_1M_BETA_HEADER = 'context-1m-2025-08-07';
exports.CONTEXT_MANAGEMENT_BETA_HEADER = 'context-management-2025-06-27';
exports.STRUCTURED_OUTPUTS_BETA_HEADER = 'structured-outputs-2025-12-15';
exports.WEB_SEARCH_BETA_HEADER = 'web-search-2025-03-05';
// Tool search beta headers differ by provider:
// - Claude API / Foundry: advanced-tool-use-2025-11-20
// - Vertex AI / Bedrock: tool-search-tool-2025-10-19
exports.TOOL_SEARCH_BETA_HEADER_1P = 'advanced-tool-use-2025-11-20';
exports.TOOL_SEARCH_BETA_HEADER_3P = 'tool-search-tool-2025-10-19';
exports.EFFORT_BETA_HEADER = 'effort-2025-11-24';
exports.TASK_BUDGETS_BETA_HEADER = 'task-budgets-2026-03-13';
exports.PROMPT_CACHING_SCOPE_BETA_HEADER = 'prompt-caching-scope-2026-01-05';
exports.FAST_MODE_BETA_HEADER = 'fast-mode-2026-02-01';
exports.REDACT_THINKING_BETA_HEADER = 'redact-thinking-2026-02-12';
exports.TOKEN_EFFICIENT_TOOLS_BETA_HEADER = 'token-efficient-tools-2026-03-28';
exports.SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER = (0, bun_bundle_1.feature)('CONNECTOR_TEXT')
    ? 'summarize-connector-text-2026-03-13'
    : '';
exports.AFK_MODE_BETA_HEADER = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? 'afk-mode-2026-01-31'
    : '';
exports.CLI_INTERNAL_BETA_HEADER = process.env.USER_TYPE === 'ant' ? 'cli-internal-2026-02-09' : '';
exports.ADVISOR_BETA_HEADER = 'advisor-tool-2026-03-01';
/**
 * Bedrock only supports a limited number of beta headers and only through
 * extraBodyParams. This set maintains the beta strings that should be in
 * Bedrock extraBodyParams *and not* in Bedrock headers.
 */
exports.BEDROCK_EXTRA_PARAMS_HEADERS = new Set([
    exports.INTERLEAVED_THINKING_BETA_HEADER,
    exports.CONTEXT_1M_BETA_HEADER,
    exports.TOOL_SEARCH_BETA_HEADER_3P,
]);
/**
 * Betas allowed on Vertex countTokens API.
 * Other betas will cause 400 errors.
 */
exports.VERTEX_COUNT_TOKENS_ALLOWED_BETAS = new Set([
    exports.CLAUDE_CODE_20250219_BETA_HEADER,
    exports.INTERLEAVED_THINKING_BETA_HEADER,
    exports.CONTEXT_MANAGEMENT_BETA_HEADER,
]);
