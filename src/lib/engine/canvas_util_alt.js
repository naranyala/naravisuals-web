// canvas_util.js — Enhanced single-file canvas engine v2.0

export function createCanvasApp(canvas) {
    const ctx = canvas.getContext("2d");

    let running = true;
    let last = performance.now();
    let fps = 60;
    let frameCount = 0;
    let lastFpsUpdate = 0;

    const layers = [];
    const coroutines = [];
    const plugins = [];
    const audioCache = new Map();
    const imageCache = new Map();

    // ==========================================
    // Enhanced Helpers & Utilities
    // ==========================================
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const degToRad = (deg) => deg * Math.PI / 180;
    const radToDeg = (rad) => rad * 180 / Math.PI;

    function ease(t) {
        return t * t * (3 - 2 * t);
    }

    // ==========================================
    // Enhanced Coroutine Scheduler
    // ==========================================
    function startCoroutine(genFn, name = null) {
        const iterator = typeof genFn === "function" ? genFn() : genFn;
        const coroutine = {
            name,
            iterator,
            wait: 0,
            paused: false,
            priority: 0
        };
        coroutines.push(coroutine);
        coroutines.sort((a, b) => b.priority - a.priority);
        return coroutine;
    }

    function stopCoroutine(name) {
        for (let i = coroutines.length - 1; i >= 0; i--) {
            if (coroutines[i].name === name) {
                coroutines.splice(i, 1);
            }
        }
    }

    function pauseCoroutine(name) {
        coroutines.forEach(c => {
            if (c.name === name) c.paused = true;
        });
    }

    function resumeCoroutine(name) {
        coroutines.forEach(c => {
            if (c.name === name) c.paused = false;
        });
    }

    function updateCoroutines(dt) {
        for (let c of [...coroutines]) {
            if (c.paused || c.wait > 0) {
                if (!c.paused) c.wait -= dt;
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
    // Enhanced Transform System
    // ==========================================
    function makeTransform(obj) {
        obj.x = obj.x ?? 0;
        obj.y = obj.y ?? 0;
        obj.rotation = obj.rotation ?? 0;
        obj.scaleX = obj.scaleX ?? 1;
        obj.scaleY = obj.scaleY ?? 1;
        obj.opacity = obj.opacity ?? 1;
        obj.pivotX = obj.pivotX ?? 0;
        obj.pivotY = obj.pivotY ?? 0;

        obj.applyTransform = function(ctx) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scaleX, this.scaleY);
            ctx.translate(-this.pivotX, -this.pivotY);
        };

        obj.worldPosition = function() {
            return { x: this.x, y: this.y };
        };

        return obj;
    }

    // ==========================================
    // Enhanced Layer System with Camera
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
                this.objects.length = 0;
            }
        };
        layers.push(layer);
        layers.sort((a, b) => a.zIndex - b.zIndex);
        return layer;
    }

    // Camera system
    const camera = {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        follow: null,
        smoothness: 0.1,

        worldToScreen(wx, wy) {
            const dx = wx - this.x;
            const dy = wy - this.y;
            const rotatedX = dx * Math.cos(-this.rotation) - dy * Math.sin(-this.rotation);
            const rotatedY = dx * Math.sin(-this.rotation) + dy * Math.cos(-this.rotation);
            return {
                x: rotatedX * this.scale + canvas.width / 2,
                y: rotatedY * this.scale + canvas.height / 2
            };
        },

        screenToWorld(sx, sy) {
            const dx = (sx - canvas.width / 2) / this.scale;
            const dy = (sy - canvas.height / 2) / this.scale;
            const rotatedX = dx * Math.cos(this.rotation) - dy * Math.sin(this.rotation);
            const rotatedY = dx * Math.sin(this.rotation) + dy * Math.cos(this.rotation);
            return {
                x: rotatedX + this.x,
                y: rotatedY + this.y
            };
        },

        update(dt) {
            if (this.follow) {
                const target = this.follow.worldPosition ? this.follow.worldPosition() : this.follow;
                this.x = lerp(this.x, target.x, this.smoothness);
                this.y = lerp(this.y, target.y, this.smoothness);
            }
        }
    };

    // ==========================================
    // Enhanced Input System
    // ==========================================
    const input = {
        pointer: { x: 0, y: 0, down: false, pressed: false, released: false },
        keys: new Map(),
        wheel: 0,

        init() {
            // Pointer events
            canvas.addEventListener("pointermove", (e) => {
                const rect = canvas.getBoundingClientRect();
                this.pointer.x = e.clientX - rect.left;
                this.pointer.y = e.clientY - rect.top;
            });

            canvas.addEventListener("pointerdown", (e) => {
                this.pointer.down = true;
                this.pointer.pressed = true;
            });

            canvas.addEventListener("pointerup", (e) => {
                this.pointer.down = false;
                this.pointer.released = true;
            });

            // Keyboard events
            window.addEventListener("keydown", (e) => {
                this.keys.set(e.code, { pressed: true, down: true });
            });

            window.addEventListener("keyup", (e) => {
                this.keys.set(e.code, { pressed: false, down: false, released: true });
            });

            // Mouse wheel
            canvas.addEventListener("wheel", (e) => {
                this.wheel = Math.sign(e.deltaY);
                e.preventDefault();
            });

            // Prevent context menu
            canvas.addEventListener("contextmenu", (e) => e.preventDefault());
        },

        update() {
            // Reset one-frame states
            this.pointer.pressed = false;
            this.pointer.released = false;
            this.wheel = 0;

            // Update key states
            for (let [code, state] of this.keys) {
                state.pressed = false;
                state.released = false;
            }
        },

        isKeyDown(code) {
            return this.keys.get(code)?.down || false;
        },

        isKeyPressed(code) {
            return this.keys.get(code)?.pressed || false;
        }
    };
    input.init();

    // ==========================================
    // Asset Loading System
    // ==========================================
    async function loadImage(src) {
        if (imageCache.has(src)) return imageCache.get(src);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                imageCache.set(src, img);
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    async function loadAudio(src) {
        if (audioCache.has(src)) return audioCache.get(src);

        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                audioCache.set(src, audio);
                resolve(audio);
            };
            audio.onerror = reject;
            audio.src = src;
        });
    }

    // ==========================================
    // Enhanced Animation System
    // ==========================================
    function animateTo(obj, prop, target, duration = 500, easeFn = ease) {
        return startCoroutine(function*() {
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

    function tween(from, to, duration, update, easeFn = ease) {
        return startCoroutine(function*() {
            const t0 = performance.now();
            while (true) {
                const t = (performance.now() - t0) / duration;
                if (t >= 1) {
                    update(to);
                    break;
                }
                const current = {};
                for (const key in from) {
                    current[key] = lerp(from[key], to[key], easeFn(t));
                }
                update(current);
                yield 16;
            }
        });
    }

    // ==========================================
    // Particle System Foundation
    // ==========================================
    function createParticleSystem(config = {}) {
        const particles = [];
        const pool = [];

        const system = {
            x: config.x || 0,
            y: config.y || 0,
            emissionRate: config.emissionRate || 10,
            maxParticles: config.maxParticles || 100,
            particleLife: config.particleLife || 1000,

            createParticle() {
                let p = pool.pop();
                if (!p) {
                    p = {
                        x: this.x, y: this.y,
                        vx: 0, vy: 0,
                        life: 0, maxLife: this.particleLife,
                        scale: 1, rotation: 0,
                        alpha: 1,
                        color: '#ffffff'
                    };
                }

                // Initialize particle
                p.x = this.x;
                p.y = this.y;
                p.vx = Math.random() * 4 - 2;
                p.vy = Math.random() * 4 - 2;
                p.life = p.maxLife;
                p.scale = Math.random() * 0.5 + 0.5;

                return p;
            },

            update(dt) {
                // Emit new particles
                const toEmit = (this.emissionRate * dt) / 1000;
                for (let i = 0; i < toEmit && particles.length < this.maxParticles; i++) {
                    particles.push(this.createParticle());
                }

                // Update existing particles
                for (let i = particles.length - 1; i >= 0; i--) {
                    const p = particles[i];
                    p.life -= dt;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.alpha = p.life / p.maxLife;
                    p.scale *= 0.995;

                    if (p.life <= 0) {
                        pool.push(particles.splice(i, 1)[0]);
                    }
                }
            },

            draw(ctx) {
                ctx.save();
                particles.forEach(p => {
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x - 2 * p.scale, p.y - 2 * p.scale, 4 * p.scale, 4 * p.scale);
                });
                ctx.restore();
            }
        };

        return app.root.add(system);
    }

    // ==========================================
    // Collision Detection
    // ==========================================
    const collision = {
        circleCircle(c1, c2) {
            const dx = c1.x - c2.x;
            const dy = c1.y - c2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (c1.radius + c2.radius);
        },

        rectRect(r1, r2) {
            return r1.x < r2.x + r2.width &&
                r1.x + r1.width > r2.x &&
                r1.y < r2.y + r2.height &&
                r1.y + r1.height > r2.y;
        },

        circleRect(circle, rect) {
            const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
            const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
            const distanceX = circle.x - closestX;
            const distanceY = circle.y - closestY;
            return (distanceX * distanceX + distanceY * distanceY) < (circle.radius * circle.radius);
        },

        pointCircle(px, py, circle) {
            const dx = px - circle.x;
            const dy = py - circle.y;
            return (dx * dx + dy * dy) < (circle.radius * circle.radius);
        }
    };

    // ==========================================
    // Text Rendering
    // ==========================================
    function createText(text, x, y, style = {}) {
        return app.root.add({
            x, y,
            text,
            font: style.font || '16px Arial',
            color: style.color || '#000',
            align: style.align || 'left',
            baseline: style.baseline || 'top',
            maxWidth: style.maxWidth,

            draw(ctx) {
                ctx.font = this.font;
                ctx.fillStyle = this.color;
                ctx.textAlign = this.align;
                ctx.textBaseline = this.baseline;

                if (this.maxWidth) {
                    ctx.fillText(this.text, this.x, this.y, this.maxWidth);
                } else {
                    ctx.fillText(this.text, this.x, this.y);
                }
            }
        });
    }

    // ==========================================
    // Sprite System
    // ==========================================
    function createSprite(src, x = 0, y = 0) {
        const sprite = {
            x, y,
            image: null,
            width: 0,
            height: 0,
            frame: 0,
            frames: 1,
            frameWidth: 0,
            frameHeight: 0,
            animated: false,
            animationSpeed: 0,

            async load() {
                this.image = await loadImage(src);
                this.width = this.image.width;
                this.height = this.image.height;
                this.frameWidth = this.width;
                this.frameHeight = this.height;
                return this;
            },

            setFrames(cols, rows, totalFrames = cols * rows) {
                this.frames = totalFrames;
                this.frameWidth = this.width / cols;
                this.frameHeight = this.height / rows;
                this.animated = true;
                return this;
            },

            update(dt) {
                if (this.animated && this.animationSpeed > 0) {
                    this.frame = (this.frame + this.animationSpeed * dt / 1000) % this.frames;
                }
            },

            draw(ctx) {
                if (!this.image) return;

                ctx.save();
                this.applyTransform(ctx);

                if (this.animated) {
                    const frame = Math.floor(this.frame);
                    const sx = (frame % (this.width / this.frameWidth)) * this.frameWidth;
                    const sy = Math.floor(frame / (this.width / this.frameWidth)) * this.frameHeight;

                    ctx.drawImage(
                        this.image,
                        sx, sy, this.frameWidth, this.frameHeight,
                        -this.frameWidth / 2, -this.frameHeight / 2,
                        this.frameWidth, this.frameHeight
                    );
                } else {
                    ctx.drawImage(
                        this.image,
                        -this.width / 2, -this.height / 2,
                        this.width, this.height
                    );
                }

                ctx.restore();
            }
        };

        makeTransform(sprite);
        return sprite;
    }

    // ==========================================
    // Audio System
    // ==========================================
    const audio = {
        async play(src, volume = 1, loop = false) {
            try {
                const sound = await loadAudio(src);
                const clone = sound.cloneNode();
                clone.volume = volume;
                clone.loop = loop;
                clone.play();
                return clone;
            } catch (error) {
                console.warn('Audio load error:', error);
            }
        },

        stop(audioElement) {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        }
    };

    // ==========================================
    // Debug System
    // ==========================================
    const debug = {
        enabled: true,
        fps: 0,
        objectCount: 0,
        drawCalls: 0,

        draw(ctx) {
            if (!this.enabled) return;

            this.objectCount = layers.reduce((sum, layer) => sum + layer.objects.length, 0);

            ctx.save();
            ctx.font = '12px monospace';
            ctx.fillStyle = '#00ff00';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';

            const info = [
                `FPS: ${Math.round(this.fps)}`,
                `Objects: ${this.objectCount}`,
                `Layers: ${layers.length}`,
                `Coroutines: ${coroutines.length}`
            ];

            info.forEach((text, i) => {
                ctx.fillText(text, 10, 10 + i * 18);
            });

            ctx.restore();
        }
    };

    // ==========================================
    // Plugin API
    // ==========================================
    function use(plugin) {
        plugins.push(plugin);
        plugin(app);
    }

    // ==========================================
    // Enhanced Main Loop
    // ==========================================
    function loop(t) {
        if (!running) return;

        const dt = t - last;
        last = t;

        // Update FPS counter
        frameCount++;
        if (t - lastFpsUpdate >= 1000) {
            debug.fps = (frameCount * 1000) / (t - lastFpsUpdate);
            frameCount = 0;
            lastFpsUpdate = t;
        }

        // Update systems
        input.update();
        camera.update(dt);
        updateCoroutines(dt);

        // Update objects
        for (const layer of layers) {
            if (!layer.visible) continue;
            for (const o of layer.objects) {
                o.update?.(dt);
            }
        }

        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        debug.drawCalls = 0;

        for (const layer of layers) {
            if (!layer.visible) continue;

            for (const o of layer.objects) {
                ctx.save();

                // Apply camera transform
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(camera.scale, camera.scale);
                ctx.rotate(camera.rotation);
                ctx.translate(-camera.x, -camera.y);

                ctx.globalAlpha = o.opacity ?? 1;

                if (o.applyTransform) {
                    ctx.save();
                    o.applyTransform(ctx);
                    o.draw?.(ctx);
                    ctx.restore();
                } else {
                    o.draw?.(ctx);
                }

                debug.drawCalls++;
                ctx.restore();
            }
        }

        // Draw debug overlay (in screen space)
        debug.draw(ctx);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);

    // ==========================================
    // Public API
    // ==========================================
    const app = {
        canvas,
        ctx,
        root: createLayer(0),
        createLayer,
        start: startCoroutine,
        stop: () => running = false,
        use,
        layers,
        input,
        camera,
        collision,
        audio,
        debug,
        animateTo,
        tween,
        createParticleSystem,
        createText,
        createSprite,
        loadImage,
        loadAudio,
        ease,
        lerp,
        clamp,
        degToRad,
        radToDeg,
        stopCoroutine,
        pauseCoroutine,
        resumeCoroutine
    };

    return app;
}
