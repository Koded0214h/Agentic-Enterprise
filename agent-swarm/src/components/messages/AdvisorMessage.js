"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvisorMessage = AdvisorMessage;
var compiler_runtime_1 = require("react/compiler-runtime");
var figures_1 = require("figures");
var react_1 = require("react");
var ink_js_1 = require("../../ink.js");
var model_js_1 = require("../../utils/model/model.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var CtrlOToExpand_js_1 = require("../CtrlOToExpand.js");
var MessageResponse_js_1 = require("../MessageResponse.js");
var ToolUseLoader_js_1 = require("../ToolUseLoader.js");
function AdvisorMessage(t0) {
    var $ = (0, compiler_runtime_1.c)(30);
    var block = t0.block, addMargin = t0.addMargin, resolvedToolUseIDs = t0.resolvedToolUseIDs, erroredToolUseIDs = t0.erroredToolUseIDs, shouldAnimate = t0.shouldAnimate, verbose = t0.verbose, advisorModel = t0.advisorModel;
    if (block.type === "server_tool_use") {
        var t1_1;
        if ($[0] !== block.input) {
            t1_1 = block.input && Object.keys(block.input).length > 0 ? (0, slowOperations_js_1.jsonStringify)(block.input) : null;
            $[0] = block.input;
            $[1] = t1_1;
        }
        else {
            t1_1 = $[1];
        }
        var input = t1_1;
        var t2 = addMargin ? 1 : 0;
        var t3 = void 0;
        if ($[2] !== block.id || $[3] !== resolvedToolUseIDs) {
            t3 = resolvedToolUseIDs.has(block.id);
            $[2] = block.id;
            $[3] = resolvedToolUseIDs;
            $[4] = t3;
        }
        else {
            t3 = $[4];
        }
        var t4 = !t3;
        var t5 = void 0;
        if ($[5] !== block.id || $[6] !== erroredToolUseIDs) {
            t5 = erroredToolUseIDs.has(block.id);
            $[5] = block.id;
            $[6] = erroredToolUseIDs;
            $[7] = t5;
        }
        else {
            t5 = $[7];
        }
        var t6 = void 0;
        if ($[8] !== shouldAnimate || $[9] !== t4 || $[10] !== t5) {
            t6 = <ToolUseLoader_js_1.ToolUseLoader shouldAnimate={shouldAnimate} isUnresolved={t4} isError={t5}/>;
            $[8] = shouldAnimate;
            $[9] = t4;
            $[10] = t5;
            $[11] = t6;
        }
        else {
            t6 = $[11];
        }
        var t7 = void 0;
        if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
            t7 = <ink_js_1.Text bold={true}>Advising</ink_js_1.Text>;
            $[12] = t7;
        }
        else {
            t7 = $[12];
        }
        var t8 = void 0;
        if ($[13] !== advisorModel) {
            t8 = advisorModel ? <ink_js_1.Text dimColor={true}> using {(0, model_js_1.renderModelName)(advisorModel)}</ink_js_1.Text> : null;
            $[13] = advisorModel;
            $[14] = t8;
        }
        else {
            t8 = $[14];
        }
        var t9 = void 0;
        if ($[15] !== input) {
            t9 = input ? <ink_js_1.Text dimColor={true}> · {input}</ink_js_1.Text> : null;
            $[15] = input;
            $[16] = t9;
        }
        else {
            t9 = $[16];
        }
        var t10 = void 0;
        if ($[17] !== t2 || $[18] !== t6 || $[19] !== t8 || $[20] !== t9) {
            t10 = <ink_js_1.Box marginTop={t2} paddingRight={2} flexDirection="row">{t6}{t7}{t8}{t9}</ink_js_1.Box>;
            $[17] = t2;
            $[18] = t6;
            $[19] = t8;
            $[20] = t9;
            $[21] = t10;
        }
        else {
            t10 = $[21];
        }
        return t10;
    }
    var body;
    bb0: switch (block.content.type) {
        case "advisor_tool_result_error":
            {
                var t1_2;
                if ($[22] !== block.content.error_code) {
                    t1_2 = <ink_js_1.Text color="error">Advisor unavailable ({block.content.error_code})</ink_js_1.Text>;
                    $[22] = block.content.error_code;
                    $[23] = t1_2;
                }
                else {
                    t1_2 = $[23];
                }
                body = t1_2;
                break bb0;
            }
        case "advisor_result":
            {
                var t1_3;
                if ($[24] !== block.content.text || $[25] !== verbose) {
                    t1_3 = verbose ? <ink_js_1.Text dimColor={true}>{block.content.text}</ink_js_1.Text> : <ink_js_1.Text dimColor={true}>{figures_1.default.tick} Advisor has reviewed the conversation and will apply the feedback <CtrlOToExpand_js_1.CtrlOToExpand /></ink_js_1.Text>;
                    $[24] = block.content.text;
                    $[25] = verbose;
                    $[26] = t1_3;
                }
                else {
                    t1_3 = $[26];
                }
                body = t1_3;
                break bb0;
            }
        case "advisor_redacted_result":
            {
                var t1_4;
                if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
                    t1_4 = <ink_js_1.Text dimColor={true}>{figures_1.default.tick} Advisor has reviewed the conversation and will apply the feedback</ink_js_1.Text>;
                    $[27] = t1_4;
                }
                else {
                    t1_4 = $[27];
                }
                body = t1_4;
            }
    }
    var t1;
    if ($[28] !== body) {
        t1 = <ink_js_1.Box paddingRight={2}><MessageResponse_js_1.MessageResponse>{body}</MessageResponse_js_1.MessageResponse></ink_js_1.Box>;
        $[28] = body;
        $[29] = t1;
    }
    else {
        t1 = $[29];
    }
    return t1;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWd1cmVzIiwiUmVhY3QiLCJCb3giLCJUZXh0IiwiQWR2aXNvckJsb2NrIiwicmVuZGVyTW9kZWxOYW1lIiwianNvblN0cmluZ2lmeSIsIkN0cmxPVG9FeHBhbmQiLCJNZXNzYWdlUmVzcG9uc2UiLCJUb29sVXNlTG9hZGVyIiwiUHJvcHMiLCJibG9jayIsImFkZE1hcmdpbiIsInJlc29sdmVkVG9vbFVzZUlEcyIsIlNldCIsImVycm9yZWRUb29sVXNlSURzIiwic2hvdWxkQW5pbWF0ZSIsInZlcmJvc2UiLCJhZHZpc29yTW9kZWwiLCJBZHZpc29yTWVzc2FnZSIsInQwIiwiJCIsIl9jIiwidHlwZSIsInQxIiwiaW5wdXQiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwidDIiLCJ0MyIsImlkIiwiaGFzIiwidDQiLCJ0NSIsInQ2IiwidDciLCJTeW1ib2wiLCJmb3IiLCJ0OCIsInQ5IiwidDEwIiwiYm9keSIsImJiMCIsImNvbnRlbnQiLCJlcnJvcl9jb2RlIiwidGV4dCIsInRpY2siXSwic291cmNlcyI6WyJBZHZpc29yTWVzc2FnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGZpZ3VyZXMgZnJvbSAnZmlndXJlcydcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gJy4uLy4uL2luay5qcydcbmltcG9ydCB0eXBlIHsgQWR2aXNvckJsb2NrIH0gZnJvbSAnLi4vLi4vdXRpbHMvYWR2aXNvci5qcydcbmltcG9ydCB7IHJlbmRlck1vZGVsTmFtZSB9IGZyb20gJy4uLy4uL3V0aWxzL21vZGVsL21vZGVsLmpzJ1xuaW1wb3J0IHsganNvblN0cmluZ2lmeSB9IGZyb20gJy4uLy4uL3V0aWxzL3Nsb3dPcGVyYXRpb25zLmpzJ1xuaW1wb3J0IHsgQ3RybE9Ub0V4cGFuZCB9IGZyb20gJy4uL0N0cmxPVG9FeHBhbmQuanMnXG5pbXBvcnQgeyBNZXNzYWdlUmVzcG9uc2UgfSBmcm9tICcuLi9NZXNzYWdlUmVzcG9uc2UuanMnXG5pbXBvcnQgeyBUb29sVXNlTG9hZGVyIH0gZnJvbSAnLi4vVG9vbFVzZUxvYWRlci5qcydcblxudHlwZSBQcm9wcyA9IHtcbiAgYmxvY2s6IEFkdmlzb3JCbG9ja1xuICBhZGRNYXJnaW46IGJvb2xlYW5cbiAgcmVzb2x2ZWRUb29sVXNlSURzOiBTZXQ8c3RyaW5nPlxuICBlcnJvcmVkVG9vbFVzZUlEczogU2V0PHN0cmluZz5cbiAgc2hvdWxkQW5pbWF0ZTogYm9vbGVhblxuICB2ZXJib3NlOiBib29sZWFuXG4gIGFkdmlzb3JNb2RlbD86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gQWR2aXNvck1lc3NhZ2Uoe1xuICBibG9jayxcbiAgYWRkTWFyZ2luLFxuICByZXNvbHZlZFRvb2xVc2VJRHMsXG4gIGVycm9yZWRUb29sVXNlSURzLFxuICBzaG91bGRBbmltYXRlLFxuICB2ZXJib3NlLFxuICBhZHZpc29yTW9kZWwsXG59OiBQcm9wcyk6IFJlYWN0LlJlYWN0Tm9kZSB7XG4gIGlmIChibG9jay50eXBlID09PSAnc2VydmVyX3Rvb2xfdXNlJykge1xuICAgIGNvbnN0IGlucHV0ID1cbiAgICAgIGJsb2NrLmlucHV0ICYmIE9iamVjdC5rZXlzKGJsb2NrLmlucHV0KS5sZW5ndGggPiAwXG4gICAgICAgID8ganNvblN0cmluZ2lmeShibG9jay5pbnB1dClcbiAgICAgICAgOiBudWxsXG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggbWFyZ2luVG9wPXthZGRNYXJnaW4gPyAxIDogMH0gcGFkZGluZ1JpZ2h0PXsyfSBmbGV4RGlyZWN0aW9uPVwicm93XCI+XG4gICAgICAgIDxUb29sVXNlTG9hZGVyXG4gICAgICAgICAgc2hvdWxkQW5pbWF0ZT17c2hvdWxkQW5pbWF0ZX1cbiAgICAgICAgICBpc1VucmVzb2x2ZWQ9eyFyZXNvbHZlZFRvb2xVc2VJRHMuaGFzKGJsb2NrLmlkKX1cbiAgICAgICAgICBpc0Vycm9yPXtlcnJvcmVkVG9vbFVzZUlEcy5oYXMoYmxvY2suaWQpfVxuICAgICAgICAvPlxuICAgICAgICA8VGV4dCBib2xkPkFkdmlzaW5nPC9UZXh0PlxuICAgICAgICB7YWR2aXNvck1vZGVsID8gKFxuICAgICAgICAgIDxUZXh0IGRpbUNvbG9yPiB1c2luZyB7cmVuZGVyTW9kZWxOYW1lKGFkdmlzb3JNb2RlbCl9PC9UZXh0PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge2lucHV0ID8gPFRleHQgZGltQ29sb3I+IMK3IHtpbnB1dH08L1RleHQ+IDogbnVsbH1cbiAgICAgIDwvQm94PlxuICAgIClcbiAgfVxuXG4gIGxldCBib2R5OiBSZWFjdC5SZWFjdE5vZGVcbiAgc3dpdGNoIChibG9jay5jb250ZW50LnR5cGUpIHtcbiAgICBjYXNlICdhZHZpc29yX3Rvb2xfcmVzdWx0X2Vycm9yJzpcbiAgICAgIGJvZHkgPSAoXG4gICAgICAgIDxUZXh0IGNvbG9yPVwiZXJyb3JcIj5cbiAgICAgICAgICBBZHZpc29yIHVuYXZhaWxhYmxlICh7YmxvY2suY29udGVudC5lcnJvcl9jb2RlfSlcbiAgICAgICAgPC9UZXh0PlxuICAgICAgKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhZHZpc29yX3Jlc3VsdCc6XG4gICAgICBib2R5ID0gdmVyYm9zZSA/IChcbiAgICAgICAgPFRleHQgZGltQ29sb3I+e2Jsb2NrLmNvbnRlbnQudGV4dH08L1RleHQ+XG4gICAgICApIDogKFxuICAgICAgICA8VGV4dCBkaW1Db2xvcj5cbiAgICAgICAgICB7ZmlndXJlcy50aWNrfSBBZHZpc29yIGhhcyByZXZpZXdlZCB0aGUgY29udmVyc2F0aW9uIGFuZCB3aWxsIGFwcGx5XG4gICAgICAgICAgdGhlIGZlZWRiYWNrIDxDdHJsT1RvRXhwYW5kIC8+XG4gICAgICAgIDwvVGV4dD5cbiAgICAgIClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYWR2aXNvcl9yZWRhY3RlZF9yZXN1bHQnOlxuICAgICAgYm9keSA9IChcbiAgICAgICAgPFRleHQgZGltQ29sb3I+XG4gICAgICAgICAge2ZpZ3VyZXMudGlja30gQWR2aXNvciBoYXMgcmV2aWV3ZWQgdGhlIGNvbnZlcnNhdGlvbiBhbmQgd2lsbCBhcHBseVxuICAgICAgICAgIHRoZSBmZWVkYmFja1xuICAgICAgICA8L1RleHQ+XG4gICAgICApXG4gICAgICBicmVha1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IHBhZGRpbmdSaWdodD17Mn0+XG4gICAgICA8TWVzc2FnZVJlc3BvbnNlPntib2R5fTwvTWVzc2FnZVJlc3BvbnNlPlxuICAgIDwvQm94PlxuICApXG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPQSxPQUFPLE1BQU0sU0FBUztBQUM3QixPQUFPQyxLQUFLLE1BQU0sT0FBTztBQUN6QixTQUFTQyxHQUFHLEVBQUVDLElBQUksUUFBUSxjQUFjO0FBQ3hDLGNBQWNDLFlBQVksUUFBUSx3QkFBd0I7QUFDMUQsU0FBU0MsZUFBZSxRQUFRLDRCQUE0QjtBQUM1RCxTQUFTQyxhQUFhLFFBQVEsK0JBQStCO0FBQzdELFNBQVNDLGFBQWEsUUFBUSxxQkFBcUI7QUFDbkQsU0FBU0MsZUFBZSxRQUFRLHVCQUF1QjtBQUN2RCxTQUFTQyxhQUFhLFFBQVEscUJBQXFCO0FBRW5ELEtBQUtDLEtBQUssR0FBRztFQUNYQyxLQUFLLEVBQUVQLFlBQVk7RUFDbkJRLFNBQVMsRUFBRSxPQUFPO0VBQ2xCQyxrQkFBa0IsRUFBRUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztFQUMvQkMsaUJBQWlCLEVBQUVELEdBQUcsQ0FBQyxNQUFNLENBQUM7RUFDOUJFLGFBQWEsRUFBRSxPQUFPO0VBQ3RCQyxPQUFPLEVBQUUsT0FBTztFQUNoQkMsWUFBWSxDQUFDLEVBQUUsTUFBTTtBQUN2QixDQUFDO0FBRUQsT0FBTyxTQUFBQyxlQUFBQyxFQUFBO0VBQUEsTUFBQUMsQ0FBQSxHQUFBQyxFQUFBO0VBQXdCO0lBQUFYLEtBQUE7SUFBQUMsU0FBQTtJQUFBQyxrQkFBQTtJQUFBRSxpQkFBQTtJQUFBQyxhQUFBO0lBQUFDLE9BQUE7SUFBQUM7RUFBQSxJQUFBRSxF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
