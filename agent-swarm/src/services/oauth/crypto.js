"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeVerifier = generateCodeVerifier;
exports.generateCodeChallenge = generateCodeChallenge;
exports.generateState = generateState;
var crypto_1 = require("crypto");
function base64URLEncode(buffer) {
    return buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}
function generateCodeVerifier() {
    return base64URLEncode((0, crypto_1.randomBytes)(32));
}
function generateCodeChallenge(verifier) {
    var hash = (0, crypto_1.createHash)('sha256');
    hash.update(verifier);
    return base64URLEncode(hash.digest());
}
function generateState() {
    return base64URLEncode((0, crypto_1.randomBytes)(32));
}
