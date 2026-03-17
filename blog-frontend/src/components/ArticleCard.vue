<template>
  <article class="article-card" :class="{ 'is-featured': featured }">
    <router-link :to="`/article/${article.id}`" class="card-link">
      <div class="card-image-wrapper">
        <img
          v-if="article.coverImage"
          :src="article.coverImage"
          :alt="article.title"
          class="card-image"
        />
        <div v-else class="card-image-placeholder">
          <el-icon><Document /></el-icon>
        </div>
        <div class="card-overlay">
          <span class="read-more">阅读更多</span>
        </div>
      </div>

      <div class="card-content">
        <div class="card-meta">
          <span v-if="article.categoryName" class="category-tag">
            {{ article.categoryName }}
          </span>
          <span class="publish-date">
            <el-icon><Calendar /></el-icon>
            {{ formatDate(article.createdAt) }}
          </span>
        </div>

        <h3 class="card-title">{{ article.title }}</h3>

        <p v-if="article.excerpt" class="card-excerpt">
          {{ article.excerpt }}
        </p>

        <div class="card-footer">
          <div class="author-info" v-if="article.authorName">
            <img
              v-if="article.authorAvatar"
              :src="article.authorAvatar"
              :alt="article.authorName"
              class="author-avatar"
            />
            <el-icon v-else class="author-avatar-placeholder"><User /></el-icon>
            <span class="author-name">{{ article.authorName }}</span>
          </div>

          <div class="article-stats">
            <span class="stat-item">
              <el-icon><View /></el-icon>
              {{ formatNumber(article.viewCount) }}
            </span>
          </div>
        </div>

        <div v-if="tags.length > 0" class="card-tags">
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </router-link>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '@/api'
import { formatDate, formatNumber, parseTags } from '@/utils/format'

interface Props {
  article: Article
  featured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
})

const tags = computed(() => parseTags(props.article.tags))
</script>

<style scoped lang="scss">
.article-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.5s var(--transition-fluid);
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    .card-image {
      transform: scale(1.05);
    }

    .card-overlay {
      opacity: 1;
    }
  }

  &.is-featured {
    .card-image-wrapper {
      height: 280px;
    }

    .card-title {
      font-size: 1.5rem;
    }
  }
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: var(--bg-primary);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s var(--transition-fluid);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-secondary);
  opacity: 0.3;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.read-more {
  padding: 10px 24px;
  background: var(--accent-primary);
  color: white;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 500;
}

.card-content {
  padding: 24px;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-tag {
  padding: 4px 12px;
  background: var(--accent-primary);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.publish-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 12px;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-excerpt {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.author-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.article-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag {
  padding: 4px 10px;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
