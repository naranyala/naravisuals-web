
//
// pga2.js - 2D Projective Geometric Algebra (PGA2)
// Browser version of your updated single-header C library
//

// A multivector is represented as a Float64Array(8):
// [1, e1, e2, e0, e12, e20, e01, e012]
function mv() {
    return new Float64Array(8);
}

function mv_from(arr) {
    const out = new Float64Array(8);
    for (let i = 0; i < 8; i++) out[i] = arr[i] || 0;
    return out;
}

// Small helper
const MV = (c0, c1, c2, c3, c12, c20, c01, c012) =>
    mv_from([c0, c1, c2, c3, c12, c20, c01, c012]);

// ---------------------------------------------------------------------------
// Basic Algebra
// ---------------------------------------------------------------------------

// Geometric product (hand-written, mirror of C version)
function gp(a, b) {
    const A = a, B = b;
    return MV(
        // scalar
        A[0] * B[0] + A[1] * B[1] + A[2] * B[2] - A[3] * B[3]
        - A[4] * B[4] - A[5] * B[5] - A[6] * B[6] - A[7] * B[7],

        // e1
        A[0] * B[1] + A[1] * B[0] - A[2] * B[4] + A[3] * B[6]
        + A[4] * B[2] - A[5] * B[3] + A[6] * B[7] - A[7] * B[5],

        // e2
        A[0] * B[2] + A[2] * B[0] + A[1] * B[4] - A[3] * B[5]
        - A[4] * B[1] + A[5] * B[7] - A[6] * B[3] + A[7] * B[6],

        // e0
        A[0] * B[3] + A[3] * B[0] + A[1] * B[5] + A[2] * B[6]
        - A[4] * B[7] - A[5] * B[1] - A[6] * B[2] + A[7] * B[4],

        // e12
        A[0] * B[4] + A[4] * B[0] + A[1] * B[2] - A[2] * B[1]
        - A[3] * B[7] + A[5] * B[6] - A[6] * B[5] - A[7] * B[3],

        // e20
        A[0] * B[5] + A[5] * B[0] + A[2] * B[3] - A[3] * B[2]
        - A[1] * B[7] + A[4] * B[6] - A[6] * B[4] - A[7] * B[1],

        // e01
        A[0] * B[6] + A[6] * B[0] + A[3] * B[1] - A[1] * B[3]
        - A[2] * B[7] + A[4] * B[5] - A[5] * B[4] - A[7] * B[2],

        // e012
        A[0] * B[7] + A[7] * B[0] + A[1] * B[5] + A[2] * B[6]
        + A[3] * B[4] + A[4] * B[3] + A[5] * B[2] + A[6] * B[1]
    );
}

// Outer product
function op(a, b) {
    const A = a, B = b;
    return MV(
        0,
        A[0] * B[1] - A[1] * B[0],
        A[0] * B[2] - A[2] * B[0],
        A[0] * B[3] - A[3] * B[0],
        A[1] * B[2] - A[2] * B[1],
        A[2] * B[3] - A[3] * B[2],
        A[3] * B[1] - A[1] * B[3],
        A[1] * B[5] + A[2] * B[6] + A[3] * B[4]
        - B[1] * A[5] - B[2] * A[6] - B[3] * A[4]
    );
}

// Inner product (meet)
function ip(a, b) {
    const gpAB = gp(a, b);
    return MV(
        gpAB[0], gpAB[1], gpAB[2], gpAB[3],
        0, 0, 0, 0
    );
}

// Reverse
function mv_reverse(a) {
    return MV(
        a[0],
        a[1],
        a[2],
        a[3],
        -a[4],
        -a[5],
        -a[6],
        -a[7]
    );
}

// Dual
function mv_dual(a) {
    return MV(
        a[7], a[6], a[5], a[4],
        a[3], a[2], a[1], a[0]
    );
}

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

function pga_point(x, y) {
    return MV(0, x, y, 1, 0, 0, 0, 0);
}

function pga_line(a, b, c) {
    return MV(0, 0, 0, 0, a, b, c, 0);
}

function pga_line_through_points(P, Q) {
    return op(P, Q);
}

// ---------------------------------------------------------------------------
// High-level geometry
// ---------------------------------------------------------------------------

// Intersection of two lines → point
function pga_intersect(L1, L2) {
    return op(L1, L2);
}

// Project point onto line
function pga_project(P, L) {
    return gp(L, gp(P, L));
}

// Reflect point across line
function pga_reflect_point(P, L) {
    const Li = L;        // In 2D PGA lines are involutions
    return gp(Li, gp(P, Li));
}

// Rotor (rotation)
function pga_rotor(angle) {
    const half = angle * 0.5;
    return MV(Math.cos(half), 0, 0, 0, Math.sin(half), 0, 0, 0);
}

// Rotate point around origin
function pga_apply_rotor(R, P) {
    return gp(gp(R, P), mv_reverse(R));
}

// Translation motor
function pga_translator(dx, dy) {
    return MV(1, 0, 0, 0, 0, dy * 0.5, -dx * 0.5, 0);
}

function pga_apply_translator(T, P) {
    return gp(gp(T, P), mv_reverse(T));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pga_extract_point_xy(P) {
    const w = P[3];
    return { x: P[1] / w, y: P[2] / w };
}

function mv_print(a) {
    console.log(
        `MV(` +
        `${a[0].toFixed(4)}, ${a[1].toFixed(4)}, ${a[2].toFixed(4)}, ${a[3].toFixed(4)}, ` +
        `${a[4].toFixed(4)}, ${a[5].toFixed(4)}, ${a[6].toFixed(4)}, ${a[7].toFixed(4)})`
    );
}
