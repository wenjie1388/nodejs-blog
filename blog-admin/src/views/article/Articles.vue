<template>
  <div class="articles-page">
    <div class="page-header">
      <h2 class="page-title">文章管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建文章
      </el-button>
    </div>

    <!-- Search -->
    <div class="search-form">
      <el-input
        v-model="searchQuery"
        placeholder="搜索文章标题..."
        clearable
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态" clearable>
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
        <el-option label="已归档" value="archived" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- Table -->
    <el-card>
      <el-table
        v-loading="loading"
        :data="articles"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip>
          <template #default="{ row }">
            <router-link :to="`/content/articles/edit/${row.id}`" class="article-title">
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { articleApi } from '@/api'
import type { Article } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

// State
const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchQuery = ref('')
const statusFilter = ref('')

// Methods
async function fetchArticles() {
  try {
    loading.value = true
    const response = await articleApi.getList({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
    })
    if (response.success) {
      articles.value = response.data
      total.value = response.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  router.push('/content/articles/create')
}

function handleEdit(row: Article) {
  router.push(`/content/articles/edit/${row.id}`)
}

function handleDelete(row: Article) {
  ElMessageBox.confirm(`确定要删除文章 "${row.title}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await articleApi.delete(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchArticles()
      }
    } catch (error) {
      // Error handled by interceptor
    }
  })
}

function handleSearch() {
  currentPage.value = 1
  fetchArticles()
}

function resetSearch() {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  fetchArticles()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchArticles()
}

function getStatusType(status: string) {
  const types: Record<string, string> = {
    published: 'success',
    draft: 'info',
    archived: 'warning',
  }
  return types[status] || 'info'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档',
  }
  return labels[status] || status
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped lang="scss">
.articles-page {
  .search-form {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .el-input {
      width: 240px;
    }

    .el-select {
      width: 140px;
    }
  }

  .article-title {
    color: #606266;

    &:hover {
      color: #409eff;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
  }
}
</style>
