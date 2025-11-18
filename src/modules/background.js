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
    uniform float u_time;
    varying vec2 vUv;

    void main() {
        // Usa el tiempo para animar el componente R y G del color
        float r = 0.5 + 0.5 * sin(u_time * 0.5);
        float g = 0.5 + 0.5 * cos(u_time * 0.5);
        float b = 0.2; // Azul constante
        
        // El color se oscurece hacia los bordes (vUv.y)
        float edgeFade = smoothstep(0.0, 1.0, vUv.y); 

        gl_FragColor = vec4(r * edgeFade, g * edgeFade, b, 1.0);
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