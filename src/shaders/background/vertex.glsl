#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}