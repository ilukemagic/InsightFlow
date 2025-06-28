# InsightFlow SDK (TypeScript版本)

一个强大的用户行为分析 SDK，支持自动事件采集、批量发送和会话管理。

## 特性

- ✅ **TypeScript 支持**: 完整的类型定义
- ✅ **自动事件追踪**: 点击、滚动、表单提交等
- ✅ **批量发送**: 高效的事件批处理
- ✅ **会话管理**: 自动会话跟踪
- ✅ **重试机制**: 网络故障自动重试
- ✅ **多种构建格式**: CommonJS、ES Module、UMD
- ✅ **符合 FastAPI 接口**: 与后端完美兼容

## 安装

```bash
npm install @insightflow/sdk
```

## 快速开始

### ES Module 方式

```typescript
import InsightFlowSDK from '@insightflow/sdk';

// 初始化 SDK
const analytics = new InsightFlowSDK({
  apiUrl: '/bff/events/batch',
  userId: 'user123',
  debug: true,
  batchSize: 10,
  batchTimeout: 5000
});

// 手动追踪事件
analytics.track('button_click', {
  button_name: '购买按钮',
  page_section: 'product_detail'
});
```

### CommonJS 方式

```javascript
const InsightFlowSDK = require('@insightflow/sdk').default;

const analytics = new InsightFlowSDK({
  apiUrl: '/bff/events/batch',
  debug: true
});
```

### 浏览器直接引入

```html
<script src="dist/insightflow-sdk.umd.js"></script>
<script>
  const analytics = new InsightFlowSDK({
    apiUrl: '/bff/events/batch',
    debug: true
  });
</script>
```

### 全局配置方式

```html
<script>
  // 在 SDK 加载前设置配置
  window.insightflowConfig = {
    apiUrl: '/bff/events/batch',
    userId: 'user123',
    debug: true,
    enableAutoTrack: true
  };
</script>
<script src="dist/insightflow-sdk.umd.js"></script>
<!-- SDK 会自动初始化为 window.insightflow -->
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `apiUrl` | string | `/bff/events/batch` | 事件上报接口地址 |
| `batchSize` | number | `10` | 批量发送的事件数量 |
| `batchTimeout` | number | `5000` | 批量发送的超时时间(ms) |
| `enableAutoTrack` | boolean | `true` | 是否启用自动事件追踪 |
| `userId` | string | 自动生成 | 用户ID |
| `debug` | boolean | `false` | 是否启用调试模式 |
| `retryAttempts` | number | `3` | 失败重试次数 |
| `retryDelay` | number | `1000` | 重试延迟时间(ms) |

## API 文档

### 基础方法

#### `track(eventType: string, data?: object)`

手动追踪事件。

```typescript
analytics.track('purchase', {
  order_id: 'order123',
  total_amount: 99.99,
  currency: 'CNY'
});
```

#### `flush(sync?: boolean)`

立即发送所有待发送的事件。

```typescript
// 异步发送
await analytics.flush();

// 同步发送（页面卸载时）
analytics.flush(true);
```

### 专用追踪方法

#### `trackPurchase(orderData)`

追踪购买事件。

```typescript
analytics.trackPurchase({
  order_id: 'order123',
  total_amount: 99.99,
  currency: 'CNY',
  items: [
    { name: '商品A', price: 49.99, quantity: 1 },
    { name: '商品B', price: 49.99, quantity: 1 }
  ]
});
```

#### `trackPageView(pageData)`

追踪页面浏览。

```typescript
analytics.trackPageView({
  page_category: 'product',
  page_name: 'product_detail',
  product_id: 'prod123'
});
```

#### `setUserProperties(properties)`

设置用户属性。

```typescript
analytics.setUserProperties({
  age: 25,
  gender: 'male',
  membership: 'premium'
});
```

### 用户管理

#### `setUserId(userId: string)`

设置用户ID。

```typescript
analytics.setUserId('user123');
```

#### `getUserId()`

获取当前用户ID。

```typescript
const userId = analytics.getUserId();
```

#### `getSessionId()`

获取当前会话ID。

```typescript
const sessionId = analytics.getSessionId();
```

### 状态查询

#### `getPendingEventsCount()`

获取待发送事件数量。

```typescript
const count = analytics.getPendingEventsCount();
```

#### `getConfig()`

获取当前配置。

```typescript
const config = analytics.getConfig();
```

### 生命周期管理

#### `destroy()`

销毁 SDK 实例。

```typescript
analytics.destroy();
```

## 自动事件追踪

SDK 默认会自动追踪以下事件：

- **页面浏览** (`view`): 页面加载时自动触发
- **点击事件** (`click`): 所有元素点击
- **滚动事件** (`scroll`): 页面滚动（节流处理）
- **表单提交** (`form_submit`): 表单提交事件
- **页面可见性** (`visibility_change`): 页面可见性变化

### 禁用自动追踪

```typescript
const analytics = new InsightFlowSDK({
  enableAutoTrack: false
});
```

## 事件数据结构

SDK 发送的事件数据符合 FastAPI 后端接口规范：

```typescript
interface EventData {
  user_id: string;           // 用户ID
  session_id: string;        // 会话ID
  event_type: string;        // 事件类型
  page_url: string;          // 页面URL
  element?: string;          // 元素标签名
  element_text?: string;     // 元素文本
  timestamp: number;         // 时间戳
  extra_data?: object;       // 扩展数据
}
```

## 错误处理

SDK 内置了完善的错误处理机制：

- **网络重试**: 网络请求失败时自动重试
- **降级处理**: 在页面卸载时使用 `sendBeacon` API
- **事件恢复**: 发送失败的事件会重新加入队列

## TypeScript 支持

SDK 提供完整的 TypeScript 类型定义：

```typescript
import InsightFlowSDK, { 
  SDKConfig, 
  EventData, 
  PurchaseEventData 
} from '@insightflow/sdk';

const config: SDKConfig = {
  apiUrl: '/bff/events/batch',
  debug: true
};

const analytics = new InsightFlowSDK(config);
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm run dev

# 构建
pnpm run build

# 代码检查
pnpm run lint

# 运行测试
pnpm run test
```

## 许可证

MIT License
