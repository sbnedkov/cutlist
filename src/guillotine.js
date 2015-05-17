var _ = require('lodash');

var utils = require('./utils');
var common = require('./common');
var Rectangle = common.Rectangle;
var NamedRectangle = common.NamedRectangle;
var Cut = common.Cut;
var Part = common.Part;
var Slate = common.Slate;
var Slates = common.Slates;

var Guillotine = module.exports = function (cutType) {
    if (cutType !== 'v' && cutType !== 'h' && cutType !== 'o') {
        throw new Error('Unknown cut type: ' + cutType);
    }

    this.cutType = cutType;
};

var THRESHOLD = 100000;
Guillotine.prototype.apply = function (slate, parts) {
    var copy = parts.slice(0);
    var ps = copy.sort((part1, part2) => {
        var primary = part2.w * part2.h - part1.w * part1.h;
        return primary ? primary : (part1, part2) => {
            if (this.cutType === 'v') {
                return part1.w === part2.w ? part2.h - part1.h : part2.w - part1.w;
            } else if (this.cutType === 'h') {
                return part1.h === part2.h ? part2.w - part1.w : part2.h - part1.h;
            } else if (this.cutType === 'o') {
                return 0;
            }
        };
    });

    var results = [];
    utils.permute(ps, {threshold: THRESHOLD}, (permutation) => {
        if (permutation) { // if false - cut by threshold
            var result = [];
            var cuts = [];
            var res = this.solution([slate], permutation, result, cuts, 0);
            if (res.success) {
                results.push({
                    rating: utils.rate(res.spares),
                    result: result,
                    cuts: cuts
                });
            }
        }
    });

    return _.max(results, (result) => {
        return result.rating;
    });
};

function fitPart (slate, part) {
    return part.w <= slate.rect.w && part.h <= slate.rect.h;
}

var rotateFn = [
    function rotateNoop (part) {
    },
    function rotate (part) {
        part.w = part.w ^ part.h;
        part.h = part.w ^ part.h;
        part.w = part.w ^ part.h;
    }
];

Guillotine.prototype.solution = function (ss, parts, result, cuts, rotationIdx) {
//    console.log(ss, parts, result);
    var slates = new Slates(ss);
    var gen = slates.generator();

    while (slates.hasMore()) {
        // End condition
        if (parts.length === 0) {
            return {
                success: true,
                spares: new Slates(ss)
            };
        }

        var part = parts[0];

        var slate;
        do {
            slate = gen.next();
//            console.log('Consider', slate, 'for', part);
            if (slate.value) {
                slate.value.marked = true;
            }
        } while (!slate.done && !fitPart(slate.value, part));

        if (slate.done) {
            slates.markUnused();
            return false;
        }

        slates.pop();
        slate = slate.value;

        parts.shift();
        rotateFn[rotationIdx](part);

        result.push(new NamedRectangle(part.name, slate.rect.x, slate.rect.y, part.w, part.h));

        var newWidth = slate.rect.w - part.w;
        var newHeight = slate.rect.h - part.h;
        if (this.cutType === 'v') {
            splitV();
        } else if (this.cutType === 'h') {
            splitH();
        } else if (this.cutType === 'o') {
            // TODO: optimal
            splitV();
        }

        var res = this.solution(slates.slates, parts, result, cuts, 0);
        if (res.success) {
            return {
                success: true,
                spares: res.spares
            };
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

        rotateFn[rotationIdx](part);
        parts.unshift(part);

        if (rotationIdx === 0) {
            return this.solution(slates.slates, parts, result, cuts, 1);
        }
        return {
            success: false
        };
    }

    slates.markUnused();
    return {
        success: false
    };

    function splitV () {
        if (newWidth) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, slate.rect.h)));
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + slate.rect.h));
        }
        if (newHeight) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, part.w, newHeight)));
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + part.w, slate.rect.y + part.h));
        }
    }

    function splitH () {
        if (newWidth) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, part.h)));
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + part.h));
        }
        if (newHeight) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, slate.rect.w, newHeight)));
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + slate.rect.w, slate.rect.y + part.h));
        }
    }
};
