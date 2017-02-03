"use strict";

const React = require("react");

const DimensionFilter = require("./types/filter/Dimension.js");
const FixedStringFilter = require("./types/filter/FixedString.js");
const LocationFilter = require("./types/filter/Location.js");
const NameFilter = require("./types/filter/Name.js");
const YearRangeFilter = require("./types/filter/YearRange.js");

var babelPluginFlowReactPropTypes_proptype_ModelType = require("./types.js").babelPluginFlowReactPropTypes_proptype_ModelType || require("react").PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_Context = require("./types.js").babelPluginFlowReactPropTypes_proptype_Context || require("react").PropTypes.any;

const { childContextTypes } = require("./Wrapper.js");

const TypeFilter = ({
    value,
    allValues,
    typeSchema
}) => {
    const { searchName, name, multiple } = typeSchema;
    const searchField = searchName || name;

    if (typeSchema.type === "Dimension") {
        return React.createElement(DimensionFilter, {
            name: name,
            value: value,
            searchName: searchField,
            placeholder: typeSchema.placeholder,
            heightTitle: typeSchema.heightTitle,
            widthTitle: typeSchema.widthTitle
        });
    } else if (typeSchema.type === "FixedString") {
        const expectedValues = typeSchema.values || {};
        let values = Object.keys(expectedValues).map(id => ({
            id,
            name: expectedValues[id].name
        }));

        if (values.length === 0) {
            values = allValues.map(text => ({
                id: text,
                name: text
            }));
        }

        return React.createElement(FixedStringFilter, {
            name: name,
            value: value,
            values: values,
            searchName: searchField,
            placeholder: typeSchema.placeholder,
            title: typeSchema.title,
            multiple: multiple
        });
    } else if (typeSchema.type === "LinkedRecord") {
        return null;
    } else if (typeSchema.type === "Location") {
        return React.createElement(LocationFilter, {
            name: name,
            value: value,
            searchName: searchField,
            placeholder: typeSchema.placeholder,
            title: typeSchema.title
        });
    } else if (typeSchema.type === "Name") {
        return React.createElement(NameFilter, {
            name: name,
            value: value,
            values: allValues,
            searchName: searchField,
            placeholder: typeSchema.placeholder,
            title: typeSchema.title,
            multiple: multiple
        });
    } else if (typeSchema.type === "SimpleDate") {
        return null;
    } else if (typeSchema.type === "SimpleNumber") {
        return null;
    } else if (typeSchema.type === "SimpleString") {
        return null;
    } else if (typeSchema.type === "YearRange") {
        return React.createElement(YearRangeFilter, {
            name: name,
            value: value,
            searchName: searchField,
            placeholder: typeSchema.placeholder,
            title: typeSchema.title
        });
    }

    return null;
};

TypeFilter.propTypes = {
    value: require("react").PropTypes.any.isRequired,
    allValues: require("react").PropTypes.arrayOf(require("react").PropTypes.any).isRequired,
    typeSchema: babelPluginFlowReactPropTypes_proptype_ModelType
};
const Filters = ({ type, globalFacets, values }, { options }) => {
    const { model } = options.types[type];

    return React.createElement(
        "div",
        null,
        options.types[type].filters.map(type => {
            const typeSchema = model[type];

            const allValues = (globalFacets[type] || []).map(bucket => bucket.text).sort();

            return React.createElement(
                "div",
                { key: type },
                React.createElement(TypeFilter, {
                    value: values[type],
                    allValues: allValues,
                    typeSchema: typeSchema
                })
            );
        })
    );
};

Filters.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
Filters.contextTypes = childContextTypes;

const SourceFilter = ({
    values,
    sources
}, { gettext }) => React.createElement(
    "div",
    { className: "form-group" },
    React.createElement(
        "label",
        { htmlFor: "source", className: "control-label" },
        gettext("Source")
    ),
    React.createElement(
        "select",
        { name: "source", style: { width: "100%" },
            className: "form-control select2-select",
            defaultValue: values.source,
            "data-placeholder": gettext("Filter by source...")
        },
        sources && sources.map(source => React.createElement(
            "option",
            { value: source._id, key: source._id },
            source.name
        ))
    )
);

SourceFilter.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
SourceFilter.contextTypes = childContextTypes;

