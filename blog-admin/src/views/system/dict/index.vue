<template>
  <div class="dict-page">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="字典名称">
          <el-input v-model="searchForm.dictName" placeholder="请输入字典名称" clearable />
        </el-form-item>
        <el-form-item label="字典类型">
          <el-input v-model="searchForm.dictType" placeholder="请输入字典类型" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>字典类型列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增字典类型
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column prop="dictName" label="字典名称" min-width="120" />
        <el-table-column prop="dictType" label="字典类型" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewData(row)">{{ row.dictType }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'danger'">
              {{ row.status === '1' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewData(row)">字典数据</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
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

    <!-- 字典类型新增/编辑弹窗 -->
    <DictTypeDialog v-model="typeDialogVisible" :data="currentType" @success="fetchData" />

    <!-- 字典数据列表弹窗 -->
    <DictDataListDialog
      ref="dataListDialogRef"
      v-model="dataDialogVisible"
      :dict-type="currentDictType"
      @add="handleAddData"
      @edit="handleEditData"
    />

    <!-- 字典数据新增/编辑弹窗 -->
    <DictDataDialog
      v-model="dataEditDialogVisible"
      :dict-type="currentDictType"
      :data="currentData"
      @success="handleDataSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dictApi } from '@/api'
import DictTypeDialog from './components/DictTypeDialog.vue'
import DictDataListDialog from './components/DictDataListDialog.vue'
import DictDataDialog from './components/DictDataDialog.vue'

// 搜索表单
const searchForm = reactive({
  dictName: '',
  dictType: '',
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

// 字典类型弹窗
const typeDialogVisible = ref(false)
const currentType = ref<any>(null)

// 字典数据列表弹窗
const dataDialogVisible = ref(false)
const currentDictType = ref('')
const dataListDialogRef = ref<InstanceType<typeof DictDataListDialog>>()

// 字典数据编辑弹窗
const dataEditDialogVisible = ref(false)
const currentData = ref<any>(null)

// 初始化
onMounted(() => {
  fetchData()
})

// 获取字典类型列表
async function fetchData() {
  loading.value = true
  try {
    const res = await dictApi.getDictTypes({
      page: pagination.page,
      limit: pagination.limit,
      keyword: searchForm.dictName || searchForm.dictType ? searchForm.dictName : '',
    })
    console.log('res:', res)
    if (res.success) {
      tableData.value = res.data
      pagination.total = res.pagination.total
    }
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchData()
}

// 重置
function handleReset() {
  searchForm.dictName = ''
  searchForm.dictType = ''
  handleSearch()
}

// 分页
function handleSizeChange(val: number) {
  pagination.limit = val
  fetchData()
}

function handlePageChange(val: number) {
  pagination.page = val
  fetchData()
}

// 新增
function handleAdd() {
  currentType.value = null
  typeDialogVisible.value = true
}

// 编辑
function handleEdit(row: any) {
  currentType.value = row
  typeDialogVisible.value = true
}

// 删除
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除该字典类型吗？', '提示', { type: 'warning' })
    const res = await dictApi.deleteDictType(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchData()
    }
  } catch (error) {
    // 取消删除
  }
}

// 查看字典数据
function handleViewData(row: any) {
  currentDictType.value = row.dictType
  dataDialogVisible.value = true
}

// 新增字典数据
function handleAddData() {
  currentData.value = null
  dataEditDialogVisible.value = true
}

// 编辑字典数据
function handleEditData(row: any) {
  currentData.value = row
  dataEditDialogVisible.value = true
}

// 字典数据操作成功
function handleDataSuccess() {
  dataListDialogRef.value?.refresh()
}

// 格式化日期
function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}
</script>

<style scoped lang="scss">
.dict-page {
  .search-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
