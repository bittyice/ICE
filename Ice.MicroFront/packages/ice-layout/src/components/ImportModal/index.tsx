import React from 'react';
import { Modal, Upload, Button, Space, message, Tag, Input } from 'antd';
import { importXLSX } from '../ExcelFileButton';

export default class ImportModal extends React.Component<{
    onOk: (file: File) => void,
    templateUrl: string,
    otherContent?: React.ReactNode,
    children?: React.ReactNode | Array<React.ReactNode>
}> {
    state = {
        visible: false,
        modalKey: 0,
        file: null as (File | null),
    }

    render() {
        return <>
            <span
                onClick={() => {
                    this.setState({ visible: true, modalKey: this.state.modalKey + 1, file: null });
                }}
            >
                {this.props.children}
            </span>
            <Modal
                key={this.state.modalKey}
                title='导入'
                open={this.state.visible}
                onOk={() => {
                    if (!this.state.file) {
                        message.warning('请选择文件');
                        return;
                    }
                    
                    this.setState({ visible: false });
                    this.props.onOk(this.state.file);
                }}
                onCancel={() => {
                    this.setState({ visible: false });
                }}
                width={400}
            >
                <Space>
                    <Input
                        placeholder='请选择文件'
                        value={this.state.file?.name}
                        readOnly
                        addonBefore={
                            <Upload
                                beforeUpload={file => {
                                    this.setState({
                                        file: file
                                    });
                                    return false;
                                }}
                                maxCount={1}
                                showUploadList={false}
                            >
                                <a style={{ color: '#000' }} href='javascript:void(0)'>选择文件</a>
                            </Upload>
                        }
                    />
                    <Button
                        onClick={() => {
                            window.open(this.props.templateUrl);
                        }}
                    >下载模板</Button>
                </Space>
                {
                    this.props.otherContent
                }
            </Modal>
        </>
    }
}

export class ImportExcelModal extends React.Component<{
    onOk: (datas: Array<any>) => void,
    templateUrl: string,
    otherContent?: React.ReactNode,
    children?: React.ReactNode | Array<React.ReactNode>
}> {
    render(): React.ReactNode {
        return <ImportModal
            templateUrl={this.props.templateUrl}
            onOk={(file) => {
                importXLSX(file, this.props.onOk);
            }}
            otherContent={this.props.otherContent}
        >{this.props.children}</ImportModal>
    }
}