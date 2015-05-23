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
    // TODO: Parts that can be rotated should be sorted further down the list
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

function rotateNoop (part) {
}

function rotate (part) {
    part.w = part.w ^ part.h;
    part.h = part.w ^ part.h;
    part.w = part.w ^ part.h;
}

var rotateFn = [
    rotateNoop,
    rotate
];

Guillotine.prototype.solution = function (ss, parts, result, cuts, rotationIdx) {
//    console.log(ss, parts, result);
    var slates = new Slates(ss);
    var gen = slates.generator();

    var partRotated = false;
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

        result.push(new NamedRectangle(part.name, slate.rect.x, slate.rect.y, part.w, part.h));

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
        if (partRotated) {
            partRotated = false;
            rotate(part);
        }
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

    function splitH () {
        var area1 = newWidth * part.h;
        var area2 = slate.rect.w * newHeight;
        var rotatedNewWidth, rotatedNewHeight, rotatedArea1, rotatedArea2;

        if (part.canRotate && !partRotated && rotationIdx === 0) {
            partRotated = true;
            rotate(part);
            rotatedNewWidth = slate.rect.w - part.w;
            rotatedNewHeight = slate.rect.h - part.h;
            rotatedArea1 = rotatedNewWidth * part.h;
            rotatedArea2 = slate.rect.w * rotatedNewHeight;

            if (area1 >= area2 && rotatedArea1 > area1 ||
                    area2 >= area1 && rotatedArea2 > area2) {
                newWidth = rotatedNewWidth;
                newHeight = rotatedNewHeight;
                area1 = rotatedArea1;
                area2 = rotatedArea2;

                if (area1 > area2) {
                    splitVV();
                    splitVH();
                } else {
                    splitVH();
                    splitVV();
                }
            } else {
                partRotated = false;
                rotate(part);

                splitNormalH();
            }
        } else {
            splitNormalH();
        }

        function splitNormalH () {
            if (area1 > area2) {
                splitHH();
                splitHV();
            } else {
                splitHV();
                splitHH();
            }
        }
    }

    function splitV () {
        var area1 = newWidth * slate.rect.h;
        var area2 = part.w * newHeight;
        var rotatedNewWidth, rotatedNewHeight, rotatedArea1, rotatedArea2;

        if (part.canRotate && !partRotated && rotationIdx === 0) {
            partRotated = true;
            rotate(part);
            rotatedNewWidth = slate.rect.w - part.w;
            rotatedNewHeight = slate.rect.h - part.h;
            rotatedArea1 = newWidth * slate.rect.h;
            rotatedArea2 = part.w * newHeight;

            if (area1 >= area2 && rotatedArea1 > area1 ||
                    area2 >= area1 && rotatedArea2 > area2) {
                newWidth = rotatedNewWidth;
                newHeight = rotatedNewHeight;
                area1 = rotatedArea1;
                area2 = rotatedArea2;

                if (area1 > area2) {
                    splitHV();
                    splitHH();
                } else {
                    splitHH();
                    splitHV();
                }
            } else {
                partRotated = false;
                rotate(part);

                splitNormalV();
            }
        } else {
            splitNormalV();
        }


        function splitNormalV () {
            if (area1 > area2) {
                splitVH();
                splitVV();
            } else {
                splitVV();
                splitVH();
            }
        }
    }

    function splitVH () {
        if (newWidth) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, slate.rect.h)));
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + slate.rect.h));
        }
    }

    function splitVV () {
        if (newHeight) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, part.w, newHeight)));
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + part.w, slate.rect.y + part.h));
        }
    }

    function splitHH () {
        if (newWidth) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, part.h)));
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + part.h));
        }
    }

    function splitHV () {
        if (newHeight) {
            slates.unshift(new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, slate.rect.w, newHeight)));
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + slate.rect.w, slate.rect.y + part.h));
        }
    }
};
