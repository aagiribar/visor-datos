import * as THREE from "three";
import { scene } from "./simObjects";
import { electionData, getColor, getCoordinates, elections } from "./load";
import { actualElection } from "./gui";

// Latitud y longitud de los extremos del mapa de la imagen
export let minLon_es = -10.24;
export let maxLon_es = 5.03;
export let minLat_es = 34.81;
export let maxLat_es = 44.26;

export let minLon_can = -18.402;
export let maxLon_can = -13.310;
export let minLat_can = 27.406;
export let maxLat_can = 29.473;

// Array en el que se almacenarán los cubos creados para representar los datos
// Contiene un array por cada elección y, a su vez, cada array contendrá un array por provincia en el que se almacenarán los cubos correspondientes a esa provincia
export let objects = [];

// Planos que representan a los dos mapas
export let mapEs, mapCan;

/**
 * Función que crea los objetos que representan a los datos en la simulación
 */
export function createDataObjects() {
    // Creación y texturización del plano que representa al mapa de España
    mapEs = Plane(0, 0, 0, "España");
    texturizePlane(mapEs, "/static/assets/mapa_es.png");

    // Creación y texturización del plano que representa al mapa de Canarias
    mapCan = Plane(-10, 0, 0, "Canarias");
    texturizePlane(mapCan, "/static/assets/mapa_can.png");

    // Se dibujan sin mostrar los resultados en los mapas
    for (let i = 0; i < elections.length; i++) {
        objects.push(drawElectionData(electionData[i]));
    }
    // Se muestran los resultados del primer proceso electoral
    showElectionData(0, "Todas");
}

/**
 * Función que crea un plano en una posición determinada
 * @param {Number} x Posición del plano en el eje X
 * @param {Number} y Posición del plano en el eje Y
 * @param {Number} z Posición del plano en el eje Z 
 * @param {String} name Nombre del plano
 * @returns El objeto que representa al plano
 */
function Plane(x, y, z, name = undefined) {
    let geometry = new THREE.PlaneGeometry(5, 5);
    let material = new THREE.MeshBasicMaterial({});
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.userData.mapsX = 5;
    mesh.userData.mapsY = 5;
    if (name != undefined) {
        mesh.userData.name = name;
    }

    scene.add(mesh);
    return mesh;
}

/**
 * Función que crea un cubo de dimensiones determinadas en una posición determinada
 * @param {Number} x Posición del cubo en el eje X 
 * @param {Number} y Posición del cubo en el eje Y
 * @param {Number} z Posición del cubo en el eje Z 
 * @param {Number} width Anchura del cubo
 * @param {Number} height Altura del cubo
 * @param {Number} depth Profundidad del cubo
 * @param {*} color Color del cubo
 * @param {String} name Nombre del cubo
 * @returns El objeto que representa al cubo
 */
function Cube(x, y, z, width, height, depth, color, name = undefined) {
    let geometry = new THREE.BoxGeometry(width, height, depth);
    let material = new THREE.MeshBasicMaterial({
        color: color
    });
    let mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.visible = false;

    if (name != undefined) {
        mesh.userData.name = name;
    }

    scene.add(mesh);
    return mesh;
}

/**
 * Función que crea los cubos de una provincia concreta
 * @param {*} electionData Objeto con los datos electorales
 * @param {Number} provinceIndex Índice que representa a una provincia en el array de resultados
 * @returns Array con los cubos que representan los resultados
 */
function drawProvinceData(electionData, provinceIndex) {
    let provinceData = electionData.results[provinceIndex];
    const coordinates = getCoordinates(provinceData[0]);

    let cubes = [];
    const results = electionData.results[provinceIndex];

    let previousDepth = 0;
    let previousCubeZ = 0;
    for (let i = 1; i < results.length; i++) {
        const seats = parseInt(results[i]);
        if (seats > 0) {
            let mapCoordinates = getMapCoordinates(coordinates);
            let depth = seats * 0.03;
            let color = getColor(electionData.index, i - 1);
            let newCubeZ = previousCubeZ + (previousDepth / 2) + (depth / 2);
            let cube = Cube(mapCoordinates[0], mapCoordinates[1], newCubeZ, 0.15, 0.15, depth, color, results[0]);
            cubes.push(cube);
            previousDepth = depth;
            previousCubeZ = newCubeZ;
        }
    }
    return cubes;
}

