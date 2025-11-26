// glmInspired.js — a cglmInspired-inspired JavaScript math utility (single file)
// Column-major layout, Float32Array for performance
// All functions are pure unless an 'out' buffer is provided

const glmInspired = {};

// ─── VEC3 ─────────────────────────────────────

glmInspired.vec3 = {
  zero: () => new Float32Array(3),

  set: (out, x, y, z) => {
    out[0] = x; out[1] = y; out[2] = z;
    return out;
  },

  add: (a, b, out = new Float32Array(3)) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
  },

  sub: (a, b, out = new Float32Array(3)) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  },

  scale: (v, s, out = new Float32Array(3)) => {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    out[2] = v[2] * s;
    return out;
  },

  length: (v) => Math.hypot(v[0], v[1], v[2]),

  normalize: (v, out = new Float32Array(3)) => {
    const len = glmInspired.vec3.length(v);
    if (len === 0) return glmInspired.vec3.zero();
    return glmInspired.vec3.scale(v, 1 / len, out);
  },

  cross: (a, b, out = new Float32Array(3)) => {
    out[0] = a[1] * b[2] - a[2] * b[1];
    out[1] = a[2] * b[0] - a[0] * b[2];
    out[2] = a[0] * b[1] - a[1] * b[0];
    return out;
  },

  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
};

// ─── QUAT ─────────────────────────────────────

glmInspired.quat = {
  identity: () => new Float32Array([0, 0, 0, 1]),

  fromAxisAngle: (axis, rad, out = new Float32Array(4)) => {
    const half = rad * 0.5;
    const s = Math.sin(half);
    const c = Math.cos(half);
    const norm = glmInspired.vec3.length(axis);
    if (norm === 0) return glmInspired.quat.identity();
    const inv = 1 / norm;
    out[0] = axis[0] * inv * s;
    out[1] = axis[1] * inv * s;
    out[2] = axis[2] * inv * s;
    out[3] = c;
    return out;
  },

  multiply: (q1, q2, out = new Float32Array(4)) => {
    const [x1, y1, z1, w1] = q1;
    const [x2, y2, z2, w2] = q2;
    out[0] = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2;
    out[1] = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2;
    out[2] = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2;
    out[3] = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    return out;
  },

  rotateX: (q, rad, out) => {
    const ax = new Float32Array([1, 0, 0]);
    const r = glmInspired.quat.fromAxisAngle(ax, rad);
    return glmInspired.quat.multiply(q, r, out);
  },
  rotateY: (q, rad, out) => {
    const ax = new Float32Array([0, 1, 0]);
    const r = glmInspired.quat.fromAxisAngle(ax, rad);
    return glmInspired.quat.multiply(q, r, out);
  },
  rotateZ: (q, rad, out) => {
    const ax = new Float32Array([0, 0, 1]);
    const r = glmInspired.quat.fromAxisAngle(ax, rad);
    return glmInspired.quat.multiply(q, r, out);
  },
};

// ─── MAT4 ─────────────────────────────────────

glmInspired.mat4 = {
  identity: () => {
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  },

  // Column-major: translation in elements [12], [13], [14]
  translate: (m, v, out = new Float32Array(16)) => {
    out.set(m);
    out[12] += m[0] * v[0] + m[4] * v[1] + m[8] * v[2];
    out[13] += m[1] * v[0] + m[5] * v[1] + m[9] * v[2];
    out[14] += m[2] * v[0] + m[6] * v[1] + m[10] * v[2];
    return out;
  },

  // Scale columns 0,1,2 by sx,sy,sz
  scale: (m, v, out = new Float32Array(16)) => {
    const [sx, sy, sz] = v;
    out.set(m);
    out[0] *= sx; out[1] *= sx; out[2] *= sx; out[3] *= sx;
    out[4] *= sy; out[5] *= sy; out[6] *= sy; out[7] *= sy;
    out[8] *= sz; out[9] *= sz; out[10] *= sz; out[11] *= sz;
    return out;
  },

  rotate: (m, rad, axis, out = new Float32Array(16)) => {
    const q = glmInspired.quat.fromAxisAngle(axis, rad);
    return glmInspired.mat4.fromQuat(m, q, out);
  },

  fromQuat: (m, q, out = new Float32Array(16)) => {
    const [x, y, z, w] = q;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;

    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;

    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;

    out[12] = m[12];
    out[13] = m[13];
    out[14] = m[14];
    out[15] = m[15];
    return out;
  },

  perspective: (fovy, aspect, near, far, out = new Float32Array(16)) => {
    const f = 1.0 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) / (near - far);
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) / (near - far);
    out[15] = 0;
    return out;
  },

  lookAt: (eye, center, up, out = new Float32Array(16)) => {
    const f = glmInspired.vec3.normalize(glmInspired.vec3.sub(center, eye));
    const s = glmInspired.vec3.normalize(glmInspired.vec3.cross(f, up));
    const u = glmInspired.vec3.cross(s, f);

    out[0] = s[0]; out[4] = s[1]; out[8] = s[2]; out[12] = -glmInspired.vec3.dot(s, eye);
    out[1] = u[0]; out[5] = u[1]; out[9] = u[2]; out[13] = -glmInspired.vec3.dot(u, eye);
    out[2] = -f[0]; out[6] = -f[1]; out[10] = -f[2]; out[14] = glmInspired.vec3.dot(f, eye);
    out[3] = 0; out[7] = 0; out[11] = 0; out[15] = 1;
    return out;
  },

  multiply: (a, b, out = new Float32Array(16)) => {
    // Standard matrix multiply: out = a * b (column-major)
    for (let i = 0; i < 4; i++) {
      const a0 = a[i], a1 = a[i + 4], a2 = a[i + 8], a3 = a[i + 12];
      out[i]      = a0 * b[0] + a1 * b[1] + a2 * b[2] + a3 * b[3];
      out[i + 4]  = a0 * b[4] + a1 * b[5] + a2 * b[6] + a3 * b[7];
      out[i + 8]  = a0 * b[8] + a1 * b[9] + a2 * b[10] + a3 * b[11];
      out[i + 12] = a0 * b[12] + a1 * b[13] + a2 * b[14] + a3 * b[15];
    }
    return out;
  },
};

export default glmInspired
