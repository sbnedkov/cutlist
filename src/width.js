export default class Width {
    constructor (item) {
        this.item = item;
    }

    gte (w) {
        if (this.item.canRotate) {
            return w <= this.item.w || w <= this.item.h;
        }

        return w <= this.item.w;
    }

    split () {
        if (this.item.canRotate) {
            let newItem = this.item.clone();
            let newItem2 = newItem.clone().rotate();

            newItem.canRotate = false;
            newItem2.canRotate = false;

            return [new Width(newItem), new Width(newItem2)];
        }

        return this;
    }

    len () {
        return this.item.w;
    }
}
