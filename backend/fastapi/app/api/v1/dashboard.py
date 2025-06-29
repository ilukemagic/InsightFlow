"""
仪表盘相关API路由
"""

import time
from datetime import datetime
from fastapi import APIRouter, Query, Path
from typing import Dict

from app.models.responses import DashboardResponse, RealtimeStatsResponse
from app.core.cache import cache_manager
from app.services.golang_service import golang_service
from app.services.analytics_service import analytics_service
from app.config import settings

router = APIRouter()


@router.get("/{client_type}/dashboard", response_model=DashboardResponse)
async def get_client_dashboard(
    client_type: str = Path(..., description="客户端类型: web/mobile/tv"),
    cache: bool = Query(True, description="是否使用缓存")
):
    """
    多端仪表盘数据聚合接口
    根据不同客户端类型返回适配的数据格式
    """
    cache_key = f"dashboard:{client_type}"
    
    # 尝试从缓存获取
    if cache:
        cached_data = await cache_manager.get_cached_data(cache_key)
        if cached_data:
            return DashboardResponse(**cached_data)
    
    # 并行调用多个Golang微服务接口
    results = await golang_service.get_dashboard_data()
    
    # 根据客户端类型适配数据格式
    response_data = analytics_service.adapt_dashboard_data(client_type, results)
    
    # 缓存结果
    if cache:
        await cache_manager.set_cached_data(
            cache_key, 
            response_data, 
            ttl=settings.DASHBOARD_CACHE_TTL
        )
    
    return DashboardResponse(**response_data)


@router.get("/stats/realtime", response_model=RealtimeStatsResponse)
async def get_realtime_stats():
    """
    实时统计数据接口
    返回最新的实时统计信息，无缓存
    """
    # 并行获取实时数据
    results = await golang_service.get_realtime_data()
    
    online_data = results[0] if not isinstance(results[0], Exception) else {"count": 0}
    events_data = results[1] if not isinstance(results[1], Exception) else {"total_events": 0}
    
    response_data = {
        "online_users": online_data.get("count", 0),
        "total_events": events_data.get("total_events", 0),
        "events_per_minute": await analytics_service.get_events_per_minute(),
        "timestamp": int(time.time()),
        "server_time": datetime.now().isoformat()
    }
    
    return RealtimeStatsResponse(**response_data) 