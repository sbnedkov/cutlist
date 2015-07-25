var assert = require('assert');

var utils = require('./utils');
var common = require('./common');
var Slate = common.Slate;
var Rectangle = common.Rectangle;
var Part = common.Part;
var Guillotine = require('./guillotine');

describe('Guillotine', () => {

    return;
    describe('#apply()', () => {
        it('should return empty result for no parts', () => {
            var guillotine = new Guillotine('v');
            var res = guillotine.apply([new Slate(new Rectangle(0, 0, 0, 0))], []);

            assert.equal(res.result.length, 0);
            assert.equal(res.cuts.length, 0);
        });

        it('should return correct vertical cut', (done) => {
            var guillotine = new Guillotine('v');
            var parts = [{
                name: 'a',
                w: 600,
                h: 200,
                canRotate: true
            }, {
                name: 'b',
                w: 300,
                h: 200,
                canRotate: true
            }, {
                name: 'c',
                w: 800,
                h: 200,
                canRotate: true
            }, {
                name: 'd',
                w: 400,
                h: 300,
                canRotate: true
            }, {
                name: 'e',
                w: 400,
                h: 500,
                canRotate: true
            }, {
                name: 'f',
                w: 400,
                h: 500,
                canRotate: true
            }].map(function (part) {
                return new Part(part.name, part.w, part.h, part.canRotate);
            });

            var res = guillotine.apply([new Slate(new Rectangle(0, 0, 1000, 1000), 0)], parts);

            assert.equal(res.result.length, 6);
            assert.equal(res.cuts.length, 7);
            assert.deepEqual(res, {
                "cuts": [
                    {
                        "name": "e",
                        "slateIdx": 0,
                        "x1": 400,
                        "x2": 400,
                        "y1": 0,
                        "y2": 1000
                    },
                    {
                        "name": "e",
                        "slateIdx": 0,
                        "x1": 0,
                        "x2": 400,
                        "y1": 500,
                        "y2": 500
                    },
                    {
                        "name": "d",
                        "slateIdx": 0,
                        "x1": 0,
                        "x2": 400,
                        "y1": 800,
                        "y2": 800
                    },
                    {
                        "name": "a",
                        "slateIdx": 0,
                        "x1": 400,
                        "x2": 1000,
                        "y1": 200,
                        "y2": 200
                    },
                    {
                        "name": "f",
                        "slateIdx": 0,
                        "x1": 800,
                        "x2": 800,
                        "y1": 200,
                        "y2": 1000
                    },
                    {
                        "name": "f",
                        "slateIdx": 0,
                        "x1": 400,
                        "x2": 800,
                        "y1": 700,
                        "y2": 700
                    },
                    {
                        "name": "b",
                        "slateIdx": 0,
                        "x1": 300,
                        "x2": 300,
                        "y1": 800,
                        "y2": 1000
                    }
                ],
                "rating": 120141.4213562373,
                "result": [
                    {
                        "h": 500,
                        "name": "e",
                        "slateIdx": 0,
                        "w": 400,
                        "x": 0,
                        "y": 0
                    },
                    {
                        "h": 300,
                        "name": "d",
                        "slateIdx": 0,
                        "w": 400,
                        "x": 0,
                        "y": 500
                    },
                    {
                        "h": 200,
                        "name": "a",
                        "slateIdx": 0,
                        "w": 600,
                        "x": 400,
                        "y": 0
                    },
                    {
                        "h": 500,
                        "name": "f",
                        "slateIdx": 0,
                        "w": 400,
                        "x": 400,
                        "y": 200
                    },
                    {
                        "h": 800,
                        "name": "c",
                        "slateIdx": 0,
                        "w": 200,
                        "x": 800,
                        "y": 200
                    },
                    {
                        "h": 200,
                        "name": "b",
                        "slateIdx": 0,
                        "w": 300,
                        "x": 0,
                        "y": 800
                    }
                ]
            });

            done();
        });

        it('should return correct horizontal cut', (done) => {
            var guillotine = new Guillotine('h');
            var parts = [{
                name: 'a',
                w: 600,
                h: 200,
                canRotate: true
            }, {
                name: 'b',
                w: 300,
                h: 200,
                canRotate: true
            }, {
                name: 'c',
                w: 800,
                h: 200,
                canRotate: true
            }, {
                name: 'd',
                w: 400,
                h: 300,
                canRotate: true
            }, {
                name: 'e',
                w: 400,
                h: 500,
                canRotate: true
            }, {
                name: 'f',
                w: 400,
                h: 500,
                canRotate: true
            }].map(function (part) {
                return new Part(part.name, part.w, part.h, part.canRotate);
            });

            var res = guillotine.apply([new Slate(new Rectangle(0, 0, 1000, 1000), 0)], parts);

            assert.equal(res.result.length, 6);
            assert.equal(res.cuts.length, 7);
            assert.deepEqual(res, {
                "cuts": [
                    {
                        "name": "e",
                        "slateIdx": 0,
                        "x1": 0,
                        "x2": 1000,
                        "y1": 400,
                        "y2": 400
                    },
                    {
                        "name": "e",
                        "slateIdx": 0,
                        "x1": 500,
                        "x2": 500,
                        "y1": 0,
                        "y2": 400
                    },
                    {
                        "name": "a",
                        "slateIdx": 0,
                        "x1": 200,
                        "x2": 200,
                        "y1": 400,
                        "y2": 1000
                    },
                    {
                        "name": "c",
                        "slateIdx": 0,
                        "x1": 200,
                        "x2": 1000,
                        "y1": 600,
                        "y2": 600
                    },
                    {
                        "name": "d",
                        "slateIdx": 0,
                        "x1": 800,
                        "x2": 800,
                        "y1": 0,
                        "y2": 400
                    },
                    {
                        "name": "f",
                        "slateIdx": 0,
                        "x1": 700,
                        "x2": 700,
                        "y1": 600,
                        "y2": 1000
                    },
                    {
                        "name": "b",
                        "slateIdx": 0,
                        "x1": 800,
                        "x2": 1000,
                        "y1": 300,
                        "y2": 300
                    }
                ],
                "rating": 120141.4213562373,
                "result": [
                    {
                        "h": 400,
                        "name": "e",
                        "slateIdx": 0,
                        "w": 500,
                        "x": 0,
                        "y": 0
                    },
                    {
                        "h": 600,
                        "name": "a",
                        "slateIdx": 0,
                        "w": 200,
                        "x": 0,
                        "y": 400
                    },
                    {
                        "h": 200,
                        "name": "c",
                        "slateIdx": 0,
                        "w": 800,
                        "x": 200,
                        "y": 400
                    },
                    {
                        "h": 400,
                        "name": "d",
                        "slateIdx": 0,
                        "w": 300,
                        "x": 500,
                        "y": 0
                    },
                    {
                        "h": 400,
                        "name": "f",
                        "slateIdx": 0,
                        "w": 500,
                        "x": 200,
                        "y": 600
                    },
                    {
                        "h": 300,
                        "name": "b",
                        "slateIdx": 0,
                        "w": 200,
                        "x": 800,
                        "y": 0
                    }
                ]
            });

            done();
        });
    });
});


