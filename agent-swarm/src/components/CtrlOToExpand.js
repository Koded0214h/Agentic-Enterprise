"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAgentProvider = SubAgentProvider;
exports.CtrlOToExpand = CtrlOToExpand;
exports.ctrlOToExpand = ctrlOToExpand;
var compiler_runtime_1 = require("react/compiler-runtime");
var chalk_1 = require("chalk");
var react_1 = require("react");
var ink_js_1 = require("../ink.js");
var shortcutFormat_js_1 = require("../keybindings/shortcutFormat.js");
var useShortcutDisplay_js_1 = require("../keybindings/useShortcutDisplay.js");
var KeyboardShortcutHint_js_1 = require("./design-system/KeyboardShortcutHint.js");
var messageActions_js_1 = require("./messageActions.js");
// Context to track if we're inside a sub agent
// Similar to MessageResponseContext, this helps us avoid showing
// too many "(ctrl+o to expand)" hints in sub agent output
var SubAgentContext = react_1.default.createContext(false);
function SubAgentProvider(t0) {
    var $ = (0, compiler_runtime_1.c)(2);
    var children = t0.children;
    var t1;
    if ($[0] !== children) {
        t1 = <SubAgentContext.Provider value={true}>{children}</SubAgentContext.Provider>;
        $[0] = children;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    return t1;
}
function CtrlOToExpand() {
    var $ = (0, compiler_runtime_1.c)(2);
    var isInSubAgent = (0, react_1.useContext)(SubAgentContext);
    var inVirtualList = (0, react_1.useContext)(messageActions_js_1.InVirtualListContext);
    var expandShortcut = (0, useShortcutDisplay_js_1.useShortcutDisplay)("app:toggleTranscript", "Global", "ctrl+o");
    if (isInSubAgent || inVirtualList) {
        return null;
    }
    var t0;
    if ($[0] !== expandShortcut) {
        t0 = <ink_js_1.Text dimColor={true}><KeyboardShortcutHint_js_1.KeyboardShortcutHint shortcut={expandShortcut} action="expand" parens={true}/></ink_js_1.Text>;
        $[0] = expandShortcut;
        $[1] = t0;
    }
    else {
        t0 = $[1];
    }
    return t0;
}
function ctrlOToExpand() {
    var shortcut = (0, shortcutFormat_js_1.getShortcutDisplay)('app:toggleTranscript', 'Global', 'ctrl+o');
    return chalk_1.default.dim("(".concat(shortcut, " to expand)"));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGFsayIsIlJlYWN0IiwidXNlQ29udGV4dCIsIlRleHQiLCJnZXRTaG9ydGN1dERpc3BsYXkiLCJ1c2VTaG9ydGN1dERpc3BsYXkiLCJLZXlib2FyZFNob3J0Y3V0SGludCIsIkluVmlydHVhbExpc3RDb250ZXh0IiwiU3ViQWdlbnRDb250ZXh0IiwiY3JlYXRlQ29udGV4dCIsIlN1YkFnZW50UHJvdmlkZXIiLCJ0MCIsIiQiLCJfYyIsImNoaWxkcmVuIiwidDEiLCJDdHJsT1RvRXhwYW5kIiwiaXNJblN1YkFnZW50IiwiaW5WaXJ0dWFsTGlzdCIsImV4cGFuZFNob3J0Y3V0IiwiY3RybE9Ub0V4cGFuZCIsInNob3J0Y3V0IiwiZGltIl0sInNvdXJjZXMiOlsiQ3RybE9Ub0V4cGFuZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNoYWxrIGZyb20gJ2NoYWxrJ1xuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFRleHQgfSBmcm9tICcuLi9pbmsuanMnXG5pbXBvcnQgeyBnZXRTaG9ydGN1dERpc3BsYXkgfSBmcm9tICcuLi9rZXliaW5kaW5ncy9zaG9ydGN1dEZvcm1hdC5qcydcbmltcG9ydCB7IHVzZVNob3J0Y3V0RGlzcGxheSB9IGZyb20gJy4uL2tleWJpbmRpbmdzL3VzZVNob3J0Y3V0RGlzcGxheS5qcydcbmltcG9ydCB7IEtleWJvYXJkU2hvcnRjdXRIaW50IH0gZnJvbSAnLi9kZXNpZ24tc3lzdGVtL0tleWJvYXJkU2hvcnRjdXRIaW50LmpzJ1xuaW1wb3J0IHsgSW5WaXJ0dWFsTGlzdENvbnRleHQgfSBmcm9tICcuL21lc3NhZ2VBY3Rpb25zLmpzJ1xuXG4vLyBDb250ZXh0IHRvIHRyYWNrIGlmIHdlJ3JlIGluc2lkZSBhIHN1YiBhZ2VudFxuLy8gU2ltaWxhciB0byBNZXNzYWdlUmVzcG9uc2VDb250ZXh0LCB0aGlzIGhlbHBzIHVzIGF2b2lkIHNob3dpbmdcbi8vIHRvbyBtYW55IFwiKGN0cmwrbyB0byBleHBhbmQpXCIgaGludHMgaW4gc3ViIGFnZW50IG91dHB1dFxuY29uc3QgU3ViQWdlbnRDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChmYWxzZSlcblxuZXhwb3J0IGZ1bmN0aW9uIFN1YkFnZW50UHJvdmlkZXIoe1xuICBjaGlsZHJlbixcbn06IHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZVxufSk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIHJldHVybiAoXG4gICAgPFN1YkFnZW50Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17dHJ1ZX0+e2NoaWxkcmVufTwvU3ViQWdlbnRDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDdHJsT1RvRXhwYW5kKCk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGNvbnN0IGlzSW5TdWJBZ2VudCA9IHVzZUNvbnRleHQoU3ViQWdlbnRDb250ZXh0KVxuICBjb25zdCBpblZpcnR1YWxMaXN0ID0gdXNlQ29udGV4dChJblZpcnR1YWxMaXN0Q29udGV4dClcbiAgY29uc3QgZXhwYW5kU2hvcnRjdXQgPSB1c2VTaG9ydGN1dERpc3BsYXkoXG4gICAgJ2FwcDp0b2dnbGVUcmFuc2NyaXB0JyxcbiAgICAnR2xvYmFsJyxcbiAgICAnY3RybCtvJyxcbiAgKVxuICBpZiAoaXNJblN1YkFnZW50IHx8IGluVmlydHVhbExpc3QpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHJldHVybiAoXG4gICAgPFRleHQgZGltQ29sb3I+XG4gICAgICA8S2V5Ym9hcmRTaG9ydGN1dEhpbnQgc2hvcnRjdXQ9e2V4cGFuZFNob3J0Y3V0fSBhY3Rpb249XCJleHBhbmRcIiBwYXJlbnMgLz5cbiAgICA8L1RleHQ+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGN0cmxPVG9FeHBhbmQoKTogc3RyaW5nIHtcbiAgY29uc3Qgc2hvcnRjdXQgPSBnZXRTaG9ydGN1dERpc3BsYXkoXG4gICAgJ2FwcDp0b2dnbGVUcmFuc2NyaXB0JyxcbiAgICAnR2xvYmFsJyxcbiAgICAnY3RybCtvJyxcbiAgKVxuICByZXR1cm4gY2hhbGsuZGltKGAoJHtzaG9ydGN1dH0gdG8gZXhwYW5kKWApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxLQUFLLE1BQU0sT0FBTztBQUN6QixPQUFPQyxLQUFLLElBQUlDLFVBQVUsUUFBUSxPQUFPO0FBQ3pDLFNBQVNDLElBQUksUUFBUSxXQUFXO0FBQ2hDLFNBQVNDLGtCQUFrQixRQUFRLGtDQUFrQztBQUNyRSxTQUFTQyxrQkFBa0IsUUFBUSxzQ0FBc0M7QUFDekUsU0FBU0Msb0JBQW9CLFFBQVEseUNBQXlDO0FBQzlFLFNBQVNDLG9CQUFvQixRQUFRLHFCQUFxQjs7QUFFMUQ7QUFDQTtBQUNBO0FBQ0EsTUFBTUMsZUFBZSxHQUFHUCxLQUFLLENBQUNRLGFBQWEsQ0FBQyxLQUFLLENBQUM7QUFFbEQsT0FBTyxTQUFBQyxpQkFBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUEwQjtJQUFBQztFQUFBLElBQUFILEVBSWhDO0VBQUEsSUFBQUksRUFBQTtFQUFBLElBQUFILENBQUEsUUFBQUUsUUFBQTtJQUVHQyxFQUFBLDZCQUFpQyxLQUFJLENBQUosS0FBRyxDQUFDLENBQUdELFNBQU8sQ0FBRSwyQkFBMkI7SUFBQUYsQ0FBQSxNQUFBRSxRQUFBO0lBQUFGLENBQUEsTUFBQUcsRUFBQTtFQUFBO0lBQUFBLEVBQUEsR0FBQUgsQ0FBQTtFQUFBO0VBQUEsT0FBNUVHLEVBQTRFO0FBQUE7QUFJaEYsT0FBTyxTQUFBQyxjQUFBO0VBQUEsTUFBQUosQ0FBQSxHQUFBQyxFQUFBO0VBQ0wsTUFBQUksWUFBQSxHQUFxQmYsVUFBVSxDQUFDTSxlQUFlLENBQUM7RUFDaEQsTUFBQVUsYUFBQSxHQUFzQmhCLFVBQVUsQ0FBQ0ssb0JBQW9CLENBQUM7RUFDdEQsTUFBQVksY0FBQSxHQUF1QmQsa0JBQWtCLENBQ3ZDLHNCQUFzQixFQUN0QixRQUFRLEVBQ1IsUUFDRixDQUFDO0VBQ0QsSUFBSVksWUFBNkIsSUFBN0JDLGFBQTZCO0lBQUEsT0FDeEIsSUFBSTtFQUFBO0VBQ1osSUFBQVAsRUFBQTtFQUFBLElBQUFDLENBQUEsUUFBQU8sY0FBQTtJQUVDUixFQUFBLElBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBUixLQUFPLENBQUMsQ0FDWixDQUFDLG9CQUFvQixDQUFXUSxRQUFjLENBQWRBLGVBQWEsQ0FBQyxDQUFTLE1BQVEsQ0FBUixRQUFRLENBQUMsTUFBTSxDQUFOLEtBQUssQ0FBQyxHQUN4RSxFQUZDLElBQUksQ0FFRTtJQUFBUCxDQUFBLE1BQUFPLGNBQUE7SUFBQVAsQ0FBQSxNQUFBRCxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBQyxDQUFBO0VBQUE7RUFBQSxPQUZQRCxFQUVPO0FBQUE7QUFJWCxPQUFPLFNBQVNTLGFBQWFBLENBQUEsQ0FBRSxFQUFFLE1BQU0sQ0FBQztFQUN0QyxNQUFNQyxRQUFRLEdBQUdqQixrQkFBa0IsQ0FDakMsc0JBQXNCLEVBQ3RCLFFBQVEsRUFDUixRQUNGLENBQUM7RUFDRCxPQUFPSixLQUFLLENBQUNzQixHQUFHLENBQUMsSUFBSUQsUUFBUSxhQUFhLENBQUM7QUFDN0MiLCJpZ25vcmVMaXN0IjpbXX0=
