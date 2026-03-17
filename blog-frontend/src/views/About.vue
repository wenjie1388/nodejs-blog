<template>
  <div class="about-page">
    <div class="about-hero">
      <div class="container">
        <div class="about-content">
          <div class="about-image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop"
              alt="About Me"
              class="about-image"
            />
          </div>
          <div class="about-text">
            <h1 class="about-title">关于我</h1>
            <p class="about-subtitle">热爱技术与设计的开发者</p>
            <div class="about-description">
              <p>
                你好！我是一名全栈开发者，专注于构建优雅、高效的Web应用。
                我相信好的代码不仅要能工作，还要易于维护和理解。
              </p>
              <p>
                在这个博客中，我会分享我在技术探索过程中的心得体会，
                包括前端开发、后端架构、UI设计以及生活感悟。
              </p>
              <p>
                除了编程，我还喜欢阅读、摄影和旅行。
                我相信保持好奇心和持续学习是成长的关键。
              </p>
            </div>
            <div class="about-stats">
              <div class="stat">
                <span class="stat-value">{{ stats?.articleCount || 0 }}</span>
                <span class="stat-label">文章</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ stats?.categoryCount || 0 }}</span>
                <span class="stat-label">分类</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ stats?.runningDays || 0 }}</span>
                <span class="stat-label">运营天数</span>
              </div>
            </div>
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
              <a href="mailto:contact@blog.com" class="social-link" title="邮箱">
                <el-icon><Message /></el-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills Section -->
    <section class="skills-section">
      <div class="container">
        <h2 class="section-title">技术栈</h2>
        <div class="skills-grid">
          <div class="skill-card">
            <div class="skill-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <h3 class="skill-name">前端开发</h3>
            <p class="skill-desc">Vue.js, React, TypeScript, Tailwind CSS</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon">
              <el-icon><Server /></el-icon>
            </div>
            <h3 class="skill-name">后端开发</h3>
            <p class="skill-desc">Node.js, Python, MySQL, Redis</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon">
              <el-icon><Brush /></el-icon>
            </div>
            <h3 class="skill-name">UI/UX 设计</h3>
            <p class="skill-desc">Figma, Adobe XD, 设计系统</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon">
              <el-icon><Tools /></el-icon>
            </div>
            <h3 class="skill-name">DevOps</h3>
            <p class="skill-desc">Docker, CI/CD, 云服务</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-content">
          <h2 class="section-title">保持联系</h2>
          <p class="contact-desc">
            如果你有任何问题或建议，欢迎随时与我联系。
            我也很乐意参与开源项目和技术交流。
          </p>
          <router-link to="/" class="btn-primary">
            阅读我的文章
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statsApi } from '@/api'
import type { PublicStats } from '@/api'

const stats = ref<PublicStats | null>(null)

onMounted(async () => {
  try {
    const response = await statsApi.getPublicStats()
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})
</script>

<style scoped lang="scss">
.about-page {
  padding-bottom: 0;
}

.about-hero {
  padding: 80px 0;
  background: var(--bg-secondary);
}

.about-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 80px;
  align-items: center;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
}

.about-image-wrapper {
  position: relative;

  @media (max-width: 968px) {
    max-width: 400px;
    margin: 0 auto;
  }
}

.about-image {
  width: 100%;
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
}

.about-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 8px;
}

.about-subtitle {
  font-size: 1.2rem;
  color: var(--accent-primary);
  margin-bottom: 24px;
  font-weight: 500;
}

.about-description {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  p {
    font-size: 1.05rem;
    line-height: 1.8;
    color: var(--text-secondary);
  }
}

.about-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;

  @media (max-width: 968px) {
    justify-content: center;
  }
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  gap: 12px;

  @media (max-width: 968px) {
    justify-content: center;
  }
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1.3rem;
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-primary);
    color: white;
    transform: translateY(-3px);
  }
}

// Skills Section
.skills-section {
  padding: var(--section-padding) 0;
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
}

.skills-grid {
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

.skill-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 24px;
  background: var(--bg-secondary);
  border-radius: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.5s var(--transition-fluid);

  &:hover {
    transform: translateY(-8px);
    border-color: var(--accent-primary);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

    .skill-icon {
      background: var(--accent-primary);
      color: white;
      transform: rotate(10deg);
    }
  }
}

.skill-icon {
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

.skill-name {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.skill-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

// Contact Section
.contact-section {
  padding: var(--section-padding) 0;
  background: var(--bg-dark);
  color: var(--text-light);
}

.contact-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;

  .section-title {
    color: var(--text-light);
  }
}

.contact-desc {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  margin-bottom: 32px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: var(--accent-primary);
  color: white;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3);
  }
}
</style>
