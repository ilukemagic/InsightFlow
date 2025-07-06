/**
 * 数据分析服务模块
 */

import { cacheManager } from '../core/cache';
import { ClientType } from '../types';

class AnalyticsService {
  /**
   * 清洗事件数据
   */
  static cleanEventData(events: any[]): Record<string, any>[] {
    const cleanedEvents: Record<string, any>[] = [];
    
    for (const event of events) {
      // 基础数据清洗
      const cleanedEvent: Record<string, any> = {
        user_id: event.user_id || '',
        session_id: event.session_id || '',
        event_type: event.event_type || '',
        page_url: (event.page_url || '').substring(0, 512), // 限制URL长度
        timestamp: event.timestamp || Math.floor(Date.now() / 1000),
      };
      
      // 可选字段 - 只有当字段有值时才设置
      if (event.element) {
        cleanedEvent.element = event.element.substring(0, 128);
      }
      if (event.element_text) {
        cleanedEvent.element_text = event.element_text.substring(0, 256);
      }
      if (event.extra_data) {
        cleanedEvent.extra_data = event.extra_data;
      }
      
      cleanedEvents.push(cleanedEvent);
    }
    
    return cleanedEvents;
  }

  /**
   * 根据客户端类型适配仪表盘数据
   */
  static adaptDashboardData(
    clientType: ClientType,
    results: Array<Record<string, any> | Error>
  ): Record<string, any> {
    // 处理异常结果
    const onlineData = results[0] instanceof Error ? { count: 0 } : results[0];
    const pagesData = results[1] instanceof Error ? { pages: [] } : results[1];
    const eventsData = results[2] instanceof Error ? { total_events: 0, events_by_type: {} } : results[2];
    const conversionData = results[3] instanceof Error ? { rate: 0.0 } : results[3];

    const baseData = {
      online_users: onlineData.count || 0,
      total_events: eventsData.total_events || 0,
      conversion_rate: conversionData.rate || 0.0,
      last_updated: new Date().toISOString(),
    };

    // 根据客户端类型适配数据格式
    switch (clientType) {
      case 'mobile':
        return {
          ...baseData,
          events_by_type: {
            view: eventsData.events_by_type?.view || 0,
            click: eventsData.events_by_type?.click || 0,
          },
          hot_pages: (pagesData.pages || []).slice(0, 3),
        };

      case 'tv':
        return {
          ...baseData,
          events_by_type: eventsData.events_by_type || {},
          hot_pages: (pagesData.pages || []).slice(0, 10),
        };

      default: // web
        return {
          ...baseData,
          events_by_type: eventsData.events_by_type || {},
          hot_pages: (pagesData.pages || []).slice(0, 5),
        };
    }
  }

  /**
   * 分析用户行为数据
   */
  static analyzeUserBehavior(events: Array<Record<string, any>>): Record<string, any> {
    const summary = {
      total_events: events.length,
      event_types: {} as Record<string, number>,
      most_visited_pages: {} as Record<string, number>,
      session_duration: 0,
      first_visit: null as number | null,
      last_visit: null as number | null,
    };

    // 统计事件类型
    events.forEach(event => {
      const eventType = event.event_type || 'unknown';
      summary.event_types[eventType] = (summary.event_types[eventType] || 0) + 1;

      // 统计页面访问
      const pageUrl = event.page_url;
      if (pageUrl) {
        summary.most_visited_pages[pageUrl] = (summary.most_visited_pages[pageUrl] || 0) + 1;
      }
    });

    // 时间统计
    if (events.length > 0) {
      const timestamps = events
        .map(event => event.timestamp)
        .filter(ts => ts)
        .sort((a, b) => a - b);

             if (timestamps.length > 0) {
         const firstVisit = timestamps[0];
         const lastVisit = timestamps[timestamps.length - 1];
         summary.first_visit = firstVisit;
         summary.last_visit = lastVisit;
         summary.session_duration = lastVisit - firstVisit;
       }
    }

    // 页面访问排序
    const sortedPages = Object.entries(summary.most_visited_pages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    summary.most_visited_pages = Object.fromEntries(sortedPages);

    return summary;
  }

  /**
   * 计算每分钟事件数
   */
  static async getEventsPerMinute(): Promise<number> {
    try {
      const currentMinute = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
      const key = `events:minute:${currentMinute}`;
      const count = await cacheManager.get<number>(key);
      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 失效仪表盘缓存
   */
  static async invalidateDashboardCache(): Promise<void> {
    try {
      await cacheManager.delPattern('dashboard:*');
      console.log('仪表盘缓存已失效');
    } catch (error) {
      console.error('缓存失效失败:', error);
    }
  }
}

export const analyticsService = AnalyticsService; 