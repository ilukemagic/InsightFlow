/**
 * 错误处理中间件
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ServiceError } from '../types';

export const errorHandler = async (c: Context, next: Next): Promise<Response | void> => {
  try {
    await next();
  } catch (error) {
    console.error('请求处理错误:', error);

    if (error instanceof HTTPException) {
      return c.json({
        success: false,
        error: error.message,
        status: error.status,
      }, error.status);
    }

    if (error instanceof Error) {
      const serviceError = error as ServiceError;
      const status = serviceError.statusCode || 500;
      
      return c.json({
        success: false,
        error: serviceError.message,
        status,
      }, status);
    }

    return c.json({
      success: false,
      error: '服务器内部错误',
      status: 500,
    }, 500);
  }
}; 