/**
 * Zod验证schemas
 */

import { z } from 'zod';

// 基础验证schemas
export const clientTypeSchema = z.enum(['web', 'mobile', 'tv']);

export const cacheQuerySchema = z.object({
  cache: z.string().optional().default('true'),
});

export const userIdSchema = z.object({
  user_id: z.string(),
});

export const limitQuerySchema = z.object({
  limit: z.string().optional().default('50'),
});

export const funnelQuerySchema = z.object({
  funnel_id: z.string().optional().default('default'),
  cache: z.string().optional().default('true'),
});

// 事件相关schemas
export const eventDataSchema = z.object({
  user_id: z.string(),
  session_id: z.string(),
  event_type: z.string(),
  page_url: z.string().max(512),
  element: z.string().max(128).optional(),
  element_text: z.string().max(256).optional(),
  timestamp: z.number().int().positive(),
  extra_data: z.record(z.any()).optional(),
});

export const batchEventSchema = z.object({
  events: z.array(eventDataSchema).min(1).max(100),
});

// 响应schemas
export const healthResponseSchema = z.object({
  status: z.string(),
  services: z.record(z.string()),
  timestamp: z.string(),
  version: z.string(),
});

export const metricsResponseSchema = z.object({
  redis_memory_used: z.string(),
  active_connections: z.string(),
  cache_hit_rate: z.string(),
  timestamp: z.string(),
}); 