// mathPlugin.js — Mathematical utilities and visualizations

export function mathPlugin(app) {
    // Mathematical constants
    const constants = {
        PI: Math.PI,
        TAU: Math.PI * 2,
        E: Math.E,
        PHI: (1 + Math.sqrt(5)) / 2, // Golden ratio
        SQRT2: Math.SQRT2
    };

    // Advanced math functions
    const mathUtils = {
        // Vector math
        vec2(x = 0, y = 0) {
            return {
                x, y,
                add(v) { return mathUtils.vec2(this.x + v.x, this.y + v.y) },
                sub(v) { return mathUtils.vec2(this.x - v.x, this.y - v.y) },
                mul(s) { return mathUtils.vec2(this.x * s, this.y * s) },
                length() { return Math.sqrt(this.x * this.x + this.y * this.y) },
                normalize() {
                    const len = this.length();
                    return len > 0 ? mathUtils.vec2(this.x / len, this.y / len) : mathUtils.vec2(0, 0);
                },
                distance(v) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2) },
                dot(v) { return this.x * v.x + this.y * v.y },
                angle() { return Math.atan2(this.y, this.x) },
                rotate(angle) {
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);
                    return mathUtils.vec2(
                        this.x * cos - this.y * sin,
                        this.x * sin + this.y * cos
                    );
                }
            };
        },

        // Random utilities
        randomRange(min, max) {
            return Math.random() * (max - min) + min;
        },

        randomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        randomChoice(array) {
            return array[Math.floor(Math.random() * array.length)];
        },

        // Angle conversions
        degToRad(degrees) {
            return degrees * Math.PI / 180;
        },

        radToDeg(radians) {
            return radians * 180 / Math.PI;
        },

        // Clamping and interpolation
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },

        lerp(a, b, t) {
            return a + (b - a) * t;
        },

        smoothstep(edge0, edge1, x) {
            const t = mathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
            return t * t * (3 - 2 * t);
        },

        // Distance calculations
        distance(x1, y1, x2, y2) {
            return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        },

        // Coordinate conversions
        polarToCartesian(radius, angle) {
            return {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            };
        },

        cartesianToPolar(x, y) {
            return {
                radius: Math.sqrt(x * x + y * y),
                angle: Math.atan2(y, x)
            };
        },

        // Curve functions
        bezier(t, p0, p1, p2, p3) {
            const u = 1 - t;
            return {
                x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
                y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
            };
        },

        // Wave functions
        sineWave(x, frequency = 1, amplitude = 1, phase = 0) {
            return Math.sin(x * frequency + phase) * amplitude;
        },

        cosineWave(x, frequency = 1, amplitude = 1, phase = 0) {
            return Math.cos(x * frequency + phase) * amplitude;
        },

        // Geometric calculations
        pointInCircle(px, py, cx, cy, r) {
            return mathUtils.distance(px, py, cx, cy) <= r;
        },

        pointInRect(px, py, rx, ry, rw, rh) {
            return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
        },

        circleCircleCollision(x1, y1, r1, x2, y2, r2) {
            return mathUtils.distance(x1, y1, x2, y2) <= (r1 + r2);
        },

        // Easing functions
        easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        },

        easeOutBack(t) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
    };

    // Mathematical visualization shapes
    app.mathShapes = {
        // Coordinate system
        createCoordinateSystem(centerX, centerY, scale = 50, color = '#666') {
            const group = [];

            // Axes
            group.push(app.shapes.line(0, centerY, app.canvas.width, centerY, 2, color)); // X-axis
            group.push(app.shapes.line(centerX, 0, centerX, app.canvas.height, 2, color)); // Y-axis

            // Grid lines
            for (let x = centerX % scale; x < app.canvas.width; x += scale) {
                group.push(app.shapes.line(x, 0, x, app.canvas.height, 1, color + '20'));
            }
            for (let y = centerY % scale; y < app.canvas.height; y += scale) {
                group.push(app.shapes.line(0, y, app.canvas.width, y, 1, color + '20'));
            }

            return group;
        },

        // Function plotter
        plotFunction(fn, minX = -5, maxX = 5, steps = 100, color = '#ff6b6b', lineWidth = 2) {
            const points = [];
            const scale = 50;
            const centerX = app.canvas.width / 2;
            const centerY = app.canvas.height / 2;

            for (let i = 0; i <= steps; i++) {
                const x = minX + (maxX - minX) * (i / steps);
                const y = fn(x);
                points.push([x * scale + centerX, -y * scale + centerY]);
            }

            // Create connected line segments
            const lines = [];
            for (let i = 1; i < points.length; i++) {
                lines.push(app.shapes.line(
                    points[i - 1][0], points[i - 1][1],
                    points[i][0], points[i][1],
                    lineWidth, color
                ));
            }

            return lines;
        },

        // Parametric curve
        plotParametric(fnX, fnY, minT = 0, maxT = Math.PI * 2, steps = 100, color = '#4ecdc4', lineWidth = 2) {
            const points = [];
            const scale = 50;
            const centerX = app.canvas.width / 2;
            const centerY = app.canvas.height / 2;

            for (let i = 0; i <= steps; i++) {
                const t = minT + (maxT - minT) * (i / steps);
                const x = fnX(t);
                const y = fnY(t);
                points.push([x * scale + centerX, -y * scale + centerY]);
            }

            const lines = [];
            for (let i = 1; i < points.length; i++) {
                lines.push(app.shapes.line(
                    points[i - 1][0], points[i - 1][1],
                    points[i][0], points[i][1],
                    lineWidth, color
                ));
            }

            return lines;
        },

        // Vector field
        createVectorField(fn, cellSize = 40, scale = 10, color = '#45b7d1') {
            const vectors = [];

            for (let x = cellSize / 2; x < app.canvas.width; x += cellSize) {
                for (let y = cellSize / 2; y < app.canvas.height; y += cellSize) {
                    const vector = fn(x, y);
                    const endX = x + vector.x * scale;
                    const endY = y + vector.y * scale;

                    vectors.push(app.shapes.line(x, y, endX, endY, 2, color));

                    // Arrow head
                    const angle = Math.atan2(endY - y, endX - x);
                    vectors.push(app.shapes.polygon(endX, endY, [
                        [0, 0],
                        [-8, -4],
                        [-8, 4]
                    ], color).rotation = angle);
                }
            }

            return vectors;
        },

        // Polar plot
        plotPolar(fn, maxTheta = Math.PI * 2, steps = 100, color = '#ffa500', lineWidth = 2) {
            return this.plotParametric(
                t => fn(t) * Math.cos(t),
                t => fn(t) * Math.sin(t),
                0, maxTheta, steps, color, lineWidth
            );
        },

        // Create a mathematical shape (polygon with math-based points)
        createShapeFromFunction(fn, sides = 8, radius = 50, centerX = 400, centerY = 300, color = '#96ceb4') {
            const points = [];

            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const r = fn(angle) * radius;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;
                points.push([x, y]);
            }

            return app.shapes.polygon(centerX, centerY, points, color);
        }
    };

    // Animation helpers for mathematical animations
    app.mathAnimations = {
        // Animate along a path
        animateAlongPath(obj, pathFn, duration = 2000, loop = true) {
            app.start(function*() {
                const startTime = performance.now();

                while (true) {
                    const elapsed = performance.now() - startTime;
                    const progress = (elapsed % duration) / duration;

                    const point = pathFn(progress);
                    obj.x = point.x;
                    obj.y = point.y;

                    if (!loop && progress >= 1) break;
                    yield 16;
                }
            });
        },

        // Lissajous curve animation
        createLissajous(a = 3, b = 2, delta = Math.PI / 2, scale = 100) {
            const centerX = app.canvas.width / 2;
            const centerY = app.canvas.height / 2;
            const dot = app.shapes.circle(0, 0, 5, '#ff6b6b');

            app.start(function*() {
                let t = 0;
                while (true) {
                    dot.x = centerX + Math.sin(a * t) * scale;
                    dot.y = centerY + Math.sin(b * t + delta) * scale;
                    t += 0.05;
                    yield 16;
                }
            });

            return dot;
        },

        // Wave superposition
        createWaveSuperposition(waves = [], centerY = 300, amplitude = 50) {
            const points = [];
            const line = app.root.add({
                points: [],
                color: '#ff6b6b',
                lineWidth: 3,
                draw(ctx) {
                    if (this.points.length < 2) return;

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = this.lineWidth;
                    ctx.beginPath();
                    ctx.moveTo(this.points[0].x, this.points[0].y);

                    for (let i = 1; i < this.points.length; i++) {
                        ctx.lineTo(this.points[i].x, this.points[i].y);
                    }

                    ctx.stroke();
                }
            });

            app.start(function*() {
                let time = 0;
                while (true) {
                    line.points = [];

                    for (let x = 0; x < app.canvas.width; x += 5) {
                        let y = centerY;

                        for (const wave of waves) {
                            y += Math.sin((x * wave.frequency + time) * wave.speed) * wave.amplitude;
                        }

                        line.points.push({ x, y });
                    }

                    time += 0.1;
                    yield 16;
                }
            });

            return line;
        }
    };

    // Expose everything to the app
    app.math = {
        ...constants,
        ...mathUtils,
        shapes: app.mathShapes,
        animations: app.mathAnimations
    };

    // Add some useful mathematical properties to existing shapes
    const originalAdd = app.root.add;
    app.root.add = function(obj) {
        obj = originalAdd.call(this, obj);

        // Add mathematical properties if not present
        if (!obj.distanceTo) {
            obj.distanceTo = function(other) {
                return mathUtils.distance(this.x, this.y, other.x, other.y);
            };
        }

        if (!obj.angleTo) {
            obj.angleTo = function(other) {
                return Math.atan2(other.y - this.y, other.x - this.x);
            };
        }

        return obj;
    };
}
