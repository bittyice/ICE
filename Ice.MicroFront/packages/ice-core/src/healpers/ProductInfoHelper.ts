import { ProductInfoEntity } from "../apis/Types";
import ProductInfoApi from "../apis/psis/ProductInfoApi";

class ProductInfoHelper {
    skuToProducts: {
        [k: string] : ProductInfoEntity | undefined
    } = {};

    fetchProducts(skus: Array<string>) {
        let requestSkus: Array<string> = [];

        skus.forEach(sku => {
            if (sku && !this.skuToProducts[sku]) {
                requestSkus.push(sku);
            }
        });

        if (requestSkus.length == 0) {
            return Promise.resolve();
        }

        return ProductInfoApi.getForSkus({
            skus: requestSkus,
        }).then(datas => {
            datas.forEach(item => {
                this.skuToProducts[item.sku!] = item;
            });

            return datas;
        })
    }

    clearProductInfo(sku: string) {
        this.skuToProducts[sku] = undefined;
    }

    // 翻译sku，消息格式：库位A-001的[sku编码]库存不足
    async translateSku(message: string) {
        let result = /\[(.+)\]/g.exec(message);
        if (!result) {
            return message;
        }

        let sku = result[1];
        await this.fetchProducts([sku]);
        let product = this.skuToProducts[sku];
        if (!product) {
            return message;
        }

        return message.replace(sku, product.name!);
    }

    // 检查产品规格
    async specCheck(sku: string, allowSpecsStr: string, forbidSpecsStr: string) : Promise<{
        allow: boolean,
        allowSpec?: string,
        forbidSpec?: string,
    }> {
        if(!allowSpecsStr && !forbidSpecsStr){
            return {
                allow: true,
            };
        }

        await this.fetchProducts([sku]);
        let productInfo = this.skuToProducts[sku];
        if (!productInfo) {
            return {
                allow: true,
            };
        }

        let allowSpecs = allowSpecsStr?.trim().split(' ') || [];
        let productSpecs: Array<string> = productInfo.specification ? productInfo.specification.trim().split(' ') : [];
        for (let productSpec of productSpecs) {
            // 如果产品有一个规格不在允许的规格内，则不提交
            if (!allowSpecs.some(e => e == productSpec)) {
                return {
                    allow: false,
                    allowSpec: productSpec
                };
            }
        }

        let forbidSpecs = forbidSpecsStr?.trim().split(' ') || [];
        for (let productSpec of productSpecs) {
            // 如果产品有一个规格在禁止的规格内，则不提交
            if (forbidSpecs.some(e => e == productSpec)) {
                return {
                    allow: false,
                    forbidSpec: productSpec
                };
            }
        }

        return {
            allow: true,
        };
    }
}

export default new ProductInfoHelper();