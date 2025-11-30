// shapes3DPlugin.js - FIXED VERSION

export const shapes3d = {
    // CUBE
    cube() {
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const faces = [
            [0, 1, 2, 3], // front
            [5, 4, 7, 6], // back
            [4, 0, 3, 7], // left
            [1, 5, 6, 2], // right
            [3, 2, 6, 7], // top
            [4, 5, 1, 0]  // bottom
        ];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        return { vertices, faces, colors, type: 'cube' };
    },

    // SPHERE
    sphere(rings = 12, segments = 16) { // Reduced complexity for better performance
        const vertices = [];
        const faces = [];

        for (let i = 0; i <= rings; i++) {
            const theta = (i * Math.PI) / rings;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let j = 0; j <= segments; j++) {
                const phi = (j * 2 * Math.PI) / segments;
                const x = Math.cos(phi) * sinTheta;
                const y = cosTheta;
                const z = Math.sin(phi) * sinTheta;
                vertices.push([x, y, z]);
            }
        }

        for (let i = 0; i < rings; i++) {
            for (let j = 0; j < segments; j++) {
                const first = i * (segments + 1) + j;
                const second = first + segments + 1;
                faces.push([first, second, first + 1]);
                faces.push([second, second + 1, first + 1]);
            }
        }

        return { vertices, faces, colors: ['#3498db'], type: 'sphere' };
    },

    // PYRAMID (Square base)
    pyramid() {
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
            [0, 1.5, 0] // apex
        ];
        const faces = [
            [0, 1, 2, 3], // base
            [0, 1, 4],    // front
            [1, 2, 4],    // right
            [2, 3, 4],    // back
            [3, 0, 4]     // left
        ];
        const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6'];
        return { vertices, faces, colors, type: 'pyramid' };
    },

    // CONE
    cone(segments = 16) { // Reduced segments for performance
        const vertices = [[0, 1.5, 0]]; // apex
        const faces = [];

        // Base vertices
        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            vertices.push([Math.cos(angle), -1, Math.sin(angle)]);
        }

        // Side faces
        for (let i = 1; i < segments; i++) {
            faces.push([0, i, i + 1]);
        }
        faces.push([0, segments, 1]);

        // Base
        const base = [];
        for (let i = 1; i <= segments; i++) {
            base.push(i);
        }
        faces.push(base);

        return { vertices, faces, colors: ['#f39c12'], type: 'cone' };
    },

    // CYLINDER
    cylinder(segments = 16) { // Reduced segments for performance
        const vertices = [];
        const faces = [];

        // Create top and bottom circles
        for (let i = 0; i <= segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const x = Math.cos(angle);
            const z = Math.sin(angle);
            vertices.push([x, 1, z]);    // top
            vertices.push([x, -1, z]);   // bottom
        }

        // Side faces
        for (let i = 0; i < segments; i++) {
            faces.push([i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2]);
        }

        // Top and bottom caps
        const top = [], bottom = [];
        for (let i = 0; i < segments; i++) {
            top.push(i * 2);
            bottom.push(i * 2 + 1);
        }
        faces.push(top);
        faces.push(bottom.reverse());

        return { vertices, faces, colors: ['#2ecc71'], type: 'cylinder' };
    },

    // Add more shapes as needed...
};

// 3D Projection utilities
export const projection3d = {
    // Rotate point around X axis
    rotateX(point, angle) {
        const [x, y, z] = point;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [x, y * cos - z * sin, y * sin + z * cos];
    },

    // Rotate point around Y axis
    rotateY(point, angle) {
        const [x, y, z] = point;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [x * cos + z * sin, y, -x * sin + z * cos];
    },

    // Rotate point around Z axis
    rotateZ(point, angle) {
        const [x, y, z] = point;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [x * cos - y * sin, x * sin + y * cos, z];
    },

    // Project 3D point to 2D
    project(point, distance = 4, scale = 150) {
        const [x, y, z] = point;
        const perspective = distance / (distance + z);
        return {
            x: x * perspective * scale,
            y: y * perspective * scale,
            z: z
        };
    },

    // Calculate face normal for backface culling
    faceNormal(v1, v2, v3) {
        const u = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
        const v = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
        return [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0]
        ];
    },

    // Check if face is visible (backface culling)
    isVisible(normal, viewDir = [0, 0, 1]) {
        return normal[0] * viewDir[0] + normal[1] * viewDir[1] + normal[2] * viewDir[2] > 0;
    }
};

// Enhanced renderer that works with canvas engine
export function create3DShape(shapeType, options = {}) {
    const shape = shapes3d[shapeType] ? shapes3d[shapeType]() : shapes3d.cube();

    return {
        x: options.x || 0,
        y: options.y || 0,
        rotation: 0,
        scaleX: options.scale || 1,
        scaleY: options.scale || 1,
        opacity: 1,

        // 3D specific properties
        shapeType: shapeType,
        vertices: shape.vertices,
        faces: shape.faces,
        colors: shape.colors,
        rotX: 0,
        rotY: 0,
        rotZ: 0,
        autoRotate: options.autoRotate !== false,

        update(dt) {
            if (this.autoRotate) {
                this.rotY += dt * 0.001;
                this.rotX += dt * 0.0005;
            }
        },

        draw(ctx) {
            const centerX = this.x;
            const centerY = this.y;
            const scale = this.scaleX * 50;

            // Transform vertices
            const transformed = this.vertices.map(v => {
                let p = projection3d.rotateY(v, this.rotY);
                p = projection3d.rotateX(p, this.rotX);
                p = projection3d.rotateZ(p, this.rotZ);
                return {
                    v3d: p,
                    v2d: projection3d.project(p, 4, scale)
                };
            });

            // Sort faces by average Z (painter's algorithm)
            const sortedFaces = this.faces.map((face, i) => {
                const avgZ = face.reduce((sum, idx) => sum + transformed[idx].v3d[2], 0) / face.length;
                return {
                    face,
                    color: this.colors[i % this.colors.length],
                    avgZ
                };
            }).sort((a, b) => b.avgZ - a.avgZ);

            // Draw faces
            sortedFaces.forEach(({ face, color }) => {
                // Backface culling for triangles and quads
                if (face.length >= 3) {
                    const v1 = transformed[face[0]].v3d;
                    const v2 = transformed[face[1]].v3d;
                    const v3 = transformed[face[2]].v3d;
                    const normal = projection3d.faceNormal(v1, v2, v3);

                    if (!projection3d.isVisible(normal)) return;
                }

                ctx.beginPath();
                face.forEach((idx, i) => {
                    const p = transformed[idx].v2d;
                    if (i === 0) {
                        ctx.moveTo(centerX + p.x, centerY + p.y);
                    } else {
                        ctx.lineTo(centerX + p.x, centerY + p.y);
                    }
                });
                ctx.closePath();

                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        }
    };
}

// Plugin for canvas engine
export function shapes3DPlugin(app) {
    app.create3DShape = (shapeType, options = {}) => {
        const shape = create3DShape(shapeType, options);
        app.root.add(shape);
        return shape;
    };
}

export default { shapes3d, projection3d, create3DShape, shapes3DPlugin };
