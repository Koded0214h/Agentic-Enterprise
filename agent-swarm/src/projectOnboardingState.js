"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowProjectOnboarding = void 0;
exports.getSteps = getSteps;
exports.isProjectOnboardingComplete = isProjectOnboardingComplete;
exports.maybeMarkProjectOnboardingComplete = maybeMarkProjectOnboardingComplete;
exports.incrementProjectOnboardingSeenCount = incrementProjectOnboardingSeenCount;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var config_js_1 = require("./utils/config.js");
var cwd_js_1 = require("./utils/cwd.js");
var file_js_1 = require("./utils/file.js");
var fsOperations_js_1 = require("./utils/fsOperations.js");
function getSteps() {
    var hasClaudeMd = (0, fsOperations_js_1.getFsImplementation)().existsSync((0, path_1.join)((0, cwd_js_1.getCwd)(), 'CLAUDE.md'));
    var isWorkspaceDirEmpty = (0, file_js_1.isDirEmpty)((0, cwd_js_1.getCwd)());
    return [
        {
            key: 'workspace',
            text: 'Ask Claude to create a new app or clone a repository',
            isComplete: false,
            isCompletable: true,
            isEnabled: isWorkspaceDirEmpty,
        },
        {
            key: 'claudemd',
            text: 'Run /init to create a CLAUDE.md file with instructions for Claude',
            isComplete: hasClaudeMd,
            isCompletable: true,
            isEnabled: !isWorkspaceDirEmpty,
        },
    ];
}
function isProjectOnboardingComplete() {
    return getSteps()
        .filter(function (_a) {
        var isCompletable = _a.isCompletable, isEnabled = _a.isEnabled;
        return isCompletable && isEnabled;
    })
        .every(function (_a) {
        var isComplete = _a.isComplete;
        return isComplete;
    });
}
function maybeMarkProjectOnboardingComplete() {
    // Short-circuit on cached config — isProjectOnboardingComplete() hits
    // the filesystem, and REPL.tsx calls this on every prompt submit.
    if ((0, config_js_1.getCurrentProjectConfig)().hasCompletedProjectOnboarding) {
        return;
    }
    if (isProjectOnboardingComplete()) {
        (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { hasCompletedProjectOnboarding: true })); });
    }
}
exports.shouldShowProjectOnboarding = (0, memoize_js_1.default)(function () {
    var projectConfig = (0, config_js_1.getCurrentProjectConfig)();
    // Short-circuit on cached config before isProjectOnboardingComplete()
    // hits the filesystem — this runs during first render.
    if (projectConfig.hasCompletedProjectOnboarding ||
        projectConfig.projectOnboardingSeenCount >= 4 ||
        process.env.IS_DEMO) {
        return false;
    }
    return !isProjectOnboardingComplete();
});
function incrementProjectOnboardingSeenCount() {
    (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { projectOnboardingSeenCount: current.projectOnboardingSeenCount + 1 })); });
}
