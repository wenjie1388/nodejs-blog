import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'Odometer' },
      },
      {
        path: 'content',
        name: 'Content',
        redirect: '/content/articles',
        meta: { title: '内容管理', icon: 'Document' },
        children: [
          {
            path: 'articles',
            name: 'Articles',
            component: () => import('@/views/article/Articles.vue'),
            meta: { title: '文章管理' },
          },
          {
            path: 'articles/create',
            name: 'CreateArticle',
            component: () => import('@/views/article/ArticleEdit.vue'),
            meta: { title: '创建文章', hidden: true },
          },
          {
            path: 'articles/edit/:id',
            name: 'EditArticle',
            component: () => import('@/views/article/ArticleEdit.vue'),
            meta: { title: '编辑文章', hidden: true },
          },
          {
            path: 'categories',
            name: 'Categories',
            component: () => import('@/views/article/Categories.vue'),
            meta: { title: '分类管理' },
          },
          {
            path: 'tags',
            name: 'Tags',
            component: () => import('@/views/article/Tags.vue'),
            meta: { title: '标签管理' },
          },
        ],
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/settings',
        meta: { title: '系统设置', icon: 'Setting' },
        children: [
          {
            path: 'settings',
            name: 'Settings',
            component: () => import('@/views/system/settings/index.vue'),
            meta: { title: '基础设置' },
          },
          {
            path: 'users',
            name: 'Users',
            component: () => import('@/views/user/Users.vue'),
            meta: { title: '用户管理' },
          },
          {
            path: 'pages',
            name: 'Pages',
            component: () => import('@/views/system/pages/index.vue'),
            meta: { title: '页面管理' },
          },
          {
            path: 'pages/create',
            name: 'CreatePage',
            component: () => import('@/views/system/pages/edit.vue'),
            meta: { title: '创建页面', hidden: true },
          },
          {
            path: 'pages/edit/:id',
            name: 'EditPage',
            component: () => import('@/views/system/pages/edit.vue'),
            meta: { title: '编辑页面', hidden: true },
          },
          {
            path: 'themes',
            name: 'Themes',
            component: () => import('@/views/system/themes/index.vue'),
            meta: { title: '主题管理' },
          },
          {
            path: 'menus',
            name: 'Menus',
            component: () => import('@/views/system/menus/index.vue'),
            meta: { title: '菜单管理' },
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/views/system/dict/index.vue'),
            meta: { title: '字典管理' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    next()
    return
  }

  if (!authStore.isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router
