// canvas_util.js – Simplified core canvas engine with enriched second-level API

export function createCanvasApp(canvas) {
    const ctx = canvas.getContext("2d");
    let running = true;
    let last = performance.now();
    const objects = [];
    const tweens = [];

    // ==========================================
    // CORE MATH UTILITIES (SECOND LEVEL)
    // ==========================================
    const math = {
        // Basic operations
        ops: {
            lerp: (a, b, t) => a + (b - a) * t,
            clamp: (val, min, max) => Math.max(min, Math.min(max, val)),
            map: (val, inMin, inMax, outMin, outMax) =>
                (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin,
            normalize: (val, min, max) => (val - min) / (max - min)
        },

        // Geometry calculations
        geometry: {
            distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
            angle: (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1),
            midpoint: (x1, y1, x2, y2) => ({
                x: (x1 + x2) / 2,
                y: (y1 + y2) / 2
            })
        },

        // Random number generation
        random: {
            range: (min, max) => Math.random() * (max - min) + min,
            int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
            bool: (probability = 0.5) => Math.random() < probability,
            choice: (arr) => arr[Math.floor(Math.random() * arr.length)],
            color: () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        },

        // Easing functions
        easing: {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => t * (2 - t),
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            bounce: t => {
                if (t < 1 / 2.75) return 7.5625 * t * t;
                if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
            }
        }
    };

    // ==========================================
    // VECTOR2 CLASS (ENRICHED)
    // ==========================================
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        // Basic operations
        add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
        sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
        mult(s) { return new Vector2(this.x * s, this.y * s); }
        div(s) { return new Vector2(this.x / s, this.y / s); }

        // Vector math
        mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        normalize() {
            const m = this.mag();
            return m > 0 ? this.div(m) : new Vector2();
        }
        dot(v) { return this.x * v.x + this.y * v.y; }
        angle() { return Math.atan2(this.y, this.x); }

        // Utility
        copy() { return new Vector2(this.x, this.y); }
        set(x, y) { this.x = x; this.y = y; return this; }
        equals(v) { return this.x === v.x && this.y === v.y; }

        static fromAngle(angle, length = 1) {
            return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
        }
        static random(minX, maxX, minY, maxY) {
            return new Vector2(
                math.random.range(minX, maxX),
                math.random.range(minY, maxY)
            );
        }
    }

    // ==========================================
    // INPUT SYSTEM (ENRICHED SECOND LEVEL)
    // ==========================================
    const input = {
        // Mouse input
        mouse: {
            x: 0, y: 0,
            down: false,
            pressed: false,
            released: false,
            dragStart: new Vector2(),
            dragging: false,

            // Mouse utility methods
            position() { return new Vector2(this.x, this.y); },
            dragDistance() {
                return math.geometry.distance(this.dragStart.x, this.dragStart.y, this.x, this.y);
            },
            isOverRect(x, y, width, height) {
                return this.x >= x && this.x <= x + width &&
                    this.y >= y && this.y <= y + height;
            }
        },

        // Keyboard input
        keyboard: {
            _keys: {},
            _prevKeys: {},

            isDown(key) { return this._keys[key] || false; },
            isPressed(key) { return this._keys[key] && !this._prevKeys[key]; },
            isReleased(key) { return !this._keys[key] && this._prevKeys[key]; },

            // Keyboard utility
            anyPressed() { return Object.keys(this._keys).some(key => this.isPressed(key)); },
            update() {
                this._prevKeys = { ...this._keys };
            }
        },

        // Input utility methods
        utils: {
            wasClicked() { return input.mouse.released; },
            isDragging() { return input.mouse.dragging; },
            getDragVector() {
                return new Vector2(
                    input.mouse.x - input.mouse.dragStart.x,
                    input.mouse.y - input.mouse.dragStart.y
                );
            }
        }
    };

    // Event listeners
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        input.mouse.x = e.clientX - rect.left;
        input.mouse.y = e.clientY - rect.top;
        input.mouse.dragging = input.mouse.down;
    });

    canvas.addEventListener("mousedown", (e) => {
        input.mouse.down = true;
        input.mouse.pressed = true;
        input.mouse.dragStart.set(input.mouse.x, input.mouse.y);
    });

    canvas.addEventListener("mouseup", () => {
        input.mouse.down = false;
        input.mouse.released = true;
        input.mouse.dragging = false;
    });

    window.addEventListener("keydown", (e) => input.keyboard._keys[e.key] = true);
    window.addEventListener("keyup", (e) => input.keyboard._keys[e.key] = false);

    // ==========================================
    // ENTITY CREATION (ENRICHED SECOND LEVEL)
    // ==========================================
    const entity = {
        // Shape primitives
        shapes: {
            rect(x, y, width, height, color = '#000000') {
                return {
                    x, y, width, height, color,
                    draw(ctx) {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                    },
                    contains(x, y) {
                        return x >= this.x - this.width / 2 && x <= this.x + this.width / 2 &&
                            y >= this.y - this.height / 2 && y <= this.y + this.height / 2;
                    }
                };
            },

            circle(x, y, radius, color = '#000000') {
                return {
                    x, y, radius, color,
                    draw(ctx) {
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                        ctx.fill();
                    },
                    contains(x, y) {
                        return math.geometry.distance(this.x, this.y, x, y) <= this.radius;
                    }
                };
            },

            line(x1, y1, x2, y2, color = '#000000', width = 2) {
                return {
                    x1, y1, x2, y2, color, width,
                    draw(ctx) {
                        ctx.strokeStyle = this.color;
                        ctx.lineWidth = this.width;
                        ctx.beginPath();
                        ctx.moveTo(this.x1, this.y1);
                        ctx.lineTo(this.x2, this.y2);
                        ctx.stroke();
                    }
                };
            },

            polygon(x, y, radius, sides, color = '#000000') {
                return {
                    x, y, radius, sides, color,
                    draw(ctx) {
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        for (let i = 0; i < this.sides; i++) {
                            const angle = (i / this.sides) * Math.PI * 2;
                            const px = this.x + Math.cos(angle) * this.radius;
                            const py = this.y + Math.sin(angle) * this.radius;
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                        ctx.closePath();
                        ctx.fill();
                    }
                };
            }
        },

        // Text rendering
        text: {
            create(x, y, text, options = {}) {
                return {
                    x, y, text,
                    color: options.color || '#000000',
                    font: options.font || '16px Arial',
                    align: options.align || 'center',
                    baseline: options.baseline || 'middle',
                    draw(ctx) {
                        ctx.font = this.font;
                        ctx.fillStyle = this.color;
                        ctx.textAlign = this.align;
                        ctx.textBaseline = this.baseline;
                        ctx.fillText(this.text, this.x, this.y);
                    }
                };
            }
        },

        // Sprite system
        sprite: {
            create(x, y, image, frameWidth, frameHeight) {
                return {
                    x, y, image, frameWidth, frameHeight,
                    currentFrame: 0,
                    draw(ctx) {
                        const sx = (this.currentFrame * this.frameWidth) % this.image.width;
                        const sy = Math.floor((this.currentFrame * this.frameWidth) / this.image.width) * this.frameHeight;

                        ctx.drawImage(
                            this.image,
                            sx, sy, this.frameWidth, this.frameHeight,
                            this.x - this.frameWidth / 2, this.y - this.frameHeight / 2,
                            this.frameWidth, this.frameHeight
                        );
                    },
                    setFrame(frame) { this.currentFrame = frame; }
                };
            }
        }
    };

    // ==========================================
    // SCENE MANAGEMENT (ENRICHED)
    // ==========================================
    const scene = {
        objects: [],

        add(obj) {
            this.objects.push(obj);
            return obj;
        },

        remove(obj) {
            const index = this.objects.indexOf(obj);
            if (index !== -1) this.objects.splice(index, 1);
        },

        clear() {
            this.objects.length = 0;
        },

        // Scene query methods
        query: {
            byType(typeName) {
                return scene.objects.filter(obj => obj.type === typeName);
            },
            atPosition(x, y) {
                return scene.objects.filter(obj => {
                    if (obj.contains) return obj.contains(x, y);
                    return false;
                });
            },
            withTag(tag) {
                return scene.objects.filter(obj => obj.tags && obj.tags.includes(tag));
            }
        },

        // Scene utility methods
        utils: {
            findClosest(x, y, maxDistance = Infinity) {
                let closest = null;
                let minDist = maxDistance;

                for (const obj of scene.objects) {
                    const dist = math.geometry.distance(x, y, obj.x, obj.y);
                    if (dist < minDist) {
                        minDist = dist;
                        closest = obj;
                    }
                }
                return closest;
            },

            createGroup(objects) {
                return {
                    objects: [...objects],
                    add(obj) { this.objects.push(obj); },
                    remove(obj) {
                        const index = this.objects.indexOf(obj);
                        if (index !== -1) this.objects.splice(index, 1);
                    },
                    forEach(callback) { this.objects.forEach(callback); }
                };
            }
        }
    };

    // ==========================================
    // EFFECTS SYSTEM (NEW SECOND LEVEL)
    // ==========================================
    const effects = {
        // Tween system
        tween: {
            create(obj, props, duration, easing = 'linear') {
                const startValues = {};
                const changes = {};

                for (const prop in props) {
                    startValues[prop] = obj[prop];
                    changes[prop] = props[prop] - obj[prop];
                }

                const t = {
                    obj,
                    startValues,
                    changes,
                    duration,
                    easing: typeof easing === 'string' ? math.easing[easing] : easing,
                    elapsed: 0,
                    onComplete: null,

                    update(dt) {
                        this.elapsed += dt;
                        const progress = Math.min(1, this.elapsed / this.duration);
                        const eased = this.easing(progress);

                        for (const prop in this.changes) {
                            this.obj[prop] = this.startValues[prop] + this.changes[prop] * eased;
                        }

                        if (progress >= 1 && this.onComplete) {
                            this.onComplete();
                        }

                        return progress < 1;
                    },

                    then(callback) {
                        this.onComplete = callback;
                        return this;
                    }
                };

                tweens.push(t);
                return t;
            }
        },

        // Particle system (simplified)
        particles: {
            createEmitter(config = {}) {
                const particles = [];

                return {
                    x: config.x || 0,
                    y: config.y || 0,
                    emitting: true,

                    update(dt) {
                        // Simple particle update logic
                        for (let i = particles.length - 1; i >= 0; i--) {
                            particles[i].life -= dt;
                            if (particles[i].life <= 0) {
                                particles.splice(i, 1);
                            }
                        }
                    },

                    draw(ctx) {
                        for (const p of particles) {
                            ctx.fillStyle = p.color;
                            ctx.globalAlpha = p.life / p.maxLife;
                            ctx.beginPath();
                            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.globalAlpha = 1;
                    },

                    burst(count = 10) {
                        for (let i = 0; i < count; i++) {
                            particles.push({
                                x: this.x,
                                y: this.y,
                                vx: math.random.range(-50, 50),
                                vy: math.random.range(-50, 50),
                                size: math.random.range(2, 8),
                                color: math.random.color(),
                                life: math.random.range(500, 2000),
                                maxLife: 1000
                            });
                        }
                    }
                };
            }
        }
    };

    // ==========================================
    // UTILITY FUNCTIONS (NEW GROUP)
    // ==========================================
    const utils = {
        // Color utilities
        color: {
            lerp(color1, color2, t) {
                // Simple color interpolation (hex strings)
                return t < 0.5 ? color1 : color2;
            },
            random() {
                return math.random.color();
            },
            rgba(r, g, b, a = 1) {
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        },

        // Drawing utilities
        draw: {
            dashedLine(ctx, x1, y1, x2, y2, dashLength = 5) {
                ctx.beginPath();
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const dashCount = Math.floor(dist / dashLength);

                for (let i = 0; i < dashCount; i += 2) {
                    const start = i / dashCount;
                    const end = (i + 1) / dashCount;
                    ctx.moveTo(x1 + dx * start, y1 + dy * start);
                    ctx.lineTo(x1 + dx * end, y1 + dy * end);
                }
                ctx.stroke();
            },

            roundedRect(ctx, x, y, width, height, radius = 5) {
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.arcTo(x + width, y, x + width, y + height, radius);
                ctx.arcTo(x + width, y + height, x, y + height, radius);
                ctx.arcTo(x, y + height, x, y, radius);
                ctx.arcTo(x, y, x + width, y, radius);
                ctx.closePath();
                ctx.fill();
            }
        },

        // Time utilities
        time: {
            createTimer(duration) {
                return {
                    duration,
                    elapsed: 0,
                    tick(dt) {
                        this.elapsed += dt;
                        return this.elapsed >= this.duration;
                    },
                    reset() { this.elapsed = 0; },
                    progress() { return Math.min(1, this.elapsed / this.duration); }
                };
            }
        }
    };

    // ==========================================
    // MAIN LOOP
    // ==========================================
    function loop(t) {
        if (!running) return;

        const dt = t - last;
        last = t;

        // Update input
        input.keyboard.update();

        // Update tweens
        for (let i = tweens.length - 1; i >= 0; i--) {
            if (!tweens[i].update(dt)) {
                tweens.splice(i, 1);
            }
        }

        // Update objects
        for (const obj of scene.objects) {
            obj.update?.(dt);
        }

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const obj of scene.objects) {
            obj.draw?.(ctx);
        }

        // Reset frame-specific input states
        input.mouse.pressed = false;
        input.mouse.released = false;

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // ==========================================
    // PUBLIC API (ENRICHED SECOND LEVEL)
    // ==========================================
    return {
        // Core properties
        canvas,
        ctx,
        Vector2,

        // First level categories with second level depth
        math,      // math.ops, math.geometry, math.random, math.easing
        input,     // input.mouse, input.keyboard, input.utils
        entity,    // entity.shapes, entity.text, entity.sprite
        scene,     // scene.add/remove/clear + scene.query + scene.utils
        effects,   // effects.tween, effects.particles
        utils,     // utils.color, utils.draw, utils.time

        // Core methods
        stop() { running = false; },
        setBackground(color) {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        },

        // Quick access methods
        createRect: (x, y, w, h, color) => scene.add(entity.shapes.rect(x, y, w, h, color)),
        createCircle: (x, y, r, color) => scene.add(entity.shapes.circle(x, y, r, color)),
        createText: (x, y, text, options) => scene.add(entity.text.create(x, y, text, options)),

        // Animation shortcut
        animate: (obj, props, duration, easing) => effects.tween.create(obj, props, duration, easing)
    };
}
