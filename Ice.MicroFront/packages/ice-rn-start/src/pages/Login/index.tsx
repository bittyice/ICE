import React from 'react';
import { BackHandler } from 'react-native';
import { View, Stack, Input, Icon, Checkbox, Radio, Button, Image, Text, Divider, theme, Center, Toast, Modal } from 'native-base';
import { SvgXml } from 'react-native-svg';
import { iceFetch, token } from 'ice-common';
//@ts-ignore
import config from '../../config.json';
import { enums } from 'ice-core';
//@ts-ignore
import LogoImg from '../../statics/logo.png';
import svgs from '../../statics/svgs';
import { useNavigate } from 'react-router-native';

class Login extends React.Component<{
    navigate: (url: any, options: any) => void,
}> {
    state = {
        loading: false,
        // 用户名
        username: '',
        // 密码
        password: '',
        // 租户
        tenant: undefined,
        // 是否需要升级PDA
        isNeedUpdatePda: false
    }

    componentDidMount() {
        if (token.token) {
            setTimeout(() => {
                this.props.navigate(`/back/home`, { replace: true });
            })
            return;
        }

        iceFetch<number>("/api/wms/other/min-pda-version").then((minversion) => {
            if (config.version < minversion) {
                this.setState({ isNeedUpdatePda: true });
            }
        });
    }

    onCommit = async () => {
        if (!this.state.username) {
            Toast.show({
                title: "请输入用户名"
            });
            return;
        }

        if (!this.state.password) {
            Toast.show({
                title: "请输入密码"
            });
            return;
        }

        this.setState({ loading: true });
        try {
            let tokenStr = await iceFetch<string>('/api/auth/account/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password
                })
            });
            token.setToken(tokenStr);
            if (token.userInfo.role == enums.IceRoleTypes.Admin && token.userInfo.scope?.some((e: any) => e == enums.IceResourceScopes.WMSScope) == true) {
                this.props.navigate(`/back/home`, { replace: true });
                return;
            }

            Toast.show({
                title: "当前用户不允许登录PDA"
            });
        }
        catch (ex: any) {
            Toast.show({
                title: ex.responseData?.error?.message
            });
        }
        this.setState({ loading: false });
    }

    render() {
        return <View>
            <Center shadow={3} bg="blue.500" p={12} justifyContent='center' alignItems='center'>
                <Image w={20} h={20} source={LogoImg} />
                <Text mt={3} color='#fff' fontSize={25} fontWeight='bold'>ICE WMS</Text>
            </Center>
            <Stack space={6} p={12} w="100%">
                <Input
                    InputLeftElement={
                        <Icon
                            as={<SvgXml width={30} height={30} xml={svgs.User} fill='#fff' />}
                            size={5}
                            ml="2"
                            color="muted.400"
                        />
                    }
                    placeholder='用户名'
                    value={this.state.username}
                    onChangeText={(text) => {
                        this.setState({ username: text });
                    }}
                />
                <Input
                    InputLeftElement={
                        <Icon
                            as={<SvgXml width={30} height={30} xml={svgs.Password} />}
                            size={5}
                            ml="2"
                            color="muted.400"
                        />
                    }
                    placeholder='密码'
                    value={this.state.password}
                    secureTextEntry
                    onChangeText={(text) => {
                        this.setState({ password: text });
                    }}
                />
                <Divider />
                <Button h={12} borderRadius={0} size='lg' isLoading={this.state.loading}
                    onPress={this.onCommit}
                >登录</Button>
            </Stack>
            <Modal isOpen={this.state.isNeedUpdatePda} size='md'>
                <Modal.Content maxH="212">
                    <Modal.CloseButton />
                    <Modal.Header>更新提醒</Modal.Header>
                    <Modal.Body>
                        你需要更新PDA才能继续使用
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                                BackHandler.exitApp();
                            }}>
                                确定
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </View>
    }
}

export default () => {
    const navigate = useNavigate();
    return <Login navigate={navigate} />
};