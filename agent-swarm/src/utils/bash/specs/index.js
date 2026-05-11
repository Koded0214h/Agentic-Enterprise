"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var alias_js_1 = require("./alias.js");
var nohup_js_1 = require("./nohup.js");
var pyright_js_1 = require("./pyright.js");
var sleep_js_1 = require("./sleep.js");
var srun_js_1 = require("./srun.js");
var time_js_1 = require("./time.js");
var timeout_js_1 = require("./timeout.js");
exports.default = [
    pyright_js_1.default,
    timeout_js_1.default,
    sleep_js_1.default,
    alias_js_1.default,
    nohup_js_1.default,
    time_js_1.default,
    srun_js_1.default,
];
