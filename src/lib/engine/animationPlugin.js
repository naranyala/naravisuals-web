// animationPlugin.js — Professional-grade animation system v1.0
// Works beautifully with canvas_util.js and mathPlugin.js

export function animationPlugin(app) {
    const animations = new WeakMap(); // object → its AnimationController

    // =============================================
    // Core: Animation Controller (attached to any object)
    // =============================================

    class AnimationController {
        constructor(target) {
            this.target = target;
            this.clips = new Map();      // name → clip
            this.active = new Set();
            this.defaultClip = null;
            this.timeScale = 1;
            this.on = (eventName, callback) => {
                this.events = this.events || {};
                (this.events[eventName] = this.events[eventName] || []).push(callback);
            };
        }

        play(name, loop = true) {
            const clip = this.clips.get(name);
            if (!clip) return console.warn(`Animation "${name}" not found`);
            clip.reset();
            clip.loop = loop;
            this.active.add(clip);
            if (!this.defaultClip) this.defaultClip = clip;
            return clip;
        }

        stop(name = null) {
            if (name) {
                const clip = this.clips.get(name);
                if (clip) this.active.delete(clip);
            } else {
                this.active.clear();
            }
        }

        stopAll() { this.active.clear(); }

        update(dt) {
            dt *= this.timeScale;
            for (const clip of this.active) {
                clip.update(dt);
                if (clip.finished && !clip.loop) {
                    this.active.delete(clip);
                    clip.emit('complete');
                }
            }
        }
    }

    // =============================================
    // Animation Clip Builder
    // =============================================
    app.animate = (target) => {
        let controller = animations.get(target);
        if (!controller) {
            controller = new AnimationController(target);
            animations.set(target, controller);

            // Auto-update via main loop (once per object)
            const originalUpdate = target.update;
            target.update = function(dt) {
                if (originalUpdate) originalUpdate.call(this, dt);
                controller.update(dt);
            };
        }

        const api = {
            // Keyframe track
            keyframes(props, keyframesArray, options = {}) {
                const {
                    duration = 1000,
                    easing = 'linear',
                    delay = 0,
                    loop = false,
                    name = null
                } = options;

                const clip = {
                    name,
                    target,
                    props: Object.keys(props),
                    keyframes: keyframesArray.map(kf => ({
                        time: kf.time ?? kf[0],
                        value: kf.value ?? kf[1],
                        easing: kf.easing || easing
                    })),
                    duration,
                    elapsed: -delay,
                    loop,
                    finished: false,
                    events: {},

                    reset() {
                        this.elapsed = -delay;
                        this.finished = false;
                    },

                    on(event, cb) {
                        (this.events[event] = this.events[event] || []).push(cb);
                    },

                    emit(event) {
                        if (this.events[event]) {
                            this.events[event].forEach(cb => cb(this));
                        }
                    },

                    update(dt) {
                        if (this.finished) return;
                        this.elapsed += dt;

                        if (this.elapsed < 0) return;

                        let t = this.elapsed / this.duration;
                        if (t >= 1) {
                            t = 1;
                            if (!this.loop) this.finished = true;
                            else this.elapsed = 0;
                            this.emit('complete');
                        }

                        for (const prop of this.props) {
                            const prev = this.keyframes.reduce((a, b) =>
                                b.time <= this.elapsed ? b : a
                            );
                            const next = this.keyframes.find(kf => kf.time > this.elapsed);

                            if (!next) {
                                target[prop] = prev.value;
                            } else {
                                const localT = (this.elapsed - prev.time) / (next.time - prev.time);
                                const easeFn = typeof prev.easing === 'string'
                                    ? app.easings[prev.easing] || app.math.ease.linear
                                    : prev.easing;

                                target[prop] = app.lerp(prev.value, next.value, easeFn(localT));
                            }
                        }
                    }
                };

                if (name) controller.clips.set(name, clip);
                return clip;
            },

            // Simple tween-style animation (sugar)
            to(props, duration = 600, easing = 'easeInOutCubic', opts = {}) {
                const { delay = 0, loop = false, name = null } = opts;
                const keys = Object.keys(props).map(prop => [
                    { time: 0, value: target[prop] ?? 0 },
                    { time: duration, value: props[prop], easing }
                ]);

                return this.keyframes(props, keys.flat(), { duration, delay, loop, name, easing });
            },

            fromTo(fromProps, toProps, duration = 600, easing = 'easeInOutCubic', opts = {}) {
                Object.assign(target, fromProps);
                return this.to(toProps, duration, easing, opts);
            },

            // Sprite animation clip
            sprite(image, config = {}) {
                const {
                    frameWidth = image.width,
                    frameHeight = image.height,
                    fps = 12,
                    frames = null,
                    loop = true,
                    name = null
                } = config;

                const frameList = frames || Array.from(
                    { length: Math.floor(image.width / frameWidth) * Math.floor(image.height / frameHeight) },
                    (_, i) => i
                );

                const spriteObj = app.createSprite(0, 0, image, {
                    frameWidth, frameHeight, frameCount: frameList.length, frameDuration: 1000 / fps, loop
                });

                // Replace draw/update if object already has a sprite
                if (target.draw) target.oldDraw = target.draw;
                target.draw = (ctx) => {
                    spriteObj.x = target.x; spriteObj.y = target.y;
                    spriteObj.rotation = target.rotation ?? 0;
                    spriteObj.scaleX = target.scaleX ?? 1;
                    spriteObj.scaleY = target.scaleY ?? 1;
                    spriteObj.draw(ctx);
                };
                target.update = (dt) => spriteObj.update(dt);

                const clip = {
                    play() { spriteObj.playing = true; },
                    pause() { spriteObj.playing = false; },
                    reset() { spriteObj.reset(); },
                    goto(frame) { spriteObj.currentFrame = frame; }
                };

                if (name) controller.clips.set(name, clip);
                return clip;
            },

            // Path following
            followPath(pathPoints, duration = 2000, options = {}) {
                const {
                    easing = 'linear',
                    orientToPath = false,
                    loop = false,
                    name = null
                } = options;

                const totalLength = pathPoints.reduce((len, p, i) => {
                    if (i === 0) return 0;
                    return len + p.distance(pathPoints[i - 1]);
                }, 0);

                const clip = {
                    elapsed: 0,
                    duration,
                    loop,
                    finished: false,

                    update(dt) {
                        this.elapsed += dt;
                        let t = this.elapsed / this.duration;
                        if (t >= 1) {
                            t = 1;
                            if (!this.loop) this.finished = true;
                            else this.elapsed = 0;
                        }

                        const eased = app.easings[easing](t);
                        const pos = app.math.bezier ? app.math.bezier.cubic(
                            pathPoints[0], pathPoints[1], pathPoints[2], pathPoints[3], eased
                        ) : interpolatePath(pathPoints, eased * totalLength);

                        target.x = pos.x;
                        target.y = pos.y;

                        if (orientToPath && pathPoints.length > 1) {
                            const dir = pos.sub(pathPoints[0]).normalized();
                            target.rotation = Math.atan2(dir.y, dir.x);
                        }
                    }
                };

                function interpolatePath(points, distance) {
                    let accumulated = 0;
                    for (let i = 1; i < points.length; i++) {
                        const segLen = points[i].distance(points[i - 1]);
                        if (accumulated + segLen >= distance) {
                            const localT = (distance - accumulated) / segLen;
                            return points[i - 1].lerp(points[i], localT);
                        }
                        accumulated += segLen;
                    }
                    return points[points.length - 1];
                }

                if (name) controller.clips.set(name, clip);
                controller.active.add(clip);
                return clip;
            }
        };

        // Expose controller methods
        api.play = controller.play.bind(controller);
        api.stop = controller.stop.bind(controller);
        api.stopAll = controller.stopAll.bind(controller);

        return api;
    };

    // =============================================
    // Global Timeline (sequencer)
    // =============================================
    app.timeline = () => {
        const tracks = [];
        let elapsed = 0;

        const tl = {
            add(animClip, startAt = 0) {
                tracks.push({ clip: animClip, start: startAt, played: false });
                return tl;
            },

            play() {
                app.startCoroutine(function*() {
                    elapsed = 0;
                    while (true) {
                        for (const track of tracks) {
                            if (!track.played && elapsed >= track.start) {
                                track.clip.reset?.();
                                track.clip.play?.();
                                track.played = true;
                            }
                        }
                        if (tracks.every(t => t.clip.finished)) break;
                        yield;
                        elapsed += app.lastDt || 16; // fallback if not in loop
                    }
                });
            }
        };

        return tl;
    };

    // =============================================
    // Skeletal Animation (super lightweight)
    // =============================================
    app.skeleton = (bones = []) => {
        const sk = {
            bones,
            update() {
                bones.forEach(bone => {
                    let wx = 0, wy = 0;
                    let parent = null;
                    if (bone.parentIndex !== undefined) parent = bones[bone.parentIndex];

                    if (parent) {
                        const parentAngle = parent.worldRotation || 0;
                        const parentX = parent.worldX || 0;
                        const parentY = parent.worldY || 0;

                        bone.worldRotation = parentAngle + bone.rotation;
                        bone.worldX = parentX + bone.length * Math.cos(parentAngle);
                        bone.worldY = parentY + bone.length * Math.sin(parentAngle);
                    } else {
                        bone.worldRotation = bone.rotation;
                        bone.worldX = bone.x || 0;
                        bone.worldY = bone.y || 0;
                    }
                });
            },
            draw(ctx) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 3;
                bones.forEach(b => {
                    ctx.beginPath();
                    ctx.moveTo(b.worldX, b.worldY);
                    ctx.lineTo(b.worldX + b.length * Math.cos(b.worldRotation),
                        b.worldY + b.length * Math.sin(b.worldRotation));
                    ctx.stroke();
                });
            }
        };
        return sk;
    };

    // =============================================
    // Presets & Quick Helpers
    // =============================================
    app.animate.presets = {
        bounce(obj) {
            return app.animate(obj).to({ y: obj.y - 100 }, 300, 'easeOutCubic')
                .to({ y: obj.y }, 400, 'easeOutBounce');
        },

        float(obj, amplitude = 20, period = 2000) {
            const startY = obj.y;
            const clip = {
                update(dt) {
                    obj.y = startY + Math.sin(performance.now() / period) * amplitude;
                }
            };
            animations.get(obj)?.active.add(clip);
            return clip;
        },

        heartbeat(obj, scale = 1.2, duration = 600) {
            const anim = app.animate(obj);
            const clip = anim.to({ scaleX: scale, scaleY: scale }, duration / 2)
                .to({ scaleX: 1, scaleY: 1 }, duration / 2);
            clip.loop = true;
            return clip;
        }
    };

    console.log("animationPlugin v1.0 loaded – keyframes, timelines, sprites, paths, skeletons, and magic!");
}
