"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAfterFirstRender = useAfterFirstRender;
var react_1 = require("react");
var envUtils_js_1 = require("../utils/envUtils.js");
function useAfterFirstRender() {
    (0, react_1.useEffect)(function () {
        if (process.env.USER_TYPE === 'ant' &&
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EXIT_AFTER_FIRST_RENDER)) {
            process.stderr.write("\nStartup time: ".concat(Math.round(process.uptime() * 1000), "ms\n"));
            // eslint-disable-next-line custom-rules/no-process-exit
            process.exit(0);
        }
    }, []);
}
