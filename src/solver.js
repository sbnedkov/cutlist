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

    solve (items) {
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

        // XXX: Does this subalgorithm support rotated items?
        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
                let maxvk = 0;
                let maxk = 0;

                v.forEach((vk, k) => {
                    if (P1[i].len >= w[k].len() && Q1[j].len >= h[k].len()) {
                        if (vk >= maxvk) {
                            maxvk = vk;
                        }
                    }
                });

                v.forEach((vk, k) => {
                    if (P1[i].len >= w[k].len() && Q1[j].len >= h[k].len() && vk === maxvk) {
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
                let n;
                for (let k = 0; k <= i; k++) {
                    if (P1[k].len <= Math.floor(P1[i].len / 2)) {
                        n = k;
                    }
                }

                for (let x = 0; x <= n; x++) {
                    let t;
                    for (let k = 0; k < P1.length; k++) {
                        if (P1[k].len <= P1[i].len - P1[x].len && !V.get(k, j).uses(P1[x].item)) {
                            t = k;
                        }
                    }

                    if (t >= 0 && V.get(i, j) < V.get(x, j) + V.get(t, j)) {
                        let strip = new Strip();

                        V.get(t, j).items().forEach(item => {
                            switch (item.dir) {
                                case 'H':
                                    strip.addH(item);
                                    break;
                                case 'V':
                                    strip.addV(item);
                                    break;
                                default:
                                    throw new Error('Unknown dir : ' + item.dir + '.');
                            }
                        });

                        // XXX: item might need to be rotated
                        strip.addH(P1[x].item);
                        V.set(i, j, strip);
                    }
                }

                for (let k = 0; k <= j; k++) {
                    if (Q1[k].len <= Math.floor(Q1[j].len / 2)) {
                        n = k;
                    }
                }

                for (let y = 0; y <= n; y++) {
                    let t;
                    for (let k = 0; k < Q1.length; k++) {
                        if (Q1[k].len <= Q1[j].len - Q1[y].len && !V.get(j, k).uses(Q1[y].item)) {
                            t = k;
                        }
                    }

                    if (t >= 0 && V.get(i, j) < V.get(j, y) + V.get(j, t)) {
                        let strip = new Strip();

                        V.get(j, t).items().forEach(item => {
                            switch (item.dir) {
                                case 'H':
                                    strip.addH(item);
                                    break;
                                case 'V':
                                    strip.addV(item);
                                    break;
                                default:
                                    throw new Error('Unknown dir : ' + item.dir + '.');
                            }
                        });

                        // XXX: same here
                        strip.addV(Q1[y].item);
                        V.set(i, j, strip);
                    }
                }
            }
        }

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
                item: c.get(d.length - 1, j)[1].item
            });
        }
    }

    return result;
}
