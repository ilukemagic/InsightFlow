"""
Golang微服务调用模块
"""

import asyncio
from typing import Dict, List
from fastapi import HTTPException

from app.config import settings
from app.core.http_client import http_client_manager


class GolangService:
    """Golang微服务调用封装"""
    
    def __init__(self):
        self.base_url = settings.GOLANG_SERVICE_URL
    
    async def call_api(self, endpoint: str, params: Dict = None) -> Dict:
        """调用Golang微服务API"""
        url = f"{self.base_url}/api{endpoint}"
        return await http_client_manager.get(url, params=params)
    
    async def post_api(self, endpoint: str, data: Dict = None) -> Dict:
        """POST调用Golang微服务API"""
        url = f"{self.base_url}/api{endpoint}"
        return await http_client_manager.post(url, json_data=data)
    
    # 统计相关接口
    async def get_online_stats(self) -> Dict:
        """获取在线用户统计"""
        return await self.call_api("/stats/online")
    
    async def get_hot_pages(self) -> Dict:
        """获取热门页面"""
        return await self.call_api("/stats/hot-pages")
    
    async def get_events_stats(self) -> Dict:
        """获取事件统计"""
        return await self.call_api("/stats/events")
    
    async def get_conversion_stats(self) -> Dict:
        """获取转化统计"""
        return await self.call_api("/stats/conversion")
    
    # 用户相关接口
    async def get_user_events(self, user_id: str, limit: int = 50) -> Dict:
        """获取用户事件"""
        return await self.call_api(f"/user/{user_id}/events", {"limit": limit})
    
    # 漏斗分析接口
    async def get_funnel_analysis(self, funnel_id: str) -> Dict:
        """获取漏斗分析"""
        return await self.call_api(f"/funnel/{funnel_id}/analysis")
    
    # 事件上报接口
    async def post_events(self, events: List[Dict]) -> Dict:
        """批量上报事件"""
        return await self.post_api("/events", {"events": events})
    
    # 批量调用接口
    async def get_dashboard_data(self) -> tuple:
        """并行获取仪表盘所需的所有数据"""
        tasks = [
            self.get_online_stats(),
            self.get_hot_pages(),
            self.get_events_stats(),
            self.get_conversion_stats(),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
    
    async def get_realtime_data(self) -> tuple:
        """并行获取实时数据"""
        tasks = [
            self.get_online_stats(),
            self.get_events_stats(),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return results
    
    # 健康检查
    async def health_check(self) -> bool:
        """检查Golang服务健康状态"""
        return await http_client_manager.health_check(f"{self.base_url}/health")


# 全局Golang服务实例
golang_service = GolangService() 