import React from 'react';
import { TextStyle, StyleProp, View } from 'react-native';
import { Select } from 'native-base';

export default class extends React.Component<{
    selectedValue: string | undefined,
    onValueChange: (item: string) => void,
    datas: Array<{ label: string, value: string }>,
    style?: StyleProp<TextStyle>,
    placeholder?: string
}> {
    render() {
        return <View style={this.props.style}>
            <Select
                borderWidth='0'
                placeholder={this.props.placeholder}
                selectedValue={this.props.selectedValue}
                onValueChange={this.props.onValueChange}
                isFocused={false}
                isFocusVisible={false}
            >
                {
                    this.props.datas.map(item => (
                        <Select.Item label={item.label} value={item.value} />
                    ))
                }
            </Select>
        </View>
    }
}