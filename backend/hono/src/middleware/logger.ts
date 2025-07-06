/**
 * 日志中间件
 */

import { logger } from 'hono/logger';
import { settings } from '../config';

export const loggerMiddleware = logger((str: string) => {
  if (settings.dev.debug) {
    console.log(str);
  }
}); 