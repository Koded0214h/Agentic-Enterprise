"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnectorTextBlock = isConnectorTextBlock;
function isConnectorTextBlock(block) {
    return typeof block === 'object' && block !== null && block.type === 'connector_text';
}
