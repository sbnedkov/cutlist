export default class Strip {
    constructor (i) {
        this.arr = [];
        this.refs = {};
        this.w = 0;
        this.h = 0;
        this.v = 0;
        if (i) {
            let item = i.clone();

            this.initial = item;
            this.initialValue = item.v;
            this.refs[this.ident(item)] = true;
            this.w = item.w;
            this.h = item.h;
            item.dir = 'H';
        }
    }

    items () {
        if (this.arr.length) {
            return this.arr;
        }

        return [this.initial];
    }

    uses (item) {
        return item && this.refs[this.ident(item)];
    }

    addH (i) {
        if (!i) { // This is for the special cases - 0 and limit
            return;
        }

        var item = i.clone();

        this.arr.push(item);
        this.refs[this.ident(item)] = true;
        this.v += item.v;

        item.x = this.w;
        item.y = 0;
        item.dir = 'H';

        this.w += item.w;
        this.h = this.h > item.h ? this.h : item.h;
    }

    addV (i) {
        if (!i) {
            return;
        }

        var item = i.clone();

        this.arr.push(item);
        this.refs[this.ident(item)] = true;
        this.v += item.v;

        item.x = 0;
        item.y = this.h;
        item.dir = 'V';

        this.h += item.h;
        this.w = this.w > item.w ? this.w : item.w;
    }

    ident (item) {
        return item.ident();
    }

    value () {
        return this.v || this.initialValue;
    }
}
