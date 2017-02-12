// @flow

const React = require("react");

const {searchURL} = require("../../utils.js");

import type {Context} from "../../types.js";
const {childContextTypes} = require("../../Wrapper.js");

type NameType = {
    _id: string,
    name: string,
    pseudonym?: string,
};

type Props = {
    name: string,
    type: string,
    value: Array<NameType>,
};

const Pseudonym = ({
    type,
    nameObject,
}: {type: string, nameObject: NameType}, {lang}: Context) => {
    const pseudoURL = searchURL(lang, {
        filter: nameObject.pseudonym,
        type,
    });

    return <span>
        {" "}(<a href={pseudoURL}>{nameObject.pseudonym}</a>)
    </span>;
};

Pseudonym.contextTypes = childContextTypes;

const Name = ({
    name,
    type,
    nameObject,
}: Props & {nameObject: NameType}, {lang}: Context) => {
    const url = searchURL(lang, {
        [name]: nameObject.name,
        type,
    });

    return <span key={nameObject._id}>
        <a href={url}>{nameObject.name}</a>
        {name.pseudoynm && name.name !== name.pseudoynm && <Pseudonym
            type={type}
            nameObject={nameObject}
        />}
    </span>;
};

Name.contextTypes = childContextTypes;

const NameView = (props: Props) => {
    const {value} = props;
    return <div>
        {value.map((name) => <Name
            {...props}
            key={name._id}
            nameObject={name}
        />)}
    </div>;
};

module.exports = NameView;
