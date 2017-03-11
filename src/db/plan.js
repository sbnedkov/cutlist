var mongoose = require('mongoose');
var patcher = require('mongoose-json-patch');

var creationDate = require('./creation-date');

var planSchema = new mongoose.Schema({
    stocks: [{
        number: Number,
        width: Number,
        height: Number
    }],
    details: [{
        name: String,
        number: Number,
        width: Number,
        height: Number,
        rotate: Boolean,
        edgefl: Number,
        edgefs: Number,
        edgesl: Number,
        edgess: Number
    }],
    creation_date: creationDate,
    modification_date: {
        type: Number,
        default: Date.now()
    }
});

planSchema.plugin(patcher);

module.exports = mongoose.model('Plan', planSchema);
