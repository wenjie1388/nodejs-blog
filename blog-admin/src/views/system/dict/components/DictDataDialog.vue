<template>
  <el-dialog v-model="visible" :title="title" width="500px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="字典类型">
        <el-input v-model="form.dictType" disabled />
      </el-form-item>
      <el-form-item label="字典标签" prop="dictLabel">
        <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
      </el-form-item>
      <el-form-item label="字典键值" prop="dictValue">
        <el-input v-model="form.dictValue" placeholder="请输入字典键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="dictSort">
        <el-input-number v-model="form.dictSort" :min="0" />
      </el-form-item>
      <el-form-item label="是否默认" prop="isDefault">
        <el-radio-group v-model="form.isDefault">
          <el-radio label="1">是</el-radio>
          <el-radio label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="1">正常</el-radio>
          <el-radio label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="样式属性" prop="cssClass">
        <el-input v-model="form.cssClass" placeholder="请输入CSS类名" />
      </el-form-item>
      <el-form-item label="表格样式" prop="listClass">
        <el-input v-model="form.listClass" placeholder="如：success, warning, danger" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { dictApi } from '@/api'

interface DictData {
  id?: number
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort: number
  isDefault: string
  status: string
  cssClass: string
  listClass: string
  remark: string
}

const props = defineProps<{
  modelValue: boolean
  dictType: string
  data?: DictData | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const isEdit = computed(() => !!props.data?.id)
const title = computed(() => (isEdit.value ? '编辑字典数据' : '新增字典数据'))

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  id: 0,
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  isDefault: '0',
  status: '1',
  cssClass: '',
  listClass: '',
  remark: '',
})

const rules: FormRules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
}

// 监听 data 和 dictType 变化
watch(
  [() => props.data, () => props.dictType],
  ([data, dictType]) => {
    if (data) {
      form.id = data.id || 0
      form.dictType = data.dictType
      form.dictLabel = data.dictLabel
      form.dictValue = data.dictValue
      form.dictSort = data.dictSort
      form.isDefault = data.isDefault
      form.status = data.status
      form.cssClass = data.cssClass || ''
      form.listClass = data.listClass || ''
      form.remark = data.remark || ''
    } else {
      resetForm(dictType)
    }
  },
  { immediate: true }
)

function resetForm(dictType: string = '') {
  form.id = 0
  form.dictType = dictType
  form.dictLabel = ''
  form.dictValue = ''
  form.dictSort = 0
  form.isDefault = '0'
  form.status = '1'
  form.cssClass = ''
  form.listClass = ''
  form.remark = ''
}

function handleClosed() {
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    const api = isEdit.value ? dictApi.updateDictData : dictApi.createDictData
    const res = await api(form.id || form, form.id ? undefined : form)
    if (res.success) {
      ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
      visible.value = false
      emit('success')
    }
  } finally {
    submitting.value = false
  }
}
</script>
