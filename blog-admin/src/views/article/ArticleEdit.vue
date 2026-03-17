<template>
  <div class="article-edit-page">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑文章' : '创建文章' }}</h2>
      <div class="header-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="info" @click="handleSave('draft')">保存草稿</el-button>
        <el-button type="primary" @click="openPublishDialog">发布文章</el-button>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      class="article-form"
    >
      <el-card>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
              style="border-bottom: 1px solid #dcdfe6"
            />
            <Editor
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              style="height: 500px; overflow-y: hidden"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 发布设置弹窗 -->
    <PublishDialog
      v-model="publishDialogVisible"
      :categories="categories"
      :tags="tags"
      :loading="publishLoading"
      :initial-data="{
        categoryId: form.categoryId,
        tagIds: form.tagIds,
        coverImage: form.coverImage,
        excerpt: form.excerpt
      }"
      @confirm="handlePublishConfirm"
      @cancel="handlePublishCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, shallowRef, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { articleApi, categoryApi } from '@/api'
import { tagApi } from '@/api/modules/article/tag'
import type { Article, Category } from '@/api'
import type { Tag } from '@/api/modules/article/tag'
import type { IDomEditor, IEditorConfig } from '@wangeditor/editor'
import PublishDialog from './components/PublishDialog.vue' 

const route = useRoute()
const router = useRouter()

// Editor
const editorRef = shallowRef<IDomEditor>()
const toolbarConfig = {}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入文章内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload/image',
      fieldName: 'image',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    },
  },
}

// State
const formRef = ref()
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const publishDialogVisible = ref(false)
const publishLoading = ref(false)
const form = ref<Partial<Article> & { tagIds?: number[] }>({
  title: '',
  content: '',
  excerpt: '',
  categoryId: null,
  tags: '',
  tagIds: [],
  coverImage: '',
  status: 'draft',
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

// Computed
const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => parseInt(route.params.id as string))

// Methods
function handleCreated(editor: IDomEditor) {
  editorRef.value = editor
}

async function fetchCategories() {
  try {
    const response = await categoryApi.getAll()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

async function fetchTags() {
  try {
    const response = await tagApi.getAll()
    if (response.success) {
      tags.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error)
  }
}

async function fetchArticle() {
  if (!isEdit.value) return

  try {
    const response = await articleApi.getById(articleId.value)
    if (response.success) {
      const article = response.data
      form.value = {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        categoryId: article.categoryId,
        tags: article.tags || '',
        tagIds: article.tagsList?.map((t: any) => t.id) || [],
        coverImage: article.coverImage || '',
        status: article.status,
      }
    }
  } catch (error) {
    console.error('Failed to fetch article:', error)
    ElMessage.error('获取文章失败')
  }
}

function openPublishDialog() {
  // 先校验标题和内容
  formRef.value?.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('请先填写标题和内容')
      return
    }
    publishDialogVisible.value = true
  })
}

function handlePublishConfirm(data: {
  categoryId: number | null
  tagIds: number[]
  coverImage: string
  excerpt: string
}) {
  // 更新表单数据
  form.value.categoryId = data.categoryId
  form.value.tagIds = data.tagIds
  form.value.coverImage = data.coverImage
  form.value.excerpt = data.excerpt
  
  // 执行发布
  doSave('published')
}

function handlePublishCancel() {
  // 取消发布，什么都不做
}

async function handleSave(status: 'draft' | 'published') {
  const valid = await formRef.value?.validate()
  if (!valid) return

  await doSave(status)
}

async function doSave(status: 'draft' | 'published') {
  publishLoading.value = true
  try {
    const data = {
      ...form.value,
      status,
      tagIds: form.value.tagIds || []
    }

    if (isEdit.value) {
      const response = await articleApi.update(articleId.value, data)
      if (response.success) {
        ElMessage.success('更新成功')
        publishDialogVisible.value = false
        router.push('/content/articles')
      }
    } else {
      const response = await articleApi.create(data)
      if (response.success) {
        ElMessage.success('创建成功')
        publishDialogVisible.value = false
        router.push('/content/articles')
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    publishLoading.value = false
  }
}

function handleCancel() {
  router.back()
}

onMounted(() => {
  fetchCategories()
  fetchTags()
  fetchArticle()
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped lang="scss">
.article-edit-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .editor-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
    z-index: 1;
  }


}
</style>
