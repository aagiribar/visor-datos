#ifdef GL_ES
precision mediump float;
#endif

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