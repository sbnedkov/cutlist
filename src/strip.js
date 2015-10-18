import {all, any} from 'lodash';

export default class Strip {
    constructor (items) {
        this.initials = [];
        this.initialRefs = {};

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
        if (this.isEmpty()) {
            return false;
        }

        if (this.isInitial()) {
            return !!(item && this.initialRefs[this.ident(item)] && (this.initials.length === 1 || this.initials.length === 2 &&
                    this.ident(this.initials[0]) === this.ident(this.initials[1])));
        }
        return !!(item && this.refs[this.ident(item)]);
    }

    strongUses (item) {
        if (this.isEmpty()) {
            return false;
        }

        if (this.isInitial()) {
            return !!(item && this.initialRefs[this.ident(item)]);
        }
        return !!(item && this.refs[this.ident(item)]);
    }

    intersects (strip) {
        if (strip.isEmpty()) {
            return false;
        }

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

    selectItem (strip, otherStrip, v) {
        var selectedItem;

        strip.initials.forEach(item => {
            if (!otherStrip.strongUses(item) && (item.v + otherStrip.value() > v)) {
                selectedItem = item;
            }
        });

        return selectedItem;
    }

    findTwo (strip, otherStrip, v) {
        var selectedItem1, selectedItem2;

        // This is needed for algorithm to succeed
        strip.initials.reverse();
        otherStrip.initials.reverse();

        strip.initials.forEach(item1 => {
            if (!selectedItem1 || !selectedItem2) {
                selectedItem1 = item1;
            } else {
                if (selectedItem2 && item1.v + selectedItem2.v > selectedItem1.v + selectedItem2.v && item1.v + selectedItem2.v > v &&
                        this.ident(item1) !== this.ident(selectedItem2)) {
                    selectedItem1 = item1;
                }
            }
            otherStrip.initials.forEach(item2 => {
                if (!selectedItem2 && this.ident(selectedItem1) !== this.ident(item2)) {
                    selectedItem2 = item2;
                } else {
                    if (selectedItem2 && selectedItem1.v + item2.v > selectedItem1.v + selectedItem2.v && selectedItem1.v + item2.v > v &&
                        this.ident(selectedItem1) !== this.ident(item2)) {
                        selectedItem2 = item2;
                    }
                }
            });
        });

        // And return
        strip.initials.reverse();
        otherStrip.initials.reverse();

        if (selectedItem1 && selectedItem2 && selectedItem1.v + selectedItem2.v > v) {
            return [selectedItem1, selectedItem2];
        }

        return [];
    }

    addStripH (strip) {
        strip.items().forEach(i => {
            let item = i.clone();
            this.add(item);
            item.x += this.w;
        });

        this.w += strip.w;
        this.h = this.h > strip.h ? this.h : strip.h;
    }

    addItemH (item) {
        this.add(item);
        item.x += this.w;

        this.w += item.w;
        this.h = this.h > item.h ? this.h : item.h;
    }

    pickAndAddItemH (strip, otherStrip, v) {
        let selectedItem = this.selectItem(strip, otherStrip, v);

        if (selectedItem) {
            let item = selectedItem.clone();
            this.add(item);
            item.x += this.w;

            this.w += item.w;
            this.h = this.h > item.h ? this.h : item.h;
        }
    }

    addStripsH (strip, otherStrip, v) {
        this.addStrip(strip, otherStrip, v, this.pickAndAddItemH.bind(this), this.addItemH.bind(this), this.addStripH.bind(this));
    }

    addStripV (strip) {
        strip.items().forEach(i => {
            let item = i.clone();
            this.add(item);
            item.y += this.h;
        });

        this.h += strip.h;
        this.w = this.w > strip.w ? this.w : strip.w;
    }

    addItemV (item) {
        this.add(item);
        item.y += this.h;

        this.h += item.h;
        this.w = this.w > item.w ? this.w : item.w;
    }

    pickAndAddItemV (strip, otherStrip, v) {
        let selectedItem = this.selectItem(strip, otherStrip, v);

        if (selectedItem) {
            let item = selectedItem.clone();
            this.add(item);
            item.y += this.h;

            this.h += item.h;
            this.w = this.w > item.w ? this.w : item.w;
        }
    }

    addStripsV (strip, otherStrip, v) {
        this.addStrip(strip, otherStrip, v, this.pickAndAddItemV.bind(this), this.addItemV.bind(this), this.addStripV.bind(this));
    }

    addStrip (strip, otherStrip, v, pickAndAddItemFn, addItemFn, addStripFn) {
        if (strip.isInitial() && otherStrip.isInitial()) {
            if (strip.isEmpty()) {
                pickAndAddItemFn(otherStrip, strip, v);
            } else if (otherStrip.isEmpty()) {
                pickAndAddItemFn(strip, otherStrip, v);
            } else {
                let twoItems = this.findTwo(strip, otherStrip, v);

                if (twoItems.length === 2) {
                    let item1 = twoItems[0].clone();
                    let item2 = twoItems[1].clone();
                    addItemFn(item1);
                    addItemFn(item2);
                }
            }
        } else if (strip.isInitial()) {
            pickAndAddItemFn(strip, otherStrip, v);
            addStripFn(otherStrip);
        } else if (otherStrip.isInitial()) {
            pickAndAddItemFn(otherStrip, strip, v);
            addStripFn(strip);
        } else {
            addStripFn(strip);
            addStripFn(otherStrip);
        }
    }

    ident (item) {
        return item && item.ident();
    }

    value () {
        if (this.isEmpty()) {
            return 0;
        }
        if (this.isInitial()) {
            return this.initials[this.initials.length - 1].v;
        }
        return this.v;
    }

    isInitial () {
        return !this.arr.length;
    }

    isEmpty () {
        return !this.initials.length && !this.arr.length;
    }
}
