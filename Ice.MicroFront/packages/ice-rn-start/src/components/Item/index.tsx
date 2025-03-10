import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, ScrollView, StyleProp, TouchableOpacity, TextInput } from 'react-native';
import { Text, View, Input, Button, Actionsheet, SearchIcon, Select } from 'native-base';

export type ItemInputProps = {
    text: string,
    iref?: (r: any) => void,
    onSubmitEditing?: () => void,
    onBlur?: () => void,
    autoFocus?: boolean
}

export const InputItem = (props: {
    value: string,
    onChange: (value: string) => void,
    inputRightElement?: React.ReactNode
} & ItemInputProps) => {
    return <View style={styles.ListItem}>
        <Text>{props.text}</Text>
        <TextInput ref={props.iref}
            style={styles.Input}
            autoFocus={props.autoFocus}
            onChangeText={(value) => {
                props.onChange(value);
            }}
            value={props.value}
            textAlign='right'
            placeholder={`请输入 ${props.text}`}
            selectTextOnFocus
            onSubmitEditing={props.onSubmitEditing}
            onBlur={props.onBlur}
        />
        <View>{props.inputRightElement}</View>
    </View>
}

const numRegex = /^(\-)?\d+(\.\d+)?$/;

export const InputNumberItem = (props: {
    value: number | null,
    onChange: (value: number | null) => void,
    min?: number,
    max?: number,
} & ItemInputProps) => {
    let [val, setVal] = useState(props.value?.toString());
    useEffect(() => {
        (props.value == null || props == undefined) ?
            setVal('')
            : setVal(`${props.value}`);
    }, [props.value]);

    return <View style={styles.ListItem}>
        <Text>{props.text}</Text>
        <TextInput
            ref={props.iref}
            style={styles.Input}
            autoFocus={props.autoFocus}
            onChangeText={(value) => {
                if (!value) {
                    props.onChange(null);
                }

                if (!numRegex.test(value)) {
                    setVal(value);
                    return;
                }

                let num = parseInt(value);
                if (props.min != undefined && num < props.min) {
                    setVal(props.min.toString());
                    props.onChange(props.min);
                    return;
                }

                if (props.max != undefined && num > props.max) {
                    setVal(props.max.toString());
                    props.onChange(props.max);
                    return;
                }

                setVal(value);
                props.onChange(parseInt(value));
            }}
            onBlur={() => {
                if (!val) {
                    props.onChange(null);
                    return;
                }

                if (!numRegex.test(val)) {
                    setVal(props.value?.toString());
                    return;
                }
            }}
            value={val}
            textAlign='right'
            placeholder={`请输入 ${props.text}`}
            selectTextOnFocus
            onSubmitEditing={props.onSubmitEditing}
        />
    </View>
}

export const InputSelect = (props: {
    values: Array<{ label: string, value: string }>,
    value: string,
    onChange: (value: string) => void,
} & ItemInputProps) => {
    const [open, setOpen] = useState(false);

    return <View style={styles.ListItem}>
        <Text>{props.text}</Text>
        <TextInput ref={props.iref}
            style={styles.Input}
            autoFocus={props.autoFocus}
            onChangeText={(value) => {
                props.onChange(value);
            }}
            value={props.value}
            textAlign='right'
            placeholder={`请输入 ${props.text}`}
            selectTextOnFocus
            onSubmitEditing={props.onSubmitEditing}
            onBlur={props.onBlur}
        />
        <TouchableOpacity onPress={() => setOpen(true)}><Text color='blue.500'>选择</Text></TouchableOpacity>
        <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
            <Actionsheet.Content>
                <ScrollView style={styles.ScrollView}>
                    {
                        props.values.map(e => <Actionsheet.Item key={e.value} onPress={() => {
                            props.onChange(e.value);
                            setOpen(false);
                        }}>{e.label}</Actionsheet.Item>)
                    }
                </ScrollView>
            </Actionsheet.Content>
        </Actionsheet>
    </View>
}

export const SelectItem = (props: {
    text: string,
    value: string | undefined,
    onChange: (item: string) => void,
    values: Array<{ label: string, value: string }>
}) => {
    const [open, setOpen] = useState(false);
    const showItem = props.values.find(e => e.value == props.value);

    return <View style={styles.ListItem}>
        <Text>{props.text}</Text>
        <Text style={styles.Input} flexGrow={1}>{showItem?.label}</Text>
        <TouchableOpacity onPress={() => setOpen(true)}><Text color='blue.500'>选择</Text></TouchableOpacity>
        <Actionsheet isOpen={open} onClose={() => setOpen(false)}>
            <Actionsheet.Content>
                <ScrollView style={styles.ScrollView}>
                    {
                        props.values.map(e => <Actionsheet.Item key={e.value} onPress={() => {
                            props.onChange(e.value);
                            setOpen(false);
                        }}>{e.label}</Actionsheet.Item>)
                    }
                </ScrollView>
            </Actionsheet.Content>
        </Actionsheet>
    </View>
}

export const LabelItem = (props: { label: string, value: string }) => {
    return <View style={[styles.ListItem, styles.ListItemPadding]}>
        <Text>{props.label}</Text>
        <Text ml={5}>{props.value}</Text>
    </View>
}

export const Item = (props: { children?: React.ReactNode, style?: ViewStyle }) => {
    return <View style={[styles.ListItem, styles.ListItemPadding, props.style]}>{props.children}</View>
}

const styles = StyleSheet.create({
    ListItem: {
        width: '100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 30,
        paddingRight: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        height: 46
    },
    ListItemPadding: {
        paddingBottom: 12,
        paddingTop: 12
    },
    Input: {
        color: '#1677ff',
        flexShrink: 1,
        flexGrow: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0
    },
    ScrollView: {
        width: '100%'
    }
});