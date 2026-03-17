import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

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
  getAll() {
    return apiClient.get<DataResponse<Category[]>>('/categories')
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Category>>(`/categories/${id}`)
  },

  create(data: Partial<Category>) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/categories', data)
  },

  update(id: number, data: Partial<Category>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/categories/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/categories/${id}`)
  },
}
