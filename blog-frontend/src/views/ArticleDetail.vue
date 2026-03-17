<template>
  <div class="article-detail-page">
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <div style="padding: 40px;">
            <el-skeleton-item variant="text" style="width: 50%; height: 40px;" />
            <el-skeleton-item variant="text" style="width: 30%; margin-top: 20px;" />
            <el-skeleton-item variant="image" style="width: 100%; height: 400px; margin-top: 40px;" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <template v-else-if="article">
      <!-- Article Header -->
      <header class="article-header">
        <div class="container">
          <div class="article-meta">
            <router-link
              v-if="article.categorySlug"
              :to="`/category/${article.categorySlug}`"
              class="category-link"
            >
              {{ article.categoryName }}
            </router-link>
            <span class="separator">·</span>
            <span class="publish-date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(article.createdAt) }}
            </span>
          </div>

          <h1 class="article-title">{{ article.title }}</h1>

          <div class="article-author">
            <img
              v-if="article.authorAvatar"
              :src="article.authorAvatar"
              :alt="article.authorName"
              class="author-avatar"
            />
            <el-icon v-else class="author-avatar-placeholder"><User /></el-icon>
            <div class="author-info">
              <span class="author-name">{{ article.authorName }}</span>
              <span class="view-count">
                <el-icon><View /></el-icon>
                {{ formatNumber(article.viewCount) }} 浏览
              </span>
            </div>
          </div>

          <img
            v-if="article.coverImage"
            :src="article.coverImage"
            :alt="article.title"
            class="article-cover"
          />
        </div>
      </header>

      <!-- Article Content -->
      <article class="article-content-wrapper">
        <div class="container">
          <div class="content-layout">
            <main class="article-main">
              <div class="article-body" v-html="renderedContent"></div>

              <!-- Tags -->
              <div v-if="tags.length > 0" class="article-tags">
                <span class="tags-label">标签：</span>
                <router-link
                  v-for="tag in tags"
                  :key="tag"
                  :to="`/articles?tag=${tag}`"
                  class="tag-link"
                >
                  {{ tag }}
                </router-link>
              </div>

              <!-- Share -->
              <div class="article-share">
                <span class="share-label">分享：</span>
                <button class="share-btn" @click="shareToWeibo">
                  <el-icon><Share /></el-icon>
                </button>
                <button class="share-btn" @click="copyLink">
                  <el-icon><Link /></el-icon>
                </button>
              </div>
            </main>

            <!-- Sidebar -->
            <aside class="article-sidebar">
              <div class="sidebar-section">
                <h3 class="sidebar-title">目录</h3>
                <div class="toc-list">
                  <a
                    v-for="heading in headings"
                    :key="heading.id"
                    :href="`#${heading.id}`"
                    class="toc-item"
                    :class="{ 'is-h2': heading.level === 2, 'is-h3': heading.level === 3 }"
                    @click.prevent="scrollToHeading(heading.id)"
                  >
                    {{ heading.text }}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <!-- Related Articles -->
      <section v-if="relatedArticles.length > 0" class="related-articles">
        <div class="container">
          <h2 class="section-title">相关文章</h2>
          <div class="related-grid">
            <ArticleCard
              v-for="article in relatedArticles"
              :key="article.id"
              :article="article"
            />
          </div>
        </div>
      </section>
    </template>

    <div v-else class="error-container">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h2>文章未找到</h2>
      <p>该文章可能已被删除或不存在</p>
      <router-link to="/articles" class="btn-primary">
        返回文章列表
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { articleApi } from '@/api'
import type { Article } from '@/api'
import { formatDate, formatNumber, parseTags } from '@/utils/format'
import ArticleCard from '@/components/ArticleCard.vue'

const route = useRoute()
const router = useRouter()

// State
const article = ref<Article | null>(null)
const relatedArticles = ref<Article[]>([])
const loading = ref(true)
const headings = ref<{ id: string; text: string; level: number }[]>([])

// Computed
const tags = computed(() => parseTags(article.value?.tags || null))

const renderedContent = computed(() => {
  if (!article.value?.content) return ''
  
  // 配置marked
  marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value
      }
      return hljs.highlightAuto(code).value
    },
    breaks: true,
  })
  
  return marked(article.value.content)
})

