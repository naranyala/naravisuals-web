export const PhysicsPlugin = {
  name: 'physics',
  init(wrapper) {
    const state = {
      x: 0,
      y: 0,
      oldX: 0,
      oldY: 0,
      friction: 0.98,
      gravity: { x: 0, y: 0.5 }
    };

    // Initialize from current position
    const bbox = wrapper.el.getBBox();
    state.x = state.oldX = bbox.x + bbox.width / 2;
    state.y = state.oldY = bbox.y + bbox.height / 2;

    wrapper.physics = {
      // Set initial position/velocity
      set(pos, velocity = { x: 0, y: 0 }) {
        state.x = pos.x;
        state.y = pos.y;
        state.oldX = pos.x - velocity.x;
        state.oldY = pos.y - velocity.y;
        this.updateElement();
        return wrapper;
      },

      // Apply force (impulse)
      applyForce(fx, fy) {
        state.oldX -= fx;
        state.oldY -= fy;
        return wrapper;
      },

      // Update physics (call in animation loop)
      tick() {
        const velX = (state.x - state.oldX) * state.friction;
        const velY = (state.y - state.oldY) * state.friction;

        state.oldX = state.x;
        state.oldY = state.y;

        state.x += velX;
        state.y += velY + state.gravity.y;

        this.updateElement();
        return wrapper;
      },

      // Update SVG element position
      updateElement() {
        const bbox = wrapper.el.getBBox();
        const dx = state.x - (bbox.x + bbox.width / 2);
        const dy = state.y - (bbox.y + bbox.height / 2);
        wrapper.translate(dx, dy);
      },

      // Get current position
      getPosition() {
        return { x: state.x, y: state.y };
      }
    };
  }
};

// // Make circle bouncy
// const ball = svg.add('circle', { r: 20 })
//   .physics.set({ x: 100, y: 50 });
//
// // In animation loop:
// function animate() {
//   ball.physics.tick();
//   requestAnimationFrame(animate);
// }
// animate();
//
// // Click to apply force
// ball.on('click', () => ball.physics.applyForce(Math.random()*10-5, -15));
