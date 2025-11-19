#ifdef GL_ES
precision mediump float;
#endif

#define MAX_COLORS 50

uniform float u_time;
uniform vec3 u_colors[MAX_COLORS];
varying vec2 vUv;

void main() {
    // El color se oscurece hacia los bordes (vUv.y)
    float edgeFade = smoothstep(0.0, 1.0, vUv.y); 

    gl_FragColor = vec4(u_colors[0].r * edgeFade, u_colors[0].g * edgeFade, u_colors[0].b * edgeFade, 1.0);
}