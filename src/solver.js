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

        w = null;
        h = null;

        var P1 = P.concat([{
            len: this.W,
            item: {}
        }]);
        var Q1 = Q.concat([{
            len: this.H,
            item: {}
        }]);

        var V = new Array2D(P1.length, Q1.length);

        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
                let maxvk = 0;
                let maxvkR = 0;
                let maxItems = [];

                v.forEach((vk, k) => {
                    let item = expandedItems[k];
                    let rotatedItem = item.clone().rotate();

                    if (P1[i].len >= item.w && Q1[j].len >= item.h) {
                        if (vk >= maxvk) {
                            maxvk = vk;
                            maxItems.push(item);
                        }
                    }

                    if (P1[i].len >= rotatedItem.w && Q1[j].len >= rotatedItem.h) {
                        if (vk >= maxvkR) {
                            maxvkR = vk;
                            maxItems.push(rotatedItem);
                        }
                    }
                });

                let strip = new Strip(maxItems);
                V.set(i, j, strip);
            }
        }

        v = null;

//        console.log(JSON.stringify(V, (key, value) => {return value;}, 2));

        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
//                (i === P1.length -1 && j === Q1.length - 1) && console.log(JSON.stringify(V, (key, value) => {return value;}, 2));
                let sx, sy, st, vmax = 0, vuse;

                for (let x = 0; x < i; x++) {
                    for (let t = 0; t < P1.length; t++) {
                        let stripX = V.get(x, j);
                        let stripT = V.get(t, j);
                        if ((P1[t].len <= P1[i].len - P1[x].len) && !stripT.intersects(stripX)) {
                            let vloc = stripX.value() + stripT.value();
                            let v = V.get(i, j).value();
                            if (vloc > v) {
                                if (vloc > vmax) {
                                    sx = stripX;
                                    st = stripT;
                                    vmax = vloc;
                                    vuse = v;
                                }
                            }
                        }
                    }
                }

                if (sx) {
                    let strip = new Strip();
                    strip.addStripsH(sx, st, vuse);
                    V.set(i, j, strip);
                }

                vmax = 0;
                for (let y = 0; y < j; y++) {
                    for (let t = 0; t < Q1.length; t++) {
                        let stripY = V.get(i, y);
                        let stripT = V.get(i, t);
                        if ((Q1[t].len <= Q1[j].len - Q1[y].len) && !stripT.intersects(stripY)) {
                            let vloc = stripY.value() + stripT.value();
                            let v = V.get(i, j).value();
                            if (vloc > v) {
                                if (vloc > vmax) {
                                    sy = stripY;
                                    st = stripT;
                                    vmax = vloc;
                                    vuse = v;
                                }
                            }
                        }
                    }
                }

                if (sy) {
                    let strip = new Strip();
                    strip.addStripsV(sy, st, vuse);
                    V.set(i, j, strip);
                }
//                console.log(i, ' of ', P1.length, ' ', j, ' of ', Q1.length);
            }
            console.log(i, ' of ', P1.length);
        }

        var allValue = expandedItems.reduce((acc, item) => {
            return acc + item.v;
        }, 0);

        var solution;
        var max = 0;
        for (let i = 0; i < P1.length; i++) {
            for (let j = 0; j < Q1.length; j++) {
                if (V.get(i, j).value() === allValue) {
                    let areav = (this.W - P1[i].len) * this.H;
                    if (areav > max) {
                        max = areav;
                        solution = V.get(i, j);
                        console.log('Vertical cut off at:', P1[i].len);
                    }

                    let areah = (this.H - Q1[j].len) * this.W;
                    if (areah > max) {
                        max = areah;
                        solution = V.get(i, j);
                        console.log('Horizontal cut off at:', Q1[j].len);
                    }
                }
            }
        }

        return solution || V.get(P1.length - 1, Q1.length -1);
    }
}

export function knapsack (D, dd) {
    var result = [{
        len: 0,
        item: {}
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
