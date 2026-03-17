import apiClient from '@/utils/http'
import type { ListResponse, DataResponse } from '@/utils/http'

export interface Tag {
  id: number
  name: string
  slug: string
  color: string
  description: string | null
  articleCount: number
  status: 'active' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface TagListParams {
  page?: number
  limit?: number
  keyword?: string
  status?: string
}

export interface TagFormData {
  name: string
  color?: string
  description?: string
  status?: 'active' | 'disabled'
}

export const tagApi = {
  getList(params: TagListParams = {}) {
    return apiClient.get<ListResponse<Tag>>('/tags', { params })
  },

  getAll() {
    return apiClient.get<DataResponse<Tag[]>>('/tags/all')
  },

  getCloud(limit?: number) {
    return apiClient.get<DataResponse<Tag[]>>('/tags/cloud', { params: { limit } })
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Tag>>(`/tags/${id}`)
  },

  create(data: TagFormData) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/tags', data)
  },

  update(id: number, data: TagFormData) {
    return apiClient.put<DataResponse<{ message: string }>>(`/tags/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/tags/${id}`)
  },

  getArticles(id: number, params: { page?: number; limit?: number } = {}) {
    return apiClient.get<ListResponse<any>>(`/tags/${id}/articles`, { params })
  }
}
