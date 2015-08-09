class Item {
    constructor (ref, weight, quantity = 1, index = 0) {
        this.ref = ref;
        this.w = weight;
        this.q = quantity;
        this.v = weight;
        this.index = index;
    }
}

class Backpack {
    constructor (W) {
        this.W = W;
    }

    solve (items) {
        if (!items || !items.length) {
            return;
        }

        var sortedItems = items.sort((item1, item2) => {
            return item2.v - item1.v;
        });

        var expandedItems = [];
        sortedItems.forEach(item => {
            for (let i = 0; i < item.q; i++) {
                expandedItems.push(new Item(item.ref, item.w, 1, i));
            }
        });

        var m = new ItemArray2D(expandedItems.length + 1, this.W + 1);

        for (let j = 0; j < this.W + 1; j++) {
            m.set(0, j);
        }

        for (let i = 1; i < expandedItems.length + 1; i++) {
            for (let j = 0; j < this.W + 1; j++) {
                let item = expandedItems[i - 1];
                if (item.w <= j) {
                    let prev = m.getValue(i - 1, j);
                    let ith = m.getValue(i - 1, j - item.w) + item.v;

                    if (ith > prev) {
                        m.set(i, j, [i - 1, j - expandedItems[i - 1].w], item);
                    } else {
                        m.set(i, j, [i - 1, j]);
                    }
                } else {
                    m.set(i, j, m.getReference(i - 1, j), m.getItem(i - 1, j));
                }
            }
        }

        return {
            solution: m.getItemList(expandedItems.length, this.W),
            value: m.getValue(expandedItems.length, this.W)
        };
    }
}

class ItemArray2D {
    constructor (dim1, dim2) {
        this.array = [];
        this.dim1 = dim1;
        this.dim2 = dim2;
    }

    getItem (d1, d2) {
        return this.array[d1][d2].item;
    }

    getReference (d1, d2) {
        return this.array[d1][d2].reference;
    }

    getValue (d1, d2) {
        var obj = this.array[d1][d2];
        if (obj.reference) {
            return this.getValue(obj.reference[0], obj.reference[1]) + (obj.item ? obj.item.v : 0);
        } else {
            return 0;
        }
    }

    getItemList (d1, d2) {
        if (d1 === 0) {
            return [];
        }

        var reference = this.getReference(d1, d2);
        var item = this.getItem(d1, d2);

        return (reference ? this.getItemList(reference[0], reference[1]) : []).concat(item || []);
    }

    set (d1, d2, reference, item) {
        if (!this.array[d1]) {
            this.array[d1] = [];
        }
        this.array[d1][d2] = {
            reference,
            item
        };
    }
}

module.exports = {
    Backpack,
    Item
};
