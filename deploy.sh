#!/bin/bash

# ============================================
# 个人博客系统 - Docker 部署脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
个人博客系统部署脚本

用法: ./deploy.sh [命令] [选项]

命令:
    install     首次安装部署
    start       启动所有服务
    stop        停止所有服务
    restart     重启所有服务
    update      更新并重新部署
    status      查看服务状态
    logs        查看日志
    init-db     初始化数据库
    backup      备份数据
    clean       清理所有容器和数据（谨慎使用）

选项:
    -h, --help  显示帮助信息

示例:
    ./deploy.sh install     # 首次安装
    ./deploy.sh start       # 启动服务
    ./deploy.sh logs backend # 查看后端日志
EOF
}

# 检查 Docker 和 Docker Compose
check_docker() {
    print_info "检查 Docker 环境..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "安装指南: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # 检查 Docker 服务是否运行
    if ! docker info &> /dev/null; then
        print_error "Docker 服务未运行，请先启动 Docker 服务"
        exit 1
    fi
    
    print_success "Docker 环境检查通过"
}

# 检查环境文件
check_env() {
    if [ ! -f ".env" ]; then
        print_warning ".env 文件不存在，从 .env.example 复制..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_warning "请编辑 .env 文件，修改默认配置（特别是密码）后再运行"
            exit 1
        else
            print_error ".env.example 文件也不存在"
            exit 1
        fi
    fi
}

# 首次安装
install() {
    print_info "开始首次安装..."
    
    check_docker
    check_env
    
    # 创建必要的目录
    print_info "创建数据目录..."
    mkdir -p uploads logs
    
    # 拉取镜像并构建
    print_info "拉取镜像并构建服务..."
    docker-compose pull
    docker-compose build --no-cache
    
    # 启动数据库服务
    print_info "启动数据库服务..."
    docker-compose up -d mysql redis
    
    # 等待数据库就绪
    print_info "等待数据库就绪（约 30 秒）..."
    sleep 30
    
    # 初始化数据库
    init_database
    
    # 启动所有服务
    print_info "启动所有服务..."
    docker-compose up -d
    
    # 等待服务启动
    print_info "等待服务启动（约 20 秒）..."
    sleep 20
    
    # 检查状态
    status
    
    print_success "安装完成！"
    echo ""
    echo "访问地址:"
    echo "  - 博客前台: http://localhost"
    echo "  - 管理后台: http://localhost:8080"
    echo "  - API 服务: http://localhost:3001"
    echo ""
    echo "默认管理员账号:"
    echo "  - 用户名: admin"
    echo "  - 密码: admin123"
    echo ""
    echo "请尽快修改默认密码！"
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    
    # 检查后端容器是否运行
    if docker-compose ps | grep -q "blog-backend"; then
        print_info "执行数据库初始化脚本..."
        docker-compose exec -T backend node src/scripts/init-db.js
    else
        print_warning "后端服务未运行，跳过数据库初始化"
    fi
}

# 启动服务
start() {
    print_info "启动服务..."
    check_env
    docker-compose up -d
    print_success "服务已启动"
    status
}

# 停止服务
stop() {
    print_info "停止服务..."
    docker-compose down
    print_success "服务已停止"
}

# 重启服务
restart() {
    print_info "重启服务..."
    docker-compose restart
    print_success "服务已重启"
    status
}

# 更新部署
update() {
    print_info "开始更新..."
    
    # 备份数据
    backup
    
    # 拉取最新代码（如果是 git 仓库）
    if [ -d ".git" ]; then
        print_info "拉取最新代码..."
        git pull
    fi
    
    # 重新构建并启动
    print_info "重新构建服务..."
    docker-compose down
    docker-compose pull
    docker-compose build --no-cache
    docker-compose up -d
    
    print_success "更新完成"
    status
}

# 查看状态
status() {
    print_info "服务状态:"
    docker-compose ps
    echo ""
    print_info "资源使用:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.PIDs}}"
}

# 查看日志
logs() {
    local service=$1
    if [ -z "$service" ]; then
        print_info "查看所有服务日志（按 Ctrl+C 退出）..."
        docker-compose logs -f
    else
        print_info "查看 $service 日志（按 Ctrl+C 退出）..."
        docker-compose logs -f "$service"
    fi
}

# 备份数据
backup() {
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    print_info "开始备份数据到 $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # 备份数据库
    print_info "备份数据库..."
    docker-compose exec -T mysql mysqldump -u root -p"${MYSQL_ROOT_PASSWORD:-123456}" personal_blog > "$backup_dir/database.sql"
    
    # 备份上传文件
    print_info "备份上传文件..."
    cp -r uploads "$backup_dir/" 2>/dev/null || true
    
    # 备份环境配置
    print_info "备份配置文件..."
    cp .env "$backup_dir/" 2>/dev/null || true
    
    print_success "备份完成: $backup_dir"
}

# 清理所有数据（谨慎使用）
clean() {
    print_warning "这将删除所有容器和数据卷！"
    read -p "确定要继续吗？(yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "停止并删除所有容器..."
        docker-compose down -v
        print_info "删除构建的镜像..."
        docker-compose rm -f
        print_success "清理完成"
    else
        print_info "操作已取消"
    fi
}

# 主函数
main() {
    case "${1:-}" in
        install)
            install
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        update)
            update
            ;;
        status)
            status
            ;;
        logs)
            logs "$2"
            ;;
        init-db)
            init_database
            ;;
        backup)
            backup
            ;;
        clean)
            clean
            ;;
        -h|--help|help)
            show_help
            ;;
        *)
            print_error "未知命令: ${1:-}"
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
