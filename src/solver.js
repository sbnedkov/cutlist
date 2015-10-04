import {min, max, reduce} from 'lodash';

import Array2D from './array2d';
import Item from './item';
import Strip from './strip';

export class Solver {
    constructor (W, H) {
        this.W = W;
        this.H = H;
    }

    solveNew (items) {
        var expandedItems = [];
        items.forEach(item => {
            for (let i = 0; i < item.q; i++) {
                expandedItems.push(new Item(item.ref, item.w, item.h, 1, i));
            }
        });

        var w = expandedItems.map(item => {
            return item.w;
        });
        var h = expandedItems.map(item => {
            return item.h;
        });
        var v = expandedItems.map(item => {
            return item.v;
        });

        var P = knapsack(this.W, expandedItems.map(item => {
            return item.w;
        }));
        var Q = knapsack(this.H, expandedItems.map(item => {
            return item.h;
        }));

        var P1 = P.concat([this.W]);
        var Q1 = Q.concat([this.H]);

        var V = new Array2D(P1.length, Q1.length);

        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
                let maxvk = 0;
                let maxk = 0;

                v.forEach((vk, k) => {
                    if (w[k] <= P1[i] && h[k] <= Q1[j]) {
                        if (vk >= maxvk) {
                            maxvk = vk;
                        }
                    }
                });

                v.forEach((vk, k) => {
                    if (w[k] <= P1[i] && h[k] <= Q1[j] && vk === maxvk) {
                        maxk = k;
                    }
                });

                let item = expandedItems[maxk];
                item.x = 0;
                item.y = 0;
                let strip = new Strip(item);
                V.set(i, j, strip);
            }
        }

        for (let i = 1; i < P1.length; i++) {
            for (let j = 1; j < Q1.length; j++) {
                let stripCurr = V.get(i, j);
                let max = 0;
                let dir;
                let selectedStripPrev;
                let selected;

                for (let k = 0; k < i; k++) {
                    for (let l = 0; l < j; l++) {
                        let stripPrev = V.get(k, l);

                        // Find the maximum subproblem combined with the maximal item to add to it

                        let selectedH = {
                            v: 0
                        };
                        let selectedV = {
                            v: 0
                        };
                        expandedItems.forEach(item => {
                            if (!stripPrev.uses(item) && stripCurr.value() < item.v + stripPrev.value()) {
                                if (item.w + stripPrev.w <= P1[i] && item.h <= Q1[j]) {
                                    selectedH = item;
                                }
                                if (item.h + stripPrev.h <= Q1[j] && item.w <= P1[i]) {
                                    selectedV = item;
                                }
                            }
                        });

                        if (selectedH.v > selectedV.v) {
                            if (max < stripPrev.value() + selectedH.v && selectedH.ref) {
                                max = stripPrev.value() + selectedH.v;
                                selectedStripPrev = stripPrev;
                                selected = selectedH;
                                dir = 'H';
                            }
                        } else {
                            if (max < stripPrev.value() + selectedV.v && selectedV.ref) { // TODO: replace .ref
                                max = stripPrev.value() + selectedV.v;
                                selectedStripPrev = stripPrev;
                                selected = selectedV;
                                dir = 'V';
                            }
                        }
                    }
                }

                if (selectedStripPrev) {
                    let stripNew = new Strip();

                    selectedStripPrev.items().forEach(item => {
                        if (item.dir === 'H') {
                            stripNew.addH(item);
                        } else {
                            stripNew.addV(item);
                        }
                    });

                    if (dir === 'H') {
                        stripNew.addH(selected);
                    } else {
                        stripNew.addV(selected);
                    }

                    V.set(i, j, stripNew);
                }
            }
        }

//        for (let i = 0; i < P1.length; i++) {
//            for (let j = 0; j < Q1.length; j++) {
//                console.log(i, j, V.get(i, j));
//            }
//        }

        return V.get(P1.length - 1, Q1.length -1);
    }
}


export function knapsack (D, dd) {
    var result = [0];
    var d = dd.slice(0);
    d.unshift(0);

    var c = new Array2D(d.length, D);

    for (let j = 0; j < D; j++) {
        c.set(0, j, 0);
    }

    for (let i = 1; i < d.length; i++) {
        for (let j = 0; j < D; j++) {
            if (d[i] <= j) {
                c.set(i, j, Math.max(c.get(i - 1, j), c.get(i - 1, j - d[i]) + d[i]));
            } else {
                c.set(i, j, c.get(i - 1, j));
            }
        }
    }

    for (let j = 1; j < D; j++) {
        if (c.get(d.length - 1, j) === j) {
            result.push(j);
        }
    }

    return result;
}
