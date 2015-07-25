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

Guillotine.prototype.sortParts = function (copy) {
    var groupDimMap = {};
    _.each(copy, (part) => {
        if (!groupDimMap[part.group]) {
            groupDimMap[part.group] = {
                w: 0,
                h: 0,
                short: 0
            };
        }

        switch (this.cutType) {
            case 'v':
                if (part.w < part.h) {
                    rotate(part);
                }
                groupDimMap[part.group].w = part.w;
                groupDimMap[part.group].h += part.h;
                break;
            case 'h':
                if (part.w > part.h) {
                    rotate(part);
                }
                groupDimMap[part.group].w = part.w;
                groupDimMap[part.group].h += part.h;
                break;
            case 'o':
                if (part.w > part.h) {
                    rotate(part);
                }
                groupDimMap[part.group].w += part.w;
                groupDimMap[part.group].h = part.h;
                break;
            default:
                throw new Error('Unknown cut type: ' + this.cutType);
        }
    });

    return copy.sort((part1, part2) => {
        var short1 = groupDimMap[part1.group].w > groupDimMap[part1.group].h ? groupDimMap[part1.group].h : groupDimMap[part1.group].w;
        var short2 = groupDimMap[part2.group].w > groupDimMap[part2.group].h ? groupDimMap[part2.group].h : groupDimMap[part2.group].w;

        return short2 - short1;
    });
};

var THRESHOLD = 1000;
Guillotine.prototype.apply = function (slates, parts) {
    var copy = parts.slice(0);
    var ps = this.sortParts(copy);

    // TODO: Parts that can be rotated should be sorted further down the list
//    var ps = copy.sort((part1, part2) => {
//        var primary = part2.w * part2.h - part1.w * part1.h;
//        return primary ? primary : ((part1, part2) => {
//            if (this.cutType === 'v') {
//                return part1.w === part2.w ? part2.h - part1.h : part2.w - part1.w;
//            } else if (this.cutType === 'h') {
//                return part1.h === part2.h ? part2.w - part1.w : part2.h - part1.h;
//            } else if (this.cutType === 'o') {
//                return 0;
//            }
//        })(part1, part2);
//    });

    var results = [];
//    utils.permute(ps, {threshold: THRESHOLD}, (permutation) => {
//        if (permutation) { // if false - skip by threshold
            var result = [];
            var cuts = [];
            var res = this.solution(slates, ps, result, cuts, 0);
//            var res = this.solution(slates, permutation, result, cuts, 0);
            if (res.success) {
                results.push({
                    rating: utils.rate(res.spares),
                    result: result,
                    cuts: cuts
                });
            }
//        }
//    });

    return _.max(results, (result) => {
        return result.rating;
    });
};

function rotateNoop (part) {
}

