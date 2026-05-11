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
exports.getPrompt = exports.MAX_LISTING_DESC_CHARS = exports.DEFAULT_CHAR_BUDGET = exports.CHARS_PER_TOKEN = exports.SKILL_BUDGET_CONTEXT_PERCENT = void 0;
exports.getCharBudget = getCharBudget;
exports.formatCommandsWithinBudget = formatCommandsWithinBudget;
exports.getSkillToolInfo = getSkillToolInfo;
exports.getLimitedSkillToolCommands = getLimitedSkillToolCommands;
exports.clearPromptCache = clearPromptCache;
exports.getSkillInfo = getSkillInfo;
var lodash_es_1 = require("lodash-es");
var commands_js_1 = require("src/commands.js");
var xml_js_1 = require("../../constants/xml.js");
var stringWidth_js_1 = require("../../ink/stringWidth.js");
var index_js_1 = require("../../services/analytics/index.js");
var array_js_1 = require("../../utils/array.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var format_js_1 = require("../../utils/format.js");
var log_js_1 = require("../../utils/log.js");
// Skill listing gets 1% of the context window (in characters)
exports.SKILL_BUDGET_CONTEXT_PERCENT = 0.01;
exports.CHARS_PER_TOKEN = 4;
exports.DEFAULT_CHAR_BUDGET = 8000; // Fallback: 1% of 200k × 4
// Per-entry hard cap. The listing is for discovery only — the Skill tool loads
// full content on invoke, so verbose whenToUse strings waste turn-1 cache_creation
// tokens without improving match rate. Applies to all entries, including bundled,
// since the cap is generous enough to preserve the core use case.
exports.MAX_LISTING_DESC_CHARS = 250;
function getCharBudget(contextWindowTokens) {
    if (Number(process.env.SLASH_COMMAND_TOOL_CHAR_BUDGET)) {
        return Number(process.env.SLASH_COMMAND_TOOL_CHAR_BUDGET);
    }
    if (contextWindowTokens) {
        return Math.floor(contextWindowTokens * exports.CHARS_PER_TOKEN * exports.SKILL_BUDGET_CONTEXT_PERCENT);
    }
    return exports.DEFAULT_CHAR_BUDGET;
}
function getCommandDescription(cmd) {
    var desc = cmd.whenToUse
        ? "".concat(cmd.description, " - ").concat(cmd.whenToUse)
        : cmd.description;
    return desc.length > exports.MAX_LISTING_DESC_CHARS
        ? desc.slice(0, exports.MAX_LISTING_DESC_CHARS - 1) + '\u2026'
        : desc;
}
function formatCommandDescription(cmd) {
    // Debug: log if userFacingName differs from cmd.name for plugin skills
    var displayName = (0, commands_js_1.getCommandName)(cmd);
    if (cmd.name !== displayName &&
        cmd.type === 'prompt' &&
        cmd.source === 'plugin') {
        (0, debug_js_1.logForDebugging)("Skill prompt: showing \"".concat(cmd.name, "\" (userFacingName=\"").concat(displayName, "\")"));
    }
    return "- ".concat(cmd.name, ": ").concat(getCommandDescription(cmd));
}
var MIN_DESC_LENGTH = 20;
function formatCommandsWithinBudget(commands, contextWindowTokens) {
    if (commands.length === 0)
        return '';
    var budget = getCharBudget(contextWindowTokens);
    // Try full descriptions first
    var fullEntries = commands.map(function (cmd) { return ({
        cmd: cmd,
        full: formatCommandDescription(cmd),
    }); });
    // join('\n') produces N-1 newlines for N entries
    var fullTotal = fullEntries.reduce(function (sum, e) { return sum + (0, stringWidth_js_1.stringWidth)(e.full); }, 0) +
        (fullEntries.length - 1);
    if (fullTotal <= budget) {
        return fullEntries.map(function (e) { return e.full; }).join('\n');
    }
    // Partition into bundled (never truncated) and rest
    var bundledIndices = new Set();
    var restCommands = [];
    for (var i = 0; i < commands.length; i++) {
        var cmd = commands[i];
        if (cmd.type === 'prompt' && cmd.source === 'bundled') {
            bundledIndices.add(i);
        }
        else {
            restCommands.push(cmd);
        }
    }
    // Compute space used by bundled skills (full descriptions, always preserved)
    var bundledChars = fullEntries.reduce(function (sum, e, i) {
        return bundledIndices.has(i) ? sum + (0, stringWidth_js_1.stringWidth)(e.full) + 1 : sum;
    }, 0);
    var remainingBudget = budget - bundledChars;
    // Calculate max description length for non-bundled commands
    if (restCommands.length === 0) {
        return fullEntries.map(function (e) { return e.full; }).join('\n');
    }
    var restNameOverhead = restCommands.reduce(function (sum, cmd) { return sum + (0, stringWidth_js_1.stringWidth)(cmd.name) + 4; }, 0) +
        (restCommands.length - 1);
    var availableForDescs = remainingBudget - restNameOverhead;
    var maxDescLen = Math.floor(availableForDescs / restCommands.length);
    if (maxDescLen < MIN_DESC_LENGTH) {
        // Extreme case: non-bundled go names-only, bundled keep descriptions
        if (process.env.USER_TYPE === 'ant') {
            (0, index_js_1.logEvent)('tengu_skill_descriptions_truncated', {
                skill_count: commands.length,
                budget: budget,
                full_total: fullTotal,
                truncation_mode: 'names_only',
                max_desc_length: maxDescLen,
                bundled_count: bundledIndices.size,
                bundled_chars: bundledChars,
            });
        }
        return commands
            .map(function (cmd, i) {
            return bundledIndices.has(i) ? fullEntries[i].full : "- ".concat(cmd.name);
        })
            .join('\n');
    }
    // Truncate non-bundled descriptions to fit within budget
    var truncatedCount = (0, array_js_1.count)(restCommands, function (cmd) { return (0, stringWidth_js_1.stringWidth)(getCommandDescription(cmd)) > maxDescLen; });
    if (process.env.USER_TYPE === 'ant') {
        (0, index_js_1.logEvent)('tengu_skill_descriptions_truncated', {
            skill_count: commands.length,
            budget: budget,
            full_total: fullTotal,
            truncation_mode: 'description_trimmed',
            max_desc_length: maxDescLen,
            truncated_count: truncatedCount,
            // Count of bundled skills included in this prompt (excludes skills with disableModelInvocation)
            bundled_count: bundledIndices.size,
            bundled_chars: bundledChars,
        });
    }
    return commands
        .map(function (cmd, i) {
        // Bundled skills always get full descriptions
        if (bundledIndices.has(i))
            return fullEntries[i].full;
        var description = getCommandDescription(cmd);
        return "- ".concat(cmd.name, ": ").concat((0, format_js_1.truncate)(description, maxDescLen));
    })
        .join('\n');
}
exports.getPrompt = (0, lodash_es_1.memoize)(function (_cwd) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, "Execute a skill within the main conversation\n\nWhen users ask you to perform tasks, check if any of the available skills match. Skills provide specialized capabilities and domain knowledge.\n\nWhen users reference a \"slash command\" or \"/<something>\" (e.g., \"/commit\", \"/review-pr\"), they are referring to a skill. Use this tool to invoke it.\n\nHow to invoke:\n- Use this tool with the skill name and optional arguments\n- Examples:\n  - `skill: \"pdf\"` - invoke the pdf skill\n  - `skill: \"commit\", args: \"-m 'Fix bug'\"` - invoke with arguments\n  - `skill: \"review-pr\", args: \"123\"` - invoke with arguments\n  - `skill: \"ms-office-suite:pdf\"` - invoke using fully qualified name\n\nImportant:\n- Available skills are listed in system-reminder messages in the conversation\n- When a skill matches the user's request, this is a BLOCKING REQUIREMENT: invoke the relevant Skill tool BEFORE generating any other response about the task\n- NEVER mention a skill without actually calling this tool\n- Do not invoke a skill that is already running\n- Do not use this tool for built-in CLI commands (like /help, /clear, etc.)\n- If you see a <".concat(xml_js_1.COMMAND_NAME_TAG, "> tag in the current conversation turn, the skill has ALREADY been loaded - follow the instructions directly instead of calling this tool again\n")];
    });
}); });
function getSkillToolInfo(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var agentCommands;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, commands_js_1.getSkillToolCommands)(cwd)];
                case 1:
                    agentCommands = _a.sent();
                    return [2 /*return*/, {
                            totalCommands: agentCommands.length,
                            includedCommands: agentCommands.length,
                        }];
            }
        });
    });
}
// Returns the commands included in the SkillTool prompt.
// All commands are always included (descriptions may be truncated to fit budget).
// Used by analyzeContext to count skill tokens.
function getLimitedSkillToolCommands(cwd) {
    return (0, commands_js_1.getSkillToolCommands)(cwd);
}
function clearPromptCache() {
    var _a, _b;
    (_b = (_a = exports.getPrompt.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
function getSkillInfo(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var skills, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, commands_js_1.getSlashCommandToolSkills)(cwd)];
                case 1:
                    skills = _a.sent();
                    return [2 /*return*/, {
                            totalSkills: skills.length,
                            includedSkills: skills.length,
                        }];
                case 2:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    // Return zeros rather than throwing - let caller decide how to handle
                    return [2 /*return*/, {
                            totalSkills: 0,
                            includedSkills: 0,
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
