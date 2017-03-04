// @flow

const React = require("react");
const ReactSelect = require("react-select");

type Props = {
    name: string,
    options: Array<{
        value: string,
        label: string,
    }>,
    value?: string | Array<string>,
    multi?: boolean,
    clearable?: boolean,
};

class Select extends React.Component {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }

    state: {
        value?: string | Array<string>,
    }
    props: Props

    render() {
        const Selector = this.props.multi ?
            ReactSelect.Creatable :
            ReactSelect;

        return <Selector
            {...this.props}
            onChange={(value) => this.setState({value})}
        />;
    }
}

module.exports = Select;
