import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import type { User } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const loading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function login(username: string, password: string) {
    try {
      loading.value = true
      const response = await authApi.login({ username, password })
      
      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('admin_token', response.data.token)
        localStorage.setItem('admin_user', JSON.stringify(response.data.user))
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    try {
      const response = await authApi.getMe()
      if (response.success) {
        user.value = response.data.user
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  function init() {
    const savedUser = localStorage.getItem('admin_user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch {
        logout()
      }
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    fetchUser,
    logout,
    init,
  }
})
