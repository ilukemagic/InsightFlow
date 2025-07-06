// API 配置文件
export const API_CONFIG = {
  // 基础URL配置
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // 请求超时时间
  timeout: 10000,
  
  // 请求头配置
  headers: {
    'Content-Type': 'application/json',
  },
  
  // 端点配置
  endpoints: {
    // 仪表盘相关
    dashboard: {
      stats: (clientType: string) => `/bff/${clientType}/dashboard`,
      realtime: '/bff/stats/realtime',
    },
    
    // 事件相关
    events: {
      batch: '/bff/events/batch',
      stats: '/api/stats/events',
      hotPages: '/api/stats/hot-pages',
      onlineUsers: '/api/stats/online',
    },
    
    // 用户相关
    users: {
      analytics: (userId: string) => `/bff/user/${userId}/analytics`,
      funnel: '/bff/user/funnel/analysis',
      events: (userId: string) => `/api/user/${userId}/events`,
    },
    
    // 系统相关
    system: {
      health: '/health',
      metrics: '/metrics',
    },
  },
  
  // SWR 配置
  swr: {
    // 刷新间隔
    refreshInterval: 30000, // 30秒
    
    // 重试配置
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    
    // 缓存配置
    dedupingInterval: 5000,
    
    // 聚焦时重新验证
    revalidateOnFocus: true,
    
    // 重新连接时重新验证
    revalidateOnReconnect: true,
  },
};

// 客户端类型映射
export const CLIENT_TYPE_MAP = {
  web: 'web',
  mobile: 'mobile',
  tv: 'tv',
} as const;

// 时间范围映射
export const TIME_RANGE_MAP = {
  '1h': '1 hour',
  '24h': '24 hours',
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
} as const;

// 错误消息映射
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'Unauthorized access. Please login again.',
  FORBIDDEN: 'Access denied.',
  VALIDATION_ERROR: 'Invalid data provided.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// HTTP状态码映射
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const; 