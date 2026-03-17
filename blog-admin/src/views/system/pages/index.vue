<template>
  <div class="pages-page">
    <div class="page-header">
      <h2 class="page-title">页面管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        添加页面
      </el-button>
    </div>

    <div class="search-form">
      <el-input v-model="searchQuery" placeholder="搜索页面标题..." clearable />
      <el-select v-model="statusFilter" placeholder="状态" clearable>
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <el-card>
      <el-table v-loading="loading" :data="pages" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="slug" label="访问路径" width="150" />
        <el-table-column prop="path" label="文件路径" min-width="200" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="success" size="small" @click="handlePreview(scope.row)">预览</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="handlePageChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageApi } from '@/api'
import type { Page } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()
const pages = ref<Page[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')

async function fetchPages() {
  loading.value = true
  const response = await pageApi.getList({
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
    status: statusFilter.value || undefined,
  })
  if (response.success) {
    pages.value = response.data
    total.value = response.pagination.total
  }
  loading.value = false
}

function handleCreate() { router.push('/system/pages/create') }
function handleEdit(row: Page) { router.push('/system/pages/edit/' + row.id) }
function handlePreview(row: Page) {
  if (row.status === 'draft') { ElMessage.warning('草稿状态页面无法预览'); return }
  window.open('/' + row.slug, '_blank')
}
function handleDelete(row: Page) {
  ElMessageBox.confirm('确定要删除页面 "' + row.title + '" 吗？', '提示', { type: 'warning' }).then(async () => {
    const response = await pageApi.delete(row.id)
    if (response.success) { ElMessage.success('删除成功'); fetchPages() }
  })
}
function handleSearch() { currentPage.value = 1; fetchPages() }
function resetSearch() { searchQuery.value = ''; statusFilter.value = ''; currentPage.value = 1; fetchPages() }
function handlePageChange(page: number) { currentPage.value = page; fetchPages() }
function getStatusType(status: string) { return { published: 'success', draft: 'info' }[status] || 'info' }
function getStatusLabel(status: string) { return { published: '已发布', draft: '草稿' }[status] || status }
function formatDate(date: string) { return dayjs(date).format('YYYY-MM-DD HH:mm') }
onMounted(fetchPages)
</script>

<style scoped lang="scss">
.pages-page {
  .search-form { display: flex; gap: 16px; margin-bottom: 24px; }
  .pagination-container { display: flex; justify-content: flex-end; margin-top: 24px; }
}
</style>
