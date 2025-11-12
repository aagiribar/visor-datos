import { GUI } from "lil-gui";
import {
    textosElecciones,
    datosGeo,
    mostrarDatosEleccion,
    elecciones,
    datosElect,
    obtenerColor,
    obtenerCoordenadasMapa,
    obtenerCoordenadas
} from "../datos.js";

// Array en el que se cargarán los nombres de las provincias
export let nombresProvincias = [];
export let provinciaActual = "Todas";
// Array que contiene el valor y el indice del proceso electoral seleccionado
export let eleccionActual;

// Variable para almacenar el elemento de información mostrado actualmente
export let infoActual;
// Array en el que se almacenan los elementos HTML creados para mostrar los resultados nacionales
export let elementosInfoGeneral = [];
// Array en el que se almacenan los elementos HTML creados para mostrar los resultados locales
export let elementosInfoProvincias = [];

// Elemento de información para mostrar en pantalla
export let info;

// Inicialización del punto sobre el que orbita la cámara al principio de la simulación
export let focoCamara = [0, 0, 0];


// Creación de la interfaz de usuario
export const gui = new GUI();
let elementosUI;
let selectorMapa, selectorEleccion, selectorProvincia;

export function crearGUI() {
    // Objeto que almacena los elementos de la interfaz de usuario
    elementosUI = {
        "Mapa seleccionado": "España",
        "Elección seleccionada": textosElecciones[0],
        "Provincia": "Todas"
    }

    // Selector de mapa sobre el que orbitará la cámara
    selectorMapa = gui.add(elementosUI, "Mapa seleccionado", ["España", "Canarias"]);
    selectorMapa.onChange(
        function (valor) {
            if (valor == "España") {
                focoCamara = [0, 0, 0];
            }
            else if (valor == "Canarias") {
                focoCamara = [-10, 0, 0];
            }
        }
    );

    // Selector de proceso electoral mostrado
    selectorEleccion = gui.add(elementosUI, "Elección seleccionada", textosElecciones);
    selectorEleccion.onChange(
        function (valor) {
            let indice = textosElecciones.findIndex((texto) => valor == texto);
            mostrarDatosEleccion(indice, provinciaActual);
            // Se modifica el elemento de información para mostrar los datos correspondientes al proceso electoral seleccionado
            info.removeChild(infoActual);
            eleccionActual = [elecciones[indice], indice];
            if (provinciaActual == "Todas") {
                infoActual = elementosInfoGeneral[eleccionActual[1]];
                info.appendChild(infoActual);
            }
            else {
                let indice = elementosInfoProvincias[eleccionActual[1]].findIndex((elemento) => elemento.id == provinciaActual);
                infoActual = elementosInfoProvincias[eleccionActual[1]][indice];
                info.appendChild(infoActual);
            }
        }
    );

    // Selector de provincia
    nombresProvincias = obtenerNombresProvincias();
    nombresProvincias.push("Todas");

    selectorProvincia = gui.add(elementosUI, "Provincia", nombresProvincias);
    selectorProvincia.onChange(
        function (valor) {
            info.removeChild(infoActual);
            mostrarDatosEleccion(eleccionActual[1], valor);
            provinciaActual = valor;

            // Añade el elemento de información correspondiente y cambia el foco de la cámara
            if (valor == "Todas") {
                selectorMapa.show();
                focoCamara = [0, 0, 0];
                selectorMapa.setValue("España");
                infoActual = elementosInfoGeneral[eleccionActual[1]];
                info.appendChild(infoActual);
            }
            else {
                selectorMapa.hide();
                let coordenadas = obtenerCoordenadasMapa(obtenerCoordenadas(valor));
                focoCamara = [coordenadas[0], coordenadas[1], 0];
                let indice = elementosInfoProvincias[eleccionActual[1]].findIndex((elemento) => elemento.id == valor);
                infoActual = elementosInfoProvincias[eleccionActual[1]][indice];
                info.appendChild(infoActual);
            }
        }
    )
    eleccionActual = [elecciones[0], 0];
}

export function crearInfo() {
    // Elemento de información para visualizar los resultados
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'left';
    info.style.color = '#fff';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = "Resultados";
    document.body.appendChild(info);
    crearInfoResultadosGeneral();
    crearInfoResultadosProvincia();
    info.appendChild(elementosInfoGeneral[0]);
    infoActual = elementosInfoGeneral[0];
}

// Función que devuelve un array con los nombres de las provincias
function obtenerNombresProvincias() {
    let nombres = [];

    for (let i = 0; i < datosGeo.length; i++) {
        nombres.push(datosGeo[i].nombre);
    }

    return nombres;
}

// Función que crea los elementos de información con los resultados nacionales (cuando se selecciona la provincia "Todas")
function crearInfoResultadosGeneral() {
    for (let i = 0; i < elecciones.length; i++) {
        let totales = datosElect[i].totales;
        let encabezados = datosElect[i].encabezados;
        let elemento = document.createElement("div");

        elemento.innerHTML = "Resultados Generales - Elecciones de " + textosElecciones[i];
        for (let j = 1; j < totales.length; j++) {
            let infoPartido = document.createElement("div");
            let nombrePartido = document.createElement("span");
            nombrePartido.innerHTML = encabezados[j];
            nombrePartido.style.color = obtenerColor(i, j - 1, false);
            infoPartido.appendChild(nombrePartido);
            let diputadosPartido = document.createElement("span");
            diputadosPartido.innerHTML = " - " + totales[j];
            infoPartido.appendChild(diputadosPartido);
            elemento.appendChild(infoPartido);
        }
        elementosInfoGeneral.push(elemento);
    }
}

// Función que crea los elementos de información con los resultados provinciales (cuando se selecciona una provincia)
function crearInfoResultadosProvincia() {
    let elementosInfo = [];
    for (let i = 0; i < elecciones.length; i++) {
        let resultados = datosElect[i].resultados;
        let encabezados = datosElect[i].encabezados;
        let elementosInfoActual = [];

        for (let j = 0; j < resultados.length; j++) {
            let elemento = document.createElement("div");
            elemento.id = resultados[j][0];
            elemento.innerHTML = "Resultados de la provincia de " + elemento.id + " - Elecciones de " + textosElecciones[i];
            
            for (let k = 1; k < resultados[j].length; k++) {
                if(resultados[j][k] != 0) {
                    let infoPartido = document.createElement("div");
                    let nombrePartido = document.createElement("span");
                    nombrePartido.innerHTML = encabezados[k];
                    nombrePartido.style.color = obtenerColor(i, k - 1, false);
                    infoPartido.appendChild(nombrePartido);
                    let diputadosPartido = document.createElement("span");
                    diputadosPartido.innerHTML = " - " + resultados[j][k];
                    infoPartido.appendChild(diputadosPartido);
                    elemento.appendChild(infoPartido);
                }
            }
            elementosInfoActual.push(elemento);
        }
        elementosInfo.push(elementosInfoActual);
    }
    elementosInfoProvincias = elementosInfo;
}