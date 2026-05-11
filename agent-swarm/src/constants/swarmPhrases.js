"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SWARM_EXIT_PHRASES = exports.SWARM_LOADING_PHRASES = exports.SWARM_BOOT_PHRASES = void 0;
exports.getBootPhrase = getBootPhrase;
exports.getLoadingPhrase = getLoadingPhrase;
exports.getExitPhrase = getExitPhrase;
exports.SWARM_BOOT_PHRASES = [
    'Swarm online. Let’s make moves.',
    'Hive mind synced. Time to build.',
    'Agents assembled. Chaos, but productive.',
    'Swarm warmed up. Targets locked.',
    'Collective brain booted. Let’s cook.',
];
exports.SWARM_LOADING_PHRASES = [
    'Scouting the code hive…',
    'Dispatching worker agents…',
    'Routing tasks through the swarm…',
    'Stirring the hive brain…',
    'Collecting signal from the colony…',
];
exports.SWARM_EXIT_PHRASES = [
    'Swarm dispersing. Ping me when it’s go time.',
    'Hive powering down. Mission clock paused.',
    'Agents clocking out. We run it back soon.',
    'Swarm sleeping with one eye open.',
    'Session sealed. Colony standing by.',
];
function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
}
var cachedBootPhrase = null;
function getBootPhrase() {
    if (!cachedBootPhrase)
        cachedBootPhrase = pickRandom(exports.SWARM_BOOT_PHRASES);
    return cachedBootPhrase;
}
function getLoadingPhrase() {
    return pickRandom(exports.SWARM_LOADING_PHRASES);
}
function getExitPhrase() {
    return pickRandom(exports.SWARM_EXIT_PHRASES);
}
