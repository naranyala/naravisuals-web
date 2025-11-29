// physicsPlugin.js - Physics simulation plugin with collision detection

export function physicsPlugin(app) {
    const bodies = []
    const gravity = { x: 0, y: 0.5 }
    const bounds = {
        left: 0,
        right: app.canvas.width,
        top: 0,
        bottom: app.canvas.height
    }

    app.physics = {
        // Set global gravity
        setGravity(x, y) {
            gravity.x = x
            gravity.y = y
        },

        // Set boundary limits
        setBounds(left, top, right, bottom) {
            bounds.left = left
            bounds.top = top
            bounds.right = right
            bounds.bottom = bottom
        },

        // Create a physics body (circle)
        createCircle(x, y, radius, config = {}) {
            const body = {
                x, y, radius,
                vx: config.vx ?? 0,
                vy: config.vy ?? 0,
                mass: config.mass ?? 1,
                restitution: config.restitution ?? 0.8, // bounciness
                friction: config.friction ?? 0.99,
                color: config.color ?? '#4ecdc4',
                isStatic: config.isStatic ?? false,
                collisionGroup: config.collisionGroup ?? 'default',

                // Apply force
                applyForce(fx, fy) {
                    if (this.isStatic) return
                    this.vx += fx / this.mass
                    this.vy += fy / this.mass
                },

                // Apply impulse (instant velocity change)
                applyImpulse(ix, iy) {
                    if (this.isStatic) return
                    this.vx += ix
                    this.vy += iy
                },

                update(dt) {
                    if (this.isStatic) return

                    const deltaSeconds = dt / 1000

                    // Apply gravity
                    this.vx += gravity.x * deltaSeconds * 60
                    this.vy += gravity.y * deltaSeconds * 60

                    // Apply friction
                    this.vx *= this.friction
                    this.vy *= this.friction

                    // Update position
                    this.x += this.vx
                    this.y += this.vy

                    // Boundary collision
                    if (this.x - this.radius < bounds.left) {
                        this.x = bounds.left + this.radius
                        this.vx *= -this.restitution
                    }
                    if (this.x + this.radius > bounds.right) {
                        this.x = bounds.right - this.radius
                        this.vx *= -this.restitution
                    }
                    if (this.y - this.radius < bounds.top) {
                        this.y = bounds.top + this.radius
                        this.vy *= -this.restitution
                    }
                    if (this.y + this.radius > bounds.bottom) {
                        this.y = bounds.bottom - this.radius
                        this.vy *= -this.restitution
                        // Stop small bounces
                        if (Math.abs(this.vy) < 0.5) {
                            this.vy = 0
                        }
                    }
                },

                draw(ctx) {
                    ctx.fillStyle = this.color
                    ctx.beginPath()
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
                    ctx.fill()

                    // Draw velocity indicator
                    if (!this.isStatic && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        ctx.moveTo(0, 0)
                        ctx.lineTo(this.vx * 2, this.vy * 2)
                        ctx.stroke()
                    }
                }
            }

            bodies.push(body)
            return app.root.add(body)
        },

        // Create a physics body (rectangle)
        createRect(x, y, width, height, config = {}) {
            const body = {
                x, y, width, height,
                vx: config.vx ?? 0,
                vy: config.vy ?? 0,
                mass: config.mass ?? 1,
                restitution: config.restitution ?? 0.6,
                friction: config.friction ?? 0.99,
                color: config.color ?? '#ffe66d',
                isStatic: config.isStatic ?? false,
                collisionGroup: config.collisionGroup ?? 'default',

                applyForce(fx, fy) {
                    if (this.isStatic) return
                    this.vx += fx / this.mass
                    this.vy += fy / this.mass
                },

                applyImpulse(ix, iy) {
                    if (this.isStatic) return
                    this.vx += ix
                    this.vy += iy
                },

                update(dt) {
                    if (this.isStatic) return

                    const deltaSeconds = dt / 1000

                    // Apply gravity
                    this.vx += gravity.x * deltaSeconds * 60
                    this.vy += gravity.y * deltaSeconds * 60

                    // Apply friction
                    this.vx *= this.friction
                    this.vy *= this.friction

                    // Update position
                    this.x += this.vx
                    this.y += this.vy

                    // Boundary collision
                    const halfW = this.width / 2
                    const halfH = this.height / 2

                    if (this.x - halfW < bounds.left) {
                        this.x = bounds.left + halfW
                        this.vx *= -this.restitution
                    }
                    if (this.x + halfW > bounds.right) {
                        this.x = bounds.right - halfW
                        this.vx *= -this.restitution
                    }
                    if (this.y - halfH < bounds.top) {
                        this.y = bounds.top + halfH
                        this.vy *= -this.restitution
                    }
                    if (this.y + halfH > bounds.bottom) {
                        this.y = bounds.bottom - halfH
                        this.vy *= -this.restitution
                        if (Math.abs(this.vy) < 0.5) {
                            this.vy = 0
                        }
                    }
                },

                draw(ctx) {
                    ctx.fillStyle = this.color
                    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height)

                    // Draw velocity indicator
                    if (!this.isStatic && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
                        ctx.lineWidth = 2
                        ctx.beginPath()
                        ctx.moveTo(0, 0)
                        ctx.lineTo(this.vx * 2, this.vy * 2)
                        ctx.stroke()
                    }
                }
            }

            bodies.push(body)
            return app.root.add(body)
        },

        // Collision detection and resolution
        resolveCollisions() {
            for (let i = 0; i < bodies.length; i++) {
                for (let j = i + 1; j < bodies.length; j++) {
                    const a = bodies[i]
                    const b = bodies[j]

                    // Skip if both static
                    if (a.isStatic && b.isStatic) continue

                    // Circle-circle collision
                    if (a.radius && b.radius) {
                        const dx = b.x - a.x
                        const dy = b.y - a.y
                        const dist = Math.sqrt(dx * dx + dy * dy)
                        const minDist = a.radius + b.radius

                        if (dist < minDist && dist > 0) {
                            // Resolve overlap
                            const overlap = minDist - dist
                            const nx = dx / dist
                            const ny = dy / dist

                            if (!a.isStatic && !b.isStatic) {
                                a.x -= nx * overlap * 0.5
                                a.y -= ny * overlap * 0.5
                                b.x += nx * overlap * 0.5
                                b.y += ny * overlap * 0.5
                            } else if (a.isStatic) {
                                b.x += nx * overlap
                                b.y += ny * overlap
                            } else {
                                a.x -= nx * overlap
                                a.y -= ny * overlap
                            }

                            // Resolve velocities
                            const dvx = b.vx - a.vx
                            const dvy = b.vy - a.vy
                            const dotProduct = dvx * nx + dvy * ny

                            if (dotProduct < 0) {
                                const impulse = (2 * dotProduct) / (a.mass + b.mass)

                                if (!a.isStatic) {
                                    a.vx += impulse * b.mass * nx * a.restitution
                                    a.vy += impulse * b.mass * ny * a.restitution
                                }
                                if (!b.isStatic) {
                                    b.vx -= impulse * a.mass * nx * b.restitution
                                    b.vy -= impulse * a.mass * ny * b.restitution
                                }
                            }
                        }
                    }
                }
            }
        },

        // Remove a body from physics simulation
        removeBody(body) {
            const index = bodies.indexOf(body)
            if (index !== -1) {
                bodies.splice(index, 1)
            }
            app.root.remove(body)
        },

        // Clear all bodies
        clear() {
            bodies.forEach(body => app.root.remove(body))
            bodies.length = 0
        },

        // Get all bodies
        getBodies() {
            return bodies
        }
    }

    // Update physics in the main loop
    const originalLoop = app.canvas._physicsEnabled
    if (!originalLoop) {
        app.canvas._physicsEnabled = true

        // Add physics update to existing update cycle
        app.root.add({
            update() {
                app.physics.resolveCollisions()
            },
            draw() { } // No rendering needed
        })
    }
}
