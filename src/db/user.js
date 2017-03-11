var mongoose = require('mongoose');
var patcher = require('mongoose-json-patch');

var userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    passwordHash: String,
    salt: String
});

userSchema.plugin(patcher);

module.exports = mongoose.model('User', userSchema);
