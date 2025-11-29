// particlePlugin.js - Advanced particle system plugin

export function particlePlugin(app) {
    app.particles = {
        // Create a single particle
        create(x, y, config = {}) {
            const particle = {
                x,
                y,
                vx: config.vx ?? (Math.random() - 0.5) * 4,
                vy: config.vy ?? (Math.random() - 0.5) * 4,
                life: config.life ?? 1.0,
                maxLife: config.maxLife ?? 1.0,
                size: config.size ?? 5,
                color: config.color ?? '#ffffff',
                gravity: config.gravity ?? 0,
                fade: config.fade ?? true,
                shrink: config.shrink ?? false,
                trail: config.trail ?? false,

                update(dt) {
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vy += this.gravity;
                    this.life -= dt / 1000;

                    if (this.fade) {
                        this.opacity = this.life / this.maxLife;
                    }

                    if (this.shrink) {
                        this.scaleX = this.life / this.maxLife;
                        this.scaleY = this.life / this.maxLife;
                    }

                    // Remove when dead
                    if (this.life <= 0) {
                        app.root.remove(this);
                    }
                },

                draw(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            };

            return app.root.add(particle);
        },

        // Create particle emitter
        emitter(x, y, config = {}) {
            const emitter = {
                x,
                y,
                rate: config.rate ?? 10, // particles per second
                particleConfig: config.particle ?? {},
                active: true,
                elapsed: 0,

                start() {
                    this.active = true;
                },

                stop() {
                    this.active = false;
                },

                burst(count) {
                    for (let i = 0; i < count; i++) {
                        app.particles.create(this.x, this.y, this.particleConfig);
                    }
                },

                update(dt) {
                    if (!this.active) return;

                    this.elapsed += dt / 1000;
                    const shouldEmit = this.elapsed >= (1 / this.rate);

                    if (shouldEmit) {
                        app.particles.create(this.x, this.y, this.particleConfig);
                        this.elapsed = 0;
                    }
                },

                draw() {
                    // Emitters are invisible by default
                }
            };

            return app.root.add(emitter);
        },

        // Preset: Explosion effect
        explosion(x, y, count = 30, color = '#ff6b6b') {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count;
                const speed = Math.random() * 5 + 3;

                app.particles.create(x, y, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: Math.random() * 0.8 + 0.5,
                    maxLife: 1.0,
                    size: Math.random() * 4 + 2,
                    color,
                    gravity: 0.1,
                    fade: true,
                    shrink: true
                });
            }
        },

        // Preset: Firework effect
        firework(x, y) {
            const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            for (let i = 0; i < 50; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;

                app.particles.create(x, y, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: Math.random() * 1.5 + 1,
                    maxLife: 2,
                    size: Math.random() * 3 + 2,
                    color,
                    gravity: 0.15,
                    fade: true
                });
            }
        },

        // Preset: Sparkle trail
        sparkle(x, y, color = '#ffe66d') {
            app.particles.create(x, y, {
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 0.5,
                maxLife: 0.5,
                size: Math.random() * 3 + 1,
                color,
                fade: true,
                shrink: true
            });
        },

        // Preset: Smoke effect
        smoke(x, y, color = '#888888') {
            app.particles.create(x, y, {
                vx: (Math.random() - 0.5) * 1,
                vy: -Math.random() * 2 - 1,
                life: Math.random() * 2 + 1,
                maxLife: 3,
                size: Math.random() * 8 + 5,
                color,
                fade: true,
                shrink: false
            });
        },

        // Preset: Confetti
        confetti(x, y, count = 20) {
            const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#ffd93d'];

            for (let i = 0; i < count; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];

                app.particles.create(x, y, {
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 5,
                    life: Math.random() * 2 + 2,
                    maxLife: 3,
                    size: Math.random() * 4 + 3,
                    color,
                    gravity: 0.2,
                    fade: false,
                    shrink: false
                });
            }
        }
    };
}
