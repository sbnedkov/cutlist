import mongoose from 'mongoose';
import patcher from 'mongoose-json-patch';

import creationDate from './creation-date';

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
    creation_date: creationDate,
    modification_date: {
        type: Number,
        default: Date.now()
    }
});

resultSchema.plugin(patcher);

export default mongoose.model('Result', resultSchema);
