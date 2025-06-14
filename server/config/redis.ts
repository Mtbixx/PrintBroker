import { Redis } from 'ioredis';
import { config } from './index.js';

class RedisConfig {
  private static instance: RedisConfig;
  private client: Redis;

  private constructor() {
    this.client = new Redis(config.redis.url, {
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      tls: {},
    });

    this.client.on('error', (error: Error) => {
      console.error('Redis bağlantı hatası:', error);
    });

    this.client.on('connect', () => {
      console.log('Redis bağlantısı başarılı');
    });
  }

  public static getInstance(): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig();
    }
    return RedisConfig.instance;
  }

  public getClient(): Redis {
    return this.client;
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.client.setex(key, ttl, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async clear(): Promise<void> {
    await this.client.flushdb();
  }

  public async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  public async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  public async mget(keys: string[]): Promise<(string | null)[]> {
    return this.client.mget(keys);
  }

  public async mset(keyValues: { [key: string]: any }): Promise<void> {
    const serializedValues = Object.entries(keyValues).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: JSON.stringify(value)
      }),
      {}
    );
    await this.client.mset(serializedValues);
  }
}

export const redisConfig = RedisConfig.getInstance();