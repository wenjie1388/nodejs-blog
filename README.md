<div align="center">

# 🦞 BlogForge — AI 全栈博客系统

**由 Kimi Agent 生成｜三端分离｜Docker 一键部署**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-brightgreen.svg)](https://vuejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com)

[✨ 在线演示](#) · [📖 文档](#) · [🐛 反馈](../../issues) · [💬 讨论](../../discussions)

</div>

---

## 🖼️ 项目截图

> 📸 运行项目后截图替换下方占位图

| 前台首页 | 管理后台仪表盘 |
|:---:|:---:|
| <!-- 前台截图 --> `docs/images/frontend-home.png` | <!-- 后台截图 --> `docs/images/admin-dashboard.png` |

| 文章编辑 | 主题切换 |
|:---:|:---:|
| <!-- 编辑截图 --> `docs/images/article-edit.png` | <!-- 主题截图 --> `docs/images/theme-switch.png` |

---

## ✨ 亮点

- 🏗️ **三端分离** — 前台展示 + 管理后台 + API 服务，职责清晰
- 🎨 **多主题支持** — 默认 / 深色 / 清新三套主题自由切换
- 📝 **富文本编辑** — WangEditor 所见即所得，支持图片上传
- 📊 **数据仪表盘** — ECharts 可视化统计
- 🐳 **一键部署** — `docker-compose up` 即可运行全部服务
- 🔒 **安全认证** — JWT + bcryptjs，接口权限控制
- ⚡ **性能优化** — Redis 缓存、Gzip 压缩、代码分割

---

## 🛠️ 技术栈

### 后端 API
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![JWT](https://img.shields.io/badge/JWT-Auth-333333)

### 前台 & 后台
![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.5-409EFF)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![Pinia](https://img.shields.io/badge/Pinia-State-yellowgreen)
![GSAP](https://img.shields.io/badge/GSAP-Animation-88CE02)
![ECharts](https://img.shields.io/badge/ECharts-5.4-AA344D)

---

## 📁 项目结构

```
Kimi_Agent_个人博客三端架构/
├── blog-backend/          # API 服务 (Express)
│   ├── src/
│   │   ├── config/        # 数据库 & Redis 配置
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/     # 认证 & 校验中间件
│   │   ├── routes/        # 路由 (auth/article/category/menu/theme/page/upload/stats/dict)
│   │   ├── utils/         # JWT & 响应工具
│   │   ├── scripts/       # 数据库初始化脚本
│   │   └── app.js         # 入口文件
│   └── .env               # 环境变量
│
├── blog-frontend/         # 前台展示 (Vue 3)
│   ├── src/
│   │   ├── api/           # API 接口封装
│   │   ├── components/    # 通用组件 (导航/文章卡片/页脚/主题切换)
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── views/         # 页面 (首页/文章/分类/详情/关于)
│   │   └── assets/        # 样式 & 静态资源
│   └── vite.config.ts
│
├── blog-admin/            # 管理后台 (Vue 3)
│   ├── src/
│   │   ├── api/modules/   # 模块化 API
│   │   ├── layouts/       # 后台布局
│   │   ├── views/         # 仪表盘/文章管理/分类/菜单/主题/用户/字典/页面
│   │   └── stores/        # 认证状态
│   └── vite.config.ts
│
└── docker-compose.yml     # 一键编排
```

---

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
git clone <你的仓库地址>
cd Kimi_Agent_个人博客三端架构
docker-compose up -d
```

访问：
- 🌐 前台：http://localhost
- 🛠️ 后台：http://localhost:8080
- 👤 默认账号：`admin` / `admin123`

### 方式二：本地开发

```bash
# 1. 启动依赖服务
docker-compose up -d mysql redis

# 2. 后端
cd blog-backend
cp .env.example .env        # 编辑数据库配置
npm install
npm run init-db             # 初始化数据库
npm run dev                  # http://localhost:3001

# 3. 前台
cd blog-frontend
npm install
npm run dev                  # http://localhost:5173

# 4. 管理后台
cd blog-admin
npm install
npm run dev                  # http://localhost:5174
```

> ⚠️ 需要 Node.js 18+、MySQL 8.0、Redis 7

---

## 📡 API 概览

| 模块 | 端点 | 说明 |
|---|---|---|
| 认证 | `POST /api/auth/login` | 登录获取 JWT |
| | `POST /api/auth/register` | 注册 |
| 文章 | `GET/POST/PUT/DELETE /api/articles` | CRUD |
| 分类 | `GET/POST/PUT/DELETE /api/categories` | CRUD |
| 菜单 | `GET /api/menus/frontend` | 前台导航菜单 |
| 主题 | `GET /api/themes/default` | 获取默认主题 |
| 上传 | `POST /api/upload` | 图片上传 |
| 统计 | `GET /api/stats/dashboard` | 仪表盘数据 |
| 字典 | `GET/POST/PUT/DELETE /api/dict` | 数据字典管理 |

---

## 🎯 关于 AI 生成

这个项目由 **[Kimi](https://kimi.moonshot.cn)** Agent 从零生成，包括：

- ✅ 完整的三端架构设计
- ✅ RESTful API + JWT 认证
- ✅ Vue 3 组件化前端
- ✅ 数据库表结构设计
- ✅ Docker 部署编排
- ✅ 富文本编辑器集成
- ✅ ECharts 数据可视化

> 🤔 **AI 生成的代码质量如何？** 看看项目就知道了！欢迎提 Issue 反馈。

---

## 🗺️ 路线图

- [ ] 评论系统
- [ ] SEO 优化（SSR / SSG）
- [ ] RSS 订阅
- [ ] 文章标签系统
- [ ] 多语言支持
- [ ] OAuth 第三方登录

---

## 🤝 贡献

欢迎各种形式的贡献：

1. **Fork** 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 **Pull Request**

---

## 📄 许可证

[MIT](LICENSE) © 2025

---

<div align="center">

**如果觉得不错，给个 ⭐ Star 吧！**

Made with ❤️ by [你的名字] & 🤖 Kimi Agent

</div>