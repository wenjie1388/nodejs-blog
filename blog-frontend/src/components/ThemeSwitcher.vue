<template>
  <teleport to="body">
    <transition name="fade">
      <div 
        v-if="isOpen" 
        class="theme-panel-overlay"
        @click="closePanel"
      >
        <div class="theme-panel" @click.stop>
          <div class="panel-header">
            <h3 class="panel-title">选择主题</h3>
            <button class="close-btn" @click="closePanel">
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <div class="theme-list">
            <div
              v-for="theme in themeStore.themes"
              :key="theme.id"
              class="theme-item"
              :class="{ 'is-active': themeStore.themeKey === theme.key }"
              @click="selectTheme(theme)"
            >
              <div 
                class="theme-preview" 
                :style="getPreviewStyle(theme)"
              >
                <div class="preview-header"></div>
                <div class="preview-content">
                  <div class="preview-line"></div>
                  <div class="preview-line short"></div>
                </div>
              </div>
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-desc">{{ theme.description }}</span>
              </div>
              <el-icon v-if="themeStore.themeKey === theme.key" class="check-icon">
                <Check />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores'
import type { Theme } from '@/api'

const themeStore = useThemeStore()
const isOpen = ref(false)

function getPreviewStyle(theme: Theme) {
  const config = theme.config || {}
  return {
    backgroundColor: config.backgroundColor || '#fffbef',
    '--preview-primary': config.primaryColor || '#000000',
    '--preview-accent': config.accentColor || '#ff0000',
  }
}

function selectTheme(theme: Theme) {
  themeStore.setTheme(theme)
  closePanel()
}

function openPanel() {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closePanel() {
  isOpen.value = false
  document.body.style.overflow = ''
}

function togglePanel() {
  if (isOpen.value) {
    closePanel()
  } else {
    openPanel()
  }
}

// 监听全局事件
function handleToggleEvent() {
  togglePanel()
}

onMounted(() => {
  window.addEventListener('toggle-theme-panel', handleToggleEvent)
  // 获取所有主题
  themeStore.fetchThemes()
})

onUnmounted(() => {
  window.removeEventListener('toggle-theme-panel', handleToggleEvent)
})
</script>

<style scoped lang="scss">
.theme-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.theme-panel {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
  }
}

.theme-list {
  padding: 16px;
  overflow-y: auto;
  max-height: 60vh;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;

  &:hover {
    background: var(--bg-primary);
  }

  &.is-active {
    background: var(--bg-primary);
    box-shadow: 0 0 0 2px var(--accent-primary);
  }
}

.theme-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid var(--border-color);

  .preview-header {
    height: 16px;
    background: var(--preview-primary);
    opacity: 0.1;
  }

  .preview-content {
    padding: 8px;

    .preview-line {
      height: 6px;
      background: var(--preview-primary);
      opacity: 0.2;
      border-radius: 3px;
      margin-bottom: 6px;

      &.short {
        width: 60%;
      }
    }
  }
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-name {
  font-weight: 600;
  color: var(--text-primary);
}

.theme-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.check-icon {
  font-size: 1.2rem;
  color: var(--accent-primary);
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
