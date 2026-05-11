"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAgentLine = formatAgentLine;
exports.shouldInjectAgentListInMessages = shouldInjectAgentListInMessages;
exports.getPrompt = getPrompt;
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var auth_js_1 = require("../../utils/auth.js");
var embeddedTools_js_1 = require("../../utils/embeddedTools.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var teammate_js_1 = require("../../utils/teammate.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
var prompt_js_2 = require("../FileWriteTool/prompt.js");
var prompt_js_3 = require("../GlobTool/prompt.js");
var constants_js_1 = require("../SendMessageTool/constants.js");
var constants_js_2 = require("./constants.js");
var forkSubagent_js_1 = require("./forkSubagent.js");
function getToolsDescription(agent) {
    var tools = agent.tools, disallowedTools = agent.disallowedTools;
    var hasAllowlist = tools && tools.length > 0;
    var hasDenylist = disallowedTools && disallowedTools.length > 0;
    if (hasAllowlist && hasDenylist) {
        // Both defined: filter allowlist by denylist to match runtime behavior
        var denySet_1 = new Set(disallowedTools);
        var effectiveTools = tools.filter(function (t) { return !denySet_1.has(t); });
        if (effectiveTools.length === 0) {
            return 'None';
        }
        return effectiveTools.join(', ');
    }
    else if (hasAllowlist) {
        // Allowlist only: show the specific tools available
        return tools.join(', ');
    }
    else if (hasDenylist) {
        // Denylist only: show "All tools except X, Y, Z"
        return "All tools except ".concat(disallowedTools.join(', '));
    }
    // No restrictions
    return 'All tools';
}
/**
 * Format one agent line for the agent_listing_delta attachment message:
 * `- type: whenToUse (Tools: ...)`.
 */
function formatAgentLine(agent) {
    var toolsDescription = getToolsDescription(agent);
    return "- ".concat(agent.agentType, ": ").concat(agent.whenToUse, " (Tools: ").concat(toolsDescription, ")");
}
/**
 * Whether the agent list should be injected as an attachment message instead
 * of embedded in the tool description. When true, getPrompt() returns a static
 * description and attachments.ts emits an agent_listing_delta attachment.
 *
 * The dynamic agent list was ~10.2% of fleet cache_creation tokens: MCP async
 * connect, /reload-plugins, or permission-mode changes mutate the list →
 * description changes → full tool-schema cache bust.
 *
 * Override with CLAUDE_CODE_AGENT_LIST_IN_MESSAGES=true/false for testing.
 */
function shouldInjectAgentListInMessages() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_AGENT_LIST_IN_MESSAGES))
        return true;
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_AGENT_LIST_IN_MESSAGES))
        return false;
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_agent_list_attach', false);
}
function getPrompt(agentDefinitions, isCoordinator, allowedAgentTypes) {
    return __awaiter(this, void 0, void 0, function () {
        var effectiveAgents, forkEnabled, whenToForkSection, writingThePromptSection, forkExamples, currentExamples, listViaAttachment, agentListSection, shared, embedded, fileSearchHint, contentSearchHint, whenNotToUseSection, concurrencyNote;
        return __generator(this, function (_a) {
            effectiveAgents = allowedAgentTypes
                ? agentDefinitions.filter(function (a) { return allowedAgentTypes.includes(a.agentType); })
                : agentDefinitions;
            forkEnabled = (0, forkSubagent_js_1.isForkSubagentEnabled)();
            whenToForkSection = forkEnabled
                ? "\n\n## When to fork\n\nFork yourself (omit `subagent_type`) when the intermediate tool output isn't worth keeping in your context. The criterion is qualitative \u2014 \"will I need this output again\" \u2014 not task size.\n- **Research**: fork open-ended questions. If research can be broken into independent questions, launch parallel forks in one message. A fork beats a fresh subagent for this \u2014 it inherits context and shares your cache.\n- **Implementation**: prefer to fork implementation work that requires more than a couple of edits. Do research before jumping to implementation.\n\nForks are cheap because they share your prompt cache. Don't set `model` on a fork \u2014 a different model can't reuse the parent's cache. Pass a short `name` (one or two words, lowercase) so the user can see the fork in the teams panel and steer it mid-run.\n\n**Don't peek.** The tool result includes an `output_file` path \u2014 do not Read or tail it unless the user explicitly asks for a progress check. You get a completion notification; trust it. Reading the transcript mid-flight pulls the fork's tool noise into your context, which defeats the point of forking.\n\n**Don't race.** After launching, you know nothing about what the fork found. Never fabricate or predict fork results in any format \u2014 not as prose, summary, or structured output. The notification arrives as a user-role message in a later turn; it is never something you write yourself. If the user asks a follow-up before the notification lands, tell them the fork is still running \u2014 give status, not a guess.\n\n**Writing a fork prompt.** Since the fork inherits your context, the prompt is a *directive* \u2014 what to do, not what the situation is. Be specific about scope: what's in, what's out, what another agent is handling. Don't re-explain background.\n"
                : '';
            writingThePromptSection = "\n\n## Writing the prompt\n\n".concat(forkEnabled ? 'When spawning a fresh agent (with a `subagent_type`), it starts with zero context. ' : '', "Brief the agent like a smart colleague who just walked into the room \u2014 it hasn't seen this conversation, doesn't know what you've tried, doesn't understand why this task matters.\n- Explain what you're trying to accomplish and why.\n- Describe what you've already learned or ruled out.\n- Give enough context about the surrounding problem that the agent can make judgment calls rather than just following a narrow instruction.\n- If you need a short response, say so (\"report in under 200 words\").\n- Lookups: hand over the exact command. Investigations: hand over the question \u2014 prescribed steps become dead weight when the premise is wrong.\n\n").concat(forkEnabled ? 'For fresh agents, terse' : 'Terse', " command-style prompts produce shallow, generic work.\n\n**Never delegate understanding.** Don't write \"based on your findings, fix the bug\" or \"based on the research, implement it.\" Those phrases push synthesis onto the agent instead of doing it yourself. Write prompts that prove you understood: include file paths, line numbers, what specifically to change.\n");
            forkExamples = "Example usage:\n\n<example>\nuser: \"What's left on this branch before we can ship?\"\nassistant: <thinking>Forking this \u2014 it's a survey question. I want the punch list, not the git output in my context.</thinking>\n".concat(constants_js_2.AGENT_TOOL_NAME, "({\n  name: \"ship-audit\",\n  description: \"Branch ship-readiness audit\",\n  prompt: \"Audit what's left before this branch can ship. Check: uncommitted changes, commits ahead of main, whether tests exist, whether the GrowthBook gate is wired up, whether CI-relevant files changed. Report a punch list \u2014 done vs. missing. Under 200 words.\"\n})\nassistant: Ship-readiness audit running.\n<commentary>\nTurn ends here. The coordinator knows nothing about the findings yet. What follows is a SEPARATE turn \u2014 the notification arrives from outside, as a user-role message. It is not something the coordinator writes.\n</commentary>\n[later turn \u2014 notification arrives as user message]\nassistant: Audit's back. Three blockers: no tests for the new prompt path, GrowthBook gate wired but not in build_flags.yaml, and one uncommitted file.\n</example>\n\n<example>\nuser: \"so is the gate wired up or not\"\n<commentary>\nUser asks mid-wait. The audit fork was launched to answer exactly this, and it hasn't returned. The coordinator does not have this answer. Give status, not a fabricated result.\n</commentary>\nassistant: Still waiting on the audit \u2014 that's one of the things it's checking. Should land shortly.\n</example>\n\n<example>\nuser: \"Can you get a second opinion on whether this migration is safe?\"\nassistant: <thinking>I'll ask the code-reviewer agent \u2014 it won't see my analysis, so it can give an independent read.</thinking>\n<commentary>\nA subagent_type is specified, so the agent starts fresh. It needs full context in the prompt. The briefing explains what to assess and why.\n</commentary>\n").concat(constants_js_2.AGENT_TOOL_NAME, "({\n  name: \"migration-review\",\n  description: \"Independent migration review\",\n  subagent_type: \"code-reviewer\",\n  prompt: \"Review migration 0042_user_schema.sql for safety. Context: we're adding a NOT NULL column to a 50M-row table. Existing rows get a backfill default. I want a second opinion on whether the backfill approach is safe under concurrent writes \u2014 I've checked locking behavior but want independent verification. Report: is this safe, and if not, what specifically breaks?\"\n})\n</example>\n");
            currentExamples = "Example usage:\n\n<example_agent_descriptions>\n\"test-runner\": use this agent after you are done writing code to run tests\n\"greeting-responder\": use this agent to respond to user greetings with a friendly joke\n</example_agent_descriptions>\n\n<example>\nuser: \"Please write a function that checks if a number is prime\"\nassistant: I'm going to use the ".concat(prompt_js_2.FILE_WRITE_TOOL_NAME, " tool to write the following code:\n<code>\nfunction isPrime(n) {\n  if (n <= 1) return false\n  for (let i = 2; i * i <= n; i++) {\n    if (n % i === 0) return false\n  }\n  return true\n}\n</code>\n<commentary>\nSince a significant piece of code was written and the task was completed, now use the test-runner agent to run the tests\n</commentary>\nassistant: Uses the ").concat(constants_js_2.AGENT_TOOL_NAME, " tool to launch the test-runner agent\n</example>\n\n<example>\nuser: \"Hello\"\n<commentary>\nSince the user is greeting, use the greeting-responder agent to respond with a friendly joke\n</commentary>\nassistant: \"I'm going to use the ").concat(constants_js_2.AGENT_TOOL_NAME, " tool to launch the greeting-responder agent\"\n</example>\n");
            listViaAttachment = shouldInjectAgentListInMessages();
            agentListSection = listViaAttachment
                ? "Available agent types are listed in <system-reminder> messages in the conversation."
                : "Available agent types and the tools they have access to:\n".concat(effectiveAgents.map(function (agent) { return formatAgentLine(agent); }).join('\n'));
            shared = "Launch a new agent to handle complex, multi-step tasks autonomously.\n\nThe ".concat(constants_js_2.AGENT_TOOL_NAME, " tool launches specialized agents (subprocesses) that autonomously handle complex tasks. Each agent type has specific capabilities and tools available to it.\n\n").concat(agentListSection, "\n\n").concat(forkEnabled
                ? "When using the ".concat(constants_js_2.AGENT_TOOL_NAME, " tool, specify a subagent_type to use a specialized agent, or omit it to fork yourself \u2014 a fork inherits your full conversation context.")
                : "When using the ".concat(constants_js_2.AGENT_TOOL_NAME, " tool, specify a subagent_type parameter to select which agent type to use. If omitted, the general-purpose agent is used."));
            // Coordinator mode gets the slim prompt -- the coordinator system prompt
            // already covers usage notes, examples, and when-not-to-use guidance.
            if (isCoordinator) {
                return [2 /*return*/, shared];
            }
            embedded = (0, embeddedTools_js_1.hasEmbeddedSearchTools)();
            fileSearchHint = embedded
                ? '`find` via the Bash tool'
                : "the ".concat(prompt_js_3.GLOB_TOOL_NAME, " tool");
            contentSearchHint = embedded
                ? '`grep` via the Bash tool'
                : "the ".concat(prompt_js_3.GLOB_TOOL_NAME, " tool");
            whenNotToUseSection = forkEnabled
                ? ''
                : "\nWhen NOT to use the ".concat(constants_js_2.AGENT_TOOL_NAME, " tool:\n- If you want to read a specific file path, use the ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " tool or ").concat(fileSearchHint, " instead of the ").concat(constants_js_2.AGENT_TOOL_NAME, " tool, to find the match more quickly\n- If you are searching for a specific class definition like \"class Foo\", use ").concat(contentSearchHint, " instead, to find the match more quickly\n- If you are searching for code within a specific file or set of 2-3 files, use the ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " tool instead of the ").concat(constants_js_2.AGENT_TOOL_NAME, " tool, to find the match more quickly\n- Other tasks that are not related to the agent descriptions above\n");
            concurrencyNote = !listViaAttachment && (0, auth_js_1.getSubscriptionType)() !== 'pro'
                ? "\n- Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses"
                : '';
            // Non-coordinator gets the full prompt with all sections
            return [2 /*return*/, "".concat(shared, "\n").concat(whenNotToUseSection, "\n\nUsage notes:\n- Always include a short description (3-5 words) summarizing what the agent will do").concat(concurrencyNote, "\n- When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.").concat(
                // eslint-disable-next-line custom-rules/no-process-env-top-level
                !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS) &&
                    !(0, teammateContext_js_1.isInProcessTeammate)() &&
                    !forkEnabled
                    ? "\n- You can optionally run agents in the background using the run_in_background parameter. When an agent runs in the background, you will be automatically notified when it completes \u2014 do NOT sleep, poll, or proactively check on its progress. Continue with other work or respond to the user instead.\n- **Foreground vs background**: Use foreground (default) when you need the agent's results before you can proceed \u2014 e.g., research agents whose findings inform your next steps. Use background when you have genuinely independent work to do in parallel."
                    : '', "\n- To continue a previously spawned agent, use ").concat(constants_js_1.SEND_MESSAGE_TOOL_NAME, " with the agent's ID or name as the `to` field. The agent resumes with its full context preserved. ").concat(forkEnabled ? 'Each fresh Agent invocation with a subagent_type starts without context — provide a complete task description.' : 'Each Agent invocation starts fresh — provide a complete task description.', "\n- The agent's outputs should generally be trusted\n- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.)").concat(forkEnabled ? '' : ", since it is not aware of the user's intent", "\n- If the agent description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first. Use your judgement.\n- If the user specifies that they want you to run agents \"in parallel\", you MUST send a single message with multiple ").concat(constants_js_2.AGENT_TOOL_NAME, " tool use content blocks. For example, if you need to launch both a build-validator agent and a test-runner agent in parallel, send a single message with both tool calls.\n- You can optionally set `isolation: \"worktree\"` to run the agent in a temporary git worktree, giving it an isolated copy of the repository. The worktree is automatically cleaned up if the agent makes no changes; if changes are made, the worktree path and branch are returned in the result.").concat(process.env.USER_TYPE === 'ant'
                    ? "\n- You can set `isolation: \"remote\"` to run the agent in a remote CCR environment. This is always a background task; you'll be notified when it completes. Use for long-running tasks that need a fresh sandbox."
                    : '').concat((0, teammateContext_js_1.isInProcessTeammate)()
                    ? "\n- The run_in_background, name, team_name, and mode parameters are not available in this context. Only synchronous subagents are supported."
                    : (0, teammate_js_1.isTeammate)()
                        ? "\n- The name, team_name, and mode parameters are not available in this context \u2014 teammates cannot spawn other teammates. Omit them to spawn a subagent."
                        : '').concat(whenToForkSection).concat(writingThePromptSection, "\n\n").concat(forkEnabled ? forkExamples : currentExamples)];
        });
    });
}
