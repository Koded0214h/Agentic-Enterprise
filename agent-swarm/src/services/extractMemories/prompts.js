"use strict";
/**
 * Prompt templates for the background memory extraction agent.
 *
 * The extraction agent runs as a perfect fork of the main conversation — same
 * system prompt, same message prefix. The main agent's system prompt always
 * has full save instructions; when the main agent writes memories itself,
 * extractMemories.ts skips that turn (hasMemoryWritesSince). This prompt
 * fires only when the main agent didn't write, so the save-criteria here
 * overlap the system prompt's harmlessly.
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildExtractAutoOnlyPrompt = buildExtractAutoOnlyPrompt;
exports.buildExtractCombinedPrompt = buildExtractCombinedPrompt;
var bun_bundle_1 = require("bun:bundle");
var memoryTypes_js_1 = require("../../memdir/memoryTypes.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../../tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("../../tools/GlobTool/prompt.js");
var prompt_js_4 = require("../../tools/GrepTool/prompt.js");
/**
 * Shared opener for both extract-prompt variants.
 */
function opener(newMessageCount, existingMemories) {
    var manifest = existingMemories.length > 0
        ? "\n\n## Existing memory files\n\n".concat(existingMemories, "\n\nCheck this list before writing \u2014 update an existing file rather than creating a duplicate.")
        : '';
    return [
        "You are now acting as the memory extraction subagent. Analyze the most recent ~".concat(newMessageCount, " messages above and use them to update your persistent memory systems."),
        '',
        "Available tools: ".concat(prompt_js_1.FILE_READ_TOOL_NAME, ", ").concat(prompt_js_4.GREP_TOOL_NAME, ", ").concat(prompt_js_3.GLOB_TOOL_NAME, ", read-only ").concat(toolName_js_1.BASH_TOOL_NAME, " (ls/find/cat/stat/wc/head/tail and similar), and ").concat(constants_js_1.FILE_EDIT_TOOL_NAME, "/").concat(prompt_js_2.FILE_WRITE_TOOL_NAME, " for paths inside the memory directory only. ").concat(toolName_js_1.BASH_TOOL_NAME, " rm is not permitted. All other tools \u2014 MCP, Agent, write-capable ").concat(toolName_js_1.BASH_TOOL_NAME, ", etc \u2014 will be denied."),
        '',
        "You have a limited turn budget. ".concat(constants_js_1.FILE_EDIT_TOOL_NAME, " requires a prior ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " of the same file, so the efficient strategy is: turn 1 \u2014 issue all ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " calls in parallel for every file you might update; turn 2 \u2014 issue all ").concat(prompt_js_2.FILE_WRITE_TOOL_NAME, "/").concat(constants_js_1.FILE_EDIT_TOOL_NAME, " calls in parallel. Do not interleave reads and writes across multiple turns."),
        '',
        "You MUST only use content from the last ~".concat(newMessageCount, " messages to update your persistent memories. Do not waste any turns attempting to investigate or verify that content further \u2014 no grepping source files, no reading code to confirm a pattern exists, no git commands.") +
            manifest,
    ].join('\n');
}
/**
 * Build the extraction prompt for auto-only memory (no team memory).
 * Four-type taxonomy, no scope guidance (single directory).
 */
function buildExtractAutoOnlyPrompt(newMessageCount, existingMemories, skipIndex) {
    if (skipIndex === void 0) { skipIndex = false; }
    var howToSave = skipIndex
        ? __spreadArray(__spreadArray([
            '## How to save memories',
            '',
            'Write each memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:',
            ''
        ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
            '',
            '- Organize memory semantically by topic, not chronologically',
            '- Update or remove memories that turn out to be wrong or outdated',
            '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
        ], false) : __spreadArray(__spreadArray([
        '## How to save memories',
        '',
        'Saving a memory is a two-step process:',
        '',
        '**Step 1** — write the memory to its own file (e.g., `user_role.md`, `feedback_testing.md`) using this frontmatter format:',
        ''
    ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
        '',
        '**Step 2** — add a pointer to that file in `MEMORY.md`. `MEMORY.md` is an index, not a memory — each entry should be one line, under ~150 characters: `- [Title](file.md) — one-line hook`. It has no frontmatter. Never write memory content directly into `MEMORY.md`.',
        '',
        '- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep the index concise',
        '- Organize memory semantically by topic, not chronologically',
        '- Update or remove memories that turn out to be wrong or outdated',
        '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
    ], false);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray([
        opener(newMessageCount, existingMemories),
        '',
        'If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.',
        ''
    ], memoryTypes_js_1.TYPES_SECTION_INDIVIDUAL, true), memoryTypes_js_1.WHAT_NOT_TO_SAVE_SECTION, true), [
        ''
    ], false), howToSave, true).join('\n');
}
/**
 * Build the extraction prompt for combined auto + team memory.
 * Four-type taxonomy with per-type <scope> guidance (directory choice
 * is baked into each type block, no separate routing section needed).
 */
function buildExtractCombinedPrompt(newMessageCount, existingMemories, skipIndex) {
    if (skipIndex === void 0) { skipIndex = false; }
    if (!(0, bun_bundle_1.feature)('TEAMMEM')) {
        return buildExtractAutoOnlyPrompt(newMessageCount, existingMemories, skipIndex);
    }
    var howToSave = skipIndex
        ? __spreadArray(__spreadArray([
            '## How to save memories',
            '',
            "Write each memory to its own file in the chosen directory (private or team, per the type's scope guidance) using this frontmatter format:",
            ''
        ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
            '',
            '- Organize memory semantically by topic, not chronologically',
            '- Update or remove memories that turn out to be wrong or outdated',
            '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
        ], false) : __spreadArray(__spreadArray([
        '## How to save memories',
        '',
        'Saving a memory is a two-step process:',
        '',
        "**Step 1** — write the memory to its own file in the chosen directory (private or team, per the type's scope guidance) using this frontmatter format:",
        ''
    ], memoryTypes_js_1.MEMORY_FRONTMATTER_EXAMPLE, true), [
        '',
        "**Step 2** — add a pointer to that file in the same directory's `MEMORY.md`. Each directory (private and team) has its own `MEMORY.md` index — each entry should be one line, under ~150 characters: `- [Title](file.md) — one-line hook`. They have no frontmatter. Never write memory content directly into a `MEMORY.md`.",
        '',
        '- Both `MEMORY.md` indexes are loaded into your system prompt — lines after 200 will be truncated, so keep them concise',
        '- Organize memory semantically by topic, not chronologically',
        '- Update or remove memories that turn out to be wrong or outdated',
        '- Do not write duplicate memories. First check if there is an existing memory you can update before writing a new one.',
    ], false);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray([
        opener(newMessageCount, existingMemories),
        '',
        'If the user explicitly asks you to remember something, save it immediately as whichever type fits best. If they ask you to forget something, find and remove the relevant entry.',
        ''
    ], memoryTypes_js_1.TYPES_SECTION_COMBINED, true), memoryTypes_js_1.WHAT_NOT_TO_SAVE_SECTION, true), [
        '- You MUST avoid saving sensitive data within shared team memories. For example, never save API keys or user credentials.',
        ''
    ], false), howToSave, true).join('\n');
}
