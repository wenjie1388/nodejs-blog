# ============================================
# Makefile - 常用命令快捷方式
# ============================================

.PHONY: help install start stop restart logs status update backup clean build prod

# 默认显示帮助
help:
	@echo "个人博客系统 - 常用命令"
	@echo ""
	@echo "开发环境:"
	@echo "  make install    首次安装部署"
	@echo "  make start      启动所有服务"
	@echo "  make stop       停止所有服务"
	@echo "  make restart    重启所有服务"
	@echo "  make logs       查看日志"
	@echo "  make status     查看服务状态"
	@echo ""
	@echo "生产环境:"
	@echo "  make prod       生产环境部署"
	@echo "  make prod-stop  停止生产环境"
	@echo "  make prod-logs  查看生产环境日志"
	@echo ""
	@echo "其他:"
	@echo "  make build      重新构建镜像"
	@echo "  make update     更新并重新部署"
	@echo "  make backup     备份数据"
	@echo "  make clean      清理所有数据（谨慎）"
	@echo "  make init-db    初始化数据库"

# 开发环境命令
install:
	./deploy.sh install

start:
	docker-compose up -d

stop:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

status:
	docker-compose ps

build:
	docker-compose build --no-cache

update:
	./deploy.sh update

backup:
	./deploy.sh backup

clean:
	./deploy.sh clean

init-db:
	./deploy.sh init-db

# 生产环境命令
prod:
	docker-compose -f docker-compose.prod.yml up -d

prod-stop:
	docker-compose -f docker-compose.prod.yml down

prod-restart:
	docker-compose -f docker-compose.prod.yml restart

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-build:
	docker-compose -f docker-compose.prod.yml build --no-cache

prod-update:
	docker-compose -f docker-compose.prod.yml pull
	docker-compose -f docker-compose.prod.yml up -d --build

prod-backup:
	@mkdir -p backups/$(shell date +%Y%m%d_%H%M%S)
	docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$(MYSQL_ROOT_PASSWORD) personal_blog > backups/$(shell date +%Y%m%d_%H%M%S)/database.sql
	cp -r uploads backups/$(shell date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@echo "备份完成: backups/$(shell date +%Y%m%d_%H%M%S)"
