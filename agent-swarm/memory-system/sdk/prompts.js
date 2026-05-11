"use strict";
/**
 * SDK Prompts Module
 * Generates prompts for the Claude Agent SDK memory worker
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInitPrompt = buildInitPrompt;
exports.buildObservationPrompt = buildObservationPrompt;
exports.buildSummaryPrompt = buildSummaryPrompt;
exports.buildContinuationPrompt = buildContinuationPrompt;
var logger_js_1 = require("../utils/logger.js");
/**
 * Build initial prompt to initialize the SDK agent
 */
function buildInitPrompt(project, sessionId, userPrompt, mode) {
    return "".concat(mode.prompts.system_identity, "\n\n<observed_from_primary_session>\n  <user_request>").concat(userPrompt, "</user_request>\n  <requested_at>").concat(new Date().toISOString().split('T')[0], "</requested_at>\n</observed_from_primary_session>\n\n").concat(mode.prompts.observer_role, "\n\n").concat(mode.prompts.spatial_awareness, "\n\n").concat(mode.prompts.recording_focus, "\n\n").concat(mode.prompts.skip_guidance, "\n\n").concat(mode.prompts.output_format_header, "\n\n```xml\n<observation>\n  <type>[ ").concat(mode.observation_types.map(function (t) { return t.id; }).join(' | '), " ]</type>\n  <!--\n    ").concat(mode.prompts.type_guidance, "\n  -->\n  <title>").concat(mode.prompts.xml_title_placeholder, "</title>\n  <subtitle>").concat(mode.prompts.xml_subtitle_placeholder, "</subtitle>\n  <facts>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n  </facts>\n  <!--\n    ").concat(mode.prompts.field_guidance, "\n  -->\n  <narrative>").concat(mode.prompts.xml_narrative_placeholder, "</narrative>\n  <concepts>\n    <concept>").concat(mode.prompts.xml_concept_placeholder, "</concept>\n    <concept>").concat(mode.prompts.xml_concept_placeholder, "</concept>\n  </concepts>\n  <!--\n    ").concat(mode.prompts.concept_guidance, "\n  -->\n  <files_read>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n  </files_read>\n  <files_modified>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n  </files_modified>\n</observation>\n```\n").concat(mode.prompts.format_examples, "\n\n").concat(mode.prompts.footer, "\n\n").concat(mode.prompts.header_memory_start);
}
/**
 * Build prompt to send tool observation to SDK agent
 */
function buildObservationPrompt(obs) {
    // Safely parse tool_input and tool_output - they're already JSON strings
    var toolInput;
    var toolOutput;
    try {
        toolInput = typeof obs.tool_input === 'string' ? JSON.parse(obs.tool_input) : obs.tool_input;
    }
    catch (error) {
        logger_js_1.logger.debug('SDK', 'Tool input is plain string, using as-is', {
            toolName: obs.tool_name
        }, error);
        toolInput = obs.tool_input;
    }
    try {
        toolOutput = typeof obs.tool_output === 'string' ? JSON.parse(obs.tool_output) : obs.tool_output;
    }
    catch (error) {
        logger_js_1.logger.debug('SDK', 'Tool output is plain string, using as-is', {
            toolName: obs.tool_name
        }, error);
        toolOutput = obs.tool_output;
    }
    return "<observed_from_primary_session>\n  <what_happened>".concat(obs.tool_name, "</what_happened>\n  <occurred_at>").concat(new Date(obs.created_at_epoch).toISOString(), "</occurred_at>").concat(obs.cwd ? "\n  <working_directory>".concat(obs.cwd, "</working_directory>") : '', "\n  <parameters>").concat(JSON.stringify(toolInput, null, 2), "</parameters>\n  <outcome>").concat(JSON.stringify(toolOutput, null, 2), "</outcome>\n</observed_from_primary_session>");
}
/**
 * Build prompt to generate progress summary
 */
