export interface Entity {
    id?: string
}

// ----------Auth----------
export interface TenantEntity extends Entity {
    amount: number,
    isActive: boolean,
    guestKey?: string,
    saler: string,
    creationTime: string,
}

export interface UserEntity extends Entity {
    tenantId?: string,
    lockoutEnd?: string,
    phoneNumberConfirmed?: boolean,
    phoneNumber?: string,
    emailConfirmed: boolean,
    normalizedEmail?: string,
    email?: string,
    normalizedUserName?: string,
    userName?: string,
    lockoutEnabled?: boolean,
    wxOpenId?: string,
}

export interface AmountAdjustEntity extends Entity {
    id?: string,
    oldAmount?: number,
    adjustFee?: number,
    type?: string,
    outerNumber?: string,
    remark?: string,
    creationTime?: string,
}

export interface OpenServiceEntity extends Entity {
    name?: string,
    expireDate?: string,
    openDate?: string,
}

export type AllowOpenServiceType = {
    key: string,
    name: string,
    fee: number,
    daynum: number,
    base?: string,
}

export interface CompanyEntity extends Entity {
    name?: string,
    contact?: string,
    phone?: string,
    province?: string,
    city?: string,
    town?: string,
    street?: string,
    addressDetail?: string,
    postcode?: string,
    extraInfo?: string,
}

export interface GuestBlacklistEntity extends Entity {
    ip?: string,
    creationTime?: string,
}
// ----------Auth----------


// ----------AI----------
export interface GptEntity extends Entity {
    chatWelcomeText?: string,
    qaWelcomeText?: string,
    contactBoxSpanTime?: number,
    clientNoResponseText?: string,
    clientNoResponseTime?: number,
    clientGuideQuestionText?: string,
    aiResponeCount?: number,
}

export type MessageRoleType = 'system' | 'user' | 'assistant' | 'customer-service';

export interface MessageItemType {
    role: MessageRoleType,
    content?: string | React.ReactNode,
    original?: string,
    href?: string,
    time?: string,
}

export interface QaAdditionalMetadata {
    href: string
}

export interface QAType extends Entity {
    id: string,
    question: string,
    answer: string,
    additionalMetadata: string | null,
    additionalMetadataObj?: QaAdditionalMetadata | null
};

export interface QuestionnaireEntity extends Entity {
    question?: string,
}

export interface QuestionnaireResultEntity extends Entity {
    id?: string,
    // 已 Json 数组格式存放
    questions?: string,
    // 已 Json 数组格式存放
    results?: string,
    chatRecords?: string,
    creationTime?: string,
    guestName?: string,
    phone?: string,
    email?: string,
    tagName?: string,
    ip?: string,
    province?: string,
}

export interface QaTagEntity extends Entity {
    id?: string,
    name?: string,
}

export interface CsTextEntity extends Entity {
    id?: string,
    groupName?: string,
    textList?: string,
}

export interface ClientEntity extends Entity {
    name?: string,
    phone?: string,
    email?: string,
    intention?: string,
    creationTime?: string,
}
// ----------AI----------


// ----------PSI----------
export interface AddressBookEntity extends Entity {
    id?: string,

    /// <summary>
    /// 名称
    /// </summary>
    name?: string,

    /// <summary>
    /// 联系人
    /// </summary>
    contact?: string,

    /// <summary>
    /// 联系电话
    /// </summary>
    contactNumber?: string,

    /// <summary>
    /// 所在省份
    /// </summary>
    province?: string,

    /// <summary>
    /// 城市
    /// </summary>
    city?: string,

    /// <summary>
    /// 区
    /// </summary>
    town?: string,

    /// <summary>
    /// 街道
    /// </summary>
    street?: string,

    /// <summary>
    /// 详细地址
    /// </summary>
    addressDetail?: string,

    /// <summary>
    /// 邮编
    /// </summary>
    postcode?: string,
}

export interface ClassifyEntity extends Entity {
    id?: string,

    name?: string,

    parentId?: string,
}

export interface ContractEntity extends Entity {
    id?: string,

    contractNumber?: string,

    contractName?: string,

    effectiveTime?: string,

    expiration?: string,

    appendixUrl?: string,

    extraInfo?: string,

