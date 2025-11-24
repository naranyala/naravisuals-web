class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  // --- Core operations ---
  clone() {
    return new Vector(this.x, this.y);
  }

  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  // Dot product
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  // Cross product (2D "scalar" version)
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  // Magnitude (length)
  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  // Squared magnitude (avoid sqrt for comparisons)
  magnitudeSq() {
    return this.x * this.x + this.y * this.y;
  }

  // Normalize
  normalize() {
    const mag = this.magnitude();
    return mag === 0 ? new Vector(0, 0) : this.scale(1 / mag);
  }

  // Rotate by angle (radians)
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  // --- Geometry helpers ---
  angle() {
    return Math.atan2(this.y, this.x);
  }

  distance(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  lerp(other, t) {
    return new Vector(
      this.x + (other.x - this.x) * t,
      this.y + (other.y - this.y) * t
    );
  }

  // --- Utility ---
  equals(other, epsilon = 1e-9) {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon
    );
  }

  toArray() {
    return [this.x, this.y];
  }

  toString() {
    return `(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
  }
}

export default Vector;

