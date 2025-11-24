/**
 * CanvasUtils - A comprehensive utility library for HTML5 Canvas operations
 * Single-file, zero dependencies, ready to use in browser
 */

class CanvasUtils {
  constructor(canvas) {
    this.canvas = canvas instanceof HTMLCanvasElement ? canvas : document.querySelector(canvas);
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  // ============ BASIC OPERATIONS ============
  
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    return this;
  }

  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    return this;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
    return this;
  }

  // ============ DRAWING SHAPES ============

  rect(x, y, w, h, options = {}) {
    this.applyStyle(options);
    if (options.fill !== false) this.ctx.fillRect(x, y, w, h);
    if (options.stroke) this.ctx.strokeRect(x, y, w, h);
    return this;
  }

  circle(x, y, radius, options = {}) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.applyStyle(options);
    if (options.fill !== false) this.ctx.fill();
    if (options.stroke) this.ctx.stroke();
    return this;
  }

  ellipse(x, y, radiusX, radiusY, rotation = 0, options = {}) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
    this.applyStyle(options);
    if (options.fill !== false) this.ctx.fill();
    if (options.stroke) this.ctx.stroke();
    return this;
  }

  line(x1, y1, x2, y2, options = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.applyStyle(options);
    this.ctx.stroke();
    return this;
  }

  polygon(points, options = {}) {
    if (points.length < 3) return this;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
    this.applyStyle(options);
    if (options.fill !== false) this.ctx.fill();
    if (options.stroke) this.ctx.stroke();
    return this;
  }

  // ============ TEXT ============

  text(str, x, y, options = {}) {
    this.applyStyle(options);
    this.ctx.font = options.font || '16px sans-serif';
    this.ctx.textAlign = options.align || 'left';
    this.ctx.textBaseline = options.baseline || 'top';
    
    if (options.fill !== false) this.ctx.fillText(str, x, y);
    if (options.stroke) this.ctx.strokeText(str, x, y);
    return this;
  }

  measureText(str, font = '16px sans-serif') {
    this.ctx.font = font;
    return this.ctx.measureText(str);
  }

  // ============ PATHS ============

  path(points, options = {}) {
    if (points.length < 2) return this;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    if (options.close) this.ctx.closePath();
    this.applyStyle(options);
    if (options.fill && options.close) this.ctx.fill();
    if (options.stroke !== false) this.ctx.stroke();
    return this;
  }

  bezier(x1, y1, cp1x, cp1y, cp2x, cp2y, x2, y2, options = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
    this.applyStyle(options);
    this.ctx.stroke();
    return this;
  }

  quadratic(x1, y1, cpx, cpy, x2, y2, options = {}) {
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.quadraticCurveTo(cpx, cpy, x2, y2);
    this.applyStyle(options);
    this.ctx.stroke();
    return this;
  }

  // ============ TRANSFORMATIONS ============

  translate(x, y) {
    this.ctx.translate(x, y);
    return this;
  }

  rotate(angle) {
    this.ctx.rotate(angle);
    return this;
  }

  scale(x, y = x) {
    this.ctx.scale(x, y);
    return this;
  }

  save() {
    this.ctx.save();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    return this;
  }

  // ============ GRADIENTS ============

  linearGradient(x1, y1, x2, y2, colorStops) {
    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    colorStops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    return gradient;
  }

  radialGradient(x1, y1, r1, x2, y2, r2, colorStops) {
    const gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    colorStops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    return gradient;
  }

  // ============ IMAGE OPERATIONS ============

  drawImage(img, x, y, width, height) {
    if (width && height) {
      this.ctx.drawImage(img, x, y, width, height);
    } else {
      this.ctx.drawImage(img, x, y);
    }
    return this;
  }

  getImageData(x = 0, y = 0, w = this.width, h = this.height) {
    return this.ctx.getImageData(x, y, w, h);
  }

  putImageData(imageData, x = 0, y = 0) {
    this.ctx.putImageData(imageData, x, y);
    return this;
  }

  // ============ PIXEL MANIPULATION ============

  getPixel(x, y) {
    const data = this.ctx.getImageData(x, y, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2], a: data[3] };
  }

  setPixel(x, y, r, g, b, a = 255) {
    const imageData = this.ctx.createImageData(1, 1);
    imageData.data[0] = r;
    imageData.data[1] = g;
    imageData.data[2] = b;
    imageData.data[3] = a;
    this.ctx.putImageData(imageData, x, y);
    return this;
  }

  // ============ FILTERS & EFFECTS ============

  applyFilter(filter) {
    this.ctx.filter = filter;
    return this;
  }

  resetFilter() {
    this.ctx.filter = 'none';
    return this;
  }

  setShadow(blur, color, offsetX = 0, offsetY = 0) {
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = color;
    this.ctx.shadowOffsetX = offsetX;
    this.ctx.shadowOffsetY = offsetY;
    return this;
  }

  clearShadow() {
    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'transparent';
    return this;
  }

  // ============ COMPOSITING ============

  setGlobalAlpha(alpha) {
    this.ctx.globalAlpha = alpha;
    return this;
  }

  setCompositeOperation(operation) {
    this.ctx.globalCompositeOperation = operation;
    return this;
  }

  // ============ CLIPPING ============

  clipRect(x, y, w, h) {
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.clip();
    return this;
  }

  clipCircle(x, y, radius) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.clip();
    return this;
  }

  // ============ EXPORT ============

  toDataURL(type = 'image/png', quality = 1) {
    return this.canvas.toDataURL(type, quality);
  }

  toBlob(callback, type = 'image/png', quality = 1) {
    this.canvas.toBlob(callback, type, quality);
    return this;
  }

  download(filename = 'canvas.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
    return this;
  }

  // ============ UTILITIES ============

  applyStyle(options) {
    if (options.fillStyle) this.ctx.fillStyle = options.fillStyle;
    if (options.strokeStyle) this.ctx.strokeStyle = options.strokeStyle;
    if (options.lineWidth) this.ctx.lineWidth = options.lineWidth;
    if (options.lineCap) this.ctx.lineCap = options.lineCap;
    if (options.lineJoin) this.ctx.lineJoin = options.lineJoin;
    if (options.lineDash) this.ctx.setLineDash(options.lineDash);
    if (options.alpha !== undefined) this.ctx.globalAlpha = options.alpha;
  }

  // ============ ANIMATION HELPERS ============

  animate(callback) {
    let frameId;
    const loop = (time) => {
      callback(time);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }

  // ============ STATIC HELPERS ============

  static create(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return new CanvasUtils(canvas);
  }

  static loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static deg2rad(degrees) {
    return degrees * (Math.PI / 180);
  }

  static rad2deg(radians) {
    return radians * (180 / Math.PI);
  }

  static distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  static lerp(start, end, t) {
    return start + (end - start) * t;
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasUtils;
}
