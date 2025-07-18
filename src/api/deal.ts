import type { Deal, DealQueryParams, DealListResponse, CreateDealRequest, UpdateDealRequest, DealStatistics } from '@/types/deal'
import { http } from '@/utils/request'

export const dealApi = {
  /**
   * 获取成交列表
   */
  getDealList: async (params: DealQueryParams): Promise<DealListResponse> => {
    const response = await http.get<DealListResponse>('/deals', { params })
    return response
  },

  /**
   * 获取成交详情
   */
  getDeal: async (id: string): Promise<Deal> => {
    const response = await http.get<Deal>(`/deals/${id}`)
    return response
  },

  /**
   * 创建成交记录
   */
  createDeal: async (data: CreateDealRequest): Promise<Deal> => {
    const response = await http.post<Deal>('/deals', data)
    return response
  },

  /**
   * 更新成交记录
   */
  updateDeal: async (id: string, data: UpdateDealRequest): Promise<Deal> => {
    const response = await http.put<Deal>(`/deals/${id}`, data)
    return response
  },

  /**
   * 删除成交记录
   */
  deleteDeal: async (id: string): Promise<void> => {
    await http.delete(`/deals/${id}`)
  },

  /**
   * 批量删除成交记录
   */
  batchDeleteDeals: async (ids: string[]): Promise<void> => {
    await http.delete('/deals/batch', { data: { ids } })
  },

  /**
   * 更新成交状态
   */
  updateDealStatus: async (id: string, status: string): Promise<Deal> => {
    const response = await http.patch<Deal>(`/deals/${id}/status`, { status })
    return response
  },

  /**
   * 获取成交统计信息
   */
  getDealStatistics: async (params?: Partial<DealQueryParams>): Promise<DealStatistics> => {
    const response = await http.get<DealStatistics>('/deals/statistics', { params })
    return response
  },

  /**
   * 导出成交数据
   */
  exportDeals: async (params: Partial<DealQueryParams>): Promise<Blob> => {
    const response = await http.get('/deals/export', {
      params,
      responseType: 'blob',
    })
    return response
  },
} 