// linearAlgebraPlugin.js
// Zero-dependency, chainable 2D/3D/4D vectors + 3×3 / 4×4 matrices
// Drops into canvas_util.js as app.linalg

export function linearAlgebraPlugin(app) {
    const PI = Math.PI;
    const DEG = PI / 180;

    /* ---------- tiny private helpers ---------- */
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const EPS = 1e-6;
    const approx = (a, b) => Math.abs(a - b) < EPS;

    /* ---------- Vector2 ---------- */
    class Vector2 {
        constructor(x = 0, y = 0) { this.x = x; this.y = y; }
        static fromAngle(a, len = 1) { return new Vector2(Math.cos(a) * len, Math.sin(a) * len); }
        clone() { return new Vector2(this.x, this.y); }
        set(x, y) { this.x = x; this.y = y; return this; }
        add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
        sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
        mul(s) { return new Vector2(this.x * s, this.y * s); }
        dot(v) { return this.x * v.x + this.y * v.y; }
        cross(v) { return this.x * v.y - this.y * v.x; }
        len2() { return this.x * this.x + this.y * this.y; }
        len() { return Math.hypot(this.x, this.y); }
        norm() { const l = this.len() || 1; return new Vector2(this.x / l, this.y / l); }
        rotate(a) { const c = Math.cos(a), s = Math.sin(a); return new Vector2(this.x * c - this.y * s, this.x * s + this.y * c); }
        lerp(v, t) { return this.add(v.sub(this).mul(clamp(t, 0, 1))); }
        toString() { return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`; }
    }

    /* ---------- Vector3 ---------- */
    class Vector3 {
        constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
        clone() { return new Vector3(this.x, this.y, this.z); }
        set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
        add(v) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
        sub(v) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
        mul(s) { return new Vector3(this.x * s, this.y * s, this.z * s); }
        dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
        cross(v) {
            return new Vector3(
                this.y * v.z - this.z * v.y,
                this.z * v.x - this.x * v.z,
                this.x * v.y - this.y * v.x
            );
        }
        len2() { return this.x * this.x + this.y * this.y + this.z * this.z; }
        len() { return Math.sqrt(this.len2()); }
        norm() { const l = this.len() || 1; return new Vector3(this.x / l, this.y / l, this.z / l); }
        lerp(v, t) { return this.add(v.sub(this).mul(clamp(t, 0, 1))); }
        toString() { return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`; }
    }

    /* ---------- Vector4 ---------- */
    class Vector4 {
        constructor(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; }
        clone() { return new Vector4(this.x, this.y, this.z, this.w); }
        add(v) { return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w); }
        sub(v) { return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w); }
        mul(s) { return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s); }
        dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w; }
        len2() { return this.dot(this); }
        len() { return Math.sqrt(this.len2()); }
        norm() { const l = this.len() || 1; return new Vector4(this.x / l, this.y / l, this.z / l, this.w / l); }
        toString() { return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, ${this.w.toFixed(2)})`; }
    }

    /* ---------- Matrix3 ---------- */
    class Matrix3 extends Float32Array {
        constructor() { super(9); this.setIdentity(); }
        setIdentity() {
            for (let i = 0; i < 9; i++) this[i] = i % 4 === 0 ? 1 : 0;
            return this;
        }
        clone() { const m = new Matrix3(); m.set(this); return m; }
        translate(x, y) { return this.multiply(Matrix3.translation(x, y)); }
        rotate(a) { return this.multiply(Matrix3.rotation(a)); }
        scale(x, y = x) { return this.multiply(Matrix3.scaling(x, y)); }
        multiply(b) {
            const a = this.clone();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let sum = 0;
                    for (let k = 0; k < 3; k++) sum += a[i * 3 + k] * b[k * 3 + j];
                    this[i * 3 + j] = sum;
                }
            }
            return this;
        }
        transformVector2(v) {
            const x = v.x, y = v.y;
            return new Vector2(
                this[0] * x + this[3] * y + this[6],
                this[1] * x + this[4] * y + this[7]
            );
        }
        static translation(x, y) {
            const m = new Matrix3();
            m[6] = x; m[7] = y;
            return m;
        }
        static rotation(a) {
            const m = new Matrix3();
            const c = Math.cos(a), s = Math.sin(a);
            m[0] = c; m[1] = s;
            m[3] = -s; m[4] = c;
            return m;
        }
        static scaling(x, y) {
            const m = new Matrix3();
            m[0] = x; m[4] = y;
            return m;
        }
    }

    /* ---------- Matrix4 ---------- */
    class Matrix4 extends Float32Array {
        constructor() { super(16); this.setIdentity(); }
        setIdentity() {
            for (let i = 0; i < 16; i++) this[i] = i % 5 === 0 ? 1 : 0;
            return this;
        }
        clone() { const m = new Matrix4(); m.set(this); return m; }
        multiply(b) {
            const a = this.clone();
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let sum = 0;
                    for (let k = 0; k < 4; k++) sum += a[i * 4 + k] * b[k * 4 + j];
                    this[i * 4 + j] = sum;
                }
            }
            return this;
        }
        translate(x, y, z) { return this.multiply(Matrix4.translation(x, y, z)); }
        rotateX(a) { return this.multiply(Matrix4.rotationX(a)); }
        rotateY(a) { return this.multiply(Matrix4.rotationY(a)); }
        rotateZ(a) { return this.multiply(Matrix4.rotationZ(a)); }
        scale(x, y = x, z = x) { return this.multiply(Matrix4.scaling(x, y, z)); }
        perspective(fovDeg, aspect, near, far) {
            return this.multiply(Matrix4.perspective(fovDeg, aspect, near, far));
        }
        lookAt(eye, center, up) {
            return this.multiply(Matrix4.lookAt(eye, center, up));
        }
        transformVector3(v) {
            const x = v.x, y = v.y, z = v.z;
            const w = this[3] * x + this[7] * y + this[11] * z + this[15];
            if (approx(w, 1)) {
                return new Vector3(
                    this[0] * x + this[4] * y + this[8] * z + this[12],
                    this[1] * x + this[5] * y + this[9] * z + this[13],
                    this[2] * x + this[6] * y + this[10] * z + this[14]
                );
            }
            const inv = 1 / w;
            return new Vector3(
                (this[0] * x + this[4] * y + this[8] * z + this[12]) * inv,
                (this[1] * x + this[5] * y + this[9] * z + this[13]) * inv,
                (this[2] * x + this[6] * y + this[10] * z + this[14]) * inv
            );
        }
        static translation(x, y, z) {
            const m = new Matrix4();
            m[12] = x; m[13] = y; m[14] = z;
            return m;
        }
        static rotationX(a) {
            const m = new Matrix4();
            const c = Math.cos(a), s = Math.sin(a);
            m[5] = c; m[6] = s;
            m[9] = -s; m[10] = c;
            return m;
        }
        static rotationY(a) {
            const m = new Matrix4();
            const c = Math.cos(a), s = Math.sin(a);
            m[0] = c; m[2] = -s;
            m[8] = s; m[10] = c;
            return m;
        }
        static rotationZ(a) {
            const m = new Matrix4();
            const c = Math.cos(a), s = Math.sin(a);
            m[0] = c; m[1] = s;
            m[4] = -s; m[5] = c;
            return m;
        }
        static scaling(x, y = x, z = x) {
            const m = new Matrix4();
            m[0] = x; m[5] = y; m[10] = z;
            return m;
        }
        static perspective(fovDeg, aspect, near, far) {
            const f = 1 / Math.tan((fovDeg * DEG) / 2);
            const m = new Matrix4();
            m[0] = f / aspect;
            m[5] = f;
            m[10] = (far + near) / (near - far);
            m[11] = -1;
            m[14] = (2 * far * near) / (near - far);
            m[15] = 0;
            return m;
        }
        static lookAt(eye, center, up) {
            const f = center.sub(eye).norm();
            const s = f.cross(up.norm()).norm();
            const u = s.cross(f);
            const m = new Matrix4();
            m[0] = s.x; m[4] = s.y; m[8] = s.z; m[12] = -s.dot(eye);
            m[1] = u.x; m[5] = u.y; m[9] = u.z; m[13] = -u.dot(eye);
            m[2] = -f.x; m[6] = -f.y; m[10] = -f.z; m[14] = f.dot(eye);
            m[15] = 1;
            return m;
        }
    }

    /* ---------- Quat (tiny quaternion wrapper) ---------- */
    const Quat = {
        identity: () => ({ x: 0, y: 0, z: 0, w: 1 }),
        fromAxisAngle(axis, angle) {
            const half = angle * 0.5;
            const s = Math.sin(half);
            const n = axis.norm();
            return { x: n.x * s, y: n.y * s, z: n.z * s, w: Math.cos(half) };
        },
        toMat4(q) {
            const { x, y, z, w } = q;
            const xx = x * x, yy = y * y, zz = z * z, ww = w * w;
            const xy = x * y, xz = x * z, yz = y * z;
            const wx = w * x, wy = w * y, wz = w * z;
            const m = new Matrix4();
            m[0] = xx - yy - zz + ww; m[4] = 2 * (xy - wz); m[8] = 2 * (xz + wy);
            m[1] = 2 * (xy + wz); m[5] = -xx + yy - zz + ww; m[9] = 2 * (yz - wx);
            m[2] = 2 * (xz - wy); m[6] = 2 * (yz + wx); m[10] = -xx - yy + zz + ww;
            m[15] = 1;
            return m;
        }
    };

    /* ---------- Namespaced fast funcs ---------- */
    const Vec3 = {
        transformMat4(v, m) { return m.transformVector3(v); },
        distance(a, b) { return a.sub(b).len(); },
        lerp(a, b, t) { return a.lerp(b, t); }
    };
    const Mat4 = {
        identity: () => new Matrix4(),
        multiply: (a, b) => a.clone().multiply(b),
        perspective: Matrix4.perspective,
        lookAt: Matrix4.lookAt,
        fromQuaternion: Quat.toMat4
    };

    /* ---------- Plug into canvas_util ---------- */
    app.linalg = {
        Vector2, Vector3, Vector4, Matrix3, Matrix4,
        Vec3, Mat4, Quat,
        DEG, PI
    };

    console.log("linearAlgebraPlugin loaded — app.linalg ready");
}
