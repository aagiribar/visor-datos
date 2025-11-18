import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export let escena, camara, renderer;
export let controlOrbital;

export function crearObjetosSim() {
    // Creación de la escena
    escena = new THREE.Scene();

    // Creación de la camara
    camara = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )

    camara.position.z = 5;

    // Creación del renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    
    document.body.appendChild(renderer.domElement);

    // Redimensión de la ventana
    window.addEventListener("resize", function (event) {
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Creación del control de tipo orbital
    controlOrbital = new OrbitControls(camara, renderer.domElement);
    controlOrbital.enableDamping = true;
    controlOrbital.enablePan = false;
}