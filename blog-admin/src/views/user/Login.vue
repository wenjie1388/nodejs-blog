<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-header">
        <el-icon class="logo-icon"><Document /></el-icon>
        <h1 class="login-title">博客管理后台</h1>
        <p class="login-subtitle">请登录以继续</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>默认账号: admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

// State
const formRef = ref()
const form = ref({
  username: '',
  password: '',
})
const loading = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

// Methods
async function handleLogin() {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    loading.value = true
    const success = await authStore.login(form.value.username, form.value.password)
    
    if (success) {
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error('登录失败，请检查用户名和密码')
    }
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 如果已登录，跳转到首页
  if (authStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 16px;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #909399;
}

.login-form {
  .el-input {
    --el-input-height: 48px;
  }
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 0.85rem;
  color: #909399;
}
</style>
