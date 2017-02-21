// @flow

const React = require("react");

const utils = require("./utils");

import type {User, Options} from "./types.js";

class Wrapper extends React.Component {
    getChildContext() {
        const {originalUrl, user, options, i18n} = this.props;
        const {lang} = i18n;

        return {
            lang,
            gettext: (msg: string) => i18n.gettext(msg),
            user,
            options,
            originalUrl,
            utils: utils(lang, options),
        };
    }

    props: {
        originalUrl: string,
        user: User,
        options: Options,
        i18n: {
            lang: string,
            gettext: (text: string) => string,
        },
        children?: React.Element<*>,
    }

    render() {
        return this.props.children;
    }
}

Wrapper.childContextTypes = {
    lang: React.PropTypes.string,
    gettext: React.PropTypes.func,
    user: React.PropTypes.any,
    options: React.PropTypes.any,
    originalUrl: React.PropTypes.string,
    utils: React.PropTypes.any,
};

module.exports = Wrapper;
