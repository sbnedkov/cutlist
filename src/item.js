export default class Item {
    constructor (ref, w, h, canRotate = false, q = 1, index = -1) {
        this.ref = ref;
        this.w = w;
        this.h = h;
        this.v = w * h;
        this.canRotate = canRotate;
        this.q = q;
        this.index = index;
    }

    rotate () {
        if (this.canRotate) {
            this.w = this.w ^ this.h;
            this.h = this.w ^ this.h;
            this.w = this.w ^ this.h;
        }

        return this;
    }

    clone () {
        return new Item(this.ref, this.w, this.h, this.canRotate, this.q, this.index);
    }

    ident () {
        return `${this.ref}#${this.index}`;
    }
}
