"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectResponseSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../utils/lazySchema.js");
exports.connectResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        session_id: v4_1.z.string(),
        ws_url: v4_1.z.string(),
        work_dir: v4_1.z.string().optional(),
    });
});
