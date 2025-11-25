// shapes2d.js - A lightweight 2D shapes utility library for JavaScript
// Inspired by shapes2d.h (C single-header library)
// Zero dependencies · Works in Node.js and browsers

const ShapeType = {
  POINT: 'point',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  TRIANGLE: 'triangle',
  LINE: 'line'
};

class Point2D {
  constructor(x = 0, y = 0) {
    this.x = Number(x);
    this.y = Number(y);
  }

  toString() {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  clone() {
    return new Point2D(this.x, this.y);
  }

  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.hypot(dx, dy);
  }
}

class Shape2D {
  constructor(type, data) {
    this.type = type;      // one of ShapeType.*
    this.data = data;      // shape-specific object
  }

  // Factory methods (mirroring the C API)
  static point(p) {
    return new Shape2D(ShapeType.POINT, p.clone());
  }

  static circle(center, radius) {
    if (radius < 0) throw new Error('Radius cannot be negative');
    return new Shape2D(ShapeType.CIRCLE, { center: center.clone(), radius });
  }

  static rectangle(bottomLeft, width, height) {
    if (width < 0 || height < 0) throw new Error('Width and height must be non-negative');
    return new Shape2D(ShapeType.RECTANGLE, {
      bottomLeft: bottomLeft.clone(),
      width,
      height
    });
  }

  static triangle(a, b, c) {
    return new Shape2D(ShapeType.TRIANGLE, {
      a: a.clone(),
      b: b.clone(),
      c: c.clone()
    });
  }

  static line(start, end) {
    return new Shape2D(ShapeType.LINE, {
      start: start.clone(),
      end: end.clone()
    });
  }

  // Utility: make a point (like C's make_point)
  static makePoint(x, y) {
    return new Point2D(x, y);
  }

  // Core methods
  area() {
    switch (this.type) {
      case ShapeType.CIRCLE: {
        const { radius } = this.data;
        return Math.PI * radius * radius;
      }
      case ShapeType.RECTANGLE: {
        const { width, height } = this.data;
        return width * height;
      }
      case ShapeType.TRIANGLE: {
        const { a, b, c } = this.data;
        return 0.5 * Math.abs(
          (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
        );
      }
      case ShapeType.POINT:
      case ShapeType.LINE:
        return 0;
      default:
        return NaN;
    }
  }

  perimeter() {
    switch (this.type) {
      case ShapeType.CIRCLE: {
        const { radius } = this.data;
        return 2 * Math.PI * radius;
      }
      case ShapeType.RECTANGLE: {
        const { width, height } = this.data;
        return 2 * (width + height);
      }
      case ShapeType.TRIANGLE: {
        const { a, b, c } = this.data;
        const ab = a.distanceTo(b);
        const bc = b.distanceTo(c);
        const ca = c.distanceTo(a);
        return ab + bc + ca;
      }
      case ShapeType.LINE: {
        const { start, end } = this.data;
        return start.distanceTo(end);
      }
      case ShapeType.POINT:
        return 0;
      default:
        return NaN;
    }
  }

  isPointInside(point) {
    const p = point instanceof Point2D ? point : new Point2D(point.x, point.y);

    switch (this.type) {
      case ShapeType.CIRCLE: {
        const { center, radius } = this.data;
        return center.distanceTo(p) <= radius + 1e-10;
      }
      case ShapeType.RECTANGLE: {
        const { bottomLeft, width, height } = this.data;
        return p.x >= bottomLeft.x &&
               p.x <= bottomLeft.x + width &&
               p.y >= bottomLeft.y &&
               p.y <= bottomLeft.y + height;
      }
      case ShapeType.TRIANGLE: {
        const { a, b, c } = this.data;
        // Barycentric coordinates
        const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
        if (Math.abs(denom) < 1e-10) return false;

        const alpha = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denom;
        const beta  = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denom;
        const gamma = 1 - alpha - beta;

        return alpha >= 0 && beta >= 0 && gamma >= 0 &&
               alpha <= 1 && beta <= 1 && gamma <= 1;
      }
      case ShapeType.POINT: {
        const target = this.data;
        return Math.abs(p.x - target.x) < 1e-10 && Math.abs(p.y - target.y) < 1e-10;
      }
      case ShapeType.LINE:
        return false; // lines have no interior
      default:
        return false;
    }
  }

  print() {
    switch (this.type) {
      case ShapeType.POINT:
        console.log(`Point: ${this.data}`);
        break;
      case ShapeType.CIRCLE:
        console.log(`Circle: Center${this.data.center} Radius: ${this.data.radius.toFixed(2)}`);
        break;
      case ShapeType.RECTANGLE:
        const r = this.data;
        console.log(`Rectangle: BottomLeft${r.bottomLeft} W:${r.width.toFixed(2)} H:${r.height.toFixed(2)}`);
        break;
      case ShapeType.TRIANGLE:
        const t = this.data;
        console.log(`Triangle: A${t.a} B${t.b} C${t.c}`);
        break;
      case ShapeType.LINE:
        const l = this.data;
        console.log(`Line: Start${l.start} End${l.end}`);
        break;
    }
  }

  // Optional: explicit cleanup (useful in long-running environments)
  destroy() {
    this.data = null;
  }

  // Helper: clone the entire shape
  clone() {
    let dataCopy;
    switch (this.type) {
      case ShapeType.POINT:
        dataCopy = this.data.clone();
        break;
      case ShapeType.CIRCLE:
        dataCopy = { center: this.data.center.clone(), radius: this.data.radius };
        break;
      case ShapeType.RECTANGLE:
        dataCopy = {
          bottomLeft: this.data.bottomLeft.clone(),
          width: this.data.width,
          height: this.data.height
        };
        break;
      case ShapeType.TRIANGLE:
        dataCopy = {
          a: this.data.a.clone(),
          b: this.data.b.clone(),
          c: this.data.c.clone()
        };
        break;
      case ShapeType.LINE:
        dataCopy = { start: this.data.start.clone(), end: this.data.end.clone() };
        break;
    }
    return new Shape2D(this.type, dataCopy);
  }
}

export { 
    Shape2D, 
    Point2D, 
    ShapeType 
}
