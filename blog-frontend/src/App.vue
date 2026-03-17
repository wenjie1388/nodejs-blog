<template>
  <div id="app" class="app">
    <Navigation />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <ThemeSwitcher />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useThemeStore, useMenuStore } from '@/stores'

const themeStore = useThemeStore()
const menuStore = useMenuStore()

onMounted(() => {
  // 初始化主题
  themeStore.fetchDefaultTheme()
  // 初始化菜单
  menuStore.fetchMenus()
})
</script>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: var(--nav-height);
}
</style>
