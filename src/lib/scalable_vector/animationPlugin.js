export const AnimationPlugin = {
  name: 'animate',
  init(wrapper) {
    wrapper.animate = (attrs, duration = 400) => {
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      SVG.setAttributes(animate, {
        attributeName: Object.keys(attrs)[0],
        from: wrapper.el.getAttribute(Object.keys(attrs)[0]),
        to: attrs[Object.keys(attrs)[0]],
        dur: `${duration}ms`,
        fill: 'freeze',
        ...attrs
      });
      wrapper.el.appendChild(animate);
      animate.beginElement(); // Start animation
      return wrapper;
    };
  }
};