    supplierId?: string,

    lastModificationTime?: string,

    creationTime?: string,
}

export interface ProductInfoEntity extends Entity {
    id?: string,
    // SKU
    sku?: string,
    // 产品名称
    name?: string,
    // 价格
    price?: number,
    // 单位（如件、箱、托等）
    unit?: string,

    volume?: number,

    volumeUnit?: string,

    weight?: number,

    weightUnit?: string,

    specification?: string,

    // 备注
    remark?: string,

    extraInfo?: string,

    brand?: string,

    classifyId?: string,

    unboxProducts?: Array<UnboxProductEntity>,
}

export interface UnboxProductEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    productInfoId?: string,
}

export interface PurchaseDetailEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    giveQuantity?: number,

    price?: number,

    remark?: string,
}

export interface PurchaseOrderEntity extends Entity {
    id?: string,

    orderNumber?: string,

    status?: number,

    price?: number,

    pricePaid?: number,

    isSettlement?: boolean,

    remark?: string,

    supplierId?: string,

    finishDate?: string,

    creationTime?: string,

    extraInfo?: string,

    details?: Array<PurchaseDetailEntity>
}

export interface QuoteEntity extends Entity {
    id?: string,

    sku?: string,

    price?: number,

    expiration?: string,

    supplierId?: string,

    lastModificationTime?: string,

    creationTime?: string,

    creatorId?: string,
}

export interface SaleDetailEntity extends Entity {
    id?: string,

    /// <summary>
    /// SKU
    /// </summary>
    sku?: string,

    /// <summary>
    /// 数量
    /// </summary>
    quantity?: number,

    /// <summary>
    /// 赠送数量（有时候买10箱会赠送1箱）
    /// </summary>
    giveQuantity?: number,

    /// <summary>
    /// 下单时单价
    /// </summary>
    placePrice?: number,
}

export interface SaleOrderEntity extends Entity {
    id?: string,

    /// <summary>
    /// 单号
    /// </summary>
    orderNumber?: string,

    /// <summary>
    /// 下单时价格
    /// </summary>
    placeTotalPrice?: number,

    /// <summary>
    /// 应支付金额
    /// </summary>
    totalPrice?: number,

    /// <summary>
    /// 已支付总价
    /// </summary>
    totalPricePaid?: number,

    /// <summary>
    /// 收货时间
    /// </summary>
    finishDate?: string,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,

    /// <summary>
    /// 驳回原因
    /// </summary>
    rejectReason?: string,

    /// <summary>
    /// 扩展信息（仅供前端使用）
    /// </summary>
    extraInfo?: string,

    /// <summary>
    /// 状态
    /// </summary>
    /// <see cref="SaleOrderStatus"/>
    status?: string,

    /// <summary>
    /// 是否结算
    /// </summary>
    isSettlement?: boolean,

    /// <summary>
    /// 销售员
    /// </summary>
    seller?: string,

    shopId?: string,

    creationTime?: string,

    shipInfo?: ShipInfoEntity,

    recvInfo?: RecvInfoEntity,

    details?: Array<SaleDetailEntity>,
}

export interface ShipInfoEntity extends Entity {
    /// <summary>
    /// 联系人
    /// </summary>
    contact?: string,

    /// <summary>
    /// 联系电话
    /// </summary>
    contactNumber?: string,

    /// <summary>
    /// 省份（退到哪里）
    /// </summary>
    province?: string,

    /// <summary>
    /// 城市
    /// </summary>
    city?: string,

    /// <summary>
    /// 区
    /// </summary>
    town?: string,

    /// <summary>
    /// 街道
    /// </summary>
    street?: string,

    /// <summary>
    /// 地址
    /// </summary>
    addressDetail?: string,

    /// <summary>
    /// 邮编
    /// </summary>
    postcode?: string,
}

export interface RecvInfoEntity extends Entity {
    /// <summary>
    /// 商户名
    /// </summary>
    businessName?: string,

    /// <summary>
    /// 联系人
    /// </summary>
    contact?: string,

    /// <summary>
    /// 联系电话
    /// </summary>
    contactNumber?: string,

    /// <summary>
    /// 省份（退到哪里）
    /// </summary>
    province?: string,

