var assert = require('assert');

var utils = require('./utils');
var common = require('./common');
var Slate = common.Slate;
var Rectangle = common.Rectangle;
var Part = common.Part;
var Guillotine = require('./guillotine');
import {Backpack, Item} from './backpack';

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

describe('Backpack', () => {
    var backpack = new Backpack(100);

    describe('#solve()', () => {
        it('should return no result for empty', () => {
            var result = backpack.solve([]);

            assert.equal(result, void 0);
        });

        it('should solve task with matching capacity', () => {
            var items = [new Item('one', 50), new Item('two', 40), new Item('three', 10), new Item('four', 30)];
            var result = backpack.solve(items);

            assert.equal(result.value, 100);
            assert.deepEqual(result.solution.map(item => {
                return item.ref;
            }), ['one', 'two', 'three']);
        });

        it('should solve task with incomplete capacity', () => {
            var backpack = new Backpack(60);

            var items = [new Item('one', 50), new Item('two', 40), new Item('three', 9), new Item('four', 30)];
            var result = backpack.solve(items);

            assert.equal(result.value, 59);
            assert.deepEqual(result.solution.map(item => {
                return item.ref;
            }), ['one', 'three']);
        });

        it('should solve task with multiple items of the same kind', () => {
            var backpack = new Backpack(58);

            var items = [new Item('one', 50), new Item('two', 40), new Item('three', 9, 6), new Item('four', 30)];
            var result = backpack.solve(items);

            assert.equal(result.value, 58);
            assert.deepEqual(result.solution.map(item => {
                return item.ref;
            }), ['two', 'three', 'three']);
            assert.deepEqual(result.solution.map(item => {
                return item.index;
            }), [0, 0, 1]);
        });

        it('should solve task with more elements', () => {
            var backpack = new Backpack(188);

            var items = [new Item('one', 50, 2), new Item('two', 43, 5), new Item('three', 9, 6), new Item('four', 31, 3)];
            var result = backpack.solve(items);

            assert.equal(result.value, 188);
            assert.deepEqual(result.solution.map(item => {
                return item.ref;
            }), ['one', 'two','two', 'two', 'three']);
            assert.deepEqual(result.solution.map(item => {
                return item.index;
            }), [0, 0, 1, 2, 0]);
        });

        it('should solve task with not enough space', () => {
            var backpack = new Backpack(1);

            var items = [new Item('one', 50, 2), new Item('two', 43, 5), new Item('three', 9, 6), new Item('four', 31, 3)];
            var result = backpack.solve(items);

            assert.equal(result.value, 0);
            assert.deepEqual(result.solution, []);
        });
    });
});
