var assert = require('assert');

var common = require('../src/common');
var Slate = common.Slate;
var Rectangle = common.Rectangle;
var Part = common.Part;
var Guillotine = require('../src/guillotine');

describe('Guillotine', () => {
    var guillotine = new Guillotine('v');
    describe('#apply()', () => {
        it('should return empty result for no parts', () => {
            var res = guillotine.apply(new Slate(new Rectangle(0, 0, 0, 0)), []);

            assert.equal(0, res.result.length);
            assert.equal(0, res.cuts.length);
        });
    });
});
