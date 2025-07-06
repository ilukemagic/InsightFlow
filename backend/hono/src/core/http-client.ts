/**
 * HTTP客户端管理核心模块
 */

import { settings } from '../config';
import { ServiceError } from '../types';

class HTTPClientManager {
  private abortController: AbortController | null = null;

  async init(): Promise<void> {
    // HTTP客户端无需特殊初始化
    console.log('HTTP客户端管理器初始化完成');
  }

  async close(): Promise<void> {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    try {
      const urlWithParams = new URL(url);
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          urlWithParams.searchParams.append(key, String(value));
        });
      }

      const response = await fetch(urlWithParams.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(settings.http.timeout),
      });

      if (!response.ok) {
        const error = new Error(`HTTP错误: ${response.status} ${response.statusText}`) as ServiceError;
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('请求超时') as ServiceError;
          timeoutError.statusCode = 408;
          throw timeoutError;
        }
        
        const serviceError = error as ServiceError;
        serviceError.statusCode = serviceError.statusCode || 503;
        throw serviceError;
      }
      
      const unknownError = new Error('网络请求失败') as ServiceError;
      unknownError.statusCode = 503;
      throw unknownError;
    }
  }

  async post<T = any>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    try {
      const requestInit: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        signal: AbortSignal.timeout(settings.http.timeout),
      };
      
      if (data) {
        requestInit.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        const error = new Error(`HTTP错误: ${response.status} ${response.statusText}`) as ServiceError;
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('请求超时') as ServiceError;
          timeoutError.statusCode = 408;
          throw timeoutError;
        }
        
        const serviceError = error as ServiceError;
        serviceError.statusCode = serviceError.statusCode || 503;
        throw serviceError;
      }
      
      const unknownError = new Error('网络请求失败') as ServiceError;
      unknownError.statusCode = 503;
      throw unknownError;
    }
  }

  async healthCheck(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(settings.http.timeout),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const httpClientManager = new HTTPClientManager(); 