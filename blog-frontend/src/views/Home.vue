<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <h1 class="hero-title">
            <span class="title-line">探索思想</span>
            <span class="title-line">发现世界</span>
          </h1>
          <p class="hero-desc">
            在这里，我分享关于技术、设计和生活的思考。
            <br />希望我的文章能给你带来一些启发和帮助。
          </p>
          <div class="hero-actions">
            <router-link to="/articles" class="btn-primary">
              开始阅读
              <el-icon><ArrowRight /></el-icon>
            </router-link>
            <router-link to="/about" class="btn-secondary">
              了解更多
            </router-link>
          </div>
        </div>
        <div class="hero-image-wrapper">
          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop"
            alt="Hero Image"
            class="hero-image"
          />
          <div class="floating-card card-1">
            <el-icon><Document /></el-icon>
            <span>{{ stats?.articleCount || 0 }} 文章</span>
          </div>
          <div class="floating-card card-2">
            <el-icon><View /></el-icon>
            <span>{{ formatNumber(stats?.viewCount || 0) }} 浏览</span>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <div class="mouse">
          <div class="wheel"></div>
        </div>
        <span>向下滚动</span>
      </div>
    </section>

    <!-- Latest Articles Section -->
    <section class="articles-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">最新文章</h2>
          <router-link to="/articles" class="view-all">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>

        <div v-if="loading" class="articles-grid">
          <el-skeleton v-for="i in 6" :key="i" animated>
            <template #template>
              <div style="padding: 20px;">
                <el-skeleton-item variant="image" style="width: 100%; height: 200px;" />
                <div style="margin-top: 16px;">
                  <el-skeleton-item variant="text" style="width: 30%;" />
                  <el-skeleton-item variant="text" style="width: 80%; margin-top: 12px;" />
                  <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px;" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>

        <div v-else class="articles-grid">
          <ArticleCard
            v-for="(article, index) in latestArticles"
            :key="article.id"
            :article="article"
            :featured="index === 0"
            class="article-item"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">探索分类</h2>
        </div>

        <div class="categories-grid">
          <router-link
            v-for="category in categories"
            :key="category.id"
            :to="`/category/${category.slug}`"
            class="category-card"
          >
            <div class="category-icon">
              <el-icon v-if="category.icon">
                <component :is="category.icon" />
              </el-icon>
              <el-icon v-else><Folder /></el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.articleCount }} 篇文章</p>
            <p v-if="category.description" class="category-desc">
              {{ category.description }}
            </p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-number">{{ stats?.articleCount || 0 }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats?.categoryCount || 0 }}</span>
            <span class="stat-label">分类</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ formatNumber(stats?.viewCount || 0) }}</span>
            <span class="stat-label">浏览</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats?.runningDays || 0 }}</span>
            <span class="stat-label">运营天数</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { articleApi, categoryApi, statsApi } from '@/api'
import type { Article, Category, PublicStats } from '@/api'
import { formatNumber } from '@/utils/format'
import ArticleCard from '@/components/ArticleCard.vue'

const latestArticles = ref<Article[]>([])
const categories = ref<Category[]>([])
const stats = ref<PublicStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // 获取最新文章
    const articlesRes = await articleApi.getList({ limit: 6 })
    if (articlesRes.success) {
      latestArticles.value = articlesRes.data
    }

    // 获取分类
    const categoriesRes = await categoryApi.getAll()
    if (categoriesRes.success) {
      categories.value = categoriesRes.data
    }

    // 获取统计
    const statsRes = await statsApi.getPublicStats()
    if (statsRes.success) {
      stats.value = statsRes.data
    }
  } catch (error) {
    console.error('Failed to fetch home data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
.home-page {
  overflow-x: hidden;
}

// Hero Section
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-padding) 0;
  position: relative;
}

.hero-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.hero-content {
  animation: fadeInUp 1s var(--transition-fluid) forwards;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;

  .title-line {
    display: block;

    &:last-child {
      color: var(--accent-primary);
    }
  }
}

.hero-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 32px;
  max-width: 500px;

  @media (max-width: 968px) {
    margin-left: auto;
    margin-right: auto;
  }
}

.hero-actions {
  display: flex;
  gap: 16px;

  @media (max-width: 968px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
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

.hero-image-wrapper {
  position: relative;
  animation: fadeInUp 1s var(--transition-fluid) 0.2s forwards;
  opacity: 0;

  @media (max-width: 968px) {
    order: -1;
  }
}

.hero-image {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.floating-card {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  font-size: 0.9rem;
  font-weight: 500;
  animation: float 3s ease-in-out infinite;

  &.card-1 {
    top: 20px;
    right: -20px;
    animation-delay: 0s;
  }

  &.card-2 {
    bottom: 40px;
    left: -20px;
    animation-delay: 1.5s;
  }

  @media (max-width: 968px) {
    &.card-1 {
      right: 10px;
    }

    &.card-2 {
      left: 10px;
    }
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 0.85rem;

  .mouse {
    width: 24px;
    height: 40px;
    border: 2px solid var(--text-secondary);
    border-radius: 12px;
    position: relative;

    .wheel {
      width: 4px;
      height: 8px;
      background: var(--text-secondary);
      border-radius: 2px;
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      animation: scrollWheel 1.5s ease-in-out infinite;
    }
  }
}

@keyframes scrollWheel {
  0% {
    top: 6px;
    opacity: 1;
  }
  100% {
    top: 20px;
    opacity: 0;
  }
}

// Articles Section
.articles-section {
  padding: var(--section-padding) 0;
  background: var(--bg-secondary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s ease;

  &:hover {
    color: var(--accent-primary);
    gap: 8px;
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  .article-item {
    animation: fadeInUp 0.8s var(--transition-fluid) forwards;
    opacity: 0;

    &:first-child {
      grid-column: span 2;

      @media (max-width: 640px) {
        grid-column: span 1;
      }
    }
  }
}

// Categories Section
categories-section {
  padding: var(--section-padding) 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  background: var(--bg-secondary);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.5s var(--transition-fluid);
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-8px);
    border-color: var(--accent-primary);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    .category-icon {
      background: var(--accent-primary);
      color: white;
      transform: rotate(10deg);
    }
  }
}

.category-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.category-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.category-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.category-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

// Stats Section
.stats-section {
  padding: var(--section-padding) 0;
  background: var(--bg-dark);
  color: var(--text-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-number {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: var(--accent-primary);
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
}
</style>
