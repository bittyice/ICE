import React from 'react';

type Props = {
    className?: string,
    style?: React.CSSProperties,
    children?: React.ReactNode
}

export default class extends React.Component<Props> {
    colors = [
        // '#e6f7ff','#bae7ff','#91d5ff',
        // '#69c0ff', '#40a9ff', '#1890ff', '#096dd9',
        //#0050b3','#003a8c','#002766',
        // '#f0f5ff','#d6e4ff','#adc6ff',
        '#85a5ff', '#597ef7', '#2f54eb', '#1d39c4',
        //'#10239e','#061178','#030852',
        // 
        '#5cdbd3', '#36cfc9', '#13c2c2', '#08979c',
        //'#006d75','#00474f','#002329',
        //
        '#b37feb', '#9254de', '#722ed1', '#531dab',
        //'#391085','#22075e','#120338',
    ];

    datas: Array<{
        left: string,
        top: string,
        borderWidth: string,
        borderColor: string,
    }> = [];

    constructor(props: Props) {
        super(props);

        for (let n = 0; n < 6; n++) {
            let border = 100 + Math.random() * 200;
            let borderColors = ['transparent', 'transparent', 'transparent', 'transparent'];
            borderColors[n % 4] = this.randomHexColor();

            this.datas.push({
                left: `${Math.random() * 50}%`,
                top: `${Math.random() * 50}%`,
                borderWidth: `${border}px ${border}px ${border}px ${border}px`,
                borderColor: borderColors.join(' ')
            })
        }
    }

    randomHexColor() {
        return this.colors[parseInt(`${Math.random() * this.colors.length}`)] || this.colors[0];
    }

    render(): React.ReactNode {
        return <div className={this.props.className} style={{ position: 'relative', overflow: 'hidden', ...this.props.style }}>
            <div style={{ zIndex: 999, position: 'relative' }}>
                {this.props.children}
            </div>
            <div className='dynamicbackground-background' style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                backgroundColor: '#2f54eb',
                filter: 'blur(60px)',
                top: 0,
                left: 0,
                zIndex: 0
            }}>
                {
                    this.datas.map((item, index) => {
                        return <div style={{
                            position: 'absolute',
                            width: 0,
                            height: 0,
                            top: item.top,
                            left: item.left,
                            borderWidth: item.borderWidth,
                            borderStyle: 'solid',
                            borderColor: item.borderColor
                        }} />
                    })
                }
            </div>
        </div>
    }
}