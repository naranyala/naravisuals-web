import { CreativeCanvas } from './CreativeCanvas.js';

const canvas = document.getElementById('myCanvas');
const c = new CreativeCanvas(canvas);

c.resizeToWindow()
    .clear('black')
    .anim.loop(ctx => {
        ctx.clear('rgba(0,0,0,0.1)');

        // Draw stars
        for (let i = 0; i < 10; i++) {
            ctx.shapes.star(ctx.math.random(0, canvas.width),
                ctx.math.random(0, canvas.height),
                5, 20, 10,
                ctx.colors.randomColor());
        }

        // Particles
        ctx.particles.create(ctx.math.random(0, canvas.width),
            ctx.math.random(0, canvas.height),
            { color: 'white', size: 3 });
        ctx.particles.update().draw();
    });

