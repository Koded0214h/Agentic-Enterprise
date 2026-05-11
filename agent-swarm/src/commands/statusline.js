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
var constants_js_1 = require("../tools/AgentTool/constants.js");
var statusline = {
    type: 'prompt',
    description: "Set up Claude Code's status line UI",
    contentLength: 0,
    // Dynamic content
    aliases: [],
    name: 'statusline',
    progressMessage: 'setting up statusLine',
    allowedTools: [constants_js_1.AGENT_TOOL_NAME, 'Read(~/**)', 'Edit(~/.claude/settings.json)'],
    source: 'builtin',
    disableNonInteractive: true,
    getPromptForCommand: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = args.trim() || 'Configure my statusLine from my shell PS1 configuration';
                return [2 /*return*/, [{
                            type: 'text',
                            text: "Create an ".concat(constants_js_1.AGENT_TOOL_NAME, " with subagent_type \"statusline-setup\" and the prompt \"").concat(prompt, "\"")
                        }]];
            });
        });
    }
};
exports.default = statusline;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250ZW50QmxvY2tQYXJhbSIsIkNvbW1hbmQiLCJBR0VOVF9UT09MX05BTUUiLCJzdGF0dXNsaW5lIiwidHlwZSIsImRlc2NyaXB0aW9uIiwiY29udGVudExlbmd0aCIsImFsaWFzZXMiLCJuYW1lIiwicHJvZ3Jlc3NNZXNzYWdlIiwiYWxsb3dlZFRvb2xzIiwic291cmNlIiwiZGlzYWJsZU5vbkludGVyYWN0aXZlIiwiZ2V0UHJvbXB0Rm9yQ29tbWFuZCIsImFyZ3MiLCJQcm9taXNlIiwicHJvbXB0IiwidHJpbSIsInRleHQiXSwic291cmNlcyI6WyJzdGF0dXNsaW5lLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRlbnRCbG9ja1BhcmFtIH0gZnJvbSAnQGFudGhyb3BpYy1haS9zZGsvcmVzb3VyY2VzL2luZGV4Lm1qcydcbmltcG9ydCB0eXBlIHsgQ29tbWFuZCB9IGZyb20gJy4uL2NvbW1hbmRzLmpzJ1xuaW1wb3J0IHsgQUdFTlRfVE9PTF9OQU1FIH0gZnJvbSAnLi4vdG9vbHMvQWdlbnRUb29sL2NvbnN0YW50cy5qcydcblxuY29uc3Qgc3RhdHVzbGluZSA9IHtcbiAgdHlwZTogJ3Byb21wdCcsXG4gIGRlc2NyaXB0aW9uOiBcIlNldCB1cCBDbGF1ZGUgQ29kZSdzIHN0YXR1cyBsaW5lIFVJXCIsXG4gIGNvbnRlbnRMZW5ndGg6IDAsIC8vIER5bmFtaWMgY29udGVudFxuICBhbGlhc2VzOiBbXSxcbiAgbmFtZTogJ3N0YXR1c2xpbmUnLFxuICBwcm9ncmVzc01lc3NhZ2U6ICdzZXR0aW5nIHVwIHN0YXR1c0xpbmUnLFxuICBhbGxvd2VkVG9vbHM6IFtcbiAgICBBR0VOVF9UT09MX05BTUUsXG4gICAgJ1JlYWQofi8qKiknLFxuICAgICdFZGl0KH4vLmNsYXVkZS9zZXR0aW5ncy5qc29uKScsXG4gIF0sXG4gIHNvdXJjZTogJ2J1aWx0aW4nLFxuICBkaXNhYmxlTm9uSW50ZXJhY3RpdmU6IHRydWUsXG4gIGFzeW5jIGdldFByb21wdEZvckNvbW1hbmQoYXJncyk6IFByb21pc2U8Q29udGVudEJsb2NrUGFyYW1bXT4ge1xuICAgIGNvbnN0IHByb21wdCA9XG4gICAgICBhcmdzLnRyaW0oKSB8fCAnQ29uZmlndXJlIG15IHN0YXR1c0xpbmUgZnJvbSBteSBzaGVsbCBQUzEgY29uZmlndXJhdGlvbidcbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHRleHQ6IGBDcmVhdGUgYW4gJHtBR0VOVF9UT09MX05BTUV9IHdpdGggc3ViYWdlbnRfdHlwZSBcInN0YXR1c2xpbmUtc2V0dXBcIiBhbmQgdGhlIHByb21wdCBcIiR7cHJvbXB0fVwiYCxcbiAgICAgIH0sXG4gICAgXVxuICB9LFxufSBzYXRpc2ZpZXMgQ29tbWFuZFxuXG5leHBvcnQgZGVmYXVsdCBzdGF0dXNsaW5lXG4iXSwibWFwcGluZ3MiOiJBQUFBLGNBQWNBLGlCQUFpQixRQUFRLHVDQUF1QztBQUM5RSxjQUFjQyxPQUFPLFFBQVEsZ0JBQWdCO0FBQzdDLFNBQVNDLGVBQWUsUUFBUSxpQ0FBaUM7QUFFakUsTUFBTUMsVUFBVSxHQUFHO0VBQ2pCQyxJQUFJLEVBQUUsUUFBUTtFQUNkQyxXQUFXLEVBQUUscUNBQXFDO0VBQ2xEQyxhQUFhLEVBQUUsQ0FBQztFQUFFO0VBQ2xCQyxPQUFPLEVBQUUsRUFBRTtFQUNYQyxJQUFJLEVBQUUsWUFBWTtFQUNsQkMsZUFBZSxFQUFFLHVCQUF1QjtFQUN4Q0MsWUFBWSxFQUFFLENBQ1pSLGVBQWUsRUFDZixZQUFZLEVBQ1osK0JBQStCLENBQ2hDO0VBQ0RTLE1BQU0sRUFBRSxTQUFTO0VBQ2pCQyxxQkFBcUIsRUFBRSxJQUFJO0VBQzNCLE1BQU1DLG1CQUFtQkEsQ0FBQ0MsSUFBSSxDQUFDLEVBQUVDLE9BQU8sQ0FBQ2YsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO0lBQzVELE1BQU1nQixNQUFNLEdBQ1ZGLElBQUksQ0FBQ0csSUFBSSxDQUFDLENBQUMsSUFBSSx5REFBeUQ7SUFDMUUsT0FBTyxDQUNMO01BQ0ViLElBQUksRUFBRSxNQUFNO01BQ1pjLElBQUksRUFBRSxhQUFhaEIsZUFBZSwwREFBMERjLE1BQU07SUFDcEcsQ0FBQyxDQUNGO0VBQ0g7QUFDRixDQUFDLFdBQVdmLE9BQU87QUFFbkIsZUFBZUUsVUFBVSIsImlnbm9yZUxpc3QiOltdfQ==
