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
exports.registerClaudeInChromeSkill = registerClaudeInChromeSkill;
var BROWSER_TOOLS = [
    { name: 'javascript_tool' },
    { name: 'read_page' },
    { name: 'find' },
    { name: 'form_input' },
    { name: 'computer' },
    { name: 'navigate' },
    { name: 'resize_window' },
    { name: 'gif_creator' },
    { name: 'upload_image' },
    { name: 'get_page_text' },
    { name: 'tabs_context_mcp' },
    { name: 'tabs_create_mcp' },
    { name: 'update_plan' },
    { name: 'read_console_messages' },
    { name: 'read_network_requests' },
    { name: 'shortcuts_list' },
    { name: 'shortcuts_execute' }
];
var prompt_js_1 = require("../../utils/claudeInChrome/prompt.js");
var setup_js_1 = require("../../utils/claudeInChrome/setup.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
var CLAUDE_IN_CHROME_MCP_TOOLS = BROWSER_TOOLS.map(function (tool) { return "mcp__claude-in-chrome__".concat(tool.name); });
var SKILL_ACTIVATION_MESSAGE = "\nNow that this skill is invoked, you have access to Chrome browser automation tools. You can now use the mcp__claude-in-chrome__* tools to interact with web pages.\n\nIMPORTANT: Start by calling mcp__claude-in-chrome__tabs_context_mcp to get information about the user's current browser tabs.\n";
function registerClaudeInChromeSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'claude-in-chrome',
        description: 'Automates your Chrome browser to interact with web pages - clicking elements, filling forms, capturing screenshots, reading console logs, and navigating sites. Opens pages in new tabs within your existing Chrome session. Requires site-level permissions before executing (configured in the extension).',
        whenToUse: 'When the user wants to interact with web pages, automate browser tasks, capture screenshots, read console logs, or perform any browser-based actions. Always invoke BEFORE attempting to use any mcp__claude-in-chrome__* tools.',
        allowedTools: CLAUDE_IN_CHROME_MCP_TOOLS,
        userInvocable: true,
        isEnabled: function () { return (0, setup_js_1.shouldAutoEnableClaudeInChrome)(); },
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var prompt;
                return __generator(this, function (_a) {
                    prompt = "".concat(prompt_js_1.BASE_CHROME_PROMPT, "\n").concat(SKILL_ACTIVATION_MESSAGE);
                    if (args) {
                        prompt += "\n## Task\n\n".concat(args);
                    }
                    return [2 /*return*/, [{ type: 'text', text: prompt }]];
                });
            });
        },
    });
}
