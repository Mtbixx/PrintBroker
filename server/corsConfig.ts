import cors from 'cors';

// Üretim ortamı için güvenli CORS ayarları
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://0.0.0.0:5000',
  // Replit domains
  'https://*.repl.co',
  'https://*.replit.dev',
  'https://*.replit.app',
  // Production domain (güncellenecek)
  'https://matbixx.com',
  'https://www.matbixx.com',
  'https://printbroker.onrender.com' // Render deployment URL'si eklendi
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Development modunda origin kontrolü gevşek
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Production'da sıkı kontrol
    if (!origin) {
      // Same-origin requests (mobile apps, etc.)
      return callback(null, true);
    }

    // Wildcard pattern matching for Replit domains
    const isReplotDomain = /https:\/\/.*\.(repl\.co|replit\.dev|replit\.app)$/.test(origin);
    
    if (allowedOrigins.includes(origin) || isReplotDomain) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true, // Session cookies için gerekli
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 saat preflight cache
  optionsSuccessStatus: 200
};

// Security headers middleware
export const securityHeaders = (req: any, res: any, next: any) => {
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Frame options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (basic)
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.ideogram.ai; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: *.ideogram.ai; " +
    "connect-src 'self' *.ideogram.ai; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'"
  );
  
  next();
};
