export default class ProductClassifyHelper {
    treeClassifys: Array<any>

    constructor(classifys: Array<any>) {
        let newClassifys = classifys.map(item => ({ ...item }));
        newClassifys.forEach(classify => {
            if (classify.parentId) {
                let parent = newClassifys.find(item => item.id == classify.parentId);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }

                    parent.children.push(classify);
                }
            }
        });
        this.treeClassifys = newClassifys.filter(e => !e.parentId);
    }
}