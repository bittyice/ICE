
// @ts-ignore
import ChinaArea from './ChinaArea.json';

export type AreaType = {
    name: string,
    isDirect?: boolean,
    children?: Array<AreaType>
}

class Helper {
    areas: Array<AreaType> = ChinaArea;

    // 获取省市区
    getPCAForNames(arr: Array<string>): Array<string | null> {
        if (arr.length == 0) {
            return [null, null, null];
        }

        let province: AreaType | undefined = undefined;
        let city: AreaType | undefined = undefined;
        let town: AreaType | undefined = undefined;

        let curAreas = this.areas;
        province = this.areas.find(e => e.name == arr[0]);
        if (!province) {
            return [null, null, null];
        }

        if (arr.length == 1) {
            return [province.name, null, null];
        }

        if (arr.length == 2) {
            if (province.isDirect == true) {
                town = province.children!.find(e => e.name == arr[1]);
                return [province.name, null, town?.name || null]
            }
            else {
                city = province.children!.find(e => e.name == arr[1]);
                return [province.name, city?.name || null, null]
            }
        }

        city = province.children!.find(e => e.name == arr[1]);
        if (!city) {
            return [province.name, null, null];
        }

        town = city.children!.find(e => e.name == arr[2]);

        return [province.name, city.name, town?.name || null];
    }
}

export default new Helper();