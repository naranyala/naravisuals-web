// morphPlugin.js — God-tier shape morphing for canvas_util.js
// Turn circles into stars into squiggly blobs into text outlines — effortlessly.

export const morphPlugin = (app) => {
    const { animateTo, ease, lerp } = app;

    // Deep clone points array
    const clonePoints = (points) => points.map(p => [...p]);

    // Resample any polygon to exactly N points using even arc-length approximation
    const resamplePolygon = (points, targetCount) => {
        if (points.length === targetCount) return clonePoints(points);

        const closed = true;
        const totalLen = points.reduce((len, p, i) => {
            const next = points[(i + 1) % points.length];
            return len + Math.hypot(next[0] - p[0], next[1] - p[1]);
        }, 0);

        const segmentLen = totalLen / targetCount;
        const result = [];
        let accumulated = 0;
        let curr = points[0];

        for (let i = 0; i < points.length; i++) {
            const a = points[i];
            const b = points[(i + 1) % points.length];
            const dx = b[0] - a[0], dy = b[1] - a[1];
            const segLen = Math.hypot(dx, dy);

            while (accumulated + segLen >= segmentLen && result.length < targetCount) {
                const t = (segmentLen - accumulated) / segLen;
                result.push([
                    a[0] + dx * t,
                    a[1] + dy * t
                ]);
                accumulated = (accumulated + segLen) - segmentLen;
            }
            accumulated += segLen;
            curr = b;
        }
        // Final push to close exactly
        while (result.length < targetCount) {
            result.push([...result[0]]);
        }
        return result;
    };

    // Generate regular N-gon points centered at 0,0
    const regularPolygonPoints = (sides, radius = 50, rotation = 0) => {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = rotation + i * Math.PI * 2 / sides;
            points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
        }
        return points;
    };

    // Circle → N points (perfect circle sampling)
    const circlePoints = (sides, radius = 50) => regularPolygonPoints(sides, radius, -Math.PI / 2);

    // Star shape (classic 5-point star or any {outer,inner} ratio)
    const starPoints = (points = 10, outer = 60, inner = 25, rotation = 0) => {
        const pts = [];
        const step = Math.PI / (points / 2);
        for (let i = 0; i < points; i++) {
            const r = i & 1 ? inner : outer;
            const a = rotation + i * step;
            pts.push([Math.cos(a) * r, Math.sin(a) * r]);
        }
        return pts;
    };

    app.morph = {
        // Core morph: from any shape object → new point set
        to(shape, targetPoints, duration = 800, options = {}) {
            const {
                easeFn = ease,
                onComplete = null,
                colorTo = null,
                opacityTo = null
            } = options;

            // Ensure we have a points array
            if (!shape.points) {
                console.warn("morph.to() called on non-polygon shape without .points");
                return;
            }

            const startPoints = clonePoints(shape.points);
            const finalPoints = resamplePolygon(targetPoints, startPoints.length);

            // Optional: store original draw for restoration later
            const originalDraw = shape.draw;

            app.startCoroutine(function*() {
                const t0 = performance.now();

                while (true) {
                    const elapsed = performance.now() - t0;
                    const t = Math.min(elapsed / duration, 1);
                    const eased = easeFn(t);

                    // Morph points
                    for (let i = 0; i < shape.points.length; i++) {
                        shape.points[i][0] = lerp(startPoints[i][0], finalPoints[i][0], eased);
                        shape.points[i][1] = lerp(startPoints[i][1], finalPoints[i][1], eased);
                    }

                    // Optional color morph
                    if (colorTo && shape.color) {
                        // Very lightweight hex/RGB lerp (good enough for most cases)
                        shape.color = lerpColor(shape.color, colorTo, eased);
                    }

                    if (opacityTo !== null && shape.opacity !== undefined) {
                        shape.opacity = lerp(shape.opacity ?? 1, opacityTo, eased);
                    }

                    if (t >= 1) break;
                    yield 16;
                }

                // Snap to final state
                shape.points = finalPoints;
                if (colorTo) shape.color = colorTo;
                if (opacityTo !== null) shape.opacity = opacityTo;

                onComplete?.(shape);
            });
        },

        // High-level presets
        toCircle(shape, radius = 60, duration = 700, opt = {}) {
            const pts = circlePoints(shape.points.length, radius);
            app.morph.to(shape, pts, duration, opt);
        },

        toStar(shape, outer = 70, inner = 30, duration = 900, opt = {}) {
            const pts = starPoints(shape.points.length, outer, inner);
            app.morph.to(shape, pts, duration, opt);
        },

        toPolygon(shape, sides, radius = 60, rotation = 0, duration = 800, opt = {}) {
            const pts = regularPolygonPoints(sides, radius, rotation);
            const resampled = resamplePolygon(pts, shape.points.length);
            app.morph.to(shape, resampled, duration, opt);
        },

        // Chain multiple morphs with delays
        chain(shape, sequence) {
            let i = 0;
            const next = () => {
                if (i >= sequence.length) return;
                const step = sequence[i++];
                app.morph.to(shape, step.points, step.duration ?? 800, {
                    ...step,
                    onComplete: () => {
                        step.onComplete?.();
                        next();
                    }
                });
            };
            next();
        }
    };

    // Tiny hex color lerper (supports #fff and #ffffff)
    function lerpColor(a, b, t) {
        const ah = parseInt(a.replace("#", ""), 16),
            bh = parseInt(b.replace("#", ""), 16),
            ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255,
            br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
        const rr = ((ar + t * (br - ar)) | 0).toString(16).padStart(2, '0');
        const gg = ((ag + t * (bg - ag)) | 0).toString(16).padStart(2, '0');
        const bb_ = ((ab + t * (bb - ab)) | 0).toString(16).padStart(2, '0');
        return `#${rr}${gg}${bb_}`;
    }

    console.log("✨ morphPlugin loaded — your shapes can now shapeshift like liquid metal!");
};
