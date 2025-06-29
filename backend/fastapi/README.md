# InsightFlow FastAPI BFF 服务

## 📁 项目结构

```
backend/fastapi/
├── app/                          # 应用代码
│   ├── __init__.py
│   ├── main.py                   # 应用入口
│   ├── config.py                 # 配置管理
│   ├── models/                   # 数据模型
│   │   ├── __init__.py
│   │   ├── events.py            # 事件模型
│   │   └── responses.py         # 响应模型
│   ├── api/                     # API路由
│   │   ├── __init__.py
│   │   └── v1/                  # API版本1
│   │       ├── __init__.py
│   │       ├── dashboard.py     # 仪表盘接口
│   │       ├── events.py        # 事件接口
│   │       ├── users.py         # 用户接口
│   │       └── health.py        # 健康检查接口
│   ├── core/                    # 核心功能
│   │   ├── __init__.py
│   │   ├── cache.py             # 缓存管理
│   │   └── http_client.py       # HTTP客户端
│   └── services/                # 业务服务
│       ├── __init__.py
│       ├── golang_service.py    # Golang服务调用
│       └── analytics_service.py # 分析服务
├── requirements.txt             # 依赖文件
├── config.env.example          # 环境变量示例
├── run.py                      # 启动脚本
└── README.md                   # 说明文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend/fastapi
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制配置文件
cp config.env.example .env

# 编辑配置文件
vim .env
```

### 3. 启动服务

```bash
# 方式1：直接运行启动脚本
python run.py

# 方式2：使用uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 方式3：使用模块方式
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. 访问文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📊 API 接口

### 仪表盘相关
- `GET /bff/{client_type}/dashboard` - 多端仪表盘数据
- `GET /bff/stats/realtime` - 实时统计数据

### 事件相关
- `POST /bff/events/batch` - 批量事件上报

### 用户相关
- `GET /bff/user/{user_id}/analytics` - 用户分析
- `GET /bff/user/funnel/analysis` - 漏斗分析

### 健康检查
- `GET /health` - 健康检查
- `GET /metrics` - 系统指标

## 🔧 配置说明

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| HOST | 0.0.0.0 | 服务监听地址 |
| PORT | 8000 | 服务端口 |
| GOLANG_SERVICE_URL | http://localhost:8080 | Golang服务地址 |
| REDIS_URL | redis://localhost:6379 | Redis连接地址 |
| CACHE_TTL | 60 | 默认缓存时间(秒) |
| DASHBOARD_CACHE_TTL | 30 | 仪表盘缓存时间(秒) |
| FUNNEL_CACHE_TTL | 300 | 漏斗分析缓存时间(秒) |

## 🏗️ 架构说明

### 模块化设计
- **models/**: 使用Pydantic定义数据模型和验证规则
- **api/**: 按功能模块组织API路由
- **core/**: 核心功能模块，如缓存、HTTP客户端
- **services/**: 业务逻辑服务层
- **config.py**: 统一配置管理

### 设计原则
1. **单一职责**: 每个模块只负责一个功能
2. **依赖注入**: 通过全局实例管理依赖
3. **异步优先**: 所有IO操作使用异步模式
4. **错误处理**: 统一的异常处理机制
5. **配置外部化**: 通过环境变量管理配置

## 🧪 开发说明

### 添加新接口
1. 在 `models/` 中定义数据模型
2. 在 `api/v1/` 中创建路由文件
3. 在 `main.py` 中注册路由
4. 如需要，在 `services/` 中添加业务逻辑

### 代码规范
- 使用类型注解
- 添加文档字符串
- 遵循PEP 8编码规范
- 使用异步函数处理IO操作

## 🔍 监控和调试

### 健康检查
```bash
curl http://localhost:8000/health
```

### 系统指标
```bash
curl http://localhost:8000/metrics
```

### 日志配置
通过 `LOG_LEVEL` 环境变量控制日志级别：
- `debug`: 调试信息
- `info`: 一般信息（默认）
- `warning`: 警告信息
- `error`: 错误信息 