import mongoose from 'mongoose';
import patcher from 'mongoose-json-patch';

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    passwordHash: String,
    salt: String
});

userSchema.plugin(patcher);

export default mongoose.model('User', userSchema);