    /// <summary>
    /// 城市
    /// </summary>
    city?: string,

    /// <summary>
    /// 区
    /// </summary>
    town?: string,

    /// <summary>
    /// 街道
    /// </summary>
    street?: string,

    /// <summary>
    /// 地址
    /// </summary>
    addressDetail?: string,

    /// <summary>
    /// 邮编
    /// </summary>
    postcode?: string,
}

export interface PurchaseReturnDetailEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    price?: number,
}

export interface PurchaseReturnOrderEntity extends Entity {
    id?: string,

    orderNumber?: string,

    status: number,

    price?: number,

    isSettlement?: boolean,

    reason?: string,

    remark?: string,

    supplierId?: string,

    extraInfo?: string,

    finishDate?: string,

    creationTime?: string,

    details?: Array<PurchaseReturnDetailEntity>,
}

export interface SaleReturnDetailEntity extends Entity {
    id?: string,

    /// <summary>
    /// Sku
    /// </summary>
    sku?: string,

    /// <summary>
    /// 数量
    /// </summary>
    quantity?: number,

    /// <summary>
    /// 单价
    /// </summary>
    unitPrice?: number,
}

export interface SaleReturnOrderEntity extends Entity {
    id?: string,

    /// <summary>
    /// 订单号
    /// </summary>
    orderNumber?: string,

    /// <summary>
    /// 关联补货单号
    /// </summary>
    saleNumber?: string,

    /// <summary>
    /// 客户名称
    /// </summary>
    businessName?: string,

    /// <summary>
    /// 状态
    /// </summary>
    /// <see cref="SaleReturnOrderStatus"/>
    status?: string,

    /// <summary>
    /// 是否结算
    /// </summary>
    isSettlement?: boolean,

    /// <summary>
    /// 退货总金额
    /// </summary>
    totalPrice?: number,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,

    /// <summary>
    /// 驳回原因
    /// </summary>
    rejectReason?: string,

    /// <summary>
    /// 扩展信息
    /// </summary>
    extraInfo?: string,

    finishDate?: string,

    creationTime?: string,

    details?: Array<SaleReturnDetailEntity>,
}

export interface SupplierEntity extends Entity {
    id?: string,

    code?: string,

    name?: string,

    contact?: string,

    contactNumber?: string,

    email?: string,

    isActive?: boolean,

    extraInfo?: string,

    lastModificationTime?: string,

    lastModifierId?: string,

    creationTime?: string,
}
export interface ProductStockEntity extends Entity {
    sku?: string,
    stock?: number,
}
export interface PaymentMethodEntity extends Entity {
    name?: string,
    cardNumber?: string,
    describe?: string,
}
// ----------PSI----------



// ----------WMS----------
export interface AreaEntity extends Entity {
    id?: string,

    code?: string,

    lastCheckTime?: string,

    isActive?: boolean,

    allowSpecifications?: string,

    forbidSpecifications?: string,

    warehouseId?: string,

    tenantId?: string,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,
}

export interface InboundDetailEntity extends Entity {
    id?: string,

    /// <summary>
    /// SKU
    /// </summary>
    sku?: string,

    /// <summary>
    /// 预报数量
    /// </summary>
    forecastQuantity?: number,

    /// <summary>
    /// 实际数量
    /// </summary>
    actualQuantity?: number,

    /// <summary>
    /// 上架数量
    /// </summary>
    shelvesQuantity?: number,

    /// <summary>
    /// 过期时间
    /// </summary>
    shelfLise?: string,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,

    /// <summary>
    /// 商品总金额
    /// </summary>
    totalAmount?: number,

    inboundOrderId?: string,

    tenantId?: string,
}

export interface InboundOrderEntity extends Entity {
    id?: string,

    /// <summary>
    /// 入库单号
    /// </summary>
    inboundNumber?: string,

    /// <summary>
    /// 入库批次号
    /// </summary>
    inboundBatch?: string,

    /// <summary>
    /// 入库类型
    /// </summary>
    type?: number,

    /// <summary>
    /// 入库单状态
    /// </summary>
    status?: number,

    /// <summary>
    /// 仓库
    /// </summary>
    warehouseId?: string,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,

    tenantId?: string,

