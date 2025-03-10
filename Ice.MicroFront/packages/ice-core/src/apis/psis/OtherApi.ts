import { iceFetch } from "ice-common";

type FeeAnalyseItemType = { orderTotal: number, skuTotal: number, feeTotal: number, feeTotalPaid: number };

class ApiEx {
    async getAllFeeAnalyseAsync(params: {
        startTime: string,
        endTime: string,
        isSettlement?: boolean | null,
    }) {
        return iceFetch<{
            purchase: FeeAnalyseItemType,
            purchaseReturn: FeeAnalyseItemType,
            sale: FeeAnalyseItemType,
            saleReturn: FeeAnalyseItemType
        }>('/api/psi/kanban-fee-analyse/fee-analyse', {
            method: 'GET',
            urlParams: params
        });
    }
}

export default new ApiEx();