"use strict";

var i18n = require("i18n-abide");

var options = require("../lib/options");

var defaultLocale = Object.keys(options.locales)[0] || "en";

module.exports = function (app) {
    app.use(function (req, res, next) {
        // i18n-abide overwrites all the locals, so we need to save them
        // and restore them after it's done.
        res.tmpLocals = res.locals;
        next();
    });

    app.use(i18n.abide({
        supported_languages: Object.keys(options.locales),
        default_lang: defaultLocale,
        translation_directory: "translations",
        translation_type: "po"
    }));

    app.use(function (req, res, next) {
        // Restore the old local properties and methods
        Object.assign(res.locals, res.tmpLocals);

        /* istanbul ignore next */
        var host = req.headers["x-forwarded-host"] || req.get("host");
        var locale = options.usei18nSubdomain ?
        // Set the locale based upon the subdomain
        /^\w*/.exec(host)[0] :

        // Set the locale based upon the ?lang= query string
        req.query.lang;

        // Fall back to the default locale if one isn't given, or it's invalid
        if (!options.locales[locale]) {
            locale = defaultLocale;
        }

        res.locals.setLocale(locale);

        next();
    });
};