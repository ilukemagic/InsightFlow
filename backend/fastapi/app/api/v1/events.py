"""
事件相关API路由
"""

from fastapi import APIRouter, BackgroundTasks
from typing import Dict

from app.models.events import BatchEventRequest, EventResponse
from app.services.golang_service import golang_service
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.post("/batch", response_model=EventResponse)
async def batch_events(request: BatchEventRequest, background_tasks: BackgroundTasks):
    """
    批量事件上报接口
    接收前端事件数据并转发到Golang服务
    """
    # 数据验证和清洗
    raw_events = [event.dict() for event in request.events]
    cleaned_events = analytics_service.clean_event_data(raw_events)
    
    # 转发到Golang服务
    golang_result = await golang_service.post_events(cleaned_events)
    
    # 后台任务：更新实时缓存
    background_tasks.add_task(analytics_service.invalidate_dashboard_cache)
    
    return EventResponse(
        status="success",
        message=f"成功处理 {len(cleaned_events)} 个事件",
        processed_count=len(cleaned_events),
        golang_response=golang_result
    ) 