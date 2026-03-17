# 博客管理后台系统

基于 Vue 3 + Vite + TypeScript 构建的博客内容管理后台。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **富文本编辑器**: WangEditor
- **图表**: ECharts + Vue-ECharts
- **样式**: SCSS

## 功能模块

### 内容管理
- 📄 文章管理（创建、编辑、发布、删除）
- 📁 分类管理

### 系统设置
- 👤 用户管理
- 📑 页面管理
- 🎨 主题管理
- 📋 菜单管理
- 📚 字典管理
- ⚙️ 基础设置

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

默认访问地址: http://localhost:5173

### 生产环境构建

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 项目结构

```
src/
├── api/              # API 接口
│   └── modules/      # 按模块组织的接口
├── components/       # 公共组件
│   └── Breadcrumb.vue
├── layouts/          # 布局组件
│   └── AdminLayout.vue
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── styles/           # 全局样式
├── utils/            # 工具函数
│   └── http.ts       # Axios 封装
└── views/            # 页面视图
    ├── article/      # 文章相关
    ├── system/       # 系统设置
    └── user/         # 用户相关
```

## 环境变量

复制 `.env` 文件并配置：

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## 开发规范

- 弹窗组件统一放在 `views/{module}/components/` 目录
- API 接口按模块组织在 `api/modules/` 目录
- 使用 Composition API 和 `<script setup>` 语法

## Docker 部署

```bash
docker build -t blog-admin .
docker run -p 80:80 blog-admin
```
