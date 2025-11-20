import * as THREE from 'three';

export const clock = new THREE.Clock();

export let bgScene;
export let bgCamera;
export let bgMaterial;
let bgGeometry;
let bgMesh;

let MAX_COLORS;

const uniforms = {
    u_time: {
        value: 0.0
    },
    u_colors: {
        value: []
    },
    u_count: {
        value: 0.0
    }
}

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    // Definimos el límite máximo de colores
    #define MAX_COLORS 20

    uniform float u_time;
    uniform vec3 u_colors[MAX_COLORS]; // Array de tamaño fijo
    uniform float u_count;               // Cantidad real de colores en uso

    varying vec2 vUv;

    void main() {
        float count = u_count;
        // --- Generación de patrón ---
        vec2 uv = vUv;
        float v = 0.0;
        v += sin(uv.x * 10.0 + u_time * 0.5);
        v += sin((uv.y * 8.0 + u_time) * 0.5);
        v += sin(sqrt(uv.x * uv.x + uv.y * uv.y + 1.0) * 10.0 + u_time);
        v = (v / 3.0 + 1.0) * 0.5; // Normalizamos v de 0.0 a 1.0

        // --- Lógica de Mezcla Dinámica ---
    
        // Aseguramos que haya al menos 2 colores para evitar errores
        // Si hay un solo color, se usará el siguiente en el array (que es negro)
        if (count < 2.0) {
            count = 2.0;
        }

        // Calculamos el índice basado en 'v' y la cantidad de colores
        // Si tenemos 5 colores, el rango va de 0 a 4.
        float totalSegments = float(count) - 1.0;
    
        // Mapeamos 0..1 al rango de índices (ej: 0..4.0)
        float v_scaled = v * totalSegments; 
    
        // Obtenemos el índice inferior (piso) y la fracción para mezclar
        int index = int(floor(v_scaled));
        float t = fract(v_scaled); // Cuánto estamos entre el color actual y el siguiente

        // Protección para el último pixel exacto (v=1.0)
        if (float(index) >= count - 1.0) {
            index = int(count) - 2; // Retrocedemos uno para mezclar el penúltimo con el último
            t = 1.0;
        }

        // Obtenemos los dos colores a mezclar
        vec3 colorA = u_colors[index];
        vec3 colorB = u_colors[index + 1];

        // Mezclamos
        vec3 finalColor = mix(colorA, colorB, t);

        gl_FragColor = vec4(finalColor * 0.3, 1.0);
    }
`;

export function createBackground() {
    bgScene = new THREE.Scene();
    bgCamera = new THREE.Camera(-1, 1, 1, -1, 0.1, 10);
    bgCamera.position.z = 1;

    MAX_COLORS = 20;

    uniforms.u_colors.value = new Array(MAX_COLORS).fill(new THREE.Color(0x000000));

    bgMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthTest: false,
        depthWrite: false
    });

    bgGeometry = new THREE.PlaneGeometry(2, 2);
    bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgScene.add(bgMesh);
}

/**
 * Función que establece la paleta de colores del shader del fondo
 * @param {Number[] | String[]} colorList Array de colores en formato numérico
 */
export function setBgColorPalette(colorList) {
    const count = Math.min(colorList.length, MAX_COLORS);
    bgMaterial.uniforms.u_count.value = count;

    let colorArray = new Array(MAX_COLORS);

    for (let i = 0; i < MAX_COLORS; i++) {
        if (i < count) {
            const c = new THREE.Color(parseInt(colorList[i]));
            colorArray[i] = c;
        }
        else {
            colorArray[i] = new THREE.Color(0, 0, 0);
        }
    }
    bgMaterial.uniforms.u_colors.value = colorArray;
}