const SimilarityFilter = ({
    queries,
    values
}, { gettext, getTitle }) => {
    const similarity = queries.similar.filters;

    return React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
            "label",
            { htmlFor: "similar", className: "control-label" },
            gettext("Similarity")
        ),
        React.createElement(
            "select",
            { name: "similar", style: { width: "100%" },
                className: "form-control select2-select",
                defaultValue: values.similar
            },
            Object.keys(similarity).map(id => React.createElement(
                "option",
                { value: id, key: id },
                getTitle(similarity[id])
            ))
        )
    );
};

SimilarityFilter.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
SimilarityFilter.contextTypes = childContextTypes;

const ImageFilter = ({
    queries,
    values
}, { gettext, getTitle }) => {
    const images = queries.images.filters;

    return React.createElement(
        "div",
        { className: "form-group" },
        React.createElement(
            "label",
            { htmlFor: "imageFilter", className: "control-label" },
            gettext("Images")
        ),
        React.createElement(
            "select",
            { name: "imageFilter", style: { width: "100%" },
                className: "form-control select2-select",
                defaultValue: values.images,
                "data-placeholder": gettext("Filter by image...")
            },
            React.createElement(
                "option",
                { value: "" },
                gettext("Filter by image...")
            ),
            Object.keys(images).map(id => React.createElement(
                "option",
                { value: id, key: id },
                getTitle(images[id])
            ))
        )
    );
};

ImageFilter.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
ImageFilter.contextTypes = childContextTypes;

const Sorts = ({
    values,
    sorts
}, { gettext }) => React.createElement(
    "div",
    { className: "form-group" },
    React.createElement(
        "label",
        { htmlFor: "source", className: "control-label" },
        gettext("Sort")
    ),
    React.createElement(
        "select",
        { name: "sort", style: { width: "100%" },
            className: "form-control select2-select",
            defaultValue: values.sort
        },
        sorts && sorts.map(sort => React.createElement(
            "option",
            { value: sort.id, key: sort.id },
            sort.name
        ))
    )
);

Sorts.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
Sorts.contextTypes = childContextTypes;

const SearchForm = (props, { URL, lang, gettext, options }) => {
    const { type, values, sorts, sources } = props;
    const searchURL = URL(`/${type}/search`);
    const typeOptions = options.types[type];
    const placeholder = typeOptions.getSearchPlaceholder;
    const showImageFilter = typeOptions.hasImages || !typeOptions.requiresImages;

    return React.createElement(
        "form",
        { action: searchURL, method: "GET" },
        React.createElement("input", { type: "hidden", name: "lang", value: lang }),
        React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
                "label",
                { htmlFor: "filter", className: "control-label" },
                gettext("Query")
            ),
            React.createElement("input", { type: "search", name: "filter",
                placeholder: placeholder,
                defaultValue: values.filter,
                className: "form-control"
            })
        ),
        React.createElement(Filters, props),
        sources && sources.length > 1 && React.createElement(SourceFilter, props),
        typeOptions.hasImageSearch && React.createElement(SimilarityFilter, props),
        showImageFilter && React.createElement(ImageFilter, props),
        sorts && sorts.length > 0 && React.createElement(Sorts, props),
        React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("input", { type: "submit", value: gettext("Search"),
                className: "btn btn-primary"
            })
        )
    );
};

SearchForm.propTypes = {
    type: require("react").PropTypes.string.isRequired,
    total: require("react").PropTypes.number.isRequired,
    start: require("react").PropTypes.number,
    end: require("react").PropTypes.number,
    sources: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired,
        getURL: require("react").PropTypes.func.isRequired,
        getFullName: require("react").PropTypes.func.isRequired,
        getShortName: require("react").PropTypes.func.isRequired
    })),
    sorts: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        id: require("react").PropTypes.string.isRequired,
        name: require("react").PropTypes.string.isRequired
    })),
    records: require("react").PropTypes.arrayOf(require("react").PropTypes.shape({
        _id: require("react").PropTypes.string.isRequired,
        type: require("react").PropTypes.string.isRequired,
        url: require("react").PropTypes.string,
        getOriginalURL: require("react").PropTypes.func.isRequired,
        getThumbURL: require("react").PropTypes.func.isRequired,
        getTitle: require("react").PropTypes.func.isRequired,
        getSource: require("react").PropTypes.func.isRequired,
        getURL: require("react").PropTypes.func.isRequired
    })).isRequired,
    globalFacets: require("react").PropTypes.shape({}).isRequired,
    values: require("react").PropTypes.shape({}).isRequired,
    queries: require("react").PropTypes.shape({}).isRequired
};
SearchForm.contextTypes = childContextTypes;

module.exports = SearchForm;