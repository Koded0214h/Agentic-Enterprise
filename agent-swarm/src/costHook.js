"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCostSummary = useCostSummary;
var react_1 = require("react");
var cost_tracker_js_1 = require("./cost-tracker.js");
var billing_js_1 = require("./utils/billing.js");
function useCostSummary(getFpsMetrics) {
    (0, react_1.useEffect)(function () {
        var f = function () {
            if ((0, billing_js_1.hasConsoleBillingAccess)()) {
                process.stdout.write('\n' + (0, cost_tracker_js_1.formatTotalCost)() + '\n');
            }
            (0, cost_tracker_js_1.saveCurrentSessionCosts)(getFpsMetrics === null || getFpsMetrics === void 0 ? void 0 : getFpsMetrics());
        };
        process.on('exit', f);
        return function () {
            process.off('exit', f);
        };
    }, []);
}
