"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartialCompactPrompt = getPartialCompactPrompt;
exports.getCompactPrompt = getCompactPrompt;
exports.formatCompactSummary = formatCompactSummary;
exports.getCompactUserSummaryMessage = getCompactUserSummaryMessage;
var bun_bundle_1 = require("bun:bundle");
// Dead code elimination: conditional import for proactive mode
/* eslint-disable @typescript-eslint/no-require-imports */
var proactiveModule = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('../../proactive/index.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
// Aggressive no-tools preamble. The cache-sharing fork path inherits the
// parent's full tool set (required for cache-key match), and on Sonnet 4.6+
// adaptive-thinking models the model sometimes attempts a tool call despite
// the weaker trailer instruction. With maxTurns: 1, a denied tool call means
// no text output → falls through to the streaming fallback (2.79% on 4.6 vs
// 0.01% on 4.5). Putting this FIRST and making it explicit about rejection
// consequences prevents the wasted turn.
var NO_TOOLS_PREAMBLE = "CRITICAL: Respond with TEXT ONLY. Do NOT call any tools.\n\n- Do NOT use Read, Bash, Grep, Glob, Edit, Write, or ANY other tool.\n- You already have all the context you need in the conversation above.\n- Tool calls will be REJECTED and will waste your only turn \u2014 you will fail the task.\n- Your entire response must be plain text: an <analysis> block followed by a <summary> block.\n\n";
// Two variants: BASE scopes to "the conversation", PARTIAL scopes to "the
// recent messages". The <analysis> block is a drafting scratchpad that
// formatCompactSummary() strips before the summary reaches context.
var DETAILED_ANALYSIS_INSTRUCTION_BASE = "Before providing your final summary, wrap your analysis in <analysis> tags to organize your thoughts and ensure you've covered all necessary points. In your analysis process:\n\n1. Chronologically analyze each message and section of the conversation. For each section thoroughly identify:\n   - The user's explicit requests and intents\n   - Your approach to addressing the user's requests\n   - Key decisions, technical concepts and code patterns\n   - Specific details like:\n     - file names\n     - full code snippets\n     - function signatures\n     - file edits\n   - Errors that you ran into and how you fixed them\n   - Pay special attention to specific user feedback that you received, especially if the user told you to do something differently.\n2. Double-check for technical accuracy and completeness, addressing each required element thoroughly.";
var DETAILED_ANALYSIS_INSTRUCTION_PARTIAL = "Before providing your final summary, wrap your analysis in <analysis> tags to organize your thoughts and ensure you've covered all necessary points. In your analysis process:\n\n1. Analyze the recent messages chronologically. For each section thoroughly identify:\n   - The user's explicit requests and intents\n   - Your approach to addressing the user's requests\n   - Key decisions, technical concepts and code patterns\n   - Specific details like:\n     - file names\n     - full code snippets\n     - function signatures\n     - file edits\n   - Errors that you ran into and how you fixed them\n   - Pay special attention to specific user feedback that you received, especially if the user told you to do something differently.\n2. Double-check for technical accuracy and completeness, addressing each required element thoroughly.";
var BASE_COMPACT_PROMPT = "Your task is to create a detailed summary of the conversation so far, paying close attention to the user's explicit requests and your previous actions.\nThis summary should be thorough in capturing technical details, code patterns, and architectural decisions that would be essential for continuing development work without losing context.\n\n".concat(DETAILED_ANALYSIS_INSTRUCTION_BASE, "\n\nYour summary should include the following sections:\n\n1. Primary Request and Intent: Capture all of the user's explicit requests and intents in detail\n2. Key Technical Concepts: List all important technical concepts, technologies, and frameworks discussed.\n3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Pay special attention to the most recent messages and include full code snippets where applicable and include a summary of why this file read or edit is important.\n4. Errors and fixes: List all errors that you ran into, and how you fixed them. Pay special attention to specific user feedback that you received, especially if the user told you to do something differently.\n5. Problem Solving: Document problems solved and any ongoing troubleshooting efforts.\n6. All user messages: List ALL user messages that are not tool results. These are critical for understanding the users' feedback and changing intent.\n7. Pending Tasks: Outline any pending tasks that you have explicitly been asked to work on.\n8. Current Work: Describe in detail precisely what was being worked on immediately before this summary request, paying special attention to the most recent messages from both user and assistant. Include file names and code snippets where applicable.\n9. Optional Next Step: List the next step that you will take that is related to the most recent work you were doing. IMPORTANT: ensure that this step is DIRECTLY in line with the user's most recent explicit requests, and the task you were working on immediately before this summary request. If your last task was concluded, then only list next steps if they are explicitly in line with the users request. Do not start on tangential requests or really old requests that were already completed without confirming with the user first.\n                       If there is a next step, include direct quotes from the most recent conversation showing exactly what task you were working on and where you left off. This should be verbatim to ensure there's no drift in task interpretation.\n\nHere's an example of how your output should be structured:\n\n<example>\n<analysis>\n[Your thought process, ensuring all points are covered thoroughly and accurately]\n</analysis>\n\n<summary>\n1. Primary Request and Intent:\n   [Detailed description]\n\n2. Key Technical Concepts:\n   - [Concept 1]\n   - [Concept 2]\n   - [...]\n\n3. Files and Code Sections:\n   - [File Name 1]\n      - [Summary of why this file is important]\n      - [Summary of the changes made to this file, if any]\n      - [Important Code Snippet]\n   - [File Name 2]\n      - [Important Code Snippet]\n   - [...]\n\n4. Errors and fixes:\n    - [Detailed description of error 1]:\n      - [How you fixed the error]\n      - [User feedback on the error if any]\n    - [...]\n\n5. Problem Solving:\n   [Description of solved problems and ongoing troubleshooting]\n\n6. All user messages: \n    - [Detailed non tool use user message]\n    - [...]\n\n7. Pending Tasks:\n   - [Task 1]\n   - [Task 2]\n   - [...]\n\n8. Current Work:\n   [Precise description of current work]\n\n9. Optional Next Step:\n   [Optional Next step to take]\n\n</summary>\n</example>\n\nPlease provide your summary based on the conversation so far, following this structure and ensuring precision and thoroughness in your response. \n\nThere may be additional summarization instructions provided in the included context. If so, remember to follow these instructions when creating the above summary. Examples of instructions include:\n<example>\n## Compact Instructions\nWhen summarizing the conversation focus on typescript code changes and also remember the mistakes you made and how you fixed them.\n</example>\n\n<example>\n# Summary instructions\nWhen you are using compact - please focus on test output and code changes. Include file reads verbatim.\n</example>\n");
var PARTIAL_COMPACT_PROMPT = "Your task is to create a detailed summary of the RECENT portion of the conversation \u2014 the messages that follow earlier retained context. The earlier messages are being kept intact and do NOT need to be summarized. Focus your summary on what was discussed, learned, and accomplished in the recent messages only.\n\n".concat(DETAILED_ANALYSIS_INSTRUCTION_PARTIAL, "\n\nYour summary should include the following sections:\n\n1. Primary Request and Intent: Capture the user's explicit requests and intents from the recent messages\n2. Key Technical Concepts: List important technical concepts, technologies, and frameworks discussed recently.\n3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Include full code snippets where applicable and include a summary of why this file read or edit is important.\n4. Errors and fixes: List errors encountered and how they were fixed.\n5. Problem Solving: Document problems solved and any ongoing troubleshooting efforts.\n6. All user messages: List ALL user messages from the recent portion that are not tool results.\n7. Pending Tasks: Outline any pending tasks from the recent messages.\n8. Current Work: Describe precisely what was being worked on immediately before this summary request.\n9. Optional Next Step: List the next step related to the most recent work. Include direct quotes from the most recent conversation.\n\nHere's an example of how your output should be structured:\n\n<example>\n<analysis>\n[Your thought process, ensuring all points are covered thoroughly and accurately]\n</analysis>\n\n<summary>\n1. Primary Request and Intent:\n   [Detailed description]\n\n2. Key Technical Concepts:\n   - [Concept 1]\n   - [Concept 2]\n\n3. Files and Code Sections:\n   - [File Name 1]\n      - [Summary of why this file is important]\n      - [Important Code Snippet]\n\n4. Errors and fixes:\n    - [Error description]:\n      - [How you fixed it]\n\n5. Problem Solving:\n   [Description]\n\n6. All user messages:\n    - [Detailed non tool use user message]\n\n7. Pending Tasks:\n   - [Task 1]\n\n8. Current Work:\n   [Precise description of current work]\n\n9. Optional Next Step:\n   [Optional Next step to take]\n\n</summary>\n</example>\n\nPlease provide your summary based on the RECENT messages only (after the retained earlier context), following this structure and ensuring precision and thoroughness in your response.\n");
// 'up_to': model sees only the summarized prefix (cache hit). Summary will
// precede kept recent messages, hence "Context for Continuing Work" section.
var PARTIAL_COMPACT_UP_TO_PROMPT = "Your task is to create a detailed summary of this conversation. This summary will be placed at the start of a continuing session; newer messages that build on this context will follow after your summary (you do not see them here). Summarize thoroughly so that someone reading only your summary and then the newer messages can fully understand what happened and continue the work.\n\n".concat(DETAILED_ANALYSIS_INSTRUCTION_BASE, "\n\nYour summary should include the following sections:\n\n1. Primary Request and Intent: Capture the user's explicit requests and intents in detail\n2. Key Technical Concepts: List important technical concepts, technologies, and frameworks discussed.\n3. Files and Code Sections: Enumerate specific files and code sections examined, modified, or created. Include full code snippets where applicable and include a summary of why this file read or edit is important.\n4. Errors and fixes: List errors encountered and how they were fixed.\n5. Problem Solving: Document problems solved and any ongoing troubleshooting efforts.\n6. All user messages: List ALL user messages that are not tool results.\n7. Pending Tasks: Outline any pending tasks.\n8. Work Completed: Describe what was accomplished by the end of this portion.\n9. Context for Continuing Work: Summarize any context, decisions, or state that would be needed to understand and continue the work in subsequent messages.\n\nHere's an example of how your output should be structured:\n\n<example>\n<analysis>\n[Your thought process, ensuring all points are covered thoroughly and accurately]\n</analysis>\n\n<summary>\n1. Primary Request and Intent:\n   [Detailed description]\n\n2. Key Technical Concepts:\n   - [Concept 1]\n   - [Concept 2]\n\n3. Files and Code Sections:\n   - [File Name 1]\n      - [Summary of why this file is important]\n      - [Important Code Snippet]\n\n4. Errors and fixes:\n    - [Error description]:\n      - [How you fixed it]\n\n5. Problem Solving:\n   [Description]\n\n6. All user messages:\n    - [Detailed non tool use user message]\n\n7. Pending Tasks:\n   - [Task 1]\n\n8. Work Completed:\n   [Description of what was accomplished]\n\n9. Context for Continuing Work:\n   [Key context, decisions, or state needed to continue the work]\n\n</summary>\n</example>\n\nPlease provide your summary following this structure, ensuring precision and thoroughness in your response.\n");
var NO_TOOLS_TRAILER = '\n\nREMINDER: Do NOT call any tools. Respond with plain text only — ' +
    'an <analysis> block followed by a <summary> block. ' +
    'Tool calls will be rejected and you will fail the task.';
function getPartialCompactPrompt(customInstructions, direction) {
    if (direction === void 0) { direction = 'from'; }
    var template = direction === 'up_to'
        ? PARTIAL_COMPACT_UP_TO_PROMPT
        : PARTIAL_COMPACT_PROMPT;
    var prompt = NO_TOOLS_PREAMBLE + template;
    if (customInstructions && customInstructions.trim() !== '') {
        prompt += "\n\nAdditional Instructions:\n".concat(customInstructions);
    }
    prompt += NO_TOOLS_TRAILER;
    return prompt;
}
function getCompactPrompt(customInstructions) {
    var prompt = NO_TOOLS_PREAMBLE + BASE_COMPACT_PROMPT;
    if (customInstructions && customInstructions.trim() !== '') {
        prompt += "\n\nAdditional Instructions:\n".concat(customInstructions);
    }
    prompt += NO_TOOLS_TRAILER;
    return prompt;
}
/**
 * Formats the compact summary by stripping the <analysis> drafting scratchpad
 * and replacing <summary> XML tags with readable section headers.
 * @param summary The raw summary string potentially containing <analysis> and <summary> XML tags
 * @returns The formatted summary with analysis stripped and summary tags replaced by headers
 */
function formatCompactSummary(summary) {
    var formattedSummary = summary;
    // Strip analysis section — it's a drafting scratchpad that improves summary
    // quality but has no informational value once the summary is written.
    formattedSummary = formattedSummary.replace(/<analysis>[\s\S]*?<\/analysis>/, '');
    // Extract and format summary section
    var summaryMatch = formattedSummary.match(/<summary>([\s\S]*?)<\/summary>/);
    if (summaryMatch) {
        var content = summaryMatch[1] || '';
        formattedSummary = formattedSummary.replace(/<summary>[\s\S]*?<\/summary>/, "Summary:\n".concat(content.trim()));
    }
    // Clean up extra whitespace between sections
    formattedSummary = formattedSummary.replace(/\n\n+/g, '\n\n');
    return formattedSummary.trim();
}
function getCompactUserSummaryMessage(summary, suppressFollowUpQuestions, transcriptPath, recentMessagesPreserved) {
    var formattedSummary = formatCompactSummary(summary);
    var baseSummary = "This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.\n\n".concat(formattedSummary);
    if (transcriptPath) {
        baseSummary += "\n\nIf you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: ".concat(transcriptPath);
    }
    if (recentMessagesPreserved) {
        baseSummary += "\n\nRecent messages are preserved verbatim.";
    }
    if (suppressFollowUpQuestions) {
        var continuation = "".concat(baseSummary, "\nContinue the conversation from where it left off without asking the user any further questions. Resume directly \u2014 do not acknowledge the summary, do not recap what was happening, do not preface with \"I'll continue\" or similar. Pick up the last task as if the break never happened.");
        if (((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
            (proactiveModule === null || proactiveModule === void 0 ? void 0 : proactiveModule.isProactiveActive())) {
            continuation += "\n\nYou are running in autonomous/proactive mode. This is NOT a first wake-up \u2014 you were already working autonomously before compaction. Continue your work loop: pick up where you left off based on the summary above. Do not greet the user or ask what to work on.";
        }
        return continuation;
    }
    return baseSummary;
}
