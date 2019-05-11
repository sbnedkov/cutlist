var mongoose = require('mongoose');
var patcher = require('mongoose-json-patch-upd');

var creationDate = require('./creation-date');

var projectSchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    name: String,
    planId: mongoose.Schema.ObjectId,
    resultId: mongoose.Schema.ObjectId,
    creation_date: creationDate,
    modification_date: {
        type: Number,
        default: Date.now()
    }
});

projectSchema.plugin(patcher);

module.exports = mongoose.model('Project', projectSchema);
