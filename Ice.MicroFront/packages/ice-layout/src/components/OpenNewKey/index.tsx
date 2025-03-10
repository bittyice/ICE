import React from "react";

export default <T extends { open: boolean }>(Component: React.ComponentType<T>) => {
    return class extends React.Component<T> {
        state = {
            key: 0
        }
        shouldComponentUpdate(nextProps: Readonly<T>, nextState: Readonly<{}>, nextContext: any): boolean {
            if (nextProps.open == true && this.props.open == false) {
                this.setState({ key: this.state.key + 1 });
                return false;
            }
            return true;
        }
        render(): React.ReactNode {
            if (this.state.key === 0 && this.props.open === false) {
                return <></>;
            }
            return <Component key={this.state.key} {...this.props} />
        }
    }
}
