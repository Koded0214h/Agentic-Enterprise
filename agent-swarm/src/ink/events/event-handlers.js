"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_HANDLER_PROPS = exports.HANDLER_FOR_EVENT = void 0;
/**
 * Reverse lookup: event type string → handler prop names.
 * Used by the dispatcher for O(1) handler lookup per node.
 */
exports.HANDLER_FOR_EVENT = {
    keydown: { bubble: 'onKeyDown', capture: 'onKeyDownCapture' },
    focus: { bubble: 'onFocus', capture: 'onFocusCapture' },
    blur: { bubble: 'onBlur', capture: 'onBlurCapture' },
    paste: { bubble: 'onPaste', capture: 'onPasteCapture' },
    resize: { bubble: 'onResize' },
    click: { bubble: 'onClick' },
};
/**
 * Set of all event handler prop names, for the reconciler to detect
 * event props and store them in _eventHandlers instead of attributes.
 */
exports.EVENT_HANDLER_PROPS = new Set([
    'onKeyDown',
    'onKeyDownCapture',
    'onFocus',
    'onFocusCapture',
    'onBlur',
    'onBlurCapture',
    'onPaste',
    'onPasteCapture',
    'onResize',
    'onClick',
    'onMouseEnter',
    'onMouseLeave',
]);
