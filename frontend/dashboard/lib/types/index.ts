// Dashboard 数据类型定义
export interface DashboardStats {
  online_users: number;
  total_events: number;
  events_by_type: Record<string, number>;
  hot_pages: PageStat[];
  conversion_rate: number;
  last_updated: string;
}

export interface PageStat {
  page_url: string;
  views: number;
}

export interface RealtimeStats {
  online_users: number;
  total_events: number;
  events_per_minute: number;
  timestamp: number;
  server_time: string;
}

export interface UserEvent {
  id?: number;
  user_id: string;
  session_id: string;
  event_type: string;
  page_url: string;
  element?: string;
  element_text?: string;
  timestamp: number;
  created_at?: string;
  extra_data?: Record<string, unknown>;
}

export interface UserAnalytics {
  user_id: string;
  events: UserEvent[];
  summary: {
    total_events: number;
    event_types: Record<string, number>;
    most_visited_pages: Record<string, number>;
    session_duration: number;
    first_visit: number | null;
    last_visit: number | null;
  };
}

export interface FunnelStep {
  step: string;
  users: number;
  conversion_rate: number;
}

export interface FunnelAnalysis {
  funnel_id: string;
  steps: FunnelStep[];
  total_users: number;
  conversion_rate: number;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  service: string;
}

export interface SystemMetrics {
  redis_memory_used: string;
  active_connections: string;
  cache_hit_rate: string;
  timestamp: string;
}

export interface EventStats {
  total_events: number;
  events_by_type: Record<string, number>;
  events_per_hour: Record<string, number>;
  timestamp: string;
}

export interface HotPagesResponse {
  pages: PageStat[];
  timestamp: string;
}

export interface OnlineUsersResponse {
  count: number;
  timestamp: string;
}

export interface UserEventsResponse {
  user_id: string;
  events: UserEvent[];
  count: number;
  timestamp: string;
}

export interface EventElement {
  element: string;
  clicks: number;
}

// 实时统计数据接口
export interface RealtimeStatsResponse {
  online_users: number;
  total_events: number;
  events_per_minute: number;
  timestamp: number;
  server_time: string;
}

// 用户事件详情接口
export interface UserEventDetail {
  event_type: string;
  page_url: string;
  element?: string;
  timestamp: number;
  created_at?: string;
}

// UI 相关类型
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  href: string;
  description?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  timestamp?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  description?: string;
}

// API 响应类型
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

// 客户端类型
export type ClientType = 'web' | 'mobile' | 'tv';

// 事件类型
export type EventType = 'click' | 'view' | 'scroll' | 'purchase' | 'submit' | 'load' | 'exit' | 'visibility_change';

// 时间范围
export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d';

// 动画变体类型
export interface AnimationVariants {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
  hover?: Record<string, unknown>;
  tap?: Record<string, unknown>;
}

// 主题类型
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
} 