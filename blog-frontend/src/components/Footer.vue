<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <h3 class="brand-title">个人博客</h3>
          <p class="brand-desc">探索思想，发现世界。在这里分享关于技术、设计和生活的思考。</p>
          <div class="social-links">
            <a href="#" class="social-link" title="微博">
              <el-icon><Share /></el-icon>
            </a>
            <a href="#" class="social-link" title="微信">
              <el-icon><ChatDotRound /></el-icon>
            </a>
            <a href="#" class="social-link" title="GitHub">
              <el-icon><Platform /></el-icon>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">导航</h4>
            <router-link to="/" class="footer-link">首页</router-link>
            <router-link to="/articles" class="footer-link">文章</router-link>
            <router-link to="/about" class="footer-link">关于</router-link>
          </div>

          <div class="link-group">
            <h4 class="link-title">分类</h4>
            <router-link 
              v-for="category in categories" 
              :key="category.id"
              :to="`/category/${category.slug}`" 
              class="footer-link"
            >
              {{ category.name }}
            </router-link>
          </div>

          <div class="link-group">
            <h4 class="link-title">联系</h4>
            <a href="mailto:contact@blog.com" class="footer-link">contact@blog.com</a>
            <span class="footer-link">北京市朝阳区</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">© {{ currentYear }} 个人博客. All rights reserved.</p>
        <div class="stats">
          <span v-if="stats">
            {{ formatNumber(stats.articleCount) }} 文章 · 
            {{ formatNumber(stats.viewCount) }} 浏览 · 
            {{ stats.runningDays }} 天
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { categoryApi, statsApi } from '@/api'
import type { Category, PublicStats } from '@/api'
import { formatNumber } from '@/utils/format'

const categories = ref<Category[]>([])
const stats = ref<PublicStats | null>(null)

const currentYear = computed(() => new Date().getFullYear())

onMounted(async () => {
  try {
    // 获取分类
    const categoryRes = await categoryApi.getAll()
    if (categoryRes.success) {
      categories.value = categoryRes.data.slice(0, 4)
    }

    // 获取统计
    const statsRes = await statsApi.getPublicStats()
    if (statsRes.success) {
      stats.value = statsRes.data
    }
  } catch (error) {
    console.error('Failed to fetch footer data:', error)
  }
})
</script>

<style scoped lang="scss">
.footer {
  background: var(--bg-dark);
  color: var(--text-light);
  padding: 80px 0 40px;
}

.footer-container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 24px;
}

.footer-top {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.footer-brand {
  .brand-title {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: var(--text-light);
  }

  .brand-desc {
    font-size: 0.95rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 24px;
    max-width: 300px;
  }
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-light);
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    transform: translateY(-3px);
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 8px;
}

.footer-link {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: var(--text-light);
    padding-left: 4px;
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

.copyright {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.stats {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
