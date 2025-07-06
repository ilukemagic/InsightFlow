/**
 * 仪表盘相关API路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { cacheManager } from '../core/cache';
import { golangService } from '../services/golang-service';
import { analyticsService } from '../services/analytics-service';
import { settings } from '../config';
import { ClientType, DashboardResponse, RealtimeStatsResponse } from '../types';

const dashboard = new Hono();

// 验证器
const clientTypeSchema = z.object({
  client_type: z.enum(['web', 'mobile', 'tv']),
});

const cacheQuerySchema = z.object({
  cache: z.string().optional().default('true'),
});

// 多端仪表盘数据聚合接口
dashboard.get(
  '/:client_type/dashboard',
  zValidator('param', clientTypeSchema),
  zValidator('query', cacheQuerySchema),
  async (c) => {
    const { client_type } = c.req.valid('param');
    const { cache } = c.req.valid('query');
    
    const useCache = cache === 'true';
    const cacheKey = `dashboard:${client_type}`;

    // 尝试从缓存获取
    if (useCache) {
      const cachedData = await cacheManager.get<DashboardResponse>(cacheKey);
      if (cachedData) {
        return c.json(cachedData);
      }
    }

    // 并行调用多个Golang微服务接口
    const results = await golangService.getDashboardData();

    // 根据客户端类型适配数据格式
    const responseData = analyticsService.adaptDashboardData(client_type as ClientType, results);

    // 缓存结果
    if (useCache) {
      await cacheManager.set(cacheKey, responseData, settings.cache.dashboardTtl);
    }

    return c.json(responseData);
  }
);

// 实时统计数据接口
dashboard.get('/stats/realtime', async (c) => {
  // 并行获取实时数据
  const results = await golangService.getRealtimeData();

  const onlineData = results[0] instanceof Error ? { count: 0 } : results[0];
  const eventsData = results[1] instanceof Error ? { total_events: 0 } : results[1];

  const responseData: RealtimeStatsResponse = {
    online_users: onlineData.count || 0,
    total_events: eventsData.total_events || 0,
    events_per_minute: await analyticsService.getEventsPerMinute(),
    timestamp: Math.floor(Date.now() / 1000),
    server_time: new Date().toISOString(),
  };

  return c.json(responseData);
});

export default dashboard; 