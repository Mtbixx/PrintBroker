import { cacheService } from './cache';
import { config } from '../config';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  handler?: (req: any, res: any) => void;
}

export class RateLimitService {
  private readonly defaultOptions: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // 100 istek
    keyPrefix: 'ratelimit',
    skipFailedRequests: false,
    skipSuccessfulRequests: false
  };

  // Rate limit kontrolü
  async checkRateLimit(
    key: string,
    options: Partial<RateLimitOptions> = {}
  ): Promise<{
    remaining: number;
    reset: number;
    total: number;
  }> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const now = Date.now();
      const windowKey = `${opts.keyPrefix}:${key}:${Math.floor(now / opts.windowMs)}`;
      
      // Mevcut istek sayısını al
      const current = await cacheService.get<number>(windowKey) || 0;
      
      // Limit aşıldı mı kontrol et
      if (current >= opts.max) {
        return {
          remaining: 0,
          reset: (Math.floor(now / opts.windowMs) + 1) * opts.windowMs,
          total: opts.max
        };
      }

      // İstek sayısını artır
      await cacheService.set(windowKey, current + 1, Math.ceil(opts.windowMs / 1000));

      return {
        remaining: opts.max - (current + 1),
        reset: (Math.floor(now / opts.windowMs) + 1) * opts.windowMs,
        total: opts.max
      };
    } catch (error) {
      console.error('Rate limit kontrolü hatası:', error);
      throw error;
    }
  }

  // Rate limit anahtarı oluştur
  generateKey(req: any): string {
    const key = req.user?.id || req.ip;
    return `${key}`;
  }

  // Rate limit durumunu sıfırla
  async resetRateLimit(key: string, options: Partial<RateLimitOptions> = {}): Promise<void> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      const now = Date.now();
      const windowKey = `${opts.keyPrefix}:${key}:${Math.floor(now / opts.windowMs)}`;
      
      await cacheService.delete(windowKey);
    } catch (error) {
      console.error('Rate limit sıfırlama hatası:', error);
      throw error;
    }
  }

  // Rate limit istatistiklerini al
  async getRateLimitStats(key: string): Promise<{
    total: number;
    remaining: number;
    reset: number;
    windowMs: number;
  }> {
    try {
      const now = Date.now();
      const windowKey = `${this.defaultOptions.keyPrefix}:${key}:${Math.floor(now / this.defaultOptions.windowMs)}`;
      
      const current = await cacheService.get<number>(windowKey) || 0;
      
      return {
        total: this.defaultOptions.max,
        remaining: Math.max(0, this.defaultOptions.max - current),
        reset: (Math.floor(now / this.defaultOptions.windowMs) + 1) * this.defaultOptions.windowMs,
        windowMs: this.defaultOptions.windowMs
      };
    } catch (error) {
      console.error('Rate limit istatistikleri alma hatası:', error);
      throw error;
    }
  }

  // Rate limit profilleri
  readonly profiles = {
    // API istekleri için limitler
    api: {
      windowMs: 15 * 60 * 1000, // 15 dakika
      max: 100 // 100 istek
    },
    
    // Kimlik doğrulama için limitler
    auth: {
      windowMs: 60 * 60 * 1000, // 1 saat
      max: 5 // 5 başarısız deneme
    },
    
    // Dosya yüklemeleri için limitler
    upload: {
      windowMs: 60 * 60 * 1000, // 1 saat
      max: 10 // 10 dosya
    },
    
    // Sohbet mesajları için limitler
    chat: {
      windowMs: 60 * 1000, // 1 dakika
      max: 20 // 20 mesaj
    }
  };

  // Rate limit middleware'i
  middleware(options: Partial<RateLimitOptions> = {}) {
    return async (req: any, res: any, next: any) => {
      try {
        const key = this.generateKey(req);
        const limit = await this.checkRateLimit(key, options);

        // Rate limit başlıklarını ekle
        res.setHeader('X-RateLimit-Limit', limit.total);
        res.setHeader('X-RateLimit-Remaining', limit.remaining);
        res.setHeader('X-RateLimit-Reset', limit.reset);

        // Limit aşıldıysa hata döndür
        if (limit.remaining < 0) {
          const retryAfter = Math.ceil((limit.reset - Date.now()) / 1000);
          res.setHeader('Retry-After', retryAfter);
          
          if (options.handler) {
            options.handler(req, res);
          } else {
            res.status(429).json({
              error: 'Çok fazla istek',
              message: 'Lütfen daha sonra tekrar deneyin',
              retryAfter
            });
          }
          return;
        }

        next();
      } catch (error) {
        console.error('Rate limit middleware hatası:', error);
        next(error);
      }
    };
  }
}

// Singleton instance
export const rateLimitService = new RateLimitService(); 