    extraInfo?: string,

    /// <summary>
    /// 其他信息
    /// </summary>
    otherInfo?: string,

    inboundDetails?: Array<InboundDetailEntity>,

    finishTime?: string,

    creationTime?: string,

    lastModificationTime?: string,

    isDeleted?: boolean,
}

export interface InventoryAlertEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    isActive?: boolean,

    warehouseId?: string,

    tenantId?: string,

    creationTime?: string,

    creatorId?: string,
}

export interface LocationDetailEntity extends Entity {
    id?: string,

    sku?: string,

    /// <summary>
    /// 入库批次号
    /// </summary>
    inboundBatch?: string,

    /// <summary>
    /// 数量
    /// </summary>
    quantity?: number,

    /// <summary>
    /// 过期时间
    /// </summary>
    shelfLise?: string,

    /// <summary>
    /// 是否冻结
    /// </summary>
    isFreeze?: boolean,

    locationId?: string,

    tenantId?: string,

    locationCode?: string,
}

export interface LocationEntity extends Entity {
    id?: string,

    code?: string,

    often?: boolean,

    tenantId?: string,

    areaId?: string,

    locationDetails?: Array<LocationDetailEntity>,
}

export interface LossReportDetailEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    lossReportOrderId?: string,
}

export interface LossReportOrderEntity extends Entity {
    id?: string,

    orderNumber?: string,

    status?: number,

    warehouseId?: string,

    extraInfo?: string,

    details?: Array<LossReportDetailEntity>,

    creationTime?: string,

    creatorId?: string,

    lastModifierId?: string,

    lastModificationTime?: string,

    deleterId?: string,

    deletionTime?: string,

    isDeleted?: boolean,
}

export interface OutboundDetailEntity extends Entity {
    id?: string,

    sku?: string,

    quantity?: number,

    /// <summary>
    /// 已分拣数量
    /// </summary>
    sortedQuantity?: number,

    /// <summary>
    /// 商品总金额
    /// </summary>
    totalAmount?: number,

    outboundOrderId?: string,

    tenantId?: string,
}

export interface OutboundOrderEntity extends Entity {
    id?: string,

    /// <summary>
    /// 出库单号
    /// </summary>
    outboundNumber?: string,

    /// <summary>
    /// 来源
    /// </summary>
    orderType?: string,

    /// <summary>
    /// 收件人
    /// </summary>
    recvContact?: string,

    /// <summary>
    /// 收件人电话
    /// </summary>
    recvContactNumber?: string,

    /// <summary>
    /// 省份
    /// </summary>
    recvProvince?: string,

    /// <summary>
    /// 市
    /// </summary>
    recvCity?: string,

    /// <summary>
    /// 区/县
    /// </summary>
    recvTown?: string,

    /// <summary>
    /// 街道
    /// </summary>
    recvStreet?: string,

    /// <summary>
    /// 详细地址
    /// </summary>
    recvAddressDetail?: string,

    /// <summary>
    /// 邮编
    /// </summary>
    recvPostcode?: string,

    /// <summary>
    /// 状态
    /// </summary>
    status?: number,

    /// <summary>
    /// 复核
    /// </summary>
    reviewed?: boolean,

    /// <summary>
    /// 仓库
    /// </summary>
    warehouseId?: string,

    /// <summary>
    /// 备注
    /// </summary>
    remark?: string,

    /// <summary>
    /// 拣货单ID
    /// </summary>
    pickListId?: string,

    /// <summary>
    /// 扩展信息
    /// </summary>
    extraInfo?: string,

    /// <summary>
    /// 其他信息
    /// </summary>
    otherInfo?: string,

    /// <summary>
    /// 是否已推送至TMS
    /// </summary>
    isPushTMS?: boolean,

    outboundDetails?: Array<OutboundDetailEntity>,

    finishTime?: string,

    creationTime?: string,

    pickListNumber?: string,
}

export interface PickListEntity extends Entity {
    id?: string,

    /// <summary>
    /// 拣货单号
    /// </summary>
    pickListNumber?: string,

    /// <summary>
    /// 包含订单数量
    /// </summary>
    orderCount?: number,

    /// <summary>
    /// 状态
    /// </summary>
    status?: number,

