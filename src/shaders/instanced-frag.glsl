#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;

out vec4 out_Col;

const vec3 SEED3 = vec3(0.31415, 0.6456, 0.23432);
const vec2 SEED2 = vec2(-0.42422, 0.9842);

float random1(vec2 p, vec2 seed) {
    return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float random1(vec3 p, vec3 seed) {
    return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

float brownianNoise3(vec3 pos, float frequency) {
    vec3 noisePos = pos * frequency;
    vec3 boxPos = floor(noisePos);

    // Get the noise at the corners of the cells
    float corner0 = random1(boxPos + vec3(0.0, 0.0, 0.0), SEED3);
    float corner1 = random1(boxPos + vec3(1.0, 0.0, 0.0), SEED3);
    float corner2 = random1(boxPos + vec3(0.0, 1.0, 0.0), SEED3);
    float corner3 = random1(boxPos + vec3(1.0, 1.0, 0.0), SEED3);
    float corner4 = random1(boxPos + vec3(0.0, 0.0, 1.0), SEED3);
    float corner5 = random1(boxPos + vec3(1.0, 0.0, 1.0), SEED3);
    float corner6 = random1(boxPos + vec3(0.0, 1.0, 1.0), SEED3);
    float corner7 = random1(boxPos + vec3(1.0, 1.0, 1.0), SEED3);

    // Get cubic interpolation factors
    float tx = smoothstep(0.0, 1.0, fract(noisePos.x));
    float ty = smoothstep(0.0, 1.0, fract(noisePos.y));
    float tz = smoothstep(0.0, 1.0, fract(noisePos.z));

    // Perform tricubic interpolation
    return(
        mix(
            mix(mix(corner0, corner1, tx), mix(corner2, corner3, tx), ty),
            mix(mix(corner4, corner5, tx), mix(corner6, corner7, tx), ty),
            tz
        )
    );
}

float fbm3(vec3 pos, float startingFrequency) {
    vec3 noisePos = pos * startingFrequency * 0.5;
    float total = 
        brownianNoise3(noisePos, startingFrequency * 2.0) / 2.0 +
        brownianNoise3(noisePos, startingFrequency * 4.0) / 4.0 +
        brownianNoise3(noisePos, startingFrequency * 8.0) / 8.0;

    return total / 0.875;
}

void main() {
    //float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    vec3 lightDir = normalize(vec3(0.3, -1, -0.3));
    vec3 color = fs_Col.rgb * max(dot(lightDir, -fs_Nor.xyz), 0.2);
    out_Col = vec4(color, 1.0);
}
