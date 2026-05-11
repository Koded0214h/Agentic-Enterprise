"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoListSchema = exports.TodoItemSchema = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../lazySchema.js");
var TodoStatusSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['pending', 'in_progress', 'completed']);
});
exports.TodoItemSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        content: v4_1.z.string().min(1, 'Content cannot be empty'),
        status: TodoStatusSchema(),
        activeForm: v4_1.z.string().min(1, 'Active form cannot be empty'),
    });
});
exports.TodoListSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.array((0, exports.TodoItemSchema)()); });
