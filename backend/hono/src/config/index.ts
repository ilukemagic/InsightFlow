/**
 * 应用配置模块
 */

import { config } from 'dotenv';

// 加载环境变量
config();

export const settings = {
  // 服务配置
  app: {
    title: process.env.APP_TITLE || 'InsightFlow BFF API',
    description: process.env.APP_DESCRIPTION || '用户行为分析平台 - 多端数据聚合服务',
    version: process.env.APP_VERSION || '1.0.0',
  },

  // 服务端口和主机
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // 外部服务配置
  services: {
    golangServiceUrl: process.env.GOLANG_SERVICE_URL || 'http://localhost:8080',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '60', 10),
    dashboardTtl: parseInt(process.env.DASHBOARD_CACHE_TTL || '30', 10),
    funnelTtl: parseInt(process.env.FUNNEL_CACHE_TTL || '300', 10),
  },

  // HTTP客户端配置
  http: {
    timeout: parseInt(process.env.REQUEST_TIMEOUT || '5000', 10),
    maxConnections: parseInt(process.env.MAX_CONNECTIONS || '100', 10),
    maxKeepaliveConnections: parseInt(process.env.MAX_KEEPALIVE_CONNECTIONS || '20', 10),
  },

  // CORS配置
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // 开发模式
  dev: {
    debug: process.env.NODE_ENV === 'development',
  },
} as const;

export default settings; 