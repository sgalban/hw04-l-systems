
import {vec3, mat4} from 'gl-matrix';

export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}

export function readTextFile(file: string): string {
    var text = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                text = allText;
            }
        }
    }
    rawFile.send(null);
    return text;
}

export function mat4ToValues(mat: mat4): number[] {
    let out: number[] = [];
    for (let i = 0; i < 16; i++) {
        out.push(mat[i]);
    }
    return out;
}

export function negate(vec: vec3): vec3 {
    return vec3.fromValues(
        -vec[0],
        -vec[1],
        -vec[2]
    );
}

export function randomRange(a: number, b: number): number {
    let r = Math.random();
    let out = r * (b - a) + a;
    return out;
}