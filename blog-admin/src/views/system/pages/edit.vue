<template>
  <div class="page-edit">
    <div class="page-header">
      <h2 class="page-title">{{ isEdit ? '编辑页面' : '添加页面' }}</h2>
      <div class="page-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </div>

    <el-row :gutter="24">
      <el-col :span="16">
        <el-card>
          <template #header><span>页面信息</span></template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
            <el-form-item label="页面标题" prop="title">
              <el-input v-model="form.title" placeholder="如：关于我们" />
            </el-form-item>
            <el-form-item label="访问路径" prop="slug">
              <el-input v-model="form.slug" placeholder="如 about">
                <template #prepend>/</template>
              </el-input>
              <div class="form-tip">用户访问的URL路径</div>
            </el-form-item>
            <el-form-item label="文件路径" prop="path">
              <el-input v-model="form.path" placeholder="如 pages/about.html">
                <template #prepend>/static/</template>
              </el-input>
              <div class="form-tip">HTML文件存放路径</div>
            </el-form-item>
            <el-form-item label="页面描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="published">发布</el-radio>
                <el-radio label="draft">草稿</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card>
          <template #header><span>使用说明</span></template>
          <div class="help-content">
            <h4>页面管理流程</h4>
            <ol><li>管理员填写页面信息并保存</li><li>开发制作HTML文件</li><li>上传到服务器指定路径</li><li>前台通过路径访问</li></ol>
            <h4>字段说明</h4>
            <ul><li><strong>访问路径</strong>：用户URL，如/about</li><li><strong>文件路径</strong>：HTML位置，如pages/about.html</li></ul>
          </div>
        </el-card>

        <el-card v-if="isEdit" class="upload-card">
          <template #header><span>上传页面文件</span></template>
          <el-upload drag action="/api/upload/page" :data="{ pageId: route.params.id }" :on-success="handleUploadSuccess" :on-error="handleUploadError" accept=".html,.htm">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽HTML文件到此处或<em>点击上传</em></div>
            <template #tip><div class="el-upload__tip">保存到: /static/{{ form.path }}</div></template>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pageApi } from '@/api'
import type { Page } from '@/api'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const form = ref<Partial<Page>>({ title: '', slug: '', path: '', description: '', status: 'draft' })
const rules = {
  title: [{ required: true, message: '请输入页面标题', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入访问路径', trigger: 'blur' }, { pattern: /^[a-z0-9-]+$/, message: '只能包含小写字母、数字和连字符', trigger: 'blur' }],
  path: [{ required: true, message: '请输入文件路径', trigger: 'blur' }, { pattern: /^[a-zA-Z0-9/_-]+\.html?$/, message: '需以.html结尾', trigger: 'blur' }],
}
const saving = ref(false)
const isEdit = computed(() => !!route.params.id)

async function fetchPage() {
  const id = Number(route.params.id)
  if (!id) return
  const response = await pageApi.getById(id)
  if (response.success) {
    const { title, slug, path, description, status } = response.data
    form.value = { title, slug, path, description, status }
  }
}

async function handleSave() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  let response
  if (isEdit.value) response = await pageApi.update(Number(route.params.id), form.value)
  else response = await pageApi.create(form.value)
  if (response.success) {
    ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
    router.push('/system/pages')
  }
  saving.value = false
}

function handleCancel() { router.push('/system/pages') }
function handleUploadSuccess() { ElMessage.success('文件上传成功') }
function handleUploadError() { ElMessage.error('文件上传失败') }

onMounted(() => { if (isEdit.value) fetchPage() })
</script>

<style scoped lang="scss">
.page-edit {
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .page-title { margin: 0; font-size: 1.5rem; font-weight: 600; }
  .page-actions { display: flex; gap: 12px; }
  .form-tip { font-size: 0.85em; color: #909399; margin-top: 4px; }
  .upload-card { margin-top: 16px; }
  .help-content { font-size: 0.9rem; color: #606266; }
  .help-content h4 { margin: 16px 0 8px; color: #303133; }
  .help-content ol, .help-content ul { margin: 0; padding-left: 20px; }
  .help-content li { margin: 6px 0; line-height: 1.6; }
  .help-content strong { color: #409eff; }
}
</style>
