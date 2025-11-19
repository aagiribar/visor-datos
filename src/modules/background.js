import * as THREE from 'three';

export const clock = new THREE.Clock();

export let bgScene;
export let bgCamera;
export let bgMaterial;
let bgGeometry;
let bgMesh;

const uniforms = {
    u_time: {
        value: 0.0
    },
    u_colors: {
        value: []
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
    #define MAX_COLORS 50

    uniform float u_time;
    uniform vec3 u_colors[MAX_COLORS];
    varying vec2 vUv;

    void main() {
        // El color se oscurece hacia los bordes (vUv.y)
        float edgeFade = smoothstep(0.0, 1.0, vUv.y); 

        gl_FragColor = vec4(u_colors[0].r * edgeFade, u_colors[0].g * edgeFade, u_colors[0].b * edgeFade, 1.0);
    }
`;

export function createBackground() {
    bgScene = new THREE.Scene();
    bgCamera = new THREE.Camera(-1, 1, 1, -1, 0.1, 10);
    bgCamera.position.z = 1;

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
 * Función que transforma un array de colores en formato numérico a objetos Color de THREE.js
 * @param {Number[]} colors Array de colores en formato numérico
 * @returns Array de objetos Color de THREE.js
 */
export function getColorObjectsFromNumbers(colors) {
    let colorObjects = [];
    for (let i = 0; i < colors.length; i++) {
        colorObjects.push(new THREE.Color(parseInt(colors[i])));
    }

    return colorObjects;
}