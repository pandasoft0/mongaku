// @flow

const React = require("react");

const Page = require("./Page.js");
const ImportResult = require("./ImportResult.js");
const {format, relativeDate, fixedDate} = require("./utils.js");

import type {Context} from "./types.js";
const {childContextTypes} = require("./Wrapper.js");

type Import = {
    _id: string,
    error?: string,
    fileName: string,
    getFilteredResults: () => ImportResults,
    getURL: (lang: string) => string,
    created: Date,
    modified: Date,
    state: string,
};

type ImportResults = {
    models: Array<Result>,
    unprocessed: Array<Result>,
    created: Array<Result>,
    changed: Array<Result>,
    deleted: Array<Result>,
    errors: Array<Result>,
    warnings: Array<Result>,
};

type ImageType = {
    _id: string,
    getOriginalURL: () => string,
    getScaledURL: () => string,
    getThumbURL: () => string,
};

type Result = {
    fileName: string,
    error?: string,
    model?: ImageType,
    warnings?: Array<string>,
};

type Props = {
    adminURL: string,
    batch: Import,
    batchError: (error: string) => string,
    batchState: (batch: Import) => string,
    expanded?: "models" | "unprocessed" | "created" | "changed" | "deleted" |
        "errors" | "warnings",
};

const ErrorResult = ({result, batchError}: Props & {result: Result}) => {
    if (!result.error) {
        return null;
    }

    return <li>
        {result.fileName}: {batchError(result.error || "")}
    </li>;
};

const WarningResult = ({result, batchError}: Props & {result: Result}) => {
    if (!result.warnings) {
        return null;
    }

    return <li>
        {result.fileName}:
        <ul>
            {result.warnings.map((warning) =>
                <li key={warning}>{batchError(warning)}</li>)}
        </ul>
    </li>;
};

const ModelResult = ({result: {model, fileName}}: {result: Result}) => {
    if (!model) {
        return null;
    }

    return <div className="img col-xs-6 col-sm-4 col-md-3">
        <div className="img-wrap">
            <a href={model.getOriginalURL()}>
                <img src={model.getThumbURL()}
                    className="img-responsive center-block"
                />
            </a>
        </div>
        <div className="details">
            <div className="wrap">{fileName}</div>
        </div>
    </div>;
};

const ImportImages = (props: Props, {lang, gettext}: Context) => {
    const {
        adminURL,
        batchError,
        batch,
        batchState,
    } = props;
    const title = format(gettext("Image Import: %(fileName)s"),
        {fileName: batch.fileName});
    const state = batch.state === "error" ?
        format(gettext("Error: %(error)s"),
            {error: batchError(batch.error || "")}) :
        batchState(batch);
    const uploadDate = format(gettext("Uploaded: %(date)s"),
        {date: fixedDate(lang, batch.created)});
    const lastUpdated = format(gettext("Last Updated: %(date)s"),
        {date: relativeDate(lang, batch.modified)});

    return <Page title={title}>
        <p><a href={adminURL} className="btn btn-primary">
            &laquo; {gettext("Return to Admin Page")}
        </a></p>

        <h1>{title}</h1>
        <p>{uploadDate}</p>
        <p><strong>{state}</strong></p>
        {batch.state !== "completed" &&
            batch.state !== "error" && <p>{lastUpdated}</p>}

        <ImportResult
            {...props}
            id="errors"
            title={gettext("Errors")}
            renderResult={(result, i) =>
                <ErrorResult {...props} result={result} key={i} />}
        />

        <ImportResult
            {...props}
            id="warnings"
            title={gettext("Warnings")}
            renderResult={(result, i) =>
                <WarningResult {...props} result={result} key={i} />}
        />

        <ImportResult
            {...props}
            id="models"
            title={gettext("Images")}
            renderResult={(result, i) =>
                <ModelResult {...props} result={result} key={i} />}
            numShow={8}
        />
    </Page>;
};

ImportImages.contextTypes = childContextTypes;

module.exports = ImportImages;