// Methods
async function fetchArticle() {
  try {
    loading.value = true
    const id = parseInt(route.params.id as string)
    
    const response = await articleApi.getById(id)
    if (response.success) {
      article.value = response.data
      document.title = `${response.data.title} - 个人博客`
      
      // 提取目录
      nextTick(() => {
        extractHeadings()
      })
      
      // 获取相关文章
      fetchRelatedArticles(id)
    } else {
      article.value = null
    }
  } catch (error) {
    console.error('Failed to fetch article:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

async function fetchRelatedArticles(id: number) {
  try {
    const response = await articleApi.getRelated(id, 3)
    if (response.success) {
      relatedArticles.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch related articles:', error)
  }
}

function extractHeadings() {
  const articleBody = document.querySelector('.article-body')
  if (!articleBody) return
  
  const headingElements = articleBody.querySelectorAll('h2, h3')
  headings.value = Array.from(headingElements).map((el, index) => {
    const id = `heading-${index}`
    el.id = id
    return {
      id,
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1)),
    }
  })
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (element) {
    const offset = 100
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function shareToWeibo() {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(article.value?.title || '')
  window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank')
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制到剪贴板')
}

onMounted(() => {
  fetchArticle()
})
</script>

<style scoped lang="scss">
.article-detail-page {
  padding-bottom: 80px;
}

.loading-container {
  padding: 40px;
}

// Article Header
.article-header {
  padding: 60px 0 40px;
  text-align: center;
  background: var(--bg-secondary);
}

.article-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  font-size: 0.9rem;
}

.category-link {
  padding: 4px 12px;
  background: var(--accent-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

.separator {
  color: var(--text-secondary);
}

.publish-date {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.article-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  line-height: 1.3;
  max-width: 800px;
  margin: 0 auto 32px;
}

.article-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.author-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.author-name {
  font-weight: 600;
  color: var(--text-primary);
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.article-cover {
  width: 100%;
  max-width: 900px;
  height: auto;
  border-radius: 16px;
  margin: 0 auto;
  display: block;
}

// Article Content
.article-content-wrapper {
  padding: 60px 0;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 60px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.article-main {
  max-width: 800px;
}

.article-body {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-primary);

  :deep(h2) {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 600;
    margin: 48px 0 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-color);
  }

  :deep(h3) {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 600;
    margin: 32px 0 16px;
  }

  :deep(p) {
    margin-bottom: 20px;
  }

  :deep(a) {
    color: var(--accent-primary);
    text-decoration: underline;

    &:hover {
      opacity: 0.8;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 24px 0;
  }

  :deep(pre) {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
    overflow-x: auto;
    margin: 24px 0;

    code {
      background: none;
      padding: 0;
      font-size: 0.9rem;
    }
  }

  :deep(code) {
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
    font-family: 'Fira Code', monospace;
  }

  :deep(ul), :deep(ol) {
    margin: 20px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin-bottom: 8px;
  }

  :deep(blockquote) {
    border-left: 4px solid var(--accent-primary);
    padding-left: 20px;
    margin: 24px 0;
    color: var(--text-secondary);
    font-style: italic;
  }
}

.article-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.tags-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.tag-link {
  padding: 6px 14px;
  background: var(--bg-primary);
  border-radius: 16px;
  font-size: 0.85rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    color: white;
  }
}

.article-share {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.share-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.share-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    border-color: var(--accent-primary);
    color: white;
  }
}

// Sidebar
.article-sidebar {
  @media (max-width: 1024px) {
    display: none;
  }
}

.sidebar-section {
  position: sticky;
  top: 100px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.toc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 4px 0;

  &:hover {
    color: var(--accent-primary);
  }

  &.is-h2 {
    font-weight: 500;
  }

  &.is-h3 {
    padding-left: 16px;
    font-size: 0.85rem;
  }
}

// Related Articles
.related-articles {
  padding: 60px 0;
  background: var(--bg-secondary);
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 32px;
}

.related-grid {
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

// Error
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
    margin-bottom: 12px;
  }

  p {
    color: var(--text-secondary);
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
