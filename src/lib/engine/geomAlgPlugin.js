// geomAlgPlugin.js
// geometric algebra plugin

export function geomAlgPlugin(app) {
    // ------------------------------------------------------------------------
    // 1. Bring the whole geomAlg2.js implementation into a private scope
    // ------------------------------------------------------------------------
    const mv = () => new Float64Array(8);
    const mv_from = arr => {
        const out = new Float64Array(8);
        for (let i = 0; i < 8; i++) out[i] = arr[i] || 0;
        return out;
    };
    const MV = (c0, c1, c2, c3, c12, c20, c01, c012) => mv_from([c0, c1, c2, c3, c12, c20, c01, c012]);

    // Geometric product (exact copy of your hand-written version)
    const gp = (a, b) => {
        const A = a, B = b;
        return MV(
            A[0] * B[0] + A[1] * B[1] + A[2] * B[2] - A[3] * B[3] - A[4] * B[4] - A[5] * B[5] - A[6] * B[6] - A[7] * B[7],
            A[0] * B[1] + A[1] * B[0] - A[2] * B[4] + A[3] * B[6] + A[4] * B[2] - A[5] * B[3] + A[6] * B[7] - A[7] * B[5],
            A[0] * B[2] + A[2] * B[0] + A[1] * B[4] - A[3] * B[5] - A[4] * B[1] + A[5] * B[7] - A[6] * B[3] + A[7] * B[6],
            A[0] * B[3] + A[3] * B[0] + A[1] * B[5] + A[2] * B[6] - A[4] * B[7] - A[5] * B[1] - A[6] * B[2] + A[7] * B[4],
            A[0] * B[4] + A[4] * B[0] + A[1] * B[2] - A[2] * B[1] - A[3] * B[7] + A[5] * B[6] - A[6] * B[5] - A[7] * B[3],
            A[0] * B[5] + A[5] * B[0] + A[2] * B[3] - A[3] * B[2] - A[1] * B[7] + A[4] * B[6] - A[6] * B[4] - A[7] * B[1],
            A[0] * B[6] + A[6] * B[0] + A[3] * B[1] - A[1] * B[3] - A[2] * B[7] + A[4] * B[5] - A[5] * B[4] - A[7] * B[2],
            A[0] * B[7] + A[7] * B[0] + A[1] * B[5] + A[2] * B[6] + A[3] * B[4] + A[4] * B[3] + A[5] * B[2] + A[6] * B[1]
        );
    };

    const op = (a, b) => {
        const A = a, B = b;
        return MV(
            0,
            A[0] * B[1] - A[1] * B[0],
            A[0] * B[2] - A[2] * B[0],
            A[0] * B[3] - A[3] * B[0],
            A[1] * B[2] - A[2] * B[1],
            A[2] * B[3] - A[3] * B[2],
            A[3] * B[1] - A[1] * B[3],
            A[1] * B[5] + A[2] * B[6] + A[3] * B[4] - B[1] * A[5] - B[2] * A[6] - B[3] * A[4]
        );
    };

    const reverse = a => MV(a[0], a[1], a[2], a[3], -a[4], -a[5], -a[6], -a[7]);
    const dual = a => MV(a[7], a[6], a[5], a[4], a[3], a[2], a[1], a[0]);

    // ------------------------------------------------------------------------
    // 2. Public constructors
    // ------------------------------------------------------------------------
    const point = (x, y) => MV(0, x, y, 1, 0, 0, 0, 0);
    const line = (a, b, c) => MV(0, 0, 0, 0, a, b, c, 0);
    const lineThrough = (P, Q) => op(P, Q);

    // High-level ops
    const meet = (L1, L2) => op(L1, L2);           // line ∧ line → point
    const join = (P, Q) => op(P, Q);            // point ∧ point → line

    const project = (P, L) => gp(L, gp(P, L));
    const reflect = (P, L) => gp(L, gp(P, L));

    const rotor = angle => {
        const h = angle * 0.5;
        return MV(Math.cos(h), 0, 0, 0, Math.sin(h), 0, 0, 0);
    };
    const applyRotor = (R, P) => gp(gp(R, P), reverse(R));

    const translator = (dx, dy) => MV(1, 0, 0, 0, 0, dy * 0.5, -dx * 0.5, 0);
    const applyTranslator = (T, P) => gp(gp(T, P), reverse(T));

    // Motor = translator * rotor (order matters for non-commuting parts)
    const motor = (dx, dy, angle) => gp(translator(dx, dy), rotor(angle));
    const applyMotor = (M, P) => gp(gp(M, P), reverse(M));

    const extractPoint = P => ({ x: P[1] / P[3], y: P[2] / P[3] });

    // ------------------------------------------------------------------------
    // 3. Drawing helpers that respect canvas_util transforms
    // ------------------------------------------------------------------------
    const drawPoint = (P, { radius = 6, color = "#ff0080", fill = true } = {}) => {
        const { x, y } = extractPoint(P);
        return app.createCircle(x, y, radius, color);
    };

    const drawLine = (L, { color = "#00aaff", width = 3, extend = 10000 } = {}) => {
        // Normalise line so e0 coefficient = 1 (ideal line → finite line)
        const n = L[6] || L[5] || L[4] || 1;
        const a = L[4] / n, b = L[5] / n, c = L[6] / n;

        // Two points far away in perpendicular directions
        const perpX = -b;
        const perpY = a;
        const len = Math.hypot(perpX, perpY) || 1;
        const dx = perpX / len * extend;
        const dy = perpY / len * extend;

        const p1 = { x: dx, y: dy };
        const p2 = { x: -dx, y: -dy };

        // Move to line position: solve a*x + b*y + c = 0
        const offsetX = -a * c / (a * a + b * b + 1e-12);
        const offsetY = -b * c / (a * a + b * b + 1e-12);
        p1.x += offsetX; p1.y += offsetY;
        p2.x += offsetX; p2.y += offsetY;

        return app.createLine(p1.x, p1.y, p2.x, p2.y, color, width);
    };

    // Convenience: draw many at once
    const draw = (entities, options = {}) => {
        const objs = [];
        for (const e of entities) {
            if (e[3] !== 0) {               // has e0 → point
                objs.push(drawPoint(e, options.point || {}));
            } else if (e[4] || e[5] || e[6]) { // has grade-2 part → line
                objs.push(drawLine(e, options.line || {}));
            }
        }
        return objs;
    };

    // ------------------------------------------------------------------------
    // 4. Expose everything under app.geomAlg
    // ------------------------------------------------------------------------
    app.geomAlg = {
        // raw algebra
        mv, MV, gp, op, reverse, dual,

        // constructors
        point, line, lineThrough, join, meet,

        // transformations
        rotor, applyRotor,
        translator, applyTranslator,
        motor, applyMotor,

        // utilities
        project, reflect,
        extractPoint,

        // drawing (return canvas_util objects you can add to layers)
        drawPoint,
        drawLine,
        draw,               // batch version

        // constants (useful for debugging)
        E0: MV(0, 0, 0, 1, 0, 0, 0, 0),
        E1: MV(0, 1, 0, 0, 0, 0, 0, 0),
        E2: MV(0, 0, 1, 0, 0, 0, 0, 0),
        I: MV(0, 0, 0, 0, 0, 0, 0, 1),
    };

    // Optional: nice console printing
    app.geomAlg.print = (m, label = "") => {
        console.log(label,
            `[${m[0].toFixed(3)}, ${m[1].toFixed(3)}, ${m[2].toFixed(3)}, ${m[3].toFixed(3)}, ` +
            `${m[4].toFixed(3)}, ${m[5].toFixed(3)}, ${m[6].toFixed(3)}, ${m[7].toFixed(3)}]`
        );
    };
}
