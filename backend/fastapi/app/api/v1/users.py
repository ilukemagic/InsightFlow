"""
用户相关API路由
"""

from fastapi import APIRouter, Path, Query

from app.models.responses import UserAnalyticsResponse, FunnelResponse
from app.core.cache import cache_manager
from app.services.golang_service import golang_service
from app.services.analytics_service import analytics_service
from app.config import settings

router = APIRouter()


@router.get("/{user_id}/analytics", response_model=UserAnalyticsResponse)
async def get_user_analytics(
    user_id: str = Path(..., description="用户ID"),
    limit: int = Query(50, ge=1, le=200, description="返回事件数量限制")
):
    """
    用户行为分析接口
    返回特定用户的行为数据和分析结果
    """
    # 调用Golang服务获取用户事件
    events_data = await golang_service.get_user_events(user_id, limit)
    
    # 分析用户行为
    events = events_data.get("events", [])
    summary = analytics_service.analyze_user_behavior(events)
    
    return UserAnalyticsResponse(
        user_id=user_id,
        events=events,
        summary=summary
    )


@router.get("/funnel/analysis", response_model=FunnelResponse)
async def get_funnel_analysis(
    funnel_id: str = Query("default", description="漏斗配置ID"),
    cache: bool = Query(True, description="是否使用缓存")
):
    """
    漏斗分析接口
    返回转化漏斗的分析结果
    """
    cache_key = f"funnel:{funnel_id}"
    
    # 尝试缓存
    if cache:
        cached_data = await cache_manager.get_cached_data(cache_key)
        if cached_data:
            return FunnelResponse(**cached_data)
    
    # 调用Golang服务
    funnel_data = await golang_service.get_funnel_analysis(funnel_id)
    
    # 缓存结果（漏斗分析计算较重，缓存5分钟）
    if cache:
        await cache_manager.set_cached_data(
            cache_key, 
            funnel_data, 
            ttl=settings.FUNNEL_CACHE_TTL
        )
    
    return FunnelResponse(**funnel_data) 