import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { crearGUI, crearInfo, eleccionActual, focoCamara } from "./modules/gui";
import { cargarDatos, datosElect, datosCol, datosGeo } from "./modules/load";

// Latitud y longitud de los extremos del mapa de la imagen
export let minLon_es = -10.24;
export let maxLon_es = 5.03;
export let minLat_es = 34.81;
export let maxLat_es = 44.26;

export let minLon_can = -18.402;
export let maxLon_can = -13.310;
export let minLat_can = 27.406;
export let maxLat_can = 29.473;

// Array con parte de los nombres de los archivos de datos
export const elecciones = ["1977", "1979", "1982", "1986", "1989", "1993", "1996", "2000", "2004", "2008", "2011", "2015", "2016", "04_2019", "11_2019", "2023"];
// Array con los textos que mostrar en el selector
export const textosElecciones = ["Junio de 1977", "Marzo de 1979", "Octubre de 1982", "Junio de 1986", "Octubre de 1989", "Junio de 1993", "Marzo de 1996", "Marzo de 2000", "Marzo de 2004", "Marzo de 2008", "Noviembre de 2011", "Diciembre de 2015", "Junio de 2016", "Abril de 2019", "Noviembre de 2019", "Julio de 2023"];

// Array en el que se almacenarán los cubos creados para representar los datos
// Contiene un array por cada elección y, a su vez, cada array contendrá un array por provincia en el que se almacenarán los cubos correspondientes a esa provincia
export let objetos = [];

// Planos que representan a los dos mapas
export let mapaEs, mapaCan;

export let escena, camara, renderer;
export let controlOrbital;

// Se cargan los datos necesarios
cargarDatos().then(() => {
    // Se inicializa la simulación
    init();
    // Se inicializa el bucle de animación
    animationLoop();
});

