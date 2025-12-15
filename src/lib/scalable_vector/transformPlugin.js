export const TransformPlugin = {
  name: 'transform',
  init(wrapper) {
    const el = wrapper.el;

    // Getter/setter for current transform
    const getCurrentMatrix = () => {
      const t = el.transform.baseVal.consolidate();
      return t ? t.matrix : el.ownerSVGElement.createSVGMatrix();
    };

    wrapper.translate = (tx, ty = 0) => {
      const m = getCurrentMatrix().translate(tx, ty);
      el.setAttribute('transform', `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`);
      return wrapper;
    };

    wrapper.rotate = (angle, cx = 0, cy = 0) => {
      const m = getCurrentMatrix().rotate(angle).translate(cx, cy);
      el.setAttribute('transform', `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`);
      return wrapper;
    };

    wrapper.scale = (sx, sy = sx) => {
      const m = getCurrentMatrix().scaleNonUniform(sx, sy);
      el.setAttribute('transform', `matrix(${m.a},${m.b},${m.c},${m.d},${m.e},${m.f})`);
      return wrapper;
    };

    // Reset all transforms
    wrapper.resetTransform = () => {
      el.removeAttribute('transform');
      return wrapper;
    };
  }
};
