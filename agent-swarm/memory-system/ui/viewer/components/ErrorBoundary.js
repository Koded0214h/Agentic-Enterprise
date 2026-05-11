"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
var react_1 = require("react");
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function (error) {
        return { hasError: true, error: error };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            return (<div style={{ padding: '20px', color: '#ff6b6b', backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '10px', color: '#8b949e' }}>
            The application encountered an error. Please refresh the page to try again.
          </p>
          {this.state.error && (<details style={{ marginTop: '20px', color: '#8b949e' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Error details</summary>
              <pre style={{
                        backgroundColor: '#0d1117',
                        padding: '10px',
                        borderRadius: '6px',
                        overflow: 'auto'
                    }}>
                {this.state.error.toString()}
                {this.state.errorInfo && '\n\n' + this.state.errorInfo.componentStack}
              </pre>
            </details>)}
        </div>);
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.Component));
exports.ErrorBoundary = ErrorBoundary;
