"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initBundledSkills = initBundledSkills;
var bun_bundle_1 = require("bun:bundle");
var setup_js_1 = require("src/utils/claudeInChrome/setup.js");
var batch_js_1 = require("./batch.js");
var claudeInChrome_js_1 = require("./claudeInChrome.js");
var debug_js_1 = require("./debug.js");
var keybindings_js_1 = require("./keybindings.js");
var loremIpsum_js_1 = require("./loremIpsum.js");
var remember_js_1 = require("./remember.js");
var simplify_js_1 = require("./simplify.js");
var skillify_js_1 = require("./skillify.js");
var stuck_js_1 = require("./stuck.js");
var updateConfig_js_1 = require("./updateConfig.js");
var verify_js_1 = require("./verify.js");
/**
 * Initialize all bundled skills.
 * Called at startup to register skills that ship with the CLI.
 *
 * To add a new bundled skill:
 * 1. Create a new file in src/skills/bundled/ (e.g., myskill.ts)
 * 2. Export a register function that calls registerBundledSkill()
 * 3. Import and call that function here
 */
function initBundledSkills() {
    (0, updateConfig_js_1.registerUpdateConfigSkill)();
    (0, keybindings_js_1.registerKeybindingsSkill)();
    (0, verify_js_1.registerVerifySkill)();
    (0, debug_js_1.registerDebugSkill)();
    (0, loremIpsum_js_1.registerLoremIpsumSkill)();
    (0, skillify_js_1.registerSkillifySkill)();
    (0, remember_js_1.registerRememberSkill)();
    (0, simplify_js_1.registerSimplifySkill)();
    (0, batch_js_1.registerBatchSkill)();
    (0, stuck_js_1.registerStuckSkill)();
    if ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_DREAM')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerDreamSkill = require('./dream.js').registerDreamSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        registerDreamSkill();
    }
    if ((0, bun_bundle_1.feature)('REVIEW_ARTIFACT')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerHunterSkill = require('./hunter.js').registerHunterSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        registerHunterSkill();
    }
    if ((0, bun_bundle_1.feature)('AGENT_TRIGGERS')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerLoopSkill = require('./loop.js').registerLoopSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        // /loop's isEnabled delegates to isKairosCronEnabled() — same lazy
        // per-invocation pattern as the cron tools. Registered unconditionally;
        // the skill's own isEnabled callback decides visibility.
        registerLoopSkill();
    }
    if ((0, bun_bundle_1.feature)('AGENT_TRIGGERS_REMOTE')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerScheduleRemoteAgentsSkill = require('./scheduleRemoteAgents.js').registerScheduleRemoteAgentsSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        registerScheduleRemoteAgentsSkill();
    }
    if ((0, bun_bundle_1.feature)('BUILDING_CLAUDE_APPS')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerClaudeApiSkill = require('./claudeApi.js').registerClaudeApiSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        registerClaudeApiSkill();
    }
    if ((0, setup_js_1.shouldAutoEnableClaudeInChrome)()) {
        (0, claudeInChrome_js_1.registerClaudeInChromeSkill)();
    }
    if ((0, bun_bundle_1.feature)('RUN_SKILL_GENERATOR')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var registerRunSkillGeneratorSkill = require('./runSkillGenerator.js').registerRunSkillGeneratorSkill;
        /* eslint-enable @typescript-eslint/no-require-imports */
        registerRunSkillGeneratorSkill();
    }
}
