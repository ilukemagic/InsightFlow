/**
 * 应用类型定义
 */

export interface EventData {
  user_id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  element?: string;
  element_text?: string;
  timestamp: number;
  extra_data?: Record<string, any>;
}

// 用于清洗后的事件数据，可选字段只有在有值时才存在
export interface CleanedEventData {
  user_id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  timestamp: number;
  element?: string;
  element_text?: string;
  extra_data?: Record<string, any>;
}

export interface BatchEventRequest {
  events: EventData[];
}

export interface EventResponse {
  status: string;
  message: string;
  processed_count: number;
  golang_response?: Record<string, any>;
}

export interface DashboardResponse {
  online_users: number;
  total_events: number;
  events_by_type: Record<string, number>;
  hot_pages: Array<Record<string, any>>;
  conversion_rate: number;
  last_updated: string;
}

export interface UserAnalyticsResponse {
  user_id: string;
  events: Array<Record<string, any>>;
  summary: Record<string, any>;
}

export interface FunnelResponse {
  steps: Array<Record<string, any>>;
  total_users: number;
  conversion_rate: number;
}

export interface RealtimeStatsResponse {
  online_users: number;
  total_events: number;
  events_per_minute: number;
  timestamp: number;
  server_time: string;
}

export interface HealthResponse {
  status: string;
  services: Record<string, string>;
  timestamp: string;
  version: string;
}

export interface MetricsResponse {
  redis_memory_used: string;
  active_connections: string;
  cache_hit_rate: string;
  timestamp: string;
}

export type ClientType = 'web' | 'mobile' | 'tv';

export interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
} 