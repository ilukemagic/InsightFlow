/**
 * CORS中间件
 */

import { cors } from 'hono/cors';
import { settings } from '../config';

export const corsMiddleware = cors({
  origin: (origin) => {
    if (settings.cors.allowedOrigins.includes('*')) {
      return origin;
    }
    return settings.cors.allowedOrigins.includes(origin || '') ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
}); 