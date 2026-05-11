"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROMPT = exports.DESCRIPTION = exports.REMOTE_TRIGGER_TOOL_NAME = void 0;
exports.REMOTE_TRIGGER_TOOL_NAME = 'RemoteTrigger';
exports.DESCRIPTION = 'Manage scheduled remote Claude Code agents (triggers) via the claude.ai CCR API. Auth is handled in-process — the token never reaches the shell.';
exports.PROMPT = "Call the claude.ai remote-trigger API. Use this instead of curl \u2014 the OAuth token is added automatically in-process and never exposed.\n\nActions:\n- list: GET /v1/code/triggers\n- get: GET /v1/code/triggers/{trigger_id}\n- create: POST /v1/code/triggers (requires body)\n- update: POST /v1/code/triggers/{trigger_id} (requires body, partial update)\n- run: POST /v1/code/triggers/{trigger_id}/run\n\nThe response is the raw JSON from the API.";
