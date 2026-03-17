<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <el-icon v-if="isCollapsed"><Document /></el-icon>
          <template v-else>
            <el-icon class="logo-icon"><Document /></el-icon>
            <span class="logo-text">博客管理</span>
          </template>
        </router-link>
      </div>

      <el-menu
        :default-active="activeMenu"
        :default-openeds="openedMenus"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
        background-color="#001529"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <template v-for="item in menuItems" :key="item.path">
          <!-- 有子菜单的分组 -->
          <el-sub-menu v-if="item.children?.length" :index="item.path">
            <template #title>
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              <template #title>{{ child.title }}</template>
            </el-menu-item>
          </el-sub-menu>
          <!-- 普通菜单项 -->
          <el-menu-item v-else :index="item.path">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- Main Content -->
    <main class="admin-main">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-left">
          <button class="collapse-btn" @click="toggleSidebar">
            <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </button>
          <breadcrumb />
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="user?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ user?.nickname || user?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Content -->
      <div class="admin-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Password Dialog -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="400px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores'
import { authApi } from '@/api'
import Breadcrumb from '@/components/Breadcrumb.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State
const isCollapsed = ref(false)
const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// Computed
const user = computed(() => authStore.user)

const activeMenu = computed(() => route.path)

const menuItems = computed(() => {
  const layoutRoute = router.getRoutes().find(r => r.name === 'Layout')
  if (!layoutRoute?.children) return []

  return layoutRoute.children
    .filter(r => !r.meta?.hidden)
    .map(r => {
      const item: any = {
        path: '/' + r.path,
        title: r.meta?.title as string,
        icon: r.meta?.icon as string,
      }
      // 如果有子路由，处理子菜单
      if (r.children && r.children.length > 0) {
        item.children = r.children
          .filter(c => !c.meta?.hidden)
          .map(c => ({
            path: '/' + r.path + '/' + c.path,
            title: c.meta?.title as string,
          }))
      }
      return item
    })
})

// 默认展开系统设置菜单
const openedMenus = computed(() => {
  const systemMenus: string[] = []
  menuItems.value.forEach(item => {
    if (item.children?.some((c: any) => c.path === activeMenu.value)) {
      systemMenus.push(item.path)
    }
  })
  return systemMenus
})

// Methods
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/system/settings')
      break
    case 'password':
      passwordDialogVisible.value = true
      break
    case 'logout':
      handleLogout()
      break
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    authStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}

async function handleChangePassword() {
  const valid = await passwordFormRef.value?.validate()
  if (!valid) return

  try {
    const response = await authApi.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    )
    if (response.success) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    }
  } catch (error) {
    // Error handled by interceptor
  }
}
</script>

<style scoped lang="scss">
.admin-layout {
  min-height: 100vh;
  display: flex;
}

.admin-sidebar {
  width: var(--sidebar-width);
  background: #001529;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.3s;
  overflow: hidden;

  &.is-collapsed {
    width: var(--sidebar-collapsed-width);
  }
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 600;

  .logo-icon {
    font-size: 1.5rem;
    color: #409eff;
  }
}

.sidebar-menu {
  border-right: none;
}

.admin-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .admin-sidebar.is-collapsed + & {
    margin-left: var(--sidebar-collapsed-width);
  }
}

.admin-header {
  height: var(--header-height);
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 99;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #606266;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;

  &:hover {
    background: #f5f7fa;
  }

  .username {
    font-size: 0.9rem;
    color: #606266;
  }
}

.admin-content {
  flex: 1;
  padding: 24px;
  background: #f5f7fa;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
