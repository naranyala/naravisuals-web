<script>
import { ref, nextTick } from "vue"
import * as THREE from "three"
// FIX 1: Correctly import GLTFLoader from three/examples/jsm/loaders
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export default {
    name: "App",
    setup() {
        const models = ref([
            {
                id: 1,
                name: "Damaged Helmet",
                url: "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
                description: "Khronos PBR reference",
                loaded: false
            },
            {
                id: 2,
                name: "Fox",
                url: "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/Fox/glTF/Fox.gltf",
                description: "Animated creature model",
                loaded: false
            },
            {
                id: 3,
                name: "Drone",
                url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Drone.glb",
                description: "Three.js example drone",
                loaded: false
            },
            {
                id: 4,
                name: "Robot Expressive",
                url: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive.glb",
                description: "Expressive animation robot",
                loaded: false
            },
            {
                id: 5,
                name: "BoomBox",
                url: "https://cdn.jsdelivr.net/npm/@babylonjs/assets@latest/BoomBox/glTF/BoomBox.glb",
                description: "BabylonJS sample model",
                loaded: false
            },
            {
                id: 6,
                name: "Low Poly Tree",
                url: "https://cdn.poly.pizza/assets/5mDqlZrVtQO.glb",
                description: "Poly Pizza low-poly tree",
                loaded: false
            }
        ])
        const canvasRefs = ref({})
        const setCanvasRef = (el, id) => {
            if (!el) return
            canvasRefs.value[id] = el
            nextTick(() => initPreview(el, id))
        }

        const initPreview = (canvas, id) => {
            const scene = new THREE.Scene()
            scene.background = new THREE.Color(0x1a1a2e)
            
            // Use the canvas size for aspect ratio
            const width = canvas.clientWidth
            const height = canvas.clientHeight

            const cam = new THREE.PerspectiveCamera(
                75,
                width / height, // Use width/height directly
                0.1,
                1000
            )
            cam.position.z = 2

            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
            renderer.setSize(width, height)
            
            // Lighting
            scene.add(new THREE.AmbientLight(0xffffff, 0.6))
            const dl = new THREE.DirectionalLight(0xffffff, 0.8)
            dl.position.set(1, 1, 1)
            scene.add(dl)

            // Placeholder Torus (will be removed when GLTF loads)
            const geo = new THREE.TorusGeometry(0.8, 0.3, 16, 100)
            const mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
            const mesh = new THREE.Mesh(geo, mat)
            scene.add(mesh)
            const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geo))
            wire.material.transparent = true
            wire.material.opacity = 0.25
            scene.add(wire)

            // Variable to hold the loaded GLTF scene object for animation
            let loadedModel = null

            new GLTFLoader().load(
                models.value.find(m => m.id === id).url,
                gltf => {
                    // Remove placeholder objects
                    scene.remove(mesh, wire)
                    
                    // Add loaded model
                    loadedModel = gltf.scene 
                    scene.add(loadedModel)

                    // FIT Model to View (Optional but recommended for consistent previews)
                    const box = new THREE.Box3().setFromObject(loadedModel)
                    const center = box.getCenter(new THREE.Vector3())
                    const size = box.getSize(new THREE.Vector3())
                    const maxDim = Math.max(size.x, size.y, size.z)
                    const fov = cam.fov * (Math.PI / 180)
                    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5 // Multiplier for padding

                    cam.position.set(center.x, center.y, center.z + cameraZ)
                    cam.lookAt(center)

                    models.value.find(m => m.id === id).loaded = true
                },
                undefined, // onProgress
                (error) => {
                    console.error('An error happened loading model:', id, error)
                    // You might want to display an error state in the UI here
                }
            )

            // FIX 2: Check if GLTF is loaded (loadedModel is set) and only rotate that, 
            // otherwise, rotate the placeholder mesh.
            const animate = () => {
                requestAnimationFrame(animate)
                
                if (loadedModel) {
                    // Rotate the loaded model group
                    loadedModel.rotation.y += 0.005
                } else {
                    // Rotate the placeholder
                    mesh.rotation.x += 0.005
                    mesh.rotation.y += 0.005
                }

                renderer.render(scene, cam)
            }
            animate()

            // Handle resizing
            window.addEventListener("resize", () => {
                const newWidth = canvas.clientWidth
                const newHeight = canvas.clientHeight
                cam.aspect = newWidth / newHeight
                cam.updateProjectionMatrix()
                renderer.setSize(newWidth, newHeight)
            })
        }

        // The viewModel function is already correct and robust.
        const viewModel = model => {
            const w = window.open("", "_blank")
            w.document.write(`
                <html><body style="margin:0">
                <div id="c"></div>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
                <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.min.js"><\/script>
                <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.min.js"><\/script>
                <script>
                    // ... (original content)
                    const s=new THREE.Scene(); s.background=new THREE.Color(0x1a1a2e);
                    const c=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,1e3); c.position.z=3;
                    const r=new THREE.WebGLRenderer({antialias:true}); r.setSize(innerWidth,innerHeight);
                    document.getElementById("c").appendChild(r.domElement)
                    s.add(new THREE.AmbientLight(0xffffff,.6))
                    const d=new THREE.DirectionalLight(0xffffff,.8); d.position.set(1,1,1); s.add(d)
                    const o=new THREE.OrbitControls(c,r.domElement)
                    new THREE.GLTFLoader().load("${model.url}",g=>{
                        s.add(g.scene)
                        const box=new THREE.Box3().setFromObject(g.scene)
                        const ctr=box.getCenter(new THREE.Vector3())
                        const size=box.getSize(new THREE.Vector3()).length()
                        const fov = c.fov * (Math.PI / 180)
                        let cameraZ = Math.abs(size / 2 / Math.tan(fov / 2)) * 1.5 // Added multiplier for padding
                        c.position.set(ctr.x, ctr.y, ctr.z + Math.max(cameraZ, 3)) // Use calculated Z, min 3
                        o.target.copy(ctr); o.update()
                    })
                    ;(function loop(){requestAnimationFrame(loop);o.update();r.render(s,c)})()
                    onresize=()=>{c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();r.setSize(innerWidth,innerHeight)}
                <\/script>
                </body></html>
            `)
        }

        return { models, setCanvasRef, viewModel }
    }
}
</script>
