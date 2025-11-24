// Vec3.js
export const Vec3 = {
    create(x = 0, y = 0, z = 0) {
        return { x, y, z };
    },

    clone(a) {
        return { x: a.x, y: a.y, z: a.z };
    },

    add(a, b) {
        return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
    },
    sub(a, b) {
        return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    },
    mul(a, s) {
        return { x: a.x * s, y: a.y * s, z: a.z * s };
    },

    dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    },

    len(a) {
        return Math.hypot(a.x, a.y, a.z);
    },

    norm(a) {
        const l = Math.hypot(a.x, a.y, a.z);
        return l === 0 ? { x: 0, y: 0, z: 0 } : { x: a.x / l, y: a.y / l, z: a.z / l };
    },

    lerp(a, b, t) {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            z: a.z + (b.z - a.z) * t
        };
    },
    
    cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    },
};

export default Vec3;
