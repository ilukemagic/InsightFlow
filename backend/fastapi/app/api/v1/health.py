"""
健康检查和监控API路由
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.models.responses import HealthResponse, MetricsResponse
from app.core.cache import cache_manager
from app.services.golang_service import golang_service
from app.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查接口"""
    # 检查Redis连接
    redis_status = "healthy" if await cache_manager.ping() else "unhealthy"
    
    # 检查Golang服务连接
    golang_status = "healthy" if await golang_service.health_check() else "unhealthy"
    
    overall_status = "healthy" if redis_status == "healthy" and golang_status == "healthy" else "degraded"
    
    return HealthResponse(
        status=overall_status,
        services={
            "redis": redis_status,
            "golang": golang_status
        },
        timestamp=datetime.now().isoformat(),
        version=settings.APP_VERSION
    )


@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    """系统指标接口"""
    try:
        # 获取一些基础指标
        redis_info = await cache_manager.get_info("memory")
        
        return MetricsResponse(
            redis_memory_used=redis_info.get("used_memory_human", "unknown"),
            active_connections="unknown",  # 实际应该从连接池获取
            cache_hit_rate="unknown",      # 实际应该计算缓存命中率
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"获取指标失败: {e}") 