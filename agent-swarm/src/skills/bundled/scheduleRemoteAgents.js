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
exports.registerScheduleRemoteAgentsSkill = registerScheduleRemoteAgentsSkill;
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/policyLimits/index.js");
var prompt_js_1 = require("../../tools/AskUserQuestionTool/prompt.js");
var prompt_js_2 = require("../../tools/RemoteTriggerTool/prompt.js");
var auth_js_1 = require("../../utils/auth.js");
var preconditions_js_1 = require("../../utils/background/remote/preconditions.js");
var debug_js_1 = require("../../utils/debug.js");
var detectRepository_js_1 = require("../../utils/detectRepository.js");
var git_js_1 = require("../../utils/git.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var environments_js_1 = require("../../utils/teleport/environments.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
// Base58 alphabet (Bitcoin-style) used by the tagged ID system
var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
/**
 * Decode a mcpsrv_ tagged ID to a UUID string.
 * Tagged IDs have format: mcpsrv_01{base58(uuid.int)}
 * where 01 is the version prefix.
 *
 * TODO(public-ship): Before shipping publicly, the /v1/mcp_servers endpoint
 * should return the raw UUID directly so we don't need this client-side decoding.
 * The tagged ID format is an internal implementation detail that could change.
 */
function taggedIdToUUID(taggedId) {
    var prefix = 'mcpsrv_';
    if (!taggedId.startsWith(prefix)) {
        return null;
    }
    var rest = taggedId.slice(prefix.length);
    // Skip version prefix (2 chars, always "01")
    var base58Data = rest.slice(2);
    // Decode base58 to bigint
    var n = 0n;
    for (var _i = 0, base58Data_1 = base58Data; _i < base58Data_1.length; _i++) {
        var c = base58Data_1[_i];
        var idx = BASE58.indexOf(c);
        if (idx === -1) {
            return null;
        }
        n = n * 58n + BigInt(idx);
    }
    // Convert to UUID hex string
    var hex = n.toString(16).padStart(32, '0');
    return "".concat(hex.slice(0, 8), "-").concat(hex.slice(8, 12), "-").concat(hex.slice(12, 16), "-").concat(hex.slice(16, 20), "-").concat(hex.slice(20, 32));
}
function getConnectedClaudeAIConnectors(mcpClients) {
    var connectors = [];
    for (var _i = 0, mcpClients_1 = mcpClients; _i < mcpClients_1.length; _i++) {
        var client = mcpClients_1[_i];
        if (client.type !== 'connected') {
            continue;
        }
        if (client.config.type !== 'claudeai-proxy') {
            continue;
        }
        var uuid = taggedIdToUUID(client.config.id);
        if (!uuid) {
            continue;
        }
        connectors.push({
            uuid: uuid,
            name: client.name,
            url: client.config.url,
        });
    }
    return connectors;
}
function sanitizeConnectorName(name) {
    return name
        .replace(/^claude[.\s-]ai[.\s-]/i, '')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
function formatConnectorsInfo(connectors) {
    if (connectors.length === 0) {
        return 'No connected MCP connectors found. The user may need to connect servers at https://claude.ai/settings/connectors';
    }
    var lines = ['Connected connectors (available for triggers):'];
    for (var _i = 0, connectors_1 = connectors; _i < connectors_1.length; _i++) {
        var c = connectors_1[_i];
        var safeName = sanitizeConnectorName(c.name);
        lines.push("- ".concat(c.name, " (connector_uuid: ").concat(c.uuid, ", name: ").concat(safeName, ", url: ").concat(c.url, ")"));
    }
    return lines.join('\n');
}
var BASE_QUESTION = 'What would you like to do with scheduled remote agents?';
/**
 * Formats setup notes as a bulleted Heads-up block. Shared between the
 * initial AskUserQuestion dialog text (no-args path) and the prompt-body
 * section (args path) so notes are never silently dropped.
 */
function formatSetupNotes(notes) {
    var items = notes.map(function (n) { return "- ".concat(n); }).join('\n');
    return "\u26A0 Heads-up:\n".concat(items);
}
function getCurrentRepoHttpsUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var remoteUrl, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getRemoteUrl)()];
                case 1:
                    remoteUrl = _a.sent();
                    if (!remoteUrl) {
                        return [2 /*return*/, null];
                    }
                    parsed = (0, detectRepository_js_1.parseGitRemote)(remoteUrl);
                    if (!parsed) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, "https://".concat(parsed.host, "/").concat(parsed.owner, "/").concat(parsed.name)];
            }
        });
    });
}
function buildPrompt(opts) {
    var userTimezone = opts.userTimezone, connectorsInfo = opts.connectorsInfo, gitRepoUrl = opts.gitRepoUrl, environmentsInfo = opts.environmentsInfo, createdEnvironment = opts.createdEnvironment, setupNotes = opts.setupNotes, needsGitHubAccessReminder = opts.needsGitHubAccessReminder, userArgs = opts.userArgs;
    // When the user passes args, the initial AskUserQuestion dialog is skipped.
    // Setup notes must surface in the prompt body instead, otherwise they're
    // computed and silently discarded (regression vs. the old hard-block).
    var setupNotesSection = userArgs && setupNotes.length > 0
        ? "\n## Setup Notes\n\n".concat(formatSetupNotes(setupNotes), "\n")
        : '';
    var initialQuestion = setupNotes.length > 0
        ? "".concat(formatSetupNotes(setupNotes), "\n\n").concat(BASE_QUESTION)
        : BASE_QUESTION;
    var firstStep = userArgs
        ? "The user has already told you what they want (see User Request at the bottom). Skip the initial question and go directly to the matching workflow."
        : "Your FIRST action must be a single ".concat(prompt_js_1.ASK_USER_QUESTION_TOOL_NAME, " tool call (no preamble). Use this EXACT string for the `question` field \u2014 do not paraphrase or shorten it:\n\n").concat((0, slowOperations_js_1.jsonStringify)(initialQuestion), "\n\nSet `header: \"Action\"` and offer the four actions (create/list/update/run) as options. After the user picks, follow the matching workflow below.");
    return "# Schedule Remote Agents\n\nYou are helping the user schedule, update, list, or run **remote** Claude Code agents. These are NOT local cron jobs \u2014 each trigger spawns a fully isolated remote session (CCR) in Anthropic's cloud infrastructure on a cron schedule. The agent runs in a sandboxed environment with its own git checkout, tools, and optional MCP connections.\n\n## First Step\n\n".concat(firstStep, "\n").concat(setupNotesSection, "\n\n## What You Can Do\n\nUse the `").concat(prompt_js_2.REMOTE_TRIGGER_TOOL_NAME, "` tool (load it first with `ToolSearch select:").concat(prompt_js_2.REMOTE_TRIGGER_TOOL_NAME, "`; auth is handled in-process \u2014 do not use curl):\n\n- `{action: \"list\"}` \u2014 list all triggers\n- `{action: \"get\", trigger_id: \"...\"}` \u2014 fetch one trigger\n- `{action: \"create\", body: {...}}` \u2014 create a trigger\n- `{action: \"update\", trigger_id: \"...\", body: {...}}` \u2014 partial update\n- `{action: \"run\", trigger_id: \"...\"}` \u2014 run a trigger now\n\nYou CANNOT delete triggers. If the user asks to delete, direct them to: https://claude.ai/code/scheduled\n\n## Create body shape\n\n```json\n{\n  \"name\": \"AGENT_NAME\",\n  \"cron_expression\": \"CRON_EXPR\",\n  \"enabled\": true,\n  \"job_config\": {\n    \"ccr\": {\n      \"environment_id\": \"ENVIRONMENT_ID\",\n      \"session_context\": {\n        \"model\": \"claude-sonnet-4-6\",\n        \"sources\": [\n          {\"git_repository\": {\"url\": \"").concat(gitRepoUrl || 'https://github.com/ORG/REPO', "\"}}\n        ],\n        \"allowed_tools\": [\"Bash\", \"Read\", \"Write\", \"Edit\", \"Glob\", \"Grep\"]\n      },\n      \"events\": [\n        {\"data\": {\n          \"uuid\": \"<lowercase v4 uuid>\",\n          \"session_id\": \"\",\n          \"type\": \"user\",\n          \"parent_tool_use_id\": null,\n          \"message\": {\"content\": \"PROMPT_HERE\", \"role\": \"user\"}\n        }}\n      ]\n    }\n  }\n}\n```\n\nGenerate a fresh lowercase UUID for `events[].data.uuid` yourself.\n\n## Available MCP Connectors\n\nThese are the user's currently connected claude.ai MCP connectors:\n\n").concat(connectorsInfo, "\n\nWhen attaching connectors to a trigger, use the `connector_uuid` and `name` shown above (the name is already sanitized to only contain letters, numbers, hyphens, and underscores), and the connector's URL. The `name` field in `mcp_connections` must only contain `[a-zA-Z0-9_-]` \u2014 dots and spaces are NOT allowed.\n\n**Important:** Infer what services the agent needs from the user's description. For example, if they say \"check Datadog and Slack me errors,\" the agent needs both Datadog and Slack connectors. Cross-reference against the list above and warn if any required service isn't connected. If a needed connector is missing, direct the user to https://claude.ai/settings/connectors to connect it first.\n\n## Environments\n\nEvery trigger requires an `environment_id` in the job config. This determines where the remote agent runs. Ask the user which environment to use.\n\n").concat(environmentsInfo, "\n\nUse the `id` value as the `environment_id` in `job_config.ccr.environment_id`.\n").concat(createdEnvironment ? "\n**Note:** A new environment `".concat(createdEnvironment.name, "` (id: `").concat(createdEnvironment.environment_id, "`) was just created for the user because they had none. Use this id for `job_config.ccr.environment_id` and mention the creation when you confirm the trigger config.\n") : '', "\n\n## API Field Reference\n\n### Create Trigger \u2014 Required Fields\n- `name` (string) \u2014 A descriptive name\n- `cron_expression` (string) \u2014 5-field cron. **Minimum interval is 1 hour.**\n- `job_config` (object) \u2014 Session configuration (see structure above)\n\n### Create Trigger \u2014 Optional Fields\n- `enabled` (boolean, default: true)\n- `mcp_connections` (array) \u2014 MCP servers to attach:\n  ```json\n  [{\"connector_uuid\": \"uuid\", \"name\": \"server-name\", \"url\": \"https://...\"}]\n  ```\n\n### Update Trigger \u2014 Optional Fields\nAll fields optional (partial update):\n- `name`, `cron_expression`, `enabled`, `job_config`\n- `mcp_connections` \u2014 Replace MCP connections\n- `clear_mcp_connections` (boolean) \u2014 Remove all MCP connections\n\n### Cron Expression Examples\n\nThe user's local timezone is **").concat(userTimezone, "**. Cron expressions are always in UTC. When the user says a local time, convert it to UTC for the cron expression but confirm with them: \"9am ").concat(userTimezone, " = Xam UTC, so the cron would be `0 X * * 1-5`.\"\n\n- `0 9 * * 1-5` \u2014 Every weekday at 9am **UTC**\n- `0 */2 * * *` \u2014 Every 2 hours\n- `0 0 * * *` \u2014 Daily at midnight **UTC**\n- `30 14 * * 1` \u2014 Every Monday at 2:30pm **UTC**\n- `0 8 1 * *` \u2014 First of every month at 8am **UTC**\n\nMinimum interval is 1 hour. `*/30 * * * *` will be rejected.\n\n## Workflow\n\n### CREATE a new trigger:\n\n1. **Understand the goal** \u2014 Ask what they want the remote agent to do. What repo(s)? What task? Remind them that the agent runs remotely \u2014 it won't have access to their local machine, local files, or local environment variables.\n2. **Craft the prompt** \u2014 Help them write an effective agent prompt. Good prompts are:\n   - Specific about what to do and what success looks like\n   - Clear about which files/areas to focus on\n   - Explicit about what actions to take (open PRs, commit, just analyze, etc.)\n3. **Set the schedule** \u2014 Ask when and how often. The user's timezone is ").concat(userTimezone, ". When they say a time (e.g., \"every morning at 9am\"), assume they mean their local time and convert to UTC for the cron expression. Always confirm the conversion: \"9am ").concat(userTimezone, " = Xam UTC.\"\n4. **Choose the model** \u2014 Default to `claude-sonnet-4-6`. Tell the user which model you're defaulting to and ask if they want a different one.\n5. **Validate connections** \u2014 Infer what services the agent will need from the user's description. For example, if they say \"check Datadog and Slack me errors,\" the agent needs both Datadog and Slack MCP connectors. Cross-reference with the connectors list above. If any are missing, warn the user and link them to https://claude.ai/settings/connectors to connect first.").concat(gitRepoUrl ? " The default git repo is already set to `".concat(gitRepoUrl, "`. Ask the user if this is the right repo or if they need a different one.") : ' Ask which git repos the remote agent needs cloned into its environment.', "\n6. **Review and confirm** \u2014 Show the full configuration before creating. Let them adjust.\n7. **Create it** \u2014 Call `").concat(prompt_js_2.REMOTE_TRIGGER_TOOL_NAME, "` with `action: \"create\"` and show the result. The response includes the trigger ID. Always output a link at the end: `https://claude.ai/code/scheduled/{TRIGGER_ID}`\n\n### UPDATE a trigger:\n\n1. List triggers first so they can pick one\n2. Ask what they want to change\n3. Show current vs proposed value\n4. Confirm and update\n\n### LIST triggers:\n\n1. Fetch and display in a readable format\n2. Show: name, schedule (human-readable), enabled/disabled, next run, repo(s)\n\n### RUN NOW:\n\n1. List triggers if they haven't specified which one\n2. Confirm which trigger\n3. Execute and confirm\n\n## Important Notes\n\n- These are REMOTE agents \u2014 they run in Anthropic's cloud, not on the user's machine. They cannot access local files, local services, or local environment variables.\n- Always convert cron to human-readable when displaying\n- Default to `enabled: true` unless user says otherwise\n- Accept GitHub URLs in any format (https://github.com/org/repo, org/repo, etc.) and normalize to the full HTTPS URL (without .git suffix)\n- The prompt is the most important part \u2014 spend time getting it right. The remote agent starts with zero context, so the prompt must be self-contained.\n- To delete a trigger, direct users to https://claude.ai/code/scheduled\n").concat(needsGitHubAccessReminder ? "- If the user's request seems to require GitHub repo access (e.g. cloning a repo, opening PRs, reading code), remind them that ".concat((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_lantern', false) ? "they should run /web-setup to connect their GitHub account (or install the Claude GitHub App on the repo as an alternative) — otherwise the remote agent won't be able to access it" : "they need the Claude GitHub App installed on the repo — otherwise the remote agent won't be able to access it", ".") : '', "\n").concat(userArgs ? "\n## User Request\n\nThe user said: \"".concat(userArgs, "\"\n\nStart by understanding their intent and working through the appropriate workflow above.") : '');
}
function registerScheduleRemoteAgentsSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'schedule',
        description: 'Create, update, list, or run scheduled remote agents (triggers) that execute on a cron schedule.',
        whenToUse: 'When the user wants to schedule a recurring remote agent, set up automated tasks, create a cron job for Claude Code, or manage their scheduled agents/triggers.',
        userInvocable: true,
        isEnabled: function () {
            return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_surreal_dali', false) &&
                (0, index_js_1.isPolicyAllowed)('allow_remote_sessions');
        },
        allowedTools: [prompt_js_2.REMOTE_TRIGGER_TOOL_NAME, prompt_js_1.ASK_USER_QUESTION_TOOL_NAME],
        getPromptForCommand: function (args, context) {
            return __awaiter(this, void 0, void 0, function () {
                var environments, err_1, createdEnvironment, err_2, setupNotes, needsGitHubAccessReminder, repo, hasAccess, webSetupEnabled, msg, connectors, userTimezone, connectorsInfo, gitRepoUrl, lines, _i, environments_1, env, environmentsInfo, prompt;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!((_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken)) {
                                return [2 /*return*/, [
                                        {
                                            type: 'text',
                                            text: 'You need to authenticate with a claude.ai account first. API accounts are not supported. Run /login, then try /schedule again.',
                                        },
                                    ]];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, (0, environments_js_1.fetchEnvironments)()];
                        case 2:
                            environments = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _b.sent();
                            (0, debug_js_1.logForDebugging)("[schedule] Failed to fetch environments: ".concat(err_1), {
                                level: 'warn',
                            });
                            return [2 /*return*/, [
                                    {
                                        type: 'text',
                                        text: "We're having trouble connecting with your remote claude.ai account to set up a scheduled task. Please try /schedule again in a few minutes.",
                                    },
                                ]];
                        case 4:
                            createdEnvironment = null;
                            if (!(environments.length === 0)) return [3 /*break*/, 8];
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, (0, environments_js_1.createDefaultCloudEnvironment)('claude-code-default')];
                        case 6:
                            createdEnvironment = _b.sent();
                            environments = [createdEnvironment];
                            return [3 /*break*/, 8];
                        case 7:
                            err_2 = _b.sent();
                            (0, debug_js_1.logForDebugging)("[schedule] Failed to create environment: ".concat(err_2), {
                                level: 'warn',
                            });
                            return [2 /*return*/, [
                                    {
                                        type: 'text',
                                        text: 'No remote environments found, and we could not create one automatically. Visit https://claude.ai/code to set one up, then run /schedule again.',
                                    },
                                ]];
                        case 8:
                            setupNotes = [];
                            needsGitHubAccessReminder = false;
                            return [4 /*yield*/, (0, detectRepository_js_1.detectCurrentRepositoryWithHost)()];
                        case 9:
                            repo = _b.sent();
                            if (!(repo === null)) return [3 /*break*/, 10];
                            setupNotes.push("Not in a git repo \u2014 you'll need to specify a repo URL manually (or skip repos entirely).");
                            return [3 /*break*/, 12];
                        case 10:
                            if (!(repo.host === 'github.com')) return [3 /*break*/, 12];
                            return [4 /*yield*/, (0, preconditions_js_1.checkRepoForRemoteAccess)(repo.owner, repo.name)];
                        case 11:
                            hasAccess = (_b.sent()).hasAccess;
                            if (!hasAccess) {
                                needsGitHubAccessReminder = true;
                                webSetupEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_lantern', false);
                                msg = webSetupEnabled
                                    ? "GitHub not connected for ".concat(repo.owner, "/").concat(repo.name, " \u2014 run /web-setup to sync your GitHub credentials, or install the Claude GitHub App at https://claude.ai/code/onboarding?magic=github-app-setup.")
                                    : "Claude GitHub App not installed on ".concat(repo.owner, "/").concat(repo.name, " \u2014 install at https://claude.ai/code/onboarding?magic=github-app-setup if your trigger needs this repo.");
                                setupNotes.push(msg);
                            }
                            _b.label = 12;
                        case 12:
                            connectors = getConnectedClaudeAIConnectors(context.options.mcpClients);
                            if (connectors.length === 0) {
                                setupNotes.push("No MCP connectors \u2014 connect at https://claude.ai/settings/connectors if needed.");
                            }
                            userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            connectorsInfo = formatConnectorsInfo(connectors);
                            return [4 /*yield*/, getCurrentRepoHttpsUrl()];
                        case 13:
                            gitRepoUrl = _b.sent();
                            lines = ['Available environments:'];
                            for (_i = 0, environments_1 = environments; _i < environments_1.length; _i++) {
                                env = environments_1[_i];
                                lines.push("- ".concat(env.name, " (id: ").concat(env.environment_id, ", kind: ").concat(env.kind, ")"));
                            }
                            environmentsInfo = lines.join('\n');
                            prompt = buildPrompt({
                                userTimezone: userTimezone,
                                connectorsInfo: connectorsInfo,
                                gitRepoUrl: gitRepoUrl,
                                environmentsInfo: environmentsInfo,
                                createdEnvironment: createdEnvironment,
                                setupNotes: setupNotes,
                                needsGitHubAccessReminder: needsGitHubAccessReminder,
                                userArgs: args,
                            });
                            return [2 /*return*/, [{ type: 'text', text: prompt }]];
                    }
                });
            });
        },
    });
}
