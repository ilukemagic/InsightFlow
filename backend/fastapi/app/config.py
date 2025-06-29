"""
应用配置模块
"""

import os
from typing import Optional


class Settings:
    """应用配置类"""
    
    # 服务配置
    APP_TITLE: str = "InsightFlow BFF API"
    APP_DESCRIPTION: str = "用户行为分析平台 - 多端数据聚合服务"
    APP_VERSION: str = "1.0.0"
    
    # 服务端口和主机
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # 外部服务配置
    GOLANG_SERVICE_URL: str = os.getenv("GOLANG_SERVICE_URL", "http://localhost:8080")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # 缓存配置
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "60"))  # 缓存60秒
    DASHBOARD_CACHE_TTL: int = int(os.getenv("DASHBOARD_CACHE_TTL", "30"))  # 仪表盘缓存30秒
    FUNNEL_CACHE_TTL: int = int(os.getenv("FUNNEL_CACHE_TTL", "300"))  # 漏斗分析缓存5分钟
    
    # HTTP客户端配置
    REQUEST_TIMEOUT: float = float(os.getenv("REQUEST_TIMEOUT", "5.0"))  # HTTP请求超时时间
    MAX_CONNECTIONS: int = int(os.getenv("MAX_CONNECTIONS", "100"))
    MAX_KEEPALIVE_CONNECTIONS: int = int(os.getenv("MAX_KEEPALIVE_CONNECTIONS", "20"))
    
    # CORS配置
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    
    # 日志配置
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # 开发模式
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    RELOAD: bool = os.getenv("RELOAD", "true").lower() == "true"


# 创建全局配置实例
settings = Settings() 