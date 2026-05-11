"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesNegativeKeyword = matchesNegativeKeyword;
exports.matchesKeepGoingKeyword = matchesKeepGoingKeyword;
/**
 * Checks if input matches negative keyword patterns
 */
function matchesNegativeKeyword(input) {
    var lowerInput = input.toLowerCase();
    var negativePattern = /\b(wtf|wth|ffs|omfg|shit(ty|tiest)?|dumbass|horrible|awful|piss(ed|ing)? off|piece of (shit|crap|junk)|what the (fuck|hell)|fucking? (broken|useless|terrible|awful|horrible)|fuck you|screw (this|you)|so frustrating|this sucks|damn it)\b/;
    return negativePattern.test(lowerInput);
}
/**
 * Checks if input matches keep going/continuation patterns
 */
function matchesKeepGoingKeyword(input) {
    var lowerInput = input.toLowerCase().trim();
    // Match "continue" only if it's the entire prompt
    if (lowerInput === 'continue') {
        return true;
    }
    // Match "keep going" or "go on" anywhere in the input
    var keepGoingPattern = /\b(keep going|go on)\b/;
    return keepGoingPattern.test(lowerInput);
}
