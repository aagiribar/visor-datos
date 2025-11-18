import { crearGUI, crearInfo, focoCamara } from "./modules/gui";
import { cargarDatos } from "./modules/load";
import { crearObjetosSim, escena, controlOrbital, renderer, camara } from "./modules/simObjects";
import { crearObjetosDatos } from "./modules/dataObjects";
import { bgCamera, bgMaterial, bgScene, clock, createBackground } from "./modules/background";

// Se cargan los datos necesarios
cargarDatos().then(() => {
    // Se inicializa la simulación
    init();
    // Se inicializa el bucle de animación
    animationLoop();
});

function init() {
    crearInfo();
    crearObjetosSim();
    crearGUI();
    crearObjetosDatos();
    createBackground();
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    const elapsedTime = clock.getElapsedTime();

    bgMaterial.uniforms.u_time.value = elapsedTime;

    // Se recoloca el foco de la camara orbital
    controlOrbital.target.x = focoCamara[0];
    controlOrbital.target.y = focoCamara[1];
    controlOrbital.target.z = focoCamara[2];
    controlOrbital.update();

    renderer.clear();

    renderer.render(bgScene, bgCamera);

    // Se renderiza la escena
    renderer.render(escena, camara);
}