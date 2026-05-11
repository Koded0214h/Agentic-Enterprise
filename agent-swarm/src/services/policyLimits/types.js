"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyLimitsResponseSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
/**
 * Schema for the policy limits API response
 * Only blocked policies are included. If a policy key is absent, it's allowed.
 */
exports.PolicyLimitsResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        restrictions: v4_1.z.record(v4_1.z.string(), v4_1.z.object({ allowed: v4_1.z.boolean() })),
    });
});
