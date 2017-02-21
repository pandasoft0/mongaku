"use strict";

const fs = require("fs");
const path = require("path");

const options = require("./options");

const translationsMap = {};
const translationsDir = path.resolve(process.cwd(), options.translationsDir || "translations");
const defaultLocale = Object.keys(options.locales)[0] || "en";

for (const locale in options.locales) {
    if (locale === defaultLocale) {
        continue;
    }

    const file = path.resolve(translationsDir, locale, "messages.json");
    try {
        const { messages } = JSON.parse(fs.readFileSync(file, "utf8"));
        translationsMap[locale] = messages;
    } catch (e) {
        console.error(`Error loading translation locale: ${locale}.`);
    }
}

module.exports = lang => {
    const translations = translationsMap[lang] || {};

    return {
        lang,
        defaultLocale,
        translations,

        gettext(message) {
            const translation = translations[message];

            return translation && translation[1] ? translation[1] : message;
        },

        format(msg, fields) {
            return msg.replace(/%\((.*?)\)s/g, (all, name) => fields[name]);
        }
    };
};