"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSelector = ModelSelector;
var compiler_runtime_1 = require("react/compiler-runtime");
var React = require("react");
var ink_js_1 = require("../../ink.js");
var agent_js_1 = require("../../utils/model/agent.js");
var select_js_1 = require("../CustomSelect/select.js");
function ModelSelector(t0) {
    var $ = (0, compiler_runtime_1.c)(11);
    var initialModel = t0.initialModel, onComplete = t0.onComplete, onCancel = t0.onCancel;
    var t1;
    if ($[0] !== initialModel) {
        bb0: {
            var base = (0, agent_js_1.getAgentModelOptions)();
            if (initialModel && !base.some(function (o) { return o.value === initialModel; })) {
                t1 = __spreadArray([{
                        value: initialModel,
                        label: initialModel,
                        description: "Current model (custom ID)"
                    }], base, true);
                break bb0;
            }
            t1 = base;
        }
        $[0] = initialModel;
        $[1] = t1;
    }
    else {
        t1 = $[1];
    }
    var modelOptions = t1;
    var defaultModel = initialModel !== null && initialModel !== void 0 ? initialModel : "sonnet";
    var t2;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = <ink_js_1.Box marginBottom={1}><ink_js_1.Text dimColor={true}>Model determines the agent's reasoning capabilities and speed.</ink_js_1.Text></ink_js_1.Box>;
        $[2] = t2;
    }
    else {
        t2 = $[2];
    }
    var t3;
    if ($[3] !== onCancel || $[4] !== onComplete) {
        t3 = function () { return onCancel ? onCancel() : onComplete(undefined); };
        $[3] = onCancel;
        $[4] = onComplete;
        $[5] = t3;
    }
    else {
        t3 = $[5];
    }
    var t4;
    if ($[6] !== defaultModel || $[7] !== modelOptions || $[8] !== onComplete || $[9] !== t3) {
        t4 = <ink_js_1.Box flexDirection="column">{t2}<select_js_1.Select options={modelOptions} defaultValue={defaultModel} onChange={onComplete} onCancel={t3}/></ink_js_1.Box>;
        $[6] = defaultModel;
        $[7] = modelOptions;
        $[8] = onComplete;
        $[9] = t3;
        $[10] = t4;
    }
    else {
        t4 = $[10];
    }
    return t4;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWFjdCIsIkJveCIsIlRleHQiLCJnZXRBZ2VudE1vZGVsT3B0aW9ucyIsIlNlbGVjdCIsIk1vZGVsU2VsZWN0b3JQcm9wcyIsImluaXRpYWxNb2RlbCIsIm9uQ29tcGxldGUiLCJtb2RlbCIsIm9uQ2FuY2VsIiwiTW9kZWxTZWxlY3RvciIsInQwIiwiJCIsIl9jIiwidDEiLCJiYjAiLCJiYXNlIiwic29tZSIsIm8iLCJ2YWx1ZSIsImxhYmVsIiwiZGVzY3JpcHRpb24iLCJtb2RlbE9wdGlvbnMiLCJkZWZhdWx0TW9kZWwiLCJ0MiIsIlN5bWJvbCIsImZvciIsInQzIiwidW5kZWZpbmVkIiwidDQiXSwic291cmNlcyI6WyJNb2RlbFNlbGVjdG9yLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB7IGdldEFnZW50TW9kZWxPcHRpb25zIH0gZnJvbSAnLi4vLi4vdXRpbHMvbW9kZWwvYWdlbnQuanMnXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi9DdXN0b21TZWxlY3Qvc2VsZWN0LmpzJ1xuXG5pbnRlcmZhY2UgTW9kZWxTZWxlY3RvclByb3BzIHtcbiAgaW5pdGlhbE1vZGVsPzogc3RyaW5nXG4gIG9uQ29tcGxldGU6IChtb2RlbD86IHN0cmluZykgPT4gdm9pZFxuICBvbkNhbmNlbD86ICgpID0+IHZvaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vZGVsU2VsZWN0b3Ioe1xuICBpbml0aWFsTW9kZWwsXG4gIG9uQ29tcGxldGUsXG4gIG9uQ2FuY2VsLFxufTogTW9kZWxTZWxlY3RvclByb3BzKTogUmVhY3QuUmVhY3ROb2RlIHtcbiAgY29uc3QgbW9kZWxPcHRpb25zID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgY29uc3QgYmFzZSA9IGdldEFnZW50TW9kZWxPcHRpb25zKClcbiAgICAvLyBJZiB0aGUgYWdlbnQncyBjdXJyZW50IG1vZGVsIGlzIGEgZnVsbCBJRCAoZS5nLiAnY2xhdWRlLW9wdXMtNC01Jykgbm90XG4gICAgLy8gaW4gdGhlIGFsaWFzIGxpc3QsIGluamVjdCBpdCBhcyBhbiBvcHRpb24gc28gaXQgY2FuIHJvdW5kLXRyaXAgdGhyb3VnaFxuICAgIC8vIGNvbmZpcm0gd2l0aG91dCBiZWluZyBvdmVyd3JpdHRlbi5cbiAgICBpZiAoaW5pdGlhbE1vZGVsICYmICFiYXNlLnNvbWUobyA9PiBvLnZhbHVlID09PSBpbml0aWFsTW9kZWwpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICB7XG4gICAgICAgICAgdmFsdWU6IGluaXRpYWxNb2RlbCxcbiAgICAgICAgICBsYWJlbDogaW5pdGlhbE1vZGVsLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ3VycmVudCBtb2RlbCAoY3VzdG9tIElEKScsXG4gICAgICAgIH0sXG4gICAgICAgIC4uLmJhc2UsXG4gICAgICBdXG4gICAgfVxuICAgIHJldHVybiBiYXNlXG4gIH0sIFtpbml0aWFsTW9kZWxdKVxuXG4gIGNvbnN0IGRlZmF1bHRNb2RlbCA9IGluaXRpYWxNb2RlbCA/PyAnc29ubmV0J1xuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICA8Qm94IG1hcmdpbkJvdHRvbT17MX0+XG4gICAgICAgIDxUZXh0IGRpbUNvbG9yPlxuICAgICAgICAgIE1vZGVsIGRldGVybWluZXMgdGhlIGFnZW50JmFwb3M7cyByZWFzb25pbmcgY2FwYWJpbGl0aWVzIGFuZCBzcGVlZC5cbiAgICAgICAgPC9UZXh0PlxuICAgICAgPC9Cb3g+XG4gICAgICA8U2VsZWN0XG4gICAgICAgIG9wdGlvbnM9e21vZGVsT3B0aW9uc31cbiAgICAgICAgZGVmYXVsdFZhbHVlPXtkZWZhdWx0TW9kZWx9XG4gICAgICAgIG9uQ2hhbmdlPXtvbkNvbXBsZXRlfVxuICAgICAgICBvbkNhbmNlbD17KCkgPT4gKG9uQ2FuY2VsID8gb25DYW5jZWwoKSA6IG9uQ29tcGxldGUodW5kZWZpbmVkKSl9XG4gICAgICAvPlxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUtBLEtBQUssTUFBTSxPQUFPO0FBQzlCLFNBQVNDLEdBQUcsRUFBRUMsSUFBSSxRQUFRLGNBQWM7QUFDeEMsU0FBU0Msb0JBQW9CLFFBQVEsNEJBQTRCO0FBQ2pFLFNBQVNDLE1BQU0sUUFBUSwyQkFBMkI7QUFFbEQsVUFBVUMsa0JBQWtCLENBQUM7RUFDM0JDLFlBQVksQ0FBQyxFQUFFLE1BQU07RUFDckJDLFVBQVUsRUFBRSxDQUFDQyxLQUFjLENBQVIsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJO0VBQ3BDQyxRQUFRLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSTtBQUN2QjtBQUVBLE9BQU8sU0FBQUMsY0FBQUMsRUFBQTtFQUFBLE1BQUFDLENBQUEsR0FBQUMsRUFBQTtFQUF1QjtJQUFBUCxZQUFBO0lBQUFDLFVBQUE7SUFBQUU7RUFBQSxJQUFBRSxFQUlUO0VBQUEsSUFBQUcsRUFBQTtFQUFBLElBQUFGLENBQUEsUUFBQU4sWUFBQTtJQUFBUyxHQUFBO01BRWpCLE1BQUFDLElBQUEsR0FBYWIsb0JBQW9CLENBQUMsQ0FBQztNQUluQyxJQUFJRyxZQUF5RCxJQUF6RCxDQUFpQlUsSUFBSSxDQUFBQyxJQUFLLENBQUNDLENBQUEsSUFBS0EsQ0FBQyxDQUFBQyxLQUFNLEtBQUtiLFlBQVksQ0FBQztRQUMzRFEsRUFBQSxHQUFPLENBQ0w7VUFBQUssS0FBQSxFQUNTYixZQUFZO1VBQUFjLEtBQUEsRUFDWmQsWUFBWTtVQUFBZSxXQUFBLEVBQ047UUFDZixDQUFDLEtBQ0VMLElBQUksQ0FDUjtRQVBELE1BQUFELEdBQUE7TUFPQztNQUVIRCxFQUFBLEdBQU9FLElBQUk7SUFBQTtJQUFBSixDQUFBLE1BQUFOLFlBQUE7SUFBQU0sQ0FBQSxNQUFBRSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBRixDQUFBO0VBQUE7RUFmYixNQUFBVSxZQUFBLEdBQXFCUixFQWdCSDtFQUVsQixNQUFBUyxZQUFBLEdBQXFCakIsWUFBd0IsSUFBeEIsUUFBd0I7RUFBQSxJQUFBa0IsRUFBQTtFQUFBLElBQUFaLENBQUEsUUFBQWEsTUFBQSxDQUFBQyxHQUFBO0lBSXpDRixFQUFBLElBQUMsR0FBRyxDQUFlLFlBQUMsQ0FBRCxHQUFDLENBQ2xCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBUixLQUFPLENBQUMsQ0FBQyw4REFFZixFQUZDLElBQUksQ0FHUCxFQUpDLEdBQUcsQ0FJRTtJQUFBWixDQUFBLE1BQUFZLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFaLENBQUE7RUFBQTtFQUFBLElBQUFlLEVBQUE7RUFBQSxJQUFBZixDQUFBLFFBQUFILFFBQUEsSUFBQUcsQ0FBQSxRQUFBTCxVQUFBO0lBS01vQixFQUFBLEdBQUFBLENBQUEsS0FBT2xCLFFBQVEsR0FBR0EsUUFBUSxDQUF5QixDQUFDLEdBQXJCRixVQUFVLENBQUNxQixTQUFTLENBQUU7SUFBQWhCLENBQUEsTUFBQUgsUUFBQTtJQUFBRyxDQUFBLE1BQUFMLFVBQUE7SUFBQUssQ0FBQSxNQUFBZSxFQUFBO0VBQUE7SUFBQUEsRUFBQSxHQUFBZixDQUFBO0VBQUE7RUFBQSxJQUFBaUIsRUFBQTtFQUFBLElBQUFqQixDQUFBLFFBQUFXLFlBQUEsSUFBQVgsQ0FBQSxRQUFBVSxZQUFBLElBQUFWLENBQUEsUUFBQUwsVUFBQSxJQUFBSyxDQUFBLFFBQUFlLEVBQUE7SUFWbkVFLEVBQUEsSUFBQyxHQUFHLENBQWUsYUFBUSxDQUFSLFFBQVEsQ0FDekIsQ0FBQUwsRUFJSyxDQUNMLENBQUMsTUFBTSxDQUNJRixPQUFZLENBQVpBLGFBQVcsQ0FBQyxDQUNQQyxZQUFZLENBQVpBLGFBQVcsQ0FBQyxDQUNoQmhCLFFBQVUsQ0FBVkEsV0FBUyxDQUFDLENBQ1YsUUFBcUQsQ0FBckQsQ0FBQW9CLEVBQW9ELENBQUMsR0FFbkUsRUFaQyxHQUFHLENBWUU7SUFBQWYsQ0FBQSxNQUFBVyxZQUFBO0lBQUFYLENBQUEsTUFBQVUsWUFBQTtJQUFBVixDQUFBLE1BQUFMLFVBQUE7SUFBQUssQ0FBQSxNQUFBZSxFQUFBO0lBQUFmLENBQUEsT0FBQWlCLEVBQUE7RUFBQTtJQUFBQSxFQUFBLEdBQUFqQixDQUFBO0VBQUE7RUFBQSxPQVpOaUIsRUFZTTtBQUFBIiwiaWdub3JlTGlzdCI6W119
