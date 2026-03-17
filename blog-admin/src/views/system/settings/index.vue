<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>个人资料</span>
          </template>
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
          >
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="昵称" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="邮箱" />
            </el-form-item>
            <el-form-item label="头像" prop="avatar">
              <el-input v-model="profileForm.avatar" placeholder="头像URL" />
            </el-form-item>
            <el-form-item label="简介" prop="bio">
              <el-input
                v-model="profileForm.bio"
                type="textarea"
                :rows="4"
                placeholder="个人简介"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="profileSubmitting" @click="handleSaveProfile">
                保存
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <span>修改密码</span>
          </template>
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="原密码"
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="新密码"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="确认密码"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="passwordSubmitting" @click="handleChangePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card style="margin-top: 24px;">
          <template #header>
            <span>系统信息</span>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">系统版本</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">Node.js</span>
              <span class="info-value">v18.x</span>
            </div>
            <div class="info-item">
              <span class="info-label">Vue</span>
              <span class="info-value">v3.4.x</span>
            </div>
            <div class="info-item">
              <span class="info-label">Element Plus</span>
              <span class="info-value">v2.5.x</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi, authApi } from '@/api'

// Profile Form
const profileFormRef = ref()
const profileForm = ref({
  nickname: '',
  email: '',
  avatar: '',
  bio: '',
})
const profileSubmitting = ref(false)

const profileRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
}

// Password Form
const passwordFormRef = ref()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordSubmitting = ref(false)

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// Methods
async function fetchUserProfile() {
  try {
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}')
    if (user.id) {
      const response = await userApi.getById(user.id)
      if (response.success) {
        const data = response.data
        profileForm.value = {
          nickname: data.nickname || '',
          email: data.email || '',
          avatar: data.avatar || '',
          bio: data.bio || '',
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
  }
}

async function handleSaveProfile() {
  const valid = await profileFormRef.value?.validate()
  if (!valid) return

  try {
    profileSubmitting.value = true
    const user = JSON.parse(localStorage.getItem('admin_user') || '{}')
    if (user.id) {
      const response = await userApi.update(user.id, profileForm.value)
      if (response.success) {
        ElMessage.success('保存成功')
        // Update local storage
        const updatedUser = { ...user, ...profileForm.value }
        localStorage.setItem('admin_user', JSON.stringify(updatedUser))
      }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    profileSubmitting.value = false
  }
}

async function handleChangePassword() {
  const valid = await passwordFormRef.value?.validate()
  if (!valid) return

  try {
    passwordSubmitting.value = true
    const response = await authApi.changePassword(
      passwordForm.value.oldPassword,
      passwordForm.value.newPassword
    )
    if (response.success) {
      ElMessage.success('密码修改成功')
      passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    }
  } catch (error) {
    // Error handled by interceptor
  } finally {
    passwordSubmitting.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped lang="scss">
.settings-page {
  .system-info {
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }
    }

    .info-label {
      color: #909399;
    }

    .info-value {
      color: #606266;
      font-weight: 500;
    }
  }
}
</style>
