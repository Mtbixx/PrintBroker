import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { config } from '../config';
import { Express } from 'express';

// CSP (Content Security Policy) yapılandırması
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https://api.printbroker.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
};

// Helmet yapılandırması
const helmetConfig = {
  contentSecurityPolicy: cspConfig,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
};

// Güvenlik başlıkları middleware'i
export const securityHeaders = (app: Express) => {
  // Helmet middleware'ini uygula
  app.use(helmet(helmetConfig));

  // Ek güvenlik başlıkları
  app.use((req, res, next) => {
    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY');
    
    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict-Transport-Security
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
    
    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions-Policy
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );
    
    next();
  });
};

// CORS yapılandırması
export const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 saat
};

// Rate limiting yapılandırması
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek sayısı
  message: {
    error: 'Çok fazla istek',
    message: 'Lütfen daha sonra tekrar deneyin'
  },
  standardHeaders: true,
  legacyHeaders: false
};

// Dosya yükleme güvenliği
export const fileUploadSecurity = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maksimum dosya sayısı
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // İzin verilen MIME tipleri
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/postscript',
      'application/illustrator'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen dosya tipi'), false);
    }
  }
};

// Şifre politikası
export const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  validate: (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= 8 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChars
    );
  }
};

// XSS koruması
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // XSS koruma başlıkları
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}; 