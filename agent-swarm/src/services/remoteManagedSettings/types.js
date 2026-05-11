"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteManagedSettingsResponseSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
/**
 * Schema for the remotely managed settings response.
 * Note: Uses permissive z.record() instead of SettingsSchema to avoid circular dependency.
 * Full validation is performed in index.ts after parsing using SettingsSchema.safeParse().
 */
exports.RemoteManagedSettingsResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        uuid: v4_1.z.string(), // Settings UUID
        checksum: v4_1.z.string(),
        settings: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()),
    });
});
