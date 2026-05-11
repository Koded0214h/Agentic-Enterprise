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
exports.ultrareview = void 0;
var ultrareviewEnabled_js_1 = require("./review/ultrareviewEnabled.js");
// Legal wants the explicit surface name plus a docs link visible before the
// user triggers, so the description carries "Claude Code on the web" + URL.
var CCR_TERMS_URL = 'https://code.claude.com/docs/en/claude-code-on-the-web';
var LOCAL_REVIEW_PROMPT = function (args) { return "\n      You are an expert code reviewer. Follow these steps:\n\n      1. If no PR number is provided in the args, run `gh pr list` to show open PRs\n      2. If a PR number is provided, run `gh pr view <number>` to get PR details\n      3. Run `gh pr diff <number>` to get the diff\n      4. Analyze the changes and provide a thorough code review that includes:\n         - Overview of what the PR does\n         - Analysis of code quality and style\n         - Specific suggestions for improvements\n         - Any potential issues or risks\n\n      Keep your review concise but thorough. Focus on:\n      - Code correctness\n      - Following project conventions\n      - Performance implications\n      - Test coverage\n      - Security considerations\n\n      Format your review with clear sections and bullet points.\n\n      PR number: ".concat(args, "\n    "); };
var review = {
    type: 'prompt',
    name: 'review',
    description: 'Review a pull request',
    progressMessage: 'reviewing pull request',
    contentLength: 0,
    source: 'builtin',
    getPromptForCommand: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [{ type: 'text', text: LOCAL_REVIEW_PROMPT(args) }]];
            });
        });
    },
};
// /ultrareview is the ONLY entry point to the remote bughunter path —
// /review stays purely local. local-jsx type renders the overage permission
// dialog when free reviews are exhausted.
var ultrareview = {
    type: 'local-jsx',
    name: 'ultrareview',
    description: "~10\u201320 min \u00B7 Finds and verifies bugs in your branch. Runs in Claude Code on the web. See ".concat(CCR_TERMS_URL),
    isEnabled: function () { return (0, ultrareviewEnabled_js_1.isUltrareviewEnabled)(); },
    load: function () { return Promise.resolve().then(function () { return require('./review/ultrareviewCommand.js'); }); },
};
exports.ultrareview = ultrareview;
exports.default = review;
