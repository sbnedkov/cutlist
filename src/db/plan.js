import mongoose from 'mongoose';

var planSchema = new mongoose.Schema({
    userId: mongoose.Schema.ObjectId,
    name: String,
    stocks: [{
        q: Number,
        w: Number,
        h: Number
    }],
    details: [{
        name: String,
        q: Number,
        w: Number,
        h: Number,
        canRotate: Boolean,
        edges: {
            l1: Number,
            s1: Number,
            l2: Number,
            s2: Number
        }
    }],
    creation_date: Date,
    modification_date: Date
});

export default mongoose.model('Plan', planSchema);
