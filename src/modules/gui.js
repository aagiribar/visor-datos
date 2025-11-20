import { GUI } from "lil-gui";
import { electionData, geoData, getColor, getCoordinates, elections, getSelectedColors } from "./load.js";
import { showElectionData, getMapCoordinates } from "./dataObjects.js";
import { setBgColorPalette } from "./background.js";

// Array con los textos que mostrar en el selector
export const electionTexts = [
    "Junio de 1977", 
    "Marzo de 1979", 
    "Octubre de 1982", 
    "Junio de 1986", 
    "Octubre de 1989", 
    "Junio de 1993", 
    "Marzo de 1996", 
    "Marzo de 2000", 
    "Marzo de 2004", 
    "Marzo de 2008", 
    "Noviembre de 2011", 
    "Diciembre de 2015", 
    "Junio de 2016", 
    "Abril de 2019", 
    "Noviembre de 2019", 
    "Julio de 2023"
];

// Array en el que se cargarán los nombres de las provincias
export let provinceNames = [];
export let actualProvince = "Todas";
// Array que contiene el valor y el indice del proceso electoral seleccionado
export let actualElection;

// Variable para almacenar el elemento de información mostrado actualmente
export let actualInfo;
// Array en el que se almacenan los elementos HTML creados para mostrar los resultados nacionales
export let generalInfoElements = [];
// Array en el que se almacenan los elementos HTML creados para mostrar los resultados locales
export let provinceInfoElements = [];

// Elemento de información para mostrar en pantalla
export let info;

// Inicialización del punto sobre el que orbita la cámara al principio de la simulación
export let cameraFocus = [0, 0, 0];


// Creación de la interfaz de usuario
export const gui = new GUI();
export let uiElements;
let mapSelector, electionSelector, provinceSelector;

// Array que almacena los colores mostrados en los resultados para utilizarlos en el shader de fondo
let actualSelectedColors;

/**
 * Función que crea la interfaz de usuario
 */
export function createGUI() {
    // Objeto que almacena los elementos de la interfaz de usuario
    uiElements = {
        "Mapa seleccionado": "España",
        "Elección seleccionada": electionTexts[0],
        "Provincia": "Todas",
        "Mostrar fondo": true
    }

    // Selector de mapa sobre el que orbitará la cámara
    mapSelector = gui.add(uiElements, "Mapa seleccionado", ["España", "Canarias"]);
    mapSelector.onChange(
        function (value) {
            if (value == "España") {
                cameraFocus = [0, 0, 0];
            }
            else if (value == "Canarias") {
                cameraFocus = [-10, 0, 0];
            }
        }
    );

    // Selector de proceso electoral mostrado
    electionSelector = gui.add(uiElements, "Elección seleccionada", electionTexts);
    electionSelector.onChange(
        function (value) {
            let index = electionTexts.findIndex((text) => value == text);
            showElectionData(index, actualProvince);
            // Se modifica el elemento de información para mostrar los datos correspondientes al proceso electoral seleccionado
            info.removeChild(actualInfo);
            actualElection = [elections[index], index];
            if (actualProvince == "Todas") {
                actualInfo = generalInfoElements[actualElection[1]];
                info.appendChild(actualInfo);
            }
            else {
                let index = provinceInfoElements[actualElection[1]].findIndex((element) => element.id == actualProvince);
                actualInfo = provinceInfoElements[actualElection[1]][index];
                info.appendChild(actualInfo);
            }
            
            actualSelectedColors = getSelectedColors(actualElection[1], actualProvince);
            setBgColorPalette(actualSelectedColors);
        }
    );

    // Selector de provincia
    provinceNames = getProvinceNames();
    provinceNames.push("Todas");

    provinceSelector = gui.add(uiElements, "Provincia", provinceNames);
    provinceSelector.onChange(
        function (value) {
            info.removeChild(actualInfo);
            showElectionData(actualElection[1], value);
            actualProvince = value;

            // Añade el elemento de información correspondiente y cambia el foco de la cámara
            if (value == "Todas") {
                mapSelector.show();
                cameraFocus = [0, 0, 0];
                mapSelector.setValue("España");
                actualInfo = generalInfoElements[actualElection[1]];
                info.appendChild(actualInfo);
            }
            else {
                mapSelector.hide();
                let coordinates = getMapCoordinates(getCoordinates(value));
                cameraFocus = [coordinates[0], coordinates[1], 0];
                let index = provinceInfoElements[actualElection[1]].findIndex((element) => element.id == value);
                actualInfo = provinceInfoElements[actualElection[1]][index];
                info.appendChild(actualInfo);
            }
            actualSelectedColors = getSelectedColors(actualElection[1], actualProvince);
            setBgColorPalette(actualSelectedColors);
        }
    )
    actualElection = [elections[0], 0];
    actualSelectedColors = getSelectedColors(actualElection[1], actualProvince);
    setBgColorPalette(actualSelectedColors);

    gui.add(uiElements, "Mostrar fondo", true);
}

/**
 * Función que crea el elemento de información con los resultados
 */
export function createInfo() {
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
    createGeneralResultsInfo();
    createProvinceResultsInfo();
    info.appendChild(generalInfoElements[0]);
    actualInfo = generalInfoElements[0];
}

/**
 * Función que devuelve un array con los nombres de las provincias
 * @returns Array con el nombre de las provincias
 */
function getProvinceNames() {
    let names = [];

    for (let i = 0; i < geoData.length; i++) {
        names.push(geoData[i].name);
    }

    return names;
}

/**
 * Función que crea los elementos de información con los resultados nacionales (cuando se selecciona la provincia "Todas")
 */
function createGeneralResultsInfo() {
    for (let i = 0; i < elections.length; i++) {
        let totals = electionData[i].totals;
        let headers = electionData[i].headers;
        let element = document.createElement("div");

        element.innerHTML = "Resultados Generales - Elecciones de " + electionTexts[i];
        for (let j = 1; j < totals.length; j++) {
            let partyInfo = document.createElement("div");
            let partyName = document.createElement("span");
            partyName.innerHTML = headers[j];
            partyName.style.color = getColor(i, j - 1, false);
            partyInfo.appendChild(partyName);
            let partySeats = document.createElement("span");
            partySeats.innerHTML = " - " + totals[j];
            partyInfo.appendChild(partySeats);
            element.appendChild(partyInfo);
        }
        generalInfoElements.push(element);
    }
}

/**
 * Función que crea los elementos de información con los resultados provinciales (cuando se selecciona una provincia)
 */
function createProvinceResultsInfo() {
    let infoElements = [];
    for (let i = 0; i < elections.length; i++) {
        let results = electionData[i].results;
        let headers = electionData[i].headers;
        let actualInfoElements = [];

        for (let j = 0; j < results.length; j++) {
            let element = document.createElement("div");
            element.id = results[j][0];
            element.innerHTML = "Resultados de la provincia de " + element.id + " - Elecciones de " + electionTexts[i];

            for (let k = 1; k < results[j].length; k++) {
                if(results[j][k] != 0) {
                    let partyInfo = document.createElement("div");
                    let partyName = document.createElement("span");
                    partyName.innerHTML = headers[k];
                    partyName.style.color = getColor(i, k - 1, false);
                    partyInfo.appendChild(partyName);
                    let partySeats = document.createElement("span");
                    partySeats.innerHTML = " - " + results[j][k];
                    partyInfo.appendChild(partySeats);
                    element.appendChild(partyInfo);
                }
            }
            actualInfoElements.push(element);
        }
        infoElements.push(actualInfoElements);
    }
    provinceInfoElements = infoElements;
}