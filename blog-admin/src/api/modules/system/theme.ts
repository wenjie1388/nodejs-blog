import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

export interface Theme {
  id: number
  name: string
  key: string
  description: string | null
  config: {
    primaryColor?: string
    backgroundColor?: string
    accentColor?: string
  } | null
  isDefault: number
  createdAt: string
  updatedAt: string
}

export const themeApi = {
  getAll() {
    return apiClient.get<DataResponse<Theme[]>>('/themes')
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Theme>>(`/themes/${id}`)
  },

  create(data: Partial<Theme>) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/themes', data)
  },

  update(id: number, data: Partial<Theme>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/themes/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/themes/${id}`)
  },

  setDefault(id: number) {
    return apiClient.put<DataResponse<{ message: string }>>(`/themes/${id}/default`)
  },
}
