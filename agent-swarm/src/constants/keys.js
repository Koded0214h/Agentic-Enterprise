"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGrowthBookClientKey = getGrowthBookClientKey;
var envUtils_js_1 = require("../utils/envUtils.js");
// Lazy read so ENABLE_GROWTHBOOK_DEV from globalSettings.env (applied after
// module load) is picked up. USER_TYPE is a build-time define so it's safe.
function getGrowthBookClientKey() {
    return process.env.USER_TYPE === 'ant'
        ? (0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_GROWTHBOOK_DEV)
            ? 'sdk-yZQvlplybuXjYh6L'
            : 'sdk-xRVcrliHIlrg4og4'
        : 'sdk-zAZezfDKGoZuXXKe';
}
