// shapes3d.js - Lightweight 3D shapes library for JavaScript
// Faithful port of shapes3d.h (single-header C library)
// Works in Node.js, browsers, and any JS environment

const Shape3DType = {
  POINT: 'point',
  SPHERE: 'sphere',
  CUBE: 'cube',
  CYLINDER: 'cylinder',
  CONE: 'cone',
  PYRAMID: 'pyramid',
  TETRAHEDRON: 'tetrahedron'
};

class Point3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
  }

  toString() {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }

  clone() {
    return new Point3D(this.x, this.y, this.z);
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const dz = this.z - other.z;
    return Math.hypot(dx, dy, dz);
  }

  subtract(other) {
    return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other) {
    return new Point3D(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  length() {
    return Math.hypot(this.x, this.y, this.z);
  }
}

class Shape3D {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }

  // Factory methods — mirror the original C API
  static point(p) {
    return new Shape3D(Shape3DType.POINT, p.clone());
  }

  static sphere(center, radius) {
    if (radius < 0) throw new Error('Radius cannot be negative');
    return new Shape3D(Shape3DType.SPHERE, { center: center.clone(), radius });
  }

  static cube(center, width, height, depth) {
    if (width < 0 || height < 0 || depth < 0) throw new Error('Dimensions must be non-negative');
    return new Shape3D(Shape3DType.CUBE, { center: center.clone(), width, height, depth });
  }

  static cylinder(baseCenter, radius, height) {
    if (radius < 0 || height < 0) throw new Error('Radius/height cannot be negative');
    return new Shape3D(Shape3DType.CYLINDER, { baseCenter: baseCenter.clone(), radius, height });
  }

  static cone(baseCenter, radius, height) {
    if (radius < 0 || height < 0) throw new Error('Radius/height cannot be negative');
    return new Shape3D(Shape3DType.CONE, { baseCenter: baseCenter.clone(), radius, height });
  }

  static pyramid(baseCenter, baseWidth, baseDepth, height) {
    if (baseWidth < 0 || baseDepth < 0 || height < 0) throw new Error('Dimensions must be non-negative');
    return new Shape3D(Shape3DType.PYRAMID, { baseCenter: baseCenter.clone(), baseWidth, baseDepth, height });
  }

  static tetrahedron(a, b, c, d) {
    return new Shape3D(Shape3DType.TETRAHEDRON, {
      a: a.clone(), b: b.clone(), c: c.clone(), d: d.clone()
    });
  }

  static makePoint(x, y, z) {
    return new Point3D(x, y, z);
  }

  // Core calculations
  volume() {
    switch (this.type) {
      case Shape3DType.SPHERE: {
        const { radius } = this.data;
        return (4 / 3) * Math.PI * radius ** 3;
      }
      case Shape3DType.CUBE: {
        const { width, height, depth } = this.data;
        return width * height * depth;
      }
      case Shape3DType.CYLINDER: {
        const { radius, height } = this.data;
        return Math.PI * radius ** 2 * height;
      }
      case Shape3DType.CONE: {
        const { radius, height } = this.data;
        return (1 / 3) * Math.PI * radius ** 2 * height;
      }
      case Shape3DType.PYRAMID: {
        const { baseWidth, baseDepth, height } = this.data;
        return (1 / 3) * baseWidth * baseDepth * height;
      }
      case Shape3DType.TETRAHEDRON: {
        const { a, b, c, d } = this.data;
        const ab = b.subtract(a);
        const ac = c.subtract(a);
        const ad = d.subtract(a);

        // Fixed: Correct cross product calculation
        const cross = ac.cross(ad);
        const scalarTriple = ab.dot(cross);
        
        return Math.abs(scalarTriple) / 6;
      }
      case Shape3DType.POINT:
        return 0;
      default:
        return NaN;
    }
  }

  surfaceArea() {
    switch (this.type) {
      case Shape3DType.SPHERE: {
        const { radius } = this.data;
        return 4 * Math.PI * radius ** 2;
      }
      case Shape3DType.CUBE: {
        const { width, height, depth } = this.data;
        return 2 * (width * height + width * depth + height * depth);
      }
      case Shape3DType.CYLINDER: {
        const { radius, height } = this.data;
        return 2 * Math.PI * radius * (radius + height);
      }
      case Shape3DType.CONE: {
        const { radius, height } = this.data;
        const slant = Math.hypot(radius, height);
        return Math.PI * radius * (radius + slant);
      }
      case Shape3DType.PYRAMID: {
        const { baseWidth, baseDepth, height } = this.data;
        const halfW = baseWidth / 2;
        const halfD = baseDepth / 2;
        const base = baseWidth * baseDepth;

        // Fixed: Correct calculation for all 4 triangular faces
        const slantW = Math.hypot(halfD, height);
        const slantD = Math.hypot(halfW, height);

        // Two faces with base baseWidth, two faces with base baseDepth
        const sideArea = baseWidth * slantW + baseDepth * slantD;
        return base + sideArea;
      }
      case Shape3DType.TETRAHEDRON: {
        const { a, b, c, d } = this.data;
        return this._triangleArea(a, b, c) +
               this._triangleArea(a, b, d) +
               this._triangleArea(a, c, d) +
               this._triangleArea(b, c, d);
      }
      case Shape3DType.POINT:
        return 0;
      default:
        return NaN;
    }
  }

  // Helper for tetrahedron face area
  _triangleArea(p1, p2, p3) {
    const ab = p2.subtract(p1);
    const ac = p3.subtract(p1);
    const cross = ab.cross(ac);
    return 0.5 * cross.length();
  }

  isPointInside(point) {
    const p = point instanceof Point3D ? point : new Point3D(point.x, point.y, point.z);
    const EPSILON = 1e-9; // Fixed: Better epsilon value

    switch (this.type) {
      case Shape3DType.SPHERE: {
        const { center, radius } = this.data;
        return center.distanceTo(p) <= radius + EPSILON;
      }
      case Shape3DType.CUBE: {
        const { center, width, height, depth } = this.data;
        const hw = width / 2, hh = height / 2, hd = depth / 2;
        return Math.abs(p.x - center.x) <= hw + EPSILON &&
               Math.abs(p.y - center.y) <= hh + EPSILON &&
               Math.abs(p.z - center.z) <= hd + EPSILON;
      }
      case Shape3DType.CYLINDER: {
        const { baseCenter, radius, height } = this.data;
        if (p.y < baseCenter.y - EPSILON || p.y > baseCenter.y + height + EPSILON) return false;
        const dx = p.x - baseCenter.x;
        const dz = p.z - baseCenter.z;
        return (dx * dx + dz * dz) <= radius * radius + EPSILON;
      }
      case Shape3DType.CONE: {
        const { baseCenter, radius, height } = this.data;
        if (p.y < baseCenter.y - EPSILON || p.y > baseCenter.y + height + EPSILON) return false;
        const ratio = (p.y - baseCenter.y) / height;
        const currentRadius = radius * (1 - ratio);
        const dx = p.x - baseCenter.x;
        const dz = p.z - baseCenter.z;
        return (dx * dx + dz * dz) <= currentRadius * currentRadius + EPSILON;
      }
      case Shape3DType.PYRAMID: {
        const { baseCenter, baseWidth, baseDepth, height } = this.data;
        if (p.y < baseCenter.y - EPSILON || p.y > baseCenter.y + height + EPSILON) return false;
        const ratio = (p.y - baseCenter.y) / height;
        const w = baseWidth * (1 - ratio);
        const d = baseDepth * (1 - ratio);
        const hw = w / 2, hd = d / 2;
        return Math.abs(p.x - baseCenter.x) <= hw + EPSILON && 
               Math.abs(p.z - baseCenter.z) <= hd + EPSILON;
      }
      case Shape3DType.TETRAHEDRON: {
        // Fixed: Proper tetrahedron point-inside test using determinants
        const { a, b, c, d } = this.data;
        
        // Helper to compute signed volume of tetrahedron
        const signedVolume = (p1, p2, p3, p4) => {
          const v1 = p2.subtract(p1);
          const v2 = p3.subtract(p1);
          const v3 = p4.subtract(p1);
          return v1.dot(v2.cross(v3)) / 6;
        };

        // Point is inside if it's on the same side of all 4 faces
        const v0 = signedVolume(a, b, c, d);
        const v1 = signedVolume(p, b, c, d);
        const v2 = signedVolume(a, p, c, d);
        const v3 = signedVolume(a, b, p, d);
        const v4 = signedVolume(a, b, c, p);

        // All must have same sign as v0 (or be zero within epsilon)
        const sign = Math.sign(v0);
        return Math.sign(v1) === sign && Math.sign(v2) === sign && 
               Math.sign(v3) === sign && Math.sign(v4) === sign;
      }
      case Shape3DType.POINT: {
        const target = this.data;
        return Math.abs(p.x - target.x) < EPSILON &&
               Math.abs(p.y - target.y) < EPSILON &&
               Math.abs(p.z - target.z) < EPSILON;
      }
      default:
        return false;
    }
  }

  print() {
    const fmt = (n) => n.toFixed(2);
    switch (this.type) {
      case Shape3DType.POINT:
        console.log(`Point3D: ${this.data}`);
        break;
      case Shape3DType.SPHERE:
        console.log(`Sphere: Center${this.data.center} Radius: ${fmt(this.data.radius)}`);
        break;
      case Shape3DType.CUBE:
        const c = this.data;
        console.log(`Cube: Center${c.center} W:${fmt(c.width)} H:${fmt(c.height)} D:${fmt(c.depth)}`);
        break;
      case Shape3DType.CYLINDER:
        const cy = this.data;
        console.log(`Cylinder: Base${cy.baseCenter} R:${fmt(cy.radius)} H:${fmt(cy.height)}`);
        break;
      case Shape3DType.CONE:
        const co = this.data;
        console.log(`Cone: Base${co.baseCenter} R:${fmt(co.radius)} H:${fmt(co.height)}`);
        break;
      case Shape3DType.PYRAMID:
        const py = this.data;
        console.log(`Pyramid: Base${py.baseCenter} W:${fmt(py.baseWidth)} D:${fmt(py.baseDepth)} H:${fmt(py.height)}`);
        break;
      case Shape3DType.TETRAHEDRON:
        const t = this.data;
        console.log(`Tetrahedron:\n A${t.a}\n B${t.b}\n C${t.c}\n D${t.d}`);
        break;
    }
  }

  clone() {
    // Deep clone shape-specific data
    let data;
    switch (this.type) {
      case Shape3DType.POINT: data = this.data.clone(); break;
      case Shape3DType.SPHERE: data = { center: this.data.center.clone(), radius: this.data.radius }; break;
      case Shape3DType.CUBE: data = { center: this.data.center.clone(), width: this.data.width, height: this.data.height, depth: this.data.depth }; break;
      case Shape3DType.CYLINDER:
      case Shape3DType.CONE: data = { baseCenter: this.data.baseCenter.clone(), radius: this.data.radius, height: this.data.height }; break;
      case Shape3DType.PYRAMID: data = { baseCenter: this.data.baseCenter.clone(), baseWidth: this.data.baseWidth, baseDepth: this.data.baseDepth, height: this.data.height }; break;
      case Shape3DType.TETRAHEDRON:
        data = { a: this.data.a.clone(), b: this.data.b.clone(), c: this.data.c.clone(), d: this.data.d.clone() }; break;
    }
    return new Shape3D(this.type, data);
  }
}

export { 
  Shape3D, 
  Point3D, 
  Shape3DType 
}
