"""
InsightFlow FastAPI BFF 应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import settings
from app.core.cache import cache_manager
from app.core.http_client import http_client_manager
from app.api.v1 import dashboard, events, users, health

# FastAPI应用初始化
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(dashboard.router, prefix="/bff", tags=["Dashboard"])
app.include_router(events.router, prefix="/bff/events", tags=["Events"]) 
app.include_router(users.router, prefix="/bff/user", tags=["Users"])
app.include_router(health.router, tags=["Health"])


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化连接"""
    await cache_manager.init_redis()
    await http_client_manager.init_client()
    print("🚀 InsightFlow BFF 服务启动完成")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    await cache_manager.close_redis()
    await http_client_manager.close_client()
    print("👋 InsightFlow BFF 服务已关闭")


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level=settings.LOG_LEVEL
    ) 