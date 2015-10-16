export default class Height {
    constructor (item) {
        this.item = item;
    }

    gte (h) {
        if (this.item.canRotate) {
            return h <= this.item.h || h <= this.item.w;
        }

        return h <= this.item.h;
    }

    split () {
        if (this.item.canRotate) {
            let newItem = this.item.clone();
            let newItem2 = newItem.clone().rotate();

            newItem.canRotate = false;
            newItem2.canRotate = false;
            newItem2.isRotated = true;

            return [new Height(newItem), new Height(newItem2)];
        }

        return this;
    }

    len () {
        return this.item.h;
    }
}

