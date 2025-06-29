"""
API响应数据模型
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel


class DashboardResponse(BaseModel):
    """仪表盘响应模型"""
    online_users: int
    total_events: int
    events_by_type: Dict[str, int]
    hot_pages: List[Dict[str, Any]]
    conversion_rate: float
    last_updated: str


class UserAnalyticsResponse(BaseModel):
    """用户分析响应模型"""
    user_id: str
    events: List[Dict[str, Any]]
    summary: Dict[str, Any]


class FunnelResponse(BaseModel):
    """漏斗分析响应模型"""
    steps: List[Dict[str, Any]]
    total_users: int
    conversion_rate: float


class RealtimeStatsResponse(BaseModel):
    """实时统计响应模型"""
    online_users: int
    total_events: int
    events_per_minute: int
    timestamp: int
    server_time: str


class HealthResponse(BaseModel):
    """健康检查响应模型"""
    status: str
    services: Dict[str, str]
    timestamp: str
    version: str


class MetricsResponse(BaseModel):
    """系统指标响应模型"""
    redis_memory_used: str
    active_connections: str
    cache_hit_rate: str
    timestamp: str 