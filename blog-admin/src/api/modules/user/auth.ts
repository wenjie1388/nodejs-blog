import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

export interface LoginData {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  email: string
  role: string
  avatar: string | null
  nickname: string | null
}

export const authApi = {
  login(data: LoginData) {
    return apiClient.post<DataResponse<{ token: string; user: User }>>('/auth/login', data)
  },

  getMe() {
    return apiClient.get<DataResponse<{ user: User }>>('/auth/me')
  },

  changePassword(oldPassword: string, newPassword: string) {
    return apiClient.post<DataResponse<null>>('/auth/change-password', {
      oldPassword,
      newPassword,
    })
  },
}
