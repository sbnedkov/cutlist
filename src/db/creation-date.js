module.exports = {
    type: Number,
    default: function () {
        if (!this.creation_date) {
            return Date.now();
        }

        return this.creation_date;
    }
};
