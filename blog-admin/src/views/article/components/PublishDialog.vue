<template>
  <el-dialog
    v-model="visible"
    title="发布设置"
    width="600px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="选择分类" clearable style="width: 100%">
          <el-option
            v-for="category in categories"
            :key="category.id"
            :label="category.name"
            :value="category.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="标签" prop="tagIds">
        <el-select
          v-model="formData.tagIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          >
            <div class="tag-option">
              <span
                class="tag-color-dot"
                :style="{ backgroundColor: tag.color }"
              />
              <span>{{ tag.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="封面" prop="coverImage">
        <el-upload
          class="cover-uploader"
          :action="uploadAction"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleUploadSuccess"
          :before-upload="beforeUpload"
        >
          <img v-if="formData.coverImage" :src="formData.coverImage" class="cover-preview" />
          <div v-else class="cover-upload-placeholder">
            <el-icon class="cover-upload-icon"><Plus /></el-icon>
            <span class="cover-upload-text">点击上传封面</span>
          </div>
        </el-upload>
      </el-form-item>

      <el-form-item label="摘要" prop="excerpt">
        <el-input
          v-model="formData.excerpt"
          type="textarea"
          :rows="4"
          placeholder="文章摘要，不填写将自动提取"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">确认发布</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Category } from '@/api'
import type { Tag } from '@/api/modules/article/tag'

const props = defineProps<{
  modelValue: boolean
  categories: Category[]
  tags: Tag[]
  loading?: boolean
  initialData: {
    categoryId?: number | null
    tagIds?: number[]
    coverImage?: string | null
    excerpt?: string
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: {
    categoryId: number | null
    tagIds: number[]
    coverImage: string
    excerpt: string
  }): void
  (e: 'cancel'): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const formData = ref({
  categoryId: null as number | null,
  tagIds: [] as number[],
  coverImage: '',
  excerpt: ''
})

const rules = {
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const uploadAction = '/api/upload/image'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
}

// 监听弹窗打开，初始化表单数据
watch(() => props.modelValue, (val) => {
  if (val) {
    formData.value = {
      categoryId: props.initialData.categoryId ?? null,
      tagIds: props.initialData.tagIds ?? [],
      coverImage: props.initialData.coverImage ?? '',
      excerpt: props.initialData.excerpt ?? ''
    }
  }
})

function handleUploadSuccess(response: any) {
  if (response.success) {
    formData.value.coverImage = response.data.url
    ElMessage.success('上传成功')
  }
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB')
    return false
  }
  return true
}

async function handleConfirm() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  emit('confirm', {
    categoryId: formData.value.categoryId,
    tagIds: formData.value.tagIds,
    coverImage: formData.value.coverImage,
    excerpt: formData.value.excerpt
  })
}

function handleClose() {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped lang="scss">
.cover-uploader {
  :deep(.el-upload) {
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.3s;
    width: 100%;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409eff;
    }
  }
}

.cover-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.cover-upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-upload-text {
  font-size: 14px;
  color: #8c939d;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .tag-color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
