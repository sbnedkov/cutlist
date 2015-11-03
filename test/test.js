require('source-map-support').install();

var assert = require('assert');

import {knapsack} from './solver';
import Item from './item';
import Strip from './strip';
import Width from './width';

describe('Solver#knapsack()', () => {

    it('should return the correct discretization points with rotation #1', () => {
        var d = [new Item('one', 10, 30), new Item('two', 30, 40, true), new Item('three', 50, 50)].map(item => {
            return new Width(item);
        });
        var D = 100;

        var result = knapsack(D, d);

        assert.deepEqual(result.map(step => {
            return step.len;
        }), [0, 10, 30, 40, 50, 60, 80, 90]);
    });

    it('should return the correct discretization points with rotation #2', () => {
        var d = [new Item('one', 10, 50, true)].map(item => {
            return new Width(item);
        });
        var D = 100;

        var result = knapsack(D, d);

        assert.deepEqual(result.map(step => {
            return step.len;
        }), [0, 10, 50]);
    });

    it('should return the correct discretization points with rotation #3', () => {
        var d = [new Item('one', 1, 5, true), new Item('two', 30, 40, true), new Item('three', 50, 50)].map(item => {
            return new Width(item);
        });
        var D = 100;

        var result = knapsack(D, d);

        assert.deepEqual(result.map(step => {
            return step.len;
        }), [0, 1, 5, 30, 31, 35, 40, 41, 45, 50, 51, 55, 80, 81, 85, 90, 91, 95]);
    });
});

describe('Solver', () => {
    describe('#solve()', () => {
        /*
        it('should solve task with one items', () => {
            var solver = new Solver(100, 100);

            var items = [new Item('one', 50, 50)];
            solver.solveBinary(items);
        });

        it('should solve task with two items', () => {
            var solver = new Solver(100, 100);

            var items = [new Item('one', 50, 50), new Item('two', 50, 50)];
            solver.solveBinary(items);
        });

        it('should solve simple task', () => {
            var solver = new Solver(100, 100);

            var items = [new Item('one', 10, 10), new Item('two', 20, 20), new Item('three', 30, 30), new Item('four', 40, 40), new Item('five', 50, 50)];
            solver.solveNew(items);
        });

        it('should solve real world task', () => {
            var solver = new Solver(2800, 2070);

            var items = [new Item('one', 353, 562, true, 2), new Item('two', 652, 500, true, 5), new Item('three', 232, 420, true, 5)];
            var result = solver.solveNew(items);

            assert.equal(result.v, 2513972);
            assert.deepEqual(result.solution.map(item => {
                return item.ref;
            }), ['two', 'two','two', 'two', 'one', 'one', 'two', 'three', 'three', 'three', 'three', 'three']);
            assert.deepEqual(result.solution.map(item => {
                return item.index;
            }), [0, 1, 2, 3, 0, 1, 0, 1, 2, 3, 4]);
        });
        */
    });
});

