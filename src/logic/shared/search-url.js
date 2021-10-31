const qs = require("querystring");

const urls = require("../../lib/urls");
const queries = require("./queries");
const paramFilter = require("./param-filter");

const searchURL = (req, query, keepSecondary) => {
    const params = paramFilter(query, keepSecondary);
    const primary = params.primary;
    const type = query.type;
    const typeQueries = queries(type);
    let queryString = qs.stringify(params.all);
    let url = urls.gen(req.lang, `/${type}/search`);

    if (primary.length === 1 && typeQueries[primary[0]].url) {
        queryString = qs.stringify(params.secondary);
        url = typeQueries[primary[0]].url(query[primary[0]]);
        if (url.getURL) {
            url = url.getURL(req.lang);
        } else {
            url = urls.gen(req.lang, url);
        }
    }

    if (queryString) {
        const prefix = url.indexOf("?") >= 0 ? "&" : "?";
        queryString = `${prefix}${queryString}`;
    }

    return `${url}${queryString}`;
};

module.exports = searchURL;
