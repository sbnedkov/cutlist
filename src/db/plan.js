import mongoose from 'mongoose';

import creationDate from './creation-date';

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

export default mongoose.model('Plan', planSchema);
