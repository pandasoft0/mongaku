"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var React = require("react");

var YearRange = require("./YearRange.js");

var NameFilter = React.createFactory(require("../../views/types/filter/Name.js"));
var NameDisplay = React.createFactory(require("../../views/types/view/Name.js"));
var NameEdit = React.createFactory(require("../../views/types/edit/Name.js"));

var Name = function Name(options) {
    this.options = options;
    /*
    name
    type
    searchName
    title(i18n)
    placeholder(i18n)
    multiple: Boolean
    */
};

Name.prototype = {
    searchName: function searchName() {
        return this.options.searchName || this.options.name;
    },
    value: function value(query) {
        return query[this.searchName()];
    },
    defaultValue: function defaultValue() {
        return "";
    },
    fields: function fields(value) {
        return _defineProperty({}, this.searchName(), value);
    },
    title: function title(i18n) {
        return this.options.title(i18n);
    },
    searchTitle: function searchTitle(value, i18n) {
        var title = this.options.title(i18n);
        return title + ": " + value;
    },
    filter: function filter(value, sanitize) {
        return {
            multi_match: {
                fields: [this.options.name + ".name"],
                query: sanitize(value),
                operator: "and",
                zero_terms_query: "all"
            }
        };
    },
    facet: function facet() {
        var _this = this;

        return _defineProperty({}, this.options.name, {
            title: function title(i18n) {
                return _this.options.title(i18n);
            },

            // TODO: Make the number of facets configurable
            facet: function facet() {
                return {
                    terms: {
                        field: _this.options.name + ".name.raw",
                        size: 50
                    }
                };
            },

            formatBuckets: function formatBuckets(buckets) {
                return buckets.map(function (bucket) {
                    return {
                        text: bucket.key,
                        count: bucket.doc_count,
                        url: _defineProperty({}, _this.options.name, bucket.key)
                    };
                });
            }
        });
    },
    renderFilter: function renderFilter(value, values, i18n) {
        return NameFilter({
            name: this.options.name,
            searchName: this.searchName(),
            placeholder: this.options.placeholder(i18n),
            title: this.options.title(i18n),
            value: value,
            values: values,
            multiple: this.options.multiple
        });
    },
    renderView: function renderView(value) {
        return NameDisplay({
            name: this.options.name,
            type: this.options.type,
            value: value,
            multiple: this.options.multiple
        });
    },
    renderEdit: function renderEdit(value, names) {
        return NameEdit({
            name: this.options.name,
            type: this.options.type,
            value: value,
            names: names,
            multiple: this.options.multiple
        });
    },
    schema: function schema(Schema) {
        var NameSchema = new Schema({
            // An ID for the name, computed from the original + name properties
            // before validation.
            _id: String,

            // The original string from which the rest of the values were
            // derived
            original: String,

            // The locale for the string (e.g. 'en', 'ja')
            locale: String,

            // Any sort of name parsing options
            settings: Schema.Types.Mixed,

            // The English form of the full artist's name
            name: {
                type: String,
                es_indexed: true,
                es_type: "string",
                // A raw name to use for building aggregations in Elasticsearch
                es_fields: {
                    name: { type: "string", index: "analyzed" },
                    raw: { type: "string", index: "not_analyzed" }
                },
                recommended: true
            },

            // Same but in ascii (for example: Hokushō becomes Hokushoo)
            ascii: String,

            // Same but with diacritics stripped (Hokushō becomes Hokusho)
            plain: { type: String, es_indexed: true },

            // The English form of the given name
            given: String,

            // The English form of the middle name
            middle: String,

            // The English form of the surname
            surname: String,

            // A number representing the generation of the artist
            generation: Number,

            // A pseudonym for the person
            pseudonym: { type: String, es_indexed: true },

            // Is the artist unknown/unattributed
            unknown: Boolean,

            // Is this artist part of a school
            school: Boolean,

            // Was this work done in the style of, or after, an artist
            after: Boolean,

            // Is this work attributed to an artist
            attributed: Boolean,

            // Date when the name was used
            dates: YearRange.prototype.schema(Schema)
        });

        // Dynamically generate the _id attribute
        NameSchema.pre("validate", function (next) {
            this._id = this.original || this.name;
            next();
        });

        return {
            type: [NameSchema],
            convert: function convert(obj) {
                return typeof obj === "string" ? { name: obj } : obj;
            }
        };
    }
};

module.exports = Name;