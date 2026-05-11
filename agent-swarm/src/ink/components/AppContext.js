"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * `AppContext` is a React context, which exposes a method to manually exit the app (unmount).
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
var AppContext = (0, react_1.createContext)({
    exit: function () { },
});
// eslint-disable-next-line custom-rules/no-top-level-side-effects
AppContext.displayName = 'InternalAppContext';
exports.default = AppContext;
