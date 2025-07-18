import type { Lead, LeadQueryParams, LeadListResponse, CreateLeadRequest, UpdateLeadRequest, FollowUpRecord } from '@/types/lead'
import { http } from '@/utils/request'

export const leadApi = {
  /**
   * 获取客资列表
   */
  getLeadList: async (params: LeadQueryParams): Promise<LeadListResponse> => {
    const response = await http.get<LeadListResponse>('/leads', { params })
    return response
  },

  /**
   * 获取客资详情
   */
  getLead: async (id: string): Promise<Lead> => {
    const response = await http.get<Lead>(`/leads/${id}`)
    return response
  },

  /**
   * 创建客资
   */
  createLead: async (data: CreateLeadRequest): Promise<Lead> => {
    const response = await http.post<Lead>('/leads', data)
    return response
  },

  /**
   * 更新客资
   */
  updateLead: async (id: string, data: UpdateLeadRequest): Promise<Lead> => {
    const response = await http.put<Lead>(`/leads/${id}`, data)
    return response
  },

  /**
   * 删除客资
   */
  deleteLead: async (id: string): Promise<void> => {
    await http.delete(`/leads/${id}`)
  },

  /**
   * 批量删除客资
   */
  batchDeleteLeads: async (ids: string[]): Promise<void> => {
    await http.delete('/leads/batch', { data: { ids } })
  },

  /**
   * 更新客资状态
   */
  updateLeadStatus: async (id: string, status: string): Promise<Lead> => {
    const response = await http.patch<Lead>(`/leads/${id}/status`, { status })
    return response
  },

  /**
   * 添加跟进记录
   */
  addFollowUpRecord: async (id: string, content: string): Promise<FollowUpRecord> => {
    const response = await http.post<FollowUpRecord>(`/leads/${id}/follow-up`, { content })
    return response
  },

  /**
   * 获取跟进记录列表
   */
  getFollowUpRecords: async (id: string): Promise<FollowUpRecord[]> => {
    const response = await http.get<FollowUpRecord[]>(`/leads/${id}/follow-up`)
    return response
  },

  /**
   * 导出客资数据
   */
  exportLeads: async (params: Partial<LeadQueryParams>): Promise<Blob> => {
    const response = await http.get('/leads/export', {
      params,
      responseType: 'blob',
    })
    return response
  },
} 