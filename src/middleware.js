module.exports = {
    setLanguage: setLanguage
};

function setLanguage (req, res, next) {
    req.i18n.setLocaleFromCookie(req);
    next();
}
