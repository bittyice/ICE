import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Modal, Text, Button } from 'native-base';

export class ConfirmDialogModel extends React.Component<{
    isOpen: boolean,
    title: string,
    message: string,
    onOk?: () => void,
    onCancel?: () => void,
}> {
    render() {
        return <Modal isOpen={this.props.isOpen} onClose={() => {
            this.setState({ isOpen: false });
        }}>
            <Modal.Content maxWidth="400px">
                <Modal.CloseButton />
                <Modal.Header>{this.props.title}</Modal.Header>
                <Modal.Body>
                    <Text>{this.props.message}</Text>
                </Modal.Body>
                <Modal.Footer>
                    {
                        this.props.onCancel ?
                            <Button
                                variant="ghost"
                                colorScheme="blueGray"
                                pl={5}
                                pr={5}
                                onPress={() => {
                                    this.setState({ isOpen: false });
                                    this.props.onCancel?.();
                                }}
                            >
                                取消
                            </Button>
                            : undefined
                    }
                    {
                        this.props.onOk ?
                            <Button
                                ml={3}
                                pl={5}
                                pr={5}
                                onPress={() => {
                                    this.setState({ isOpen: false });
                                    this.props.onOk?.();
                                }}
                            >
                                确认
                            </Button>
                            : undefined
                    }

                </Modal.Footer>
            </Modal.Content>
        </Modal>
    }
}

export default class extends React.Component<{
    title: string,
    message: string,
    btnText: string,
    btnSize?: 'lg' | 'md' | 'sm',
    onOk?: () => void,
    onCancel?: () => void,
    style?: ViewStyle
}> {
    state = {
        isOpen: false
    }

    render() {
        return <>
            <Button style={this.props.style} borderRadius={0} size={this.props.btnSize}
                onPress={() => {
                    this.setState({ isOpen: true });
                }}
            >{this.props.btnText}</Button>
            <ConfirmDialogModel 
                isOpen={this.state.isOpen}
                title={this.props.title}
                message={this.props.message}
                onOk={this.props.onOk ? () => {
                    this.setState({ isOpen: false });
                    this.props.onOk!();
                } : undefined}
                onCancel={() => {
                    this.setState({ isOpen: false });
                    this.props.onCancel?.();
                }}
            />
        </>
    }
}