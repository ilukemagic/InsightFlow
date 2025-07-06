/**
 * Redis缓存操作核心模块
 */

import { createClient, RedisClientType } from 'redis';
import { settings } from '../config';

class CacheManager {
  private client: RedisClientType | null = null;

  async init(): Promise<void> {
    try {
      this.client = createClient({
        url: settings.services.redisUrl,
      });

      this.client.on('error', (err) => {
        console.error('Redis连接错误:', err);
      });

      await this.client.connect();
      console.log('Redis连接成功');
    } catch (error) {
      console.error('Redis初始化失败:', error);
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.client) return null;
      
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis读取失败:', error);
      return null;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (!this.client) return;
      
      const serialized = JSON.stringify(value);
      const expiry = ttl || settings.cache.ttl;
      
      await this.client.setEx(key, expiry, serialized);
    } catch (error) {
      console.error('Redis写入失败:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (!this.client) return;
      await this.client.del(key);
    } catch (error) {
      console.error('Redis删除失败:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      if (!this.client) return;
      
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis批量删除失败:', error);
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.client) return false;
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  async getInfo(section: string = 'memory'): Promise<Record<string, any>> {
    try {
      if (!this.client) return {};
      
      const info = await this.client.info(section);
      const result: Record<string, any> = {};
      
      info.split('\r\n').forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          result[key] = value;
        }
      });
      
      return result;
    } catch (error) {
      console.error('获取Redis信息失败:', error);
      return {};
    }
  }
}

export const cacheManager = new CacheManager(); 