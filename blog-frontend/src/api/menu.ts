import apiClient from '@/utils/http'

export interface Menu {
  id: number
  name: string
  path: string
  icon: string | null
  target: '_self' | '_blank'
  parentId: number | null
  sortOrder: number
  isVisible: number
  children: Menu[]
}

export const menuApi = {
  // 获取前台菜单
  getFrontendMenus() {
    return apiClient.get<{ success: boolean; data: Menu[] }>('/menus/frontend')
  },
}
