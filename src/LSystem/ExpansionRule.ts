export default class ExpansionRule {
    preCondition: string;
    postConditions: Map<string, number>

    constructor(pre: string, post: Map<string, number>) {
        this.preCondition = pre;
        this.postConditions = new Map<string, number>();
        
        let total = 0.0;
        for (let [key, value] of post) {
            total += value;
        }
        for (let [key, value] of post) {
            this.postConditions.set(key, value / total);
        }
    }

    selectRule(): string {
        let pMap: [number, string][] = [];
        let cumulative : number = 0;
        for (let [rule, prob] of this.postConditions) {
            cumulative += prob;
            pMap.push([cumulative, rule]);
        }

        const rng : number = Math.random();
        for (let i = 0; i < pMap.length; i++) {
            const p1 : number = i > 0 ? pMap[i - 1][0] : 0;
            const p2 : number = pMap[i][0];
            if (rng >= p1 && rng < p2) {
                return pMap[i][1];
            }
        }
        return pMap[pMap.length - 1][1];
    }

    static expand(axiom: string, expansionRules: Map<string, ExpansionRule>, numIterations: number): string {
        let outString: string = axiom;
        for (let i = 0; i < numIterations; i++) {
            let curString: string = "";
            for (let char of outString) {
                curString += expansionRules.get(char).selectRule();
            }
            outString = curString;
        }
        return outString;
    }

    static selfRule(rule: string): ExpansionRule {
        const char: string = rule.charAt(0);
        let map: Map<string, number> = new Map([[char, 1]]);
        return new ExpansionRule(char, map);
    }

    static newConstantRule(pre: string, post: string): ExpansionRule {
        return new ExpansionRule(pre, new Map([[post, 1]]));
    }

}