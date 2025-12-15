export const ScalePlugin = {
  name: 'scales',
  init(wrapper) {
    wrapper.scales = {
      // Linear scale: domain [a,b] → range [c,d]
      linear(domain, range) {
        const [d0, d1] = domain;
        const [r0, r1] = range;
        const slope = (r1 - r0) / (d1 - d0);
        return (value) => r0 + (value - d0) * slope;
      },

      // Bind data to attribute
      bind(data, attrMap) {
        Object.entries(attrMap).forEach(([attr, scaleFn]) => {
          if (data.hasOwnProperty(attr)) {
            const value = scaleFn(data[attr]);
            wrapper.el.setAttribute(attr, value);
          }
        });
        return wrapper;
      }
    };
  }
};

// const tempScale = wrapper.scales.linear([0, 40], [10, 50]); // temp → radius
// const colorScale = (t) => t > 30 ? 'red' : t > 20 ? 'orange' : 'blue';
//
// const city = svg.add('circle');
// city.scales.bind(
//   { temperature: 28 },
//   {
//     r: tempScale,
//     fill: (t) => colorScale(t)
//   }
// );
