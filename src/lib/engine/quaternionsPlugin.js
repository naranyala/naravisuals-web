// quaternionsPlugin.js — Game-ready 3D rotation system

export function quaternionsPlugin(app) {

    // ==========================================
    // QUATERNION CONSTRUCTOR
    // ==========================================

    const Quaternion = (x = 0, y = 0, z = 0, w = 1) => ({ x, y, z, w });

    // ==========================================
    // CORE OPERATIONS
    // ==========================================

    const quaternionOps = {
        multiply(q1, q2) {
            return Quaternion(
                q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
                q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
                q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w,
                q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z
            );
        },

        conjugate(q) {
            return Quaternion(-q.x, -q.y, -q.z, q.w);
        },

        magnitude(q) {
            return Math.hypot(q.x, q.y, q.z, q.w);
        },

        inverse(q) {
            const mag = this.magnitude(q);
            const normSquared = mag * mag;
            return this.scale(this.conjugate(q), 1 / normSquared);
        },

        scale(q, scalar) {
            return Quaternion(q.x * scalar, q.y * scalar, q.z * scalar, q.w * scalar);
        },

        normalize(q) {
            return this.scale(q, 1 / this.magnitude(q));
        },

        dot(q1, q2) {
            return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
        },

        add(q1, q2) {
            return Quaternion(q1.x + q2.x, q1.y + q2.y, q1.z + q2.z, q1.w + q2.w);
        },

        subtract(q1, q2) {
            return Quaternion(q1.x - q2.x, q1.y - q2.y, q1.z - q2.z, q1.w - q2.w);
        },

        clone(q) {
            return Quaternion(q.x, q.y, q.z, q.w);
        },

        equals(q1, q2, epsilon = 1e-6) {
            return Math.abs(q1.x - q2.x) < epsilon &&
                Math.abs(q1.y - q2.y) < epsilon &&
                Math.abs(q1.z - q2.z) < epsilon &&
                Math.abs(q1.w - q2.w) < epsilon;
        },

        identity() {
            return Quaternion(0, 0, 0, 1);
        }
    };

    // ==========================================
    // ADVANCED MATH
    // ==========================================

    Object.assign(quaternionOps, {
        log(q) {
            const vec = app.Vec(q.x, q.y, q.z);
            const vecMag = vec.length();

            if (vecMag < 1e-6) {
                return Quaternion(0, 0, 0, Math.log(q.w));
            }

            const angle = Math.atan2(vecMag, q.w);
            const normalized = vec.normalize().scale(angle);

            return Quaternion(...normalized.toArray(), Math.log(this.magnitude(q)));
        },

        exp(q) {
            const vec = app.Vec(q.x, q.y, q.z);
            const vecMag = vec.length();

            if (vecMag < 1e-6) {
                return Quaternion(0, 0, 0, Math.exp(q.w));
            }

            const expW = Math.exp(q.w);
            const normalized = vec.normalize().scale(Math.sin(vecMag));

            return this.scale(
                Quaternion(...normalized.toArray(), Math.cos(vecMag)),
                expW
            );
        }
    });

    // ==========================================
    // INTERPOLATION
    // ==========================================

    Object.assign(quaternionOps, {
        slerp(q1, q2, t) {
            const dotProduct = Math.max(-1, Math.min(1, this.dot(q1, q2)));

            if (Math.abs(dotProduct) > 0.9995) {
                return this.normalize(
                    this.add(this.scale(q1, 1 - t), this.scale(q2, t))
                );
            }

            const theta = Math.acos(dotProduct);
            const invSinTheta = 1 / Math.sin(theta);

            return this.normalize(
                this.add(
                    this.scale(q1, Math.sin((1 - t) * theta) * invSinTheta),
                    this.scale(q2, Math.sin(t * theta) * invSinTheta)
                )
            );
        },

        lerp(q1, q2, t) {
            return this.normalize(
                this.add(this.scale(q1, 1 - t), this.scale(q2, t))
            );
        },

        squad(q1, q2, s1, s2, t) {
            const slerp1 = this.slerp(q1, q2, t);
            const slerp2 = this.slerp(s1, s2, t);
            const logDiff = this.subtract(
                this.log(this.multiply(this.conjugate(q1), q2)),
                this.log(this.multiply(this.conjugate(s1), s2))
            );

            return this.normalize(
                this.multiply(
                    this.multiply(slerp1, slerp2),
                    this.exp(this.scale(logDiff, t * (1 - t)))
                )
            );
        },

        damp(source, destination, lambda, deltaTime) {
            return this.slerp(source, destination, 1 - Math.exp(-lambda * deltaTime));
        },

        spring(q, velocity, target, stiffness, damping, deltaTime) {
            const rotDiff = this.logDifference(q, target);
            const accel = this.subtract(
                this.scale(rotDiff, -stiffness),
                this.scale(velocity, damping)
            );

            const newVel = this.add(velocity, this.scale(accel, deltaTime));
            const newRot = this.multiply(q, this.exp(this.scale(newVel, deltaTime)));

            return { Q: newRot, V: newVel };
        }
    });

    // ==========================================
    // AXIS-ANGLE CONVERSION
    // ==========================================

    Object.assign(quaternionOps, {
        fromAxisAngle(axis, angle) {
            const halfAngle = angle * 0.5;
            const normalized = axis.normalized();
            const sinHalf = Math.sin(halfAngle);

            return Quaternion(
                normalized.x * sinHalf,
                normalized.y * sinHalf,
                normalized.z * sinHalf,
                Math.cos(halfAngle)
            );
        },

        toAxisAngle(q) {
            const vec = app.Vec(q.x, q.y, q.z);
            const vecMag = vec.length();

            if (vecMag < 1e-6) {
                return { axis: app.Vec(0, 1, 0), angle: 0 };
            }

            return {
                axis: vec.div(vecMag),
                angle: 2 * Math.atan2(vecMag, q.w)
            };
        },

        scaleAngle(q, scale) {
            const { axis, angle } = this.toAxisAngle(q);
            return this.fromAxisAngle(axis, angle * scale);
        }
    });

    // ==========================================
    // EULER CONVERSION
    // ==========================================

    Object.assign(quaternionOps, {
        fromEuler(yaw, pitch, roll) {
            const qYaw = this.fromAxisAngle(app.Vec(0, 1, 0), yaw);
            const qPitch = this.fromAxisAngle(app.Vec(1, 0, 0), pitch);
            const qRoll = this.fromAxisAngle(app.Vec(0, 0, 1), roll);

            return this.multiply(this.multiply(qYaw, qPitch), qRoll);
        },

        toEuler(q) {
            const sinRoll = 2 * (q.w * q.x + q.y * q.z);
            const cosRoll = 1 - 2 * (q.x * q.x + q.y * q.y);
            const roll = Math.atan2(sinRoll, cosRoll);

            const sinPitch = 2 * (q.w * q.y - q.z * q.x);
            const pitch = Math.abs(sinPitch) >= 1
                ? Math.sign(sinPitch) * Math.PI / 2
                : Math.asin(sinPitch);

            const sinYaw = 2 * (q.w * q.z + q.x * q.y);
            const cosYaw = 1 - 2 * (q.y * q.y + q.z * q.z);
            const yaw = Math.atan2(sinYaw, cosYaw);

            return { yaw, pitch, roll };
        }
    });

    // ==========================================
    // MATRIX CONVERSION
    // ==========================================

    Object.assign(quaternionOps, {
        fromMatrix4(m) {
            const trace = m[0] + m[5] + m[10];
            let q;

            if (trace > 0) {
                const s = 0.5 / Math.sqrt(trace + 1);
                q = Quaternion(
                    (m[6] - m[9]) * s,
                    (m[8] - m[2]) * s,
                    (m[1] - m[4]) * s,
                    0.25 / s
                );
            } else if (m[0] > m[5] && m[0] > m[10]) {
                const s = 2 * Math.sqrt(1 + m[0] - m[5] - m[10]);
                q = Quaternion(
                    0.25 * s,
                    (m[4] + m[1]) / s,
                    (m[2] + m[8]) / s,
                    (m[6] - m[9]) / s
                );
            } else if (m[5] > m[10]) {
                const s = 2 * Math.sqrt(1 + m[5] - m[0] - m[10]);
                q = Quaternion(
                    (m[4] + m[1]) / s,
                    0.25 * s,
                    (m[9] + m[6]) / s,
                    (m[8] - m[2]) / s
                );
            } else {
                const s = 2 * Math.sqrt(1 + m[10] - m[0] - m[5]);
                q = Quaternion(
                    (m[2] + m[8]) / s,
                    (m[9] + m[6]) / s,
                    0.25 * s,
                    (m[1] - m[4]) / s
                );
            }

            return this.normalize(q);
        },

        toMatrix4(q) {
            const xx = q.x * q.x, yy = q.y * q.y, zz = q.z * q.z, ww = q.w * q.w;
            const xy = q.x * q.y, xz = q.x * q.z, xw = q.x * q.w;
            const yz = q.y * q.z, yw = q.y * q.w, zw = q.z * q.w;

            return [
                ww + xx - yy - zz, 2 * xy - 2 * zw, 2 * xz + 2 * yw, 0,
                2 * xy + 2 * zw, ww - xx + yy - zz, 2 * yz - 2 * xw, 0,
                2 * xz - 2 * yw, 2 * yz + 2 * xw, ww - xx - yy + zz, 0,
                0, 0, 0, 1
            ];
        }
    });

    // ==========================================
    // ROTATION UTILITIES
    // ==========================================

    Object.assign(quaternionOps, {
        rotateVector(q, vec) {
            const vecQuat = Quaternion(vec.x, vec.y, vec.z, 0);
            const result = this.multiply(this.multiply(q, vecQuat), this.conjugate(q));
            return app.Vec(result.x, result.y, result.z);
        },

        rotateX(angle) {
            return this.fromAxisAngle(app.Vec(1, 0, 0), angle);
        },

        rotateY(angle) {
            return this.fromAxisAngle(app.Vec(0, 1, 0), angle);
        },

        rotateZ(angle) {
            return this.fromAxisAngle(app.Vec(0, 0, 1), angle);
        },

        lookRotation(direction, up = app.Vec(0, 1, 0)) {
            const forward = direction.normalized();
            const right = app.Vec.cross(up, forward).normalized();
            const actualUp = app.Vec.cross(forward, right);

            const matrix = [
                right.x, actualUp.x, forward.x, 0,
                right.y, actualUp.y, forward.y, 0,
                right.z, actualUp.z, forward.z, 0,
                0, 0, 0, 1
            ];

            return this.fromMatrix4(matrix);
        },

        swingTwist(q, twistAxis) {
            const projection = app.Vec.dot(app.Vec(q.x, q.y, q.z), twistAxis);

            const twist = this.normalize(Quaternion(
                twistAxis.x * projection,
                twistAxis.y * projection,
                twistAxis.z * projection,
                q.w
            ));

            const swing = this.multiply(q, this.conjugate(twist));
            return { swing, twist };
        },

        logDifference(q1, q2) {
            return this.log(this.multiply(this.conjugate(q1), q2));
        }
    });

    // ==========================================
    // RANDOM GENERATION
    // ==========================================

    Object.assign(quaternionOps, {
        random() {
            return this.normalize(Quaternion(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ));
        },

        randomUniform() {
            const u = Math.random(), v = Math.random(), w = Math.random();
            const s1 = Math.sqrt(1 - u), s2 = Math.sqrt(u);
            const t1 = Math.PI * 2 * v, t2 = Math.PI * 2 * w;

            return Quaternion(
                s1 * Math.sin(t1),
                s1 * Math.cos(t1),
                s2 * Math.sin(t2),
                s2 * Math.cos(t2)
            );
        }
    });

    // ==========================================
    // MUTABLE OPERATIONS
    // ==========================================

    Quaternion.prototype = {
        multiply$(q) {
            const result = quaternionOps.multiply(this, q);
            this.x = result.x;
            this.y = result.y;
            this.z = result.z;
            this.w = result.w;
            return this;
        },

        normalize$() {
            const mag = quaternionOps.magnitude(this);
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
            this.w /= mag;
            return this;
        },

        slerp$(target, t) {
            const result = quaternionOps.slerp(this, target, t);
            this.x = result.x;
            this.y = result.y;
            this.z = result.z;
            this.w = result.w;
            return this;
        },

        scaleAngle$(scale) {
            const result = quaternionOps.scaleAngle(this, scale);
            this.x = result.x;
            this.y = result.y;
            this.z = result.z;
            this.w = result.w;
            return this;
        },

        set$(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
            return this;
        },

        clone$() {
            return Quaternion(this.x, this.y, this.z, this.w);
        }
    };

    // ==========================================
    // 3D OBJECT INTEGRATION
    // ==========================================

    const originalAdd = app.root.add;
    app.root.add = function(obj) {
        obj = originalAdd.call(this, obj);

        if (obj.quaternion === undefined) {
            obj.quaternion = quaternionOps.identity();
        }

        obj.rotate = function(quatOrAxis, angle) {
            if (angle !== undefined) {
                const rotation = quaternionOps.fromAxisAngle(quatOrAxis, angle);
                this.quaternion = quaternionOps.multiply(rotation, this.quaternion);
            } else {
                this.quaternion = quaternionOps.multiply(quatOrAxis, this.quaternion);
            }
        };

        obj.lookAt = function(target, up = app.Vec(0, 1, 0)) {
            const direction = target.sub?.(this.position)?.normalized() ||
                app.Vec(
                    target.x - (this.x || 0),
                    target.y - (this.y || 0),
                    target.z || 0
                ).normalized();

            this.quaternion = quaternionOps.lookRotation(direction, up);
        };

        obj.applyQuaternion = vec => quaternionOps.rotateVector(obj.quaternion, vec);

        return obj;
    };

    // ==========================================
    // VISUALIZATION
    // ==========================================

    function drawGizmo(q, pos = app.Vec(0, 0, 0), size = 40) {
        const axes = [
            { vec: quaternionOps.rotateVector(q, app.Vec(1, 0, 0)), color: '#f00' },
            { vec: quaternionOps.rotateVector(q, app.Vec(0, 1, 0)), color: '#0f0' },
            { vec: quaternionOps.rotateVector(q, app.Vec(0, 0, 1)), color: '#00f' }
        ];

        axes.forEach(axis => {
            const end = pos.add(axis.vec.scale(size));
            app.draw.line(
                app.Line(app.Pt(pos.x, pos.y), app.Pt(end.x, end.y)),
                { stroke: axis.color, width: 3 }
            );
        });
    }

    // ==========================================
    // EXPORT
    // ==========================================

    Object.assign(app, {
        Quat: Quaternion,
        Q: quaternionOps,
        drawGizmo
    });

    console.log('⚡ quaternionsPlugin — gimbal-lock-free 3D rotations');
}
