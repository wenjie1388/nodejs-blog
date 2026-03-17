import apiClient from '@/utils/http'
import type { DataResponse } from '@/utils/http'

export interface Menu {
  id: number
  name: string
  path: string
  icon: string | null
  target: '_self' | '_blank'
  parentId: number | null
  sortOrder: number
  isVisible: number
  children?: Menu[]
}

export const menuApi = {
  getAll() {
    return apiClient.get<DataResponse<Menu[]>>('/menus')
  },

  getById(id: number) {
    return apiClient.get<DataResponse<Menu>>(`/menus/${id}`)
  },

  create(data: Partial<Menu>) {
    return apiClient.post<DataResponse<{ id: number; message: string }>>('/menus', data)
  },

  update(id: number, data: Partial<Menu>) {
    return apiClient.put<DataResponse<{ message: string }>>(`/menus/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete<DataResponse<{ message: string }>>(`/menus/${id}`)
  },

  batchSort(items: { id: number; sortOrder: number; parentId: number | null }[]) {
    return apiClient.put<DataResponse<{ message: string }>>('/menus/sort/batch', { items })
  },
}
