import React from 'react';
import ReactToPrint from 'react-to-print';

type Props = { printDatas: Array<React.ReactNode> };

export default class PrintDatas extends React.Component<Props> {
    printRef: any | null = null;
    btnRef: HTMLElement | null = null;
    reactToPrintRef: ReactToPrint | null = null;

    state = {
        renderPrint: false,
        needPrintDatas: [] as Array<React.ReactNode>
    }

    constructor(props: Props) {
        super(props);

        let needPrintDatas: Array<React.ReactNode> = []
        props.printDatas.forEach(item => {
            needPrintDatas.push(item);
            needPrintDatas.push(<div style={{ pageBreakBefore: 'always', marginBottom: '1mm' }} />);
        });
        if (needPrintDatas.length > 0) {
            needPrintDatas.pop();
        }
        this.state.needPrintDatas = needPrintDatas;
    }

    componentDidMount(): void {
        this.setState({ renderPrint: true });
    }

    print() {
        this.reactToPrintRef?.handleClick();
    }

    render(): React.ReactNode {
        return <>
            <div style={{ display: 'none' }}>
                <div ref={r => this.printRef = r}>
                    {this.state.needPrintDatas}
                </div>
            </div>
            {
                this.state.renderPrint &&
                <ReactToPrint
                    ref={r => this.reactToPrintRef = r}
                    content={() => this.printRef}
                    print={(frameElement) => {
                        frameElement.contentWindow?.print();
                        return Promise.resolve()
                    }}
                    onBeforePrint={() => {
                    }}
                    onAfterPrint={() => {
                    }}
                />
            }
        </>
    }
}