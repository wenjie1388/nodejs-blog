# 个人博客前台系统

基于 Vue 3 + Vite + TypeScript 构建的现代化博客前台展示系统。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS

## 功能特性

- 🎨 现代化的响应式设计
- ✨ GSAP 动画效果
- 📜 Lenis 平滑滚动
- 📝 Markdown 文章渲染 (Marked)
- 💻 代码语法高亮 (Highlight.js)
- 🌓 深色/浅色主题切换
- 📱 移动端适配

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

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
├── api/           # API 接口
├── components/    # 公共组件
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── styles/        # 全局样式
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 环境变量

复制 `.env` 文件并配置：

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Docker 部署

```bash
docker build -t blog-frontend .
docker run -p 80:80 blog-frontend
```
