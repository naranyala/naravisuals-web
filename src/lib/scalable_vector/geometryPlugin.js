export const GeometryPlugin = {
  name: 'geometry',
  init(wrapper) {
    const el = wrapper.el;

    // Attach utility methods directly to wrapper
    wrapper.geometry = {
      // Get center point of any shape
      getCenter() {
        const bbox = el.getBBox();
        return {
          x: bbox.x + bbox.width / 2,
          y: bbox.y + bbox.height / 2
        };
      },

      // Distance between this element and another
      distanceTo(other) {
        const a = this.getCenter();
        const b = other.geometry.getCenter();
        return Math.hypot(b.x - a.x, b.y - a.y);
      },

      // Check collision with another element
      collidesWith(other) {
        const a = el.getBBox();
        const b = other.el.getBBox();
        return !(a.x + a.width < b.x ||
                 b.x + b.width < a.x ||
                 a.y + a.height < b.y ||
                 b.y + b.height < a.y);
      },

      // Get point on perimeter at angle (for circles/rects)
      getPerimeterPoint(angleDeg) {
        const center = this.getCenter();
        const bbox = el.getBBox();
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'circle') {
          const r = parseFloat(el.getAttribute('r'));
          const rad = angleDeg * Math.PI / 180;
          return {
            x: center.x + r * Math.cos(rad),
            y: center.y + r * Math.sin(rad)
          };
        } else {
          // Approximation for rectangles
          const w = bbox.width / 2;
          const h = bbox.height / 2;
          const rad = angleDeg * Math.PI / 180;
          const absCos = Math.abs(Math.cos(rad));
          const absSin = Math.abs(Math.sin(rad));
          const scale = w * h / Math.sqrt(h * h * absCos * absCos + w * w * absSin * absSin);
          return {
            x: center.x + scale * Math.cos(rad),
            y: center.y + scale * Math.sin(rad)
          };
        }
      }
    };
  }
};
