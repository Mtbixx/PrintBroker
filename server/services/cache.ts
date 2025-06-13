import Redis from 'ioredis';
import { config } from '../config';

export class CacheService {
  private redis: Redis;
  private readonly defaultTTL = 3600; // 1 saat

  constructor() {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.redis.on('error', (error) => {
      console.error('Redis bağlantı hatası:', error);
    });
  }

  // Veri önbellekleme
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.set(key, serializedValue, 'EX', ttl);
    } catch (error) {
      console.error('Önbellek yazma hatası:', error);
      throw error;
    }
  }

  // Önbellekten veri alma
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Önbellek okuma hatası:', error);
      return null;
    }
  }

  // Önbellekten veri silme
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Önbellek silme hatası:', error);
      throw error;
    }
  }

  // Önbellek temizleme
  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      console.error('Önbellek temizleme hatası:', error);
      throw error;
    }
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
  private parseMemoryInfo(info: string): any {
    const lines = info.split('\n');
    const memory: any = {};

    for (const line of lines) {
      const [key, value] = line.split(':');
      if (key && value) {
        memory[key.trim()] = value.trim();
      }
    }

    return memory;
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
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const item of items) {
        const serializedValue = JSON.stringify(item.value);
        pipeline.set(item.key, serializedValue, 'EX', item.ttl || this.defaultTTL);
      }

      await pipeline.exec();
    } catch (error) {
      console.error('Toplu önbellek yazma hatası:', error);
      throw error;
    }
  }

  async mget<T>(keys: string[]): Promise<Array<T | null>> {
    try {
      const values = await this.redis.mget(keys);
      return values.map(value => value ? JSON.parse(value) as T : null);
    } catch (error) {
      console.error('Toplu önbellek okuma hatası:', error);
      throw error;
    }
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
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Önbellek anahtarı kontrolü hatası:', error);
      return false;
    }
  }
}

// Singleton instance
export const cacheService = new CacheService(); 