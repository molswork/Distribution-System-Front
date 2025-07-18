import type { Agent, AgentQueryParams, AgentListResponse, CreateAgentRequest, UpdateAgentRequest } from '@/types/agent'
import { http } from '@/utils/request'

export const agentApi = {
  /**
   * 获取代理列表
   */
  getAgentList: async (params: AgentQueryParams): Promise<AgentListResponse> => {
    const response = await http.get<AgentListResponse>('/agents', { params })
    return response
  },

  /**
   * 获取代理详情
   */
  getAgent: async (id: string): Promise<Agent> => {
    const response = await http.get<Agent>(`/agents/${id}`)
    return response
  },

  /**
   * 创建代理
   */
  createAgent: async (data: CreateAgentRequest): Promise<Agent> => {
    const response = await http.post<Agent>('/agents', data)
    return response
  },

  /**
   * 更新代理
   */
  updateAgent: async (id: string, data: UpdateAgentRequest): Promise<Agent> => {
    const response = await http.put<Agent>(`/agents/${id}`, data)
    return response
  },

  /**
   * 删除代理
   */
  deleteAgent: async (id: string): Promise<void> => {
    await http.delete(`/agents/${id}`)
  },

  /**
   * 批量删除代理
   */
  batchDeleteAgents: async (ids: string[]): Promise<void> => {
    await http.delete('/agents/batch', { data: { ids } })
  },

  /**
   * 更新代理状态
   */
  updateAgentStatus: async (id: string, status: string): Promise<Agent> => {
    const response = await http.patch<Agent>(`/agents/${id}/status`, { status })
    return response
  },

  /**
   * 获取代理业绩统计
   */
  getAgentPerformance: async (id: string, params?: { startDate?: string; endDate?: string }): Promise<any> => {
    const response = await http.get(`/agents/${id}/performance`, { params })
    return response
  },

  /**
   * 导出代理数据
   */
  exportAgents: async (params: Partial<AgentQueryParams>): Promise<Blob> => {
    const response = await http.get('/agents/export', {
      params,
      responseType: 'blob',
    })
    return response
  },
} 