import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';
import DrawingRule from './DrawingRule';

export default class LSystem {
    private turtleHistory: Turtle[];                    // The stack of turtles used during drawing
    private axiom: string;                              // The initial string generated in the zeroth iteration
    private expansionRules: Map<string, ExpansionRule>;  // A map from characters to expansion rules (i.e. the grammar)
    private drawingRules: Map<string, DrawingRule>;      // A map from characters to drawing rules

    // Cache bookkeeping
    private expandedString: string;
    private expansionIterations: number;
    private expandedStringDirty: boolean;

    constructor(_axiom: string, _expansionRules?: Map<string, ExpansionRule>, _drawingRules?: Map<string, DrawingRule>) {
        this.axiom = _axiom;
        this.turtleHistory = [];
        this.expandedString = "";
        this.expandedStringDirty = true;

        if (!_expansionRules) {
            this.expansionRules = new Map();
        }
        else {
            this.expansionRules = _expansionRules;
        }
        if (!_drawingRules) {
            this.drawingRules = new Map();
        }
        else {
            this.drawingRules = _drawingRules;
        }

        // Fill out the rules so we never get something undefined
        let chars: Set<string> = new Set<string>();
        for (let c of this.axiom) {
            chars.add(c);
        }
        for (let expansionRule of this.expansionRules.values()) {
            for (let postCondition of expansionRule.postConditions.keys()) {
                for (let c of postCondition) {
                    chars.add(c);
                }
            }
        }

        for (let c of chars) {
            if (!this.expansionRules.get(c)) {
                this.expansionRules.set(c, ExpansionRule.selfRule(c));
            }
            if (!this.drawingRules.get(c)) {
                this.drawingRules.set(c, new DrawingRule(c, ()=>{}));
            }
        }
    }

    addExpansionRule(rule: ExpansionRule) {
        this.expansionRules.set(rule.preCondition, rule);
        for (let pc of rule.postConditions.keys()) {
            for (let c of pc) {
                if (!this.expansionRules.get(c)) {
                    this.expansionRules.set(c, ExpansionRule.selfRule(c));
                }
                if (!this.drawingRules.get(c)) {
                    this.drawingRules.set(c, new DrawingRule(c, ()=>{}));
                }
            }
        }
        this.expandedStringDirty = true;
    }

    addDrawingRule(rule: DrawingRule): void {
        this.drawingRules.set(rule.preCondition, rule);
    }

    expand(numIterations: number): string {
        if (!this.expandedStringDirty && numIterations === this.expansionIterations) {
            return this.expandedString;
        }

        let outString: string = this.axiom;
        for (let i = 0; i < numIterations; i++) {
            let curString: string = "";
            for (let char of outString) {
                curString += this.expansionRules.get(char).selectRule();
            }
            outString = curString;
        }

        this.expandedString = outString;
        this.expandedStringDirty = false;
        this.expansionIterations = numIterations;
        return outString;
    }

    draw(numIterations: number): void {
        const expandedString = this.expand(numIterations);
        let curTurt: Turtle = new Turtle();
        for (let char of expandedString) {
            let dr: DrawingRule = this.drawingRules.get(char);
            dr.draw(curTurt);
            if (char === "[") {
                this.turtleHistory.push(curTurt);
                curTurt = curTurt.copy();
            }
            else if(char === "]") {
                curTurt = this.turtleHistory.pop();
            }
        }
    }
}