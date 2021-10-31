"use strict";

const models = require("../../lib/models");
const metadata = require("../../lib/metadata");
const config = require("../../lib/config");
const options = require("../../lib/options");

const defaultSort = Object.keys(options.sorts)[0];

module.exports = Object.assign({
    start: {
        value: (fields) => parseFloat(fields.start),
        defaultValue: () => 0,
        secondary: true,
    },

    rows: {
        value: (fields) => parseFloat(fields.rows),
        defaultValue: () => parseFloat(config.DEFAULT_ROWS),
        secondary: true,
    },

    sort: {
        value: (fields) => fields.sort,
        defaultValue: () => defaultSort,
        secondary: true,
    },

    filter: {
        value: (fields) => fields.filter,
        defaultValue: () => "",
        searchTitle: (value, i18n) => i18n.format(
            i18n.gettext("Query: '%(query)s'"), {query: value}),
        filter: (value) => ({
            query_string: {
                query: value || "*",
                default_operator: "and",
            },
        }),
    },

    source: {
        value: (fields) => fields.source,
        defaultValue: () => undefined,
        searchTitle: (value, i18n) => models("Source").getSource(value)
            .getFullName(i18n.lang),
        url: (value) => models("Source").getSource(value),
        filter: (value) => ({
            match: {
                source: {
                    query: escape(value),
                    operator: "or",
                    zero_terms_query: "all",
                },
            },
        }),
    },

    similar: {
        filters: {
            any: {
                getTitle: (i18n) => i18n.gettext("Similar to Any Artwork"),
                match: () => ({
                    range: {
                        "similarArtworks.score": {
                            gte: 1,
                        },
                    },
                }),
            },

            external: {
                getTitle: (i18n) =>
                    i18n.gettext("Similar to an External Artwork"),
                match: () => {
                    const sourceIDs = models("Source").getSources()
                        .map((source) => source._id);
                    const should = sourceIDs.map((sourceID) => ({
                        bool: {
                            must: [
                                {
                                    match: {
                                        source: sourceID,
                                    },
                                },
                                {
                                    match: {
                                        "similarArtworks.source": {
                                            query: sourceIDs
                                                .filter((id) => id !== sourceID)
                                                .join(" "),
                                            operator: "or",
                                        },
                                    },
                                },
                            ],
                        },
                    }));

                    return {bool: {should}};
                },
            },

            internal: {
                getTitle: (i18n) =>
                    i18n.gettext("Similar to an Internal Artwork"),
                match: () => {
                    const sourceIDs = models("Source").getSources()
                        .map((source) => source._id);
                    const should = sourceIDs.map((sourceID) => ({
                        bool: {
                            must: [
                                {
                                    match: {
                                        source: sourceID,
                                    },
                                },
                                {
                                    match: {
                                        "similarArtworks.source": {
                                            query: sourceID,
                                            operator: "or",
                                        },
                                    },
                                },
                            ],
                        },
                    }));

                    return {bool: {should}};
                },
            },
        },
        value: (fields) => fields.similar,
        defaultValue: () => undefined,
        searchTitle(value, i18n) {
            return this.filters[value].getTitle(i18n);
        },
        filter(value) {
            return this.filters[value].match();
        },
    },
}, metadata.model);
