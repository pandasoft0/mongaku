// @flow

const React = require("react");

import type {Context} from "../types.js";
const {childContextTypes} = require("../Wrapper.js");

type Props = {
    name: string,
    options: Array<{
        value: string,
        label: string,
    }>,
    value?: string | Array<string>,
    multi?: boolean,
    create?: boolean,
    clearable?: boolean,
    placeholder?: string,
    cache?: boolean,
    loadOptions?: (input: string) => Promise<*>,
    onChange?: (value: string | Array<string>) => void,
};

class SimpleSelect extends React.Component<Props> {
    handleChange(e: SyntheticInputEvent<HTMLSelectElement>) {
        if (!(e.target instanceof HTMLSelectElement)) {
            return;
        }

        const {multi, onChange} = this.props;
        let {value} = e.target;
        const {options} = e.target;

        if (multi) {
            value = Array.prototype.slice
                .call(options)
                .filter(option => option.selected)
                .map(option => option.value);
        }

        if (onChange) {
            onChange(value);
        }
    }

    render() {
        const {
            name,
            multi,
            options,
            value,
            clearable,
            placeholder,
        } = this.props;

        return (
            <select
                name={name}
                multiple={multi}
                value={value}
                onChange={e => this.handleChange(e)}
                className="form-control"
            >
                {clearable && !multi && <option value="">{placeholder}</option>}
                {options.map(({value, label}) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        );
    }
}

class MultiSelect extends React.Component<
    Props,
    {
        searchValue?: string,
        loading: boolean,
        options?: Array<{
            value: string,
            label: string,
        }>,
        error?: Error,
    },
> {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
        this.labelCache = {};
        if (props.cache) {
            this.queryCache = {};
        }
    }

    componentDidMount() {
        this.boundHandleBlur = (e: Event) => this.handleBlur(e);
        document.addEventListener("focusin", this.boundHandleBlur);
        document.addEventListener("click", this.boundHandleBlur);
    }

    componentWillUnmount() {
        document.removeEventListener("focusin", this.boundHandleBlur);
        document.removeEventListener("click", this.boundHandleBlur);
    }

    context: Context;
    control: ?HTMLElement;
    input: ?HTMLInputElement;
    boundHandleBlur: (e: Event) => void;
    labelCache: {
        [value: string]: string,
    };
    queryCache: {
        [query: string]: Array<{
            value: string,
            label: string,
        }>,
    };
    handleBlur(e: Event) {
        const {target} = e;
        const {searchValue} = this.state;

        if (
            searchValue !== undefined &&
            (!target ||
                (target instanceof Node &&
                    this.control &&
                    !this.control.contains(target) &&
                    document.documentElement &&
                    document.documentElement.contains(target)))
        ) {
            this.closeMenu();
        }
    }

    getNameByValue(value: string): string {
        if (this.labelCache[value]) {
            return this.labelCache[value];
        }

        const {options} = this.props;
        const result = options.find(option => option.value === value);

        if (result) {
            return result.label;
        }

        return value;
    }

    addValue(addedValue: string, addedLabel: string) {
        const {onChange, value} = this.props;
        if ((!value || Array.isArray(value)) && onChange) {
            this.labelCache[addedValue] = addedLabel;
            onChange(
                value
                    ? value.includes(addedValue)
                        ? value
                        : value.concat(addedValue)
                    : [addedValue],
            );
            this.clear();
            if (this.input) {
                this.input.focus();
            }
            this.handleInput("");
        }
    }

    removeValue(removedValue: string) {
        const {onChange, value} = this.props;
        if (value && Array.isArray(value) && onChange) {
            onChange(value.filter(value => value !== removedValue));
        }
    }

    clear() {
        if (this.input) {
            this.input.value = "";
        }
        this.setState({searchValue: ""});
    }

    getFilteredOptions() {
        const {value} = this.props;
        const {options} = this.state;

        if (!options) {
            return [];
        }

        return options.filter(
            option => !value || !value.includes(option.value),
        );
    }

    handleKey(e: SyntheticKeyboardEvent<HTMLInputElement>) {
        if (
            e.target instanceof HTMLInputElement &&
            (e.key === "Enter" || e.key === "Tab")
        ) {
            const {create} = this.props;
            const {searchValue} = this.state;
            const {value} = e.target;
            if (value) {
                const options = this.getFilteredOptions();
                if (options.length > 0) {
                    this.addValue(options[0].value, options[0].label);
                } else if (create && searchValue) {
                    this.addValue(searchValue, searchValue);
                }
                e.preventDefault();
            }
        }
    }

    handleInput(searchValue: string) {
        const {loadOptions, options} = this.props;

        this.setState({
            searchValue,
            error: undefined,
            options: undefined,
            loading: false,
        });

        if (searchValue === undefined) {
            return;
        }

        if (loadOptions) {
            if (this.queryCache && this.queryCache[searchValue]) {
                return this.setState({
                    options: this.queryCache[searchValue],
                });
            }

            this.setState({loading: true});

            loadOptions(searchValue)
                .then(options => {
                    if (this.state.searchValue === searchValue) {
                        this.queryCache[searchValue] = options;
                        this.setState({options, loading: false});
                    }
                })
                .catch(error => {
                    if (this.state.searchValue === searchValue) {
                        this.setState({error, loading: false});
                    }
                });
        } else {
            const search = new RegExp(
                latinize(searchValue)
                    .split("")
                    .map(char => (/\W/.test(char) ? `\\${char}` : char))
                    .join(".*"),
                "i",
            );

            this.setState({
                options: options.filter(option =>
                    search.test(latinize(option.label)),
                ),
            });
        }
    }

    closeMenu() {
        this.setState({searchValue: undefined});
    }

    renderMenu() {
        const {create} = this.props;
        const {searchValue, options, error} = this.state;
        const {gettext, format} = this.context;

        if (searchValue === undefined) {
            return null;
        }

        if (error) {
            return (
                <div style={{marginTop: "8px"}}>
                    <span className="label label-danger">
                        {gettext("Error loading options.")}
                    </span>
                </div>
            );
        }

        if (!options) {
            return (
                <div style={{marginTop: "8px"}}>
                    <span className="label label-default">
                        {gettext("Loading...")}
                    </span>
                </div>
            );
        }

        const filteredOptions = this.getFilteredOptions();

        if (filteredOptions.length === 0 && !create) {
            return (
                <div style={{marginTop: "8px"}}>
                    <span className="label label-default">
                        {gettext("No results found.")}
                    </span>
                </div>
            );
        }

        return (
            <ul
                className="dropdown-menu"
                style={{
                    display: "block",
                    position: "static",
                    width: "100%",
                    height: "150px",
                    overflow: "auto",
                    boxShadow: "none",
                    marginTop: "8px",
                }}
            >
                {filteredOptions.map((option, i) => (
                    <li
                        key={option.value}
                        className={i === 0 && searchValue ? "active" : ""}
                    >
                        <a
                            href="javascript: void(0)"
                            onClick={e => {
                                e.preventDefault();
                                this.addValue(option.value, option.label);
                            }}
                        >
                            {option.label}
                        </a>
                    </li>
                ))}
                {create &&
                    searchValue && (
                        <li
                            className={
                                filteredOptions.length === 0 ? "active" : ""
                            }
                        >
                            <a
                                href="javascript: void(0)"
                                onClick={e => {
                                    e.preventDefault();
                                    this.addValue(searchValue, searchValue);
                                }}
                            >
                                {format(gettext("Add %(value)s..."), {
                                    value: searchValue,
                                })}
                            </a>
                        </li>
                    )}
            </ul>
        );
    }

    renderValue() {
        const {name, value} = this.props;

        if (!value || !Array.isArray(value) || value.length === 0) {
            return null;
        }

        return (
            <div>
                {value.map(value => (
                    <span key={value}>
                        <input type="hidden" name={name} value={value} />
                        <button
                            type="button"
                            className="btn btn-default btn-xs"
                            onClick={() => this.removeValue(value)}
                            style={{marginTop: "8px"}}
                        >
                            <span
                                className="glyphicon glyphicon-remove"
                                aria-hidden="true"
                            />{" "}
                            {this.getNameByValue(value)}
                        </button>{" "}
                    </span>
                ))}
            </div>
        );
    }

    render() {
        const {placeholder} = this.props;

        return (
            <div
                ref={r => {
                    this.control = r;
                }}
            >
                <div>
                    <input
                        ref={r => {
                            this.input = r;
                        }}
                        type="text"
                        placeholder={placeholder}
                        className="form-control"
                        onKeyDown={e => this.handleKey(e)}
                        onInput={e => this.handleInput(e.target.value)}
                        onFocus={e => this.handleInput(e.target.value)}
                    />
                </div>
                {this.renderMenu()}
                {this.renderValue()}
            </div>
        );
    }
}

MultiSelect.contextTypes = childContextTypes;

class Select extends React.Component<
    Props,
    {
        value?: string | Array<string>,
    },
> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value:
                props.multi && !Array.isArray(props.value)
                    ? props.value
                        ? [props.value]
                        : []
                    : props.value,
        };
    }

    context: Context;
    handleChange(value: string | Array<string>) {
        this.setState({value});
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    }

    render() {
        const {multi, create, loadOptions, placeholder} = this.props;
        const {gettext} = this.context;
        let Selector = SimpleSelect;

        if (multi || create || loadOptions) {
            Selector = MultiSelect;
        }

        return (
            <Selector
                {...this.props}
                value={this.state.value}
                onChange={value => this.handleChange(value)}
                placeholder={placeholder || gettext("Select...")}
            />
        );
    }
}

