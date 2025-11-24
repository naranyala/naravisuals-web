// tinyphys_3d.js

// =====================
// 1. Vector and Quaternion Classes
// =====================

class Tp3dVec3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Tp3dQuat {
    constructor(x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
}

// =====================
// 2. Enum and Shape Classes
// =====================

const TP3D_SHAPE_TYPE = {
    SPHERE: 0,
    BOX: 1
};

class Tp3dShape {
    constructor(type, data) {
        this.type = type;
        // Union is replaced by properties that are used based on type
        this.radius = 0.0;
        this.half_extents = new Tp3dVec3(0.0, 0.0, 0.0);

        if (type === TP3D_SHAPE_TYPE.SPHERE) {
            this.radius = data;
        } else if (type === TP3D_SHAPE_TYPE.BOX) {
            this.half_extents = data;
        }
    }
}

// =====================
// 3. Math Helpers (tp3d_vec3 functions)
// =====================

class Tp3dMath {
    static v3(x, y, z) { return new Tp3dVec3(x, y, z); }
    static add(a, b) { return new Tp3dVec3(a.x + b.x, a.y + b.y, a.z + b.z); }
    static sub(a, b) { return new Tp3dVec3(a.x - b.x, a.y - b.y, a.z - b.z); }
    static scale(v, s) { return new Tp3dVec3(v.x * s, v.y * s, v.z * s); }
    static dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
    static cross(a, b) {
        return new Tp3dVec3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }
    static length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    }
    static normalize(v) {
        const len = Tp3dMath.length(v);
        const epsilon = 0.00001;
        if (len > epsilon) {
            return Tp3dMath.scale(v, 1.0 / len);
        }
        return Tp3dMath.v3(0, 0, 0);
    }
}

// =====================
// 4. Rigid Body and Collision Classes
// =====================

class Tp3dBody {
    constructor() {
        this.position = Tp3dMath.v3(0, 0, 0);
        this.velocity = Tp3dMath.v3(0, 0, 0);
        this.acceleration = Tp3dMath.v3(0, 0, 0);
        this.rotation = new Tp3dQuat(0, 0, 0, 1);
        this.angular_velocity = Tp3dMath.v3(0, 0, 0);
        
        this.mass = 1.0;
        this.inv_mass = 1.0;
        this.restitution = 0.5;
        this.friction = 0.3;
        
        // Initializing with a default sphere shape
        this.shape = new Tp3dShape(TP3D_SHAPE_TYPE.SPHERE, 0.5);
        this.is_static = false;
    }
    
    // Equivalent to tp3d_body_set_sphere
    setSphere(radius) {
        this.shape.type = TP3D_SHAPE_TYPE.SPHERE;
        this.shape.radius = radius;
        this.shape.half_extents = Tp3dMath.v3(0, 0, 0); // Clear other data
    }

    // Equivalent to tp3d_body_set_box
    setBox(width, height, depth) {
        this.shape.type = TP3D_SHAPE_TYPE.BOX;
        this.shape.half_extents = Tp3dMath.v3(width * 0.5, height * 0.5, depth * 0.5);
        this.shape.radius = 0.0; // Clear other data
    }

    // Equivalent to tp3d_body_apply_force
    applyForce(force) {
        if (this.is_static) return;
        const accel = Tp3dMath.scale(force, this.inv_mass);
        this.acceleration = Tp3dMath.add(this.acceleration, accel);
    }

    // Equivalent to tp3d_body_apply_impulse
    applyImpulse(impulse) {
        if (this.is_static) return;
        const vel_change = Tp3dMath.scale(impulse, this.inv_mass);
        this.velocity = Tp3dMath.add(this.velocity, vel_change);
    }
}

class Tp3dCollision {
    constructor() {
        /** @type {Tp3dBody | null} */
        this.body_a = null;
        /** @type {Tp3dBody | null} */
        this.body_b = null;
        this.normal = Tp3dMath.v3(0, 0, 0);
        this.penetration = 0.0;
        this.is_colliding = false;
    }
}

// =====================
// 5. World Class (API and implementation)
// =====================

class Tp3dWorld {
    /**
     * @param {number} max_bodies
     */
    constructor(max_bodies) {
        // C: dynamic allocation (malloc) replaced by JS dynamic array
        /** @type {Tp3dBody[]} */
        this.bodies = [];
        this.body_count = 0;
        this.body_capacity = max_bodies;
        this.gravity = Tp3dMath.v3(0, -9.81, 0);
    }
    
    // Equivalent to tp3d_create_world - note: JS uses the constructor.
    // Equivalent to tp3d_destroy_world - JS garbage collection handles cleanup.

    // Equivalent to tp3d_add_body
    addBody() {
        if (this.body_count >= this.body_capacity) return null;
        
        const body = new Tp3dBody();
        // C: memset(body, 0, sizeof(tp3d_body)); replaced by class defaults
        
        this.bodies.push(body);
        this.body_count++;
        return body;
    }

    // --- Internal Collision Helpers ---

