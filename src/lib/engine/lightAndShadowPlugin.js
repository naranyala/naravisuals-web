// lightAndShadowPlugin.js
// Real-time 3D lighting & soft shadow system for canvas_util + linearAlgebraPlugin
// Adds: app.lights, app.shade(), app.shadow(), normal-based materials

export function lightAndShadowPlugin(app) {
    if (!app.linalg) {
        console.warn("lightAndShadowPlugin requires linearAlgebraPlugin first!");
        return;
    }

    const { Vector3, Matrix4, Quat } = app.linalg;
    const TAU = Math.PI * 2;

    // Global lighting state
    const lights = {
        ambient: { color: [0.15, 0.15, 0.2], intensity: 1.0 },
        directional: [],   // { dir: Vector3, color: [r,g,b], intensity }
        point: [],         // { pos: Vector3, color: [r,g,b], intensity, radius }
        list: () => [...lights.directional, ...lights.point]
    };

    // Material system
    const materials = {
        default: { color: [1, 1, 1], emissive: [0, 0, 0], shininess: 32, reflectivity: 0.1 },
        create(opts = {}) {
            return Object.assign({}, this.default, opts);
        }
    };

    // Add light helpers
    lights.addDirectional = (dir, color = [1, 1, 1], intensity = 1) => {
        lights.directional.push({
            dir: dir.clone().norm(),
            color: color.slice(),
            intensity
        });
    };

    lights.addPoint = (pos, color = [1, 1, 0.8], intensity = 2, radius = 300) => {
        lights.point.push({
            pos: pos.clone(),
            color: color.slice(),
            intensity,
            radius
        });
    };

    lights.setAmbient = (color, intensity = 1) => {
        lights.ambient.color = color.slice();
        lights.ambient.intensity = intensity;
    };

    // Main shading function — call this in your object's draw()
    function shade(ctx, worldPos, normal, material = materials.default, cameraPos = new Vector3(0, 0, 500)) {
        if (!normal || !worldPos) return material.color;

        const N = normal.clone().norm();
        const V = cameraPos.sub(worldPos).norm(); // view direction

        let diffuse = [0, 0, 0];
        let specular = [0, 0, 0];

        // Ambient
        const ambient = lights.ambient.color.map(c => c * lights.ambient.intensity);

        // Directional + Point lights
        for (const light of lights.list()) {
            let L, attenuation = 1;
            let lightColor = light.color;

            if (light.dir) {
                L = light.dir.clone().mul(-1); // direction TO light
            } else {
                L = light.pos.sub(worldPos);
                const dist = L.len();
                if (dist > light.radius) continue;
                attenuation = 1 - (dist / light.radius);
                attenuation = attenuation * attenuation;
                L = L.norm();
            }

            const NdotL = Math.max(0, N.dot(L));
            if (NdotL <= 0) continue;

            // Diffuse
            diffuse[0] += lightColor[0] * NdotL * light.intensity * attenuation;
            diffuse[1] += lightColor[1] * NdotL * light.intensity * attenuation;
            diffuse[2] += lightColor[2] * NdotL * light.intensity * attenuation;

            // Specular (Blinn-Phong)
            const H = L.add(V).norm();
            const NdotH = Math.max(0, N.dot(H));
            const spec = Math.pow(NdotH, material.shininess) * material.reflectivity;
            specular[0] += spec * light.intensity * attenuation;
            specular[1] += spec * light.intensity * attenuation;
            specular[2] += spec * light.intensity * attenuation;
        }

        // Final color
        const final = [
            (ambient[0] + diffuse[0] + material.emissive[0] + specular[0]) * material.color[0],
            (ambient[1] + diffuse[1] + material.emissive[1] + specular[1]) * material.color[1],
            (ambient[2] + diffuse[2] + material.emissive[2] + specular[2]) * material.color[2]
        ].map(c => Math.min(1, c));

        return final;
    }

    // Soft shadow caster (projected shadow on ground plane Y=0)
    function castShadow(obj, light, groundY = 0, darkness = 0.6) {
        if (!light.pos || !obj.getWorldPos) return;

        const pos = obj.getWorldPos();
        if (pos.y <= groundY + 1) return;

        const toLight = light.pos.sub(pos);
        const distToGround = pos.y - groundY;
        const shadowDist = distToGround / Math.max(0.01, -toLight.y);
        const shadowPos = pos.add(toLight.mul(shadowDist));

        const scale = 1 + (shadowDist * 0.002); // perspective stretch

        app.root.add({
            x: shadowPos.x,
            y: shadowPos.z || shadowPos.y, // flatten to ground
            scaleX: scale * (obj.scaleX || 1),
            scaleY: scale * (obj.scaleY || 1) * 0.5,
            rotation: obj.rotation || 0,
            opacity: darkness * Math.min(1, light.intensity),
            draw(ctx) {
                ctx.fillStyle = '#000';
                ctx.globalAlpha = this.opacity;
                obj.draw?.(ctx);
            }
        });
    }

    // Auto-normal generator for common shapes
    function generateNormal(pos, center = new Vector3()) {
        return pos.sub(center).norm();
    }

    // Plug everything into app
    app.lights = lights;
    app.materials = materials;
    app.shade = shade;
    app.castShadow = castShadow;
    app.generateNormal = generateNormal;

    // Example: Add a default sun + ambient
    lights.setAmbient([0.2, 0.22, 0.3], 0.8);
    lights.addDirectional(new Vector3(2, -3, -1), [1, 0.95, 0.8], 1.2);

    console.log("lightAndShadowPlugin loaded — real-time 3D lighting & shadows ready!");
}
