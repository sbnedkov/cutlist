var _ = require('lodash');

var Rectangle = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};

var Slates = function (slate) {
    this.slates = [slate];
    this.gen = this.generator();
};

Slates.prototype.generator = function* (slate) {
    var first = this.slates[0], current = this.slates.shift(), ended = !current;

    while (!ended) {
        var additionals = yield current;
        this.slates.push(current);
        current = this.slates.shift();
        if (additionals) {
            additionals.forEach((additional) => {
                if (additional) {
                    this.slates.unshift(additional);
                }
            });
        }
        ended = current === first || !this.slates.length;
    } 
};

Slates.prototype.pop = function () {
    return this.slates.pop();
};

Slates.prototype.push = function (slate) {
    return this.slates.push(slate);
};

Slates.prototype.unshift = function (slate) {
    return this.slates.unshift(slate);
};

var Slate = function (rect) {
    this.rect = rect;
};

var Part = function (w, h) {
    this.w = w;
    this.h = h;
};

var Result = function () {
};

Result.prototype = Object.create(Array.prototype);
Result.prototype.constructor = Result;

function apply (slate, parts) {
    var result = new Result();
    var slates = new Slates(slate);
    var res = solution(slates, parts.sort((part1, part2) => {
        // TODO: different sorting depending on cut direction
        return part1.w === part2.w ? part1.h - part2.h : part1.w - part2.w;
    }), result);

    return res && result;
}

function solution (slates, parts, result) {
    console.log('Solution', slates.slates, parts, result);
    var gen = slates.gen;

    if (parts.length === 0) {
        return true;
    }

    var slate = gen.next();
    var part = parts[0];

    if (slate.done) {
        return false;
    }
    while (!(part.w <= slate.value.rect.w && part.h <= slate.value.rect.h) && !slate.done) {
        slate = gen.next();
    }
    if (slate.done) {
        return false;
    }

    slates.pop();

    slate = slate.value;
    result.push(new Rectangle(slate.rect.x, slate.rect.y, part.w, part.h));

    // TODO: use vertical cuts too
    var newWidth = slate.rect.w - part.w;
    var newHeight = slate.rect.h - part.h;
    if (newWidth) {
        slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, slate.rect.w - part.w, slate.rect.h)));
    }
    if (newHeight) {
        slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, slate.rect.w, slate.rect.h - part.h)));
    }

    parts.shift();
    if (solution(slates, parts, result)) {
        return true;
    }
    parts.unshift(part);
    slates.push(slate);

    return false;
}

module.exports = {
    apply: apply,
    Rectangle: Rectangle,
    Slate: Slate,
    Part: Part
};