    /**
     * @param {Tp3dBody} a
     * @param {Tp3dBody} b
     * @param {Tp3dCollision} col
     * @returns {boolean}
     */
    _checkSphereSphere(a, b, col) {
        const diff = Tp3dMath.sub(b.position, a.position);
        const dist = Tp3dMath.length(diff);
        const sum_radius = a.shape.radius + b.shape.radius;
        
        if (dist < sum_radius) {
            col.body_a = a;
            col.body_b = b;
            col.penetration = sum_radius - dist;
            col.normal = Tp3dMath.normalize(diff);
            col.is_colliding = true;
            return true;
        }
        return false;
    }

    /**
     * @param {Tp3dCollision} col
     */
    _resolveCollision(col) {
        const a = col.body_a;
        const b = col.body_b;
        
        // Positional correction
        const total_inv_mass = a.inv_mass + b.inv_mass;
        if (total_inv_mass > 0.0) {
            // Note: The C code used penetration/total_inv_mass for correction magnitude, which might be simplified
            // for the sake of separation. We keep the logic as close as possible.
            const correction = Tp3dMath.scale(col.normal, col.penetration / total_inv_mass);
            
            if (!a.is_static) {
                a.position = Tp3dMath.sub(a.position, Tp3dMath.scale(correction, a.inv_mass));
            }
            if (!b.is_static) {
                b.position = Tp3dMath.add(b.position, Tp3dMath.scale(correction, b.inv_mass));
            }
        }
        
        // Relative velocity
        let rel_vel = Tp3dMath.sub(b.velocity, a.velocity);
        let vel_along_normal = Tp3dMath.dot(rel_vel, col.normal);
        
        if (vel_along_normal > 0) return; // Objects moving apart
        
        // Impulse calculation
        const e = Math.min(a.restitution, b.restitution);
        
        let j = -(1.0 + e) * vel_along_normal;
        j /= total_inv_mass;
        
        // Apply impulse
        const impulse = Tp3dMath.scale(col.normal, j);
        if (!a.is_static) {
            a.velocity = Tp3dMath.sub(a.velocity, Tp3dMath.scale(impulse, a.inv_mass));
        }
        if (!b.is_static) {
            b.velocity = Tp3dMath.add(b.velocity, Tp3dMath.scale(impulse, b.inv_mass));
        }
        
        // Apply friction
        rel_vel = Tp3dMath.sub(b.velocity, a.velocity); // Recalculate relative velocity after normal impulse
        
        const rel_vel_dot_normal = Tp3dMath.dot(rel_vel, col.normal);
        // Tangent is (relative velocity) - (projection onto normal)
        let tangent = Tp3dMath.sub(rel_vel, Tp3dMath.scale(col.normal, rel_vel_dot_normal));

        const tangent_len = Tp3dMath.length(tangent);
        if (tangent_len > 0.0001) {
            tangent = Tp3dMath.scale(tangent, 1.0 / tangent_len); // Normalize tangent
            
            const friction = (a.friction + b.friction) * 0.5;
            let jt = -Tp3dMath.dot(rel_vel, tangent) * friction;
            jt /= total_inv_mass;
            
            // Apply tangential impulse
            const friction_impulse = Tp3dMath.scale(tangent, jt);
            if (!a.is_static) {
                a.velocity = Tp3dMath.sub(a.velocity, Tp3dMath.scale(friction_impulse, a.inv_mass));
            }
            if (!b.is_static) {
                b.velocity = Tp3dMath.add(b.velocity, Tp3dMath.scale(friction_impulse, b.inv_mass));
            }
        }
    }

    // Equivalent to tp3d_step
    /**
     * @param {number} dt - Delta time
     */
    step(dt) {
        // 1. Integrate forces/motion
        for (let i = 0; i < this.body_count; i++) {
            const body = this.bodies[i];
            if (body.is_static) continue;
            
            // Apply gravity
            const gravity_force = Tp3dMath.scale(this.gravity, body.mass);
            body.applyForce(gravity_force);
            
            // Update velocity (Semi-implicit Euler)
            body.velocity = Tp3dMath.add(body.velocity, Tp3dMath.scale(body.acceleration, dt));
            body.acceleration = Tp3dMath.v3(0, 0, 0); // Clear accumulated acceleration
            
            // Update position
            body.position = Tp3dMath.add(body.position, Tp3dMath.scale(body.velocity, dt));
        }
        
        // 2. Detect and resolve collisions (O(n^2) Broad/Narrowphase)
        for (let i = 0; i < this.body_count; i++) {
            for (let j = i + 1; j < this.body_count; j++) {
                const a = this.bodies[i];
                const b = this.bodies[j];
                
                if (a.is_static && b.is_static) continue;
                
                const col = new Tp3dCollision();
                // Collision Dispatch (currently only Sphere-Sphere is implemented in C)
                if (a.shape.type === TP3D_SHAPE_TYPE.SPHERE && b.shape.type === TP3D_SHAPE_SPHERE) {
                    if (this._checkSphereSphere(a, b, col)) {
                        this._resolveCollision(col);
                    }
                }
                // (Future: Add Box-Box, Sphere-Box checks here)
            }
        }
    }
}
