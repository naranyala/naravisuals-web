// audioVizPlugin.js — Audio visualization utilities

export function audioVizPlugin(app) {
    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;
    let bufferLength = 0;
    let isPlaying = false;
    let currentAudio = null;

    // Frequency ranges for different visualization types
    const frequencyRanges = {
        bass: [20, 140],
        lowMid: [140, 400],
        mid: [400, 2600],
        highMid: [2600, 5200],
        treble: [5200, 14000]
    };

    const audioUtils = {
        // Initialize audio context and analyser
        async init() {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                return true;
            } catch (error) {
                console.error('Error initializing audio context:', error);
                return false;
            }
        },

        // Connect audio element to analyser
        connectAudioElement(audioElement) {
            if (!audioContext || !analyser) return false;

            try {
                if (source) {
                    source.disconnect();
                }

                source = audioContext.createMediaElementSource(audioElement);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                currentAudio = audioElement;
                return true;
            } catch (error) {
                console.error('Error connecting audio element:', error);
                return false;
            }
        },

        // Connect audio buffer (for file playback)
        connectAudioBuffer(audioBuffer) {
            if (!audioContext || !analyser) return false;

            try {
                if (source) {
                    source.disconnect();
                }

                source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyser);
                analyser.connect(audioContext.destination);

                // Set up event listeners for this source
                source.onended = () => {
                    isPlaying = false;
                    if (this.onPlaybackEnd) {
                        this.onPlaybackEnd();
                    }
                };

                return source;
            } catch (error) {
                console.error('Error connecting audio buffer:', error);
                return null;
            }
        },

        // Load and decode audio file
        async loadAudioFile(file) {
            if (!audioContext) await this.init();

            try {
                const arrayBuffer = await file.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                return audioBuffer;
            } catch (error) {
                console.error('Error loading audio file:', error);
                return null;
            }
        },

        // Play audio buffer
        playAudioBuffer(audioBuffer, onEnded = null) {
            const source = this.connectAudioBuffer(audioBuffer);
            if (!source) return false;

            if (onEnded) {
                this.onPlaybackEnd = onEnded;
            }

            source.start(0);
            isPlaying = true;
            return true;
        },

        // Stop audio playback
        stopAudio() {
            if (source && typeof source.stop === 'function') {
                source.stop();
            }
            if (currentAudio && currentAudio.pause) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            isPlaying = false;
        },

        // Connect microphone
        async connectMicrophone() {
            if (!audioContext) await this.init();

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                isPlaying = true;
                return true;
            } catch (error) {
                console.error('Error accessing microphone:', error);
                return false;
            }
        },

        // Get frequency data
        getFrequencyData() {
            if (!analyser) return null;
            analyser.getByteFrequencyData(dataArray);
            return dataArray;
        },

        // Get waveform data
        getWaveformData() {
            if (!analyser) return null;
            analyser.getByteTimeDomainData(dataArray);
            return dataArray;
        },

        // Get volume level (RMS)
        getVolumeLevel() {
            const data = this.getFrequencyData();
            if (!data) return 0;

            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                sum += data[i] * data[i];
            }
            return Math.sqrt(sum / data.length) / 255;
        },

        // Get frequency range average
        getFrequencyRangeAverage(rangeName) {
            const data = this.getFrequencyData();
            if (!data) return 0;

            const range = frequencyRanges[rangeName];
            if (!range) return 0;

            const startFreq = range[0];
            const endFreq = range[1];
            const sampleRate = audioContext?.sampleRate || 44100;

            const startIndex = Math.floor(startFreq / (sampleRate / 2) * bufferLength);
            const endIndex = Math.floor(endFreq / (sampleRate / 2) * bufferLength);

            let sum = 0;
            let count = 0;

            for (let i = startIndex; i <= endIndex && i < bufferLength; i++) {
                sum += data[i];
                count++;
            }

            return count > 0 ? sum / count / 255 : 0;
        },

        // Get all frequency ranges
        getAllFrequencyRanges() {
            const ranges = {};
            for (const rangeName in frequencyRanges) {
                ranges[rangeName] = this.getFrequencyRangeAverage(rangeName);
            }
            return ranges;
        },

        // Get current playback time (for file playback)
        getCurrentTime() {
            if (currentAudio && currentAudio.currentTime !== undefined) {
                return currentAudio.currentTime;
            }
            return 0;
        },

        // Get duration (for file playback)
        getDuration() {
            if (currentAudio && currentAudio.duration !== undefined) {
                return currentAudio.duration;
            }
            return 0;
        },

        // Clean up
        cleanup() {
            this.stopAudio();
            if (source) {
                source.disconnect();
                source = null;
            }
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
            currentAudio = null;
            isPlaying = false;
        }
    };

    // Visualization shapes and effects (same as before, but enhanced)
    app.audioVizShapes = {
        // Classic frequency bars with progress indicator
        createFrequencyBars(x = 0, y = 0, width = 800, height = 200, color = '#4ecdc4') {
            const bars = app.root.add({
                x, y, width, height, color,
                draw(ctx) {
                    const data = audioUtils.getFrequencyData();
                    if (!data) return;

                    const barWidth = this.width / bufferLength * 2.5;
                    let barX = 0;

                    ctx.fillStyle = this.color;

                    for (let i = 0; i < bufferLength; i++) {
                        const barHeight = (data[i] / 255) * this.height;

                        ctx.fillRect(
                            barX,
                            this.height - barHeight,
                            barWidth * 0.8,
                            barHeight
                        );

                        barX += barWidth;
                    }

                    // Draw progress bar if playing audio file
                    if (audioUtils.getDuration() > 0) {
                        const progress = audioUtils.getCurrentTime() / audioUtils.getDuration();
                        ctx.fillStyle = '#ff6b6b';
                        ctx.fillRect(0, this.height - 2, this.width * progress, 2);
                    }
                }
            });

            return bars;
        },

        // Circular frequency visualizer
        createCircularVisualizer(cx = 400, cy = 300, radius = 150, color = '#ff6b6b') {
            const circle = app.root.add({
                cx, cy, radius, color,
                draw(ctx) {
                    const data = audioUtils.getFrequencyData();
                    if (!data) return;

                    const sliceAngle = (Math.PI * 2) / bufferLength;

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    for (let i = 0; i < bufferLength; i++) {
                        const angle = i * sliceAngle;
                        const amplitude = (data[i] / 255) * this.radius;

                        const x = this.cx + Math.cos(angle) * (this.radius + amplitude);
                        const y = this.cy + Math.sin(angle) * (this.radius + amplitude);

                        if (i === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }

                    ctx.closePath();
                    ctx.stroke();

                    // Draw progress circle if playing audio file
                    if (audioUtils.getDuration() > 0) {
                        const progress = audioUtils.getCurrentTime() / audioUtils.getDuration();
                        ctx.strokeStyle = '#4ecdc4';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.arc(this.cx, this.cy, this.radius + 10, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
                        ctx.stroke();
                    }
                }
            });

            return circle;
        },

        // Waveform display with progress
        createWaveform(x = 0, y = 0, width = 800, height = 200, color = '#45b7d1') {
            const waveform = app.root.add({
                x, y, width, height, color,
                draw(ctx) {
                    const data = audioUtils.getWaveformData();
                    if (!data) return;

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    const sliceWidth = this.width / bufferLength;
                    let xPos = 0;

                    for (let i = 0; i < bufferLength; i++) {
                        const v = data[i] / 128.0;
                        const y = v * this.height / 2;

                        if (i === 0) {
                            ctx.moveTo(xPos, y);
                        } else {
                            ctx.lineTo(xPos, y);
                        }

                        xPos += sliceWidth;
                    }

                    ctx.lineTo(this.width, this.height / 2);
                    ctx.stroke();

                    // Draw progress indicator
                    if (audioUtils.getDuration() > 0) {
                        const progress = audioUtils.getCurrentTime() / audioUtils.getDuration();
                        ctx.strokeStyle = '#ff6b6b';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(this.width * progress, 0);
                        ctx.lineTo(this.width * progress, this.height);
                        ctx.stroke();
                    }
                }
            });

            return waveform;
        },

        // Particle system that reacts to audio
        createAudioParticles(count = 100, color = '#96ceb4') {
            const particles = [];
            const container = app.root.add({
                particles: [],
                draw(ctx) {
                    const volume = audioUtils.getVolumeLevel();
                    const frequencies = audioUtils.getAllFrequencyRanges();

                    this.particles.forEach(particle => {
                        particle.update?.(volume, frequencies);
                        particle.draw?.(ctx);
                    });
                }
            });

            // Create particles
            for (let i = 0; i < count; i++) {
                const particle = {
                    x: Math.random() * app.canvas.width,
                    y: Math.random() * app.canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: Math.random() * 3 + 1,
                    baseColor: color,
                    draw(ctx) {
                        ctx.fillStyle = this.baseColor;
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                        ctx.fill();
                    },
                    update(volume, frequencies) {
                        // React to bass frequencies
                        const bass = frequencies.bass;
                        this.vx += (Math.random() - 0.5) * bass * 0.1;
                        this.vy += (Math.random() - 0.5) * bass * 0.1;

                        // React to volume
                        this.radius = Math.max(1, (volume * 10) + Math.random() * 2);

                        // Move particle
                        this.x += this.vx;
                        this.y += this.vy;

                        // Bounce off walls
                        if (this.x < 0 || this.x > app.canvas.width) this.vx *= -1;
                        if (this.y < 0 || this.y > app.canvas.height) this.vy *= -1;

                        // Apply friction
                        this.vx *= 0.99;
                        this.vy *= 0.99;
                    }
                };

                container.particles.push(particle);
            }

            return container;
        },

        // Spectrum circle with frequency ranges
        createSpectrumCircle(cx = 400, cy = 300, maxRadius = 200) {
            const spectrum = app.root.add({
                cx, cy, maxRadius,
                draw(ctx) {
                    const ranges = audioUtils.getAllFrequencyRanges();
                    const rangeNames = Object.keys(ranges);
                    const angleStep = (Math.PI * 2) / rangeNames.length;

                    rangeNames.forEach((rangeName, index) => {
                        const angle = index * angleStep;
                        const radius = ranges[rangeName] * this.maxRadius;
                        const nextAngle = (index + 1) * angleStep;

                        // Draw segment
                        ctx.fillStyle = this.getRangeColor(rangeName);
                        ctx.globalAlpha = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(this.cx, this.cy);
                        ctx.arc(this.cx, this.cy, radius, angle, nextAngle);
                        ctx.closePath();
                        ctx.fill();
                    });

                    ctx.globalAlpha = 1;

                    // Draw progress if playing audio file
                    if (audioUtils.getDuration() > 0) {
                        const progress = audioUtils.getCurrentTime() / audioUtils.getDuration();
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(this.cx, this.cy, this.maxRadius + 15, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
                        ctx.stroke();
                    }
                },
                getRangeColor(rangeName) {
                    const colors = {
                        bass: '#ff6b6b',
                        lowMid: '#ffa500',
                        mid: '#ffd93d',
                        highMid: '#6bcf7f',
                        treble: '#4ecdc4'
                    };
                    return colors[rangeName] || '#ffffff';
                }
            });

            return spectrum;
        }
    };

    // Audio-reactive animations
    app.audioVizAnimations = {
        // Make existing objects react to audio
        makeAudioReactive(obj, properties = { scale: true, rotation: true, color: false }) {
            const originalUpdate = obj.update;

            obj.update = function(dt) {
                const volume = audioUtils.getVolumeLevel();
                const ranges = audioUtils.getAllFrequencyRanges();

                if (properties.scale) {
                    const scaleFactor = 1 + (volume * 0.5);
                    this.scaleX = scaleFactor;
                    this.scaleY = scaleFactor;
                }

                if (properties.rotation) {
                    this.rotation += ranges.bass * 0.1;
                }

                if (properties.color && this.color) {
                    const hue = (ranges.mid * 360) % 360;
                    this.color = `hsl(${hue}, 70%, 60%)`;
                }

                originalUpdate?.call(this, dt);
            };

            return obj;
        },

        // Create bouncing bars that react to different frequencies
        createFrequencyBouncers(count = 8, color = '#ff6b6b') {
            const bouncers = [];
            const width = app.canvas.width / count;

            for (let i = 0; i < count; i++) {
                const bouncer = app.root.add({
                    x: i * width + width / 2,
                    y: app.canvas.height / 2,
                    width: width * 0.8,
                    height: 20,
                    color,
                    baseHeight: 20,
                    draw(ctx) {
                        ctx.fillStyle = this.color;
                        ctx.fillRect(
                            this.x - this.width / 2,
                            this.y - this.height / 2,
                            this.width,
                            this.height
                        );
                    },
                    update() {
                        const ranges = audioUtils.getAllFrequencyRanges();
                        const rangeNames = Object.keys(ranges);
                        const rangeIndex = i % rangeNames.length;
                        const rangeName = rangeNames[rangeIndex];

                        this.height = this.baseHeight + (ranges[rangeName] * 200);
                        this.color = this.getRangeColor(rangeName);
                    },
                    getRangeColor(rangeName) {
                        const colors = {
                            bass: '#ff6b6b',
                            lowMid: '#ffa500',
                            mid: '#ffd93d',
                            highMid: '#6bcf7f',
                            treble: '#4ecdc4'
                        };
                        return colors[rangeName] || '#ffffff';
                    }
                });

                bouncers.push(bouncer);
            }

            return bouncers;
        }
    };

    // Expose everything to the app
    app.audioViz = {
        ...audioUtils,
        shapes: app.audioVizShapes,
        animations: app.audioVizAnimations,
        isPlaying: () => isPlaying,
        getCurrentAudio: () => currentAudio
    };

    // Auto-initialize
    audioUtils.init();
}