    /// <summary>
    /// 创建时间
    /// </summary>
    creationTime?: string,

    /// <summary>
    /// 所属仓库
    /// </summary>
    warehouseId?: string,
}

export interface StockChangeLogEntity extends Entity {
    /// <summary>
    /// ID
    /// </summary>
    id?: string,

    /// <summary>
    /// 关联ID
    /// </summary>
    relationId?: string,

    /// <summary>
    /// SKU
    /// </summary>
    sku?: string,

    /// <summary>
    /// 库位编码
    /// </summary>
    location?: string,

    /// <summary>
    /// 变更数量
    /// </summary>
    quantity?: number,

    /// <summary>
    /// 仓库
    /// </summary>
    warehouseId?: string,

    /// <summary>
    /// 创建时间
    /// </summary>
    creationTime?: string,
}

export interface TransferSkuEntity extends Entity {
    id?: string,

    /// <summary>
    /// SKU
    /// </summary>
    sku?: string,

    /// <summary>
    /// 入库批次号
    /// </summary>
    inboundBatch?: string,

    /// <summary>
    /// 数量
    /// </summary>
    quantity?: number,

    /// <summary>
    /// 过期时间
    /// </summary>
    shelfLise?: string,
}

export interface WarehouseCheckEntity extends Entity {
    id?: string,

    status?: string,

    executor?: string,

    checkStartTime?: string,

    checkFinishTime?: string,

    creationTime?: string,

    creatorId?: string,

    areaId?: string,

    tenantId?: string,
}

export interface WarehouseEntity extends Entity {
    id?: string,

    code?: string,

    name?: string,

    contactNumber?: string,

    /// <summary>
    /// 所在省份
    /// </summary>
    province?: string,

    /// <summary>
    /// 城市
    /// </summary>
    city?: string,

    /// <summary>
    /// 区
    /// </summary>
    town?: string,

    /// <summary>
    /// 街道
    /// </summary>
    street?: string,

    /// <summary>
    /// 详细地址
    /// </summary>
    addressDetail?: string,

    /// <summary>
    /// 邮编
    /// </summary>
    postcode?: string,

    remark?: string,

    isActive?: boolean,

    principal?: string,

    enableInboundBatch?: boolean,

    tenantId?: string,

    creationTime?: string,

    creatorId?: string,

    lastModifierId?: string,

    lastModificationTime?: string,
}

export interface WarehouseMessageEntity extends Entity {
    id?: string,

    title?: string,

    message?: string,

    readed?: boolean,

    readId?: string,

    warehouseId?: string,

    creationTime?: string,

    tenantId?: string,
}

export interface WarehouseTransferEntity extends Entity {
    id?: string,

    transferNumber?: string,

    originWarehouseId?: string,

    outboundOrderId?: string,

    destinationWarehouseId?: string,

    inboundOrderId?: string,

    tenantId?: string,

    creationTime?: string,

    creatorId?: string,

    outboundOrderNumber?: string,

    outboundOrderStatus?: number,

    inboundOrderNumber?: string,

    inboundOrderStatus?: number
}

export interface Delivery100Entity extends Entity {
    kuaidicom?: string,

    partnerId?: string,

    partnerKey?: string,

    partnerSecret?: string,

    partnerName?: string,

    net?: string,

    code?: string,

    checkMan?: string,

    payType?: string,

    expType?: string,

    isDefault?: boolean,

    isActive?: boolean,
}

export interface Delivery100ExpressOrderEntity extends Entity {
    /// <summary>
    /// 快递公司编码
    /// </summary>
    shipperCode?: string,

    /// <summary>
    /// 快递单号
    /// </summary>
    expressNumber?: string,

    /// <summary>
    /// 快递公司订单号
    /// </summary>
    shipperOrderNumber?: string,

    /// <summary>
    /// 订单号
    /// </summary>
    orderNumber?: string,

    /// <summary>
    /// 打印模板
    /// </summary>
    printTemplate?: string,

    /// <summary>
    /// 是否已取消
    /// </summary>
    isCancel?: boolean,

    /// <summary>
    /// 第三方信息（json 结构）
    /// </summary>
    tpInfo?: string,

    creationTime?: string,
}
// ----------WMS----------