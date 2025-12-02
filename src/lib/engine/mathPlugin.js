// mathPlugin.js — Complete Modern Math Utilities v2.0

export function mathPlugin(app) {
    // =============================================
    // Enhanced Constants
    // =============================================
    const TAU = Math.PI * 2;
    const PHI = (1 + Math.sqrt(5)) / 2;
    const EPSILON = 1e-9;

    app.math = {
        PI: Math.PI,
        TAU: TAU,
        E: Math.E,
        PHI: PHI,
        SQRT2: Math.SQRT2,
        SQRT1_2: Math.SQRT1_2,
        LN2: Math.LN2,
        LN10: Math.LN10,
        LOG2E: Math.LOG2E,
        LOG10E: Math.LOG10E,
        EPSILON: EPSILON,
    };

    // =============================================
    // Enhanced Vector2 (Mutable + Immutable versions)
    // =============================================
    app.vec2 = (x = 0, y = 0) => ({
        x, y,

        // Basic operations (immutable)
        add(v) { return app.vec2(this.x + v.x, this.y + v.y); },
        sub(v) { return app.vec2(this.x - v.x, this.y - v.y); },
        mul(s) { return app.vec2(this.x * s, this.y * s); },
        div(s) { return app.vec2(this.x / s, this.y / s); },

        // Mutable operations (modify this vector)
        add$(v) { this.x += v.x; this.y += v.y; return this; },
        sub$(v) { this.x -= v.x; this.y -= v.y; return this; },
        mul$(s) { this.x *= s; this.y *= s; return this; },
        div$(s) { this.x /= s; this.y /= s; return this; },
        set$(x, y) { this.x = x; this.y = y; return this; },

        // Properties
        length() { return Math.hypot(this.x, this.y); },
        lenSq() { return this.x * this.x + this.y * this.y; },
        normalized() {
            const len = this.length();
            return len > EPSILON ? this.div(len) : app.vec2();
        },
        normalize$() {
            const len = this.length();
            if (len > EPSILON) this.div$(len);
            return this;
        },

        // Products
        dot(v) { return this.x * v.x + this.y * v.y; },
        cross(v) { return this.x * v.y - this.y * v.x; },

        // Angles & rotation
        angle() { return Math.atan2(this.y, this.x); },
        rotated(a) {
            const c = Math.cos(a), s = Math.sin(a);
            return app.vec2(this.x * c - this.y * s, this.x * s + this.y * c);
        },
        rotate$(a) {
            const c = Math.cos(a), s = Math.sin(a);
            const x = this.x * c - this.y * s;
            this.y = this.x * s + this.y * c;
            this.x = x;
            return this;
        },
        angleTo(v) { return v.sub(this).angle(); },

        // Interpolation
        lerp(to, t) { return this.add(to.sub(this).mul(t)); },
        lerp$(to, t) { return this.add$(to.sub(this).mul(t)); },

        // Distance
        distance(v) { return this.sub(v).length(); },
        distanceSq(v) { return this.sub(v).lenSq(); },

        // Utilities
        toArray() { return [this.x, this.y]; },
        clone() { return app.vec2(this.x, this.y); },
        equals(v, eps = EPSILON) {
            return Math.abs(this.x - v.x) < eps && Math.abs(this.y - v.y) < eps;
        },
        toString() { return `vec2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`; },

        // Constants
        get ZERO() { return app.vec2(0, 0); },
        get ONE() { return app.vec2(1, 1); },
        get UP() { return app.vec2(0, -1); },
        get DOWN() { return app.vec2(0, 1); },
        get LEFT() { return app.vec2(-1, 0); },
        get RIGHT() { return app.vec2(1, 0); }
    });

    // =============================================
    // Matrix3 Class
    // =============================================
    app.mat3 = (elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]) => ({
        m: elements.slice(),

        identity() {
            this.m = [1, 0, 0, 0, 1, 0, 0, 0, 1];
            return this;
        },

        translate(x, y) {
            this.m[6] = this.m[0] * x + this.m[3] * y + this.m[6];
            this.m[7] = this.m[1] * x + this.m[4] * y + this.m[7];
            this.m[8] = this.m[2] * x + this.m[5] * y + this.m[8];
            return this;
        },

        rotate(angle) {
            const c = Math.cos(angle), s = Math.sin(angle);
            const m11 = this.m[0], m12 = this.m[3], m13 = this.m[6];
            const m21 = this.m[1], m22 = this.m[4], m23 = this.m[7];

            this.m[0] = c * m11 + s * m12;
            this.m[3] = c * m12 - s * m11;
            this.m[6] = c * m13 - s * m13;

            this.m[1] = c * m21 + s * m22;
            this.m[4] = c * m22 - s * m21;
            this.m[7] = c * m23 - s * m23;
            return this;
        },

        scale(x, y) {
            this.m[0] *= x; this.m[3] *= x; this.m[6] *= x;
            this.m[1] *= y; this.m[4] *= y; this.m[7] *= y;
            return this;
        },

        transformPoint(p) {
            const x = p.x, y = p.y;
            return app.vec2(
                this.m[0] * x + this.m[3] * y + this.m[6],
                this.m[1] * x + this.m[4] * y + this.m[7]
            );
        },

        clone() {
            return app.mat3(this.m.slice());
        }
    });

    // =============================================
    // Enhanced Math Utilities
    // =============================================
    Object.assign(app.math, {
        // Basic operations
        lerp(a, b, t) { return a + (b - a) * t; },
        invLerp(a, b, v) { return (v - a) / (b - a); },
        remap(i0, i1, o0, o1, v) {
            return app.math.lerp(o0, o1, app.math.invLerp(i0, i1, v));
        },
        clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
        wrap(v, min, max) {
            const range = max - min;
            return ((v - min) % range + range) % range + min;
        },

        // Smoothing functions
        smoothstep(e0, e1, x) {
            const t = app.math.clamp((x - e0) / (e1 - e0), 0, 1);
            return t * t * (3 - 2 * t);
        },
        smootherstep(e0, e1, x) {
            const t = app.math.clamp((x - e0) / (e1 - e0), 0, 1);
            return t * t * t * (t * (t * 6 - 15) + 10);
        },

        // Angle utilities
        degToRad: d => d * Math.PI / 180,
        radToDeg: r => r * 180 / Math.PI,
        angleDiff(a, b) {
            let diff = b - a;
            while (diff > Math.PI) diff -= TAU;
            while (diff < -Math.PI) diff += TAU;
            return diff;
        },

        // Random utilities
        random(min, max) { return Math.random() * (max - min) + min; },
        randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        chance(p) { return Math.random() < p; },
        randomSign() { return Math.random() < 0.5 ? -1 : 1; },
        randomVec2(length = 1) {
            const angle = Math.random() * TAU;
            return app.vec2(Math.cos(angle) * length, Math.sin(angle) * length);
        },

        // Seeded random
        seedRandom: (seed) => {
            let s = seed % 2147483647;
            return () => (s = s * 16807 % 2147483647) / 2147483647;
        },

        // Color conversions
        rgbToHsv(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;
            const d = max - min;
            s = max === 0 ? 0 : d / max;

            if (max === min) {
                h = 0;
            } else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: h * 360, s: s * 100, v: v * 100 };
        },

        hsvToRgb(h, s, v) {
            h /= 360; s /= 100; v /= 100;
            let r, g, b;
            const i = Math.floor(h * 6);
            const f = h * 6 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return { r: r * 255, g: g * 255, b: b * 255 };
        }
    });

    // =============================================
    // Enhanced Easing Functions
    // =============================================
    app.math.ease = {
        linear: t => t,

        // Quad
        inQuad: t => t * t,
        outQuad: t => t * (2 - t),
        inOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

        // Cubic
        inCubic: t => t * t * t,
        outCubic: t => (--t) * t * t + 1,
        inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

        // Elastic
        inElastic: (t, a = 0.3, p = 0.3) => {
            const s = p / 4;
            return t === 0 || t === 1 ? t :
                -Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p);
        },
        outElastic: (t, a = 0.3, p = 0.3) => {
            const s = p / 4;
            return t === 0 || t === 1 ? t :
                Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
        },

        // Back
        outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
        inBack: (t, s = 1.70158) => t * t * ((s + 1) * t - s),

        // Bounce
        bounceOut: t => {
            if (t < 1 / 2.75) return 7.5625 * t * t;
            if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
            if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        },
        bounceIn: t => 1 - app.math.ease.bounceOut(1 - t),

        // Circular
        inCirc: t => 1 - Math.sqrt(1 - t * t),
        outCirc: t => Math.sqrt(1 - (--t) * t)
    };

    // =============================================
    // Geometry & Shape Utilities
    // =============================================
    app.math.geometry = {
        // Line intersection
        lineIntersection(a1, a2, b1, b2) {
            const denominator = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
            if (Math.abs(denominator) < EPSILON) return null; // Parallel

            const ua = ((b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x)) / denominator;
            const ub = ((a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x)) / denominator;

            if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
                return app.vec2(
                    a1.x + ua * (a2.x - a1.x),
                    a1.y + ua * (a2.y - a1.y)
                );
            }
            return null;
        },

        // Point in polygon (ray casting)
        pointInPolygon(point, polygon) {
            let inside = false;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
                    (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) /
                        (polygon[j].y - polygon[i].y) + polygon[i].x)) {
                    inside = !inside;
                }
            }
            return inside;
        },

        // Polygon area
        polygonArea(polygon) {
            let area = 0;
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                area += polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
            }
            return Math.abs(area) / 2;
        },

        // Circle from points
        minCircle(points) {
            // Simple implementation - returns bounding circle
            if (points.length === 0) return { center: app.vec2(), radius: 0 };

            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            points.forEach(p => {
                minX = Math.min(minX, p.x);
                maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y);
                maxY = Math.max(maxY, p.y);
            });

            const center = app.vec2((minX + maxX) / 2, (minY + maxY) / 2);
            let radius = 0;

            points.forEach(p => {
                radius = Math.max(radius, p.distance(center));
            });

            return { center, radius };
        }
    };

    // =============================================
    // Bezier Curves
    // =============================================
    app.math.bezier = {
        // Quadratic bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
        quadratic(p0, p1, p2, t) {
            const u = 1 - t;
            return p0.mul(u * u)
                .add(p1.mul(2 * u * t))
                .add(p2.mul(t * t));
        },

        // Cubic bezier: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
        cubic(p0, p1, p2, p3, t) {
            const u = 1 - t;
            return p0.mul(u * u * u)
                .add(p1.mul(3 * u * u * t))
                .add(p2.mul(3 * u * t * t))
                .add(p3.mul(t * t * t));
        },

        // Generate points along curve
        quadraticPoints(p0, p1, p2, segments = 20) {
            const points = [];
            for (let i = 0; i <= segments; i++) {
                points.push(this.quadratic(p0, p1, p2, i / segments));
            }
            return points;
        },

        cubicPoints(p0, p1, p2, p3, segments = 30) {
            const points = [];
            for (let i = 0; i <= segments; i++) {
                points.push(this.cubic(p0, p1, p2, p3, i / segments));
            }
            return points;
        }
    };

    // =============================================
    // Noise Functions
    // =============================================
    app.math.noise = {
        // Simple 2D noise (pseudo-random)
        value2D(x, y, seed = 0) {
            const X = Math.floor(x) + seed * 137, Y = Math.floor(y) + seed * 157;
            const n = X + Y * 57;
            return (Math.sin(n * 127.1) * 43758.5453) % 1;
        },

        // Simple 2D Perlin-like noise
        perlin2D(x, y, seed = 0) {
            const X = Math.floor(x), Y = Math.floor(y);
            const fx = x - X, fy = y - Y;

            // Corner gradients
            const n00 = this.value2D(X, Y, seed);
            const n01 = this.value2D(X, Y + 1, seed);
            const n10 = this.value2D(X + 1, Y, seed);
            const n11 = this.value2D(X + 1, Y + 1, seed);

            // Smooth interpolation
            const u = fx * fx * (3 - 2 * fx);
            const v = fy * fy * (3 - 2 * fy);

            return app.math.lerp(
                app.math.lerp(n00, n10, u),
                app.math.lerp(n01, n11, u),
                v
            );
        },

        // Fractal Brownian Motion
        fbm(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5, seed = 0) {
            let value = 0;
            let amplitude = 1;
            let frequency = 1;
            let maxValue = 0;

            for (let i = 0; i < octaves; i++) {
                value += this.perlin2D(x * frequency, y * frequency, seed + i) * amplitude;
                maxValue += amplitude;
                amplitude *= gain;
                frequency *= lacunarity;
            }

            return value / maxValue;
        }
    };

    // =============================================
    // Signal Processing
    // =============================================
    app.math.signal = {
        // Wave generators
        sine(t, frequency = 1, amplitude = 1, phase = 0) {
            return amplitude * Math.sin(t * frequency * TAU + phase);
        },

        square(t, frequency = 1, amplitude = 1) {
            return Math.sin(t * frequency * TAU) >= 0 ? amplitude : -amplitude;
        },

        sawtooth(t, frequency = 1, amplitude = 1) {
            return 2 * amplitude * (t * frequency - Math.floor(t * frequency + 0.5));
        },

        triangle(t, frequency = 1, amplitude = 1) {
            return 2 * amplitude * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - amplitude;
        },

        // Filter (simple moving average)
        movingAverage(values, windowSize) {
            const result = [];
            for (let i = 0; i < values.length; i++) {
                let sum = 0;
                let count = 0;
                for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
                    sum += values[j];
                    count++;
                }
                result.push(sum / count);
            }
            return result;
        }
    };

    // =============================================
    // Probability & Statistics
    // =============================================
    app.math.stats = {
        mean(values) {
            return values.reduce((a, b) => a + b, 0) / values.length;
        },

        median(values) {
            const sorted = values.slice().sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        },

        standardDeviation(values) {
            const avg = this.mean(values);
            const squareDiffs = values.map(v => (v - avg) ** 2);
            return Math.sqrt(this.mean(squareDiffs));
        },

        // Random distributions
        gaussian(mean = 0, stddev = 1) {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return mean + stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        },

        exponential(lambda = 1) {
            return -Math.log(1 - Math.random()) / lambda;
        }
    };

    // =============================================
    // Enhanced Coordinate Grid
    // =============================================
    app.math.grid = function({
        step = 50,
        color = '#333',
        lineWidth = 1,
        labels = true,
        font = '10px monospace',
        labelColor = '#666',
        axes = true,
        subDivisions = 0
    } = {}) {
        const grid = app.root.add({
            visible: true,
            step,
            color,
            lineWidth,
            labels,
            font,
            labelColor,
            axes,
            subDivisions,

            draw(ctx) {
                if (!this.visible) return;

                const w = app.canvas.width, h = app.canvas.height;
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.font = this.font;
                ctx.fillStyle = this.labelColor;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                // Subdivisions
                if (this.subDivisions > 0) {
                    ctx.strokeStyle = this.color + '33';
                    ctx.lineWidth = this.lineWidth * 0.5;
                    const subStep = this.step / (this.subDivisions + 1);

                    for (let x = subStep; x <= w; x += subStep) {
                        if (x % this.step !== 0) {
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, h);
                            ctx.stroke();
                        }
                    }

                    for (let y = subStep; y <= h; y += subStep) {
                        if (y % this.step !== 0) {
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(w, y);
                            ctx.stroke();
                        }
                    }
                }

                // Main grid
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;

                // Vertical lines
                for (let x = 0; x <= w; x += this.step) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.stroke();
                    if (this.labels) ctx.fillText(x.toString(), x, 5);
                }

                // Horizontal lines
                for (let y = 0; y <= h; y += this.step) {
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                    if (this.labels) ctx.fillText(y.toString(), 5, y + 2);
                }

                // Axes
                if (this.axes) {
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
                    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
                    ctx.stroke();

                    // Axis labels
                    ctx.fillStyle = '#000';
                    ctx.fillText('x', w - 10, h / 2 - 15);
                    ctx.fillText('y', w / 2 + 15, 10);
                }
            }
        });
        return grid;
    };

    // =============================================
    // Enhanced Plotting System
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
            tMax = TAU,
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
                if (!isFinite(x) || !isFinite(y)) continue;
                points.push(app.vec2(x, y));
            }

            return app.root.add({
                points, color, lineWidth,
                draw: app.math.plot._drawPath
            });
        },

        // Polar: r(θ)
        polar(rFn, {
            thetaMax = TAU,
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
        },

        // Scatter plot
        scatter(points, {
            color = '#5856d6',
            radius = 3,
            fill = true
        } = {}) {
            return app.root.add({
                points,
                color,
                radius,
                fill,
                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.strokeStyle = this.color;
                    this.points.forEach(p => {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, this.radius, 0, TAU);
                        if (this.fill) {
                            ctx.fill();
                        } else {
                            ctx.stroke();
                        }
                    });
                }
            });
        },

        // Shared draw function
        _drawPath(ctx) {
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
    };

    // =============================================
    // Enhanced Vector Field
    // =============================================
    app.math.vectorField = function(fieldFn, {
        cellSize = 40,
        arrowScale = 8,
        color = '#32d74b',
        lineWidth = 2,
        maxMagnitude = 3
    } = {}) {
        const arrows = [];
        const hw = app.canvas.width, hh = app.canvas.height;

        for (let x = cellSize / 2; x < hw; x += cellSize) {
            for (let y = cellSize / 2; y < hh; y += cellSize) {
                const vec = fieldFn(x, y);
                const mag = vec.length();
                if (mag < EPSILON) continue;

                const scaledVec = vec.normalized().mul(arrowScale * Math.min(mag, maxMagnitude));
                const end = app.vec2(x, y).add(scaledVec);

                // Draw arrow line
                const line = app.root.add({
                    x1: x, y1: y, x2: end.x, y2: end.y,
                    color, lineWidth,
                    draw(ctx) {
                        ctx.strokeStyle = this.color;
                        ctx.lineWidth = this.lineWidth;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(this.x1, this.y1);
                        ctx.lineTo(this.x2, this.y2);
                        ctx.stroke();
                    }
                });

                // Draw arrowhead
                const angle = scaledVec.angle();
                const head = app.root.add({
                    x: end.x, y: end.y,
                    rotation: angle,
                    color,
                    draw(ctx) {
                        ctx.save();
                        ctx.translate(this.x, this.y);
                        ctx.rotate(this.rotation);
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(-8, -4);
                        ctx.lineTo(-6, 0);
                        ctx.lineTo(-8, 4);
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                });

                arrows.push(line, head);
            }
        }
        return arrows;
    };

    // =============================================
    // Fractal Generators
    // =============================================
    app.math.fractals = {
        // Mandelbrot set
        mandelbrot({
            centerX = -0.5,
            centerY = 0,
            scale = 2.5,
            iterations = 100,
            width = app.canvas.width,
            height = app.canvas.height
        } = {}) {
            const imageData = ctx.createImageData(width, height);

            for (let px = 0; px < width; px++) {
                for (let py = 0; py < height; py++) {
                    const x0 = (px / width - 0.5) * scale + centerX;
                    const y0 = (py / height - 0.5) * scale + centerY;

                    let x = 0, y = 0, iteration = 0;
                    while (x * x + y * y <= 4 && iteration < iterations) {
                        const xTemp = x * x - y * y + x0;
                        y = 2 * x * y + y0;
                        x = xTemp;
                        iteration++;
                    }

                    const idx = (px + py * width) * 4;
                    if (iteration === iterations) {
                        imageData.data[idx] = 0;
                        imageData.data[idx + 1] = 0;
                        imageData.data[idx + 2] = 0;
                    } else {
                        const color = Math.floor(iteration * 255 / iterations);
                        imageData.data[idx] = color;
                        imageData.data[idx + 1] = color;
                        imageData.data[idx + 2] = color * 0.7;
                    }
                    imageData.data[idx + 3] = 255;
                }
            }

            return app.root.add({
                imageData,
                draw(ctx) {
                    ctx.putImageData(this.imageData, 0, 0);
                }
            });
        }
    };

    // =============================================
    // Enhanced Object Math Helpers
    // =============================================
    const originalAdd = app.root.add;
    app.root.add = function(obj) {
        obj = originalAdd.call(this, obj);

        if (!obj.vec2) {
            // Vector conversion
            obj.toVec = () => app.vec2(obj.x ?? 0, obj.y ?? 0);
            obj.fromVec = (v) => { obj.x = v.x; obj.y = v.y; return obj; };

            // Distance and angles
            obj.distanceTo = (other) => obj.toVec().distance(other.toVec?.() || other);
            obj.distanceToSq = (other) => obj.toVec().distanceSq(other.toVec?.() || other);
            obj.angleTo = (other) => obj.toVec().angleTo(other.toVec?.() || other);
            obj.directionTo = (other) => {
                const target = other.toVec?.() || other;
                return target.sub(obj.toVec()).normalized();
            };

            // Movement helpers
            obj.moveTowards = (target, speed, dt) => {
                const direction = obj.directionTo(target);
                obj.x += direction.x * speed * dt;
                obj.y += direction.y * speed * dt;
                return obj;
            };

            // Math operations
            obj.lerpTo = (target, t) => {
                const current = obj.toVec();
                const targetVec = target.toVec?.() || target;
                return obj.fromVec(current.lerp(targetVec, t));
            };
        }

        return obj;
    };

    console.log("🎯 mathPlugin v2.0 loaded — Complete math utilities including vectors, matrices, noise, fractals, and more!");
}
