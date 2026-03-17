import apiClient from '@/utils/http'

export interface Article {
  id: number
  title: string
  content: string
  excerpt: string
  coverImage: string | null
  categoryId: number
  categoryName: string
  categorySlug: string
  authorId: number
  authorName: string
  authorAvatar: string | null
  tags: string | null
  status: 'draft' | 'published' | 'archived'
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface ArticleListParams {
  page?: number
  limit?: number
  categoryId?: number
  status?: string
  search?: string
  tag?: string
}

export interface ArticleListResponse {
  success: boolean
  data: Article[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const articleApi = {
  // 获取文章列表
  getList(params: ArticleListParams = {}) {
    return apiClient.get<ArticleListResponse>('/articles', { params })
  },

  // 获取文章详情
  getById(id: number) {
    return apiClient.get<{ success: boolean; data: Article }>(`/articles/${id}`)
  },

  // 获取相关文章
  getRelated(id: number, limit: number = 4) {
    return apiClient.get<{ success: boolean; data: Article[] }>(`/articles/${id}/related`, {
      params: { limit },
    })
  },
}
