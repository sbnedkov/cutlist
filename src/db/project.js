import mongoose from 'mongoose';

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

export default mongoose.model('Project', projectSchema);
