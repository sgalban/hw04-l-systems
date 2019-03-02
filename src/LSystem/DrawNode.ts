import {vec3, mat4} from 'gl-matrix';
import {randomRange} from '../globals';

// Encapsulates all data to be passed via instance shader VBOs
// This includes transformations and color
export default class DrawNode {
    color: vec3;
    transformation: mat4;
    leaf: boolean;
    empty: boolean;

    constructor(t: mat4, c: vec3) {
        this.color = c;
        this.transformation = t;
        this.empty = false;
        this.leaf = false;
    }

    isEmpty(): boolean {
        return this.empty;
    }

    static emptyNode(): DrawNode {
        let dn = new DrawNode(mat4.create(), vec3.create());
        dn.empty = true;
        return dn;
    }

    static newLeaf(t: mat4): DrawNode {
        let color : vec3 = vec3.fromValues(
            randomRange(0, 0.4),
            0.8 + randomRange(0, 0.15),
            randomRange(0, 0.2)
        );
        let dn = new DrawNode(t, color);
        dn.leaf = true;
        return dn;
    }
}