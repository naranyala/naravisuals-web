class CanvasUtility {
    constructor(canvas) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Canvas element is required.");
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error("Could not get 2D rendering context.");
        }
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'black';
        this.ctx.strokeStyle = 'black';
        this.ctx.font = '24px Inter, sans-serif';
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawRect(x, y, w, h, fill = null, stroke = null, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
        this.ctx.lineWidth = lineWidth;

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }

    drawCircle(x, y, r, fill = null, stroke = null, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.lineWidth = lineWidth;

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }

    drawLine(startX, startY, endX, endY, stroke = 'black', lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawText(text, x, y, font = '24px Inter', fill = 'black') {
        this.ctx.font = font;
        this.ctx.fillStyle = fill;
        this.ctx.fillText(text, x, y);
    }

    save() {
        this.ctx.save();
    }

    restore() {
        this.ctx.restore();
    }

    rotateContext(angleDegrees, centerX, centerY) {
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angleDegrees * Math.PI / 180);
        this.ctx.translate(-centerX, -centerY);
    }

    scaleContext(scaleX, scaleY) {
        this.ctx.scale(scaleX, scaleY);
    }

    translateContext(dx, dy) {
        this.ctx.translate(dx, dy);
    }

    drawPolygon(points, fill = null, stroke = null, lineWidth = 1) {
        if (points.length < 2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth;

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
    }

    drawDashedLine(startX, startY, endX, endY, segments = [5, 5], stroke = 'black', lineWidth = 1) {
        this.ctx.save();
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = lineWidth;
        this.ctx.setLineDash(segments);
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.restore();
    }

    createLinearGradient(x0, y0, x1, y1, colorStops) {
        const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        return gradient;
    }

    createRadialGradient(x0, y0, r0, x1, y1, r1, colorStops) {
        const gradient = this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });
        return gradient;
    }

    setShadow(offsetX, offsetY, blur, color) {
        this.ctx.shadowOffsetX = offsetX;
        this.ctx.shadowOffsetY = offsetY;
        this.ctx.shadowBlur = blur;
        this.ctx.shadowColor = color;
    }

    clearShadow() {
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    }

    // --- NEW FEATURES FOR THIS REQUEST ---

    drawRoundedRect(x, y, w, h, radius, fill = null, stroke = null, lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + w - radius, y);
        this.ctx.arcTo(x + w, y, x + w, y + radius, radius);
        this.ctx.lineTo(x + w, y + h - radius);
        this.ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        this.ctx.lineTo(x + radius, y + h);
        this.ctx.arcTo(x, y + h, x, y + h - radius, radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.arcTo(x, y, x + radius, y, radius);
        this.ctx.closePath();
        this.ctx.lineWidth = lineWidth;

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
    }

    setOpacity(alpha) {
        this.ctx.globalAlpha = alpha;
    }
    
    setLineCapAndJoin(cap = 'butt', join = 'miter', miterLimit = 10) {
        this.ctx.lineCap = cap; // 'butt', 'round', 'square'
        this.ctx.lineJoin = join; // 'round', 'bevel', 'miter'
        this.ctx.miterLimit = miterLimit;
    }

    drawBezierCurve(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY, stroke = 'black', lineWidth = 1) {
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        if (cp2x !== undefined && cp2y !== undefined) {
            // Cubic Bezier curve
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        } else {
            // Quadratic Bezier curve (using cp1 as the single control point)
            this.ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
        }
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    getCanvasData(x, y, width, height) {
        return this.ctx.getImageData(x, y, width, height);
    }

    putCanvasData(imageData, x, y) {
        this.ctx.putImageData(imageData, x, y);
    }
}

export default CanvasUtility
