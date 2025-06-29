"""
事件相关数据模型
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class EventData(BaseModel):
    """单个事件数据模型"""
    user_id: str
    session_id: str
    event_type: str
    page_url: str
    element: Optional[str] = None
    element_text: Optional[str] = None
    timestamp: int
    extra_data: Optional[Dict] = None


class BatchEventRequest(BaseModel):
    """批量事件请求模型"""
    events: List[EventData]


class EventResponse(BaseModel):
    """事件响应模型"""
    status: str
    message: str
    processed_count: int
    golang_response: Optional[Dict] = None 