describe('Strip', () => {
    describe('#intersect()', () => {
        it('should report no intersection between empty sets', () => {
            var strip1 = new Strip();
            var strip2 = new Strip();

            assert.equal(strip1.intersects(strip2), false);
        });

        it('should report no intersection between non-intersecting initial strips', () => {
            var strip1 = new Strip([new Item('one', 10, 30)]);
            var strip2 = new Strip([new Item('two', 30, 40, true)]);

            assert.equal(strip1.intersects(strip2), false);
        });

        it('should report intersection between intersecting initial strips', () => {
            var strip1 = new Strip([new Item('one', 10, 30)]);
            var strip2 = new Strip([new Item('one', 10, 10)]);

            assert.equal(strip1.intersects(strip2), true);
        });

        it('should report no intersection between non-intersecting initial strips with indices', () => {
            var strip1 = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            var strip2 = new Strip([new Item('two', 30, 40, true), new Item('one', 10, 10, false, 1, 4)]);

            assert.equal(strip1.intersects(strip2), false);
        });

        it('should report intersection between intersecting initial strips with indices', () => {
            var strip1 = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            var strip2 = new Strip([new Item('one', 10, 10, false, 1, 5)]);

            assert.equal(strip1.intersects(strip2), true);
        });

        it('should report no intersection between non-intersecting strips', () => {
            var strip1 = new Strip();
            var strip2 = new Strip();
            strip1.addItemH(new Item('one', 10, 30));
            strip2.addItemH(new Item('two', 30, 40, true));
            strip2.addItemH(new Item('three', 30, 40, true));

            assert.equal(strip1.intersects(strip2), false);
        });

        it('should report intersection between intersecting strips', () => {
            var strip1 = new Strip();
            var strip2 = new Strip();
            strip1.addItemH(new Item('one', 10, 30));
            strip2.addItemH(new Item('one', 10, 10));
            strip2.addItemH(new Item('two', 10, 10));

            assert.equal(strip1.intersects(strip2), true);
        });

        it('should report no intersection between non-intersecting strips with indices', () => {
            var strip1 = new Strip();
            var strip2 = new Strip();
            strip1.addItemH(new Item('one', 10, 30, false, 1, 5));
            strip2.addItemH(new Item('two', 30, 40, true));
            strip2.addItemH(new Item('one', 10, 10, false, 1, 4));

            assert.equal(strip1.intersects(strip2), false);
        });

        it('should report intersection between intersecting strips with indices', () => {
            var strip1 = new Strip();
            var strip2 = new Strip();
            strip1.addItemH(new Item('one', 10, 30, false, 1, 5));
            strip2.addItemH(new Item('one', 10, 10, false, 1, 5));
            strip2.addItemH(new Item('two', 10, 10, false, 1, 5));

            assert.equal(strip1.intersects(strip2), true);
        });
    });

    describe('#uses()', () => {
        it('should report no usage for initial strip', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.uses(new Item('two', 10, 30)), false);
        });

        it('should report no usage for initial strip with options', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5), new Item('two', 10, 30)]);
            assert.equal(strip.uses(new Item('two', 10, 30)), false);
        });

        it('should report usage for initial strip', () => {
            var strip = new Strip([new Item('one', 10, 30, false)]);
            assert.equal(strip.uses(new Item('one', 10, 30)), true);
        });

        it('should report usage for initial strip with options', () => {
            var strip = new Strip([new Item('one', 10, 30, false), new Item('one', 30, 10, false)]);
            assert.equal(strip.uses(new Item('one', 10, 30)), true);
        });

        it('should report no usage for initial strip with indices', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.uses(new Item('one', 10, 30, false)), false);
        });

        it('should report no usage for initial strip with indices with options', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5), new Item('one', 30, 10, false, 1, 5)]);
            assert.equal(strip.uses(new Item('one', 10, 30, false)), false);
        });

        it('should report usage for initial strip with indices', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.uses(new Item('one', 10, 30, false, 1, 5)), true);
        });

        it('should report usage for initial strip with indices with options', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5), new Item('one', 30, 10, false, 1, 5)]);
            assert.equal(strip.uses(new Item('one', 10, 30, false, 1, 5)), true);
        });

        it('should report no usage for strip', () => {
            var strip = new Strip();
            strip.addItemH(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.uses(new Item('two', 10, 30)), false);
        });

        it('should report usage for strip', () => {
            var strip = new Strip();
            strip.addItemH(new Item('one', 10, 30, false));
            assert.equal(strip.uses(new Item('one', 10, 30)), true);
        });

        it('should report no usage for strip with indices', () => {
            var strip = new Strip();
            strip.add(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.uses(new Item('one', 10, 30, false)), false);
        });

        it('should report usage for strip with indices', () => {
            var strip = new Strip();
            strip.add(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.uses(new Item('one', 10, 30, false, 1, 5)), true);
        });
    });

    describe('#weakUses()', () => {
        it('should report no usage for initial strip', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.weakUses(new Item('two', 10, 30)), false);
        });

        it('should report usage for initial strip', () => {
            var strip = new Strip([new Item('one', 10, 30, false)]);
            assert.equal(strip.weakUses(new Item('one', 10, 30)), true);
        });

        it('should report no usage for initial strip with indices', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.weakUses(new Item('one', 10, 30, false)), false);
        });

        it('should report usage for initial strip with indices', () => {
            var strip = new Strip([new Item('one', 10, 30, false, 1, 5)]);
            assert.equal(strip.weakUses(new Item('one', 10, 30, false, 1, 5)), true);
        });

        it('should report no usage for strip', () => {
            var strip = new Strip();
            strip.addItemH(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.weakUses(new Item('two', 10, 30)), false);
        });

        it('should report usage for strip', () => {
            var strip = new Strip();
            strip.addItemH(new Item('one', 10, 30, false));
            assert.equal(strip.weakUses(new Item('one', 10, 30)), true);
        });

        it('should report no usage for strip with indices', () => {
            var strip = new Strip();
            strip.add(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.weakUses(new Item('one', 10, 30, false)), false);
        });

        it('should report usage for strip with indices', () => {
            var strip = new Strip();
            strip.add(new Item('one', 10, 30, false, 1, 5));
            assert.equal(strip.weakUses(new Item('one', 10, 30, false, 1, 5)), true);
        });
    });

    describe('#selectItem', () => {
        it('should pick maximal item', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1, item2]);
            var strip2 = new Strip();
            strip2.add(new Item('two', 20, 30));

            var strip = new Strip();

            assert.deepEqual(strip.selectItem(strip1, strip2, 0), item2);
        });

        it('should not pick anything if threshold too high', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1, item2]);
            var strip2 = new Strip();
            strip2.add(new Item('two', 20, 30));

            var strip = new Strip();

            assert.equal(strip.selectItem(strip1, strip2, 1e12), void 0);
        });

        it('should pick maximal non-present item', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1, item2]);
            var strip2 = new Strip();
            strip2.add(new Item('three', 40, 10));

            var strip = new Strip();

            assert.deepEqual(strip.selectItem(strip1, strip2, 0), item1);
        });

        it('should pick maximal item with empty other strip', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1, item2]);
            var strip2 = new Strip();

            var strip = new Strip();

            assert.deepEqual(strip.selectItem(strip1, strip2, 0), item2);
        });
    });


    describe('#findTwo', () => {
        it('should pick two maximal items', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1]);
            var strip2 = new Strip([item2]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 0), [item1, item2]);
        });

        it('should not pick anything if threshold too high', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('three', 40, 10);
            var strip1 = new Strip([item1]);
            var strip2 = new Strip([item2]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 1e12), []);
        });

        it('should pick two maximal items with more choices', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('two', 40, 10),
                item3 = new Item('three', 10, 10), item4 = new Item('four', 10, 10);
            var strip1 = new Strip([item1, item3]);
            var strip2 = new Strip([item2, item4]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 0), [item1, item2]);
        });

        it('should pick two maximal items with more choices and intersection', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('one', 30, 10),
                item3 = new Item('three', 10, 10), item4 = new Item('four', 20, 10);
            var strip1 = new Strip([item1, item3]);
            var strip2 = new Strip([item2, item4]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 0), [item1, item4]);
        });

        it('should pick two maximal items with more choices and intersection #2', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('two', 30, 10),
                item3 = new Item('three', 10, 50), item4 = new Item('three', 50, 10);
            var strip1 = new Strip([item1, item3]);
            var strip2 = new Strip([item2, item4]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 0), [item1, item4]);
        });

        it('should pick two maximal items with more choices where first items are not optimal', () => {
            var item1 = new Item('one', 10, 30), item2 = new Item('one', 30, 10),
                item3 = new Item('three', 50, 10), item4 = new Item('four', 60, 10);
            var strip1 = new Strip([item1, item3]);
            var strip2 = new Strip([item2, item4]);

            var strip = new Strip();

            assert.deepEqual(strip.findTwo(strip1, strip2, 0), [item3, item4]);
        });
    });
});
