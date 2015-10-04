require('source-map-support').install();

var assert = require('assert');

import {knapsack, Solver} from './solver';
import Item from './item';

describe('#knapsack()', () => {
    it('should return the correct discretization points', () => {
        var d = [2, 5];
        var D = 7;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 2, 5]);
    });

    it('should return the correct discretization points #2', () => {
        var d = [1, 5];
        var D = 7;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 1, 5, 6]);
    });

    it('should return the correct discretization points #3', () => {
        var d = [2, 2, 5];
        var D = 7;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 2, 4, 5]);
    });

    it('should return the correct discretization points #4', () => {
        var d = [1, 2, 3, 4];
        var D = 10;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return the correct discretization points #4', () => {
        var d = [1, 2, 4];
        var D = 10;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 1, 2, 3, 4, 5, 6, 7]);
    });

    it('should return the correct discretization points #5', () => {
        var d = [10, 20, 30, 40, 50];
        var D = 100;

        var result = knapsack(D, d);

        assert.deepEqual(result, [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]);
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
        */

        it('should solve simple task', () => {
            var solver = new Solver(100, 100);

            var items = [new Item('one', 10, 10), new Item('two', 20, 20), new Item('three', 30, 30), new Item('four', 40, 40), new Item('five', 50, 50)];
            solver.solveNew(items);
        });
        /*
        it('should solve real world task', () => {
            var solver = new Solver(2800, 2070);

            var items = [new Item('one', 353, 562, 2), new Item('two', 652, 500, 5), new Item('three', 232, 420, 5)];
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
