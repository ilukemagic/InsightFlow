# InsightFlow Hono.js BFF 服务

## 📁 项目结构

```
backend/hono/
├── src/                          # 源代码
│   ├── config/                   # 配置管理
│   │   └── index.ts             # 应用配置
│   ├── core/                    # 核心功能
│   │   ├── cache.ts             # Redis缓存管理
│   │   └── http-client.ts       # HTTP客户端
│   ├── middleware/              # 中间件
│   │   ├── cors.ts              # CORS中间件
│   │   ├── error-handler.ts     # 错误处理中间件
│   │   └── logger.ts            # 日志中间件
│   ├── routes/                  # API路由
│   │   ├── dashboard.ts         # 仪表盘接口
│   │   ├── events.ts            # 事件接口
│   │   ├── users.ts             # 用户接口
│   │   ├── health.ts            # 健康检查接口
│   │   └── index.ts             # 路由索引
│   ├── services/                # 业务服务
│   │   ├── golang-service.ts    # Golang服务调用
│   │   └── analytics-service.ts # 分析服务
│   ├── types/                   # 类型定义
│   │   └── index.ts             # 全局类型
│   └── index.ts                 # 应用入口
├── dist/                        # 编译输出
├── package.json                 # 项目配置
├── tsconfig.json               # TypeScript配置
├── config.env.example          # 环境变量示例
└── README.md                   # 说明文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend/hono
npm install
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
# 开发模式（带热重载）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务
npm start
```

### 4. 访问接口

- 服务地址: http://localhost:8000
- 健康检查: http://localhost:8000/health
- 系统指标: http://localhost:8000/metrics

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

### 技术栈
- **Hono.js**: 轻量级、高性能的Web框架
- **TypeScript**: 类型安全的JavaScript
- **Redis**: 缓存和会话存储
- **Zod**: 运行时类型验证

### 模块化设计
- **types/**: 使用TypeScript定义数据类型
- **routes/**: 按功能模块组织API路由
- **core/**: 核心功能模块，如缓存、HTTP客户端
- **services/**: 业务逻辑服务层
- **middleware/**: 中间件层，处理CORS、错误、日志等
- **config/**: 统一配置管理

### 设计原则
1. **类型安全**: 全面使用TypeScript和Zod验证
2. **模块化**: 清晰的文件结构和职责分离
3. **异步优先**: 所有IO操作使用异步模式
4. **错误处理**: 统一的异常处理机制
5. **配置外部化**: 通过环境变量管理配置

## 🔍 与FastAPI版本的对比

### 相同功能
✅ 完整的API接口兼容性  
✅ 多端仪表盘数据适配  
✅ Redis缓存管理  
✅ 健康检查和监控  
✅ 错误处理和日志  
✅ 环境变量配置  

### 技术优势
🚀 **性能更优**: Hono.js比FastAPI更轻量、更快  
📦 **部署更简单**: 单个Node.js进程，无需Python环境  
🔧 **开发体验更好**: TypeScript提供更好的IDE支持  
🌐 **标准化**: 基于Web标准API，兼容性更好  

## 🧪 开发说明

### 添加新接口
1. 在 `types/` 中定义数据类型
2. 在 `routes/` 中创建路由文件
3. 在 `routes/index.ts` 中注册路由
4. 如需要，在 `services/` 中添加业务逻辑

### 类型安全
- 使用Zod进行请求验证
- 定义完整的TypeScript类型
- 利用编译时类型检查

### 代码规范
- 使用TypeScript严格模式
- 添加JSDoc注释
- 遵循ESLint规则
- 使用异步函数处理IO操作

## 📋 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建
npm run build

# 启动
npm start

# 测试
npm test
```

## 🔗 相关文档

- [Hono.js 官方文档](https://hono.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Zod 文档](https://zod.dev/)
- [Redis 文档](https://redis.io/docs/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件 