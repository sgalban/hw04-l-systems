import {vec3, quat, mat4} from 'gl-matrix';
import {negate} from '../globals';
import DrawNode from './DrawNode';

export default class Turtle {
    position: vec3;
    direction: quat;
    color: vec3;
    recursionDepth: number;

    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.direction = quat.create();
        quat.setAxes(this.direction, [0, 1, 0], [1, 0, 0], [0, 0, 1]);
        this.color = vec3.fromValues(0.6, 0.3, 0.2);
        this.recursionDepth = 0;
    }

    duplicate(): Turtle {
        let copy : Turtle = new Turtle();
        copy.position = vec3.clone(this.position);
        copy.direction = quat.clone(this.direction);
        //copy.recursionDepth = this.recursionDepth + 1;
        return copy;
    }

    copy(other: Turtle): void {
        this.position = other.position;
        this.direction = other.direction;
        //this.recursionDepth = other.recursionDepth - 1;
    }

    moveForward(amount: number): DrawNode {
        let forward: vec3 = vec3.transformQuat(vec3.create(), [0, 0, 1], this.direction);
        const moveAmount: vec3 = vec3.fromValues(
            forward[0] * amount,
            forward[1] * amount,
            forward[2] * amount
        );

        vec3.add(this.position, this.position, moveAmount);

        /*let transform = mat4.fromQuat(mat4.create(), this.direction);
        mat4.rotateX(transform, transform, Math.PI / 2.0);
        mat4.translate(transform, transform, this.position);
        mat4.scale(transform, transform, [1, -amount, 1]);*/

        let transform = mat4.fromRotationTranslation(mat4.create(), this.direction, this.position);
        mat4.rotateX(transform, transform, Math.PI / 2.0);
        let thinness = Math.pow(0.8, this.recursionDepth);
        mat4.scale(transform, transform, [thinness, -amount, thinness]);

        return new DrawNode(transform, vec3.fromValues(this.color[0], this.color[1], this.color[2]));
    }

    rotateZ(angle: number): DrawNode {
        const rad = angle * Math.PI / 180.0;
        quat.rotateY(this.direction, this.direction, rad);
        return DrawNode.emptyNode();
    }

    rotateX(angle: number): DrawNode {
        const rad = angle * Math.PI / 180.0;
        quat.rotateX(this.direction, this.direction, rad);
        return DrawNode.emptyNode();
    }

    rotateY(angle: number): DrawNode {
        const rad = angle * Math.PI / 180.0;
        quat.rotateZ(this.direction, this.direction, rad);
        return DrawNode.emptyNode();
    }

    generateLeaf(): DrawNode {
        let transform = mat4.fromTranslation(mat4.create(), this.position);
        mat4.scale(transform, transform, [0.5, 0.5, 0.5]);
        return DrawNode.newLeaf(transform);
    }

}