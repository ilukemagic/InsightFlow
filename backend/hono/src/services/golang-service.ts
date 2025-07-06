/**
 * Golang微服务调用模块
 */

import { settings } from '../config';
import { httpClientManager } from '../core/http-client';

class GolangService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = settings.services.golangServiceUrl;
  }

  private async callApi<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    return await httpClientManager.get<T>(url, params);
  }

  private async postApi<T = any>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`;
    return await httpClientManager.post<T>(url, data);
  }

  // 统计相关接口
  async getOnlineStats(): Promise<Record<string, any>> {
    return await this.callApi('/stats/online');
  }

  async getHotPages(): Promise<Record<string, any>> {
    return await this.callApi('/stats/hot-pages');
  }

  async getEventsStats(): Promise<Record<string, any>> {
    return await this.callApi('/stats/events');
  }

  async getConversionStats(): Promise<Record<string, any>> {
    return await this.callApi('/stats/conversion');
  }

  // 用户相关接口
  async getUserEvents(userId: string, limit: number = 50): Promise<Record<string, any>> {
    return await this.callApi(`/user/${userId}/events`, { limit });
  }

  // 漏斗分析接口
  async getFunnelAnalysis(funnelId: string): Promise<Record<string, any>> {
    return await this.callApi(`/funnel/${funnelId}/analysis`);
  }

  // 事件上报接口
  async postEvents(events: Record<string, any>[]): Promise<Record<string, any>> {
    return await this.postApi('/events', { events });
  }

  // 批量调用接口
  async getDashboardData(): Promise<Array<Record<string, any> | Error>> {
    const tasks = [
      this.getOnlineStats(),
      this.getHotPages(),
      this.getEventsStats(),
      this.getConversionStats(),
    ];

    const results = await Promise.allSettled(tasks);
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : new Error(result.reason)
    );
  }

  async getRealtimeData(): Promise<Array<Record<string, any> | Error>> {
    const tasks = [
      this.getOnlineStats(),
      this.getEventsStats(),
    ];

    const results = await Promise.allSettled(tasks);
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : new Error(result.reason)
    );
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    return await httpClientManager.healthCheck(`${this.baseUrl}/health`);
  }
}

export const golangService = new GolangService(); 