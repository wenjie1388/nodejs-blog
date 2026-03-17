<template>
  <el-dialog v-model="visible" :title="title" width="500px" @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="form.dictName" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="form.dictType" placeholder="请输入字典类型，如：sys_status" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="1">正常</el-radio>
          <el-radio label="0">停用</el-radio>
        </el-radio-group>
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

interface DictType {
  id?: number
  dictName: string
  dictType: string
  status: string
  remark: string
}

const props = defineProps<{
  modelValue: boolean
  data?: DictType | null
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
const title = computed(() => (isEdit.value ? '编辑字典类型' : '新增字典类型'))

const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  id: 0,
  dictName: '',
  dictType: '',
  status: '1',
  remark: '',
})

const rules: FormRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '以小写字母开头，只能包含小写字母、数字、下划线', trigger: 'blur' },
  ],
}

// 监听 data 变化，初始化表单
watch(
  () => props.data,
  (val) => {
    if (val) {
      form.id = val.id || 0
      form.dictName = val.dictName
      form.dictType = val.dictType
      form.status = val.status
      form.remark = val.remark || ''
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  form.id = 0
  form.dictName = ''
  form.dictType = ''
  form.status = '1'
  form.remark = ''
}

function handleClosed() {
  resetForm()
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  submitting.value = true
  try {
    const api = isEdit.value ? dictApi.updateDictType : dictApi.createDictType
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
