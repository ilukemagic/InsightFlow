/**
 * 事件相关API路由
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { golangService } from '../services/golang-service';
import { analyticsService } from '../services/analytics-service';
import { EventResponse } from '../types';

const events = new Hono();

// 验证器
const eventDataSchema = z.object({
  user_id: z.string(),
  session_id: z.string(),
  event_type: z.string(),
  page_url: z.string(),
  element: z.string().optional(),
  element_text: z.string().optional(),
  timestamp: z.number(),
  extra_data: z.record(z.any()).optional(),
});

const batchEventSchema = z.object({
  events: z.array(eventDataSchema),
});

// 批量事件上报接口
events.post('/batch', zValidator('json', batchEventSchema), async (c) => {
  const { events: rawEvents } = c.req.valid('json');

  // 数据验证和清洗
  const cleanedEvents = analyticsService.cleanEventData(rawEvents as any[]);

  // 转发到Golang服务
  const golangResult = await golangService.postEvents(cleanedEvents);

  // 后台任务：更新实时缓存
  // 注意：在Hono中我们不能直接使用BackgroundTasks，需要用其他方式实现
  setTimeout(() => {
    analyticsService.invalidateDashboardCache();
  }, 0);

  const response: EventResponse = {
    status: 'success',
    message: `成功处理 ${cleanedEvents.length} 个事件`,
    processed_count: cleanedEvents.length,
    golang_response: golangResult,
  };

  return c.json(response);
});

export default events; 