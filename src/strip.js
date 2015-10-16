import {any} from 'lodash';

export default class Strip {
    constructor (i) {
        this.arr = [];
        this.refs = {};
        this.w = 0;
        this.h = 0;
        this.v = 0;

        if (i) {
            let item = i.clone();

            this.arr.push(item);
            this.v = item.v;
            this.refs[this.ident(item)] = true;
            this.w = item.w;
            this.h = item.h;
            item.x = 0;
            item.y = 0;
        }
    }

    items () {
        return this.arr;
    }

    uses (item) {
        return item && this.refs[this.ident(item)];
    }

    intersects (strip) {
        return any(strip.items(), this.uses.bind(this));
    }

    addStripH (strip) {
        strip.items().forEach(i => {
            let item = i.clone();

            this.arr.push(item);
            this.refs[this.ident(item)] = true;
            this.v += item.v;

            item.x += this.w;
        });

        this.w += strip.w;
        this.h = this.h > strip.h ? this.h : strip.h;
    }

    addStripV (strip) {
        strip.items().forEach(i => {
            let item = i.clone();

            this.arr.push(item);
            this.refs[this.ident(item)] = true;
            this.v += item.v;

            item.y += this.h;
        });

        this.w = this.w > strip.w ? this.w : strip.w;
        this.h += strip.h;
    }

    ident (item) {
        return item.ident();
    }

    value () {
        return this.v;
    }
}
