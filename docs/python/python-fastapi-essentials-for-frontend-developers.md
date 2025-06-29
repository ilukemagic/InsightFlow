# Python & FastAPI 核心知识指南

*为前端开发者量身定制 - 掌握20%的核心知识，解决80%的开发问题*

## 📋 目录

1. [Python 核心基础](#1-python-核心基础)
2. [异步编程必知](#2-异步编程必知)
3. [FastAPI 路由与请求](#3-fastapi-路由与请求)
4. [数据模型与验证](#4-数据模型与验证)
5. [错误处理](#5-错误处理)
6. [HTTP客户端使用](#6-http客户端使用)
7. [缓存操作](#7-缓存操作)
8. [实战代码解析](#8-实战代码解析)

---

## 1. Python 核心基础

### 1.1 必须掌握的数据类型

```python
# 字符串
name = "InsightFlow"
url = f"http://localhost:8080/api/{endpoint}"  # f-string格式化

# 字典 (类似JavaScript对象)
config = {
    "host": "localhost",
    "port": 8080,
    "timeout": 5.0
}

# 列表 (类似JavaScript数组)
events = ["click", "view", "scroll"]
hot_pages = pages_data.get("pages", [])[:5]  # 切片操作

# 布尔值
cache_enabled = True
is_valid = False
```

### 1.2 函数定义与调用

```python
# 基础函数
def format_response(data: dict, status: str = "success") -> dict:
    return {
        "status": status,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

# 调用函数
result = format_response({"count": 100})
```

### 1.3 异常处理

```python
try:
    response = await http_client.get(url)
    response.raise_for_status()
    return response.json()
except httpx.RequestError as e:
    print(f"请求失败: {e}")
    raise HTTPException(status_code=503, detail="服务不可用")
except httpx.HTTPStatusError as e:
    print(f"HTTP错误: {e}")
    raise HTTPException(status_code=e.response.status_code, detail="请求错误")
```

---

## 2. 异步编程必知

### 2.1 async/await 基础

```python
# 异步函数定义
async def call_api(url: str) -> dict:
    # await 等待异步操作完成
    response = await http_client.get(url)
    return response.json()

# 异步函数调用
result = await call_api("http://api.example.com/data")
```

### 2.2 并发处理

```python
import asyncio

# 并行执行多个异步任务
async def get_dashboard_data():
    tasks = [
        call_golang_api("/stats/online"),
        call_golang_api("/stats/hot-pages"),
        call_golang_api("/stats/events"),
    ]
    
    # 等待所有任务完成
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

### 2.3 异步上下文管理

```python
# 应用启动/关闭事件
@app.on_event("startup")
async def startup_event():
    global redis_client, http_client
    redis_client = redis.from_url("redis://localhost:6379")
    http_client = httpx.AsyncClient()

@app.on_event("shutdown") 
async def shutdown_event():
    await redis_client.close()
    await http_client.aclose()
```

---

## 3. FastAPI 路由与请求

### 3.1 路由定义

```python
from fastapi import FastAPI, Query, Path, HTTPException

app = FastAPI()

# GET请求 - 查询参数
@app.get("/api/dashboard")
async def get_dashboard(
    cache: bool = Query(True, description="是否使用缓存"),
    limit: int = Query(10, ge=1, le=100, description="返回数量")
):
    return {"message": "dashboard data"}

# GET请求 - 路径参数
@app.get("/api/user/{user_id}/analytics")
async def get_user_analytics(
    user_id: str = Path(..., description="用户ID")
):
    return {"user_id": user_id}

# POST请求 - 请求体
@app.post("/api/events")
async def create_events(request: BatchEventRequest):
    return {"received": len(request.events)}
```

### 3.2 响应模型

```python
from pydantic import BaseModel
from typing import List, Optional

# 定义响应模型
class DashboardResponse(BaseModel):
    online_users: int
    total_events: int
    hot_pages: List[dict]
    last_updated: str

# 使用响应模型
@app.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    return DashboardResponse(
        online_users=100,
        total_events=5000,
        hot_pages=[],
        last_updated=datetime.now().isoformat()
    )
```

### 3.3 中间件

```python
from fastapi.middleware.cors import CORSMiddleware

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 4. 数据模型与验证

### 4.1 Pydantic模型定义

```python
from pydantic import BaseModel, Field
from typing import Optional, Dict, List

class EventData(BaseModel):
    user_id: str
    session_id: str
    event_type: str
    page_url: str
    element: Optional[str] = None
    timestamp: int
    extra_data: Optional[Dict] = None

class BatchEventRequest(BaseModel):
    events: List[EventData]
```

### 4.2 数据验证与清洗

```python
# 自动验证
@app.post("/events")
async def handle_events(request: BatchEventRequest):
    # FastAPI自动验证request数据
    
    # 手动数据清洗
    cleaned_events = []
    for event in request.events:
        cleaned_event = {
            "user_id": event.user_id,
            "page_url": event.page_url[:512],  # 限制长度
            "timestamp": event.timestamp,
        }
        cleaned_events.append(cleaned_event)
    
    return {"processed": len(cleaned_events)}
```

---

## 5. 错误处理

### 5.1 HTTPException

```python
from fastapi import HTTPException

# 抛出HTTP异常
if not user_exists:
    raise HTTPException(
        status_code=404, 
        detail="用户不存在"
    )

# 服务不可用
if service_down:
    raise HTTPException(
        status_code=503,
        detail="后端服务不可用"
    )
```

### 5.2 异常捕获模式

```python
async def safe_api_call(endpoint: str):
    try:
        response = await http_client.get(f"http://service{endpoint}")
        response.raise_for_status()
        return response.json()
    except httpx.RequestError:
        # 网络错误
        raise HTTPException(status_code=503, detail="服务连接失败")
    except httpx.HTTPStatusError as e:
        # HTTP状态错误
        raise HTTPException(
            status_code=e.response.status_code,
            detail="后端服务错误"
        )
    except Exception as e:
        # 其他未知错误
        print(f"未知错误: {e}")
        raise HTTPException(status_code=500, detail="内部服务器错误")
```

---

## 6. HTTP客户端使用

### 6.1 httpx基础用法

```python
import httpx

# 初始化客户端
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(5.0),  # 5秒超时
    limits=httpx.Limits(max_connections=100)
)

# GET请求
async def get_data(url: str, params: dict = None):
    response = await http_client.get(url, params=params)
    return response.json()

# POST请求
async def post_data(url: str, data: dict):
    response = await http_client.post(
        url, 
        json=data,
        headers={"Content-Type": "application/json"}
    )
    return response.json()
```

### 6.2 错误处理

```python
async def safe_request(url: str):
    try:
        response = await http_client.get(url)
        response.raise_for_status()  # 检查HTTP状态码
        return response.json()
    except httpx.RequestError as e:
        # 网络连接错误
        print(f"连接错误: {e}")
        return None
    except httpx.HTTPStatusError as e:
        # HTTP状态码错误
        print(f"HTTP错误: {e.response.status_code}")
        return None
```

---

## 7. 缓存操作

### 7.1 Redis基础操作

```python
import redis.asyncio as redis
import json

# 初始化Redis客户端
redis_client = redis.from_url("redis://localhost:6379", decode_responses=True)

# 设置缓存
async def set_cache(key: str, data: dict, ttl: int = 60):
    await redis_client.setex(key, ttl, json.dumps(data))

# 获取缓存
async def get_cache(key: str) -> dict:
    data = await redis_client.get(key)
    return json.loads(data) if data else None

# 删除缓存
async def delete_cache(key: str):
    await redis_client.delete(key)
```

### 7.2 缓存策略

```python
async def get_dashboard_with_cache(client_type: str):
    cache_key = f"dashboard:{client_type}"
    
    # 尝试从缓存获取
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data
    
    # 缓存未命中，调用API
    fresh_data = await call_api("/dashboard")
    
    # 设置缓存
    await set_cache(cache_key, fresh_data, ttl=60)
    
    return fresh_data
```

---

## 8. 实战代码解析

### 8.1 多端数据聚合

```python
@app.get("/bff/{client_type}/dashboard")
async def get_client_dashboard(
    client_type: str = Path(..., description="客户端类型"),
    cache: bool = Query(True, description="是否使用缓存")
):
    # 1. 缓存检查
    cache_key = f"dashboard:{client_type}"
    if cache:
        cached_data = await get_cached_data(cache_key)
        if cached_data:
            return DashboardResponse(**cached_data)
    
    # 2. 并行调用多个API
    tasks = [
        call_golang_api("/stats/online"),
        call_golang_api("/stats/hot-pages"),
        call_golang_api("/stats/events"),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 3. 数据适配
    if client_type == "mobile":
        # 移动端简化数据
        response_data = {
            "online_users": results[0].get("count", 0),
            "hot_pages": results[1].get("pages", [])[:3],  # 只返回前3个
        }
    else:
        # Web端完整数据
        response_data = {
            "online_users": results[0].get("count", 0),
            "hot_pages": results[1].get("pages", [])[:5],
        }
    
    # 4. 缓存结果
    if cache:
        await set_cached_data(cache_key, response_data)
    
    return DashboardResponse(**response_data)
```

### 8.2 批量事件处理

```python
@app.post("/bff/events/batch")
async def batch_events(request: BatchEventRequest, background_tasks: BackgroundTasks):
    # 1. 数据清洗
    cleaned_events = []
    for event in request.events:
        cleaned_event = {
            "user_id": event.user_id,
            "page_url": event.page_url[:512],  # 限制长度
            "timestamp": event.timestamp,
        }
        cleaned_events.append(cleaned_event)
    
    # 2. 转发到后端服务
    try:
        response = await http_client.post(
            f"{Config.GOLANG_SERVICE_URL}/api/events",
            json={"events": cleaned_events}
        )
        response.raise_for_status()
        result = response.json()
    except Exception as e:
        raise HTTPException(status_code=503, detail="事件处理失败")
    
    # 3. 后台任务：清理缓存
    background_tasks.add_task(invalidate_cache)
    
    return {
        "status": "success",
        "processed_count": len(cleaned_events)
    }
```

---

## 🎯 快速上手清单

### 必须掌握的概念

- [ ] async/await 异步编程
- [ ] FastAPI路由装饰器 (@app.get, @app.post)
- [ ] Pydantic数据模型
- [ ] HTTPException错误处理
- [ ] 查询参数和路径参数
- [ ] httpx HTTP客户端
- [ ] Redis缓存操作

### 常用代码模板

```python
# 1. 异步路由模板
@app.get("/api/resource/{id}")
async def get_resource(
    id: str = Path(...),
    cache: bool = Query(True)
):
    try:
        # 缓存检查
        if cache:
            cached = await get_cache(f"resource:{id}")
            if cached:
                return cached
        
        # 调用外部API
        data = await call_external_api(f"/resource/{id}")
        
        # 设置缓存
        if cache:
            await set_cache(f"resource:{id}", data)
        
        return data
    except Exception as e:
        raise HTTPException(status_code=503, detail="服务不可用")

# 2. 并行调用模板
async def aggregate_data():
    tasks = [
        call_api("/endpoint1"),
        call_api("/endpoint2"),
        call_api("/endpoint3"),
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return process_results(results)

# 3. 数据清洗模板
def clean_event_data(raw_events: List[dict]) -> List[dict]:
    cleaned = []
    for event in raw_events:
        cleaned_event = {
            "user_id": event.get("user_id", ""),
            "timestamp": event.get("timestamp", 0),
            "page_url": event.get("page_url", "")[:512],  # 限制长度
        }
        cleaned.append(cleaned_event)
    return cleaned
```

---

## 📚 进阶学习建议

1. **深入学习异步编程**：理解事件循环、并发控制
2. **掌握依赖注入**：FastAPI的依赖系统
3. **学习中间件开发**：自定义请求/响应处理
4. **数据库操作**：SQLAlchemy + 异步数据库
5. **测试编写**：pytest + async测试

记住：**先会用，再深入**。这份文档涵盖的20%核心知识足以让你完成大部分BFF开发任务！
