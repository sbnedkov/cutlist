var crypto = require('crypto');

module.exports = {
    passwordHash: function (password, salt) {
        var sha256 = crypto.createHash('sha256');
        var hash = sha256.update([password, ':', salt].join(''));
        return hash.digest('hex');
    }
};
