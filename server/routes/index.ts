import express from 'express';
import { rateLimits } from '../services/rateLimit';
import { compress, optimizeResponse, validateRequest, cacheControl, corsOptions } from '../middleware/optimize';
import cors from 'cors';

// Ana router
const router = express.Router();

// Genel middleware'ler
router.use(compress);
router.use(optimizeResponse());
router.use(cors(corsOptions));

// API versiyonlama
const v1Router = express.Router();

// Auth rotaları
v1Router.use('/auth', rateLimits.auth, require('./authRoutes').default);

// Kullanıcı rotaları
v1Router.use('/users', rateLimits.api, require('./userRoutes').default);

// Teklif rotaları
v1Router.use('/quotes', rateLimits.api, require('./quoteRoutes').default);

// Dosya rotaları
v1Router.use('/files', rateLimits.upload, require('./fileRoutes').default);

// Chat rotaları
v1Router.use('/chat', rateLimits.chat, require('./chatRoutes').default);

// API dokümantasyonu
v1Router.get('/docs', (req, res) => {
  res.json({
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout'
      },
      users: {
        profile: 'GET /users/profile',
        update: 'PUT /users/profile',
        delete: 'DELETE /users/profile'
      },
      quotes: {
        create: 'POST /quotes',
        list: 'GET /quotes',
        get: 'GET /quotes/:id',
        update: 'PUT /quotes/:id',
        delete: 'DELETE /quotes/:id'
      },
      files: {
        upload: 'POST /files/upload',
        download: 'GET /files/:id',
        delete: 'DELETE /files/:id'
      },
      chat: {
        send: 'POST /chat/messages',
        list: 'GET /chat/messages',
        delete: 'DELETE /chat/messages/:id'
      }
    },
    rateLimits: {
      auth: {
        windowMs: 15 * 60 * 1000,
        max: 5
      },
      api: {
        windowMs: 60 * 1000,
        max: 100
      },
      upload: {
        windowMs: 60 * 1000,
        max: 10
      },
      chat: {
        windowMs: 60 * 1000,
        max: 50
      }
    }
  });
});

// Ana router'a v1 router'ı ekle
router.use('/v1', v1Router);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint bulunamadı',
    message: 'İstenen endpoint mevcut değil'
  });
});

// Genel hata handler'ı
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: 'Sunucu hatası',
    message: process.env.NODE_ENV === 'production' 
      ? 'Bir hata oluştu' 
      : err.message
  });
});

export default router; 