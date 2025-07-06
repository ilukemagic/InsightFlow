/**
 * 健康检查和监控API路由
 */

import { Hono } from 'hono';
import { cacheManager } from '../core/cache';
import { golangService } from '../services/golang-service';
import { settings } from '../config';
import { HealthResponse, MetricsResponse } from '../types';

const health = new Hono();

// 健康检查接口
health.get('/health', async (c) => {
  // 检查Redis连接
  const redisStatus = (await cacheManager.ping()) ? 'healthy' : 'unhealthy';

  // 检查Golang服务连接
  const golangStatus = (await golangService.healthCheck()) ? 'healthy' : 'unhealthy';

  const overallStatus = redisStatus === 'healthy' && golangStatus === 'healthy' ? 'healthy' : 'degraded';

  const response: HealthResponse = {
    status: overallStatus,
    services: {
      redis: redisStatus,
      golang: golangStatus,
    },
    timestamp: new Date().toISOString(),
    version: settings.app.version,
  };

  return c.json(response);
});

// 系统指标接口
health.get('/metrics', async (c) => {
  try {
    // 获取一些基础指标
    const redisInfo = await cacheManager.getInfo('memory');

    const response: MetricsResponse = {
      redis_memory_used: redisInfo.used_memory_human || 'unknown',
      active_connections: 'unknown', // 实际应该从连接池获取
      cache_hit_rate: 'unknown', // 实际应该计算缓存命中率
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error('获取指标失败:', error);
    return c.json({ error: '获取指标失败' }, 503);
  }
});

export default health; 