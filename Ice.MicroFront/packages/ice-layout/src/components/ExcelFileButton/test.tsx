// @ts-ignorets
import test from './test.xlsx';
import { importXLSX } from '.';

fetch(test).then(res => {
    return res.blob();
}).then(file => {
    importXLSX(new File([file], ''), (datas) => {
        console.log(JSON.stringify(datas));
        let mainTypes = [] as Array<any>;
        for (let data of datas) {
            if (!data['调整后种类']) {
                mainTypes.push({
                    name: data['种类'],
                    type: data['种类'],
                    children: [{
                        name: data['种类'],
                        type: data['种类'],
                        isManuallyAdded: data['是否人工添加'] || null,
                        // remark: data['调整后种类备注'] || null,
                    }]
                });
                continue;
            }

            let types = data['调整后种类'].split('\n');
            for (let type of types) {
                let arr = type.split('-');
                let mainTypeName = arr[0];
                let childTypeName = arr[1];
                let mainType = mainTypes.find(e => e.name == mainTypeName);
                if (!mainType) {
                    mainType = {
                        name: mainTypeName,
                        type: mainTypeName,
                        children: []
                    };
                    mainTypes.push(mainType);
                }

                let childType = mainType.children.find((e: any) => e.name == childTypeName);
                if (!childType) {
                    mainType.children.push({
                        name: childTypeName || mainTypeName,
                        type: childTypeName || mainTypeName,
                        isManuallyAdded: data['是否人工添加'] || null,
                        // remark: data['调整后种类备注'] || null,
                    });
                }
            }
        }

        console.log(JSON.stringify(mainTypes));
    })
});
