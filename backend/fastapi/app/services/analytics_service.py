"""
数据分析服务模块
"""

import time
from datetime import datetime
from typing import Dict, List, Any

from app.core.cache import cache_manager
from app.services.golang_service import golang_service


class AnalyticsService:
    """数据分析服务"""
    
    @staticmethod
    def clean_event_data(events: List[Dict]) -> List[Dict]:
        """清洗事件数据"""
        cleaned_events = []
        for event in events:
            # 基础数据清洗
            cleaned_event = {
                "user_id": event.get("user_id", ""),
                "session_id": event.get("session_id", ""),
                "event_type": event.get("event_type", ""),
                "page_url": event.get("page_url", "")[:512],  # 限制URL长度
                "timestamp": event.get("timestamp", int(time.time())),
            }
            
            # 可选字段
            if event.get("element"):
                cleaned_event["element"] = event.get("element", "")[:128]
            if event.get("element_text"):
                cleaned_event["element_text"] = event.get("element_text", "")[:256]
            if event.get("extra_data"):
                cleaned_event["extra_data"] = event.get("extra_data", {})
                
            cleaned_events.append(cleaned_event)
        
        return cleaned_events
    
    @staticmethod
    def adapt_dashboard_data(client_type: str, results: tuple) -> Dict[str, Any]:
        """根据客户端类型适配仪表盘数据"""
        # 处理异常结果
        online_data = results[0] if not isinstance(results[0], Exception) else {"count": 0}
        pages_data = results[1] if not isinstance(results[1], Exception) else {"pages": []}
        events_data = results[2] if not isinstance(results[2], Exception) else {"total_events": 0, "events_by_type": {}}
        conversion_data = results[3] if not isinstance(results[3], Exception) else {"rate": 0.0}
        
        # 根据客户端类型适配数据格式
        if client_type == "mobile":
            # 移动端简化数据
            response_data = {
                "online_users": online_data.get("count", 0),
                "total_events": events_data.get("total_events", 0),
                "events_by_type": {
                    "view": events_data.get("events_by_type", {}).get("view", 0),
                    "click": events_data.get("events_by_type", {}).get("click", 0)
                },
                "hot_pages": pages_data.get("pages", [])[:3],  # 只返回前3个
                "conversion_rate": conversion_data.get("rate", 0.0),
                "last_updated": datetime.now().isoformat()
            }
        elif client_type == "tv":
            # 大屏端数据（更多统计信息）
            response_data = {
                "online_users": online_data.get("count", 0),
                "total_events": events_data.get("total_events", 0),
                "events_by_type": events_data.get("events_by_type", {}),
                "hot_pages": pages_data.get("pages", [])[:10],  # 返回前10个
                "conversion_rate": conversion_data.get("rate", 0.0),
                "last_updated": datetime.now().isoformat()
            }
        else:
            # Web端完整数据
            response_data = {
                "online_users": online_data.get("count", 0),
                "total_events": events_data.get("total_events", 0),
                "events_by_type": events_data.get("events_by_type", {}),
                "hot_pages": pages_data.get("pages", [])[:5],
                "conversion_rate": conversion_data.get("rate", 0.0),
                "last_updated": datetime.now().isoformat()
            }
        
        return response_data
    
    @staticmethod
    def analyze_user_behavior(events: List[Dict]) -> Dict[str, Any]:
        """分析用户行为数据"""
        summary = {
            "total_events": len(events),
            "event_types": {},
            "most_visited_pages": {},
            "session_duration": 0,
            "first_visit": None,
            "last_visit": None
        }
        
        # 统计事件类型
        for event in events:
            event_type = event.get("event_type", "unknown")
            summary["event_types"][event_type] = summary["event_types"].get(event_type, 0) + 1
            
            # 统计页面访问
            page_url = event.get("page_url", "")
            if page_url:
                summary["most_visited_pages"][page_url] = summary["most_visited_pages"].get(page_url, 0) + 1
        
        # 时间统计
        if events:
            timestamps = [event.get("timestamp", 0) for event in events if event.get("timestamp")]
            if timestamps:
                summary["first_visit"] = min(timestamps)
                summary["last_visit"] = max(timestamps)
                summary["session_duration"] = max(timestamps) - min(timestamps)
        
        # 页面访问排序
        summary["most_visited_pages"] = dict(
            sorted(summary["most_visited_pages"].items(), key=lambda x: x[1], reverse=True)[:5]
        )
        
        return summary
    
    @staticmethod
    async def get_events_per_minute() -> int:
        """计算每分钟事件数"""
        try:
            # 从Redis获取最近1分钟的事件计数
            current_minute = datetime.now().strftime("%Y%m%d%H%M")
            key = f"events:minute:{current_minute}"
            count = await cache_manager.get_cached_data(key)
            return int(count) if count else 0
        except Exception:
            return 0
    
    @staticmethod
    async def invalidate_dashboard_cache():
        """失效仪表盘缓存"""
        try:
            # 删除所有仪表盘缓存
            await cache_manager.delete_cache_pattern("dashboard:*")
            print("仪表盘缓存已失效")
        except Exception as e:
            print(f"缓存失效失败: {e}")


# 全局分析服务实例
analytics_service = AnalyticsService() 