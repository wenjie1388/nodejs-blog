import apiClient from '@/utils/http'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
  articleCount: number
  createdAt: string
  updatedAt: string
}

export const categoryApi = {
  // 获取所有分类
  getAll() {
    return apiClient.get<{ success: boolean; data: Category[] }>('/categories')
  },

  // 获取单个分类
  getById(id: number) {
    return apiClient.get<{ success: boolean; data: Category }>(`/categories/${id}`)
  },

  // 根据slug获取分类
  getBySlug(slug: string) {
    return apiClient.get<{ success: boolean; data: Category }>(`/categories/slug/${slug}`)
  },
}
