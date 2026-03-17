<template>
  <div class="categories-page">
    <div class="page-header">
      <h2 class="page-title">分类管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建分类
      </el-button>
    </div>

    <el-card>
      <el-table v-loading="loading" :data="categories" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="slug" label="别名" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="articleCount" label="文章数" width="100" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
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
    </el-card>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '创建分类'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="分类名称" />
        </el-form-item>
        <el-form-item label="别名" prop="slug">
          <el-input v-model="form.slug" placeholder="URL别名，如：design" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="分类描述"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="Element Plus图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { categoryApi } from '@/api'
import type { Category } from '@/api'

// State
const categories = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = ref<Partial<Category>>({
  name: '',
  slug: '',
  description: '',
  icon: '',
  sortOrder: 0,
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
}

// Methods
async function fetchCategories() {
  try {
    loading.value = true
    const response = await categoryApi.getAll()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    slug: '',
    description: '',
    icon: '',
    sortOrder: 0,
  }
  dialogVisible.value = true
}

function handleEdit(row: Category) {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    icon: row.icon || '',
    sortOrder: row.sortOrder,
  }
  dialogVisible.value = true
}

function handleDelete(row: Category) {
  if (row.articleCount > 0) {
    ElMessage.warning('该分类下还有文章，无法删除')
    return
  }

  ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await categoryApi.delete(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchCategories()
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
      const response = await categoryApi.update(currentId.value, form.value)
      if (response.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchCategories()
      }
    } else {
      const response = await categoryApi.create(form.value)
      if (response.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchCategories()
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.categories-page {
  // Page styles
}
</style>
