import { createGUI, createInfo, cameraFocus } from "./modules/gui";
import { loadData } from "./modules/load";
import { createSimObjects, scene, orbitControl, renderer, camera } from "./modules/simObjects";
import { createDataObjects } from "./modules/dataObjects";

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
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    // Se recoloca el foco de la camera orbital
    orbitControl.target.x = cameraFocus[0];
    orbitControl.target.y = cameraFocus[1];
    orbitControl.target.z = cameraFocus[2];
    orbitControl.update();

    // Se renderiza la esce
    renderer.render(scene, camera);
}