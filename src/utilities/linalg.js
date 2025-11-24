
// linalg.js

const LINALG_EPSILON = 1e-6;

// ============================================================================
// Vec3
// ============================================================================
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static zero() { return new Vec3(0, 0, 0); }
    static one() { return new Vec3(1, 1, 1); }

    add(b) { return new Vec3(this.x + b.x, this.y + b.y, this.z + b.z); }
    sub(b) { return new Vec3(this.x - b.x, this.y - b.y, this.z - b.z); }
    mul(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    div(s) { return this.mul(1.0 / s); }
    neg() { return new Vec3(-this.x, -this.y, -this.z); }

    mulVec(b) { return new Vec3(this.x * b.x, this.y * b.y, this.z * b.z); }
    min(b) { return new Vec3(Math.min(this.x, b.x), Math.min(this.y, b.y), Math.min(this.z, b.z)); }
    max(b) { return new Vec3(Math.max(this.x, b.x), Math.max(this.y, b.y), Math.max(this.z, b.z)); }

    dot(b) { return this.x * b.x + this.y * b.y + this.z * b.z; }
    cross(b) {
        return new Vec3(
            this.y * b.z - this.z * b.y,
            this.z * b.x - this.x * b.z,
            this.x * b.y - this.y * b.x
        );
    }

    lenSq() { return this.dot(this); }
    len() { return Math.sqrt(this.lenSq()); }
    distSq(b) { return this.sub(b).lenSq(); }
    dist(b) { return this.sub(b).len(); }

    normalize() {
        const len = this.len();
        return len > LINALG_EPSILON ? this.div(len) : Vec3.zero();
    }

    lerp(b, t) {
        return this.mul(1.0 - t).add(b.mul(t));
    }

    reflect(n) {
        return this.sub(n.mul(2.0 * this.dot(n)));
    }

    project(b) {
        const dot = this.dot(b);
        const lenSq = b.lenSq();
        return lenSq > LINALG_EPSILON ? b.mul(dot / lenSq) : Vec3.zero();
    }

    equals(b, eps = LINALG_EPSILON) {
        return Math.abs(this.x - b.x) < eps &&
               Math.abs(this.y - b.y) < eps &&
               Math.abs(this.z - b.z) < eps;
    }
}

// ============================================================================
// Vec4
// ============================================================================
class Vec4 {
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    static fromVec3(v, w) { return new Vec4(v.x, v.y, v.z, w); }
    toVec3() { return new Vec3(this.x, this.y, this.z); }

    add(b) { return new Vec4(this.x + b.x, this.y + b.y, this.z + b.z, this.w + b.w); }
    mul(s) { return new Vec4(this.x * s, this.y * s, this.z * s, this.w * s); }
    dot(b) { return this.x * b.x + this.y * b.y + this.z * b.z + this.w * b.w; }
}

// ============================================================================
// Mat4 (Column-major 4x4 matrix)
// ============================================================================
class Mat4 {
    constructor(m = null) {
        this.m = m ? m.slice() : new Array(16).fill(0);
    }

    static identity() {
        return new Mat4([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }

    mul(b) {
        const r = new Array(16).fill(0);
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let i = 0; i < 4; i++) {
                    sum += this.m[i * 4 + row] * b.m[col * 4 + i];
                }
                r[col * 4 + row] = sum;
            }
        }
        return new Mat4(r);
    }

    mulVec4(v) {
        return new Vec4(
            this.m[0] * v.x + this.m[4] * v.y + this.m[8]  * v.z + this.m[12] * v.w,
            this.m[1] * v.x + this.m[5] * v.y + this.m[9]  * v.z + this.m[13] * v.w,
            this.m[2] * v.x + this.m[6] * v.y + this.m[10] * v.z + this.m[14] * v.w,
            this.m[3] * v.x + this.m[7] * v.y + this.m[11] * v.z + this.m[15] * v.w
        );
    }

    mulVec3(v) {
        return this.mulVec4(Vec4.fromVec3(v, 1.0)).toVec3();
    }

    static translate(v) {
        const m = Mat4.identity();
        m.m[12] = v.x;
        m.m[13] = v.y;
        m.m[14] = v.z;
        return m;
    }

    static scale(v) {
        return new Mat4([
            v.x,0,0,0,
            0,v.y,0,0,
            0,0,v.z,0,
            0,0,0,1
        ]);
    }

    static rotateX(angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Mat4([
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1
        ]);
    }

    static rotateY(angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Mat4([
            c,0,-s,0,
            0,1,0,0,
            s,0,c,0,
            0,0,0,1
        ]);
    }

    static rotateZ(angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Mat4([
            c,s,0,0,
            -s,c,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }

    static perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2.0);
        const rangeInv = 1.0 / (near - far);
        return new Mat4([
            f/aspect,0,0,0,
            0,f,0,0,
            0,0,(near+far)*rangeInv,-1,
            0,0,2*near*far*rangeInv,0
        ]);
    }

    static lookAt(eye, center, up) {
        const f = center.sub(eye).normalize();
        const s = f.cross(up).normalize();
        const u = s.cross(f);

        const m = Mat4.identity();
        m.m[0] = s.x; m.m[4] = s.y; m.m[8]  = s.z;
        m.m[1] = u.x; m.m[5] = u.y; m.m[9]  = u.z;
        m.m[2] = -f.x; m.m[6] = -f.y; m.m[10] = -f.z;
        m.m[12] = -s.dot(eye);
        m.m[13] = -u.dot(eye);
        m.m[14] = f.dot(eye);
        return m;
    }
}

// Export
export { Vec3, Vec4, Mat4, LINALG_EPSILON };
