"use strict";
/**
 * Event Handler Factory
 *
 * Returns the appropriate handler for a given event type.
 */
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
exports.sessionCompleteHandler = exports.fileEditHandler = exports.userMessageHandler = exports.summarizeHandler = exports.observationHandler = exports.sessionInitHandler = exports.contextHandler = void 0;
exports.getEventHandler = getEventHandler;
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var logger_js_1 = require("../../utils/logger.js");
var context_js_1 = require("./context.js");
var session_init_js_1 = require("./session-init.js");
var observation_js_1 = require("./observation.js");
var summarize_js_1 = require("./summarize.js");
var user_message_js_1 = require("./user-message.js");
var file_edit_js_1 = require("./file-edit.js");
var session_complete_js_1 = require("./session-complete.js");
var handlers = {
    'context': context_js_1.contextHandler,
    'session-init': session_init_js_1.sessionInitHandler,
    'observation': observation_js_1.observationHandler,
    'summarize': summarize_js_1.summarizeHandler,
    'session-complete': session_complete_js_1.sessionCompleteHandler,
    'user-message': user_message_js_1.userMessageHandler,
    'file-edit': file_edit_js_1.fileEditHandler
};
/**
 * Get the event handler for a given event type.
 *
 * Returns a no-op handler for unknown event types instead of throwing (fix #984).
 * Claude Code may send new event types that the plugin doesn't handle yet —
 * throwing would surface as a BLOCKING_ERROR to the user.
 *
 * @param eventType The type of event to handle
 * @returns The appropriate EventHandler, or a no-op handler for unknown types
 */
function getEventHandler(eventType) {
    var handler = handlers[eventType];
    if (!handler) {
        logger_js_1.logger.warn('HOOK', "Unknown event type: ".concat(eventType, ", returning no-op"));
        return {
            execute: function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, { continue: true, suppressOutput: true, exitCode: hook_constants_js_1.HOOK_EXIT_CODES.SUCCESS }];
                    });
                });
            }
        };
    }
    return handler;
}
// Re-export individual handlers for direct access if needed
var context_js_2 = require("./context.js");
Object.defineProperty(exports, "contextHandler", { enumerable: true, get: function () { return context_js_2.contextHandler; } });
var session_init_js_2 = require("./session-init.js");
Object.defineProperty(exports, "sessionInitHandler", { enumerable: true, get: function () { return session_init_js_2.sessionInitHandler; } });
var observation_js_2 = require("./observation.js");
Object.defineProperty(exports, "observationHandler", { enumerable: true, get: function () { return observation_js_2.observationHandler; } });
var summarize_js_2 = require("./summarize.js");
Object.defineProperty(exports, "summarizeHandler", { enumerable: true, get: function () { return summarize_js_2.summarizeHandler; } });
var user_message_js_2 = require("./user-message.js");
Object.defineProperty(exports, "userMessageHandler", { enumerable: true, get: function () { return user_message_js_2.userMessageHandler; } });
var file_edit_js_2 = require("./file-edit.js");
Object.defineProperty(exports, "fileEditHandler", { enumerable: true, get: function () { return file_edit_js_2.fileEditHandler; } });
var session_complete_js_2 = require("./session-complete.js");
Object.defineProperty(exports, "sessionCompleteHandler", { enumerable: true, get: function () { return session_complete_js_2.sessionCompleteHandler; } });
