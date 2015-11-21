export default class ItemPosition {
    constructor (x, y, item) {
        this.x = x;
        this.y = y;
        this.item = item;
    }

    get ref () {
        return this.item.ref;
    }

    get w () {
        return this.item.w;
    }

    get h () {
        return this.item.h;
    }

    get v () {
        return this.item.v;
    }

    get canRotate () {
        return this.item.canRotate;
    }

    get index () {
        return this.item.index;
    }

    get identity () {
        return this.item.identity;
    }

    createItemPosition () {
        return new ItemPosition(this.x, this.y, this.item);
    }

    ident () {
        return this.identity;
    }
}
