#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float random1(vec2 p) {
    vec2 seed = vec2(0.1234, 0.5678);
    return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
    out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);
}
