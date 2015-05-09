var _ = require('lodash');

var Rectangle = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};


var Cut = function (name, x1, y1, x2, y2) {
    this.name = name;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
};

var NamedRectangle = function (name, x, y, w, h) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};

var Slates = function (slates) {
    this.slates = _.cloneDeep(slates);
    this.markUnused();
};

Slates.prototype.generator = function* () {
    var current = this.slates.shift();
    this.slates.push(current);

    while (current) {
        yield current;
        if (!this.hasMore()) {
            break;
        }
        do {
            current = this.slates.shift();
            this.slates.push(current);
        } while (current.marked);
    }
};

Slates.prototype.pop = function () {
    return this.slates.pop();
};

Slates.prototype.push = function (slate) {
    return this.slates.push(slate);
};

Slates.prototype.shift = function () {
    return this.slates.shift();
};

Slates.prototype.unshift = function (slate) {
    return this.slates.unshift(slate);
};

Slates.prototype.markUnused = function () {
    _.each(this.slates, (slate) => {
        delete slate.marked;
    });
    return this.slates;
};

Slates.prototype.hasMore = function () {
    return !_.all(this.slates, 'marked');
};

var Slate = function (rect) {
    this.rect = rect;
};

var Part = function (name, w, h, canRotate) {
    this.name = name;
    this.w = w;
    this.h = h;
    this.canRotate = canRotate;
};

module.exports = {
    Rectangle: Rectangle,
    NamedRectangle: NamedRectangle,
    Cut: Cut,
    Slate: Slate,
    Slates: Slates,
    Part: Part
};
