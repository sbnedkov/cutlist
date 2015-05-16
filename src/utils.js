var _ = require('lodash');

module.exports = {
    permute: function (arr, callback) {
        if (arr.length <= 1) {
            return callback(arr);
        }

        var sub = arr.slice(1);
        var i;
        _.range(arr.length).map((i) => {
            this.permute(sub, (permutation) => {
                var copy = permutation.slice(0);
                copy.splice(i, 0, arr[0]);
                callback(copy);
            });
        });
    }
};
