"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
var ErrorBoundary_1 = require("./components/ErrorBoundary");
var container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}
var root = (0, client_1.createRoot)(container);
root.render(<ErrorBoundary_1.ErrorBoundary>
    <App_1.App />
  </ErrorBoundary_1.ErrorBoundary>);
