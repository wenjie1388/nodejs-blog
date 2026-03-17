<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
