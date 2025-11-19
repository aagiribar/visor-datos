import { createGUI, createInfo, cameraFocus } from "./modules/gui";
import { loadData } from "./modules/load";
import { createSimObjects, scene, orbitControl, renderer, camera } from "./modules/simObjects";
import { createDataObjects } from "./modules/dataObjects";
import { bgCamera, bgMaterial, bgScene, clock, createBackground } from "./modules/background";

// Se cargan los datos necesarios
loadData().then(() => {
    // Se inicializa la simulación
    init();
    // Se inicializa el bucle de animación
    animationLoop();
});

function init() {
    createInfo();
    createSimObjects();
    createGUI();
    createDataObjects();
    createBackground();
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    const elapsedTime = clock.getElapsedTime();

    bgMaterial.uniforms.u_time.value = elapsedTime;

    // Se recoloca el foco de la camara orbital
    orbitControl.target.x = cameraFocus[0];
    orbitControl.target.y = cameraFocus[1];
    orbitControl.target.z = cameraFocus[2];
    orbitControl.update();

    renderer.clear();

    // Se renderiza la escene del fondo
    renderer.render(bgScene, bgCamera);

    // Se renderiza la esce
    renderer.render(scene, camera);
}