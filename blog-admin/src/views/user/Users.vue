<template>
  <div class="users-page">
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
    </div>

    <!-- Search -->
    <div class="search-form">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或邮箱..."
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-card>
      <el-table v-loading="loading" :data="users" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'info'">
              {{ row.role === 'admin' ? '管理员' : '用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.id !== currentUserId"
              :type="row.status === 'active' ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              v-if="row.id !== currentUserId"
              :type="row.role === 'admin' ? 'info' : 'warning'"
              size="small"
              @click="handleToggleRole(row)"
            >
              {{ row.role === 'admin' ? '取消管理员' : '设为管理员' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api'
import type { UserType } from '@/api'
import dayjs from 'dayjs'

// State
const users = ref<UserType[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')

// Computed
const currentUserId = computed(() => {
  const user = localStorage.getItem('admin_user')
  return user ? JSON.parse(user).id : 0
})

// Methods
async function fetchUsers() {
  try {
    loading.value = true
    const response = await userApi.getList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
    })
    if (response.success) {
      users.value = response.data
      total.value = response.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchUsers()
}

function resetSearch() {
  searchQuery.value = ''
  currentPage.value = 1
  fetchUsers()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchUsers()
}

function handleToggleStatus(row: UserType) {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const newStatus = row.status === 'active' ? 'disabled' : 'active'
      const response = await userApi.updateStatus(row.id, newStatus)
      if (response.success) {
        ElMessage.success(`${action}成功`)
        fetchUsers()
      }
    } catch (error) {
      // Error handled by interceptor
    }
  })
}

function handleToggleRole(row: UserType) {
  const action = row.role === 'admin' ? '取消管理员权限' : '设为管理员'
  ElMessageBox.confirm(`确定要${action} "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const newRole = row.role === 'admin' ? 'user' : 'admin'
      const response = await userApi.updateRole(row.id, newRole)
      if (response.success) {
        ElMessage.success('设置成功')
        fetchUsers()
      }
    } catch (error) {
      // Error handled by interceptor
    }
  })
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.users-page {
  .search-form {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .el-input {
      width: 280px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
}
</style>
