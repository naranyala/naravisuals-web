// audio-visualizer.js
export function visualizeAudio(source, canvas, type = 'waveform', options = {}) {
  const ctx = canvas.getContext('2d');
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = options.fftSize || 2048;
  analyser.smoothingTimeConstant = options.smoothing || 0.8;

  const sourceNode = source instanceof MediaStream ? audioCtx.createMediaStreamSource(source) : audioCtx.createMediaElementSource(source);
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const resize = () => {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = {
    waveform() {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = options.bg || 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = options.thickness || 2;
      ctx.strokeStyle = options.color || '#00ff88';
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    },

    bars() {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = options.bg || '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const h = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = options.color || `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - h, barWidth - 2, h);
        x += barWidth;
      }
    },

    circular() {
      analyser.getByteFrequencyData(dataArray);
      ctx.fillStyle = options.bg || '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) * 0.7;

      ctx.lineWidth = options.thickness || 4;
      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const amp = dataArray[i] / 255;
        const r = radius + amp * radius * 0.6;
        ctx.strokeStyle = `hsl(${(i / bufferLength) * 360}, 100%, 60%)`;
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.lineTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r);
        ctx.stroke();
      }
    }
  };

  const loop = () => {
    draw[type]();
    requestAnimationFrame(loop);
  };
  loop();

  return { stop: () => analyser.disconnect() };
}
