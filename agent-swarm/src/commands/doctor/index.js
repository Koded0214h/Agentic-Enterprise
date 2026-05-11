"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var envUtils_js_1 = require("../../utils/envUtils.js");
var doctor = {
    name: 'doctor',
    description: 'Diagnose and verify your Claude Code installation and settings',
    isEnabled: function () { return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_DOCTOR_COMMAND); },
    type: 'local-jsx',
    load: function () { return Promise.resolve().then(function () { return require('./doctor.js'); }); },
};
exports.default = doctor;
