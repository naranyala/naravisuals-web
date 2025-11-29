// tweenPlugin.js - Advanced animation and easing plugin

export function tweenPlugin(app) {
    // Easing functions collection
    const easings = {
        // Basic
        linear: t => t,

        // Quadratic
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,

        // Cubic
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

        // Quartic
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,

        // Quintic
        easeInQuint: t => t * t * t * t * t,
        easeOutQuint: t => 1 + (--t) * t * t * t * t,
        easeInOutQuint: t => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,

        // Sine
        easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
        easeOutSine: t => Math.sin(t * Math.PI / 2),
        easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,

        // Exponential
        easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
        easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        easeInOutExpo: t => {
            if (t === 0 || t === 1) return t
            return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2
        },

        // Circular
        easeInCirc: t => 1 - Math.sqrt(1 - t * t),
        easeOutCirc: t => Math.sqrt(1 - (--t) * t),
        easeInOutCirc: t => t < 0.5
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,

        // Elastic
        easeInElastic: t => {
            const c4 = (2 * Math.PI) / 3
            return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
        },
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
        },
        easeInOutElastic: t => {
            const c5 = (2 * Math.PI) / 4.5
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
                ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
                : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
        },

        // Back
        easeInBack: t => {
            const c1 = 1.70158
            const c3 = c1 + 1
            return c3 * t * t * t - c1 * t * t
        },
        easeOutBack: t => {
            const c1 = 1.70158
            const c3 = c1 + 1
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
        },
        easeInOutBack: t => {
            const c1 = 1.70158
            const c2 = c1 * 1.525
            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
        },

        // Bounce
        easeOutBounce: t => {
            const n1 = 7.5625
            const d1 = 2.75
            if (t < 1 / d1) return n1 * t * t
            else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
            else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
            else return n1 * (t -= 2.625 / d1) * t + 0.984375
        },
        easeInBounce: t => 1 - easings.easeOutBounce(1 - t),
        easeInOutBounce: t => t < 0.5
            ? (1 - easings.easeOutBounce(1 - 2 * t)) / 2
            : (1 + easings.easeOutBounce(2 * t - 1)) / 2
    }

    app.tween = {
        easings,

        // Tween a single property
        to(obj, prop, target, duration = 500, easing = 'easeOutQuad') {
            const easeFn = typeof easing === 'string' ? easings[easing] : easing
            return new Promise(resolve => {
                app.start(function*() {
                    const start = obj[prop]
                    const t0 = performance.now()

                    while (true) {
                        const elapsed = performance.now() - t0
                        const t = Math.min(elapsed / duration, 1)

                        obj[prop] = start + (target - start) * easeFn(t)

                        if (t >= 1) {
                            obj[prop] = target
                            resolve()
                            break
                        }
                        yield 16
                    }
                })
            })
        },

        // Tween multiple properties
        toMultiple(obj, props, duration = 500, easing = 'easeOutQuad') {
            const easeFn = typeof easing === 'string' ? easings[easing] : easing
            const startValues = {}

            for (const prop in props) {
                startValues[prop] = obj[prop]
            }

            return new Promise(resolve => {
                app.start(function*() {
                    const t0 = performance.now()

                    while (true) {
                        const elapsed = performance.now() - t0
                        const t = Math.min(elapsed / duration, 1)
                        const eased = easeFn(t)

                        for (const prop in props) {
                            obj[prop] = startValues[prop] + (props[prop] - startValues[prop]) * eased
                        }

                        if (t >= 1) {
                            for (const prop in props) {
                                obj[prop] = props[prop]
                            }
                            resolve()
                            break
                        }
                        yield 16
                    }
                })
            })
        },

        // Chain multiple tweens
        async chain(obj, tweens) {
            for (const tween of tweens) {
                await this.toMultiple(obj, tween.props, tween.duration, tween.easing)
                if (tween.delay) {
                    await new Promise(r => setTimeout(r, tween.delay))
                }
            }
        },

        // Animate along a path
        path(obj, points, duration = 1000, easing = 'linear') {
            const easeFn = typeof easing === 'string' ? easings[easing] : easing

            return new Promise(resolve => {
                app.start(function*() {
                    const t0 = performance.now()

                    while (true) {
                        const elapsed = performance.now() - t0
                        const t = Math.min(elapsed / duration, 1)
                        const eased = easeFn(t)

                        // Calculate position along path
                        const totalDist = eased * (points.length - 1)
                        const segment = Math.floor(totalDist)
                        const segmentT = totalDist - segment

                        if (segment >= points.length - 1) {
                            obj.x = points[points.length - 1].x
                            obj.y = points[points.length - 1].y
                            resolve()
                            break
                        }

                        const p1 = points[segment]
                        const p2 = points[segment + 1]

                        obj.x = p1.x + (p2.x - p1.x) * segmentT
                        obj.y = p1.y + (p2.y - p1.y) * segmentT

                        if (t >= 1) {
                            resolve()
                            break
                        }
                        yield 16
                    }
                })
            })
        },

        // Shake effect
        shake(obj, intensity = 10, duration = 500) {
            const originalX = obj.x
            const originalY = obj.y

            return new Promise(resolve => {
                app.start(function*() {
                    const t0 = performance.now()

                    while (true) {
                        const elapsed = performance.now() - t0
                        const t = elapsed / duration

                        if (t >= 1) {
                            obj.x = originalX
                            obj.y = originalY
                            resolve()
                            break
                        }

                        const currentIntensity = intensity * (1 - t)
                        obj.x = originalX + (Math.random() - 0.5) * currentIntensity
                        obj.y = originalY + (Math.random() - 0.5) * currentIntensity

                        yield 16
                    }
                })
            })
        },

        // Pulse effect
        pulse(obj, property = 'scaleX', amount = 0.2, duration = 500) {
            const original = obj[property] || 1
            const target = original + amount

            return new Promise(async resolve => {
                await this.to(obj, property, target, duration / 2, 'easeOutQuad')
                await this.to(obj, property, original, duration / 2, 'easeInQuad')
                resolve()
            })
        },

        // Flash effect
        flash(obj, count = 3, duration = 200) {
            return new Promise(async resolve => {
                for (let i = 0; i < count; i++) {
                    await this.to(obj, 'opacity', 0.3, duration / 2, 'linear')
                    await this.to(obj, 'opacity', 1, duration / 2, 'linear')
                }
                resolve()
            })
        },

        // Spring animation
        spring(obj, prop, target, tension = 100, friction = 10) {
            return new Promise(resolve => {
                let velocity = 0

                app.start(function*() {
                    while (true) {
                        const delta = target - obj[prop]
                        const spring = delta * tension / 1000
                        const damping = velocity * friction / 1000

                        velocity += spring - damping
                        obj[prop] += velocity

                        // Stop if settled
                        if (Math.abs(delta) < 0.01 && Math.abs(velocity) < 0.01) {
                            obj[prop] = target
                            resolve()
                            break
                        }

                        yield 16
                    }
                })
            })
        }
    }
}
