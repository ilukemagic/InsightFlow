# InsightFlow 用户行为分析平台PRD文档

## 项目简介

**InsightFlow**（洞察流）是一款支持多端接入的实时用户行为分析平台，通过**前端埋点→Kafka流处理→Golang计算→多级存储→BFF数据聚合→可视化**全链路，实现用户行为洞察与业务决策支持。

## 一、项目概述

构建支持多端接入的实时用户行为分析平台，核心解决三大问题：

- **数据割裂**：整合点击、浏览、转化等多源行为数据[1,4](@ref)
- **多端适配**：为Web/App/大屏提供差异化数据服务[6,7](@ref)
- **实时性瓶颈**：通过Redis+Kafka实现秒级分析响应[5](@ref)

### 产品愿景

InsightFlow 致力于成为企业数字化转型中最重要的用户洞察工具，通过实时、准确、智能的行为分析，帮助企业深度理解用户需求，优化产品体验，驱动业务增长。

### 更新说明

新增FastAPI BFF层解决多端数据聚合问题，替代原Golang直接对接前端的方案

## 二、系统架构

### 架构升级点

```
[前端埋点] → [FastAPI BFF] → [Golang微服务] → [Kafka]
                               ↓      ↑
                          [Redis]   [MySQL/Doris]
```

引入**三层解耦设计**：前端交互层（Vue）、BFF适配层（FastAPI）、数据处理层（Golang）[7](@ref)

| 组件 | 技术选型 | 核心职责 | 优化点 |
|------|----------|----------|--------|
| BFF层 | Python+FastAPI | <ul><li>多端路由分发（Web/App/TV）</li><li>并行聚合Golang微服务数据[7](@ref)</li><li>协议转换（Protobuf→JSON）</li></ul> | 异步IO提升3x并发性能[4](@ref) |
| 数据处理层 | Golang | <ul><li>Kafka流处理（Sarama库）</li><li>Redis热点数据计算（在线用户数/热门页面）</li><li>MySQL持久化（用户行为日志）</li></ul> | Goroutine池优化消费速率 |
| 存储层 | Redis+MySQL+Apache Doris | <ul><li>Redis：实时看板数据（ZSET排序）</li><li>MySQL：原始行为日志</li><li>Doris：历史数据分析（替代ClickHouse）[5](@ref)</li></ul> | Doris内置`retention`/`window_funnel`函数加速漏斗分析[5](@ref) |

## 三、核心功能模块

### 3.1 数据采集SDK（前端核心）

基于淘宝埋点模型优化[1](@ref)：

```javascript
class BehaviorCollector {
  trackEvent('click', { 
    element: 'buy_button', 
    position: {x: 120, y: 340 }, // 坐标捕获[4](@ref)
    sessionId: 'x1y2z3' 
  })
}
```

支持**三种埋点策略**：

- 点击轨迹：通过MutationObserver捕获元素级操作[4](@ref)
- 滚动深度：记录页面停留热点区域
- 环境数据：设备/网络/屏幕信息[4](@ref)

### 3.2 BFF数据聚合服务

| 接口 | 输入 | 处理逻辑 | 输出示例 |
|------|------|----------|----------|
| `GET /bff/{client_type}/dashboard` | client_type: [web｜mobile｜tv] | <ol><li>并行调用Golang微服务：<br/>- Redis实时指标<br/>- MySQL历史行为<br/>- Kafka消费延迟</li><li>数据脱敏（AES-256加密）[4](@ref)</li></ol> | ```json<br/>{<br/>  "web": { <br/>    "hot_pages": [商品页, 活动页], <br/>    "funnel": [85%, 30%, 10%] //淘宝转化率模型[1](@ref)<br/>  },<br/>  "mobile": { "uv": 1500, "online": 342 }<br/>}<br/>``` |

### 3.3 行为分析引擎

整合淘宝与技能学习平台分析模型[1,3](@ref)：

- **漏斗分析**：`window_funnel()`函数计算点击→加购→购买转化[5](@ref)
- **用户分群**：k-means聚类识别高价值用户（RFM模型）[1](@ref)
- **路径挖掘**：PrefixSpan算法发现高频操作序列[4](@ref)

## 四、非功能性需求

| 维度 | 指标 | 实现方案 |
|------|------|----------|
| 性能 | BFF响应＜200ms | Redis缓存+FastAPI异步调用 |
| 数据时效性 | 从T+1→分钟级 | Kafka流处理+Doris实时查询[5](@ref) |
| 安全性 | 位置模糊处理 | 地理位置随机偏移0.001度[4](@ref) |

## 五、实施路线图

1. **Phase 1（2周）**：前端埋点SDK + Golang基础API（无BFF）
2. **Phase 2（1周）**：部署FastAPI BFF层（基础路由）
3. **Phase 3（2周）**：集成行为分析模型（漏斗/分群）[1,3](@ref)
4. **Phase 4（持续）**：Laravel构建InsightFlow管理后台（复用BFF接口）

---

## 📋 项目命名说明

### 为什么选择 "InsightFlow"？

- **Insight**：体现深度洞察和智能分析的核心价值
- **Flow**：代表数据流动、用户行为流和分析流程的顺畅
- **简洁易记**：6个字母+4个字母，朗朗上口
- **国际化**：英文名称便于产品国际化推广
- **中文名**：洞察流 - 简洁有力，体现产品特色

### 产品Slogan
>
> **"让数据流动，让洞察发声"** - Make Data Flow, Let Insights Speak
