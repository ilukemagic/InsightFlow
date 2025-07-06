/**
 * InsightFlow Hono.js BFF 应用入口
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { settings } from './config';
import { cacheManager } from './core/cache';
import { httpClientManager } from './core/http-client';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/error-handler';
import { loggerMiddleware } from './middleware/logger';
import routes from './routes';

// 创建Hono应用实例
const app = new Hono();

// 注册中间件
app.use('*', loggerMiddleware);
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// 注册路由
app.route('/', routes);

// 根路径信息
app.get('/', (c) => {
  return c.json({
    name: settings.app.title,
    description: settings.app.description,
    version: settings.app.version,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 应用启动函数
async function startServer() {
  try {
    // 初始化连接
    await cacheManager.init();
    await httpClientManager.init();
    
    console.log('🚀 InsightFlow Hono.js BFF 服务启动完成');
    console.log(`📡 服务运行在: http://${settings.server.host}:${settings.server.port}`);
    console.log(`📚 环境: ${settings.server.nodeEnv}`);
    
    // 启动服务器
    serve({
      fetch: app.fetch,
      port: settings.server.port,
      hostname: settings.server.host,
    });
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('\n👋 正在关闭服务...');
  
  try {
    await cacheManager.close();
    await httpClientManager.close();
    console.log('✅ 服务已安全关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 关闭服务时发生错误:', error);
    process.exit(1);
  }
});

// 启动服务
if (require.main === module) {
  startServer();
}

export default app; 