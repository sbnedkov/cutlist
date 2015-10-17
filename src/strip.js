import {all, any, max} from 'lodash';

export default class Strip {
    constructor (items) {
        this.initials = [];
        this.initialRefs = [];

        this.arr = [];
        this.refs = {};
        this.w = 0;
        this.h = 0;
        this.v = 0;

        (items || []).forEach(i => {
            let item = i.clone();

            this.initials.push(item);
            this.initialRefs[this.ident(item)] = true;
            item.x = 0;
            item.y = 0;
        });

        this.initials.sort((a1, a2) => {
            return a1.v - a2.v;
        });
    }

    items () {
        return this.arr;
    }

    initialItems () {
        return this.initials;
    }

    uses (item) {
        if (this.isInitial()) {
            return item && this.initialRefs[this.ident(item)] && this.initialRefs.length === 1;
        }
        return item && this.refs[this.ident(item)];
    }

    strongUses (item) {
        if (this.isInitial()) {
            return item && this.initialRefs[this.ident(item)];
        }
        return item && this.refs[this.ident(item)];
    }

    intersects (strip) {
        if (strip.isInitial()) {
            return all(strip.initialItems(), this.uses.bind(this));
        } else if (this.isInitial()) {
            return all(this.initialItems(), strip.uses.bind(strip));
        } else {
            return any(strip.items(), this.uses.bind(this));
        }
    }

    add (item) {
        this.arr.push(item);
        this.refs[this.ident(item)] = true;
        this.v += item.v;
    }

    selectItem (strip, v) {
        var selectedItem;

        strip.initials.forEach(item => {
            if (!this.strongUses(item) && item.v + this.value() > v) {
                selectedItem = item;
            }
        });

        return selectedItem;
    }

    addStripH (strip, v) {
        if (strip.isInitial()) {
            // We have to select the maximal item that 1) is not present 2) has engouh value
            // There might be no such item
            let selectedItem = this.selectItem(strip, v);

            if (selectedItem) {
                let item = selectedItem.clone();
                this.add(item);
                item.x += this.w;

                this.w += item.w;
                this.h = this.h > item.h ? this.h : item.h;

                return true;
            }
        } else {
            strip.items().forEach(i => {
                let item = i.clone();
                this.add(item);
                item.x += this.w;
            });

            this.w += strip.w;
            this.h = this.h > strip.h ? this.h : strip.h;

            return true;
        }
    }

    addStripV (strip, v) {
        if (strip.isInitial()) {
            // We have to select the maximal item that 1) is not present 2) has engouh value
            // There might be no such item
            let selectedItem = this.selectItem(strip, v);

            if (selectedItem) {
                let item = selectedItem.clone();
                this.add(item);
                item.y += this.h;

                this.h += item.h;
                this.w = this.w > item.w ? this.w : item.w;

                return true;
            }
        } else {
            strip.items().forEach(i => {
                let item = i.clone();
                this.add(item);
                item.y += this.h;
            });

            this.h += strip.h;
            this.w = this.w > strip.w ? this.w : strip.w;

            return true;
        }
    }

    ident (item) {
        return item.ident();
    }

    value () {
        if (this.isInitial()) {
            return this.initials.length ? max(this.initials.map(i => {
                return i.v;
            })) : 0;
        }
        return this.v;
    }

    isInitial () {
        return !this.arr.length;
    }
}
