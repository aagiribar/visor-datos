import { crearGUI, crearInfo, focoCamara } from "./modules/gui";
import { cargarDatos } from "./modules/load";
import { crearObjetosSim, escena, controlOrbital, renderer, camara } from "./modules/simObjects";
import { crearObjetosDatos } from "./modules/dataObjects";

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
}

function animationLoop() {
    requestAnimationFrame(animationLoop);

    // Se recoloca el foco de la camara orbital
    controlOrbital.target.x = focoCamara[0];
    controlOrbital.target.y = focoCamara[1];
    controlOrbital.target.z = focoCamara[2];
    controlOrbital.update();

    // Se renderiza la escena
    renderer.render(escena, camara);
}