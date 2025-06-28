#!/bin/bash

# InsightFlow MVP 一键启动脚本
# 用于快速部署用户行为分析平台的最小可用版本

echo "🚀 启动 InsightFlow 用户行为分析平台 MVP 版本"
echo "================================================"

# 检查依赖
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 未安装，请先安装 $1"
        exit 1
    else
        echo "✅ $1 已安装"
    fi
}

echo "📋 检查系统依赖..."
check_dependency "docker"
check_dependency "docker-compose"
check_dependency "go"
check_dependency "python3"

# 创建必要的目录
echo "📁 创建项目目录..."
mkdir -p logs
mkdir -p data

# 启动基础设施（MySQL, Redis, Kafka）
echo "🔧 启动基础设施服务..."
docker-compose up -d mysql redis zookeeper kafka

echo "⏳ 等待基础设施启动完成..."
sleep 30

# 检查基础设施状态
echo "🔍 检查基础设施状态..."
docker-compose ps

# 安装Golang依赖
echo "📦 安装Golang依赖..."
cd backend/golang
go mod download
go mod tidy

# 启动Golang数据处理服务（后台运行）
echo "🔄 启动Golang数据处理服务..."
nohup go run . > ../../logs/golang.log 2>&1 &
GOLANG_PID=$!
echo "Golang服务PID: $GOLANG_PID"
cd ../..

# 等待Golang服务启动
sleep 10

# 安装Python依赖
echo "🐍 安装Python依赖..."
cd backend/fastapi
python3 -m pip install -r requirements.txt

# 启动FastAPI BFF服务（后台运行）
echo "⚡ 启动FastAPI BFF服务..."
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../../logs/fastapi.log 2>&1 &
FASTAPI_PID=$!
echo "FastAPI服务PID: $FASTAPI_PID"
cd ../..

# 等待所有服务启动
echo "⏳ 等待所有服务启动完成..."
sleep 15

# 健康检查
echo "🏥 执行健康检查..."

# 检查Golang服务
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Golang数据处理服务运行正常"
else
    echo "❌ Golang数据处理服务启动失败"
fi

# 检查FastAPI服务
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ FastAPI BFF服务运行正常"
else
    echo "❌ FastAPI BFF服务启动失败"
fi

# 检查MySQL
if docker exec insightflow-mysql mysqladmin ping -h localhost -u root -pinsightflow123 > /dev/null 2>&1; then
    echo "✅ MySQL数据库运行正常"
else
    echo "❌ MySQL数据库连接失败"
fi

# 检查Redis
if docker exec insightflow-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis缓存运行正常"
else
    echo "❌ Redis缓存连接失败"
fi

# 创建进程ID文件用于后续停止
echo $GOLANG_PID > .golang.pid
echo $FASTAPI_PID > .fastapi.pid

echo ""
echo "🎉 InsightFlow MVP 版本启动完成！"
echo "================================================"
echo "📍 服务地址："
echo "   前端演示页面: file://$(pwd)/frontend/demo/index.html"
echo "   Golang API:  http://localhost:8080"
echo "   FastAPI BFF: http://localhost:8000"
echo "   API文档:     http://localhost:8000/docs"
echo ""
echo "📊 数据库连接："
echo "   MySQL: localhost:3306 (用户: developer, 密码: dev123)"
echo "   Redis: localhost:6379"
echo ""
echo "📝 日志文件："
echo "   Golang: logs/golang.log"
echo "   FastAPI: logs/fastapi.log"
echo ""
echo "🔧 管理命令："
echo "   停止服务: ./stop-mvp.sh"
echo "   查看日志: tail -f logs/golang.log"
echo "           tail -f logs/fastapi.log"
echo ""
echo "🌟 开始使用："
echo "   1. 打开浏览器访问前端演示页面"
echo "   2. 点击页面元素观察实时数据变化"
echo "   3. 访问 http://localhost:8000/docs 查看API文档"
echo "" 