"""
Redis缓存操作核心模块
"""

import json
from typing import Dict, Optional
import redis.asyncio as redis

from app.config import settings


class CacheManager:
    """Redis缓存管理器"""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def init_redis(self):
        """初始化Redis连接"""
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        
    async def close_redis(self):
        """关闭Redis连接"""
        if self.redis_client:
            await self.redis_client.close()
    
    async def get_cached_data(self, key: str) -> Optional[Dict]:
        """从Redis获取缓存数据"""
        try:
            if not self.redis_client:
                return None
            data = await self.redis_client.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            print(f"Redis读取失败: {e}")
            return None

    async def set_cached_data(self, key: str, data: Dict, ttl: int = None):
        """设置Redis缓存数据"""
        try:
            if not self.redis_client:
                return
            
            ttl = ttl or settings.CACHE_TTL
            await self.redis_client.setex(key, ttl, json.dumps(data))
        except Exception as e:
            print(f"Redis写入失败: {e}")
    
    async def delete_cache(self, key: str):
        """删除缓存"""
        try:
            if not self.redis_client:
                return
            await self.redis_client.delete(key)
        except Exception as e:
            print(f"Redis删除失败: {e}")
    
    async def delete_cache_pattern(self, pattern: str):
        """批量删除匹配模式的缓存"""
        try:
            if not self.redis_client:
                return
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
        except Exception as e:
            print(f"Redis批量删除失败: {e}")
    
    async def ping(self) -> bool:
        """检查Redis连接状态"""
        try:
            if not self.redis_client:
                return False
            await self.redis_client.ping()
            return True
        except Exception:
            return False
    
    async def get_info(self, section: str = "memory") -> Dict:
        """获取Redis信息"""
        try:
            if not self.redis_client:
                return {}
            return await self.redis_client.info(section)
        except Exception as e:
            print(f"获取Redis信息失败: {e}")
            return {}


# 全局缓存管理器实例
cache_manager = CacheManager() 