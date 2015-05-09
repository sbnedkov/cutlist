var _ = require('lodash');

var common = require('./common');
var Rectangle = common.Rectangle;
var NamedRectangle = common.NamedRectangle;
var Cut = common.Cut;
var Slate = common.Slate;
var Slates = common.Slates;

var Guillotine = module.exports = function (cutType) {
    if (cutType !== 'v' && cutType !== 'h') {
        throw new Error('Unknown cut type: ' + cutType);
    }

    this.cutType = cutType;
};

Guillotine.prototype.apply = function (slate, parts) {
    var result = [];
    var cuts = [];
    var res = this.solution([slate], parts.sort((part1, part2) => {
        if (this.cutType === 'v') {
            return part1.w === part2.w ? part2.h - part1.h : part2.w - part1.w;
        } else if (this.cutType === 'h') {
            return part1.h === part2.h ? part2.w - part1.w : part2.h - part1.h;
        }
    }), result, cuts, 0);

    return res && {
        result: result,
        cuts: cuts
    };
};

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

Guillotine.prototype.solution = function (ss, parts, result, cuts, fnIdx) {
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

        var newWidth = slate.rect.w - part.w;
        var newHeight = slate.rect.h - part.h;
        if (this.cutType === 'v') {
            if (newWidth) {
                slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, slate.rect.h)));
                cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + slate.rect.h));
            }
            if (newHeight) {
                slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, part.w, newHeight)));
                cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + part.w, slate.rect.y + part.h));
            }
        } else if (this.cutType === 'h') {
            if (newWidth) {
                slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, part.h)));
                cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + part.h));
            }
            if (newHeight) {
                slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, slate.rect.w, newHeight)));
                cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + slate.rect.w, slate.rect.y + part.h));
            }
        }

        if (this.solution(slates.slates, parts, result, cuts, 0)) {
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
            return this.solution(slates.slates, parts, result, cuts, 1);
        }

        return false;
    }
    console.log('Backtracking');

    slates.markUnused();
    return false;
};
