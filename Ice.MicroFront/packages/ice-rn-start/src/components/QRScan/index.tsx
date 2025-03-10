import React, { PureComponent } from 'react';
import { AppRegistry, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RNCamera } from 'react-native-camera';

export default class extends PureComponent<{
    show: boolean,
    onClose: () => void,
    onBarCodeRead: (data: string) => void,
}> {
    camera: RNCamera | null = null;

    render() {
        if (!this.props.show) {
            return <></>;
        }

        return (
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.camera}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    androidCameraPermissionOptions={{
                        title: '权限申请',
                        message: '我们需要你允许开启摄像头',
                        buttonPositive: '好的',
                        buttonNegative: '不了',
                    }}
                    androidRecordAudioPermissionOptions={{
                        title: '权限申请',
                        message: '我们需要你允许录音功能',
                        buttonPositive: '好的',
                        buttonNegative: '不了',
                    }}
                    // onGoogleVisionBarcodesDetected={({ barcodes }) => {
                    //     console.log(barcodes);
                    // }}
                    onBarCodeRead={(e) => {
                        this.props.onBarCodeRead(e.data)
                    }}
                />
                <TouchableOpacity style={styles.btn} onPress={this.props.onClose}>
                    <Text style={{ color: '#fff' }}>取消</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    camera: {
        width: '100%',
        height: '100%',
    },
    btn: {
        zIndex: 999,
        color: '#fff',
        position: 'absolute',
        backgroundColor: '#1677ff',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 100,
        paddingRight: 100,
        borderRadius: 30,
        bottom: 20
    }
})