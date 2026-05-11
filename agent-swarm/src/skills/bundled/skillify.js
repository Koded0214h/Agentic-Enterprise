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
exports.registerSkillifySkill = registerSkillifySkill;
var sessionMemoryUtils_js_1 = require("../../services/SessionMemory/sessionMemoryUtils.js");
var messages_js_1 = require("../../utils/messages.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
function extractUserMessages(messages) {
    return messages
        .filter(function (m) { return m.type === 'user'; })
        .map(function (m) {
        var content = m.message.content;
        if (typeof content === 'string')
            return content;
        return content
            .filter(function (b) { return b.type === 'text'; })
            .map(function (b) { return b.text; })
            .join('\n');
    })
        .filter(function (text) { return text.trim().length > 0; });
}
var SKILLIFY_PROMPT = "# Skillify {{userDescriptionBlock}}\n\nYou are capturing this session's repeatable process as a reusable skill.\n\n## Your Session Context\n\nHere is the session memory summary:\n<session_memory>\n{{sessionMemory}}\n</session_memory>\n\nHere are the user's messages during this session. Pay attention to how they steered the process, to help capture their detailed preferences in the skill:\n<user_messages>\n{{userMessages}}\n</user_messages>\n\n## Your Task\n\n### Step 1: Analyze the Session\n\nBefore asking any questions, analyze the session to identify:\n- What repeatable process was performed\n- What the inputs/parameters were\n- The distinct steps (in order)\n- The success artifacts/criteria (e.g. not just \"writing code,\" but \"an open PR with CI fully passing\") for each step\n- Where the user corrected or steered you\n- What tools and permissions were needed\n- What agents were used\n- What the goals and success artifacts were\n\n### Step 2: Interview the User\n\nYou will use the AskUserQuestion to understand what the user wants to automate. Important notes:\n- Use AskUserQuestion for ALL questions! Never ask questions via plain text.\n- For each round, iterate as much as needed until the user is happy.\n- The user always has a freeform \"Other\" option to type edits or feedback -- do NOT add your own \"Needs tweaking\" or \"I'll provide edits\" option. Just offer the substantive choices.\n\n**Round 1: High level confirmation**\n- Suggest a name and description for the skill based on your analysis. Ask the user to confirm or rename.\n- Suggest high-level goal(s) and specific success criteria for the skill.\n\n**Round 2: More details**\n- Present the high-level steps you identified as a numbered list. Tell the user you will dig into the detail in the next round.\n- If you think the skill will require arguments, suggest arguments based on what you observed. Make sure you understand what someone would need to provide.\n- If it's not clear, ask if this skill should run inline (in the current conversation) or forked (as a sub-agent with its own context). Forked is better for self-contained tasks that don't need mid-process user input; inline is better when the user wants to steer mid-process.\n- Ask where the skill should be saved. Suggest a default based on context (repo-specific workflows \u2192 repo, cross-repo personal workflows \u2192 user). Options:\n  - **This repo** (`.claude/skills/<name>/SKILL.md`) \u2014 for workflows specific to this project\n  - **Personal** (`~/.claude/skills/<name>/SKILL.md`) \u2014 follows you across all repos\n\n**Round 3: Breaking down each step**\nFor each major step, if it's not glaringly obvious, ask:\n- What does this step produce that later steps need? (data, artifacts, IDs)\n- What proves that this step succeeded, and that we can move on?\n- Should the user be asked to confirm before proceeding? (especially for irreversible actions like merging, sending messages, or destructive operations)\n- Are any steps independent and could run in parallel? (e.g., posting to Slack and monitoring CI at the same time)\n- How should the skill be executed? (e.g. always use a Task agent to conduct code review, or invoke an agent team for a set of concurrent steps)\n- What are the hard constraints or hard preferences? Things that must or must not happen?\n\nYou may do multiple rounds of AskUserQuestion here, one round per step, especially if there are more than 3 steps or many clarification questions. Iterate as much as needed.\n\nIMPORTANT: Pay special attention to places where the user corrected you during the session, to help inform your design.\n\n**Round 4: Final questions**\n- Confirm when this skill should be invoked, and suggest/confirm trigger phrases too. (e.g. For a cherrypick workflow you could say: Use when the user wants to cherry-pick a PR to a release branch. Examples: 'cherry-pick to release', 'CP this PR', 'hotfix.')\n- You can also ask for any other gotchas or things to watch out for, if it's still unclear.\n\nStop interviewing once you have enough information. IMPORTANT: Don't over-ask for simple processes!\n\n### Step 3: Write the SKILL.md\n\nCreate the skill directory and file at the location the user chose in Round 2.\n\nUse this format:\n\n```markdown\n---\nname: {{skill-name}}\ndescription: {{one-line description}}\nallowed-tools:\n  {{list of tool permission patterns observed during session}}\nwhen_to_use: {{detailed description of when Claude should automatically invoke this skill, including trigger phrases and example user messages}}\nargument-hint: \"{{hint showing argument placeholders}}\"\narguments:\n  {{list of argument names}}\ncontext: {{inline or fork -- omit for inline}}\n---\n\n# {{Skill Title}}\nDescription of skill\n\n## Inputs\n- `$arg_name`: Description of this input\n\n## Goal\nClearly stated goal for this workflow. Best if you have clearly defined artifacts or criteria for completion.\n\n## Steps\n\n### 1. Step Name\nWhat to do in this step. Be specific and actionable. Include commands when appropriate.\n\n**Success criteria**: ALWAYS include this! This shows that the step is done and we can move on. Can be a list.\n\nIMPORTANT: see the next section below for the per-step annotations you can optionally include for each step.\n\n...\n```\n\n**Per-step annotations**:\n- **Success criteria** is REQUIRED on every step. This helps the model understand what the user expects from their workflow, and when it should have the confidence to move on.\n- **Execution**: `Direct` (default), `Task agent` (straightforward subagents), `Teammate` (agent with true parallelism and inter-agent communication), or `[human]` (user does it). Only needs specifying if not Direct.\n- **Artifacts**: Data this step produces that later steps need (e.g., PR number, commit SHA). Only include if later steps depend on it.\n- **Human checkpoint**: When to pause and ask the user before proceeding. Include for irreversible actions (merging, sending messages), error judgment (merge conflicts), or output review.\n- **Rules**: Hard rules for the workflow. User corrections during the reference session can be especially useful here.\n\n**Step structure tips:**\n- Steps that can run concurrently use sub-numbers: 3a, 3b\n- Steps requiring the user to act get `[human]` in the title\n- Keep simple skills simple -- a 2-step skill doesn't need annotations on every step\n\n**Frontmatter rules:**\n- `allowed-tools`: Minimum permissions needed (use patterns like `Bash(gh:*)` not `Bash`)\n- `context`: Only set `context: fork` for self-contained skills that don't need mid-process user input.\n- `when_to_use` is CRITICAL -- tells the model when to auto-invoke. Start with \"Use when...\" and include trigger phrases. Example: \"Use when the user wants to cherry-pick a PR to a release branch. Examples: 'cherry-pick to release', 'CP this PR', 'hotfix'.\"\n- `arguments` and `argument-hint`: Only include if the skill takes parameters. Use `$name` in the body for substitution.\n\n### Step 4: Confirm and Save\n\nBefore writing the file, output the complete SKILL.md content as a yaml code block in your response so the user can review it with proper syntax highlighting. Then ask for confirmation using AskUserQuestion with a simple question like \"Does this SKILL.md look good to save?\" \u2014 do NOT use the body field, keep the question concise.\n\nAfter writing, tell the user:\n- Where the skill was saved\n- How to invoke it: `/{{skill-name}} [arguments]`\n- That they can edit the SKILL.md directly to refine it\n";
function registerSkillifySkill() {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'skillify',
        description: "Capture this session's repeatable process into a skill. Call at end of the process you want to capture with an optional description.",
        allowedTools: [
            'Read',
            'Write',
            'Edit',
            'Glob',
            'Grep',
            'AskUserQuestion',
            'Bash(mkdir:*)',
        ],
        userInvocable: true,
        disableModelInvocation: true,
        argumentHint: '[description of the process you want to capture]',
        getPromptForCommand: function (args, context) {
            return __awaiter(this, void 0, void 0, function () {
                var sessionMemory, userMessages, userDescriptionBlock, prompt;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (0, sessionMemoryUtils_js_1.getSessionMemoryContent)()];
                        case 1:
                            sessionMemory = (_a = (_b.sent())) !== null && _a !== void 0 ? _a : 'No session memory available.';
                            userMessages = extractUserMessages((0, messages_js_1.getMessagesAfterCompactBoundary)(context.messages));
                            userDescriptionBlock = args
                                ? "The user described this process as: \"".concat(args, "\"")
                                : '';
                            prompt = SKILLIFY_PROMPT.replace('{{sessionMemory}}', sessionMemory)
                                .replace('{{userMessages}}', userMessages.join('\n\n---\n\n'))
                                .replace('{{userDescriptionBlock}}', userDescriptionBlock);
                            return [2 /*return*/, [{ type: 'text', text: prompt }]];
                    }
                });
            });
        },
    });
}
