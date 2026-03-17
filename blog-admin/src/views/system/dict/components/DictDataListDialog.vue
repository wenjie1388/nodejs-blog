<template>
  <el-dialog v-model="visible" title="字典数据管理" width="900px" @open="handleOpen">
    <div class="data-dialog-header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增字典数据
      </el-button>
    </div>
    <el-table v-loading="loading" :data="tableData" stripe>
      <el-table-column prop="dictLabel" label="字典标签" min-width="120" />
      <el-table-column prop="dictValue" label="字典键值" min-width="120" />
      <el-table-column prop="dictSort" label="排序" width="80" />
      <el-table-column prop="isDefault" label="是否默认" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isDefault === '1' ? 'success' : 'info'">
            {{ row.isDefault === '1' ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === '1' ? 'success' : 'danger'">
            {{ row.status === '1' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
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
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dictApi } from '@/api'

const props = defineProps<{
  modelValue: boolean
  dictType: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  add: []
  edit: [row: any]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const loading = ref(false)
const tableData = ref<any[]>([])
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

function handleOpen() {
  pagination.page = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await dictApi.getDictData({
      page: pagination.page,
      limit: pagination.limit,
      dictType: props.dictType,
    })
    if (res.success) {
      tableData.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } finally {
    loading.value = false
  }
}

function handleSizeChange(val: number) {
  pagination.limit = val
  fetchData()
}

function handlePageChange(val: number) {
  pagination.page = val
  fetchData()
}

function handleAdd() {
  emit('add')
}

function handleEdit(row: any) {
  emit('edit', row)
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除该字典数据吗？', '提示', { type: 'warning' })
    const res = await dictApi.deleteDictData(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchData()
    }
  } catch (error) {
    // 取消删除
  }
}

defineExpose({
  refresh: fetchData,
})
</script>

<style scoped lang="scss">
.data-dialog-header {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
