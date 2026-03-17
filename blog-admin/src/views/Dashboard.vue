<template>
  <div class="dashboard-page">
    <!-- Stats Cards -->
    <div class="stats-row">
      <el-row :gutter="24">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon articles">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.articles.total || 0 }}</span>
              <span class="stat-label">总文章</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon views">
              <el-icon><View /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(stats?.views.total || 0) }}</span>
              <span class="stat-label">总浏览</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon categories">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.categories.total || 0 }}</span>
              <span class="stat-label">分类</span>
            </div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="stat-card">
            <div class="stat-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.users.total || 0 }}</span>
              <span class="stat-label">用户</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- Charts -->
    <el-row :gutter="24" class="charts-row">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>文章发布趋势</span>
              <el-radio-group v-model="trendDays" size="small" @change="fetchTrend">
                <el-radio-button :label="7">近7天</el-radio-button>
                <el-radio-button :label="30">近30天</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="trendChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>分类分布</span>
            </div>
          </template>
          <v-chart class="chart pie-chart" :option="categoryChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- Recent & Popular Articles -->
    <el-row :gutter="24" class="articles-row">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近文章</span>
              <router-link to="/articles">查看全部</router-link>
            </div>
          </template>
          <el-table :data="stats?.recentArticles || []" stripe>
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template #default="{ row }">
                <router-link :to="`/articles/edit/${row.id}`" class="article-link">
                  {{ row.title }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column prop="categoryName" label="分类" width="100" />
            <el-table-column prop="createdAt" label="发布时间" width="150">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>热门文章</span>
              <router-link to="/articles">查看全部</router-link>
            </div>
          </template>
          <el-table :data="stats?.popularArticles || []" stripe>
            <el-table-column prop="title" label="标题" show-overflow-tooltip>
              <template #default="{ row }">
                <router-link :to="`/articles/edit/${row.id}`" class="article-link">
                  {{ row.title }}
                </router-link>
              </template>
            </el-table-column>
            <el-table-column prop="viewCount" label="浏览量" width="100">
              <template #default="{ row }">
                <el-tag type="success">{{ row.viewCount }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布时间" width="150">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { statsApi } from '@/api'
import type { DashboardStats } from '@/api'
import dayjs from 'dayjs'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
])

// State
const stats = ref<DashboardStats | null>(null)
const trendDays = ref(30)
const trendData = ref<Array<{ date: string; count: number }>>([])
const categoryData = ref<Array<{ name: string; count: number }>>([])

// Computed
const trendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: trendData.value.map(d => dayjs(d.date).format('MM-DD')),
    axisLine: { lineStyle: { color: '#909399' } },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: '#e4e7ed' } },
  },
  series: [
    {
      data: trendData.value.map(d => d.count),
      type: 'line',
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ],
        },
      },
      itemStyle: { color: '#409eff' },
    },
  ],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
}))

const categoryChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      data: categoryData.value.map(d => ({ name: d.name, value: d.count })),
    },
  ],
}))

// Methods
async function fetchStats() {
  try {
    const response = await statsApi.getDashboard()
    if (response.success) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

async function fetchTrend() {
  try {
    const response = await statsApi.getArticleTrend(trendDays.value)
    if (response.success) {
      trendData.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch trend:', error)
  }
}

async function fetchCategoryDistribution() {
  try {
    const response = await statsApi.getCategoryDistribution()
    if (response.success) {
      categoryData.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch category distribution:', error)
  }
}

function formatNumber(num: number) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

function formatDate(date: string) {
  return dayjs(date).format('YYYY-MM-DD')
}

onMounted(() => {
  fetchStats()
  fetchTrend()
  fetchCategoryDistribution()
})
</script>

<style scoped lang="scss">
.dashboard-page {
  .stats-row {
    margin-bottom: 24px;
  }

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;

    &.articles {
      background: rgba(64, 158, 255, 0.1);
      color: #409eff;
    }

    &.views {
      background: rgba(103, 194, 58, 0.1);
      color: #67c23a;
    }

    &.categories {
      background: rgba(230, 162, 60, 0.1);
      color: #e6a23c;
    }

    &.users {
      background: rgba(245, 108, 108, 0.1);
      color: #f56c6c;
    }
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 600;
    color: #303133;
  }

  .stat-label {
    font-size: 0.9rem;
    color: #909399;
  }

  .charts-row {
    margin-bottom: 24px;
  }

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart {
      height: 300px;

      &.pie-chart {
        height: 350px;
      }
    }
  }

  .articles-row {
    .el-col {
      margin-bottom: 24px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
      color: #409eff;
      font-size: 0.9rem;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .article-link {
    color: #606266;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
