import { z } from 'zod';

// Güvenlik yapılandırma şeması
const securityConfigSchema = z.object({
  jwt: z.object({
    secret: z.string().min(32),
    accessTokenExpiry: z.string().default('15m'),
    refreshTokenExpiry: z.string().default('7d'),
    algorithm: z.enum(['HS256', 'HS384', 'HS512']).default('HS256')
  }),
  encryption: z.object({
    key: z.string().min(32),
    salt: z.string().min(16),
    algorithm: z.string().default('aes-256-gcm'),
    iterations: z.number().min(10000).default(100000)
  }),
  password: z.object({
    minLength: z.number().min(8).default(12),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSpecialChars: z.boolean().default(true),
    maxAge: z.number().min(30).default(90), // gün cinsinden
    historySize: z.number().min(3).default(5)
  }),
  rateLimit: z.object({
    windowMs: z.number().min(1000).default(15 * 60 * 1000), // 15 dakika
    max: z.number().min(1).default(100),
    message: z.string().default('Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin')
  }),
  cors: z.object({
    origin: z.union([
      z.string(),
      z.array(z.string())
    ]).default('*'),
    methods: z.array(z.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']),
    allowedHeaders: z.array(z.string()).default(['Content-Type', 'Authorization']),
    exposedHeaders: z.array(z.string()).default(['X-Total-Count']),
    credentials: z.boolean().default(true),
    maxAge: z.number().min(0).default(86400) // 24 saat
  }),
  helmet: z.object({
    contentSecurityPolicy: z.boolean().default(true),
    crossOriginEmbedderPolicy: z.boolean().default(true),
    crossOriginOpenerPolicy: z.boolean().default(true),
    crossOriginResourcePolicy: z.boolean().default(true),
    dnsPrefetchControl: z.boolean().default(true),
    frameguard: z.boolean().default(true),
    hidePoweredBy: z.boolean().default(true),
    hsts: z.boolean().default(true),
    ieNoOpen: z.boolean().default(true),
    noSniff: z.boolean().default(true),
    originAgentCluster: z.boolean().default(true),
    permittedCrossDomainPolicies: z.boolean().default(true),
    referrerPolicy: z.boolean().default(true),
    xssFilter: z.boolean().default(true)
  }),
  session: z.object({
    secret: z.string().min(32),
    name: z.string().default('sessionId'),
    cookie: z.object({
      secure: z.boolean().default(true),
      httpOnly: z.boolean().default(true),
      sameSite: z.enum(['strict', 'lax', 'none']).default('strict'),
      maxAge: z.number().min(0).default(24 * 60 * 60 * 1000) // 24 saat
    }),
    resave: z.boolean().default(false),
    saveUninitialized: z.boolean().default(false)
  })
});

// Varsayılan güvenlik yapılandırması
const defaultSecurityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256' as const
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-min-32-chars',
    salt: process.env.ENCRYPTION_SALT || 'your-super-secret-salt-min-16-chars',
    algorithm: 'aes-256-gcm',
    iterations: 100000
  },
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    historySize: 5
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin'
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400
  },
  helmet: {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-min-32-chars',
    name: 'sessionId',
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000
    },
    resave: false,
    saveUninitialized: false
  }
};

// Güvenlik yapılandırmasını doğrula ve dışa aktar
export const securityConfig = securityConfigSchema.parse(defaultSecurityConfig); 