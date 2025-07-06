/**
 * 用户相关API路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { cacheManager } from '../core/cache';
import { golangService } from '../services/golang-service';
import { analyticsService } from '../services/analytics-service';
import { settings } from '../config';
import { UserAnalyticsResponse, FunnelResponse } from '../types';

const users = new Hono();

// 验证器
const userIdSchema = z.object({
  user_id: z.string(),
});

const limitQuerySchema = z.object({
  limit: z.string().optional().default('50'),
});

const funnelQuerySchema = z.object({
  funnel_id: z.string().optional().default('default'),
  cache: z.string().optional().default('true'),
});

// 用户行为分析接口
users.get(
  '/:user_id/analytics',
  zValidator('param', userIdSchema),
  zValidator('query', limitQuerySchema),
  async (c) => {
    const { user_id } = c.req.valid('param');
    const { limit } = c.req.valid('query');
    
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 200);

    // 调用Golang服务获取用户事件
    const eventsData = await golangService.getUserEvents(user_id, limitNum);

    // 分析用户行为
    const events = eventsData.events || [];
    const summary = analyticsService.analyzeUserBehavior(events);

    const response: UserAnalyticsResponse = {
      user_id,
      events,
      summary,
    };

    return c.json(response);
  }
);

// 漏斗分析接口
users.get('/funnel/analysis', zValidator('query', funnelQuerySchema), async (c) => {
  const { funnel_id, cache } = c.req.valid('query');
  
  const useCache = cache === 'true';
  const cacheKey = `funnel:${funnel_id}`;

  // 尝试缓存
  if (useCache) {
    const cachedData = await cacheManager.get<FunnelResponse>(cacheKey);
    if (cachedData) {
      return c.json(cachedData);
    }
  }

  // 调用Golang服务
  const funnelData = await golangService.getFunnelAnalysis(funnel_id);

  // 缓存结果（漏斗分析计算较重，缓存5分钟）
  if (useCache) {
    await cacheManager.set(cacheKey, funnelData, settings.cache.funnelTtl);
  }

  return c.json(funnelData);
});

export default users; 