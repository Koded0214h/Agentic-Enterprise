"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useWizard = useWizard;
var react_1 = require("react");
var WizardProvider_js_1 = require("./WizardProvider.js");
function useWizard() {
    var context = (0, react_1.useContext)(WizardProvider_js_1.WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
