"""
InsightFlow FastAPI BFF (Backend for Frontend) 层
负责多端数据聚合、格式转换、协议适配
"""

import asyncio
import json
import time
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta

import httpx
import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Query, Path, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn


# 数据模型定义
class EventData(BaseModel):
    user_id: str
    session_id: str
    event_type: str
    page_url: str
    element: Optional[str] = None
    element_text: Optional[str] = None
    timestamp: int
    extra_data: Optional[Dict] = None


class BatchEventRequest(BaseModel):
    events: List[EventData]


class DashboardResponse(BaseModel):
    online_users: int
    total_events: int
    events_by_type: Dict[str, int]
    hot_pages: List[Dict[str, Any]]
    conversion_rate: float
    last_updated: str


class UserAnalyticsResponse(BaseModel):
    user_id: str
    events: List[Dict[str, Any]]
    summary: Dict[str, Any]


class FunnelResponse(BaseModel):
    steps: List[Dict[str, Any]]
    total_users: int
    conversion_rate: float


# 配置类
class Config:
    GOLANG_SERVICE_URL = "http://localhost:8080"
    REDIS_URL = "redis://localhost:6379"
    CACHE_TTL = 60  # 缓存60秒
    REQUEST_TIMEOUT = 5.0  # HTTP请求超时时间


# FastAPI应用初始化
app = FastAPI(
    title="InsightFlow BFF API",
    description="用户行为分析平台 - 多端数据聚合服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局变量
redis_client: redis.Redis = None
http_client: httpx.AsyncClient = None


@app.on_event("startup")
async def startup_event():
    """应用启动时初始化连接"""
    global redis_client, http_client
    
    # 初始化Redis连接
    redis_client = redis.from_url(Config.REDIS_URL, decode_responses=True)
    
    # 初始化HTTP客户端
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(Config.REQUEST_TIMEOUT),
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
    )
    
    print("🚀 InsightFlow BFF 服务启动完成")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    global redis_client, http_client
    
    if redis_client:
        await redis_client.close()
    
    if http_client:
        await http_client.aclose()
    
    print("👋 InsightFlow BFF 服务已关闭")


# 工具函数
async def call_golang_api(endpoint: str, params: Dict = None) -> Dict:
    """调用Golang微服务API"""
    url = f"{Config.GOLANG_SERVICE_URL}/api{endpoint}"
    
    try:
        response = await http_client.get(url, params=params or {})
        response.raise_for_status()
        return response.json()
    except httpx.RequestError as e:
        print(f"请求Golang服务失败: {e}")
        raise HTTPException(status_code=503, detail="后端服务不可用")
    except httpx.HTTPStatusError as e:
        print(f"Golang服务返回错误: {e}")
        raise HTTPException(status_code=e.response.status_code, detail="后端服务错误")


async def get_cached_data(key: str) -> Optional[Dict]:
    """从Redis获取缓存数据"""
    try:
        data = await redis_client.get(key)
        return json.loads(data) if data else None
    except Exception as e:
        print(f"Redis读取失败: {e}")
        return None


async def set_cached_data(key: str, data: Dict, ttl: int = Config.CACHE_TTL):
    """设置Redis缓存数据"""
    try:
        await redis_client.setex(key, ttl, json.dumps(data))
    except Exception as e:
        print(f"Redis写入失败: {e}")


# 核心BFF接口

