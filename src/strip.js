import {all, any} from 'lodash';

export default class Strip {
    constructor (items) {
        this.initials = [];
        this.initialRefs = {};
        this.uid = (Math.random() * 1e20).toString(36);

        this.arr = [];
        this.refs = {};
        this.w = 0;
        this.h = 0;
        this.v = 0;

        (items || []).forEach(i => {
            let item = i.clone();

            this.initials.push(item);
            this.initialRefs[item.ident()] = true;
            item.x = 0;
            item.y = 0;
        });

        this.initials.sort((a1, a2) => {
            return a1.v - a2.v;
        });

        this.uses = memoize((item) => {
            if (this.isEmpty()) {
                return false;
            }

            if (this.isInitial()) {
                return !!(item && this.initialRefs[item.ident()] && (this.initials.length === 1 || this.initials.length === 2 &&
                        this.initials[0].ident() === this.initials[1].ident()));
            }
            return !!(item && this.refs[item.ident()]);
        });

        this.weakUses = memoize((item) => {
            if (this.isEmpty()) {
                return false;
            }

            if (this.isInitial()) {
                return !!(item && this.initialRefs[item.ident()]);
            }
            return !!(item && this.refs[item.ident()]);
        });

        this.intersects = memoize((strip) => {
            if (strip.isEmpty()) {
                return false;
            }

            if (this.isEmpty()) {
                return false;
            }

            if (strip.isInitial()) {
                return all(strip.initialItems(), this.uses.bind(this));
            } else if (this.isInitial()) {
                return all(this.initialItems(), strip.uses.bind(strip));
            } else {
                return any(strip.items(), this.uses.bind(this));
            }
        });
    }

    items () {
        return this.arr;
    }

    initialItems () {
        return this.initials;
    }

    add (item) {
        this.arr.push(item);
        this.refs[item.ident()] = true;
        this.v += item.v;
    }

    selectItem (strip, otherStrip, v) {
        var selectedItem;

        strip.initials.forEach(item => {
            if (!otherStrip.weakUses(item) && (item.v + otherStrip.value() > v)) {
                selectedItem = item;
            }
        });

        return selectedItem;
    }

    findTwo (strip, otherStrip, v) {
        var combination;
        var max = 0;

        strip.initials.forEach(item1 => {
            otherStrip.initials.forEach(item2 => {
                let newV = item1.v + item2.v;
                if (newV > v && item1.ident() !== item2.ident()) {
                    if (max < newV) {
                        max = newV;
                        combination = [item1, item2];
                    }
                }
            });
        });

        return combination || [];
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

                if (twoItems.length !== 0) {
                    let item1 = twoItems[0].clone();
                    let item2 = twoItems[1].clone();
                    if (item1.v > item2.v) {
                        addItemFn(item1);
                        addItemFn(item2);
                    } else {
                        addItemFn(item2);
                        addItemFn(item1);
                    }
                }
            }
        } else if (strip.isInitial()) {
            addStripFn(otherStrip);
            pickAndAddItemFn(strip, otherStrip, v);
        } else if (otherStrip.isInitial()) {
            addStripFn(strip);
            pickAndAddItemFn(otherStrip, strip, v);
        } else {
            if (strip.value() > otherStrip.value()) {
                addStripFn(strip);
                addStripFn(otherStrip);
            } else {
                addStripFn(otherStrip);
                addStripFn(strip);
            }
        }
    }

    ident () {
        return this.uid;
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

function memoize (fn) {
    var memory = {};

    return (itemOrStrip) => {
        var identity = itemOrStrip.ident();
        if (memory[identity] === void 0) {
            memory[identity] = fn(itemOrStrip);
        }
        return memory[identity];
    };
}
