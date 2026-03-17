<template>
  <div class="themes-page">
    <div class="page-header">
      <h2 class="page-title">主题管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建主题
      </el-button>
    </div>

    <el-row :gutter="24">
      <el-col
        v-for="theme in themes"
        :key="theme.id"
        :xs="24"
        :sm="12"
        :lg="8"
        class="theme-col"
      >
        <el-card :class="{ 'is-default': theme.isDefault }">
          <div class="theme-preview" :style="getPreviewStyle(theme)">
            <div class="preview-header"></div>
            <div class="preview-content">
              <div class="preview-line"></div>
              <div class="preview-line short"></div>
            </div>
          </div>
          <div class="theme-info">
            <h3 class="theme-name">
              {{ theme.name }}
              <el-tag v-if="theme.isDefault" type="success" size="small">默认</el-tag>
            </h3>
            <p class="theme-desc">{{ theme.description }}</p>
            <p class="theme-key">Key: {{ theme.key }}</p>
          </div>
          <div class="theme-actions">
            <el-button type="primary" size="small" @click="handleEdit(theme)">
              编辑
            </el-button>
            <el-button
              v-if="!theme.isDefault"
              type="success"
              size="small"
              @click="handleSetDefault(theme)"
            >
              设为默认
            </el-button>
            <el-button
              v-if="!theme.isDefault"
              type="danger"
              size="small"
              @click="handleDelete(theme)"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑主题' : '创建主题'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="主题名称" />
        </el-form-item>
        <el-form-item label="Key" prop="key">
          <el-input v-model="form.key" placeholder="主题标识，如：default" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="主题描述"
          />
        </el-form-item>
        <el-form-item label="主色调" prop="primaryColor">
          <el-color-picker v-model="form.config.primaryColor" />
        </el-form-item>
        <el-form-item label="背景色" prop="backgroundColor">
          <el-color-picker v-model="form.config.backgroundColor" />
        </el-form-item>
        <el-form-item label="强调色" prop="accentColor">
          <el-color-picker v-model="form.config.accentColor" />
        </el-form-item>
        <el-form-item label="设为默认" prop="isDefault">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
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
import { themeApi } from '@/api'
import type { Theme } from '@/api'

// State
const themes = ref<Theme[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = ref<Partial<Theme>>({
  name: '',
  key: '',
  description: '',
  config: {
    primaryColor: '#000000',
    backgroundColor: '#fffbef',
    accentColor: '#ff0000',
  },
  isDefault: 0,
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  key: [{ required: true, message: '请输入Key', trigger: 'blur' }],
}

// Methods
function getPreviewStyle(theme: Theme) {
  const config = theme.config || {}
  return {
    backgroundColor: config.backgroundColor || '#fffbef',
    '--preview-primary': config.primaryColor || '#000000',
    '--preview-accent': config.accentColor || '#ff0000',
  }
}

async function fetchThemes() {
  try {
    loading.value = true
    const response = await themeApi.getAll()
    if (response.success) {
      themes.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch themes:', error)
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    key: '',
    description: '',
    config: {
      primaryColor: '#000000',
      backgroundColor: '#fffbef',
      accentColor: '#ff0000',
    },
    isDefault: 0,
  }
  dialogVisible.value = true
}

function handleEdit(theme: Theme) {
  isEdit.value = true
  currentId.value = theme.id
  form.value = {
    name: theme.name,
    key: theme.key,
    description: theme.description || '',
    config: {
      primaryColor: theme.config?.primaryColor || '#000000',
      backgroundColor: theme.config?.backgroundColor || '#fffbef',
      accentColor: theme.config?.accentColor || '#ff0000',
    },
    isDefault: theme.isDefault,
  }
  dialogVisible.value = true
}

function handleSetDefault(theme: Theme) {
  ElMessageBox.confirm(`确定要将 "${theme.name}" 设为默认主题吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await themeApi.setDefault(theme.id)
      if (response.success) {
        ElMessage.success('设置成功')
        fetchThemes()
      }
    } catch (error) {
      // Error handled by interceptor
    }
  })
}

function handleDelete(theme: Theme) {
  ElMessageBox.confirm(`确定要删除主题 "${theme.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await themeApi.delete(theme.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchThemes()
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
      const response = await themeApi.update(currentId.value, form.value)
      if (response.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchThemes()
      }
    } else {
      const response = await themeApi.create(form.value)
      if (response.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchThemes()
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchThemes()
})
</script>

<style scoped lang="scss">
.themes-page {
  .theme-col {
    margin-bottom: 24px;
  }

  .el-card {
    &.is-default {
      border: 2px solid #67c23a;
    }
  }

  .theme-preview {
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    border: 1px solid #e4e7ed;

    .preview-header {
      height: 24px;
      background: var(--preview-primary);
      opacity: 0.1;
    }

    .preview-content {
      padding: 12px;

      .preview-line {
        height: 8px;
        background: var(--preview-primary);
        opacity: 0.2;
        border-radius: 4px;
        margin-bottom: 8px;

        &.short {
          width: 60%;
        }
      }
    }
  }

  .theme-info {
    margin-bottom: 16px;
  }

  .theme-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .theme-desc {
    font-size: 0.9rem;
    color: #909399;
    margin-bottom: 4px;
  }

  .theme-key {
    font-size: 0.85rem;
    color: #c0c4cc;
  }

  .theme-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
