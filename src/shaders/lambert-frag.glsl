#version 300 es
precision highp float;

in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

const vec3 SEED3 = vec3(0.31415, 0.6456, 0.23432);
const vec2 SEED2 = vec2(-0.42422, 0.9842);

float random1(vec2 p, vec2 seed) {
    return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float brownianNoise2(vec2 pos, float frequency, vec2 seed) {
    vec2 noisePos = pos * frequency;
    vec2 boxPos = floor(noisePos);

    // Get the noise at the corners of the cells
    float corner0 = random1(boxPos + vec2(0.0, 0.0), SEED2 + seed);
    float corner1 = random1(boxPos + vec2(1.0, 0.0), SEED2 + seed);
    float corner2 = random1(boxPos + vec2(0.0, 1.0), SEED2 + seed);
    float corner3 = random1(boxPos + vec2(1.0, 1.0), SEED2 + seed);

    // Get cubic interpolation factors
    float tx = smoothstep(0.0, 1.0, fract(noisePos.x));
    float ty = smoothstep(0.0, 1.0, fract(noisePos.y));

    // Perform tricubic interpolation
    return(mix(mix(corner0, corner1, tx), mix(corner2, corner3, tx), ty));
}

float fbm2(vec2 pos, float startingFrequency, vec2 seed) {
    vec2 noisePos = pos * startingFrequency * 0.5;
    float total = 
        brownianNoise2(noisePos, startingFrequency * 2.0, seed) / 2.0 +
        brownianNoise2(noisePos, startingFrequency * 4.0, seed) / 4.0 +
        brownianNoise2(noisePos, startingFrequency * 8.0, seed) / 8.0;

    return total / 0.875;
}

void main() {
    //float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    vec3 lightDir = normalize(vec3(0.3, -1, -0.3));
    vec3 grass = mix(vec3(0, 0.8, 0), vec3(0.8, 1.0, 0.4), fbm2(fs_Pos.xz, 1.0, SEED2));
    vec3 color = mix(grass, vec3(1, 0.8, 0.6), fbm2(fs_Pos.xz, 0.3, SEED2)) * 0.6;

    //color = color * max(dot(lightDir, -fs_Nor.xyz), 0.2);
    out_Col = vec4(color, 1.0);
}
