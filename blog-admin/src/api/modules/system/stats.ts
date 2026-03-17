import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

export interface DashboardStats {
  articles: {
    total: number
    published: number
    draft: number
    archived: number
  }
  views: {
    total: number
  }
  categories: {
    total: number
  }
  users: {
    total: number
    active: number
    disabled: number
  }
  recentArticles: Array<{
    id: number
    title: string
    status: string
    viewCount: number
    createdAt: string
    categoryName: string
  }>
  popularArticles: Array<{
    id: number
    title: string
    viewCount: number
    createdAt: string
    categoryName: string
  }>
}

export const statsApi = {
  getDashboard() {
    return apiClient.get<DataResponse<DashboardStats>>('/stats/dashboard')
  },

  getArticleTrend(days: number = 30) {
    return apiClient.get<DataResponse<Array<{ date: string; count: number }>>>('/stats/article-trend', {
      params: { days },
    })
  },

  getCategoryDistribution() {
    return apiClient.get<DataResponse<Array<{ name: string; count: number }>>>('/stats/category-distribution')
  },
}
