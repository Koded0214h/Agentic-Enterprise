"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePagination = usePagination;
var react_1 = require("react");
var DEFAULT_MAX_VISIBLE = 5;
function usePagination(_a) {
    var totalItems = _a.totalItems, _b = _a.maxVisible, maxVisible = _b === void 0 ? DEFAULT_MAX_VISIBLE : _b, _c = _a.selectedIndex, selectedIndex = _c === void 0 ? 0 : _c;
    var needsPagination = totalItems > maxVisible;
    // Use a ref to track the previous scroll offset for smooth scrolling
    var scrollOffsetRef = (0, react_1.useRef)(0);
    // Compute the scroll offset based on selectedIndex
    // This ensures the selected item is always visible
    var scrollOffset = (0, react_1.useMemo)(function () {
        if (!needsPagination)
            return 0;
        var prevOffset = scrollOffsetRef.current;
        // If selected item is above the visible window, scroll up
        if (selectedIndex < prevOffset) {
            scrollOffsetRef.current = selectedIndex;
            return selectedIndex;
        }
        // If selected item is below the visible window, scroll down
        if (selectedIndex >= prevOffset + maxVisible) {
            var newOffset = selectedIndex - maxVisible + 1;
            scrollOffsetRef.current = newOffset;
            return newOffset;
        }
        // Selected item is within visible window, keep current offset
        // But ensure offset is still valid
        var maxOffset = Math.max(0, totalItems - maxVisible);
        var clampedOffset = Math.min(prevOffset, maxOffset);
        scrollOffsetRef.current = clampedOffset;
        return clampedOffset;
    }, [selectedIndex, maxVisible, needsPagination, totalItems]);
    var startIndex = scrollOffset;
    var endIndex = Math.min(scrollOffset + maxVisible, totalItems);
    var getVisibleItems = (0, react_1.useCallback)(function (items) {
        if (!needsPagination)
            return items;
        return items.slice(startIndex, endIndex);
    }, [needsPagination, startIndex, endIndex]);
    var toActualIndex = (0, react_1.useCallback)(function (visibleIndex) {
        return startIndex + visibleIndex;
    }, [startIndex]);
    var isOnCurrentPage = (0, react_1.useCallback)(function (actualIndex) {
        return actualIndex >= startIndex && actualIndex < endIndex;
    }, [startIndex, endIndex]);
    // These are mostly no-ops for continuous scrolling but kept for API compatibility
    var goToPage = (0, react_1.useCallback)(function (_page) {
        // No-op - scrolling is controlled by selectedIndex
    }, []);
    var nextPage = (0, react_1.useCallback)(function () {
        // No-op - scrolling is controlled by selectedIndex
    }, []);
    var prevPage = (0, react_1.useCallback)(function () {
        // No-op - scrolling is controlled by selectedIndex
    }, []);
    // Simple selection handler - just updates the index
    // Scrolling happens automatically via the useMemo above
    var handleSelectionChange = (0, react_1.useCallback)(function (newIndex, setSelectedIndex) {
        var clampedIndex = Math.max(0, Math.min(newIndex, totalItems - 1));
        setSelectedIndex(clampedIndex);
    }, [totalItems]);
    // Page navigation - disabled for continuous scrolling
    var handlePageNavigation = (0, react_1.useCallback)(function (_direction, _setSelectedIndex) {
        return false;
    }, []);
    // Calculate page-like values for backwards compatibility
    var totalPages = Math.max(1, Math.ceil(totalItems / maxVisible));
    var currentPage = Math.floor(scrollOffset / maxVisible);
    return {
        currentPage: currentPage,
        totalPages: totalPages,
        startIndex: startIndex,
        endIndex: endIndex,
        needsPagination: needsPagination,
        pageSize: maxVisible,
        getVisibleItems: getVisibleItems,
        toActualIndex: toActualIndex,
        isOnCurrentPage: isOnCurrentPage,
        goToPage: goToPage,
        nextPage: nextPage,
        prevPage: prevPage,
        handleSelectionChange: handleSelectionChange,
        handlePageNavigation: handlePageNavigation,
        scrollPosition: {
            current: selectedIndex + 1,
            total: totalItems,
            canScrollUp: scrollOffset > 0,
            canScrollDown: scrollOffset + maxVisible < totalItems,
        },
    };
}
