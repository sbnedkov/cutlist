export default class Array2D {
    constructor (d1, d2) {
        this.d1 = d1;
        this.d2 = d2;

        this.arr = [];

        for (let i = 0; i < d1; i++) {
            this.arr.push([]);
        }
    }

    get (i, j) {
        return this.arr[i][j];
    }

    set (i, j, x) {
        this.arr[i][j] = x;
    }
}