describe('Utils', () => {
    describe('#permute()', () => {
        it('should return empty result for empty', () => {
            utils.permute([], {threshold: 1000}, (permutation) => {
                assert.deepEqual(permutation, []);
            });
        });

        it('should return same result for 1-element array', () => {
            utils.permute([1], {threshold: 1000}, (permutation) => {
                assert.deepEqual(permutation, [1]);
            });
        });

        it('should return 6 permutation in particular order for 3-elements array', () => {
            var permutations = [
                [1, 2, 3],
                [1, 3, 2],
                [2, 1, 3],
                [3, 1, 2],
                [2, 3, 1],
                [3, 2, 1]
            ];
            utils.permute([1, 2, 3], {threshold: 1000}, (permutation) => {
                assert.deepEqual(permutation, permutations.shift());
            });
        });
    });

    describe('#rate', () => {
        var rect1 = new Rectangle(0, 0, 800, 600);
        var rect2 = new Rectangle(0, 0, 400, 500);
        var rect3 = new Rectangle(0, 0, 500, 600);
        var rect4 = new Rectangle(0, 0, 2900, 100);
        it('should rate bigger rectangle combination higher', () => {
            var rate1 = utils.rate({slates: [{rect: rect1}, {rect: rect2}]});
            var rate2 = utils.rate({slates: [{rect: rect3}, {rect: rect4}]});
            assert(rate1 > rate2, rate1 + ' > ' + rate2);
        });
    });
});
