<template>
  <div class="tags-page">
    <div class="page-header">
      <h2 class="page-title">标签管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建标签
      </el-button>
    </div>

    <el-card>
      <!-- Search -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标签名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- Table -->
      <el-table v-loading="loading" :data="tags" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称">
          <template #default="{ row }">
            <div class="tag-name">
              <span
                class="tag-color"
                :style="{ backgroundColor: row.color }"
              />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="slug" label="别名" />
        <el-table-column prop="color" label="颜色" width="120">
          <template #default="{ row }">
            <div class="color-cell">
              <span
                class="color-preview"
                :style="{ backgroundColor: row.color }"
              />
              <span class="color-value">{{ row.color }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="articleCount" label="文章数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
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
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handleViewArticles(row)">
              文章
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
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '创建标签'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="标签名称" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <div class="color-picker-wrapper">
            <el-color-picker v-model="form.color" show-alpha />
            <el-input
              v-model="form.color"
              placeholder="#3b82f6"
              style="width: 150px; margin-left: 10px"
            />
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="标签描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- Articles Dialog -->
    <el-dialog
      v-model="articlesDialogVisible"
      :title="articlesDialogTitle"
      width="800px"
    >
      <el-table v-loading="articlesLoading" :data="tagArticles" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="viewCount" label="浏览量" width="100" />
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="articlesPagination.page"
          v-model:page-size="articlesPagination.limit"
          :total="articlesPagination.total"
          layout="total, prev, pager, next"
          @current-change="handleArticlesPageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { tagApi } from '@/api/modules/article/tag'
import type { Tag, TagFormData } from '@/api/modules/article/tag'

// State
const tags = ref<Tag[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const searchForm = reactive({
  keyword: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const form = ref<TagFormData>({
  name: '',
  color: '#3b82f6',
  description: '',
  status: 'active'
})

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

// Articles dialog
const articlesDialogVisible = ref(false)
const articlesLoading = ref(false)
const tagArticles = ref<any[]>([])
const currentTag = ref<Tag | null>(null)
const articlesPagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const articlesDialogTitle = computed(() => {
  return currentTag.value ? `标签 "${currentTag.value.name}" 的文章` : '标签文章'
})

// Methods
async function fetchTags() {
  try {
    loading.value = true
    const response = await tagApi.getList({
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined
    })
    if (response.success) {
      tags.value = response.data
      pagination.total = response.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchTags()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  pagination.page = 1
  fetchTags()
}

function handleSizeChange(val: number) {
  pagination.limit = val
  pagination.page = 1
  fetchTags()
}

function handlePageChange(val: number) {
  pagination.page = val
  fetchTags()
}

function handleCreate() {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    color: '#3b82f6',
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

function handleEdit(row: Tag) {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    color: row.color,
    description: row.description || '',
    status: row.status
  }
  dialogVisible.value = true
}

function handleDelete(row: Tag) {
  ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await tagApi.delete(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchTags()
      }
    } catch (error) {
      // Error handled by interceptor
    }
  })
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    submitting.value = true

    if (isEdit.value && currentId.value) {
      const response = await tagApi.update(currentId.value, form.value)
      if (response.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchTags()
      }
    } else {
      const response = await tagApi.create(form.value)
      if (response.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchTags()
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    submitting.value = false
  }
}

// View articles
async function handleViewArticles(row: Tag) {
  currentTag.value = row
  articlesDialogVisible.value = true
  articlesPagination.page = 1
  await fetchTagArticles()
}

async function fetchTagArticles() {
  if (!currentTag.value) return

  try {
    articlesLoading.value = true
    const response = await tagApi.getArticles(currentTag.value.id, {
      page: articlesPagination.page,
      limit: articlesPagination.limit
    })
    if (response.success) {
      tagArticles.value = response.data 
      articlesPagination.total = response.pagination.total
    }
  } catch (error) {
    console.error('Failed to fetch tag articles:', error)
  } finally {
    articlesLoading.value = false
  }
}

function handleArticlesPageChange(val: number) {
  articlesPagination.page = val
  fetchTagArticles()
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="scss">
.tags-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .search-form {
    margin-bottom: 20px;
  }

  .tag-name {
    display: flex;
    align-items: center;
    gap: 8px;

    .tag-color {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
  }

  .color-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .color-preview {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
    }

    .color-value {
      font-size: 12px;
      color: #606266;
      font-family: monospace;
    }
  }

  .color-picker-wrapper {
    display: flex;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
