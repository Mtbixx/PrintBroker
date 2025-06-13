import { Request, Response, NextFunction } from 'express';
import { redisConfig } from '../config/redis';

interface RateLimitOptions {
  windowMs: number; // Zaman penceresi (milisaniye)
  max: number; // Maksimum istek sayısı
  keyGenerator?: (req: Request) => string; // Özel anahtar oluşturucu
  message?: string; // Hata mesajı
  statusCode?: number; // Hata durum kodu
}

export class RateLimiter {
  private static instance: RateLimiter;
  private options: RateLimitOptions;

  private constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: 60000, // Varsayılan: 1 dakika
      max: 100, // Varsayılan: 100 istek
      message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
      statusCode: 429, // Too Many Requests
      ...options
    };
  }

  public static getInstance(options: RateLimitOptions): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter(options);
    }
    return RateLimiter.instance;
  }

  private generateKey(req: Request): string {
    if (this.options.keyGenerator) {
      return this.options.keyGenerator(req);
    }

    // Varsayılan anahtar oluşturucu
    const key = [
      'ratelimit',
      req.ip,
      req.path,
      req.user?.id || 'anonymous'
    ].join(':');

    return key;
  }

  public middleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const key = this.generateKey(req);
        const now = Date.now();
        const windowKey = `${key}:${Math.floor(now / this.options.windowMs)}`;

        // Redis'ten mevcut istek sayısını al
        const current = await redisConfig.get<number>(windowKey) || 0;

        if (current >= this.options.max) {
          // Rate limit aşıldı
          const retryAfter = Math.ceil((this.options.windowMs - (now % this.options.windowMs)) / 1000);
          
          res.setHeader('Retry-After', retryAfter.toString());
          res.setHeader('X-RateLimit-Limit', this.options.max.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(now + this.options.windowMs).toISOString());
          
          return res.status(this.options.statusCode).json({
            error: this.options.message,
            retryAfter
          });
        }

        // İstek sayısını artır
        await redisConfig.set(windowKey, current + 1, Math.ceil(this.options.windowMs / 1000));

        // Rate limit başlıklarını ekle
        res.setHeader('X-RateLimit-Limit', this.options.max.toString());
        res.setHeader('X-RateLimit-Remaining', (this.options.max - current - 1).toString());
        res.setHeader('X-RateLimit-Reset', new Date(now + this.options.windowMs).toISOString());

        next();
      } catch (error) {
        console.error('Rate limit hatası:', error);
        next();
      }
    };
  }
}

// Farklı rate limit profilleri
export const rateLimits = {
  // Genel API limiti
  api: RateLimiter.getInstance({
    windowMs: 60000, // 1 dakika
    max: 100, // 100 istek
    message: 'API istek limiti aşıldı, lütfen daha sonra tekrar deneyin.'
  }),

  // Kimlik doğrulama limiti
  auth: RateLimiter.getInstance({
    windowMs: 300000, // 5 dakika
    max: 5, // 5 istek
    message: 'Çok fazla giriş denemesi, lütfen daha sonra tekrar deneyin.'
  }),

  // Dosya yükleme limiti
  upload: RateLimiter.getInstance({
    windowMs: 3600000, // 1 saat
    max: 10, // 10 istek
    message: 'Dosya yükleme limiti aşıldı, lütfen daha sonra tekrar deneyin.'
  }),

  // Sohbet mesajı limiti
  chat: RateLimiter.getInstance({
    windowMs: 60000, // 1 dakika
    max: 30, // 30 istek
    message: 'Mesaj gönderme limiti aşıldı, lütfen daha sonra tekrar deneyin.'
  })
}; 