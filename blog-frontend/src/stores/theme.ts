import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themeApi } from '@/api'
import type { Theme } from '@/api'

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<Theme | null>(null)
  const themes = ref<Theme[]>([])
  const loading = ref(false)

  // Getters
  const themeKey = computed(() => currentTheme.value?.key || 'default')
  
  const themeConfig = computed(() => {
    return currentTheme.value?.config || {
      primaryColor: '#000000',
      backgroundColor: '#fffbef',
      accentColor: '#ff0000',
    }
  })

  // Actions
  async function fetchThemes() {
    try {
      loading.value = true
      const response = await themeApi.getAll()
      if (response.success) {
        themes.value = response.data
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchDefaultTheme() {
    try {
      loading.value = true
      const response = await themeApi.getDefault()
      if (response.success) {
        currentTheme.value = response.data
        applyTheme(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch default theme:', error)
    } finally {
      loading.value = false
    }
  }

  function setTheme(theme: Theme) {
    currentTheme.value = theme
    applyTheme(theme)
  }

  function applyTheme(theme: Theme) {
    const config = theme.config
    if (config) {
      const root = document.documentElement
      
      // 设置CSS变量
      if (config.primaryColor) {
        root.style.setProperty('--text-primary', config.primaryColor)
      }
      if (config.backgroundColor) {
        root.style.setProperty('--bg-primary', config.backgroundColor)
      }
      if (config.accentColor) {
        root.style.setProperty('--accent-primary', config.accentColor)
      }
      
      // 设置data-theme属性
      root.setAttribute('data-theme', theme.key)
    }
  }

  function resetTheme() {
    const root = document.documentElement
    root.removeAttribute('data-theme')
    root.style.removeProperty('--text-primary')
    root.style.removeProperty('--bg-primary')
    root.style.removeProperty('--accent-primary')
  }

  return {
    currentTheme,
    themes,
    loading,
    themeKey,
    themeConfig,
    fetchThemes,
    fetchDefaultTheme,
    setTheme,
    applyTheme,
    resetTheme,
  }
})
