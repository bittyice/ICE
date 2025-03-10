import React, { useEffect, useState, useRef } from "react";
import { Spin, Modal } from 'antd';
import { iceFetch } from 'ice-common';

type VerifyCodeType = {
    sign: string,
    base64: string,
    text: string
}
export default (props: {
    open: boolean,
    onCancel: () => void,
    onOk: (params: {
        sign: string,
        clickPositions: Array<{ x: number, y: number }>
    }) => void,
}) => {
    const [verifyCode, setVerifyCode] = useState<VerifyCodeType | null>(null);
    const [clickPositions, setClickPositions] = useState<Array<{ x: number, y: number }>>([]);
    const imgRef = useRef<HTMLImageElement | null>();

    const fetchVerifyCode = async () => {
        var result = await iceFetch<{
            sign: string,
            base64: string,
            text: string
        }>('/api/auth/account/verification-code');
        setVerifyCode(result);
    }

    const commit = () => {
        if (!verifyCode) {
            return;
        }

        let img = imgRef.current;
        if (!img) {
            return;
        }

        // 计算图片的真实宽度和实际显示的宽高比
        let hscale = img.naturalHeight / img.clientHeight;
        let wscale = img.naturalWidth / img.clientWidth;

        let curClickPositions = clickPositions.map(e => ({ x: e.x * wscale, y: e.y * hscale }));
        props.onOk({
            sign: verifyCode.sign,
            clickPositions: curClickPositions
        });
    }

    useEffect(() => {
        fetchVerifyCode();
    }, []);

    return <>
        <Modal
            title="验证"
            maskClosable={false}
            open={props.open}
            onCancel={props.onCancel}
            onOk={commit}
        >
            <Spin size='large' spinning={verifyCode == null}>
                <div>
                    <div className="mb-3 text-sky-500">请按顺序点击如下文本：{verifyCode?.text}</div>
                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        <img ref={r => imgRef.current = r} src={verifyCode?.base64} style={{ width: '100%' }}
                            onClick={(e) => {
                                let img = e.currentTarget;
                                let imageRect = img.getBoundingClientRect(); // 获取图片相对于视口的位置
                                let offsetX = e.clientX - imageRect.left;
                                let offsetY = e.clientY - imageRect.top;

                                let newclickPositions = [...clickPositions, { x: offsetX, y: offsetY }];
                                setClickPositions(newclickPositions);
                            }}
                        />
                        {
                            clickPositions.map(({ x, y }, index) => {
                                return <div key={index} style={{ position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>{index + 1}</div>
                            })
                        }
                    </div>
                </div>
            </Spin>
        </Modal>
    </>
}