// geometryPlugin.js — Live, editable, procedural 2D geometry
// A comprehensive plugin for creating, manipulating, and rendering geometric shapes

export function geometryPlugin(app) {

    // ==========================================
    // CORE PRIMITIVES
    // ==========================================

    // Factory functions for creating geometric primitives
    const Point = (x = 0, y = 0) => ({ x, y });
    const Vector = (x = 0, y = 0) => app.Vector2(x, y);
    const Rectangle = (x = 0, y = 0, w = 0, h = 0) => ({ x, y, w, h });
    const Circle = (x = 0, y = 0, r = 0) => ({ x, y, r });
    const Line = (a = Point(), b = Point()) => ({ a, b });
    const Polygon = (points = []) => points.map(p =>
        typeof p.x === 'number' ? p : Point(...p)
    );
    const Arc = (x = 0, y = 0, r = 0, start = 0, end = Math.PI * 2, ccw = false) =>
        ({ x, y, r, start, end, ccw });

    // ==========================================
    // MATH HELPER FUNCTIONS (Added missing functions)
    // ==========================================

    // Point in polygon test (ray casting algorithm)
    function pointInPolygon(point, polygon) {
        const x = point.x;
        const y = point.y;
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) inside = !inside;
        }

        return inside;
    }

    // Calculate polygon area (signed)
    function polygonArea(polygon) {
        let area = 0;
        const n = polygon.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += polygon[i].x * polygon[j].y;
            area -= polygon[j].x * polygon[i].y;
        }

        return area / 2;
    }

    // ==========================================
    // RENDERING FUNCTIONS
    // ==========================================

    const draw = {
        // Draw a polygon (closed or open)
        poly: (poly, options = {}) => {
            const { closed = true, fill, stroke, width = 2 } = options;

            const drawable = app.root.add({
                points: poly,
                closed,
                fill,
                stroke,
                width,
                geometryType: 'poly', // Changed from 'type' to 'geometryType'

                draw(ctx) {
                    if (!this.points.length) return;

                    ctx.beginPath();
                    ctx.moveTo(this.points[0].x, this.points[0].y);

                    for (const point of this.points) {
                        ctx.lineTo(point.x, point.y);
                    }

                    if (this.closed) ctx.closePath();

                    if (this.fill) {
                        ctx.fillStyle = this.fill;
                        ctx.fill();
                    }

                    if (this.stroke) {
                        ctx.strokeStyle = this.stroke;
                        ctx.lineWidth = this.width;
                        ctx.stroke();
                    }
                }
            });

            return drawable;
        },

        // Draw a circle
        circle: (circle, options = {}) => {
            const { fill, stroke, width = 2 } = options;

            const drawable = app.root.add({
                ...circle,
                fill,
                stroke,
                width,
                geometryType: 'circle', // Changed from 'type' to 'geometryType'

                draw(ctx) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);

                    if (this.fill) {
                        ctx.fillStyle = this.fill;
                        ctx.fill();
                    }

                    if (this.stroke) {
                        ctx.strokeStyle = this.stroke;
                        ctx.lineWidth = this.width;
                        ctx.stroke();
                    }
                }
            });

            return drawable;
        },

        // Draw a line
        line: (line, options = {}) => {
            const { stroke, width = 2 } = options;

            const drawable = app.root.add({
                ...line,
                stroke,
                width,
                geometryType: 'line', // Changed from 'type' to 'geometryType'

                draw(ctx) {
                    ctx.strokeStyle = this.stroke;
                    ctx.lineWidth = this.width;
                    ctx.beginPath();
                    ctx.moveTo(this.a.x, this.a.y);
                    ctx.lineTo(this.b.x, this.b.y);
                    ctx.stroke();
                }
            });

            return drawable;
        },

        // Draw an arc
        arc: (arc, options = {}) => {
            const { fill, stroke, width = 2 } = options;

            const drawable = app.root.add({
                ...arc,
                fill,
                stroke,
                width,
                geometryType: 'arc', // Changed from 'type' to 'geometryType'

                draw(ctx) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, this.start, this.end, this.ccw);

                    if (this.fill) {
                        ctx.fillStyle = this.fill;
                        ctx.fill();
                    }

                    if (this.stroke) {
                        ctx.strokeStyle = this.stroke;
                        ctx.lineWidth = this.width;
                        ctx.stroke();
                    }
                }
            });

            return drawable;
        },

        // Draw a point
        point: (point, options = {}) => {
            const { size = 3, color = '#fff' } = options;

            return app.root.add({
                ...point,
                size,
                color,
                geometryType: 'point',

                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    };

    // ==========================================
    // BOOLEAN OPERATIONS
    // ==========================================

    const booleanOps = {
        union: (polyA, polyB) => Polygon(clipperOperation(polyA, polyB, 'union')),
        difference: (polyA, polyB) => Polygon(clipperOperation(polyA, polyB, 'diff')),
        intersect: (polyA, polyB) => Polygon(clipperOperation(polyA, polyB, 'intersect')),
        xor: (polyA, polyB) => Polygon(clipperOperation(polyA, polyB, 'xor'))
    };

    // ==========================================
    // GEOMETRIC OPERATIONS
    // ==========================================

    // Offset a polygon by distance d (positive = expand, negative = shrink)
    function offset(poly, distance) {
        return Polygon(clipperOperation(poly, null, 'offset', distance));
    }

    // Triangulate a polygon using ear clipping
    function triangulate(poly) {
        const flatCoords = flattenPolygon(poly);
        const indices = earcutLib(flatCoords);
        return indices.map(i => poly[i]);
    }

    // Create hatch pattern fill for a polygon
    function hatch(poly, angle = Math.PI / 4, spacing = 10, options = {}) {
        const { stroke, width = 1 } = options;
        const bounds = getBounds(poly);
        const diagonal = Math.hypot(bounds.w, bounds.h);
        const centerX = bounds.x + bounds.w / 2;
        const centerY = bounds.y + bounds.h / 2;
        const lines = [];

        const HATCH_DIAGONAL = 500; // Maximum extent for hatch lines

        for (let i = -diagonal; i <= diagonal; i += spacing) {
            // Calculate start and end points of hatch line
            const startX = centerX + i * Math.cos(angle) - HATCH_DIAGONAL * Math.sin(angle);
            const startY = centerY + i * Math.sin(angle) + HATCH_DIAGONAL * Math.cos(angle);
            const endX = centerX + i * Math.cos(angle) + HATCH_DIAGONAL * Math.sin(angle);
            const endY = centerY + i * Math.sin(angle) - HATCH_DIAGONAL * Math.cos(angle);

            const start = Point(startX, startY);
            const end = Point(endX, endY);

            // Find intersections with polygon boundary
            const intersections = findSegmentPolygonIntersections(start, end, poly);

            // Draw lines between pairs of intersections
            for (let j = 0; j < intersections.length; j += 2) {
                if (intersections[j + 1]) {
                    const line = Line(intersections[j], intersections[j + 1]);
                    lines.push(draw.line(line, { stroke, width }));
                }
            }
        }

        return lines;
    }

    // ==========================================
    // INTERACTIVE HANDLES
    // ==========================================

    // Create draggable handles for editing geometry
    function createHandles(geometry, onChange) {
        const handles = [];
        const HANDLE_RADIUS = 5;

        // Extract control points based on geometry type
        const controlPoints = extractControlPoints(geometry);

        controlPoints.forEach((point, index) => {
            const handle = app.root.add({
                ...point,
                r: HANDLE_RADIUS,
                fill: '#0ff',
                stroke: '#000',
                width: 2,
                geometryType: 'handle',

                draw(ctx) {
                    ctx.fillStyle = this.fill;
                    ctx.strokeStyle = this.stroke;
                    ctx.lineWidth = this.width;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                },

                containsPoint(x, y) {
                    return Math.hypot(x - this.x, y - this.y) <= this.r;
                },

                drag(dx, dy) {
                    point.x += dx;
                    point.y += dy;
                    this.x = point.x;
                    this.y = point.y;
                    onChange(geometry);
                }
            });

            handles.push(handle);
        });

        return handles;
    }

    // ==========================================
    // HIT TESTING & BOUNDS
    // ==========================================

    // Calculate bounding box for a polygon
    function getBounds(poly) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const point of poly) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        return Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    // Check if point is inside polygon
    function containsPoint(poly, point) {
        return pointInPolygon(point, poly);
    }

    // Hit test for geometry at coordinates
    function hitTest(geometry, x, y) {
        if (geometry.geometryType === 'circle') {
            return Math.hypot(x - geometry.x, y - geometry.y) <= geometry.r;
        }
        if (geometry.geometryType === 'poly') {
            return containsPoint(geometry.points, Point(x, y));
        }
        return false;
    }

    // ==========================================
    // TRANSFORMATIONS
    // ==========================================

    // Deep clone geometry
    function clone(geometry) {
        return JSON.parse(JSON.stringify(geometry));
    }

    // Mirror polygon across axis
    function mirror(poly, axis = 'x', value = 0) {
        return poly.map(p => ({
            ...p,
            [axis]: 2 * value - p[axis]
        }));
    }

    // Rotate polygon around center point
    function rotate(poly, angle, center = Point()) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const cx = center.x;
        const cy = center.y;

        return poly.map(p => {
            const dx = p.x - cx;
            const dy = p.y - cy;
            return Point(
                cx + dx * cos - dy * sin,
                cy + dx * sin + dy * cos
            );
        });
    }

    // Scale polygon from center point
    function scale(poly, factor, center = Point()) {
        const cx = center.x;
        const cy = center.y;

        return poly.map(p => Point(
            cx + (p.x - cx) * factor,
            cy + (p.y - cy) * factor
        ));
    }

    // ==========================================
    // SERIALIZATION
    // ==========================================

    function save(geometry) {
        return JSON.stringify(geometry);
    }

    function load(jsonString) {
        return JSON.parse(jsonString);
    }

    // ==========================================
    // GEOMETRIC CALCULATIONS
    // ==========================================

    // Calculate centroid of polygon
    function getCentroid(poly) {
        let cx = 0;
        let cy = 0;
        let area = 0;

        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const p = poly[j];
            const q = poly[i];
            const cross = p.x * q.y - q.x * p.y;

            cx += (p.x + q.x) * cross;
            cy += (p.y + q.y) * cross;
            area += cross;
        }

        area *= 3;
        return Point(cx / area, cy / area);
    }

    // Calculate area of polygon
    function getArea(poly) {
        return Math.abs(polygonArea(poly));
    }

    // Calculate perimeter of polygon
    function getPerimeter(poly) {
        let length = 0;

        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const dx = poly[i].x - poly[j].x;
            const dy = poly[i].y - poly[j].y;
            length += Math.hypot(dx, dy);
        }

        return length;
    }

    // ==========================================
    // INTERNAL HELPERS
    // ==========================================

    // Flatten polygon to coordinate array for earcut
    function flattenPolygon(poly) {
        return poly.reduce((acc, point) => {
            acc.push(point.x, point.y);
            return acc;
        }, []);
    }

    // Extract control points based on geometry type
    function extractControlPoints(geometry) {
        switch (geometry.geometryType) {
            case 'poly':
                return geometry.points;
            case 'line':
                return [geometry.a, geometry.b];
            case 'circle':
            case 'arc':
                return [Point(geometry.x, geometry.y)];
            default:
                return [];
        }
    }

    // Stub for clipper library integration
    function clipperOperation(polyA, polyB, operation, distance = 0) {
        // TODO: Integrate with polybool, clipper-js, or similar library
        // For now, return original polygon
        return polyA;
    }

    // Stub for earcut triangulation
    function earcutLib(flatCoords) {
        // TODO: Integrate with earcut library
        return [];
    }

    // Find intersections between line segment and polygon edges
    function findSegmentPolygonIntersections(start, end, poly) {
        const intersections = [];

        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const edgeStart = poly[j];
            const edgeEnd = poly[i];
            const intersection = segmentIntersection(start, end, edgeStart, edgeEnd);

            if (intersection) {
                intersections.push(intersection);
            }
        }

        // Sort intersections by distance from start point
        return intersections.sort((a, b) => {
            const distA = a.x + start.x;
            const distB = b.x + start.x;
            return distA - distB;
        });
    }

    // Calculate intersection point between two line segments
    function segmentIntersection(a, b, c, d) {
        const nx = d.x - c.x;
        const ny = d.y - c.y;
        const ax = b.x - a.x;
        const ay = b.y - a.y;
        const denominator = nx * ay - ny * ax;

        // Parallel or coincident lines
        if (Math.abs(denominator) < 1e-9) return null;

        const t = ((a.x - c.x) * ay - (a.y - c.y) * ax) / denominator;
        const u = ((c.x - a.x) * ny - (c.y - a.y) * nx) / denominator;

        // Check if intersection is within both segments
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return Point(c.x + t * nx, c.y + t * ny);
        }

        return null;
    }

    // ==========================================
    // EXPORT API
    // ==========================================

    // Add math functions to app
    if (!app.math) app.math = {};
    if (!app.math.geometry) app.math.geometry = {};

    app.math.geometry.pointInPolygon = pointInPolygon;
    app.math.geometry.polygonArea = polygonArea;

    // Extend the app object
    Object.assign(app, {
        // Primitives
        Pt: Point,
        Vec: Vector,
        Rect: Rectangle,
        Circle,
        Line,
        Poly: Polygon,
        Arc,

        // Drawing
        draw,

        // Boolean operations
        bool: booleanOps,

        // Operations
        offset,
        triangulate,
        hatch,
        handles: createHandles,

        // Queries
        bounds: getBounds,
        contains: containsPoint,
        hit: hitTest,

        // Transforms
        clone,
        mirror,
        rotate,
        scale,

        // Serialization
        save,
        load,

        // Calculations
        centroid: getCentroid,
        area: getArea,
        perimeter: getPerimeter
    });

    console.log('⚡ geometryPlugin — Live, editable, procedural 2D geometry loaded');
}