function rotate (part) {
    part.rotated = !part.rotated;
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
//    parts = this.sortParts(parts);
    var gen = slates.generator();

    while (slates.hasMore()) {
        // End condition
        if (parts.length === 0) {
            return {
                success: true,
                spares: new Slates(ss)
            };
        }

        rotateFn[rotationIdx](parts[0]);

        var slate;
        do {
            slate = gen.next();

            if (slate.value && !slate.value.lastUsed) {
                parts = this.sortParts(parts);
            }

            if (slate.value) {
                slate.value.marked = true;
            }
        } while (!slate.done && !fitPart(slate.value, parts[0]) && !fitPartRotated(slate.value, parts[0]));

        var part = parts.shift();

        // TODO: revisit the next condition, what about slate.done && !slate.value?
        if (slate.done) {
            parts.unshift(part);
            slates.markUnused();
            return {
                success: false
            };
        }

        slates.pop();
        slate = slate.value;
        slates.clearLastUsed();

        if (!fitPart(slate, part)) {
            returnParts();
            return this.solution(slates.slates, parts, result, cuts, 1);
        }

        var res;
        var shouldKeep;
        var newWidth = slate.rect.w - part.w;
        var newHeight = slate.rect.h - part.h;

        if (this.cutType === 'v') {
            shouldKeep = cutV();
        } else if (this.cutType === 'h') {
            shouldKeep = cutH();
        } else if (this.cutType === 'o') {
            shouldKeep = cutV();
            if (shouldKeep) {
                recordResult();
                // recurse
                res = this.solution(slates.slates, parts, result, cuts, 0);
                if (res.success) {
                    return {
                        success: true,
                        spares: res.spares
                    };
                } else {
                    res = this.solution(slates.slates, parts, result, cuts, 1);
                    if (res.success) {
                        return {
                            success: true,
                            spares: res.spares
                        };
                    } else {
                        undoCutAndResult();
                        shouldKeep = cutH();
                    }
                }
            } else {
                undoCut();
                shouldKeep = cutH();
                if (shouldKeep) {
                    recordResult();
                    // recurse
                    res = this.solution(slates.slates, parts, result, cuts, 0);
                    if (res.success) {
                        return {
                            success: true,
                            spares: res.spares
                        };
                    } else {
                        res = this.solution(slates.slates, parts, result, cuts, 1);
                        if (res.success) {
                            return {
                                success: true,
                                spares: res.spares
                            };
                        } else {
                            undoCutAndResult();
                            shouldKeep = cutV();
                        }
                    }
                }
            }
        }

        recordResult();

        if (shouldKeep) {
            res = this.solution(slates.slates, parts, result, cuts, 0);
            if (res.success) {
                return {
                    success: true,
                    spares: res.spares
                };
            }
        } else {
            undoResultAndReturnParts();
            return this.solution(slates.slates, parts, result, cuts, 1);
        }

        undoAll();

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

    function returnParts () {
        slates.push(slate); // Put slate at end so another one is picked
        rotateFn[rotationIdx](part);
        parts.unshift(part);
    }

    function undoResultAndReturnParts () {
        result.pop();
        returnParts();
    }

    function undoCut () {
        // Reverse everything
        if (newHeight) {
            slates.shift();
            cuts.pop();
        }
        if (newWidth) {
            slates.shift();
            cuts.pop();
        }
    }

    function undoCutAndResult () {
        undoCut();
        result.pop();
    }

    function undoAll () {
        undoCut();
        undoResultAndReturnParts();
    }

    function cutH () {
        var area1 = newWidth * part.h;
        var area2 = slate.rect.w * newHeight;
        var rotatedNewWidth, rotatedNewHeight, rotatedArea1, rotatedArea2;

        if (part.canRotate && rotationIdx === 0) {
            rotatedNewWidth = slate.rect.h - part.h;
            rotatedNewHeight = slate.rect.w - part.w;
            rotatedArea1 = rotatedNewWidth * part.w;
            rotatedArea2 = slate.rect.h * rotatedNewHeight;

            if (area1 >= area2 && rotatedArea1 > area1 ||
                    area2 >= area1 && rotatedArea2 > area2) {
                return false;
            } else {
                return splitH();
            }
        } else {
            return splitH();
        }

        function splitH () {
            if (area1 > area2) {
                cutHH();
                cutHV();
            } else {
                cutHV();
                cutHH();
            }

            return true;
        }
    }

    function cutV () {
        var area1 = newWidth * slate.rect.h;
        var area2 = part.w * newHeight;
        var rotatedNewWidth, rotatedNewHeight, rotatedArea1, rotatedArea2;

        if (!part.rotated && part.canRotate && rotationIdx === 0) {
            rotatedNewWidth = slate.rect.h - part.h;
            rotatedNewHeight = slate.rect.w - part.w;
            rotatedArea1 = newWidth * slate.rect.w;
            rotatedArea2 = part.h * newHeight;

            if (area1 >= area2 && rotatedArea1 > area1 ||
                    area2 >= area1 && rotatedArea2 > area2) {
                return false;
            } else {
                return splitV();
            }
        } else {
            return splitV();
        }


        function splitV () {
            if (area1 > area2) {
                cutVH();
                cutVV();
            } else {
                cutVV();
                cutVH();
            }

            return true;
        }
    }

    function cutVH () {
        if (newWidth) {
            var s = new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, slate.rect.h), slate.idx);
            slates.unshift(s);
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + slate.rect.h, slate.idx));
        }
    }

    function cutVV () {
        if (newHeight) {
            var s = new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, part.w, newHeight), slate.idx);
            s.lastUsed = true;
            slates.unshift(s);
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + part.w, slate.rect.y + part.h, slate.idx));
        }
    }

    function cutHH () {
        if (newWidth) {
            var s = new Slate(new Rectangle(slate.rect.x + part.w, slate.rect.y, newWidth, part.h), slate.idx);
            s.lastUsed = true;
            slates.unshift(s);
            cuts.push(new Cut(part.name, slate.rect.x + part.w, slate.rect.y, slate.rect.x + part.w, slate.rect.y + part.h, slate.idx));
        }
    }

    function cutHV () {
        if (newHeight) {
            var s = new Slate(new Rectangle(slate.rect.x, slate.rect.y + part.h, slate.rect.w, newHeight), slate.idx);
            slates.unshift(s);
            cuts.push(new Cut(part.name, slate.rect.x, slate.rect.y + part.h, slate.rect.x + slate.rect.w, slate.rect.y + part.h, slate.idx));
        }
    }

    function fitPart (slate, part) {
        return part.w <= slate.rect.w && part.h <= slate.rect.h;
    }

    function fitPartRotated (slate, part) {
        return part.canRotate && rotationIdx === 0 && part.w <= slate.rect.h && part.h <= slate.rect.w;
    }

    function recordResult () {
        result.push(new NamedRectangle(part.name, slate.rect.x, slate.rect.y, part.w, part.h, slate.idx));
    }
};
