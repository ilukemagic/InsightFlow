# InsightFlow - 用户行为分析平台

<div align="center">

![InsightFlow Logo](https://img.shields.io/badge/InsightFlow-用户行为分析平台-blue?style=for-the-badge)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)]()
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)]()
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)]()
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white)]()
[![Kafka](https://img.shields.io/badge/Apache%20Kafka-231F20?style=flat&logo=apache-kafka&logoColor=white)]()

**一个现代化的用户行为分析平台，提供实时数据采集、分析和可视化功能**

</div>

## ✨ 特性

- 🚀 **高性能数据采集**: TypeScript SDK 支持自动事件追踪和批量发送
- 📊 **实时数据分析**: Go 微服务架构提供毫秒级响应
- 🔧 **多端适配**: 支持 Web、移动端、大屏等多种客户端
- 🎯 **智能缓存**: Redis 缓存机制优化查询性能
- 📈 **可视化仪表盘**: 实时统计图表和数据可视化
- 🔒 **类型安全**: 全栈 TypeScript 支持，完整的类型定义
- 🐳 **容器化部署**: Docker 一键部署，简化运维

## 🏗️ 架构设计

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │    TypeScript   │    │   演示页面      │
│   (Web 应用)    │◄──►│      SDK        │◄──►│   (Demo)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
         ┌─────────────────────────────────────────────────────┐
         │              FastAPI BFF 层                        │
         │         (多端数据聚合、格式转换、协议适配)          │
         └─────────────────────────────────────────────────────┘
                                 │
                                 ▼
         ┌─────────────────────────────────────────────────────┐
         │                 Kafka 消息队列                     │
         │            (user_events topic)                     │
         └─────────────────────────────────────────────────────┘
                                 │
                                 ▼
         ┌─────────────────────────────────────────────────────┐
         │                Go 微服务                          │
         │    (事件处理、数据分析、分层架构、中间件支持)       │
         └─────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │      MySQL      │ │      Redis      │ │      Kafka      │
    │   (主数据库)    │ │     (缓存)      │ │   (消息队列)    │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **Python** >= 3.8
- **Go** >= 1.21
- **MySQL** >= 8.0
- **Redis** >= 6.0
- **Kafka** >= 2.8.0
- **Docker** (可选，推荐)

### 一键启动 MVP

```bash
# 克隆项目
git clone <repository-url>
cd user-activity-dashboard

# 启动完整服务栈
./start-mvp.sh

# 停止服务
./stop-mvp.sh

# 运行测试
./test-mvp.sh
```

### 手动启动

#### 1. 启动数据库服务

```bash
# 使用 Docker 启动 MySQL、Redis 和 Kafka
docker-compose up -d mysql redis kafka
```

#### 2. 启动后端服务

```bash
# Go 微服务
cd backend/golang
go mod tidy
go run main.go

# FastAPI BFF 层
cd backend/fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 3. 启动前端

```bash
# 构建 SDK
cd frontend/sdk
pnpm install
pnpm run build

# 启动演示页面
cd ../demo
pnpm install
pnpm start
```

## 📁 项目结构

```
user-activity-dashboard/
├── 📂 frontend/               # 前端代码
│   ├── 📂 sdk/               # TypeScript SDK
│   │   ├── insightflow-sdk.ts # SDK 主文件
│   │   ├── package.json      # SDK 包配置
│   │   └── dist/             # 构建产物
│   └── 📂 demo/              # 演示页面
│       ├── index.html        # 演示页面
│       └── package.json      # 演示应用配置
├── 📂 backend/               # 后端服务
│   ├── 📂 fastapi/          # BFF 层 (Python)
│   │   ├── main.py          # FastAPI 主应用
│   │   └── requirements.txt  # Python 依赖
│   └── 📂 golang/           # 微服务层 (Go)
│       ├── main.go          # Go 主服务入口
│       ├── config/          # 配置管理
│       ├── models/          # 数据模型
│       ├── infrastructure/  # 基础设施(MySQL/Redis/Kafka)
│       ├── services/        # 业务逻辑服务
│       ├── middleware/      # HTTP 中间件
│       ├── handlers/        # HTTP 处理器
│       ├── internal/        # 应用程序结构
│       └── go.mod           # Go 模块依赖
├── 📂 database/             # 数据库脚本
│   └── schema.sql           # MySQL 数据库架构
├── 📂 docs/                 # 项目文档
├── 📂 logs/                 # 日志文件
├── 🐳 docker-compose.yml    # Docker 编排
├── 🚀 start-mvp.sh          # 一键启动脚本
├── 🛑 stop-mvp.sh           # 停止服务脚本
├── 🧪 test-mvp.sh           # 测试脚本
├── 📄 LICENSE               # MIT 许可证
└── 📖 README.md             # 项目说明
```

## 🔧 SDK 使用

### 安装 SDK

```bash
npm install @insightflow/sdk
```

### 基础用法

```typescript
import InsightFlowSDK from '@insightflow/sdk';

// 初始化 SDK
const analytics = new InsightFlowSDK({
  apiUrl: '/bff/events/batch',
  userId: 'user123',
  debug: true
});

// 追踪自定义事件
analytics.track('button_click', {
  button_name: '购买按钮',
  product_id: 'prod123'
});

// 追踪购买事件
analytics.trackPurchase({
  order_id: 'order123',
  total_amount: 99.99,
  currency: 'CNY'
});
```

### 浏览器直接使用

```html
<script>
  window.insightflowConfig = {
    apiUrl: '/bff/events/batch',
    debug: true
  };
</script>
<script src="dist/insightflow-sdk.umd.js"></script>
<script>
  // SDK 自动初始化为 window.insightflow
  window.insightflow.track('page_view');
</script>
```

详细的 SDK 文档请查看：[SDK README](./frontend/sdk/README.md)

## 🌐 API 接口

### BFF 层接口 (FastAPI)

- **POST** `/bff/events/batch` - 批量事件上报
- **GET** `/bff/{client_type}/dashboard` - 多端仪表盘数据
- **GET** `/bff/user/{user_id}/analytics` - 用户行为分析
- **GET** `/bff/funnel/analysis` - 漏斗分析
- **GET** `/bff/stats/realtime` - 实时统计

### 微服务层接口 (Go)

- **POST** `/api/events` - 事件接收和 Kafka 发布
- **GET** `/api/stats/online` - 在线用户统计
- **GET** `/api/stats/hot-pages` - 热门页面统计  
- **GET** `/api/user/{user_id}/events` - 用户事件查询
- **GET** `/api/stats/events` - 事件统计分析
- **GET** `/api/stats/conversion` - 转化率分析

## 🚀 部署

### Docker 部署 (推荐)

```bash
# 构建和启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境部署

1. **数据库**: MySQL 主从配置
2. **缓存**: Redis 集群部署  
3. **消息队列**: Kafka 集群部署
4. **负载均衡**: Nginx 反向代理
5. **容器编排**: Docker Compose 或 Kubernetes

## 🧪 测试

```bash
# 运行所有测试
./test-mvp.sh

# 单独运行 SDK 测试
cd frontend/sdk
pnpm test

# 运行后端测试
cd backend/golang
go test ./...

cd backend/fastapi
pytest
```

## 📊 技术特性

- **Go 微服务**: 分层架构，支持中间件链
- **Kafka 集成**: 异步事件处理，高吞吐量
- **MySQL + Redis**: 持久化存储 + 高速缓存
- **TypeScript SDK**: 类型安全，多种构建格式
- **FastAPI BFF**: 多端适配，数据聚合
- **Docker 支持**: 容器化部署，一键启动

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源。

## 🔗 相关链接

- [TypeScript SDK 文档](./frontend/sdk/README.md)
- [Go 后端重构总结](./backend/golang/REFACTORING_SUMMARY.md)
- [演示页面](./frontend/demo/index.html)

## 📧 联系我们

如有问题或建议，请提交 [Issue](../../issues) 或联系开发团队。

---

<div align="center">
  <p>由 ❤️ 构建，为了更好的用户体验分析</p>
</div>
