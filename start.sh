#!/bin/bash

# 个人博客系统启动脚本

echo "🚀 启动个人博客系统..."

# 启动后端
echo "📦 启动后端服务..."
cd blog-backend
npm install
npm run init-db &
sleep 3
npm run dev &
BACKEND_PID=$!
cd ..

# 启动前台
echo "🎨 启动前台..."
cd blog-frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# 启动后台
echo "⚙️ 启动管理员后台..."
cd blog-admin
npm install
npm run dev &
ADMIN_PID=$!
cd ..

echo ""
echo "✅ 所有服务已启动!"
echo ""
echo "📱 前台访问: http://localhost:5173"
echo "⚙️ 后台访问: http://localhost:5174"
echo "🔌 API服务: http://localhost:3001"
echo ""
echo "🔑 默认管理员账号: admin / admin123"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID $ADMIN_PID; exit" INT
wait
