"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prependModeCharacterToInput = prependModeCharacterToInput;
exports.getModeFromInput = getModeFromInput;
exports.getValueFromInput = getValueFromInput;
exports.isInputModeCharacter = isInputModeCharacter;
function prependModeCharacterToInput(input, mode) {
    switch (mode) {
        case 'bash':
            return "!".concat(input);
        default:
            return input;
    }
}
function getModeFromInput(input) {
    if (input.startsWith('!')) {
        return 'bash';
    }
    return 'prompt';
}
function getValueFromInput(input) {
    var mode = getModeFromInput(input);
    if (mode === 'prompt') {
        return input;
    }
    return input.slice(1);
}
function isInputModeCharacter(input) {
    return input === '!';
}
