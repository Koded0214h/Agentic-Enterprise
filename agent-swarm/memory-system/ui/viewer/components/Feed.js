"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Feed = Feed;
var react_1 = require("react");
var ObservationCard_1 = require("./ObservationCard");
var SummaryCard_1 = require("./SummaryCard");
var PromptCard_1 = require("./PromptCard");
var ScrollToTop_1 = require("./ScrollToTop");
var ui_1 = require("../constants/ui");
function Feed(_a) {
    var observations = _a.observations, summaries = _a.summaries, prompts = _a.prompts, onLoadMore = _a.onLoadMore, isLoading = _a.isLoading, hasMore = _a.hasMore;
    var loadMoreRef = (0, react_1.useRef)(null);
    var feedRef = (0, react_1.useRef)(null);
    var onLoadMoreRef = (0, react_1.useRef)(onLoadMore);
    // Keep the callback ref up to date
    (0, react_1.useEffect)(function () {
        onLoadMoreRef.current = onLoadMore;
    }, [onLoadMore]);
    // Set up intersection observer for infinite scroll
    (0, react_1.useEffect)(function () {
        var element = loadMoreRef.current;
        if (!element)
            return;
        var observer = new IntersectionObserver(function (entries) {
            var _a;
            var first = entries[0];
            if (first.isIntersecting && hasMore && !isLoading) {
                (_a = onLoadMoreRef.current) === null || _a === void 0 ? void 0 : _a.call(onLoadMoreRef);
            }
        }, { threshold: ui_1.UI.LOAD_MORE_THRESHOLD });
        observer.observe(element);
        return function () {
            if (element) {
                observer.unobserve(element);
            }
            observer.disconnect();
        };
    }, [hasMore, isLoading]);
    var items = (0, react_1.useMemo)(function () {
        var combined = __spreadArray(__spreadArray(__spreadArray([], observations.map(function (o) { return (__assign(__assign({}, o), { itemType: 'observation' })); }), true), summaries.map(function (s) { return (__assign(__assign({}, s), { itemType: 'summary' })); }), true), prompts.map(function (p) { return (__assign(__assign({}, p), { itemType: 'prompt' })); }), true);
        return combined.sort(function (a, b) { return b.created_at_epoch - a.created_at_epoch; });
    }, [observations, summaries, prompts]);
    return (<div className="feed" ref={feedRef}>
      <ScrollToTop_1.ScrollToTop targetRef={feedRef}/>
      <div className="feed-content">
        {items.map(function (item) {
            var key = "".concat(item.itemType, "-").concat(item.id);
            if (item.itemType === 'observation') {
                return <ObservationCard_1.ObservationCard key={key} observation={item}/>;
            }
            else if (item.itemType === 'summary') {
                return <SummaryCard_1.SummaryCard key={key} summary={item}/>;
            }
            else {
                return <PromptCard_1.PromptCard key={key} prompt={item}/>;
            }
        })}
        {items.length === 0 && !isLoading && (<div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
            No items to display
          </div>)}
        {isLoading && (<div style={{ textAlign: 'center', padding: '20px', color: '#8b949e' }}>
            <div className="spinner" style={{ display: 'inline-block', marginRight: '10px' }}></div>
            Loading more...
          </div>)}
        {hasMore && !isLoading && items.length > 0 && (<div ref={loadMoreRef} style={{ height: '20px', margin: '10px 0' }}/>)}
        {!hasMore && items.length > 0 && (<div style={{ textAlign: 'center', padding: '20px', color: '#8b949e', fontSize: '14px' }}>
            No more items to load
          </div>)}
      </div>
    </div>);
}
