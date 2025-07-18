/**
 * 成交状态
 */
export enum DealStatus {
  PENDING = 'pending',     // 待确认
  CONFIRMED = 'confirmed', // 已确认
  CANCELED = 'canceled',   // 已取消
  REFUNDED = 'refunded',   // 已退款
}

/**
 * 产品类型
 */
export enum ProductType {
  AI_COURSE = 'ai_course',     // AI课
  AI_EMPLOYMENT = 'ai_employment', // AI就业
  AI_TOOLS = 'ai_tools',     // AI工具
  OTHERS = 'others',       // 其他
}

/**
 * 成交实体类型
 */
export interface Deal {
  id: string
  productName: string       // 产品名称
  productType: ProductType | string // 产品类型
  amount: number            // 成交金额
  commissionAmount: number  // 代理提点金额
  clientId: string          // 客户ID（关联客资）
  clientName: string        // 客户名称
  agentId?: string          // 代理ID
  agentName?: string        // 代理名称
  managerId: string         // 产品经理ID
  managerName: string       // 产品经理名称
  dealDate: string          // 成交日期
  status: DealStatus | string // 成交状态
  paymentMethod?: string    // 支付方式
  remark?: string           // 备注
  createdAt: string
  updatedAt: string
}

/**
 * 成交查询参数
 */
export interface DealQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  productType?: ProductType | string
  status?: DealStatus | string
  managerId?: string
  agentId?: string
  clientId?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 成交列表响应
 */
export interface DealListResponse {
  total: number
  page: number
  pageSize: number
  data: Deal[]
}

/**
 * 创建成交请求
 */
export interface CreateDealRequest {
  productName: string
  productType: ProductType | string
  amount: number
  commissionAmount?: number
  clientId: string
  clientName: string
  agentId?: string
  agentName?: string
  managerId: string
  managerName: string
  dealDate: string
  status?: DealStatus | string
  paymentMethod?: string
  remark?: string
}

/**
 * 更新成交请求
 */
export interface UpdateDealRequest {
  productName?: string
  productType?: ProductType | string
  amount?: number
  commissionAmount?: number
  clientId?: string
  clientName?: string
  agentId?: string
  agentName?: string
  managerId?: string
  managerName?: string
  dealDate?: string
  status?: DealStatus | string
  paymentMethod?: string
  remark?: string
}

/**
 * 成交统计信息
 */
export interface DealStatistics {
  totalAmount: number
  totalCount: number
  totalCommission: number
  productBreakdown: {
    type: ProductType | string
    name: string
    count: number
    amount: number
    percentage: number
  }[]
  timeAnalysis: {
    period: string
    count: number
    amount: number
  }[]
} 