function buildSummaryPrompt(session, mode) {
    var lastAssistantMessage = session.last_assistant_message || (function () {
        logger_js_1.logger.error('SDK', 'Missing last_assistant_message in session for summary prompt', {
            sessionId: session.id
        });
        return '';
    })();
    return "--- MODE SWITCH: PROGRESS SUMMARY ---\nDo NOT output <observation> tags. This is a summary request, not an observation request.\nYour response MUST use <summary> tags ONLY. Any <observation> output will be discarded.\n\n".concat(mode.prompts.header_summary_checkpoint, "\n").concat(mode.prompts.summary_instruction, "\n\n").concat(mode.prompts.summary_context_label, "\n").concat(lastAssistantMessage, "\n\n").concat(mode.prompts.summary_format_instruction, "\n<summary>\n  <request>").concat(mode.prompts.xml_summary_request_placeholder, "</request>\n  <investigated>").concat(mode.prompts.xml_summary_investigated_placeholder, "</investigated>\n  <learned>").concat(mode.prompts.xml_summary_learned_placeholder, "</learned>\n  <completed>").concat(mode.prompts.xml_summary_completed_placeholder, "</completed>\n  <next_steps>").concat(mode.prompts.xml_summary_next_steps_placeholder, "</next_steps>\n  <notes>").concat(mode.prompts.xml_summary_notes_placeholder, "</notes>\n</summary>\n\n").concat(mode.prompts.summary_footer);
}
/**
 * Build prompt for continuation of existing session
 *
 * CRITICAL: Why contentSessionId Parameter is Required
 * ====================================================
 * This function receives contentSessionId from SDKAgent.ts, which comes from:
 * - SessionManager.initializeSession (fetched from database)
 * - SessionStore.createSDKSession (stored by new-hook.ts)
 * - new-hook.ts receives it from Claude Code's hook context
 *
 * The contentSessionId is the SAME session_id used by:
 * - NEW hook (to create/fetch session)
 * - SAVE hook (to store observations)
 * - This continuation prompt (to maintain session context)
 *
 * This is how everything stays connected - ONE session_id threading through
 * all hooks and prompts in the same conversation.
 *
 * Called when: promptNumber > 1 (see SDKAgent.ts line 150)
 * First prompt: Uses buildInitPrompt instead (promptNumber === 1)
 */
function buildContinuationPrompt(userPrompt, promptNumber, contentSessionId, mode) {
    return "".concat(mode.prompts.continuation_greeting, "\n\n<observed_from_primary_session>\n  <user_request>").concat(userPrompt, "</user_request>\n  <requested_at>").concat(new Date().toISOString().split('T')[0], "</requested_at>\n</observed_from_primary_session>\n\n").concat(mode.prompts.system_identity, "\n\n").concat(mode.prompts.observer_role, "\n\n").concat(mode.prompts.spatial_awareness, "\n\n").concat(mode.prompts.recording_focus, "\n\n").concat(mode.prompts.skip_guidance, "\n\n").concat(mode.prompts.continuation_instruction, "\n\n").concat(mode.prompts.output_format_header, "\n\n```xml\n<observation>\n  <type>[ ").concat(mode.observation_types.map(function (t) { return t.id; }).join(' | '), " ]</type>\n  <!--\n    ").concat(mode.prompts.type_guidance, "\n  -->\n  <title>").concat(mode.prompts.xml_title_placeholder, "</title>\n  <subtitle>").concat(mode.prompts.xml_subtitle_placeholder, "</subtitle>\n  <facts>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n    <fact>").concat(mode.prompts.xml_fact_placeholder, "</fact>\n  </facts>\n  <!--\n    ").concat(mode.prompts.field_guidance, "\n  -->\n  <narrative>").concat(mode.prompts.xml_narrative_placeholder, "</narrative>\n  <concepts>\n    <concept>").concat(mode.prompts.xml_concept_placeholder, "</concept>\n    <concept>").concat(mode.prompts.xml_concept_placeholder, "</concept>\n  </concepts>\n  <!--\n    ").concat(mode.prompts.concept_guidance, "\n  -->\n  <files_read>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n  </files_read>\n  <files_modified>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n    <file>").concat(mode.prompts.xml_file_placeholder, "</file>\n  </files_modified>\n</observation>\n```\n").concat(mode.prompts.format_examples, "\n\n").concat(mode.prompts.footer, "\n\n").concat(mode.prompts.header_memory_continued);
}
