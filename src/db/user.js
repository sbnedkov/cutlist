import mongoose from 'mongoose';

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    passwordHash: String,
    salt: String
});

export default mongoose.model('User', userSchema);