@app.get("/bff/{client_type}/dashboard", response_model=DashboardResponse)
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
        cached_data = await get_cached_data(cache_key)
        if cached_data:
            return DashboardResponse(**cached_data)
    
    # 并行调用多个Golang微服务接口
    try:
        tasks = [
            call_golang_api("/stats/online"),
            call_golang_api("/stats/hot-pages"),
            call_golang_api("/stats/events"),
            call_golang_api("/stats/conversion"),
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理异常结果
        online_data = results[0] if not isinstance(results[0], Exception) else {"count": 0}
        pages_data = results[1] if not isinstance(results[1], Exception) else {"pages": []}
        events_data = results[2] if not isinstance(results[2], Exception) else {"total_events": 0, "events_by_type": {}}
        conversion_data = results[3] if not isinstance(results[3], Exception) else {"rate": 0.0}
        
    except Exception as e:
        print(f"批量调用Golang服务失败: {e}")
        raise HTTPException(status_code=503, detail="数据聚合失败")
    
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
    
    # 缓存结果
    if cache:
        await set_cached_data(cache_key, response_data, ttl=30)  # 30秒缓存
    
    return DashboardResponse(**response_data)


@app.post("/bff/events/batch")
async def batch_events(request: BatchEventRequest, background_tasks: BackgroundTasks):
    """
    批量事件上报接口
    接收前端事件数据并转发到Golang服务
    """
    # 数据验证和清洗
    cleaned_events = []
    for event in request.events:
        # 基础数据清洗
        cleaned_event = {
            "user_id": event.user_id,
            "session_id": event.session_id,
            "event_type": event.event_type,
            "page_url": event.page_url[:512],  # 限制URL长度
            "timestamp": event.timestamp,
        }
        
        # 可选字段
        if event.element:
            cleaned_event["element"] = event.element[:128]
        if event.element_text:
            cleaned_event["element_text"] = event.element_text[:256]
        if event.extra_data:
            cleaned_event["extra_data"] = event.extra_data
            
        cleaned_events.append(cleaned_event)
    
    # 转发到Golang服务
    try:
        response = await http_client.post(
            f"{Config.GOLANG_SERVICE_URL}/api/events",
            json={"events": cleaned_events},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        golang_result = response.json()
        
    except Exception as e:
        print(f"转发事件到Golang服务失败: {e}")
        raise HTTPException(status_code=503, detail="事件处理服务不可用")
    
    # 后台任务：更新实时缓存
    background_tasks.add_task(invalidate_dashboard_cache)
    
    return {
        "status": "success",
        "message": f"成功处理 {len(cleaned_events)} 个事件",
        "processed_count": len(cleaned_events),
        "golang_response": golang_result
    }


@app.get("/bff/user/{user_id}/analytics", response_model=UserAnalyticsResponse)
async def get_user_analytics(
    user_id: str = Path(..., description="用户ID"),
    limit: int = Query(50, ge=1, le=200, description="返回事件数量限制")
):
    """
    用户行为分析接口
    返回特定用户的行为数据和分析结果
    """
    try:
        # 调用Golang服务获取用户事件
        events_data = await call_golang_api(f"/user/{user_id}/events", {"limit": limit})
        
        # 计算用户行为摘要
        events = events_data.get("events", [])
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
        
        return UserAnalyticsResponse(
            user_id=user_id,
            events=events,
            summary=summary
        )
        
    except Exception as e:
        print(f"获取用户分析数据失败: {e}")
        raise HTTPException(status_code=503, detail="用户分析服务不可用")


@app.get("/bff/funnel/analysis", response_model=FunnelResponse)
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
        cached_data = await get_cached_data(cache_key)
        if cached_data:
            return FunnelResponse(**cached_data)
    
    try:
        # 调用Golang服务
        funnel_data = await call_golang_api(f"/funnel/{funnel_id}/analysis")
        
        # 缓存结果（漏斗分析计算较重，缓存5分钟）
        if cache:
            await set_cached_data(cache_key, funnel_data, ttl=300)
        
        return FunnelResponse(**funnel_data)
        
    except Exception as e:
        print(f"获取漏斗分析失败: {e}")
        raise HTTPException(status_code=503, detail="漏斗分析服务不可用")


@app.get("/bff/stats/realtime")
async def get_realtime_stats():
    """
    实时统计数据接口
    返回最新的实时统计信息，无缓存
    """
    try:
        # 并行获取实时数据
        tasks = [
            call_golang_api("/stats/online"),
            call_golang_api("/stats/events"),
        ]
        
        results = await asyncio.gather(*tasks)
        online_data, events_data = results
        
        return {
            "online_users": online_data.get("count", 0),
            "total_events": events_data.get("total_events", 0),
            "events_per_minute": await get_events_per_minute(),
            "timestamp": int(time.time()),
            "server_time": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"获取实时统计失败: {e}")
        raise HTTPException(status_code=503, detail="实时统计服务不可用")


# 辅助函数

async def invalidate_dashboard_cache():
    """后台任务：失效仪表盘缓存"""
    try:
        # 删除所有仪表盘缓存
        cache_keys = ["dashboard:web", "dashboard:mobile", "dashboard:tv"]
        for key in cache_keys:
            await redis_client.delete(key)
        print("仪表盘缓存已失效")
    except Exception as e:
        print(f"缓存失效失败: {e}")


async def get_events_per_minute() -> int:
    """计算每分钟事件数"""
    try:
        # 从Redis获取最近1分钟的事件计数
        current_minute = datetime.now().strftime("%Y%m%d%H%M")
        key = f"events:minute:{current_minute}"
        count = await redis_client.get(key)
        return int(count) if count else 0
    except Exception:
        return 0


# 健康检查和监控

@app.get("/health")
async def health_check():
    """健康检查接口"""
    try:
        # 检查Redis连接
        await redis_client.ping()
        redis_status = "healthy"
    except Exception:
        redis_status = "unhealthy"
    
    try:
        # 检查Golang服务连接
        response = await http_client.get(f"{Config.GOLANG_SERVICE_URL}/health")
        golang_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception:
        golang_status = "unhealthy"
    
    return {
        "status": "healthy" if redis_status == "healthy" and golang_status == "healthy" else "degraded",
        "services": {
            "redis": redis_status,
            "golang": golang_status
        },
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }


@app.get("/metrics")
async def get_metrics():
    """系统指标接口"""
    try:
        # 获取一些基础指标
        redis_info = await redis_client.info("memory")
        
        return {
            "redis_memory_used": redis_info.get("used_memory_human", "unknown"),
            "active_connections": "unknown",  # 实际应该从连接池获取
            "cache_hit_rate": "unknown",      # 实际应该计算缓存命中率
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"获取指标失败: {e}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 