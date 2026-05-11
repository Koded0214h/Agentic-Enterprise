"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSpinningFavicon = useSpinningFavicon;
var react_1 = require("react");
/**
 * Hook that makes the browser tab favicon spin when isProcessing is true.
 * Uses canvas to rotate the logo image and dynamically update the favicon.
 */
function useSpinningFavicon(isProcessing) {
    var animationRef = (0, react_1.useRef)(null);
    var canvasRef = (0, react_1.useRef)(null);
    var imageRef = (0, react_1.useRef)(null);
    var rotationRef = (0, react_1.useRef)(0);
    var originalFaviconRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Create canvas once
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
            canvasRef.current.width = 32;
            canvasRef.current.height = 32;
        }
        // Load image once
        if (!imageRef.current) {
            imageRef.current = new Image();
            imageRef.current.src = 'claude-mem-logomark.webp';
        }
        // Store original favicon
        if (!originalFaviconRef.current) {
            var link = document.querySelector('link[rel="icon"]');
            if (link) {
                originalFaviconRef.current = link.href;
            }
        }
        var canvas = canvasRef.current;
        var ctx = canvas.getContext('2d');
        var image = imageRef.current;
        if (!ctx)
            return;
        var updateFavicon = function (dataUrl) {
            var link = document.querySelector('link[rel="icon"]');
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = dataUrl;
        };
        var animate = function () {
            if (!image.complete) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }
            // Rotate by ~4 degrees per frame (matches 1.5s for full rotation at 60fps)
            rotationRef.current += (2 * Math.PI) / 90;
            ctx.clearRect(0, 0, 32, 32);
            ctx.save();
            ctx.translate(16, 16);
            ctx.rotate(rotationRef.current);
            ctx.drawImage(image, -16, -16, 32, 32);
            ctx.restore();
            updateFavicon(canvas.toDataURL('image/png'));
            animationRef.current = requestAnimationFrame(animate);
        };
        if (isProcessing) {
            rotationRef.current = 0;
            animate();
        }
        else {
            // Stop animation and restore original favicon
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            if (originalFaviconRef.current) {
                updateFavicon(originalFaviconRef.current);
            }
        }
        return function () {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [isProcessing]);
}
