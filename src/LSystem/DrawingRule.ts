import Turtle from './Turtle';
import DrawNode from './DrawNode';

export default class DrawingRule {
    preCondition: string;
    rule: (turt?: Turtle)=>DrawNode;

    constructor(_preCondition: string, _rule: (turt?: Turtle)=>DrawNode) {
        this.preCondition = _preCondition;
        this.rule = _rule;
    }

    draw(turt: Turtle): DrawNode {
        let node: DrawNode = this.rule(turt);
        //console.log("Pos: " + turt.position);
        //console.log("Dir: " + turt.direction);
        return node;
    }
}