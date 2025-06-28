#!/bin/bash

# InsightFlow MVP 停止脚本

echo "🛑 停止 InsightFlow MVP 服务"
echo "================================"

# 停止Golang服务
if [ -f .golang.pid ]; then
    GOLANG_PID=$(cat .golang.pid)
    if ps -p $GOLANG_PID > /dev/null; then
        echo "🔄 停止Golang服务 (PID: $GOLANG_PID)..."
        kill $GOLANG_PID
        echo "✅ Golang服务已停止"
    else
        echo "⚠️  Golang服务进程不存在"
    fi
    rm -f .golang.pid
else
    echo "⚠️  未找到Golang服务PID文件"
fi

# 停止FastAPI服务
if [ -f .fastapi.pid ]; then
    FASTAPI_PID=$(cat .fastapi.pid)
    if ps -p $FASTAPI_PID > /dev/null; then
        echo "⚡ 停止FastAPI服务 (PID: $FASTAPI_PID)..."
        kill $FASTAPI_PID
        echo "✅ FastAPI服务已停止"
    else
        echo "⚠️  FastAPI服务进程不存在"
    fi
    rm -f .fastapi.pid
else
    echo "⚠️  未找到FastAPI服务PID文件"
fi

# 停止Docker容器
echo "🐳 停止Docker基础设施..."
docker-compose down

echo ""
echo "✅ 所有服务已停止"
echo "�� 日志文件保留在 logs/ 目录中" 