<template>
  <div class="articles-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">文章列表</h1>
        <p class="page-desc">探索所有文章，发现有趣的内容</p>
      </div>
    </div>

    <div class="container">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button
            class="filter-tab"
            :class="{ 'is-active': !selectedCategory }"
            @click="selectCategory(null)"
          >
            全部
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            class="filter-tab"
            :class="{ 'is-active': selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-if="loading" class="articles-grid">
        <el-skeleton v-for="i in 9" :key="i" animated>
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

      <div v-else-if="articles.length > 0" class="articles-grid">
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <div v-else class="empty-state">
        <el-icon class="empty-icon"><DocumentDelete /></el-icon>
        <p>暂无文章</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { articleApi, categoryApi } from '@/api'
import type { Article, Category } from '@/api'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()

// State
const articles = ref<Article[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(9)
const total = ref(0)
const totalPages = ref(0)
const selectedCategory = ref<number | null>(null)
const searchQuery = ref('')

// Methods
async function fetchArticles() {
  try {
    loading.value = true
    const response = await articleApi.getList({
      page: currentPage.value,
      limit: pageSize.value,
      categoryId: selectedCategory.value || undefined,
      search: searchQuery.value || undefined,
    })

    if (response.success) {
      articles.value = response.data
      total.value = response.pagination.total
      totalPages.value = response.pagination.totalPages
    }
  } catch (error) {
    console.error('Failed to fetch articles:', error)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const response = await categoryApi.getAll()
    if (response.success) {
      categories.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

function selectCategory(categoryId: number | null) {
  selectedCategory.value = categoryId
  currentPage.value = 1
  fetchArticles()
}

function handleSearch() {
  currentPage.value = 1
  fetchArticles()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchArticles()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for route query changes
watch(
  () => route.query,
  (query) => {
    if (query.category) {
      selectedCategory.value = parseInt(query.category as string)
    }
    if (query.search) {
      searchQuery.value = query.search as string
    }
    if (query.page) {
      currentPage.value = parseInt(query.page as string)
    }
    fetchArticles()
  },
  { immediate: true }
)

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.articles-page {
  padding-bottom: 80px;
}

.page-header {
  padding: 80px 0 40px;
  text-align: center;
  background: var(--bg-secondary);
  margin-bottom: 40px;
}

.page-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 12px;
}

.page-desc {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--text-primary);
  }

  &.is-active {
    background: var(--text-primary);
    color: var(--bg-primary);
    border-color: var(--text-primary);
  }
}

.search-box {
  width: 280px;

  @media (max-width: 640px) {
    width: 100%;
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
</style>
