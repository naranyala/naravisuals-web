
// Raylib-inspired Canvas API Wrapper
const Raylib = (function () {
    // Private variables
    let canvas, ctx;
    let screenWidth, screenHeight;
    let isRunning = false;
    let lastTime = 0;
    let targetFPS = 60;
    let frameTime = 1000 / targetFPS;

    // Colors (RGBA)
    const Colors = {
        BLACK: { r: 0, g: 0, b: 0, a: 1 },
        WHITE: { r: 255, g: 255, b: 255, a: 1 },
        RED: { r: 255, g: 0, b: 0, a: 1 },
        GREEN: { r: 0, g: 255, b: 0, a: 1 },
        BLUE: { r: 0, g: 0, b: 255, a: 1 },
        YELLOW: { r: 255, g: 255, b: 0, a: 1 }
    };

    // Input state
    const keys = {};
    const mouse = { x: 0, y: 0, left: false, right: false };

    // Initialize window (canvas)
    function InitWindow(width, height, title) {
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        screenWidth = width;
        screenHeight = height;
        ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);
        document.title = title;

        // Setup input listeners
        window.addEventListener('keydown', (e) => keys[e.code] = true);
        window.addEventListener('keyup', (e) => keys[e.code] = false);
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.addEventListener('mousedown', (e) => {
            mouse.left = (e.button === 0);
            mouse.right = (e.button === 2);
        });
        canvas.addEventListener('mouseup', (e) => {
            mouse.left = (e.button === 0) ? false : mouse.left;
            mouse.right = (e.button === 2) ? false : mouse.right;
        });
    }

    // Check if window should close
    function WindowShouldClose() {
        return !isRunning;
    }

    // Set target FPS
    function SetTargetFPS(fps) {
        targetFPS = fps;
        frameTime = 1000 / fps;
    }

    // Begin drawing
    function BeginDrawing() {
        ctx.save();
    }

    // End drawing
    function EndDrawing() {
        ctx.restore();
    }

    // Clear background
    function ClearBackground(color) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fillRect(0, 0, screenWidth, screenHeight);
    }

    // Draw text
    function DrawText(text, x, y, fontSize, color) {
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fillText(text, x, y);
    }

    // Draw rectangle
    function DrawRectangle(x, y, width, height, color) {
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fillRect(x, y, width, height);
    }

    // Draw circle
    function DrawCircle(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
        ctx.fill();
    }

    // Input handling
    function IsKeyDown(keyCode) {
        return !!keys[keyCode];
    }

    function GetMousePosition() {
        return { x: mouse.x, y: mouse.y };
    }

    function IsMouseButtonDown(button) {
        return button === 0 ? mouse.left : mouse.right;
    }

    // Game loop
    function RunGameLoop(update, draw) {
        isRunning = true;
        function loop(currentTime) {
            if (!isRunning) return;

            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            update(deltaTime);
            BeginDrawing();
            draw();
            EndDrawing();

            const elapsed = performance.now() - currentTime;
            const delay = Math.max(0, frameTime - elapsed);
            setTimeout(() => requestAnimationFrame(loop), delay);
        }
        requestAnimationFrame(loop);
    }

    // Close window
    function CloseWindow() {
        isRunning = false;
        canvas.remove();
    }

    // Public API
    return {
        InitWindow,
        WindowShouldClose,
        SetTargetFPS,
        BeginDrawing,
        EndDrawing,
        ClearBackground,
        DrawText,
        DrawRectangle,
        DrawCircle,
        IsKeyDown,
        GetMousePosition,
        IsMouseButtonDown,
        RunGameLoop,
        CloseWindow,
        Colors
    };
})();

export default Raylib
