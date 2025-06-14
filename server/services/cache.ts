import { Redis } from 'ioredis';
import { config } from '../config.js';

export class CacheService {
  private redis: Redis;
  private readonly defaultTTL = 3600; // 1 saat

  constructor() {
    this.redis = new Redis(config.redis.url, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      tls: {},
    });

    this.redis.on('error', (error: Error) => {
      console.error('Redis bağlantı hatası:', error);
    });
  }

  // Veri önbellekleme
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serializedValue);
    } else {
      await this.redis.set(key, serializedValue);
    }
  }

  // Önbellekten veri alma
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  // Önbellekten veri silme
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Önbellek temizleme
  async clear(): Promise<void> {
    await this.redis.flushdb();
  }

  // Önbellek durumu
  async status(): Promise<{
    connected: boolean;
    memory: any;
    keys: number;
  }> {
    try {
      const [memory, keys] = await Promise.all([
        this.redis.info('memory'),
        this.redis.dbsize()
      ]);

      return {
        connected: this.redis.status === 'ready',
        memory: this.parseMemoryInfo(memory),
        keys
      };
    } catch (error) {
      console.error('Önbellek durum kontrolü hatası:', error);
      throw error;
    }
  }

  // Bellek bilgisi ayrıştırma
  private parseMemoryInfo(info: string): Record<string, any> {
    const lines = info.split('\n');
    const result: Record<string, any> = {};

    for (const line of lines) {
      const [key, value] = line.split(':');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    }

    return result;
  }

  // Önbellek anahtarı oluşturma
  createKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Toplu önbellek işlemleri
  async mset(keyValues: { [key: string]: any }): Promise<void> {
    const serializedValues = Object.entries(keyValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: JSON.stringify(value)
      }),
      {}
    );
    await this.redis.mset(serializedValues);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    return this.redis.mget(keys);
  }

  // Önbellek süresi uzatma
  async extendTTL(key: string, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
    } catch (error) {
      console.error('Önbellek süresi uzatma hatası:', error);
      throw error;
    }
  }

  // Önbellek anahtarı kontrolü
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }
}

// Singleton instance
export const cacheService = new CacheService(); 