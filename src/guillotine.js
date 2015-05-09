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

function apply (slate, parts) {
    var result = [];
    var cuts = [];
    var res = solution([slate], parts.sort((part1, part2) => {
        // TODO: different sorting depending on cut direction
        return part1.w === part2.w ? part2.h - part1.h : part2.w - part1.w;
    }), result, cuts, 0);

    return res && {
        result: result,
        cuts: cuts
    };
}

var fitPartPredicates = [
    function partFitsDirectly (slate, part) {
        return part.w <= slate.rect.w && part.h <= slate.rect.h;
    },
    function partFitsRotated (slate, part) {
        return part.canRotate && part.h <= slate.rect.w && part.w <= slate.rect.h;
    }
];

var rotateFns = [
    function rotateNoop (part) {
    },
    function rotate (part) {
        part.w = part.w ^ part.h;
        part.h = part.w ^ part.h;
        part.w = part.w ^ part.h;
    }
];

function solution (ss, parts, result, cuts, fnIdx) {
    console.log(ss, parts, result);
    var slates = new Slates(ss);
    var gen = slates.generator();

    while (slates.hasMore()) {
        // End condition
        if (parts.length === 0) {
            return true;
        }

        var part = parts[0];

        var slate;
        do {
            slate = gen.next();
            console.log('Consider', slate, 'for', part);
            if (slate.value) {
                slate.value.marked = true;
            }
        } while (!slate.done && !fitPartPredicates[fnIdx](slate.value, part));

        if (slate.done) {
            slates.markUnused();
            return false;
        }

        slates.pop();
        slate = slate.value;

        parts.shift();
        rotateFns[fnIdx](part);

        result.push(new NamedRectangle(part.name, slate.rect.x, slate.rect.y, part.w, part.h));

        // TODO: use vertical cuts too
        var newWidth = slate.rect.w - part.w;
        var newHeight = slate.rect.h - part.h;
        if (newWidth) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, slate.rect.h)));
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + slate.rect.h));
        }
        if (newHeight) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, part.w, newHeight)));
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + part.w, slate.rect.y + part.h));
        }

        if (solution(slates.slates, parts, result, cuts, 0)) {
            return true;
        }

        // Reverse everything
        if (newHeight) {
            slates.shift();
            cuts.pop();
        }
        if (newWidth) {
            slates.shift();
            cuts.pop();
        }
        slates.push(slate); // Put slate at end so another one is picked
        result.pop();

        rotateFns[fnIdx](part);
        parts.unshift(part);

        // Try with rotation
        if (fnIdx === 0) {
            return solution(slates.slates, parts, result, cuts, 1);
        }

        return false;
    }
    console.log('Backtracking');

    slates.markUnused();
    return false;
}

function rotatePart (part) {
    var tmp = part.w;
    part.w = part.h;
    part.h = tmp;
}

module.exports = {
    apply: apply,
    Rectangle: Rectangle,
    Slate: Slate,
    Part: Part
};
