
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Genel API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderildi. 15 dakika sonra tekrar deneyin.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.log(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Tasarım üretimi için özel rate limiter (daha sıkı)
export const designLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5, // Dakikada maksimum 5 tasarım
  message: {
    error: 'Tasarım üretimi için çok fazla istek. 1 dakika bekleyin.',
    code: 'DESIGN_RATE_LIMIT'
  },
  skipSuccessfulRequests: false,
  handler: (req: Request, res: Response) => {
    console.log(`Design rate limit exceeded for user: ${req.session?.user?.id}`);
    res.status(429).json({
      success: false,
      message: 'Çok hızlı tasarım üretimi yapıyorsunuz. 1 dakika bekleyin.',
      retryAfter: 60
    });
  }
});

// Login denemelerini sınırla
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına maksimum 5 login denemesi
  message: {
    error: 'Çok fazla başarısız giriş denemesi. 15 dakika bekleyin.',
    code: 'LOGIN_RATE_LIMIT'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    console.log(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyin.',
      retryAfter: 15 * 60
    });
  }
});

// Dosya yükleme rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 20, // 10 dakikada maksimum 20 dosya
  message: {
    error: 'Dosya yükleme limiti aşıldı. 10 dakika bekleyin.',
    code: 'UPLOAD_RATE_LIMIT'
  },
  handler: (req: Request, res: Response) => {
    console.log(`Upload rate limit exceeded for user: ${req.session?.user?.id}`);
    res.status(429).json({
      success: false,
      message: 'Çok fazla dosya yükleme işlemi. 10 dakika bekleyin.',
      retryAfter: 10 * 60
    });
  }
});

// Admin işlemleri için rate limiter
export const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 50, // Admin işlemleri için daha gevşek
  message: {
    error: 'Admin işlem limiti aşıldı.',
    code: 'ADMIN_RATE_LIMIT'
  }
});
