"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AppContext_js_1 = require("../components/AppContext.js");
/**
 * `useApp` is a React hook, which exposes a method to manually exit the app (unmount).
 */
var useApp = function () { return (0, react_1.useContext)(AppContext_js_1.default); };
exports.default = useApp;
