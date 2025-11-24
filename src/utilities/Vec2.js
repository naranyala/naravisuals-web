
// Vec2.js
export const Vec2 = {
    create(x = 0, y = 0) { return { x, y }; },

    clone(a) { return { x: a.x, y: a.y }; },

    add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; },
    sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; },
    mul(a, s) { return { x: a.x * s, y: a.y * s }; },

    dot(a, b) { return a.x * b.x + a.y * b.y; },
    len(a) { return Math.hypot(a.x, a.y); },
    norm(a) {
        const l = Math.hypot(a.x, a.y);
        return l === 0 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
    },

    lerp(a, b, t) {
        return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    },

    angle(a) { return Math.atan2(a.y, a.x); },
};

export default Vec2;
