<template>
  <div class="not-found-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-desc">抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-page {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
  margin-bottom: 16px;
}

.error-title {
  font-size: 1.8rem;
  color: #303133;
  margin-bottom: 12px;
}

.error-desc {
  color: #909399;
  margin-bottom: 24px;
}
</style>
