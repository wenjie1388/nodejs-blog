<template>
  <div class="menus-page">
    <div class="page-header">
      <h2 class="page-title">菜单管理</h2>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        创建菜单
      </el-button>
    </div>

    <el-card>
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        stripe
        default-expand-all
      >
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="path" label="路径" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="打开方式" width="100">
          <template #default="{ row }">
            {{ row.target === '_blank' ? '新窗口' : '当前窗口' }}
          </template>
        </el-table-column>
        <el-table-column prop="isVisible" label="可见" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isVisible ? 'success' : 'info'">
              {{ row.isVisible ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
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
      :title="isEdit ? '编辑菜单' : '创建菜单'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="菜单名称" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="如：/articles" />
        </el-form-item>
        <el-form-item label="父菜单" prop="parentId">
          <el-select v-model="form.parentId" placeholder="选择父菜单（可选）" clearable style="width: 100%">
            <el-option label="无" :value="null" />
            <el-option
              v-for="menu in parentMenus"
              :key="menu.id"
              :label="menu.name"
              :value="menu.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="Element Plus图标名称" />
        </el-form-item>
        <el-form-item label="打开方式" prop="target">
          <el-radio-group v-model="form.target">
            <el-radio label="_self">当前窗口</el-radio>
            <el-radio label="_blank">新窗口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" />
        </el-form-item>
        <el-form-item label="可见" prop="isVisible">
          <el-switch v-model="form.isVisible" :active-value="1" :inactive-value="0" />
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { menuApi } from '@/api'
import type { Menu } from '@/api'

// State
const menus = ref<Menu[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref()

const form = ref<Partial<Menu>>({
  name: '',
  path: '',
  parentId: null,
  icon: '',
  target: '_self',
  sortOrder: 0,
  isVisible: 1,
})

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路径', trigger: 'blur' }],
}

// Computed
const tableData = computed(() => {
  const buildTree = (items: Menu[], parentId: number | null = null): Menu[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id),
      }))
  }
  return buildTree(menus.value)
})

const parentMenus = computed(() => {
  return menus.value.filter(m => m.parentId === null)
})

// Methods
async function fetchMenus() {
  try {
    loading.value = true
    const response = await menuApi.getAll()
    if (response.success) {
      menus.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch menus:', error)
  } finally {
    loading.value = false
  }
}

function handleCreate() {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    path: '',
    parentId: null,
    icon: '',
    target: '_self',
    sortOrder: 0,
    isVisible: 1,
  }
  dialogVisible.value = true
}

function handleEdit(row: Menu) {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    path: row.path,
    parentId: row.parentId,
    icon: row.icon || '',
    target: row.target,
    sortOrder: row.sortOrder,
    isVisible: row.isVisible,
  }
  dialogVisible.value = true
}

function handleDelete(row: Menu) {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该菜单下有子菜单，无法删除')
    return
  }

  ElMessageBox.confirm(`确定要删除菜单 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await menuApi.delete(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        fetchMenus()
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
      const response = await menuApi.update(currentId.value, form.value)
      if (response.success) {
        ElMessage.success('更新成功')
        dialogVisible.value = false
        fetchMenus()
      }
    } else {
      const response = await menuApi.create(form.value)
      if (response.success) {
        ElMessage.success('创建成功')
        dialogVisible.value = false
        fetchMenus()
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchMenus()
})
</script>

<style scoped lang="scss">
.menus-page {
  // Page styles
}
</style>
