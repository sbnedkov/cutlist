class Item {
    constructor (w, ref) {
        this.w = w;
        this.v = w;
        this.ref = ref;
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

        var m = new Array2D(sortedItems.length + 1, this.W + 1);

        for (let j = 0; j < this.W + 1; j++) {
            m.set(0, j, 0);
        }

        for (let i = 1; i < sortedItems.length + 1; i++) {
            for (let j = 0; j < this.W + 1; j++) {
                if (sortedItems[i - 1].w <= j) {
                    m.set(i, j, Math.max(m.get(i - 1, j), m.get(i - 1, j - sortedItems[i - 1].w) + sortedItems[i - 1].v));
                } else {
                    m.set(i, j, m.get(i - 1, j));
                }
                console.log(i, j, m.get(i, j));
            }
        }

        return m.get(sortedItems.length, this.W);
    }
}

class Array2D {
    constructor (dim1, dim2) {
        this.array = [];
        this.dim1 = dim1;
        this.dim2 = dim2;
    }

    get (d1, d2) {
        return this.array[d1][d2];
    }

    set (d1, d2, x) {
        if (!this.array[d1]) {
            this.array[d1] = [];
        }
        this.array[d1][d2] = x;
    }
}

module.exports = {
    Backpack,
    Item
};
