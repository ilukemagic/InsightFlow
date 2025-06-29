"""
HTTP客户端管理核心模块
"""

from typing import Dict, Optional
import httpx
from fastapi import HTTPException

from app.config import settings


class HTTPClientManager:
    """HTTP客户端管理器"""
    
    def __init__(self):
        self.client: Optional[httpx.AsyncClient] = None
    
    async def init_client(self):
        """初始化HTTP客户端"""
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(settings.REQUEST_TIMEOUT),
            limits=httpx.Limits(
                max_keepalive_connections=settings.MAX_KEEPALIVE_CONNECTIONS,
                max_connections=settings.MAX_CONNECTIONS
            )
        )
    
    async def close_client(self):
        """关闭HTTP客户端"""
        if self.client:
            await self.client.aclose()
    
    async def get(self, url: str, params: Dict = None, headers: Dict = None) -> Dict:
        """GET请求"""
        try:
            if not self.client:
                raise HTTPException(status_code=503, detail="HTTP客户端未初始化")
            
            response = await self.client.get(url, params=params or {}, headers=headers or {})
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTP请求失败: {e}")
            raise HTTPException(status_code=503, detail="网络请求失败")
        except httpx.HTTPStatusError as e:
            print(f"HTTP状态错误: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="服务响应错误")
    
    async def post(self, url: str, json_data: Dict = None, headers: Dict = None) -> Dict:
        """POST请求"""
        try:
            if not self.client:
                raise HTTPException(status_code=503, detail="HTTP客户端未初始化")
            
            response = await self.client.post(
                url, 
                json=json_data or {}, 
                headers=headers or {"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            print(f"HTTP请求失败: {e}")
            raise HTTPException(status_code=503, detail="网络请求失败")
        except httpx.HTTPStatusError as e:
            print(f"HTTP状态错误: {e}")
            raise HTTPException(status_code=e.response.status_code, detail="服务响应错误")
    
    async def health_check(self, url: str) -> bool:
        """健康检查请求"""
        try:
            if not self.client:
                return False
            
            response = await self.client.get(url)
            return response.status_code == 200
        except Exception:
            return False


# 全局HTTP客户端管理器实例
http_client_manager = HTTPClientManager() 