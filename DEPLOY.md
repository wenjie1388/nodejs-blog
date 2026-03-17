# 个人博客系统 - 部署指南

## 📋 部署方式选择

本项目支持两种部署方式：

1. **Docker 部署（推荐）** - 一键部署，环境隔离，适合生产环境
2. **手动部署** - 需要手动安装配置各组件，适合开发环境

---

## 🐳 Docker 部署（推荐）

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 2GB+ 可用内存
- 10GB+ 可用磁盘空间

### 快速开始

#### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd Kimi_Agent_个人博客三端架构
```

#### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
nano .env
```

**重要：请修改以下配置项：**

```env
# 数据库密码（必须修改）
MYSQL_ROOT_PASSWORD=your_secure_password
DB_PASSWORD=your_secure_password

# JWT 密钥（必须修改，用于用户认证）
JWT_SECRET=your_random_secret_key_at_least_32_chars

# 端口配置（根据需要修改）
BACKEND_PORT=3001
FRONTEND_PORT=80
ADMIN_PORT=8080
```

#### 3. 一键部署

```bash
# 添加执行权限
chmod +x deploy.sh

# 首次安装
./deploy.sh install
```

#### 4. 访问服务

| 服务 | 地址 | 说明 |
|------|------|------|
| 博客前台 | http://localhost | 面向访客的前端页面 |
| 管理后台 | http://localhost:8080 | 管理员后台系统 |
| API 服务 | http://localhost:3001 | 后端 API 接口 |

**默认管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **安全提示：** 首次登录后请立即修改默认密码！

---

### 部署脚本命令

```bash
./deploy.sh install      # 首次安装部署
./deploy.sh start        # 启动所有服务
./deploy.sh stop         # 停止所有服务
./deploy.sh restart      # 重启所有服务
./deploy.sh update       # 更新并重新部署
./deploy.sh status       # 查看服务状态
./deploy.sh logs         # 查看所有日志
./deploy.sh logs backend # 查看后端日志
./deploy.sh backup       # 备份数据
./deploy.sh clean        # 清理所有数据（谨慎使用）
```

---

### 手动 Docker 操作

如果不使用脚本，也可以直接使用 Docker Compose：

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎）
docker-compose down -v

# 重新构建
docker-compose build --no-cache
```

---

## 🔧 手动部署

### 环境要求

- Node.js 18+
- MySQL 8.0+
- Redis 7+
- Nginx（可选，用于反向代理）

### 1. 安装依赖

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nodejs npm mysql-server redis-server nginx

# 或使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. 配置数据库

```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE personal_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户
CREATE USER 'blog'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON personal_blog.* TO 'blog'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 部署后端

```bash
cd blog-backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
nano .env  # 修改数据库连接信息

# 初始化数据库
npm run init-db

# 启动服务
npm start
```

或使用 PM2：

```bash
# 安装 PM2
sudo npm install -g pm2

# 启动
pm2 start src/app.js --name blog-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 部署前端

```bash
cd blog-frontend

# 安装依赖
npm install

# 构建
npm run build

# 使用 Nginx 部署
sudo cp -r dist/* /var/www/html/
```

### 5. 部署管理后台

```bash
cd blog-admin

# 安装依赖
npm install

# 构建
npm run build

# 部署到 Nginx
sudo mkdir -p /var/www/admin
sudo cp -r dist/* /var/www/admin/
```

### 6. Nginx 配置

```nginx
# /etc/nginx/sites-available/blog
server {
    listen 80;
    server_name your-domain.com;

    # 博客前台
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /admin {
        alias /var/www/admin;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件
    location /uploads {
        proxy_pass http://127.0.0.1:3001;
    }
}
```

---

## 🔒 安全配置

### 1. 修改默认密码

首次部署后，请立即修改以下默认密码：

- MySQL root 密码
- 数据库用户密码
- JWT 密钥
- 管理员账号密码

### 2. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
```

### 3. 启用 HTTPS

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 📊 监控与维护

### 查看日志

```bash
# Docker 部署
docker-compose logs -f backend
docker-compose logs -f mysql

# 手动部署
pm2 logs blog-backend
tail -f /var/log/nginx/error.log
```

### 数据备份

```bash
# 使用部署脚本
./deploy.sh backup

# 手动备份 MySQL
mysqldump -u root -p personal_blog > backup.sql

# 手动备份上传文件
tar -czvf uploads-backup.tar.gz uploads/
```

### 性能监控

```bash
# Docker 资源使用
docker stats

# 查看容器详情
docker inspect blog-backend
```

---

## 🐛 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3001
sudo lsof -i :80

# 结束进程
sudo kill -9 <PID>
```

### 2. 数据库连接失败

- 检查 MySQL 服务是否运行：`sudo systemctl status mysql`
- 检查数据库用户权限
- 检查防火墙设置

### 3. 上传文件失败

- 检查 `uploads` 目录权限：`chmod 755 uploads`
- 检查 Nginx 上传大小限制：`client_max_body_size 10M;`

### 4. CORS 错误

- 检查后端 `src/app.js` 中的 CORS 配置
- 确保 `origin` 包含前端域名

---

## 📞 技术支持

如有问题，请：

1. 查看日志定位问题
2. 检查配置文件
3. 提交 Issue 到项目仓库

---

## 📝 更新记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2024 | 初始版本 |
