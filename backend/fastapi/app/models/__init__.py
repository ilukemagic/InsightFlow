"""
数据模型包
方便导入常用的模型类
"""

from .events import EventData, BatchEventRequest, EventResponse
from .responses import (
    DashboardResponse,
    UserAnalyticsResponse, 
    FunnelResponse,
    RealtimeStatsResponse,
    HealthResponse,
    MetricsResponse
)

__all__ = [
    # 事件相关模型
    "EventData",
    "BatchEventRequest", 
    "EventResponse",
    
    # 响应模型
    "DashboardResponse",
    "UserAnalyticsResponse",
    "FunnelResponse", 
    "RealtimeStatsResponse",
    "HealthResponse",
    "MetricsResponse",
]
