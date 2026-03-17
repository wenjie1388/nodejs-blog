import apiClient from '@/utils/http'
import type { ListResponse, DataResponse } from '@/utils/http'

export interface User {
  id: number
  username: string
  email: string
  nickname: string | null
  avatar: string | null
  role: 'admin' | 'user'
  status: 'active' | 'disabled'
  createdAt: string
  lastLogin: string | null
}

export interface UserListParams {
  page?: number
  limit?: number
  search?: string
}

export const userApi = {
  getList(params: UserListParams = {}) {
    return apiClient.get<ListResponse<User>>('/users', { params })
  },

  getById(id: number) {
    return apiClient.get<DataResponse<User>>(`/users/${id}`)
  },

  update(id: number, data: Partial<User>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/users/${id}`, data)
  },

  updateStatus(id: number, status: 'active' | 'disabled') {
    return apiClient.put<DataResponse<{ message: string }>>(`/users/${id}/status`, { status })
  },

  updateRole(id: number, role: 'admin' | 'user') {
    return apiClient.put<DataResponse<{ message: string }>>(`/users/${id}/role`, { role })
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/users/${id}`)
  },
}
