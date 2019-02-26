import Turtle from './Turtle';

export default class DrawingRule {
    preCondition: string;
    rule: (turt?: Turtle)=>void;

    constructor(_preCondition: string, _rule: (turt?: Turtle)=>void) {
        this.preCondition = _preCondition;
        this.rule = _rule;
    }

    draw(turt: Turtle): void {
        this.rule(turt);
    }
}