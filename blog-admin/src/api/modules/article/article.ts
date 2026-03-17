import apiClient from '@/utils/http'
import type { ListResponse, DataResponse } from '@/utils/http'

// 确保类型正确导出
export type { ListResponse, DataResponse }

export interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  coverImage: string 
  categoryId: number | null
  tags: string | null
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  createdAt: string
  updatedAt: string
  categoryName?: string
  authorName?: string
}

export interface ArticleListParams {
  page?: number
  limit?: number
  categoryId?: number
  status?: string
  search?: string
}

export const articleApi = {
  getList(params: ArticleListParams = {}) {
    return apiClient.get<ListResponse<Article>>('/articles', { params })
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Article>>(`/articles/${id}`)
  },

  create(data: Partial<Article>) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/articles', data)
  },

  update(id: number, data: Partial<Article>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/articles/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/articles/${id}`)
  },
}
