/**
 * 客资状态
 */
export enum LeadStatus {
  PENDING = 'pending',         // 未添加
  CLOSED = 'closed',           // 已成交
  UNRESPONSIVE = 'unresponsive', // 未回复
  LOST = 'lost',               // 已流失
  CONSIDERING = 'considering', // 考虑中
  FOLLOW_UP = 'follow_up',     // 周内给答复
}

/**
 * 客资来源渠道
 */
export enum LeadSource {
  XIAOHONGSHU = 'xiaohongshu', // 小红书
  DOUYIN = 'douyin',           // 抖音
  OTHERS = 'others',           // 其他
}

/**
 * 客资获取策略
 */
export enum LeadStrategy {
  NATURAL = 'natural',         // 自然引流
  COMMENT = 'comment',         // 评论截流
}

/**
 * 客资属性
 */
export enum LeadProperty {
  VALID = 'valid',             // 有效客资
  INVALID = 'invalid',         // 无效客资
  FAILED = 'failed',           // 添加失败
}

/**
 * 客资实体类型
 */
export interface Lead {
  id: string
  contactInfo: string          // 获客信息（微信/电话）
  source: LeadSource | string  // 获客渠道
  strategy: LeadStrategy | string // 获客策略
  postLink?: string           // 获客帖子链接
  keywords?: string           // 获客关键词
  property: LeadProperty | string // 引流获客属性
  commissionAmount: number    // 获客返佣金额
  managerName: string         // 产品经理
  managerId: string           // 产品经理ID
  status: LeadStatus | string  // 沟通反馈状态
  product?: string            // 成交产品
  dealAmount?: number         // 成交金额
  agentId?: string            // 关联代理ID
  agentName?: string          // 关联代理名称
  followUpRecords?: FollowUpRecord[] // 跟进记录
  createdAt: string
  updatedAt: string
}

/**
 * 跟进记录
 */
export interface FollowUpRecord {
  id: string
  content: string
  createdBy: string
  createdAt: string
}

/**
 * 客资查询参数
 */
export interface LeadQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  source?: LeadSource | string
  strategy?: LeadStrategy | string
  property?: LeadProperty | string
  status?: LeadStatus | string
  managerId?: string
  agentId?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 客资列表响应
 */
export interface LeadListResponse {
  total: number
  page: number
  pageSize: number
  data: Lead[]
}

/**
 * 创建客资请求
 */
export interface CreateLeadRequest {
  contactInfo: string
  source: LeadSource | string
  strategy?: LeadStrategy | string
  postLink?: string
  keywords?: string
  property: LeadProperty | string
  commissionAmount: number
  managerId: string
  managerName: string
  agentId?: string
  agentName?: string
  status?: LeadStatus | string
}

/**
 * 更新客资请求
 */
export interface UpdateLeadRequest {
  contactInfo?: string
  source?: LeadSource | string
  strategy?: LeadStrategy | string
  postLink?: string
  keywords?: string
  property?: LeadProperty | string
  commissionAmount?: number
  managerId?: string
  managerName?: string
  status?: LeadStatus | string
  product?: string
  dealAmount?: number
  agentId?: string
  agentName?: string
} 