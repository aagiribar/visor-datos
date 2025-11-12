// Array con parte de los nombres de los archivos de datos
export const elecciones = [
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
// indice: Índice del proceso electoral dentro de datosElect
// encabezados: Encabezado del fichero de datos
// resultados: Array que contiene 52 arrays con los resultados de cada provincia
// totales: Array con los resultados totales a nivel nacional
export let datosElect = [];

// Array que contiene los datos geográficos de las 52 provincias de España
// Cada elemento es un objeto con la siguiente estructura
// nombre: Nombre de la provincia
// latitud: Latitud de la provincia
// longitud: Longitud de la provincia
export let datosGeo = [];

// Array que contiene los datos de colores de los diferentes partidos
// Cada elemento del array es un array que contiene los colores en el mismo orden en los que aparecen en los ficheros correspondientes a cada elección
export let datosCol = [];

// Función que carga los datos necesarios para la ejecución de la simulación
export async function cargarDatos() {
    for (let i = 0; i < elecciones.length; i++) {
        await fetch("/static/data/resultados/" + elecciones[i] + ".csv")
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error("Error: " + respuesta.statusText);
                }
                return respuesta.text();
            })
            .then(contenido => {
                procesarDatosElect(contenido, i);
                console.log("Fichero " + elecciones[i] + ".csv cargado");
            })
            .catch(error => {
                console.error("Error al cargar el archivo", error);
            });

        await fetch("static/data/colores/colores_" + elecciones[i] + ".csv")
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error("Error: " + respuesta.statusText);
                }
                return respuesta.text();
            })
            .then(contenido => {
                procesarDatosColores(contenido);
                console.log("Fichero colores_" + elecciones[i] + ".csv cargado");
            })
            .catch(error => {
                console.error("Error al cargar el archivo", error);
            });
    }

    await fetch("static/data/datos_geo.csv")
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("Error: " + respuesta.statusText);
            }
            return respuesta.text();
        })
        .then(contenido => {
            procesarDatosGeo(contenido);
        })
        .catch(error => {
            console.error("Error al cargar el archivo", error);
        });
}

// Función que carga los datos electorales de los diferentes procesos
function procesarDatosElect(contenido, indice) {
    const sep = ";";
    const filas = contenido.split("\n");

    const encabezados = filas[0].split(sep);

    let resultados = [];
    let totales = filas.pop();

    for (let i = 1; i < filas.length; i++) {
        const columna = filas[i].split(sep);
        if (columna.length > 1) {
            resultados.push(columna);
        }
    }

    datosElect.push({
        indice: indice,
        encabezados: encabezados,
        resultados: resultados,
        totales: totales.split(sep)
    });
}

// Función que carga los datos geográficos de las diferentes provincias
function procesarDatosGeo(contenido) {
    const sep = ";";
    const filas = contenido.split("\n");

    const encabezados = filas[0].split(sep);

    const indices = {
        nombre: encabezados.indexOf("Provincia"),
        latitud: encabezados.indexOf("Latitud"),
        longitud: encabezados.indexOf("Longitud")
    }

    for (let i = 1; i < filas.length; i++) {
        const columna = filas[i].split(sep);
        if (columna.length > 1) {
            datosGeo.push({
                nombre: columna[indices.nombre],
                latitud: columna[indices.latitud],
                longitud: columna[indices.longitud]
            })
        }
    }

    console.log("Archivo con datos geográficos cargado");
}

// Función que carga los datos de colores de los diferentes partidos a efectos de visualización
function procesarDatosColores(contenido) {
    const sep = ";";
    const filas = contenido.split("\n");

    const encabezados = filas[0].split(sep);

    let colores = [];
    for (let i = 1; i < filas.length; i++) {
        const columna = filas[i].split(sep);
        if (columna.length > 1) {
            colores.push(columna[1]);
        }
    }

    datosCol.push(colores);
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

// Función para obtener las coordenadas de una provincia de los datos geográficos
// provincia: Nombre de la provincia
export function obtenerCoordenadas(provincia) {
    let provinciaEncontrada = datosGeo.find((valor) => valor.nombre == provincia);
    return [parseFloat(provinciaEncontrada.longitud), parseFloat(provinciaEncontrada.latitud)];
}