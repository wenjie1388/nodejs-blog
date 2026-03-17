<template>
  <nav class="navigation" :class="{ 'is-scrolled': isScrolled, 'is-hidden': isHidden }">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-text">个人博客</span>
      </router-link>

      <!-- Desktop Menu -->
      <div class="desktop-menu">
        <router-link
          v-for="menu in flatMenus"
          :key="menu.id"
          :to="menu.path"
          class="menu-link"
          :class="{ 'is-active': isActiveRoute(menu.path) }"
        >
          <el-icon v-if="menu.icon" class="menu-icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </router-link>
      </div>

      <!-- Right Actions -->
      <div class="nav-actions">
        <button class="theme-btn" @click="toggleThemePanel">
          <el-icon><Brush /></el-icon>
        </button>
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <el-icon><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <transition name="slide-down">
      <div v-show="isMobileMenuOpen" class="mobile-menu">
        <router-link
          v-for="menu in flatMenus"
          :key="menu.id"
          :to="menu.path"
          class="mobile-menu-link"
          @click="closeMobileMenu"
        >
          <el-icon v-if="menu.icon">
            <component :is="menu.icon" />
          </el-icon>
          <span>{{ menu.name }}</span>
        </router-link>
      </div>
    </transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMenuStore, useThemeStore } from '@/stores'
import type { Menu } from '@/api'

const route = useRoute()
const menuStore = useMenuStore()
const themeStore = useThemeStore()

// State
const isScrolled = ref(false)
const isHidden = ref(false)
const isMobileMenuOpen = ref(false)
const lastScrollY = ref(0)

// Computed
const flatMenus = computed(() => {
  const flatten = (menus: Menu[]): Menu[] => {
    const result: Menu[] = []
    for (const menu of menus) {
      result.push(menu)
      if (menu.children && menu.children.length > 0) {
        result.push(...flatten(menu.children))
      }
    }
    return result.filter(m => m.parentId === null) // 只显示一级菜单
  }
  return flatten(menuStore.menus)
})

// Methods
function isActiveRoute(path: string) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function toggleThemePanel() {
  // 触发主题切换面板
  const event = new CustomEvent('toggle-theme-panel')
  window.dispatchEvent(event)
}

// Scroll handler
function handleScroll() {
  const currentScrollY = window.scrollY
  
  // 检测是否滚动超过阈值
  isScrolled.value = currentScrollY > 50
  
  // 检测滚动方向，隐藏/显示导航栏
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }
  
  lastScrollY.value = currentScrollY
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.navigation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
  transition: all 0.5s var(--transition-fluid);
  background: transparent;

  &.is-scrolled {
    background: rgba(var(--bg-primary), 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 0 var(--border-color);
  }

  &.is-hidden {
    transform: translateY(-100%);
  }
}

.nav-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: var(--accent-primary);
  }
}

.desktop-menu {
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    display: none;
  }
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  .menu-icon {
    font-size: 1.1rem;
  }

  &:hover {
    background: var(--bg-secondary);
    color: var(--accent-primary);
  }

  &.is-active {
    background: var(--bg-secondary);
    color: var(--accent-primary);
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: rotate(30deg);
  }
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    color: white;
  }

  @media (max-width: 768px) {
    display: flex;
  }
}

.mobile-menu {
  display: none;
  position: absolute;
  top: var(--nav-height);
  left: 0;
  right: 0;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: block;
  }
}

.mobile-menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
    color: var(--accent-primary);
  }
}

// 动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s var(--transition-fluid);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
