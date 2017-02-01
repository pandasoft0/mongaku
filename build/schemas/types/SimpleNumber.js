"use strict";

const React = require("react");

const FixedStringDisplay = React.createFactory(require("../../views/types/view/FixedString.js"));
const FixedStringEdit = React.createFactory(require("../../views/types/edit/FixedString.js"));

const SimpleNumber = function (options) {
    this.options = options;
    /*
    name
    type
    searchName
    title(i18n)
    placeholder(i18n)
    recommended: Bool
    hidden: Bool
    */
};

SimpleNumber.prototype = {
    searchName() {
        return this.options.searchName || this.options.name;
    },

    value(query) {
        return query[this.searchName()];
    },

    fields(value) {
        return { [this.searchName()]: value };
    },

    renderView(value) {
        return FixedStringDisplay({
            name: this.options.name,
            type: this.options.type,
            value
        });
    },

    renderEdit(value) {
        return FixedStringEdit({
            name: this.options.name,
            type: this.options.type,
            value,
            hidden: this.options.hidden
        });
    },

    schema() {
        const type = {
            type: Number,
            es_indexed: true,
            recommended: !!this.options.recommended
        };

        return this.options.multiple ? [type] : type;
    }
};

module.exports = SimpleNumber;