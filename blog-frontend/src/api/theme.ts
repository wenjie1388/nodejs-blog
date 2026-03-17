import apiClient from '@/utils/http'

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
  // 获取所有主题
  getAll() {
    return apiClient.get<{ success: boolean; data: Theme[] }>('/themes')
  },

  // 获取默认主题
  getDefault() {
    return apiClient.get<{ success: boolean; data: Theme }>('/themes/default')
  },

  // 获取单个主题
  getById(id: number) {
    return apiClient.get<{ success: boolean; data: Theme }>(`/themes/${id}`)
  },
}
