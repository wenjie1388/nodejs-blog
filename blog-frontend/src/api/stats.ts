import apiClient from '@/utils/http'

export interface PublicStats {
  articleCount: number
  categoryCount: number
  viewCount: number
  runningDays: number
}

export const statsApi = {
  // 获取公开统计信息
  getPublicStats() {
    return apiClient.get<{ success: boolean; data: PublicStats }>('/stats/public')
  },
}
