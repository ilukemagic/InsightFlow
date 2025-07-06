import useSWR from 'swr';
import { apiClient } from '../api/client';
import { API_CONFIG } from '../api/config';
import type { 
  DashboardStats, 
  RealtimeStats, 
  UserAnalytics, 
  FunnelAnalysis, 
  SystemHealth, 
  SystemMetrics,
  ClientType,
  TimeRange,
  EventStats,
  HotPagesResponse,
  OnlineUsersResponse,
  UserEventsResponse
} from '../types';

// SWR 配置
const swrConfig = {
  refreshInterval: API_CONFIG.swr.refreshInterval,
  errorRetryCount: API_CONFIG.swr.errorRetryCount,
  errorRetryInterval: API_CONFIG.swr.errorRetryInterval,
  dedupingInterval: API_CONFIG.swr.dedupingInterval,
  revalidateOnFocus: API_CONFIG.swr.revalidateOnFocus,
  revalidateOnReconnect: API_CONFIG.swr.revalidateOnReconnect,
};

// 获取Dashboard统计数据
export function useDashboardStats(clientType: ClientType = 'web') {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    `dashboard-stats-${clientType}`,
    () => apiClient.get<DashboardStats>(API_CONFIG.endpoints.dashboard.stats(clientType)),
    swrConfig
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取实时统计数据
export function useRealtimeStats() {
  const { data, error, isLoading, mutate } = useSWR<RealtimeStats>(
    'realtime-stats',
    () => apiClient.get<RealtimeStats>(API_CONFIG.endpoints.dashboard.realtime),
    {
      ...swrConfig,
      refreshInterval: 5000, // 5秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取用户分析数据
export function useUserAnalytics(userId: string, limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR<UserAnalytics>(
    userId ? `user-analytics-${userId}-${limit}` : null,
    () => apiClient.get<UserAnalytics>(
      `${API_CONFIG.endpoints.users.analytics(userId)}?limit=${limit}`
    ),
    {
      ...swrConfig,
      refreshInterval: 60000, // 1分钟刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取漏斗分析数据
export function useFunnelAnalysis(funnelId: string = 'default') {
  const { data, error, isLoading, mutate } = useSWR<FunnelAnalysis>(
    `funnel-analysis-${funnelId}`,
    () => apiClient.get<FunnelAnalysis>(
      `${API_CONFIG.endpoints.users.funnel}?funnel_id=${funnelId}`
    ),
    {
      ...swrConfig,
      refreshInterval: 120000, // 2分钟刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取系统健康状态
export function useSystemHealth() {
  const { data, error, isLoading, mutate } = useSWR<SystemHealth>(
    'system-health',
    () => apiClient.get<SystemHealth>(API_CONFIG.endpoints.system.health),
    {
      ...swrConfig,
      refreshInterval: 10000, // 10秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取系统指标
export function useSystemMetrics() {
  const { data, error, isLoading, mutate } = useSWR<SystemMetrics>(
    'system-metrics',
    () => apiClient.get<SystemMetrics>(API_CONFIG.endpoints.system.metrics),
    {
      ...swrConfig,
      refreshInterval: 30000, // 30秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 组合Hook：获取Dashboard概览数据
export function useDashboardOverview(clientType: ClientType = 'web') {
  const stats = useDashboardStats(clientType);
  const realtime = useRealtimeStats();
  const health = useSystemHealth();
  const metrics = useSystemMetrics();

  const isLoading = stats.isLoading || realtime.isLoading || health.isLoading || metrics.isLoading;
  const hasError = stats.error || realtime.error || health.error || metrics.error;

  return {
    stats: stats.data,
    realtime: realtime.data,
    health: health.data,
    metrics: metrics.data,
    isLoading,
    hasError,
    refetch: () => {
      stats.refetch();
      realtime.refetch();
      health.refetch();
      metrics.refetch();
    },
  };
}

// Hook：获取时间序列数据（模拟）
export function useTimeSeriesData(timeRange: TimeRange = '24h') {
  const { data, error, isLoading, mutate } = useSWR(
    `time-series-${timeRange}`,
    async () => {
      // 这里可以调用实际的时间序列API
      // 目前返回模拟数据
      const now = new Date();
      const dataPoints = [];
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        dataPoints.push({
          timestamp: time.toISOString(),
          value: Math.floor(Math.random() * 1000) + 100,
          label: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        });
      }
      
      return dataPoints;
    },
    {
      ...swrConfig,
      refreshInterval: 60000, // 1分钟刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取事件统计数据
export function useEventStats() {
  const { data, error, isLoading, mutate } = useSWR<EventStats>(
    'event-stats',
    () => apiClient.get(API_CONFIG.endpoints.events.stats),
    {
      ...swrConfig,
      refreshInterval: 30000, // 30秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取热门页面数据
export function useHotPages() {
  const { data, error, isLoading, mutate } = useSWR<HotPagesResponse>(
    'hot-pages',
    () => apiClient.get(API_CONFIG.endpoints.events.hotPages),
    {
      ...swrConfig,
      refreshInterval: 60000, // 1分钟刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取在线用户数据
export function useOnlineUsers() {
  const { data, error, isLoading, mutate } = useSWR<OnlineUsersResponse>(
    'online-users',
    () => apiClient.get(API_CONFIG.endpoints.events.onlineUsers),
    {
      ...swrConfig,
      refreshInterval: 10000, // 10秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
}

// 获取用户事件流（实时）
export function useUserEvents(userId?: string, limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR<UserEventsResponse>(
    userId ? `user-events-${userId}-${limit}` : null,
    () => apiClient.get(`${API_CONFIG.endpoints.users.events(userId!)}?limit=${limit}`),
    {
      ...swrConfig,
      refreshInterval: 15000, // 15秒刷新一次
    }
  );

  return {
    data,
    error,
    isLoading,
    refetch: mutate,
  };
} 