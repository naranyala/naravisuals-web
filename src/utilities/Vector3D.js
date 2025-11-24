// Vector3D.js
class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // --- Core operations ---
  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }

  add(other) {
    return new Vector3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other) {
    return new Vector3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(scalar) {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  // Dot product
  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  // Cross product
  cross(other) {
    return new Vector3D(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  // Magnitude (length)
  magnitude() {
    return Math.hypot(this.x, this.y, this.z);
  }

  magnitudeSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? new Vector3D(0, 0, 0) : this.scale(1 / mag);
  }

  // --- Transformations ---
  rotateX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector3D(
      this.x,
      this.y * cos - this.z * sin,
      this.y * sin + this.z * cos
    );
  }

  rotateY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector3D(
      this.x * cos + this.z * sin,
      this.y,
      -this.x * sin + this.z * cos
    );
  }

  rotateZ(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector3D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos,
      this.z
    );
  }

  // --- Geometry helpers ---
  distance(other) {
    return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  lerp(other, t) {
    return new Vector3D(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t,
      this.z + (other.z - this.z) * t
    );
  }

  equals(other, epsilon = 1e-9) {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon
    );
  }

  // --- Projection ---
  project(fov = 500, viewerDistance = 5) {
    const factor = fov / (viewerDistance + this.z);
    return {
      x: this.x * factor,
      y: this.y * factor,
    };
  }

  // --- Utility ---
  toArray() {
    return [this.x, this.y, this.z];
  }

  toString() {
    return `(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
  }

  // --- Static constructors ---
  static zero() { return new Vector3D(0, 0, 0); }
  static unitX() { return new Vector3D(1, 0, 0); }
  static unitY() { return new Vector3D(0, 1, 0); }
  static unitZ() { return new Vector3D(0, 0, 1); }
}

export default Vector3D;