Select.contextTypes = childContextTypes;

const latinize = str => str.replace(/[^A-Za-z0-9[\] ]/g, a => latinMap[a] || a);

// prettier-ignore
const latinMap = {
    "??": "A",
    "??": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "??": "A",
    "??": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "???": "A",
    "??": "A",
    "??": "A",
    "??": "A",
    "??": "A",
    "???": "A",
    "??": "A",
    "??": "A",
    "???": "A",
    "??": "A",
    "??": "A",
    "??": "A",
    "??": "A",
    "??": "A",
    "???": "A",
    "??": "A",
    "??": "A",
    "???": "AA",
    "??": "AE",
    "??": "AE",
    "??": "AE",
    "???": "AO",
    "???": "AU",
    "???": "AV",
    "???": "AV",
    "???": "AY",
    "???": "B",
    "???": "B",
    "??": "B",
    "???": "B",
    "??": "B",
    "??": "B",
    "??": "C",
    "??": "C",
    "??": "C",
    "???": "C",
    "??": "C",
    "??": "C",
    "??": "C",
    "??": "C",
    "??": "D",
    "???": "D",
    "???": "D",
    "???": "D",
    "???": "D",
    "??": "D",
    "???": "D",
    "??": "D",
    "??": "D",
    "??": "D",
    "??": "D",
    "??": "DZ",
    "??": "DZ",
    "??": "E",
    "??": "E",
    "??": "E",
    "??": "E",
    "???": "E",
    "??": "E",
    "???": "E",
    "???": "E",
    "???": "E",
    "???": "E",
    "???": "E",
    "???": "E",
    "??": "E",
    "??": "E",
    "???": "E",
    "??": "E",
    "??": "E",
    "???": "E",
    "??": "E",
    "??": "E",
    "???": "E",
    "???": "E",
    "??": "E",
    "??": "E",
    "???": "E",
    "???": "E",
    "???": "ET",
    "???": "F",
    "??": "F",
    "??": "G",
    "??": "G",
    "??": "G",
    "??": "G",
    "??": "G",
    "??": "G",
    "??": "G",
    "???": "G",
    "??": "G",
    "???": "H",
    "??": "H",
    "???": "H",
    "??": "H",
    "???": "H",
    "???": "H",
    "???": "H",
    "???": "H",
    "??": "H",
    "??": "I",
    "??": "I",
    "??": "I",
    "??": "I",
    "??": "I",
    "???": "I",
    "??": "I",
    "???": "I",
    "??": "I",
    "??": "I",
    "???": "I",
    "??": "I",
    "??": "I",
    "??": "I",
    "??": "I",
    "??": "I",
    "???": "I",
    "???": "D",
    "???": "F",
    "???": "G",
    "???": "R",
    "???": "S",
    "???": "T",
    "???": "IS",
    "??": "J",
    "??": "J",
    "???": "K",
    "??": "K",
    "??": "K",
    "???": "K",
    "???": "K",
    "???": "K",
    "??": "K",
    "???": "K",
    "???": "K",
    "???": "K",
    "??": "L",
    "??": "L",
    "??": "L",
    "??": "L",
    "???": "L",
    "???": "L",
    "???": "L",
    "???": "L",
    "???": "L",
    "???": "L",
    "??": "L",
    "???": "L",
    "??": "L",
    "??": "L",
    "??": "LJ",
    "???": "M",
    "???": "M",
    "???": "M",
    "???": "M",
    "??": "N",
    "??": "N",
    "??": "N",
    "???": "N",
    "???": "N",
    "???": "N",
    "??": "N",
    "??": "N",
    "???": "N",
    "??": "N",
    "??": "N",
    "??": "N",
    "??": "NJ",
    "??": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "???": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "???": "O",
    "??": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "???": "O",
    "??": "O",
    "???": "O",
    "???": "O",
    "??": "O",
    "???": "O",
    "???": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "??": "O",
    "???": "O",
    "???": "O",
    "??": "O",
    "??": "OI",
    "???": "OO",
    "??": "E",
    "??": "O",
    "??": "OU",
    "???": "P",
    "???": "P",
    "???": "P",
    "??": "P",
    "???": "P",
    "???": "P",
    "???": "P",
    "???": "Q",
    "???": "Q",
    "??": "R",
    "??": "R",
    "??": "R",
    "???": "R",
    "???": "R",
    "???": "R",
    "??": "R",
    "??": "R",
    "???": "R",
    "??": "R",
    "???": "R",
    "???": "C",
    "??": "E",
    "??": "S",
    "???": "S",
    "??": "S",
    "???": "S",
    "??": "S",
    "??": "S",
    "??": "S",
    "???": "S",
    "???": "S",
    "???": "S",
    "??": "T",
    "??": "T",
    "???": "T",
    "??": "T",
    "??": "T",
    "???": "T",
    "???": "T",
    "??": "T",
    "???": "T",
    "??": "T",
    "??": "T",
    "???": "A",
    "???": "L",
    "??": "M",
    "??": "V",
    "???": "TZ",
    "??": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "???": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "???": "U",
    "???": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "???": "U",
    "??": "U",
    "???": "U",
    "???": "U",
    "???": "U",
    "???": "U",
    "???": "U",
    "??": "U",
    "??": "U",
    "???": "U",
    "??": "U",
    "??": "U",
    "??": "U",
    "???": "U",
    "???": "U",
    "???": "V",
    "???": "V",
    "??": "V",
    "???": "V",
    "???": "VY",
    "???": "W",
    "??": "W",
    "???": "W",
    "???": "W",
    "???": "W",
    "???": "W",
    "???": "W",
    "???": "X",
    "???": "X",
    "??": "Y",
    "??": "Y",
    "??": "Y",
    "???": "Y",
    "???": "Y",
    "???": "Y",
    "??": "Y",
    "???": "Y",
    "???": "Y",
    "??": "Y",
    "??": "Y",
    "???": "Y",
    "??": "Z",
    "??": "Z",
    "???": "Z",
    "???": "Z",
    "??": "Z",
    "???": "Z",
    "??": "Z",
    "???": "Z",
    "??": "Z",
    "??": "IJ",
    "??": "OE",
    "???": "A",
    "???": "AE",
    "??": "B",
    "???": "B",
    "???": "C",
    "???": "D",
    "???": "E",
    "???": "F",
    "??": "G",
    "??": "G",
    "??": "H",
    "??": "I",
    "??": "R",
    "???": "J",
    "???": "K",
    "??": "L",
    "???": "L",
    "???": "M",
    "??": "N",
    "???": "O",
    "??": "OE",
    "???": "O",
    "???": "OU",
    "???": "P",
    "??": "R",
    "???": "N",
    "???": "R",
    "???": "S",
    "???": "T",
    "???": "E",
    "???": "R",
    "???": "U",
    "???": "V",
    "???": "W",
    "??": "Y",
    "???": "Z",
    "??": "a",
    "??": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "??": "a",
    "??": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "???": "a",
    "??": "a",
    "??": "a",
    "??": "a",
    "??": "a",
    "???": "a",
    "??": "a",
    "??": "a",
    "???": "a",
    "??": "a",
    "??": "a",
    "??": "a",
    "???": "a",
    "???": "a",
    "??": "a",
    "??": "a",
    "???": "a",
    "???": "a",
    "??": "a",
    "???": "aa",
    "??": "ae",
    "??": "ae",
    "??": "ae",
    "???": "ao",
    "???": "au",
    "???": "av",
    "???": "av",
    "???": "ay",
    "???": "b",
    "???": "b",
    "??": "b",
    "???": "b",
    "???": "b",
    "???": "b",
    "??": "b",
    "??": "b",
    "??": "o",
    "??": "c",
    "??": "c",
    "??": "c",
    "???": "c",
    "??": "c",
    "??": "c",
    "??": "c",
    "??": "c",
    "??": "c",
    "??": "d",
    "???": "d",
    "???": "d",
    "??": "d",
    "???": "d",
    "???": "d",
    "??": "d",
    "???": "d",
    "???": "d",
    "???": "d",
    "???": "d",
    "??": "d",
    "??": "d",
    "??": "d",
    "??": "i",
    "??": "j",
    "??": "j",
    "??": "j",
    "??": "dz",
    "??": "dz",
    "??": "e",
    "??": "e",
    "??": "e",
    "??": "e",
    "???": "e",
    "??": "e",
    "???": "e",
    "???": "e",
    "???": "e",
    "???": "e",
    "???": "e",
    "???": "e",
    "??": "e",
    "??": "e",
    "???": "e",
    "??": "e",
    "??": "e",
    "???": "e",
    "??": "e",
    "??": "e",
    "???": "e",
    "???": "e",
    "???": "e",
    "??": "e",
    "???": "e",
    "??": "e",
    "???": "e",
    "???": "e",
    "???": "et",
    "???": "f",
    "??": "f",
    "???": "f",
    "???": "f",
    "??": "g",
    "??": "g",
    "??": "g",
    "??": "g",
    "??": "g",
    "??": "g",
    "??": "g",
    "???": "g",
    "???": "g",
    "??": "g",
    "???": "h",
    "??": "h",
    "???": "h",
    "??": "h",
    "???": "h",
    "???": "h",
    "???": "h",
    "???": "h",
    "??": "h",
    "???": "h",
    "??": "h",
    "??": "hv",
    "??": "i",
    "??": "i",
    "??": "i",
    "??": "i",
    "??": "i",
    "???": "i",
    "???": "i",
    "??": "i",
    "??": "i",
    "???": "i",
    "??": "i",
    "??": "i",
    "??": "i",
    "???": "i",
    "??": "i",
    "??": "i",
    "???": "i",
    "???": "d",
    "???": "f",
    "???": "g",
    "???": "r",
    "???": "s",
    "???": "t",
    "???": "is",
    "??": "j",
    "??": "j",
    "??": "j",
    "??": "j",
    "???": "k",
    "??": "k",
    "??": "k",
    "???": "k",
    "???": "k",
    "???": "k",
    "??": "k",
    "???": "k",
    "???": "k",
    "???": "k",
    "???": "k",
    "??": "l",
    "??": "l",
    "??": "l",
    "??": "l",
    "??": "l",
    "???": "l",
    "??": "l",
    "???": "l",
    "???": "l",
    "???": "l",
    "???": "l",
    "???": "l",
    "??": "l",
    "??": "l",
    "???": "l",
    "??": "l",
    "??": "l",
    "??": "lj",
    "??": "s",
    "???": "s",
    "???": "s",
    "???": "s",
    "???": "m",
    "???": "m",
    "???": "m",
    "??": "m",
    "???": "m",
    "???": "m",
    "??": "n",
    "??": "n",
    "??": "n",
    "???": "n",
    "??": "n",
    "???": "n",
    "???": "n",
    "??": "n",
    "??": "n",
    "???": "n",
    "??": "n",
    "???": "n",
    "???": "n",
    "??": "n",
    "??": "n",
    "??": "nj",
    "??": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "???": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "???": "o",
    "??": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "??": "o",
    "???": "o",
    "???": "o",
    "???": "o",
    "??": "o",
    "???": "o",
    "???": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "??": "o",
    "???": "o",
    "???": "o",
    "??": "o",
    "??": "oi",
    "???": "oo",
    "??": "e",
    "???": "e",
    "??": "o",
    "???": "o",
    "??": "ou",
    "???": "p",
    "???": "p",
    "???": "p",
    "??": "p",
    "???": "p",
    "???": "p",
    "???": "p",
    "???": "p",
    "???": "p",
    "???": "q",
    "??": "q",
    "??": "q",
    "???": "q",
    "??": "r",
    "??": "r",
    "??": "r",
    "???": "r",
    "???": "r",
    "???": "r",
    "??": "r",
    "??": "r",
    "???": "r",
    "??": "r",
    "???": "r",
    "??": "r",
    "???": "r",
    "???": "r",
    "??": "r",
    "??": "r",
    "???": "c",
    "???": "c",
    "??": "e",
    "??": "r",
    "??": "s",
    "???": "s",
    "??": "s",
    "???": "s",
    "??": "s",
    "??": "s",
    "??": "s",
    "???": "s",
    "???": "s",
    "???": "s",
    "??": "s",
    "???": "s",
    "???": "s",
    "??": "s",
    "??": "g",
    "???": "o",
    "???": "o",
    "???": "u",
    "??": "t",
    "??": "t",
    "???": "t",
    "??": "t",
    "??": "t",
    "???": "t",
    "???": "t",
    "???": "t",
    "???": "t",
    "??": "t",
    "???": "t",
    "???": "t",
    "??": "t",
    "??": "t",
    "??": "t",
    "???": "th",
    "??": "a",
    "???": "ae",
    "??": "e",
    "???": "g",
    "??": "h",
    "??": "h",
    "??": "h",
    "???": "i",
    "??": "k",
    "???": "l",
    "??": "m",
    "??": "m",
    "???": "oe",
    "??": "r",
    "??": "r",
    "??": "r",
    "???": "r",
    "??": "t",
    "??": "v",
    "??": "w",
    "??": "y",
    "???": "tz",
    "??": "u",
    "??": "u",
    "??": "u",
    "??": "u",
    "???": "u",
    "??": "u",
    "??": "u",
    "??": "u",
    "??": "u",
    "??": "u",
    "???": "u",
    "???": "u",
    "??": "u",
    "??": "u",
    "??": "u",
    "???": "u",
    "??": "u",
    "???": "u",
    "???": "u",
    "???": "u",
    "???": "u",
    "???": "u",
    "??": "u",
    "??": "u",
    "???": "u",
    "??": "u",
    "???": "u",
    "??": "u",
    "??": "u",
    "???": "u",
    "???": "u",
    "???": "ue",
    "???": "um",
    "???": "v",
    "???": "v",
    "???": "v",
    "??": "v",
    "???": "v",
    "???": "v",
    "???": "v",
    "???": "vy",
    "???": "w",
    "??": "w",
    "???": "w",
    "???": "w",
    "???": "w",
    "???": "w",
    "???": "w",
    "???": "w",
    "???": "x",
    "???": "x",
    "???": "x",
    "??": "y",
    "??": "y",
    "??": "y",
    "???": "y",
    "???": "y",
    "???": "y",
    "??": "y",
    "???": "y",
    "???": "y",
    "??": "y",
    "???": "y",
    "??": "y",
    "???": "y",
    "??": "z",
    "??": "z",
    "???": "z",
    "??": "z",
    "???": "z",
    "??": "z",
    "???": "z",
    "??": "z",
    "???": "z",
    "???": "z",
    "???": "z",
    "??": "z",
    "??": "z",
    "??": "z",
    "???": "ff",
    "???": "ffi",
    "???": "ffl",
    "???": "fi",
    "???": "fl",
    "??": "ij",
    "??": "oe",
    "???": "st",
    "???": "a",
    "???": "e",
    "???": "i",
    "???": "j",
    "???": "o",
    "???": "r",
    "???": "u",
    "???": "v",
    "???": "x",
};
module.exports = Select;
