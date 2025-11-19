// Array con parte de los nombres de los archivos de datos
export const elections = [
    "1977", 
    "1979", 
    "1982", 
    "1986", 
    "1989", 
    "1993", 
    "1996", 
    "2000", 
    "2004", 
    "2008", 
    "2011", 
    "2015", 
    "2016", 
    "04_2019", 
    "11_2019", 
    "2023"
];

// Array que contiene los datos electorales cargados desde los ficheros.
// Cada elemento del array es un objeto con la siguiente estructura
// index: Índice del proceso electoral dentro de datosElect
// headers: Encabezado del fichero de datos
// results: Array que contiene 52 arrays con los resultados de cada provincia
// totals: Array con los resultados totales a nivel nacional
export let electionData = [];

// Array que contiene los datos geográficos de las 52 provincias de España
// Cada elemento es un objeto con la siguiente estructura
// name: Nombre de la provincia
// latitude: Latitud de la provincia
// longitude: Longitud de la provincia
export let geoData = [];

// Array que contiene los datos de colores de los diferentes partidos
// Cada elemento del array es un array que contiene los colores en el mismo orden en los que aparecen en los ficheros correspondientes a cada elección
export let colorData = [];

/**
 * Función que carga los datos necesarios para la ejecución de la simulación
 */
export async function loadData() {
    for (let i = 0; i < elections.length; i++) {
        await fetch("/static/data/resultados/" + elections[i] + ".csv")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error: " + response.statusText);
                }
                return response.text();
            })
            .then(content => {
                processElectionData(content, i);
                console.log("Fichero " + elections[i] + ".csv cargado");
            })
            .catch(error => {
                console.error("Error al cargar el archivo", error);
            });

        await fetch("static/data/colores/colores_" + elections[i] + ".csv")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error: " + response.statusText);
                }
                return response.text();
            })
            .then(content => {
                processColorData(content);
                console.log("Fichero colores_" + elections[i] + ".csv cargado");
            })
            .catch(error => {
                console.error("Error al cargar el archivo", error);
            });
    }

    await fetch("static/data/datos_geo.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error: " + response.statusText);
            }
            return response.text();
        })
        .then(content => {
            processGeoData(content);
        })
        .catch(error => {
            console.error("Error al cargar el archivo", error);
        });
}

/**
 * Función que carga los datos electorales de los diferentes procesos
 * @param {String} content Contenido del fichero con datos electorales
 * @param {Number} index Índice del proceso
 */
function processElectionData(content, index) {
    const sep = ";";
    const rows = content.split("\n");

    const headers = rows[0].split(sep);

    let results = [];
    let totals = rows.pop();

    for (let i = 1; i < rows.length; i++) {
        const column = rows[i].split(sep);
        if (column.length > 1) {
            results.push(column);
        }
    }

    electionData.push({
        index: index,
        headers: headers,
        results: results,
        totals: totals.split(sep)
    });
}

/**
 * Función que carga los datos geográficos de las diferentes provincias
 * @param {String} content Contenido del fichero con datos geográficos
 */
function processGeoData(content) {
    const sep = ";";
    const rows = content.split("\n");

    const headers = rows[0].split(sep);

    const indexes = {
        names: headers.indexOf("Provincia"),
        latitude: headers.indexOf("Latitud"),
        longitude: headers.indexOf("Longitud")
    }

    for (let i = 1; i < rows.length; i++) {
        const column = rows[i].split(sep);
        if (column.length > 1) {
            geoData.push({
                name: column[indexes.names],
                latitude: column[indexes.latitude],
                longitude: column[indexes.longitude]
            })
        }
    }

    console.log("Archivo con datos geográficos cargado");
}

/**
 * Función que carga los datos de colores de los diferentes partidos a efectos de visualización
 * @param {String} content Contenido del fichero con los datos de los colores
 */
function processColorData(content) {
    const sep = ";";
    const rows = content.split("\n");

    let colors = [];
    for (let i = 1; i < rows.length; i++) {
        const column = rows[i].split(sep);
        if (column.length > 1) {
            colors.push(column[1]);
        }
    }

    colorData.push(colors);
}

/**
 * Función que obtiene el color de un partido de los datos de colores
 * @param {Number} electionIndex Índice de la elección actual en el array de datos electorales
 * @param {Number} partyIndex Índice del partido en los datos
 * @param {Boolean} getNumber Si se desea que el valor se devuelva como número o como String
 * @returns El color correspondiente al partido y elección seleccionados
 */
export function getColor(electionIndex, partyIndex, getNumber = true) {
    if (getNumber) {
        return parseInt(colorData[electionIndex][partyIndex]);
    }
    else {
        return "#" + colorData[electionIndex][partyIndex].substring(2);
    }
}

/**
 * Función para obtener las coordenadas de una provincia de los datos geográficos
 * @param {String} province Nombre de la provincia
 * @returns Las coordenadas de la provincia buscada
 */
export function getCoordinates(province) {
    let foundProvince = geoData.find((value) => value.name == province);
    return [parseFloat(foundProvince.longitude), parseFloat(foundProvince.latitude)];
}