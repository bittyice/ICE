import React from 'react';

export default class extends React.Component<{
    style?: React.CSSProperties,
    tagStyle?: React.CSSProperties,
    text: React.ReactNode,
    children: React.ReactNode,
    isMust?: boolean
}> {
    render() {
        let style = this.props.style || {};
        let tagStyle = this.props.tagStyle || {};

        let child = this.props.children;

        return <div style={{ display: 'flex', alignItems: 'center', ...style }}>
            <span className={`${this.props.isMust ? 'must' : ''}`}
                style={{
                    lineHeight: '26px',
                    padding: "0px 10px",
                    display: 'inline-block',
                    flexShrink: 0,
                    marginRight: 5,
                    position: 'relative',
                    ...tagStyle
                }}
            >{this.props.text}</span>
            {child}
        </div>
    }
}