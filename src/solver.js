export class Solver {
    constructor (W, H) {
        this.W = W;
        this.H = H;
    }

    solve (items) {
    }
}

export function ddp (D, d) {
    var result = [];

    var c = [];

    for (let i = 0; i < D; i++) {
        c.push(0);
    }

    for (let i = 0; i < d.length; i++) {
        for (let j = d[i]; j < D; j++) {
            if (c[j] < c[j - d[i]] + d[i]) {
                c[j] = c[j - d[i]] + d[i];
            }
        }
    }

    for (let j = 1; j < D; j++) {
        if (c[j] === j) {
            result.push(j);
        }
    }

    return result;
}