function init() {
    crearInfo();
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
    document.body.appendChild(renderer.domElement);

    // Redimensión de la ventana
    window.addEventListener("resize", function(event) {
        camara.aspect = window.innerWidth / window.innerHeight;
        camara.updateProjectionMatrix();
  
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Creación del control de tipo orbital
    controlOrbital = new OrbitControls(camara, renderer.domElement);

    // Creación y texturización del plano que representa al mapa de España
    mapaEs = Plano(0, 0, 0, "España");
    texturizarPlano(mapaEs, "/static/assets/mapa_es.png");

    // Creación y texturización del plano que representa al mapa de Canarias
    mapaCan = Plano(-10, 0, 0, "Canarias");
    texturizarPlano(mapaCan, "/static/assets/mapa_can.png");

    crearGUI();

    // Se dibujan sin mostrar los resultados en los mapas
    for (let i = 0; i < elecciones.length; i++) {
        objetos.push(dibujarDatosEleccion(datosElect[i]));
    }
    // Se muestran los resultados del primer proceso electoral
    mostrarDatosEleccion(0, "Todas");
}

// Función que crear un plano
// x, y, z: Posición del plano
// nombre: Nombre que almacenar como información del plano
function Plano(x, y, z, nombre = undefined) {
    let geometria = new THREE.PlaneGeometry(5, 5);
    let material = new THREE.MeshBasicMaterial({});
    let mesh = new THREE.Mesh(geometria, material);
    
    mesh.position.set(x, y, z);
    mesh.userData.mapsX = 5;
    mesh.userData.mapsY = 5;
    if (nombre != undefined) {
        mesh.userData.nombre = nombre;
    }
    escena.add(mesh);
    return mesh;
}

// Función para crear un cubo
// x,y,z: Posición del cubo
// ancho, alto, profundidad: Dimensiones del cubo
// color: Color del cubo
// nombre: Nombre que almacenar como información del cubo
function Cubo(x, y, z, ancho, alto, profundidad, color, nombre = undefined) {
    let geometria = new THREE.BoxGeometry(ancho, alto, profundidad);
    let material = new THREE.MeshBasicMaterial({
        color: color
    });
    let mesh = new THREE.Mesh(geometria, material);

    mesh.position.set(x, y, z);
    mesh.visible = false;
    if (nombre != undefined) {
        mesh.userData.nombre = nombre;
    }
    escena.add(mesh);
    return mesh;
}

// Función que mustra los datos de un proceso electoral y una provincia
// indiceEleccion: Índice en el array en el que se almacenan los datos electores
// provincia: Provincia que se desea visualizar. Si es "Todas" se visualizan todas
export function mostrarDatosEleccion(indiceEleccion, provincia) {
    let cubosEleccion, cubosProvincia;

    if(eleccionActual != undefined) {
        cubosEleccion = objetos[eleccionActual[1]];
        for (let i = 0; i < cubosEleccion.length; i++) {
            cubosProvincia = cubosEleccion[i];
            for (let j = 0; j < cubosProvincia.length; j++) {
                cubosProvincia[j].visible = false;
            }
        }
    }
    
    cubosEleccion = objetos[indiceEleccion];
    for (let i = 0; i < cubosEleccion.length; i++) {
        cubosProvincia = cubosEleccion[i];
        for (let j = 0; j < cubosProvincia.length; j++) {
            if (provincia == "Todas" || cubosProvincia[j].userData.nombre == provincia) {
                cubosProvincia[j].visible = true;
            }
        }
    }
}

// Función que crea los diferentes cubos para la representación
// Estos cubos se crean y se añaden a la escena pero no son visibles en un principio
// datosEleccion: Objeto con los datos electorales
function dibujarDatosEleccion(datosEleccion) {
    let cubosEleccion = [];
    for (let i = 0; i < datosEleccion.resultados.length; i++) {
        cubosEleccion.push(dibujarDatosProvincia(datosEleccion, i));
    }
    return cubosEleccion;
}

// Función que crea los cubos de una provincia concreta
// datosEleccion: Objeto con los datos electorales
// indiceProvincia: Índice que representa a una provincia en el array de resultados
function dibujarDatosProvincia(datosEleccion, indiceProvincia) {
    let datosProvincia = datosEleccion.resultados[indiceProvincia];
    const coordenadas = obtenerCoordenadas(datosProvincia[0]);

    let cubos = [];
    const resultados = datosEleccion.resultados[indiceProvincia];

    let profundidadAnterior = 0;
    let zCuboAnterior = 0;
    for (let i = 1; i < resultados.length; i++) {
        const diputados = parseInt(resultados[i]);
        if (diputados > 0) {
            let coordenadasMapa = obtenerCoordenadasMapa(coordenadas);
            let profundidad = diputados * 0.03;
            let color = obtenerColor(datosEleccion.indice, i - 1);
            let zNuevoCubo = zCuboAnterior + (profundidadAnterior / 2) + (profundidad / 2);
            let cubo = Cubo(coordenadasMapa[0], coordenadasMapa[1], zNuevoCubo, 0.15, 0.15, profundidad, color, resultados[0]);
            cubos.push(cubo);
            profundidadAnterior = profundidad;
            zCuboAnterior = zNuevoCubo;
        }
    }
    return cubos;
}

// Función para obtener las coordenadas de una provincia de los datos geográficos
// provincia: Nombre de la provincia
export function obtenerCoordenadas(provincia) {
    let provinciaEncontrada = datosGeo.find((valor) => valor.nombre == provincia);
    return [parseFloat(provinciaEncontrada.longitud), parseFloat(provinciaEncontrada.latitud)];
}

// Función que transforma las coordenadas reales a las coordenadas de los mapas creados
// coordenadas: Array con las coordenadas [longitud, latitud]
export function obtenerCoordenadasMapa(coordenadas) {
    let longitud, latitud;
    if (coordenadas[1] < 30) {
        // Si la latitud es inferior a 30 se mapea con respecto al mapa de las Islas Canarias
        longitud = (mapeo(coordenadas[0], minLon_can, maxLon_can, -mapaCan.userData.mapsX / 2, mapaCan.userData.mapsX / 2)) - 10;
        latitud = mapeo(coordenadas[1], minLat_can, maxLat_can, -mapaCan.userData.mapsY / 2, mapaCan.userData.mapsY);
    }
    else {
        longitud = mapeo(coordenadas[0], minLon_es, maxLon_es, -(mapaEs.userData.mapsX / 2), mapaEs.userData.mapsX / 2);
        latitud = mapeo(coordenadas[1], minLat_es, maxLat_es, -(mapaEs.userData.mapsY / 2), mapaEs.userData.mapsY / 2);
    }
    return [longitud, latitud];
}

// Función que obtiene el color de un partido de los datos de colores
// indiceEleccion: Índice de la elección actual en el array de datos electorales
// indicePartido: Índice del partido en los datos
// numero: Si se desea que el valor se devuelva como número o como String
export function obtenerColor(indiceEleccion, indicePartido, numero = true) {
    if (numero) {
        return parseInt(datosCol[indiceEleccion][indicePartido]);
    }
    else {
        return "#" + datosCol[indiceEleccion][indicePartido].substring(2);
    }
}

// Función que aplica una textura a un plano
// plano: Plano que se va a texturizar
// textura: URL de la textura
function texturizarPlano(plano, urlTextura) {
    new THREE.TextureLoader().load(
        urlTextura,
        function(textura) {
            plano.material.map = textura;
            plano.material.needsUpdate = true;

            const txHeight = textura.image.height;
            const txWidth = textura.image.width;

            if (txHeight > txWidth) {
                let factor = txHeight / txWidth;
                plano.scale.set(1, factor, 1);
                plano.userData.mapsY *= factor;
            }
            else {
                let factor = txWidth / txHeight;
                plano.scale.set(factor, 1, 1);
                plano.userData.mapsX *= factor;
            }
        }
    )
}

// Función que mapea una coordenada a los mapas
function mapeo(val, vmin, vmax, dmin, dmax) {
    //Normaliza valor en el rango de partida, t=0 en vmin, t=1 en vmax
    let t = 1 - (vmax - val) / (vmax - vmin);
    return dmin + t * (dmax - dmin);
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