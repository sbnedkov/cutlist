var _ = require('lodash');

module.exports = {
    permute: function (arr, t, callback) {
        if (t.treshold) {
            t.treshold -= 1;

            if (arr.length <= 1) {
                return callback(arr);
            }

            var sub = arr.slice(1);
            var i;
            _.range(arr.length).map((i) => {
                this.permute(sub, t, (permutation) => {
                    if (permutation) {
                        var copy = permutation.slice(0);
                        copy.splice(i, 0, arr[0]);
                        callback(copy);
                    } else {
                        callback(false);
                    }
                });
            });
        } else {
            callback(false);
        }
    },
    rate: function (spares) {
        var sorted = _.sortBy(spares.slates, (spare) => {
            return spare.rect.w * spare.rect.h;
        }).reverse();

        var pow = 1;

        return _.foldl(sorted, (accum, el) => {
            var res = accum + Math.pow(el.rect.w * el.rect.h, pow);
            pow *= 0.5;
            return res;
        }, 0);
    }
};
