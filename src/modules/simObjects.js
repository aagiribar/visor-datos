import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export let scene, camera, renderer;
export let orbitControl;

/**
 * Función para crear los objetos de la simulación
 */
export function createSimObjects() {
    // Creación de la escena
    scene = new THREE.Scene();

    // Creación de la camara
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    camera.position.z = 5;

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Redimensión de la ventana
    window.addEventListener("resize", function (event) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Creación del control de tipo orbital
    orbitControl = new OrbitControls(camera, renderer.domElement);
    orbitControl.enableDamping = true;
    orbitControl.enablePan = false;
}