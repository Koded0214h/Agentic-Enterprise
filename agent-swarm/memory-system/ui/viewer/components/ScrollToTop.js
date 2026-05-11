"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollToTop = ScrollToTop;
var react_1 = require("react");
function ScrollToTop(_a) {
    var targetRef = _a.targetRef;
    var _b = (0, react_1.useState)(false), isVisible = _b[0], setIsVisible = _b[1];
    (0, react_1.useEffect)(function () {
        var handleScroll = function () {
            var target = targetRef.current;
            if (target) {
                setIsVisible(target.scrollTop > 300);
            }
        };
        var target = targetRef.current;
        if (target) {
            target.addEventListener('scroll', handleScroll);
            return function () { return target.removeEventListener('scroll', handleScroll); };
        }
    }, []); // Empty deps - only set up listener once on mount
    var scrollToTop = function () {
        var target = targetRef.current;
        if (target) {
            target.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };
    if (!isVisible)
        return null;
    return (<button onClick={scrollToTop} className="scroll-to-top" aria-label="Scroll to top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>);
}
