import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, HStack, View, Center, Button, Icon, ChevronLeftIcon } from 'native-base';
import { SvgXml } from 'react-native-svg';
import { useNavigate } from 'react-router-native';

type Props = {
    title: string,
    left?: React.ReactNode,
    right?: React.ReactNode,
}

class Header extends React.Component<Props &  {
    navigate: (url: any, option?: any) => void,
}> {
    // 头部不刷新，提升新能
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <Center
            style={styles.header}
            bg='blue.500'
            flexDirection='row'
        >
            <View style={styles.headerLeft}>
                {
                    this.props.left ?
                        this.props.left
                        : <TouchableOpacity
                            style={styles.GoBack}
                            onPress={() => {
                                this.props.navigate(-1);
                            }}
                            onFocus={() => {
                                return false;
                            }}
                        >
                            <ChevronLeftIcon size='8' color='light.200' />
                        </TouchableOpacity>
                }
            </View>
            <View position='absolute'><Text fontSize='lg' color='#fff'>{this.props.title}</Text></View>
            <View style={styles.headerRight}>{this.props.right}</View>
        </Center>
    }
}

const styles = StyleSheet.create({
    header: {
        height: 55,
        flexDirection: 'row'
    },
    headerLeft: {
        width: '50%',
        flexDirection: 'row'
    },
    headerRight: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    GoBack: {
        paddingLeft: 15,
        paddingRight: 15,
    }
});

export default (props: Props) => {
    const navigate = useNavigate();
    return <Header {...props} navigate={navigate} />
}