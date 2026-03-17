<template>
  <div class="not-found-page">
    <div class="container">
      <div class="error-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">页面未找到</h2>
        <p class="error-desc">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div class="error-actions">
          <router-link to="/" class="btn-primary">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </router-link>
          <router-link to="/articles" class="btn-secondary">
            <el-icon><Document /></el-icon>
            浏览文章
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-page {
  min-height: calc(100vh - var(--nav-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
}

.error-code {
  font-family: var(--font-display);
  font-size: clamp(6rem, 15vw, 12rem);
  font-weight: 900;
  line-height: 1;
  color: var(--accent-primary);
  margin-bottom: 16px;
  opacity: 0.8;
}

.error-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  margin-bottom: 16px;
}

.error-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3);
  }
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-primary);
    border-color: var(--text-primary);
  }
}
</style>
