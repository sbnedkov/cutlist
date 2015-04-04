module.exports = {
    setLanguage: setLanguage
};

function setLanguage (req, res, next) {
    res.setLocale(global.lang);
    next();
}
