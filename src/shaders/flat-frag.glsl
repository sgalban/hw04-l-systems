#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

const float FOV = 45.0;
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
    vec3 color;

    vec3 forward = normalize(u_Ref - u_Eye);
    vec3 right = normalize(cross(forward, u_Up));
    float refDist = length(u_Ref - u_Eye);
    float verticalAngle = tan(FOV / 2.0);
    float aspectRatio = u_Dimensions.x / u_Dimensions.y;
    vec3 V = u_Up * refDist * verticalAngle;
    vec3 H = right * refDist * aspectRatio * verticalAngle;
    vec3 worldPoint = u_Ref + H * fs_Pos.x + V * fs_Pos.y;
    vec3 rayDir = normalize(worldPoint - u_Eye);

    float noise = (fbm3(rayDir + vec3(u_Time * 0.001 + fbm3(rayDir, 0.1), 0, 0), 5.0) - 0.5);

    const vec3 CLOUD = vec3(0.9);
    const vec3 SKY = vec3(0.5, 0.6, 1.0);
    const vec3 SKY2 = vec3(0.25, 0.3, 1.0);
    vec3 MIX = mix(CLOUD, SKY, noise);
    if (rayDir.y < -0.2) {
        color = CLOUD;
    }
    else if (rayDir.y > -0.2 && rayDir.y < 0.05) {
        float t = smoothstep(0.0, 1.0, (rayDir.y + 0.2) / 0.25);
        color = mix(CLOUD, MIX, t);
    }
    else if (rayDir.y > 0.05 && rayDir.y < 0.3) {
        float t = smoothstep(0.0, 1.0, (rayDir.y - 0.05) / 0.25);
        color = mix(MIX, SKY, t);
    }
    else {
        color = mix(SKY, SKY2, (rayDir.y - 0.3) / 0.7);
    }
    out_Col = vec4(color, 1.0);
}
