"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESCRIPTION = void 0;
exports.getPrompt = getPrompt;
var bun_bundle_1 = require("bun:bundle");
exports.DESCRIPTION = 'Send a message to another agent';
function getPrompt() {
    var udsRow = (0, bun_bundle_1.feature)('UDS_INBOX')
        ? "\n| `\"uds:/path/to.sock\"` | Local Claude session's socket (same machine; use `ListPeers`) |\n| `\"bridge:session_...\"` | Remote Control peer session (cross-machine; use `ListPeers`) |"
        : '';
    var udsSection = (0, bun_bundle_1.feature)('UDS_INBOX')
        ? "\n\n## Cross-session\n\nUse `ListPeers` to discover targets, then:\n\n```json\n{\"to\": \"uds:/tmp/cc-socks/1234.sock\", \"message\": \"check if tests pass over there\"}\n{\"to\": \"bridge:session_01AbCd...\", \"message\": \"what branch are you on?\"}\n```\n\nA listed peer is alive and will process your message \u2014 no \"busy\" state; messages enqueue and drain at the receiver's next tool round. Your message arrives wrapped as `<cross-session-message from=\"...\">`. **To reply to an incoming message, copy its `from` attribute as your `to`.**"
        : '';
    return "\n# SendMessage\n\nSend a message to another agent.\n\n```json\n{\"to\": \"researcher\", \"summary\": \"assign task 1\", \"message\": \"start on task #1\"}\n```\n\n| `to` | |\n|---|---|\n| `\"researcher\"` | Teammate by name |\n| `\"*\"` | Broadcast to all teammates \u2014 expensive (linear in team size), use only when everyone genuinely needs it |".concat(udsRow, "\n\nYour plain text output is NOT visible to other agents \u2014 to communicate, you MUST call this tool. Messages from teammates are delivered automatically; you don't check an inbox. Refer to teammates by name, never by UUID. When relaying, don't quote the original \u2014 it's already rendered to the user.").concat(udsSection, "\n\n## Protocol responses (legacy)\n\nIf you receive a JSON message with `type: \"shutdown_request\"` or `type: \"plan_approval_request\"`, respond with the matching `_response` type \u2014 echo the `request_id`, set `approve` true/false:\n\n```json\n{\"to\": \"team-lead\", \"message\": {\"type\": \"shutdown_response\", \"request_id\": \"...\", \"approve\": true}}\n{\"to\": \"researcher\", \"message\": {\"type\": \"plan_approval_response\", \"request_id\": \"...\", \"approve\": false, \"feedback\": \"add error handling\"}}\n```\n\nApproving shutdown terminates your process. Rejecting plan sends the teammate back to revise. Don't originate `shutdown_request` unless asked. Don't send structured JSON status messages \u2014 use TaskUpdate.\n").trim();
}
