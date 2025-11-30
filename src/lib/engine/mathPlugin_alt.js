
// mathPlugin.js — Complete Modern Rewrite (2025 Edition)
// Fully compatible with canvas_util.js

export function mathPlugin(app) {
    // =============================================
    // Constants
    // =============================================
    const τ = Math.PI * 2;
    const φ = (1 + Math.sqrt(5)) / 2;

    app.math = {
        PI: Math.PI,
        TAU: τ,
        E: Math.E,
        PHI: φ,
        SQRT2: Math.SQRT2,
        τ,
        φ,
    };

    // =============================================
    // Vector2 Factory (Immutable-style)
    // =============================================
    app.vec2 = (x = 0, y = 0) => ({
        x, y,
        add(v) { return app.vec2(this.x + v.x, this.y + v.y); },
        sub(v) { return app.vec2(this.x - v.x, this.y - v.y); },
        mul(s) { return app.vec2(this.x * s, this.y * s); },
        div(s) { return app.vec2(this.x / s, this.y / s); },
        length() { return Math.hypot(this.x, this.y); },
        lenSq() { return this.x * this.x + this.y * this.y; },
        normalized() {
            const len = this.length();
            return len > 0 ? this.div(len) : app.vec2();
        },
        dot(v) { return this.x * v.x + this.y * v.y; },
        cross(v) { return this.x * v.y - this.y * v.x; },
        angle() { return Math.atan2(this.y, this.x); },
        rotated(a) {
            const c = Math.cos(a), s = Math.sin(a);
            return app.vec2(this.x * c - this.y * s, this.x * s + this.y * c);
        },
        lerp(to, t) { return this.add(to.sub(this).mul(t)); },
        distance(v) { return this.sub(v).length(); },
        angleTo(v) { return v.sub(this).angle(); },
        toArray() { return [this.x, this.y]; },
        clone() { return app.vec2(this.x, this.y); },
        equals(v, eps = 1e-9) { return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps; }
    });

    // =============================================
    // Math Utilities
    // =============================================
    Object.assign(app.math, {
        lerp(a, b, t) { return a + (b - a) * t; },
        invLerp(a, b, v) { return (v - a) / (b - a); },
        remap(i0, i1, o0, o1, v) { return app.math.lerp(o0, o1, app.math.invLerp(i0, i1, v)); },
        clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
        smoothstep(e0, e1, x) {
            const t = app.math.clamp((x - e0) / (e1 - e0), 0, 1);
            return t * t * (3 - 2 * t);
        },
        smootherstep(e0, e1, x) {
            const t = app.math.clamp((x - e0) / (e1 - e0), 0, 1);
            return t * t * t * (t * (t * 6 - 15) + 10);
        },
        degToRad: d => d * Math.PI / 180,
        radToDeg: r => r * 180 / Math.PI,
        random(min, max) { return Math.random() * (max - min) + min; },
        randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        chance(p) { return Math.random() < p; },
        randomSign() { return Math.random() < 0.5 ? -1 : 1; },
        seedRandom: (seed) => {
            let s = seed % 2147483647;
            return () => (s = s * 16807 % 2147483647) / 2147483647;
        }
    });

    // =============================================
    // Easing Functions
    // =============================================
    app.math.ease = {
        linear: t => t,
        inQuad: t => t * t,
        outQuad: t => t * (2 - t),
        inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        inCubic: t => t * t * t,
        outCubic: t => (--t) * t * t + 1,
        inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        inElastic: (t, a = 0.3) => {
            return t === 0 || t === 1 ? t : -Math.pow(2, 10 * (t -= 1)) * Math.sin((t - a / 4) * (2 * Math.PI) / a);
        },
        outBack: (t, s = 1.70158) => {
            return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
        },
        bounceOut: t => {
            if (t < 1 / 2.75) return 7.5625 * t * t;
            if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    };

    // =============================================
    // Coordinate Grid & Axes
    // =============================================
    app.math.grid = function({
        step = 50,
        color = '#333',
        lineWidth = 1,
        labels = true,
        font = '10px monospace',
        labelColor = '#666'
    } = {}) {
        const grid = app.root.add({
            draw(ctx) {
                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.font = font;
                ctx.fillStyle = labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Vertical lines
                for (let x = 0; x <= w; x += step) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                    if (labels) ctx.fillText(x.toString(), x, 5);
                }

                // Horizontal lines
                for (let y = 0; y <= h; y += step) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                    if (labels) ctx.fillText(y.toString(), 5, y + 2);
                }

                // Axes
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
                ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
                ctx.stroke();
            }
        });
        return grid;
    };

    // =============================================
    // Advanced Mathematical Shapes & Plots
    // =============================================
    app.math.plot = {
        // Cartesian function y = f(x)
        function(fn, {
            range = [-10, 10],
            steps = 400,
            color = '#ff3b30',
            lineWidth = 3,
            scale = 40,
            offsetX = app.canvas.width / 2,
            offsetY = app.canvas.height / 2
        } = {}) {
            const points = [];
            const [minX, maxX] = range;
            for (let i = 0; i <= steps; i++) {
                const x = minX + (maxX - minX) * (i / steps);
                const y = fn(x);
                if (!isFinite(y)) continue;
                points.push(app.vec2(x * scale + offsetX, -y * scale + offsetY));
            }

            const path = app.root.add({
                points,
                color,
                lineWidth,
                draw(ctx) {
                    if (this.points.length < 2) return;
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.beginPath();
                    ctx.moveTo(this.points[0].x, this.points[0].y);
                    for (let i = 1; i < this.points.length; i++) {
                        ctx.lineTo(this.points[i].x, this.points[i].y);
                    }
                    ctx.stroke();
                }
            });
            return path;
        },

        // Parametric: x(t), y(t)
        parametric(xFn, yFn, {
            tMin = 0,
            tMax = τ,
            steps = 300,
            color = '#007aff',
            lineWidth = 3,
            scale = 60,
            centerX = app.canvas.width / 2,
            centerY = app.canvas.height / 2
        } = {}) {
            const points = [];
            for (let i = 0; i <= steps; i++) {
                const t = tMin + (tMax - tMin) * (i / steps);
                const x = xFn(t) * scale + centerX;
                const y = yFn(t) * scale + centerY;
                points.push(app.vec2(x, y));
            }
            return app.root.add({ points, color, lineWidth, draw: sameAsAbovePlotDraw });
        },

        // Polar: r(θ)
        polar(rFn, {
            thetaMax = τ,
            steps = 360,
            color = '#ff9500',
            lineWidth = 3,
            scale = 60,
            centerX = app.canvas.width / 2,
            centerY = app.canvas.height / 2
        } = {}) {
            return app.math.plot.parametric(
                t => rFn(t) * Math.cos(t),
                t => rFn(t) * Math.sin(t),
                { tMin: 0, tMax: thetaMax, steps, color, lineWidth, scale, centerX, centerY }
            );
        }
    };

    // Shared draw function for plots
    function sameAsAbovePlotDraw(ctx) {
        if (this.points.length < 2) return;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        this.points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }

    // =============================================
    // Vector Field (Proper Arrowheads!)
    // =============================================
    app.math.vectorField = function(fieldFn, {
        cellSize = 40,
        arrowScale = 8,
        color = '#32d74b',
        lineWidth = 2
    } = {}) {
        const arrows = [];
        const hw = app.canvas.width, hh = app.canvas.height;

        for (let x = cellSize / 2; x < hw; x += cellSize) {
            for (let y = cellSize / 2; y < hh; y += cellSize) {
                const vec = fieldFn(x, y);
                const mag = vec.length();
                if (mag === 0) continue;

                const end = app.vec2(x, y).add(vec.normalized().mul(arrowScale * Math.min(mag, 3)));

                const line = app.shapes.line(x, y, end.x, end.y, lineWidth, color);
                const angle = vec.angle();

                const head = app.shapes.polygon(end.x, end.y, [
                    [0, 0],
                    [-10, -4],
                    [-7, 0],
                    [-10, 4]
                ], color);
                head.rotation = angle;

                arrows.push(line, head);
            }
        }
        return arrows;
    };

    // =============================================
    // Enhance all added objects with math helpers
    // =============================================
    const originalAdd = app.root.add;
    app.root.add = function(obj) {
        obj = originalAdd.call(this, obj);

        if (!obj.vec2) {
            obj.toVec = () => app.vec2(obj.x ?? 0, obj.y ?? 0);
            obj.distanceTo = (other) => obj.toVec().distance(other.toVec());
            obj.angleTo = (other) => obj.toVec().angleTo(other.toVec());
            obj.directionTo = (other) => other.toVec().sub(obj.toVec()).normalized();
        }

        return obj;
    };

    console.log("🎯 mathPlugin loaded — vec2, plot, vectorField, grid, ease, and more now available!");
}
