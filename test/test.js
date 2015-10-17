require('source-map-support').install();

var assert = require('assert');

import {knapsack, Solver} from './solver';
import Item from './item';
import Strip from './strip';
import Width from './width';

describe('#knapsack()', () => {

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
    /*
    it('should report no intersection between empty sets', () => {
        var strip1 = new Strip();
        var strip2 = new Strip();

        assert.equal(false, strip1.intersects(strip2));
    });

    it('should report no intersection between non-intersecting strips', () => {
        var strip1 = new Strip(new Item('one', 10, 30));
        var strip2 = new Strip(new Item('two', 30, 40, true));

        assert.equal(false, strip1.intersects(strip2));
    });

    it('should report intersection between intersecting strips', () => {
        var strip1 = new Strip(new Item('one', 10, 30));
        var strip2 = new Strip(new Item('two', 30, 40, true));
        strip2.addH(new Item('one', 10, 10));

        assert.equal(true, strip1.intersects(strip2));
    });

    it('should report intersection between intersecting strips with indices', () => {
        var strip1 = new Strip(new Item('one', 10, 30, false, 1, 5));
        var strip2 = new Strip(new Item('two', 30, 40, true));
        strip2.addH(new Item('one', 10, 10, false, 1, 5));

        assert.equal(true, strip1.intersects(strip2));
    });

    it('should report no intersection between non-intersecting strips with indices', () => {
        var strip1 = new Strip(new Item('one', 10, 30, false, 1, 5));
        var strip2 = new Strip(new Item('two', 30, 40, true));
        strip2.addH(new Item('one', 10, 10, false, 1, 4));

        assert.equal(false, strip1.intersects(strip2));
    });
    */
});
