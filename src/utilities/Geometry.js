// Geometry and math utilities
const Geometry = {
  // Distance calculations
  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  // Angle between two points (in radians)
  angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  // Point in polygon check
  pointInPolygon(point, polygon) {
    const x = point.x, y = point.y;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    
    return inside;
  },

  // Line intersection
  lineIntersection(line1, line2) {
    const [a, b] = line1;
    const [c, d] = line2;
    
    const denominator = ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x));
    if (denominator === 0) return null; // Parallel lines
    
    const ua = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
    const ub = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;
    
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return {
        x: a.x + ua * (b.x - a.x),
        y: a.y + ua * (b.y - a.y)
      };
    }
    
    return null;
  },

  // Bounding box calculations
  getBoundingBox(points) {
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  },

  // Coordinate transformations
  rotatePoint(point, center, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = point.x - center.x;
    const y = point.y - center.y;
    
    return {
      x: x * cos - y * sin + center.x,
      y: x * sin + y * cos + center.y
    };
  },

  // Easing functions
  ease: {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  },

  // Clamping and interpolation
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }
};
