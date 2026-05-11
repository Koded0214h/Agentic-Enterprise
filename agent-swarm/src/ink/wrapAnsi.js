"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapAnsi = void 0;
var wrap_ansi_1 = require("wrap-ansi");
var wrapAnsiBun = typeof Bun !== 'undefined' && typeof Bun.wrapAnsi === 'function'
    ? Bun.wrapAnsi
    : null;
var wrapAnsi = wrapAnsiBun !== null && wrapAnsiBun !== void 0 ? wrapAnsiBun : wrap_ansi_1.default;
exports.wrapAnsi = wrapAnsi;
