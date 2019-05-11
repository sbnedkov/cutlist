var mongoose = require('mongoose');
var patcher = require('mongoose-json-patch-upd');

var creationDate = require('./creation-date');

var resultSchema = new mongoose.Schema({
    arr: [{
        result: [{
            ref: String,
            x: Number,
            y: Number,
            item: {
                w: Number,
                h: Number
            },
            rotated: Boolean
        }],
        W: Number,
        L: Number
    }],
    wasteVsUsage: [{
        usage: String,
        area: String
    }],
    creation_date: creationDate,
    modification_date: {
        type: Number,
        default: Date.now()
    }
});

resultSchema.plugin(patcher);

module.exports = mongoose.model('Result', resultSchema);
