import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuApi } from '@/api'
import type { Menu } from '@/api'

export const useMenuStore = defineStore('menu', () => {
  // State
  const menus = ref<Menu[]>([])
  const loading = ref(false)

  // Actions
  async function fetchMenus() {
    try {
      loading.value = true
      const response = await menuApi.getFrontendMenus()
      if (response.success) {
        menus.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    menus,
    loading,
    fetchMenus,
  }
})
