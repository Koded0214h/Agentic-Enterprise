"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLEEP_TOOL_PROMPT = exports.DESCRIPTION = exports.SLEEP_TOOL_NAME = void 0;
var xml_js_1 = require("../../constants/xml.js");
exports.SLEEP_TOOL_NAME = 'Sleep';
exports.DESCRIPTION = 'Wait for a specified duration';
exports.SLEEP_TOOL_PROMPT = "Wait for a specified duration. The user can interrupt the sleep at any time.\n\nUse this when the user tells you to sleep or rest, when you have nothing to do, or when you're waiting for something.\n\nYou may receive <".concat(xml_js_1.TICK_TAG, "> prompts \u2014 these are periodic check-ins. Look for useful work to do before sleeping.\n\nYou can call this concurrently with other tools \u2014 it won't interfere with them.\n\nPrefer this over `Bash(sleep ...)` \u2014 it doesn't hold a shell process.\n\nEach wake-up costs an API call, but the prompt cache expires after 5 minutes of inactivity \u2014 balance accordingly.");