/**
 * Función que crea los diferentes cubos para la representación
 * Estos cubos se crean y se añaden a la escena pero no son visibles en un principio
 * @param {*} electionData Objeto con los datos electorales
 * @returns Un array con los objetos que representan los datos electorales
 */
function drawElectionData(electionData) {
    let electionCubes = [];
    for (let i = 0; i < electionData.results.length; i++) {
        electionCubes.push(drawProvinceData(electionData, i));
    }
    return electionCubes;
}

/**
 * Función que aplica una textura a un plano
 * @param {*} plane Plano que se va a texturizar
 * @param {String} textureURL URL de la textura
 */
function texturizePlane(plane, textureURL) {
    new THREE.TextureLoader().load(
        textureURL,
        function (texture) {
            plane.material.map = texture;
            plane.material.needsUpdate = true;

            const txHeight = texture.image.height;
            const txWidth = texture.image.width;

            if (txHeight > txWidth) {
                let factor = txHeight / txWidth;
                plane.scale.set(1, factor, 1);
                plane.userData.mapsY *= factor;
            }
            else {
                let factor = txWidth / txHeight;
                plane.scale.set(factor, 1, 1);
                plane.userData.mapsX *= factor;
            }
        }
    )
}

/**
 * Función que transforma las coordenadas reales a las coordenadas de los mapas creados
 * @param {Number[]} coordinates Array con las coordenadas [longitud, latitud]
 * @returns Las coordenadas correspondientes a los mapas
 */
export function getMapCoordinates(coordinates) {
    let longitude, latitude;
    if (coordinates[1] < 30) {
        // Si la latitud es inferior a 30 se mapea con respecto al mapa de las Islas Canarias
        longitude = (mapping(coordinates[0], minLon_can, maxLon_can, -mapCan.userData.mapsX / 2, mapCan.userData.mapsX / 2)) - 10;
        latitude = mapping(coordinates[1], minLat_can, maxLat_can, -mapCan.userData.mapsY / 2, mapCan.userData.mapsY);
    }
    else {
        longitude = mapping(coordinates[0], minLon_es, maxLon_es, -(mapEs.userData.mapsX / 2), mapEs.userData.mapsX / 2);
        latitude = mapping(coordinates[1], minLat_es, maxLat_es, -(mapEs.userData.mapsY / 2), mapEs.userData.mapsY / 2);
    }
    return [longitude, latitude];
}

/**
 * Función que mapea una coordenada a los mapas
 * @param {Number} val Valor que se desea mapear
 * @param {Number} vmin Valor mínimo del rango de partida
 * @param {Number} vmax Valor máximo del rango de partida
 * @param {Number} dmin Valor mínimo del rango destino
 * @param {Number} dmax Valor máximo del rango destino
 * @returns El valor mapeado
 */
function mapping(val, vmin, vmax, dmin, dmax) {
    //Normaliza valor en el rango de partida, t=0 en vmin, t=1 en vmax
    let t = 1 - (vmax - val) / (vmax - vmin);
    return dmin + t * (dmax - dmin);
}

/**
 * Función que mustra los datos de un proceso electoral y una provincia
 * @param {Number} electionIndex Índice en el array en el que se almacenan los datos electores
 * @param {String} province Provincia que se desea visualizar. Si es "Todas" se visualizan todas
 */
export function showElectionData(electionIndex, province) {
    let electionCubes, provinceCubes;

    if (actualElection != undefined) {
        electionCubes = objects[actualElection[1]];
        for (let i = 0; i < electionCubes.length; i++) {
            provinceCubes = electionCubes[i];
            for (let j = 0; j < provinceCubes.length; j++) {
                provinceCubes[j].visible = false;
            }
        }
    }

    electionCubes = objects[electionIndex];
    for (let i = 0; i < electionCubes.length; i++) {
        provinceCubes = electionCubes[i];
        for (let j = 0; j < provinceCubes.length; j++) {
            if (province == "Todas" || provinceCubes[j].userData.name == province) {
                provinceCubes[j].visible = true;
            }
        }
    }
}