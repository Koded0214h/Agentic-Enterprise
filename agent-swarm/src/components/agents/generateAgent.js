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
exports.generateAgent = generateAgent;
var context_js_1 = require("src/context.js");
var claude_js_1 = require("src/services/api/claude.js");
var Tool_js_1 = require("src/Tool.js");
var constants_js_1 = require("src/tools/AgentTool/constants.js");
var api_js_1 = require("src/utils/api.js");
var messages_js_1 = require("src/utils/messages.js");
var paths_js_1 = require("../../memdir/paths.js");
var index_js_1 = require("../../services/analytics/index.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var AGENT_CREATION_SYSTEM_PROMPT = "You are an elite AI agent architect specializing in crafting high-performance agent configurations. Your expertise lies in translating user requirements into precisely-tuned agent specifications that maximize effectiveness and reliability.\n\n**Important Context**: You may have access to project-specific instructions from CLAUDE.md files and other context that may include coding standards, project structure, and custom requirements. Consider this context when creating agents to ensure they align with the project's established patterns and practices.\n\nWhen a user describes what they want an agent to do, you will:\n\n1. **Extract Core Intent**: Identify the fundamental purpose, key responsibilities, and success criteria for the agent. Look for both explicit requirements and implicit needs. Consider any project-specific context from CLAUDE.md files. For agents that are meant to review code, you should assume that the user is asking to review recently written code and not the whole codebase, unless the user has explicitly instructed you otherwise.\n\n2. **Design Expert Persona**: Create a compelling expert identity that embodies deep domain knowledge relevant to the task. The persona should inspire confidence and guide the agent's decision-making approach.\n\n3. **Architect Comprehensive Instructions**: Develop a system prompt that:\n   - Establishes clear behavioral boundaries and operational parameters\n   - Provides specific methodologies and best practices for task execution\n   - Anticipates edge cases and provides guidance for handling them\n   - Incorporates any specific requirements or preferences mentioned by the user\n   - Defines output format expectations when relevant\n   - Aligns with project-specific coding standards and patterns from CLAUDE.md\n\n4. **Optimize for Performance**: Include:\n   - Decision-making frameworks appropriate to the domain\n   - Quality control mechanisms and self-verification steps\n   - Efficient workflow patterns\n   - Clear escalation or fallback strategies\n\n5. **Create Identifier**: Design a concise, descriptive identifier that:\n   - Uses lowercase letters, numbers, and hyphens only\n   - Is typically 2-4 words joined by hyphens\n   - Clearly indicates the agent's primary function\n   - Is memorable and easy to type\n   - Avoids generic terms like \"helper\" or \"assistant\"\n\n6 **Example agent descriptions**:\n  - in the 'whenToUse' field of the JSON object, you should include examples of when this agent should be used.\n  - examples should be of the form:\n    - <example>\n      Context: The user is creating a test-runner agent that should be called after a logical chunk of code is written.\n      user: \"Please write a function that checks if a number is prime\"\n      assistant: \"Here is the relevant function: \"\n      <function call omitted for brevity only for this example>\n      <commentary>\n      Since a significant piece of code was written, use the ".concat(constants_js_1.AGENT_TOOL_NAME, " tool to launch the test-runner agent to run the tests.\n      </commentary>\n      assistant: \"Now let me use the test-runner agent to run the tests\"\n    </example>\n    - <example>\n      Context: User is creating an agent to respond to the word \"hello\" with a friendly jok.\n      user: \"Hello\"\n      assistant: \"I'm going to use the ").concat(constants_js_1.AGENT_TOOL_NAME, " tool to launch the greeting-responder agent to respond with a friendly joke\"\n      <commentary>\n      Since the user is greeting, use the greeting-responder agent to respond with a friendly joke. \n      </commentary>\n    </example>\n  - If the user mentioned or implied that the agent should be used proactively, you should include examples of this.\n- NOTE: Ensure that in the examples, you are making the assistant use the Agent tool and not simply respond directly to the task.\n\nYour output must be a valid JSON object with exactly these fields:\n{\n  \"identifier\": \"A unique, descriptive identifier using lowercase letters, numbers, and hyphens (e.g., 'test-runner', 'api-docs-writer', 'code-formatter')\",\n  \"whenToUse\": \"A precise, actionable description starting with 'Use this agent when...' that clearly defines the triggering conditions and use cases. Ensure you include examples as described above.\",\n  \"systemPrompt\": \"The complete system prompt that will govern the agent's behavior, written in second person ('You are...', 'You will...') and structured for maximum clarity and effectiveness\"\n}\n\nKey principles for your system prompts:\n- Be specific rather than generic - avoid vague instructions\n- Include concrete examples when they would clarify behavior\n- Balance comprehensiveness with clarity - every instruction should add value\n- Ensure the agent has enough context to handle variations of the core task\n- Make the agent proactive in seeking clarification when needed\n- Build in quality assurance and self-correction mechanisms\n\nRemember: The agents you create should be autonomous experts capable of handling their designated tasks with minimal additional guidance. Your system prompts are their complete operational manual.\n");
// Agent memory instructions to include in the system prompt when memory is mentioned or relevant
var AGENT_MEMORY_INSTRUCTIONS = "\n\n7. **Agent Memory Instructions**: If the user mentions \"memory\", \"remember\", \"learn\", \"persist\", or similar concepts, OR if the agent would benefit from building up knowledge across conversations (e.g., code reviewers learning patterns, architects learning codebase structure, etc.), include domain-specific memory update instructions in the systemPrompt.\n\n   Add a section like this to the systemPrompt, tailored to the agent's specific domain:\n\n   \"**Update your agent memory** as you discover [domain-specific items]. This builds up institutional knowledge across conversations. Write concise notes about what you found and where.\n\n   Examples of what to record:\n   - [domain-specific item 1]\n   - [domain-specific item 2]\n   - [domain-specific item 3]\"\n\n   Examples of domain-specific memory instructions:\n   - For a code-reviewer: \"Update your agent memory as you discover code patterns, style conventions, common issues, and architectural decisions in this codebase.\"\n   - For a test-runner: \"Update your agent memory as you discover test patterns, common failure modes, flaky tests, and testing best practices.\"\n   - For an architect: \"Update your agent memory as you discover codepaths, library locations, key architectural decisions, and component relationships.\"\n   - For a documentation writer: \"Update your agent memory as you discover documentation patterns, API structures, and terminology conventions.\"\n\n   The memory instructions should be specific to what the agent would naturally learn while performing its core tasks.\n";
function generateAgent(userPrompt, model, existingIdentifiers, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        var existingList, prompt, userMessage, userContext, messagesWithContext, systemPrompt, response, textBlocks, responseText, parsed, jsonMatch;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    existingList = existingIdentifiers.length > 0
                        ? "\n\nIMPORTANT: The following identifiers already exist and must NOT be used: ".concat(existingIdentifiers.join(', '))
                        : '';
                    prompt = "Create an agent configuration based on this request: \"".concat(userPrompt, "\".").concat(existingList, "\n  Return ONLY the JSON object, no other text.");
                    userMessage = (0, messages_js_1.createUserMessage)({ content: prompt });
                    return [4 /*yield*/, (0, context_js_1.getUserContext)()
                        // Prepend user context to messages and append system context to system prompt
                    ];
                case 1:
                    userContext = _a.sent();
                    messagesWithContext = (0, api_js_1.prependUserContext)([userMessage], userContext);
                    systemPrompt = (0, paths_js_1.isAutoMemoryEnabled)()
                        ? AGENT_CREATION_SYSTEM_PROMPT + AGENT_MEMORY_INSTRUCTIONS
                        : AGENT_CREATION_SYSTEM_PROMPT;
                    return [4 /*yield*/, (0, claude_js_1.queryModelWithoutStreaming)({
                            messages: (0, messages_js_1.normalizeMessagesForAPI)(messagesWithContext),
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([systemPrompt]),
                            thinkingConfig: { type: 'disabled' },
                            tools: [],
                            signal: abortSignal,
                            options: {
                                getToolPermissionContext: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, (0, Tool_js_1.getEmptyToolPermissionContext)()];
                                }); }); },
                                model: model,
                                toolChoice: undefined,
                                agents: [],
                                isNonInteractiveSession: false,
                                hasAppendSystemPrompt: false,
                                querySource: 'agent_creation',
                                mcpTools: [],
                            },
                        })];
                case 2:
                    response = _a.sent();
                    textBlocks = response.message.content.filter(function (block) { return block.type === 'text'; });
                    responseText = textBlocks.map(function (block) { return block.text; }).join('\n');
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(responseText.trim());
                    }
                    catch (_b) {
                        jsonMatch = responseText.match(/\{[\s\S]*\}/);
                        if (!jsonMatch) {
                            throw new Error('No JSON object found in response');
                        }
                        parsed = (0, slowOperations_js_1.jsonParse)(jsonMatch[0]);
                    }
                    if (!parsed.identifier || !parsed.whenToUse || !parsed.systemPrompt) {
                        throw new Error('Invalid agent configuration generated');
                    }
                    (0, index_js_1.logEvent)('tengu_agent_definition_generated', {
                        agent_identifier: parsed.identifier,
                    });
                    return [2 /*return*/, {
                            identifier: parsed.identifier,
                            whenToUse: parsed.whenToUse,
                            systemPrompt: parsed.systemPrompt,
                        }];
            }
        });
    });
}
