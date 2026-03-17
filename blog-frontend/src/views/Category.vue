<template>
  <div class="category-page">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated />
    </div>

    <template v-else-if="category">
      <div class="category-header">
        <div class="container">
          <div class="category-icon">
            <el-icon v-if="category.icon">
              <component :is="category.icon" />
            </el-icon>
            <el-icon v-else><Folder /></el-icon>
          </div>
          <h1 class="category-title">{{ category.name }}</h1>
          <p v-if="category.description" class="category-desc">
            {{ category.description }}
          </p>
          <span class="article-count">{{ category.articleCount }} 篇文章</span>
        </div>
      </div>

      <div class="container">
        <div v-if="articles.length > 0" class="articles-grid">
          <ArticleCard
            v-for="article in articles"
            :key="article.id"
            :article="article"
          />
        </div>

        <div v-else class="empty-state">
          <el-icon class="empty-icon"><DocumentDelete /></el-icon>
          <p>该分类下暂无文章</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </template>

    <div v-else class="error-container">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h2>分类未找到</h2>
      <router-link to="/" class="btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { categoryApi, articleApi } from '@/api'
import type { Category, Article } from '@/api'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()

const category = ref<Category | null>(null)
const articles = ref<Article[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(9)
const total = ref(0)
const totalPages = ref(0)

async function fetchData() {
  try {
    loading.value = true
    const slug = route.params.slug as string

    // 获取分类信息
    const categoryRes = await categoryApi.getBySlug(slug)
    if (categoryRes.success) {
      category.value = categoryRes.data
      document.title = `${categoryRes.data.name} - 个人博客`

      // 获取该分类下的文章
      const articlesRes = await articleApi.getList({
        page: currentPage.value,
        limit: pageSize.value,
        categoryId: categoryRes.data.id,
      })

      if (articlesRes.success) {
        articles.value = articlesRes.data
        total.value = articlesRes.pagination.total
        totalPages.value = articlesRes.pagination.totalPages
      }
    } else {
      category.value = null
    }
  } catch (error) {
    console.error('Failed to fetch category:', error)
    category.value = null
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.category-page {
  padding-bottom: 80px;
}

.loading-container {
  padding: 40px;
}

.category-header {
  padding: 80px 0;
  text-align: center;
  background: var(--bg-secondary);
  margin-bottom: 40px;
}

.category-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: var(--accent-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 24px;
}

.category-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 16px;
}

.category-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 16px;
  line-height: 1.6;
}

.article-count {
  display: inline-block;
  padding: 6px 16px;
  background: var(--bg-primary);
  border-radius: 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 1.1rem;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  text-align: center;

  .error-icon {
    font-size: 4rem;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  h2 {
    font-family: var(--font-display);
    font-size: 1.8rem;
    margin-bottom: 24px;
  }
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: var(--accent-primary);
  color: white;
  border-radius: 24px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3);
  }
}
</style>
