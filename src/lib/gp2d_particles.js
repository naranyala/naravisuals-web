
// particles.js
// ES module / plain JS single-file particle utility inspired by particles.h (raylib).
// Usage: import { ParticleEmitter, ParticleEmitShape, Affectors } from './particles.js'

/**
 * @typedef {{x:number,y:number}} Vec2
 * @typedef {{r:number,g:number,b:number,a:number}} Color
 */

/** Emitter shapes (same as ParticleEmitShape enum) */
export const ParticleEmitShape = {
    POINT: 0,
    SPHERE: 1
};

/** Built-in affectors collection (functions accept (p, dt, userdata)) */
export const Affectors = {
    Gravity: (p, dt, userdata) => {
        // userdata: {x,y} gravity accel
        p.vel.x += userdata.x * dt;
        p.vel.y += userdata.y * dt;
    },

    LinearDrag: (p, dt, userdata) => {
        // userdata: float drag coefficient
        const drag = userdata;
        const f = 1.0 - drag * dt;
        p.vel.x *= f;
        p.vel.y *= f;
    },

    SphereOrbit: (p, dt, userdata) => {
        // userdata: float speed (radians/sec)
        const speed = userdata;
        const vx = p.vel.x, vy = p.vel.y;
        p.vel.x = vx * Math.cos(speed * dt) - vy * Math.sin(speed * dt);
        p.vel.y = vx * Math.sin(speed * dt) + vy * Math.cos(speed * dt);
    }
};

