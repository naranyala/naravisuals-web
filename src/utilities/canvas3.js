/**
 * Canvas Utility Library v1.0
 * A collection of helper functions for common canvas operations
 */
const CanvasUtils = (function() {
    'use strict';

    // Utility functions
    function getCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width || 300;
        canvas.height = height || 150;
        return canvas;
    }

    function getContext(canvas, options = {}) {
        return canvas.getContext('2d', {
            alpha: true,
            ...options
        });
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Drawing functions
    function drawImage(ctx, img, x = 0, y = 0, width = img.width, height = img.height) {
        ctx.drawImage(img, x, y, width, height);
    }

    function drawRoundedRect(ctx, x, y, width, height, radius = 0) {
        if (radius === 0) {
            ctx.rect(x, y, width, height);
            return;
        }

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawCircle(ctx, x, y, radius) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
    }

    // Transformation functions
    function rotateCanvas(ctx, angle, cx = 0, cy = 0) {
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
    }

    function scaleCanvas(ctx, scaleX, scaleY = scaleX, cx = 0, cy = 0) {
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-cx, -cy);
    }

    // Image processing
    function applyFilter(canvas, filter) {
        const tempCanvas = getCanvas(canvas.width, canvas.height);
        const tempCtx = getContext(tempCanvas);
        tempCtx.filter = filter;
        tempCtx.drawImage(canvas, 0, 0);
        
        const ctx = getContext(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    function invertColors(canvas) {
        applyFilter(canvas, 'invert(100%)');
    }

    function adjustBrightness(canvas, value) {
        applyFilter(canvas, `brightness(${value}%)`);
    }

    function grayscale(canvas) {
        applyFilter(canvas, 'grayscale(100%)');
    }

    // Export functions
    function toDataURL(canvas, mimeType = 'image/png', quality = 0.92) {
        return canvas.toDataURL(mimeType, quality);
    }

    function download(canvas, filename = 'canvas.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = toDataURL(canvas);
        link.click();
    }

    // Resize functions
    function resizeCanvas(canvas, newWidth, newHeight) {
        const tempCanvas = getCanvas(newWidth, newHeight);
        const tempCtx = getContext(tempCanvas);
        tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        const ctx = getContext(canvas);
        ctx.drawImage(tempCanvas, 0, 0);
    }

    // Text utilities
    function measureText(ctx, text, font = '16px Arial') {
        ctx.font = font;
        return ctx.measureText(text);
    }

    function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    }

    // Return public API
    return {
        // Core utilities
        getCanvas,
        getContext,
        loadImage,
        
        // Drawing
        drawImage,
        drawRoundedRect,
        drawCircle,
        
        // Transformations
        rotateCanvas,
        scaleCanvas,
        
        // Image processing
        invertColors,
        adjustBrightness,
        grayscale,
        applyFilter,
        
        // Export
        toDataURL,
        download,
        
        // Resize
        resizeCanvas,
        
        // Text
        measureText,
        drawWrappedText
    };
})();

export default CanvasUtils
