
class CanvasUtility {
  constructor(canvas) {
    if (!canvas) {
      throw new Error('Canvas element is required')
    }
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.stateStack = []
  }

  clear(x = 0, y = 0, width = this.canvas.width, height = this.canvas.height) {
    this.ctx.clearRect(x, y, width, height)
    return this
  }

  fill(color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    return this
  }

  drawRect(x, y, width, height, fillStyle = null, strokeStyle = null, lineWidth = 1) {
    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fillRect(x, y, width, height)
    }
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.strokeRect(x, y, width, height)
    }
    return this
  }

  drawRoundedRect(x, y, width, height, radius, fillStyle = null, strokeStyle = null, lineWidth = 1) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    return this
  }

  drawCircle(x, y, radius, fillStyle = null, strokeStyle = null, lineWidth = 1) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    return this
  }

  drawEllipse(x, y, radiusX, radiusY, rotation = 0, fillStyle = null, strokeStyle = null, lineWidth = 1) {
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2)

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    return this
  }

  drawLine(x1, y1, x2, y2, strokeStyle = '#000', lineWidth = 1, lineCap = 'butt') {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.strokeStyle = strokeStyle
    this.ctx.lineWidth = lineWidth
    this.ctx.lineCap = lineCap
    this.ctx.stroke()
    return this
  }

  drawPolygon(points, fillStyle = null, strokeStyle = null, lineWidth = 1) {
    if (points.length < 3) return this

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.closePath()

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      this.ctx.fill()
    }
    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      this.ctx.stroke()
    }
    return this
  }

  drawPath(points, strokeStyle = '#000', lineWidth = 1, lineCap = 'round', lineJoin = 'round') {
    if (points.length < 2) return this

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y)
    }

    this.ctx.strokeStyle = strokeStyle
    this.ctx.lineWidth = lineWidth
    this.ctx.lineCap = lineCap
    this.ctx.lineJoin = lineJoin
    this.ctx.stroke()
    return this
  }

  drawQuadraticCurve(x1, y1, cpX, cpY, x2, y2, strokeStyle = '#000', lineWidth = 1) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.quadraticCurveTo(cpX, cpY, x2, y2)
    this.ctx.strokeStyle = strokeStyle
    this.ctx.lineWidth = lineWidth
    this.ctx.stroke()
    return this
  }

  drawBezierCurve(x1, y1, cp1X, cp1Y, cp2X, cp2Y, x2, y2, strokeStyle = '#000', lineWidth = 1) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x2, y2)
    this.ctx.strokeStyle = strokeStyle
    this.ctx.lineWidth = lineWidth
    this.ctx.stroke()
    return this
  }

  drawSmoothCurve(points, strokeStyle = '#000', lineWidth = 1, tension = 0.5) {
    if (points.length < 2) return this

    this.ctx.beginPath()
    this.ctx.moveTo(points[0].x, points[0].y)

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

      const cp1x = p1.x + (p2.x - p0.x) / 6 * tension
      const cp1y = p1.y + (p2.y - p0.y) / 6 * tension
      const cp2x = p2.x - (p3.x - p1.x) / 6 * tension
      const cp2y = p2.y - (p3.y - p1.y) / 6 * tension

      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
    }

    this.ctx.strokeStyle = strokeStyle
    this.ctx.lineWidth = lineWidth
    this.ctx.stroke()
    return this
  }

  createLinearGradient(x0, y0, x1, y1, colorStops) {
    const gradient = this.ctx.createLinearGradient(x0, y0, x1, y1)
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color)
    })
    return gradient
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1, colorStops) {
    const gradient = this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1)
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color)
    })
    return gradient
  }

  createConicGradient(startAngle, x, y, colorStops) {
    const gradient = this.ctx.createConicGradient(startAngle, x, y)
    colorStops.forEach(stop => {
      gradient.addColorStop(stop.offset, stop.color)
    })
    return gradient
  }

  drawText(text, x, y, options = {}) {
    const {
      font = '16px sans-serif',
      fillStyle = '#000',
      strokeStyle = null,
      lineWidth = 1,
      textAlign = 'left',
      textBaseline = 'alphabetic',
      maxWidth = null
    } = options

    this.ctx.font = font
    this.ctx.textAlign = textAlign
    this.ctx.textBaseline = textBaseline

    if (fillStyle) {
      this.ctx.fillStyle = fillStyle
      if (maxWidth) {
        this.ctx.fillText(text, x, y, maxWidth)
      } else {
        this.ctx.fillText(text, x, y)
      }
    }

    if (strokeStyle) {
      this.ctx.strokeStyle = strokeStyle
      this.ctx.lineWidth = lineWidth
      if (maxWidth) {
        this.ctx.strokeText(text, x, y, maxWidth)
      } else {
        this.ctx.strokeText(text, x, y)
      }
    }

    return this
  }

  measureText(text, font = '16px sans-serif') {
    this.ctx.font = font
    return this.ctx.measureText(text)
  }

  drawImage(image, sx, sy, sWidth = null, sHeight = null, dx = null, dy = null, dWidth = null, dHeight = null) {
    if (dx === null) {
      // Simple draw
      this.ctx.drawImage(image, sx, sy)
    } else if (dWidth === null) {
      // Draw with size
      this.ctx.drawImage(image, sx, sy, sWidth, sHeight)
    } else {
      // Draw with crop and size
      this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    }
    return this
  }

  save() {
    this.ctx.save()
    return this
  }

  restore() {
    this.ctx.restore()
    return this
  }

  setOpacity(alpha) {
    this.ctx.globalAlpha = alpha
    return this
  }

  setCompositeOperation(operation) {
    this.ctx.globalCompositeOperation = operation
    return this
  }

  translate(x, y) {
    this.ctx.translate(x, y)
    return this
  }

  rotate(angle) {
    this.ctx.rotate(angle)
    return this
  }

  scale(x, y) {
    this.ctx.scale(x, y)
    return this
  }

  transform(a, b, c, d, e, f) {
    this.ctx.transform(a, b, c, d, e, f)
    return this
  }

  resetTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    return this
  }

  clipRect(x, y, width, height) {
    this.ctx.beginPath()
    this.ctx.rect(x, y, width, height)
    this.ctx.clip()
    return this
  }

  clipCircle(x, y, radius) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.clip()
    return this
  }

  setShadow(offsetX, offsetY, blur, color) {
    this.ctx.shadowOffsetX = offsetX
    this.ctx.shadowOffsetY = offsetY
    this.ctx.shadowBlur = blur
    this.ctx.shadowColor = color
    return this
  }

  clearShadow() {
    this.ctx.shadowOffsetX = 0
    this.ctx.shadowOffsetY = 0
    this.ctx.shadowBlur = 0
    this.ctx.shadowColor = 'transparent'
    return this
  }

  setBlur(amount) {
    this.ctx.filter = `blur(${amount}px)`
    return this
  }

  clearFilters() {
    this.ctx.filter = 'none'
    return this
  }

  drawParticles(particles, options = {}) {
    const {
      fillStyle = '#fff',
      minSize = 1,
      maxSize = 3,
      minOpacity = 0.3,
      maxOpacity = 1
    } = options

    this.save()

    particles.forEach(particle => {
      const size = minSize + Math.random() * (maxSize - minSize)
      const opacity = minOpacity + Math.random() * (maxOpacity - minOpacity)

      this.ctx.globalAlpha = opacity
      this.ctx.fillStyle = fillStyle

      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
      this.ctx.fill()
    })

    this.restore()
    return this
  }

  toDataURL(type = 'image/png', quality = 1) {
    return this.canvas.toDataURL(type, quality)
  }

  async toBlob(type = 'image/png', quality = 1) {
    return new Promise((resolve) => {
      this.canvas.toBlob(resolve, type, quality)
    })
  }

  getImageData(x, y, width, height) {
    return this.ctx.getImageData(x, y, width, height)
  }

  putImageData(imageData, x, y) {
    this.ctx.putImageData(imageData, x, y)
    return this
  }

  getPixel(x, y) {
    const imageData = this.ctx.getImageData(x, y, 1, 1)
    const data = imageData.data
    return {
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    }
  }

  isPointInPath(x, y) {
    return this.ctx.isPointInPath(x, y)
  }

  isPointInStroke(x, y) {
    return this.ctx.isPointInStroke(x, y)
  }

  getContext() {
    return this.ctx
  }

  custom(drawFunction) {
    drawFunction(this.ctx, this)
    return this
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasUtility
}

export default CanvasUtility
