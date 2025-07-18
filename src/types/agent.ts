/**
 * 代理状态
 */
export enum AgentStatus {
  PENDING = 'pending',    // 待审核
  ACTIVE = 'active',      // 活跃
  INACTIVE = 'inactive',  // 非活跃
  BLOCKED = 'blocked',    // 已封禁
}

/**
 * 代理属性分类
 */
export enum AgentCategory {
  A = 'A',  // 执行力强
  B = 'B',  // 被动催促
  C = 'C',  // 引导从事
  D = 'D',  // 沉默代理
}

/**
 * 代理级别
 */
export enum AgentLevel {
  SV1 = 'SV1',
  SV2 = 'SV2',
  SV3 = 'SV3',
  SV4 = 'SV4',
  SV5 = 'SV5',
  SV6 = 'SV6',
}

/**
 * 代理实体类型
 */
export interface Agent {
  id: string
  name: string
  phone: string
  wechatName: string
  addedDate: string
  isAdded: boolean
  isPosting: boolean
  isIntercept: boolean
  isAttracting: boolean
  isInGroup: boolean
  redBookAccount: string
  category: AgentCategory | string
  level: AgentLevel | string
  referrer: string
  referralCode: string
  notes: string
  status: AgentStatus | string
  createdAt: string
  updatedAt: string
}

/**
 * 代理查询参数
 */
export interface AgentQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: AgentStatus | string
  category?: AgentCategory | string
  level?: AgentLevel | string
  startDate?: string
  endDate?: string
  isAdded?: boolean
  isPosting?: boolean
  isIntercept?: boolean
  isAttracting?: boolean
  isInGroup?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 代理列表响应
 */
export interface AgentListResponse {
  total: number
  page: number
  pageSize: number
  data: Agent[]
}

/**
 * 创建代理请求
 */
export interface CreateAgentRequest {
  name: string
  phone: string
  wechatName: string
  isAdded?: boolean
  isPosting?: boolean
  isIntercept?: boolean
  isAttracting?: boolean
  isInGroup?: boolean
  redBookAccount?: string
  category?: AgentCategory | string
  level?: AgentLevel | string
  referrer?: string
  referralCode?: string
  notes?: string
}

/**
 * 更新代理请求
 */
export interface UpdateAgentRequest {
  name?: string
  phone?: string
  wechatName?: string
  isAdded?: boolean
  isPosting?: boolean
  isIntercept?: boolean
  isAttracting?: boolean
  isInGroup?: boolean
  redBookAccount?: string
  category?: AgentCategory | string
  level?: AgentLevel | string
  referrer?: string
  referralCode?: string
  notes?: string
  status?: AgentStatus | string
}

/**
 * 代理业绩统计
 */
export interface AgentPerformance {
  clientsTotal: number
  validClients: number
  invalidClients: number
  pendingClients: number
  closedDeals: number
  totalRevenue: number
  commission: number
  baseSalary: number
  performance: number
  periodStart: string
  periodEnd: string
} 