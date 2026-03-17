import apiClient from '@/utils/http'
import type { ListResponse, DataResponse } from '@/utils/http'

export interface Page {
  id: number
  title: string
  slug: string
  path: string
  status: 'draft' | 'published'
  description: string
  createdAt: string
  updatedAt: string
}

export interface PageListParams {
  page?: number
  limit?: number
  status?: string
  search?: string
}

export const pageApi = {
  getList(params: PageListParams = {}) {
    return apiClient.get<ListResponse<Page>>('/pages', { params })
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Page>>(`/pages/${id}`)
  },

  getBySlug(slug: string) {
    return apiClient.get<DataResponse<Page>>(`/pages/slug/${slug}`)
  },

  create(data: Partial<Page>) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/pages', data)
  },

  update(id: number, data: Partial<Page>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/pages/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/pages/${id}`)
  },
}
