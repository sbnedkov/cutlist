import {reduce} from 'lodash';

import Array2D from './array2d';
import Item from './item';
import Strip from './strip';
import Width from './width';
import Height from './height';

export class Solver {
    constructor (W, H) {
        this.W = W;
        this.H = H;
    }

    solveNew (items) {
        var expandedItems = [];
        items.forEach(item => {
            for (let i = 0; i < item.q; i++) {
                expandedItems.push(new Item(item.ref, item.w, item.h, item.canRotate, 1, i));
            }
        });

        expandedItems.sort((i1, i2) => {
            return i1.v - i2.v;
        });

        var w = expandedItems.map(item => {
            return new Width(item);
        });
        var h = expandedItems.map(item => {
            return new Height(item);
        });
        var v = expandedItems.map(item => {
            return item.v;
        });

        var P = knapsack(this.W, w);
        var Q = knapsack(this.H, h);

        var P1 = P.concat([{
            len: this.W
        }]);
        var Q1 = Q.concat([{
            len: this.H
        }]);

        var V = new Array2D(P1.length, Q1.length);

        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
                let maxvk = 0;
                let maxk = 0;

                v.forEach((vk, k) => {
                    if (P1[i].len >= w[k].len() && Q1[j] >= h[k].len()) {
                        if (vk >= maxvk) {
                            maxvk = vk;
                        }
                    }
                });

                v.forEach((vk, k) => {
                    if (P1[i].len >= w[k].len() && Q1[j] >= h[k].len() && vk === maxvk) {
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
                                if (item.w + stripPrev.w <= P1[i].len && item.h <= Q1[j].len) {
                                    selectedH = item;
                                } else if (item.canRotate && item.h + stripPrev.w <= P1[i].len && item.w <= Q1[j].len) {
                                    selectedH = item.rotate();
                                }

                                if (item.h + stripPrev.h <= Q1[j].len && item.w <= P1[i].len) {
                                    selectedV = item;
                                } else if (item.canRotate && item.w + stripPrev.h <= Q1[j].len && item.h <= P1[i].len) {
                                    selectedV = item.rotate();
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
    var result = [{
        len: 0
    }];

    var d = reduce(dd, (acc, el) => {
        return acc.concat(el.split());
    }, []);

    d.unshift(null);

    var c = new Array2D(d.length, D);

    for (let j = 0; j < D; j++) {
        c.set(0, j, [0, null]);
    }

    for (let i = 1; i < d.length; i++) {
        for (let j = 0; j < D; j++) {
            if (d[i].len() <= j && c.get(i - 1, j - d[i].len())[1]) {
                if (c.get(i - 1, j - d[i].len())[1].item.ident() !== d[i].item.ident()) {
                    let v1 = c.get(i - 1, j)[0];
                    let v2 = c.get(i - 1, j - d[i].len())[0] + d[i].len();

                    if (v1 > v2){
                        c.set(i, j, c.get(i - 1, j));
                    } else {
                        c.set(i, j, [v2, d[i]]);
                    }
                } else { // we have the same item already used in its other dimension
                    // TODO: optimize this bit
                    let set = false;
                    for (let k = 1; k <= i; k++) {
                        if (d[k].len() <= j && c.get(k - 1, j - d[k].len())[1] && c.get(k - 1, j - d[k].len())[1].item.ident() !== d[k].item.ident()) {
                            let v1 = c.get(k - 1, j)[0];
                            let v2 = c.get(k - 1, j - d[k].len())[0] + d[k].len();
                            if (v1 > v2) {
                                c.set(i, j, c.get(k - 1, j));
                            } else {
                                c.set(i, j, [v2, d[k]]);
                            }
                            set = true;
                        }
                    }
                    if (!set) {
                        c.set(i, j, c.get(i - 1, j));
                    }
                }
            } else {
                if (d[i].len() <= j) {
                    let v1 = c.get(i - 1, j)[0];
                    let v2 = c.get(i - 1, j - d[i].len())[0] + d[i].len();

                    if (v1 > v2){
                        c.set(i, j, c.get(i - 1, j));
                    } else {
                        c.set(i, j, [v2, d[i]]);
                    }
                } else {
                    c.set(i, j, c.get(i - 1, j));
                }
            }
        }
    }

    for (let j = 1; j < D; j++) {
        if (c.get(d.length - 1, j)[0] === j) {
            result.push({
                len: j,
                item: c.get(d.length - 1, j)[1]
            });
        }
    }

    return result;
}
