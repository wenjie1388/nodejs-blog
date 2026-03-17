// API 模块统一导出
// 使用方式: import { authApi } from '@/api'

// 用户模块
export { authApi } from './modules/user/auth'
export { userApi } from './modules/user/user'

// 文章模块
export { articleApi } from './modules/article/article'
export { categoryApi } from './modules/article/category'

// 系统模块
export { menuApi } from './modules/system/menu'
export { themeApi } from './modules/system/theme'
export { pageApi } from './modules/system/page'
export { statsApi } from './modules/system/stats'
export { uploadApi } from './modules/system/upload'
export { dictApi } from './modules/system/dict'

// 类型导出 - 用户模块
export type { User } from './modules/user/auth'
export type { User as UserType, UserListParams } from './modules/user/user'

// 类型导出 - 文章模块
export type { Article, ArticleListParams } from './modules/article/article'
export type { Category } from './modules/article/category'

// 类型导出 - 系统模块
export type { Menu } from './modules/system/menu'
export type { Theme } from './modules/system/theme'
export type { Page, PageListParams } from './modules/system/page'
export type { DashboardStats } from './modules/system/stats'
