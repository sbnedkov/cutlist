var assert = require('assert');

var utils = require('./utils');
var common = require('./common');
var Slate = common.Slate;
var Rectangle = common.Rectangle;
var Part = common.Part;
var Guillotine = require('./guillotine');


describe('Guillotine', () => {
    describe('#apply()', () => {
        it('should return empty result for no parts', () => {
            var guillotine = new Guillotine('v');
            var res = guillotine.apply(new Slate(new Rectangle(0, 0, 0, 0)), []);

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

            var res = guillotine.apply(new Slate(new Rectangle(0, 0, 1000, 1000)), parts);

            assert.equal(res.result.length, 6);
            assert.equal(res.cuts.length, 7);
            assert.deepEqual(res, {"rating":120141.4213562373,"result":[{"name":"e","x":0,"y":0,"w":400,"h":500},{"name":"d","x":0,"y":500,"w":400,"h":300},{"name":"a","x":400,"y":0,"w":600,"h":200},{"name":"f","x":400,"y":200,"w":400,"h":500},{"name":"c","x":800,"y":200,"w":200,"h":800},{"name":"b","x":0,"y":800,"w":300,"h":200}],"cuts":[{"name":"e","x1":400,"y1":0,"x2":400,"y2":1000},{"name":"e","x1":0,"y1":500,"x2":400,"y2":500},{"name":"d","x1":0,"y1":800,"x2":400,"y2":800},{"name":"a","x1":400,"y1":200,"x2":1000,"y2":200},{"name":"f","x1":800,"y1":200,"x2":800,"y2":1000},{"name":"f","x1":400,"y1":700,"x2":800,"y2":700},{"name":"b","x1":300,"y1":800,"x2":300,"y2":1000}]});

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

            var res = guillotine.apply(new Slate(new Rectangle(0, 0, 1000, 1000)), parts);

            assert.equal(res.result.length, 6);
            assert.equal(res.cuts.length, 7);
            assert.deepEqual(res, {"rating":120141.4213562373,"result":[{"name":"e","x":0,"y":0,"w":500,"h":400},{"name":"a","x":0,"y":400,"w":200,"h":600},{"name":"c","x":200,"y":400,"w":800,"h":200},{"name":"d","x":500,"y":0,"w":300,"h":400},{"name":"f","x":200,"y":600,"w":500,"h":400},{"name":"b","x":800,"y":0,"w":200,"h":300}],"cuts":[{"name":"e","x1":0,"y1":400,"x2":1000,"y2":400},{"name":"e","x1":500,"y1":0,"x2":500,"y2":400},{"name":"a","x1":200,"y1":400,"x2":200,"y2":1000},{"name":"c","x1":200,"y1":600,"x2":1000,"y2":600},{"name":"d","x1":800,"y1":0,"x2":800,"y2":400},{"name":"f","x1":700,"y1":600,"x2":700,"y2":1000},{"name":"b","x1":800,"y1":300,"x2":1000,"y2":300}]});

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
