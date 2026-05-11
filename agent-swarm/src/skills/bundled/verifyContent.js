"use strict";
// Content for the verify bundled skill.
// Each .md file is inlined as a string at build time via Bun's text loader.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SKILL_FILES = exports.SKILL_MD = void 0;
var cli_md_1 = require("./verify/examples/cli.md");
var server_md_1 = require("./verify/examples/server.md");
var SKILL_md_1 = require("./verify/SKILL.md");
exports.SKILL_MD = SKILL_md_1.default;
exports.SKILL_FILES = {
    'examples/cli.md': cli_md_1.default,
    'examples/server.md': server_md_1.default,
};
