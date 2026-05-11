"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionDeps = productionDeps;
var crypto_1 = require("crypto");
var claude_js_1 = require("../services/api/claude.js");
var autoCompact_js_1 = require("../services/compact/autoCompact.js");
var microCompact_js_1 = require("../services/compact/microCompact.js");
function productionDeps() {
    return {
        callModel: claude_js_1.queryModelWithStreaming,
        microcompact: microCompact_js_1.microcompactMessages,
        autocompact: autoCompact_js_1.autoCompactIfNeeded,
        uuid: crypto_1.randomUUID,
    };
}