/** Utility functions */
function randf(a, b) {
    return a + Math.random() * (b - a);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function lerpColor(a, b, t) {
    return {
        r: lerp(a.r, b.r, t),
        g: lerp(a.g, b.g, t),
        b: lerp(a.b, b.b, t),
        a: lerp(a.a, b.a, t)
    };
}

// Random point on unit sphere (3D)
function randomUnitSphere() {
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const f = Math.sqrt(Math.max(0, 1 - u * u));
    return { x: f * Math.cos(theta), y: f * Math.sin(theta), z: u };
}

function colorToCss(col) {
    // col channels assumed 0..255 for r/g/b and 0..255 for a (mirrors raylib Color)
    const a = (col.a === undefined) ? 1 : col.a / 255;
    return `rgba(${Math.round(col.r)},${Math.round(col.g)},${Math.round(col.b)},${a})`;
}

/** Particle object (plain POJO) */
function createParticle() {
    return {
        active: false,
        age: 0,
        lifetime: 0,
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        acc: { x: 0, y: 0 },
        size: 1,
        sizeEnd: 1,
        color: { r: 255, g: 255, b: 255, a: 255 },
        colorEnd: { r: 0, g: 0, b: 0, a: 0 },
        rot: 0,
        rotSpeed: 0
    };
}

/** ParticleEmitter class (main API) */
export class ParticleEmitter {
    /**
     * @param {number} maxParticles
     */
    constructor(maxParticles = 512) {
        this.maxParticles = Math.max(1, maxParticles);
        this.pool = new Array(this.maxParticles);
        for (let i = 0; i < this.maxParticles; i++) this.pool[i] = createParticle();

        // Emitter state
        this.position = { x: 0, y: 0 };
        this.emitRate = 0; // particles / sec
        this.emitAccumulator = 0;

        // Lifetime
        this.lifetimeMin = 1;
        this.lifetimeMax = 2;

        // Sizes
        this.sizeStartMin = 2;
        this.sizeStartMax = 4;
        this.sizeEndMin = 1;
        this.sizeEndMax = 1;

        // Vel/acc ranges
        this.velMin = { x: -10, y: -10 };
        this.velMax = { x: 10, y: 10 };
        this.accMin = { x: 0, y: 0 };
        this.accMax = { x: 0, y: 0 };

        // Rotation
        this.rotSpeedMin = 0;
        this.rotSpeedMax = 0;

        // Colors (raylib style 0..255 channels)
        this.colorStartMin = { r: 255, g: 255, b: 255, a: 255 };
        this.colorStartMax = { r: 255, g: 255, b: 255, a: 255 };
        this.colorEndMin = { r: 0, g: 0, b: 0, a: 0 };
        this.colorEndMax = { r: 0, g: 0, b: 0, a: 0 };

        // Shape
        this.shape = ParticleEmitShape.POINT;
        this.sphereRadius = 0;

        this.enabled = true;

        // Affectors
        this.affectors = []; // each: {apply: fn, userdata: any}

        // convenience: default draw style
        this.drawStyle = { useFill: true };
    }

    /** Destroy pool (not strictly necessary in JS, but clears references) */
    destroy() {
        this.pool.length = 0;
        this.affectors.length = 0;
    }

    /**
     * Add an affector: function(particle, dt, userdata)
     * @param {function} fn
     * @param {*} userdata
     */
    addAffector(fn, userdata = undefined) {
        this.affectors.push({ apply: fn, userdata });
    }

    // Internal: emit single particle (mirrors pf_emit_particle)
    _emitParticle() {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (p.active) continue;

            p.active = true;
            p.age = 0;
            p.lifetime = randf(this.lifetimeMin, this.lifetimeMax);

            if (this.shape === ParticleEmitShape.POINT) {
                p.pos.x = this.position.x;
                p.pos.y = this.position.y;
                p.vel.x = randf(this.velMin.x, this.velMax.x);
                p.vel.y = randf(this.velMin.y, this.velMax.y);
            } else if (this.shape === ParticleEmitShape.SPHERE) {
                const s = randomUnitSphere();
                const scaled = {
                    x: s.x * this.sphereRadius,
                    y: s.y * this.sphereRadius,
                    z: s.z * this.sphereRadius
                };

                p.pos.x = this.position.x + scaled.x;
                // note: original C code used y * 0.6f scaling for vertical offset
                p.pos.y = this.position.y + scaled.y * 0.6;

                p.vel.x = scaled.x;
                p.vel.y = scaled.y;
            }

            p.acc.x = randf(this.accMin.x, this.accMax.x);
            p.acc.y = randf(this.accMin.y, this.accMax.y);

            p.size = randf(this.sizeStartMin, this.sizeStartMax);
            p.sizeEnd = randf(this.sizeEndMin, this.sizeEndMax);

            p.rotSpeed = randf(this.rotSpeedMin, this.rotSpeedMax);

            p.color = {
                r: randf(this.colorStartMin.r, this.colorStartMax.r),
                g: randf(this.colorStartMin.g, this.colorStartMax.g),
                b: randf(this.colorStartMin.b, this.colorStartMax.b),
                a: randf(this.colorStartMin.a, this.colorStartMax.a)
            };

            p.colorEnd = {
                r: randf(this.colorEndMin.r, this.colorEndMax.r),
                g: randf(this.colorEndMin.g, this.colorEndMax.g),
                b: randf(this.colorEndMin.b, this.colorEndMax.b),
                a: randf(this.colorEndMin.a, this.colorEndMax.a)
            };

            p.rot = 0;
            return; // emit only one per call
        }
    }

    /**
     * Update emitter and particles
     * @param {number} dt seconds
     */
    update(dt) {
        if (!this.enabled) return;

        // Emission logic (emitAccumulator accumulates particles to spawn)
        this.emitAccumulator += dt * this.emitRate;
        while (this.emitAccumulator >= 1.0) {
            this._emitParticle();
            this.emitAccumulator -= 1.0;
        }

        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            p.age += dt;
            const t = p.age / p.lifetime;

            if (t >= 1.0) {
                p.active = false;
                continue;
            }

            p.vel.x += p.acc.x * dt;
            p.vel.y += p.acc.y * dt;

            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;

            p.rot += p.rotSpeed * dt;

            // Size update: same formula as C version (keeps similar feel)
            p.size = p.size + (p.sizeEnd - p.size) * t;

            // Color lerp
            p.color = lerpColor(p.color, p.colorEnd, t);

            // Apply affectors
            for (let a = 0; a < this.affectors.length; a++) {
                this.affectors[a].apply(p, dt, this.affectors[a].userdata);
            }
        }
    }

    /**
     * Draw emitter particles to 2D canvas context
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.pool[i];
            if (!p.active) continue;

            ctx.save();
            ctx.translate(p.pos.x, p.pos.y);
            ctx.rotate(p.rot);

            const css = colorToCss(p.color);
            if (this.drawStyle.useFill) {
                ctx.fillStyle = css;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.strokeStyle = css;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }
}
