export default class Item {
    constructor (ref, w, h, q = 1, index = -1) {
        this.ref = ref;
        this.w = w;
        this.h = h;
        this.v = w * h;
        this.q = q;
        this.index = index;
    }

    clone () {
        return new Item(this.ref, this.w, this.h, this.q, this.index);
    }
}
