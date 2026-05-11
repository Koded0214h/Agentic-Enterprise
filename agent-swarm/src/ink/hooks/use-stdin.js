"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var StdinContext_js_1 = require("../components/StdinContext.js");
/**
 * `useStdin` is a React hook, which exposes stdin stream.
 */
var useStdin = function () { return (0, react_1.useContext)(StdinContext_js_1.default); };
exports.default = useStdin;
