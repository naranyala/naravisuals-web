// canvas_util.js — Enhanced canvas engine with extended capabilities

export function createCanvasApp(canvas) {
    const ctx = canvas.getContext("2d");

    let running = true;
    let last = performance.now();

    const layers = [];      // sorted by z-index
    const coroutines = [];
    const plugins = [];

    // ==========================================
    // Math & Utility Helpers
    // ==========================================
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const map = (val, inMin, inMax, outMin, outMax) =>
        (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    const distance = (x1, y1, x2, y2) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = (x1, y1, x2, y2) =>
        Math.atan2(y2 - y1, x2 - x1);
    const randomRange = (min, max) =>
        Math.random() * (max - min) + min;
    const randomInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    // Easing functions
    const easings = {
        linear: t => t,
        easeIn: t => t * t,
        easeOut: t => t * (2 - t),
        easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            else return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    };

    function ease(t) {
        return t * t * (3 - 2 * t);
    }

    // ==========================================
    // Vector2 Class
    // ==========================================
    class Vector2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        add(v) { return new Vector2(this.x + v.x, this.y + v.y); }
        sub(v) { return new Vector2(this.x - v.x, this.y - v.y); }
        mult(s) { return new Vector2(this.x * s, this.y * s); }
        div(s) { return new Vector2(this.x / s, this.y / s); }
        mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
        normalize() {
            const m = this.mag();
            return m > 0 ? this.div(m) : new Vector2();
        }
        limit(max) {
            if (this.mag() > max) return this.normalize().mult(max);
            return this;
        }
        dot(v) { return this.x * v.x + this.y * v.y; }
        angle() { return Math.atan2(this.y, this.x); }
        rotate(angle) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            return new Vector2(
                this.x * cos - this.y * sin,
                this.x * sin + this.y * cos
            );
        }
        copy() { return new Vector2(this.x, this.y); }
        set(x, y) { this.x = x; this.y = y; return this; }

        static fromAngle(angle, length = 1) {
            return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
        }
    }

    // ==========================================
    // Color Utilities
    // ==========================================
    const colors = {
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        },

        lerpColor(color1, color2, t) {
            const c1 = this.hexToRgb(color1);
            const c2 = this.hexToRgb(color2);
            if (!c1 || !c2) return color1;

            const r = Math.round(lerp(c1.r, c2.r, t));
            const g = Math.round(lerp(c1.g, c2.g, t));
            const b = Math.round(lerp(c1.b, c2.b, t));
            return this.rgbToHex(r, g, b);
        },

        randomColor() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        },

        rgba(r, g, b, a = 1) {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
    };

    // ==========================================
    // Coroutine Scheduler
    // ==========================================
    function startCoroutine(genFn, name = null) {
        const iterator = typeof genFn === "function" ? genFn() : genFn;
        coroutines.push({ name, iterator, wait: 0 });
    }

    function stopCoroutine(name) {
        for (let i = coroutines.length - 1; i >= 0; i--) {
            if (coroutines[i].name === name) {
                coroutines.splice(i, 1);
            }
        }
    }

    function updateCoroutines(dt) {
        for (let c of [...coroutines]) {
            if (c.wait > 0) {
                c.wait -= dt;
                continue;
            }

            const state = c.iterator.next();
            if (state.done) {
                coroutines.splice(coroutines.indexOf(c), 1);
                continue;
            }

            if (typeof state.value === "number") {
                c.wait = state.value;
            }
        }
    }

    // ==========================================
    // Transform Mixin
    // ==========================================
    function makeTransform(obj) {
        obj.x = obj.x ?? 0;
        obj.y = obj.y ?? 0;
        obj.rotation = obj.rotation ?? 0;
        obj.scaleX = obj.scaleX ?? 1;
        obj.scaleY = obj.scaleY ?? 1;
        obj.opacity = obj.opacity ?? 1;
        obj.visible = obj.visible ?? true;

        obj.applyTransform = function(ctx) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);
        };

        return obj;
    }

    // ==========================================
    // Layers
    // ==========================================
    function createLayer(z = 0) {
        const layer = {
            zIndex: z,
            objects: [],
            visible: true,

            add(o) {
                makeTransform(o);
                this.objects.push(o);
                return o;
            },

            remove(o) {
                const i = this.objects.indexOf(o);
                if (i !== -1) this.objects.splice(i, 1);
            },

            clear() {
                this.objects = [];
            },

            getObjectsAt(x, y) {
                return this.objects.filter(o => {
                    if (!o.visible || !o.containsPoint) return false;
                    return o.containsPoint(x, y);
                });
            }
        };

        layers.push(layer);
        layers.sort((a, b) => a.zIndex - b.zIndex);
        return layer;
    }

    const root = createLayer(0);

    // ==========================================
    // Events (pointer & keyboard)
    // ==========================================
    const pointer = {
        x: 0,
        y: 0,
        down: false,
        pressed: false,
        released: false,
        dragging: false,
        dragStartX: 0,
        dragStartY: 0
    };

    const keys = {};

    canvas.addEventListener("pointermove", (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;

        if (pointer.down) {
            pointer.dragging = true;
        }
    });

    canvas.addEventListener("pointerdown", (e) => {
        pointer.down = true;
        pointer.pressed = true;
        pointer.dragStartX = pointer.x;
        pointer.dragStartY = pointer.y;
    });

    canvas.addEventListener("pointerup", () => {
        pointer.down = false;
        pointer.released = true;
        pointer.dragging = false;
    });

    window.addEventListener("keydown", (e) => keys[e.key] = true);
    window.addEventListener("keyup", (e) => keys[e.key] = false);

    function resetInputStates() {
        pointer.pressed = false;
        pointer.released = false;
    }

    // ==========================================
    // Particle System
    // ==========================================
    function createParticleEmitter(config = {}) {
        const {
            x = 0,
            y = 0,
            rate = 10,
            lifetime = 1000,
            speed = 100,
            angle = 0,
            spread = Math.PI / 4,
            size = 5,
            color = '#FFFFFF',
            gravity = 0,
            fade = true,
            maxParticles = 100
        } = config;

        const particles = [];
        let emitting = true;
        let timeSinceEmit = 0;

        const emitter = {
            x, y, rate, lifetime, speed, angle, spread, size, color, gravity, fade, emitting,

            update(dt) {
                if (this.emitting) {
                    timeSinceEmit += dt;
                    const emitInterval = 1000 / this.rate;

                    while (timeSinceEmit >= emitInterval && particles.length < maxParticles) {
                        const particleAngle = this.angle + randomRange(-this.spread / 2, this.spread / 2);
                        const vel = Vector2.fromAngle(particleAngle, this.speed);

                        particles.push({
                            x: this.x,
                            y: this.y,
                            vx: vel.x,
                            vy: vel.y,
                            life: 0,
                            maxLife: this.lifetime,
                            size: this.size,
                            color: this.color
                        });

                        timeSinceEmit -= emitInterval;
                    }
                }

                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.life += dt;

                    if (p.life >= p.maxLife) {
                        particles.splice(i, 1);
                        continue;
                    }

                    p.x += p.vx * dt / 1000;
                    p.y += p.vy * dt / 1000;
                    p.vy += this.gravity * dt / 1000;
                }
            },

            draw(ctx) {
                for (const p of particles) {
                    const alpha = this.fade ? 1 - (p.life / p.maxLife) : 1;

                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            },

            emit(count = 1) {
                for (let i = 0; i < count; i++) {
                    if (particles.length >= maxParticles) break;

                    const particleAngle = this.angle + randomRange(-this.spread / 2, this.spread / 2);
                    const vel = Vector2.fromAngle(particleAngle, this.speed);

                    particles.push({
                        x: this.x,
                        y: this.y,
                        vx: vel.x,
                        vy: vel.y,
                        life: 0,
                        maxLife: this.lifetime,
                        size: this.size,
                        color: this.color
                    });
                }
            },

            clear() {
                particles.length = 0;
            }
        };

        return emitter;
    }

    // ==========================================
    // Shape Primitives
    // ==========================================
    function createRect(x, y, width, height, color = '#000000') {
        return {
            x, y, width, height, color,
            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            },
            containsPoint(px, py) {
                const left = this.x - this.width / 2;
                const right = this.x + this.width / 2;
                const top = this.y - this.height / 2;
                const bottom = this.y + this.height / 2;
                return px >= left && px <= right && py >= top && py <= bottom;
            }
        };
    }

    function createCircle(x, y, radius, color = '#000000') {
        return {
            x, y, radius, color,
            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fill();
            },
            containsPoint(px, py) {
                return distance(this.x, this.y, px, py) <= this.radius;
            }
        };
    }

    function createLine(x1, y1, x2, y2, color = '#000000', width = 2) {
        return {
            x1, y1, x2, y2, color, lineWidth: width,
            draw(ctx) {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.beginPath();
                ctx.moveTo(this.x1, this.y1);
                ctx.lineTo(this.x2, this.y2);
                ctx.stroke();
            }
        };
    }

    function createText(x, y, text, options = {}) {
        return {
            x, y, text,
            font: options.font || '16px sans-serif',
            color: options.color || '#000000',
            align: options.align || 'left',
            baseline: options.baseline || 'top',

            draw(ctx) {
                ctx.save();
                ctx.font = this.font;
                ctx.fillStyle = this.color;
                ctx.textAlign = this.align;
                ctx.textBaseline = this.baseline;
                ctx.fillText(this.text, 0, 0);
                ctx.restore();
            }
        };
    }

    // ==========================================
    // Sprite & Animation
    // ==========================================
    function createSprite(x, y, image, config = {}) {
        const {
            frameWidth = image.width,
            frameHeight = image.height,
            frameCount = 1,
            frameDuration = 100,
            loop = true
        } = config;

        return {
            x, y, image, frameWidth, frameHeight, frameCount, frameDuration, loop,
            currentFrame: 0,
            timeAccumulator: 0,
            playing: true,

            update(dt) {
                if (!this.playing || this.frameCount <= 1) return;

                this.timeAccumulator += dt;
                if (this.timeAccumulator >= this.frameDuration) {
                    this.timeAccumulator = 0;
                    this.currentFrame++;

                    if (this.currentFrame >= this.frameCount) {
                        if (this.loop) {
                            this.currentFrame = 0;
                        } else {
                            this.currentFrame = this.frameCount - 1;
                            this.playing = false;
                        }
                    }
                }
            },

            draw(ctx) {
                const sx = (this.currentFrame * this.frameWidth) % this.image.width;
                const sy = Math.floor(this.currentFrame * this.frameWidth / this.image.width) * this.frameHeight;

                ctx.drawImage(
                    this.image,
                    sx, sy, this.frameWidth, this.frameHeight,
                    -this.frameWidth / 2, -this.frameHeight / 2,
                    this.frameWidth, this.frameHeight
                );
            },

            play() { this.playing = true; },
            pause() { this.playing = false; },
            reset() { this.currentFrame = 0; this.timeAccumulator = 0; }
        };
    }

    // ==========================================
    // Camera
    // ==========================================
    function createCamera() {
        return {
            x: 0,
            y: 0,
            zoom: 1,
            target: null,
            smoothness: 0.1,

            update(dt) {
                if (this.target) {
                    const dx = this.target.x - this.x;
                    const dy = this.target.y - this.y;
                    this.x += dx * this.smoothness;
                    this.y += dy * this.smoothness;
                }
            },

            apply(ctx) {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(this.zoom, this.zoom);
                ctx.translate(-this.x, -this.y);
            },

            reset(ctx) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            },

            follow(obj, smoothness = 0.1) {
                this.target = obj;
                this.smoothness = smoothness;
            },

            screenToWorld(screenX, screenY) {
                return {
                    x: (screenX - canvas.width / 2) / this.zoom + this.x,
                    y: (screenY - canvas.height / 2) / this.zoom + this.y
                };
            }
        };
    }

    // ==========================================
    // Tween System
    // ==========================================
    const tweens = [];

    function tween(obj, props, duration, easing = 'easeInOut') {
        const startValues = {};
        for (const prop in props) {
            startValues[prop] = obj[prop];
        }

        const t = {
            obj,
            startValues,
            endValues: props,
            duration,
            easing: typeof easing === 'string' ? easings[easing] : easing,
            elapsed: 0,
            completed: false,
            onComplete: null,

            update(dt) {
                if (this.completed) return;

                this.elapsed += dt;
                const progress = Math.min(1, this.elapsed / this.duration);
                const easedProgress = this.easing(progress);

                for (const prop in this.endValues) {
                    this.obj[prop] = lerp(
                        this.startValues[prop],
                        this.endValues[prop],
                        easedProgress
                    );
                }

                if (progress >= 1) {
                    this.completed = true;
                    if (this.onComplete) this.onComplete();
                }
            },

            then(callback) {
                this.onComplete = callback;
                return this;
            }
        };

        tweens.push(t);
        return t;
    }

    function updateTweens(dt) {
        for (let i = tweens.length - 1; i >= 0; i--) {
            tweens[i].update(dt);
            if (tweens[i].completed) {
                tweens.splice(i, 1);
            }
        }
    }

    // ==========================================
    // Animation Helpers
    // ==========================================
    function animateTo(obj, prop, target, duration = 500, easeFn = ease) {
        startCoroutine(function*() {
            const start = obj[prop];
            const t0 = performance.now();
            while (true) {
                const t = (performance.now() - t0) / duration;
                if (t >= 1) break;
                obj[prop] = lerp(start, target, easeFn(t));
                yield 16;
            }
            obj[prop] = target;
        });
    }

    // ==========================================
    // Collision Detection
    // ==========================================
    function checkCollision(a, b) {
        // Circle-circle
        if (a.radius && b.radius) {
            return distance(a.x, a.y, b.x, b.y) < a.radius + b.radius;
        }

        // Rect-rect (AABB)
        if (a.width && a.height && b.width && b.height) {
            return !(
                a.x + a.width / 2 < b.x - b.width / 2 ||
                a.x - a.width / 2 > b.x + b.width / 2 ||
                a.y + a.height / 2 < b.y - b.height / 2 ||
                a.y - a.height / 2 > b.y + b.height / 2
            );
        }

        // Circle-rect
        if (a.radius && b.width && b.height) {
            const closestX = clamp(a.x, b.x - b.width / 2, b.x + b.width / 2);
            const closestY = clamp(a.y, b.y - b.height / 2, b.y + b.height / 2);
            return distance(a.x, a.y, closestX, closestY) < a.radius;
        }

        return false;
    }

    // ==========================================
    // Plugin API
    // ==========================================
    function use(plugin) {
        plugins.push(plugin);
        plugin(app);
    }

    // ==========================================
    // Main Loop
    // ==========================================
    function loop(t) {
        if (!running) return;

        const dt = t - last;
        last = t;

        updateCoroutines(dt);
        updateTweens(dt);

        // Update all objects
        for (const layer of layers) {
            if (!layer.visible) continue;
            for (const o of layer.objects) {
                if (o.visible !== false) {
                    o.update?.(dt);
                }
            }
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all objects
        for (const layer of layers) {
            if (!layer.visible) continue;

            for (const o of layer.objects) {
                if (o.visible === false) continue;

                ctx.save();
                ctx.globalAlpha = o.opacity ?? 1;

                if (o.applyTransform) {
                    ctx.save();
                    ctx.translate(o.x, o.y);
                    ctx.rotate(o.rotation);
                    ctx.scale(o.scaleX, o.scaleY);
                    o.draw?.(ctx);
                    ctx.restore();
                } else {
                    o.draw?.(ctx);
                }

                ctx.restore();
            }
        }

        resetInputStates();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // ==========================================
    // Stop app
    // ==========================================
    function stop() {
        running = false;
    }

    // ==========================================
    // Public API
    // ==========================================
    const app = {
        canvas,
        ctx,
        root,
        createLayer,
        start: startCoroutine,
        stop,
        use,
        layers,
        pointer,
        keys,
        animateTo,
        ease,
        easings,
        lerp,
        clamp,
        map,
        distance,
        angle,
        randomRange,
        randomInt,
        stopCoroutine,
        Vector2,
        colors,
        createParticleEmitter,
        createRect,
        createCircle,
        createLine,
        createText,
        createSprite,
        createCamera,
        tween,
        tweens,
        checkCollision
    };

    return app;
}
