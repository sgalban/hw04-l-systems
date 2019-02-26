import {vec3} from 'gl-matrix';

export default class Turtle {
    position: vec3;
    direction: vec3;
    recursionDepth: number;

    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.direction = vec3.fromValues(0, 1, 0);
        this.recursionDepth = 0;
    }

    copy(): Turtle {
        let copy : Turtle = new Turtle();
        copy.position = this.position;
        copy.direction = this.direction;
        copy.recursionDepth = this.recursionDepth + 1;
        return copy;
    }

    moveForward(amount: number): void {
        const moveAmount: vec3 = vec3.fromValues(
            this.direction[0] * amount,
            this.direction[1] * amount,
            this.direction[2] * amount
        );
        vec3.add(this.position, this.position, moveAmount);
    }

}