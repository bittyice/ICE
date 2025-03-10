import React from 'react';
import { Upload } from 'antd';
import * as XLSX from 'xlsx';

export function exportXLSX(data: any, header?: string[], exportFileName?: string) {
    let sheet = XLSX.utils.json_to_sheet(data, {
        header: header
    });

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet);

    XLSX.writeFileXLSX(wb, exportFileName || 'export.xlsx');
}

export function importXLSX(f: File, onChange: (datas: Array<any>) => void) {
    //4.初始化新的文件读取对象，浏览器自带，不用导入
    var reader = new FileReader();
    //5.绑定FileReader对象读取文件对象时的触发方法
    reader.onload = (e: any) => {
        //7.获取文件二进制数据流
        var data = e.currentTarget.result;
        //8.利用XLSX解析二进制文件为xlsx对象
        var wb = XLSX.read(data, { type: 'binary' })
        //9.利用XLSX把wb第一个sheet转换成JSON对象
        //wb.SheetNames[0]是获取Sheets中第一个Sheet的名字
        //wb.Sheets[Sheet名]获取第一个Sheet的数据
        var j_data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
        //10.在终端输出查看结果
        onChange(j_data);
    }
    //6.使用reader对象以二进制读取文件对象f，
    reader.readAsBinaryString(f)
}

export default class extends React.Component<{
    onChange: (data: Array<any>) => void,
    children?: React.ReactNode | Array<React.ReactNode>
}> {
    render() {

        return <Upload
            beforeUpload={file => {
                importXLSX(file, this.props.onChange)
                return false;
            }}
            maxCount={1}
            showUploadList={false}
        >
            {this.props.children}
        </Upload>
    }
}