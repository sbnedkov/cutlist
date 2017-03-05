import mongoose from 'mongoose';
import patcher from 'mongoose-json-patch';

import creationDate from './creation-date';

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

export default mongoose.model('Project', projectSchema);
