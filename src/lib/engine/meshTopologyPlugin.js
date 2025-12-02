// meshTopologyPlugin.js — Professional 2D Mesh & Topology System v1.1
// Requires: canvas_util.js + mathPlugin.js

export function meshTopologyPlugin(app) {
    // =============================================
    // Mesh Class – Core topology container
    // =============================================
    class Mesh {
        constructor(vertices = [], faces = []) {
            this.vertices = vertices.map(v => app.vec2(v.x ?? v[0], v.y ?? v[1])); // support [x,y] or {x,y}
            this.faces = faces.map(f => ({
                indices: f.indices || f,
                color: f.color || '#888888',
                opacity: f.opacity ?? 1,
                uv: f.uv || null // optional UVs for texture mapping
            }));
            this.wireframe = false;
            this.wireframeColor = '#000000';
            this.wireframeWidth = 1;
            this.visible = true;
            this.x = 0;
            this.y = 0;
            this.rotation = 0;
            this.scaleX = 1;
            this.scaleY = 1;
            this.opacity = 1;
            this.zIndex = 0; // Added for proper layering
        }

        // Add vertex and return its index
        addVertex(x, y) {
            const v = app.vec2(x, y);
            this.vertices.push(v);
            return this.vertices.length - 1;
        }

        // Add triangular face (most stable)
        addFace(v1, v2, v3, color = null, opacity = 1) {
            this.faces.push({
                indices: [v1, v2, v3],
                color: color || this.faces[this.faces.length - 1]?.color || '#888888',
                opacity: opacity
            });
            return this.faces.length - 1;
        }

        // Add quad (two triangles)
        addQuad(v1, v2, v3, v4, color = null) {
            const idx1 = this.addFace(v1, v2, v3, color);
            const idx2 = this.addFace(v1, v3, v4, color);
            return [idx1, idx2];
        }

        // Transform all vertices using a matrix
        transform(matrix) {
            for (const v of this.vertices) {
                const p = matrix.transformPoint(v);
                v.set$(p.x, p.y);
            }
            return this;
        }

        // Transform relative to mesh origin
        localTransform(matrix) {
            const bounds = this.getBounds();
            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;

            for (const v of this.vertices) {
                // Translate to origin, transform, then translate back
                const temp = app.vec2(v.x - cx, v.y - cy);
                const p = matrix.transformPoint(temp);
                v.set$(p.x + cx, p.y + cy);
            }
            return this;
        }

        // Center mesh at origin (bounds center to 0,0)
        center() {
            const bounds = this.getBounds();
            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;

            for (const v of this.vertices) {
                v.set$(v.x - cx, v.y - cy);
            }
            return this;
        }

        // Move mesh to specific position
        moveTo(x, y) {
            const bounds = this.getBounds();
            const cx = (bounds.minX + bounds.maxX) / 2;
            const cy = (bounds.minY + bounds.maxY) / 2;
            const dx = x - cx;
            const dy = y - cy;

            for (const v of this.vertices) {
                v.set$(v.x + dx, v.y + dy);
            }
            return this;
        }

        getBounds() {
            if (this.vertices.length === 0) {
                return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
            }

            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;

            for (const v of this.vertices) {
                minX = Math.min(minX, v.x);
                minY = Math.min(minY, v.y);
                maxX = Math.max(maxX, v.x);
                maxY = Math.max(maxY, v.y);
            }

            return {
                minX, minY, maxX, maxY,
                width: maxX - minX,
                height: maxY - minY,
                centerX: (minX + maxX) / 2,
                centerY: (minY + maxY) / 2
            };
        }

        // Point inside mesh test (barycentric winding)
        containsPoint(px, py) {
            // First check bounding box for optimization
            const bounds = this.getBounds();
            if (px < bounds.minX || px > bounds.maxX ||
                py < bounds.minY || py > bounds.maxY) {
                return false;
            }

            // Then check each triangle
            for (const face of this.faces) {
                const [i1, i2, i3] = face.indices;
                const v1 = this.vertices[i1];
                const v2 = this.vertices[i2];
                const v3 = this.vertices[i3];

                const bary = this._barycentric(v1, v2, v3, px, py);
                if (bary && bary.u >= 0 && bary.v >= 0 && bary.u + bary.v <= 1) {
                    return true;
                }
            }
            return false;
        }

        _barycentric(a, b, c, px, py) {
            const v0 = b.sub(a);
            const v1 = c.sub(a);
            const v2 = app.vec2(px - a.x, py - a.y);

            const d00 = v0.dot(v0);
            const d01 = v0.dot(v1);
            const d11 = v1.dot(v1);
            const d20 = v2.dot(v0);
            const d21 = v2.dot(v1);

            const denom = d00 * d11 - d01 * d01;
            if (Math.abs(denom) < 1e-9) return null;

            const v = (d11 * d20 - d01 * d21) / denom;
            const w = (d00 * d21 - d01 * d20) / denom;
            const u = 1 - v - w;

            return { u, v, w };
        }

        // Get normal for a face (for lighting effects)
        getFaceNormal(faceIndex) {
            if (faceIndex >= this.faces.length) return app.vec2(0, 0);

            const face = this.faces[faceIndex];
            const [i1, i2, i3] = face.indices;
            const v1 = this.vertices[i1];
            const v2 = this.vertices[i2];

            const edge = v2.sub(v1);
            return app.vec2(-edge.y, edge.x).normalize$();
        }

        // Update method for animations
        update(dt) {
            // Can be overridden by effects
            if (this._updateFn) {
                this._updateFn(dt, this);
            }
        }

        // Draw method (used when added to layer)
        draw(ctx) {
            if (!this.visible || this.faces.length === 0 || this.opacity <= 0) return;

            ctx.save();
            ctx.globalAlpha = this.opacity;

            // Apply object transform
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);

            // Draw filled faces first
            if (!this.wireframe) {
                for (const face of this.faces) {
                    if (face.opacity <= 0) continue;

                    const [i1, i2, i3] = face.indices;
                    const v1 = this.vertices[i1];
                    const v2 = this.vertices[i2];
                    const v3 = this.vertices[i3];

                    ctx.fillStyle = face.color;
                    ctx.globalAlpha = face.opacity * this.opacity;

                    ctx.beginPath();
                    ctx.moveTo(v1.x, v1.y);
                    ctx.lineTo(v2.x, v2.y);
                    ctx.lineTo(v3.x, v3.y);
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Draw wireframe on top
            if (this.wireframe) {
                ctx.strokeStyle = this.wireframeColor;
                ctx.lineWidth = this.wireframeWidth;
                ctx.globalAlpha = this.opacity;

                for (const face of this.faces) {
                    if (face.opacity <= 0) continue;

                    const [i1, i2, i3] = face.indices;
                    const v1 = this.vertices[i1];
                    const v2 = this.vertices[i2];
                    const v3 = this.vertices[i3];

                    ctx.beginPath();
                    ctx.moveTo(v1.x, v1.y);
                    ctx.lineTo(v2.x, v2.y);
                    ctx.lineTo(v3.x, v3.y);
                    ctx.closePath();
                    ctx.stroke();
                }
            }

            ctx.restore();
        }

        // Clone mesh
        clone() {
            const clonedVertices = this.vertices.map(v => app.vec2(v.x, v.y));
            const clonedFaces = this.faces.map(f => ({
                indices: [...f.indices],
                color: f.color,
                opacity: f.opacity,
                uv: f.uv ? [...f.uv] : null
            }));

            const mesh = new Mesh(clonedVertices, clonedFaces);
            mesh.wireframe = this.wireframe;
            mesh.wireframeColor = this.wireframeColor;
            mesh.wireframeWidth = this.wireframeWidth;
            mesh.visible = this.visible;
            mesh.x = this.x;
            mesh.y = this.y;
            mesh.rotation = this.rotation;
            mesh.scaleX = this.scaleX;
            mesh.scaleY = this.scaleY;
            mesh.opacity = this.opacity;
            mesh.zIndex = this.zIndex;

            return mesh;
        }
    }

    // =============================================
    // Mesh Factory Presets
    // =============================================
    app.mesh = {
        create(vertices = [], faces = []) {
            return new Mesh(vertices, faces);
        },

        // Regular polygon
        regular(sides = 6, radius = 100, options = {}) {
            const mesh = new Mesh();
            const angleStep = app.math.TAU / sides;

            for (let i = 0; i < sides; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                mesh.addVertex(x, y);
            }

            // Triangulate from center
            for (let i = 1; i < sides - 1; i++) {
                mesh.addFace(0, i, i + 1, options.color);
            }

            if (options.center !== false) mesh.center();
            return mesh;
        },

        // Grid mesh (quads → triangulated)
        grid(cols = 10, rows = 10, width = 400, height = 400, options = {}) {
            const mesh = new Mesh();
            const cellW = width / cols;
            const cellH = height / rows;
            const offsetX = -width / 2;
            const offsetY = -height / 2;

            // Create vertices
            for (let y = 0; y <= rows; y++) {
                for (let x = 0; x <= cols; x++) {
                    mesh.addVertex(
                        offsetX + x * cellW,
                        offsetY + y * cellH
                    );
                }
            }

            // Create faces
            const vertsPerRow = cols + 1;
            const color1 = options.color1 || '#cccccc';
            const color2 = options.color2 || '#bbbbbb';

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const a = y * vertsPerRow + x;
                    const b = a + 1;
                    const c = a + vertsPerRow + 1;
                    const d = a + vertsPerRow;

                    mesh.addFace(a, b, c, color1);
                    mesh.addFace(a, c, d, color2);
                }
            }

            return mesh;
        },

        // Cube projection (isometric-style)
        cube(size = 100, options = {}) {
            const h = size / 2;
            const mesh = new Mesh();

            // 8 vertices of a cube (isometric view)
            const vertIndices = [];
            const vertices3D = [
                [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
                [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h]
            ];

            // Project 3D to 2D (isometric)
            vertices3D.forEach(p => {
                const x = (p[0] - p[2]) * 0.5;
                const y = (p[0] + p[2]) * 0.25 - p[1] * 0.5;
                vertIndices.push(mesh.addVertex(x, y));
            });

            // Face colors
            const faceColors = options.colors || [
                '#ff9500', // front
                '#ffcc00', // back
                '#ff3b30', // bottom
                '#ff2d92', // right
                '#34c759', // top
                '#007aff'  // left
            ];

            // Cube faces (quad indices)
            const quads = [
                [0, 1, 2, 3], // front
                [4, 5, 6, 7], // back
                [0, 1, 5, 4], // bottom
                [1, 2, 6, 5], // right
                [2, 3, 7, 6], // top
                [3, 0, 4, 7]  // left
            ];

            // Create triangles from quads
            quads.forEach((quad, idx) => {
                const color = faceColors[idx % faceColors.length];
                mesh.addFace(quad[0], quad[1], quad[2], color);
                mesh.addFace(quad[0], quad[2], quad[3], color);
            });

            return mesh.center();
        },

        // Plane (simple rectangle)
        plane(width = 100, height = 100, options = {}) {
            const mesh = new Mesh();
            const hw = width / 2;
            const hh = height / 2;

            const v0 = mesh.addVertex(-hw, -hh);
            const v1 = mesh.addVertex(hw, -hh);
            const v2 = mesh.addVertex(hw, hh);
            const v3 = mesh.addVertex(-hw, hh);

            mesh.addFace(v0, v1, v2, options.color);
            mesh.addFace(v0, v2, v3, options.color);

            return mesh;
        },

        // From SVG-like path string (basic)
        fromPath(pathCommandString, samples = 100) {
            const mesh = new Mesh();
            const points = [];
            const cmds = pathCommandString.trim().split(/(?=[MLCZ])/i);

            let current = app.vec2(0, 0);

            for (const cmd of cmds) {
                const type = cmd[0].toUpperCase();
                const args = cmd.slice(1).trim().split(/[\s,]+/).map(Number);

                if (type === 'M') {
                    current = app.vec2(args[0], args[1]);
                    points.push(current.clone());
                } else if (type === 'L') {
                    for (let i = 0; i < args.length; i += 2) {
                        current = app.vec2(args[i], args[i + 1]);
                        points.push(current.clone());
                    }
                } else if (type === 'Z') {
                    if (points.length > 0) {
                        points.push(points[0].clone());
                    }
                }
            }

            // Simple ear-clip triangulation (basic)
            if (points.length >= 3) {
                // Add vertices
                const vertexIndices = points.map(p =>
                    mesh.addVertex(p.x, p.y)
                );

                // Simple fan triangulation for convex shapes
                for (let i = 1; i < vertexIndices.length - 1; i++) {
                    mesh.addFace(
                        vertexIndices[0],
                        vertexIndices[i],
                        vertexIndices[i + 1]
                    );
                }
            }

            return mesh.center();
        },

        // Star shape
        star(points = 5, outerRadius = 100, innerRadius = 50, options = {}) {
            const mesh = new Mesh();
            const step = app.math.TAU / (points * 2);

            // Create vertices
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = i * step - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                mesh.addVertex(x, y);
            }

            // Triangulate from center
            const centerIdx = mesh.addVertex(0, 0);
            for (let i = 0; i < points * 2; i++) {
                const next = (i + 1) % (points * 2);
                mesh.addFace(centerIdx, i, next, options.color);
            }

            if (options.center !== false) mesh.center();
            return mesh;
        },

        // Circle (high poly approximation)
        circle(radius = 100, segments = 32, options = {}) {
            return this.regular(segments, radius, options);
        }
    };

    // =============================================
    // Mesh Utilities
    // =============================================
    app.mesh.utils = {
        // Merge multiple meshes
        merge(meshes) {
            const mesh = new Mesh();

            meshes.forEach(sourceMesh => {
                const vertexOffset = mesh.vertices.length;

                // Add vertices
                sourceMesh.vertices.forEach(v => {
                    mesh.addVertex(v.x + sourceMesh.x, v.y + sourceMesh.y);
                });

                // Add faces with offset indices
                sourceMesh.faces.forEach(face => {
                    mesh.faces.push({
                        indices: face.indices.map(i => i + vertexOffset),
                        color: face.color,
                        opacity: face.opacity,
                        uv: face.uv
                    });
                });
            });

            return mesh;
        },

        // Subdivide mesh (basic)
        subdivide(mesh, iterations = 1) {
            let result = mesh.clone();

            for (let iter = 0; iter < iterations; iter++) {
                const newMesh = new Mesh();
                const midpoints = new Map();

                // Add original vertices
                result.vertices.forEach(v => {
                    newMesh.addVertex(v.x, v.y);
                });

                // Process each face
                result.faces.forEach(face => {
                    const [a, b, c] = face.indices;
                    const va = result.vertices[a];
                    const vb = result.vertices[b];
                    const vc = result.vertices[c];

                    // Create edge midpoints (or reuse)
                    const getMidpoint = (i, j) => {
                        const key = i < j ? `${i},${j}` : `${j},${i}`;
                        if (!midpoints.has(key)) {
                            const v1 = result.vertices[i];
                            const v2 = result.vertices[j];
                            midpoints.set(key, newMesh.addVertex(
                                (v1.x + v2.x) / 2,
                                (v1.y + v2.y) / 2
                            ));
                        }
                        return midpoints.get(key);
                    };

                    const ab = getMidpoint(a, b);
                    const bc = getMidpoint(b, c);
                    const ca = getMidpoint(c, a);

                    // Create 4 new triangles
                    newMesh.addFace(a, ab, ca, face.color, face.opacity);
                    newMesh.addFace(ab, b, bc, face.color, face.opacity);
                    newMesh.addFace(ca, bc, c, face.color, face.opacity);
                    newMesh.addFace(ab, bc, ca, face.color, face.opacity);
                });

                result = newMesh;
            }

            return result;
        }
    };

    // =============================================
    // Deformation Effects (coroutine-ready)
    // =============================================
    app.mesh.effects = {
        // Wave deformation over time
        wave(mesh, amplitude = 30, frequency = 4, speed = 2) {
            const originalVertices = mesh.vertices.map(v => v.clone());

            app.startCoroutine(function*() {
                while (true) {
                    const t = performance.now() * 0.001 * speed;

                    for (let i = 0; i < mesh.vertices.length; i++) {
                        const v = mesh.vertices[i];
                        const orig = originalVertices[i];
                        const dist = Math.hypot(orig.x, orig.y);
                        v.set$(
                            orig.x,
                            orig.y + Math.sin(dist * frequency + t) * amplitude * 0.1
                        );
                    }
                    yield;
                }
            });
        },

        // Explode effect
        explode(mesh, strength = 200, duration = 1000) {
            const center = mesh.getBounds();
            const cx = center.centerX;
            const cy = center.centerY;
            const start = performance.now();
            const originalVertices = mesh.vertices.map(v => v.clone());

            app.startCoroutine(function*() {
                while (true) {
                    const elapsed = performance.now() - start;
                    if (elapsed >= duration) {
                        // Reset to original positions
                        originalVertices.forEach((orig, i) => {
                            mesh.vertices[i].set$(orig.x, orig.y);
                        });
                        break;
                    }

                    const t = elapsed / duration;
                    const power = app.math.ease.outCubic(t);

                    originalVertices.forEach((orig, i) => {
                        const v = mesh.vertices[i];
                        const dx = orig.x - cx;
                        const dy = orig.y - cy;
                        const dist = Math.hypot(dx, dy) + 1;

                        v.set$(
                            cx + dx + dx / dist * strength * power,
                            cy + dy + dy / dist * strength * power
                        );
                    });

                    yield;
                }
            });
        },

        // Twist deformation
        twist(mesh, amount = Math.PI, center = null) {
            const bounds = mesh.getBounds();
            const twistCenter = center || app.vec2(bounds.centerX, bounds.centerY);
            const originalVertices = mesh.vertices.map(v => v.clone());

            for (let i = 0; i < mesh.vertices.length; i++) {
                const v = mesh.vertices[i];
                const orig = originalVertices[i];

                const dx = orig.x - twistCenter.x;
                const dy = orig.y - twistCenter.y;
                const dist = Math.hypot(dx, dy);
                const angle = Math.atan2(dy, dx) + (dist / 100) * amount;

                v.set$(
                    twistCenter.x + Math.cos(angle) * dist,
                    twistCenter.y + Math.sin(angle) * dist
                );
            }
        },

        // Animate twist
        animateTwist(mesh, targetAmount = Math.PI, duration = 1000, center = null) {
            const bounds = mesh.getBounds();
            const twistCenter = center || app.vec2(bounds.centerX, bounds.centerY);
            const originalVertices = mesh.vertices.map(v => v.clone());
            const start = performance.now();

            app.startCoroutine(function*() {
                while (true) {
                    const elapsed = performance.now() - start;
                    if (elapsed >= duration) break;

                    const t = elapsed / duration;
                    const currentAmount = targetAmount * app.math.ease.inOutCubic(t);

                    originalVertices.forEach((orig, i) => {
                        const v = mesh.vertices[i];
                        const dx = orig.x - twistCenter.x;
                        const dy = orig.y - twistCenter.y;
                        const dist = Math.hypot(dx, dy);
                        const angle = Math.atan2(dy, dx) + (dist / 100) * currentAmount;

                        v.set$(
                            twistCenter.x + Math.cos(angle) * dist,
                            twistCenter.y + Math.sin(angle) * dist
                        );
                    });

                    yield;
                }
            });
        },

        // Pulsate scale
        pulsate(mesh, scaleFactor = 1.2, duration = 1000) {
            const originalScaleX = mesh.scaleX;
            const originalScaleY = mesh.scaleY;
            const start = performance.now();

            app.startCoroutine(function*() {
                while (true) {
                    const elapsed = performance.now() - start;
                    const t = (elapsed % duration) / duration;
                    const pulse = 1 + (scaleFactor - 1) * Math.sin(t * Math.PI * 2) * 0.5 + 0.5;

                    mesh.scaleX = originalScaleX * pulse;
                    mesh.scaleY = originalScaleY * pulse;

                    yield;
                }
            });
        },

        // Color cycle
        colorCycle(mesh, colors = ['#ff0000', '#00ff00', '#0000ff'], duration = 3000) {
            const start = performance.now();

            app.startCoroutine(function*() {
                while (true) {
                    const elapsed = performance.now() - start;
                    const t = (elapsed % duration) / duration;
                    const colorIndex = Math.floor(t * colors.length) % colors.length;
                    const nextIndex = (colorIndex + 1) % colors.length;
                    const lerpT = (t * colors.length) % 1;

                    const color1 = app.colors.hexToRgb(colors[colorIndex]);
                    const color2 = app.colors.hexToRgb(colors[nextIndex]);

                    if (color1 && color2) {
                        const r = Math.round(app.math.lerp(color1.r, color2.r, lerpT));
                        const g = Math.round(app.math.lerp(color1.g, color2.g, lerpT));
                        const b = Math.round(app.math.lerp(color1.b, color2.b, lerpT));
                        const hex = app.colors.rgbToHex(r, g, b);

                        mesh.faces.forEach(face => {
                            face.color = hex;
                        });
                    }

                    yield 50; // Update every 50ms for smoother transition
                }
            });
        }
    };

    // =============================================
    // Modify app.root.add to support Mesh objects
    // =============================================
    if (app.root) {
        const originalAdd = app.root.add;

        app.root.add = function(obj) {
            obj = originalAdd.call(this, obj);

            if (obj instanceof Mesh) {
                // Ensure transform properties exist
                obj.x = obj.x || 0;
                obj.y = obj.y || 0;
                obj.rotation = obj.rotation || 0;
                obj.scaleX = obj.scaleX || 1;
                obj.scaleY = obj.scaleY || 1;
                obj.opacity = obj.opacity || 1;
                obj.visible = obj.visible !== false;
                obj.zIndex = obj.zIndex || 0;

                // Ensure update method exists
                if (!obj.update) {
                    obj.update = function(dt) {
                        // Mesh can have custom update logic
                    };
                }

                // Helper method for layer sorting
                obj.setZIndex = function(z) {
                    this.zIndex = z;
                    if (this.parentLayer) {
                        this.parentLayer.sort((a, b) => a.zIndex - b.zIndex);
                    }
                };
            }

            return obj;
        };
    }

    // =============================================
    // Add mesh methods to Vector2 for convenience
    // =============================================
    if (app.vec2 && app.vec2.prototype) {
        // Create triangle from three vectors
        app.vec2.prototype.triangleWith = function(v2, v3, color = '#888888') {
            const mesh = new Mesh();
            const i1 = mesh.addVertex(this.x, this.y);
            const i2 = mesh.addVertex(v2.x, v2.y);
            const i3 = mesh.addVertex(v3.x, v3.y);
            mesh.addFace(i1, i2, i3, color);
            return mesh;
        };
    }

    console.log("✅ meshTopologyPlugin v1.1 loaded — Enhanced 2D triangulated meshes with deformation, utilities, and effects!");

    return {
        Mesh: Mesh,
        effects: app.mesh.effects,
        utils: app.mesh.utils
    };
}
