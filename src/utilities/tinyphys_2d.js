// tinyphys_2d.js

const TP_MAX_BODIES = 1024;

class TpVec2 {
    constructor(x = 0.0, y = 0.0) {
        this.x = x;
        this.y = y;
    }
}

class TpMath {
    static v2(x, y) { return new TpVec2(x, y); }
    static add(a, b) { return TpMath.v2(a.x + b.x, a.y + b.y); }
    static sub(a, b) { return TpMath.v2(a.x - b.x, a.y - b.y); }
    static scale(a, s) { return TpMath.v2(a.x * s, a.y * s); }
    static dot(a, b) { return a.x * b.x + a.y * b.y; }
    static len2(a) { return TpMath.dot(a, a); }
    static len(a) {
        const l2 = TpMath.len2(a);
        return l2 > 0 ? Math.sqrt(l2) : 0.0;
    }
    static norm(a) {
        const l = TpMath.len(a);
        const epsilon = 1e-8;
        return (l > epsilon) ? TpMath.scale(a, 1.0 / l) : TpMath.v2(0.0, 0.0);
    }
}

class TpBody {
    constructor() {
        this.pos = TpMath.v2(0, 0);
        this.vel = TpMath.v2(0, 0);
        this.force = TpMath.v2(0, 0);
        this.radius = 0.5;
        this.mass = 1.0;
        this.inv_mass = 1.0;
        this.restitution = 0.0;
        this.damping = 0.0;
        this.is_static = false;
        this.alive = false;
        this.id = -1;
    }
}

class TpWorld {
    constructor(gravity = TpMath.v2(0.0, 9.8)) {
        this.bodies = [];
        this.count = 0;
        this.gravity = gravity;
        
        for (let i = 0; i < TP_MAX_BODIES; ++i) {
            const body = new TpBody();
            body.id = i;
            this.bodies.push(body);
        }
    }

    init(gravity) {
        this.count = 0;
        this.gravity = gravity;
        for (let i = 0; i < TP_MAX_BODIES; ++i) {
            this.bodies[i].alive = false;
        }
    }

    _integrate(b, dt) {
        if (!b.alive || b.is_static) return;

        let acc = TpMath.scale(this.gravity, b.inv_mass);
        acc = TpMath.add(acc, TpMath.scale(b.force, b.inv_mass));

        b.vel = TpMath.add(b.vel, TpMath.scale(acc, dt));

        const damp = b.damping;
        if (damp > 0.0) {
            const factor = Math.exp(-damp * dt);
            b.vel = TpMath.scale(b.vel, factor);
        }

        b.pos = TpMath.add(b.pos, TpMath.scale(b.vel, dt));
        b.force = TpMath.v2(0.0, 0.0);
    }

    _resolvePair(a, b) {
        if (!a.alive || !b.alive) return;

        let n = TpMath.sub(b.pos, a.pos);
        let dist = TpMath.len(n);
        const rsum = a.radius + b.radius;
        const epsilon = 1e-6;

        if (dist <= epsilon) {
            n = TpMath.v2(1.0, 0.0);
            dist = 1e-6;
        }

        if (dist < rsum) {
            const normal = TpMath.scale(n, 1.0 / dist);
            const penetration = rsum - dist;

            const invA = a.inv_mass;
            const invB = b.inv_mass;
            const invSum = invA + invB;

            if (invSum > 0.0) {
                const percent = 0.8;
                const slop = 0.001;
                const corrMag = (penetration - slop) > 0.0 ? percent * (penetration - slop) : 0.0;
                const correction = TpMath.scale(normal, corrMag);

                if (!a.is_static) { a.pos = TpMath.sub(a.pos, TpMath.scale(correction, invA / invSum)); }
                if (!b.is_static) { b.pos = TpMath.add(b.pos, TpMath.scale(correction, invB / invSum)); }
            }

            const rv = TpMath.sub(b.vel, a.vel);
            const velAlongNormal = TpMath.dot(rv, normal);

            if (velAlongNormal < 0.0) {
                const e = Math.max(0.0, Math.min(1.0, (a.restitution + b.restitution) * 0.5));
                
                let j = -(1.0 + e) * velAlongNormal;
                const denom = invA + invB;
                if (denom > 0.0) j /= denom;

                const impulse = TpMath.scale(normal, j);

                if (!a.is_static) { a.vel = TpMath.sub(a.vel, TpMath.scale(impulse, invA)); }
                if (!b.is_static) { b.vel = TpMath.add(b.vel, TpMath.scale(impulse, invB)); }
            }
        }
    }

    getBody(id) {
        if (id < 0 || id >= TP_MAX_BODIES) return null;
        const b = this.bodies[id];
        return b.alive ? b : null;
    }

    addBody(pos, vel, radius, mass, restitution, damping, is_static) {
        for (let i = 0; i < TP_MAX_BODIES; ++i) {
            const b = this.bodies[i];
            if (!b.alive) {
                b.pos = pos;
                b.vel = vel;
                b.force = TpMath.v2(0.0, 0.0);
                b.radius = radius > 0.0 ? radius : 0.5;
                
                b.is_static = is_static;
                
                const finalMass = b.is_static ? 0.0 : (mass > 0.0 ? mass : 1.0);
                b.mass = finalMass;
                b.inv_mass = (b.mass > 0.0) ? 1.0 / b.mass : 0.0;
                
                b.restitution = restitution;
                b.damping = damping;
                b.alive = true;
                this.count++;
                return i;
            }
        }
        return -1;
    }

    removeBody(id) {
        const b = this.getBody(id);
        if (!b) return;
        b.alive = false;
        this.count--;
    }

    applyForce(id, f) {
        const b = this.getBody(id);
        if (!b || b.is_static) return;
        b.force = TpMath.add(b.force, f);
    }

    applyImpulse(id, j) {
        const b = this.getBody(id);
        if (!b || b.is_static) return;
        b.vel = TpMath.add(b.vel, TpMath.scale(j, b.inv_mass));
    }

    step(dt) {
        if (dt <= 0.0) return;

        // Integration
        for (let i = 0; i < TP_MAX_BODIES; ++i) {
            const b = this.bodies[i];
            if (!b.alive) continue;
            this._integrate(b, dt);
        }

        // Collision Resolution (O(n^2) pair check)
        for (let i = 0; i < TP_MAX_BODIES; ++i) {
            const a = this.bodies[i];
            if (!a.alive) continue;
            
            for (let j = i + 1; j < TP_MAX_BODIES; ++j) {
                const c = this.bodies[j];
                if (!c.alive) continue;

                const rsum = a.radius + c.radius;
                const rsum2 = rsum * rsum;
                const d = TpMath.sub(c.pos, a.pos);
                const d2 = TpMath.len2(d);

                if (d2 <= rsum2) {
                    this._resolvePair(a, c);
                }
            }
        }
    }
}
